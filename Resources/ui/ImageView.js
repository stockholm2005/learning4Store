/**
 * @author kent hao
 */
var ImageDelegate = require('backend/ImageDelegate');
var imageDelegate = new ImageDelegate();

function ImageView(param) {
	var view = param.backgroundImage ? Ti.UI.createView() : Ti.UI.createImageView();
	view.param = param;
	for (var key in param) {
		if (key != 'url' && key != 'image' && key != 'backgroundImage') {
			if (key == 'defaultImage') {
				param.backgroundImage ? view.backgroundImage = param.defaultImage : view.image = param.defaultImage;
			} else {
				view[key] = param[key];
			}
		}
	}

	view.setCroppedImage = function(blob) {
		var width = Ti.Platform.displayCaps.platformWidth;
		var height = width / Zookee.UI.IMAGE.PARTY_IMAGE_RATIO;
		
		if (view.toString().indexOf('ImageView') != -1) {
			if(blob.getMimeType().indexOf('image')<0){
				view.image = Zookee.ImageURL.Empty_Photo;
				return;
			}
			if (view.param.image.indexOf('party') > 0 && blob.width>width && blob.height>height) {
				view.image = blob.imageAsCropped({
					x : (blob.width - width) / 2,
					y : (blob.height - height) / 2,
					width : width,
					height : height
				});
			} else if (view.param.image.indexOf('origin') > 0 && blob.width>width && blob.height>height) {
				height = width / Zookee.UI.IMAGE.ORIGIN_IMAGE_RATIO;
				view.image = blob.imageAsCropped({
					x : (blob.width - width) / 2,
					y : (blob.height - height) / 2,
					width : width,
					height : height
				});
			} else
				view.image = blob;
			//that.animateImage(this.observers[i]);
			view.opacity = 1;
			view.isLoaded = true;
			view.loadStatus = 'loaded';
		} else {
			if(view.param.backgroundImage!='s')
				view.backgroundImage = Zookee.CachePath + view.param.backgroundImage;
			else
				view.backgroundImage = Zookee.ImageURL.Empty_Photo;
			//that.animateImage(this.observers[i]);
			view.opacity = 1;
			view.isLoaded = true;
			view.loadStatus = 'loaded';
			view.hideIndicator();
		}
	}
	view.startLoading = function() {
		imageDelegate.getImage(param.url, view, {
			fileName : param.backgroundImage ? param.backgroundImage : param.image
		});
		view.loadStatus = 'loading';
	}

	view.reloading = function(_param) {
		imageDelegate.getImage(_param.url, view, {
			fileName : _param.backgroundImage ? _param.backgroundImage : _param.image
		});
		view.param = _param;
		view.loadStatus = 'loading';
	}

	view.showIndicator = function() {
		if (view.toString().indexOf('ImageView') == -1) {
			var _ind = Ti.UI.createActivityIndicator({
				center : {
					x : '50%',
					y : '50%'
				}
			});
			view.actInd = _ind;
			view.add(_ind);
			_ind.show();
		}
	}

	view.hideIndicator = function() {
		if (view.actInd) {
			view.actInd.hide();
			view.remove(view.actInd);
			view.actInd = null;
		}
	}
	if (param.loadStatus == 'starting') {
		view.startLoading();
	}

	return view;
}

module.exports = ImageView;
