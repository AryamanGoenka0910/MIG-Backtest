from __future__ import annotations

import ast
import zipfile
from pathlib import Path
from typing import Optional

from app.config import settings

REQUIRED_FUNCTION = "get_actions"
WEIGHTS_EXTENSIONS = {".pkl", ".joblib", ".npy", ".npz"}


def validate_strategy_source(source: str, filename: str = "strategy.py") -> Optional[str]:
    """Validate Python source: syntax check + required function. Returns error or None."""
    try:
        tree = ast.parse(source, filename=filename)
    except SyntaxError as exc:
        return f"Syntax error on line {exc.lineno}: {exc.msg}"

    top_level_functions = {
        node.name
        for node in ast.walk(tree)
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.col_offset == 0
    }
    if REQUIRED_FUNCTION not in top_level_functions:
        return (
            f"Missing required function '{REQUIRED_FUNCTION}'. "
            "Your strategy must define: def get_actions(prices: np.ndarray) -> np.ndarray"
        )
    return None


def validate_strategy_file(path: Path) -> Optional[str]:
    """
    Validate a .py strategy file on disk.
    Returns an error string if invalid, or None if valid.
    """
    if path.suffix != ".py":
        return "File must have a .py extension."
    if not path.exists():
        return "File not found on disk."

    size = path.stat().st_size
    if size == 0:
        return "File is empty."
    if size > settings.MAX_FILE_SIZE_BYTES:
        return f"File exceeds maximum size of {settings.MAX_FILE_SIZE_BYTES // 1024} KB."

    source = path.read_text(encoding="utf-8", errors="replace")
    return validate_strategy_source(source, filename=str(path))


def validate_submission_zip(path: Path) -> Optional[str]:
    """
    Validate a submitted zip archive.
    Must contain exactly strategy.py at root, plus optionally one weights file
    (.pkl, .joblib, .npy, .npz). No subdirectories, no other files.
    Returns error string or None if valid.
    """
    if not zipfile.is_zipfile(path):
        return "File is not a valid zip archive."

    with zipfile.ZipFile(path, "r") as zf:
        names = [n for n in zf.namelist() if not n.endswith("/")]  # exclude dir entries

        # Path traversal check
        for name in names:
            if name.startswith("/") or ".." in name or name.startswith("\\"):
                return f"Invalid path in zip: {name!r}"

        # No subdirectories
        for name in names:
            if "/" in name:
                return f"Zip must not contain subdirectories (found: {name!r}). Place all files at the root."

        # Must have strategy.py
        if "strategy.py" not in names:
            return "Zip must contain a file named 'strategy.py' at the root."

        # At most one weights file
        weights_files = [n for n in names if Path(n).suffix.lower() in WEIGHTS_EXTENSIONS]
        if len(weights_files) > 1:
            return (
                f"Zip may contain at most one weights file "
                f"(.pkl, .joblib, .npy, .npz), found {len(weights_files)}: "
                + ", ".join(weights_files)
            )

        # No unexpected files
        allowed = {"strategy.py"} | set(weights_files)
        unexpected = set(names) - allowed
        if unexpected:
            exts = ", ".join(sorted(WEIGHTS_EXTENSIONS))
            return (
                f"Zip contains unexpected file(s): {', '.join(sorted(unexpected))}. "
                f"Only strategy.py and one weights file ({exts}) are allowed."
            )

        # Validate strategy.py source
        try:
            source = zf.read("strategy.py").decode("utf-8", errors="replace")
        except Exception as exc:
            return f"Could not read strategy.py from zip: {exc}"

        if not source.strip():
            return "strategy.py is empty."

        err = validate_strategy_source(source, filename="strategy.py")
        if err:
            return err

        # Weights file size check (uncompressed)
        if weights_files:
            info = zf.getinfo(weights_files[0])
            if info.file_size > settings.MAX_ZIP_SIZE_BYTES:
                return (
                    f"Weights file exceeds maximum size of "
                    f"{settings.MAX_ZIP_SIZE_BYTES // 1_048_576} MB."
                )

    return None
