package com.bilheteria.payment.health;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;

import com.bilheteria.payment.health.dto.HealthResponse;

class HealthServiceTests {

    private final JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
    private final HealthService healthService = new HealthService(jdbcTemplate);

    @Test
    void reportsHealthyWhenDatabaseQuerySucceeds() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class))).thenReturn(1);

        assertEquals(new HealthResponse("ok", "ok"), healthService.check());
    }

    @Test
    void reportsUnavailableWhenDatabaseQueryFails() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class)))
                .thenThrow(new DataAccessResourceFailureException("database unavailable"));

        assertEquals(new HealthResponse("error", "unavailable"), healthService.check());
    }
}
