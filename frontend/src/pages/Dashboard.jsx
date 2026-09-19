import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ShieldCheck, Wallet, Bot, Map, ScrollText, MessageCircle, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const data = await api.getTrip(id);
      setTrip(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg"></div>
        <p className="loading-text">Loading trip details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <div className="error-banner">
          <AlertTriangle size={18} />
          {error}
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const budgetPercent = trip.budget > 0 ? Math.min((trip.budgetUsed / trip.budget) * 100, 100) : 0;
  const startFormatted = new Date(trip.startDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const endFormatted = new Date(trip.endDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const statusConfig = {
    validated: { label: 'Validated', badge: 'badge-success', icon: <ShieldCheck size={16} /> },
    disrupted: { label: 'Disrupted', badge: 'badge-danger', icon: <AlertTriangle size={16} /> },
    active: { label: 'Active', badge: 'badge-active', icon: <Bot size={16} /> },
  };

  const status = statusConfig[trip.status] || statusConfig.active;

  return (
    <div>
      {/* Hero Header */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <MapPin size={20} className="text-accent" />
          <h1>{trip.destination.toUpperCase()}</h1>
          <span className={`badge ${status.badge}`}>
            {status.icon} {status.label}
          </span>
        </div>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={15} />
          {startFormatted} — {endFormatted}
        </p>
      </motion.div>

      {/* Status Cards */}
      <div className="card-grid" style={{ marginBottom: '2rem' }}>
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-header">
            <span className="card-title">Trip Health</span>
            <ShieldCheck size={20} className="text-success" />
          </div>
          <div className="card-value text-success">
            {trip.status === 'validated' ? '✓ Validated' : trip.status === 'disrupted' ? '⚠ Disrupted' : '● Active'}
          </div>
          <p className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
            {trip.status === 'validated' ? 'All constraints satisfied' : trip.status === 'disrupted' ? 'Action required' : 'Being monitored'}
          </p>
        </motion.div>

        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-header">
            <span className="card-title">Budget</span>
            <Wallet size={20} className="text-accent" />
          </div>
          <div className="card-value">
            ₹{trip.budgetUsed.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ ₹{trip.budget.toLocaleString()}</span>
          </div>
          <div className="budget-bar">
            <div
              className={`budget-bar-fill ${budgetPercent > 80 ? 'warning' : ''}`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <span className="card-title">Agent</span>
            <Bot size={20} className="text-accent" />
          </div>
          <div className="card-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge-dot" style={{ background: 'var(--success)', width: 8, height: 8, borderRadius: '50%', animation: 'pulse-dot 2s ease-in-out infinite' }}></span>
            Monitoring
          </div>
          <p className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>Watching for disruptions</p>
        </motion.div>
      </div>

      {/* Quick Links */}
      <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
      <div className="card-grid">
        <Link to={`/trip/${id}/itinerary`} style={{ textDecoration: 'none' }}>
          <motion.div className="card" whileHover={{ scale: 1.02 }} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="agent-icon" style={{ width: 40, height: 40, background: 'rgba(0, 212, 255, 0.15)', borderRadius: 10 }}>
                <Map size={20} color="var(--accent-primary)" />
              </div>
              <div>
                <h4>Itinerary</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>View & manage activities</p>
              </div>
            </div>
          </motion.div>
        </Link>

        <Link to={`/trip/${id}/agent`} style={{ textDecoration: 'none' }}>
          <motion.div className="card" whileHover={{ scale: 1.02 }} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="agent-icon" style={{ width: 40, height: 40, background: 'rgba(124, 58, 237, 0.15)', borderRadius: 10 }}>
                <Bot size={20} color="#a78bfa" />
              </div>
              <div>
                <h4>Agent Activity</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>See what TravelPilot is doing</p>
              </div>
            </div>
          </motion.div>
        </Link>

        <Link to={`/trip/${id}/events`} style={{ textDecoration: 'none' }}>
          <motion.div className="card" whileHover={{ scale: 1.02 }} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="agent-icon" style={{ width: 40, height: 40, background: 'rgba(245, 158, 11, 0.15)', borderRadius: 10 }}>
                <ScrollText size={20} color="var(--warning)" />
              </div>
              <div>
                <h4>Event Log</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Full agent event history</p>
              </div>
            </div>
          </motion.div>
        </Link>

        <Link to={`/trip/${id}/chat`} style={{ textDecoration: 'none' }}>
          <motion.div className="card" whileHover={{ scale: 1.02 }} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="agent-icon" style={{ width: 40, height: 40, background: 'rgba(16, 185, 129, 0.15)', borderRadius: 10 }}>
                <MessageCircle size={20} color="var(--success)" />
              </div>
              <div>
                <h4>Ask TravelPilot</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Chat with your AI assistant</p>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Interests */}
      <div className="mt-3">
        <h4 className="mb-1">Interests</h4>
        <div className="interest-tags">
          {trip.interests.map(interest => (
            <span key={interest} className="interest-tag selected">{interest}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
