import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

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

      <Routes>
        {/* First page = Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Main application */}
        <Route
          path="/trip/:id"
          element={
            <>
              <Navbar />
              <main className="main-content">
                <Dashboard />
              </main>
            </>
          }
        />

        <Route
          path="/trip/:id/itinerary"
          element={
            <>
              <Navbar />
              <main className="main-content">
                <Itinerary />
              </main>
            </>
          }
        />

        <Route
          path="/trip/:id/agent"
          element={
            <>
              <Navbar />
              <main className="main-content">
                <AgentActivity />
              </main>
            </>
          }
        />

        <Route
          path="/trip/:id/events"
          element={
            <>
              <Navbar />
              <main className="main-content">
                <EventLog />
              </main>
            </>
          }
        />

        <Route
          path="/trip/:id/budget"
          element={
            <>
              <Navbar />
              <main className="main-content">
                <Budget />
              </main>
            </>
          }
        />

        <Route
          path="/trip/:id/chat"
          element={
            <>
              <Navbar />
              <main className="main-content">
                <Chat />
              </main>
            </>
          }
        />

        {/* Unknown URL */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
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