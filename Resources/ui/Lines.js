/**
 * @author kent hao
 */
var Zookee = require('Zookee');
exports.SimpleLine = function(color){
    var line = Ti.UI.createView({
       height:1,
       width:Ti.UI.FILL,
       backgroundColor:color 
    });
    
    return line;
};

exports.LineWithSpace = function(_width,color){
	var space = (100-parseFloat(_width))/2+'%';
    var line = Ti.UI.createView({
       left:space,
       right:space,
       height:1,
       backgroundColor:color?color:Zookee.UI.COLOR.SINGLE_LINE
    });

    return line;    
};

exports.VerticalLine = function(color){
    var view = Ti.UI.createView({
        width:2,
        height:Ti.UI.FILL,
        backgroundColor:color
    });
    return view;
};
