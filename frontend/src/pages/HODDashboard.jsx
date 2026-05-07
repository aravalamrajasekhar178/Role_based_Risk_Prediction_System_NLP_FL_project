import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    LogOut, Users, AlertTriangle, ShieldCheck, Search, 
    LayoutDashboard, Filter, TrendingUp, UserMinus, ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function HODDashboard() {
  const [summary, setSummary] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('summary'); // 'summary', 'students', 'high-risk'
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [facultyFilter, setFacultyFilter] = useState('all');
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, stuRes] = await Promise.all([
          axios.get('http://localhost:8001/api/hod/summary'),
          axios.get('http://localhost:8001/api/hod/students')
        ]);
        setSummary(sumRes.data);
        setAllStudents(stuRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const totalStudentsCount = summary.reduce((acc, curr) => acc + curr.total_students, 0);
  const totalHighRiskCount = summary.reduce((acc, curr) => acc + curr.high_risk_students, 0);

  const filteredStudents = allStudents.filter(s => {
    const matchesSearch = s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.student_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || s.risk_label.toLowerCase() === riskFilter;
    const matchesFaculty = facultyFilter === 'all' || s.faculty_id === facultyFilter;
    
    return matchesSearch && matchesRisk && matchesFaculty;
  });

  const highRiskStudents = allStudents.filter(s => s.risk_label.toLowerCase() === 'high');

  const renderSummary = () => (
    <div className="animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card flex items-center gap-4">
                <div className="p-4 bg-primary/20 rounded-lg text-primary">
                    <Users size={32} />
                </div>
                <div>
                    <p className="text-muted text-sm">Total Faculty</p>
                    <h2 className="text-2xl">{summary.length}</h2>
                </div>
            </div>
            <div className="card flex items-center gap-4">
                <div className="p-4 bg-success/20 rounded-lg text-success">
                    <Users size={32} />
                </div>
                <div>
                    <p className="text-muted text-sm">Total Students</p>
                    <h2 className="text-2xl">{totalStudentsCount}</h2>
                </div>
            </div>
            <div className="card flex items-center gap-4">
                <div className="p-4 bg-danger/20 rounded-lg text-danger">
                    <AlertTriangle size={32} />
                </div>
                <div>
                    <p className="text-muted text-sm">High Risk Students</p>
                    <h2 className="text-2xl">{totalHighRiskCount}</h2>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="card">
                <h2 className="text-xl mb-6 font-semibold flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary"/> Faculty Risk Distribution
                </h2>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={summary}>
                            <XAxis dataKey="faculty_name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Bar dataKey="high_risk_students" name="High Risk" radius={[4, 4, 0, 0]}>
                                {summary.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.high_risk_students > 5 ? '#ef4444' : '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card">
                <h2 className="text-xl mb-6 font-semibold flex items-center gap-2">
                    <ShieldCheck size={20} className="text-success"/> Risk Concentration
                </h2>
                <div className="flex flex-col gap-4">
                    {summary.map(fac => (
                        <div key={fac.faculty_id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                            <div>
                                <p className="font-medium">{fac.faculty_name}</p>
                                <p className="text-xs text-muted">{fac.faculty_id}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-lg font-bold ${fac.high_risk_students > 5 ? 'text-danger' : 'text-primary'}`}>
                                    {((fac.high_risk_students / fac.total_students) * 100).toFixed(1)}%
                                </p>
                                <p className="text-xs text-muted">Risk Ratio</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="card">
            <h2 className="text-xl mb-4 font-semibold">Faculty Performance & Risk Metrics</h2>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Faculty Name</th>
                            <th className="text-center">Assigned Students</th>
                            <th className="text-center">High Risk</th>
                            <th className="text-center">Risk level</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary.map((item) => (
                            <tr key={item.faculty_id}>
                                <td className="font-medium">{item.faculty_name}</td>
                                <td className="text-center">{item.total_students}</td>
                                <td className="text-center font-bold text-danger">{item.high_risk_students}</td>
                                <td className="text-center">
                                    {item.high_risk_students > item.total_students * 0.2 ? (
                                        <span className="badge badge-high">Critical</span>
                                    ) : (
                                        <span className="badge badge-low">Normal</span>
                                    )}
                                </td>
                                <td className="text-center">
                                    <button 
                                        onClick={() => {
                                            setFacultyFilter(item.faculty_id);
                                            setActiveView('students');
                                        }}
                                        className="text-primary hover:underline text-sm flex items-center justify-center gap-1 mx-auto"
                                    >
                                        View Students <ChevronRight size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  const renderStudents = () => (
    <div className="animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h2 className="text-2xl font-bold">Comprehensive Student Roster</h2>
                <p className="text-muted text-sm">Monitoring across all faculty and sections</p>
            </div>
            <div className="flex gap-3">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-3 text-muted" />
                    <input 
                        type="text" 
                        className="input-field" 
                        style={{ paddingLeft: '2.5rem', marginBottom: 0, width: '250px' }}
                        placeholder="Search student..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </div>

        <div className="filter-bar">
            <div className="flex items-center gap-2">
                <Filter size={16} className="text-muted" />
                <span className="text-sm text-muted">Filters:</span>
            </div>
            <select 
                className="filter-select"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
            >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
            </select>
            <select 
                className="filter-select"
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
            >
                <option value="all">All Faculty Advisors</option>
                {summary.map(f => (
                    <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_name}</option>
                ))}
            </select>
            {(riskFilter !== 'all' || facultyFilter !== 'all') && (
                <button 
                    onClick={() => { setRiskFilter('all'); setFacultyFilter('all'); }}
                    className="text-xs text-primary hover:underline"
                >
                    Clear Filters
                </button>
            )}
        </div>

        <div className="card">
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Student Name</th>
                            <th>Sem / Sec</th>
                            <th>Faculty Advisor</th>
                            <th className="text-center">Academic Risk</th>
                            <th>Latest Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((stu) => (
                            <tr key={stu.student_id}>
                                <td className="font-mono text-sm text-primary">{stu.student_id}</td>
                                <td className="font-medium">{stu.student_name}</td>
                                <td>{stu.semester} / {stu.section}</td>
                                <td className="text-sm text-muted">{stu.faculty_name || stu.faculty_id}</td>
                                <td className="text-center">
                                    <span className={`badge badge-${stu.risk_label.toLowerCase()}`}>
                                        {stu.risk_label}
                                    </span>
                                </td>
                                <td className="text-sm italic text-muted max-w-xs truncate">
                                    "{stu.feedback_text}"
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredStudents.length === 0 && (
                    <div className="py-12 text-center text-muted">
                        <UserMinus size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No students found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );

  const renderHighRisk = () => (
    <div className="animate-fade-in">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-danger">Priority Attention Required</h2>
            <p className="text-muted text-sm">Students identified with severe academic or behavioral risk patterns</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highRiskStudents.map(stu => (
                <div key={stu.student_id} className="card border-l-4 border-danger hover:scale-[1.02] transition-transform">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg">{stu.student_name}</h3>
                            <p className="text-xs font-mono text-muted">{stu.student_id}</p>
                        </div>
                        <span className="badge badge-high">High Risk</span>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="p-3 bg-black/20 rounded border border-white/5">
                            <p className="text-xs text-muted mb-1">Critical Feedback:</p>
                            <p className="text-sm italic">"{stu.feedback_text}"</p>
                        </div>
                        
                        <div className="flex justify-between text-xs text-muted">
                            <span>Advisor: {stu.faculty_name || stu.faculty_id}</span>
                            <span>Sem {stu.semester} | Sec {stu.section}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {highRiskStudents.length === 0 && (
            <div className="card text-center py-12">
                <ShieldCheck size={48} className="mx-auto mb-4 text-success opacity-50" />
                <p className="text-xl font-medium">No High Risk Students Detected</p>
                <p className="text-muted">All student systems are currently within operational limits.</p>
            </div>
        )}
    </div>
  );

  return (
    <div className="dashboard-layout">
        <aside className="sidebar">
            <div className="sidebar-header">
                <ShieldCheck size={28} className="text-primary" />
                <h1 className="text-lg font-bold">HOD Portal</h1>
            </div>
            
            <nav className="sidebar-nav">
                <button 
                    onClick={() => setActiveView('summary')}
                    className={`nav-item ${activeView === 'summary' ? 'active' : ''}`}
                >
                    <LayoutDashboard size={20} /> Analytics Summary
                </button>
                <button 
                    onClick={() => setActiveView('students')}
                    className={`nav-item ${activeView === 'students' ? 'active' : ''}`}
                >
                    <Users size={20} /> All Students
                </button>
                <button 
                    onClick={() => setActiveView('high-risk')}
                    className={`nav-item ${activeView === 'high-risk' ? 'active' : ''}`}
                >
                    <AlertTriangle size={20} /> High Risk Alert
                </button>
            </nav>

            <div className="mt-auto p-6 border-t border-white/5">
                <div className="mb-4">
                    <p className="text-xs text-muted">LOGGED IN AS</p>
                    <p className="font-medium text-sm">{user.name}</p>
                </div>
                <button onClick={handleLogout} className="btn btn-danger w-full">
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </aside>

        <main className="main-content">
            {loading ? (
                <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-muted animate-pulse">Synchronizing Departmental Data...</p>
                    </div>
                </div>
            ) : (
                <>
                    {activeView === 'summary' && renderSummary()}
                    {activeView === 'students' && renderStudents()}
                    {activeView === 'high-risk' && renderHighRisk()}
                </>
            )}
        </main>
    </div>
  );
}
