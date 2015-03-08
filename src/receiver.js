navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

var STATE_WAITING = 0,
    STATE_SIGNATURE_BEGIN = 1,
    STATE_DATA = 2,
    STATE_SIGNATURE_END = 3;

export default class Receiver {

  constructor(signature) {
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

  receive(callback) {
    this.receiveCallback = callback;

    navigator.getUserMedia({video: false, audio: true}, function(stream) {
      this.mediaStream = stream;

      this.source = this.audioCtx.createMediaStreamSource(this.mediaStream);

      this.processor = this.audioCtx.createScriptProcessor(512, 1, 1);
      this.processor.onaudioprocess = this.onAudioProcess.bind(this);

      this.source.connect(this.processor);
      this.processor.connect(this.audioCtx.destination);

      // connect analyser to processor node
      // this.analyser.connect(this.processor);

    }.bind(this), function (e) {
      console.log("rejected: ", e)
    }.bind(this));
  }

  onAudioProcess(audioProcessingEvent) {
    // The input buffer is the song we loaded earlier
    var inputBuffer = audioProcessingEvent.inputBuffer;

    // The output buffer contains the samples that will be modified and played
    var outputBuffer = audioProcessingEvent.outputBuffer;

    // Loop through the output channels (in this case there is only one)
    for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
      var inputData = inputBuffer.getChannelData(channel);
      var outputData = outputBuffer.getChannelData(channel);

      // Loop through the samples
      for (var sample = 0; sample < inputBuffer.length; sample++) {
        console.log(inputData[sample]);
        if (this.state == STATE_WAITING && inputData[sample] == this.signature[0]) {
          this.state = STATE_SIGNATURE_BEGIN;
          console.log("Signature begin");

        } else if (this.state == STATE_SIGNATURE_BEGIN && inputData[sample] == this.signature[ this.signature.length -1 ]) {
          this.state = STATE_DATA;
          console.log("Data");

        } else if (this.state == STATE_DATA) {
          this.data.push( inputData[sample] );

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
