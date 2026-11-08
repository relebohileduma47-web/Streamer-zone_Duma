import { useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { ErrorMessage } from '../../components/Common';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name, bio: user.bio || '', avatarUrl: user.avatarUrl || '',
    requireCommentApproval: user.requireCommentApproval,
  });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const d = await api.updateProfile(form);
      setUser(d.user);
      setMsg({ type: 'ok', text: 'Profile saved' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally { setSaving(false); }
  };

  return (
    <>
      <div className="page-head"><h1>Profile</h1></div>
      <form className="panel form" onSubmit={submit}>
        {msg.type === 'error' && <ErrorMessage message={msg.text} />}
        {msg.type === 'ok' && <div className="alert alert-ok" role="status">{msg.text}</div>}
        <label>Display name<input value={form.name} onChange={set('name')} required minLength={2} maxLength={80} /></label>
        <label>Profile picture or logo URL<input type="url" value={form.avatarUrl} onChange={set('avatarUrl')} placeholder="https://..." /></label>
        <label>Introduction (shown on the home page)<textarea rows={5} value={form.bio} onChange={set('bio')} maxLength={1000} /></label>
        <label className="check">
          <input type="checkbox" checked={form.requireCommentApproval} onChange={set('requireCommentApproval')} />
          Hold new comments for my approval before they appear
        </label>
        <div className="form-actions"><button className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button></div>
      </form>
    </>
  );
}
