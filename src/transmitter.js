export default class Transmitter {

  constructor(signature) {
    // create web audio api context
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    this.signature = signature || [];
    this.numOfChannels = 2;
    this.sampleRate = 44100;

    this.bytesPerSecond = 200;

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

    let frameCount = Math.ceil( bytes.length / this.bytesPerSecond ) * this.sampleRate;
    let buffer = this.audioCtx.createBuffer(this.numOfChannels, frameCount, this.sampleRate);

    var bytesPerFrame = Math.floor(frameCount / bytes.length);

    for (var channel = 0; channel < this.numOfChannels; channel++) {
      var buffering = buffer.getChannelData(channel);
      for (var i = 0; i < bytes.length; i++) {
        for (var j = 0; j < bytesPerFrame; j++) {
          buffering[(i * bytesPerFrame) + j] = ((bytes[i] * 2) - 255) / 255;
        }
      }
    }

    this.createBufferSource(buffer);
  }

}

