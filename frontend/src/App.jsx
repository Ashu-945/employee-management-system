import { Navigate, Route, Routes, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import AdminLogin from './pages/AdminLogin';

const Navbar = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const dashboardPath = isAdmin ? '/admin/dashboard' : '/dashboard';
  const displayName = user?.name || user?.email || 'User';

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <div className="nav-brand-icon">E</div>
        EMS Pro
      </Link>

      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        {!user && <Link to="/admin/login" className="nav-link">Admin</Link>}
        {user ? (
          <>
            <Link to={dashboardPath} className="nav-link">Dashboard</Link>
            <div className="nav-user">
              <div className="user-avatar">{displayName.charAt(0).toUpperCase()}</div>
              <button className="btn btn-outline" onClick={logout}>Logout</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="btn btn-primary nav-cta">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

function App() {
  const { loading } = useAuth();
  const location = useLocation();
  const isImmersivePage =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/login' ||
    location.pathname === '/signup';

  if (loading) {
    return <div className="main-content">Loading...</div>;
  }

  return (
    <div className="app-container">
      <div className="bg-glow"></div>
      <div className="bg-glow-2"></div>

      {!isImmersivePage && <Navbar />}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']} />}>
            <Route path="/admin/dashboard" element={<Dashboard adminView view="dashboard" />} />
            <Route path="/admin/employees" element={<Dashboard adminView view="employees" />} />
            <Route path="/admin/employees/new" element={<Dashboard adminView view="employee-form" />} />
            <Route path="/admin/employees/:id" element={<Dashboard adminView view="profile" />} />
            <Route path="/admin/employees/:id/edit" element={<Dashboard adminView view="employee-form" />} />
            <Route path="/admin/departments" element={<Dashboard adminView view="departments" />} />
            <Route path="/admin/attendance" element={<Dashboard adminView view="attendance" />} />
            <Route path="/admin/payroll" element={<Dashboard adminView view="payroll" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
