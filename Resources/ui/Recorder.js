/**
 * @author Angela Deng
 */
var Zookee = require('Zookee');
var Util = require('Util');
function Recorder(win) {
    var recorder = VoiceRecorder.createRecorder();
    // open a single window

    var state = Zookee.VoiceRecorder.STATE_INITIAL;

    var view = Ti.UI.createView({
        center:{
        		x:'50%',
        		y:'50%'
        },
        width:'85%',
        height:Zookee[90],
        layout:'vertical'
    })
    
    var topView = Ti.UI.createView({
    		height:Zookee[40],
        width:Ti.UI.FILL
    })

	var leftView = Ti.UI.createView({
		left : '4%',
		width:'20%',
		height:Ti.UI.FILL		
	})
    var recordView = Ti.UI.createImageView({
		center:{
			x:'50%',
			y:'50%'
		},
		height:Zookee[40],
		width:Zookee[40],
        image : Zookee.ImageURL.Record_White
    });
    leftView.add(recordView);

	var rightView = Ti.UI.createView({
		right : '4%',
		width:'20%',
		height:Ti.UI.FILL		
	})
    var playView = Ti.UI.createImageView({
        center : {
            x : '50%',
            y : '50%'
        },
        height : Zookee[40],
        width : Zookee[40],
        opacity : 0
    });
    rightView.add(playView);

	var progressBar = Util.createProgressBar({
		height:Zookee[10],
		width:Ti.Platform.displayCaps.platformWidth*0.48,
		borderRadius:Zookee[4],
		backgroundColor:'white',
		barColor:Zookee.UI.COLOR.MYPAD_BACKGROUND
	})

    // cancel_view.addEventListener('click', function() {
        // resetControls();
        // win.recordCancelCB();
    // })
    var file;
    if(Zookee.isAndroid){
    		file = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, 'MyVoice2000.aac');
    		recorder.recordFile = file.nativePath.slice(7);
    		recorder.maxDuration = Zookee.VoiceRecorder.MAX_DURATION;
	}
    var durationReachedCB = function() {
        stateChanged(Zookee.VoiceRecorder.STATE_STOP);
        recorder.stopRecord();
        //win.voiceRecordedCB();
    }
    var playCompleteCB = function() {
        stateChanged(Zookee.VoiceRecorder.STATE_STOP);
    }
    recordView.addEventListener('click', function(e) {
        if (state == Zookee.VoiceRecorder.STATE_RECORDING) {
            stateChanged(Zookee.VoiceRecorder.STATE_STOP);
            recorder.stopRecord();
        } else {
            stateChanged(Zookee.VoiceRecorder.STATE_RECORDING);
            recorder.startRecord({
                durationReached : durationReachedCB
            });

        }
    });

    playView.addEventListener('click', function(e) {
        if (state == Zookee.VoiceRecorder.STATE_PLAYING) {
            stateChanged(Zookee.VoiceRecorder.STATE_STOP);
            recorder.pause();
        } else {
            stateChanged(Zookee.VoiceRecorder.STATE_PLAYING);
            recorder.startPlaying({
                playCompleted : playCompleteCB
            });
        }
    });
    
    topView.add(leftView);
    topView.add(progressBar);
    topView.add(rightView);
    
    var buttonsView = Ti.UI.createView({
    		left:Zookee[30],
    		right:Zookee[30],
        height:Ti.UI.SIZE
    });
    
    var okBtn = Ti.UI.createButton({
    		left:'20%',
    		titleid:'Ok',
    		width:Ti.UI.SIZE,
    		height:Ti.UI.SIZE
    });
    
    var cancelBtn = Ti.UI.createButton({
    		right:'20%',
    		titleid:'cancel',
    		width:Ti.UI.SIZE,
    		height:Ti.UI.SIZE
    });
    
    okBtn.addEventListener('click',function(){
    		if (state == Zookee.VoiceRecorder.STATE_RECORDING) {
            stateChanged(Zookee.VoiceRecorder.STATE_STOP);
            recorder.stopRecord();
        }else if(state == Zookee.VoiceRecorder.STATE_PLAYING){
        		recorder.stopPlaying();
        }
        win.voiceRecordedCB();
    })
    
    cancelBtn.addEventListener('click',function(){
    		if (state == Zookee.VoiceRecorder.STATE_RECORDING) {
            stateChanged(Zookee.VoiceRecorder.STATE_STOP);
            recorder.stopRecord();
        }else if(state == Zookee.VoiceRecorder.STATE_PLAYING){
        		recorder.stopPlaying();
        }
         win.recordCancelCB();
    })
    buttonsView.add(okBtn);
    buttonsView.add(cancelBtn);
    var stateChanged = function(_state) {
        switch(_state) {
            case Zookee.VoiceRecorder.STATE_INITIAL:
                recordView.image = Zookee.ImageURL.Record_White;
                playView.image = Zookee.ImageURL.Audio_White;
                playView.opacity=0;
                playView.touchEnabled=false;
                //progressBar.reset();
                break;
            case Zookee.VoiceRecorder.STATE_STOP:
                recordView.image = Zookee.ImageURL.Record_White;
                playView.image = Zookee.ImageURL.Audio_White;
                playView.opacity=1;
                playView.touchEnabled=true;
                progressBar.reset();
                break;
            case Zookee.VoiceRecorder.STATE_RECORDING:
                recordView.image = Zookee.ImageURL.Stop_Record;
                playView.image = Zookee.ImageURL.Audio_White;
                playView.opacity=0;
                playView.touchEnabled=false;
                progressBar.start();
                break;
            case Zookee.VoiceRecorder.STATE_PLAYING:
                recordView.image = Zookee.ImageURL.Record_White;
                playView.opacity=1;
                playView.touchEnabled=true;
                playView.image = Zookee.ImageURL.Pause_White;
                progressBar.reset();
                break;
        }
        state = _state;
    }
    
	view.resetRecorder = function(){
        stateChanged(Zookee.VoiceRecorder.STATE_INITIAL);
        recorder.reset();		
	}
	
    view.reset = function() {
    		view.resetRecorder();
        leftView = null;
        progressBar = null;
        rightView=null;
        playCompleteCB=null;
        playView=null;
        recordView=null;
        stateChanged=null;
    }    
    
    view.add(topView);
    view.add(buttonsView);
    return view;
}

module.exports = Recorder;
