export default class Receiver {

  constructor(signature) {
    this.signature = signature || [];
  }

  receive() {
  }

  getUserMedia() {
    return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  }

}
