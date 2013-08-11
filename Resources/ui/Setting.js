/**
 * @author kent hao
 */
var Zookee = require('Zookee');
var Util = require('Util');
var delegate = require('backend/Delegate');
var Lines = require('ui/Lines');
var LoginViewNoPass = require('ui/LoginNoPass');
var ImageView = require('ui/ImageView');
var SystemHeight = Ti.Platform.displayCaps.platformHeight;
var SystemWidth = Ti.Platform.displayCaps.platformWidth;
var TitleView = require('ui/TitleView');

function SettingPad(win, myPad) {
	var user = Zookee.User.CurrentUser
	var photoChanged = false;
	var titleView = TitleView.buildTitleView(win,L('profile','Profile'));
	win.add(titleView);
	var view = Ti.UI.createScrollView({
		top : Zookee.UI.HEIGHT_TITLE,
		bottom : 0
	});

	var background = Ti.UI.createView({
		backgroundColor : 'white',
		top : '25%',
		left : 0,
		right : 0,
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

	var usernameField = Ti.UI.createTextField({
		height : '30%',
		left : '5%',
		width : Ti.UI.FILL,
		value : user.username,
		font : Zookee.FONT.NORMAL_FONT,
		keyboardType : Ti.UI.KEYBOARD_DEFAULT,
		returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_NONE,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM
	});
	inputArea.add(usernameField);
	inputArea.add(Lines.LineWithSpace('90%'));

	var phoneField = Ti.UI.createTextField({
		height : '30%',
		value : user.custom_fields.phone,
		left : '5%',
		width : Ti.UI.FILL,
		hintText : L('Phone','Phone'),
		font : Zookee.FONT.NORMAL_FONT,
		keyboardType : Ti.UI.KEYBOARD_DEFAULT,
		returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_NONE,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM
	});
	if(user.custom_fields.phone){
		phoneField.value=user.custom_fields.phone;
	}
	inputArea.add(phoneField);
	inputArea.add(Lines.LineWithSpace('90%'));

	var addressField = Ti.UI.createTextField({
		height : '30%',
		left : '5%',
		width : Ti.UI.FILL,
		hintText:L('address','address'),
		//value:user.custom_fields.address,
		font : Zookee.FONT.NORMAL_FONT,
		keyboardType : Ti.UI.KEYBOARD_DEFAULT,
		returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_NONE,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM
	});
	if (user.custom_fields.address) {
		addressField.value = user.custom_fields.address;
	}
	inputArea.add(addressField);
	inputArea.add(Lines.LineWithSpace('90%'));
	background.add(inputArea);
	background.add(rightView);

	var registerBtn_bg = Ti.UI.createView({
		left : 0,
		right : Zookee[5],
		bottom : Zookee[10],
		height : Zookee[40],
		backgroundColor : Zookee.UI.COLOR.COLOR2,
		backgroundSelectedColor : Zookee.UI.COLOR.MYPAD_BACKGROUND
		//width : SystemHeight*0.15
	});
	rightView.add(registerBtn_bg);
	var updateBtn = Ti.UI.createButton({
		center : {
			x : '50%',
			y : '50%'
		},
		title:L('Update','Update'),
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		//backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		backgroundSelectedColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		width : Ti.UI.FILL,
		height : Zookee[40],
		font:Zookee.FONT.SMALL_FONT
	});
	registerBtn_bg.add(updateBtn);
	//background.add(registerBtn_bg);


	usernameField.addEventListener('return',function(){
		phoneField.focus();
	})
	phoneField.addEventListener('return', function() {
		addressField.focus();
	});

	addressField.addEventListener('return', function(e) {
		updateBtn.fireEvent('click');
	});

	updateBtn.addEventListener('click', function() {
		var tmpUser = {};
		if (photoChanged) {
			tmpUser.photo = avatar.blob;
		}
		if (usernameField.value != user.username) {
			tmpUser.first_name = usernameField.value;
			tmpUser.last_name = usernameField.value
		}

		if (user.custom_fields) {
			tmpUser.custom_fields = user.custom_fields;
		} else {
			tmpUser.custom_fields = {};
		}
		tmpUser.custom_fields.phone = phoneField.value;
		tmpUser.custom_fields.address = addressField.value;
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

	view.add(background);
	var pref = Ti.App.Properties.getString('pref');
	var implication = Ti.UI.createLabel({
		bottom:Zookee[100],
		text:L('what_u_provide','What kind of service you provide?'),
		color:Zookee.UI.COLOR.COLOR3,
		font:Zookee.FONT.NORMAL_FONT
	})
	var preferenceView = Ti.UI.createView({
		bottom:Zookee[50],
		width : Ti.UI.FILL,
		height : Ti.UI.SIZE,
		backgroundColor:'white',
		layout : 'horizontal'
	})
	var preference = ['food', 'entertain', 'hotel', 'shopping', 'sports'];
	var prefControl;
	for (var i = 0, length = preference.length; i < length; i++) {
		var label = Ti.UI.createLabel({
			//top : Zookee[10],
			//left : Zookee[10],
			width : Ti.Platform.displayCaps.platformWidth / 5,
			height : Zookee[40],
			text : ' ' + L(preference[i], preference[i]) + ' ',
			//backgroundColor : Zookee.UI.COLOR.PREFERENCE,
			//borderRadius : Zookee.UI.Border_Radius_Small,
			color : Zookee.UI.COLOR.PARTY_CONTENT,
			tag : preference[i],
			textAlign : 'center',
			verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGN_CENTER,
			font : Zookee.FONT.SMALL_FONT
		});
		if (preference[i] === pref) {
			label.backgroundColor = Zookee.UI.COLOR.MYPAD_BACKGROUND;
			//label.touchEnabled = false;
			prefControl = label;
		}
		label.addEventListener('click', function(e) {
			if (prefControl && prefControl.tag === e.source.tag) {
				return;
			} else if (prefControl && prefControl.tag !== e.source.tag) {
				prefControl.color=Zookee.UI.COLOR.PARTY_CONTENT;
				prefControl.backgroundColor = 'white';
				e.source.backgroundColor = Zookee.UI.COLOR.MYPAD_BACKGROUND;
				e.source.color='white';
				prefControl = e.source;
				Ti.App.Properties.setString('pref',e.source.tag);
			} else {
				prefControl.color=Zookee.UI.COLOR.PARTY_CONTENT;
				e.source.backgroundColor = Zookee.UI.COLOR.MYPAD_BACKGROUND;
				e.source.color='white';
				prefControl = e.source;
				Ti.App.Properties.setString('pref',e.source.tag);
			}
		})
		preferenceView.add(label);
	}

	view.add(preferenceView);
	view.add(implication);

	//view.add(buttons);

	//background.add(buttons);

	this.refresh = function() {

	};

	win.add(view);
	win.open({
		modal:true
	})
};

module.exports = SettingPad;
