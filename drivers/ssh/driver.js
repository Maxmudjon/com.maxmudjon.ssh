"use strict";

const Homey = require("homey");

class SSH extends Homey.Driver {
  onInit() {
    this.actions = {
      send: new Homey.FlowCardAction("send").register()
    };
  }

  onPair(socket) {
    let pairingDevice = {};
    pairingDevice.name = "SSH";
    pairingDevice.settings = {};
    pairingDevice.data = {};

    socket.on("save", (data, callback) => {
      pairingDevice.data.id = data.ip;
      pairingDevice.settings.ip = data.ip;
      pairingDevice.settings.serverName = data.name;
      pairingDevice.name = data.name;
      pairingDevice.settings.port = data.port;
      pairingDevice.settings.username = data.username;
      pairingDevice.settings.password = data.password;

      callback(null, true);
    });

    socket.on("done", (data, callback) => {
      callback(null, pairingDevice);
    });
  }
}

module.exports = SSH;
