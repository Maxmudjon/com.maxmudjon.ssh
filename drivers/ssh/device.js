"use strict";

const Homey = require("homey");
const Client = require("ssh2").Client;

class SSH extends Homey.Device {
  onInit() {
    this.log("SSH has been inited");
    this.driver = this.getDriver();
    const { actions } = this.driver;
    this.registerSendAction("send", actions.send);
  }

  registerSendAction(name, action) {
    action.registerRunListener((args, state) => {
      this.log("Run action with commands: ", args.command);
      let conn = new Client();
      conn
        .on("ready", () => {
          this.log("Client ready");
          conn.exec(args.command, (err, stream) => {
            if (err) {
              return Promise.reject(err);
            }
            stream
              .on("close", (code, signal) => {
                this.log("Stream close code: " + code + ", signal: " + signal);
                conn.end();
              })
              .on("data", data => {
                this.log("STDOUT: " + data);
              })
              .stderr.on("data", data => {
                this.log("STDERR: " + data);
              });
          });
        })
        .on("keyboard-interactive", (name, instr, lang, prompts, cb) => {
          cb([args.device.getSetting("password")]);
        })
        .on("error", err => {
          this.setUnavailable("Error: " + JSON.stringify(err));
          this.log(err);

          setTimeout(() => {
            this.setAvailable();
          }, 10 * 1000);
        })
        .connect({
          host: args.device.getSetting("ip"),
          port: args.device.getSetting("port"),
          username: args.device.getSetting("username"),
          password: args.device.getSetting("password")
        });
    });
  }
}

module.exports = SSH;
