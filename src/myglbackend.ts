import Backend from "rot-js/lib/display/backend.js";
import { DisplayOptions, DisplayData } from "rot-js/lib/display/types.js";
import * as Color from "rot-js/lib/color.js";
import * as WebGLDebug from "webgl-debug";

/**
 * @class Tile backend
 * @private
 */
 export default class MyDisplay extends Backend {
	_gl!: WebGLRenderingContext;
	_program!: WebGLProgram;
	_uniforms: {[key:string]: WebGLUniformLocation | null};
	_t: number;

	static isSupported() {
		return !!document.createElement("canvas").getContext("webgl2", {preserveDrawingBuffer:true});
	}

	throwOnGLError(err, funcName, args) {
		throw WebGLDebug.WebGLDebugUtils.glEnumToString(err) 
		+ "was caused by call to " 
		+ funcName;
	 };

	constructor() {
		super();
		this._uniforms = {};
		this._t = 0;
		try {
			this._gl = this._initWebGL();
		} catch (e: unknown) {
			if (typeof e === "string") {
				alert(e);
			} else if (e instanceof Error) {
				alert(e.message);
			}
		}
	}

	schedule(cb: () => void) { requestAnimationFrame(cb); }
	getContainer() { return this._gl.canvas as HTMLCanvasElement; }

	setOptions(opts: DisplayOptions) {
		super.setOptions(opts);

		this._updateSize();

		let tileSet = this._options.tileSet;
		if (tileSet && "complete" in tileSet && !tileSet.complete) {
			tileSet.addEventListener("load", () => this._updateTexture(tileSet as HTMLImageElement));
		} else {
			this._updateTexture(tileSet as HTMLImageElement);
		}
	}

	new_draw(data: DisplayData, player_pos:[number, number], t: number, clearBefore: boolean) {
        // console.log("draw in mydisplay");
		const gl = this._gl;
		const opts = this._options;
		let [x, y, ch, fg, bg] = data;
		let [player_x, player_y] = player_pos;

		// console.log("drawing %o at %o %o (player at %o %o)", ch, x, y, player_x, player_y);		

		let scissorY = gl.canvas.height - (y+1)*opts.tileHeight * 2;
		// gl.scissor(x*opts.tileWidth * 2, scissorY, opts.tileWidth * 2, opts.tileHeight * 2);

		// if (clearBefore) {
		// 	if (opts.tileColorize) {
		// 		gl.clearColor(0, 0, 0, 0);
		// 	} else {
		// 		gl.clearColor(...parseColor(bg));
		// 	}
		// 	gl.clear(gl.COLOR_BUFFER_BIT);
		// }

		if (!ch) { return; }

		let chars = ([] as string[]).concat(ch);
		let bgs = ([] as string[]).concat(bg);
		let fgs = ([] as string[]).concat(fg);

		gl.uniform2fv(this._uniforms["targetPosRel"], [x, y]);
		gl.uniform2fv(this._uniforms["playerPosAbs"], [player_x, player_y]);
		gl.uniform1f(this._uniforms["t"], t);

		for (let i=0;i<chars.length;i++) {
			let tile = [...this._options.tileMap[chars[i]]];
			// hack
			if ((chars[i] == "@" || chars[i] == "M") && this._t % 8 >= 4) {
				tile[1] += 16;
				// console.log(`drawing alt tile for ${chars[i]}, ${tile}`);
			}
			if (!tile) { throw new Error(`Char "${chars[i]}" not found in tileMap`); }

			gl.uniform1f(this._uniforms["colorize"], opts.tileColorize ? 1 : 0);
			gl.uniform2fv(this._uniforms["tilesetPosAbs"], tile);

			if (opts.tileColorize) {
				gl.uniform4fv(this._uniforms["tint"], parseColor(fgs[i]));
				gl.uniform4fv(this._uniforms["bg"], parseColor(bgs[i]));
			}

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}
	}

	draw(data: DisplayData, clearBefore: boolean) {
        // console.log("draw in mydisplay");
		const gl = this._gl;
		const opts = this._options;
		let [x, y, ch, fg, bg] = data;

		let scissorY = gl.canvas.height - (y+1)*opts.tileHeight * 2;
		// gl.scissor(x*opts.tileWidth * 2, scissorY, opts.tileWidth * 2, opts.tileHeight * 2);

		// if (clearBefore) {
		// 	if (opts.tileColorize) {
		// 		gl.clearColor(0, 0, 0, 0);
		// 	} else {
		// 		gl.clearColor(...parseColor(bg));
		// 	}
		// 	gl.clear(gl.COLOR_BUFFER_BIT);
		// }

		if (!ch) { return; }

		let chars = ([] as string[]).concat(ch);
		let bgs = ([] as string[]).concat(bg);
		let fgs = ([] as string[]).concat(fg);

		gl.uniform2fv(this._uniforms["targetPosRel"], [x, y]);

		for (let i=0;i<chars.length;i++) {
			let tile = this._options.tileMap[chars[i]];
			if (!tile) { throw new Error(`Char "${chars[i]}" not found in tileMap`); }

			gl.uniform1f(this._uniforms["colorize"], opts.tileColorize ? 1 : 0);
			gl.uniform2fv(this._uniforms["tilesetPosAbs"], tile);

			if (opts.tileColorize) {
				gl.uniform4fv(this._uniforms["tint"], parseColor(fgs[i]));
				gl.uniform4fv(this._uniforms["bg"], parseColor(bgs[i]));
			}

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}
	}

	clear() {
		const gl = this._gl;
		this._t += 1;

		gl.clearColor(...parseColor(this._options.bg));
		gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	computeSize(availWidth: number, availHeight: number): [number, number] {
		let width = Math.floor(availWidth / this._options.tileWidth);
		let height = Math.floor(availHeight / this._options.tileHeight);
		return [width, height];
	}

	computeFontSize(availWidth: number, availHeight: number): number {
		throw new Error("Tile backend does not understand font size");
	}

	eventToPosition(x: number, y: number): [number, number] {
		let canvas = this._gl.canvas as HTMLCanvasElement;
		let rect = canvas.getBoundingClientRect();
		x -= rect.left;
		y -= rect.top;

		x *= canvas.width / rect.width;
		y *= canvas.height / rect.height;

		if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) { return [-1, -1]; }

		return this._normalizedEventToPosition(x, y);
	}

	_initWebGL() {
        console.log("init in mydisplay");
		let gl = document.createElement("canvas").getContext("webgl2", {preserveDrawingBuffer:true}) as WebGLRenderingContext;
		// let gl = WebGLDebug.WebGLDebugUtils.makeDebugContext(tmp_gl, this.throwOnGLError);
		(window as any).gl = gl;
		let program = createProgram(gl, VS, FS);
		gl.useProgram(program);
		createQuad(gl);

		UNIFORMS.forEach(name => this._uniforms[name] = gl.getUniformLocation(program, name));
		this._program = program;

		gl.enable(gl.BLEND);
		
  		gl.blendFuncSeparate(
  			gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
  			gl.ONE, gl.ONE_MINUS_SRC_ALPHA
  		);
  		gl.enable(gl.SCISSOR_TEST)
		return gl;
	}

	_normalizedEventToPosition(x:number, y:number): [number, number] {
		return [Math.floor(x/this._options.tileWidth), Math.floor(y/this._options.tileHeight)];
	}

	_updateSize() {
		const gl = this._gl;

		const opts = this._options;
		const canvasSize = [opts.width * opts.tileWidth * 2, opts.height * opts.tileHeight * 2];
		gl.canvas.width = canvasSize[0];
		gl.canvas.height = canvasSize[1];

		gl.viewport(0, 0, canvasSize[0], canvasSize[1]);
		gl.uniform2fv(this._uniforms["tileSize"], [opts.tileWidth, opts.tileHeight]);
		gl.uniform2fv(this._uniforms["targetSize"], canvasSize);
		console.log("setting tileSize: %o targetSize %o", [opts.tileWidth, opts.tileHeight], canvasSize);
	}

	_updateTexture(tileSet: HTMLImageElement) {
		createTexture(this._gl, tileSet);
  	}
}

const UNIFORMS = ["targetPosRel", "tilesetPosAbs", "playerPosAbs", "tileSize", "targetSize", "colorize", "bg", "tint", "t"];

const VS = `
#version 300 es

in vec2 tilePosRel;
out vec2 tilesetPosPx;

uniform vec2 tilesetPosAbs;
uniform vec2 tileSize;
uniform vec2 targetSize;
uniform vec2 targetPosRel;
uniform vec2 playerPosAbs;

void main() {
	float scaleFactor = 0.25;
	vec2 mapSize = targetSize / (tileSize * vec2(2.0,2.0));
	vec2 scaledTilePos = 1.0 * tilePosRel;

	// vec2 playerAdjust = (0.5 * mapSize) - playerPosAbs;
	// vec2 playerAdjust = playerPosAbs - (mapSize * 0.5);
	// vec2 playerAdjust = playerPosAbs - (vec2(20,20) * scaleFactor);

	vec2 playerAdjust = playerPosAbs - (mapSize * scaleFactor) + vec2(0.5,0.5);

	vec2 scaledTargetPos = 1.0 * (targetPosRel - (playerAdjust));
	vec2 targetPosPx = (scaledTargetPos + scaledTilePos) * tileSize;
	vec2 targetPosNdc = ((targetPosPx / (targetSize*scaleFactor))-0.5)*2.0;
	targetPosNdc.y *= -1.0;

	gl_Position = vec4(targetPosNdc, 0.0, 1.0);
	tilesetPosPx = tilesetPosAbs + scaledTilePos * tileSize;
}`.trim()

const FS = `
#version 300 es
precision highp float;

in vec2 tilesetPosPx;
out vec4 fragColor;
uniform sampler2D image;
uniform bool colorize;
uniform vec4 bg;
uniform vec4 tint;
uniform float t;

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

void main() {
	fragColor = vec4(0, 0, 0, 1);

	vec4 texel = texelFetch(image, ivec2(tilesetPosPx), 0);

	if (colorize) {
		// texel.rgb = tint.a * tint.rgb + (1.0-tint.a) * texel.rgb;
		// fragColor.rgb = texel.a*texel.rgb + (1.0-texel.a)*bg.rgb;
		// fragColor.a = texel.a + (1.0-texel.a)*bg.a;
	} else {
		// fragColor = texel;
		if (texel == vec4(0,0,0,0)) {
			fragColor = texel;
		} else {
			float dist = distance(vec2(328, 296), gl_FragCoord.xy);
//			float r = cnoise(vec3(floor(gl_FragCoord.x / 4.0),floor(gl_FragCoord.y / 4.0),t));
			float r = noise(vec3(floor(gl_FragCoord.x / 8.0), floor(gl_FragCoord.y / 8.0), t));
			// fragColor = mix(texel, vec4(0,0,0,1), r * 0.3);
			float distFactor = clamp( ( (dist - 140.0) / 240.0), 0.0, 1.0);
			float rFactor = abs(r * 0.85 * distFactor);

			fragColor = mix(texel, vec4(0,0,0,1), rFactor + distFactor);
			// fragColor = texel * vec4(dist, 0, dist, 1.0);	
		}
	}
}`.trim()

function createProgram(gl: WebGLRenderingContext, vss: string, fss: string) {
	const vs = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
	gl.shaderSource(vs, vss);
	gl.compileShader(vs);
	if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(vs) || ""); }

	const fs = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
	gl.shaderSource(fs, fss);
	gl.compileShader(fs);
	if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(fs) || ""); }

	const p = gl.createProgram() as WebGLProgram;
	gl.attachShader(p, vs);
	gl.attachShader(p, fs);
	gl.linkProgram(p);
	if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { throw new Error(gl.getProgramInfoLog(p) || ""); }

	return p;
}

function createQuad(gl: WebGLRenderingContext) {
	const pos = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}

function createTexture(gl: WebGLRenderingContext, data: HTMLImageElement) {
	let t = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, t);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
	return t;
}

type GLColor = [number, number, number, number];
let colorCache: {[key:string]: GLColor} = {};

function parseColor(color: string) {
	if (!(color in colorCache)) {
		let parsed: GLColor;
		if (color == "transparent") {
			parsed = [0, 0, 0, 0];
		} else if (color.indexOf("rgba") > -1) {
			parsed = (color.match(/[\d.]+/g) || []).map(Number) as GLColor;
			for (let i=0;i<3;i++) { parsed[i] = parsed[i]/255; }
		} else {
			parsed = Color.fromString(color).map($ => $/255) as GLColor;
			parsed.push(1);
		}
		colorCache[color] = parsed;
	}

	return colorCache[color];
}