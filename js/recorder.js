var Recorder = function(source) {
  var bufferSize = 4096;
  var numOfInputChannels = 2;
  var numOfOutputChannels = 2;
  this.context = source.context;

  this.node = (this.context.createScriptProcessor ||
      this.context.createJavaScriptNode).call(
      this.context, bufferSize, numOfInputChannels, numOfOutputChannels);

  var worker = new Worker("js/recorderWorker.js");
  worker.postMessage({
    command: 'init',
    payload: {
      sampleRate: this.context.sampleRate,
    }
  });

  this.node.onaudioprocess = function(e) {
    if (!recording) {
      return;
    }
    worker.postMessage({
      command: 'record',
      payload: [
        e.inputBuffer.getChannelData(0),
        e.inputBuffer.getChannelData(1),
      ]
    })
  }

  var recording = false;

  this.record = function() {
    recording = true;
  }

  this.stop = function() {
    recording = false;
  }

  this.clear = function() {
    worker.postMessage({
      command: 'clear'
    })
  }

  source.connect(this.node);
  this.node.connect(this.context.destination);
}
