# HiDream O1 Image Dev FP8 Pinokio Launcher

This launcher runs the original
[HiDream-ai/HiDream-O1-Image](https://github.com/HiDream-ai/HiDream-O1-Image)
Flask web UI with the
[drbaph/HiDream-O1-Image-Dev-FP8](https://huggingface.co/drbaph/HiDream-O1-Image-Dev-FP8)
checkpoint.

The upstream web UI is kept as the user-facing app. Pinokio clones the original
repo into `app/` and leaves that repo code unchanged. The root launcher file
`fp8_webui.py` imports the original Flask app from `app/app.py`, initializes the
same `_STATE` object that upstream `main()` initializes, and then calls the
original Flask `app.run()`.

This extra loader is required because upstream `app.py` hardcodes:

```python
Qwen3VLForConditionalGeneration.from_pretrained(
    model_path, torch_dtype=torch.bfloat16, device_map="cuda"
)
```

That path does not preserve the FP8 checkpoint as FP8. The launcher therefore
uses an explicit FP8 loader that reads the FP8 safetensors directly, keeps large
matrix weights in FP8, uses explicit per-module wrapper layers for compute
casting, and starts the original web UI through `fp8_webui.py`. It does not
write helper code into `app/` or modify upstream source files. The launcher adds
one root-owned browser enhancement script to the served web UI so regular
browsers get a random seed toggle and a generated-image download button.

ComfyUI is not installed or launched by this launcher.

The upstream repo does not ship a dedicated `icon.*` or `logo.*` asset. The
Pinokio launcher vendors the upstream GitHub organization avatar as root
`icon.png` for its app tile, leaving `app/` as the unmodified upstream clone.

## Requirements

- NVIDIA CUDA GPU.
- A recent PyTorch build with FP8 dtype support.
- Around 10 GB VRAM for the FP8 model, based on the FP8 model card.
- Enough disk space for the original repo, Python environment, and checkpoint.

## Model Behavior

This launcher ships only the Dev FP8 checkpoint. It starts the upstream web UI
with `--model_type dev`, so the original app uses its built-in Dev settings:
28 inference steps, CFG disabled (`guidance_scale=0.0`), shift `1.0`, and the
Flash scheduler.

## How To Use

1. Click `Install`.
2. Wait for Pinokio to clone the original HiDream web UI, install dependencies,
   install the root FP8 runner dependencies, and download the Dev FP8 checkpoint.
3. Click `Start`.
4. Open `Open Web UI`.

The model is downloaded to:

```text
app/models/HiDream-O1-Image-Dev-FP8
```

The Dev command started by Pinokio is:

```bash
python fp8_webui.py --model_path app/models/HiDream-O1-Image-Dev-FP8 --model_type dev --host 127.0.0.1 --port <dynamic-port>
```

## Scripts

- `install.js`: clones the original HiDream repo, installs dependencies and CUDA
  PyTorch, installs FlashAttention for upstream inference, and downloads the
  Dev FP8 model.
- `fp8_webui.py`: root runner that imports the original Flask web UI from
  `app/app.py`, initializes the model state with the FP8 loader, attaches the
  root web UI enhancement script, and starts it.
- `fp8_loader.py`: root FP8 loader for the drbaph safetensors checkpoint.
- `webui_enhancements.js`: root browser enhancement that adds a random seed
  toggle and a `Download PNG` link without editing `app/`.
- `start.js`: starts the original web UI through `fp8_webui.py` with Dev FP8 on
  `127.0.0.1` using a dynamic Pinokio port.
- `update.js`: pulls updates, refreshes dependencies, and refreshes the Dev FP8
  model download.
- `reset.js`: removes `app/`, including the venv and downloaded model.

`python-dotenv` is installed explicitly because the upstream web UI imports
`dotenv` but does not list it in its requirements file.

If the web UI shows `Flash attention is not available`, run `Update`. Upstream
inference sets `use_flash_attn` to `True`, so the launcher installs `flash_attn`
through `torch.js` instead of editing upstream `models/pipeline.py`.

## HTTP API

The original HiDream Flask API is available after `Start`. Replace `7860` with
the dynamic port shown by Pinokio.

### JavaScript

```javascript
const start = await fetch("http://127.0.0.1:7860/api/generate/start", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    mode: "t2i",
    prompt: "A cinematic glass city at sunrise, intricate details",
    width: 1024,
    height: 1024,
    seed: 42
  })
})
const { job_id } = await start.json()
const events = new EventSource(`http://127.0.0.1:7860/api/generate/stream/${job_id}`)
events.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log(data.type, data.step, data.total)
  if (data.type === "done") {
    console.log(data.image)
    events.close()
  }
}
```

### Python

```python
import json
import requests

base = "http://127.0.0.1:7860"
response = requests.post(f"{base}/api/generate/start", json={
    "mode": "t2i",
    "prompt": "A cinematic glass city at sunrise, intricate details",
    "width": 1024,
    "height": 1024,
    "seed": 42,
})
response.raise_for_status()
job_id = response.json()["job_id"]

stream = requests.get(f"{base}/api/generate/stream/{job_id}", stream=True)
for line in stream.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data: "):
        continue
    data = json.loads(line.removeprefix("data: "))
    print(data["type"])
    if data["type"] in {"done", "error"}:
        break
```

### Curl

```bash
JOB_ID=$(curl -s http://127.0.0.1:7860/api/generate/start \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "t2i",
    "prompt": "A cinematic glass city at sunrise, intricate details",
    "width": 1024,
    "height": 1024,
    "seed": 42
  }' | python -c 'import sys,json; print(json.load(sys.stdin)["job_id"])')

curl -N "http://127.0.0.1:7860/api/generate/stream/${JOB_ID}"
```
