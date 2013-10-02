/**
 * @author Angela Deng
 */
var Zookee=require('Zookee');

function PopUp(okCB, opType,win,passCode) {
	var scrollView = Ti.UI.createScrollView({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		backgroundColor:'black',
		disableBounce:true,
		opacity:0.8
	})
	scrollView.bubbleParent = false;

	var container = Ti.UI.createView({
		center : {
			x : '50%',
			y : '50%'
		},
		//top:'20%',
		width : '90%',
		height : Ti.UI.SIZE,
		backgroundColor : 'white',
		//borderRadius:Zookee.UI.Border_Radius_Normal,
		layout : 'vertical',
		tag:'s'
	})
	container.bubbleParent=false;
	
	scrollView.addEventListener('singletap', function(e) {
		if(!e.source.tag)
			win.remove(scrollView);
	})
	var headerView = Ti.UI.createView({
		height : Ti.UI.SIZE,
		width : Ti.UI.FILL,
		backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		tag:'s'
	});
	headerView.add(Ti.UI.createLabel({
		text : L('passcode','passcode'),
		left : Zookee[20],
		top : Zookee[10],
		bottom : Zookee[10],
		height : Ti.UI.SIZE,
		color : 'white',
		font : Zookee.FONT.NORMAL_FONT,
		tag:'s'
	}));
	var help = Ti.UI.createLabel({
		text:'?',
		textAlign:'center',
		right:Zookee[20],
		top:Zookee[10],
		bottom:Zookee[10],
		width:Zookee[30],
		height:Zookee[30],
		borderRadius:Zookee[15],
		borderWidth:Zookee[2],
		borderColor:'white',
		color:'white',
		font:Zookee.FONT.NORMAL_FONT,
		tag:'s'
	})
	help.addEventListener('click',function(e){
		if(opType === 'login'){
			Ti.UI.createAlertDialog({
				title:L('help','Help'),
				message:L('passcode_help_login','if you set the passcode last time when you logged out, you need to input the passcode now')
			}).show();			
		}else{
			Ti.UI.createAlertDialog({
				title:L('help','Help'),
				message:L('passcode_help_logout','if you set passcode, next time when you log in, you need to input the passcode')
			}).show();
		}
	})
	headerView.add(help);
	container.add(headerView);
	container.add(Ti.UI.createView({
		left : 0,
		right : 0,
		top : 0,
		height : Zookee[4],
		backgroundColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		tag:'s'
	}))

	var pass_container = Ti.UI.createView({
		top:Zookee[10],
		width : Ti.UI.FILL,
		height : Ti.UI.SIZE,
		layout:'horizontal',
		tag:'s'
	})
	pass_container.bubbleParent=false;
	
	var pass_field = Ti.UI.createTextField({
		left:Zookee[10],
		height:Zookee[40],
		passwordMask:true,
		width:'60%',
		borderStyle:Ti.UI.INPUT_BORDERSTYLE_NONE,
		backgroundColor:'white',
		tag:'s'
	})
	var pass_okBtn = Ti.UI.createButton({
		left:Zookee[30],
		width:Zookee[80],
		height:Zookee[40],
		title : L('ok','Ok'),
		color:'white',
		backgroundColor:Zookee.UI.COLOR.COLOR2,
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		tag:'s'
	})
	pass_container.add(pass_field);
	pass_container.add(pass_okBtn)
	container.add(pass_container);

	var disable_pass_mask = Ti.UI.createView({
		layout:'horizontal',
		top:Zookee[10],
		height:Zookee[26],
		width:Ti.UI.FILL,
		tag:'s'
	})
	
	var checkbox= Ti.UI.createView({
		left:Zookee[10],
		top:Zookee[2],
		bottom:Zookee[2],
		width:Zookee[20],
		height:Zookee[20],
		backgroundColor:'white',
		borderWidth:Zookee[1],
		borderColor:Zookee.UI.COLOR.PARTY_CONTENT,
		tag:'s'
	})
	
	disable_pass_mask.add(checkbox);
	
	disable_pass_mask.add(Ti.UI.createLabel({
		left:Zookee[10],
		text:L('show_char','show characters'),
		tag:'s',
		color:Zookee.UI.COLOR.PARTY_CONTENT,
		font:Zookee.FONT.SMALL_FONT
	}))
	
	checkbox.addEventListener('click',function(){
		if(checkbox.backgroundColor == 'white'){
			checkbox.backgroundColor = Zookee.UI.COLOR.MYPAD_BACKGROUND;
			pass_field.passwordMask = false;
		}else{
			checkbox.backgroundColor = 'white';
			pass_field.passwordMask = true;
		}
	})
	
	container.add(disable_pass_mask);
	
	var errorLabel = Ti.UI.createLabel({
		text : L('passcode_err','wrong passcode'),
		color:'red',
		opacity : 0,
		tag:'s',
		font:Zookee.FONT.SMALL_FONT
	})
	container.add(errorLabel);

	scrollView.add(container);

	pass_okBtn.addEventListener('click', function() {
		if (opType === 'login') {
			if (pass_field.value === passCode) {
				win.remove(scrollView);
				okCB();
			} else {
				errorLabel.opacity = 1;
				Ti.Media.vibrate();
			}
		} else if (opType === 'logout') {
			var user = Zookee.User.CurrentUser;
			var obj = Ti.App.Properties.getObject('passcode')||{};
			obj[user.email]=pass_field.value;
			obj[user.username]=pass_field.value;
			Ti.App.Properties.setObject('passcode', obj);
			pass_field.blur();
			win.remove(scrollView);
			okCB();
		}
	})
	return scrollView;
}

module.exports = PopUp; 
