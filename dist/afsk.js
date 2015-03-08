(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AFSK = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/endel/Projects/afsk/src/index.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Transmitter = require("./transmitter");
var Receiver = require("./receiver");

var AFSK = (function () {
  function AFSK() {
    _classCallCheck(this, AFSK);

    this.defaultSignature = [33, 35, 33, 35, 33, 35];
  }

  _createClass(AFSK, {
    transmit: {
      value: function transmit(bytes) {
        var signature = arguments[1] === undefined ? null : arguments[1];

        var transmitter = new Transmitter(signature || this.defaultSignature);
        transmitter.transmit(bytes);
      }
    },
    receive: {
      value: function receive() {}
    }
  });

  return AFSK;
})();

module.exports = AFSK;

},{"./receiver":"/Users/endel/Projects/afsk/src/receiver.js","./transmitter":"/Users/endel/Projects/afsk/src/transmitter.js"}],"/Users/endel/Projects/afsk/src/receiver.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Receiver = (function () {
  function Receiver(signature) {
    _classCallCheck(this, Receiver);

    this.signature = signature || [];
  }

  _createClass(Receiver, {
    receive: {
      value: function receive() {}
    },
    getUserMedia: {
      value: function getUserMedia() {
        return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      }
    }
  });

  return Receiver;
})();

module.exports = Receiver;

},{}],"/Users/endel/Projects/afsk/src/transmitter.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Transmitter = (function () {
  function Transmitter(signature) {
    _classCallCheck(this, Transmitter);

    // create web audio api context
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    this.signature = signature || [];
    this.numOfChannels = 2;
    this.sampleRate = 44100;

    this.bytesPerSecond = 200;

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.connect(this.audioCtx.destination);
  }

  _createClass(Transmitter, {
    createBufferSource: {
      value: function createBufferSource(buffer) {
        var source = this.audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.gainNode); // .connect(this.audioCtx.destination);
        source.start();
        return source;
      }
    },
    transmit: {
      value: function transmit(bytes) {
        var bytes = this.signature.concat(bytes).concat(this.signature);

        var frameCount = Math.ceil(bytes.length / this.bytesPerSecond) * this.sampleRate;
        var buffer = this.audioCtx.createBuffer(this.numOfChannels, frameCount, this.sampleRate);

        var bytesPerFrame = Math.floor(frameCount / bytes.length);

        for (var channel = 0; channel < this.numOfChannels; channel++) {
          var buffering = buffer.getChannelData(channel);
          for (var i = 0; i < bytes.length; i++) {
            for (var j = 0; j < bytesPerFrame; j++) {
              buffering[i * bytesPerFrame + j] = (bytes[i] * 2 - 255) / 255;
            }
          }
        }

        this.createBufferSource(buffer);
      }
    }
  });

  return Transmitter;
})();

module.exports = Transmitter;

},{}]},{},["/Users/endel/Projects/afsk/src/index.js"])("/Users/endel/Projects/afsk/src/index.js")
});