/**
 * @author kent hao
 */
var Zookee = require('Zookee');

function MainView(win) {
    this.view = Ti.UI.createView({
        width:Ti.UI.FILL,
        height:Ti.UI.FILL,
        layout : 'vertical'
    });

    var that = this;

    var PartyPad = require('ui/PartyPad').PartyPad;

    var partyView = new PartyPad(win);

    var MyPad = require('ui/MyPad1').MyPad1;
    var myPad = new MyPad(that);

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
