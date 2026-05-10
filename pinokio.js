module.exports = {
  version: "7.0",
  title: "HiDream O1 Image Dev FP8",
  icon: "icon.png",
  description: "Original HiDream-O1-Image web UI launched with the drbaph Dev FP8 low-VRAM checkpoint.",
  menu: async (kernel, info) => {
    let installed = info.exists("app/env") && info.exists("app/app.py") && info.exists("fp8_webui.py") && info.exists("fp8_loader.py") && info.exists("app/models/HiDream-O1-Image-Dev-FP8/model.safetensors")
    let running = {
      install: info.running("install.js"),
      start: info.running("start.js"),
      update: info.running("update.js"),
      reset: info.running("reset.js")
    }
    if (running.install) {
      return [{
        default: true,
        icon: "fa-solid fa-plug",
        text: "Installing",
        href: "install.js"
      }]
    } else if (installed) {
      if (running.start) {
        let local = info.local("start.js")
        if (local && local.url) {
          return [{
            default: true,
            icon: "fa-solid fa-rocket",
            text: "Open Web UI",
            href: local.url
          }, {
            icon: "fa-solid fa-terminal",
            text: "Terminal",
            href: "start.js"
          }]
        } else {
          return [{
            default: true,
            icon: "fa-solid fa-terminal",
            text: "Terminal",
            href: "start.js"
          }]
        }
      } else if (running.update) {
        return [{
          default: true,
          icon: "fa-solid fa-terminal",
          text: "Updating",
          href: "update.js"
        }]
      } else if (running.reset) {
        return [{
          default: true,
          icon: "fa-solid fa-terminal",
          text: "Resetting",
          href: "reset.js"
        }]
      } else {
        return [{
          default: true,
          icon: "fa-solid fa-power-off",
          text: "Start",
          href: "start.js"
        }, {
          icon: "fa-solid fa-folder-open",
          text: "Model Folder",
          href: "app/models/HiDream-O1-Image-Dev-FP8?fs"
        }, {
          icon: "fa-solid fa-rotate",
          text: "Update",
          href: "update.js"
        }, {
          icon: "fa-solid fa-plug",
          text: "Reinstall",
          href: "install.js"
        }, {
          icon: "fa-regular fa-circle-xmark",
          text: "Reset",
          href: "reset.js"
        }]
      }
    } else {
      return [{
        default: true,
        icon: "fa-solid fa-plug",
        text: "Install",
        href: "install.js"
      }, {
        icon: "fa-regular fa-circle-xmark",
        text: "Reset",
        href: "reset.js"
      }]
    }
  }
}
