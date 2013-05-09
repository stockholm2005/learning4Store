/**
 * @author kent hao
 */
var delegate = require('backend/Delegate');
var Zookee = require('Zookee');

exports.getVoiceData = function(post, callback, failCallback,preCB,afterCB) {
    var fileName = Zookee.CachePath + post.id + '.aac';
    var file = Ti.Filesystem.getFile(fileName);
    if (file.exists()) {
        callback(file.getNativePath());
    } else {
    		preCB();
        delegate.getVoice(post, function() {
            var xhr = Ti.Network.createHTTPClient();
            xhr.setTimeout(Zookee.AJAX.TIME_OUT);

            xhr.onload = function() {
                file.write(this.responseData);
                callback(file.getNativePath());
                afterCB();
            }

            xhr.onerror = function(e) {
            		//it's not a better way, increase in api call.
            		//TODO store the voiceurl in somewhere
            		post.voiceurl = null;
            		xhr.abort();
                failCallback();
                afterCB();
            }

            xhr.open("GET", post.voiceurl);
            
            xhr.send();

        }, function() {
            failCallback();
        });
    }
}
