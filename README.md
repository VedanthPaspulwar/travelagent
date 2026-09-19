# TravelPilot — Agentic AI Travel Planner

> **Your trip. Managed by AI.**

TravelPilot is an agentic AI travel planner that doesn't just generate an itinerary — it **plans, monitors, and adapts** your trip in real-time.

## 🚀 Key Demo Flow

```
USER CREATES GOA TRIP → AI CREATES ITINERARY → ITINERARY VALIDATED
        → SCUBA DIVING GETS CANCELLED → AGENT DETECTS DISRUPTION
        → AGENT SEARCHES ALTERNATIVES → AGENT CHECKS CONSTRAINTS
        → AGENT SELECTS KAYAKING → ITINERARY UPDATED → VALIDATED ✓
```

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.x, Maven |
| Database | SQLite (JDBC) |
| Frontend | React 19, Vite, JavaScript/JSX |
| Styling | Vanilla CSS (dark mode, glassmorphism) |
| Icons | Lucide React |
| Animations | Framer Motion |

## 📁 Project Structure

```
travelpilot/
├── backend/              # Spring Boot Java backend
│   ├── pom.xml
│   └── src/main/java/com/travelpilot/
│       ├── TravelPilotApplication.java
│       ├── agent/        # 4 Agent classes
│       ├── config/       # CORS, Database init
│       ├── controller/   # REST controllers
│       ├── dto/          # Request/Response DTOs
│       ├── model/        # Domain entities
│       ├── repository/   # JDBC repositories
│       └── service/      # Business logic
├── frontend/             # React Vite frontend
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # 7 page components
│       └── services/     # API client
├── database/
│   └── schema.sql        # SQLite schema + seed data
└── README.md
```

## 🔧 Setup & Run

### Prerequisites
- **Java 17+**: `winget install Microsoft.OpenJDK.17`
- **Maven 3.8+**: `winget install Apache.Maven`
- **Node.js 18+**: Already installed

### Backend

```bash
cd travelpilot/backend

# Build
mvn clean package -DskipTests

# Run (starts on port 8000)
mvn spring-boot:run
```

### Frontend

```bash
cd travelpilot/frontend

# Install dependencies
npm install

# Run dev server (starts on port 5173)
npm run dev
```

Then open **http://localhost:5173** in your browser.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/trips` | Create a new trip |
| GET | `/api/trips/{id}` | Get trip details |
| GET | `/api/trips/{id}/itinerary` | Get itinerary items |
| GET | `/api/trips/{id}/events` | Get event log |
| POST | `/api/trips/{id}/disruptions` | Simulate disruption |
| POST | `/api/trips/{id}/replan` | Trigger AI replanning |
| POST | `/api/chat` | AI chat |
| GET | `/api/activities` | List all activities |

## 🗄️ Database Schema

### trips
Trip metadata: destination, dates, budget, interests.

### activities
Activity catalog: 9 pre-seeded Goa activities with pricing, hours, and categories.

### itinerary_items
Scheduled activities linked to trips with status tracking (`active`/`cancelled`).

### events
Agent event log tracking the full lifecycle: PLAN_CREATED → PLAN_VALIDATED → DISRUPTION_DETECTED → ALTERNATIVES_SEARCHED → CONSTRAINTS_CHECKED → PLAN_UPDATED → PLAN_VALIDATED.

## 🤖 Agent Architecture

| Agent | Responsibility |
|-------|---------------|
| **TripPlannerAgent** | Creates initial itinerary from preferences |
| **TripValidatorAgent** | Validates budget, schedule, availability |
| **TripMonitorAgent** | Detects disruptions and cancellations |
| **TripReplannerAgent** | Finds alternatives, checks constraints, replaces activities |

## 🎯 Demo Instructions

### Quick Demo (Pre-seeded)
1. Start the backend — it auto-seeds a Goa trip (ID: 1)
2. Start the frontend
3. Navigate to `http://localhost:5173/trip/1`
4. Go to **Itinerary** → Click **"Simulate Disruption"** on Scuba Diving
5. Confirm the disruption
6. Click **"Let TravelPilot Replan"**
7. Watch the agent replace Scuba Diving with Kayaking
8. Check **Agent Activity** and **Event Log** for the full audit trail

### Create a New Trip
1. Go to `http://localhost:5173`
2. Enter: Goa, Oct 10-13 2026, ₹20,000, select interests
3. Click "Create My Trip →"
4. Watch the animated planning flow

## 🔑 Environment Variables

### Backend
```properties
# Optional LLM API key (in application.properties)
travelpilot.llm.api-key=YOUR_KEY
travelpilot.llm.api-url=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
travelpilot.llm.provider=gemini
```

### Frontend
```
VITE_API_BASE_URL=http://localhost:8000/api
```

## 🔍 Troubleshooting

| Issue | Solution |
|-------|---------|
| Backend won't start | Check Java 17+ is installed: `java -version` |
| CORS errors | Backend allows localhost:5173 by default |
| Database errors | Delete `travelpilot.db` and restart backend |
| Frontend can't connect | Ensure backend runs on port 8000 |
| Chat not working | Normal — uses deterministic fallback without LLM key |
| Maven not found | Install via `winget install Apache.Maven` or use `./mvnw` |

## 📝 License

Built for hackathon demonstration purposes.
