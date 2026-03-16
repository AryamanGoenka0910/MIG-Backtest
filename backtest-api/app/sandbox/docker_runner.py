from __future__ import annotations

import subprocess
import time
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from app.config import settings

MAX_OUTPUT_BYTES = 100_000  # 100 KB — prevent stdout/stderr spam from OOMing host


@dataclass
class RunResult:
    stdout: str
    stderr: str
    exit_code: int
    timed_out: bool
    runtime_seconds: float


class DockerRunner:
    """
    Runs a user strategy file in an isolated Docker container.

    The container receives:
      - strategy file mounted read-only at /sandbox/strategy.py
      - market data mounted read-only at /sandbox/data.csv
    """

    def run(
        self,
        strategy_path: Path,
        timeout: Optional[int] = None,
        weights_path: Optional[Path] = None,
    ) -> RunResult:
        timeout = timeout or settings.SUBMISSION_TIMEOUT_SECONDS
        data_path = settings.DATA_PATH.resolve()
        strategy_path = strategy_path.resolve()

        # unique name so we can kill it precisely on timeout
        container_name = f"mig-sandbox-{uuid.uuid4().hex[:12]}"

        cmd = [
            "docker", "run", "--rm",
            "--name", container_name,
            # resource limits
            "--memory", "512m",
            "--memory-swap", "512m",       # no swap (swap = memory = swap disabled)
            "--cpus", "0.5",
            "--pids-limit", "64",          # prevent fork bombs
            # filesystem
            "--read-only",
            "--tmpfs", "/tmp:size=64m,noexec,nosuid",
            # network
            "--network", "none",
            # drop all Linux capabilities, prevent privilege escalation
            "--cap-drop", "ALL",
            "--security-opt", "no-new-privileges",
            # mounts (read-only)
            "-v", f"{strategy_path}:/sandbox/strategy.py:ro",
            "-v", f"{data_path}:/sandbox/data.csv:ro",
        ]

        # mount weights file at /sandbox/<original_filename> if provided
        if weights_path is not None:
            weights_path = weights_path.resolve()
            cmd += ["-v", f"{weights_path}:/sandbox/{weights_path.name}:ro"]

        cmd += [settings.SANDBOX_IMAGE, "python", "/app/runner.py"]

        start = time.monotonic()
        timed_out = False

        try:
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
            exit_code = proc.returncode
            stdout = proc.stdout[:MAX_OUTPUT_BYTES]
            stderr = proc.stderr[:MAX_OUTPUT_BYTES]
        except subprocess.TimeoutExpired:
            timed_out = True
            exit_code = -1
            stdout = ""
            stderr = f"Execution timed out after {timeout}s"
            _kill_container(container_name)

        runtime = round(time.monotonic() - start, 3)
        return RunResult(
            stdout=stdout,
            stderr=stderr,
            exit_code=exit_code,
            timed_out=timed_out,
            runtime_seconds=runtime,
        )


def _kill_container(name: str) -> None:
    """Force-kill a named container."""
    try:
        subprocess.run(
            ["docker", "kill", name],
            capture_output=True,
            timeout=10,
        )
    except Exception:
        pass
