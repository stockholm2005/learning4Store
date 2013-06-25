/**
 * @author kent hao
 */

exports.postTimeForTitle = function(dateString) {
	var nums = dateString.split(/-|T|:/);
	return nums[0] + '/' + nums[1] + '/' + nums[2];
}

exports.isPriorityValid = function(priority,startTime){
	var nums=startTime.split(/-|T|:/);
	var startYear = parseFloat(nums[0]);
	var startMonth = parseFloat(nums[1]);
	var startDate = parseFloat(nums[2]);
	var currentTime = new Date();
	var year = currentTime.getUTCFullYear();	
	var month = currentTime.getUTCMonth() + 1;
	var date = currentTime.getUTCDate();
	if(priority.indexOf('Year')>0){
		if(startYear === year) return true;
		else if((year-startYear)===1){
			if(month<startMonth) return true;
			if(month===startMonth){
				if(date<startDate) return true;
			}
		}
	}else if(priority.indexOf('Month')>0){
		if(startYear === year){
			if(startMonth === month) return true;
			if(startMonth<month){
				if(date<startDate) return true;
			}
		}
		else if((year-startYear)===1){
			//cross year
			if(startMonth ===12 && month ===1){
				if(date<startDate) return true;
			}
		}
	}else if(priority.indexOf('Quarter')>0){
		if(startYear === year){
			if((month-startMonth)<=2) return true;
			else if((month-startMonth)===3){
				if(date<startDate) return true
			}
		}
	}
	return false;
};
exports.postTime = function(dateString) {
	var nums = dateString.split(/-|T|:/);
	var currentTime = new Date();
	var year = currentTime.getUTCFullYear();
	var yearOfPost = parseFloat(nums[0]);
	var month = currentTime.getUTCMonth() + 1;
	var monthOfPost = parseFloat(nums[1]);
	var hour = currentTime.getUTCHours();
	var hourOfPost = parseFloat(nums[3]);
	var date = currentTime.getUTCDate();
	var dateOfPost = parseFloat(nums[2]);
	var minutes = currentTime.getMinutes() + 1;
	var minutesOfPost = parseFloat(nums[4]);
	if (year > yearOfPost) {
		var yearGap = year - yearOfPost;
		if (yearGap > 1) {
			return ' ' + yearGap + ' ' + L('years_ago');
		}
		if (month >= monthOfPost) {
			return ' ' + 1 + ' ' + L('year_ago');
		} else {
			if (12 - monthOfPost + month == 1) {
				return ' ' + 1 + ' ' + L('month_ago');
			}
			return ' ' + 12 - monthOfPost + month + ' ' + L('months_ago');
		}

	} else if (month > monthOfPost) {
		if (month - monthOfPost > 1) {
			return ' ' + (month - monthOfPost) + ' ' + L('months_ago');
		}
		if (date >= dateOfPost) {
			return ' ' + 1 + ' ' + L('month_ago');
		} else {
			var dateGap;
			if (monthOfPost % 2 == 0 && monthOfPost != 8)
				dateGap = date + 30 - dateOfPost;
			else
				dateGap = date + 31 - dateOfPost;

			if (dateGap == 1)
				return ' ' + 1 + ' ' + L('day_ago');
			return ' ' + dateGap + ' ' + L('days_ago');
		}
	} else if (date > dateOfPost) {
		if (date - dateOfPost > 1) {
			return ' ' + (date - dateOfPost) + ' ' + L('days_ago');
		}
		if (hour >= hourOfPost) {
			return ' ' + 1 + ' ' + L('day_ago');
		} else {
			var hourGap = 24 - hourOfPost + hour;
			if (hourGap == 1)
				return ' ' + hourGap + ' ' + L('hour_ago');
			return ' ' + hourGap + ' ' + L('hours_ago');
		}
	} else if (hour > hourOfPost) {
		if (hour - hourOfPost > 1) {
			return ' ' + (hour - hourOfPost) + ' ' + L('hours_ago');
		}
		if (minutes >= minutesOfPost) {
			return ' ' + 1 + ' ' + L('hour_ago');
		} else {
			var minutesGap = 60 - minutesOfPost + minutes;
			if (minutesGap == 1)
				return ' ' + minutesGap + ' ' + L('minute_ago');
			return ' ' + minutesGap + ' ' + L('minutes_ago');
		}
	} else {
		if (minutes - minutesOfPost <= 15)
			return '   ' + L('right_now') + ' ';
		return ' ' + minutes - minutesOfPost + ' ' + L('minutes_ago');
	}
};

exports.emptySpace = function(color, height) {
	if (color == '' || !color) {
		var emptySpace = Ti.UI.createView({
			height : height,
			left : 0,
			width : Ti.UI.FILL
		});
		return emptySpace;
	} else {
		var emptySpace = Ti.UI.createView({
			backgroundColor : color,
			height : height,
			left : 0,
			width : Ti.UI.FILL
		});
		return emptySpace;
	}

};

var actInd;
exports.actIndicator = function(text, parent, background, style) {
	var _actInd = Titanium.UI.createActivityIndicator({
		center : {
			x : '50%',
			y : '50%'
		},
		cancelable : true,
		color : Zookee.UI.COLOR.PARTY_CONTENT,
		font : Zookee.FONT.NORMAL_FONT
	});

	_actInd.message = text;
	if (parent) {
		if (background) {
			_actInd.color = 'white';
			var width = '40%';
			var borderRadius = Zookee[4];
			if (text === '') {
				width = Zookee[40];
				if(!Zookee.isAndroid)
					borderRadius = Zookee[20];
			}
			var mask = Ti.UI.createView({
				center : {
					x : '50%',
					y : '50%'
				},
				width : width,
				height : Zookee[40],
				opacity : 0.65,
				backgroundColor : 'black',
				borderRadius : borderRadius
			})
			mask.add(_actInd);
			parent.add(mask);
			_actInd.show();
			return mask;
		} else {
			parent.add(_actInd);
		}
		if (style) {
			_actInd.style = style;
		}
	}
	return _actInd;
};

exports.getDistance = function(location1, location2) {
	var lon1 = location1.longitude;
	var lat1 = location1.latitude;
	var lon2 = location2.longitude;
	var lat2 = location2.latitude;
	// meters, if for km, use 6371
	var R = 6371000;
	// m (change this constant to get miles)
	var dLat = (lat2 - lat1) * Math.PI / 180;
	var dLon = (lon2 - lon1) * Math.PI / 180;
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	//alert(d);
	return d;

};

var Zookee = require('Zookee');

exports.showStatus = function(win, message) {
	if (!win)
		return;
	var maskView = Ti.UI.createView({
		center : {
			x : '50%',
			y : '50%'
		},
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		backgroundColor : 'black',
		borderRadius : 2
	});
	var infoLabel = Ti.UI.createLabel({
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		top : 10,
		bottom : 10,
		textAlign : 'center',
		color : 'white',
		text : '  '+message+'  ',
		font : Zookee.FONT.SMALL_FONT
	});
	maskView.add(infoLabel);
	win.add(maskView);
	var t = setTimeout(function() {
		var a = Ti.UI.createAnimation({
			opacity : 0,
			duration : 2000
		});
		win.backClicked = 0;

		maskView.animate(a, function() {
			infoLabel = null;
			maskView = null;
			clearInterval(t);
		});

	}, 1500);

}

exports.showExitInfo = function(win) {
	if (win.backClicked == 0) {
		win.backClicked = 1;
		var maskView = Ti.UI.createView({
			center : {
				x : '50%',
				y : '90%'
			},
			width : Ti.UI.SIZE,
			height : Ti.UI.SIZE,
			backgroundColor : 'black',
			borderRadius : 2
		});
		var infoLabel = Ti.UI.createLabel({
			left : 10,
			right : 10,
			top : 10,
			bottom : 10,
			textAlign : 'center',
			color : 'white',
			text : L('android_backbutton_click'),
			font : Zookee.FONT.NORMAL_FONT
		});
		maskView.add(infoLabel);
		win.add(maskView);
		var t = setTimeout(function() {
			var a = Ti.UI.createAnimation({
				opacity : 0,
				duration : 2000
			});
			win.backClicked = 0;

			maskView.animate(a, function() {
				infoLabel = null;
				maskView = null;
				clearInterval(t);
			});

		}, 1500);
	} else {
		win.close();
		win = null;
	}
}

exports.handleOffLine = function(view) {
	if (!Ti.Network.online) {
		if (view.offLine)
			return true;
		var offLine = Ti.UI.createLabel({
			center : {
				x : '50%',
				y : '50%'
			},
			textid : 'offline'
		})
		view.offLine = offLine;
		view.add(offLine);
		return true;
	}
	if (view.offLine) {
		var offLine = view.offLine;
		view.remove(offLine);
		delete view.offLine;
	}
	return false;
}

exports.attenderStatus = function(someone) {
	var user = Zookee.User.CurrentUser;
	if (exports.isFriend(user, someone)) {
		return Zookee.FRIEND_STATUS.FRIEND;
	} else if (exports.isRequest(user, someone)) {
		return Zookee.FRIEND_STATUS.I_REQUEST;
	} else if (exports.doRequest(user, someone)) {
		return Zookee.FRIEND_STATUS.THEY_REQUEST;
	} else {
		return Zookee.FRIEND_STATUS.NONE;
	}
}
exports.isFriend = function(user, friend) {
	for (var i = 0; i < user.friends.length; i++) {
		if (friend.id == user.friends[i].id)
			return true;
	}
	return false;
}

exports.doRequest = function(user, friend) {
	for (var i = 0; i < user.requests.length; i++) {
		if (friend.id == user.requests[i].id)
			return true;
	}
	return false;
}

exports.isRequest = function(user, friend) {
	for (var i = 0; i < user.myRequests.length; i++) {
		if (friend.id == user.myRequests[i].id)
			return true;
	}
	return false;
}

exports.copyObj = function(source) {
	//var result = Object.create(source);
	var result = JSON.parse(JSON.stringify(source));
	return result;
}

exports.deleteFriend = function(user, friend) {
	var result = [];
	for (var i = 0; i < user.friends.length; i++) {
		if (friend.id == user.friends[i].id)
			continue;
		result.push(user.friends[i]);
	}

	user.friends = [].concat(result);
	result = null;
	var Zookee = require('Zookee');
	Zookee.User.setUser(user);
	user = Zookee.User.CurrentUser;
}

exports.deleteRequest = function(user, friend) {
	var result = [];
	for (var i = 0; i < user.requests.length; i++) {
		if (friend.id == user.requests[i].user.id)
			continue;
		result.push(user.requests[i]);
	}

	user.requests = [].concat(result);
	result = null;
	var Zookee = require('Zookee');
	Zookee.User.setUser(user);
}

exports.indexOfArray = function(user, friend) {
	for (var i = 0; i < user.friends.length; i++) {
		if (friend.id == user.friends[i].id) {
			return i;
		}
	}
}
var _getExtension = function(url) {
	var re = /(?:\.([^.]+))?$/;
	var tmpext = re.exec(url)[1];
	return (tmpext) ? tmpext : '';
};

exports.cacheImage = function(fileName, data) {
	var ratio = data.width / data.height;
	var partyHeight = Zookee.ImageSize.PARTY_CACHE_WIDTH / ratio;
	var thumbHeight = Zookee.ImageSize.THUMB_CACHE_WIDTH / ratio;
	var originHeight = Zookee.ImageSize.ORIGIN_CACHE_WIDTH / ratio;
	var avatarHeight = Zookee.ImageSize.AVATAR_CACHE_WIDTH / ratio;
	var file = Ti.Filesystem.getFile(Zookee.CachePath + fileName);

	if (fileName.indexOf('party') > 0) {
		file.write(data.imageAsResized(Zookee.ImageSize.PARTY_CACHE_WIDTH, partyHeight));
		var thumbFile = Ti.Filesystem.getFile(Zookee.CachePath + fileName.replace('party', 'thumb'));
		if (!thumbFile.exists())
			thumbFile.write(data.imageAsResized(Zookee.ImageSize.THUMB_CACHE_WIDTH, thumbHeight));
	} else if (fileName.indexOf('avatar') > 0) {
		file.write(data.imageAsResized(Zookee.ImageSize.AVATAR_CACHE_WIDTH, avatarHeight));
	} else if (fileName.indexOf('thumb') > 0) {
		file.write(data.imageAsResized(Zookee.ImageSize.THUMB_CACHE_WIDTH, thumbHeight));
	} else if (fileName.indexOf('original') > 0) {
		file.write(data.imageAsResized(Zookee.ImageSize.ORIGIN_CACHE_WIDTH, originHeight));
		var partyFile = Ti.Filesystem.getFile(Zookee.CachePath + fileName.replace('original', 'party'));
		if (!partyFile.exists())
			partyFile.write(data.imageAsResized(Zookee.ImageSize.PARTY_CACHE_WIDTH, partyHeight));
		var thumbFile = Ti.Filesystem.getFile(Zookee.CachePath + fileName.replace('original', 'thumb'));
		if (!thumbFile.exists())
			thumbFile.write(data.imageAsResized(Zookee.ImageSize.THUMB_CACHE_WIDTH, thumbHeight));
	} else {
		file.write(data);
	}
	//TODO: when update to 3.0, use this
	//file.write(data.toBlob().imageAsResized(80,80));
}

exports.handleError = function(e) {
	if (!Zookee.isLogin)
		return;
	var errorString = JSON.stringify(e);

	if (errorString.indexOf('401') > 0) {
		// be careful, you can not use number as a i18n key.
		alert(L('loginerror'));
		return;
	} else if (errorString.indexOf('timeout') > 0) {
		alert(L('timeout'));
		return;
	} else if (errorString.indexOf('timed out') > 0) {
		alert(L('timeout'));
		return;
	} else if (errorString.indexOf('refused') > 0) {
		alert(L('timeout'));
		return;
	} else if (errorString.indexOf('already taken') > 0) {
		if (errorString.indexOf('Username') > 0)
			alert(L('username_taken'));
		else
			alert(L('email_taken'));
		return;
	} else if (errorString.indexOf('api.cloud.appcelerator.com') > 0) {
		alert(L('api_call_error'));
		return;
	}
	alert(JSON.stringify(e));
}

exports.isPartyHappening = function(party) {
	var nums = party.created_at.split(/-|T|:/);
	var currentTime = new Date();
	var year = currentTime.getUTCFullYear();
	var yearOfPost = parseFloat(nums[0]);
	var month = currentTime.getUTCMonth() + 1;
	var monthOfPost = parseFloat(nums[1]);
	var hour = currentTime.getUTCHours();
	var hourOfPost = parseFloat(nums[3]);
	var date = currentTime.getUTCDate();
	var dateOfPost = parseFloat(nums[2]);
	var minutes = currentTime.getMinutes() + 1;
	var minutesOfPost = parseFloat(nums[4]);
	return month == monthOfPost && year == yearOfPost && date == dateOfPost && hour - hourOfPost < Zookee.PartyFilter.DURATION;
}

exports.line4TextField = function(param) {
	if (Zookee.isAndroid) {
		var singleLineArea = Ti.UI.createView({
			left : param.left,
			width : param.width,
			height : param.height,
			backgroundColor : param.backgroundColor
		})
		var singleLine = Ti.UI.createView({
			left : 0,
			right : 0,
			top : -1,
			height : Ti.UI.FILL,
			borderWidth : 1,
			borderColor : param.borderColor
		})
		singleLineArea.add(singleLine);
		return singleLineArea;
	} else {
		return Ti.UI.createView();
	}
}

exports.removeChildren = function(object) {
	if (!object)
		return;
	if (!object.children) {
		object = null;
	}
	for (i in object.children) {
		var child = object.children[0];
		if(!child) continue;
		exports.removeChildren(child);
		object.remove(child);
		if (child.toString().indexOf('ImageView') != -1) {
			child.image = '';
		}
		child = null;
	}
}