/**
 * @author Hao, Kent
 */
var Zookee = require('Zookee');
var Util=require('Util');

function PriorityList(win) {
	var data = [];
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

	var priorities = Zookee.Priorities||[];

	var buildRow = function(priority) {
		var row = Ti.UI.createTableViewRow({
			selectionStyle : Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,
			className:'row',
			priority : priority,
			backgroundImage:Zookee.ImageURL.Background
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

		var buyLabel = Ti.UI.createLabel({
			right:Zookee[10],
			height:Ti.UI.SIZE,
			text:'  '+L('buy','buy')+'  ',
			color:'white',
			font:Zookee.FONT.NORMAL_FONT,
			backgroundColor:Zookee.UI.COLOR.MYPAD_BACKGROUND,
			borderRadius:Zookee.UI.Border_Radius_Small,
			tag:'buy'
		})
		row.add(avatar);
		row.add(title);
		row.add(description);
		row.add(buyLabel);
		return row;
	}

	for (var i = 0; i < priorities.length; i++) {

		data.push(buildRow(priorities[i]));
	}
	tableView.setData(data);
	tableView.addEventListener('click', function(e) {
			//buy priority
		if(e.source.tag==='buy'){
			actInd=Util.actIndicator(L('buying','buying'),win,true);
			actInd.show();
			// hide indicator, update user priority
			setTimeout(function(){
				actInd.hide();
			},5000);
		}
	})
	return tableView;
};

module.exports = PriorityList;
