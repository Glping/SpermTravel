var stats;

// ready
$(document).ready(function(){
    if( getBrowser() == 'chrome' && !isSmartDevice() ){
        $('#unSupport').hide();
        init();
    }
    else{
        $('#header').hide();
        $('#wrap').hide();
        $('#loader').hide();
        $('#footer').hide();
    }
});

var init = function(){
    // Stats
    stats = new Stats();
    //stats.setMode(1);
    stats.domElement.style.position = "fixed";
    stats.domElement.style.right    = "5px";
    stats.domElement.style.top      = "5px";
    document.body.appendChild(stats.domElement);

    var mySound = new Sound({
        file:{
            mp3:'sound/Heteroxenous_Boundaries.mp3',
            ogg:'sound/Heteroxenous_Boundaries.ogg'
        },
        complete:function(){ myAnimation.renderStart(); }
    });
    var myStage = new Stage( '#wrap' );
    var myAnimation = new Animation( mySound, myStage );
}

//********************** debug ****************************
// debug
var debug = function($obj) {
	if (window.console && window.console.log) {
		window.console.log($obj);
	}
}

////////////////////////////////////////////////////////////////
// スマートフォンの判定
window.isSmartDevice = function() {
  var ua = navigator.userAgent;
  var flag = false;

  if ((ua.indexOf('iPhone') > 0 && ua.indexOf('iPad') == -1) || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
    flag = 'smartphone';
  } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
    flag = 'tablet';
  }
  return flag;
}

/**
 *  ブラウザ名を取得
 *
 *  @return     ブラウザ名(ie6、ie7、ie8、ie9、ie10、ie11、chrome、safari、opera、firefox、unknown)
 *
 */
var getBrowser = function(){
    var ua = window.navigator.userAgent.toLowerCase();
    var ver = window.navigator.appVersion.toLowerCase();
    var name = 'unknown';

    if (ua.indexOf("msie") != -1){
        if (ver.indexOf("msie 6.") != -1){
            name = 'ie6';
        }else if (ver.indexOf("msie 7.") != -1){
            name = 'ie7';
        }else if (ver.indexOf("msie 8.") != -1){
            name = 'ie8';
        }else if (ver.indexOf("msie 9.") != -1){
            name = 'ie9';
        }else if (ver.indexOf("msie 10.") != -1){
            name = 'ie10';
        }else{
            name = 'ie';
        }
    }else if(ua.indexOf('trident/7') != -1){
        name = 'ie11';
    }else if (ua.indexOf('chrome') != -1){
        name = 'chrome';
    }else if (ua.indexOf('safari') != -1){
        name = 'safari';
    }else if (ua.indexOf('opera') != -1){
        name = 'opera';
    }else if (ua.indexOf('firefox') != -1){
        name = 'firefox';
    }
    return name;
};


/**
 *  対応ブラウザかどうか判定
 *
 *  @param  browsers    対応ブラウザ名を配列で渡す(ie6、ie7、ie8、ie9、ie10、ie11、chrome、safari、opera、firefox)
 *  @return             サポートしてるかどうかをtrue/falseで返す
 *
 */
var isSupported = function(browsers){
    var thusBrowser = getBrowser();
    for(var i=0; i<browsers.length; i++){
        if(browsers[i] == thusBrowser){
            return true;
            exit;
        }
    }
    return false;
};


//********************** prototype ****************************
// set prototype.method to Function(object)
Function.prototype.method = function(name,func){
	if( !this.prototype[name]){
		this.prototype[name] = func;
		return this;
	}
};

//********************** AnimationFrame ****************************
//set requestAnimationFrame to window (with vendor prefixes)
(function (w, r){
    w['r'+r] = w['r'+r] || w['webkitR'+r] || w['mozR'+r] || w['msR'+r] || w['oR'+r] || function(c){ w.setTimeout(c, 1000 / 60); };
})(window, 'equestAnimationFrame');
