import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants';

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></svg>
);
const GridIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);

const isDesktop = () => window.innerWidth >= 1100;

export default function PublicLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(isDesktop());
  const [text, setText] = useState('');

  const params = new URLSearchParams(location.search);
  const onBrowse = location.pathname === '/browse';
  const activeCategory = onBrowse ? params.get('category') || 'All' : null;

  // creator profile is loaded once and shared with every public page
  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => setProfile(null)).finally(() => setProfileLoaded(true));
  }, []);

  // keep the search box in sync with the address bar, close the menu on small screens after navigating
  useEffect(() => {
    setText(onBrowse ? new URLSearchParams(location.search).get('q') || '' : '');
    if (!isDesktop()) setMenuOpen(false);
  }, [location.pathname, location.search, onBrowse]);

  const submitSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (text.trim()) p.set('q', text.trim());
    if (activeCategory && activeCategory !== 'All') p.set('category', activeCategory);
    navigate({ pathname: '/browse', search: p.toString() ? `?${p}` : '' });
  };

  const itemClass = (active) => `side-item ${active ? 'side-item-active' : ''}`;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            <MenuIcon />
          </button>
          <Link to="/" className="brand">Creator Hub</Link>
        </div>

        <form className="topsearch" role="search" onSubmit={submitSearch}>
          <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Search content" aria-label="Search by title or keyword" />
          <button type="submit" aria-label="Search"><SearchIcon /></button>
        </form>

        <div className="topbar-right">
          <Link to={user ? '/dashboard' : '/login'} className="btn btn-small">{user ? 'Dashboard' : 'Creator login'}</Link>
        </div>
      </header>

      <aside className={`side ${menuOpen ? 'side-open' : ''}`} aria-label="Main menu">
        <nav>
          <div className="side-group">
            <Link to="/" className={itemClass(location.pathname === '/')}><HomeIcon /> Home</Link>
            <Link to="/browse" className={itemClass(activeCategory === 'All')}><GridIcon /> Browse all</Link>
          </div>
          <div className="side-group">
            <p className="side-title">Categories</p>
            {CATEGORIES.map((c) => (
              <Link key={c} to={`/browse?category=${encodeURIComponent(c)}`} className={itemClass(activeCategory === c)}>{c}</Link>
            ))}
          </div>
        </nav>
      </aside>
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} />}

      <main className={`shell-main ${menuOpen ? 'shifted' : ''}`}>
        <Outlet context={{ profile, profileLoaded }} />
        <footer className="footer">
          <div className="container">Creator Hub. Content published by the creator, discussed by you.</div>
        </footer>
      </main>
    </div>
  );
}