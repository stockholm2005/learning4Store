/**
 * @author kent hao
 */
var Zookee = require('Zookee');
	Util = require('Util'),
	delegate = require('backend/Delegate'),
	PopUp = require('ui/PopUp'),
	SystemWidth = Ti.Platform.displayCaps.platformWidth,
	SystemHeight = Ti.Platform.displayCaps.platformHeight,
	preferenceView = require('ui/Preference');

function LoginView(win) {
	view = Ti.UI.createView({
		top : 0,
		bottom : 0
		//backgroundColor : 'white',
		//backgroundImage:Zookee.ImageURL.Background,
		//layout:'vertical'
	});

	var title = Ti.UI.createLabel({
		text : L('product_name','ForTogether'),
		top : 0,
		left : 0,
		width : Ti.UI.FILL,
		height : SystemHeight * 0.075,
		textAlign : 'center',
		backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		color : 'white',
		font : Zookee.FONT.TITLE_FONT
	})
	
	var signupBtn = Ti.UI.createButton({
		title :' '+ L('Sign_Up','Signup')+' ',
		top:0,
		right:Zookee[20],
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor : 'transparent',
		backgroundSelectedColor : 'white',
		color : 'white',
		width : Ti.UI.SIZE,
		height : SystemHeight * 0.075,
		verticalAlign:Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
		font:Zookee.FONT.SMALL_FONT
	});
	var scrollView = Ti.UI.createScrollView({
		left:0,
		right:0,
		top:SystemHeight * 0.075,
		bottom:Zookee[80],
		layout:'vertical'
	})
	var background = Ti.UI.createView({
		backgroundColor : 'white',
		top:'45%',
		width:Ti.UI.FILL,
		height : Zookee[60]
	});
	// in case you login from another device, click here.
	var needPassword = Ti.UI.createLabel({
		left:'7%',
		right:'7%',
		top:Zookee[40],
		height:Ti.UI.SIZE,
		text:L('use_password','use password'),
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
		top:Zookee[10],
		layout:'vertical',
		left:'5%',
		right:'5%',
		opacity:0,
		height:Ti.UI.SIZE
	})
	var passImplication = Ti.UI.createLabel({
		width:Ti.UI.FILL,
		height:Ti.UI.SIZE,
		text:L('password_implication','you can login to ForTogether only from one device.\nif you login from the device other than the one you logged in last time, please use the password in the mail ForTogether sent to you when you registered or logged in last time.'),
		font:Zookee.FONT.SMALL_FONT_ITALIC,
		color:Zookee.UI.COLOR.PARTY_CONTENT
	})
	var password = Ti.UI.createTextField({
		//hintText : L('Password'),
		//top : '10%',
		height:Zookee[40],
		width:Ti.UI.FILL,
		backgroundColor : 'white',
		passwordMask : true,
		font : Zookee.FONT.NORMAL_FONT,
		keyboardType : Ti.UI.KEYBOARD_DEFAULT,
		returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_NONE
	});
	passArea.add(passImplication);
	passArea.add(password);
	var username = Ti.UI.createTextField({
		hintText : L('email','email'),
		left : Zookee[10],
		width : '60%',
		height:Ti.UI.FILL,
		verticalAlign:Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
		font : Zookee.FONT.NORMAL_FONT,
		keyboardType : Ti.UI.KEYBOARD_EMAIL,
		enableReturnKey:false,
		returnKeyType : Ti.UI.RETURNKEY_DONE,
		borderStyle:Ti.UI.INPUT_BORDERSTYLE_NONE,
		backgroundColor:'white'
	});
	if (Ti.App.Properties.hasProperty('email')) {
		username.setValue(Ti.App.Properties.getString('email'));
	}

	// the label and button take you to the register view
	var buttons = Ti.UI.createView({
		left : '2%',
		right:'2%',
		bottom:Zookee[20],
		height : Ti.UI.SIZE,
		layout:'horizontal'
	});

	var loginBtn_bg = Ti.UI.createView({
		right:0,
		backgroundColor : Zookee.UI.COLOR.COLOR2,
		backgroundSelectedColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
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

	background.add(loginBtn_bg);

	//buttons.add(registerLabel);
	//buttons.add(signupBtn);

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
			//Ti.App.Properties.setString('password', password.value);

			var win1 = Ti.UI.createWindow({
				windowSoftInputMode : Zookee.Soft_Input.SOFT_INPUT_ADJUST_PAN,
				navBarHidden : true,
				fullscreen : false,
				exitOnClose : true,
				backgroundImage:Zookee.ImageURL.Background
			});
			win1.backClicked = 0;
			Zookee.currentWindow = win1;

			win1.addEventListener('android:back', function() {
				Util.showExitInfo(win1);
			})
			win1.open();
			actInd.hide();
			var mask = Ti.UI.createView({
				width:Ti.UI.FILL,
				height:Ti.UI.FILL,
				backgroundColor:'black',
				opacity:0.85
			})
			win1.add(mask);
			mask.add(Ti.UI.createLabel({
				text:L('what_u_provide','What kind of service you provide?'),
				top:'40%',
				color:'white',
				font:Zookee.FONT.NORMAL_FONT
			}))
			var _width = Zookee[60];
			if(Zookee.isAndroid) _width = Zookee[400];
			var pref = new preferenceView({
				top:'50%',
				width:_width,
				height:Zookee[40],
				layout:'horizontal'
			},function(){
				pref.animate({
					width:Zookee[60],
					duration:300
				});
				setTimeout(function(){
					win1.remove(mask);
            			var MainView = require('ui/MainView').MainView;

            			mainView = new MainView(win1);
            			win1.add(mainView.view);
					mainView.refresh();
				},300);
			});
			mask.add(pref);
			if(!Zookee.isAndroid)
			pref.animate({
				width:Zookee[400],
				duration:300
			})
		}, function() {
			actInd.hide();
			loginBtn_bg.remove(actInd)
			loginBtn_bg.add(loginBtn);
		},true);
	}

	loginBtn.addEventListener('click', function() {
		var obj = Ti.App.Properties.getObject('passcode')||{};
		if (!username.value) {
			alert('User name or Email is mandatroy');
			return;
		} else if (obj[username.value] &&  obj[username.value]!= '') {
			win.add(new PopUp(loginFn, 'login', win,obj[username.value]));
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

	setTimeout(function() {
		background.add(username);
	}, 150);

	view.add(title);
	view.add(signupBtn);
	view.add(scrollView);
	scrollView.add(background);
	scrollView.add(needPassword);
	//view.add(buttons);
	return view;
};

module.exports = LoginView;

