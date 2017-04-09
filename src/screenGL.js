var domUtils = require('domUtils');

var FLOAT32_SIZE = 4;
var INT16_SIZE = 2;
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// replace 2d canvas for a webGL canvas

var SCREEN_WIDTH  = settings.screen.width;
var SCREEN_HEIGHT = settings.screen.height;
var PIXEL_WIDTH   = settings.screen.pixelSize[0];
var PIXEL_HEIGHT  = settings.screen.pixelSize[1];

domUtils.removeDom($screen.canvas);
var canvas = domUtils.createDom('canvas');
canvas.width  = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;
canvas.style.width  = SCREEN_WIDTH  * PIXEL_WIDTH  + 'px';
canvas.style.height = SCREEN_HEIGHT * PIXEL_HEIGHT + 'px';

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// init webGL

var gl = canvas.getContext('webgl', { antialias: false });
gl.viewport(0, 0, canvas.width, canvas.height);

gl.enable(gl.BLEND);

// depth testing
gl.disable(gl.DEPTH_TEST);
// gl.enable(gl.DEPTH_TEST);

gl.depthMask(false);

// Near things obscure far things
// gl.depthFunc(gl.LEQUAL);

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var DUMMY_PROGRAM = null; // TODO

function createTexture(image) {
	if (image._glTexture) return image._glTexture;

	texture = gl.createTexture();

	// same as bindBuffer, once a texture is bind, all textures operations are done on this one.
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	// upload the texture to the GPU
	gl.texImage2D(
		gl.TEXTURE_2D,    // binding point (target) of the active texture
		0,                // level of detail. Level 0 is the base image level and level n is the nth mipmap reduction level
		gl.RGBA,          // internalformat specifying the color components in the texture
		gl.RGBA,          // format of the texel data. In WebGL 1, this must be the same as internalformat
		gl.UNSIGNED_BYTE, // data type of the texel data
		image             // pixels
	);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // NEAREST, LINEAR, LINEAR_MIPMAP_LINEAR, NEAREST_MIPMAP_NEAREST, NEAREST_MIPMAP_LINEAR, LINEAR_MIPMAP_NEAREST
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // CLAMP_TO_EDGE, REPEAT, MIRRORED_REPEAT
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	image._glTexture = texture;

	return texture;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
window.gl = gl; // TODO: redefine $screen

function GlScreen() {
	this.gl = gl;
	this.program  = DUMMY_PROGRAM;
	// this.textures = [];

	// for (var i = 0; i < gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS; i++) {
	// 	this.textures.push(null);
	// }
}

GlScreen.prototype.useProgram = function (program) {
	// don't call if it same program as previous draw call
	if (this.program === program) return program;

	if (this.program !== null) {
		// switch attributes

		// Gets the number of attributes in the current and new programs
		var currentAttributes = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
		var newAttributes     = gl.getProgramParameter(program,      gl.ACTIVE_ATTRIBUTES);

		// Fortunately, in OpenGL, attribute index values are always assigned in the
		// range [0, ..., NUMBER_OF_VERTEX_ATTRIBUTES - 1], so we can use that to
		// enable or disable attributes
		if (newAttributes > currentAttributes) {
			// We need to enable the missing attributes
			for (var i = currentAttributes; i < newAttributes; i++) {
				gl.enableVertexAttribArray(i);
			}
		} else if (newAttributes < currentAttributes) {
			// We need to disable the extra attributes
			for (var i = newAttributes; i < currentAttributes; i++) {
				gl.disableVertexAttribArray(i);
			}
		}
	}

	// switch program
	this.program = program;
	gl.useProgram(program);

	return program;
};

GlScreen.prototype.bindTexture = function (image, unit) {
	var texture = createTexture(image);
	// if (this.textures[unit] === texture) return;
	// this.textures[unit] = texture;

	// activate texture for our program.
	// webGL, during one draw call (drawArrays or drawElements), 
	// can handle up to gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS - 1 texture sampler
	// numbered from TEXTURE0 to TEXTURExx
	gl.activeTexture(gl.TEXTURE0 + unit); // set current slot (unit)
	gl.bindTexture(gl.TEXTURE_2D, texture);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
GlScreen.prototype.circle = function (x, y, w, h) {
	// var w = image.width;
	// var h = image.height;

	var program = require('./shaders').circle;
	this.useProgram(program);

	var itemSize = 4;

	var vertex = [
		2 * x / SCREEN_WIDTH  - 1,
		2 * y / SCREEN_HEIGHT - 1,
		0.0,
		0.0,

		2 * (x + w) / SCREEN_WIDTH  - 1,
		2 * y / SCREEN_HEIGHT - 1,
		1.0,
		0.0,

		2 * (x + w) / SCREEN_WIDTH  - 1,
		2 * (y + h) / SCREEN_HEIGHT - 1,
		1.0,
		1.0,

		2 * x / SCREEN_WIDTH  - 1,
		2 * (y + h) / SCREEN_HEIGHT - 1,
		0.0,
		1.0,
	];


	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);
	var location = gl.getAttribLocation(program, 'a_coordinates');
	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location, itemSize, gl.FLOAT, false, FLOAT32_SIZE * itemSize, 0);


	var indices = [0, 1, 3, 3, 1, 2];
	var numItems = 6;

	var indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	gl.drawElements(
		gl.TRIANGLES, //enum mode,  // POINTS, LINE_STRIP, LINE_LOOP, LINES, TRIANGLE_STRIP, TRIANGLE_FAN, TRIANGLES
		numItems, //long count, // This option specifies the number of elements to be rendered
		gl.UNSIGNED_SHORT, //enum type,  // This option specifies the data type of the indices which must be UNSIGNED_BYTE or UNSIGNED_SHORT
		0 //long offset // This option specifies the starting point for rendering
	);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
GlScreen.prototype.triangle = function () {
	var program = require('./shaders').plainColor;
	this.useProgram(program);

	var itemSize = 2;
	var numItems = 3;

	var vertex = [
		 0.0,  1.0,
		-1.0, -1.0,
		 1.0, -1.0,
	];

	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);


	var location = gl.getAttribLocation(program, 'a_coordinates');
	gl.enableVertexAttribArray(location);

	gl.vertexAttribPointer(location, itemSize, gl.FLOAT, false, FLOAT32_SIZE * itemSize, 0);

	gl.drawArrays(gl.TRIANGLES, 0, numItems);
};


module.exports = window.$screen = new GlScreen();
