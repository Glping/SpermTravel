/**
 * @name Sound.js
 */
var Sound = function( _obj ){

	///////////////////////////////////////
	// buffer objects
	var i, j, k;
	var autoplay;
	var obj = _obj, context, source, gainNode, analyser, xhr, timeDomainData, decodedBuffer, loadCount = 0, total = 0, values = [], maxVol = 0.7;
	var soundDom = '#sound', onBtn = '#sound > dd > a.play', offBtn = '#sound > dd > a.stop';

	///////////////////////////////////////
	// constructor
	var constructor = function(){

		window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
		context = new AudioContext();
		source = context.createBufferSource();
		if (!context.createGain) context.createGain = context.createGainNode;
		gainNode = context.createGain();
		analyser = context.createAnalyser();

		gainNode.gain.value = maxVol; // volume
		source.connect( gainNode );
		gainNode.connect( analyser );
		analyser.connect( context.destination );
		source.loop = true; // loop flag

		timeDomainData = new Uint8Array( analyser.frequencyBinCount );

		$(function(){
			soundDom = $(soundDom);
			onBtn = $(onBtn);
			offBtn = $(offBtn);

			//
			soundDom.fadeOut();

			// loader
			loadSounds();
		});
	};

	///////////////////////////////////////
	// functions

	var loadSounds = function(){
		var oggURL, mp3URL, url, browser = getBrowser();
		for( val in obj.file ){
			debug( val + ' : ' + obj.file[val] );
			switch( val ){
				case 'mp3': mp3URL = obj.file[val]; break;
				case 'ogg': oggURL = obj.file[val]; break;
				default: break;
			}
		}

		if( browser == 'chrome' || browser == 'firefox' || browser == 'opera' ){
			url = oggURL;
		}
		else if( browser == 'safari' ){
			url = mp3URL;
		}
		else{
			url = mp3URL;
		}

		access( url );
	}

	var access = function( url, errorCallback ){
		debug('----- access -----');

		xhr = new XMLHttpRequest();
		xhr.open( 'GET', url, true );
		xhr.responseType = 'arraybuffer';
		xhr.send();

		xhr.onload = function(e) {
			context.decodeAudioData( xhr.response, function(e){ onSuccess(e); }, function(e){ onFailure(e); } );
		};

		xhr.onerror = function(e){
			debug('loadError: Missing load for Sound data.');
		}
	}

	var onSuccess = function( e ) {
		debug( 'onSuccess : ' + e );
		source.buffer = decodedBuffer = e;

		// play
		source.start(1);
    debug( source );
		if( !source.start && source.noteOn ) source.noteOn( context.currentTime );

		// complete
		loadComplete();
	}

	var onFailure = function( e ){
		debug( 'onFailure : ' + e );
	}

	var loadComplete = function(){
		var browser = getBrowser();
		if( browser == 'chrome' || browser == 'safari' || browser == 'firefox' || browser == 'opera' ){
			soundDom.fadeIn();
		}

		$('#loader').remove();

		addButtonHander();
		update();

		// callback
		if( obj && obj.complete ){
			debug( 'typeof obj.complete : ' + typeof obj.complete );
			if( typeof obj.complete == 'function' ) obj.complete();
		}
	}

	var update = function(){

		//analyser.getByteTimeDomainData( timeDomainData ); // 時間
		analyser.getByteFrequencyData( timeDomainData ); // 周波数

		total = 0;
		values = [ 0 ];

		for( i = 0; i < timeDomainData.length; i++ ){
			values[i] = parseInt( timeDomainData[i] ) / 255; // 正規化
			total += values[i];
		}

		total = total / timeDomainData.length; // 正規化

		requestAnimationFrame( update );
	}

	var addButtonHander = function(){
		onBtn.on('click', function(e){ soundPlay( onBtn, offBtn, $(this) ); return false; });
		offBtn.on('click', function(e){ soundStop( onBtn, offBtn, $(this) ); return false; });

		autoplay = cookieCheck();

		if( autoplay === 'true' || autoplay === true ){
			soundPlay( onBtn, offBtn, onBtn );
		}
		else{
			soundStop( onBtn, offBtn, offBtn );
		}
	}

	var soundPlay = function( onBtn, offBtn, $t ){
		onBtn.removeClass('on');
		offBtn.removeClass('on');
		$t.addClass('on');

		$.cookie('karesansui_autoplay', 'true', { expires: 365 });

		changeVolume( maxVol );
	}

	var soundStop = function( onBtn, offBtn, $t ){
		onBtn.removeClass('on');
		offBtn.removeClass('on');
		$t.addClass('on');

		$.cookie('karesansui_autoplay', 'false', { expires: 365 });

		changeVolume( 0 );
	}

	var changeVolume = function( vol ){
		gainNode.gain.value = vol;
	}

	// cookie
	var cookieCheck = function(){
		var c = $.cookie('karesansui_autoplay');
		debug( 'c = ' + c );

		if( c === undefined ){
			debug('  undefined');
			c = true;
			$.cookie('karesansui_autoplay', c, { expires: 365 });
		}
		return c;
	}

	///////////////////////////////////////
	// getter
	Sound.prototype.getTotalFFT = function(){
		return total;
	};
	Sound.prototype.getFFT = function(){
		return values;
	};

	///////////////////////////////////////
	// setter
	Sound.prototype.set = function( val ){
		_ = val;
	};


	constructor();
};


/*!
 * jQuery Cookie Plugin v1.4.0
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as anonymous module.
		define(['jquery'], factory);
	} else {
		// Browser globals.
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));
