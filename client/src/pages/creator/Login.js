import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ErrorMessage } from '../../components/Common';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page">
      <form className="panel login" onSubmit={submit}>
        <h1>Creator login</h1>
        <p className="muted">Sign in to manage your content, comments and profile.</p>
        <ErrorMessage message={error} />
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>
        <button className="btn" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  );
}
