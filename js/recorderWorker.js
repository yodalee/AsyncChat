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
    case 'exportWAV':
      exportWAV();
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
  length = 0;
  bufLeft = [];
  bufRight = [];
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

// export single channel for simplicity
function exportWAV() {
  var bufferL = convertBufferToFloat32(bufLeft, length);
  var dataview = encodeWAV(bufferL, true);
  var audioBlob = new Blob([dataview], { type: 'audio/wav' });

  this.postMessage({
    command: 'exportWAV',
    payload: audioBlob,
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

function floatTo16BitPCM(output, offset, input){
  for (var i = 0; i < input.length; i++, offset+=2){
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view, offset, string){
  for (var i = 0; i < string.length; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples, mono) {
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 32 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, mono?1:2, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 4, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return view;
}
