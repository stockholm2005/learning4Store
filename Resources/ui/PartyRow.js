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
	var shadow = Ti.UI.createView({
		top:0,
		left : SystemWidth * 0.0125,
		right : SystemWidth * 0.0125,
		height : SystemHeight * 0.0125,
		backgroundImage : Zookee.ImageURL.Shadow,
		touchEnabled : false
	});

	var bottom = SystemHeight * 0.025;

	var attendMask = Ti.UI.createView({
		left : SystemWidth * 0.1,
		bottom : bottom,
		right : -SystemWidth * 0.025,
		height : SystemHeight * 0.0875,
		backgroundColor : 'black',
		opacity : 0.6,
		borderRadius : SystemWidth * 0.015,
		tag:'attender'
	});

	var noCategoryAvatar = Ti.UI.createView({
		left : SystemWidth * 0.025,
		bottom : SystemHeight * 0.0125,
		top : SystemHeight * 0.025,
		width : SystemWidth * 0.12,
		height : SystemWidth * 0.12,
		backgroundImage : Zookee.ImageURL.Party,
		touchEnabled : false
	});
	var topStatus = Ti.UI.createLabel({
		right : '10%',
		top : 0,
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		color : 'white',
		font : Zookee.FONT.SMALL_FONT
	})
	if (post.user.id == user.id) {
		joined = true;
		topStatus.text = '  ' + L('your_party') + '  ';
	}

	var className;
	if (post.hasPhoto && post.hasVoice)
		className = Zookee.UI.ROW_CLASS.PARTY_IMAGE_AUDIO;
	else if (post.hasPhoto)
		className = Zookee.UI.ROW_CLASS.PARTY_ONLY_IMAGE;
	else if (post.hasVoice)
		className = Zookee.UI.ROW_CLASS.PARTY_ONLY_AUDIO;
	else
		className = Zookee.UI.ROW_CLASS.PARTY_ONLY_TEXT;

	var view = Ti.UI.createTableViewRow({
		height : Ti.UI.SIZE,
		layout : 'vertical',
		//backgroundColor : 'white',
		className : className,
		post : post,
		selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
		//backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND
	});

	var container = Ti.UI.createView({
		layout : 'vertical',
		height : Ti.UI.SIZE,
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND
	});

	/**
	 * party photo area:
	 * 1. party photo
	 * 2. attendee
	 *      1. maskview
	 *      2. attendee scroll
	 */
	var photoArea = Ti.UI.createView({
		left : 0,
		right : 0,
		height : Ti.UI.SIZE
	});

	var _imageView;

	if (post.hasPhoto) {
		// imageDelegate.getImage(_views[0].photo.urls.party, _views[0], {
		// photoid : _views[0].photo.id,
		// fileName : _views[0].photo.filename.split('.')[0] + '_party.jpeg'
		// });
		var _idx=0;
		if(move2Last) _idx=post.photos.length-1;
		_imageView = new ImageView({
			left : 0,
			right : 0,
			width : Ti.UI.FILL,
			height : SystemWidth/(640/480),
			opacity : 1,
			url : post.photos[_idx].urls.party,
			image : post.photos[_idx].partyImage,
			tag : 'show_detail'
		});

		// load image only at the time the image is presented.
		/*
		 photoesBar.addEventListener('scrollEnd', function(e) {
		 //here,use e.currentPage, don't use photoesBar.currentPage, it's always 0
		 if (_views[e.currentPage].loadStatus=='waiting') {
		 _views[e.currentPage].startLoading();
		 // imageDelegate.getImage(_views[e.currentPage].photo.urls.party, _views[e.currentPage], {
		 // photoid : _views[e.currentPage].photo.id,
		 // fileName : _views[e.currentPage].photo.filename.split('.')[0] + '_party.jpeg'
		 // });
		 //_views[e.currentPage].isLoaded = true;
		 }
		 })
		 */
		photoArea.add(_imageView);
		_imageView.startLoading();
	}
	photoArea.add(attendMask);
	// construct all attendees
	var attendee_holder = [];

	for (var i = 0; i < 5; i++) {
		var attendee = new ImageView({
			left : (1 + i) * SystemWidth*0.14,
			bottom : bottom + SystemHeight * 0.0125,
			width : SystemWidth * 0.1,
			height : SystemWidth * 0.1,
			borderColor : 'white',
			borderWidth : SystemWidth * 0.005,
			borderRadius:Zookee.UI.Border_Radius_Small,
			opacity : 0,
			tag : 'attender',
			defaultImage : Zookee.ImageURL.No_Avatar,
			backgroundImage : 's'
		});
		photoArea.add(attendee);
		attendee_holder.push(attendee);
	}
	var more = Ti.UI.createView({
		left : '87%',
		bottom : bottom + SystemHeight * 0.025,
		width : SystemWidth * 0.125,
		height : SystemHeight * 0.0375,
		opacity : 0,
		//borderRadius : 25,
		backgroundImage : Zookee.ImageURL.More,
		tag : 'attender'
	});
	photoArea.add(more);

	var maxIconNum = post.attenders.length > 5 ? 5 : post.attenders.length;
	for (var i = 0; i < maxIconNum; i++) {
		var attender = post.attenders[i];
		attendee_holder[i].opacity = 1;
		attendee_holder[i].reloading({
			url : attender.photo.urls.avatar,
			backgroundImage : attender.photo.avatarImage
		})

		if (attender.id == user.id) {
			// not clickable for the user himself
			joined = true;
			topStatus.text = '  ' + L('you_joined') + '  ';
		}
		
		// the party host
		if(attender.id == post.user.id){
			attendee_holder[i].borderColor = Zookee.UI.COLOR.MYPAD_BACKGROUND;
		}

	}
	//show more:
	if (post.attenders.length > 5) {
		more.opacity = 1;
		more.touchEnabled = true;
	}
	container.add(photoArea);

	var partyBar = Ti.UI.createView({
		height : Ti.UI.SIZE,
		//width : Ti.UI.FILL,
		top : 0,
		left : 0,
		right : 0,
		//layout : 'horizontal',
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND
	});

	var categoryName;
	if (post.locationCategory) {
		categoryName = post.locationCategory.split('/').pop();
	}

	var partyInfo = Ti.UI.createView({
		layout : 'vertical',
		left : SystemWidth * 0.1875,
		top : SystemHeight * 0.025,
		bottom : SystemHeight * 0.025,
		height : Ti.UI.SIZE,
		width : '70%'
		//horizontalWrap : true
	});

	var title = Ti.UI.createLabel({
		left : SystemWidth * 0.0125,
		width : SystemWidth * 0.75,
		height : Ti.UI.SIZE,
		text : post.content != Zookee.EMPTY_POST_MARK ? post.content : '',
		color : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		font : Zookee.FONT.NORMAL_FONT
	});

	var whereLabel = Ti.UI.createLabel({
		left : SystemWidth * 0.025,
		width : SystemWidth * 0.75,
		height : Ti.UI.SIZE,
		top : SystemHeight * 0.0125,
		text : post.placeName,
		font : Zookee.FONT.SMALL_FONT,
		color : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		tag : 'location'
	});

	var addressLabel = Ti.UI.createLabel({
		left : SystemWidth * 0.025,
		top : SystemHeight * 0.0125,
		color : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		text : post.address,
		font : Zookee.FONT.NORMAL_FONT
	});

	//partyBar.add(topStatus);

	partyInfo.add(title);
	partyInfo.add(whereLabel);
	//partyInfo.add(this.attendeeBar);
	//partyInfo.add(addressLabel);

	//partyInfo.add(refresh);
	if (categoryName) {
		partyBar.add(new ImageView({
			left : SystemWidth * 0.025,
			bottom : SystemHeight * 0.0125,
			top : SystemHeight * 0.025,
			width : SystemWidth * 0.12,
			height : SystemWidth * 0.12,
			defaultImage : Zookee.ImageURL.Party,
			image : categoryName,
			url : post.locationCategory,
			loadStatus : 'starting'
		}));
	} else {
		partyBar.add(noCategoryAvatar);
	}
	partyBar.add(partyInfo);
	container.add(partyBar);

	if (post.voice || post.voiceurl) {
		var audioView = Ti.UI.createView({
			right : SystemWidth * 0.025,
			width : SystemWidth * 0.1375,
			height : SystemWidth * 0.1375,
			backgroundImage : Zookee.ImageURL.Audio,
			tag : 'audio'
		});
		partyBar.add(audioView);
	} else {
		title.width = SystemWidth * 0.875;
		whereLabel.width = SystemWidth * 0.875;
	}

	var bottomBar = Ti.UI.createView({
		right : 0,
		left : 0,
		height : Ti.UI.SIZE,
		bottom : SystemHeight * 0.025,
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND
	});

	var bottomBar_left = Ti.UI.createView({
		left : 0,
		width : Ti.UI.SIZE,
		height : SystemHeight * 0.05,
		backgroundImage:Zookee.ImageURL.Time_Bar
	});

	var bottomBar_right = Ti.UI.createView({
		right : 0,
		width : '37%',
		height : SystemHeight * 0.05,
		backgroundImage : Zookee.ImageURL.Status_Bar,
		layout : 'horizontal'
	});

	/**
	 * bottom area
	 */
	container.add(bottomBar);

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
	var postTime = Ti.UI.createLabel({
		text : text,
		textAlign : 'left',
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
		left : 0,
		right:Zookee[10],
		width : Ti.UI.SIZE,
		height : Ti.UI.FILL,
		color : 'white',
		font : Zookee.FONT.NORMAL_FONT
	});

	var commentIcon = Ti.UI.createImageView({
		left : Zookee.SystemWidth*0.05,
		top: Zookee.SystemHeight*0.01125,
		bottom:Zookee.SystemHeight*0.01125,
		// center : {
			// x : '50%',
			// y : '50%'
		// },
		height : Zookee.SystemHeight*0.0275,
		width : Zookee.SystemWidth*0.06,
		image : Zookee.ImageURL.Comment,
		touchEnabled : false
	});

	var photoIcon = Ti.UI.createImageView({
		left : Zookee.SystemWidth*0.05,
		// center : {
			// x : '50%',
			// y : '50%'
		// },
		top: Zookee.SystemHeight*0.00625,
		bottom:Zookee.SystemHeight*0.00625,
		height : Zookee.SystemHeight*0.0375,
		width : Zookee.SystemWidth*0.07,
		image : Zookee.ImageURL.Camera,
		touchEnabled : false
	});
	
	var commentNumber = Ti.UI.createLabel({
		text : post.comments.length,
		left : Zookee.SystemWidth*0.0125,
		// center : {
			// x : '50%',
			// y : '50%'
		// },
		textAlign : 'right',
		color : 'white',
		font : Zookee.FONT.SMALL_BOLD_FONT
	});

	var photoNumber = Ti.UI.createLabel({
		text : post.photos.length,
		left : Zookee.SystemWidth*0.0125,
		// center : {
			// x : '50%',
			// y : '50%'
		// },
		right : Zookee.SystemWidth*0.025,
		textAlign : 'right',
		color : 'white',
		font : Zookee.FONT.SMALL_BOLD_FONT
	});

	bottomBar_left.add(postTime);
	bottomBar.add(bottomBar_left);
	bottomBar.add(bottomBar_right);
	bottomBar_right.add(commentIcon);
	bottomBar_right.add(commentNumber);
	bottomBar_right.add(photoIcon);
	bottomBar_right.add(photoNumber);
	var currentTime = new Date();
	if (!joined) {
		if (!Util.isPartyHappening(post)) {
			topStatus.text = '  ' + L('party_closed') + '  ';
		} else if (distance > Zookee.Distance_Party) {
			topStatus.text = '  ' + L('not_near') + '  ';
		} else {
			var joinLabel = Ti.UI.createImageView({
				//left : '75%',
				center : {
					x : '50%',
					y : '50%'
				},
				width : Zookee[70],
				height : Zookee[70],
				titleid : 'join',
				//borderRadius : 40,
				image : Zookee.ImageURL.Join,
				//backgroundColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
				backgroundSelectedColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
				//color : 'white',
				// font : {
				// fontSize : '24',
				// fontWeight : 'bold'
				// },
				tag : 'join'
			});
			view.className = className + 'notjoin';

			partyBar.remove(topStatus);
			bottomBar.add(joinLabel);
		}
	}

	if (topStatus.text == '') {
		topStatus.text = '  ' + L('right_now') + '  ';
	}

	view.add(container);
	view.add(shadow);
	view.add(Util.emptySpace('', 20));
	view.release = function() {
		topStatus = null;
		className = null;
		container = null;
		photoArea = null;
		_imageView = null;
		audioView = null;
		// for (var i = 0; i < _views.length; i++) {
		// _views[i].image = null;
		// _views[i] = null;
		// }
		// photoesBar = null;
		for (var i = 0; i < attendee_holder.length; i++) {
			attendee_holder[i].backgroundImage = null;
			attendee_holder[i] = null
		}
		more = null;
		partyBar = null;
		partyInfo = null;
		title = null;
		whereLabel = null;
		addressLabel = null;
		bottomBar = null;
		postTime = null;
		commentNumber = null;
		bottomBar_left = null;
		bottomBar_right = null;
		photoNumber = null;
		post = null;
	}
	
	return view;
};

module.exports = PartyRow;
