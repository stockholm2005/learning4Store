/**
 * @author kent hao
 */
var Zookee = require('Zookee'),
	Util = require('Util'),
	Lines = require('ui/Lines'),
	delegate = require('backend/Delegate'),
	preferenceView = require('ui/Preference'),
	SystemWidth = Ti.Platform.displayCaps.platformWidth,
	SystemHeight = Ti.Platform.displayCaps.platformHeight;

function RegisterView() {
	var photoChanged = false;

	view = Ti.UI.createView({
		height:Ti.UI.FILL
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
		top:SystemHeight * 0.075,
		bottom:Zookee[80],
		layout:'vertical'
	})
	var background = Ti.UI.createView({
		backgroundColor : 'white',
		top:'40%',
		width:Ti.UI.FILL,
		height : SystemHeight*0.25,
		layout:'horizontal',
		horizontalWrap:false
	});

	var rightView= Ti.UI.createView({
        left:Zookee[5],
        width:'27%',
        //right:Zookee[5],
        height : Ti.UI.FILL,
        layout:'vertical'
        //backgroundColor:'red'
    });
    var avatar = Ti.UI.createView({
    		top:Zookee[5],
    		left:0,
        right : Zookee[5],
        height : SystemHeight*0.15,
        //backgroundColor:'green'
        backgroundImage : Zookee.ImageURL.No_Avatar,
    });
	var camera_bg = Ti.UI.createView({
		left : Zookee[4],
		bottom : Zookee[4],
		width : Zookee[25],
		height : Zookee[25],
		backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		borderRadius:Zookee[3]
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
		right : Zookee[4],
		bottom : Zookee[4],
		width : Zookee[25],
		height : Zookee[25],
		backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		borderRadius:Zookee[3]
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

	avatar.add(camera_bg);
	avatar.add(gallery_bg);
	camera_bg.addEventListener('click', function() {
		Ti.Media.showCamera({
			saveToPhotoGallery : false,
			success : function(event) {
				if (Zookee.isAndroid)
					avatar.backgroundImage = event.media.nativePath;
				else
					avatar.backgroundImage = event.media;
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
					avatar.backgroundImage = event.media.nativePath;
				else
					avatar.backgroundImage = event.media;
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
    		left:Zookee[5],
    		layout:'vertical',
    		width:'70%',
    		height:Ti.UI.SIZE
    })

    var emailField = Ti.UI.createTextField({
    		height:'30%',
        left : '5%',
        width : Ti.UI.FILL,
        hintText : L('email','email'),
        font : Zookee.FONT.NORMAL_FONT,
        keyboardType : Ti.UI.KEYBOARD_EMAIL,
        returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
        borderStyle : Ti.UI.INPUT_BORDERSTYLE_NONE,
		backgroundColor:'white',
        verticalAlign:Ti.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM
    });
    inputArea.add(emailField);
    inputArea.add(Lines.LineWithSpace('90%'));
        
    var phoneField = Ti.UI.createTextField({
    		height:'30%',
        left : '5%',    	
        width : Ti.UI.FILL,
        hintText : L('Phone','phone(optional)'),
        font : Zookee.FONT.NORMAL_FONT,
        keyboardType : Ti.UI.KEYBOARD_DEFAULT,
        returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
        borderStyle : Ti.UI.INPUT_BORDERSTYLE_NONE,
		backgroundColor:'white',
        verticalAlign:Ti.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM
    });
    inputArea.add(phoneField);
    inputArea.add(Lines.LineWithSpace('90%'));

    var addressField = Ti.UI.createTextField({
    		height:'30%',
        left : '5%',
        width : Ti.UI.FILL,
        hintText : L('address','address'),
        font : Zookee.FONT.NORMAL_FONT,
        keyboardType : Ti.UI.KEYBOARD_DEFAULT,
        returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
        borderStyle : Ti.UI.INPUT_BORDERSTYLE_NONE,
		backgroundColor:'white',
        verticalAlign:Ti.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM
    });
    inputArea.add(addressField);
    inputArea.add(Lines.LineWithSpace('90%'));
    background.add(inputArea);
    background.add(rightView);

	var registerBtn_bg = Ti.UI.createView({
		left:0,
		right:Zookee[5],
		top:Zookee[10],
		height:Zookee[40],
		backgroundColor : Zookee.UI.COLOR.COLOR2,
		backgroundSelectedColor : Zookee.UI.COLOR.MYPAD_BACKGROUND
		//width : SystemHeight*0.15
	});
	rightView.add(registerBtn_bg);
	var registerBtn = Ti.UI.createButton({
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
	registerBtn_bg.add(registerBtn);
	//background.add(registerBtn_bg);

	var buttons = Ti.UI.createView({
		left : '2%',
		right:'2%',
		bottom:Zookee[20],
		height : Ti.UI.SIZE,
		layout:'horizontal'
	});	
	var loginLabel = Ti.UI.createLabel({
		left:'5%',
		textid:'login_implication',
		font:Zookee.FONT.SMALL_FONT_ITALIC,
		width:Ti.UI.SIZE,
		color:Zookee.UI.COLOR.PARTY_CONTENT
	})

	var loginBtn = Ti.UI.createButton({
		title : ' '+L('Login','Login')+' ',
		left:Zookee[20],
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		color : 'white',
		width : Ti.UI.SIZE,
		height : SystemHeight * 0.05,
		font:Zookee.FONT.SMALL_FONT
	});

	buttons.add(loginLabel);
	buttons.add(loginBtn);

	phoneField.addEventListener('return', function() {
		addressField.focus();
	});

	addressField.addEventListener('return', function(e) {
		registerBtn.fireEvent('click');
	});

    registerBtn.addEventListener('click', function() {
        if (!emailField.value || emailField.value.trim() == '') {
            alert(String.format(L('mandatory_field'),L('email','email')));
            return;
        }
        if (!phoneField.value || phoneField.value.trim() == '') {
            alert(String.format(L('mandatory_field'),L('Phone','phone')));
            return;
        }
        var tmpUser = {};
        tmpUser.email = emailField.value;
        if (photoChanged) {
            tmpUser.photo = avatar.blob;
        }
        		var fullname = emailField.value.split('@')[0];
        		tmpUser.first_name = fullname;
        		tmpUser.last_name = fullname;

        if(Zookee.isAndroid){
        		tmpUser.password = Ti.Platform.id;
        }else{
        		tmpUser.password = Ti.Platform.id.substr(0,20);
        }
        tmpUser.custom_fields = {};
        tmpUser.custom_fields.phone = phoneField.value;
        tmpUser.custom_fields.address = addressField.value;
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
		registerBtn_bg.remove(registerBtn);
		registerBtn_bg.add(actInd);
		actInd.show();
        delegate.createUser(tmpUser, function() {

            actInd.hide();

            var win1 = Ti.UI.createWindow({
                navBarHidden : true,
                windowSoftInputMode : Zookee.Soft_Input.SOFT_INPUT_ADJUST_PAN,
                fullScreen : false,
                exitOnClose : true,
        			backgroundImage:Zookee.ImageURL.Background
            });
			Zookee.currentWindow = win1;
            win1.open();
            win1.addEventListener('android:back', function() {
                Util.showExitInfo(win1);
            })
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
			var pref = new preferenceView({
				top:'50%',
				width:Zookee[60],
				height:Ti.UI.SIZE
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
			pref.animate({
				width :Ti.Platform.displayCaps.platformWidth,
				duration : 300
			});
            //mainView.refresh();
        }, function() {
            actInd.hide();
            registerBtn_bg.remove(actInd);
			registerBtn_bg.add(registerBtn);
        });
    });

    loginBtn.addEventListener('click', function() {
        var win = Ti.UI.createWindow({
            windowSoftInputMode : Zookee.Soft_Input.SOFT_INPUT_STATE_HIDDEN | Zookee.Soft_Input.SOFT_INPUT_ADJUST_PAN,
            navBarHidden : true,
        		backgroundImage:Zookee.ImageURL.Background,
        		exitOnClose:true
        })
        var loginView = new LoginViewNoPass(win);

        win.add(loginView);
        win.open();
    });

	view.add(title);
	view.add(scrollView);
	scrollView.add(background);
	view.add(buttons);
	return view;
};

module.exports = RegisterView;

