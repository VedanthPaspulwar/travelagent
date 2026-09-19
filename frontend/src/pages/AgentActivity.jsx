import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, CheckCircle2, Loader2, AlertTriangle, Search, Shield, RefreshCw, Eye } from 'lucide-react';
import { api } from '../services/api';

const STEP_ICONS = {
  PLAN_CREATED: <CheckCircle2 size={16} />,
  PLAN_VALIDATED: <Shield size={16} />,
  DISRUPTION_DETECTED: <AlertTriangle size={16} />,
  ALTERNATIVES_SEARCHED: <Search size={16} />,
  CONSTRAINTS_CHECKED: <Shield size={16} />,
  PLAN_UPDATED: <RefreshCw size={16} />,
  REPLAN_FAILED: <AlertTriangle size={16} />,
};

const STEP_LABELS = {
  PLAN_CREATED: 'Itinerary generated',
  PLAN_VALIDATED: 'Plan validated',
  DISRUPTION_DETECTED: 'Disruption detected',
  ALTERNATIVES_SEARCHED: 'Searching alternatives',
  CONSTRAINTS_CHECKED: 'Constraints checked',
  PLAN_UPDATED: 'Itinerary updated',
  REPLAN_FAILED: 'Replan failed',
};

export default function AgentActivity() {
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

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg"></div>
        <p className="loading-text">Loading agent activity...</p>
      </div>
    );
  }

  // Determine monitoring status
  const hasDisruption = events.some(e => e.eventType === 'DISRUPTION_DETECTED');
  const hasReplan = events.some(e => e.eventType === 'PLAN_UPDATED');
  const lastEvent = events[events.length - 1];
  const isMonitoring = lastEvent?.eventType === 'PLAN_VALIDATED' || !hasDisruption;

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={28} className="text-accent" /> Agent Activity
        </h1>
        <p>What TravelPilot is doing for your trip</p>
      </motion.div>

      {error && <div className="error-banner"><AlertTriangle size={16} /> {error}</div>}

      <motion.div
        className="agent-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="agent-header">
          <div className="agent-icon">
            <Bot size={22} color="white" />
          </div>
          <div>
            <h3>TravelPilot Agent</h3>
            <div className="agent-status" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge-dot" style={{ background: 'var(--success)' }}></span>
              {isMonitoring ? 'Monitoring your trip' : 'Processing...'}
            </div>
          </div>
        </div>

        <div className="agent-steps">
          {/* Initial planning steps */}
          <AgentStep
            icon={<CheckCircle2 size={16} />}
            label="Trip preferences understood"
            completed={events.length > 0}
            delay={0}
          />
          <AgentStep
            icon={<CheckCircle2 size={16} />}
            label="Itinerary generated"
            completed={events.some(e => e.eventType === 'PLAN_CREATED')}
            delay={0.05}
          />
          <AgentStep
            icon={<Shield size={16} />}
            label="Budget validated"
            completed={events.some(e => e.eventType === 'PLAN_VALIDATED')}
            delay={0.1}
          />
          <AgentStep
            icon={<Shield size={16} />}
            label="Schedule validated"
            completed={events.some(e => e.eventType === 'PLAN_VALIDATED')}
            delay={0.15}
          />

          {!hasDisruption && (
            <AgentStep
              icon={<Eye size={16} />}
              label="Monitoring for disruptions"
              completed={false}
              active={true}
              delay={0.2}
            />
          )}

          {/* Disruption steps */}
          {hasDisruption && (
            <>
              <div style={{ height: 8 }} />
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--warning)', padding: '0 0.875rem' }}>
                Replanning
              </div>
              <AgentStep
                icon={<AlertTriangle size={16} />}
                label="Disruption detected"
                completed={true}
                danger={true}
                delay={0.25}
              />
              <AgentStep
                icon={<Search size={16} />}
                label="Searching alternatives"
                completed={events.some(e => e.eventType === 'ALTERNATIVES_SEARCHED')}
                delay={0.3}
              />
              <AgentStep
                icon={<Shield size={16} />}
                label="Checking budget"
                completed={events.some(e => e.eventType === 'CONSTRAINTS_CHECKED')}
                delay={0.35}
              />
              <AgentStep
                icon={<Shield size={16} />}
                label="Checking schedule"
                completed={events.some(e => e.eventType === 'CONSTRAINTS_CHECKED')}
                delay={0.4}
              />
              <AgentStep
                icon={<Shield size={16} />}
                label="Checking interests"
                completed={events.some(e => e.eventType === 'CONSTRAINTS_CHECKED')}
                delay={0.45}
              />
              <AgentStep
                icon={<RefreshCw size={16} />}
                label="Updating itinerary"
                completed={hasReplan}
                delay={0.5}
              />
              {hasReplan && (
                <AgentStep
                  icon={<Shield size={16} />}
                  label="Updated plan validated"
                  completed={events.filter(e => e.eventType === 'PLAN_VALIDATED').length > 1}
                  delay={0.55}
                />
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function AgentStep({ icon, label, completed, active, danger, delay }) {
  return (
    <motion.div
      className={`agent-step ${completed ? 'completed' : active ? 'active' : 'pending'}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      style={danger && completed ? { background: 'var(--danger-bg)', color: 'var(--danger)' } : {}}
    >
      {completed ? (
        danger ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />
      ) : active ? (
        <Loader2 size={16} style={{ animation: 'spin 1.5s linear infinite' }} />
      ) : (
        <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid currentColor', opacity: 0.4 }} />
      )}
      {label}
    </motion.div>
  );
}
