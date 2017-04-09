var $screen = require('./screenGL');
var TileMap = require('./TileMapGL');
var shaders = require('./shaders');

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄


//-----------------------------------------------------
// ====> to change texture slot (unit) to use

// var textureSlotIndex = 6; // use texture slot 6.
// var uImageLocation = gl.getUniformLocation(program, "uImage");
// gl.uniform1i(uImageLocation, textureSlotIndex);


//-----------------------------------------------------
// ====> to set texture to a different slot

// gl.activeTexture(gl.TEXTURE6);
// gl.bindTexture(gl.TEXTURE_2D, someTexture);


// ====> this works too:

// var textureUnitIndex = 6; // use texture unit 6.
// gl.activeTexture(gl.TEXTURE0 + textureUnitIndex);
// gl.bindTexture(gl.TEXTURE_2D, someTexture);

//-----------------------------------------------------
// ====> pass texture size as an uniform named uTextureSize

// var textureSizeLocation = gl.getUniformLocation(program, "uTextureSize");
// gl.uniform2f(textureSizeLocation, image.width, image.height);

//-----------------------------------------------------
// ====> pass an array of float declared as uniform float uKernel[9];

// var kernelLocation = gl.getUniformLocation(program, "uKernel[0]");
// gl.uniform1fv(kernelLocation, [0, 0, 0, 1, 1, 1, 2, 2, 2]);


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄


// var colors = [
// 	0.0, 1.0, 1.0,
// 	1.0, 0.0, 1.0,
// 	1.0, 1.0, 0.0,
// 	0.0, 1.0, 1.0,
// 	1.0, 0.0, 1.0,
// 	1.0, 1.0, 0.0,
// ];

var map = getMap('map');
map.createVertex();


// gl.clearColor(0.4, 0.4, 0.4, 1.0);
// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// $screen.triangle();

// return;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// Update is called once per frame
exports.update = function () {
	// Clear canvas color as well as the depth buffer.
	gl.clearColor(0.4, 0.4, 0.4, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	if (btnp.A) {
		map.paletteIndex += 1 / 8;
		if (map.paletteIndex > 1) map.paletteIndex -= 1;
	}

	$screen.circle(3, 5, 120, 100);
	// $screen.triangle();

	// $screen.draw({ width: 30, height: 30 }, 0, 0);

	// Now we can tell WebGL to draw the 6 points that make up the triangles
	// webGL draw with the vertices
	map.renderGL();
};
