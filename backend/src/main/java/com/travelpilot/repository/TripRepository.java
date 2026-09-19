package com.travelpilot.repository;

import com.travelpilot.model.Trip;
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
import java.util.Optional;

@Repository
public class TripRepository {

    private final JdbcTemplate jdbc;

    private static final RowMapper<Trip> ROW_MAPPER = (rs, rowNum) -> {
        Trip trip = new Trip();
        trip.setId(rs.getLong("id"));
        trip.setDestination(rs.getString("destination"));
        trip.setStartDate(rs.getString("start_date"));
        trip.setEndDate(rs.getString("end_date"));
        trip.setBudget(rs.getDouble("budget"));
        trip.setInterests(rs.getString("interests"));
        trip.setCreatedAt(rs.getString("created_at"));
        return trip;
    };

    public TripRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Trip save(Trip trip) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                "INSERT INTO trips (destination, start_date, end_date, budget, interests, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, trip.getDestination());
            ps.setString(2, trip.getStartDate());
            ps.setString(3, trip.getEndDate());
            ps.setDouble(4, trip.getBudget());
            ps.setString(5, trip.getInterests());
            ps.setString(6, now);
            return ps;
        }, keyHolder);
        trip.setId(keyHolder.getKey().longValue());
        trip.setCreatedAt(now);
        return trip;
    }

    public Optional<Trip> findById(Long id) {
        List<Trip> trips = jdbc.query("SELECT * FROM trips WHERE id = ?", ROW_MAPPER, id);
        return trips.isEmpty() ? Optional.empty() : Optional.of(trips.get(0));
    }

    public List<Trip> findAll() {
        return jdbc.query("SELECT * FROM trips ORDER BY created_at DESC", ROW_MAPPER);
    }
}
