/**
 * @author kent hao
 */
var Util = require('Util');
var delegate = require('backend/Delegate');
var Zookee = require('Zookee');
var ImageView = require('ui/ImageView');
var people = [];
var email_querablePeople = {};
var phones = [];
var loaded = false;

var user = Zookee.User.CurrentUser
var shadow = Ti.UI.createView({
	left : '4%',
	right : '4%',
	height : '2%',
	top : '90%',
	backgroundImage : Zookee.ImageURL.Shadow
});

var createButton = function(titleid) {
	return Ti.UI.createButton({
		titleid : titleid,
		center : {
			x : '60%',
			y : '50%'
		},
		//top : '20%',
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		height : Ti.UI.SIZE,
		width : Ti.UI.SIZE,
		backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		color : 'white',
		borderRadius : Zookee.UI.Border_Radius_Small,
		font : Zookee.FONT.NORMAL_FONT
	});
}
var view1 = Ti.UI.createView({
	//top : 10,
	//bottom : 30,
	top : 0,
	bottom : 0,
	width : Ti.UI.FILL
	//layout : 'vertical'
})

var friendsTable = Ti.UI.createTableView({
	data : [],
	top : '2%',
	left : '2%',
	right : '2%',
	height : '88%',
	backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
	allowsSelection : false,
	bubbleParent : false,
	separatorStyle : Ti.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE
});
if (Zookee.isAndroid) {
	friendsTable.separatorColor = 'transparent';
}

friendsTable.addEventListener('click', function(e) {
	if (e.source.tag == 'phone') {
		Ti.Platform.openURL('tel:' + e.row.phone);
	} else if (e.source.tag == 'invite') {
		//TODO: if phone exists, invite by sms, if not, use email instead
		if (e.source.user.key) {
			Ti.Platform.openURL('sms:' + e.source.user.key +'?body=great');
		} else if (e.source.user.email) {
			var to;
			if (e.source.user.email.home) {
				to = e.source.user.email.home;
			} else if (e.source.user.email.work) {
				to = e.source.user.email.work;
			} else if (e.source.user.email.other) {
				to = e.source.user.email.other;
			}
			if (to) {
				var body = String.format(L('invitation_body'),Zookee.User.CurrentUser.username);
				var subject = String.format(L('invitation_subject'),Zookee.User.CurrentUser.username);
				var mailto_link = to + "?body=" + body + "&subject=" + subject;
				Ti.Platform.openURL('mailto:' + mailto_link);
			}
		}
	} else if (e.source.tag == 'add') {
		var actInd = Util.actIndicator(L('ongoing'), view1, true);
		actInd.show();
		// TODO: query user first, then add
		delegate.addFriend(e.source.user.id, function() {
			actInd.hide();
			if (Zookee.Notification.Enabled) {
				delegate.notify(Zookee.Notification.Friend_Channel, [e.source.user], Zookee.Notification.MessageType.REQUEST)
			}
			//e.row.remove(e.source);
			e.source.title = L('wait_4_approve');
			e.source.touchEnabled = false;
			friendsTable.updateRow(e.index, e.row);
		}, function() {
			actInd.hide();
		});
	}
});
var legendView = Ti.UI.createView({
	width : Ti.UI.FILL,
	layout : 'horizontal',
	top : '92%'
})

legendView.add(Ti.UI.createView({
	left : '15%',
	width : Zookee[20],
	height : Zookee[20],
	borderRadius : Zookee[10],
	backgroundImage : Zookee.ImageURL.Already
}))

legendView.add(Ti.UI.createLabel({
	left : '10%',
	width : Ti.UI.SIZE,
	height : Ti.UI.SIZE,
	font : Zookee.FONT.NORMAL_FONT_ITALIC,
	color : Zookee.UI.COLOR.PARTY_CONTENT,
	textid : 'alreadyzookee'
}))

var populateContactsTable = function(people, possibleUsers) {
	//var baseString = JSON.stringify(possibleUsers);
	var data = [];
	for (var i = 0; i < people.length; i++) {
		var phone = ' ';
		if (people[i].key) {
			phone = people[i].key;
		}

		var invited = false;
		var row = Ti.UI.createTableViewRow({
			height : Ti.UI.SIZE,
			//layout : 'horizontal',
			className : 'localContact',
			phone : phone
		});

		var rightView = Ti.UI.createView({
			right : Zookee[10],
			width : Ti.UI.SIZE,
			height : Ti.UI.SIZE
		})

		var avatar = Ti.UI.createView({
			left : Zookee[10],
			top : Zookee[5],
			bottom : Zookee[5],
			width : Zookee[40],
			height : Zookee[40],
			borderColor : 'white',
			borderWidth : Zookee[2],
			tag : 'phone',
			backgroundImage : people[i].photo ? people[i].photo : Zookee.ImageURL.No_Avatar
		});

		var userLabel = Ti.UI.createLabel({
			text : people[i].fullName,
			left : Zookee[60],
			font : Zookee.FONT.NORMAL_FONT,
			wordWrap : false,
			tag : 'phone'
		})

		var inviteBtn = Ti.UI.createButton({
			titleid : 'Invite',
			right : 0,
			//top : '20%',
			height : Ti.UI.SIZE,
			width : Ti.UI.SIZE,
			style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
			backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
			backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
			color : 'white',
			font : Zookee.FONT.NORMAL_FONT,
			borderRadius : Zookee.UI.Border_Radius_Small,
			user : people[i],
			tag : 'invite'
		});
		row.add(avatar);
		row.add(userLabel);
		row.add(rightView);
		if ( phone in possibleUsers) {
			// here, set the title instead of titleid,
			// because on iOS, titleid looks like a create-only property.
			inviteBtn.title = L('request_as_friend');
			inviteBtn.tag = 'add';
			inviteBtn.user = {
				'id' : possibleUsers[phone]
			};
			avatar.add(Ti.UI.createView({
				bottom : 0,
				right : 0,
				width : Zookee[20],
				height : Zookee[20],
				borderRadius : Zookee[10],
				backgroundImage : Zookee.ImageURL.Already
			}))
			row.className = 'already';
			if (i == 0) {
				data.push(row);
				//friendsTable.appendRow(row);
			} else {
				data = [row].concat(data);
				//friendsTable.insertRowBefore(0, row);
			}
		} else {
			data.push(row);
			//friendsTable.appendRow(row);
		}
		rightView.add(inviteBtn);
	}
	friendsTable.setData(data);
}
var getLocalContacts = function() {
	var actInd = Util.actIndicator(L('Loading'), view1, false, Ti.UI.iPhone.ActivityIndicatorStyle.DARK);
	actInd.show();
	people = Ti.Contacts.getAllPeople();
	loaded = true;
	for (var i = 0; i < people.length; i++) {
		var _key = null;

		// contact without phone num is not a close friend.
		if (!people[i].phone) {
			continue;
		}
		if (people[i].phone.mobile) {
			_key = people[i].phone.mobile[0];
			people[i].key = _key;
			if (phones.indexOf(_key) > 0)
				continue;
		} else if (people[i].phone.home) {
			_key = people[i].phone.home[0];
			people[i].key = _key;
			if (phones.indexOf(_key) > 0)
				continue;
		} else if (people[i].phone.work) {
			_key = people[i].phone.work[0];
			people[i].key = _key;
			if (phones.indexOf(_key) > 0)
				continue;
		}
		if (_key) {
			phones.push(_key);
		}
	}
	// query possible friends
	delegate.queryUser(phones, function(users) {
		populateContactsTable(people, users);
		actInd.hide();
		view1.remove(actInd);
		view1.add(friendsTable);
		view1.add(shadow);
		view1.add(legendView);
	}, function() {
		//view1.add(friendsLabel);
		actInd.hide();
		view1.remove(actInd);
		view1.add(friendsTable);
		view1.add(shadow);

	})
}
//view.add(searchView);
//view.add(view1);
function LocalContacts() {
	if (!loaded) {
		if (!Zookee.isAndroid)
			Ti.Contacts.requestAuthorization(getLocalContacts);
		else
			getLocalContacts();
	}
	return view1;
}

module.exports = LocalContacts;
