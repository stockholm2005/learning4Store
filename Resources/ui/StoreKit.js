/**
 * 
 */
var Storekit = Zookee.isAndroid?require('ti.inappbilling'):require('ti.storekit');
var Util = require('Util');

var win;
exports.setWin = function(_win){
	win=_win;
}
var loading = Ti.UI.createActivityIndicator({
	bottom:10, height:50, width:50,
	backgroundColor:'black', borderRadius:10,
	style:Ti.UI.iPhone.ActivityIndicatorStyle.BIG
});
var loadingCount = 0;
function showLoading()
{
	loadingCount += 1;
	if (loadingCount == 1) {
		loading.show();
	}
}
function hideLoading()
{
	if (loadingCount > 0) {
		loadingCount -= 1;
		if (loadingCount == 0) {
			loading.hide();
		}
	}
}
win.add(loading);
/*
 Now let's define a couple utility functions. We'll use these throughout the app.
 */
 
/**
 * Keeps track (internally) of purchased products.
 * @param identifier The identifier of the Ti.Storekit.Product that was purchased.
 */
exports.markProductAsPurchased = function(identifier) {
    Ti.App.Properties.setBool('Purchased-' + identifier, true);
}
 
/**
 * Checks if a product has been purchased in the past, based on our internal memory.
 * @param identifier The identifier of the Ti.Storekit.Product that was purchased.
 */
exports.checkIfProductPurchased = function(identifier) {
    return Ti.App.Properties.getBool('Purchased-' + identifier, false);
}
 
/**
 * Requests a product. Use this to get the information you have set up in iTunesConnect, like the localized name and
 * price for the current user.
 * @param identifier The identifier of the product, as specified in iTunesConnect.
 * @param success A callback function.
 * @return A Ti.Storekit.Product.
 */
exports.requestProduct = function(identifier, success) {
	showLoading();

    Storekit.requestProducts([identifier], function (evt) {
		hideLoading();
        if (!evt.success) {
            alert('ERROR: We failed to talk to Apple!');
        }
        else if (evt.invalid) {
            alert('ERROR: We requested an invalid product!');
        }
        else {
            success(evt.products[0]);
        }
    });
}
 
/**
 * Purchases a product.
 * @param product A Ti.Storekit.Product (hint: use Storekit.requestProducts to get one of these!).
 */
var succ;
exports.purchaseProduct = function(product,succCB) {
	showLoading();
	succ = succCB;
    Storekit.purchase(product, 1);
}
 
/**
 * Restores any purchases that the current user has made in the past, but we have lost memory of.
 */
exports.restorePurchases = function() {
	showLoading();
    Storekit.restoreCompletedTransactions();
}
Storekit.addEventListener('restoredCompletedTransactions', function (evt) {
	hideLoading();
    if (evt.error) {
        alert(evt.error);
    }
    else if (evt.transactions == null || evt.transactions.length == 0) {
        alert('There were no purchases to restore!');
    }
    else {
        for (var i = 0; i < evt.transactions.length; i++) {
            //exports.markProductAsPurchased(evt.transactions[i].identifier);
        }
        alert('Restored ' + evt.transactions.length + ' purchases!');
    }
});

Storekit.addEventListener('transactionState', function (evt) {
	hideLoading();
    if (evt.state == Storekit.PURCHASED){
        alert(" thanks for buy");
        //exports.markProductAsPurchased(evt.productIdentifier);
        succ(evt.date); 
    }else if(evt.state === Storekit.FAILED){
    		if(evt.message)
    			alert(evt.message);
    }
});
