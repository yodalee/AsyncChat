var length = 0;
var bufLeft = [];
var bufRight = [];
var sampleRate;

this.onmessage = function(e) {
  switch (e.data.command) {
    case 'init':
      init(e.data.payload);
      break;
    case 'record':
      record(e.data.payload);
      break;
    case 'clear':
      clear();
      break;
  }
}

function init(config) {
  sampleRate = config.sampleRate;
}

function record(inputBuffer) {
  bufLeft.push(inputBuffer[0]);
  bufRight.push(inputBuffer[1]);
  length += inputBuffer[0].length;
}

function clear(){
  recLength = 0;
  recBuffersL = [];
  recBuffersR = [];
}
