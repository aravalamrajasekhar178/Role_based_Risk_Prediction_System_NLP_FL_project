import pandas as pd
import random
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def generate():
    # 1. HOD Data
    hod_data = [{
        "hod_id": "hod",
        "hod_name": "Dr. Alan Turing",
        "hod_role": "root_hod"
    }]
    
    # 2. Faculty Data
    faculty_data = [
        {"faculty_id": "F001", "faculty_name": "Prof. Ada Lovelace", "department": "CSE", "reports_to": "hod", "role": "faculty"},
        {"faculty_id": "F002", "faculty_name": "Prof. Grace Hopper", "department": "CSE", "reports_to": "hod", "role": "faculty"},
        {"faculty_id": "F003", "faculty_name": "Prof. John von Neumann", "department": "CSE", "reports_to": "hod", "role": "faculty"}
    ]
    df_fac = pd.DataFrame(faculty_data)
    df_fac.to_csv(os.path.join(BASE_DIR, "generated_faculty_hierarchy.csv"), index=False)
    
    # 3. Student Data & Feedback
    students = [
        {"student_id": "S0001", "student_name": "Alice Smith"},
        {"student_id": "S0002", "student_name": "Bob Johnson"},
        {"student_id": "S0003", "student_name": "Charlie Brown"},
        {"student_id": "S0004", "student_name": "Diana Prince"},
        {"student_id": "S0005", "student_name": "Evan Wright"}
    ]
    
    # Let's assign students to faculty
    fac_ids = ["F001", "F002", "F003"]
    
    # Generate large synthetic dataset for training
    # To make the model accurate, we use very distinctive keywords for low, medium, high.
    feedback_templates = [
        ("The concepts are perfectly clear and I feel very confident. Excellent course.", "low"),
        ("I understand everything well, the teaching is great.", "low"),
        ("Very easy to follow and helpful resources provided.", "low"),
        ("I am doing great and have no issues.", "low"),
        ("I feel fully prepared for the exams.", "low"),
        ("It is okay, but I'm slightly confused about some topics.", "medium"),
        ("I need a bit more practice to feel completely sure.", "medium"),
        ("Some parts are tricky, I might need to ask a few questions.", "medium"),
        ("Managing, but struggling slightly with the assignments.", "medium"),
        ("It's getting harder, I need to spend more time on it.", "medium"),
        ("I am totally lost and failing. This is impossible.", "high"),
        ("I am extremely stressed and panicking. I need urgent help.", "high"),
        ("Everything is very hard, I cannot understand anything.", "high"),
        ("I'm depressed about my grades and feel like giving up.", "high"),
        ("Very bad situation, I cannot cope with the workload.", "high")
    ]
    
    records = []
    # Add explicit feedback for our 5 specific students so they have data in the system
    for s in students:
        assigned_fac = random.choice(fac_ids)
        fac_info = next(f for f in faculty_data if f["faculty_id"] == assigned_fac)
        feedback, label = random.choice(feedback_templates)
        records.append({
            "hod_id": "hod",
            "hod_name": "Dr. Alan Turing",
            "hod_role": "root_hod",
            "faculty_id": fac_info["faculty_id"],
            "faculty_name": fac_info["faculty_name"],
            "department": "CSE",
            "reports_to": "hod",
            "student_id": s["student_id"],
            "student_name": s["student_name"],
            "semester": random.choice([2, 4, 6, 8]),
            "section": random.choice(["A", "B", "C"]),
            "feedback_text": feedback,
            "risk_label": label,
            "help_needed": "yes" if label in ["medium", "high"] else "no",
            "faculty_access_rule": "faculty_can_view_only_assigned_students",
            "hod_access_rule": "hod_can_view_all_students_and_faculty"
        })
    
    # Add synthetic data for training (500 records)
    for i in range(1, 501):
        assigned_fac = random.choice(fac_ids)
        fac_info = next(f for f in faculty_data if f["faculty_id"] == assigned_fac)
        feedback, label = random.choice(feedback_templates)
        records.append({
            "hod_id": "hod",
            "hod_name": "Dr. Alan Turing",
            "hod_role": "root_hod",
            "faculty_id": fac_info["faculty_id"],
            "faculty_name": fac_info["faculty_name"],
            "department": "CSE",
            "reports_to": "hod",
            "student_id": f"STU_SYNC_{i:04d}",
            "student_name": f"Synthetic Student {i}",
            "semester": random.choice([2, 4, 6, 8]),
            "section": random.choice(["A", "B", "C"]),
            "feedback_text": feedback,
            "risk_label": label,
            "help_needed": "yes" if label in ["medium", "high"] else "no",
            "faculty_access_rule": "faculty_can_view_only_assigned_students",
            "hod_access_rule": "hod_can_view_all_students_and_faculty"
        })
        
    df_stu = pd.DataFrame(records)
    df_stu.to_csv(os.path.join(BASE_DIR, "generated_role_based_student_feedback_dataset.csv"), index=False)
    
    # 4. HOD Summary
    summary_data = [
        {"faculty_id": f["faculty_id"], "faculty_name": f["faculty_name"], "total_students": len(df_stu[df_stu["faculty_id"] == f["faculty_id"]]), "high_risk_students": len(df_stu[(df_stu["faculty_id"] == f["faculty_id"]) & (df_stu["risk_label"] == "high")])}
        for f in faculty_data
    ]
    df_hod = pd.DataFrame(summary_data)
    df_hod.to_csv(os.path.join(BASE_DIR, "generated_hod_faculty_risk_summary.csv"), index=False)
    
    print("Datasets generated successfully with required credentials.")

if __name__ == "__main__":
    generate()
