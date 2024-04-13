//global variables
let gl;
let canvas;
let a_Position;
let u_FragColor;
let u_size;

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = canvas.getContext("webgl" , {preserveDrawingBuffer: true});
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }


}

//constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const STAR = 3;
let g_selectedColor = [1.0, 0.0, 0.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_segmentCount = 10;
let g_starPointCount = 4;
var g_shapeList = [];


function addActionsForAllHtmlUI(){

    document.getElementById('clearButton').onclick = function() {g_shapeList = []; renderAllShapes(); };
    document.getElementById('squareButton').onclick = function() {g_selectedType = POINT};
    document.getElementById('triangleButton').onclick = function() {g_selectedType = TRIANGLE};
    document.getElementById('circleButton').onclick = function() {g_selectedType =  CIRCLE};
    document.getElementById('starButton').onclick = function() {g_selectedType =  STAR};
    document.getElementById('drawButton').onclick = function() {g_shapeList = []; drawMyPicture()};
    document.getElementById('redSlider').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlider').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlider').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100; });

    document.getElementById('sizeSlider').addEventListener('mouseup', function() {g_selectedSize = this.value; });
    document.getElementById('segmentSlider').addEventListener('mouseup', function() {g_segmentCount = this.value; });
    document.getElementById('starSlider').addEventListener('mouseup', function() {g_starPointCount = this.value; });
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForAllHtmlUI();
    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if (ev.buttons == 1) {click(ev) }};

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}





//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];
function convertCordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return ([x,y]);

}

function renderAllShapes(){
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapeList.length;
    for(var i = 0; i < len; i++) {
        g_shapeList[i].render();
    }
}

function click(ev) {

    let [x,y] = convertCordinatesEventToGL(ev);

    var point;
    if (g_selectedType == POINT){
        point = new Point();
    }
    else if ( g_selectedType == CIRCLE){
        point = new Circle();
        point.segments = g_segmentCount;
    }
    else if(g_selectedType == TRIANGLE){
        point = new Triangle();
    }
    else{
        point = new Star();
        point.segments = g_starPointCount;
    }
    point.position = [x,y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapeList.push(point);
    renderAllShapes();
}

function drawMyPicture(){
    // the sun
    drawColorTriangles([-1,1, -0.8, 0.8, -0.8,1], [1.0, 1.0, 0.0, 1.0]);
    drawColorTriangles([-1,1, -1, 0.8, -0.8,0.8], [1.0, 1.0, 0.0, 1.0]);

    //space right of sun
    drawColorTriangles([-0.8, 1, -0.8, 0.8, 1,0.8 ], [0.0, 0.0, 0.0, 1.0] );
    drawColorTriangles([-0.8, 1, 1, 0.8, 1,1 ], [0.0, 0.0, 0.0, 1.0] );

    //space below sun to middle
    drawColorTriangles([-1, 0.8, -1,0  , 1,0.8  ], [0.0, 0.0, 0.0, 1.0] );
    drawColorTriangles([-1,0,  1,0, 1,0.8  ], [0.0, 0.0, 0.0, 1.0] );

    //star attempt
    drawColorTriangles([-0.25, 0.2, -0.15, 0.2, -0.2 ,0.32  ], [1.0, 1.0, 1.0, 1.0] );
    drawColorTriangles([-0.25, 0.28, -0.15, 0.28, -0.2 ,0.15  ], [1.0, 1.0, 1.0, 1.0] );

    // now I can translate stars
    drawColorTriangles([-0.75, 0.5, -0.65, 0.5, -0.7 ,0.62  ], [1.0, 1.0, 1.0, 1.0] );
    drawColorTriangles([-0.75, 0.58, -0.65, 0.58, -0.7 ,0.45  ], [1.0, 1.0, 1.0, 1.0] );

    drawColorTriangles([0.55, 0.8, 0.65, 0.8, 0.6 ,0.92  ], [1.0, 1.0, 1.0, 1.0] );
    drawColorTriangles([0.55, 0.88, 0.65, 0.88, 0.6 ,0.75  ], [1.0, 1.0, 1.0, 1.0] );


    //draw rest of space back ground
    drawColorTriangles([-1,0,  1,0, 1, -1  ], [0.0, 0.0, 0.0, 1.0] );
    drawColorTriangles([-1,0,  -1,-1, 1, -1  ], [0.0, 0.0, 0.0, 1.0] );
    //base of mars
    drawColorTriangles([-1,-1, 1, -1, 1, -0.9], [1.0, 0.0, 0.0, 1.0]);
    drawColorTriangles([-1,-1, -1, -0.9, 1, -0.9], [1.0, 0.0, 0.0, 1.0]);

    //next layer of mars
    drawColorTriangles([-0.84,-0.9, 0.84, -0.9, 0.84, -0.8], [1.0, 0.0, 0.0, 1.0]);
    drawColorTriangles([-0.84,-0.9, -0.84, -0.8, 0.84, -0.8], [1.0, 0.0, 0.0, 1.0]);

    //next layer of mars
    drawColorTriangles([-0.7,-0.8, 0.7, -0.8, 0.7, -0.75], [1.0, 0.0, 0.0, 1.0]);
    drawColorTriangles([-0.7, -0.8, -0.7, -0.75, 0.7, -0.75], [1.0, 0.0, 0.0, 1.0]);

    //draw crater
    drawColorTriangles([0.3 ,-0.78,  0.4, -0.78, 0.4, -0.88], [1.0, 0.4, 0.0, 1.0]);
    drawColorTriangles([0.3 ,-0.78,  0.3, -0.88, 0.4, -0.88], [1.0, 0.4, 0.0, 1.0]);

    //draw slug tail
    drawColorTriangles([0.24 ,-0.78,  0.24, -0.70, 0.28, -0.70], [0.04, 1.0, 0.013, 1.0]);

    //draw body
    drawColorTriangles([0.0 ,-0.78,  0.24, -0.78, 0.24, -0.70], [0.04, 1.0, 0.013, 1.0]);
    drawColorTriangles([0.0 ,-0.78,  0.0, -0.70, 0.24, -0.70], [0.04, 1.0, 0.013, 1.0]);

    // draw head
    drawColorTriangles([-0.1 ,-0.62,  0.0, -0.62, 0.0, -0.70], [0.04, 1.0, 0.013, 1.0]);
    drawColorTriangles([-0.1 ,-0.62,  -0.1, -0.70, 0.0, -0.70], [0.04, 1.0, 0.013, 1.0]);

    // draw attena
    drawColorTriangles([-0.08 ,-0.62,  -0.1, -0.62, -0.1, -0.5], [0.04, 1.0, 0.013, 1.0]);
    drawColorTriangles([-0.02 ,-0.62,  0.0, -0.62, 0.0, -0.5], [0.04, 1.0, 0.013, 1.0]);






}