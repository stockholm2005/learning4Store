/**
 * @author Angela Deng
 */
var Util = require('Util');
var delegate = require('backend/Delegate');
var Zookee = require('Zookee');
var ImageView = require('ui/ImageView');

function FriendsList(myPad) {
	var user = Zookee.User.CurrentUser

	var createButton = function(titleid, user) {
		return Ti.UI.createButton({
			titleid : titleid,
			center : {
				x : '60%',
				y : '50%'
			},
			style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
			//top : '20%',
			height : Ti.UI.SIZE,
			width : Ti.UI.SIZE,
			backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
			backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
			color : 'white',
			font : Zookee.FONT.NORMAL_FONT,
			borderRadius : Zookee.UI.Border_Radius_Small,
			user : user,
			touchEnabled : titleid == 'wait_4_approve' ? false : true
		});
	};

	var createRow = function(user, btnTitle) {
		var row = Ti.UI.createTableViewRow({
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE
		})
		var leftView = Ti.UI.createView({
			width : '30%',
			backgroundColor : 'green',
			height : 40,
			layout : 'horizontal'
		});
		var rightView = Ti.UI.createView({
			right : 0,
			width : '40%',
			height : Ti.UI.SIZE
		})
		var avatar = new ImageView({
			left : Zookee[10],
			top : Zookee[5],
			bottom : Zookee[5],
			width : Zookee[40],
			height : Zookee[40],
			borderColor : 'white',
			borderWidth : Zookee[2],
			url : user.photo.urls.avatar,
			image : user.photo.avatarImage,
			defaultImage : Zookee.ImageURL.No_Avatar,
			loadStatus : 'starting'
		});

		var userLabel = Ti.UI.createLabel({
			text : user.username,
			left : Zookee[60],
			height : Ti.UI.SIZE,
			font : Zookee.FONT.SMALL_FONT
		})
		leftView.add(avatar);
		leftView.add(userLabel);

		var removeBtn = createButton(btnTitle, user);
		rightView.add(removeBtn);
		row.add(avatar);
		row.add(userLabel);
		row.add(rightView);
		row.opBtn = removeBtn;
		return row;
	};

	var populateFriendsTable = function() {
		var data = [];
		for (var i = 0; i < user.friends.length; i++) {
			if (user.id == user.friends[i].id)
				continue;
			var row = createRow(user.friends[i], 'Remove');
			data.push(row);
		}
		return data;
	};

	var populateRequestTable = function() {
		var data = [];
		for (var j = 0; j < user.requests.length; j++) {
			var row = createRow(user.requests[j].user, 'approve');
			data.push(row);
		}
		return data;
	}
	var view = Ti.UI.createView({
		//layout : 'vertical'
	});

	var view1 = Ti.UI.createView({
		top : Zookee.SystemHeight * 0.0125,
		bottom : Zookee.SystemHeight * 0.0125,
		layout : 'vertical'
	})

	var searchView = Ti.UI.createView({
		top : 0,
		height : Ti.UI.SIZE,
		left : '2%',
		right : '2%',
		layout : 'vertical'
	});

	var fieldView = Ti.UI.createView({
		top : Zookee.SystemHeight * 0.025,
		width : Ti.UI.FILL,
		height : Ti.UI.SIZE,
		layout : 'horizontal'
	});
	var searchField = Ti.UI.createTextField({
		width : '85%',
		height : Ti.UI.SIZE,
		verticalAlign : 'bottom',
		hintText : L('search_friend'),
		font : Zookee.FONT.SMALL_FONT,
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_NONE
	})
	if (!Zookee.isAndroid) {
		searchField.borderStyle = Ti.UI.INPUT_BORDERSTYLE_ROUNDED;
		searchField.verticalAlign = Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER;
	} else {
		searchField.borderColor = 'white';
	}

	var searchIcon = Ti.UI.createImageView({
		left : Zookee.SystemWidth * 0.025,
		image : Zookee.ImageURL.Search,
		width : Zookee.SystemWidth * 0.1,
		height : Zookee.SystemWidth * 0.1,
		search : true
	})

	var resultTable = Ti.UI.createTableView({
		height : Ti.UI.SIZE,
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
		allowsSelection : false,
		//separatorColor : 'transparent',
		bubbleParent : false,
		separatorStyle : Ti.UI.iPhone.TableViewSeparatorStyle.NONE
	});
	if (Zookee.isAndroid) {
		resultTable.separatorColor = 'transparent';
	}
	var search_shadow = Ti.UI.createView({
		left : '1%',
		right : '1%',
		height : Zookee.SystemHeight * 0.0125,
		top : 0,
		backgroundImage : Zookee.ImageURL.Shadow
	});

	resultTable.addEventListener('click', function(e) {
		if (e.source.titleid == 'request_as_friend') {
			var actInd = Util.actIndicator(L('ongoing'), view, true);
			actInd.show();
			delegate.addFriend(e.source.user.id, function() {
				user.myRequests.push(e.source.user);
				actInd.hide();
				if (Zookee.Notification.Enabled) {
					delegate.notify(Zookee.Notification.Friend_Channel, [e.source.user], Zookee.Notification.MessageType.REQUEST)
				}
				//e.row.remove(e.source);
				var row = createRow(e.source.user, 'wait_4_approve');
				//e.source.titleid = 'wait_4_approve';
				//e.source.touchEnabled = false;
				resultTable.updateRow(e.index, row);
			}, function() {
				actInd.hide();
			});
		} else if (e.source.titleid == 'Remove') {
			var _user = e.source.user;
			var actInd1 = Util.actIndicator(L('Deleting'), view, true);
			actInd1.show();

			delegate.deleteFriend(_user, function() {
				Util.deleteFriend(user, _user);
				friendsTable.setData(populateFriendsTable());
				actInd1.hide();
				e.source.title = L('request_as_friend');
				resultTable.updateRow(e.index, e.row);
			}, function() {
				actInd1.hide();
			});
		}
	})
	searchIcon.addEventListener('click', function(e) {
		searchField.blur();
		if (!e.source.search) {
			searchField.value = '';
			searchView.remove(search_shadow);
			searchView.remove(resultTable);
			e.source.search = !e.source.search;
			e.source.image = Zookee.ImageURL.Search;
			return;
		}
		if (!searchField.value)
			return;
		e.source.image = Zookee.ImageURL.Cancel_Dark;
		e.source.search = false;
		var actInd = Util.actIndicator(L('ongoing'), view, true);
		actInd.show();
		delegate.searchUser(searchField.value, function(users) {
			actInd.hide();
			if (users.length == 0)
				return;
			var data = [];
			for (var j = 0; j < users.length; j++) {
				if (users[j].id == user.id)
					continue;
				var titleid = 'request_as_friend';
				if (Util.isFriend(user, users[j])) {
					titleid = 'Remove';
				} else if (Util.isRequest(user, users[j])) {
					titleid = 'wait_4_approve';
				}
				var row = createRow(users[j], titleid);
				data.push(row);
			}
			resultTable.setData(data);
			searchView.add(resultTable);
			searchView.add(search_shadow);
		}, function() {
			actInd.hide();
		});

	})

	fieldView.add(searchField);
	fieldView.add(searchIcon);
	searchView.add(fieldView);

	var line = Ti.UI.createView({
		top : Zookee.SystemHeight * 0.0025,
		left : 0,
		right : 0,
		height : 1,
		backgroundColor : 'black'
	});
	if (Zookee.isAndroid)
		searchView.add(line);

	var requestLabel = Ti.UI.createLabel({
		top : Zookee.SystemHeight * 0.025,
		textid : 'friends_request',
		left : '5%',
		font : Zookee.FONT.NORMAL_FONT
	});

	var requestTable = Ti.UI.createTableView({
		data : populateRequestTable(user),
		top : Zookee.SystemHeight * 0.00625,
		left : '2%',
		right : '2%',
		height : '30%',
		bubbleParent : false,
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
		allowsSelection : false,
		separatorStyle : Ti.UI.iPhone.TableViewSeparatorStyle.NONE
	});
	if (Zookee.isAndroid) {
		requestTable.separatorColor = 'transparent';
	}

	requestTable.addEventListener('click', function(e) {
		if (e.source.titleid == 'approve') {
			var actInd = Util.actIndicator(L('ongoing'), view, true);
			actInd.show();
			delegate.approveRequest(e.source.user, function() {
				if (Zookee.Notification.Enabled) {
					delegate.notify(Zookee.Notification.Friend_Channel, [e.source.user], Zookee.Notification.MessageType.APPROVE)
				}

				myPad.requestUpdate();
				var _row = createRow(e.source.user, 'Remove');
				//e.source.titleid = 'Remove';
				requestTable.deleteRow(e.index, {
					animated : true,
					animationStyle : Ti.UI.iPhone.RowAnimationStyle.BOTTOM
				});
				if (user.friends.length == 1) {
					view1.add(friendsLabel);
					view1.add(friendsTable);
					friendsTable.isAdded = true;
					view1.add(friends_shadow);
					friendsTable.appendRow(_row, {
						animated : true,
						animationStyle : Ti.UI.iPhone.RowAnimationStyle.TOP
					});
				} else {
					friendsTable.insertRowBefore(0, _row, {
						animated : true,
						animationStyle : Ti.UI.iPhone.RowAnimationStyle.TOP
					});
				}
				if (requestTable.data[0].rows.length == 0) {
					view1.remove(requestLabel);
					view1.remove(requestTable);
					view1.remove(request_shadow);
					requestTable.isAdded = false;
				}
				actInd.hide();
			}, function() {
				actInd.hide();
			});
		}
	});

	var friendsLabel = Ti.UI.createLabel({
		top : Zookee.SystemHeight * 0.025,
		textid : 'friends_list',
		left : '5%',
		font : Zookee.FONT.NORMAL_FONT
	});
	var friendsTable = Ti.UI.createTableView({
		// data : populateFriendsTable(),
		top : Zookee[5],
		left : '2%',
		right : '2%',
		height : '60%',
		bubbleParent : false,
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
		scrollable : true,
		allowsSelection : false,
		separatorStyle : Ti.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE
	});
	if (Zookee.isAndroid) {
		friendsTable.separatorColor = 'transparent';
	}

	friendsTable.setData(populateFriendsTable());
	friendsTable.addEventListener('click', function(e) {
		if (e.source.titleid == 'Remove') {
			var actInd1 = Util.actIndicator(L('Deleting'), view, true);
			actInd1.show();

			delegate.deleteFriend(e.source.user, function() {
				friendsTable.deleteRow(e.index, {
					animated : true,
					animationStyle : Ti.UI.iPhone.RowAnimationStyle.BOTTOM
				});
				Util.deleteFriend(user, e.source.user);
				actInd1.hide();

			}, function() {
				actInd1.hide();
			});
		}
	});

	var request_shadow = Ti.UI.createView({
		left : '4%',
		width : '92%',
		height : Zookee[10],
		top : 0,
		backgroundImage : Zookee.ImageURL.Shadow
	});

	var friends_shadow = Ti.UI.createView({
		left : '4%',
		width : '92%',
		height : Zookee[10],
		top : 0,
		backgroundImage : Zookee.ImageURL.Shadow
	});
	view.refreshRemoteContacts = function(callback, refreshFriends) {
		if (Util.handleOffLine(view))
			return;
		searchView.remove(search_shadow);
		searchView.remove(resultTable);
		delegate.showRequests(user, function() {
			var updateView = function() {
				if (user.requests.length > 0) {
					if (user.requests.length < 3)
						requestTable.height = Ti.UI.SIZE;
					else
						requestTable.height = '30%';
					friendsTable.height = '50%';
					requestTable.setData(populateRequestTable());
					if (!requestTable.isAdded) {
						view1.add(requestLabel);
						view1.add(requestTable);
						view1.add(request_shadow);
						requestTable.isAdded = true;
					}
					myPad.requestUpdate();
				} else {
					friendsTable.height = '75%';
				}
				if (user.friends.length > 0) {
					if (!friendsTable.isAdded) {
						view1.add(friendsLabel);
						view1.add(friendsTable);
						view1.add(friends_shadow);
						friendsTable.isAdded = true;
					}
					friendsTable.setData(populateFriendsTable());
				}
			}
			if (refreshFriends) {
				delegate.searchFriend(user, function() {
					updateView();
					callback();
				}, function() {
					updateView();
					callback();
				})
			} else {
				updateView();
				callback();
			}
		}, function() {
			if (refreshFriends) {
				delegate.searchFriend(user, function() {
					updateView();
					callback();
				}, function() {
					callback();
				})
			} else {
				callback();
			}
		})
	};

	view1.add(searchView);
	view.add(view1);

	//view.refreshRemoteContacts();
	return view;
};

module.exports = FriendsList;
