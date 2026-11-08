const BASE = `${(process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api`;

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }

  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }

  if (!res.ok) {
    if (res.status === 401 && auth) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:expired'));
    }
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const qs = (params) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== '' && v !== null && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const api = {
  // public
  getProfile: () => request('/profile'),
  getContents: (params = {}) => request(`/contents${qs(params)}`),
  getContent: (id, auth = false) => request(`/contents/${id}`, { auth }),
  recordView: (id) => request(`/contents/${id}/view`, { method: 'POST' }),
  getComments: (contentId) => request(`/comments/${contentId}`),
  postComment: (body) => request('/comments', { method: 'POST', body }),
  getLikeStatus: (contentId, viewerId) => request(`/likes/${contentId}${qs({ viewerId })}`),
  toggleLike: (body) => request('/likes', { method: 'POST', body }),

  // creator
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me', { auth: true }),
  getStats: () => request('/dashboard/stats', { auth: true }),
  getAllContents: (params = {}) => request(`/contents/manage/all${qs(params)}`, { auth: true }),
  createContent: (body) => request('/contents', { method: 'POST', body, auth: true }),
  updateContent: (id, body) => request(`/contents/${id}`, { method: 'PUT', body, auth: true }),
  deleteContent: (id) => request(`/contents/${id}`, { method: 'DELETE', auth: true }),
  getAllComments: (params = {}) => request(`/comments${qs(params)}`, { auth: true }),
  setCommentStatus: (id, status) => request(`/comments/${id}/status`, { method: 'PATCH', body: { status }, auth: true }),
  deleteComment: (id) => request(`/comments/${id}`, { method: 'DELETE', auth: true }),
  updateProfile: (body) => request('/profile', { method: 'PUT', body, auth: true }),
};
