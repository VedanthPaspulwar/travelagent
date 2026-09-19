package com.travelpilot.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

/**
 * Initializes the SQLite database schema and seed data on application startup.
 * Uses the schema.sql from the database directory (copied to resources).
 */
@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);
    private final JdbcTemplate jdbc;

    public DatabaseConfig(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @PostConstruct
    public void initializeDatabase() {
        log.info("Initializing SQLite database...");
        try {
            // Enable foreign keys for SQLite
            jdbc.execute("PRAGMA foreign_keys = ON");

            // Read and execute schema.sql
            String sql;
            try (InputStream is = new ClassPathResource("schema.sql").getInputStream()) {
                sql = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))
                    .lines().collect(Collectors.joining("\n"));
            }

            // Split by semicolons and execute each statement
            String[] statements = sql.split(";");
            int executed = 0;
            for (String stmt : statements) {
                // Strip SQL comment lines from the fragment before checking
                String cleaned = java.util.Arrays.stream(stmt.split("\n"))
                    .filter(line -> !line.trim().startsWith("--"))
                    .collect(Collectors.joining("\n"))
                    .trim();
                if (!cleaned.isEmpty()) {
                    try {
                        jdbc.execute(cleaned);
                        executed++;
                    } catch (Exception e) {
                        log.warn("SQL statement failed: {}", e.getMessage());
                        log.debug("Failed SQL: {}", cleaned);
                    }
                }
            }

            // Verify critical tables exist
            Integer tripTableCount = jdbc.queryForObject(
                "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='trips'", Integer.class);
            Integer activityTableCount = jdbc.queryForObject(
                "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='activities'", Integer.class);
            Integer itineraryTableCount = jdbc.queryForObject(
                "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='itinerary_items'", Integer.class);
            Integer eventsTableCount = jdbc.queryForObject(
                "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='events'", Integer.class);

            log.info("Database initialized successfully. Executed {} statements.", executed);
            log.info("Table verification - trips: {}, activities: {}, itinerary_items: {}, events: {}",
                tripTableCount, activityTableCount, itineraryTableCount, eventsTableCount);

            if (tripTableCount == 0 || activityTableCount == 0 || itineraryTableCount == 0 || eventsTableCount == 0) {
                throw new RuntimeException("Critical tables missing after initialization!");
            }
        } catch (Exception e) {
            log.error("Failed to initialize database", e);
            throw new RuntimeException("Database initialization failed", e);
        }
    }
}
