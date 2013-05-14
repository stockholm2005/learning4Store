/**
 * @author Hao, Kent
 */
var Zookee = require('Zookee');
var NewPostWin = require('ui/NewPostWin');

function AdsList(){
	var data = [];
	var tableView = Ti.UI.createTableView({
		data : data,
		top : Zookee[60],
		//bottom:0,
		left : 0,
		right : 0,
		allowsSelection : false,
		//separatorColor : 'transparent',
		separatorStyle : Ti.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE,
		bubbleParent : false,
		backgroundColor : 'transparent',
		showVerticalScrollIndicator : false
	});
	
	var pre_ads = Ti.App.Properties.getList('pre_ads')||[];
	
	for(var i=0;i<pre_ads.length;i++){
		var row = Ti.UI.createTableViewRow({
			className:'row'
		});
		var url=''
		var image='s';
		if(ads[i].photo){
			url = pre_ads[i].photo.urls.small_240;
			image = pre_ads[i].photo.partyImage;
		}
		var avatar = new ImageView({
			left:Zookee[10],
			top:Zookee[10],
			bottom:Zookee[10],
			width:Zookee[100],
			height:Zookee[100],
			image:image,
			url:url,
			defaultImage:Zookee.ImageURL.Empty_Photo,
			loadStatus:'starting'
		})
		var title = Ti.UI.createLabel({
			left:Zookee[120],
			top:Zookee[10],
			height:Zookee[20],
			width:Ti.UI.SIZE,
			text:pre_ads[i].title,
			font:Zookee.FONT.NORMAL_FONT_BOLD
		})
		var description = Ti.UI.createLabel({
			left:Zookee[120],
			top:Zookee[40],
			height:Ti.UI.SIZE,
			width:Ti.UI.SIZE,
			text:pre_ads[i].content,
			color:Zookee.UI.COLOR.PARTY_CONTENT,
			font:Zookee.FONT.SMALL_FONT_ITALIC
		})
		var address = Ti.UI.createLabel({
			left:Zookee[120],
			top:Zookee[90],
			height:Zookee[30],
			width:Ti.UI.SIZE,
			text:pre_ads[i].address,
			color:Zookee.UI.COLOR.MYPAD_BACKGROUND,
			font:Zookee.FONT.SMALL_FONT,
			party:pre_ads[i]
		})

		row.add(avatar);
		row.add(title);
		row.add(description);
		row.add(address);
		data.push(row);
	}
	
	// add new adds
	var row = Ti.UI.createTableViewRow();
	row.add(Ti.UI.createImageView({
		center:{
			x:'50%',
			y:'50%'
		},
		image:Zookee.ImageURL.Add
	}))
	row.addEventListener('click',function(e){
		new NewPostWin().open({
			modal:true
		})
	});
	data.push(row);
	tableView.setData(data);
	
	return tableView;
};

module.exports=AdsList;
