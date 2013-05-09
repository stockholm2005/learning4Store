/**
 * @author Kent hao
 */
var ImageDelegate = require('backend/ImageDelegate');
var imageDelegate = new ImageDelegate();
var Zookee = require('Zookee');
var SettingPad = require('ui/Setting');
var FriendsList = require('ui/FriendsList');
var LocalContacts = require('ui/LocalContacts');
var boldStyle = Zookee.FONT.SEGMENT_FONT_SELECTED;
var normalStyle = Zookee.FONT.SEGMENT_FONT_UNSELECTED;
var TitleView = require('ui/TitleView');

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
	var friends;
	var requests;
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
	var friendsList;
	var localContacts;
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
		friendsList.refreshRemoteContacts(function() {
			refreshInd.hide();
			titleView.removeView(refreshInd);
			if (page == 0) {
				refreshBtn.opacity = 1;
				refreshBtn.touchEnabled = true;
			} else {
				refreshBtn.opacity = 0;
				refreshBtn.touchEnabled = false;
			}
		}, true);
	})
	var segmentControl = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : Zookee.UI.HEIGHT_SEGMENT,
		layout : 'horizontal',
		backgroundColor : Zookee.UI.COLOR.CONTROL_BACKGROUND
	});

	var segment0 = Ti.UI.createLabel({
		text : L('Zookee'),
		textAlign : 'center',
		verticalAlign : 'center',
		width : '32%',
		color : Zookee.UI.COLOR.SEGMENT_FONT,
		font : normalStyle
	});
	var segment1 = Ti.UI.createLabel({
		text : L('Local'),
		textAlign : 'center',
		verticalAlign : 'center',
		width : '32%',
		color : Zookee.UI.COLOR.SEGMENT_FONT,
		font : normalStyle
	});

	var segment2 = Ti.UI.createLabel({
		text : L('setting'),
		textAlign : 'center',
		verticalAlign : 'center',
		width : '32%',
		color : Zookee.UI.COLOR.SEGMENT_FONT,
		font : normalStyle
	});

	segmentControl.add(segment0);
	segmentControl.add(Lines.VerticalLine(Zookee.UI.COLOR.LINE_IN_SEG));
	segmentControl.add(segment1);
	segmentControl.add(Lines.VerticalLine(Zookee.UI.COLOR.LINE_IN_SEG));
	segmentControl.add(segment2);

	view.add(segmentControl);

	win.add(view);
	//
	var changeTextStyle = function(page) {
		segment0.color = page == 0 ? 'white' : Zookee.UI.COLOR.SEGMENT_FONT;
		segment0.font = page == 0 ? boldStyle : normalStyle;
		segment1.color = page == 1 ? 'white' : Zookee.UI.COLOR.SEGMENT_FONT;
		segment1.font = page == 1 ? boldStyle : normalStyle;
		segment2.color = page == 2 ? 'white' : Zookee.UI.COLOR.SEGMENT_FONT;
		segment2.font = page == 2 ? boldStyle : normalStyle;
	}
	win.addEventListener('open', function() {
		changeTextStyle(page);

		switch(page) {
			case 0:
				friendsList = new FriendsList(myPad);
				friendsList.loaded = true;
				refreshBtn.opacity = 0;
				refreshBtn.touchEnabled = false;
				titleView.addView(refreshInd);
				refreshInd.show();
				friendsList.refreshRemoteContacts(function() {
					refreshInd.hide();
					refreshInd.isShown = false;
					titleView.removeView(refreshInd);
					if (page == 0) {
						refreshBtn.opacity = 1;
						refreshBtn.touchEnabled = true;
					} else {
						refreshBtn.opacity = 0;
						refreshBtn.touchEnabled = false;
					}
				});
				localContacts = Ti.UI.createView();
				settingView = Ti.UI.createView();
				break;
			case 1:
				friendsList = Ti.UI.createView();
				localContacts = new LocalContacts();
				//localContacts.loaded = true;
				settingView = Ti.UI.createView();
				break;
			case 2:
				friendsList = Ti.UI.createView();
				localContacts = Ti.UI.createView();
				settingView = new SettingPad(win, myPad);
				settingView.loaded = true;
				break;
		}

		var scrollView = Ti.UI.createScrollableView({
			views : [friendsList, localContacts, settingView],
			currentPage : page,
			disableBounce : true
		})
		view.add(scrollView);

		scrollView.addEventListener('scrollend', function(e) {
			//if(e.currentPage == undefined) return;
			changeTextStyle(e.currentPage);

			switch(e.currentPage) {
				case 0:
					if (!friendsList.loaded) {
						var _friendsList = new FriendsList(myPad);
						friendsList.add(_friendsList);
						refreshBtn.opacity = 0;
						refreshBtn.touchEnabled = false;
						//titleView.addView(refreshInd);
						refreshInd.show();
						_friendsList.refreshRemoteContacts(function() {
							refreshInd.hide();
							friendsList.loaded = true;
							titleView.removeView(refreshInd);
							refreshBtn.opacity = 1;
							refreshBtn.touchEnabled = true;
						});
					}else{
						refreshBtn.opacity = 1;
						refreshBtn.touchEnabled = true;
					}
					break;
				case 1:
					if (!localContacts.loaded) {
						localContacts.add(new LocalContacts());
						//localContacts.loaded = true;
					}
					refreshBtn.opacity = 0;
					refreshBtn.touchEnabled = false;
					refreshInd.hide();
					break;
				case 2:
					if (!settingView.loaded) {
						settingView.add(new SettingPad(win, myPad));
						settingView.loaded = true;
					}
					refreshBtn.opacity = 0;
					refreshBtn.touchEnabled = false;
					refreshInd.hide();
					break;
			}
		});
	})

	return win;
};

module.exports = PeoplePad;
