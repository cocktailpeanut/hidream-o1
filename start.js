module.exports = async (kernel) => {
  const port = await kernel.port()
  return {
    daemon: true,
    run: [
      {
        method: "local.set",
        params: {
          model: "{{args && args.label ? args.label : 'Dev FP8'}}"
        }
      },
      {
        when: "{{!exists(args && args.model_file ? args.model_file : 'app/models/HiDream-O1-Image-Dev-FP8/model.safetensors')}}",
        method: "hf.download",
        params: {
          path: "app/models",
          _: ["{{args && args.repo ? args.repo : 'drbaph/HiDream-O1-Image-Dev-FP8'}}"],
          "local-dir": "{{args && args.dir ? args.dir : 'HiDream-O1-Image-Dev-FP8'}}"
        }
      },
      {
        method: "shell.run",
        params: {
          venv: "app/env",
          env: {
            HIDREAM_MODEL_PATH: "app/models/{{args && args.dir ? args.dir : 'HiDream-O1-Image-Dev-FP8'}}",
            HIDREAM_MODEL_TYPE: "{{args && args.type ? args.type : 'dev'}}",
            TOKENIZERS_PARALLELISM: "false"
          },
          message: `python fp8_webui.py --model_path app/models/{{args && args.dir ? args.dir : 'HiDream-O1-Image-Dev-FP8'}} --model_type {{args && args.type ? args.type : 'dev'}} --host 127.0.0.1 --port ${port}`,
          on: [{
            event: "/(http:\\/\\/[0-9.:]+)/",
            done: true
          }]
        }
      },
      {
        method: "local.set",
        params: {
          url: "{{input.event[1]}}",
          model: "{{args && args.label ? args.label : 'Dev FP8'}}"
        }
      }
    ]
  }
}
