/**
 * @author kent hao
 */
var Util = require('Util');
var delegate = require('backend/Delegate');
var Zookee = require('Zookee');
var NewPostWin = require('ui/NewPost');
var PeoplePad = require('ui/PeopleList');
var ImageView = require('ui/ImageView');

function MyPad1(mainView) {
    this.view = Ti.UI.createView({
        layout : 'horizontal',
        top : 0,
        height : Zookee.UI.HEIGHT_MYPAD,
        width : Ti.UI.FILL,
        //backgroundColor : Zookee.UI.COLOR.MYPAD_BACKGROUND,
        backgroundImage:Zookee.ImageURL.Title_Bg
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
        //left:Zookee.SystemWidth*0.02,
        width : Zookee.SystemWidth*0.12,
        height : Zookee.SystemWidth*0.12,
        //borderRadius : 40,
        borderColor : 'white',
        borderWidth : Zookee.SystemWidth*0.005,
        borderRadius:Zookee.UI.Border_Radius_Small,
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

    var time = Ti.UI.createLabel({
        color : 'white',
        center : {
            x : '50%',
            y : '80%'
        },
        width : Ti.UI.SIZE,
        height : Ti.UI.SIZE,
        text : Util.currentTime(),
        font : {
            fontSize : 20,
            fontWeight : 'bold'
        }
    })

    leftView.add(avatar);
    leftView.add(username_lb);
    //leftView.add(time);

    // setInterval(function(){
    // time.text = Util.currentTime()
    // },60000);
    var rightView = Ti.UI.createView({
        left : 0,
        top : 0,
        // right:0,
        // bottom : 10,        width : '50%',
        height : Ti.UI.FILL
    });

    var request_icon = Ti.UI.createButton({
        center : {
            x : '17%',
            y : '50%'
        },
        width:Zookee.SystemWidth*0.1,
        height:Zookee.SystemWidth*0.1,
        backgroundImage : Zookee.ImageURL.Request,
        backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
        // borderWidth:1,
        // borderColor:Zookee.UI.COLOR.PARTY_CONTENT,
        //backgroundGradient:Zookee.UI.BackgroundGradient,
        style:Ti.UI.iPhone.SystemButtonStyle.BORDERED
    })
    var num_icon = Ti.UI.createLabel({
        text : user.requests.length,
        center : {
            x : '24%',
            y : '28%'
        },
        textAlign : 'center',
        width : Zookee.SystemWidth*0.06,
        height : Zookee.SystemWidth*0.06,
        borderRadius : Zookee.SystemWidth*0.03,
        borderWidth:3,
        borderColor:'white',
        backgroundColor : 'red',
        color : 'white',
        opacity:0
    })
    rightView.add(num_icon);
    delegate.showRequests(user, function() {
        if (user.requests.length > 0) {
            num_icon.text = user.requests.length;
            num_icon.opacity = 1;
        }
    }, function() {
    })

	Ti.App.addEventListener('new_request',function(e){
		that.requestUpdate();
	})
	this.requestUpdate = function(){        
        if(Zookee.User.CurrentUser.requests.length>0){
        		num_icon.opacity = 1;
        		num_icon.text = Zookee.User.CurrentUser.requests.length;
        }
        else{
        		num_icon.opacity =0;
        }		
	}

    request_icon.addEventListener('click', function() {
        new PeoplePad(that,0).open({
            windowSoftInputMode : Zookee.Soft_Input.SOFT_INPUT_ADJUST_PAN,
            modal : true,
            navBarHidden : true
            //animated : true
        })
    })
    var add_icon = Ti.UI.createButton({
        center : {
            x : '50%',
            y : '50%'
        },
        width:Zookee.SystemWidth*0.1,
        height:Zookee.SystemWidth*0.1,
        backgroundImage : Zookee.ImageURL.Add,
        backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
        //backgroundColor:Zookee.UI.COLOR.MYPAD_BACKGROUND_END,
        //borderWidth:1,
        //borderColor:Zookee.UI.COLOR.PARTY_CONTENT,
        //backgroundGradient:Zookee.UI.BackgroundGradient,
        style:Ti.UI.iPhone.SystemButtonStyle.BORDERED
    })
    add_icon.addEventListener('click', function() {
    		var win = new NewPostWin(mainView);
        
        win.open({
        		modal:true
        });
    })
    
    var refresh_icon = Ti.UI.createButton({
        center : {
            x : '83%',
            y : '50%'
        },
        width:Zookee.SystemWidth*0.1,
        height:Zookee.SystemWidth*0.1,
        backgroundImage : Zookee.ImageURL.Refresh,
        backgroundSelectedColor : Zookee.UI.COLOR.CONTROL_BACKGROUND,
        //backgroundColor:Zookee.UI.COLOR.MYPAD_BACKGROUND_END,
        // borderWidth:1,
        // borderColor:Zookee.UI.COLOR.PARTY_CONTENT,
        //backgroundGradient:Zookee.UI.BackgroundGradient,
        style:Ti.UI.iPhone.SystemButtonStyle.BORDERED
    })

    refresh_icon.addEventListener('click', function() {
        mainView.getCurrentView().refresh();
    })
    //rightView.add(request_icon);
    //rightView.add(add_icon);
    rightView.add(refresh_icon);

    this.showAddIcon = function(show){
        if(show){
            add_icon.opacity=1;
            add_icon.touchEnabled=true;
        }
        else{
            add_icon.opacity=0;
            add_icon.touchEnabled=false;
        }
    }
    
    this.updateUserName = function(){
    		username_lb.text = user.username;
    }

    avatar.addEventListener('click', function() {
        //avatar.animate(a);
        new PeoplePad(that,2).open({
            windowSoftInputMode : Zookee.Soft_Input.SOFT_INPUT_STATE_HIDDEN | Zookee.Soft_Input.SOFT_INPUT_ADJUST_RESIZE,
            modal : true,
            navBarHidden : true
            //animated : false
        })
    })

    this.updateAvatar = function(blob){
    		avatar.image = blob;
    		// avatar.reloading({
    			// url:user.photo.urls.avatar,
    			// image:user.photo.avatarImage
    		// })
    }

    this.view.add(leftView);
    this.view.add(rightView);
};

exports.MyPad1 = MyPad1;
