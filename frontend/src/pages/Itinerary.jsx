import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, AlertTriangle, CheckCircle2, ArrowRight, X, Zap, RefreshCw, Clock, MapPin, Tag, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function Itinerary() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Disruption flow state
  const [disruptionModal, setDisruptionModal] = useState(null); // item being disrupted
  const [disrupting, setDisrupting] = useState(false);
  const [replanModal, setReplanModal] = useState(false);
  const [replanning, setReplanning] = useState(false);
  const [replanResult, setReplanResult] = useState(null);

  useEffect(() => {
    loadItinerary();
  }, [id]);

  const loadItinerary = async () => {
    try {
      setLoading(true);
      const data = await api.getItinerary(id);
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisrupt = async (item) => {
    setDisrupting(true);
    try {
      await api.simulateDisruption(id, {
        itineraryItemId: item.id,
        reason: 'Provider cancelled the activity.'
      });
      setDisruptionModal(null);
      setReplanModal(true);
      await loadItinerary();
    } catch (err) {
      setError(err.message);
    } finally {
      setDisrupting(false);
    }
  };

  const handleReplan = async () => {
    setReplanning(true);
    try {
      const result = await api.replan(id);
      setReplanResult(result);
      setReplanModal(false);
      await loadItinerary();
    } catch (err) {
      setError(err.message);
    } finally {
      setReplanning(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg"></div>
        <p className="loading-text">Loading itinerary...</p>
      </div>
    );
  }

  // Group items by date
  const groupedByDate = {};
  items.forEach(item => {
    if (!groupedByDate[item.date]) groupedByDate[item.date] = [];
    groupedByDate[item.date].push(item);
  });

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'beaches': return '🏖️';
      case 'food': return '🍽️';
      case 'adventure': return '🤿';
      case 'sightseeing': return '🏛️';
      case 'leisure': return '🚢';
      default: return '📍';
    }
  };

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Map size={28} className="text-accent" /> Itinerary
        </h1>
        <p>Your planned activities timeline</p>
      </motion.div>

      {error && <div className="error-banner"><AlertTriangle size={16} /> {error}</div>}

      {Object.keys(groupedByDate).length === 0 ? (
        <div className="empty-state">
          <Map size={48} />
          <h3>No itinerary items</h3>
          <p>Create a trip to get started.</p>
        </div>
      ) : (
        Object.entries(groupedByDate).map(([date, dateItems]) => {
          const dateFormatted = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          });
          return (
            <div key={date} style={{ marginBottom: '2rem' }}>
              <h3 className="mb-2" style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {dateFormatted}
              </h3>
              <div className="timeline">
                {dateItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    className="timeline-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className={`timeline-dot ${item.status === 'cancelled' ? 'cancelled' : item.status === 'replaced' ? 'replaced' : ''}`} />
                    <div className="timeline-time">{item.startTime} — {item.endTime}</div>
                    <div className={`timeline-card ${item.status === 'cancelled' ? 'cancelled' : ''} ${item.replacedBy ? '' : ''}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>{getCategoryIcon(item.activityCategory)}</span>
                            <h4 style={{ textDecoration: item.status === 'cancelled' ? 'line-through' : 'none' }}>
                              {item.activityName}
                            </h4>
                            {item.status === 'cancelled' && (
                              <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Cancelled</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <MapPin size={12} /> {item.activityLocation}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Tag size={12} /> {item.activityCategory}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={12} /> {item.activityDurationMinutes}min
                            </span>
                          </div>
                          {item.activityDescription && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                              {item.activityDescription}
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            ₹{item.activityPrice.toLocaleString()}
                          </div>
                          {item.status === 'active' && item.activityCategory === 'adventure' && (
                            <button
                              id={`disrupt-btn-${item.id}`}
                              className="btn btn-danger btn-sm mt-1"
                              onClick={() => setDisruptionModal(item)}
                              style={{ fontSize: '0.7rem', padding: '0.35rem 0.6rem' }}
                            >
                              <Zap size={12} /> Simulate Disruption
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Replan Result */}
      <AnimatePresence>
        {replanResult && replanResult.success && (
          <motion.div
            className="replan-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h3 style={{ marginBottom: '0.5rem' }}>🔄 Itinerary Updated</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>{replanResult.message}</p>
            <div className="replan-arrow">
              <div className="replan-old">{replanResult.cancelledActivity}</div>
              <ArrowRight size={24} color="var(--accent-primary)" />
              <div className="replan-new">{replanResult.replacementActivity}</div>
            </div>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Why this replacement?</h4>
            <ul className="replan-reasons">
              {replanResult.reasons && replanResult.reasons.map((reason, i) => (
                <li key={i}>
                  <CheckCircle2 size={16} /> {reason}
                </li>
              ))}
            </ul>
            <button className="btn btn-secondary btn-sm mt-2" onClick={() => setReplanResult(null)}>
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disruption Confirmation Modal */}
      <AnimatePresence>
        {disruptionModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !disrupting && setDisruptionModal(null)}
          >
            <motion.div
              className="modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-icon warning">
                <AlertTriangle size={28} />
              </div>
              <h3 className="modal-title">⚠ Activity Disruption</h3>
              <div className="modal-body">
                <p><strong>{disruptionModal.activityName}</strong> is no longer available.</p>
                <p className="mt-1" style={{ fontSize: '0.85rem' }}>
                  <strong>Reason:</strong> Provider cancelled the activity.
                </p>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setDisruptionModal(null)} disabled={disrupting}>
                  Cancel
                </button>
                <button
                  id="confirm-disruption-btn"
                  className="btn btn-danger"
                  onClick={() => handleDisrupt(disruptionModal)}
                  disabled={disrupting}
                >
                  {disrupting ? <><Loader2 size={16} className="spinner" /> Disrupting...</> : <><Zap size={16} /> Confirm Disruption</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replan Modal */}
      <AnimatePresence>
        {replanModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-icon warning">
                <AlertTriangle size={28} />
              </div>
              <h3 className="modal-title">Disruption Detected</h3>
              <div className="modal-body">
                <p>An activity in your itinerary has been cancelled by the provider.</p>
                <p className="mt-1">TravelPilot can find a replacement that matches your interests, fits your budget, and works with your schedule.</p>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setReplanModal(false)} disabled={replanning}>
                  Dismiss
                </button>
                <button
                  id="replan-btn"
                  className="btn btn-primary"
                  onClick={handleReplan}
                  disabled={replanning}
                >
                  {replanning ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Replanning...</>
                  ) : (
                    <><RefreshCw size={16} /> Let TravelPilot Replan</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
