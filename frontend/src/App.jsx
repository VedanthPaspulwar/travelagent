import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CreateTrip from './pages/CreateTrip';
import Dashboard from './pages/Dashboard';
import Itinerary from './pages/Itinerary';
import AgentActivity from './pages/AgentActivity';
import EventLog from './pages/EventLog';
import Budget from './pages/Budget';
import Chat from './pages/Chat';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<CreateTrip />} />
          <Route path="/trip/:id" element={<Dashboard />} />
          <Route path="/trip/:id/itinerary" element={<Itinerary />} />
          <Route path="/trip/:id/agent" element={<AgentActivity />} />
          <Route path="/trip/:id/events" element={<EventLog />} />
          <Route path="/trip/:id/budget" element={<Budget />} />
          <Route path="/trip/:id/chat" element={<Chat />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
