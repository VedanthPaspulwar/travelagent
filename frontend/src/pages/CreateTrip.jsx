import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, MapPin, Calendar, Wallet, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const INTEREST_OPTIONS = [
  'beaches', 'food', 'adventure', 'sightseeing', 'culture',
  'nightlife', 'shopping', 'wellness', 'nature', 'history'
];

const PLANNING_STEPS = [
  'Understanding preferences',
  'Building itinerary',
  'Checking budget',
  'Validating schedule',
  'Trip ready'
];

export default function CreateTrip() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    interests: []
  });
  const [planning, setPlanning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [error, setError] = useState(null);

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPlanning(true);

    try {
      // Animate through planning steps
      for (let i = 0; i < PLANNING_STEPS.length - 1; i++) {
        setCurrentStep(i);
        await new Promise(r => setTimeout(r, 800));
      }

      const response = await api.createTrip({
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        budget: parseFloat(form.budget),
        interests: form.interests
      });

      setCurrentStep(PLANNING_STEPS.length - 1);
      await new Promise(r => setTimeout(r, 600));

      navigate(`/trip/${response.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create trip. Make sure the backend is running.');
      setPlanning(false);
      setCurrentStep(-1);
    }
  };

  if (planning) {
    return (
      <div className="loading-screen">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="agent-icon" style={{ width: 64, height: 64, margin: '0 auto' }}>
            <Plane size={28} color="white" />
          </div>
        </motion.div>
        <h2>Planning Your Trip</h2>
        <p className="text-muted">TravelPilot is building your perfect itinerary...</p>
        <div className="planning-steps">
          {PLANNING_STEPS.map((step, i) => (
            <motion.div
              key={step}
              className={`planning-step ${i <= currentStep ? 'done' : i === currentStep + 1 ? 'active' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              {i <= currentStep ? (
                <CheckCircle2 size={18} />
              ) : i === currentStep + 1 ? (
                <Loader2 size={18} className="spinner" style={{ border: 'none', animation: 'spin 1s linear infinite' }} />
              ) : (
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--text-muted)' }} />
              )}
              {step}
            </motion.div>
          ))}
        </div>
        {error && <div className="error-banner">{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="agent-icon" style={{ width: 56, height: 56, margin: '0 auto 1rem' }}>
            <Sparkles size={24} color="white" />
          </div>
          <h1>Plan Your Trip</h1>
          <p className="text-muted mt-1">Let TravelPilot's AI create and manage your perfect itinerary.</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">
                <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                Destination
              </label>
              <input
                id="destination-input"
                type="text"
                className="form-input"
                placeholder="e.g. Goa"
                value={form.destination}
                onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Start Date
                </label>
                <input
                  id="start-date-input"
                  type="date"
                  className="form-input"
                  value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  End Date
                </label>
                <input
                  id="end-date-input"
                  type="date"
                  className="form-input"
                  value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Wallet size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                Budget (₹)
              </label>
              <input
                id="budget-input"
                type="number"
                className="form-input"
                placeholder="e.g. 20000"
                value={form.budget}
                onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Interests</label>
              <div className="interest-tags">
                {INTEREST_OPTIONS.map(interest => (
                  <span
                    key={interest}
                    className={`interest-tag ${form.interests.includes(interest) ? 'selected' : ''}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            id="create-trip-btn"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={!form.destination || !form.startDate || !form.endDate || !form.budget || form.interests.length === 0}
          >
            Create My Trip <Plane size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
