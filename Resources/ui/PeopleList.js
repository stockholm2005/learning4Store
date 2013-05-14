/**
 * @author Kent hao
 */
var ImageDelegate = require('backend/ImageDelegate');
var imageDelegate = new ImageDelegate();
var Zookee = require('Zookee');
var SettingPad = require('ui/Setting');
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
		top:Zookee.UI.HEIGHT_TITLE,
		left : 0,
		right : 0,
		layout : 'vertical'
	});

	var settingView;
	var refreshBtn = Ti.UI.createButton({
		backgroundImage : Zookee.ImageURL.Refresh,
		backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		width : Zookee[40],
		height : Zookee[40],
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		opacity : 0,
		touchEnabled : false
	})
	if (page == 0) {
		refreshBtn.opacity = 1;
		refreshBtn.touchEnabled = true;
	}
	titleView.addView(refreshBtn);
	titleView.addView(refreshInd);
	refreshBtn.addEventListener('click', function() {
		refreshBtn.opacity = 0;
		refreshBtn.touchEnabled = false;
		titleView.addView(refreshInd);
		refreshInd.show();

	})
	var segmentControl = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : Zookee.UI.HEIGHT_SEGMENT,
		layout : 'horizontal',
		backgroundColor : Zookee.UI.COLOR.CONTROL_BACKGROUND
	});

	var segment0 = Ti.UI.createLabel({
		text : L('my_ads','My Ads'),
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

	segmentControl.add(segment0);
	segmentControl.add(Lines.VerticalLine(Zookee.UI.COLOR.LINE_IN_SEG));
	segmentControl.add(segment1);

	view.add(segmentControl);

	win.add(view);
	//
	var changeTextStyle = function(page) {
		segment0.color = page == 0 ? 'white' : Zookee.UI.COLOR.SEGMENT_FONT;
		segment0.font = page == 0 ? boldStyle : normalStyle;
		segment1.color = page == 1 ? 'white' : Zookee.UI.COLOR.SEGMENT_FONT;
		segment1.font = page == 1 ? boldStyle : normalStyle;
	}
	win.addEventListener('open', function() {
		changeTextStyle(page);

		switch(page) {
			case 0:
				adsList = new AdsList(myPad);
				refreshBtn.opacity = 0;
				refreshBtn.touchEnabled = false;
				titleView.addView(refreshInd);
				refreshInd.show();
				settingView = Ti.UI.createView();
				break;
			case 1:
				adsList = Ti.UI.createView();
				//localContacts.loaded = true;
				settingView = Ti.UI.createView();
				break;
		}

		var scrollView = Ti.UI.createScrollableView({
			views : [adsList, settingView],
			currentPage : page,
			disableBounce : true
		})
		view.add(scrollView);

		scrollView.addEventListener('scrollend', function(e) {
			//if(e.currentPage == undefined) return;
			changeTextStyle(e.currentPage);

			switch(e.currentPage) {
				case 0:
					break;
				case 1:
					break;
			}
		});
	})

	return win;
};

module.exports = PeoplePad;
