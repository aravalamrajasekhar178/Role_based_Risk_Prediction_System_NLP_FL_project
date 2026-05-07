import pandas as pd
import numpy as np
import pickle
import os
import scipy.sparse as sp
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from nlp_pipeline import nlp_preprocess, extract_hmm_sequence_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "generated_role_based_student_feedback_dataset.csv")

def train():
    df = pd.read_csv(DATA_FILE)
    
    # Preprocess
    print("Preprocessing text...")
    df['clean_text'] = ""
    df['hmm_score'] = 0.0
    
    for idx, row in df.iterrows():
        clean_txt, pos_tags = nlp_preprocess(row['feedback_text'])
        df.at[idx, 'clean_text'] = clean_txt
        df.at[idx, 'hmm_score'] = extract_hmm_sequence_score(pos_tags)
        
    print("Extracting features...")
    tfidf = TfidfVectorizer(max_features=1000)
    X_tfidf = tfidf.fit_transform(df['clean_text'])
    X_hmm = np.array(df['hmm_score']).reshape(-1, 1)
    
    X = sp.hstack((X_tfidf, X_hmm)).tocsr()
    
    le = LabelEncoder()
    y = le.fit_transform(df['risk_label'])
    
    # Simulating Federated Learning setup
    print("Training federated clients...")
    faculties = df['faculty_id'].unique()
    
    client_models = {}
    client_weights = {}
    
    model_types = [
        LogisticRegression(max_iter=1000), 
        SVC(probability=True), 
        RandomForestClassifier(n_estimators=100)
    ]
    
    for i, fac in enumerate(faculties):
        # Client data
        idx = (df['faculty_id'] == fac).values
        X_client = X[idx]
        y_client = y[idx]
        
        # Train model
        model = model_types[i % len(model_types)]
        model.fit(X_client, y_client)
        
        client_models[fac] = model
        client_weights[fac] = len(y_client)
        print(f"Trained Client {fac} ({type(model).__name__}) with {len(y_client)} samples")
        
    # Save assets
    print("Saving assets...")
    with open(os.path.join(BASE_DIR, 'backend', 'client_models.pkl'), 'wb') as f:
        pickle.dump(client_models, f)
    with open(os.path.join(BASE_DIR, 'backend', 'client_weights.pkl'), 'wb') as f:
        pickle.dump(client_weights, f)
    with open(os.path.join(BASE_DIR, 'backend', 'tfidf.pkl'), 'wb') as f:
        pickle.dump(tfidf, f)
    with open(os.path.join(BASE_DIR, 'backend', 'label_encoder.pkl'), 'wb') as f:
        pickle.dump(le, f)
        
    print("Federated training complete.")

if __name__ == "__main__":
    train()
