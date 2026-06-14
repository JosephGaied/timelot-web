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
        <input style={styles.input} type="password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { fetchActivities(); }, []);

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

      <div style={styles.addCard}>
        <h3 style={styles.sectionTitle}>Add Activity</h3>
        <input style={styles.input} placeholder="Activity name" value={name}
          onChange={e => setName(e.target.value)} />
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
          <input style={styles.input} type="number" placeholder="Hours needed"
            min="0.25" step="0.25" value={duration} onChange={e => setDuration(e.target.value)} />
          <input style={styles.input} type="date" value={dueDate}
            onChange={e => setDueDate(e.target.value)} />
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