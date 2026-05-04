# Role-Based Student Academic Risk Prediction using NLP and Federated Learning

This project is a full-stack academic monitoring system that predicts student academic risk from feedback text using Natural Language Processing (NLP) and a federated learning-inspired model architecture. The system supports three user roles: HOD, Faculty, and Student. The HOD can view the complete student and faculty summary, faculty members can view only their assigned students, and students can submit feedback and view their prediction results and guidance.

## Project Title

**Role-Based Student Academic Risk Prediction using NLP and Federated Learning**

## Developed By

- Aravalam Rajasekhar - 205225006  
- Sundram Patel - 205225026  

## Institution

**National Institute of Technology, Tiruchirappalli**

## Course / Domain

**Federated Learning**

## Guided By

**Dr. B. Janet**

---

## Project Overview

In educational institutions, students may face academic pressure, confusion, lack of confidence, or learning difficulties. These problems may not always be visible through marks alone. This project uses student feedback text to identify the academic risk level of a student as **Low**, **Medium**, or **High**.

The system applies NLP preprocessing techniques such as text cleaning, tokenization, stopword removal, POS tagging, lemmatization, morphological analysis, shallow dependency parsing, and HMM-based POS sequence feature extraction. After preprocessing, three client models are trained separately and their predictions are combined using weighted average aggregation.

The final prediction is displayed through a role-based web application.

---

## Key Features

- Role-based login system for HOD, Faculty, and Student
- Student feedback submission interface
- NLP-based feedback analysis
- Federated learning-inspired client model design
- Three different client models:
  - Client 1: Logistic Regression
  - Client 2: Support Vector Machine
  - Client 3: Random Forest
- Weighted average aggregation of client predictions
- Academic risk prediction: Low, Medium, High
- Student-specific recommendations
- Faculty dashboard for assigned students
- HOD dashboard for complete student and faculty monitoring
- Faculty remarks and guidance system
- Analytics and report visualization

---

## Version History

### Version 1: FL Week 1

The first version focused on synthetic student feedback data and a basic federated learning idea. It used deep learning-based text processing with tokenization, embedding, and LSTM-based modelling. The system predicted student risk and help-needed status.

### Version 2: FL Phase 2

The second version improved the model pipeline using TF-IDF feature extraction and traditional machine learning models. It compared models such as Logistic Regression, SVM, and Random Forest. It also explored federated aggregation methods such as FedAvg, weighted aggregation, and FedProx.

### Version 3: Final Version

The final version adds a complete role-based academic monitoring system. It includes HOD, faculty, and student relationships, advanced NLP preprocessing, HMM-based sequence features, client-wise model training, weighted average aggregation, and a full-stack frontend/backend implementation.

---

## System Architecture

```text
Users
  |
  |-- HOD
  |-- Faculty
  |-- Student
  |
Frontend - React + Vite
  |
Backend - FastAPI
  |
NLP Preprocessing Pipeline
  |
Feature Extraction
  |-- TF-IDF Features
  |-- HMM-based POS Sequence Feature
  |
Federated Learning Clients
  |-- Client 1: Logistic Regression
  |-- Client 2: SVM
  |-- Client 3: Random Forest
  |
Weighted Average Aggregation
  |
Final Risk Prediction
  |
Role-Based Dashboard Output
```

---

## Data Flow

```text
Student submits feedback
        ↓
Feedback is sent to backend
        ↓
NLP preprocessing is applied
        ↓
TF-IDF and HMM-based features are generated
        ↓
Client models produce prediction probabilities
        ↓
Weighted average aggregation combines predictions
        ↓
Final risk level is generated
        ↓
Result is shown in Student, Faculty, and HOD dashboards
```

---

## Dataset Description

The final version uses a generated role-based student feedback dataset. The dataset was prepared by selecting four relevant datasets from Kaggle and combining them according to the project requirements to form a role-based academic feedback structure.

### Main Dataset Files

```text
generated_role_based_student_feedback_dataset.csv
generated_faculty_hierarchy.csv
generated_hod_faculty_risk_summary.csv
```

### Dataset Purpose

| Dataset | Purpose |
|---|---|
| `generated_role_based_student_feedback_dataset.csv` | Contains student details, feedback text, faculty mapping, and risk labels |
| `generated_faculty_hierarchy.csv` | Contains faculty information and assigned student relationships |
| `generated_hod_faculty_risk_summary.csv` | Contains department-level summary for HOD monitoring |

---

## NLP Preprocessing Techniques

The following preprocessing techniques are applied to feedback text:

1. **Text Cleaning**
   - Lowercase conversion
   - Removal of special characters
   - Removal of numbers and extra spaces

2. **Tokenization**
   - Splits feedback text into individual words or tokens

3. **Stopword Removal**
   - Removes common words such as "is", "the", "and", etc.

4. **POS Tagging**
   - Assigns part-of-speech tags to each token

5. **Lemmatization**
   - Converts words into their base form

6. **Morphological Analysis**
   - Analyzes word structure and grammatical properties

7. **Shallow Dependency Parsing**
   - Extracts basic grammatical relationships between words

8. **HMM-Based POS Sequence Feature**
   - Uses POS tag sequences to generate additional sequence-based features

---

## Machine Learning and Federated Learning Approach

The project uses a federated learning-inspired approach where the training data is divided into multiple client groups. Each client trains a separate model.

### Client Models

| Client | Model | Data Group |
|---|---|---|
| Client 1 | Logistic Regression | Faculty Group 1 |
| Client 2 | Support Vector Machine | Faculty Group 2 |
| Client 3 | Random Forest | Faculty Group 3 |

### Aggregation Method

The client predictions are combined using weighted average aggregation.

```text
Final Prediction Probability =
w1 * P1 + w2 * P2 + w3 * P3
```

Where:

- `P1`, `P2`, `P3` are prediction probabilities from client models
- `w1`, `w2`, `w3` are weights based on client data size

The final class is selected using the highest aggregated probability.

---

## Model Performance

The final federated weighted average model achieved an accuracy close to the required range of **0.80 to 0.85**.

### Model Accuracy

| Model | Accuracy |
|---|---|
| Client 1 - Logistic Regression | 0.993605 |
| Client 2 - SVM | 0.996803 |
| Client 3 - Random Forest | 0.937650 |
| Federated Weighted Average | 0.840128 |

### Final Classification Report

| Risk Label | Precision | Recall | F1-score | Support |
|---|---:|---:|---:|---:|
| High | 0.84 | 0.83 | 0.84 | 417 |
| Low | 0.82 | 0.85 | 0.84 | 417 |
| Medium | 0.86 | 0.84 | 0.85 | 417 |
| Accuracy |  |  | 0.84 | 1251 |
| Macro Avg | 0.84 | 0.84 | 0.84 | 1251 |
| Weighted Avg | 0.84 | 0.84 | 0.84 | 1251 |

---

## Final Confusion Matrix

| True / Predicted | High | Low | Medium |
|---|---:|---:|---:|
| High | 345 | 40 | 32 |
| Low | 35 | 355 | 27 |
| Medium | 29 | 37 | 351 |

---

## Technology Stack

### Frontend

- React
- Vite
- React Router DOM
- Axios
- Recharts
- Lucide React
- CSS

### Backend

- FastAPI
- Python
- Pandas
- NumPy
- Scikit-learn
- NLTK
- spaCy
- hmmlearn
- Pickle

### Machine Learning

- Logistic Regression
- Support Vector Machine
- Random Forest
- TF-IDF Vectorizer
- HMM-based sequence feature
- Weighted average aggregation

---

## Project Folder Structure

```text
version 3 frontend backend/
│
├── backend/
│   ├── main.py
│   ├── train_model.py
│   ├── nlp_pipeline.py
│   ├── generate_datasets.py
│   ├── client_models.pkl
│   ├── client_weights.pkl
│   ├── tfidf.pkl
│   └── label_encoder.pkl
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── README.md
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── main.jsx
│       ├── index.css
│       ├── assets/
│       │   ├── hero.png
│       │   ├── react.svg
│       │   └── vite.svg
│       └── pages/
│           ├── Login.jsx
│           ├── HODDashboard.jsx
│           ├── FacultyDashboard.jsx
│           └── StudentDashboard.jsx
```

---

## Backend API Endpoints

The backend APIs are implemented in:

```text
backend/main.py
```

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/login` | POST | Authenticates HOD, faculty, or student |
| `/predict` | POST | Predicts student academic risk from feedback |
| `/api/hod/summary` | GET | Returns complete HOD-level summary |
| `/api/faculty/students/{faculty_id}` | GET | Returns students assigned to a faculty member |
| `/api/student/profile/{student_id}` | GET | Returns student profile and feedback history |
| `/api/faculty/remark` | POST | Allows faculty to add guidance remarks |

---

## Role-Based Access

### HOD

The HOD has complete access to:

- All students
- All faculty members
- Faculty-wise risk summary
- High-risk student count
- Department-level analytics

### Faculty

Each faculty member can access only:

- Students assigned under their guidance
- Student feedback
- Predicted risk level
- Faculty remark section

### Student

Each student can access only:

- Own profile
- Feedback submission form
- Risk prediction result
- Recommendations
- Feedback history
- Faculty guidance remarks

---

## How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
```

---

## Backend Setup

### 2. Navigate to Backend Folder

```bash
cd backend
```

### 3. Create Virtual Environment

```bash
python -m venv venv
```

### 4. Activate Virtual Environment

For Windows:

```bash
venv\Scripts\activate
```

For Linux / macOS:

```bash
source venv/bin/activate
```

### 5. Install Backend Requirements

```bash
pip install fastapi uvicorn pandas numpy scikit-learn nltk spacy hmmlearn scipy python-jose pyjwt
python -m spacy download en_core_web_sm
```

If a `requirements.txt` file is available, use:

```bash
pip install -r requirements.txt
```

### 6. Train or Regenerate Model Files

If model files are already available, this step can be skipped.

```bash
python train_model.py
```

### 7. Start Backend Server

```bash
uvicorn main:app --reload
```

The backend runs at:

```text
http://127.0.0.1:8000
```

FastAPI documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

### 8. Navigate to Frontend Folder

Open a new terminal:

```bash
cd frontend
```

### 9. Install Frontend Dependencies

```bash
npm install
```

### 10. Start Frontend Server

```bash
npm run dev
```

The frontend usually runs at:

```text
http://localhost:5173
```

---

## Sample Login Credentials

### HOD

```text
Username: hod
Password: hod
Role: hod
```

### Faculty

```text
Username: F001
Password: F001
Role: faculty
```

Other faculty users:

```text
F002 / F002
F003 / F003
```

### Student

```text
Username: S0001
Password: S0001
Role: student
```

Other sample students:

```text
S0002 / S0002
S0003 / S0003
S0004 / S0004
S0005 / S0005
```

---

## Sample Prediction Request

Endpoint:

```text
POST /predict
```

Sample JSON body:

```json
{
  "student_id": "S0001",
  "text": "I am extremely stressed and I cannot understand the recent topics. I need urgent help."
}
```

Sample output:

```json
{
  "risk_level": "high",
  "student_id": "S0001",
  "recommendations": [
    "Schedule an urgent one-to-one meeting",
    "Review foundational concepts",
    "Provide additional academic support"
  ]
}
```

---

## Screenshots to Add in Repository

You may add the following screenshots in a folder named `screenshots/`:

```text
screenshots/
├── login_page.png
├── student_dashboard.png
├── faculty_dashboard.png
├── hod_dashboard.png
├── confusion_matrix.png
├── classification_report.png
└── system_architecture.png
```

Then link them in this README if required.

Example:

```markdown
![HOD Dashboard](screenshots/hod_dashboard.png)
```

---

## Results Summary

The final system successfully predicts academic risk levels from student feedback and displays the results through a role-based dashboard. The federated weighted average model gives a balanced accuracy of approximately **84%**, which satisfies the target range of **0.80 to 0.85**.

The system also demonstrates how academic feedback can be used as an early warning signal for identifying students who may need additional guidance.

---

## Advantages

- Protects role-based access to academic data
- Supports HOD-level and faculty-level monitoring
- Uses NLP to understand student feedback
- Uses multiple client models instead of a single model
- Provides a practical full-stack implementation
- Generates useful recommendations for students
- Helps identify high-risk students early

---

## Limitations

- The dataset is generated and may not fully represent real institutional data
- The system currently uses local/in-memory storage for some dynamic values
- The weighted average approach combines prediction probabilities, not true encrypted federated model updates
- Real deployment would require stronger authentication and database integration
- The model performance may vary if tested on real-world student feedback

---

## Future Scope

- Integrate a real institutional student database
- Add secure database storage using MySQL, PostgreSQL, or MongoDB
- Add real federated learning with privacy-preserving model updates
- Use transformer-based language models for improved text understanding
- Add multilingual feedback support
- Add email or SMS alerts for high-risk students
- Add attendance and marks data along with feedback text
- Deploy the project on cloud platforms such as AWS, Azure, Render, or Railway

---

## References

1. Brendan McMahan, Eider Moore, Daniel Ramage, Seth Hampson, and Blaise Aguera y Arcas, "Communication-Efficient Learning of Deep Networks from Decentralized Data," AISTATS, 2017.
2. Qiang Yang, Yang Liu, Tianjian Chen, and Yongxin Tong, "Federated Machine Learning: Concept and Applications," ACM Transactions on Intelligent Systems and Technology, 2019.
3. Christopher D. Manning, Prabhakar Raghavan, and Hinrich Schütze, *Introduction to Information Retrieval*, Cambridge University Press, 2008.
4. Daniel Jurafsky and James H. Martin, *Speech and Language Processing*, 3rd Edition Draft.
5. Steven Bird, Ewan Klein, and Edward Loper, *Natural Language Processing with Python*, O'Reilly Media, 2009.
6. Ian H. Witten, Eibe Frank, Mark A. Hall, and Christopher J. Pal, *Data Mining: Practical Machine Learning Tools and Techniques*, Morgan Kaufmann.
7. Scikit-learn Documentation, Machine Learning in Python.
8. FastAPI Documentation, Modern Web APIs with Python.
9. React Documentation, User Interface Library.
10. Vite Documentation, Frontend Build Tool.
11. NLTK Documentation, Natural Language Toolkit.
12. spaCy Documentation, Industrial-strength NLP in Python.
13. hmmlearn Documentation, Hidden Markov Models in Python.
14. Kaggle Datasets, Student feedback and academic performance related datasets.
15. Recharts Documentation, Charting Library for React.

---

## License

This project is developed for academic and learning purposes. You can modify and extend it according to project or institutional requirements.

---

## Acknowledgement

We sincerely thank **Dr. B. Janet** for guidance and support throughout this Federated Learning project. We also thank the Department and National Institute of Technology, Tiruchirappalli, for providing the academic environment to complete this work.
