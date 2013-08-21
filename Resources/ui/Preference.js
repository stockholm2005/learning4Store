/**
 * @author Angela Deng
 */
var Zookee = require('Zookee');

function Preference(param,action){
	var preferenceView = Ti.UI.createView(param);

	var pref = Ti.App.Properties.getString('pref')||'';

	var preference = ['food', 'entertain', 'hotel', 'shopping', 'sports'];
	var prefControl;
	for (var i = 0, length = preference.length; i < length; i++) {
		var label = Ti.UI.createLabel({
			//top : Zookee[10],
			//left : Zookee[10],
			width : Ti.Platform.displayCaps.platformWidth / 5,
			height : Zookee[40],
			text : ' ' + L(preference[i], preference[i]) + ' ',
			backgroundColor : Zookee.UI.COLOR.PREFERENCE,
			//borderRadius : Zookee.UI.Border_Radius_Small,
			color : 'white',
			tag : preference[i],
			textAlign : 'center',
			verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGN_CENTER,
			font : Zookee.FONT.SMALL_FONT
		});
		if (preference[i] === pref) {
			label.backgroundColor = Zookee.UI.COLOR.MYPAD_BACKGROUND;
			//label.touchEnabled = false;
			prefControl = label;
		}
		label.addEventListener('click', function(e) {
			if (prefControl && prefControl.tag === e.source.tag) {
				prefControl.backgroundColor = Zookee.UI.COLOR.PREFERENCE;
				prefControl = null;
				Ti.App.Properties.removeProperty('pref');
			} else if (prefControl && prefControl.tag !== e.source.tag) {
				prefControl.backgroundColor = Zookee.UI.COLOR.PREFERENCE;
				e.source.backgroundColor = Zookee.UI.COLOR.MYPAD_BACKGROUND;
				prefControl = e.source;
				Ti.App.Properties.setString('pref',e.source.tag);
			} else {
				e.source.backgroundColor = Zookee.UI.COLOR.MYPAD_BACKGROUND;
				prefControl = e.source;
				Ti.App.Properties.setString('pref',e.source.tag);
			}
			action();
		})
		preferenceView.add(label);
	}
	return preferenceView;
}

module.exports = Preference;