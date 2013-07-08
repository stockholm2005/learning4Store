/**
 * @author Angela Deng
 */
Zookee = {
	isAndroid:true,
	sentParties:{
		arr:Ti.App.Properties.getList('sentParties')||[],
		push:function(partyId){
			this.arr.push(partyId);
			Ti.App.Properties.setList('sentParties',this.arr);
		},
		indexOf:function(partyId){
			return this.arr.indexOf(partyId);
		},
		release:function(){
			this.arr = [];
			Ti.App.Properties.removeProperty('sentParties');
		}
	},
	Priorities:[
	{
		title:'list_priority',
		content:'list_priority_content',
		photo:'/images/priority1.png'
	},	
	{
		title:'area_priority',
		content:'area_priority_content',
		photo:'/images/priority2.png'
	},
	{
		title:'detail_priority',
		content:'detail_priority_content',
		photo:'/images/priority3.png'
	}],
	User : {
		CurrentUser : {},
		setUser : function(_user) {
			this.CurrentUser = JSON.parse(JSON.stringify(_user));
			Ti.App.Properties.setObject('User',this.CurrentUser);
			if(this.CurrentUser.requests && this.CurrentUser.requests.length>0)
				Ti.UI.iPhone.appBadge = this.CurrentUser.requests.length;
			else
				Ti.UI.iPhone.appBadge = null;
		},
		initUser : function() {
			var user = Ti.App.Properties.getObject('User');
			this.CurrentUser = JSON.parse(JSON.stringify(user));
		}
	},

	currentWindow:null,
	isLogin:true,
	Soft_Input:{
		SOFT_INPUT_ADJUST_PAN : Ti.Platform.osname === 'android'? Ti.UI.Android.SOFT_INPUT_ADJUST_PAN:'',
		SOFT_INPUT_STATE_HIDDEN:Ti.Platform.osname === 'android'? Ti.UI.Android.SOFT_INPUT_STATE_HIDDEN:'',
		SOFT_KEYBOARD_SHOW_ON_FOCUS:Ti.Platform.osname === 'android'? Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS:'',
		SOFT_KEYBOARD_DEFAULT_ON_FOCUS:Ti.Platform.osname === 'android'? Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS:'',
		SOFT_INPUT_STATE_VISIBLE: Ti.Platform.osname === 'android'? Ti.UI.Android.SOFT_INPUT_STATE_VISIBLE:'',
		SOFT_INPUT_ADJUST_RESIZE: Ti.Platform.osname === 'android'? Ti.UI.Android.SOFT_INPUT_ADJUST_RESIZE:'',	
		SOFT_INPUT_STATE_ALWAYS_VISIBLE:Ti.Platform.osname === 'android'? Ti.UI.Android.SOFT_INPUT_STATE_ALWAYS_VISIBLE:''
	},
	
	CurrentPage : 0,
	
	SDK_VERSION : 3,

	CurrentView : {
		Things : 1,
		Together : 0,
		Album : 2
		//Contacts:2
	},
	
	CurrentLocation:{
		longitude : 0,
		latitude : 0
	},
	MaxHttpRequests : 5,

	MaxLoadingRows : 10,
	
	MediaPlayer:null,

	Seperator : {
		USERNAME_TEXT : ':'
	},

	Location : {
		MAX_NUMBER : 8
	},

	Notification : {
		Enabled : true,
		Friend_Channel : 'friend_channel',
		Party_Channel : 'party_channel',
		MessageType: {
			APPROVE: 'approve_the_request',
			REQUEST: 'request_be_friend',
			CREATEPARTY: 'create_party'
		}
	},

	FriendAction : {
		Invite : 0,
		Approve : 1,
		Request : 2,
		Reject : 3,
		Delete : 4
	},

	File : {
		Ext : {
			PHOTO : '.jpeg',
			AUDIO : '.3gp'
		}
	},

    AniDuration:1000,
    
	ImageURL : {
		Background:'/images/background.jpg',
		Background_Dark:'/images/background_dark.png',
		Already:'/images/already.png',
		AvatarCache : 'avatar.jpg',
		Avatar : '/images/avatar.jpg',
		No_Avatar : '/images/noavatar.png',
		Phone : '/images/phoneAction.png',
		SMS : '/images/textAction.png',
		Image_Place_Holder : '/images/imagePlaceHolder.png',
		Left_Arrow : '/images/icon_arrow_left.png',
		Right_Arrow : '/images/icon_arrow_right.png',
		Party : '/images/party.png',
		Party1 :'/images/party1.png',
		Party2:'/images/party2.png',
		Party_White:'/images/party_white.png',
		Audio : '/images/record.png',
		Audio_White:'/images/audio_white.png',
		Back:'/images/back.png',
		Pause : '/images/pause.png',
		Pause_White:'/images/pause_white.png',
		Comment : '/images/comment.png',
		Camera : '/images/camera.png',
		Gallery : '/images/gallery.png',
		Record : '/images/record1.png',
		Record_White:'/images/record_white.png',
		Stop_Record : '/images/stop_record.png',
		Location : '/images/location.png',
		Location_White:'/images/location_white.png',
		Setting : '/images/setting.png',
		Selected_Location : '/images/selectedPlace.png',
		Send : '/images/send.png',
		Send_Dark : '/images/send_dark.png',
		Text_Line : '/images/textfield.png',
		Shadow : '/images/shadow.png',
		Cancel : '/images/cancel.png',
		Cancel_Dark : '/images/cancel_dark.png',
		Add : '/images/add.png',
		Refresh : '/images/refresh.png',
		Progressing : '/images/progressing.png',
		Request : '/images/request.png',
		More : '/images/more.png',
		Search : '/images/search.png',
		Say_Something:'/images/say_something.png',
		Status_Bar:'/images/status_bar.png',
		Time_Bar:'/images/time_bar.png',
		Join:'/images/join.png',
		Popover:'/images/popover.png',
		Empty_Photo:'/images/empty_photo.jpg',
		Title_Bg:'/images/title_bg.jpg',
		Segment_Bg:'/images/segment_bg.jpg'
	},

	ImageProcessTime : 20000,

	ImageSize : {
		AVATAR : 'photo_sizes[avatar]',
		AVATAR_SIZE : '100x100#',
		THUMB : 'photo_sizes[thumb]',
		THUMB_SIZE : '150x150#',
		PARTY : 'photo_sizes[party]',
		PARTY_SIZE : '600x480#',
		ORIGIN : 'photo_sizes[original]',
		ORIGIN_SIZE:'800x640#',
		PARTY_CACHE_WIDTH : Ti.Platform.displayCaps.platformWidth,
		PARTY_CACHE_HEIGHT : 480,
		AVATAR_CACHE_WIDTH : 100,
		AVATAR_CACHE_HEIGHT : 100,
		THUMB_CACHE_WIDTH : 120,
		THUMB_CACHE_HEIGHT : 150,
		ORIGIN_CACHE_WIDTH:800,
		ORIGIN_CACHE_HEIGHT:640
	},
	
	ImageType:{
	    AVATAR:0,
	    PARTY:1,
	    LOCATION:2
	},

	Events : {

	},
	SystemWidth : Ti.Platform.displayCaps.platformWidth,
    SystemHeight : Ti.Platform.displayCaps.platformHeight,
	UI : {
		IMAGE:{
			PARTY_IMAGE_RATIO: 640/400,
			ORIGIN_IMAGE_RATIO:640/480
		},
		COLOR : {
			APP_BACKGROUND : '#FFFFF0',
			ROW_BACKGROUND : '#EEEED1',
			CONTROL_BACKGROUND : '#193221',
			MYPAD_BACKGROUND : '#2F4F4F',
			MYPAD_BACKGROUND_END:'#8EBF3F',
			TOP_STATUS : '#CD3700',
			FONT : '#525252',
			PARTY_CONTENT:'#888888',
			SEGMENT_FONT : '#607B8B',
			POST_USER_BAR : '#EDEDED',
			LINE_IN_SEG:'#2F4F4F',
			LINE_IN_SETTING_SEG:'#A2CD5A',
			SETTING_SEG_FONT:'#A2CD5A',
			SHADOW_START_COLOR:'#B7B7B7',
			SINGLE_LINE:'#CFCFCF',
			PREFERENCE:'#b9b9b9',
			COLOR1:'#8C5454',
			COLOR2:'#7A378B',
			COLOR3:'#2F4F4F',
			COLOR4:'#9fbc53'			
		},
		BackgroundGradient : {
            type : 'linear',
            startPoint : {
                x : '50%',
                y : 0
            },
            endPoint : {
                x : '50%',
                y : '100%'
            },
            colors : [{
                color : '#BBD876',
                offset : 0.5
            }, {
                color : '#8EBF3F',
                offset : 1.0
            }],
        },
		BackgroundGradient_1 : {
            type : 'linear',
            startPoint : {
                x : '50%',
                y : 0
            },
            endPoint : {
                x : '50%',
                y : '100%'
            },
            colors : [{
                color : '#fbfbfb',
                offset : 0.5
            }, {
                color : '#b9b9b9',
                offset : 1.0
            }],
        },
		Border_Radius_Small:Ti.Platform.displayCaps.platformWidth*0.015,
		Border_Radius_Normal:Ti.Platform.displayCaps.platformWidth*0.03,
		MARGIN : {
			TABLE : '5%',
			TABLE_SHADOW : '6%'
		},
		ROW_CLASS : {
			PARTY_ONLY_TEXT : 'party_only_text',
			PARTY_ONLY_IMAGE : 'party_only_image',
			PARTY_ONLY_AUDIO : 'party_only_audio',
			PARTY_IMAGE_AUDIO : 'party_image_audio',
			POST_ONLY_TEXT : 'post_only_text',
			POST_ONLY_IMAGE : 'post_only_image',
			POST_ONLY_AUDIO : 'post_only_audio',
			POST_IMAGE_TEXT : 'post_image_text',
			POST_AUDIO_TEXT : 'post_audio_text',
			COMMENT_CLASS : 'comment_class'
		},
		HEIGHT_TITLE : Ti.Platform.displayCaps.platformHeight*0.09,
		HEIGHT_FOOT: Ti.Platform.displayCaps.platformHeight*0.09,
		HEIGHT_SEGMENT: Ti.Platform.displayCaps.platformHeight*0.05,
		HEIGHT_MYPAD: Ti.Platform.displayCaps.platformHeight*0.09,
		HEIGHT_LIST:Ti.Platform.displayCaps.platformHeight*0.82,
		HEIGHT_REGISTER_FORM:Ti.Platform.displayCaps.platformHeight*0.65,
		HEIGHT_SETTING_FORM:Ti.Platform.displayCaps.platformHeight*0.8,
		HEIGHT_FULL_PHOTO:Ti.Platform.displayCaps.platformHeight*0.6,
		HEIGHT_GOLDEN_ROW:Ti.Platform.displayCaps.platformWidth*0.618,
		HEIGHT_GOLDEN_NEWPARTY:Ti.Platform.displayCaps.platformWidth*0.8
	},

	FONT:{
		TITLE_FONT:{
			fontSize:26,
			fontWeight:'bold'
		},
		PARTY_INFO_FONT:{
			fontSize:22
		},
		SEGMENT_FONT_SELECTED:{
			fontSize:22,
			fontWeight:'bold'
			//fontStyle:'italic'
		},
		SEGMENT_FONT_UNSELECTED:{
			fontSize:22,
			fontWeight:'normal'
		},
		LARGE_FONT:{
			fontSize:26
		},
		LARGE_FONT_ITALIC:{
			fontSize:26,
			fontWeight:'bold',
			fontStyle:'italic',
			fontFamily:'Georgia'
		},	
		NORMAL_FONT:{
			fontSize:22
		},
		NORMAL_FONT_BOLD:{
			fontSize:22,
			fontWeight:'bold'
		},		
		NORMAL_FONT_ITALIC:{
			fontSize:22
			//fontStyle:'italic'
		},
		SMALL_FONT:{
			fontSize:18
		},
		SMALL_FONT_ITALIC:{
			fontSize:18
			//fontStyle:'italic'
		},
        SMALL_BOLD_FONT:{
            fontSize:18,
            fontWeight:'bold'
        }		
	},
	
	EMPTY_POST_MARK : '~!@#$%^&*&^%$#@!~',

	FRIEND_STATUS : {
		FRIEND : 0,
		I_REQUEST : 1,
		THEY_REQUEST : 2,
		NONE : 3
	},
	
	AJAX:{
	    TIME_OUT:30000,
	    RESPONSE_DEPTH:2
	},
	
	CachePath:Titanium.Filesystem.applicationDataDirectory,
	//Titanium.Filesystem.applicationDataDirectory
	Distance_Party:10000,
	PartyFilter:{
		NOW:0,
		NEAR:1,
		// the radius of the party, the distance = 0.00126*n, 0.00126 = 1 mile
		DISTANCE_NUM:2,
		// the default duration for a party
		DURATION:6
	},
	PASSCODE_ENABLED:true
};

Ti.API.info('Ti.Platform.displayCaps.density: ' + Ti.Platform.displayCaps.density);
Ti.API.info('Ti.Platform.displayCaps.dpi: ' + Ti.Platform.displayCaps.dpi);
Ti.API.info('Ti.Platform.displayCaps.platformHeight: ' + Ti.Platform.displayCaps.platformHeight);
Ti.API.info('Ti.Platform.displayCaps.platformWidth: ' + Ti.Platform.displayCaps.platformWidth);
if(Ti.Platform.osname === 'android'){
  Ti.API.info('Ti.Platform.displayCaps.xdpi: ' + Ti.Platform.displayCaps.xdpi);
  Ti.API.info('Ti.Platform.displayCaps.ydpi: ' + Ti.Platform.displayCaps.ydpi);
  Ti.API.info('Ti.Platform.displayCaps.logicalDensityFactor: ' + Ti.Platform.displayCaps.logicalDensityFactor);
}
for(var i=0;i<400;i++){
	Zookee[i]=i/400*Ti.Platform.displayCaps.platformWidth;
}

if(Ti.Platform.osname === 'iphone'){
	Zookee.isAndroid = false;
	Zookee.CachePath = Ti.Filesystem.applicationSupportDirectory;
	Zookee.FONT = {
		TITLE_FONT:{
			fontSize:20,
			fontWeight:'bold'
		},
		PARTY_INFO_FONT:{
			fontSize:16
		},
		SEGMENT_FONT_SELECTED:{
			fontSize:20,
			fontWeight:'bold',
			fontStyle:'italic'
		},
		SEGMENT_FONT_UNSELECTED:{
			fontSize:16,
			fontWeight:'normal'
		},
		LARGE_FONT:{
			fontSize:20
		},
		LARGE_FONT_ITALIC:{
			fontSize:30,
			fontWeight:'bold',
			fontStyle:'italic',
			fontFamily:'Georgia'
		},		
		NORMAL_FONT:{
			fontSize:16
		},
		NORMAL_FONT_BOLD:{
			fontSize:16,
			fontWeight:'bold'
		},		
		NORMAL_FONT_ITALIC:{
			fontSize:16,
			fontStyle:'italic'
		},
		SMALL_FONT:{
			fontSize:12
		},
		SMALL_FONT_ITALIC:{
			fontSize:12,
			fontStyle:'italic'
		},		
        SMALL_BOLD_FONT:{
            fontSize:12,
            fontWeight:'bold'
        }		
	}
}
module.exports = Zookee;
