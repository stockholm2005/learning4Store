/**
 * 
 */
var Storekit = require('ti.storekit');

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
    Storekit.requestProducts([identifier], function (evt) {
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
exports.purchaseProduct = function(product,succCB) {
    Storekit.purchase(product, function (evt) {
        switch (evt.state) {
            case Storekit.FAILED:
                alert('ERROR: Buying failed!');
                break;
            case Storekit.PURCHASED:
            case Storekit.RESTORED:
                markProductAsPurchased(product.identifier);
                succCB();
                break;
        }
    });
}
 
/**
 * Restores any purchases that the current user has made in the past, but we have lost memory of.
 */
exports.restorePurchases = function() {
    Storekit.restoreCompletedTransactions();
}
Storekit.addEventListener('restoredCompletedTransactions', function (evt) {
    if (evt.error) {
        alert(evt.error);
    }
    else if (evt.transactions == null || evt.transactions.length == 0) {
        alert('There were no purchases to restore!');
    }
    else {
        for (var i = 0; i < evt.transactions.length; i++) {
            markProductAsPurchased(evt.transactions[i].identifier);
        }
        alert('Restored ' + evt.transactions.length + ' purchases!');
    }
});
