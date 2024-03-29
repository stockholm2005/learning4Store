/**
 * @author Hao, Kent
 */
var Zookee = require('Zookee');
var TitleView = require('ui/TitleView');
var NewPostWin = require('ui/NewPost');

function AdsList(win) {
	var data = [];
	var titleView = TitleView.buildTitleView(win,L('my_ad','My Ads'));
	var addBtn = Ti.UI.createButton({
		backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		image:Zookee.ImageURL.Add,
		width : Zookee[40],
		height : Zookee[40],
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
	})

	titleView.addView(addBtn);
	addBtn.addEventListener('click', function() {
			var win = new NewPostWin(tableView);
			win.open({
				modal : true
			});
	})
	var tableView = Ti.UI.createTableView({
		data : data,
		//top : Zookee[60],
		//bottom:0,
		left : 0,
		right : 0,
		allowsSelection : true,
		//separatorColor : 'transparent',
		separatorStyle : Ti.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE,
		bubbleParent : false,
		backgroundColor : 'transparent',
		showVerticalScrollIndicator : false
	});

	var pre_ads = Ti.App.Properties.getList('pre_ads') || [];

	var buildRow = function(ad) {
		var row = Ti.UI.createTableViewRow({
			selectionStyle : Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,
			className : 'row',
			ad : ad,
			backgroundImage : Zookee.ImageURL.Background
		});

		var avatar = Ti.UI.createImageView({
			left : Zookee[10],
			top : Zookee[10],
			bottom : Zookee[10],
			width : Zookee[100],
			height : Zookee[100],
			touchEnabled : false
		})
		if (ad.photo)
			avatar.image = ad.photo;
		else
			avatar.image = Zookee.ImageURL.Empty_Photo;
		var title = Ti.UI.createLabel({
			left : Zookee[120],
			top : Zookee[10],
			height : Zookee[30],
			width : Ti.UI.SIZE,
			text : ad.title,
			font : Zookee.FONT.NORMAL_FONT_BOLD,
			touchEnabled : false
		})
		var description = Ti.UI.createLabel({
			left : Zookee[120],
			top : Zookee[50],
			height : Ti.UI.SIZE,
			width : Ti.UI.SIZE,
			text : ad.content,
			color : Zookee.UI.COLOR.PARTY_CONTENT,
			font : Zookee.FONT.SMALL_FONT_ITALIC,
			touchEnabled : false
		})
		var address = Ti.UI.createLabel({
			left : Zookee[120],
			top : Zookee[90],
			height : Zookee[30],
			width : Ti.UI.SIZE,
			text : ad.address,
			color : Zookee.UI.COLOR.MYPAD_BACKGROUND,
			font : Zookee.FONT.SMALL_FONT,
			party : ad,
			touchEnabled : false
		})

		row.add(avatar);
		row.add(title);
		row.add(description);
		row.add(address);
		return row;
	}

	tableView.insertAd = function(ad) {
		if (pre_ads.length > 0)
			tableView.insertRowBefore(0, buildRow(ad));
		else
			tableView.appendRow(buildRow(ad));

		pre_ads = [ad].concat(pre_ads);
	}
	for (var i = 0; i < pre_ads.length; i++) {

		data.push(buildRow(pre_ads[i]));
	}

	tableView.setData(data);
	tableView.addEventListener('click', function(e) {
		//delete the ad.
		pre_ads.splice(e.index, 1);
		Ti.App.Properties.setList('pre_ads', pre_ads);
		tableView.deleteRow(e.index, Ti.UI.iPhone.RowAnimationStyle.LEFT);
		Ti.App.fireEvent('update_pre_row');
	})
	win.add(titleView);
	win.add(tableView);

	win.open({
		modal:true
	})
};

module.exports = AdsList;
