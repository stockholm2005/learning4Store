/**
 * @author Kent hao
 */
var ImageDelegate = require('backend/ImageDelegate');
var imageDelegate = new ImageDelegate();
var delegate = require('backend/Delegate');
var LoginViewNoPass = require('ui/LoginNoPass');
var Zookee = require('Zookee');
var SettingPad = require('ui/Setting');
var boldStyle = Zookee.FONT.SEGMENT_FONT_SELECTED;
var normalStyle = Zookee.FONT.SEGMENT_FONT_UNSELECTED;
var AdsList = require('ui/AdsList');
var PriorityList = require('ui/Priority');
var PopUp = require('ui/PopUp');

function PeoplePad(myPad, win) {
	var data = [];
	var delegate = require('backend/Delegate');
	var Lines = require('ui/Lines');
	var Util = require('Util');
	var user = Zookee.User.CurrentUser
	var that = this;
	//win.add(titleView);
	view = Ti.UI.createView({
		top : 0,
		bottom:0,
		backgroundColor:'#332e28',
		left : 0,
		right : Zookee[40]
	});
	
	var slogon = Ti.UI.createLabel({
		text:L('product_name','ForTogether'),
		color:Zookee.UI.COLOR.COLOR3,
		font:Zookee.FONT.LARGE_FONT
	})
	
	var opBg = Ti.UI.createView({
		center:{
			x:'50%',
			y:'50%'
		},
		width:Ti.UI.SIZE,
		height:Ti.UI.SIZE,
		layout:'vertical'
	})
	var settingLabel = Ti.UI.createLabel({
		color:'white',
		text:L('my_profile','My Profile')
	})
	
	var adsLabel = Ti.UI.createLabel({
		top:Zookee[30],
		color:'white',
		text:L('my_label','My Ads')
	})
	
	var priLabel = Ti.UI.createLabel({
		top:Zookee[30],
		color:'white',
		text:L('my_priority','My Priority')
	})

	var logoutBtn = Ti.UI.createView({
		bottom:Zookee[40],
		left : Zookee[20],
		right:Zookee[20],
		height : Zookee[50],
		backgroundColor : Zookee.UI.COLOR.COLOR3
	});
	var logoutBtn1 = Ti.UI.createButton({
		title : L('Logout','Logout'),
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor : 'transparent',
		color : 'white',
		font : Zookee.FONT.NORMAL_FONT
	});
	logoutBtn.button = logoutBtn1;
	logoutBtn.add(logoutBtn1);
	//view.add(slogon);
	opBg.add(settingLabel);
	opBg.add(adsLabel);
	opBg.add(priLabel);
	view.add(opBg);
	view.add(logoutBtn);
	
	settingLabel.addEventListener('click',function(){
		new SettingPad(Ti.UI.createWindow({navBarHidden:true,
				backgroundImage:Zookee.ImageURL.Background}), myPad)
	});
	adsLabel.addEventListener('click',function(){
		new AdsList(Ti.UI.createWindow({navBarHidden:true,layout:'vertical',
				backgroundImage:Zookee.ImageURL.Background}));
	})
	priLabel.addEventListener('click',function(){
		new PriorityList(
			Ti.UI.createWindow({
				navBarHidden:true,
				layout:'vertical',
				backgroundImage:Zookee.ImageURL.Background}));
	})

	var logoutAction = function(callback) {
		delegate.logout(function() {
			Ti.App.Properties.removeProperty('password');
			Ti.App.Properties.removeProperty('User');
			for(var i=0,length = Zookee.Priorities.length;i<length;i++){
				for(var j=0,l=Zookee.Priorities[i].identifiers.length;j<l;j++){
					Ti.App.Properties.removeProperty('Purchased-'+Zookee.Priorities[i].identifiers[j]);
				}
			}
			Zookee.sentParties.release();
			Zookee.User.setUser({});
			Zookee.isLogin = false;

			var _win = Ti.UI.createWindow({
				windowSoftInputMode : Zookee.Soft_Input.SOFT_INPUT_STATE_HIDDEN | Zookee.Soft_Input.SOFT_INPUT_ADJUST_PAN,
				navBarHidden : true,
				fullscreen : false,
				exitOnClose : true,
				backClicked : 0,
				backgroundImage : Zookee.ImageURL.Background
			});
			_win.addEventListener('android:back', function() {
				_win.close();
				_win = null;
			});
			var loginView = new LoginViewNoPass(_win);

			_win.add(loginView);
			//callback();
			//win.close();
			//win = null;
			_win.open();
		}, function() {
			callback();
		});
	}
	var logoutFn = function() {
		logoutBtn.remove(logoutBtn1);
		var actInd = Util.actIndicator('', logoutBtn);
		//logoutBtn.add(actIndView);

		actInd.show();
		if (Zookee.Notification.Enabled) {
			delegate.unSubscribe(Zookee.Notification.Friend_Channel, function() {
				logoutAction(function() {
					actInd.hide();
					logoutBtn.remove(actInd);
					logoutBtn.add(logoutBtn.button);
				});
			})
		} else {
			logoutAction(function() {
					actInd.hide();
					logoutBtn.remove(actInd);
					logoutBtn.add(logoutBtn.button);
			});
		}
	}
	logoutBtn1.addEventListener('click', function() {
		if (Zookee.PASSCODE_ENABLED) {
			win.add(PopUp(logoutFn, 'logout', win));
		} else {
			logoutFn();
		}
	});
	return view;
};

module.exports = PeoplePad;
