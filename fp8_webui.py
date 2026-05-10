from __future__ import annotations

import argparse
import importlib.util
import os
import sys
from pathlib import Path

import torch


def _load_original_webui(app_dir: Path):
    app_dir = app_dir.resolve()
    os.chdir(app_dir)
    sys.path.insert(0, str(app_dir))
    spec = importlib.util.spec_from_file_location("hidream_original_webui", app_dir / "app.py")
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load original web UI from {app_dir / 'app.py'}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def main() -> None:
    parser = argparse.ArgumentParser("HiDream-O1-Image FP8 web UI runner")
    parser.add_argument("--app_dir", default="app")
    parser.add_argument("--model_path", default=os.environ.get("HIDREAM_MODEL_PATH", "app/models/HiDream-O1-Image-FP8"))
    parser.add_argument("--model_type", default=os.environ.get("HIDREAM_MODEL_TYPE", "full"), choices=["full", "dev"])
    parser.add_argument("--host", default=os.environ.get("HIDREAM_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("HIDREAM_PORT", "7860")))
    args = parser.parse_args()

    if not torch.cuda.is_available():
        raise RuntimeError("CUDA is required for HiDream O1 FP8 inference.")

    root = Path(__file__).resolve().parent
    app_dir = (root / args.app_dir).resolve()
    model_path = (root / args.model_path).resolve() if not Path(args.model_path).is_absolute() else Path(args.model_path)

    webui = _load_original_webui(app_dir)

    from fp8_loader import load_image_model

    processor, model = load_image_model(model_path)
    webui._STATE["processor"] = processor
    webui._STATE["model"] = model
    webui._STATE["model_type"] = args.model_type

    print(f"[fp8] Serving original HiDream web UI on http://{args.host}:{args.port}")
    webui.app.run(host=args.host, port=args.port, debug=False, threaded=True)


if __name__ == "__main__":
    main()
