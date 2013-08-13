/**
 * @author Hao, Kent
 */
var Zookee = require('Zookee'), Util = require('Util'), StoreKit = require('ui/StoreKit');
var TitleView = require('ui/TitleView');

function PriorityList(win) {
	var user = Zookee.User.CurrentUser;
	var data = [];
	var titleView = TitleView.buildTitleView(win,L('my_priority','Priority'));
	var tableView = Ti.UI.createTableView({
		data : data,
		//top : Zookee[60],
		//bottom:0,
		bottom:0,
		left : 0,
		right : 0,
		allowsSelection : true,
		//separatorColor : 'transparent',
		separatorStyle : Ti.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE,
		bubbleParent : false,
		backgroundColor : 'transparent',
		showVerticalScrollIndicator : false
	});

	var priorities = Zookee.Priorities || [];

	var buildRow = function(priority) {
		var row = Ti.UI.createTableViewRow({
			selectionStyle : Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,
			className : 'row',
			priority : priority,
			backgroundImage : Zookee.ImageURL.Background
		});

		var avatar = Ti.UI.createImageView({
			left : Zookee[10],
			top : Zookee[10],
			bottom : Zookee[10],
			width : Zookee[100],
			height : Zookee[100],
			defaultImage : Zookee.ImageURL.Empty_Photo,
			image : priority.photo,
			touchEnabled : false
		})
		var title = Ti.UI.createLabel({
			left : Zookee[120],
			top : Zookee[10],
			height : Zookee[30],
			width : Ti.UI.SIZE,
			text : L(priority.title),
			font : Zookee.FONT.NORMAL_FONT_BOLD,
			touchEnabled : false
		})
		var description = Ti.UI.createLabel({
			left : Zookee[120],
			top : Zookee[50],
			height : Ti.UI.SIZE,
			width : Ti.UI.SIZE,
			text : L(priority.content),
			color : Zookee.UI.COLOR.PARTY_CONTENT,
			font : Zookee.FONT.SMALL_FONT_ITALIC,
			touchEnabled : false
		})

		var showBuy = true;
		for (var i = 0, length = user.priority.length; i < length; i++) {
			if (user.priority[i].indexOf(priority.title) >= 0 && Util.isPriorityValid(user.priority[i], user.priorityStartTime[i])) {
				showBuy = false;
				break;
			}
		}
		// if user doesn't have the priority or the priority is expired, show buy btn.
		if (showBuy) {
			var buyLabel = Ti.UI.createLabel({
				top : Zookee[10],
				right : Zookee[10],
				height : Ti.UI.SIZE,
				text : '  ' + L('buy', 'buy') + '  ',
				color : 'white',
				font : Zookee.FONT.NORMAL_FONT,
				backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
				tag : 'buy'
			})
			row.add(buyLabel);
		} else {
			var buyLabel = Ti.UI.createLabel({
				top : Zookee[10],
				right : Zookee[10],
				height : Ti.UI.SIZE,
				text : ' ' + L('have_priority', 'have it') + ' ',
				color : Zookee.UI.COLOR.PARTY_CONTENT,
				font : Zookee.FONT.NORMAL_FONT,
				backgroundColor : 'transparent',
				borderRadius : Zookee.UI.Border_Radius_Small
			})
			row.add(buyLabel);
		}
		row.add(avatar);
		row.add(title);
		row.add(description);
		return row;
	}
	for (var i = 0; i < priorities.length; i++) {

		data.push(buildRow(priorities[i]));
	}
	tableView.setData(data);
	tableView.addEventListener('click', function(e) {
		//buy priority
		var _e = e;
		if (e.source.tag === 'buy') {
			var priorityType = e.row.priority.title;
			var buyLabel = e.source;
			var alertDialog = Ti.UI.createAlertDialog({
				cancel : 3,
				buttonNames : [L('month_priority'), L('quarter_priority'), L('year_priority'), L('cancel')],
				title : L('buy') + ' ' + L(e.row.priority.title,e.row.priority.title)
			});
			alertDialog.addEventListener('click', function(e) {
				if (e.index === e.source.cancel) {

				} else {
					actInd = Util.actIndicator(L('buying', 'buying'), win, true);
					actInd.show();
					// hide indicator, update user priority
					StoreKit.requestProduct(_e.row.priority.identifiers[e.index], function(product) {
						StoreKit.purchaseProduct(product, function(date) {
							var delegate = require('backend/Delegate');
							delegate.updateUser({
								custom_fields : {
									priority : user.priority.concat([priorityType + e.source.buttonNames[e.index]]),
									//TODO: when use paypal api, use the time in response instead of the local time
									// to prevent the end user faking the system time
									priority_startTime : user.priorityStartTime.concat([date.toISOString()])
								}
							}, function() {
								buyLabel.backgroundColor = 'transparent';
								buyLabel.color = Zookee.UI.COLOR.PARTY_CONTENT;
								buyLabel.text = ' ' + L('have_priority', 'have it') + ' ';
								actInd.hide();
							}, function() {
								actInd.hide();
							})
						});
					})
				}
			});
			alertDialog.show();
		}
	})
	win.add(titleView);
	win.add(tableView);
	win.open({
		modal:true
	})	
};

module.exports = PriorityList;
