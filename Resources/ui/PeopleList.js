/**
 * @author Kent hao
 */
var ImageDelegate = require('backend/ImageDelegate');
var imageDelegate = new ImageDelegate();
var Zookee = require('Zookee');
var SettingPad = require('ui/Setting');
var NewPostWin = require('ui/NewPost');
var boldStyle = Zookee.FONT.SEGMENT_FONT_SELECTED;
var normalStyle = Zookee.FONT.SEGMENT_FONT_UNSELECTED;
var TitleView = require('ui/TitleView');
var AdsList = require('ui/AdsList');

var refreshInd = Ti.UI.createActivityIndicator({
	style : Zookee.isAndroid ? Ti.UI.ActivityIndicatorStyle.PLAIN : Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN
})
function PeoplePad(myPad, page) {
	var win = Ti.UI.createWindow({
		backgroundImage : Zookee.ImageURL.Background
	});
	var data = [];
	var delegate = require('backend/Delegate');
	var Lines = require('ui/Lines');
	var Util = require('Util');
	var user = Zookee.User.CurrentUser
	var that = this;
	var titleView = TitleView.buildTitleView(win);
	win.add(titleView);
	view = Ti.UI.createView({
		top : Zookee.UI.HEIGHT_TITLE,
		left : 0,
		right : 0,
		layout : 'vertical'
	});

	var settingView = new SettingPad(win, myPad);
	var adsList = new AdsList(myPad);

	var refreshBtn = Ti.UI.createButton({
		backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		image:Zookee.ImageURL.Add,
		width : Zookee[40],
		height : Zookee[40],
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
	})

	titleView.addView(refreshBtn);
	titleView.addView(refreshInd);
	refreshBtn.addEventListener('click', function() {
			var win = new NewPostWin(adsList);
			win.open({
				modal : true
			});
	})
	var segmentControl = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : Zookee.UI.HEIGHT_SEGMENT,
		layout : 'horizontal',
		backgroundColor : Zookee.UI.COLOR.CONTROL_BACKGROUND
	});

	var segment0 = Ti.UI.createLabel({
		text : L('my_ads', 'My Ads'),
		textAlign : 'center',
		verticalAlign : 'center',
		width : '49%',
		color : Zookee.UI.COLOR.SEGMENT_FONT,
		font : normalStyle
	});

	var segment1 = Ti.UI.createLabel({
		text : L('setting'),
		textAlign : 'center',
		verticalAlign : 'center',
		width : '49%',
		color : Zookee.UI.COLOR.SEGMENT_FONT,
		font : normalStyle
	});
	segment1.addEventListener('click',function(e){
		changeTextStyle(1);
		view.remove(adsList);
		view.add(settingView);
	})
	segment0.addEventListener('click',function(e){
		changeTextStyle(0);
		view.remove(settingView);
		view.add(adsList);
	})
	segmentControl.add(segment0);
	segmentControl.add(Lines.VerticalLine(Zookee.UI.COLOR.LINE_IN_SEG));
	segmentControl.add(segment1);

	view.add(segmentControl);

	view.add(adsList);
	win.add(view);
	//
	var changeTextStyle = function(page) {
		segment0.color = page == 0 ? 'white' : Zookee.UI.COLOR.SEGMENT_FONT;
		segment0.font = page == 0 ? boldStyle : normalStyle;
		segment1.color = page == 1 ? 'white' : Zookee.UI.COLOR.SEGMENT_FONT;
		segment1.font = page == 1 ? boldStyle : normalStyle;
		if (page == 1) {
			refreshBtn.opacity = 0;
			refreshBtn.touchEnabled = false;
		}else{
			refreshBtn.opacity = 1;
			refreshBtn.touchEnabled = true;			
		}
	}

	win.addEventListener('open',function(e){
		changeTextStyle(0);
	})
	return win;
};

module.exports = PeoplePad;
