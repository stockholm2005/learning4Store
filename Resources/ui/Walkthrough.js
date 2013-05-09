/**
 * @author kent hao
 */
var Zookee = require('Zookee');
var Util = require('Util');
var SystemWidth = Ti.Platform.displayCaps.platformWidth;
var SystemHeight = Ti.Platform.displayCaps.platformHeight;
var LoginViewNoPass = require('ui/LoginNoPass');
var RegisterView = require('ui/RegisterSimple');

function Walkthrough(win) {
	var view = Ti.UI.createView({
		width:Ti.UI.FILL,
		height:Ti.UI.FILL,
		//backgroundColor : 'white',
		//backgroundImage:Zookee.ImageURL.Background,
	});
	
	var slogon = Ti.UI.createLabel({
		textid:'Zookee',
		font:Zookee.FONT.LARGE_FONT_ITALIC,
		color:Zookee.UI.COLOR.MYPAD_BACKGROUND,
		left:Zookee[50],
		center:{
			x:'50%',
			y:'10%'
		}
	})
	view.add(slogon);
	
	var walkthrough1 = Ti.UI.createView({
		layout:'vertical'
	})
	walkthrough1.add(Ti.UI.createImageView({
		image:Zookee.ImageURL.Empty_Photo
	}))
	walkthrough1.add(Ti.UI.createLabel({
		top:Zookee[10],
		left:Zookee[50],
		right:Zookee[50],
		textid:'walkthrough1',
		font:Zookee.FONT.NORMAL_FONT_ITALIC,
		color:Zookee.UI.COLOR.PARTY_CONTENT
	}))
	var walkthrough2 = Ti.UI.createView({
		layout:'vertical'
	})
	walkthrough2.add(Ti.UI.createImageView({
		image:Zookee.ImageURL.Empty_Photo
	}))
	walkthrough2.add(Ti.UI.createLabel({
		top:Zookee[10],
		left:Zookee[50],
		right:Zookee[50],
		textid:'walkthrough2',
		font:Zookee.FONT.NORMAL_FONT_ITALIC,
		color:Zookee.UI.COLOR.PARTY_CONTENT
	}))
	var walkthrough3 = Ti.UI.createView({
		layout:'vertical'
	})
	walkthrough3.add(Ti.UI.createImageView({
		image:Zookee.ImageURL.Empty_Photo
	}))
	walkthrough3.add(Ti.UI.createLabel({
		top:Zookee[10],
		left:Zookee[50],
		right:Zookee[50],
		textid:'walkthrough3',
		font:Zookee.FONT.NORMAL_FONT_ITALIC,
		color:Zookee.UI.COLOR.PARTY_CONTENT
	}))
	var scrollView = Ti.UI.createScrollableView({
		bottom:'12%',
		width:Ti.UI.FILL,
		height:'70%',
		showPagingControl : false,
		pagingControlHeight : Zookee[10],
		disableBounce : true,
		bubbleParent : false	,
		pagingControlColor:'transparent',
		views:[walkthrough1,walkthrough2,walkthrough3]	
	})
	scrollView.addEventListener('scrollend',function(e){
		if(Zookee.isAndroid){
			view.scroll(e.currentPage);
		}
	})
	view.add(scrollView);

	if (!Zookee.isAndroid) {
		scrollView.showPagingControl = true;
	}
	
	if(Zookee.isAndroid){
		var controls_bg = Ti.UI.createView({
			center:{
				x:'50%',
				y:'85%'
			},
			width:Ti.UI.SIZE,
			height:Ti.UI.SIZE,
			layout:'horizontal',
			dots:[]
		})
		for(var i=0;i<3;i++){
			var dot = Ti.UI.createView({
				left:Zookee[10],
				width:Zookee[10],
				height:Zookee[10],
				borderRadius:Zookee[5],
				backgroundColor:i==0?'white':'black'
			})
			controls_bg.add(dot);
			controls_bg.dots.push(dot);
		}
		view.add(controls_bg);
		view.scroll=function(index){
			controls_bg.dots[index].backgroundColor='white';
			for(var i = 0;i<3;i++){
				if(i===index) continue;
				else controls_bg.dots[i].backgroundColor='black';
			}
		}
	}
		
	var rgBtn = Ti.UI.createButton({
		left:Zookee[20],
		color:'white',
		borderWidth:0,
		width:Ti.UI.SIZE,
		titleid:'Register',
		backgroundColor:'transparent',
		font:Zookee.FONT.NORMAL_FONT,
		style:Ti.UI.iPhone.SystemButtonStyle.PLAIN	
	})
	rgBtn.addEventListener('click',function(){
		var registerView = new RegisterView();
		win.remove(view);
		win.add(registerView);
	})
	var lgBtn = Ti.UI.createButton({
		right:Zookee[20],
		color:'white',
		borderWidth:0,
		width:Ti.UI.SIZE,
		titleid:'Login',
		font:Zookee.FONT.NORMAL_FONT,
		backgroundColor:'transparent',
		style:Ti.UI.iPhone.SystemButtonStyle.PLAIN	
	})
	lgBtn.addEventListener('click',function(){
		var loginView = new LoginViewNoPass(win);
		win.remove(view);
		win.add(loginView);
	})
	//if (Zookee.isAndroid) {
	var	toolbar = Ti.UI.createView({
			bottom : 0,
			width : Ti.UI.FILL,
			height : Zookee[60],
			backgroundGradient : Zookee.UI.BackgroundGradient,
			bubbleParent : false
		})
		toolbar.add(rgBtn);
		toolbar.add(lgBtn);
	//} else {
		// var flexSpace = Titanium.UI.createButton({
    			// systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
		// });
		// toolbar = Ti.UI.iOS.createToolbar({
			// bottom : 0,
			// items : [rgBtn, flexSpace,lgBtn],
			// borderTop : true,
			// borderBottom : false,
			// bubbleParent : false,
			// backgroundImage:Zookee.ImageURL.Toolbar_Background,
			// barColor:'transparent',
			// translucent:true
		// })
	// }
	view.add(toolbar);

	return view;
};

module.exports = Walkthrough;

