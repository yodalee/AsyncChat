
// mp3 lame instance
var mp3encoder;

this.onmessage = function(e) {
  switch (e.data.command) {
    case 'init':
      init(e.data.payload);
      break;
    case 'encodeMP3':
      encodeMP3(e.data.payload);
      break;
  }
}

function init(config) {
  mp3encoder = Lame.init();
  Lame.set_mode(mp3encoder, Lame.JOINT_STEREO);
  Lame.set_num_channels(mp3encoder, 2);
  Lame.set_num_samples(mp3encoder, -1);
  Lame.set_in_samplerate(mp3encoder, 44100);
  Lame.set_out_samplerate(mp3encoder, 44100);
  Lame.set_bitrate(mp3encoder, 128);

  Lame.init_params(mp3encoder);

  console.log('Version :', Lame.get_version() + ' / ',
  'Mode: '+Lame.get_mode(mp3codec) + ' / ',
  'Samples: '+Lame.get_num_samples(mp3codec) + ' / ',
  'Channels: '+Lame.get_num_channels(mp3codec) + ' / ',
  'Input Samplate: '+ Lame.get_in_samplerate(mp3codec) + ' / ',
  'Output Samplate: '+ Lame.get_in_samplerate(mp3codec) + ' / ',
  'Bitlate :' +Lame.get_bitrate(mp3codec) + ' / ',
  'VBR :' + Lame.get_VBR(mp3codec));
}

function encodeMP3(data) {
  var mp3data = Lame.encode_buffer_ieee_float(mp3encoder, data, data);
  self.postMessage({cmd: 'encodeDone', payload: mp3data.data});
}
