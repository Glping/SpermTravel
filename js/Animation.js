/**
 * @name Animation.js
 */
var Animation = function( _Sound, _Stage ){

	///////////////////////////////////////
	var xNum = 50, yNum = 50;

	// values
	var SoundControler = _Sound;
	var StageSetup = _Stage;

	var renderer, scene, camera, canvas, ctx;
	var container = '#wrap', fsBtn = '#fsbtn', cameraBtnAuto = '#camera > dd > a.auto', cameraBtnManual = '#camera > dd > a.manual';

	var values = [], total = 0, fftLength = 10;

	var mousePos = {x:0,y:0}, cameraPos = {x:0,y:0,z:0,dx:0,dy:0,dz:0};
	var dDistance = 600, dRotX = 0, dRotY = 0;
	var cUpdateID;

	var cameraMode = true;
	var debugMode = false;

	var defaultCamera = 'auto'; // auto, manual
	var ch, gh;
	var range = 400;

	var radius = 300;
	var radiusInner = 220;
	var heightSegments = 98;
	var widthSegments = 98;

	var sphere;
	var sphereLine;
	var sphereInner;

	var spermLength = 50;
	var sperms = [];
	var sDistance = [];
	var maxSpeed = 5;
	var tailSize = 10;
	var tailSin = 0;

	var eggRot = 0;

	var box;

	var hblur, vblur, composer;



	///////////////////////////////////////
	// constructor
	var constructor = function(){
		$(function(){
			threeSetup();
            setResizeHandler();
		});
	};

	var threeSetup = function(){
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1500 );

		debug( window.WebGLRenderingContext );

		if ( window.WebGLRenderingContext && getBrowser() != 'safari' ){
			renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
		}
		else{
			renderer = new THREE.CanvasRenderer();
			xNum = 50;
			yNum = 50;
		}

		renderer.setClearColorHex( 0x000000, 1.0 );
		renderer.setSize( window.innerWidth, window.innerHeight );
		$(container)[0].appendChild( renderer.domElement );
		canvas = $(container + ' > canvas');
		ctx = ( canvas[0].getContext )? canvas[0].getContext('2d') : 'undefined' ;

		setupEgg();
		setupSperm();
		setupBox();

		//setupLight();

		setupAtmos();

		debug( scene );

		setupFullScreen();
		setupCameraBtn();

		//renderStart();
	}

	var setupEgg = function(){
		// sphere
		//
    var map = THREE.ImageUtils.loadTexture('img/particle.png');
		var material = new THREE.ParticleSystemMaterial( { color: 0xff3333, size: 1, map:map } );
		//var material = new THREE.MeshLambertMaterial( { color: 0xff3333, transparent:true, opacity: 0.5, blending:THREE.NormalBlending } );
		var geometry = new THREE.Geometry();
		geometry.verticesBase = [];
		sphere = new THREE.ParticleSystem( geometry, material );

		scene.add( sphere );

		// spereLine
		var lMaterial = new THREE.LineBasicMaterial({ color: 0xff9999 });
		var lGeometry = new THREE.Geometry();
		sphereLine = new THREE.Line( lGeometry, lMaterial, THREE.LineStrip );
		scene.add( sphereLine );

		// sphereInner
		var materialInner = new THREE.ParticleSystemMaterial( { vertexColors: THREE.VertexColors, size: 1, map:map } );
		//var materialInner = new THREE.MeshLambertMaterial( { vertexColors: THREE.VertexColors, transparent:true, opacity: 1, blending:THREE.NormalBlending } );
		var geometryInner = new THREE.SphereGeometry( radiusInner, 32, 32 );
		geometryInner.colors = [];
		var glLength = geometryInner.vertices.length;
		for( var i = 0; i < glLength; i++ ){
			var color = new THREE.Color(0x000000);
			color.r = 1;
			color.g = 1 * ( i / glLength );
			color.b = 1 * Math.random() * 1;
			geometryInner.colors.push( color );
		}
		debug( geometryInner );
		sphereInner = new THREE.ParticleSystem( geometryInner, materialInner );
		//sphereInner = new THREE.Mesh( geometryInner, materialInner );
		scene.add( sphereInner );
	}

	var setupSperm = function(){

		// add object
		sperms = new THREE.Object3D();
		scene.add( sperms );

		//var geometry = new THREE.SpermGeometry();
		var geometry = new THREE.Geometry();
		var gHead = new THREE.SphereGeometry( 7, 8, 8 );
		var gBody = new THREE.CylinderGeometry( 4, 2, 10 );

		var mHead = new THREE.Matrix4();
		mHead.makeTranslation( 0, 10, 0 );
		gHead.applyMatrix( mHead );

		THREE.GeometryUtils.merge( geometry, gHead );
		THREE.GeometryUtils.merge( geometry, gBody );

		var matrix = new THREE.Matrix4();
		matrix.makeRotationX( Math.PI / 2 );
		geometry.applyMatrix( matrix );

		for( var i = 0; i < spermLength; i++ ){

			var tailGeometry = new THREE.Geometry();
			tailGeometry.verticesNeedUpdate = true;
			var tailVert = tailGeometry.vertices;
			tailVert = [];

			tailVert.push( new THREE.Vector3( 0, 0, 0 ) );
			tailVert.push( new THREE.Vector3( 10, -10, -50 ) );
			tailVert.push( new THREE.Vector3( -10, 10, -100 ) );
			tailVert.push( new THREE.Vector3( 0, 0, -150 ) );
			tailGeometry.vertices = tailVert;

			var tailMaterial = new THREE.LineBasicMaterial( { color: 0xffffff } );
			var tail = new THREE.Line( tailGeometry, tailMaterial, THREE.LineStrip );
			tail.position.z = -20;
			tail.name = 'tail';
			tail.rad = Math.floor( Math.random() * 18 ) * 10;

			var material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } );
			var sBody = new THREE.Mesh( geometry, material );
			//var sBody = new THREE.ParticleSystem( geometry, material );
			sBody.position.z = -20;
			sBody.name = 'body';

			var sperm = new THREE.Object3D();
			scene.add( sperm );
			sperm.add( sBody );
			sperm.add( tail );

			var posi = Math.round( Math.random() * 1 );
			posi = posi ? 1 : -1;

			var x = ( Math.round( Math.random() * 100 ) + ( radius / 2 ) ) * posi;
			var y = ( Math.round( Math.random() * 100 ) + ( radius / 2 ) ) * posi;
			var z = 0;
			sperm.position = new THREE.Vector3( x, y, z );

			var speedX = Math.round( Math.random() * 3 ) + 1;
			var speedY = Math.round( Math.random() * 3 ) + 1;
			var speedZ = Math.round( Math.random() * 3 ) + 1;
			sperm.speed = new THREE.Vector3();
			sperm.speed.x = speedX + 1;
			sperm.speed.y = speedY + 2;
			sperm.speed.z = speedZ + 3;

			sperms.add( sperm );
		}

		debug( sperms );
	}

	var setupBox = function(){
		var material = new THREE.MeshBasicMaterial({ color:0xff3333, wireframe:true });
		var geometry = new THREE.CubeGeometry( 100, 100, 100 );
		geometry.dynamic = true;
		box = new THREE.Mesh( geometry, material );
		scene.add( box );

		box.visible = false;

		debug( box );
	}

	var setupLight = function(){

		var alight = new THREE.DirectionalLight( 0xffffff, 1.8 );
		alight.position.set( 1, 1, 1 ).normalize();
		scene.add( alight );

		var light = new THREE.DirectionalLight( 0xffffff, 0.8 );
		light.position.set( 0, 1, 0 ).normalize();
		scene.add( light );

		var lh = new THREE.DirectionalLightHelper( light, 700 );
		scene.add( lh );

		var alh = new THREE.DirectionalLightHelper( alight, 700 );
		scene.add( alh );

		var fog = new THREE.FogExp2( 0x000000, 0.00025 );
		scene.fog = fog;
	}

	var setupAtmos = function(){
	}

	var setupFullScreen = function(){
		fsBtn = $(fsBtn);
		if( fsBtn.size() ){
			fsBtn.bind('click', function(){ setFullScreen(); });
		}
	}

	var setFullScreen = function(){

		var c = $('html')[0];
		if( c.webkitRequestFullScreen ) {
			 c.webkitRequestFullScreen();
		}
		else if( c.mozRequestFullScreen ) {
			c.mozRequestFullScreen();
		}
		else {
			debug('requestFullScreen not found.');
		}
	}

	var setupCameraBtn = function(){
		cameraBtnAuto = $(cameraBtnAuto);
		cameraBtnManual = $(cameraBtnManual);
		if( cameraBtnAuto.size() && cameraBtnManual.size() ){
			cameraBtnAuto.bind('click', function(e){ changeCameraBtn(e,$(this),cameraBtnAuto,cameraBtnManual,'auto'); });
			cameraBtnManual.bind('click', function(e){ changeCameraBtn(e,$(this),cameraBtnAuto,cameraBtnManual,'manual'); });

			if( defaultCamera == 'auto' ){
				changeCameraBtn(null,cameraBtnAuto,cameraBtnAuto,cameraBtnManual,defaultCamera);
			}
			else{
				changeCameraBtn(null,cameraBtnManual,cameraBtnAuto,cameraBtnManual,defaultCamera);
			}
		}
	}

	var changeCameraBtn = function(e,$t,$a,$m,mode){
		$a.removeClass('on');
		$m.removeClass('on');
		$t.addClass('on');
		cameraMode = mode;
		return false;
	}

	var setupKeydown = function(){
		$(window).bind('keydown', function(e){ keydownHandler(e); });
	}

	var keydownHandler = function(e){
		var key = e.keyCode;
		debug( key );
		if( key == 32 ){
			debugMode = ( debugMode )? false : true;
			updateDebugMode();
		}
		return false;
	}

	var updateDebugMode = function(){

		if( debugMode ){
			ch.visible = true;
			gh.visible = true;
		}
		else{
			ch.visible = false;
			gh.visible = false;
		}
	}

	Animation.prototype.renderStart = function(){

		ch = new THREE.CameraHelper(camera);
		gh = new THREE.GridHelper( 1000, 100 );
		scene.add( ch );
		scene.add( gh );

		updateDebugMode();

		// kerydown setup
		setupKeydown();

		// event
		$(window).bind( 'mousemove', mousemove );
		render();
		cameraAutoUpdate();
	}

	var mousemove = function(e){
		mousePos.x = e.clientX / StageSetup.getStageWidth() * 2 - 1;
		mousePos.y = e.clientY / StageSetup.getStageHeight() * 2 - 1;
	}

	var setResizeHandler = function(){
        resize();
        $(window).bind('resize', function(e){ resize(e); });
	}

	var resize = function (e){
        if( camera ){
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize( window.innerWidth, window.innerHeight );
        }
    }

	var cameraAutoUpdate = function(){
		var pam = Math.round(Math.random()*1)-1;
		if( !pam ) pam += 1;

		camera.dx = Math.random() * pam * 0.3;
		camera.dy = Math.random() * pam * 0.3;
		camera.dz = Math.random() * pam * 0.3;
		cameraPos.x = Math.random() * range - range/2;
		cameraPos.y = Math.random() * range - range/2;
		cameraPos.z = Math.random() * range - range/2;

		cUpdateID = setTimeout( function(){ cameraAutoUpdate(); }, 7000 );
	}


	var counter = 0;
	///////////////////////////////////////
	// render
	var render = function() {
		var rotX, rotY;

		// update FFT
		if( counter % 1 == 0 ){
			total = SoundControler.getTotalFFT();
			values.unshift( SoundControler.getFFT() );
			values = values.slice( 0, fftLength );
		}
		counter++;

		var sw = 800;//StageSetup.getStageWidth();
		var sh = 800;//StageSetup.getStageHeight();
		var dp = 800;

		//if( counter < 1000 ) debug( values );

		updateEgg( values, total );
		updateSperms( sw, sh, dp, total );
		updateBox( sw, sh, dp );
		updateCamera();

		requestAnimationFrame( render );

		stats.update();
	}

	var updateEgg = function( values, total ){

		var flag = false;
		var fft = total * 100;
		var segLength = heightSegments * widthSegments;
		var vLength = values.length;
		sphere.geometry.vertices = [];

		//debug( fft );
		var r = radius;// + fft;
		var count = 0;

    for( var y = 0; y <= heightSegments; y++ ) {

			for( var x = 0; x <= widthSegments; x++ ) {

				var f = ( typeof values[0][count] == 'number' )? values[0][count] * 100 : 0 ;
				var rr = Math.round( r );
				var u = x / widthSegments;
				var v = y / heightSegments;

				var vertex = new THREE.Vector3();
				vertex.x = - ( rr + f ) * Math.cos( u * Math.PI * 2 ) * Math.sin( v * Math.PI );
				vertex.y = ( rr + f ) * Math.cos( v * Math.PI );
				vertex.z = ( rr + f ) * Math.sin( u * Math.PI * 2 ) * Math.sin( v * Math.PI );

				sphere.geometry.vertices.push( vertex );

				count++
				if( count >= vLength ) count = 0;
			}
    }
		sphere.geometry.verticesBase = sphere.geometry.vertices.clone();
		sphere.geometry.verticesNeedUpdate = true;

		// size
		sphere.material.size = Math.round( total * 10 );

	}

	var updateSperms = function( sw, sh, dp, total ){

		updateSpermDistance();

		var fft = total * 100 + 40;
		var swH = sw / 2;
		var shH = sh / 2;
		var dpH = dp / 2;

		//if( counter == 100 ) debug( sDistance );
		var len = sperms.children.length;

		for( var i = 0; i < len; i++ ){

			var spermA = sperms.children[i];
			var sAp = spermA.position;
			var sAs = spermA.speed;

			var b = i * len;
			var nearVec = new THREE.Vector3( 0, 0, 0 );
			var farVec = new THREE.Vector3( 0, 0, 0 );
			var midVec = new THREE.Vector3( 0, 0, 0 );
			var nearCount = 0;
			var farCount = 0;
			var midCount = 0;

			for( var j = 0; j < len; j++ ){

				if(  i != j ){
					var spermB = sperms.children[j];
					var sBp = spermB.position;
					var sBs = spermB.speed;
					var d = new THREE.Vector3( 0, 0, 0 );
					var dis = sDistance[ b + j ];

					if( counter == 100 ){
						//debug( 'i: ' + i + ', j: ' + j + ', dis: ' + dis );
					}

					if( dis < 10 ){

						//d = sAp.sub( sBp );
						d.x = Math.round( sAp.x - sBp.x );
						d.y = Math.round( sAp.y - sBp.y );
						d.z = Math.round( sAp.z - sBp.z );
						//d.divideScalar( 1 );
						d = normalize3( d, 1 );
						nearVec.add( d );
						nearCount++;

						if( counter == 100 ){
							//debug( '  sAp.x: ' + sAp.x + ', sBp.x: ' + sBp.x + ', d.x: ' + d.x + ', nearVec.x: ' + nearVec.x );
							//debug( '  sAp.y: ' + sAp.y + ', sBp.y: ' + sBp.y + ', d.y: ' + d.y + ', nearVec.y: ' + nearVec.y );
							//debug( '  sAp.z: ' + sAp.z + ', sBp.z: ' + sBp.z + ', d.z: ' + d.z + ', nearVec.z: ' + nearVec.z );
						}
					}
					else if( dis > 300 ){

						//d = sAp.sub( sBp );
						d.x = Math.round( sAp.x - sBp.x );
						d.y = Math.round( sAp.y - sBp.y );
						d.z = Math.round( sAp.z - sBp.z );
						//d.divideScalar( 1 );
						d = normalize3( d, 1 );
						farVec.add( d );
						farCount++;

						if( counter == 100 ){
							//debug( '  sAp.x: ' + sAp.x + ', sBp.x: ' + sBp.x + ', d.x: ' + d.x + ', farVec.x: ' + farVec.x );
							//debug( '  sAp.y: ' + sAp.y + ', sBp.y: ' + sBp.y + ', d.y: ' + d.y + ', farVec.y: ' + farVec.y );
							//debug( '  sAp.z: ' + sAp.z + ', sBp.z: ' + sBp.z + ', d.z: ' + d.z + ', farVec.z: ' + farVec.z );
						}
					}
					else{
						d.x = Math.round( sAp.x - sBp.x );
						d.y = Math.round( sAp.y - sBp.y );
						d.z = Math.round( sAp.z - sBp.z );
						d = normalize3( d, 1 );
						midVec.add( d );
						midCount++;
					}
				}
			}
			if( nearCount ){
				sAs.x += nearVec.x / nearCount;
				sAs.y += nearVec.y / nearCount;
				sAs.z += nearVec.z / nearCount;

				if( counter == 300 ){
					//debug( 'i: ' + i + ', j: ' + j + ', nearCount: ' + nearCount + ', sAs.x: ' + sAs.x + ', sAs.y: ' + sAs.y + ', sAs.z: ' + sAs.z  );
					//debug( 'i: ' + i + ', j: ' + j + ', nearCount: ' + nearCount + ', nearVec.x: ' + nearVec.x + ', nearVec.y: ' + nearVec.y + ', nearVec.z: ' + nearVec.z  );
				}
			}
			if( farCount ){
				sAs.x -= farVec.x / farCount;
				sAs.y -= farVec.y / farCount;
				sAs.z -= farVec.z / farCount;

				if( counter == 100 ){
					//debug( 'i: ' + i + ', j: ' + j + ', farCount: ' + farCount + ', sAs.x: ' + sAs.x + ', sAs.y: ' + sAs.y + ', sAs.z: ' + sAs.z  );
					//debug( 'i: ' + i + ', j: ' + j + ', farCount: ' + farCount + ', farVec.x: ' + farVec.x + ', farVec.y: ' + farVec.y + ', farVec.z: ' + farVec.z  );
				}
			}
			if( midCount ){
				sAs.x += midVec.x / midCount;
				sAs.y += midVec.y / midCount;
				sAs.z += midVec.z / midCount;
			}

			if( counter < 300 ){
				if( i == 0 ) ;//debug( sphere.position );
				if( i == 0 ) ;//debug( radius + ' : ' + sAp.distanceTo( sphere.position ) + ', ' + spermA.material.opacity );
			}

			if( radius + fft > sAp.distanceTo( sphere.position ) ){
				/*
				sAs.x *= -1;
				sAs.y *= -1;
				sAs.z *= -1;
				*/
				//spermA.material.color = new THREE.Color(0x0000ff);
			}
			else{
				//spermA.material.color = new THREE.Color(0x000066);
			}

			if( sAs.length() > maxSpeed ){
				if( counter == 200 ){
					//debug( sAs.length() );
					//debug( sAs );
				}

				//sAs.x = sAs.x * ( 1 / maxSpeed );
				//sAs.y = sAs.y * ( 1 / maxSpeed );
				//sAs.z = sAs.z * ( 1 / maxSpeed );

				//sAs.divideScalar( maxSpeed );
				sAs = sAs.normalize( maxSpeed );

				if( counter == 200 ){
					//debug( sAs );
				}

				if( counter < 300 ){
					if( i == 0 ) ;//debug( '  ' + sAs.length() );
				}

			}

			var nx = sAp.x + sAs.x;
			var ny = sAp.y + sAs.y;
			var nz = sAp.z + sAs.z;

			if( nx < -swH ){
				nx = -swH;
				sAs.x *= -1;
			}
			else if( nx > swH ){
				nx = swH;
				sAs.x *= -1;
			}

			if( ny < -shH ){
				ny = -shH;
				sAs.y *= -1;
			}
			else if( ny > shH ){
				ny = shH;
				sAs.y *= -1;
			}

			if( nz < -dpH ){
				nz = -dpH;
				sAs.z *= -1;
			}
			else if( nz > dpH ){
				nz = dpH;
				sAs.z *= -1;
			}

			sAp.x = nx;
			sAp.y = ny;
			sAp.z = nz;

			spermA.lookAt( scene.position );

			//if( counter < 10 ) debug( sperm ); debug( i + ' : ' + p.x +', '+ p.y +', '+ p.z );


			// tail update
			var tail = spermA.children[1];
			var tailVert = tail.geometry.vertices;
			tail.geometry.verticesNeedUpdate = true;

			tailVert = [];
			tailVert.push( new THREE.Vector3( 0, 0, 0 ) );

			for( var j = 0; j < tailSize; j++ ){
				var rad = tail.rad * 5;
				var width = ( j < tailSize / 2 )? j : tailSize - j;
				//var width = j;
				width *= 2.5;
				var x = Math.sin( rad / 180 * Math.PI ) * width;
				var y = -Math.sin( rad / 180 * Math.PI ) * width;
				var z = -j * 10;
				tailVert.push( new THREE.Vector3( x, y, z ) );
				tail.rad += 10;//Math.round( Math.random() * 5 ) + 3;

				if( tail.rad > 360 ) tail.rad = 0;
			}

			tail.geometry.vertices = tailVert;

			//

			if( counter < 50 ){
				//if( i == 0 ) debug( tail.geometry );
			}

		}
	}

	var updateSpermDistance = function(){

		for(var i = 0, len = sperms.children.length; i < len; ++i ){
			var spermA = sperms.children[i];
			var sAp = spermA.position;

			for( var j = i + 1; j < len; ++j ){

				var spermB = sperms.children[j];
				var sBp = spermB.position;

				var dx = sBp.x - sAp.x;
				var dy = sBp.y - sAp.y;
				var dz = sBp.z - sAp.z;
				var d = Math.sqrt( dx * dx + dy * dy + dz * dz );

				sDistance[i + j * len] = d;
				sDistance[i * len + j] = d;

				if( counter == 100 ){
					//debug( dx + ', ' + dy + ', ' + dz );
				}
			}

		}

	}

	var updateBox = function( sw, sh, dp ){

		box.scale.x = sw / 100;
		box.scale.y = sh / 100;
		box.scale.z = dp / 100;

	}

	var updateCamera = function(){
		if( cameraMode == 'auto' ){
			cameraPos.x += camera.dx;
			cameraPos.y += camera.dy;
			cameraPos.z += camera.dz;
			camera.position.x = cameraPos.x;
			camera.position.y = cameraPos.y;
			camera.position.z = cameraPos.z;
		}
		else if( cameraMode == 'manual' ){
			// manual camera
			rotX = mousePos.x * 180;
			rotY = mousePos.y * 90;
			dRotX += ( rotX - dRotX ) * 0.05;
			dRotY += ( rotY - dRotY ) * 0.05;

			// camera update
			camera.position.x = dDistance * Math.sin( dRotX * Math.PI / 180 );
			camera.position.y = dDistance * Math.sin( dRotY * Math.PI / 180 );
			camera.position.z = dDistance * Math.cos( dRotX * Math.PI / 180 );
		}
		camera.lookAt( scene.position );
		renderer.render( scene, camera );
		//debug( camera.position.x+', '+camera.position.y+', '+camera.position.z );
	}

	var rgbToHex = function( R, G, B ){
		return toHex(R) + toHex(G) + toHex(B);
	}

	var toHex = function( n ) {
		n = parseInt(n,10);
		if (isNaN(n)) return "00";
		n = Math.max(0,Math.min(n,255));
		return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
	}

	///////////////////////////////////////
	// getter
	Animation.prototype.get = function(){
		return _;
	};

	///////////////////////////////////////
	// setter
	Animation.prototype.setTotalFFT = function( val ){
		total = val;
	};

	Animation.prototype.setFFT = function( val ){
		values = val;
	};

	constructor();
};



THREE.SpermGeometry = function(){

	THREE.Geometry.call( this );

	var r = 6;
	var hSegments = 16;
	var wSegments = 16;

	var verts = this.vertices;
	var faces = this.faces;
	var uvs = this.faceVertexUvs[ 0 ];

	var fi = 0;
	var count = 0;

	for (var f = 0; f < 1; f++ ) {

		verts.push(
			new THREE.Vector3( 0, 0, -20 ),
			new THREE.Vector3( 0, 4, -20 ),
			new THREE.Vector3( 0, 0, 30 )
		);

		faces.push(new THREE.Face3(
			fi++,
			fi++,
			fi++
		));

		uvs.push([
			new THREE.Vector2( 0, 0 ),
			new THREE.Vector2( 0, 1 ),
			new THREE.Vector2( 1, 1 )
		]);
	}


	debug( verts );
	debug( faces );
	debug( uvs );

	this.applyMatrix( new THREE.Matrix4().makeScale( 0.2, 0.2, 0.2 ) );

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();
}
THREE.SpermGeometry.prototype = Object.create( THREE.Geometry.prototype );


var normalize = function(point, scale) {
  var norm = Math.sqrt(point.x * point.x + point.y * point.y);
  if (norm != 0) { // as3 return 0,0 for a point of zero length
    point.x = scale * point.x / norm;
    point.y = scale * point.y / norm;
  }
}

var normalize3 = function( p, scale ) {
	var norm = Math.sqrt( p.x * p.x + p.y * p.y + p.z * p.z );
	if (norm != 0) { // as3 return 0,0 for a point of zero length
		p.x = scale * p.x / norm;
		p.y = scale * p.y / norm;
		p.z = scale * p.z / norm;
	}
	return p;
}

var pointLength3 = function( p ){
    return Math.sqrt( p.x * p.x + p.y * p.y + p.z * p.z );
};

Array.prototype.clone = function() {
	//debug( this[0] );
	if( this[0].constructor == Array ) {
		var ar, n;
		ar = new Array( this.length );

		for ( n = 0; n < ar.length; n++ ) {
			ar[n] = this[n].clone();
		}

		return ar;
	}
	return Array.apply( null, this );
}