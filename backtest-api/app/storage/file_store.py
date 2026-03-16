from __future__ import annotations

import io
import zipfile
from pathlib import Path
from typing import Optional, Tuple, Union

from app.config import settings
from app.utils.validation import WEIGHTS_EXTENSIONS


def _submission_dir(submission_id: int) -> Path:
    return settings.UPLOAD_DIR / str(submission_id)


def save_upload(submission_id: int, content: bytes) -> Tuple[Path, None]:
    """
    Save a single .py upload to uploads/{submission_id}/strategy.py.
    Returns (strategy_path, None) to match the zip return signature.
    """
    sub_dir = _submission_dir(submission_id)
    sub_dir.mkdir(parents=True, exist_ok=True)
    strategy_path = sub_dir / "strategy.py"
    strategy_path.write_bytes(content)
    return strategy_path, None


def save_zip_submission(submission_id: int, zip_content: bytes) -> Tuple[Path, Optional[Path]]:
    """
    Extract a validated zip into uploads/{submission_id}/.
    Returns (strategy_path, weights_path_or_None).
    Assumes the zip has already been validated by validate_submission_zip().
    """
    sub_dir = _submission_dir(submission_id)
    sub_dir.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(io.BytesIO(zip_content), "r") as zf:
        zf.extract("strategy.py", path=sub_dir)

        weights_name = next(
            (n for n in zf.namelist() if Path(n).suffix.lower() in WEIGHTS_EXTENSIONS),
            None,
        )
        if weights_name:
            zf.extract(weights_name, path=sub_dir)

    strategy_path = sub_dir / "strategy.py"
    weights_path = (sub_dir / weights_name) if weights_name else None
    return strategy_path, weights_path

