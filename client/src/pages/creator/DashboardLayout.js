import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="dash">
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <Link to="/dashboard" className="brand brand-light" onClick={close}>Creator Hub</Link>
        <nav onClick={close}>
          <NavLink to="/dashboard" end>Overview</NavLink>
          <NavLink to="/dashboard/content">My content</NavLink>
          <NavLink to="/dashboard/comments">Comments</NavLink>
          <NavLink to="/dashboard/profile">Profile</NavLink>
        </nav>
        <div className="sidebar-foot">
          <p className="small">{user?.name}</p>
          <Link to="/" className="side-link">View public site</Link>
          <button className="side-link" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
        </div>
      </aside>
      <div className="dash-main">
        <div className="dash-top">
          <button className="menu-btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">Menu</button>
          <span>Creator dashboard</span>
        </div>
        <div className="dash-content"><Outlet /></div>
      </div>
    </div>
  );
}
