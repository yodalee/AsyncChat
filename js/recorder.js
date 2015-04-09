var Recorder = function(source) {
  var bufferSize = 4096;
  var numOfInputChannels = 2;
  var numOfOutputChannels = 2;
  this.context = source.context;

  this.node = (this.context.createScriptProcessor ||
      this.context.createJavaScriptNode).call(
      this.context, bufferSize, numOfInputChannels, numOfOutputChannels);

  var recording = false;
}
