import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Send, BrainCircuit, CheckCircle } from 'lucide-react';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:8001/api/student/profile/${user.id}`);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackInput) return;
    setSubmitting(true);

    try {
      const res = await axios.post('http://localhost:8001/predict', {
        student_id: user.id,
        text: feedbackInput
      });
      setPredictionResult(res.data);
      setFeedbackInput('');
      fetchProfile(); // refresh to show new feedback in history
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-8 mt-20 text-muted">Loading profile...</div>;

  return (
    <div className="animate-fade-in">
      <header className="nav-bar">
        <div className="flex items-center gap-4">
          <User size={28} className="text-primary" />
          <h1 className="text-xl">Student Portal</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-muted">Welcome, {user.name}</span>
          <button onClick={handleLogout} className="btn btn-danger">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="container grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left Column */}
        <div className="flex flex-col gap-8">
          <div className="card glass-panel">
            <h2 className="text-xl mb-4 font-semibold">Your Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted">Student ID</p>
                <p className="font-mono text-lg">{profile.student_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Department</p>
                <p className="text-lg">{profile.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Semester</p>
                <p className="text-lg">{profile.semester}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Section</p>
                <p className="text-lg">{profile.section}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-sm text-muted mb-2">Faculty Guidance / Remark</h3>
              <div className="p-4 bg-primary/10 rounded border border-primary/20 text-blue-100">
                {profile.faculty_remark}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl mb-4 font-semibold flex items-center gap-2">
              <Send size={20} className="text-primary" /> Submit Feedback
            </h2>
            <p className="text-sm text-muted mb-4">
              Share your thoughts on your academic progress.
            </p>
            <form onSubmit={submitFeedback} className="flex flex-col gap-4">
              <textarea
                className="input-field"
                rows="5"
                placeholder="E.g., I'm finding the recent topics on Data Structures very difficult and I'm stressed about the exams..."
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                required
              ></textarea>
              <button type="submit" className="btn self-end" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {predictionResult && (
            <div className="card border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainCircuit size={100} />
              </div>
              <h2 className="text-xl mb-4 font-semibold flex items-center gap-2 text-primary">
                <BrainCircuit size={20} /> Analysis Complete
              </h2>

              <div className="mb-6">
                <p className="text-sm text-muted mb-1">Detected Academic Risk Level</p>
                <div className={`inline-block px-4 py-2 rounded-lg font-bold text-lg 
                  ${predictionResult.risk_level === 'low' ? 'bg-success/20 text-success' :
                    predictionResult.risk_level === 'medium' ? 'bg-warning/20 text-warning' :
                      'bg-danger/20 text-danger'}`}>
                  {predictionResult.risk_level.toUpperCase()} RISK
                </div>
              </div>

              <div className="mb-6 p-4 bg-black/20 rounded-lg border border-gray-800">
                <p className="text-sm font-semibold text-primary mb-2"> Reasoning</p>
                <p className="text-sm leading-relaxed">{predictionResult.agentic_reasoning}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-primary mb-3"> Recommendations</p>
                <ul className="flex flex-col gap-2">
                  {predictionResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle size={16} className="text-success mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="card flex-1">
            <h2 className="text-xl mb-4 font-semibold">Feedback History</h2>
            <div className="flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
              {profile.feedbacks && profile.feedbacks.length > 0 ? (
                profile.feedbacks.map((fb, idx) => (
                  <div key={idx} className="p-4 border border-gray-700 rounded-lg bg-black/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-muted">{fb.date}</span>
                      <span className={`badge badge-${fb.risk}`}>{fb.risk}</span>
                    </div>
                    <p className="text-sm italic text-gray-300">"{fb.text}"</p>
                  </div>
                )).reverse()
              ) : (
                <p className="text-muted text-sm text-center py-4">No feedback submitted yet.</p>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
