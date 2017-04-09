var TileMapGL = require('TileMap');
var $screen = require('./screenGL');
var shaders = require('./shaders');
var gl = $screen.gl;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// TODO: have these in a helper function or a WebGL dedicaded module ???

function createGlBuffer(vertexBuffer) {
	var buffer = gl.createBuffer();

	// once a buffer binded, all buffer operations will apply to this buffer
	// ARRAY_BUFFER: vertex, ELEMENT_ARRAY_BUFFER: index data
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

	// gl.STATIC_DRAW  − Data will be specified once and used many times.
	// gl.STREAM_DRAW  − Data will be specified once and used a few times.
	// gl.DYNAMIC_DRAW − Data will be specified repeatedly and used many times.
	gl.bufferData(gl.ARRAY_BUFFER, vertexBuffer, gl.STATIC_DRAW);

	// Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, UInt32Array, Float32Array, Float64Array
	// Float32Array -> vertex data
	// Uint16Array  -> index data

	return buffer;
}

function bindBuffer(program, buffer, variableName) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

	var location = gl.getAttribLocation(program, variableName);

	// gl.vertexAttribPointer(
	// 	location, // location
	// 	size,     // Size − specifies the number of components per vertex in the buffer object
	// 	gl.FLOAT, // Type − specifies the type of data
	// 	false,    // Normalized − If true, data is normalized to [0, 1] else to [-1, 1]
	// 	stride,   // Stride − specifies the number of bytes between different vertex data elements (0 for default)
	// 	offset    // Offset − specifies the offset (in bytes) in a buffer object
	// );

	gl.enableVertexAttribArray(location);

	return location;
}



//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var FLOAT32_SIZE = 4;
var VERTEX_SIZE  = 3;

var NO = 0;
var NE = 1;
var SO = 16;
var SE = 17;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// function TileMapGL(width, height) {
// 	TileMap.call(this, width, height);

// 	this.paletteIndex    = 0.0;
// 	this.bufferLength    = 0;
// 	this.vertexBuffer    = null;
// 	this._coordLocation  = null;
// 	this._spriteLocation = null;
// }
// inherits(TileMapGL, TileMap);
// module.exports = TileMapGL;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// create vertex from map
TileMapGL.prototype.createVertex = function () {
	this.paletteIndex = 1.0;

	var vertex = [];
	for (var y = 0; y < this.height; y++) {
		for (var x = 0; x < this.width; x++) {
			var tile = this.get(x, y);
			if (!tile) continue;
			var sprite = tile.sprite;
			// TODO: flip flags
			vertex.push(x + 0); vertex.push(-y + 0); vertex.push(sprite + NO); // A
			vertex.push(x + 1); vertex.push(-y + 0); vertex.push(sprite + NE); // B
			vertex.push(x + 0); vertex.push(-y - 1); vertex.push(sprite + SO); // D

			vertex.push(x + 0); vertex.push(-y - 1); vertex.push(sprite + SO); // D -> redundant
			vertex.push(x + 1); vertex.push(-y + 0); vertex.push(sprite + NE); // B -> redundant
			vertex.push(x + 1); vertex.push(-y - 1); vertex.push(sprite + SE); // C

			// TODO: use index buffer to reduce vertex buffer size

			// TODO: save buffer index infos in the tile
		}
	}

	var vertexBuffer = new ArrayBuffer(vertex.length * FLOAT32_SIZE);
	var float32View  = new Float32Array(vertexBuffer);

	// create buffer
	for (var i = 0; i < vertex.length; i += VERTEX_SIZE) {
		float32View[i + 0] = vertex[i + 0];
		float32View[i + 1] = vertex[i + 1];
		float32View[i + 2] = vertex[i + 2]; // TODO: set as a Uint8Array
	}

	this.bufferLength = vertex.length / VERTEX_SIZE;
	this.vertexBuffer = createGlBuffer(vertexBuffer);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
TileMapGL.prototype.renderGL = function () {
	//-------------------------------------------------------------------------
	// SET PROGRAM TO USE
	var program = $screen.useProgram(shaders.tilemap);

	//-------------------------------------------------------------------------
	// BIND BUFFERS
	// TODO: bindBuffer needs to be done at each draw call only if program changed ?
	var coordLocation  = bindBuffer(program, this.vertexBuffer, 'a_coordinates');
	var spriteLocation = bindBuffer(program, this.vertexBuffer, 'a_sprite');

	gl.vertexAttribPointer(coordLocation,  2, gl.FLOAT, false, FLOAT32_SIZE * VERTEX_SIZE, 0);
	gl.vertexAttribPointer(spriteLocation, 1, gl.FLOAT, false, FLOAT32_SIZE * VERTEX_SIZE, FLOAT32_SIZE * 2);

	//-------------------------------------------------------------------------
	// BIND TEXTURES
	$screen.bindTexture(this.tilesheet || assets.tilesheet, 0); // TODO: default tilesheet

	// set shader uniform pointer to texture 
	var textureLocation = gl.getUniformLocation(shaders.tilemap, 'u_texture');
	gl.uniform1i(textureLocation, 0); // 0 is texture slot
	// this also work (samplerUniform is a shortcut for texture location)
	// gl.uniform1i(shaders.tilemap.samplerUniform, 0); // 0 is texture slot

	$screen.bindTexture(assets.palette, 1);
	var paletteLocation = gl.getUniformLocation(shaders.tilemap, 'u_palette');
	gl.uniform1i(paletteLocation, 1);

	//-------------------------------------------------------------------------
	// BIND DATA
	var palIndexLocation = gl.getUniformLocation(shaders.tilemap, 'u_palIndex');
	gl.uniform1f(palIndexLocation, this.paletteIndex);

	//-------------------------------------------------------------------------
	// DRAW CALL
	gl.drawArrays(
		gl.TRIANGLES, // mode: POINTS, LINE_STRIP, LINE_LOOP, LINES, TRIANGLE_STRIP, TRIANGLE_FAN, TRIANGLES
		0, // first − This option specifies the starting element in the enabled arrays
		this.bufferLength // count − This option specifies the number of elements to be rendered
	);

	// webGL draw with vertices AND indices
	/*
	gl.drawElements(
		enum mode,  // POINTS, LINE_STRIP, LINE_LOOP, LINES, TRIANGLE_STRIP, TRIANGLE_FAN, TRIANGLES
		long count, // This option specifies the number of elements to be rendered
		enum type,  // This option specifies the data type of the indices which must be UNSIGNED_BYTE or UNSIGNED_SHORT
		long offset // This option specifies the starting point for rendering
	);
	*/
};
