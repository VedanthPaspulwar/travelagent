import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Bot, User, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function Chat() {
  const { id } = useParams();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm TravelPilot, your AI travel assistant. I'm managing your trip and can answer questions about your itinerary, budget, activities, and more. How can I help?",
      source: 'system'
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setSending(true);
    setError(null);

    try {
      const response = await api.chat({ tripId: parseInt(id), message: userMessage });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.reply,
        source: response.source
      }]);
    } catch (err) {
      setError('Failed to get response. Make sure the backend is running.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check that the backend is running and try again.",
        source: 'error'
      }]);
    } finally {
      setSending(false);
    }
  };

  const suggestions = [
    "What's my remaining budget?",
    "Can I add another adventure activity?",
    "What's the weather like?",
    "Tell me about local food",
    "What's in my itinerary?"
  ];

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageCircle size={28} className="text-accent" /> Ask TravelPilot
        </h1>
        <p>Chat with your AI travel assistant</p>
      </motion.div>

      <div className="card chat-container">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`chat-message ${msg.role}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontSize: '0.75rem', opacity: 0.7 }}>
                {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                {msg.role === 'assistant' ? 'TravelPilot' : 'You'}
                {msg.source && msg.source !== 'system' && msg.source !== 'error' && (
                  <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>({msg.source})</span>
                )}
              </div>
              {msg.content}
            </motion.div>
          ))}

          {sending && (
            <div className="chat-message assistant" style={{ opacity: 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={14} />
                <div className="spinner" style={{ width: 14, height: 14 }}></div>
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length <= 2 && (
          <div style={{ padding: '0.5rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {suggestions.map(s => (
              <button
                key={s}
                className="interest-tag"
                onClick={() => {
                  setInput(s);
                }}
                style={{ cursor: 'pointer', fontSize: '0.75rem' }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="error-banner" style={{ margin: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            id="chat-input"
            type="text"
            className="form-input"
            placeholder="Ask anything about your trip..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={sending}
          />
          <button
            id="chat-send-btn"
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || sending}
            style={{ padding: '0.75rem' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
