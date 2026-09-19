-- ============================================
-- TravelPilot Database Schema (SQLite)
-- ============================================

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    destination TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    budget REAL NOT NULL,
    interests TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Activities catalog
CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    available INTEGER NOT NULL DEFAULT 1,
    open_time TEXT,
    close_time TEXT
);

-- Itinerary items linking trips to activities
CREATE TABLE IF NOT EXISTS itinerary_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    replaced_by INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (trip_id) REFERENCES trips(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    FOREIGN KEY (replaced_by) REFERENCES itinerary_items(id)
);

-- Agent events log
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (trip_id) REFERENCES trips(id)
);

-- ============================================
-- Seed: Goa Activities
-- ============================================

INSERT OR IGNORE INTO activities (id, name, location, category, description, price, duration_minutes, available, open_time, close_time) VALUES
(1, 'Baga Beach', 'North Goa', 'beaches', 'One of Goa''s most popular beaches with golden sands, water sports, and vibrant shacks lining the shore.', 0, 180, 1, '06:00', '19:00'),
(2, 'Fort Aguada', 'Sinquerim, North Goa', 'sightseeing', 'A well-preserved 17th-century Portuguese fort offering panoramic views of the Arabian Sea.', 100, 120, 1, '08:00', '17:30'),
(3, 'Goan Thali Lunch', 'Panjim, Goa', 'food', 'Authentic Goan thali with fish curry, rice, kokum sol kadi, and traditional sides at a heritage restaurant.', 500, 90, 1, '12:00', '15:00'),
(4, 'Scuba Diving', 'Grande Island, Goa', 'adventure', 'Explore underwater coral reefs and marine life with certified instructors at Grande Island.', 3500, 180, 1, '08:00', '16:00'),
(5, 'Kayaking', 'Palolem, South Goa', 'adventure', 'Paddle through serene backwaters and mangrove forests on a guided kayaking adventure.', 1500, 120, 1, '07:00', '17:00'),
(6, 'Sunset Cruise', 'Mandovi River, Panjim', 'leisure', 'Scenic cruise along the Mandovi River with live music, snacks, and a spectacular sunset.', 1200, 120, 1, '16:00', '19:00'),
(7, 'Chapora Fort', 'Vagator, North Goa', 'sightseeing', 'The iconic "Dil Chahta Hai" fort with breathtaking views of Vagator Beach and the coastline.', 0, 90, 1, '06:00', '18:00'),
(8, 'Goan Cooking Class', 'Anjuna, North Goa', 'food', 'Hands-on cooking experience learning to prepare traditional Goan dishes with local spices.', 2000, 180, 1, '10:00', '16:00'),
(9, 'Dudhsagar Falls', 'Mollem, South Goa', 'adventure', 'Visit one of India''s tallest waterfalls via jeep safari through the lush Western Ghats.', 2500, 360, 1, '07:00', '15:00');

-- ============================================
-- Seed: Demo Trip
-- ============================================

INSERT OR IGNORE INTO trips (id, destination, start_date, end_date, budget, interests, created_at) VALUES
(1, 'Goa', '2026-10-10', '2026-10-13', 20000, 'beaches,food,adventure', datetime('now'));

-- ============================================
-- Seed: Initial Itinerary (Day 1)
-- ============================================

INSERT OR IGNORE INTO itinerary_items (id, trip_id, activity_id, date, start_time, end_time, status, created_at) VALUES
(1, 1, 1, '2026-10-10', '09:00', '12:00', 'active', datetime('now')),
(2, 1, 3, '2026-10-10', '13:00', '14:30', 'active', datetime('now')),
(3, 1, 4, '2026-10-10', '16:00', '19:00', 'active', datetime('now'));

-- ============================================
-- Seed: Initial Events
-- ============================================

INSERT OR IGNORE INTO events (id, trip_id, event_type, message, metadata, created_at) VALUES
(1, 1, 'PLAN_CREATED', 'Initial itinerary created for Goa trip.', '{"activities":["Baga Beach","Goan Thali Lunch","Scuba Diving"]}', datetime('now')),
(2, 1, 'PLAN_VALIDATED', 'Budget and schedule validated. All activities are available and within constraints.', '{"budget_used":4000,"budget_total":20000,"conflicts":0}', datetime('now'));
