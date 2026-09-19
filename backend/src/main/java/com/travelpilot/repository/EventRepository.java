package com.travelpilot.repository;

import com.travelpilot.model.Event;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Repository
public class EventRepository {

    private final JdbcTemplate jdbc;

    private static final RowMapper<Event> ROW_MAPPER = (rs, rowNum) -> {
        Event e = new Event();
        e.setId(rs.getLong("id"));
        e.setTripId(rs.getLong("trip_id"));
        e.setEventType(rs.getString("event_type"));
        e.setMessage(rs.getString("message"));
        e.setMetadata(rs.getString("metadata"));
        e.setCreatedAt(rs.getString("created_at"));
        return e;
    };

    public EventRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Event save(Event event) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                "INSERT INTO events (trip_id, event_type, message, metadata, created_at) VALUES (?, ?, ?, ?, ?)",
                Statement.RETURN_GENERATED_KEYS
            );
            ps.setLong(1, event.getTripId());
            ps.setString(2, event.getEventType());
            ps.setString(3, event.getMessage());
            ps.setString(4, event.getMetadata());
            ps.setString(5, now);
            return ps;
        }, keyHolder);
        event.setId(keyHolder.getKey().longValue());
        event.setCreatedAt(now);
        return event;
    }

    public List<Event> findByTripId(Long tripId) {
        return jdbc.query(
            "SELECT * FROM events WHERE trip_id = ? ORDER BY created_at ASC, id ASC",
            ROW_MAPPER, tripId
        );
    }
}
