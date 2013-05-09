/**
 * @author kent hao
 */

function translateErrorCode(code) {
    if (code == null) {
        return null;
    }
    switch (code) {
        case Ti.Geolocation.ERROR_LOCATION_UNKNOWN:
            return "Location unknown";
        case Ti.Geolocation.ERROR_DENIED:
            return "Access denied";
        case Ti.Geolocation.ERROR_NETWORK:
            return "Network error";
        case Ti.Geolocation.ERROR_HEADING_FAILURE:
            return "Failure to detect heading";
        case Ti.Geolocation.ERROR_REGION_MONITORING_DENIED:
            return "Region monitoring access denied";
        case Ti.Geolocation.ERROR_REGION_MONITORING_FAILURE:
            return "Region monitoring access failure";
        case Ti.Geolocation.ERROR_REGION_MONITORING_DELAYED:
            return "Region monitoring setup delayed";
    }
}

// state vars used by resume/pause
var headingAdded = false;
var locationAdded = false;

exports.getLocation = function(callback) {
    Ti.Geolocation.preferredProvider = "gps";
    //
    //  SHOW CUSTOM ALERT IF DEVICE HAS GEO TURNED OFF
    //
    if (Titanium.Geolocation.locationServicesEnabled === false) {
        Titanium.UI.createAlertDialog({
            title : 'Kitchen Sink',
            message : 'Your device has geo turned off - turn it on.'
        }).show();
    } else {
        if (!Zookee.isAndroid) {
            // if (win.openedflag == 0) {
                // Ti.API.info('firing open event');
                // win.fireEvent('open');
            // }
            // if (win.focusedflag == 0) {
                // Ti.API.info('firing focus event');
                // win.fireEvent('focus');
            // }
            var authorization = Titanium.Geolocation.locationServicesAuthorization;
            Ti.API.info('Authorization: ' + authorization);
            if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
                Ti.UI.createAlertDialog({
                    title : 'Kitchen Sink',
                    message : 'You have disallowed Titanium from running geolocation services.'
                }).show();
            } else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
                Ti.UI.createAlertDialog({
                    title : 'Kitchen Sink',
                    message : 'Your system has disallowed Titanium from running geolocation services.'
                }).show();
            }
        }
        //
        //  SET ACCURACY - THE FOLLOWING VALUES ARE SUPPORTED
        //
        // Titanium.Geolocation.ACCURACY_BEST
        // Titanium.Geolocation.ACCURACY_NEAREST_TEN_METERS
        // Titanium.Geolocation.ACCURACY_HUNDRED_METERS
        // Titanium.Geolocation.ACCURACY_KILOMETER
        // Titanium.Geolocation.ACCURACY_THREE_KILOMETERS
        //
        Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

        //
        // GET CURRENT POSITION - THIS FIRES ONCE
        //
        Titanium.Geolocation.getCurrentPosition(function(e) {
            if (!e.success || e.error) {
                alert('Location service error');
                return;
            }
            var location = {};
            location.longitude = e.coords.longitude
            location.latitude = e.coords.latitude;

            callback(location);
        });
    }
};

exports.getAddress = function(location,callback,failCallback) {
        Titanium.Geolocation.reverseGeocoder(location.latitude, location.longitude, function(e) {
            if (e.success) {
                var text = "";
                for (var i = 0; i < e.places.length; i++) {
                    text += "" + i + ") " + e.places[i].address + "\n";
                }
                Ti.App.Properties.setString('CurrentAddress',e.places[0].address);
                alert(text);
                callback();
            } else {
                Ti.UI.createAlertDialog({
                    title : 'Forward geo error',
                    message : evt.error
                }).show();
                failCallback();
            }
        });
}
