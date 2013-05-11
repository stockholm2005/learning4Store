/**
 * @author kent hao
 */
var Zookee = require('Zookee');
var Util = require('Util');
var delegate = require('backend/Delegate');
var Lines = require('ui/Lines');
var LoginViewNoPass = require('ui/LoginNoPass');
var ImageView = require('ui/ImageView');
var PopUp = require('ui/PopUp');
var SystemHeight = Ti.Platform.displayCaps.platformHeight;
var SystemWidth = Ti.Platform.displayCaps.platformWidth;
function SettingPad(win, myPad) {
	var user = Zookee.User.CurrentUser
	var photoChanged = false;
	var view = Ti.UI.createView({
		top : 0,
		bottom : 0,
		layout : 'vertical'
	});

	var background = Ti.UI.createView({
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
		top : '25%',
		left : '5%',
		right : '5%',
		height : SystemHeight * 0.25,
		layout : 'horizontal',
		horizontalWrap : false
	});

	var rightView = Ti.UI.createView({
		left : Zookee[5],
		width : '27%',
		//right:Zookee[5],
		height : Ti.UI.FILL
		//backgroundColor:'red'
	});
	var avatar = new ImageView({
		top : Zookee[5],
		left : 0,
		right : Zookee[5],
		height : SystemHeight * 0.15,
		//backgroundColor:'green'
		defaultImage : Zookee.ImageURL.No_Avatar,
		loadStatus : 'starting',
		url : user.photo.urls.avatar,
		image : user.photo.avatarImage
	});
	var camera_bg = Ti.UI.createView({
		left : Zookee[4],
		top : SystemHeight * 0.15 - Zookee[25],
		width : Zookee[25],
		height : Zookee[25],
		backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		borderRadius : Zookee[3],
		zIndex : 1
	})

	var camera = Ti.UI.createImageView({
		image : Zookee.ImageURL.Camera,
		center : {
			x : '50%',
			y : '50%'
		},
		width : Zookee[20],
		height : Zookee[20]
	})
	camera_bg.add(camera);

	var gallery_bg = Ti.UI.createView({
		right : Zookee[9],
		top : SystemHeight * 0.15 - Zookee[25],
		width : Zookee[25],
		height : Zookee[25],
		backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		borderRadius : Zookee[3],
		zIndex : 1
	})

	var gallery = Ti.UI.createImageView({
		image : Zookee.ImageURL.Gallery,
		center : {
			x : '50%',
			y : '50%'
		},
		width : Zookee[20],
		height : Zookee[20]
	})
	gallery_bg.add(gallery);

	rightView.add(camera_bg);
	rightView.add(gallery_bg);
	camera_bg.addEventListener('click', function() {
		Ti.Media.showCamera({
			saveToPhotoGallery : false,
			success : function(event) {
				if (Zookee.isAndroid)
					avatar.image = event.media.nativePath;
				else
					avatar.image = event.media;
				avatar.blob = event.media
				photoChanged = true;
			},
			cancel : function() {
			},
			error : function(error) {
				var message;
				alert(message);
			},
			allowEditing : true,
			mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
		});
	})

	gallery_bg.addEventListener('click', function() {
		Ti.Media.openPhotoGallery({
			success : function(event) {
				if (Zookee.isAndroid)
					avatar.image = event.media.nativePath;
				else
					avatar.image = event.media;
				avatar.blob = event.media;
				photoChanged = true;
			},
			cancel : function() {
			},
			error : function(error) {
				alert('Error!');
			},
			allowEditing : false,
			mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
		})
	})
	rightView.add(avatar);

	var inputArea = Ti.UI.createView({
		left : Zookee[5],
		layout : 'vertical',
		width : '70%',
		height : Ti.UI.SIZE
	})

	var emailField = Ti.UI.createTextField({
		height : '30%',
		left : '5%',
		width : Ti.UI.FILL,
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
		value : user.email,
		font : Zookee.FONT.NORMAL_FONT,
		keyboardType : Ti.UI.KEYBOARD_DEFAULT,
		returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_NONE,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM
	});
	inputArea.add(emailField);
	inputArea.add(Lines.LineWithSpace('90%'));

	var userName = Ti.UI.createTextField({
		height : '30%',
		value : user.username,
		left : '5%',
		width : Ti.UI.FILL,
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
		hintText : L('username_optional'),
		font : Zookee.FONT.NORMAL_FONT,
		keyboardType : Ti.UI.KEYBOARD_DEFAULT,
		returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_NONE,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM
	});
	inputArea.add(userName);
	inputArea.add(Lines.LineWithSpace('90%'));

	var phoneField = Ti.UI.createTextField({
		height : '30%',
		left : '5%',
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
		width : Ti.UI.FILL,
		hintText : L('Phone'),
		font : Zookee.FONT.NORMAL_FONT,
		keyboardType : Ti.UI.KEYBOARD_DEFAULT,
		returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_NONE,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM
	});
	if (user.phone) {
		phoneField.value = user.phone;
	}
	inputArea.add(phoneField);
	inputArea.add(Lines.LineWithSpace('90%'));
	background.add(inputArea);
	background.add(rightView);

	var registerBtn_bg = Ti.UI.createView({
		left : 0,
		right : Zookee[5],
		bottom : Zookee[10],
		height : Zookee[40],
		backgroundColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		backgroundSelectedColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		borderRadius : Zookee.UI.Border_Radius_Small
		//width : SystemHeight*0.15
	});
	rightView.add(registerBtn_bg);
	var updateBtn = Ti.UI.createButton({
		center : {
			x : '50%',
			y : '50%'
		},
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		//backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		backgroundSelectedColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		width : Zookee[40],
		height : Zookee[40],
		image : Zookee.ImageURL.Send
	});
	registerBtn_bg.add(updateBtn);
	//background.add(registerBtn_bg);

	var buttons = Ti.UI.createView({
		left : '5%',
		right : '5%',
		top : Zookee[140],
		height : Ti.UI.SIZE,
		layout : 'horizontal'
	});
	var logoutLabel = Ti.UI.createLabel({
		left : '5%',
		textid : 'logout_implication',
		font : Zookee.FONT.SMALL_FONT_ITALIC,
		color : Zookee.UI.COLOR.PARTY_CONTENT,
		width : Ti.UI.SIZE
	})

	var logoutBtn = Ti.UI.createView({
		left : Zookee[20],
		borderRadius : Zookee.UI.Border_Radius_Small,
		width : Ti.UI.SIZE,
		height : SystemHeight * 0.05,
		backgroundGradient : Zookee.UI.BackgroundGradient
	});
	var logoutBtn1 = Ti.UI.createButton({
		title : L('Logout'),
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor : 'transparent',
		borderWidth : 0,
		color : 'white',
		borderRadius : Zookee.UI.Border_Radius_Small,
		font : Zookee.FONT.SMALL_FONT
	});
	logoutBtn.button = logoutBtn1;
	logoutBtn.add(logoutBtn1);

	buttons.add(logoutLabel);
	buttons.add(logoutBtn);

	userName.addEventListener('return', function() {
		phoneField.focus();
	});

	phoneField.addEventListener('return', function(e) {
		updateBtn.fireEvent('click');
	});

	updateBtn.addEventListener('click', function() {
		var tmpUser = {};
		if (photoChanged) {
			tmpUser.photo = avatar.blob;
		}
		if (userName.value != user.username) {
			tmpUser.first_name = userName.value;
			tmpUser.last_name = userName.value
		}

		if (emailField.value != user.email) {
			tmpUser.email = emailField.value;
		}

		if (user.custom_fields) {
			tmpUser.custom_fields = user.custom_fields;
		} else {
			tmpUser.custom_fields = {};
		}
		tmpUser.custom_fields.phone = phoneField.value;
		var actInd = Titanium.UI.createActivityIndicator({
			center : {
				x : '50%',
				y : '50%'
			},
			bottom : 10,
			height : 20,
			style : Zookee.isAndroid ? Ti.UI.ActivityIndicatorStyle.PLAIN : Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN
		});
		//var actInd = Util.actIndicator(L('Logging'), background);
		registerBtn_bg.remove(updateBtn);
		registerBtn_bg.add(actInd);
		actInd.show();
		delegate.updateUser(tmpUser, function(_user) {
			user.username = _user.username;
			if (avatar.blob) {
				myPad.updateAvatar(avatar.blob);
			}
			myPad.updateUserName();
			// avatar.reloading({
			// url : _user.photo.urls.avatar,
			// backgroundImage : _user.photo.avatarImage
			// })
			actInd.hide();

			win.close();
			win = null;
		}, function() {
			actInd.hide();
			registerBtn_bg.remove(actInd);
			registerBtn_bg.add(updateBtn);
		});
	});

	//view.add(title);
	//view.add(changeAvatar);
	var shadow = Ti.UI.createView({
		left : '6%',
		width : '88%',
		height : SystemHeight * 0.0125,
		top : 0,
		backgroundImage : Zookee.ImageURL.Shadow
	});
	view.add(background);
	view.add(shadow);
	view.add(buttons);

	//background.add(buttons);

	this.refresh = function() {

	};

	var logoutAction = function(callback) {
		delegate.logout(function() {
			Ti.App.Properties.removeProperty('password');
			Ti.App.Properties.removeProperty('User');
			Ti.App.Properties.removeProperty('sentParties');
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
		var actIndView = Ti.UI.createView({
			left : Zookee[20],
			width : Ti.UI.SIZE,
			height : SystemHeight * 0.05,
			backgroundColor : 'transparent'
		});
		buttons.remove(logoutBtn);
		var actInd = Util.actIndicator('', actIndView,false,Zookee.isAndroid?Ti.UI.ActivityIndicatorStyle.DARK:Ti.UI.iPhone.ActivityIndicatorStyle.DARK);
		buttons.add(actIndView);

		actInd.show();
		if (Zookee.Notification.Enabled) {
			delegate.unSubscribe(Zookee.Notification.Friend_Channel, function() {
				logoutAction(function() {
					actInd.hide();
					buttons.remove(actIndView);
					buttons.add(logoutBtn);
				});
			})
		} else {
			logoutAction(function() {
				actInd.hide();
				buttons.remove(actIndView);
				buttons.add(logoutBtn);
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

module.exports = SettingPad;
