/**
 * @author kent hao
 *
 * This is function to show people are together.
 * they are talking, dinner, sporting, anything,
 * the key point is that they are together, and if your are near, you can also be part of them.
 *
 * the original idea is to use this function to organize activity
 * but it was so complex for the function, so hard for the user and so ugly for the ui.
 *
 * feature:
 * 1. show list of all activity with more than 1 people
 * 2. if you are near of one activity, show join in button, if not, show comment button
 * 3. click join in, you will be part of the activity, your avatar will be presented
 *
 * on galaxy s2: height=800, width = 400
 */
var Util = require('Util');
var delegate = require('backend/Delegate');
var geoLocation = require('GeoLocation');
var Zookee = require('Zookee');
var ImageView = require('ui/ImageView');
var SystemWidth = Ti.Platform.displayCaps.platformWidth;
var SystemHeight = Ti.Platform.displayCaps.platformHeight;

function PartyRow(post, mainView, move2Last, location) {
	var user = Zookee.User.CurrentUser
	var joined = false;

	for(var i=0;i<post.attenders.length;i++){
		if(user.id === post.attenders[i].id){
			joined = true;
			break;
		}
	}

	var view = Ti.UI.createTableViewRow({
		//height : SystemWidth/Zookee.UI.IMAGE.PARTY_IMAGE_RATIO+Zookee[70],
		//backgroundColor : 'white',
		className : 'row',
		post : post,
		selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
	});

	/**
	 * party photo area:
	 * 1. party photo, if no photo, use placeholder
	 * 2. location
	 *      1. maskview
	 *      2. location category/location name/location address
	 */
	var url = null;
	var imageFile = 's';
	if (post.hasPhoto) {
		var _idx=0;
		if(move2Last) _idx=post.photos.length-1;
		url=post.photos[_idx].urls.party;
		imageFile=post.photos[_idx].partyImage;
	}
	var photoArea = new ImageView({
		top:0,
		width:Ti.UI.FILL,
		height : SystemWidth/Zookee.UI.IMAGE.PARTY_IMAGE_RATIO,
		defaultImage:Zookee.ImageURL.Empty_Photo,
		tag:'show_detail',
		backgroundImage:imageFile,
		url:url,
		loadStatus:'starting'
	});	
	view.add(photoArea);
	
	var locationArea = Ti.UI.createView({
		left:0,
		bottom:Zookee[69],
		width:Zookee[280],
		height:Zookee[50],
		backgroundColor:Zookee.UI.COLOR.MYPAD_BACKGROUND,
		opacity:0.7
	})
	view.add(locationArea);

	var categoryName='s';
	if (post.locationCategory) {
		categoryName = post.locationCategory.split('/').pop();
	}

	var locationIcon = new ImageView({
		left:Zookee[10],
		bottom:Zookee[80],
		width:Zookee[30],
		height:Zookee[30],
		defaultImage : Zookee.ImageURL.Location_White,
		image : categoryName,
		url : post.locationCategory,
		loadStatus : 'starting',
		tag:'location'
	})
	view.add(locationIcon);
	var whereLabel = Ti.UI.createLabel({
		left : Zookee[50],
		width : Zookee[230],
		height : Zookee[20],
		bottom : Zookee[95],
		text : post.placeName,
		font : Zookee.FONT.SMALL_FONT,
		color : 'white',
		tag : 'location'
	});
	view.add(whereLabel);

	var addressLabel = Ti.UI.createLabel({
		left : Zookee[50],
		bottom : Zookee[75],
		width:Zookee[230],
		height:Zookee[20],
		color : 'white',
		text : post.address,
		font : Zookee.FONT.SMALL_FONT,
		tag:'location'
	});
	view.add(addressLabel);

	var attenderArea = Ti.UI.createView({
		top:SystemWidth/Zookee.UI.IMAGE.PARTY_IMAGE_RATIO,
		left:0,
		width:'70%',
		backgroundColor:'white',
		height:Zookee[50],
		layout:'horizontal'
	})
	
	var opArea = Ti.UI.createView({
		left:'70%',
		width:'30%',
		top:SystemWidth/Zookee.UI.IMAGE.PARTY_IMAGE_RATIO,
		height:Zookee[50],
		backgroundGradient:Zookee.UI.BackgroundGradient
	})
	view.add(attenderArea);
	view.add(opArea);
	for (var i = 0; i < 5; i++) {
		var image='s';
		var opacity = 0;
		var url='';
		if(post.attenders[i]){
			opacity = 1;
			image = post.attenders[i].photo.avatarImage;
			url = post.attenders[i].photo.urls.avatar;
		}
		var attendee = new ImageView({
			left : Zookee[10],
			top:Zookee[5],
			bottom : Zookee[5],
			width : Zookee[40],
			height : Zookee[40],
			borderRadius:Zookee.UI.Border_Radius_Small,
			opacity : opacity,
			tag : 'attender',
			defaultImage : Zookee.ImageURL.No_Avatar,
			url:url,
			image : image,
			loadStatus:'starting'
		});
		attenderArea.add(attendee);
	}

	// here also, compare the location to see if it's possible to join.
	// if less than 100 meters , then you can join.
	var postLoc = {
		longitude : post.longitude,
		latitude : post.latitude
	};
	var distance = Util.getDistance(location, postLoc);
	if (distance < 500) {
		whereLabel.text = whereLabel.text + '(' + distance.toFixed(0) + L('m') + ')';
	} else {
		whereLabel.text = whereLabel.text + '(' + (distance / 1000).toFixed(1) + L('km') + ')';
	}

	var text = Util.postTime(post.created_at);

	var currentTime = new Date();
	if (!joined) {
		if (!Util.isPartyHappening(post)) {
			opArea.add(Ti.UI.createLabel({
				width:Ti.UI.FILL,
				height:Ti.UI.FILL,
				text:text,
				textAlign:'center',
				verticalAlign:Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
				color:'white',
				font:Zookee.FONT.SMALL_FONT
			}))
		} else if (distance > Zookee.Distance_Party) {
			opArea.add(Ti.UI.createLabel({
				width:Ti.UI.FILL,
				height:Ti.UI.FILL,
				textid:'right_now',
				textAlign:'center',
				verticalAlign:Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
				color:'white',
				font:Zookee.FONT.NORMAL_FONT_BOLD
			}));
		} else {
			opArea.add(Ti.UI.createLabel({
				width:Ti.UI.FILL,
				height:Ti.UI.FILL,
				textid:'join',
				textAlign:'center',
				verticalAlign:Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
				color:'white',
				font:Zookee.FONT.NORMAL_FONT_BOLD,
				tag:'join',
				control:opArea
			}));
			opArea.tag = 'join';	
		}
	}else{
		opArea.add(Ti.UI.createLabel({
				width:Ti.UI.FILL,
				height:Ti.UI.FILL,
				text:text,
				textAlign:'center',
				verticalAlign:Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
				color:'white',
				font:Zookee.FONT.SMALL_FONT
			}))
	}
	var emptySpace = Ti.UI.createView({
		width:Ti.UI.FILL,
		top:SystemWidth/Zookee.UI.IMAGE.PARTY_IMAGE_RATIO+Zookee[50],
		height:Zookee[20],
	})
	view.add(emptySpace);
	view.release = function() {
		photoArea = null;
		opArea = null;
		locationArea = null;
		whereLabel = null;
		addressLabel = null;
		post = null;
	}
	
	return view;
};

module.exports = PartyRow;
