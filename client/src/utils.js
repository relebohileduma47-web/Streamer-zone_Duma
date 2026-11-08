export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

export const formatDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

// ISO string -> value for <input type="datetime-local"> (local time)
export const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Anonymous viewer identity, stored in this browser only (used to limit one like per viewer)
export const getViewerId = () => {
  try {
    let id = localStorage.getItem('viewerId');
    if (!id) {
      id = window.crypto?.randomUUID ? window.crypto.randomUUID() : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('viewerId', id);
    }
    return id;
  } catch {
    return `v-session-${Math.random().toString(36).slice(2, 12)}`;
  }
};

export const getSavedName = () => { try { return localStorage.getItem('viewerName') || ''; } catch { return ''; } };
export const saveName = (n) => { try { localStorage.setItem('viewerName', n); } catch { /* ignore */ } };

export const youtubeEmbed = (url) => {
  try {
    const u = new URL(url);
    let id = null;
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
    else if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/watch')) id = u.searchParams.get('v');
      else if (u.pathname.startsWith('/shorts/') || u.pathname.startsWith('/embed/')) id = u.pathname.split('/')[2];
    }
    if (id) return `https://www.youtube.com/embed/${id}`;
    if (u.hostname.includes('vimeo.com')) return `https://player.vimeo.com/video/${u.pathname.split('/').filter(Boolean).pop()}`;
    if (u.hostname.includes('open.spotify.com')) return `https://open.spotify.com/embed${u.pathname}`;
  } catch { /* not a URL */ }
  return null;
};

export const isDirectFile = (url, exts) => exts.some((e) => url.toLowerCase().split('?')[0].endsWith(e));
