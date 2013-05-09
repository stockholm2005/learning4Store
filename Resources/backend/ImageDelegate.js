/**
 * @author kent hao
 */
var Zookee = require('Zookee');
var Util = require('Util');
var queue = [];

var pool = {
	initialized : false,
	clients : [],
	init : function() {
		if (this.clients.length == 0) {
			for (var i = 0; i < Zookee.MaxHttpRequests; i++) {
				var xhr = Ti.Network.createHTTPClient();
				xhr.setTimeout(Zookee.AJAX.TIME_OUT);
				xhr.tag = 'client#' + i;
				xhr.index = i;
				xhr.isBusy = false;
				this.clients.push(xhr);
			}
		}
		this.initialized = true;
	},

	getHttpClient : function() {
		for (var i = 0; i < Zookee.MaxHttpRequests; i++) {
			var xhr = this.clients[i];
			// if (!(xhr.readyState == xhr.OPENED || xhr.readyState == xhr.HEADERS_RECEIVED || xhr.readyState == xhr.LOADING)) {
			// return xhr;
			// }
			if (!xhr.isBusy)
				return xhr;
		}
		return null;
	},

	allOccupied : function() {
		for (var i = 0; i < Zookee.MaxHttpRequests; i++) {
			var xhr = this.clients[i];
			// if (!(xhr.readyState == xhr.OPENED || xhr.readyState == xhr.HEADERS_RECEIVED || xhr.readyState == xhr.LOADING)) {
			// return false;
			// }
			if (!xhr.isBusy)
				return false;
		}
		return true;
	},

	returnClient : function(_xhr) {
		var index = _xhr.index;
		var xhr = Ti.Network.createHTTPClient();
		xhr.setTimeout(Zookee.AJAX.TIME_OUT);
		xhr.tag = 'client#' + index;
		xhr.index = index;
		xhr.isBusy = false;
		this.clients[index] = xhr;
		delete _xhr;
	},

	reset : function() {
		for (var i = 0; i < this.clients.length; i++) {
			this.clients[i] = null;
		}
		this.clients = [];
		this.initialized = false;
	}
};

var delegate = {
	processImage : function(request) {
		for (var i = 0; i < pool.clients.length; i++) {
			if (pool.clients[i].observers)
				if (request.id == pool.clients[i].id) {
					pool.clients[i].observers = pool.clients[i].observers.concat(request.observers);
					return;
				}
		}
		if (pool.allOccupied()) {
			for (var i = 0; i < queue.length; i++) {
				if (queue[i].id == request.id) {
					queue[i].observers = queue[i].observers.concat(request.observers);
					return;
				}
			}
			queue.push(request);
			return;
		}

		//delegate.processImage(request);

		var that = this;
		var _xhr = pool.getHttpClient();
		_xhr.id = request.id;
		_xhr.photoid = request.photoid;
		_xhr.observers = request.observers;
		_xhr.open("GET", _xhr.id);
		_xhr.onload = function() {
			Ti.API.info(_xhr.tag);
			if (this.readyState == _xhr.DONE && this.status == 200) {
				var _that = this;
				var startIndex = _xhr.id.lastIndexOf('/') + 1;
				var fileName = '';
				if (_xhr.id.indexOf('foursquare') > 0) {
					fileName = _xhr.id.split('/').pop();
				} else {
					fileName = _xhr.photoid + _xhr.id.substring(startIndex);
				}

				Util.cacheImage(fileName, this.responseData);
				var blob = this.responseData;
				for (var i = 0; i < this.observers.length; i++) {
					this.observers[i].setCroppedImage(blob);
				}

				pool.returnClient(_xhr);

				if (queue.length > 0) {
					var request = queue.shift();
					if (request == null)
						return;
					that.processImage(request);
				}
			}
		}
		_xhr.onerror = function(e) {
			for (var i = 0; i < this.observers.length; i++) {
				this.observers[i].loadStatus = 'waiting';
				this.observers[i].hideIndicator();
			}
			_xhr.abort();
			pool.returnClient(_xhr);
			if (queue.length > 0) {
				var request = queue.shift();
				that.processImage(request);
			}
		};
		_xhr.isBusy = true;
		_xhr.send();
	},

	animateImage : function(observer) {
		var a = Ti.UI.createAnimation({
			opacity : 1,
			duration : Zookee.AniDuration
		});
		a.addEventListener('complete', function() {
			observer.opacity = 1
		});
		observer.animate(a);
	}
};

function ImageDelegate() {

	this.getImage = function(id, observer, localParam) {
		if (!pool.initialized) {
			pool.init();
		}
		//photo loaded from local storage
		if (!localParam.fileName)
			return;
		var photoid = '';
		if (localParam.fileName.indexOf('_') > 0)
			photoid = localParam.fileName.split('_')[0] + '_';
		var localFileName = Zookee.CachePath + localParam.fileName;
		var localFile = Ti.Filesystem.getFile(localFileName);
		if (localFile.exists()) {
			var blob = localFile.read();
			observer.setCroppedImage(blob);
			return;
		}

		if (!id || id.indexOf('http') < 0)
			return;

		// var startIndex = id.lastIndexOf('/') + 1;
		// var fileName = 'appdata://' + id.substring(startIndex);
		// var file = Ti.Filesystem.getFile(fileName);
		// if (file.exists()) {
		// if (observer.toString().indexOf('ImageView') != -1) {
		// observer.image = fileName;
		// animateImage(observer, Zookee.AniDuration);
		// observer.isLoaded = true;
		// observer.loadStatus='loaded';
		// } else {
		// observer.backgroundImage = fileName;
		// animateImage(observer, Zookee.AniDuration);
		// observer.isLoaded = true;
		// observer.loadStatus='loaded';
		// }
		// return;
		// }

		// show observer's indicator
		observer.showIndicator();

		delegate.processImage({
			id : id,
			photoid : photoid,
			observers : [observer]
		});

	}
	var animateImage = function(observer, period) {
		var a = Ti.UI.createAnimation({
			opacity : 1,
			duration : period
		});
		a.addEventListener('complete', function() {
			observer.opacity = 1
		});
		observer.animate(a);
	}

	this.clearAll = function() {
		// clear the cached files
		var file = Ti.Filesystem.getFile(Zookee.CachePath);
		file.deleteDirectory(true);

		// cancel all the requests and reset
		pool.reset();
		for (var i = 0; i < queue.length; i++) {
			queue[i] = null;
		}
	}
};

module.exports = ImageDelegate;
