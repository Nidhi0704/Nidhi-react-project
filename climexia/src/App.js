// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback } from 'react';
import {
  authAPI,
  adminAuthAPI,
  partnerAuthAPI,
  catalogAPI,
  bookingAPI,
  dashboardAPI,
  adminAPI,
  getToken,
  getUserType,
  removeToken,
} from './services/api';

// ── Inline styles (no external CSS dependency) ────────────────────────────────
const styles = {
  app: { fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#F0F9FF', color: '#1E293B' },
  header: { background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', color: '#fff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' },
  logo: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' },
  nav: { display: 'flex', gap: 12, alignItems: 'center' },
  btn: { padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s' },
  btnPrimary: { background: '#0EA5E9', color: '#fff' },
  btnWhite: { background: '#fff', color: '#0EA5E9' },
  btnDanger: { background: '#EF4444', color: '#fff' },
  btnGreen: { background: '#22C55E', color: '#fff' },
  card: { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 4 },
  h2: { fontSize: 22, fontWeight: 700, marginBottom: 16, color: '#0F172A' },
  h3: { fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#0F172A' },
  badge: (color) => ({ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: color === 'green' ? '#DCFCE7' : color === 'red' ? '#FEE2E2' : color === 'blue' ? '#DBEAFE' : '#FEF9C3', color: color === 'green' ? '#16A34A' : color === 'red' ? '#DC2626' : color === 'blue' ? '#1D4ED8' : '#B45309' }),
  statCard: { background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNum: { fontSize: 36, fontWeight: 800, color: '#0EA5E9' },
  statLabel: { fontSize: 14, color: '#64748B', marginTop: 4 },
  container: { maxWidth: 1200, margin: '0 auto', padding: '24px 32px' },
  alert: (type) => ({ padding: '12px 16px', borderRadius: 8, marginBottom: 12, background: type === 'error' ? '#FEE2E2' : '#DCFCE7', color: type === 'error' ? '#DC2626' : '#16A34A', fontSize: 14 }),
  tab: (active) => ({ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: active ? '#0EA5E9' : '#E2E8F0', color: active ? '#fff' : '#475569', transition: 'all 0.2s' }),
};

// ── Helper ────────────────────────────────────────────────────────────────────
const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

// ── Login Form ─────────────────────────────────────────────────────────────────
function LoginForm({ onLogin }) {
  const [tab, setTab] = useState('customer');
  const [form, setForm] = useState({ phone: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      let res;
      if (tab === 'customer') {
        res = await authAPI.login({ phone: form.phone, password: form.password });
        onLogin({ ...res.data.user, userType: 'customer' });
      } else if (tab === 'partner') {
        res = await partnerAuthAPI.login({ phone: form.phone, password: form.password });
        onLogin({ ...res.data.partner, userType: 'partner' });
      } else {
        res = await adminAuthAPI.login({ email: form.email, password: form.password });
        onLogin({ ...res.data.admin, userType: 'admin' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 40, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h1 style={{ textAlign: 'center', color: '#0EA5E9', fontWeight: 800, marginBottom: 4 }}>🌡️ Climexia</h1>
        <p style={{ textAlign: 'center', color: '#64748B', marginBottom: 24, fontSize: 13 }}>India's Smart HVAC Platform</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['customer', 'partner', 'admin'].map((t) => (
            <button key={t} style={{ ...styles.btn, ...(tab === t ? styles.btnPrimary : {}), flex: 1, background: tab === t ? '#0EA5E9' : '#F1F5F9', color: tab === t ? '#fff' : '#475569', padding: '8px 4px', fontSize: 12 }} onClick={() => setTab(t)}>
              {capitalize(t)}
            </button>
          ))}
        </div>
        {error && <div style={styles.alert('error')}>{error}</div>}
        {tab !== 'admin' ? (
          <>
            <label style={styles.label}>Phone Number</label>
            <input style={styles.input} placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </>
        ) : (
          <>
            <label style={styles.label}>Email</label>
            <input style={styles.input} placeholder="superadmin@climexia.in" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </>
        )}
        <label style={styles.label}>Password</label>
        <input style={styles.input} type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
        <button style={{ ...styles.btn, ...styles.btnPrimary, width: '100%', padding: '12px', fontSize: 15 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
        <div style={{ marginTop: 20, fontSize: 12, color: '#94A3B8', lineHeight: 1.8 }}>
          <strong>Test Credentials:</strong><br />
          Customer: 9876543210 / Customer@123<br />
          Partner: 9765432109 / Partner@123<br />
          Admin: superadmin@climexia.in / Climexia@Super2026!
        </div>
      </div>
    </div>
  );
}

// ── Customer Dashboard ────────────────────────────────────────────────────────
function CustomerDashboard({ user }) {
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('services');
  const [loading, setLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    catalogAPI.getServices({ isFeatured: true, limit: 6 }).then((r) => setServices(r.data.data || [])).catch(() => {});
    catalogAPI.getProducts({ limit: 4 }).then((r) => setProducts(r.data.data || [])).catch(() => {});
    bookingAPI.getMyBookings({ limit: 5 }).then((r) => setBookings(r.data.data || [])).catch(() => {});
  }, []);

  const submitBooking = async () => {
    if (!bookingForm) return;
    setLoading(true);
    try {
      await bookingAPI.create({
        service: bookingForm.serviceId,
        acType: bookingForm.acType || 'split_ac',
        issue: bookingForm.issue || 'General service',
        scheduledDate: bookingForm.date,
        scheduledTimeSlot: bookingForm.slot || '10:00 AM - 12:00 PM',
        address: { line1: user.city || 'Main Street', city: user.city || 'Pune', state: 'Maharashtra', pincode: '411001' },
        amount: bookingForm.price,
      });
      setMsg('✅ Booking created successfully!');
      setBookingForm(null);
      bookingAPI.getMyBookings({ limit: 5 }).then((r) => setBookings(r.data.data || []));
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Booking failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = { pending: 'yellow', assigned: 'blue', in_progress: 'blue', completed: 'green', cancelled: 'red' };

  return (
    <div style={styles.container}>
      <h2 style={styles.h2}>Welcome back, {user.firstName}! 👋</h2>
      {msg && <div style={styles.alert(msg.startsWith('✅') ? 'success' : 'error')}>{msg}</div>}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['services', 'products', 'bookings'].map((t) => (
          <button key={t} style={styles.tab(tab === t)} onClick={() => setTab(t)}>{capitalize(t)}</button>
        ))}
      </div>

      {tab === 'services' && (
        <div style={styles.grid3}>
          {services.map((s) => (
            <div key={s._id} style={styles.card}>
              <h3 style={styles.h3}>{s.name}</h3>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>{s.description?.slice(0, 80)}…</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#0EA5E9', fontSize: 18 }}>{formatCurrency(s.basePrice)}</strong>
                <button style={{ ...styles.btn, ...styles.btnPrimary, fontSize: 13 }}
                  onClick={() => setBookingForm({ serviceId: s._id, name: s.name, price: s.basePrice, date: '', slot: '', acType: 'split_ac', issue: 'Routine service' })}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <div style={styles.grid4}>
          {products.map((p) => (
            <div key={p._id} style={styles.card}>
              <h3 style={styles.h3}>{p.name}</h3>
              <p style={{ fontSize: 12, color: '#64748B' }}>{p.brand} • {p.tonnage}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <strong style={{ color: '#0EA5E9' }}>{formatCurrency(p.price)}</strong>
                {p.mrp && <span style={{ fontSize: 12, color: '#94A3B8', textDecoration: 'line-through' }}>{formatCurrency(p.mrp)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'bookings' && (
        <div>
          {bookings.length === 0 ? (
            <div style={styles.card}><p style={{ color: '#94A3B8', textAlign: 'center' }}>No bookings yet. Book a service above!</p></div>
          ) : (
            bookings.map((b) => (
              <div key={b._id} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{b.bookingId}</strong>
                  <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0' }}>{b.service?.name || 'Service'} — {b.acType}</p>
                  <p style={{ fontSize: 12, color: '#94A3B8' }}>{new Date(b.scheduledDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={styles.badge(statusColor[b.status] || 'yellow')}>{capitalize(b.status?.replace('_', ' '))}</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0EA5E9', marginTop: 8 }}>{formatCurrency(b.amount)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quick booking modal */}
      {bookingForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: 400 }}>
            <h3 style={styles.h3}>Book: {bookingForm.name}</h3>
            <label style={styles.label}>Preferred Date</label>
            <input style={styles.input} type="date" value={bookingForm.date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })} />
            <label style={styles.label}>Time Slot</label>
            <select style={styles.input} value={bookingForm.slot} onChange={(e) => setBookingForm({ ...bookingForm, slot: e.target.value })}>
              <option value="">Select slot</option>
              <option value="8:00 AM - 10:00 AM">8:00 AM – 10:00 AM</option>
              <option value="10:00 AM - 12:00 PM">10:00 AM – 12:00 PM</option>
              <option value="12:00 PM - 2:00 PM">12:00 PM – 2:00 PM</option>
              <option value="2:00 PM - 4:00 PM">2:00 PM – 4:00 PM</option>
              <option value="4:00 PM - 6:00 PM">4:00 PM – 6:00 PM</option>
            </select>
            <label style={styles.label}>AC Type</label>
            <select style={styles.input} value={bookingForm.acType} onChange={(e) => setBookingForm({ ...bookingForm, acType: e.target.value })}>
              <option value="split_ac">Split AC</option>
              <option value="window_ac">Window AC</option>
              <option value="cassette_ac">Cassette AC</option>
              <option value="tower_ac">Tower AC</option>
            </select>
            <label style={styles.label}>Issue Description</label>
            <input style={styles.input} value={bookingForm.issue} onChange={(e) => setBookingForm({ ...bookingForm, issue: e.target.value })} />
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button style={{ ...styles.btn, ...styles.btnPrimary, flex: 1 }} onClick={submitBooking} disabled={loading || !bookingForm.date || !bookingForm.slot}>
                {loading ? 'Booking…' : `Confirm — ${formatCurrency(bookingForm.price)}`}
              </button>
              <button style={{ ...styles.btn, background: '#F1F5F9', flex: 1 }} onClick={() => setBookingForm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [partners, setPartners] = useState([]);
  const [tab, setTab] = useState('overview');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    dashboardAPI.get().then((r) => setStats(r.data.stats)).catch(() => {});
    dashboardAPI.getRecent().then((r) => setRecent(r.data)).catch(() => {});
    adminAPI.listPartners({ approvalStatus: 'pending', limit: 10 }).then((r) => setPartners(r.data.data || [])).catch(() => {});
  }, []);

  const approve = async (id) => {
    try {
      await adminAPI.approvePartner(id);
      setMsg('✅ Partner approved!');
      setPartners((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Failed'}`);
    }
  };

  const reject = async (id) => {
    try {
      await adminAPI.rejectPartner(id, { reason: 'Does not meet requirements' });
      setMsg('Partner rejected');
      setPartners((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Failed'}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.h2}>Admin Dashboard</h2>
      <p style={{ color: '#64748B', marginBottom: 20 }}>Welcome, {user.name} — Role: <strong>{user.role}</strong></p>
      {msg && <div style={styles.alert(msg.startsWith('✅') ? 'success' : 'error')}>{msg}</div>}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['overview', 'partners', 'recent'].map((t) => (
          <button key={t} style={styles.tab(tab === t)} onClick={() => setTab(t)}>{capitalize(t)}</button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div style={styles.grid4}>
          {[
            { label: 'Total Bookings', value: stats.bookings?.total || 0 },
            { label: 'Pending Bookings', value: stats.bookings?.pending || 0 },
            { label: 'Total Revenue', value: formatCurrency(stats.revenue?.total) },
            { label: 'Active Partners', value: stats.partners?.active || 0 },
            { label: 'Total Users', value: stats.users?.total || 0 },
            { label: 'Pending Approvals', value: stats.partners?.pending || 0 },
            { label: 'Active AMC', value: stats.amc?.active || 0 },
            { label: 'Total Orders', value: stats.orders?.total || 0 },
          ].map((s) => (
            <div key={s.label} style={styles.statCard}>
              <div style={styles.statNum}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'partners' && (
        <div>
          <h3 style={styles.h3}>Pending Partner Approvals ({partners.length})</h3>
          {partners.length === 0 ? (
            <div style={styles.card}><p style={{ color: '#94A3B8', textAlign: 'center' }}>No pending approvals 🎉</p></div>
          ) : (
            partners.map((p) => (
              <div key={p._id} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{p.firstName} {p.lastName}</strong>
                  <p style={{ fontSize: 13, color: '#64748B' }}>📱 {p.phone} &nbsp;•&nbsp; {capitalize(p.partnerType)}</p>
                  <p style={{ fontSize: 12, color: '#94A3B8' }}>Registered: {new Date(p.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...styles.btn, ...styles.btnGreen, fontSize: 13 }} onClick={() => approve(p._id)}>Approve</button>
                  <button style={{ ...styles.btn, ...styles.btnDanger, fontSize: 13 }} onClick={() => reject(p._id)}>Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'recent' && recent && (
        <div>
          <h3 style={styles.h3}>Recent Bookings</h3>
          {(recent.recentBookings || []).map((b) => (
            <div key={b._id} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{b.bookingId}</strong>
                <p style={{ fontSize: 13, color: '#64748B' }}>{b.customer?.firstName} — {b.service?.name}</p>
              </div>
              <span style={styles.badge(b.status === 'completed' ? 'green' : b.status === 'cancelled' ? 'red' : 'blue')}>
                {capitalize(b.status?.replace('_', ' '))}
              </span>
            </div>
          ))}
          <h3 style={{ ...styles.h3, marginTop: 24 }}>New Users</h3>
          {(recent.recentUsers || []).map((u) => (
            <div key={u._id} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between' }}>
              <span>{u.firstName} {u.lastName} — {u.phone}</span>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Partner Dashboard ─────────────────────────────────────────────────────────
function PartnerDashboard({ user }) {
  const [jobs, setJobs] = useState([]);
  const [isOnline, setIsOnline] = useState(user.isOnline);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    bookingAPI.getJobs({ status: 'assigned' }).then((r) => setJobs(r.data.data || [])).catch(() => {});
  }, []);

  const toggle = async () => {
    try {
      const r = await partnerAuthAPI.toggleOnline();
      setIsOnline(r.data.isOnline);
      setMsg(`You are now ${r.data.isOnline ? 'online 🟢' : 'offline ⚫'}`);
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Failed'}`);
    }
  };

  const accept = async (id) => {
    try {
      await bookingAPI.acceptJob(id);
      setMsg('✅ Job accepted!');
      setJobs((j) => j.filter((x) => x._id !== id));
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Failed'}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ ...styles.h2, margin: 0 }}>Partner Dashboard</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={styles.badge(isOnline ? 'green' : 'red')}>{isOnline ? '🟢 Online' : '⚫ Offline'}</span>
          <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={toggle}>Toggle Status</button>
        </div>
      </div>
      <p style={{ color: '#64748B', marginBottom: 20 }}>Welcome, {user.firstName}! Manage your assigned jobs here.</p>
      {msg && <div style={styles.alert(msg.startsWith('✅') || msg.includes('online') ? 'success' : 'error')}>{msg}</div>}
      <h3 style={styles.h3}>Assigned Jobs ({jobs.length})</h3>
      {jobs.length === 0 ? (
        <div style={styles.card}><p style={{ color: '#94A3B8', textAlign: 'center' }}>No jobs assigned yet. Stay online to receive jobs!</p></div>
      ) : (
        jobs.map((j) => (
          <div key={j._id} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{j.bookingId}</strong>
              <p style={{ fontSize: 13, color: '#64748B' }}>{j.service?.name} — {j.acType}</p>
              <p style={{ fontSize: 12, color: '#94A3B8' }}>
                📍 {j.address?.city} &nbsp;•&nbsp; 🕐 {j.scheduledTimeSlot} &nbsp;•&nbsp;
                📅 {new Date(j.scheduledDate).toLocaleDateString('en-IN')}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 700, color: '#0EA5E9' }}>{formatCurrency(j.amount)}</p>
              <button style={{ ...styles.btn, ...styles.btnGreen, fontSize: 13, marginTop: 8 }} onClick={() => accept(j._id)}>Accept Job</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on load
  useEffect(() => {
    const token = getToken();
    const userType = getUserType();
    if (!token || !userType) {
      setLoading(false);
      return;
    }

    const meAPI = userType === 'admin' ? adminAuthAPI.getMe : userType === 'partner' ? partnerAuthAPI.getMe : authAPI.getMe;
    meAPI()
      .then((r) => {
        const data = r.data;
        const u = data.user || data.partner || data.admin;
        setUser({ ...u, userType });
      })
      .catch(() => {
        removeToken();
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = async () => {
    try {
      if (user?.userType === 'admin') await adminAuthAPI.logout();
      else if (user?.userType === 'partner') await partnerAuthAPI.logout();
      else await authAPI.logout();
    } catch {}
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F9FF' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40 }}>🌡️</div>
          <p style={{ color: '#0EA5E9', fontWeight: 600, marginTop: 12 }}>Loading Climexia…</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginForm onLogin={handleLogin} />;

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logo}>🌡️ Climexia</div>
        <nav style={styles.nav}>
          <span style={{ fontSize: 14, opacity: 0.9 }}>
            {user.firstName || user.name} &nbsp;
            <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>
              {capitalize(user.userType)}
            </span>
          </span>
          <button style={{ ...styles.btn, ...styles.btnWhite }} onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      {user.userType === 'customer' && <CustomerDashboard user={user} />}
      {user.userType === 'admin' && <AdminDashboard user={user} />}
      {user.userType === 'partner' && <PartnerDashboard user={user} />}
    </div>
  );
}