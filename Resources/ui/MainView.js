/**
 * @author kent hao
 */
var Zookee = require('Zookee');

function MainView(win) {
    this.view = Ti.UI.createView({
        //backgroundColor : Zookee.UI.COLOR.POST_USER_BAR,
        width:Ti.UI.FILL,
        height:Ti.UI.FILL,
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
    
    this.refresh = function(){
    		partyView.refresh();
    }
};

exports.MainView = MainView;
