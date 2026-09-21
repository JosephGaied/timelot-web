import PrivacyPolicy from './PrivacyPolicy';
import LandingPage from './LandingPage';
import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const API = 'https://timelot-api-production.up.railway.app';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      onLogin(res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>Time<span style={styles.lot}>Lot</span>™</h1>
        <p style={styles.tagline}>There is one resource. It is you.</p>
        <input style={styles.input} type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <div style={styles.passwordWrap}>
          <input style={{ ...styles.input, paddingRight: '72px' }}
            type={showPassword ? 'text' : 'password'} placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <button type="button" style={styles.toggleBtn}
            onClick={() => setShowPassword(s => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} onClick={handleLogin} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p style={styles.privacyLink}>
          <a href="/privacy" style={styles.link}>Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

// --- Calendar event helpers (Phase 2 UI) -----------------------------------
const pad2 = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
// All-day events arrive as 'YYYY-MM-DD'; parse as a LOCAL date so it never shifts a day.
const parseDateOnly = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

function dayHeading(key) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// Plain-language hint under the due-date field, e.g. "Friday, September 25 · in 4 days".
function dueHint(dateStr) {
  if (!dateStr) return '';
  const date = parseDateOnly(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date - today) / 86400000);
  const when = diff === 0 ? 'today'
    : diff === 1 ? 'tomorrow'
    : diff > 1 ? `in ${diff} days`
    : diff === -1 ? '1 day ago'
    : `${-diff} days ago`;
  return `${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · ${when}`;
}

// Group events by local calendar day; all-day events first, then by start time.
function groupEventsByDay(events) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const groups = {};
  events.forEach((e) => {
    let start;
    let timeText;
    if (e.allDay) {
      start = parseDateOnly(e.start);
      const lastDay = parseDateOnly(e.end);
      lastDay.setDate(lastDay.getDate() - 1); // Google's all-day end date is exclusive
      timeText = lastDay > start
        ? `All day · through ${lastDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
        : 'All day';
    } else {
      start = new Date(e.start);
      timeText = `${formatTime(start)} – ${formatTime(new Date(e.end))}`;
    }
    const keyDate = start < todayStart ? todayStart : start; // events already underway show under Today
    const key = dayKey(keyDate);
    (groups[key] = groups[key] || []).push({ ...e, timeText, sortTime: start.getTime() });
  });
  return Object.keys(groups).sort().map((key) => ({
    key,
    items: groups[key].sort((a, b) =>
      a.allDay === b.allDay ? a.sortTime - b.sortTime : (a.allDay ? -1 : 1)),
  }));
}

function Dashboard({ token, onLogout }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [importance, setImportance] = useState(2);
  const [flexibility, setFlexibility] = useState(2);
  const [duration, setDuration] = useState(1);
  const [dueDate, setDueDate] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(''); // '', 'reauth', or 'error'

  const headers = { Authorization: `Bearer ${token}` };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/activities`, { headers });
      setActivities(res.data.activities);
    } catch (err) {
      if (err.response?.status === 401) onLogout();
    }
    setLoading(false);
  };

  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError('');
    try {
      const res = await axios.get(`${API}/calendar/events?days=7`, { headers });
      setEvents(res.data.events || []);
    } catch (err) {
      if (err.response?.status === 401) { onLogout(); return; }
      setEvents([]);
      setEventsError(err.response?.data?.error === 'calendar_reauth_required' ? 'reauth' : 'error');
    }
    setEventsLoading(false);
  };

  const checkCalendar = async () => {
    try {
      const res = await axios.get(`${API}/calendar/status`, { headers });
      setCalendarConnected(res.data.connected);
      if (res.data.connected) fetchEvents();
    } catch (err) {
      // non-fatal; leave as not connected
    }
  };

  const connectCalendar = async () => {
    try {
      const res = await axios.get(`${API}/auth/google`, { headers });
      window.location.href = res.data.url;   // hand off to Google's consent screen
    } catch (err) {
      setMessage('Could not start Google Calendar connection.');
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    fetchActivities();
    checkCalendar();
    // Handle the return trip from Google's OAuth callback
    const params = new URLSearchParams(window.location.search);
    const cal = params.get('calendar');
    if (cal === 'connected') {
      setMessage('Google Calendar connected! ✓');
      setTimeout(() => setMessage(''), 3000);
    } else if (cal === 'error') {
      setMessage('Google Calendar connection failed. Please try again.');
    }
    if (cal) window.history.replaceState({}, '', '/dashboard'); // clean the URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addActivity = async () => {
    if (!name || !dueDate) { setMessage('Please enter a name and due date.'); return; }
    setAdding(true);
    try {
      await axios.post(`${API}/activities`, {
        name, importance: parseInt(importance),
        flexibility: parseInt(flexibility),
        duration_hours: parseFloat(duration),
        due_date: dueDate
      }, { headers });
      setName(''); setDueDate(''); setImportance(2); setFlexibility(2); setDuration(1);
      setMessage('Activity added!');
      setTimeout(() => setMessage(''), 2000);
      fetchActivities();
    } catch (err) {
      setMessage('Failed to add activity.');
    }
    setAdding(false);
  };

  const onEnterAdd = (e) => { if (e.key === 'Enter' && !adding) addActivity(); };

  const completeActivity = async (id) => {
    try {
      await axios.patch(`${API}/activities/${id}`, { status: 'COMPLETED' }, { headers });
      setMessage('Activity completed! ✓');
      setTimeout(() => setMessage(''), 2000);
      fetchActivities();
    } catch (err) {
      setMessage('Failed to complete activity.');
    }
  };

  const deleteActivity = async (id) => {
    if (!window.confirm('Delete this activity?')) return;
    try {
      await axios.delete(`${API}/activities/${id}`, { headers });
      setMessage('Activity deleted.');
      setTimeout(() => setMessage(''), 2000);
      fetchActivities();
    } catch (err) {
      setMessage('Failed to delete activity.');
    }
  };

  const eventGroups = groupEventsByDay(events);

  const importanceLabel = { 1: 'Low', 2: 'Medium', 3: 'High' };
  const flexibilityLabel = { 1: 'Very Flexible', 2: 'Flexible', 3: 'Preferred', 4: 'Fixed' };
  const scoreColor = (score) => score >= 500 ? '#c8b97a' : score >= 100 ? '#7a9bc8' : '#666';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.logo}>Time<span style={styles.lot}>Lot</span>™</h1>
          <p style={styles.date}>Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <button style={styles.logoutBtn} onClick={onLogout}>Sign Out</button>
      </div>

      {message && <div style={styles.messageBanner}>{message}</div>}

      <div style={styles.calendarCard}>
        <div style={styles.calendarRow}>
          <div>
            <h3 style={styles.sectionTitlePlain}>Google Calendar</h3>
            <p style={styles.calendarHint}>
              {calendarConnected
                ? 'Connected — TimeLot can read your calendar and propose time blocks.'
                : 'Connect your calendar so TimeLot can see your committed time.'}
            </p>
          </div>
          {calendarConnected
            ? <span style={styles.connectedBadge}>✓ Connected</span>
            : <button style={styles.connectBtn} onClick={connectCalendar}>Connect Google Calendar</button>}
        </div>
      </div>

      {calendarConnected && (
        <div style={styles.eventsCard}>
          <h3 style={styles.sectionTitle}>Upcoming commitments
            <button style={styles.refreshBtn} onClick={fetchEvents} disabled={eventsLoading}>
              {eventsLoading ? 'Reading…' : '↻ Refresh'}
            </button>
          </h3>
          <p style={styles.eventsNote}>Next 7 days from your primary Google Calendar. TimeLot only reads it here; nothing is saved or changed.</p>
          {eventsError === 'reauth' ? (
            <div>
              <p style={styles.eventsNote}>Google needs you to reconnect your calendar before TimeLot can read it.</p>
              <button style={styles.connectBtn} onClick={connectCalendar}>Reconnect Google Calendar</button>
            </div>
          ) : eventsError ? (
            <p style={styles.eventsNote}>Couldn't read your calendar right now. Try Refresh in a moment.</p>
          ) : eventsLoading && events.length === 0 ? (
            <p style={styles.tagline}>Reading your calendar...</p>
          ) : eventGroups.length === 0 ? (
            <p style={styles.tagline}>Nothing scheduled in the next 7 days.</p>
          ) : (
            eventGroups.map((g) => (
              <div key={g.key} style={styles.eventDay}>
                <p style={styles.eventDayHeading}>{dayHeading(g.key)}</p>
                {g.items.map((e) => (
                  <div key={e.id + g.key} style={{ ...styles.eventRow, opacity: e.busy ? 1 : 0.55 }}>
                    <span style={styles.eventTime}>{e.timeText}</span>
                    <span style={styles.eventTitle}>{e.title}{e.busy ? '' : ' (free)'}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      <div style={styles.addCard}>
        <h3 style={styles.sectionTitle}>Add Activity</h3>
        <input style={styles.input} placeholder="Activity name" value={name}
          onChange={e => setName(e.target.value)} onKeyDown={onEnterAdd} />
        <div style={styles.row}>
          <select style={styles.select} value={importance} onChange={e => setImportance(e.target.value)}>
            <option value={1}>Low Importance</option>
            <option value={2}>Medium Importance</option>
            <option value={3}>High Importance</option>
          </select>
          <select style={styles.select} value={flexibility} onChange={e => setFlexibility(e.target.value)}>
            <option value={1}>Very Flexible</option>
            <option value={2}>Flexible</option>
            <option value={3}>Preferred Time</option>
            <option value={4}>Fixed</option>
          </select>
        </div>
        <div style={styles.row}>
          <div style={styles.fieldBox}>
            <label style={styles.fieldLabel} htmlFor="hours-needed">Hours needed</label>
            <input id="hours-needed" style={styles.input} type="number" placeholder="Hours needed"
              min="0.25" step="0.25" value={duration}
              onChange={e => setDuration(e.target.value)} onKeyDown={onEnterAdd} />
          </div>
          <div style={styles.fieldBox}>
            <label style={styles.fieldLabel} htmlFor="due-date">Due date</label>
            <input id="due-date" style={styles.dateInput} type="date" value={dueDate}
              onChange={e => setDueDate(e.target.value)} onKeyDown={onEnterAdd}
              onClick={e => { try { e.target.showPicker(); } catch (err) { /* older browsers: native behavior */ } }} />
            <p style={styles.dueHint}>{dueDate ? dueHint(dueDate) : 'Click the field to pick a date'}</p>
          </div>
        </div>
        <button style={styles.button} onClick={addActivity} disabled={adding}>
          {adding ? 'Adding...' : '+ Add Activity'}
        </button>
      </div>

      <div style={styles.listCard}>
        <h3 style={styles.sectionTitle}>Your Daily Snapshot
          <span style={styles.count}>{activities.length} active</span>
        </h3>
        {loading ? <p style={styles.tagline}>Loading your priorities...</p> :
          activities.length === 0 ?
            <p style={styles.tagline}>No activities yet. Add one above!</p> :
            activities.map((a, i) => (
              <div key={a.activity_id} style={styles.activityRow}>
                <div style={{...styles.rankBadge, backgroundColor: i === 0 ? '#c8b97a' : '#1a1a2e'}}>
                  #{i + 1}
                </div>
                <div style={styles.scoreBox}>
                  <span style={{...styles.score, color: scoreColor(a.score)}}>{Math.round(a.score)}</span>
                  <span style={styles.scoreLabel}>score</span>
                </div>
                <div style={styles.activityInfo}>
                  <p style={styles.activityName}>{a.name}</p>
                  <p style={styles.activityMeta}>
                    {importanceLabel[a.importance]} · {flexibilityLabel[a.flexibility]} · {a.duration_hours}h · Due in {a.t} day{a.t !== 1 ? 's' : ''}
                  </p>
                </div>
                <div style={styles.actions}>
                  <button style={styles.completeBtn} onClick={() => completeActivity(a.activity_id)} title="Mark complete">✓</button>
                  <button style={styles.deleteBtn} onClick={() => deleteActivity(a.activity_id)} title="Delete">✕</button>
                </div>
              </div>
            ))
        }
      </div>
      <p style={styles.footerLink}><a href="/privacy" style={styles.link}>Privacy Policy</a></p>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0a0a0f', color: '#f0ede6', fontFamily: 'Georgia, serif', padding: '20px' },
  card: { maxWidth: '400px', margin: '100px auto', padding: '40px', backgroundColor: '#1a1a2e', borderRadius: '12px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', maxWidth: '800px', margin: '0 auto 24px' },
  logo: { fontSize: '2.5rem', color: '#f0ede6', margin: 0 },
  lot: { color: '#3d2f8f', fontStyle: 'italic' },
  tagline: { color: '#888', textAlign: 'center', marginBottom: '20px' },
  date: { color: '#888', margin: '4px 0 0' },
  input: { width: '100%', padding: '12px', margin: '8px 0', backgroundColor: '#0a0a0f', border: '1px solid #333', borderRadius: '8px', color: '#f0ede6', fontSize: '1rem', boxSizing: 'border-box' },
  button: { width: '100%', padding: '14px', marginTop: '12px', backgroundColor: '#3d2f8f', border: 'none', borderRadius: '8px', color: '#f0ede6', fontSize: '1rem', cursor: 'pointer' },
  logoutBtn: { padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #444', borderRadius: '8px', color: '#888', fontSize: '0.9rem', cursor: 'pointer' },
  error: { color: '#e74c3c', textAlign: 'center' },
  messageBanner: { maxWidth: '800px', margin: '0 auto 16px', padding: '12px', backgroundColor: '#1a3a1a', border: '1px solid #2a5a2a', borderRadius: '8px', color: '#7ac87a', textAlign: 'center' },
  calendarCard: { maxWidth: '800px', margin: '0 auto 24px', padding: '20px 24px', backgroundColor: '#1a1a2e', borderRadius: '12px' },
  calendarRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' },
  sectionTitlePlain: { color: '#c8b97a', margin: '0 0 4px' },
  calendarHint: { color: '#888', margin: 0, fontSize: '0.85rem' },
  connectBtn: { padding: '12px 18px', backgroundColor: '#3d2f8f', border: 'none', borderRadius: '8px', color: '#f0ede6', fontSize: '0.95rem', cursor: 'pointer', whiteSpace: 'nowrap' },
  connectedBadge: { padding: '8px 14px', backgroundColor: '#1a3a1a', border: '1px solid #2a5a2a', borderRadius: '8px', color: '#7ac87a', fontSize: '0.9rem', whiteSpace: 'nowrap' },
  eventsCard: { maxWidth: '800px', margin: '0 auto 24px', padding: '24px', backgroundColor: '#1a1a2e', borderRadius: '12px' },
  eventsNote: { color: '#888', margin: '0 0 12px', fontSize: '0.85rem' },
  refreshBtn: { padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid #444', borderRadius: '8px', color: '#888', fontSize: '0.8rem', cursor: 'pointer' },
  eventDay: { margin: '14px 0 6px' },
  eventDayHeading: { color: '#7a9bc8', margin: '0 0 6px', fontSize: '0.95rem' },
  eventRow: { display: 'flex', gap: '16px', padding: '10px 14px', margin: '4px 0', backgroundColor: '#0a0a0f', borderRadius: '8px', alignItems: 'baseline' },
  eventTime: { color: '#c8b97a', fontSize: '0.85rem', minWidth: '150px', whiteSpace: 'nowrap' },
  eventTitle: { flex: 1, fontSize: '0.95rem' },
  fieldBox: { flex: 1, display: 'flex', flexDirection: 'column' },
  fieldLabel: { color: '#c8b97a', fontSize: '0.85rem', margin: '8px 0 0' },
  dateInput: { width: '100%', padding: '12px', margin: '8px 0 4px', backgroundColor: '#12121c', border: '2px solid #c8b97a', borderRadius: '8px', color: '#f0ede6', fontSize: '1.05rem', boxSizing: 'border-box', colorScheme: 'dark', cursor: 'pointer' },
  dueHint: { color: '#888', fontSize: '0.8rem', margin: '0 0 4px', minHeight: '1.1em' },
  passwordWrap: { position: 'relative', display: 'block' },
  toggleBtn: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', padding: '4px 10px', backgroundColor: 'transparent', border: '1px solid #444', borderRadius: '6px', color: '#c8b97a', fontSize: '0.8rem', cursor: 'pointer' },
  addCard: { maxWidth: '800px', margin: '0 auto 24px', padding: '24px', backgroundColor: '#1a1a2e', borderRadius: '12px' },
  listCard: { maxWidth: '800px', margin: '0 auto', padding: '24px', backgroundColor: '#1a1a2e', borderRadius: '12px' },
  sectionTitle: { color: '#c8b97a', marginTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  count: { fontSize: '0.85rem', color: '#666', fontWeight: 'normal' },
  row: { display: 'flex', gap: '12px' },
  select: { flex: 1, padding: '12px', margin: '8px 0', backgroundColor: '#0a0a0f', border: '1px solid #333', borderRadius: '8px', color: '#f0ede6', fontSize: '1rem' },
  activityRow: { display: 'flex', alignItems: 'center', padding: '16px', margin: '8px 0', backgroundColor: '#0a0a0f', borderRadius: '8px', gap: '12px' },
  rankBadge: { minWidth: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#0a0a0f', fontWeight: 'bold' },
  scoreBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '55px' },
  score: { fontSize: '1.4rem', fontWeight: 'bold' },
  scoreLabel: { fontSize: '0.65rem', color: '#888' },
  activityInfo: { flex: 1 },
  activityName: { margin: '0 0 4px', fontSize: '1.05rem' },
  activityMeta: { margin: 0, color: '#888', fontSize: '0.82rem' },
  actions: { display: 'flex', gap: '8px' },
  completeBtn: { padding: '8px 12px', backgroundColor: '#1a3a1a', border: '1px solid #2a5a2a', borderRadius: '6px', color: '#7ac87a', cursor: 'pointer', fontSize: '1rem' },
  deleteBtn: { padding: '8px 12px', backgroundColor: '#3a1a1a', border: '1px solid #5a2a2a', borderRadius: '6px', color: '#c87a7a', cursor: 'pointer', fontSize: '1rem' },
  privacyLink: { textAlign: 'center', marginTop: '16px' },
  footerLink: { textAlign: 'center', marginTop: '24px', maxWidth: '800px', margin: '24px auto 0' },
  link: { color: '#666', fontSize: '0.85rem' },
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('timelot_token') || '');
  const handleLogin = (token) => { localStorage.setItem('timelot_token', token); setToken(token); };
  const handleLogout = () => { localStorage.removeItem('timelot_token'); setToken(''); };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/dashboard" element={
          token ? <Dashboard token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
