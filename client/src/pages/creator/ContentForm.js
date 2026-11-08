import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { CATEGORIES, TYPES } from '../../constants';
import { ErrorMessage, Spinner } from '../../components/Common';
import { toLocalInput } from '../../utils';

const empty = {
  title: '', description: '', category: 'Education', type: 'video',
  thumbnailUrl: '', mediaUrl: '', articleContent: '',
  status: 'draft', publishDate: '', featured: false,
};

export default function ContentForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) return;
    api.getContent(id, true)
      .then((c) => setForm({
        title: c.title, description: c.description, category: c.category, type: c.type,
        thumbnailUrl: c.thumbnailUrl || '', mediaUrl: c.mediaUrl || '', articleContent: c.articleContent || '',
        status: c.status, publishDate: toLocalInput(c.publishDate), featured: c.featured,
      }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, editing]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.status === 'scheduled') {
      if (!form.publishDate) return setError('Choose a publication date and time for scheduled content.');
      if (new Date(form.publishDate) <= new Date()) return setError('A scheduled publication time must be in the future.');
    }
    const payload = {
      ...form,
      publishDate: form.status === 'draft' || !form.publishDate ? undefined : new Date(form.publishDate).toISOString(),
    };
    setSaving(true);
    try {
      if (editing) await api.updateContent(id, payload);
      else await api.createContent(payload);
      navigate('/dashboard/content');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  const isArticle = form.type === 'article';

  return (
    <>
      <div className="page-head"><h1>{editing ? 'Edit content' : 'Add content'}</h1></div>
      <form className="panel form" onSubmit={submit}>
        <ErrorMessage message={error} />

        <label>Title<input value={form.title} onChange={set('title')} required minLength={3} maxLength={150} /></label>
        <label>Description<textarea value={form.description} onChange={set('description')} required maxLength={1000} rows={3} /></label>

        <div className="form-row">
          <label>Category
            <select value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label>Content type
            <select value={form.type} onChange={set('type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
        </div>

        <label>Thumbnail image URL<input type="url" value={form.thumbnailUrl} onChange={set('thumbnailUrl')} placeholder="https://..." /></label>
        <label>
          {isArticle ? 'Link to original article (optional)' : 'Media URL (YouTube, Vimeo, Spotify, or a direct file link)'}
          <input type="url" value={form.mediaUrl} onChange={set('mediaUrl')} placeholder="https://..." required={!isArticle} />
        </label>
        {isArticle && (
          <label>Article content
            <textarea value={form.articleContent} onChange={set('articleContent')} rows={10} placeholder="Write your article. Leave a blank line between paragraphs." />
          </label>
        )}

        <div className="form-row">
          <label>Status
            <select value={form.status} onChange={set('status')}>
              <option value="draft">Draft (hidden from viewers)</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </label>
          {form.status !== 'draft' && (
            <label>{form.status === 'scheduled' ? 'Publish on' : 'Publication date (optional, defaults to now)'}
              <input type="datetime-local" value={form.publishDate} onChange={set('publishDate')} required={form.status === 'scheduled'} />
            </label>
          )}
        </div>

        <label className="check"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Show as featured on the home page</label>

        <div className="form-actions">
          <button className="btn" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Create content'}</button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard/content')}>Cancel</button>
        </div>
      </form>
    </>
  );
}
