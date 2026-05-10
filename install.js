module.exports = {
  requires: {
    bundle: "ai"
  },
  run: [
    {
      when: "{{exists('app') && !exists('app/app.py')}}",
      method: "shell.run",
      params: {
        message: [
          "echo The existing app folder is not the original HiDream web UI checkout.",
          "echo Run Reset first if this folder came from an older launcher attempt.",
          "exit 1"
        ]
      }
    },
    {
      when: "{{!exists('app')}}",
      method: "shell.run",
      params: {
        message: [
          "git clone https://github.com/HiDream-ai/HiDream-O1-Image app"
        ]
      }
    },
    {
      method: "script.start",
      params: {
        uri: "torch.js",
        params: {
          venv: "env",
          path: "app"
        }
      }
    },
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "uv pip install -r requirements.txt",
          "uv pip install safetensors huggingface_hub"
        ]
      }
    },
    {
      method: "hf.download",
      params: {
        path: "app/models",
        _: ["drbaph/HiDream-O1-Image-FP8"],
        "local-dir": "HiDream-O1-Image-FP8"
      }
    },
    {
      method: "fs.link",
      params: {
        venv: "app/env"
      }
    }
  ]
}
