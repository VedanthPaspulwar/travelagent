package com.travelpilot.repository;

import com.travelpilot.model.Activity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ActivityRepository {

    private final JdbcTemplate jdbc;

    private static final RowMapper<Activity> ROW_MAPPER = (rs, rowNum) -> {
        Activity a = new Activity();
        a.setId(rs.getLong("id"));
        a.setName(rs.getString("name"));
        a.setLocation(rs.getString("location"));
        a.setCategory(rs.getString("category"));
        a.setDescription(rs.getString("description"));
        a.setPrice(rs.getDouble("price"));
        a.setDurationMinutes(rs.getInt("duration_minutes"));
        a.setAvailable(rs.getInt("available") == 1);
        a.setOpenTime(rs.getString("open_time"));
        a.setCloseTime(rs.getString("close_time"));
        return a;
    };

    public ActivityRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Activity> findAll() {
        return jdbc.query("SELECT * FROM activities ORDER BY id", ROW_MAPPER);
    }

    public List<Activity> findAvailable() {
        return jdbc.query("SELECT * FROM activities WHERE available = 1 ORDER BY id", ROW_MAPPER);
    }

    public List<Activity> findByCategory(String category) {
        return jdbc.query("SELECT * FROM activities WHERE category = ? AND available = 1", ROW_MAPPER, category);
    }

    public Optional<Activity> findById(Long id) {
        List<Activity> list = jdbc.query("SELECT * FROM activities WHERE id = ?", ROW_MAPPER, id);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public void setAvailable(Long id, boolean available) {
        jdbc.update("UPDATE activities SET available = ? WHERE id = ?", available ? 1 : 0, id);
    }

    /**
     * Find available activities not already in a trip's active itinerary.
     */
    public List<Activity> findAvailableNotInTrip(Long tripId) {
        return jdbc.query(
            "SELECT a.* FROM activities a " +
            "WHERE a.available = 1 AND a.id NOT IN (" +
            "  SELECT ii.activity_id FROM itinerary_items ii WHERE ii.trip_id = ? AND ii.status = 'active'" +
            ") ORDER BY a.id",
            ROW_MAPPER, tripId
        );
    }
}
