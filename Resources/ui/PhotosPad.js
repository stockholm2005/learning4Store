/**
 * @author Angela Deng
 */
var delegate = require('backend/Delegate');
var Util = require('Util');
var Zookee = require('Zookee');
var ImageView = require('ui/ImageView');

function PhotosPad(win) {
	var user = Zookee.User.CurrentUser
	var scrollHeight = 0;
	var index = 0;
	var noMore = false;
	this.isAdded = false;
	this.isLoading = false;
	this.view = Ti.UI.createView({
		top : 0,
		bottom : 0,
		left : 0,
		right : 0
	});
	var scrollView = Ti.UI.createScrollView({
		bubbleParent:false,
		disableBounce:true,
		scrollType : 'vertical'
	});
	var that = this;
	scrollView.addEventListener('scroll', function(e) {
		if (scrollView.contentOffset.y + Zookee.UI.HEIGHT_LIST >= scrollHeight) {
			if (!that.isLoading && !noMore) {
				that.isLoading = true;
				delegate.increasePhotoPage();
				//var actInd = Util.actIndicator(L('Loading'),that.view);
				//actInd.show();
				delegate.queryPhotosByUser(user.friends.concat([user]), function(collections) {
					if(collections == {}){
						noMore = true;
						return;
					}
					scrollView.contentHeight = scrollView.contentHeight + Zookee.SystemWidth*0.625 * collections.length / 2;
					populateCollection(collections);
					//actInd.hide();
				}, function() {
					//actInd.hide();
				})
			}
		}
	})
	this.view.add(scrollView);

	this.refresh = function() {
		if(that.isLoading) return;
		if (Util.handleOffLine(this.view))
			return;
		var actInd = Util.actIndicator('',this.view,false,Ti.UI.iPhone.ActivityIndicatorStyle.DARK);
		actInd.show();
		Util.removeChildren(scrollView);
		scrollHeight = 0;
		index = 0;
		that.isLoading = true;
		noMore = false;
		delegate.resetPhotoPage();
		delegate.queryPhotosByUser(user.friends.concat([user]), function(collections) {
			that.isAdded = true;
			that.isLoading = false;
			scrollView.contentHeight = Zookee.SystemWidth*0.625 * collections.length / 2;
			actInd.hide();
			populateCollection(collections);
		}, function() {
			actInd.hide();
			that.isLoading = false;
		})
	}
	var populateCollection = function(collections) {
		var newLine = true;
		for (key in collections) {
			if (index % 2 == 0) {
				newLine = true;
				scrollHeight = scrollHeight + Zookee.SystemHeight*0.28125;
			} else {
				newLine = false;
			}
			var collectionView = Ti.UI.createView({
				left : newLine ? '1%' : '52%',
				top : index < 2 ? Zookee.SystemWidth*0.0125 : parseInt(index / 2) * Zookee.SystemHeight*0.28125,
				height : Zookee.SystemHeight*0.28125,
				width : '47%',
				photos : collections[key],
				layout : 'vertical'
			})

			collectionView.addEventListener('click', function(e) {
				var photos = this.photos;
				var photoWin = Ti.UI.createView({
					width:Ti.UI.FILL,
					height:Ti.UI.FILL,
					backgroundColor : 'black'
				});
				var _views = [];
				for (var j = 0; j < photos.length; j++) {
					var _view = new ImageView({
						//defaultImage : Zookee.ImageURL.Image_Place_Holder,
						backgroundImage : photos[j].originImage,
						url : photos[j].urls.original,
						loadStatus : 'starting'
					})
					_views.push(_view);
				}
				var imageScrollView = Ti.UI.createScrollableView({
					top:'25%',
					center:{
						x:'50%',
						y:'50%'
					},
					width:Ti.UI.FILL,
					height:'50%',
					views : _views,
					showPagingControl : true
				})
				
				photoWin.addEventListener('click',function(){
					win.remove(photoWin);
				})
				photoWin.add(imageScrollView);
				win.add(photoWin);

			});

			//for (var j = 0; j < collections[key].length; j++) {
			//var matrix2d = Ti.UI.create2DMatrix();
			//matrix2d = matrix2d.rotate(20 * j);
			var imageView = new ImageView({
				width : '95%',
				height : '70%',
				borderColor : 'white',
				borderWidth : Zookee.SystemWidth*0.02,
				defaultImage : Zookee.ImageURL.Image_Place_Holder,
				backgroundImage : collections[key][0].thumbImage,
				url : collections[key][0].urls.thumb,
				loadStatus : 'starting'
				//zIndex : j,
				//transform : matrix2d
			})

			var photoNum = Ti.UI.createLabel({
				top : 0,
				right : 0,
				width : Zookee.SystemWidth*0.1,
				height : Zookee.SystemHeight*0.05,
				backgroundColor : 'white',
				textAlign : 'center',
				color : Zookee.UI.COLOR.MYPAD_BACKGROUND,
				text : collections[key].length,
				font : Zookee.FONT.NORMAL_FONT
			})
			//imageView.animate(a);
			imageView.add(photoNum);
			collectionView.add(imageView);

			collectionView.add(Ti.UI.createView({
				top:0,
				left : Zookee.SystemWidth*0.035,
				right : Zookee.SystemWidth*0.035,
				height : '3%',
				backgroundImage : Zookee.ImageURL.Shadow
			}));
			//}
			scrollView.add(collectionView);
			index++;
		}
	}
};

exports.PhotosPad = PhotosPad;
