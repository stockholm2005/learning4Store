/**
 * @author kent hao
 */
var Zookee = require('Zookee');
var Lines = require('ui/Lines');

function Segment(mainWin) {
    var view = Ti.UI.createView({
        left : 0,
        top : 0,
        width : Ti.UI.FILL,
        height : Zookee.UI.HEIGHT_SEGMENT,
        layout : 'horizontal',
        backgroundImage:Zookee.ImageURL.Segment_Bg
    });

    var posts = Ti.UI.createLabel({
        text : L('Things'),
        left : 0,
        width : '32%',
        height : Ti.UI.FILL,
        textAlign : 'center',
        color : Zookee.UI.COLOR.SEGMENT_FONT,
        font : Zookee.FONT.SMALL_FONT
    });

	posts.addEventListener('click',function(e){
		
	})
    var parties = Ti.UI.createLabel({
        text : L('activity'),
        left : 0,
        width : '35%',
        height : Ti.UI.FILL,
        textAlign : 'center',
        color : Zookee.UI.COLOR.SEGMENT_FONT,
        font : Zookee.FONT.SMALL_FONT
    });

    var album = Ti.UI.createLabel({
        text : L('Album'),
        left : 0,
        width : '31%',
        height : Ti.UI.FILL,
        textAlign : 'center',
        color : Zookee.UI.COLOR.SEGMENT_FONT,
        font : Zookee.FONT.SMALL_FONT
    });

    var labels = {};
    labels[Zookee.CurrentView.Things] = posts;
    labels[Zookee.CurrentView.Together] = parties;
    labels[Zookee.CurrentView.Album] = album;
    labels[0].color = 'white';
    labels[0].font = Zookee.FONT.NORMAL_FONT;
    view.add(labels['0']);
    view.add(Lines.VerticalLine(Zookee.UI.COLOR.LINE_IN_SEG));
    view.add(labels['1']);
    view.add(Lines.VerticalLine(Zookee.UI.COLOR.LINE_IN_SEG));
    view.add(labels['2']);

    view.changeFontStyle = function(index) {
        switch(index) {
            case Zookee.CurrentView.Things:
                posts.font = Zookee.FONT.NORMAL_FONT;
                posts.color='white';
                parties.font = Zookee.FONT.SMALL_FONT;
                parties.color=Zookee.UI.COLOR.SEGMENT_FONT;
                album.font = Zookee.FONT.SMALL_FONT;
                album.color=Zookee.UI.COLOR.SEGMENT_FONT
                break;
            case Zookee.CurrentView.Together:
                posts.font = Zookee.FONT.SMALL_FONT;;
                posts.color=Zookee.UI.COLOR.SEGMENT_FONT;
                parties.font = Zookee.FONT.NORMAL_FONT;;
                parties.color='white';
                album.font = Zookee.FONT.SMALL_FONT;;
                album.color=Zookee.UI.COLOR.SEGMENT_FONT;
                break;
            case Zookee.CurrentView.Album:
                posts.font = Zookee.FONT.SMALL_FONT;;
                posts.color=Zookee.UI.COLOR.SEGMENT_FONT;
                parties.font = Zookee.FONT.SMALL_FONT;;
                parties.color=Zookee.UI.COLOR.SEGMENT_FONT;
                album.font = Zookee.FONT.NORMAL_FONT;;
                album.color='white';
                break;
        }
    }
    
    return view;
}

module.exports = Segment;
