var length = 0;
var bufLeft = [];
var bufRight = [];
var sampleRate;

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
