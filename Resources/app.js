/**
 * device display capacity in pixel
 * galaxy s2: 800x480
 * galaxy s3: 1280x720
 * galaxy s4: 1920x1080
 * galaxy note2:1280x720
 * iphone 4s: 960x640 (480x320 dip)
 * iphone 5: 1136x640 (480x320 dip)
 */
var Cloud = require('ti.cloud');
var Util = require('Util');
var MainView = require('ui/MainView').MainView;
var RegisterView = require('ui/RegisterSimple');
var LoginViewNoPass = require('ui/LoginNoPass');
var Walkthrough = require('ui/Walkthrough');
var Zookee = require('Zookee');

var mainView;
Zookee.CurrentPage = 0;
if (Ti.App.Properties.hasProperty('email')) {
	var sid = Ti.App.Properties.getString('sessionid');	
	if(sid) {
    		Cloud.sessionId = sid;
	}	
	
    if (!Ti.App.Properties.hasProperty('password')) {
        var win = Ti.UI.createWindow({
            windowSoftInputMode : Zookee.Soft_Input.SOFT_INPUT_STATE_HIDDEN | Zookee.Soft_Input.SOFT_INPUT_ADJUST_PAN,
            navBarHidden : true,
            exitOnClose : true,
            backgroundImage:Zookee.ImageURL.Background
        })
        win.addEventListener('android:back', function() {
            win.close();
        })
        var loginView = new LoginViewNoPass(win);

        win.add(loginView);
        win.open();
    } else {
        Zookee.User.initUser();
        var win1 = Ti.UI.createWindow({
            windowSoftInputMode : Zookee.Soft_Input.SOFT_INPUT_STATE_HIDDEN | Zookee.Soft_Input.SOFT_INPUT_ADJUST_PAN,
            navBarHidden : true,
            fullscreen : false,
            exitOnClose : true,
            backClicked : 0,
            backgroundImage:Zookee.ImageURL.Background
        });
        mainView = new MainView(win1);
        win1.add(mainView.view);
        win1.addEventListener('android:back', function() {
            Util.showExitInfo(win1);
        })
        Zookee.currentWindow = win1;
        win1.open();
        mainView.getCurrentView().refresh();
    }
} else {
    var win = Ti.UI.createWindow({
        windowSoftInputMode:Zookee.Soft_Input.SOFT_INPUT_STATE_HIDDEN | Zookee.Soft_Input.SOFT_INPUT_ADJUST_PAN,
        navBarHidden : true,
        exitOnClose : true,
        backgroundImage:Zookee.ImageURL.Background
    });
    win.addEventListener('android:back', function() {
        Util.showExitInfo(win);
    })
    var walkThrough = new Walkthrough(win);
    win.add(walkThrough);
    win.open();
}



// check if network connection exists
//if(Ti.Network.online)
