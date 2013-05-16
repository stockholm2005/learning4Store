/**
 * @author Hao, Kent
 */
var Zookee = require('Zookee');
var NewPostWin = require('ui/NewPost');

function AdsList(){
	var data = [];
	var tableView = Ti.UI.createTableView({
		data : data,
		top : Zookee[60],
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
	
	var pre_ads = Ti.App.Properties.getList('pre_ads')||[];

	var buildRow = function(ad){
		var row = Ti.UI.createTableViewRow({
			selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,
			className:'row'
		});

		var avatar = Ti.UI.createImageView({
			left:Zookee[10],
			top:Zookee[10],
			bottom:Zookee[10],
			width:Zookee[100],
			height:Zookee[100],
			defaultImage:Zookee.ImageURL.Empty_Photo,
			image:ad.photo
		})
		var title = Ti.UI.createLabel({
			left:Zookee[120],
			top:Zookee[10],
			height:Zookee[30],
			width:Ti.UI.SIZE,
			text:ad.title,
			font:Zookee.FONT.NORMAL_FONT_BOLD
		})
		var description = Ti.UI.createLabel({
			left:Zookee[120],
			top:Zookee[50],
			height:Ti.UI.SIZE,
			width:Ti.UI.SIZE,
			text:ad.content,
			color:Zookee.UI.COLOR.PARTY_CONTENT,
			font:Zookee.FONT.SMALL_FONT_ITALIC
		})
		var address = Ti.UI.createLabel({
			left:Zookee[120],
			top:Zookee[90],
			height:Zookee[30],
			width:Ti.UI.SIZE,
			text:ad.address,
			color:Zookee.UI.COLOR.MYPAD_BACKGROUND,
			font:Zookee.FONT.SMALL_FONT,
			party:ad
		})

		row.add(avatar);
		row.add(title);
		row.add(description);
		row.add(address);	
		return row;	
	}	
	
	tableView.insertAd = function(ad){
		tableView.insertRowBefore(0,buildRow(ad));
	}
	for(var i=0;i<pre_ads.length;i++){		
		data.push(buildRow(pre_ads[i]));
	}
	
	// add new adds
	var row = Ti.UI.createTableViewRow();
	row.add(Ti.UI.createImageView({
		center:{
			x:'50%',
			y:'50%'
		},
		width:Zookee[50],
		height:Zookee[50],
		image:Zookee.ImageURL.Add
	}))
	row.addEventListener('click',function(e){
		var win = new NewPostWin(tableView);
		win.open({
			modal:true
		});
	});
	data.push(row);
	tableView.setData(data);
	
	return tableView;
};

module.exports=AdsList;
