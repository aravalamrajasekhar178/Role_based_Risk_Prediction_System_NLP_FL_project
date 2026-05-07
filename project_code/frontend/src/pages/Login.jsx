import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BrainCircuit, Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('hod');
  const [password, setPassword] = useState('hod');
  const [role, setRole] = useState('hod');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:8001/api/login', {
        username,
        password,
        role
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (role === 'hod') navigate('/hod');
      else if (role === 'faculty') navigate('/faculty');
      else navigate('/student');
      
    } catch (err) {
      setError('Invalid credentials or role mismatch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card glass-panel animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
        <div className="text-center mb-8">
          <BrainCircuit size={48} className="text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold">EduNLP-FL</h1>
          <p className="text-muted text-sm mt-2">Academic Risk Prediction System</p>
        </div>
        
        {error && (
          <div className="badge badge-high mb-4 text-center block py-2">{error}</div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <select 
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="hod">HOD (Head of Dept)</option>
              <option value="faculty">Faculty Member</option>
              <option value="student">Student</option>
            </select>
          </div>
          
          <div className="relative">
            <User size={18} className="absolute left-3 top-3.5 text-muted" />
            <input 
              type="text" 
              className="input-field" 
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3.5 text-muted" />
            <input 
              type="password" 
              className="input-field" 
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn mt-2" disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-muted bg-black/20 p-4 rounded-lg">
          <p className="font-semibold text-main mb-2">Predefined Credentials:</p>
          <p>HOD: <span className="text-primary font-mono">hod / hod</span></p>
          <p>Faculty: <span className="text-primary font-mono">F001 / F001</span> (F001-F003)</p>
          <p>Student: <span className="text-primary font-mono">S0001 / S0001</span> (S0001-S0005)</p>
        </div>
      </div>
    </div>
  );
}
