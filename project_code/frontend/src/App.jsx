import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import HODDashboard from './pages/HODDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';

function PrivateRoute({ children, role }) {
  const userStr = localStorage.getItem("user");
  if (!userStr) return <Navigate to="/" />;
  
  const user = JSON.parse(userStr);
  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/hod" element={
          <PrivateRoute role="hod">
            <HODDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/faculty" element={
          <PrivateRoute role="faculty">
            <FacultyDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/student" element={
          <PrivateRoute role="student">
            <StudentDashboard />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
