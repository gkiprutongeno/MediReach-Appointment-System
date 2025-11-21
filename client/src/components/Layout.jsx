import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-container">
      <header className="header" role="banner">
        <nav className="nav" aria-label="Main navigation">
          <Link to="/" className="logo">
            <span className="logo-icon" aria-hidden="true">🩺</span>
            <span className="logo-text">MediReach</span>
          </Link>

          <ul className="nav-links" role="menubar">
            <li role="none">
              <Link to="/doctors" role="menuitem">Find Doctors</Link>
            </li>

            {isAuthenticated ? (
              <>
                <li role="none">
                  <Link to="/dashboard" role="menuitem">Dashboard</Link>
                </li>
                <li role="none">
                  <Link to="/profile" role="menuitem">Profile</Link>
                </li>
                <li role="none" className="user-menu">
                  <span className="user-name">
                    Hi, {user?.firstName}
                  </span>
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-outline btn-sm"
                    aria-label="Logout"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li role="none">
                  <Link to="/login" className="btn btn-outline btn-sm" role="menuitem">
                    Login
                  </Link>
                </li>
                <li role="none">
                  <Link to="/register" className="btn btn-primary btn-sm" role="menuitem">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <main className="main-content" role="main" id="main-content">
        <Outlet />
      </main>

      <footer className="footer" role="contentinfo">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} MediReach. All rights reserved.</p>
          <nav aria-label="Footer navigation">
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}