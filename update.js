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
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        env: {
          HF_HUB_DISABLE_UPDATE_CHECK: "1"
        },
        message: [
          "uv pip install -r requirements.txt",
          "uv pip install accelerate safetensors huggingface_hub python-dotenv"
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
    }
  ]
}
