(function(){

  // couple of constants
  var POS_X = 1800;
  var POS_Y = 500;
  var POS_Z = 1800;
  var WIDTH = 1000;
  var HEIGHT = 600;

  var FOV = 45;
  var NEAR = 1;
  var FAR = 4000;

  var light, sp, meshClouds;

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

  // create a basic scene and add the camera
  var scene = new THREE.Scene();
  scene.add(camera);

  // we wait until the document is loaded before loading the
  // density data.
  $(document).ready(function()  {
    // jQuery.get('data/density.csv', function(data) {
    //   addDensity(CSVToArray(data));
    // });
    addLights();
    addEarth();
    addClouds();
    render();
  });

  // simple function that converts the density data to the markers on screen
  // the height of each marker is relative to the density.
  function addDensity(data) {

    // the geometry that will contain all our cubes
    var geom = new THREE.Geometry();
    // material to use for each of our elements. Could use a set of materials to
    // add colors relative to the density. Not done here.
    var cubeMat = new THREE.MeshLambertMaterial({color: 0x000000,opacity:0.6, emissive:0xffffff});

    for (var i = 0 ; i < data.length-1 ; i++) {

      //get the data, and set the offset, we need to do this since the x,y coordinates
      //from the data aren't in the correct format
      var x = parseInt(data[i][0])+180;
      var y = parseInt((data[i][1])-84)*-1;
      var value = parseFloat(data[i][2]);

      // calculate the position where we need to start the cube
      var position = latLongToVector3(y, x, 600, 2);

      // create the cube
      var cube = new THREE.Mesh(new THREE.CubeGeometry(5,5,1+value/8,1,1,1,cubeMat));

      // position the cube correctly
      cube.position = position;
      cube.lookAt( new THREE.Vector3(0,0,0) );

      // merge with main model
      THREE.GeometryUtils.merge(geom,cube);
      // scene.add(cube);
    }

    // create a new mesh, containing all the other meshes.
    var total = new THREE.Mesh(geom,new THREE.MeshFaceMaterial());

    // and add the total mesh to the scene
    scene.add(total);
  }


  // add a simple light
  function addLights() {
    light = new THREE.DirectionalLight(0x3333ee, 3.5, 500 );
    scene.add( light );
    light.position.set(POS_X,POS_Y,POS_Z);
  }

  // add the earth
  function addEarth() {
    var spGeo = new THREE.SphereGeometry(600,50,50);
    var planetTexture = THREE.ImageUtils.loadTexture( 'images/world-big-2-grey.jpg' );
    var mat2 =  new THREE.MeshPhongMaterial( {
      map: planetTexture,
      perPixel: false,
      shininess: 0.2 } );
    sp = new THREE.Mesh(spGeo,mat2);
    scene.add(sp);
  }

  // add clouds
  function addClouds() {
    var spGeo = new THREE.SphereGeometry(600,50,50);
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
    var timer = Date.now() * 0.0001;
    camera.position.x = (Math.cos( timer ) *  1800);
    camera.position.z = (Math.sin( timer ) *  1800) ;
    camera.lookAt( scene.position );
    light.position.x = camera.position.x;
    light.position.z = camera.position.z;
    light.lookAt(scene.position);
    renderer.render( scene, camera );
    requestAnimationFrame( render );
  }
})();
