import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, UserCheck, MessageSquare } from 'lucide-react';

export default function FacultyDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarkInput, setRemarkInput] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`http://localhost:8001/api/faculty/students/${user.id}`);
      setStudents(res.data);
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

  const submitRemark = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !remarkInput) return;
    
    try {
      await axios.post('http://localhost:8001/api/faculty/remark', {
        student_id: selectedStudent.student_id,
        remark: remarkInput
      });
      setRemarkInput('');
      setSelectedStudent(null);
      fetchStudents(); // refresh data
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="nav-bar">
        <div className="flex items-center gap-4">
          <BookOpen size={28} className="text-primary" />
          <h1 className="text-xl">Faculty Portal</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-muted">Welcome, {user.name}</span>
          <button onClick={handleLogout} className="btn btn-danger">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="container grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-2">
          <div className="card">
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <UserCheck size={20} className="text-primary"/> Assigned Students
            </h2>
            {loading ? (
              <p className="text-muted">Loading students...</p>
            ) : (
              <div className="flex flex-col gap-4">
                {students.map((student) => (
                  <div key={student.student_id} className="p-4 border border-gray-700 rounded-lg hover:bg-white/5 transition flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{student.student_name} <span className="text-sm font-mono text-muted ml-2">({student.student_id})</span></h3>
                      <p className="text-sm text-muted mt-1">
                        Semester {student.semester} | Section {student.section}
                      </p>
                      <div className="mt-2 text-sm">
                        <span className="text-muted mr-2">Latest Risk:</span>
                        <span className={`badge badge-${student.latest_risk}`}>{student.latest_risk}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedStudent(student)}
                      className="btn"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      Review
                    </button>
                  </div>
                ))}
                {students.length === 0 && <p className="text-muted">No students assigned.</p>}
              </div>
            )}
          </div>
        </div>

        <div>
          {selectedStudent ? (
            <div className="card sticky top-8">
              <h2 className="text-xl mb-4 flex items-center gap-2">
                <MessageSquare size={20} className="text-primary"/> Student Review
              </h2>
              <div className="mb-4">
                <p className="text-sm text-muted mb-1">Evaluating</p>
                <p className="font-semibold">{selectedStudent.student_name}</p>
              </div>
              
              <div className="mb-6 p-4 bg-black/20 rounded-lg border border-gray-800">
                <p className="text-sm text-muted mb-2">Latest Feedback Submitted:</p>
                <p className="italic text-sm">"{selectedStudent.latest_feedback}"</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-muted mb-2">Current Remark:</p>
                <p className="text-sm p-3 bg-white/5 rounded border border-gray-700">
                  {selectedStudent.faculty_remark}
                </p>
              </div>

              <form onSubmit={submitRemark} className="flex flex-col gap-3">
                <label className="label">Update Guidance Remark</label>
                <textarea 
                  className="input-field" 
                  rows="4"
                  placeholder="Provide guidance or actionable feedback for the student..."
                  value={remarkInput}
                  onChange={(e) => setRemarkInput(e.target.value)}
                  required
                ></textarea>
                <div className="flex gap-2">
                  <button type="submit" className="btn flex-1">Save Remark</button>
                  <button type="button" onClick={() => setSelectedStudent(null)} className="btn bg-gray-700 hover:bg-gray-600">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center text-center p-8 text-muted border-dashed border-2 border-gray-700" style={{ height: '300px' }}>
              <UserCheck size={48} className="mb-4 opacity-50" />
              <p>Select a student from the list to review their feedback and provide guidance.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
