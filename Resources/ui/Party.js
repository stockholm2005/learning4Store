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

	var view = Ti.UI.createTableViewRow({
		//height : SystemWidth/Zookee.UI.IMAGE.PARTY_IMAGE_RATIO+Zookee[70],
		//backgroundColor : 'white',
		className : 'row',
		post : post,
		selectionStyle : Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
	});

	var avatar = Ti.UI.createImageView({
		left : Zookee[10],
		bottom : Zookee[10],
		top : Zookee[10],
		width : Zookee[50],
		height : Zookee[50],
		image : Zookee.ImageURL.Party
	})
	if (post.attenders.length >= 5)
		avatar.image = Zookee.ImageURL.Party;
	else if (post.attenders.length >= 2)
		avatar.image = Zookee.ImageURL.Party1;
	else
		avatar.image = Zookee.ImageURL.No_Avatar;
	view.add(avatar);
	var text = Util.postTime(post.created_at);

	var peopleLabel = Ti.UI.createLabel({
		left : Zookee[70],
		top : Zookee[10],
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		color : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		font : Zookee.FONT.NORMAL_FONT_BOLD,
		text : post.attenders.length + L('people', ' people')
	})
	view.add(peopleLabel);

	var whereLabel = Ti.UI.createLabel({
		left : Zookee[70],
		bottom : Zookee[10],
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		color : Zookee.UI.COLOR.PARTY_CONTENT,
		font : Zookee.FONT.SMALL_FONT
	})

	// here also, compare the location to see if it's possible to join.
	// if less than 100 meters , then you can join.
	var postLoc = {
		longitude : post.longitude,
		latitude : post.latitude
	};
	var distance = Util.getDistance(location, postLoc);
	if (distance < 500) {
		whereLabel.text = '(' + distance.toFixed(0) + L('m') + ')' + text;
	} else {
		whereLabel.text = '(' + (distance / 1000).toFixed(1) + L('km') + ')' + text;
	}
	view.add(whereLabel);

	var adsBtn_bg = Ti.UI.createView({
		right : Zookee[10],
		backgroundColor : 'transparent',
		height : Ti.UI.SIZE,
		width : Zookee[120]
	})
	if (Zookee.sentParties.indexOf(post.id)>=0) {
		adsBtn_bg.add(Ti.UI.createLabel({
			text : L('ads_sent', 'ads sent'),
			color : Zookee.UI.COLOR.PARTY_CONTENT,
			font : Zookee.FONT.NORMAL_FONT_ITALIC
		}));
	} else {
		var adsBtn = Ti.UI.createButton({
			title : L('send_ad', 'send ad'),
			color : 'white',
			backgroundGradient : Zookee.UI.BackgroundGradient,
			borderWidth : 0,
			borderRadius : Zookee.UI.Border_Radius_Small,
			style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
			center : {
				x : '50%',
				y : '50%'
			},
			width : Ti.UI.SIZE,
			party : post,
			font : Zookee.FONT.SMALL_FONT
		})
		adsBtn_bg.add(adsBtn);
		adsBtn.addEventListener('click', function(e) {
			var actInd = Util.actIndicator('', adsBtn_bg,false,Zookee.isAndroid?Ti.UI.ActivityIndicatorStyle.DARK:Ti.UI.iPhone.ActivityIndicatorStyle.DARK);
			adsBtn_bg.remove(adsBtn);
			actInd.show();
			var obj = {
				title : 'Sheraton Welcomes You',
				content : 'Now we have deluxe room with ocean view by 50% discount.',
				location : [121.50318908691406, 31.176334381103516],
				address : 'No.1068 Westin Road, Bali'
			};
			delegate.createAd(obj, [e.source.party], function() {
				Zookee.sentParties.push(e.source.party.id)
				actInd.hide();
				adsBtn_bg.add(Ti.UI.createLabel({
					text : L('ads_sent', 'ads sent'),
					color : Zookee.UI.COLOR.PARTY_CONTENT,
					font : Zookee.FONT.NORMAL_FONT_ITALIC
				}));
			}, function() {
				actInd.hide();
				adsBtn_bg.add(adsBtn);
			})
		})
	}
	view.add(adsBtn_bg);
	view.release = function() {
		peopleLabel = null;
		whereLabel = null;
		avatar = null;
		post = null;
	}

	return view;
};

module.exports = PartyRow;
