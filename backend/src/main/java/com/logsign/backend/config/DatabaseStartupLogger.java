package com.logsign.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class DatabaseStartupLogger {
    private static final Logger log = LoggerFactory.getLogger(DatabaseStartupLogger.class);

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @EventListener(ApplicationReadyEvent.class)
    public void logDatasource() {
        log.info("Application is using datasource: {}", datasourceUrl);
    }
}
