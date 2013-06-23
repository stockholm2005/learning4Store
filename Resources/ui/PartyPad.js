/** * @author kent hao */var Util = require('Util');var delegate = require('backend/Delegate');var Geo = require('GeoLocation');var PartyRow = require('ui/Party');var Lines = require('ui/Lines');var Zookee = require('Zookee');var delegate = require('backend/Delegate');var PullRefreshTableView = require('ui/PullRefreshTableView');function PartyPad(win) {	var that = this;	var location;	var currentAudioView = {};	var lastDistance = 0;	var user = Zookee.User.CurrentUser	var data = [];	this.isAdded = false;	this.isLoading = false;	this.view = Ti.UI.createView({		top : 0,		width : Ti.UI.FILL,		bottom : 0		//backgroundColor : 'white'	});	var preferenceView = Ti.UI.createView({		top:0,		width : Ti.UI.FILL,		height : Ti.UI.SIZE,		backgroundImage : Zookee.ImageURL.Background,		layout : 'horizontal'	})		var preference = ['food', 'entertain', 'hotel', 'shopping', 'sports'];	var prefControl;	for (var i = 0; i < preference.length; i++) {		var label = Ti.UI.createLabel({			top : Zookee[10],			height:Zookee[30],			left : Zookee[10],			text : ' ' + L(preference[i], preference[i]) + ' ',			backgroundColor : Zookee.UI.COLOR.PREFERENCE,			borderRadius : Zookee.UI.Border_Radius_Small,			color : 'white',			tag : preference[i],			font : Zookee.FONT.SMALL_FONT		});		label.addEventListener('click', function(e) {			//TODO: update party info, so stores can provide specific service.			if(prefControl && prefControl.tag != e.source.tag){				prefControl.backgroundColor = Zookee.UI.COLOR.PREFERENCE;			}			if(prefControl && prefControl.tag === e.source.tag){				//click the same type to cancel the type filter				e.source.backgroundColor = Zookee.UI.COLOR.PREFERENCE;				delegate.resetPartyType();				that.refresh();						prefControl = null;				return;					}			delegate.setPartyType(e.source.tag);			e.source.backgroundColor = Zookee.UI.COLOR.MYPAD_BACKGROUND;			prefControl = e.source;						that.refresh();		})		preferenceView.add(label);	}	this.view.add(preferenceView);	this.view.add(Ti.UI.createView({		top : Zookee[50],		width : Ti.UI.FILL,		height : 1,		opacity : 0.5,		backgroundColor : Zookee.UI.COLOR.PARTY_CONTENT	}))	var tableView = new PullRefreshTableView({		data : data,		top : Zookee[60],		//bottom:0,		left : 0,		right : 0,		allowsSelection : false,		//separatorColor : 'transparent',		separatorStyle : Ti.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE,		bubbleParent : false,		backgroundColor : 'transparent',		showVerticalScrollIndicator : false	},function() {		that.refresh(true);	}, {		win : win,		fun : function() {			loadMore();		}	});	this.view.add(tableView);	if (!Zookee.isAndroid) {		tableView.allowsSelection = true;	}	var loadMore = function() {		that.isLoading = true;		delegate.queryParty(function(posts) {			for (var i = 0; i < posts.length; i++) {				var postRow = new PartyRow(posts[i], location);				//data.push(postRow);				tableView.appendRow(postRow);			}			that.isLoading = false;		}, function() {			that.isLoading = false;		}, [location.longitude, location.latitude]);	}	var sendAds = function(ad, e) {		var parent = e.source.bg;		var actInd = Util.actIndicator('', parent, false, Zookee.isAndroid ? Ti.UI.ActivityIndicatorStyle.DARK : Ti.UI.iPhone.ActivityIndicatorStyle.DARK);		parent.remove(e.source);		actInd.show();		var obj = {			title : ad.title,			content : ad.content,			location : [location.longitude, location.latitude],			address : 'No.1068 Westin Road, Bali',			photo : ad.photo		};		//obj[Zookee.ImageSize.THUMB] = thumbSizeStr;		delegate.createAd(obj, [e.source.party], function() {			Zookee.sentParties.push(e.source.party.id)			actInd.hide();			parent.add(Ti.UI.createLabel({				text : L('ads_sent', 'ads sent'),				color : Zookee.UI.COLOR.PARTY_CONTENT,				font : Zookee.FONT.NORMAL_FONT_ITALIC			}));			e.row.className = 'label';		}, function() {			actInd.hide();			parent.add(e.source);		})	}	var buildPreAdsRow = function(pre_ads) {		var row = Ti.UI.createTableViewRow({			height:Zookee[70],			layout : 'horizontal',			selectionStyle : Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE		});		var scroll = Ti.UI.createScrollView({			scrollType:'horizontal',			width:Ti.UI.FILL,			height:Ti.UI.FILL,			layout:'horizontal',			contentWidth:Zookee[70]*pre_ads.length,			tag:'pre_ads_scroll'		})		for (var i = 0; i < pre_ads.length; i++) {			var ad_view = Ti.UI.createImageView({				top:Zookee[5],				bottom:Zookee[5],				left : Zookee[10],				width : Zookee[60],				height : Zookee[60],				defaultImage : Zookee.ImageURL.Empty_Photo,				image : pre_ads[i].photo,				tag : 'ad',				ad : pre_ads[i]			})			scroll.add(ad_view)		}		row.add(scroll);		return row;	}	var preRowShown = false;	var preRowIndex = 0;	var pre_ads = Ti.App.Properties.getList('pre_ads')||[];	var ads_row = buildPreAdsRow(pre_ads);	Ti.App.addEventListener('update_pre_row',function(){		pre_ads = Ti.App.Properties.getList('pre_ads');		ads_row = buildPreAdsRow(pre_ads);	});	//here, use singletap instead of click, because scrollview in tableviewrow.	var eventName = 'singletap';	if(Zookee.isAndroid) eventName='click';	tableView.addEventListener(eventName, function(e) {		if (e.source.tag == 'ad') {			tableView.deleteRow(e.index, Ti.UI.iPhone.RowAnimationStyle.LEFT);			preRowShown = false;			sendAds(e.source.ad, e.row.originE);		} else if (e.source.tag == 'send') {			if (!pre_ads || pre_ads.length == 0) {				Util.showStatus(win, L('no_pre_ads', 'no pre-defined ads'));				return;			}			if (preRowShown) {				tableView.deleteRow(preRowIndex, Ti.UI.iPhone.RowAnimationStyle.LEFT);				// hide row if the same party row clicked.				if (preRowIndex == e.index + 1) {					preRowShown = false;				} else {					// hide row and show row at another pos for the other party					// note: due to the index refresh after deleting the row,					// here, we have to handle differently					var ads_row = buildPreAdsRow(pre_ads);					ads_row.originE = e;					if (e.index < preRowIndex) {						tableView.insertRowAfter(e.index, ads_row, Ti.UI.iPhone.RowAnimationStyle.RIGHT);						preRowIndex = e.index + 1;					} else {						tableView.insertRowAfter(e.index - 1, ads_row, Ti.UI.iPhone.RowAnimationStyle.RIGHT);						preRowIndex = e.index;					}				}			} else {				var ads_row = buildPreAdsRow(pre_ads);				ads_row.originE = e;				tableView.insertRowAfter(e.index, ads_row, Ti.UI.iPhone.RowAnimationStyle.RIGHT);				preRowIndex = e.index + 1;				preRowShown = true;			}		}	})		var noPartyLabel = Ti.UI.createLabel({		center : {			x : '50%',			y : '50%'		},		textid : 'no_parties',		font : Zookee.FONT.NORMAL_FONT,		color : Zookee.UI.COLOR.PARTY_CONTENT	});	this.refresh = function(pull2Refresh) {		if (tableView.isLoading())			return;		var getParty = function(_location) {			location = _location;			var user = Zookee.User.CurrentUser			if (Util.handleOffLine(that.view))				return;			var actInd;			if(!pull2Refresh){				actInd =Util.actIndicator('', that.view, false, Zookee.isAndroid ? Ti.UI.ActivityIndicatorStyle.DARK : Ti.UI.iPhone.ActivityIndicatorStyle.DARK);				actInd.zIndex=1;				actInd.show();			} 			that.view.remove(noPartyLabel);			tableView.startLoading();			delegate.setPartyPage(1);			delegate.resetHasMore();			// get party list			delegate.queryParty(function(parties) {				if (parties.length == 0) {					tableView.setData([]);					that.view.add(noPartyLabel);					if(prefControl)						noPartyLabel.text = L('no_parties')+' '+L('about')+' '+L(prefControl.tag);					that.isAdded = false;					tableView.finishLoading();					if(actInd)						actInd.hide();					return;				}				if (!that.isAdded && parties.length > 0) {					that.view.remove(noPartyLabel);				}				populateTable(parties);				if(actInd)					actInd.hide();				that.isAdded = true;				tableView.finishLoading();			}, function() {				if(actInd)					actInd.hide();				tableView.finishLoading();				Util.showStatus(win,L('error','error! please try again'))			}, [_location.longitude, _location.latitude]);		}		Geo.getLocation(getParty);	};	var populateTable = function(parties) {		that.tableViewLoaded = true;		data = [];		for (var i = 0; i < parties.length; i++) {			var party = parties[i];			var partyRow = new PartyRow(party, location);			data.push(partyRow);		}		tableView.setData(data);	};	var getClassName = function(party) {		return party.id;	}};exports.PartyPad = PartyPad;