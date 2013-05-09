/**
 * @author kent hao
 */
var Util = require('Util');
var Zookee = require('Zookee');
var ImageView=require('ui/ImageView');
var TitleView = require('ui/TitleView');

exports.buildTable = function(venues, origin, location) {
	var win = Ti.UI.createWindow({
		backgroundColor : 'white',
		navBarHidden : true,
		layout:'vertical'
	});

	var shadow = Ti.UI.createView({
		left : '1%',
		right : '1%',
		height : Zookee[10],
		backgroundImage : Zookee.ImageURL.Shadow
	});

	var title = TitleView.buildTitleView(win);
	
	var tv = Ti.UI.createTableView({
		height : Ti.UI.SIZE,
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
		scrollable : true,
		separatorColor : 'transparent',
		separatorStyle : Ti.UI.iPhone.TableViewSeparatorStyle.NONE
	});
	tv.addEventListener('click',function(e){
		origin.selectPlace(e.row.venue, location);
		win.close();
	});
	var tableRows = [];
	for (var i = 0; i < venues.length; i++) {
		var image = null;
		var categoryName = '';
		if (venues[i].categories.length > 0) {

			var prefix = venues[i].categories[0].icon.prefix;
			//Pieces needed to construct category icons at various sizes.
			// Combine prefix with a size (32, 44, 64, and 88 are available) and suffix, 
			//e.g. https://foursquare.com/img/categories/food/default_bg_32.png
			image = prefix + 'bg_32'+venues[i].categories[0].icon.suffix;
			categoryName = image.split('/').pop();
		}

		var row = Ti.UI.createTableViewRow({
			height : Ti.UI.SIZE,
			layout : 'horizontal',
			className : 'location_row'
		});
		
		var imageView = new ImageView({
			left : Zookee[30],
			top : Zookee[10],
			bottom : Zookee[10],
			width : Zookee[50],
			height : Zookee[50],
			touchEnabled:false,
			loadStatus:'starting',
			defaultImage:Zookee.ImageURL.Location,
			url:image,
			image:categoryName
		});

		if (image) {
			venues[i].image = image;
		}
		row.venue = JSON.parse(JSON.stringify(venues[i]));

		var locationLabel = Ti.UI.createLabel({
			text : venues[i].name,
			left : Zookee[10],
			touchEnabled:false,
			font:Zookee.FONT.NORMAL_FONT
		})

		row.add(imageView);
		row.add(locationLabel);

		tableRows.push(row);

	}//end of for statement
	tv.setData(tableRows);
	win.add(title);
	win.add(tv);
	win.add(shadow);

	return win;
}
