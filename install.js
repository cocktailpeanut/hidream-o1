module.exports = {
  requires: {
    bundle: "ai"
  },
  run: [
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
          path: "app",
          flashattention: true
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
          "uv pip install safetensors huggingface_hub python-dotenv"
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
  ]
}
