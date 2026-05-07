import os
import pickle
import numpy as np
import scipy.sparse as sp
import jwt
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import pandas as pd
from nlp_pipeline import nlp_preprocess, extract_hmm_sequence_score

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "agentic_ai_secret_key"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.dirname(BASE_DIR)

# Assets
client_models = None
client_weights = None
tfidf = None
le = None
df_fac = None
df_stu = None
df_hod = None

def load_assets():
    global client_models, client_weights, tfidf, le, df_fac, df_stu, df_hod
    try:
        with open(os.path.join(BASE_DIR, 'client_models.pkl'), 'rb') as f: client_models = pickle.load(f)
        with open(os.path.join(BASE_DIR, 'client_weights.pkl'), 'rb') as f: client_weights = pickle.load(f)
        with open(os.path.join(BASE_DIR, 'tfidf.pkl'), 'rb') as f: tfidf = pickle.load(f)
        with open(os.path.join(BASE_DIR, 'label_encoder.pkl'), 'rb') as f: le = pickle.load(f)
        
        df_fac = pd.read_csv(os.path.join(DATA_DIR, "generated_faculty_hierarchy.csv"))
        df_stu = pd.read_csv(os.path.join(DATA_DIR, "generated_role_based_student_feedback_dataset.csv"))
        df_hod = pd.read_csv(os.path.join(DATA_DIR, "generated_hod_faculty_risk_summary.csv"))
        print("Assets loaded successfully.")
    except Exception as e:
        print(f"Error loading assets: {e}")

load_assets()

# --- Models ---
class LoginRequest(BaseModel):
    username: str
    password: str
    role: str

class FeedbackRequest(BaseModel):
    text: str
    student_id: str

class RemarkRequest(BaseModel):
    student_id: str
    remark: str

# In-memory storage for remarks and feedbacks (since we don't have a DB hooked up)
student_remarks = {}
student_feedbacks = {}

# Pre-populate specific student feedbacks from the dataset to make testing easier
for _, row in df_stu.head(10).iterrows():
    if row['student_id'] not in student_feedbacks:
        student_feedbacks[row['student_id']] = []
    student_feedbacks[row['student_id']].append({
        "text": row['feedback_text'],
        "risk": row['risk_label'],
        "date": datetime.now().strftime("%Y-%m-%d")
    })

# --- Authentication ---
@app.post("/api/login")
def login(req: LoginRequest):
    # Enforcing specific credentials from generate_datasets
    if req.role == "hod":
        if req.username == "hod" and req.password == "hod":
            token = jwt.encode({"sub": req.username, "role": "hod"}, SECRET_KEY, algorithm="HS256")
            return {"token": token, "user": {"name": "Dr. Alan Turing", "role": "hod", "id": "hod"}}
    elif req.role == "faculty":
        if req.username in ["F001", "F002", "F003"] and req.password == req.username:
            token = jwt.encode({"sub": req.username, "role": "faculty"}, SECRET_KEY, algorithm="HS256")
            fac_name = df_fac[df_fac["faculty_id"] == req.username]["faculty_name"].values
            return {"token": token, "user": {"name": fac_name[0] if len(fac_name)>0 else "Faculty", "role": "faculty", "id": req.username}}
    elif req.role == "student":
        if req.username in ["S0001", "S0002", "S0003", "S0004", "S0005"] and req.password == req.username:
            token = jwt.encode({"sub": req.username, "role": "student"}, SECRET_KEY, algorithm="HS256")
            stu_name = df_stu[df_stu["student_id"] == req.username]["student_name"].values
            return {"token": token, "user": {"name": stu_name[0] if len(stu_name)>0 else "Student", "role": "student", "id": req.username}}
    raise HTTPException(status_code=401, detail="Invalid credentials")

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=403, detail="Could not validate credentials")

# --- Prediction & Agentic Engine ---
def generate_agentic_guidance(risk_label, text):
    """
    Simulates AI reasoning to provide contextual recommendations.
    """
    text_lower = text.lower()
    guidance = []
    reasoning = ""
    
    if risk_label == "high":
        reasoning = "The linguistic patterns detected indicate severe academic stress and potential cognitive overload."
        if "time" in text_lower or "manage" in text_lower:
            guidance.append("Time management strategy review required.")
        if "depress" in text_lower or "sad" in text_lower or "anxi" in text_lower:
            guidance.append("Immediate referral to student counseling services recommended.")
        guidance.extend(["Schedule an urgent 1-on-1 meeting", "Review foundational concepts from week 1"])
    elif risk_label == "medium":
        reasoning = "The feedback suggests partial understanding with specific knowledge gaps."
        guidance.extend(["Provide additional practice exercises", "Recommend peer study groups", "Clarify upcoming assignment rubric"])
    else:
        reasoning = "The student exhibits strong comprehension and positive sentiment."
        guidance.extend(["Acknowledge good performance", "Suggest advanced reading materials", "Encourage participation in forums"])
        
    return guidance, reasoning

def predict_federated_ensemble(text):
    clean_txt, pos_tags = nlp_preprocess(text)
    text_lower = text.lower()
    
    # 1. Programmatic Rule-Based Overrides for Immediate Responsiveness
    high_words = ["fear", "panic", "panicking", "scared", "scary", "failing", "not able to solve", "impossible", "depressed", "depression", "sad", "fail", "stress", "stressed", "hard", "difficult", "struggle", "lost", "anxi"]
    if any(w in text_lower for w in high_words): 
        return "high"
        
    medium_words = ["confused", "confusion", "tricky", "unsure", "practice", "managing", "harder", "not sure", "help"]
    if any(w in text_lower for w in medium_words):
        return "medium"
    
    # 2. ML Prediction Fallback
    hmm_score = extract_hmm_sequence_score(pos_tags)
    X_tfidf = tfidf.transform([clean_txt])
    X_hmm = np.array([[hmm_score]])
    X_combined = sp.hstack((X_tfidf, X_hmm)).tocsr()
    
    total_weight = sum(client_weights.values())
    final_probs = np.zeros(len(le.classes_))
    
    for client_name, model in client_models.items():
        weight = client_weights[client_name] / total_weight
        probs = model.predict_proba(X_combined)[0]
        final_probs += probs * weight
        
    pred_idx = np.argmax(final_probs)
    return le.inverse_transform([pred_idx])[0]

@app.post("/predict")
def predict(request: FeedbackRequest):
    try:
        risk_label = predict_federated_ensemble(request.text)
        guidance, reasoning = generate_agentic_guidance(risk_label, request.text)
        
        # Save feedback in memory
        if request.student_id not in student_feedbacks:
            student_feedbacks[request.student_id] = []
            
        student_feedbacks[request.student_id].append({
            "text": request.text,
            "risk": risk_label,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "agentic_reasoning": reasoning
        })
        
        return {
            "risk_level": risk_label,
            "agentic_reasoning": reasoning,
            "recommendations": guidance
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed")

# --- Data APIs ---
@app.get("/api/hod/summary")
def get_hod_summary():
    return df_hod.to_dict(orient="records")

@app.get("/api/faculty/students/{faculty_id}")
def get_faculty_students(faculty_id: str):
    # Return assigned students and their latest feedback/risk
    students_df = df_stu[df_stu["faculty_id"] == faculty_id].drop_duplicates(subset=['student_id'])
    students = students_df.to_dict(orient="records")
    
    result = []
    for s in students:
        s_id = s["student_id"]
        latest_feedback = student_feedbacks.get(s_id, [{}])[-1]
        remark = student_remarks.get(s_id, "No remarks yet.")
        result.append({
            "student_id": s_id,
            "student_name": s["student_name"],
            "semester": s["semester"],
            "section": s["section"],
            "latest_risk": latest_feedback.get("risk", "Unknown"),
            "latest_feedback": latest_feedback.get("text", "No feedback submitted."),
            "faculty_remark": remark
        })
    return result

@app.get("/api/student/profile/{student_id}")
def get_student_profile(student_id: str):
    student = df_stu[df_stu["student_id"] == student_id]
    if len(student) == 0:
        raise HTTPException(status_code=404, detail="Student not found")
        
    student = student.iloc[0].to_dict()
    student["feedbacks"] = student_feedbacks.get(student_id, [])
    student["faculty_remark"] = student_remarks.get(student_id, "No remarks from faculty yet.")
    return student

@app.post("/api/faculty/remark")
def add_faculty_remark(req: RemarkRequest):
    student_remarks[req.student_id] = req.remark
    return {"status": "success", "message": "Remark added successfully."}

@app.get("/api/hod/students")
def get_all_students():
    # Return all students with their basic info and latest risk
    # For a real app, we'd join with feedback, but here we can just use df_stu
    # which already has 'risk_label' from the generation script.
    return df_stu.to_dict(orient="records")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
