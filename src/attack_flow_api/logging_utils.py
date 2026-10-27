import json
import logging
import sys
from datetime import UTC, datetime


class JsonLogFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname.lower(),
            "message": record.getMessage(),
        }

        for key in (
            "request_id",
            "method",
            "path",
            "route",
            "status_code",
            "duration_ms",
        ):
            value = getattr(record, key, None)
            if value is not None:
                payload[key] = value

        return json.dumps(payload)


class StderrLogHandler(logging.StreamHandler):
    def emit(self, record: logging.LogRecord) -> None:
        # Resolve stderr at emission time so redirected streams are not retained
        # after their owner closes them (for example, pytest's capture teardown).
        self.stream = sys.stderr if not sys.stderr.closed else sys.__stderr__
        super().emit(record)


def setup_logging(log_level: str) -> None:
    level_name = log_level.upper()
    level = getattr(logging, level_name, logging.INFO)

    handler = StderrLogHandler()
    handler.setFormatter(JsonLogFormatter())

    logger = logging.getLogger()
    logger.handlers.clear()
    logger.addHandler(handler)
    logger.setLevel(level)
