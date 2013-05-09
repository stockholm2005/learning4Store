/**
 * @author Angela Deng
 */
var Zookee = require('Zookee');
exports.buildTitleView = function(win,text) {
	var titleView = Ti.UI.createView({
		top : 0,
		height : Zookee.UI.HEIGHT_TITLE,
		width : Ti.UI.FILL,
		layout : 'horizontal',
		//backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND
        backgroundImage:Zookee.ImageURL.Title_Bg
	});
	var leftView = Ti.UI.createView({
		left : 0,
		width : '15%',
		height : '100%'
	})
	var centerView = Ti.UI.createView({
		left:0,
		width:'70%',
		height:Ti.UI.FILL
	})
	var rightView = Ti.UI.createView({
		left : 0,
		width : '15%',
		height : Ti.UI.FILL
	})
	var backBtn = Ti.UI.createButton({
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		//borderWidth:0,
		//backgroundGradient:Zookee.UI.BackgroundGradient,
		backgroundColor:'transparent',
		image : Zookee.ImageURL.Back,
		right:0,
		width : '80%',
		height : Zookee[40]
	})
	var title = Ti.UI.createLabel({
		center:{
			x:'50%',
			y:'50%'
		},
		height : '80%',
		textid : 'Zookee',
		textAlign : 'center',
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
		width : Ti.UI.SIZE,
		color : 'white',
		font : Zookee.FONT.TITLE_FONT
	})
	
	if(text)
		title.text = text;

	leftView.add(backBtn);
	centerView.add(title);
	titleView.add(leftView);
	titleView.add(centerView);
	titleView.add(rightView);
	titleView.rightView = rightView;

	title.addEventListener('click', function() {
		title.color = Zookee.UI.COLOR.CONTROL_BACKGROUND;
		win.close();
	})
	backBtn.addEventListener('click', function() {
		win.close();
	})
	
	titleView.addView = function(view){
		rightView.add(view);
	}
	
	titleView.removeView = function(view){
		rightView.remove(view);
	}
	return titleView;
}