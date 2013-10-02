/**
 * @author kent hao
 */
var Util = require('Util');
var delegate = require('backend/Delegate');
var Zookee = require('Zookee');
var PeoplePad = require('ui/PeopleList');
var ImageView = require('ui/ImageView');

function MyPad1(mainView) {
    this.view = Ti.UI.createView({
        layout : 'horizontal',
        top : 0,
        height : Zookee.UI.HEIGHT_MYPAD,
        width : Ti.UI.FILL,
        backgroundColor:Zookee.UI.COLOR.COLOR3
    });
    
    var that = this;

    var user = Zookee.User.CurrentUser

    var rotation = Ti.UI.create2DMatrix();
    rotation = rotation.rotate(45);
    var a = Ti.UI.createAnimation({
        transform : rotation,
        duration : 300,
        autoreverse : true
    });

    var leftView = Ti.UI.createView({
        left : '2%',
        top : 0,
        width : '48%',
        height : Ti.UI.FILL,
        layout : 'horizontal'
    });

    var avatar = new ImageView({
        defaultImage : Zookee.ImageURL.No_Avatar,
        width : Zookee.SystemWidth*0.12,
        height : Zookee.SystemWidth*0.12,
        loadStatus:'starting',
        url:user.photo.urls.avatar,
        image:user.photo.avatarImage
    });
    
    var username_lb = Ti.UI.createLabel({
        left : Zookee.SystemWidth*0.025,
        top : 0,
        height : Ti.UI.FILL,
        verticalAlign : 'middle',
        color : 'white',
        text : user.username,
        font : Zookee.FONT.NORMAL_FONT_BOLD
    })
    this.updateUserName = function(){
    		username_lb.text = user.username;
    }
    leftView.add(avatar);
    leftView.add(username_lb);
    var rightView = Ti.UI.createView({
        left : 0,
        top : 0,        width : '50%',
        height : Ti.UI.FILL
    });
    
    var refresh_icon = Ti.UI.createButton({
        center : {
            x : '83%',
            y : '50%'
        },
        width:Zookee.SystemWidth*0.1,
        height:Zookee.SystemWidth*0.1,
        backgroundImage : Zookee.ImageURL.Refresh,
        backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
        style:Ti.UI.iPhone.SystemButtonStyle.BORDERED
    })

    refresh_icon.addEventListener('click', function() {
        mainView.refresh();
    })
    rightView.add(refresh_icon);

    avatar.addEventListener('click', function() {		mainView.animate();
    })

    this.updateAvatar = function(blob){
    		avatar.image = blob;
    }

    this.view.add(leftView);
    this.view.add(rightView);
};

exports.MyPad1 = MyPad1;
