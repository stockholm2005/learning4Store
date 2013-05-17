/** * @author kent hao */var Util = require('Util');var delegate = require('backend/Delegate');var Geo = require('GeoLocation');var PartyRow = require('ui/Party');var Lines = require('ui/Lines');var Zookee = require('Zookee');var delegate = require('backend/Delegate');function PartyPad(win) {	var that = this;	var location;	var currentAudioView = {};	var lastDistance = 0;	var user = Zookee.User.CurrentUser	var data = [];	var data_bak = [];	this.isAdded = false;	this.isLoading = false;	this.view = Ti.UI.createView({		top : 0,		width : Ti.UI.FILL,		bottom : 0		//backgroundColor : 'white'	});	var searchBar = Ti.UI.createSearchBar({		top : 0,		showCancel : true,		height : Zookee[50]	})	searchBar.addEventListener('return', function(e) {		if (Zookee.isAndroid) {			// hiding and showing the search bar forces it back to its non-focused appearance.			searchBar.hide();			searchBar.show();		} else {			searchBar.blur();		}		that.refresh(searchBar.value);	});	searchBar.addEventListener('cancel', function(e) {		tableView.setData(data_bak);		searchBar.blur();	})	this.view.add(searchBar);	var tableView = Ti.UI.createTableView({		data : data,		top : Zookee[60],		//bottom:0,		left : 0,		right : 0,		allowsSelection : false,		//separatorColor : 'transparent',		separatorStyle : Ti.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE,		bubbleParent : false,		backgroundColor : 'transparent',		showVerticalScrollIndicator : false	});	if (!Zookee.isAndroid) {		tableView.allowsSelection = true;	}	var loadMore = function() {		that.isLoading = true;		delegate.queryParty(function(posts) {			for (var i = 0; i < posts.length; i++) {				var postRow = new PartyRow(posts[i], location);				//data.push(postRow);				tableView.appendRow(postRow);			}			that.isLoading = false;		}, function() {			that.isLoading = false;		}, [location.longitude, location.latitude]);	}	tableView.addEventListener('scroll', function(e) {		// no more parties		if (!tableView.data[0])			return;		if (!Zookee.isAndroid) {			var offset = e.contentOffset.y;			var height = e.size.height;			var total = offset + height;			var theEnd = e.contentSize.height;			var distance = theEnd - total;			// going down is the only time we dynamically load,			// going up we can safely ignore -- note here that			// the values will be negative so we do the opposite			if (distance < lastDistance) {				// adjust the % of rows scrolled before we decide to start fetching				var nearEnd = theEnd * .75;				if (!that.isLoading && (total >= nearEnd)) {					loadMore();				}			}			lastDistance = distance;		} else {			if (!that.isLoading && e.firstVisibleItem > tableView.data[0].rows.length - 8) {				loadMore();			}		}	})	var sendAds = function(ad, e) {		var parent = e.source.bg;		var actInd = Util.actIndicator('', parent, false, Zookee.isAndroid ? Ti.UI.ActivityIndicatorStyle.DARK : Ti.UI.iPhone.ActivityIndicatorStyle.DARK);		parent.remove(e.source);		actInd.show();		var obj = {			title : ad.title,			content : ad.content,			location : [location.longitude, location.latitude],			address : 'No.1068 Westin Road, Bali',			photo : ad.photo		};		//obj[Zookee.ImageSize.THUMB] = thumbSizeStr;		delegate.createAd(obj, [e.source.party], function() {			Zookee.sentParties.push(e.source.party.id)			actInd.hide();			parent.add(Ti.UI.createLabel({				text : L('ads_sent', 'ads sent'),				color : Zookee.UI.COLOR.PARTY_CONTENT,				font : Zookee.FONT.NORMAL_FONT_ITALIC			}));			e.row.className = 'label';		}, function() {			actInd.hide();			parent.add(e.source);		})	}	var buildPreAdsRow = function(pre_ads) {		var row = Ti.UI.createTableViewRow({			layout : 'horizontal',			selectionStyle : Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,			className:'pre_ads'		});		for (var i = 0; i < pre_ads.length; i++) {			var ad_view = Ti.UI.createImageView({				top:Zookee[5],				bottom:Zookee[5],				left : Zookee[10],				width : Zookee[80],				height : Zookee[80],				defaultImage : Zookee.ImageURL.Empty_Photo,				image : pre_ads[i].photo,				tag : 'ad',				ad : pre_ads[i]			})			row.add(ad_view)		}		return row;	}	var preRowShown = false;	var preRowIndex = 0;	var pre_ads = Ti.App.Properties.getList('pre_ads');	var ads_row = buildPreAdsRow(pre_ads);	Ti.App.addEventListener('update_pre_row',function(){		pre_ads = Ti.App.Properties.getList('pre_ads');		ads_row = buildPreAdsRow(pre_ads);	});	tableView.addEventListener('click', function(e) {		if (e.source.tag == 'ad') {			tableView.deleteRow(e.index, Ti.UI.iPhone.RowAnimationStyle.BOTTOM);			preRowShown = false;			sendAds(e.source.ad, e.row.originE);		} else if (e.source.tag == 'send') {			if (!pre_ads || pre_ads.length == 0) {				Util.showStatus(win, L('no_pre_ads', 'no pre-defined ads'));				return;			}			if (preRowShown) {				tableView.deleteRow(preRowIndex, Ti.UI.iPhone.RowAnimationStyle.BOTTOM);				// hide row if the same party row clicked.				if (preRowIndex == e.index + 1) {					preRowShown = false;				} else {					// hide row and show row at another pos for the other party					// note: due to the index refresh after deleting the row,					// here, we have to handle differently					ads_row.originE = e;					if (e.index < preRowIndex) {						tableView.insertRowAfter(e.index, ads_row, Ti.UI.iPhone.RowAnimationStyle.TOP);						preRowIndex = e.index + 1;					} else {						tableView.insertRowAfter(e.index - 1, ads_row, Ti.UI.iPhone.RowAnimationStyle.TOP);						preRowIndex = e.index;					}				}			} else {				ads_row.originE = e;				tableView.insertRowAfter(e.index, ads_row, Ti.UI.iPhone.RowAnimationStyle.TOP);				preRowIndex = e.index + 1;				preRowShown = true;			}		}	})		var noPartyLabel = Ti.UI.createLabel({		center : {			x : '50%',			y : '50%'		},		textid : 'no_parties',		font : Zookee.FONT.NORMAL_FONT,		color : Zookee.UI.COLOR.PARTY_CONTENT	});	this.refresh = function(partyType) {		if (that.isLoading)			return;		var getParty = function(_location) {			location = _location;			var user = Zookee.User.CurrentUser			if (Util.handleOffLine(that.view))				return;			var actInd = Util.actIndicator('', that.view, false, Zookee.isAndroid ? Ti.UI.ActivityIndicatorStyle.DARK : Ti.UI.iPhone.ActivityIndicatorStyle.DARK);			that.view.remove(noPartyLabel);			actInd.show();			that.isLoading = true;			delegate.setPartyPage(1);			delegate.resetHasMore();			// get party list			delegate.queryParty(function(parties) {				if (parties.length == 0) {					that.view.remove(tableView);					that.view.add(noPartyLabel);					that.isLoading = false;					actInd.hide();					return;				}				if (!that.isAdded && parties.length > 0) {					that.view.remove(noPartyLabel);					that.view.add(tableView);				}				populateTable(parties);				actInd.hide();				that.isAdded = true;				that.isLoading = false;			}, function() {				actInd.hide();				that.isLoading = false;				Util.showStatus(win,L('error','error! please try again'))			}, [_location.longitude, _location.latitude], partyType);		}		Geo.getLocation(getParty);	};	var populateTable = function(parties) {		that.tableViewLoaded = true;		data = [];		for (var i = 0; i < parties.length; i++) {			var party = parties[i];			var partyRow = new PartyRow(party, location);			data.push(partyRow);		}		tableView.setData(data);		if (data_bak.length == 0)			data_bak = [].concat(data);	};	var getClassName = function(party) {		return party.id;	}};exports.PartyPad = PartyPad;