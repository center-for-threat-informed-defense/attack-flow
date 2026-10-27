import io
import json
import logging
import sys

from attack_flow_api.logging_utils import setup_logging


def test_logging_survives_closed_redirected_stderr(monkeypatch):
    redirected_stderr = io.StringIO()
    original_stderr = io.StringIO()
    monkeypatch.setattr(sys, "stderr", redirected_stderr)
    monkeypatch.setattr(sys, "__stderr__", original_stderr)
    root = logging.getLogger()
    monkeypatch.setattr(root, "handlers", [])
    previous_level = root.level

    try:
        setup_logging("DEBUG")
        redirected_stderr.close()
        logging.getLogger("asyncio").debug("shutdown cleanup")

        record = json.loads(original_stderr.getvalue())
        assert record["message"] == "shutdown cleanup"
        assert record["level"] == "debug"
    finally:
        root.setLevel(previous_level)
