// Create a new file called WebGLDisplay.ts

import * as glu from "./GLUtils";
import fgVertexShaderSource from "./shaders/fgVertexShader.glsl";
import fgFragmentShaderSource from "./shaders/fgFragmentShader.glsl";
import bgVertexShaderSource from "./shaders/bgVertexShader.glsl";
import bgFragmentShaderSource from "./shaders/bgFragmentShader.glsl";
import lightVertexShaderSource from "./shaders/lightVertexShader.glsl";
import lightFragmentShaderSource from "./shaders/lightFragmentShader.glsl";

export class WebGLDisplay {
    public gl: WebGL2RenderingContext;
    public canvas: HTMLCanvasElement;
    public tileSetTexture: WebGLTexture | null = null;
    public tileMapTexture: WebGLTexture | null = null;
    public mapWidth: number = 0;
    public mapHeight: number = 0;
    public fgProgram: WebGLProgram;
    public bgProgram: WebGLProgram;
    public lightProgram: WebGLProgram;
    public _options: object


    constructor(canvas: HTMLCanvasElement, options: object) {
        this._options = options;
        this.canvas = canvas;
        const gl = canvas.getContext("webgl2", {antialias: false, depth: false, premultipliedAlpha: false});
        if (!gl) throw new Error("WebGL2 not supported");
        this.gl = gl;
    }

    public getContainer(): HTMLElement {
        return this.canvas;
    }

    async initGL(tileSetBlobUrl: string) {
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.clearColor(0, 0, 0, 1);

        // Load tileset
        this.tileSetTexture = await this.loadTileset(tileSetBlobUrl);

        // Create shader programs
        this.fgProgram = this.createShaderProgram(fgVertexShaderSource, fgFragmentShaderSource);
        this.bgProgram = this.createShaderProgram(bgVertexShaderSource, bgFragmentShaderSource);
        this.lightProgram = this.createShaderProgram(lightVertexShaderSource, lightFragmentShaderSource);

        this.adjustForDPR();
    }

    public loadTilemap(map: number[], mapWidth: number, mapHeight: number): WebGLTexture {
        // Delete existing tilemap texture if it exists
        if (this.tileMapTexture) {
            this.gl.deleteTexture(this.tileMapTexture);
            this.tileMapTexture = null;
        }

        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;

        const tilemap = new Uint32Array(mapWidth * mapHeight);
        const tilemapU8 = new Uint8Array(tilemap.buffer);

        for (let i = 0; i < tilemap.length; ++i) {
            const off = i * 4;
            const grid_off = i * 2;

            tilemapU8[off + 0] = map[grid_off + 0];
            tilemapU8[off + 1] = map[grid_off + 1];
            tilemapU8[off + 2] = 0; 
            tilemapU8[off + 3] = 1.0;
        }

        let t = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, t);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, mapWidth, mapHeight, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, tilemapU8);

        this.tileMapTexture = t;    
        return t;
    }

    public async loadTileset(tileSetBlobUrl: string): Promise<WebGLTexture> {
        return new Promise((resolve, reject) => {
            const tileSet = document.createElement("img");
            tileSet.onload = () => {
                console.log('image url:', tileSetBlobUrl);
                console.log('tileSet:', tileSet);
                const texture = glu.createTexture(this.gl, tileSet);
                resolve(texture);
            };
            tileSet.onerror = (error) => {
                console.error('Failed to load tileset:', error);
                reject(error);
            };
            tileSet.src = tileSetBlobUrl;
        });
    }

    public clear(r: number = 0, g: number = 0, b: number = 0, a: number = 1) {
        const gl = this.gl;
        
        // Set clear color
        gl.clearColor(r, g, b, a);
        
        // Clear the color buffer
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    private createShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
        const vertexShader = glu.createShader(this.gl, this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = glu.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentSource);
        return glu.createProgram(this.gl, vertexShader, fragmentShader);
    }

    private adjustForDPR() {
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = Math.floor(this.canvas.clientWidth * dpr);
        const displayHeight = Math.floor(this.canvas.clientHeight * dpr);

        // if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
        //     this.canvas.width = displayWidth;
        //     this.canvas.height = displayHeight;
        //     this.canvas.style.width = this.canvas.clientWidth + 'px';
        //     this.canvas.style.height = this.canvas.clientHeight + 'px';
        // }

        // HACK - need to figure out how to pass in zoom to shaders.
        // this.gl.viewport(0,0, this.canvas.width, this.canvas.clientWidth);

        this.gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    }

    public resize(width: number, height: number) {
        this.gl.canvas.width = width;
        this.gl.canvas.height = height;
        this.gl.viewport(0, 0, width, height);
        // You might need to update any projection matrices or other size-dependent variables here
    }

    public draw(timestamp: number) {
        // this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        // // Draw background
        // this.drawBackground();
        
        // // Draw entities
        // this.drawEntities();
        
        // // Draw lighting
        // this.drawLighting();
    }

    public drawBackground(offset_x: number, offset_y: number) {
        const gl = this.gl;
        const bgProgram = this.bgProgram;

        console.log("bgProgram",bgProgram, "x",offset_x, "y",offset_y);

        var positionAttributeLocation = gl.getAttribLocation(bgProgram, "a_position");
        var texcoordAttributeLocation = gl.getAttribLocation(bgProgram, "a_texcoord");
        var textureUniformLocation = gl.getUniformLocation(bgProgram, "u_texture");
        var tilemapLocation = gl.getUniformLocation(bgProgram, "u_tilemap");
        var mapGridSizeLocation = gl.getUniformLocation(bgProgram, "u_map_grid_size");
        var screenGridSizeLocation = gl.getUniformLocation(bgProgram, "u_screen_grid_size");
      
        // Create a buffer and put three 2d clip space points in it
        var positionBuffer = gl.createBuffer();
      
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      
        // let offset_adj_x = (10.0 - (offset_x)) / 4.0; // ((level_width / 2) - camera_pos) / (screen_grid_width / 2) 
        // let offset_adj_y = -1 * (9.0 - (offset_y)) / 4.0; // the +1 is probably an error from inverting the texture array's y

        let screen_grid_width = 8.0;
        let screen_grid_height = 8.0;

        let screen_grid_adj_x = screen_grid_width / 2.0;
        let screen_grid_adj_y = screen_grid_height / 2.0;

        let offset_adj_x = ((this.mapWidth / 2.0) - offset_x) / screen_grid_adj_x;
        let offset_adj_y = -1 * (((this.mapHeight) / 2.0) - 1 - offset_y) / screen_grid_adj_y;

        let grid_unit_ndc = 2.0 / screen_grid_width; // 0.25
        let level_width_ndc = this.mapWidth / screen_grid_width;
        
        let left_offset = -1 * level_width_ndc + offset_adj_x;
        let right_offset = level_width_ndc + offset_adj_x;
        let top_offset = level_width_ndc + offset_adj_y;
        let bottom_offset = -1 * level_width_ndc + offset_adj_y;

        
        var positions = [
        //   -1.0 + offset_adj_x, -1.0 + offset_adj_y,
        //   1.5 + offset_adj_x, -1.0 + offset_adj_y,
        //   -1.0 + offset_adj_x, 1.5 + offset_adj_y,
        //   1.5 + offset_adj_x, 1.5 + offset_adj_y

        // -2.5 + offset_adj_x, 2.5 + offset_adj_y,
        // 2.5 + offset_adj_x, 2.5 + offset_adj_y,
        // -2.5 + offset_adj_x, -2.5 + offset_adj_y,
        // 2.5 + offset_adj_x, -2.5 + offset_adj_y

            left_offset, top_offset,
            right_offset, top_offset,
            left_offset, bottom_offset,
            right_offset, bottom_offset,

        ];
      
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
      
        // Create a vertex array object (attribute state)
        var vao = gl.createVertexArray();
      
        // and make it the one we're currently working with
        gl.bindVertexArray(vao);
      
        // Turn on the attribute
        gl.enableVertexAttribArray(positionAttributeLocation);
      
        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);
      
        // create the texcoord buffer, make it the current ARRAY_BUFFER
        // and copy in the texcoord values
        var texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            // new Float32Array([0,0,
            //                   1,0,
            //                   0,1,
            //                   1,1]),
            // TODO: calculate position/zoom here!
            new Float32Array([
                // 0,0.5,
                // 0.5,0.5,
                // 0,0,
                // 0.5,0,
                0,1.0,
                1.0,1.0,
                0,0,
                1.0,0,

            ]),
  
            gl.STATIC_DRAW);
         
        // Turn on the attribute
        gl.enableVertexAttribArray(texcoordAttributeLocation);
         
        // Tell the attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floating point values
        var normalize = true;  // convert from 0-255 to 0.0-1.0
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next texcoord
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            texcoordAttributeLocation, size, type, normalize, stride, offset);  
        
        // Tell WebGL how to convert from clip space to pixels
        // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // gl.viewport(0,0,600,600);
        
        // Clear the canvas
        // gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // gl.clear(gl.COLOR_BUFFER_BIT);
      
        // Tell it to use our program (pair of shaders)
        gl.useProgram(bgProgram);
      
        // Bind the attribute/buffer set we want.
        gl.bindVertexArray(vao);
      
        var texUnit = 0;
        gl.activeTexture(gl.TEXTURE0 + texUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.tileSetTexture);
        gl.uniform1i(textureUniformLocation, texUnit);
      
        texUnit = 1;
        gl.activeTexture(gl.TEXTURE0 + texUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.tileMapTexture);
        gl.uniform1i(tilemapLocation, texUnit);
       
        gl.uniform2f(screenGridSizeLocation, screen_grid_width, screen_grid_height);
        gl.uniform2f(mapGridSizeLocation, this.mapWidth, this.mapHeight);
        // draw
        var primitiveType = gl.TRIANGLE_STRIP;
        var offset = 0;
        var count = 4;
        gl.drawArrays(primitiveType, offset, count);    
    }

    private drawEntities() {
        // Implement entity drawing logic
    }

    public drawLighting(light1_x: number, light1_y: number, light2_x: number, light2_y: number, camera_x: number, camera_y: number) {
        const gl = this.gl;
        const program = this.lightProgram;

        var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
        var lightcoordUniformLocation = gl.getUniformLocation(program, "u_lightcoords");

        // Create a buffer and put three 2d clip space points in it
        var positionBuffer = gl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        var positions = [
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            1.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // Create a vertex array object (attribute state)
        var vao = gl.createVertexArray();

        // and make it the one we're currently working with
        gl.bindVertexArray(vao);

        // Turn on the attribute
        gl.enableVertexAttribArray(positionAttributeLocation);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);

        // create the texcoord buffer, make it the current ARRAY_BUFFER
        // and copy in the texcoord values
        var texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW);
         
        // Turn on the attribute
        gl.enableVertexAttribArray(texcoordAttributeLocation);
         
        // Tell the attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floating point values
        var normalize = true;  // convert from 0-255 to 0.0-1.0
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next texcoord
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            texcoordAttributeLocation, size, type, normalize, stride, offset);  

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // Bind the attribute/buffer set we want.
        gl.bindVertexArray(vao);

        // timing variables, comment out to disable.
        let now = Date.now();
        let t_location = gl.getUniformLocation(program, 't');    
        let t = (Math.sin(now / 200) + 1.0) / 2.0;
        gl.uniform1f(t_location, t);
      
        let t_raw =  now / 500 % 100;
      
        let t_raw_location = gl.getUniformLocation(program, 't_raw');  
        gl.uniform1f(t_raw_location, t_raw);

        
        // pass the actual light locations
        let lightcoords = [
            (2 * (4.5 + light1_x - camera_x) / 8.0) - 1,
            1 - (2 * (3.5 + light1_y - camera_y) / 8.0), // TODO flip y
            (2 * (4.5 + light2_x - camera_x) / 8.0) - 1,
            1 - (2 * (3.5 + light2_y - camera_y) / 8.0),
        ];
        gl.uniform2fv(lightcoordUniformLocation, lightcoords);

        // draw
        var primitiveType = gl.TRIANGLE_STRIP;
        var offset = 0;
        var count = 4;
        gl.drawArrays(primitiveType, offset, count);
    }

    async initialize(tileSetBlobUrl: string) {
        await this.initGL(tileSetBlobUrl);
        // Any additional initialization can go here
    }

    // Add this method to the WebGLDisplay class

    public drawForeground(sprite_x: number, sprite_y: number, grid_x: number, grid_y: number, camera_x: number, camera_y: number) {
        const gl = this.gl;
        const program = this.fgProgram;

        var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
        var spriteTranspUniformLocation = gl.getUniformLocation(program,"u_sprite_transp");
        var auraColorUniformLocation = gl.getUniformLocation(program,"u_aura_color");

        let now = Date.now();

        // Create a buffer and put three 2d clip space points in it
        var positionBuffer = gl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        grid_x = 4 + grid_x - camera_x;
        grid_y = 4 + camera_y - grid_y;

        let positions = [
            grid_x, grid_y,
            grid_x + 1, grid_y,
            grid_x, grid_y + 1,
            grid_x + 1, grid_y + 1
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // Create a vertex array object (attribute state)
        var vao = gl.createVertexArray();

        // and make it the one we're currently working with
        gl.bindVertexArray(vao);

        // Turn on the attribute
        gl.enableVertexAttribArray(positionAttributeLocation);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);

        // create the texcoord buffer, make it the current ARRAY_BUFFER
        // and copy in the texcoord values
        var texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.spriteCoords(sprite_x, sprite_y)),
            gl.STATIC_DRAW);
         
        // Turn on the attribute
        gl.enableVertexAttribArray(texcoordAttributeLocation);
         
        // Tell the attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floating point values
        var normalize = true;  // convert from 0-255 to 0.0-1.0
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next texcoord
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            texcoordAttributeLocation, size, type, normalize, stride, offset);  

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // Bind the attribute/buffer set we want.
        gl.bindVertexArray(vao);

        let t_location = gl.getUniformLocation(program, 't');    
        let t = (Math.sin(now / 200) + 1.0) / 2.0;
        gl.uniform1f(t_location, t);

        let t_raw =  now / 500 % 100;
        let t_raw_location = gl.getUniformLocation(program, 't_raw');  
        gl.uniform1f(t_raw_location, t_raw);

        gl.uniform4f(spriteTranspUniformLocation, 1.0, 1.0, 1.0, 1.0);
        gl.uniform4f(auraColorUniformLocation, 1.0, 0.0, 0.0, 1.0);

        // draw
        var primitiveType = gl.TRIANGLE_STRIP;
        var offset = 0;
        var count = 4;
        gl.drawArrays(primitiveType, offset, count);
    }

    // Add this helper method to the WebGLDisplay class
    private spriteCoords(sprite_pos_x: number, sprite_pos_y: number): number[] {
        let t_width = 512; // 49 sprites
        let t_height = 768; // 22 sprites

        let sprite_size = 16;

        let t_sprite_width = t_width / sprite_size;
        let t_sprite_height = t_height / sprite_size;
        
        let sprite_coord_l_x = (sprite_pos_x * sprite_size) / t_width;
        let sprite_coord_r_x = ((sprite_pos_x + 1) * sprite_size) / t_width;

        let sprite_coord_b_y = (sprite_pos_y * sprite_size) / t_height;
        let sprite_coord_u_y = ((sprite_pos_y + 1) * sprite_size) / t_height;

        return [
            sprite_coord_l_x, sprite_coord_u_y,
            sprite_coord_r_x, sprite_coord_u_y,
            sprite_coord_l_x, sprite_coord_b_y,
            sprite_coord_r_x, sprite_coord_b_y
        ];
    }
}

export function createMapArray(map:object, width: number, height: number, tileset: {[key:string]:[number,number]}): number[] {
    const result: number[] = new Array(width * height * 2);

    // Initialize the array with default values
    for (let i = 0; i < width * height * 2; i += 2) {
        result[i] = 16;
        result[i + 1] = 7;
    }

    // Fill in the known tiles from the map
    for (const [key, value] of Object.entries(map)) {
        let [x, y] = key.split(',').map(Number);
        // y = height - y;
        if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = (y * width + x) * 2;
            const tileIndices = tileset[value];
            if (tileIndices) {
                result[index] = tileIndices[0];
                result[index + 1] = tileIndices[1];
            } else {
                console.warn(`Unknown tile type: ${value}`);
            }
        }
    }

    return result;
}