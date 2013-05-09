/**
 * @author Angela Deng
 */
var Zookee = require('Zookee');
var Util = require('Util');
var Geo = require('GeoLocation');
var ImageDelegate = require('backend/ImageDelegate');
var imageDelegate = new ImageDelegate();
var Recorder = require('ui/Recorder');
var delegate = require('backend/Delegate');
var PlaceTable = require('ui/PlaceTable');
var ImageView = require('ui/ImageView');
var TitleView = require('ui/TitleView');

var win;

function NewPostWin(_mainView) {
	var say_sth_changed = false;
	var user = Zookee.User.CurrentUser
	var post = {};
	win = Ti.UI.createWindow({
		navBarHidden : true,
		windowSoftInputMode : Zookee.Soft_Input.SOFT_INPUT_STATE_ALWAYS_VISIBLE,
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
		layout : 'vertical'
	})
	win.addEventListener('close', function() {
		Util.removeChildren(win);
		view = null;
		post = null;
		titleView = null;
		sendButton = null;
		fieldValidated = null;
		photo_view = null;
		cameraView = null;
		galleryView = null;
		inputArea = null;
		say_sth_fd = null;
		locationView = null;
		locationIcon.image = null;
		locationIcon = null;
		locationLabel = null;
		recorderView = null;
		_recorder.reset();
		_recorder = null;
		win = null;
	})
	// iphone keyboard height: 234dip
	var _height = '44%';
	if (Ti.Platform.displayCaps.platformHeight === 568) {
		_height = '52%';
	}
	var view = Ti.UI.createView({
		width : Ti.UI.FILL,
		//scrollType : 'vertical',
		//scrollingEnabled : false,
		//backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
		backgroundImage : Zookee.ImageURL.Empty_Photo,
		height : _height
		//contentHeight : Ti.UI.FILL,
		//layout : 'vertical'
	})

	var titleView = TitleView.buildTitleView(win);
	win.add(titleView);

	win.add(view);

	var sendButton = Ti.UI.createButton({
		width : Zookee[50],
		height : Zookee[50],
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundImage : Zookee.ImageURL.Send,
		backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND
	})

	var fieldValidated = function(post) {
		//content,photo,location,voice
		if ((!post.content || post.content.trim() == '' || post.content.trim() == L('say_something')) && !post.photo && !post.voiceurl)
			return false;
		if (!post.content || post.content.trim() == L('say_something')) {
			post.content = Zookee.EMPTY_POST_MARK;
		}
		return true;
	};

	sendButton.addEventListener('click', function(e) {
		post.content = say_sth_fd.value;
		if (!post.content)
			post.content = Zookee.EMPTY_POST_MARK;
		post.user = user;

		if (!post.location) {
			alert(L('party_location_mandatory'));
			return;
		}
		var actInd;
			titleView.removeView(sendButton);
			actInd = Util.actIndicator('', titleView.rightView);
		switch(Zookee.CurrentPage) {
			case Zookee.CurrentView.Things:
			case Zookee.CurrentView.Together:
				actInd.show();
				delegate.createParty(post, function(_post) {
					if (Zookee.Notification.Enabled) {
						delegate.notify(Zookee.Notification.Party_Channel, user.friends, Zookee.Notification.MessageType.CREATEPARTY)
					}
					if (_mainView.workingViews[Zookee.CurrentView.Things].isAdded)
						_mainView.workingViews[Zookee.CurrentView.Things].addPost(_post);
					if (_mainView.workingViews[Zookee.CurrentView.Together].isAdded)
						_mainView.workingViews[Zookee.CurrentView.Together].addPost(_post);
					//_mainView.getCurrentView().addPost(_post);
					if (win) {
						say_sth_fd.value = L('say_something');
						//recorder.reset();
						actInd.hide();
						win.close();
					}
				}, function() {
					if (win) {
						actInd.hide();
						titleView.rightView.add(sendButton);
					}
				});
				break;
			case Zookee.CurrentView.Album:
				actInd.hide();
				break;
		}
	})
	titleView.addView(sendButton);

	var textArea = Ti.UI.createView({
		layout : 'horizontal',
		top : Zookee[10],
		left : '5%',
		right : '5%',
		height : Ti.UI.SIZE
	})

	textArea.add(new ImageView({
		width : Zookee[45],
		height : Zookee[45],
		borderColor : 'white',
		borderWidth : Zookee[2],
		defaultImage : Zookee.ImageURL.No_Avatar,
		url : user.photo.urls.avatar,
		backgroundImage : user.photo.avatarImage,
		borderRadius : Zookee.UI.Border_Radius_Small,
		loadStatus : 'starting'
	}));
	var say_sth_fd = Ti.UI.createTextField({
		hintText : L('say_something'),
		left : Zookee[10],
		width : '80%',
		//backgroundColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		//color : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		keyboardType : Ti.UI.KEYBOARD_DEFAULT,
		returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
		//borderStyle : Ti.UI.INPUT_BORDERSTYLE_LINE,
		softKeyboardOnFocus : Zookee.Soft_Input.SOFT_KEYBOARD_SHOW_ON_FOCUS,
		//opacity : 0.9,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM,
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	textArea.add(say_sth_fd);
	view.add(textArea);
	var iconArea = Ti.UI.createView({
		layout : 'horizontal',
		bottom : Zookee[8],
		//right:Zookee[10],
		left : '35%',
		width : '65%',
		height : Ti.UI.SIZE
	})
	var cameraView = Ti.UI.createView({
		left : Zookee[12],
		height : Zookee[50],
		width : Zookee[50],
		backgroundColor : 'black',
		borderRadius : Zookee[25],
		borderColor : 'white',
		borderWidth : 2,
		opacity : 0.85,
		zIndex : 1
	})
	cameraView.add(Ti.UI.createImageView({
		center : {
			x : '50%',
			y : '50%'
		},
		height : Zookee[30],
		width : Zookee[30],
		image : Zookee.ImageURL.Camera
	}));

	var galleryView = Ti.UI.createView({
		left : Zookee[12],
		height : Zookee[50],
		width : Zookee[50],
		backgroundColor : 'black',
		borderRadius : Zookee[25],
		borderColor : 'white',
		borderWidth : 2,
		opacity : 0.85,
		zIndex : 1
	})
	galleryView.add(Ti.UI.createImageView({
		center : {
			x : '50%',
			y : '50%'
		},
		height : Zookee[30],
		width : Zookee[30],
		image : Zookee.ImageURL.Gallery
	}));
	var locationView = Ti.UI.createView({
		left : Zookee[12],
		height : Zookee[50],
		width : Zookee[50],
		backgroundColor : 'black',
		borderRadius : Zookee[25],
		borderColor : 'white',
		borderWidth : 2,
		opacity : 0.85,
		zIndex : 1
	})

	var locationIcon = new ImageView({
		center : {
			x : '50%',
			y : '50%'
		},
		height : Zookee[40],
		width : Zookee[40],
		defaultImage : Zookee.ImageURL.Location_White,
		image : Zookee.ImageURL.Location
	})
	locationView.add(locationIcon);

	var recordView = Ti.UI.createView({
		left : Zookee[12],
		height : Zookee[50],
		width : Zookee[50],
		backgroundColor : 'black',
		borderRadius : Zookee[25],
		borderColor : 'white',
		borderWidth : 2,
		opacity : 0.85,
		zIndex : 1
	})
	var _recorderView = Ti.UI.createImageView({
		center : {
			x : '50%',
			y : '50%'
		},
		height : Zookee[40],
		width : Zookee[40],
		image : Zookee.ImageURL.Record_White
	})
	recordView.add(_recorderView);
	iconArea.add(recordView);
	iconArea.add(locationView);
	iconArea.add(galleryView);
	iconArea.add(cameraView);
	view.add(iconArea);

	cameraView.addEventListener('click', function(e) {
		Ti.Media.showCamera({
			saveToPhotoGallery : false,
			success : function(event) {
				say_sth_fd.focus();
				post.photo = event.media;
				if (Zookee.isAndroid) {
					var ratio = event.media.width / event.media.height;
					var measureHeight = Ti.Platform.displayCaps.platformWidth / ratio;

					view.backgroundImage = event.media.nativePath;
				} else
					view.backgroundImage = event.media.imageAsResized(view.rect.width, view.rect.height);
			},
			cancel : function() {
				say_sth_fd.focus();
			},
			error : function(error) {
				say_sth_fd.focus();
				alert(error.message);
			},
			allowEditing : false,
			mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
		});
	})

	galleryView.addEventListener('click', function() {
		Ti.Media.openPhotoGallery({
			success : function(event) {
				say_sth_fd.focus();
				post.photo = event.media;
				if (Zookee.isAndroid) {
					var ratio = event.media.width / event.media.height;
					var measureHeight = Ti.Platform.displayCaps.platformWidth / ratio;

					view.backgroundImage = event.media.nativePath;
				} else
					view.backgroundImage = event.media.imageAsResized(view.rect.width, view.rect.height);
			},
			cancel : function() {
				say_sth_fd.focus();
			},
			error : function(error) {
				say_sth_fd.focus();
			},
			allowImageEditing : false
		});
	});

	win.selectPlace = function(venue, myLocation) {
		say_sth_fd.focus();
		var categoryName = '';
		if (venue.image) {
			categoryName = venue.image.split('/').pop();
		}
		locationIcon.reloading({
			url : venue.image,
			image : categoryName
		});

		var longitude;
		var latitude;

		if (venue) {
			post.placeName = venue.name;
			post.address = venue.location.address;
		}

		longitude = myLocation.longitude;
		latitude = myLocation.latitude;

		post.location = [longitude, latitude];
		post.category = venue.image;
	}
	locationView.addEventListener('click', function() {
		locationIcon.opacity = 0;

		Geo.getLocation(function(location) {
			if (win) {
				var distance = Util.getDistance(location, Zookee.CurrentLocation);
				//if just booth around
				if (distance < 50 && Zookee.CurrentVenues) {
					//actInd.hide();
					locationIcon.opacity = 1;
					PlaceTable.buildTable(Zookee.CurrentVenues, win, location).open({
						modal : true
					});
				} else {
					var actInd = Util.actIndicator('', locationView);
					actInd.show();
					delegate.getPlaces(location, function(venues) {
						Zookee.CurrentVenues = venues;
						if (win) {
							PlaceTable.buildTable(venues, win, location).open({
								modal : true
							});
							actInd.hide();
							locationIcon.opacity = 1;
						}
					}, function() {
						if (win) {
							actInd.hide();
							locationIcon.opacity = 1;
						}
					})
					Zookee.CurrentLocation = location;
				}
			}
		});
	})

	win.voiceRecordedCB = function() {
		post.voiceurl = 'recorded';
		_recorderView.image = Zookee.ImageURL.Audio_White;
		view.remove(_recorder);
		view.remove(mask);
	}

	win.recordCancelCB = function() {
		post.voiceurl = null;
		view.remove(_recorder);
		view.remove(mask);
	}
	var _recorder = new Recorder(win);
	var mask = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		backgroundColor : 'black',
		opacity : 0.6
	})
	recordView.addEventListener('click', function() {
		view.add(mask);
		view.add(_recorder);
	})

	win.addEventListener('open', function() {
		say_sth_fd.focus();
	})
	return win;
}

module.exports = NewPostWin;
