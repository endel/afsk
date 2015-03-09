(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AFSK = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/endel/Projects/afsk/src/index.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Transmitter = require("./transmitter");
var Receiver = require("./receiver");

var AFSK = (function () {
  function AFSK() {
    _classCallCheck(this, AFSK);

    this.defaultSignature = [33, 35, 31, 37];
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
      value: function receive(callback) {
        var signature = arguments[1] === undefined ? null : arguments[1];

        var receiver = new Receiver(signature || this.defaultSignature);
        receiver.receive(callback);
      }
    }
  });

  return AFSK;
})();

module.exports = AFSK;

},{"./receiver":"/Users/endel/Projects/afsk/src/receiver.js","./transmitter":"/Users/endel/Projects/afsk/src/transmitter.js"}],"/Users/endel/Projects/afsk/src/receiver.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

var STATE_WAITING = 0,
    STATE_SIGNATURE_BEGIN = 1,
    STATE_DATA = 2,
    STATE_SIGNATURE_END = 3;

var Receiver = (function () {
  function Receiver(signature) {
    _classCallCheck(this, Receiver);

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    this.signature = signature || [];

    this.state = 0;
    this.data = [];

    this.analyser = this.audioCtx.createAnalyser();
    // this.analyser.smoothingTimeConstant = 0.3;
    // this.analyser.fftSize = 2048;

    this.processor = null;

    this.mediaStream = null;
    this.source = null;
  }

  _createClass(Receiver, {
    receive: {
      value: function receive(callback) {
        this.receiveCallback = callback;

        navigator.getUserMedia({ video: false, audio: true }, (function (stream) {
          this.mediaStream = stream;

          this.source = this.audioCtx.createMediaStreamSource(this.mediaStream);

          this.processor = this.audioCtx.createScriptProcessor(512, 1, 1);
          this.processor.onaudioprocess = this.onAudioProcess.bind(this);

          this.source.connect(this.processor);
          this.processor.connect(this.audioCtx.destination);

          // connect analyser to processor node
          // this.analyser.connect(this.processor);
        }).bind(this), (function (e) {
          console.log("rejected: ", e);
        }).bind(this));
      }
    },
    onAudioProcess: {
      value: function onAudioProcess(audioProcessingEvent) {
        // The input buffer is the song we loaded earlier
        var inputBuffer = audioProcessingEvent.inputBuffer;

        // The output buffer contains the samples that will be modified and played
        var outputBuffer = audioProcessingEvent.outputBuffer;

        var binaryNumbers = [];

        // Loop through the output channels (in this case there is only one)
        for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
          var inputData = inputBuffer.getChannelData(channel);
          var outputData = outputBuffer.getChannelData(channel);

          var binaryState = 0,
              binary = "",
              lastSample = null;

          // Loop through the samples
          for (var sample = 0; sample < inputBuffer.length; sample++) {
            if (binaryState == 0 && binary.length < 6 && inputData[sample] > -0.5 && inputData[sample] < 0.5) {
              binary += lastSample;
              binaryState = 1;
            }

            lastSample = inputData[sample];

            if (binary.length == 6) {
              binaryNumbers.push(binary);
              binaryState = STATE_DATA;
            }

            if (this.state == STATE_WAITING && inputData[sample] == this.signature[0]) {
              this.state = STATE_SIGNATURE_BEGIN;
              console.log("Signature begin");
            } else if (this.state == STATE_SIGNATURE_BEGIN && inputData[sample] == this.signature[this.signature.length - 1]) {
              this.state = STATE_DATA;
              console.log("Data");
            } else if (this.state == STATE_DATA) {
              this.data.push(inputData[sample]);
            }

            // if (inputData[sample] !== 0) {
            //   console.log(sample, '=>', inputData[sample]);
            // }

            // make output equal to the same as the input
            // outputData[sample] = inputData[sample];

            // // add noise to each output sample
            // outputData[sample] += ((Math.random() * 2) - 1) * 0.2;
          }
        }

        // var bufferLength = this.analyser.frequencyBinCount;
        // var array =  new Uint8Array(bufferLength);
        //
        // this.analyser.getByteFrequencyData(array);
        //
        // for (var i=0; i<array.length; i++) {
        //   if (array[i] !== 0) {
        //     console.log(i, '=>', array[i]);
        //   }
        // }
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

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    this.signature = signature || [];
    this.numOfChannels = 2;
    this.sampleRate = 44100;

    this.bytesPerSecond = 100;

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

        var binaries = [];
        for (var i = 0; i < bytes.length; i++) {
          binaries = binaries.concat(bytes[i].toString(2).split(""));
        }

        var frameCount = Math.ceil(binaries.length / this.bytesPerSecond) * this.sampleRate;
        var buffer = this.audioCtx.createBuffer(this.numOfChannels, frameCount, this.sampleRate);

        var bytesPerFrame = Math.floor(frameCount / binaries.length);

        for (var channel = 0; channel < this.numOfChannels; channel++) {
          var buffering = buffer.getChannelData(channel);
          for (var i = 0; i < binaries.length; i++) {
            for (var j = 0; j < bytesPerFrame; j++) {

              // 1 = 1
              // -1 = 0
              // 0 = closing binary flag
              if (j > bytesPerFrame / 4) {
                buffering[i * bytesPerFrame + j] = 0;
              } else {
                buffering[i * bytesPerFrame + j] = binaries[i] * 2 - 1;
              }
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