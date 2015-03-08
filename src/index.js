var Transmitter = require('./transmitter');
var Receiver = require('./receiver');

export default class AFSK {

  constructor () {
    this.defaultSignature = [33, 35, 31, 37];
  }

  transmit(bytes, signature = null) {
    var transmitter = new Transmitter(signature || this.defaultSignature);
    transmitter.transmit(bytes);
  }

  receive(callback, signature = null) {
    var receiver = new Receiver(signature || this.defaultSignature);
    receiver.receive(callback);
  }

}
