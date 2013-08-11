/**
 * @author kent hao
 */
var Zookee = require('Zookee');
var PeopleList = require('ui/PeopleList');

function MainView(win) {
    this.view = Ti.UI.createView({
        width:Ti.UI.FILL,
        height:Ti.UI.FILL,
        layout : 'vertical',
        backgroundImage:Zookee.ImageURL.Background,
        shown:true
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
	var profile = new PeopleList(myPad,win);
	win.add(profile);    
    this.refresh = function(){
    		partyView.refresh();
    }
	var cover = Ti.UI.createView({
		backgroundColor:'transparent',
		zIndex:3,
		height:Ti.UI.FILL,
		left:Zookee[360],
		right:0
	})
	this.animate = function() {
		if (this.view.shown) {
			this.view.animate({
				left : Zookee[360],
				right : -Zookee[360],
				duration : 300
			});
			this.view.shown = false;
			//this.currentView.disableScroll();
			win.add(cover);
		} else {
			this.view.animate({
				left : Zookee[0],
				right : Zookee[0],
				duration : 300
			});
			this.view.shown = true;
			//this.currentView.enableScroll();
			win.remove(cover);
		}
	}    
	cover.addEventListener('click',function(e){
		if(that.view.shown===false)		
			that.animate();
	})
	win.addEventListener('swipe',function(e){
		if(e.direction==='right' && that.view.shown===true)
			that.animate();	
		else if(e.direction==='left' && that.view.shown===false)
			that.animate();
	})    
};

exports.MainView = MainView;
