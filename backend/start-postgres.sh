#!/usr/bin/env bash
set -euo pipefail

# Load local environment variables when available.
if [[ -f ".env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

export SPRING_DATASOURCE_URL="${SPRING_DATASOURCE_URL:-jdbc:postgresql://127.0.0.1:5432/logsignfb}"
export SPRING_DATASOURCE_USERNAME="${SPRING_DATASOURCE_USERNAME:-postgres}"
export SPRING_DATASOURCE_PASSWORD="${SPRING_DATASOURCE_PASSWORD:-${POSTGRES_PASSWORD:-postgres}}"
export SPRING_DATASOURCE_DRIVER="org.postgresql.Driver"

printf "Starting backend with PostgreSQL:\n"
printf "  URL: %s\n" "$SPRING_DATASOURCE_URL"
printf "  USER: %s\n" "$SPRING_DATASOURCE_USERNAME"

mvn spring-boot:run
