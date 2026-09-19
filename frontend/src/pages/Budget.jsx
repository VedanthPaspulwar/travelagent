import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, AlertTriangle, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

export default function Budget() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripData, itineraryData] = await Promise.all([
        api.getTrip(id),
        api.getItinerary(id)
      ]);
      setTrip(tripData);
      setItems(itineraryData.filter(i => i.status === 'active'));
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
        <p className="loading-text">Loading budget...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-banner"><AlertTriangle size={16} /> {error}</div>;
  }

  if (!trip) return null;

  const remaining = trip.budget - trip.budgetUsed;
  const budgetPercent = trip.budget > 0 ? (trip.budgetUsed / trip.budget) * 100 : 0;

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wallet size={28} className="text-accent" /> Budget
        </h1>
        <p>Track your trip spending</p>
      </motion.div>

      {/* Budget Overview */}
      <div className="card-grid" style={{ marginBottom: '2rem' }}>
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="card-title">Total Budget</div>
          <div className="card-value" style={{ color: 'var(--accent-primary)' }}>₹{trip.budget.toLocaleString()}</div>
        </motion.div>
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card-title">Spent</div>
          <div className="card-value">₹{trip.budgetUsed.toLocaleString()}</div>
          <div className="budget-bar mt-1">
            <div className={`budget-bar-fill ${budgetPercent > 80 ? 'warning' : ''}`} style={{ width: `${Math.min(budgetPercent, 100)}%` }} />
          </div>
          <p className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>{budgetPercent.toFixed(0)}% used</p>
        </motion.div>
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="card-title">Remaining</div>
          <div className="card-value text-success">₹{remaining.toLocaleString()}</div>
          <p className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
            <TrendingUp size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Available for activities
          </p>
        </motion.div>
      </div>

      {/* Cost Breakdown */}
      <h3 className="mb-2">Cost Breakdown</h3>
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Activity</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Date</th>
              <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                style={{ borderBottom: '1px solid var(--border-color)' }}
              >
                <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{item.activityName}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>{item.activityCategory}</span>
                </td>
                <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.date}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {item.activityPrice === 0 ? (
                    <span className="text-success">Free</span>
                  ) : (
                    `₹${item.activityPrice.toLocaleString()}`
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={{ padding: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>Total</td>
              <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-primary)' }}>
                ₹{trip.budgetUsed.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
