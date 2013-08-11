/**
 * @author kent hao
 */
var Cloud = require('ti.cloud');
var CloudPush = Ti.Platform.osname === 'android' ? require('ti.cloudpush') : {};
var Zookee = require('Zookee');
var Util = require('Util');

Cloud.debug = true;
var baseURL = "https://api.cloud.appcelerator.com/v1";
var togetherKey = "yLk03d0Fmkanoi0aQ5tM3OxezbiwAirm";
var basicParam = "key=" + togetherKey + "&per_page=" + Zookee.MaxLoadingRows + "&order=-created_at&response_json_depth=1";

exports.createUser = function(user, callback, failCallback) {
	var obj = {
		email : user.email,
		//username : user.nickName,
		password : user.password,
		password_confirmation : user.password
	}
	if (user.first_name) {
		obj.first_name = user.first_name;
		obj.last_name = user.last_name;
	}
	if (user.photo) {
		obj.photo = user.photo;
		obj[Zookee.ImageSize.AVATAR] = Zookee.ImageSize.AVATAR_SIZE;
		obj[Zookee.ImageSize.ORIGIN] = Zookee.ImageSize.AVATAR_SIZE;
	}
	if (user.custom_fields) {
		obj.custom_fields = user.custom_fields;
	}
	Cloud.Users.create(obj, function(e) {
		if (e.success) {
			Ti.App.Properties.setString('sessionid', e.meta.session_id);
			var obj=Ti.App.Properties.getObject('password') || {};
			obj[user.email]=user.password;
			Ti.App.Properties.setObject('password', obj);
			Cloud.Emails.send({
				template : 'Register',
				recipients : user.email,
				username : user.first_name,
				password : user.password
			}, function(e) {

			});
			initializeUser(e.users[0]);
			if (user.photo) {
				Util.cacheImage(e.users[0].photo.avatarImage, user.photo);
			}
			Zookee.User.setUser(e.users[0]);
			Ti.App.Properties.setString('email', user.email);
			Ti.App.Properties.setString('password', user.password);
			callback();
			//getInvitations(user.email, callback);
		} else {
			alert('Error:\\n' + ((e.error && e.message) || JSON.stringify(e)) + '\\n' + user.avatar);
			failCallback();
		}
	});

};

exports.login = function(user, callback, failCallback,tryAgain) {
	var resetPassword = false;
	if (!user.password) {
		var obj = Ti.App.Properties.getObject('password');
		if(obj && obj[user.email])
			user.password = obj[user.email];
	} else {
		// user login from a different device
		resetPassword = true;
	}
	Cloud.Users.login({
		login : user.email,
		password : user.password
	}, function(e) {
		if (e.success) {
			Ti.App.Properties.setString('sessionid', e.meta.session_id);
			Zookee.isLogin=true;
			initializeUser(e.users[0]);
			var user = e.users[0];
			Zookee.User.setUser(user);
			var password = Util.randomUUID();
			if (Zookee.resetPassword) {
				Cloud.Users.update({
					password : password,
					password_confirmation : password
				}, function(e) {
					//TODO: re-send the password email
					Cloud.Emails.send({
						template : 'ResetPassword',
						recipients : user.email,
						username : user.username,
						password : password
					}, function(e) {

					})
				})
			}

			callback();
			//queryEmotions(e.users[0], callback, failCallback);
		} else {
			if(tryAgain)
				exports.login(user, callback, failCallback);
			else{
				Util.handleError(e);
				failCallback();
			}
		}
	});
};

exports.updateUser = function(user, callback, failCallback) {
	var _user = Zookee.User.CurrentUser;
	if (user.photo) {
		var ratio = user.photo.width / user.photo.height;
		var avatarHeight = Zookee.ImageSize.AVATAR_CACHE_WIDTH / ratio;
		var avatarSizeStr = '' + Zookee.ImageSize.AVATAR_CACHE_WIDTH + 'x' + avatarHeight + '#';
		user[Zookee.ImageSize.AVATAR] = avatarSizeStr;
		user[Zookee.ImageSize.ORIGIN] = avatarSizeStr;
	}
	Cloud.Users.update(user, function(e) {
		if (e.success) {
			initializeUser(e.users[0]);

			if (user.photo) {
				Util.cacheImage(e.users[0].photo.avatarImage, user.photo);
				_user.photo = e.users[0].photo;
			}
			_user.email = e.users[0].email;
			_user.username = e.users[0].first_name;
			_user.custom_fields = e.users[0].custom_fields;
			_user.priority = e.users[0].priority;
			_user.priorityStartTime=e.users[0].priorityStartTime;
			Zookee.User.setUser(_user);
			callback(_user);
		} else {
			Util.handleError(e);
			failCallback();
		}
	});
};

exports.logout = function(callback, failCallback) {
	Cloud.Users.logout(function(e) {
		if (e.success) {
			var ImageDelegate = require('backend/ImageDelegate');
			var imageDelegate = new ImageDelegate();
			imageDelegate.clearAll();
			Ti.App.Properties.removeProperty('sessionid');
			Ti.App.Properties.removeProperty('password');
			Ti.App.Properties.removeProperty('pref');
			Ti.App.Properties.removeProperty('pre_ads');
			callback();
		} else {
			Util.handleError(e);
			failCallback();
		}
	});
};

exports.createAd = function(post, parties, callback, failCallback) {
	var tags = [];

	for (var i = 0; i < parties.length; i++) {
		tags.push(parties[i].id);
	}
	var obj = {
		title : post.title,
		content : post.content,
		//title: post.title,
		tags : tags.join(','),
		custom_fields : {
			location : post.location,
			address : post.address,
			phone:Zookee.User.CurrentUser.custom_fields.phone
		}
	};
	obj.custom_fields.type=Ti.App.Properties.getString('pref');
	
	var listPriority=false;
	var user=Zookee.User.CurrentUser;
	for(var i=0,length=user.priority.length;i<length;i++){
		if(user.priority[i].indexOf('list')>=0 && Util.isPriorityValid(user.priority[i],user.priorityStartTime[i])
			&& Util.isPriorityValid4Party(parties[0].created_at,user.priorityStartTime[i])){
			listPriority = true;
			break;
		}
	}
	if(listPriority){
		obj.custom_fields.listPriority='has';
		// record the priority time, so the together can do some clarification that
		// if the priorityTime doesn't equal to the ad created time, then it's a fake
		// priority
	}else{
		obj.custom_fields.listPriority='';
	}
	
	if (post.photo) {
		obj.photo = Ti.Filesystem.getFile(post.photo).read();
		var ratio = obj.photo.width / obj.photo.height;
		var thumbHeight = Zookee.ImageSize.THUMB_CACHE_WIDTH / ratio;
		var thumbSizeStr = '' + Zookee.ImageSize.THUMB_CACHE_WIDTH + 'x' + thumbHeight + '#';
		obj[Zookee.ImageSize.THUMB] = thumbSizeStr;
		obj[Zookee.ImageSize.ORIGIN] = thumbSizeStr;
	}

	Cloud.Posts.create(obj, function(e) {
		if (e.success) {
			//e.posts[0].backgroundPhoto = post.photo == null ? null : post.photo;
			var _post = e.posts[0];
			callback(_post);
		} else {
			failCallback();
			Util.handleError(e);
		}
	});
};

exports.updatePhoto = function(photo, post, callback, failCallback) {
	Cloud.Photos.update({
		photo_id : photo.id,
		custom_fields : {
			party_id : post.id
		}
	}, function(e) {
		if (e.success) {

		} else {
			Util.handleError(e);
		}
	});
};

exports.joinParty = function(user, post, callback, failCallback) {
	Cloud.Reviews.create({
		post_id : post.id,
		content : user.username + ' joined',
		tags : 'join',
		rating : 1,
		allow_duplicate : 1,
		custom_fields : {
			postid : post.id
		}
	}, function(e) {
		if (e.success) {
			if (post.comments == null) {
				post.comments = [];
			}
			//post.attenders.unshift(user);
			// unshift doesn't work on safari
			post.attenders = [user].concat(post.attenders);
			//post.comments.push(e.reviews[0]);
			callback(post);
		} else {
			Util.handleError(e);
			failCallback();
		}
	});
};

exports.searchUser = function(keyword, callback, failCallback) {
	Cloud.Users.search({
		page : 1,
		per_page : 10,
		q : keyword
	}, function(e) {
		if (e.success) {
			for (var i = 0; i < e.users.length; i++) {
				initializeUser(e.users[i])
			}
			callback(e.users);
		} else {
			Util.handleError(e);
			failCallback();
		}
	});
};

var currentPage = 1;
exports.setPostPage = function(index) {
	currentPage = index;
};

var currentPartyPage = 1;
exports.setPartyPage = function(index) {
	currentPartyPage = index;
};

var currentNearPartyPage = 1;
exports.setNearPartyPage = function(index) {
	currentNearPartyPage = index;
}

var hasMore = true;
exports.getHasMore = function(){
	return hasMore;
};
exports.setHasMore = function(_hasMore){
	hasMore = _hasMore;
};

exports.queryParty = function(callback, failCallback, location) {
	//TODO: construct query url like
	var user = Zookee.User.CurrentUser;
	if(!hasMore) return;
	var op = "/posts/query.json?";
		var radius = 0.00126;
		for(var i=0,length=user.priority.length;i<length;i++){
			if(user.priority[i].indexOf('area')>=0 && Util.isPriorityValid(user.priority[i], user.priorityStartTime[i])){
				radius = 0.00126*3;
				break;
			}
		}	
	var filter = '';
	if (Ti.App.Properties.hasProperty('pref'))
		filter = '"title":"' + Ti.App.Properties.getString('pref') + '",';
	var dateString = (new Date()).toISOString().split(/T/)[0]+'T00:00:00+0000';
	var dateFilter = '"created_at":{"$gt":"'+dateString+'"},'
	// according to user's priority, increase the search area
	var areaRatio = 1;
	// be careful, when you combine coordinates with other query conditions like
	// title, content, tags_array, make sure put these conditions before coordinates.
	var where = '&where={' + filter + dateFilter + '"coordinates":{"$nearSphere":[' + location.join(',') + '],"$maxDistance":'+radius+'}}';
	var url = baseURL + op + basicParam + "&page=" + currentPartyPage + where;
	Ti.API.info(url);
	var xhr = Ti.Network.createHTTPClient();
	xhr.setTimeout(Zookee.AJAX.TIME_OUT);

	xhr.onload = function() {
		var e = JSON.parse(this.responseText).response;
		currentPartyPage = currentPartyPage + 1;
		if(e.posts!=null && e.posts.length<Zookee.MaxLoadingRows) hasMore = false;
		var posts = [];
		if (e.posts != null && e.posts.length > 0) {
			for (var i = 0,l=e.posts.length; i < l; i++) {
				initializePost(e.posts[i]);
				if(e.posts[i].ratings_summary && e.posts[i].ratings_summary['2'])
					e.posts[i].attenders = e.posts[i].ratings_summary['2']+1;
				else
					e.posts[i].attenders = 1;

				// in case the user fake the time to extend the priority
				//,e.g, change the system time, the party will not be presented.				
				if(Util.isValidPost(e.posts[i].created_at)){
					posts.push(e.posts[i]);
				}
			}
		}
		callback(posts);
	}

	xhr.onerror = function(e) {
		//it's not a better way, increase in api call.
		//TODO store the voiceurl in somewhere
		failCallback();
	}

	xhr.open("GET", url);

	xhr.send();
};

exports.createComment = function(post, comment, callback, failCallback) {
	Cloud.Reviews.create({
		post_id : post.id,
		rating : 1,
		content : comment.content,
		allow_duplicate : 1,
		tags : 'comment',
		custom_fields : {
			postid : post.id
		}
	}, function(e) {
		if (e.success) {
			initializeUser(e.reviews[0].user);
			post.comments = e.reviews.concat(post.comments);
			callback(e.reviews[0]);
		} else {
			Util.handleError(e);
			failCallback();
		}
	});
};

// attention, there's no post id in the response json of review, so if you dont specify the post_id
// for the query, then you can not get relationship between reviews and posts
// we can use custome_field to build this relationship by yourself.
function queryComment(posts, callback, failCallback) {
	var postIds = [];
	for (var i = 0; i < posts.length; i++) {
		postIds.push(posts[i].id);
	}
	var url = baseURL + "/reviews/query.json?key=" + togetherKey + "&where={\"rating\":{\"$gt\":1.0},\"postid\":{\"$in\":[\"" + postIds.join('\",\"') + "\"]}}";
	var xhr = Ti.Network.createHTTPClient();
	xhr.setTimeout(Zookee.AJAX.TIME_OUT);

	xhr.onload = function() {
		var e = JSON.parse(this.responseText).response;
		if (e.reviews != null && e.reviews.length > 0) {
			for (var i = 0; i < e.reviews.length; i++) {
				for (var j = 0; j < posts.length; j++) {
					if (e.reviews[i].custom_fields && e.reviews[i].custom_fields.postid == posts[j].id) {
						posts[j].attenders.push(e.reviews[i].user);
						break;
					}
				}
			}
		}
		callback();
	}

	xhr.onerror = function(e) {
		//it's not a better way, increase in api call.
		//TODO store the voiceurl in somewhere
		Util.handleError(e);
		failCallback(posts);
	}

	xhr.open("GET", url);

	xhr.send();
};

exports.createAudio = function(audio) {
	Cloud.Files.create({
		name : 'test.dat',
		file : audio
	}, function(e) {
		if (e.success) {
			var file = e.files[0];
			alert('Success:\\n' + 'id: ' + file.id + '\\n' + 'name: ' + file.name + '\\n' + 'updated_at: ' + file.updated_at);
		} else {
			Util.handleError(e);
		}
	});
};

exports.queryPhoto = function(id, callback, failCallback) {
	Cloud.Photos.show({
		photo_id : id
	}, function(e) {
		if (e.success) {
			callback(e.photos[0]);
		} else {
			Util.handleError(e);
			failCallback();
		}
	});
};

exports.getVoice = function(post, callback, failCallback) {
	Cloud.Files.show({
		file_id : post.custom_fields.voiceid,
		response_json_depth : Zookee.AJAX.RESPONSE_DEPTH
	}, function(e) {
		if (e.success) {
			var file = e.files[0];
			post.voiceurl = file.url;
			callback();
		} else {
			Util.handleError(e);
			failCallback();
		}
	});
};

exports.invite = function(user, callback, failCallback) {
	var sender = Zookee.User.CurrentUser;
	var email = '';
	if (user.email) {
		if (user.email.home) {
			email = user.email.home[0]
		} else if (user.email.work) {
			email = user.email.work[0]
		} else if (user.email.other) {
			email = user.email.other[0]
		} else {
			return;
		}
	} else {
		return;
	}
	Cloud.Emails.send({
		template : 'Invitation',
		recipients : email,
		username : user.username,
		//from : sender.email
	}, function(e) {
		if (e.success) {
			callback();
			//recordInvite(sender, email, callback, failCallback);
		} else {
			Util.handleError(e);
			failCallback();
		}
	});
};

exports.createPhoto = function(photo, post, callback, failCallback) {
	var obj = {};
	obj.photo = photo;
	var ratio = photo.width / photo.height;
	var partyHeight = Zookee.ImageSize.PARTY_CACHE_WIDTH / ratio;
	var thumbHeight = Zookee.ImageSize.THUMB_CACHE_WIDTH / ratio;
	var originHeight = Zookee.ImageSize.ORIGIN_CACHE_WIDTH / ratio;
	var partySizeStr = '' + Zookee.ImageSize.PARTY_CACHE_WIDTH + 'x' + partyHeight + '#';
	var thumbSizeStr = '' + Zookee.ImageSize.THUMB_CACHE_WIDTH + 'x' + thumbHeight + '#';
	var originSizeStr = '' + Zookee.ImageSize.ORIGIN_CACHE_WIDTH + 'x' + originHeight + '#';
	obj[Zookee.ImageSize.PARTY] = partySizeStr;
	obj[Zookee.ImageSize.THUMB] = thumbSizeStr;
	obj[Zookee.ImageSize.ORIGIN] = originSizeStr;
	obj.tags = post.id;
	Cloud.Photos.create(obj, function(e) {
		if (e.success) {
			var fileNames = e.photos[0].filename.split('.');
			//Util.cacheImage(e.photos[0].id + '_' + fileNames[0] + '_party.' + fileNames[1], photo);
			//Util.cacheImage(e.photos[0].id + '_' + fileNames[0] + '_thumb.' + fileNames[1], photo);
			Util.cacheImage(e.photos[0].id + '_' + fileNames[0] + '_original.' + fileNames[1], photo);
			initializePhoto(e.photos[0]);
			post.photos.push(e.photos[0]);
			post.hasPhoto = true;
			obj = null;
			callback(e.photos[0]);
		} else {
			obj = null;
			Util.handleError(e);
			failCallback();
		}
	});
};

var photoPage = 1;
exports.increasePhotoPage = function() {
	photoPage = photoPage + 1;
}

exports.resetPhotoPage = function() {
	photoPage = 1;
}

exports.queryPhotosByUser = function(users, callback, failCallback) {
	var ids = [];
	for (var i = 0; i < users.length; i++) {
		ids.push(users[i].id)
	}
	Cloud.Photos.query({
		page : photoPage,
		per_page : 50,
		order : '-created_at',
		response_json_depth : Zookee.AJAX.RESPONSE_DEPTH,
		where : {
			user_id : {
				'$in' : ids
			}
		}
	}, function(e) {
		if (e.success) {
			var collections = {};
			for (var i = 0; i < e.photos.length; i++) {
				initializePhoto(e.photos[i]);
				if (e.photos[i].tags) {
					var id = e.photos[i].tags;
					if (!collections[id]) {
						collections[id] = [e.photos[i]]
					} else {
						collections[id].push(e.photos[i]);
					}
				} else {
					continue;
				}
			}
			callback(collections);
		} else {
			Util.handleError(e);
			failCallback();
		}
	})
};

var ImageDelegate = require('backend/ImageDelegate');
var imageDelegate = new ImageDelegate();
exports.getPlaces = function(location, callback, failCallback) {
	var url = 'https://api.foursquare.com/v2/venues/search?ll=' + location.latitude + ',' + location.longitude + '&limit=' + Zookee.Location.MAX_NUMBER + '&oauth_token=K4EOKPTNT2BIQIQYDUQW4CVSYZFZ0OYVOBOMWKY2R3BZD0UN&v=20120829';
	var xhr = Ti.Network.createHTTPClient();

	xhr.onerror = function(e) {
		failCallback();
		alert('Error!', e.error);
	};
	xhr.onload = function() {
		obj = JSON.parse(this.responseText);
		callback(obj.response.venues);

	};

	// end of on load
	if (Ti.Network.online) {
		xhr.open('GET', url);
		xhr.send();
	} else {
		alert('you are not online');
	}
};

var queryPhotoes = function(parties, callback, failCallback) {
	var _parties = [];
	for (var i = 0; i < parties.length; i++) {
		_parties.push(parties[i].id);
	}
	Cloud.Photos.query({
		page : 1,
		per_page : 50,
		where : {
			"tags_array" : {
				'$in' : _parties
			}
		}
	}, function(e) {
		if (e.success) {
			for (var i = 0; i < e.photos.length; i++) {
				initializePhoto(e.photos[i]);
				for (var j = 0; j < parties.length; j++) {
					if (e.photos[i].tags == parties[j].id) {
						parties[j].photos.push(e.photos[i]);
						parties[j].hasPhoto = true;
						break;
					}
				}
			}
			callback();
			//callback.call(party,e.photos);  also ok
		} else {
			Util.handleError(e);
			failCallback();
		}
	})
}
var initializeUser = function(user) {
	if (user.photo) {
		if (!user.photo.urls) {
			user.photo.urls = {};
			user.photo.urls.avatar = Zookee.ImageURL.AvatarCache;
		}
		var fileNames = user.photo.filename.split('.');
		user.photo.avatarImage = user.photo.id + '_' + fileNames[0] + '_avatar.' + fileNames[1];
	} else if (!user.photo) {
		user.photo = {};
		user.photo.urls = {};
		user.photo.urls.avatar = 's';
		user.photo.avatarImage = 's';
	}

	if (!user.custom_fields)
		user.custom_fields = {};
	if (user.custom_fields.phone) {
		user.phone = user.custom_fields.phone;
	}
	if(user.custom_fields.priority && user.custom_fields.priority_startTime){
		user.priority=user.custom_fields.priority;
		user.priorityStartTime = user.custom_fields.priority_startTime;
	}else{
		user.priority = [];
		user.priorityStartTime = [];
	}
	if (user.first_name) {
		user.username = user.first_name;
	}
}
var initializePhoto = function(photo) {
	if (!photo.custom_fields) {
		photo.cutom_fields = {};
	}
	if (!photo.urls) {
		photo.urls = {};
	}

	var fileNames = photo.filename.split('.');
	photo.partyImage = photo.id + '_' + fileNames[0] + '_party.' + fileNames[1];
	photo.thumbImage = photo.id + '_' + fileNames[0] + '_thumb.' + fileNames[1];
	photo.avatarImage = photo.id + '_' + fileNames[0] + '_avatar.' + fileNames[1];
	photo.originImage = photo.id + '_' + fileNames[0] + '_original.' + fileNames[1];
	initializeUser(photo.user);
}
var initializePost = function(post) {
	if (post.custom_fields) {
		post.longitude = post.custom_fields.location ? post.custom_fields.location[0] : null;
		post.latitude = post.custom_fields.location ? post.custom_fields.location[1] : null;
	}
}

exports.subscribe = function(channel) {
	var deviceToken;

	if (Ti.Platform.osname === 'android') {
		CloudPush.debug = true;
		CloudPush.enabled = true;
		CloudPush.showTrayNotification = true;
		CloudPush.showTrayNotificationsWhenFocused = true;
		CloudPush.focusAppOnPush = false;
		CloudPush.retrieveDeviceToken({
			success : function deviceTokenSuccess(e) {
				//alert('Device Token: ' + e.deviceToken);
				deviceToken = e.deviceToken;
				Ti.App.Properties.setString('deviceToken', e.deviceToken);
				Cloud.PushNotifications.subscribe({
					channel : Zookee.Notification.Friend_Channel,
					device_token : deviceToken,
					type : 'android'
				}, function(e) {
					if (e.success) {
						//alert('subscribe Success');
					} else {
						Util.handleError(e);
					}
				});
			},
			error : function deviceTokenError(e) {
				alert('Failed to register for push! ' + e.error);
			}
		});
	} else {
		Titanium.Network.registerForPushNotifications({
			types : [Titanium.Network.NOTIFICATION_TYPE_BADGE, Titanium.Network.NOTIFICATION_TYPE_ALERT, Titanium.Network.NOTIFICATION_TYPE_SOUND],
			success : function(e) {
				deviceToken = e.deviceToken;
				Ti.App.Properties.setString("deviceToken", deviceToken);
				//alert("Device token received " + deviceToken);
				Cloud.PushNotifications.subscribe({
					channel : Zookee.Notification.Friend_Channel,
					type : 'ios',
					device_token : deviceToken
				}, function(e) {
					if (e.success) {
						//alert('Success' + ((e.error && e.message) || JSON.stringify(e)));
					} else {
						alert('Error:\\n' + ((e.error && e.message) || JSON.stringify(e)));
					}
				});
			},
			error : function(e) {
				alert("Error during registration: " + e.error);
			},
			callback : function(e) {
				// called when a push notification is received.
				//alert("Received a push notification\n\nPayload:\n\n" + JSON.stringify(e.data));
				var user = Zookee.User.CurrentUser;
				//var obj = JSON.parse(e);
				if (e.data.friend) {
					var friend = e.data.friend.user;
					var dialog = Ti.UI.createAlertDialog({
						cancel : 1,
						buttonNames : ['approve', 'cancel'],
						message : L('request_be_friend','request to be your friend'),
						title : friend.username
					});
					dialog.addEventListener('click', function(e) {
						if (e.index == 1) {
							user.requests.push({
								'user' : friend
							});
							Zookee.User.setUser(user);
							Ti.App.fireEvent('new_request');
						} else {
							exports.approveRequest(friend, function() {
								if (Zookee.Notification.Enabled) {
									exports.notify(Zookee.Notification.Friend_Channel, [friend], Zookee.Notification.MessageType.APPROVE)
								}
							}, function() {
								user.requests.push({
									'user' : friend
								});
								Zookee.User.setUser(user);
								Ti.App.fireEvent('new_request');
								alert('approve fail! Approve it in Friend List')
							})
						}
					});
					dialog.show();
				} else if (e.data.party) {
					Util.showStatus(Zookee.currentWindow, e.data.party.user.username + ' ' + L('create_party','create one party'));
				} else if (e.data.approve) {
					Util.showStatus(Zookee.currentWindow, e.data.approve.user.username + ' ' + L('request_approve',' has approved your request '));
					user.friends.push(e.data.approve.user);
					Zookee.User.setUser(user);
				}
			}
		});

	}
};

exports.notify = function(channel, users, message) {
	var user = Zookee.User.CurrentUser;
	var to_ids = [];
	for (var i = 0; i < users.length; i++) {
		if (users[i].id == user.id)
			continue;
		to_ids.push(users[i].id);
	}
	var userLoad = {
		'user' : {
			id : user.id,
			username : user.username,
			photo : {
				urls : {
					avatar : ''
				},
				avatarImage : user.photo.avatarImage
			}
		}
	};
	var payload = {
		'sound' : 'default',
		'alert' : user.username + ' ' + L(message)
	};
	if (channel == Zookee.Notification.Party_Channel) {
		payload.party = userLoad;
	} else if (message == Zookee.Notification.MessageType.APPROVE) {
		payload.approve = userLoad;
	} else {
		payload.friend = userLoad;
		payload.badge = 1;
		// only user request presented as the app badge.
	}
	if (to_ids.length > 0) {
		Cloud.PushNotifications.notify({
			channel : Zookee.Notification.Friend_Channel,
			to_ids : to_ids.join(','),
			payload : payload
		}, function(e) {
			if (e.success) {

			} else {
				Util.handleError(e);
			}
		});
	}
};

exports.unSubscribe = function(channel, callback, failCallback) {
	Cloud.PushNotifications.unsubscribe({
		channel : Zookee.Notification.Friend_Channel,
		device_token : Ti.App.Properties.getString('deviceToken')
	}, function(e) {
		if (e.success) {
			callback();
		} else {
			//Util.handleError(e);
			callback();
		}
	});
};

if (Ti.Platform.osname === 'android') {
	CloudPush.addEventListener('callback', function(evt) {
		var user = Zookee.User.CurrentUser;
		var obj = JSON.parse(evt.payload);
		if (obj.friend) {
			var friend = obj.friend.user;
			if (friend) {
				// this is used when the user already login, then get the notification
				if (!Util.isFriend(user, friend)) {
					exports.searchFriend(user, function() {
					}, function() {
					})
				}
			}
			var dialog = Ti.UI.createAlertDialog({
				buttonNames : ['approve', 'cancel'],
				message : L('request_be_friend'),
				title : friend.username
			});
			dialog.addEventListener('click', function(e) {
				if (e.index == 1) {
					user.requests.push({
						'user' : friend
					});
					Zookee.User.setUser(user);
					Ti.App.fireEvent('new_request');
				} else {
					exports.approveRequest(friend, function() {
						if (Zookee.Notification.Enabled) {
							exports.notify(Zookee.Notification.Friend_Channel, [friend], Zookee.Notification.MessageType.APPROVE)
						}
					}, function() {
						Ti.App.fireEvent('new_request');
						user.requests.push({
							'user' : friend
						});
						Zookee.User.setUser(user);
						alert('approve fail! Approve it in Friend List')
					})
				}
			});
			dialog.show();
		} else if (obj.party) {
			Util.showStatus(Zookee.currentWindow, obj.party.user.username + ' ' + L('create_party','create one party'));
		} else if (obj.approve) {
			Util.showStatus(Zookee.currentWindow, obj.approve.user.username + ' ' + L('request_approve',' has approved your request '));
			user.friends.push(obj.approve.user);
			Zookee.User.setUser(user);
		}
	});

	CloudPush.addEventListener('trayClickLaunchedApp', function(evt) {

	});
	CloudPush.addEventListener('trayClickFocusedApp', function(evt) {
		//alert('Tray Click Focused App (app was already running)');
		//TODO: to add the friend
		Ti.API.info(evt.source);
	});
}