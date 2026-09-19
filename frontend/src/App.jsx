import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import Navbar from './components/Navbar';
import CreateTrip from './pages/CreateTrip';
import Dashboard from './pages/Dashboard';
import Itinerary from './pages/Itinerary';
import AgentActivity from './pages/AgentActivity';
import EventLog from './pages/EventLog';
import Budget from './pages/Budget';
import Chat from './pages/Chat';
import Login from './pages/Login';

const BASENAME = import.meta.env.BASE_URL.replace(/\/+$/, '') || '';

function AppRoutes() {
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Navbar />}

      <main className={isLoginPage ? '' : 'main-content'}>
        <Routes>

          {/* Default page */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          {/* Login */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* Create Trip */}
          <Route
            path="/create-trip"
            element={<CreateTrip />}
          />

          {/* Trip Dashboard */}
          <Route
            path="/trip/:id"
            element={<Dashboard />}
          />

          {/* Itinerary */}
          <Route
            path="/trip/:id/itinerary"
            element={<Itinerary />}
          />

          {/* Agent Activity */}
          <Route
            path="/trip/:id/agent"
            element={<AgentActivity />}
          />

          {/* Event Log */}
          <Route
            path="/trip/:id/events"
            element={<EventLog />}
          />

          {/* Budget */}
          <Route
            path="/trip/:id/budget"
            element={<Budget />}
          />

          {/* Chat */}
          <Route
            path="/trip/:id/chat"
            element={<Chat />}
          />

          {/* Unknown URL → Login */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />

        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <AppRoutes />
    </BrowserRouter>
  );
}