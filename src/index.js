var Transmitter = require('./transmitter');
var Receiver = require('./receiver');

export default class AFSK {

  constructor () {
    this.defaultSignature = [33, 35, 33, 35, 33, 35];
  }

  transmit(bytes, signature = null) {
    var transmitter = new Transmitter(signature || this.defaultSignature);
    transmitter.transmit(bytes);
  }

  receive() {
  }

}
