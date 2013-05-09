/**
 * @author kent hao
 */
var Zookee = require('Zookee');
var Util = require('Util');
var delegate = require('backend/Delegate');
var PopUp = require('ui/PopUp');
var SystemWidth = Ti.Platform.displayCaps.platformWidth;
var SystemHeight = Ti.Platform.displayCaps.platformHeight;

function LoginView(win) {
	view = Ti.UI.createView({
		top : 0,
		bottom : 0
		//backgroundColor : 'white',
		//backgroundImage:Zookee.ImageURL.Background,
		//layout:'vertical'
	});

	var title = Ti.UI.createLabel({
		textid : 'product_name',
		top : 0,
		left : 0,
		width : Ti.UI.FILL,
		height : SystemHeight * 0.075,
		textAlign : 'center',
		backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		color : 'white',
		font : Zookee.FONT.TITLE_FONT
	})

	var scrollView = Ti.UI.createScrollView({
		left:0,
		right:0,
		top:0
	})
	var background = Ti.UI.createView({
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
		top:'45%',
		left : '5%',
		right:'5%',
		height : '10%'
	});
	// in case you login from another device, click here.
	var needPassword = Ti.UI.createLabel({
		left:'7%',
		right:'7%',
		top:'57%',
		height:Ti.UI.SIZE,
		textid:'use_password',
		font:Zookee.FONT.SMALL_FONT,
		color:Zookee.UI.COLOR.PARTY_CONTENT
	});
	
	needPassword.addEventListener('click',function(e){
		scrollView.add(passArea);
		passArea.animate({
			opacity:1,
			duration:500
		});
	})

	var passArea = Ti.UI.createView({
		top:'62%',
		layout:'vertical',
		left:'5%',
		right:'5%',
		opacity:0,
		height:Ti.UI.SIZE
	})
	var passImplication = Ti.UI.createLabel({
		width:Ti.UI.FILL,
		height:Ti.UI.SIZE,
		textid:'password_implication',
		font:Zookee.FONT.SMALL_FONT_ITALIC,
		color:Zookee.UI.COLOR.PARTY_CONTENT
	})
	var password = Ti.UI.createTextField({
		//hintText : L('Password'),
		//top : '10%',
		width:Ti.UI.FILL,
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
		passwordMask : true,
		font : Zookee.FONT.NORMAL_FONT,
		keyboardType : Ti.UI.KEYBOARD_DEFAULT,
		returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	passArea.add(passImplication);
	passArea.add(password);
	var username = Ti.UI.createTextField({
		hintText : L('email') + ' ' + L('or') + ' ' + L('username'),
		top : '10%',
		left : SystemWidth * 0.05,
		width : '60%',
		height:Ti.UI.FILL,
		verticalAlign:Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
		font : Zookee.FONT.NORMAL_FONT,
		keyboardType : Ti.UI.KEYBOARD_EMAIL,
		enableReturnKey:false,
		returnKeyType : Ti.UI.RETURNKEY_DONE,
		borderStyle:Ti.UI.INPUT_BORDERSTYLE_NONE
	});
	if (Ti.App.Properties.hasProperty('email')) {
		username.setValue(Ti.App.Properties.getString('email'));
	}

	// the label and button take you to the register view
	var buttons = Ti.UI.createView({
		left : '5%',
		right:'5%',
		bottom:'3%',
		height : Ti.UI.SIZE,
		layout:'horizontal'
	});

	var loginBtn_bg = Ti.UI.createView({
		right:0,
		backgroundColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		backgroundSelectedColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		borderRadius : Zookee.UI.Border_Radius_Small,
		width : Zookee[80],
		height : Ti.UI.FILL
	});
	var loginBtn = Ti.UI.createButton({
		center:{
			x:'50%',
			y:'50%'
		},
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		//backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		backgroundSelectedColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		width:Zookee[40],
		height:Zookee[40],
		image:Zookee.ImageURL.Send
	});
	loginBtn_bg.add(loginBtn);
	
	var registerLabel = Ti.UI.createLabel({
		left:'5%',
		textid:'register_implication',
		font:Zookee.FONT.SMALL_FONT_ITALIC,
		width:Ti.UI.SIZE,
		color:Zookee.UI.COLOR.PARTY_CONTENT
	})

	var signupBtn = Ti.UI.createButton({
		title : L('Sign_Up'),
		left:Zookee[20],
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		color : 'white',
		borderRadius : Zookee.UI.Border_Radius_Small,
		width : Ti.UI.SIZE,
		height : SystemHeight * 0.05,
		font:Zookee.FONT.SMALL_FONT
	});
	background.add(loginBtn_bg);

	buttons.add(registerLabel);
	buttons.add(signupBtn);

	password.addEventListener('return', function(e) {
		loginBtn.fireEvent('click');
	});

	var loginFn = function() {
		var user = {};
		user.email = username.value;
		user.password = password.value;
		var actInd = Titanium.UI.createActivityIndicator({
				center : {
					x : '50%',
					y : '50%'
				},
				bottom : 10,
				height : 20,
				style:Zookee.isAndroid?Ti.UI.ActivityIndicatorStyle.PLAIN:
				                       Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN
			});
		//var actInd = Util.actIndicator(L('Logging'), background);
		loginBtn_bg.remove(loginBtn);
		loginBtn_bg.add(actInd);
		actInd.show();

		delegate.login(user, function() {
			var _user = Zookee.User.CurrentUser
			Ti.App.Properties.setString('email', username.value);
			Ti.App.Properties.setString('password', password.value);

			var win1 = Ti.UI.createWindow({
				windowSoftInputMode : Zookee.Soft_Input.SOFT_INPUT_ADJUST_PAN,
				navBarHidden : true,
				fullscreen : false,
				exitOnClose : true,
				backgroundImage:Zookee.ImageURL.Background
			});
			win1.backClicked = 0;
			Zookee.currentWindow = win1;

			var MainView = require('ui/MainView').MainView;

			mainView = new MainView(win1);
			win1.add(mainView.view);
			win1.addEventListener('android:back', function() {
				Util.showExitInfo(win1);
			})
			win1.open();
			actInd.hide();
			mainView.getCurrentView().refresh();

		}, function() {
			actInd.hide();
			loginBtn_bg.remove(actInd)
			loginBtn_bg.add(loginBtn);
		});
	}

	loginBtn.addEventListener('click', function() {
		if (!username.value) {
			alert('User name is mandatroy');
			return;
		} else if (Zookee.PASSCODE_ENABLED &&
			Ti.App.Properties.hasProperty('passcode')&&
			 Ti.App.Properties.getString('passcode')!='') {
			win.add(new PopUp(loginFn,'login',win));
			return;
		} 

		loginFn();
	});

	signupBtn.addEventListener('click', function() {
		var RegisterView = require('ui/RegisterSimple');
		var win = Ti.UI.createWindow({
			windowSoftInputMode : Zookee.Soft_Input.SOFT_INPUT_STATE_HIDDEN | Zookee.Soft_Input.SOFT_INPUT_ADJUST_RESIZE,
			navBarHidden : true,
			exitOnClose:true,
			backgroundImage:Zookee.ImageURL.Background
		});
		var registerView = new RegisterView(win);
		win.add(registerView);

		win.open();
	});

	var shadow = Ti.UI.createView({
		left : '6%',
		width : '88%',
		height : '1%',
		top : '55%',
		backgroundImage : Zookee.ImageURL.Shadow
	});

	setTimeout(function() {
		background.add(username);
	}, 300);

	view.add(title);
	view.add(scrollView);
	scrollView.add(background);
	scrollView.add(shadow);
	if(!Ti.App.Properties.hasProperty('email')){
		scrollView.add(needPassword);
	}
	view.add(buttons);
	return view;
};

module.exports = LoginView;

