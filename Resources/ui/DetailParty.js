/**
 * @author kent hao
 */
var Util = require('Util');
var delegate = require('backend/Delegate');
var Lines = require('ui/Lines');
var geoLocation = require('GeoLocation');
var Zookee = require('Zookee');
var ImageView = require('ui/ImageView');
var voiceDelegate = require('backend/VoiceDelegate');
var TitleView = require('ui/TitleView');

var buildCommentRow = function(comment) {
	var row = Ti.UI.createView({
		left : 0,
		right : 0,
		layout : 'horizontal',
		height : Zookee[80],
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND
		//className : Zookee.UI.ROW_CLASS.COMMENT_CLASS
	});

	var avatar = new ImageView({
		left : Zookee[20],
		top : Zookee[10],
		bottom : Zookee[10],
		width : Zookee[50],
		height : Zookee[50],
		borderWidth : Zookee[2],
		borderColor : 'white',
		defaultImage : Zookee.ImageURL.No_Avatar,
		image : comment.user.photo.avatarImage,
		url : comment.user.photo.urls.avatar,
		loadStatus : 'starting'
	})

	var username = Ti.UI.createLabel({
		left : Zookee[5],
		text : comment.user.username + Zookee.Seperator.USERNAME_TEXT,
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		color : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		font : Zookee.FONT.NORMAL_FONT
	});

	var label1 = Ti.UI.createLabel({
		left : Zookee[10],
		right : Zookee[10],
		textAlign : 'left',
		text : comment.content,
		height : Ti.UI.SIZE,
		//width : Ti.UI.SIZE,
		font : Zookee.FONT.SMALL_FONT
	});

	row.add(avatar);
	row.add(username);
	row.add(label1);
	return row;
};

var comparePost = function(originPost, newPost) {
	var diff = {
		isDiff : false,
		newPhoto : false,
		photos : {},
		attenders : {},
		comments : {}
	};
	if (originPost.photos.length != newPost.photos.length) {
		if (originPost.photos.length == 0) {
			diff.newPhoto = true;
		}
		diff.isDiff = true;
		diff.photos = newPost.photos.slice(originPost.photos.length);
	}
	if (originPost.attenders.length != newPost.attenders.length) {
		diff.isDiff = true;
		diff.attenders = newPost.attenders.slice(1,newPost.attenders.length-originPost.attenders.length+1);
	}
	if (originPost.comments.length != newPost.comments.length) {
		diff.isDiff = true;
		var start = newPost.comments.length - originPost.comments.length;
		diff.comments = [].concat(newPost.comments);
		//for comment, the latest comment is at the beginning of the array
		diff.comments.splice(start, originPost.comments.length);
	}

	return diff;
}
var buildCommentField = function(win, post, succCB) {
	var _view = Ti.UI.createScrollView({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL
	})
	var commentField = Ti.UI.createTextField({
		left : Zookee[10],
		width : Zookee[290],
		top : Zookee[5],
		bottom : Zookee[5],
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		softKeyboardOnFocus : Zookee.Soft_Input.SOFT_KEYBOARD_SHOW_ON_FOCUS,
		enableReturnKey : true,
		bubbleParent : false
	})

	var sendButton = Ti.UI.createView({
		width : Zookee[70],
		height : Zookee[30],
		right : Zookee[5],
		backgroundGradient : Zookee.UI.BackgroundGradient,
		borderRadius : Zookee.UI.Border_Radius_Small
	})
	var sendLabel = Ti.UI.createLabel({
		center : {
			x : '50%',
			y : '50%'
		},
		textid : 'send',
		textAlign : 'center',
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
		color : 'white',
		font : Zookee.FONT.NORMAL_FONT
	})
	sendButton.add(sendLabel);

	sendButton.addEventListener('click', function() {
		if (commentField.value.trim() != '') {
			var actInd;
			if (Zookee.isAndroid)
				actInd = Util.actIndicator(L('commenting'), sendButton);
			else {
				actInd = Util.actIndicator('', sendButton);
				sendButton.remove(sendLabel);
			}
			actInd.show();
			var comment = {};
			comment.content = commentField.value;
			delegate.createComment(post, comment, function(_comment) {
				if (win) {
					actInd.hide();
					win.remove(_view);
					Util.showStatus(win, L('comment_succ'));
				}
				//post.comments.unshift(_comment);
				succCB();
			}, function() {
				if (win) {
					actInd.hide();
					win.remove(_view);
					Util.showStatus(win, L('comment_fail'));
				}
			});
		}
	});

	var toolbar;
	if (Zookee.isAndroid) {
		toolbar = Ti.UI.createView({
			bottom : 0,
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			backgroundGradient : Zookee.UI.BackgroundGradient,
			bubbleParent : false
		})
		toolbar.add(commentField);
		toolbar.add(sendButton);
	} else {
		toolbar = Ti.UI.iOS.createToolbar({
			bottom : 0,
			items : [commentField, sendButton],
			borderTop : true,
			borderBottom : false,
			bubbleParent : false
		})
	}
	_view.add(toolbar);

	_view.addEventListener('singletap', function() {
		//_view.remove(commentField);
		win.remove(_view);
	})

	win.add(_view);
	commentField.focus();
}
var buildPhoneArea = function(point, attender, win) {
	var _view = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL
	});

	win.add(_view);

	_view.addEventListener('click', function() {
		win.remove(_view);
	});

	var popover = Ti.UI.createView({
		left : point.x - Zookee[25],
		top : point.y - Zookee[75],
		width : Zookee[120],
		height : Zookee[80],
		backgroundImage : Zookee.ImageURL.Popover,
		bubbleParent : false
	})

	var container = Ti.UI.createView({
		width : Ti.UI.FILL,
		top : Zookee[10],
		height : Zookee[30]
	})

	popover.add(container);
	//first, find out the user's status, friend or not friend?
	if (!attender.status) {
		attender.status = Util.attenderStatus(attender);
	}
	//second, if friend, show phone/sms or email, if not a friend, show add friend or waiting
	if (attender.status == Zookee.FRIEND_STATUS.FRIEND) {
		// phone number exists
		if (attender.custom_fields && attender.custom_fields.phone) {
			var phone = Ti.UI.createImageView({
				left : Zookee[10],
				width : Zookee[30],
				height : Zookee[30],
				image : Zookee.ImageURL.Phone,
				number : attender.custom_fields.phone
			});
			phone.addEventListener('click', function(e) {
				Ti.Platform.openURL('tel:' + e.source.number);
			})
			var message = Ti.UI.createImageView({
				right : Zookee[10],
				width : Zookee[30],
				height : Zookee[30],
				image : Zookee.ImageURL.SMS,
				number : attender.custom_fields.phone
			});
			message.addEventListener('click', function(e) {
				Ti.Platform.openURL('sms:' + e.source.number);
			})
			container.add(phone);
			container.add(message);
		} else {
			var email = Ti.UI.createImageView({
				center : {
					x : '50%',
					y : '50%'
				},
				width : Zookee[30],
				height : Zookee[30],
				image : Zookee.ImageURL.SMS,
				email : attender.email
			});
			email.addEventListener('click', function(e) {
				Ti.Platform.openURL('mailto:' + e.source.email);
			})
			container.add(email);
		}
	} else {
		var opBtn = Ti.UI.createButton({
			center : {
				x : '50%',
				y : '50%'
			},
			style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
			width : Zookee[30],
			height : Zookee[30],
			//backgroundImage:Zookee.ImageURL.Add,
			//titleid : 'request_as_friend',
			color : 'white',
			font : Zookee.FONT.SMALL_FONT
		});
		if (attender.status == Zookee.FRIEND_STATUS.I_REQUEST) {
			opBtn.width = Ti.UI.SIZE;
			opBtn.title = L('wait_4_approve');
			opBtn.backgroundColor = 'transparent';
			opBtn.tag = 'wait_4_approve';
			opBtn.enabled = false;
		} else if (attender.status == Zookee.FRIEND_STATUS.THEY_REQUEST) {
			opBtn.width = Ti.UI.SIZE;
			opBtn.title = L('approve');
			opBtn.tag = 'approve';
			opBtn.backgroundGradient = Zookee.UI.BackgroundGradient;
			opBtn.enabled = true;
		} else {
			opBtn.backgroundImage = Zookee.ImageURL.Add;
			opBtn.borderRadius = Zookee[15];
			opBtn.borderColor = 'white';
			opBtn.borderWidth = Zookee[4];
			opBtn.tag = 'request_friend';
			opBtn.backgroundGradient = Zookee.UI.BackgroundGradient;
		}
		container.add(opBtn);
		opBtn.addEventListener('click', function(e) {
			var actInd = Util.actIndicator('', container);
			container.remove(opBtn);
			actInd.show()
			if (opBtn.tag === 'request_friend') {
				delegate.addFriend(attender.id, function() {
					actInd.hide();
					_view.fireEvent('click');
					attender.status = Zookee.FRIEND_STATUS.I_REQUEST;
					Util.showStatus(win, L('friend_request_succ'));
				}, function() {
					actInd.hide();
					_view.fireEvent('click');
					Util.showStatus(win, L('friend_request_fail'));
				})
			} else if (opBtn.tag === 'approve') {
				delegate.approveRequest(attender, function() {
					actInd.hide();
					_view.fireEvent('click');
					attender.status = Zookee.FRIEND_STATUS.FRIEND;
					Util.showStatus(win, L('friend_approve_succ'));
				}, function() {
					actInd.hide();
					_view.fireEvent('click');
					Util.showStatus(win, L('friend_approve_fail'));
				})
			}
		})
	}
	// var t=Ti.UI.create2DMatrix();
	// t=t.scale(10);
	// var center = popover.center;
	_view.add(popover);
	// popover.animate({
	// transform:t,
	// center:center,
	// duration:500
	// })
	// return [];
}
var showCommentsArea = function(point, post, win) {
	var _view = Ti.UI.createView({
		height : Ti.UI.FILL,
		width : Ti.UI.FILL
	})
	var commentList = Ti.UI.createScrollView({
		top : point.y - Zookee[10],
		left : Zookee[10],
		right : Zookee[10],
		height : Zookee[225],
		backgroundColor : 'black',
		opacity : 0.8,
		borderRadius : Zookee.UI.Border_Radius_Small,
		contentHeight : Ti.UI.SIZE,
		layout : 'vertical',
		scrollType : 'vertical'
	})

	for (var i = 0; i < post.comments.length; i++) {
		var row = Ti.UI.createView({
			top : Zookee[20],
			layout : 'horizontal',
			left : Zookee[10],
			right : Zookee[10],
			height : Ti.UI.SIZE
		})
		var username = Ti.UI.createLabel({
			text : post.comments[i].user.username + ':',
			font : Zookee.FONT.NORMAL_FONT,
			color : Zookee.UI.COLOR.MYPAD_BACKGROUND
		})

		var content = Ti.UI.createLabel({
			left : Zookee[10],
			text : post.comments[i].content,
			font : Zookee.FONT.NORMAL_FONT,
			color : 'white'
		})
		row.add(username);
		row.add(content);
		commentList.add(row);
	}
	_view.add(commentList);
	_view.addEventListener('click', function() {
		win.remove(_view);
	})
	win.add(_view);
};

exports.buildPartyDetail = function(param, move2Last, location) {
	var actIndContainer = Ti.UI.createView({
		top : -Zookee.UI.HEIGHT_TITLE,
		height : Zookee.UI.HEIGHT_TITLE
	})
	var refreshInd = Ti.UI.createActivityIndicator({
		style : Zookee.isAndroid ? Ti.UI.ActivityIndicatorStyle.PLAIN : Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN
	})
	actIndContainer.add(refreshInd);
	var friendOpShown = false;
	var commentAreaShown = false;
	var post = param.row.post;
	var showJoin = false;
	var showPhotoBtn = false;
	var win = Ti.UI.createWindow({
		navBarHidden : true,
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND
	})
	win.open({modal:true});

	var titleView = TitleView.buildTitleView(win, Util.postTimeForTitle(post.created_at));
	var refreshBtn = Ti.UI.createButton({
		backgroundImage : Zookee.ImageURL.Refresh,
		backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		width : Zookee[40],
		height : Zookee[40],
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
	})
	titleView.addView(refreshBtn);

	refreshBtn.addEventListener('click', function(e) {
		titleView.removeView(refreshBtn);
		titleView.addView(actIndContainer);
		refreshInd.show();
		actIndContainer.animate({
			top : 0,
			duration : 500
		})
		delegate.queryPartyById(post.id, function(_post) {
			var diff = comparePost(post, _post);
			if (win) {//if the window is still open
				refreshInd.hide();
				titleView.removeView(actIndContainer);
				titleView.addView(refreshBtn);
				if (diff.isDiff) {
					var loadStatus = 'waiting';
					if (diff.newPhoto) {
						photoArea.add(photoesBar);
						loadStatus = 'starting';
					}
					for (var i = 0; i < diff.photos.length; i++) {
						var dotView = Ti.UI.createView({
							left : Zookee[15],
							width : Zookee[10],
							height : Zookee[10],
							borderRadius : Zookee[5],
							backgroundColor : 'black',
							opacity : 0
						});
						scrollControl.views.push(dotView);
						scrollControl.add(dotView);
						dotView.animate({
							opacity : 1,
							duration : 500
						})
						var _imageView = new ImageView({
							width : Ti.UI.FILL,
							height : Ti.UI.FILL,
							opacity : 0.5,
							url : diff.photos[i].urls.original,
							backgroundImage : diff.photos[i].originImage,
							loadStatus : loadStatus,
							bubbleParent : false
						});
						_views.push(_imageView);
						photoesBar.addView(_imageView);
						post.photos.push(diff.photos[i]);
					}
					if (diff.attenders.length > 0) {
						if (Ti.Platform.displayCaps.platformHeight === 480) {
							attender_scroll.contentWidth = Zookee[10] + (Zookee[60] * _post.attenders.length);
						} else {
							var lineNum = Math.floor((_post.attenders.length - 1) / 6);
							attender_scroll.contentHeight = (lineNum + 1) * Zookee[60];
						}
					}
					for (var i = 0; i < diff.attenders.length; i++) {
						var top = Zookee[10];
						var left = Zookee[10];
						if (Ti.Platform.displayCaps.platformHeight != 480) {
							var lineNum = Math.floor((post.attenders.length + i) / 6);
							var position = (post.attenders.length + i) % 6;
							top = Zookee[10] + (Zookee[60] * lineNum);
							left = Zookee[10] + (Zookee[60] * position);
						}
						var attendee = new ImageView({
							left : left,
							top : top,
							width : Zookee[50],
							height : Zookee[50],
							tag : 'attender',
							defaultImage : Zookee.ImageURL.No_Avatar,
							loadStatus : 'starting',
							url : diff.attenders[i].photo.urls.avatar,
							image : diff.attenders[i].photo.avatarImage,
							attender : diff.attenders[i],
							borderRadius:Zookee.UI.Border_Radius_Small
						});
						attender_scroll.add(attendee);
						attendee.addEventListener('click', function(e) {
							buildPhoneArea(e.source.convertPointToView({
								x : 0,
								y : 0
							}, win), e.source.attender, win);
						})
						post.attenders.push(diff.attenders[i]);
					}
					if (diff.comments.length > 0) {
						if (post.comments.length == 0 && post.content == Zookee.EMPTY_POST_MARK) {
							wordsArea.changeStatus();
						}
						post.comments = post.comments.concat(diff.comments);
					}
				}
			}

			if (diff.isDiff) {
				param.mainView.addComment({
					post : _post,
					index : param.index
				});
			}
		}, function() {
			refreshInd.hide();
			titleView.removeView(actIndContainer);
			titleView.addView(refreshBtn);
		})
	})
	win.add(titleView);
	var user = Zookee.User.CurrentUser
	var joined = false;

	if (post.user.id == user.id) {
		joined = true;
	}

	var _height = '80.5%';
	//Retina 3.5 inch: absolute height = 480 dip
	//Retina 4 inch: absolute height = 568 dip
	//iphone 4: absolute height = 480 dip
	if (Ti.Platform.displayCaps.platformHeight === 568) {
		_height = '78%';
	}

	var view = Ti.UI.createView({
		left : 0,
		right : 0,
		top : Zookee.UI.HEIGHT_TITLE,
		bottom : 0,
		layout : 'vertical',
		backgroundImage : Zookee.ImageURL.Background,
		post : post
		//backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND
	});

	win.add(view);

	/**
	 * party photo area:
	 * 1. party photo (scrollable view)
	 * 2. party info (label, place, audio)
	 * 3. dotted scroll control
	 */
	var photoArea = Ti.UI.createView({
		left : 0,
		right : 0,
		height : Ti.Platform.displayCaps.platformWidth / Zookee.UI.IMAGE.PARTY_IMAGE_RATIO,
		backgroundImage : Zookee.ImageURL.Empty_Photo
	});

	var scrollControl = Ti.UI.createView({
		layout : 'horizontal',
		center : {
			x : '50%',
			y : '5%'
		},
		opacity : 0.65,
		width : Ti.UI.SIZE,
		height : Zookee[10],
		currentPage : 0,
		views : [],
		zIndex : 1
	})
	if (Zookee.isAndroid && post.hasPhoto)
		photoArea.add(scrollControl);

	// photos scrollableview
	var _views = [];

	for (var i = 0; i < post.photos.length; i++) {
		var dotView = Ti.UI.createView({
			left : Zookee[15],
			width : Zookee[10],
			height : Zookee[10],
			borderRadius : Zookee[5],
			backgroundColor : i == 0 ? 'white' : 'black'
		})
		var _imageView = new ImageView({
			width : Ti.UI.FILL,
			height : Ti.UI.FILL,
			url : post.photos[i].urls.party,
			backgroundImage : post.photos[i].partyImage,
			loadStatus : 'waiting',
			bubbleParent : false,
			index : i
		});
		_imageView.addEventListener('click', function(e) {
			var _view = Ti.UI.createView({
				width : Ti.UI.FILL,
				height : Ti.UI.FILL,
				backgroundColor : 'black'
			})

			var originImage = new ImageView({
				width : Ti.UI.FILL,
				height: Ti.Platform.displayCaps.platformWidth/Zookee.UI.IMAGE.ORIGIN_IMAGE_RATIO,
				url : post.photos[e.source.index].urls.original,
				backgroundImage : post.photos[e.source.index].originImage,
				defaultImage : Zookee.ImageURL.Empty_Photo,
				loadStatus : 'starting',
				enableZoomControls : true,
			});
			_view.add(originImage);
			_view.addEventListener('click', function() {
				win.remove(_view);
			})
			win.add(_view);
		})
		_views.push(_imageView);
		scrollControl.add(dotView);
		scrollControl.views.push(dotView);
	}

	var photoesBar = Ti.UI.createScrollableView({
		//contentWidth : 480 * post.photos.length,
		//contentHeight : 400,
		views : _views,
		left : 0,
		right : 0,
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		currentPage : 0,
		showPagingControl : false,
		pagingControlHeight : Zookee[10],
		disableBounce : true,
		bubbleParent : false
		//layout : 'horizontal',
		//disableBounce : true
	})

	if (!Zookee.isAndroid) {
		photoesBar.showPagingControl = true;
		photoesBar.pagingControlOnTop = true;
		photoesBar.overlayEnabled = true;
		photoesBar.pagingControlAlpha = 0.65;
	}

	view.addEventListener('swipe', function(e) {
		if (e.direction === 'right') {
			win.close();
		}
	})
	var url = post.user.photo.urls.avatar;
	var imageFile = post.user.photo.avatarImage;
	if (post.hasPhoto) {
		url = post.photos[0].user.photo.urls.avatar;
		imageFile = post.photos[0].user.photo.avatarImage;
	}
	var photoAuthorAvatar = new ImageView({
		left : Zookee[20],
		top : Zookee[20],
		width : Zookee[40],
		height : Zookee[40],
		defaultImage : Zookee.ImageURL.No_Avatar,
		borderRadius : Zookee.UI.Border_Radius_Small,
		image : imageFile,
		zIndex : 1,
		url : url,
		loadStatus : 'starting'
	})
	photoArea.add(photoAuthorAvatar);
	if (post.hasPhoto) {
		var currentPage = 0;

		// load image only at the time the image is presented.
		photoesBar.addEventListener('scrollend', function(e) {
			if (e.currentPage != scrollControl.currentPage) {
				photoAuthorAvatar.reloading({
					url : post.photos[e.currentPage].user.photo.urls.avatar,
					image : post.photos[e.currentPage].user.photo.avatarImage
				});

				if (Zookee.isAndroid) {
					scrollControl.views[scrollControl.currentPage].backgroundColor = 'black';
					scrollControl.views[e.currentPage].backgroundColor = 'white';
				}
				scrollControl.currentPage = e.currentPage;
				//here,use e.currentPage, don't use photoesBar.currentPage, it's always 0
				if (_views[e.currentPage].loadStatus == 'waiting') {
					_views[e.currentPage].startLoading();
				}
			}
		})
		photoArea.add(photoesBar);
		_views[0].startLoading();
	}
	view.add(photoArea);

	//party content
	var wordsArea = Ti.UI.createView({
		// voice only
		// voice and content only
		// no voice and no content
		left : Zookee[10],
		right : Zookee[10],
		height : '9%',
		horizontalWrap : false
	});
	wordsArea.addEventListener('click', function() {
		if (post.comments.length > 0)
			showCommentsArea(attender_scroll.convertPointToView({
				x : 0,
				y : 0
			}, win), post, win);
	})
	var partyContent = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		layout : 'horizontal',
		horizontalWrap : false
	});

	if (post.voice || post.voiceurl || post.content != Zookee.EMPTY_POST_MARK) {
		partyContent.add(Ti.UI.createLabel({
			top : 0,
			text : post.user.username + ':',
			font : Zookee.FONT.NORMAL_FONT_ITALIC,
			color : Zookee.UI.COLOR.MYPAD_BACKGROUND,
			bubbleParent : false
		}))
	}
	if (post.voice || post.voiceurl) {
		var audioView = Ti.UI.createView({
			top : 0,
			left : Zookee[4],
			width : Zookee[30],
			height : Zookee[30],
			backgroundImage : Zookee.ImageURL.Audio,
			tag : 'audio',
			bubbleParent : false
		});
		audioView.addEventListener('click', function(e) {
			var playCompletedCB = function() {
				e.source.backgroundImage = Zookee.ImageURL.Audio;
			}
			if (Zookee.MediaPlayer == null) {
				Zookee.MediaPlayer = VoiceRecorder.createRecorder();
				Zookee.MediaPlayer.id = '';
				Zookee.MediaPlayer.source = {};
			}
			if (post.id == Zookee.MediaPlayer.id) {
				if (e.source.backgroundImage == Zookee.ImageURL.Audio) {
					Zookee.MediaPlayer.startPlaying({
						playCompleted : playCompletedCB
					});
					e.source.backgroundImage = Zookee.ImageURL.Pause;
				} else if (e.source.backgroundImage == Zookee.ImageURL.Pause) {
					Zookee.MediaPlayer.pause();
					e.source.backgroundImage = Zookee.ImageURL.Audio;
				}
			} else {
				// reset the previous audio view
				Zookee.MediaPlayer.stopPlaying();
				Zookee.MediaPlayer.source.backgroundImage = Zookee.ImageURL.Audio;
				Zookee.MediaPlayer.source = e.source;
				if (post.voiceurl) {
					Zookee.MediaPlayer.recordFile = post.voiceurl;
					Zookee.MediaPlayer.startPlaying({
						playCompleted : playCompletedCB
					});
				} else {
					var a;
					//e1.row.add(indicator);
					voiceDelegate.getVoiceData(post, function(url) {
						Zookee.MediaPlayer.id = post.id;
						e.source.backgroundImage = Zookee.ImageURL.Pause;
						Zookee.MediaPlayer.recordFile = url;
						Zookee.MediaPlayer.startPlaying({
							playCompleted : playCompletedCB
						});
					}, function() {
						alert('Get voice error!');
						e.source.backgroundImage = Zookee.ImageURL.Audio;
					}, function() {
						e.source.backgroundImage = 's';
						var _ind = Ti.UI.createActivityIndicator({
							style : Zookee.isAndroid ? Ti.UI.ActivityIndicatorStyle.DARK : Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
							center : {
								x : '50%',
								y : '50%'
							}
						});
						e.source.actInd = _ind;
						e.source.add(_ind);
						_ind.show();
					}, function() {
						if (e.source.actInd) {
							e.source.actInd.hide();
							e.source.remove(e.source.actInd);
							e.source.actInd = null;
						}
					});
				}
			}
		})
		partyContent.add(audioView);
	}
	if (post.content != Zookee.EMPTY_POST_MARK) {
		partyContent.add(Ti.UI.createLabel({
			top : 0,
			left : Zookee[4],
			ellipsize : true,
			text : post.content,
			width : Ti.UI.SIZE,
			height : Ti.UI.SIZE,
			font : Zookee.FONT.NORMAL_FONT_ITALIC,
			color : Zookee.UI.COLOR.PARTY_CONTENT
		}))

	} else {
		var text = 'nobody is saying anything ...';
		if (post.comments.length > 0)
			text = 'friends are commenting this party ...';
		var comments = Ti.UI.createLabel({
			text : text,
			font : Zookee.FONT.NORMAL_FONT_ITALIC,
			color : Zookee.UI.COLOR.PARTY_CONTENT
		})
		wordsArea.comments = comments;
		partyContent.add(comments);
	}
	wordsArea.changeStatus = function() {
		comments.text = 'friends are commenting this party ...';
	}
	view.add(wordsArea);
	wordsArea.add(partyContent);
	// attenees area
	// construct all attendees
	var row_num = 1;
	if (post.attenders.length % 6 > 0)
		row_num = post.attenders.length / 6 + 1;
	else
		row_num = post.attenders.length / 6;
	var attender_scroll = Ti.UI.createScrollView({
		top : Zookee[5],
		height : '22%',
		left : Zookee[10],
		right : Zookee[10],
		backgroundColor : 'white',
		borderRadius : Zookee.UI.Border_Radius_Normal,
		//layout : 'horizontal',
		//horizontalWrap : true,
		bubbleParent : false
	});
	if (Ti.Platform.displayCaps.platformHeight === 480) {
		attender_scroll.layout = 'horizontal';
		attender_scroll.scrollType = 'horizontal';
		attender_scroll.contentWidth = Zookee[10] + (Zookee[60] * post.attenders.length);
		attender_scroll.height = '13%';
	} else {
		attender_scroll.contentHeight = row_num * Zookee[60];
		attender_scroll.scrollType = 'vertical';
	}

	for (var i = 0; i < post.attenders.length; i++) {
		var lineNum = Math.floor(i / 6);
		var position = i % 6;

		var top = Zookee[10];
		var left = Zookee[10];
		//iphone 5, galaxy
		if (Ti.Platform.displayCaps.platformHeight != 480) {
			top = Zookee[10] + (Zookee[60] * lineNum);
			left = Zookee[10] + (Zookee[60] * position);
		}
		var attendee = new ImageView({
			top : top,
			left : left,
			width : Zookee[50],
			height : Zookee[50],
			tag : 'attender',
			borderRadius : Zookee.UI.Border_Radius_Small,
			defaultImage : Zookee.ImageURL.No_Avatar,
			loadStatus : 'starting',
			image : post.attenders[i].photo.avatarImage,
			url : post.attenders[i].photo.urls.avatar,
			attender : post.attenders[i]
		});

		if (post.attenders[i].id == user.id) {
			attendee.touchEnabled = false;
			// not clickable for the user himself
			joined = true;
		}
		attender_scroll.add(attendee);
		attendee.addEventListener('click', function(e) {
			buildPhoneArea(e.source.convertPointToView({
				x : 0,
				y : 0
			}, win), e.source.attender, win);
		})
	}
	view.add(attender_scroll);

	var locationArea = Ti.UI.createView({
		top : Zookee[5],
		height : '15%',
		//width : Ti.UI.FILL,
		left : Zookee[10],
		right : Zookee[10],
		layout : 'horizontal',
	});
	locationArea.addEventListener('click',function(e){
		Ti.Platform.openURL('http://maps.google.com/maps?ll=' + post.latitude + ',' + post.longitude);
	})

	var categoryName = 's';
	if (post.locationCategory) {
		categoryName = post.locationCategory.split('/').pop();
	}

	var partyInfo = Ti.UI.createView({
		layout : 'vertical',
		center : {
			x : '50%',
			y : '50%'
		},
		left : Zookee[10],
		width : '70%',
		height : Zookee[50]
		//horizontalWrap : true
	});

	var whereLabel = Ti.UI.createLabel({
		width : Ti.UI.FILL,
		height : Zookee[23],
		text : post.placeName,
		color : Zookee.UI.COLOR.PARTY_CONTENT,
		font : Zookee.FONT.NORMAL_FONT
	});

	var addressLabel = Ti.UI.createLabel({
		width : Ti.UI.FILL,
		height : Zookee[23],
		color : Zookee.UI.COLOR.MYPAD_BACKGROUND,
		text : post.address,
		font : Zookee.FONT.NORMAL_FONT
	});

	partyInfo.add(whereLabel);
	partyInfo.add(addressLabel);

	//partyInfo.add(refresh);
	if (post.locationCategory) {
		locationArea.add(new ImageView({
			left : 0,
			center : {
				x : '10%',
				y : '50%'
			},
			width : Zookee[45],
			height : Zookee[45],
			defaultImage : Zookee.ImageURL.Party,
			url : post.locationCategory,
			image : categoryName,
			loadStatus : 'starting'
		}))
	} else {
		locationArea.add(Ti.UI.createView({
			left : 0,
			center : {
				x : '10%',
				y : '50%'
			},
			width : Zookee[45],
			height : Zookee[45],
			backgroundImage : Zookee.ImageURL.Party
		}))
	}
	locationArea.add(partyInfo);

	var ads = Ti.UI.createLabel({
		text : '10',
		textAlign : 'center',
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
		font : Zookee.FONT.SMALL_FONT,
		left : Zookee[10],
		center : {
			x : '50%',
			y : '50%'
		},
		width : Zookee[40],
		height : Zookee[30],
		borderRadius : Zookee.UI.Border_Radius_Small,
		backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		backgroundGradient : Zookee.UI.BackgroundGradient,
		color : 'white',
		touchEnabled : post.ads ? true : false,
		bubbleParent:false
	})
	locationArea.add(ads);
	view.add(locationArea);
	/**
	 * bottom area
	 */
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

	var currentTime = new Date();
	var buttonNum = 3;
	if (!joined && Util.isPartyHappening(post) && distance < Zookee.Distance_Party) {
		showJoin = true;
		buttonNum = 2;
	} else if (joined) {
		showJoin = false;
		buttonNum = 3;
	} else {
		showJoin = false;
		buttonNum = 1;
	}

	var operationArea = Ti.UI.createView({
		top : Zookee[5],
		height : Zookee[40],
		left : Zookee[10],
		right : Zookee[10],
		layout : 'horizontal',
		backgroundGradient : Zookee.UI.BackgroundGradient,
		borderRadius : Zookee.UI.Border_Radius_Small
	});
	var commentBtn = Ti.UI.createView({
		height : Ti.UI.FILL,
		width : (Ti.Platform.displayCaps.platformWidth - Zookee[23]) / buttonNum
	});
	commentBtn.add(Ti.UI.createButton({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND
	}))
	commentBtn.add(Ti.UI.createImageView({
		center : {
			x : '50%',
			y : '50%'
		},
		height : Zookee[25],
		width : Zookee[25],
		image : Zookee.ImageURL.Comment
	}))
	var galleryBtn = Ti.UI.createView({
		height : Ti.UI.FILL,
		width : (Ti.Platform.displayCaps.platformWidth - Zookee[23]) / buttonNum,
		touchEnabled : joined ? true : false
	});
	galleryBtn.add(Ti.UI.createButton({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		enabled : joined ? true : false
	}))
	galleryBtn.add(Ti.UI.createImageView({
		center : {
			x : '50%',
			y : '50%'
		},
		height : Zookee[30],
		width : Zookee[30],
		image : Zookee.ImageURL.Gallery
	}))
	var cameraBtn = Ti.UI.createView({
		height : Ti.UI.FILL,
		width : (Ti.Platform.displayCaps.platformWidth - Zookee[23]) / buttonNum,
		touchEnabled : joined ? true : false
	});
	cameraBtn.add(Ti.UI.createButton({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		enabled : joined ? true : false
	}))
	cameraBtn.add(Ti.UI.createImageView({
		center : {
			x : '50%',
			y : '50%'
		},
		height : Zookee[30],
		width : Zookee[30],
		image : Zookee.ImageURL.Camera
	}))
	var joinBtn = Ti.UI.createView({
		height : Ti.UI.FILL,
		width : (Ti.Platform.displayCaps.platformWidth - Zookee[23]) / buttonNum,
		backgroundColor:'transparent'
		//backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		//backgroundColor:'red',
	});	
	var joinBtn1 = Ti.UI.createButton({
		titleid : 'join',
		color : 'white',
		height : Ti.UI.FILL,
		width : Ti.UI.FILL,
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		borderWidth : 0,
		backgroundColor:'transparent',
		font : Zookee.FONT.NORMAL_FONT_ITALIC
		//backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
		//backgroundColor:'red',
	});
	joinBtn.add(joinBtn1);
	operationArea.add(commentBtn);
	if (buttonNum === 3) {
		operationArea.add(galleryBtn);
		operationArea.add(cameraBtn);
	} else if (buttonNum === 2) {
		operationArea.add(joinBtn);
		joinBtn1.addEventListener('click', function() {
			var actInd1 = Util.actIndicator('', joinBtn);
			joinBtn.remove(joinBtn1);
			actInd1.show();
			delegate.joinParty(user, post, function() {
				param.mainView.addComment({
					post : post,
					index : param.index
				});
				if (win) {
					actInd1.hide();
					commentBtn.width = (Ti.Platform.displayCaps.platformWidth - Zookee[23]) / 3;
					galleryBtn.width = (Ti.Platform.displayCaps.platformWidth - Zookee[23]) / 3;
					cameraBtn.width = (Ti.Platform.displayCaps.platformWidth - Zookee[23]) / 3;
					galleryBtn.enabled = true;
					cameraBtn.enabled = true;
					operationArea.remove(joinBtn);
					operationArea.add(galleryBtn);
					operationArea.add(cameraBtn);
					var lineNum = Math.floor((post.attenders.length - 1) / 6);
					var position = (post.attenders.length - 1) % 6;
					var top = Zookee[10];
					var left = Zookee[10];
					if (Ti.Platform.displayCaps.platformHeight === 480) {
						attender_scroll.contentWidth = Zookee[10] + (Zookee[60] * post.attenders.length);
					} else {
						attender_scroll.contentHeight = (lineNum + 1) * Zookee[60];
						top = Zookee[10] + (Zookee[60] * lineNum);
						left = Zookee[10] + (Zookee[60] * position);
					}
					var attendee = new ImageView({
						top : top,
						left : left,
						width : Zookee[50],
						height : Zookee[50],
						opacity : 0,
						tag : 'attender',
						defaultImage : Zookee.ImageURL.No_Avatar,
						loadStatus : 'starting',
						image : user.photo.avatarImage,
						url : user.photo.urls.avatar,
						touchEnabled : false,
						borderRadius:Zookee.UI.Border_Radius_Small
					});
					attender_scroll.add(attendee);
					attendee.animate({
						opacity : 1,
						duration : 1000
					});
					Util.showStatus(win, L('joined_succ'));
				}
			}, function() {
				if (win) {
					actInd1.hide();
					joinBtn.add(joinBtn1);
					Util.showStatus(win, L('joined_fail'));
				}
			})
		})
	}
	view.add(operationArea);

	var createPhoto = function(image) {
		var _actInd = Util.actIndicator(L('uploading'), photoArea, true);
		_actInd.show();
		delegate.createPhoto(image, post, function(photo) {
			// window is still open
			if (win) {
				var dotView = Ti.UI.createView({
					left : Zookee[15],
					width : Zookee[10],
					height : Zookee[10],
					borderRadius : Zookee[5],
					backgroundColor : 'black',
					opacity : 0
				});
				scrollControl.views.push(dotView);
				scrollControl.add(dotView);
				dotView.animate({
					opacity : 1,
					duration : 500
				})
				var _imageView = new ImageView({
					width : Ti.UI.FILL,
					height : Ti.UI.FILL,
					opacity : 0,
					defaultImage:Zookee.ImageURL.Empty_Photo,
					url : photo.urls.original,
					backgroundImage : photo.originImage,
					loadStatus : 'starting'
				});
				photoesBar.addView(_imageView);
				_views.push(_imageView);
				if (_views.length > 1)
					photoesBar.scrollToView(_views.length - 1);
				else {
					photoArea.add(photoesBar);
					photoAuthorAvatar.reloading({
						url : photo.user.photo.urls.avatar,
						image : photo.user.photo.avatarImage
					})
				}

				_actInd.hide();
				Util.showStatus(win, L('createphoto_succ'));
			}
			param.mainView.addPhoto({
				post : post,
				move2Last : true,
				index : param.index
			});

			image = null;
		}, function() {
			image = null;
			_actInd.hide();
			Util.showStatus(win, L('createphoto_fail'));
		})
	};
	cameraBtn.addEventListener('click', function() {
		Ti.Media.showCamera({
			saveToPhotoGallery : true,
			success : function(event) {
				createPhoto(event.media);
			},
			cancel : function() {
			},
			error : function(error) {
				alert('Error!');
			},
			allowEditing : false,
			mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
		});
	})

	galleryBtn.addEventListener('click', function() {
		Ti.Media.openPhotoGallery({
			success : function(event) {
				createPhoto(event.media);
			},
			cancel : function() {
			},
			error : function(error) {
				alert('Error!');
			},
			allowEditing : false,
			mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
		})
	})

	commentBtn.addEventListener('click', function() {
		buildCommentField(win, post, function() {
			param.mainView.addComment({
				post : post,
				index : param.index
			});
			if (post.comments.length == 1) {
				wordsArea.changeStatus();
			}
		});
	})
	//buttonArea.add(commentBtn);

	win.addEventListener('close', function() {
		Util.removeChildren(win);
		commentIcon = null;
		partyBar = null;
		//commentBtn = null;
		commentField = null;
		attender_scroll = null;
		avatar = null;
		whereLabel = null;
		for (var i = 0; i < _views.length; i++) {
			_views[i] = null;
			if (_views.toString().indexOf('ImageView') != -1) {
				_views.image = '';
			}
		}

		commentsList = null;
		partyInfo = null;
		scrollControl = null;
		commentArea = null;
		title = null;
		//param = null;
		photoArea = null;
		titleView = null;
		photoesBar = null;
		shadow = null;
		joinBtn = null;
		addressLabel = null;
		singleLine = null;
		postTime = null;
		buttonArea = null;
		refreshBtn = null;
		cameraBtn = null;
		galleryBtn = null;
		createPhoto = null;
		view = null;
		categoryName = null;
		friendOp = null;
		leftView = null;
		rightView = null;
		win = null;
		if (Zookee.MediaPlayer != null) {
			Zookee.MediaPlayer.reset();
		}
	})

	return win;
};
