import { Link, useLocation, useParams } from 'react-router-dom';
import { Compass, LayoutDashboard, Map, Bot, ScrollText, Wallet, MessageCircle } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const params = useParams();

  // Try to extract trip ID from the URL
  const tripIdMatch = location.pathname.match(/\/trip\/(\d+)/);
  const tripId = tripIdMatch ? tripIdMatch[1] : null;

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">
            <Compass size={20} />
          </div>
          <div>
            <div className="navbar-title">TravelPilot</div>
            <div className="navbar-tagline">Your trip. Managed by AI.</div>
          </div>
        </Link>

        {tripId && (
          <ul className="navbar-nav">
            <li>
              <Link to={`/trip/${tripId}`} className={isActive(`/trip/${tripId}`)}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            </li>
            <li>
              <Link to={`/trip/${tripId}/itinerary`} className={isActive(`/trip/${tripId}/itinerary`)}>
                <Map size={16} /> Itinerary
              </Link>
            </li>
            <li>
              <Link to={`/trip/${tripId}/agent`} className={isActive(`/trip/${tripId}/agent`)}>
                <Bot size={16} /> Agent
              </Link>
            </li>
            <li>
              <Link to={`/trip/${tripId}/events`} className={isActive(`/trip/${tripId}/events`)}>
                <ScrollText size={16} /> Events
              </Link>
            </li>
            <li>
              <Link to={`/trip/${tripId}/budget`} className={isActive(`/trip/${tripId}/budget`)}>
                <Wallet size={16} /> Budget
              </Link>
            </li>
            <li>
              <Link to={`/trip/${tripId}/chat`} className={isActive(`/trip/${tripId}/chat`)}>
                <MessageCircle size={16} /> Chat
              </Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}
