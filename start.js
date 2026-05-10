module.exports = async (kernel) => {
  const port = await kernel.port()
  return {
    daemon: true,
    run: [
      {
        method: "shell.run",
        params: {
          venv: "app/env",
          env: {
            HIDREAM_MODEL_PATH: "app/models/HiDream-O1-Image-Dev-FP8",
            HIDREAM_MODEL_TYPE: "dev",
            TOKENIZERS_PARALLELISM: "false"
          },
          message: `python fp8_webui.py --model_path app/models/HiDream-O1-Image-Dev-FP8 --model_type dev --host 127.0.0.1 --port ${port}`,
          on: [{
            event: "/(http:\\/\\/[0-9.:]+)/",
            done: true
          }]
        }
      },
      {
        method: "local.set",
        params: {
          url: "{{input.event[1]}}"
        }
      }
    ]
  }
}
