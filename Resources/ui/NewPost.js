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
		backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND
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
	var _height = '48%';
	if (Ti.Platform.displayCaps.platformHeight === 568) {
		_height = '52%';
	}
	var view = Ti.UI.createView({
		top:Zookee.UI.HEIGHT_TITLE,
		bottom:0,
		width : Ti.UI.FILL,
		//scrollType : 'vertical',
		//scrollingEnabled : false,
		//backgroundColor : Zookee.UI.COLOR.ROW_BACKGROUND,
		backgroundColor:'white'
		//height : _height
		//contentHeight : Ti.UI.FILL,
		//layout : 'vertical'
	})
	
	var imageView = Ti.UI.createImageView({
		width : Ti.UI.FILL,
		defaultImage : Zookee.ImageURL.Empty_Photo,
		height : Ti.UI.FILL
	})

	view.add(imageView);
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
		if (!post.content || post.content.trim() == L('say_something','say something')) {
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
		var pre_ads = Ti.App.Properties.getList('pre_ads')||[];

		if(post.photo){
			var fileName = 'myads_'+pre_ads.length+'.png';
			var file = Ti.Filesystem.getFile(Zookee.CachePath+fileName);
			file.write(post.photo);
			post.photo = Zookee.CachePath+fileName;
		}
		Ti.App.Properties.setList('pre_ads',[post].concat(pre_ads));
		Ti.App.fireEvent('update_pre_row');
		_mainView.insertAd(post);
		win.close();

	})
	titleView.addView(sendButton);
	var textArea = Ti.UI.createView({
		top:0,
		left : 0,
		right : 0,
		height : Ti.UI.FILL,
		layout:'vertical',
		opacity:0.8
	})

	var title_fd = Ti.UI.createTextField({
		hintText:L('ad_title','title:'),
		width : Ti.UI.FILL,
		height:Zookee[40],
		keyboardType : Ti.UI.KEYBOARD_DEFAULT,
		enableReturnKey:false,
		returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
		softKeyboardOnFocus : Zookee.Soft_Input.SOFT_KEYBOARD_SHOW_ON_FOCUS,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
		backgroundColor:'white',
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_NONE,
		opacity:0.85,
		maxLength:50
	});
	
	var description_fd = Ti.UI.createTextArea({
		height:'50%',
		width : Ti.UI.FILL,
		keyboardType : Ti.UI.KEYBOARD_DEFAULT,
		enableReturnKey:false,
		returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
		softKeyboardOnFocus : Zookee.Soft_Input.SOFT_KEYBOARD_SHOW_ON_FOCUS,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		opacity:0.85,
		font:Zookee.FONT.NORMAL_FONT,
		hintText:L('ad_desc','description:'),
		maxLength:200
	});	

	textArea.add(title_fd);
	textArea.add(Ti.UI.createView({
		width:Ti.UI.FILL,
		height:2,
		backgroundColor:Zookee.UI.COLOR.PARTY_CONTENT
	}))
	textArea.add(description_fd);
	view.add(textArea);
	
	var iconArea = Ti.UI.createView({
		layout : 'horizontal',
		bottom : Zookee[8],
		//right:Zookee[10],
		left : '35%',
		width : '65%',
		height : Ti.UI.SIZE,
		zIndex:1
	})
	var cameraView = Ti.UI.createView({
		left : Zookee[12],
		height : Zookee[50],
		width : Zookee[50],
		borderRadius : Zookee[25],
		backgroundColor:Zookee.UI.COLOR.COLOR2,
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
		backgroundColor:Zookee.UI.COLOR.COLOR2,
		borderRadius : Zookee[25],
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
	win.add(iconArea);

	cameraView.addEventListener('click', function(e) {
		Ti.Media.showCamera({
			saveToPhotoGallery : false,
			success : function(event) {
				title_fd.focus();
				post.photo = event.media;
				imageView.image = event.media.imageAsResized(view.rect.width, view.rect.height);
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
				imageView.image = event.media.imageAsResized(view.rect.width, view.rect.height);
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

	title_fd.addEventListener('focus',function(){
		if(iconArea.atBottom){
			iconArea.animate({
				bottom:_height,
				duration:300
			});
			iconArea.atBottom = false;
		}
	})

	title_fd.addEventListener('blur',function(){
		if(!iconArea.atBottom){
			iconArea.animate({
				bottom:Zookee[8],
				duration:300
			});
			iconArea.atBottom = true;
		}
	})	
	
	description_fd.addEventListener('focus',function(){
		if(iconArea.atBottom){
			iconArea.animate({
				bottom:_height,
				duration:300
			});
			iconArea.atBottom = false;
		}
	})

	description_fd.addEventListener('blur',function(){
		if(!iconArea.atBottom){
			iconArea.animate({
				bottom:Zookee[8],
				duration:300
			});
			iconArea.atBottom = true;
		}
	})		
	win.addEventListener('open', function() {
		title_fd.focus();
		iconArea.animate({
			bottom:_height,
			duration:300
		});
		iconArea.atBottom = false;
	})
	return win;
}

module.exports = NewPostWin;
