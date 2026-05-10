module.exports = {
  run: [
    {
      when: "{{exists('.git')}}",
      method: "shell.run",
      params: {
        message: "git pull"
      }
    },
    {
      when: "{{exists('app/.git')}}",
      method: "shell.run",
      params: {
        path: "app",
        message: "git pull"
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
