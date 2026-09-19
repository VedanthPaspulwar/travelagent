package com.travelpilot.repository;

import com.travelpilot.model.ItineraryItem;
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
public class ItineraryRepository {

    private final JdbcTemplate jdbc;

    /** Maps joined query results including activity details */
    private static final RowMapper<ItineraryItem> JOINED_ROW_MAPPER = (rs, rowNum) -> {
        ItineraryItem item = new ItineraryItem();
        item.setId(rs.getLong("id"));
        item.setTripId(rs.getLong("trip_id"));
        item.setActivityId(rs.getLong("activity_id"));
        item.setDate(rs.getString("date"));
        item.setStartTime(rs.getString("start_time"));
        item.setEndTime(rs.getString("end_time"));
        item.setStatus(rs.getString("status"));
        long replacedBy = rs.getLong("replaced_by");
        item.setReplacedBy(rs.wasNull() ? null : replacedBy);
        item.setCreatedAt(rs.getString("ii_created_at"));
        item.setActivityName(rs.getString("activity_name"));
        item.setActivityLocation(rs.getString("activity_location"));
        item.setActivityCategory(rs.getString("activity_category"));
        item.setActivityDescription(rs.getString("activity_description"));
        item.setActivityPrice(rs.getDouble("activity_price"));
        item.setActivityDurationMinutes(rs.getInt("activity_duration_minutes"));
        item.setActivityAvailable(rs.getInt("activity_available") == 1);
        item.setActivityLatitude((Double) rs.getObject("activity_latitude"));
        item.setActivityLongitude((Double) rs.getObject("activity_longitude"));
        return item;
    };

    private static final String JOINED_SELECT =
        "SELECT ii.id, ii.trip_id, ii.activity_id, ii.date, ii.start_time, ii.end_time, " +
        "ii.status, ii.replaced_by, ii.created_at AS ii_created_at, " +
        "a.name AS activity_name, a.location AS activity_location, a.category AS activity_category, " +
        "a.description AS activity_description, a.price AS activity_price, " +
        "a.duration_minutes AS activity_duration_minutes, a.available AS activity_available, " +
        "a.latitude AS activity_latitude, a.longitude AS activity_longitude " +
        "FROM itinerary_items ii JOIN activities a ON ii.activity_id = a.id ";

    public ItineraryRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ItineraryItem> findByTripId(Long tripId) {
        return jdbc.query(
            JOINED_SELECT + "WHERE ii.trip_id = ? ORDER BY ii.date, ii.start_time",
            JOINED_ROW_MAPPER, tripId
        );
    }

    public List<ItineraryItem> findActiveByTripId(Long tripId) {
        return jdbc.query(
            JOINED_SELECT + "WHERE ii.trip_id = ? AND ii.status = 'active' ORDER BY ii.date, ii.start_time",
            JOINED_ROW_MAPPER, tripId
        );
    }

    public Optional<ItineraryItem> findById(Long id) {
        List<ItineraryItem> items = jdbc.query(
            JOINED_SELECT + "WHERE ii.id = ?",
            JOINED_ROW_MAPPER, id
        );
        return items.isEmpty() ? Optional.empty() : Optional.of(items.get(0));
    }

    /**
     * Find cancelled/disrupted items that haven't been replanned yet.
     */
    public List<ItineraryItem> findDisruptedByTripId(Long tripId) {
        return jdbc.query(
            JOINED_SELECT + "WHERE ii.trip_id = ? AND ii.status = 'cancelled' AND ii.replaced_by IS NULL ORDER BY ii.date, ii.start_time",
            JOINED_ROW_MAPPER, tripId
        );
    }

    public ItineraryItem save(ItineraryItem item) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                "INSERT INTO itinerary_items (trip_id, activity_id, date, start_time, end_time, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                Statement.RETURN_GENERATED_KEYS
            );
            ps.setLong(1, item.getTripId());
            ps.setLong(2, item.getActivityId());
            ps.setString(3, item.getDate());
            ps.setString(4, item.getStartTime());
            ps.setString(5, item.getEndTime());
            ps.setString(6, item.getStatus() != null ? item.getStatus() : "active");
            ps.setString(7, now);
            return ps;
        }, keyHolder);
        item.setId(keyHolder.getKey().longValue());
        item.setCreatedAt(now);
        return item;
    }

    public void updateStatus(Long id, String status) {
        jdbc.update("UPDATE itinerary_items SET status = ? WHERE id = ?", status, id);
    }

    public void setReplacedBy(Long id, Long replacedById) {
        jdbc.update("UPDATE itinerary_items SET replaced_by = ? WHERE id = ?", replacedById, id);
    }

    /**
     * Calculate total cost of active itinerary items for a trip.
     */
    public double calculateBudgetUsed(Long tripId) {
        Double result = jdbc.queryForObject(
            "SELECT COALESCE(SUM(a.price), 0) FROM itinerary_items ii " +
            "JOIN activities a ON ii.activity_id = a.id " +
            "WHERE ii.trip_id = ? AND ii.status = 'active'",
            Double.class, tripId
        );
        return result != null ? result : 0.0;
    }
}
