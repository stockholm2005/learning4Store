/**
 * @author kent hao
 */
var Zookee = require('Zookee');
var Recorder= require('ui/Recorder');

function MainView(win) {
    this.view = Ti.UI.createView({
        //backgroundColor : Zookee.UI.COLOR.POST_USER_BAR,
        opacity : 1,
        layout : 'vertical'
        //contentHeight:Ti.UI.SIZE
    });

    var that = this;

    var PartyPad = require('ui/PartyPad').PartyPad;

    var partyView = new PartyPad();

    var MyPad = require('ui/MyPad1').MyPad1;
    var myPad = new MyPad(this);

    this.getMyPad = function(){
        return myPad;
    }
    this.view.add(myPad.view);
	this.view.add(partyView.view);

    var maskView = Ti.UI.createView({
        left : 0,
        top : 0,
        width : Ti.UI.FILL,
        height : Ti.UI.FILL,
        backgroundColor : 'black',
        opacity : 0.85
    })    
};

exports.MainView = MainView;
