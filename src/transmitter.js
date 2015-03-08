export default class Transmitter {

  constructor(signature) {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    this.signature = signature || [];
    this.numOfChannels = 2;
    this.sampleRate = 44100;

    this.bytesPerSecond = 100;

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.connect(this.audioCtx.destination);
  }

  createBufferSource(buffer) {
    let source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode); // .connect(this.audioCtx.destination);
    source.start();
    return source;
  }

  transmit(bytes) {
    let bytes = this.signature.concat(bytes).concat(this.signature);

    var binaries = [];
    for (var i = 0; i<bytes.length; i++) {
      binaries = binaries.concat(bytes[i].toString(2).split(""))
    }

    let frameCount = Math.ceil( binaries.length / this.bytesPerSecond ) * this.sampleRate;
    let buffer = this.audioCtx.createBuffer(this.numOfChannels, frameCount, this.sampleRate);

    var bytesPerFrame = Math.floor(frameCount / binaries.length);

    for (var channel = 0; channel < this.numOfChannels; channel++) {
      var buffering = buffer.getChannelData(channel);
      for (var i = 0; i < binaries.length; i++) {
        for (var j = 0; j < bytesPerFrame; j++) {

          // 1 = 1
          // -1 = 0
          // 0 = closing binary flag
          if (i == binaries.length - 1 && j > bytesPerFrame / 4) {
            buffering[(i * bytesPerFrame) + j] = 0;
          } else {
            buffering[(i * bytesPerFrame) + j] = (binaries[i] * 2) - 1;
          }

        }
      }
    }

    this.createBufferSource(buffer);
  }

}

