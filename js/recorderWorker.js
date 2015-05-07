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
    case 'getBuffers':
      getBuffers();
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

function getBuffers() {
  var buffers = [];
  buffers.push( convertBufferToFloat32(bufLeft, length) );
  buffers.push( convertBufferToFloat32(bufRight, length) );
  this.postMessage({
    command: 'getBuffers',
    payload: buffers
  });
}

function convertBufferToFloat32(buffers, length) {
  var result = new Float32Array(length);
  var offset = 0;
  for (var i = 0; i < buffers.length; i++){
    result.set(buffers[i], offset);
    offset += buffers[i].length;
  }
  return result;
}

