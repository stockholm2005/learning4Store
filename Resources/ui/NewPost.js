/**
 * @author Angela Deng
 */
var Zookee = require('Zookee');
var Util = require('Util');
var Geo = require('GeoLocation');
var ImageDelegate = require('backend/ImageDelegate');
var imageDelegate = new ImageDelegate();
var delegate = require('backend/Delegate');
var ImageView = require('ui/ImageView');
var TitleView = require('ui/TitleView');

function NewPostWin(_mainView) {
	var say_sth_changed = false;
	var user = Zookee.User.CurrentUser
	var post = {};
	var win = Ti.UI.createWindow({
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
		title_fd = null;
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
		if(!title_fd.value || title_fd.value.trim()===''){
			alert(String.format(L('mandatory_field'),L('ad_title','Ad\'title')));
			return
		}else if(!description_fd.value || description_fd.value.trim()===''){
			alert(String.format(L('mandatory_field'),L('ad_desc','Ad\'description')));
			return			
		}
		post.title = title_fd.value;
		post.content=description_fd.value;
		if(post.photo){
			var fileName = Ti.Utils.md5HexDigest(post.photo);
			var file = Ti.Filesystem.getFile(Zookee.CachePath+fileName+'.png');
			file.write(post.photo);
			post.photo = Zookee.CachePath+fileName+'.png';
		}
		var pre_ads = Ti.App.Properties.getList('pre_ads')||[];
		Ti.App.Properties.setList('pre_ads',[post].concat(pre_ads));
		//TODO: upload ads to cloud.
		_mainView.insertAd(post);
		win.close();

	})
	titleView.addView(sendButton);

	var textArea = Ti.UI.createView({
		top : Zookee[10],
		left : '5%',
		right : '5%',
		height : Ti.UI.SIZE
	})
	
	var title_fd = Ti.UI.createTextField({
		top:Zookee[40],
		width : Ti.UI.FILL,
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
	
	var description_fd = Ti.UI.createTextArea({
		top : Zookee[120],
		width : Ti.UI.FILL,
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
	textArea.add(Ti.UI.createLabel({
		top:0,
		left:0,
		color:'white',
		font:Zookee.FONT.NORMAL_FONT,
		text:L('title','title:')
	}));
	textArea.add(Ti.UI.createLabel({
		top:Zookee[80],
		left:0,
		font:Zookee.FONT.NORMAL_FONT,
		text:L('description','description:')
	}))
	textArea.add(title_fd);
	textArea.add(description_fd);
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
	iconArea.add(galleryView);
	iconArea.add(cameraView);
	view.add(iconArea);

	cameraView.addEventListener('click', function(e) {
		Ti.Media.showCamera({
			saveToPhotoGallery : false,
			success : function(event) {
				title_fd.focus();
				post.photo = event.media;
				if (Zookee.isAndroid) {
					var ratio = event.media.width / event.media.height;
					var measureHeight = Ti.Platform.displayCaps.platformWidth / ratio;

					view.backgroundImage = event.media.nativePath;
				} else
					view.backgroundImage = event.media.imageAsResized(view.rect.width, view.rect.height);
			},
			cancel : function() {
				title_fd.focus();
			},
			error : function(error) {
				title_fd.focus();
				alert(error.message);
			},
			allowEditing : false,
			mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
		});
	})

	galleryView.addEventListener('click', function() {
		Ti.Media.openPhotoGallery({
			success : function(event) {
				title_fd.focus();
				post.photo = event.media;
				if (Zookee.isAndroid) {
					var ratio = event.media.width / event.media.height;
					var measureHeight = Ti.Platform.displayCaps.platformWidth / ratio;

					view.backgroundImage = event.media.nativePath;
				} else
					view.backgroundImage = event.media.imageAsResized(view.rect.width, view.rect.height);
			},
			cancel : function() {
				title_fd.focus();
			},
			error : function(error) {
				title_fd.focus();
			},
			allowImageEditing : false
		});
	});

	win.addEventListener('open', function() {
		title_fd.focus();
	})
	return win;
}

module.exports = NewPostWin;
