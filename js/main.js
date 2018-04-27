
// SourceWave class
function SourceWave(x, y, amplitude, frequency, phase) {
    this.x = x;                         //Position of the source in meters
    this.y = y;
    this.a = amplitude;                 //Amplitude of tbe source
    this.w = 2 * Math.PI * frequency;   //Pulsation of the source in radians / sec (Freq in Hz)
    this.p = phase;                     //Phase of the source

    //Method return the value of intensity of the source at an instant t
    this.s = function(t) {
        return (t >= 0.0) ? this.a * Math.sin(this.w * t + this.p) : 0.0;
    }
}

// PlanWave class
function PlaneWave(source, kx, ky) {
    this.source = source;
    this.kx     = kx;
    this.ky     = ky;
    this.s = function(x, y, t) {
        return this.source.s(t - (this.kx * (x - this.source.x) + this.ky * (y - this.source.y)) / this.source.w);
    };
}
//Physical constant
let c               = 299792458;
let n               = 1000000.0;

//Simulation sizing constants
let framesPerSecond = 60.0;
let sizeX           = 50.0;
let sizeY           = 50.0;
let dx              = 0.5;
let dy              = 0.5;
let dt              = 10.0;

//Default wave constants
let defaultAmp      = 1.0;
let defaultFreq     = 0.1;
let defaultPhase    = 0.0;

//let defaultKxEm     = n * 2 * Math.PI * defaultFreq / c;
//let defaultKyEm     = 0.0;

let defaultLambda   = sizeX / 10;
let defaultKxMecha  = 2 * Math.PI / defaultLambda;
let defaultKyMecha  = 0.0;

//Simulation variables
var sourceWave      = new SourceWave(0.0, 0.0, defaultAmp, defaultFreq, defaultPhase);
var planeWave       = new PlaneWave(sourceWave, defaultKxMecha, defaultKyMecha);
var waves           = new Array();

var t               = 0.0;



var camera, scene, renderer;

var geometry, material, plane;
var pointsMaterial, planePoints;

var controls;
var container;
var light;

init();
animate();

function init() {


    //Renderer Init
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    container = document.getElementById( 'container' );
    container.appendChild( renderer.domElement );

    //Camera & Control init
    camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 0.001, 1000 );
    camera.position.set(0, -10, 10);

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.panSpeed = 0.5;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.5;

    controls.update();
    window.addEventListener('keydown', addWave, false);

    //Scene and Geometry init
    scene = new THREE.Scene();

    geometry = new THREE.PlaneGeometry( sizeX, sizeY, sizeX / dx, sizeY / dy );
    material = new THREE.MeshBasicMaterial( {color: 0x2BC3CC, side: THREE.DoubleSide} );
    pointsMaterial = new THREE.PointsMaterial({color: 0xffffff, size : 0.5});

    planePoints = new THREE.Points( geometry, pointsMaterial);
    plane = new THREE.Mesh( geometry, material );
    scene.add( plane );
    scene.add( planePoints );

    //Light init
    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );
}

function animate() {
    requestAnimationFrame( animate );
    for(let i = 0; i < plane.geometry.vertices.length; i++) {
        if(plane.geometry.vertices[i].isVector3) {
            var intensity = 0.0;
            var amplitude = 0.0;
            var level     = 0.0;
            for(let k = 0; k < waves.length; k++) {
                intensity += waves[k].s(plane.geometry.vertices[i].x, plane.geometry.vertices[i].y, t);;
                amplitude += waves[k].source.a;
            }
            if(amplitude > Number.EPSILON) {
                level = intensity / amplitude;
                vertex = plane.geometry.vertices[i].z = level;
                plane.geometry.verticesNeedUpdate = true;
                plane.geometry.normalsNeedUpdate = true;
            }
        }
    }
    t += dt / framesPerSecond;
    controls.update();
    renderer.render( scene, camera );
}

function addWave(event) {
    if(event.keyCode == 119) {
        let x         = Math.random() * sizeX;
        let y         = Math.random() * sizeX;
        let thetaK    = Math.random() * 2 * Math.PI;
        let k         = Math.random() * defaultKxMecha;

        let newSource = new SourceWave(x, y, defaultAmp, defaultFreq, defaultPhase);

        let newWave   = new PlaneWave(newSource, k * Math.cos(thetaK), k * Math.sin(thetaK));
        waves.push(newWave);
    }
    if(event.keyCode == 114) {
        let x         = Math.random() * sizeX;
        let y         = Math.random() * sizeX;
        let amp       = Math.random() * 10 * defaultAmp;
        let freq      = Math.random() * defaultFreq;
        let phase     = Math.random() * 2 * Math.PI;
        let thetaK    = Math.random() * 2 * Math.PI;
        let k         = Math.random() * defaultKxMecha;

        let newSource = new SourceWave(x, y, amp,freq, phase);

        let newWave   = new PlaneWave(newSource, k * Math.cos(thetaK), k * Math.sin(thetaK));
        waves.push(newWave);
    }
}