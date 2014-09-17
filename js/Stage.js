/**
 * @name Stage.js
 */
var Stage = function (_container){

    ///////////////////////////////////////
    // values
    var that = this;
    var stageWidth, stageHeight;
    var container = _container;
    
    ///////////////////////////////////////
    // constructor
    var constructor = function(){
        
        // document ready
        $(function(){
            // DOM container
            container = $(_container);
            // set handler
            that.setResizeHandler();
        });
    };

    ///////////////////////////////////////
    // functions
    var resize = function (e){
        stageWidth = parseInt( container.width() );
        stageHeight = parseInt( container.height() );

        debug( stageWidth + ', ' + stageHeight );
    }

    ///////////////////////////////////////
    // handler
    Stage.prototype.setResizeHandler = function(){
        resize();
        $(window).bind('resize', function(e){ resize(e); });
    }

    ///////////////////////////////////////
    // change container
    Stage.prototype.changeContainer = function( _container ){
        container = $(_container);
    }

	Stage.prototype.getStageWidth = function(){
		return stageWidth;
	}

	Stage.prototype.getStageHeight = function(){
		return stageHeight;
	}

    constructor();
};