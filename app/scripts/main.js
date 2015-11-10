(function(){

  // couple of constants
  var POS_X = 1800;
  var POS_Y = 500;
  var POS_Z = 1800;
  var WIDTH = window.innerWidth;
  var HEIGHT = window.innerHeight;

  var FOV = 45;
  var NEAR = 1;
  var FAR = 4000;

  var RADIUS = 600;
  var RADIUS_ACTUAL = 6371;

  var issApi = 'https://api.wheretheiss.at/v1/satellites/25544';

  // Objects:
  var light, sp, meshClouds, iss;

  // some global variables and initialization code
  // simple basic renderer
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(WIDTH,HEIGHT);
  // renderer.setClearColorHex(0x111111);

  // add it to the target element
  var mapDiv = document.getElementById('globe');
  mapDiv.appendChild(renderer.domElement);

  // setup a camera that points to the center
  var camera = new THREE.PerspectiveCamera(FOV,WIDTH/HEIGHT,NEAR,FAR);
  camera.position.set(POS_X,POS_Y, POS_Z);
  camera.lookAt(new THREE.Vector3(0,0,0));


  var controls = new THREE.OrbitControls( camera, renderer.domElement );

  // create a basic scene and add the camera
  var scene = new THREE.Scene();
  scene.add(camera);

  // we wait until the document is loaded before loading the
  // density data.
  $(document).ready(function()  {
    addISS();
    $.get(issApi, updateISS);
    addLights();
    addEarth();
    addClouds();
    render();
    // window.setInterval(function(){
    //   $.get(issApi, function (d) {
    //     updateISS(d);
    //     // var p = getPosition(d);
    //     // camera.position.set(p.x, p.y, p.z);
    //   });

    // },2000);
  });


  // simple function that converts the density data to the markers on screen
  // the height of each marker is relative to the density.
  function addISS() {

    iss = new THREE.Mesh(
      new THREE.BoxGeometry(20,20,20),
      new THREE.MeshLambertMaterial({
        side : THREE.DoubleSide,
        color: 0x5555EE
      })
    );
    iss.overdraw = true;
    iss.castShadow = true;

    scene.add(iss);
  }



  function updateISS(data) {
    // calculate the position where we need to start the cube
    var position = getPosition(data);
    console.log(data, position);
    iss.position.set(position.x, position.y, position.z);
  }



  function getPosition(data) {
    return latLongToVector3(
      data.latitude,
      data.longitude,
      RADIUS,
      getAltitude(data.altitude)
    );
  }


  function getAltitude(alt) {
    return alt / RADIUS_ACTUAL * RADIUS;
  }



  // add a simple light
  function addLights() {
    light = new THREE.DirectionalLight(0x9C9880, 3.5, 500 );
    scene.add( light );
    light.position.set(POS_X,POS_Y,POS_Z);
  }

  // add the earth
  function addEarth() {
    var spGeo = new THREE.SphereGeometry(RADIUS,50,50);
    var planetTexture = THREE.ImageUtils.loadTexture( 'images/world-big-2-grey.jpg' );
    var mat2 =  new THREE.MeshPhongMaterial({
      map: planetTexture,
      perPixel: false,
      shininess: 0.2
    });
    sp = new THREE.Mesh(spGeo,mat2);
    scene.add(sp);
  }

  // add clouds
  function addClouds() {
    var spGeo = new THREE.SphereGeometry(RADIUS,50,50);
    var cloudsTexture = THREE.ImageUtils.loadTexture( 'images/earth_clouds_1024.png' );
    var materialClouds = new THREE.MeshPhongMaterial( { color: 0xffffff, map: cloudsTexture, transparent:true, opacity:0.3 } );

    meshClouds = new THREE.Mesh( spGeo, materialClouds );
    meshClouds.scale.set( 1.015, 1.015, 1.015 );
    scene.add( meshClouds );
  }

  // convert the positions from a lat, lon to a position on a sphere.
  function latLongToVector3(lat, lon, radius, height) {
    var phi = (lat)*Math.PI/180;
    var theta = (lon-180)*Math.PI/180;

    var x = -(radius+height) * Math.cos(phi) * Math.cos(theta);
    var y = (radius+height) * Math.sin(phi);
    var z = (radius+height) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x,y,z);
  }


  // render the scene
  function render() {
    var timer = Date.now() * 0.001;
    // camera.position.x = (Math.cos( timer ) *  1800);
    // camera.position.z = (Math.sin( timer ) *  1800) ;
    // camera.lookAt( scene.position );
    light.position.x = camera.position.x;
    light.position.z = camera.position.z;
    light.lookAt(scene.position);
    renderer.render( scene, camera );
    requestAnimationFrame( render );
  }
})();
