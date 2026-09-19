import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScrollText, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const EVENT_TYPE_CLASSES = {
  PLAN_CREATED: 'plan-created',
  PLAN_VALIDATED: 'plan-validated',
  DISRUPTION_DETECTED: 'disruption-detected',
  ALTERNATIVES_SEARCHED: 'alternatives-searched',
  CONSTRAINTS_CHECKED: 'constraints-checked',
  PLAN_UPDATED: 'plan-updated',
  REPLAN_FAILED: 'replan-failed',
};

const EVENT_TYPE_LABELS = {
  PLAN_CREATED: 'PLAN CREATED',
  PLAN_VALIDATED: 'PLAN VALIDATED',
  DISRUPTION_DETECTED: 'DISRUPTION DETECTED',
  ALTERNATIVES_SEARCHED: 'ALTERNATIVES SEARCHED',
  CONSTRAINTS_CHECKED: 'CONSTRAINTS CHECKED',
  PLAN_UPDATED: 'PLAN UPDATED',
  REPLAN_FAILED: 'REPLAN FAILED',
};

export default function EventLog() {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const loadEvents = async () => {
    try {
      const data = await api.getEvents(id);
      setEvents(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return dateStr.substring(11, 16);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg"></div>
        <p className="loading-text">Loading events...</p>
      </div>
    );
  }

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ScrollText size={28} className="text-accent" /> Event Log
        </h1>
        <p>Complete agent event history</p>
      </motion.div>

      {error && <div className="error-banner"><AlertTriangle size={16} /> {error}</div>}

      {events.length === 0 ? (
        <div className="empty-state">
          <ScrollText size={48} />
          <h3>No events yet</h3>
          <p>Events will appear as TravelPilot manages your trip.</p>
        </div>
      ) : (
        <div className="card">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              className="event-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="event-time">{formatTime(event.createdAt)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className={`event-type ${EVENT_TYPE_CLASSES[event.eventType] || ''}`}>
                    {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                  </span>
                </div>
                <div className="event-message">{event.message}</div>
                {event.metadata && (() => {
                  try {
                    const meta = JSON.parse(event.metadata);
                    if (event.eventType === 'CONSTRAINTS_CHECKED') {
                      return (
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                          <span className="text-success">Budget ✓</span>
                          <span className="text-success">Schedule ✓</span>
                          <span className="text-success">Interest ✓</span>
                        </div>
                      );
                    }
                    if (event.eventType === 'PLAN_UPDATED' && meta.reasons) {
                      return (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {meta.replacedActivity} → {meta.newActivity}
                        </div>
                      );
                    }
                  } catch { return null; }
                  return null;
                })()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
