var Zookee = require('Zookee');
var audioPlayer;
var audioRecorder;
Ti.Media.audioSessionMode = Ti.Media.AUDIO_SESSION_MODE_PLAY_AND_RECORD;
if (!Zookee.isAndroid) {
	audioPlayer = Ti.Media.createVideoPlayer();
	audioRecorder = Ti.Media.createAudioRecorder({
		format : Ti.Media.AUDIO_FILEFORMAT_3GPP,
		compression : Ti.Media.AUDIO_FORMAT_AAC
	});
}
var media;
if (!Zookee.isAndroid) {
	media = {
		recordFile : '',
		playCompleted : {},
		durationReached : {},
		startPlaying : function(param) {
			if (!audioPlayer.paused) {
				var that = this;
				this.playCompleted = param.playCompleted;
				audioPlayer.setUrl(this.recordFile);
				// seems 'complete' event is not fired, so use settimeout as a workaround.
				// audioPlayer.addEventListener('complete', function(e) {
				// that.playCompleted();
				// })
				audioPlayer.play();
				that.timeout = setTimeout(function() {
					//this.recordFile = audioRecorder.stop().nativePath;
					that.playCompleted();
				}, Zookee.VoiceRecorder.MAX_DURATION);
			} else {
				audioPlayer.play();
			}
		},
		pause : function() {
			audioPlayer.pause();
		},
		stopPlaying : function() {
			audioPlayer.stop();
			audioPlayer.release();
			if(this.timeout)
				clearTimeout(this.timeout);
		},
		reset : function() {
			audioPlayer.stop();
			audioPlayer.release();
		},
		stopRecord : function() {
			var _tmp = audioRecorder.stop();
			var file = Ti.Filesystem.getFile(Zookee.CachePath, 'MyVoice2000.aac');
			file.write(_tmp);
			this.recordFile = file.nativePath;
			Ti.Media.stopMicrophoneMonitor();
		},
		startRecord : function(param) {
			audioPlayer.stop();
			audioPlayer.release();
			var that = this;
			this.durationReached = param.durationReached;
			setTimeout(function() {
				//this.recordFile = audioRecorder.stop().nativePath;
				that.durationReached();
			}, Zookee.VoiceRecorder.MAX_DURATION);
			audioRecorder.start();
			Ti.Media.startMicrophoneMonitor();
		}
	}
}

exports.createRecorder = function() {
	return media;
};
