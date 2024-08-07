import * as Crypto from "crypto-js";
import * as glu from "./display/GLUtils";
import fooShader from "./display/shaders/foo.glsl";
import fgVertexShaderSource from "./display/shaders/fgVertexShader.glsl";
import fgFragmentShaderSource from "./display/shaders/fgFragmentShader.glsl";
import bgVertexShaderSource from "./display/shaders/bgVertexShader.glsl";
import bgFragmentShaderSource from "./display/shaders/bgFragmentShader.glsl";
import lightVertexShaderSource from "./display/shaders/lightVertexShader.glsl";
import lightFragmentShaderSource from "./display/shaders/lightFragmentShader.glsl";

function init() {
    // var picture = document.getElementById("picture");
    console.log("about to retrieve encrypted image")
    var data = new XMLHttpRequest();
    data.open('GET', 'tiny_dungeon_world_3.png.enc.b64', true);
    data.onreadystatechange = loaded;
    data.send(null);
}

function loaded() {
    console.log("ready?");
    if(this.readyState == 4 && this.status==200){
        console.log("got back data", this.responseText.length, "bytes")
        console.log("Crypto:",Crypto);
        // let crypto:any = Crypto;
        var dec = Crypto.AES.decrypt(this.responseText, process.env.ASSET_KEY);
        var plain = Crypto.enc.Base64.stringify( dec );

        // tileSet.src = "data:image/png;base64,"+plain;

        // const src = dec.toString()
        // const src = Crypto.enc.Base64.parse(plain).toString();
        let bytes = atob(plain)
        const binary = new Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
          binary[i] = bytes.charCodeAt(i);
        }
        const byteArray = new Uint8Array(binary);

        const blob = new Blob([byteArray])
        const url = URL.createObjectURL(blob)
        setup(url)
    } else {
        console.log("sad path",this);
    }
}

function setup(tilesetBlobUrl:string) {
    const tileSet = document.createElement("img");

    tileSet.src = ""
    tileSet.onload = function () {
        console.log('image url:',tilesetBlobUrl)
        console.log('tileSet:',tileSet)
        // document.body.appendChild(tileSet);
    
        var canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = 600;
        (canvas as any).style = `width: ${600}px; height: ${600}px`;
        const gl = (canvas as any).value = canvas.getContext("webgl2", {antialias: false, depth: false, premultipliedAlpha: false});
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        document.body.appendChild(canvas);
        gl.clearColor(1,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    
        console.log("loading shaders", fooShader);
        
        let fgVertexShader = glu.createShader(gl,gl.VERTEX_SHADER,fgVertexShaderSource);
        let fgFragmentShader = glu.createShader(gl,gl.FRAGMENT_SHADER,fgFragmentShaderSource);
        let fgProgram = glu.createProgram(gl,fgVertexShader,fgFragmentShader);

        let bgVertexShader = glu.createShader(gl,gl.VERTEX_SHADER,bgVertexShaderSource);
        let bgFragmentShader = glu.createShader(gl,gl.FRAGMENT_SHADER,bgFragmentShaderSource);
        let bgProgram = glu.createProgram(gl,bgVertexShader,bgFragmentShader);

        let lightVertexShader = glu.createShader(gl,gl.VERTEX_SHADER,lightVertexShaderSource);
        let lightFragmentShader = glu.createShader(gl,gl.FRAGMENT_SHADER,lightFragmentShaderSource);
        let lightProgram = glu.createProgram(gl,lightVertexShader,lightFragmentShader);

        let tileSetTexture = glu.createTexture(gl, tileSet);

        let map = makeMap();
        let tileMap = makeTilemap(gl,map);


        let random_sprite_x = Math.floor(Math.random() * 16)
        let random_sprite_y = Math.floor(Math.random() * 32)
        let random_grid_x = Math.floor(Math.random() * 8)
        let random_grid_y = Math.floor(Math.random() * 8)

        // draw(gl,fgProgram,random_sprite_x,random_sprite_y,random_grid_x,random_grid_y);

        let draw_frame = (timestamp) => {
            draw_bg(gl,bgProgram,tileSetTexture,tileMap);
            draw(gl,fgProgram,random_sprite_x,random_sprite_y,random_grid_x,random_grid_y);
            draw_light(gl,lightProgram);
            requestAnimationFrame(draw_frame);

        };
        requestAnimationFrame(draw_frame);

    
    };
    tileSet.src = tilesetBlobUrl;

}

function spriteCoords(sprite_pos_x,sprite_pos_y) {
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

function draw(gl,program,sprite_x, sprite_y, grid_x, grid_y) {
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");

    let width = 600;
    let height = 600;
    let now = Date.now();
  
    // Create a buffer and put three 2d clip space points in it
    var positionBuffer = gl.createBuffer();
  
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    let grid_size = 8;
  
    let grid_x_l = ((width / grid_size) * grid_x / width) * 2 - 1
    let grid_x_r = ((width / grid_size) * (grid_x + 1) / width) * 2 - 1
    let grid_y_b = ((width / grid_size) * grid_y / width) * 2 - 1
    let grid_y_u = ((width / grid_size) * (grid_y + 1) / width) * 2 - 1

    // console.log("grid pos:", grid_x, grid_y, "gl pos:", grid_x_l, grid_y_b);
  
    let positions = [
      grid_x_l, grid_y_b,
      grid_x_r, grid_y_b,
      grid_x_l, grid_y_u,
      grid_x_r, grid_y_u
    ]

    // console.log(positions)
    // var positions = [
    //   0, 0.0,
    //   1.0, 0.0,
    //   0.0,1.0,
    //   1.0,1.0
    // ];
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
        new Float32Array(spriteCoords(sprite_x,sprite_y)),
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
    gl.viewport(0,0,600,600);
    
    // Clear the canvas
    // gl.clearColor(0.3, 0.3, 0.3, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT);
  
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);
  
    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);
  
    let t_location = gl.getUniformLocation(program, 't');    
    let t = (Math.sin(now / 200) + 1.0) / 2.0;
    gl.uniform1f(t_location, t);
  
    let t_raw =  now / 500 % 100;
    // console.log(t,t_raw);
    
  
    let t_raw_location = gl.getUniformLocation(program, 't_raw');  
    gl.uniform1f(t_raw_location, t_raw);
  
    
    // draw
    var primitiveType = gl.TRIANGLE_STRIP;
    var offset = 0;
    var count = 4;
    gl.drawArrays(primitiveType, offset, count);
}

function makeMap() {
    let options = [
        [27,7],
        [28,7],
        [29,7],
        [30,7],
        [31,7],
        [22,7],
        [22,7],
        [22,7]
      ]
    
      let grid_size = 64
    
      let map = []
      
      for (let i = 0; i < grid_size; i++) {
        let r = Math.floor(Math.random() * options.length);
        // console.log("r",r);
        let o = options[r];
        // console.log("o",o);
        map.push(o[0],o[1]);      
      }
    
      return map;    
}

function makeTilemap(gl, map) {
    const mapWidth = 8;
    const mapHeight = 8;
    const tilemap = new Uint32Array(mapWidth * mapHeight);
    const tilemapU8 = new Uint8Array(tilemap.buffer);
    const totalTiles = mapWidth * mapHeight;
    for (let i = 0; i < tilemap.length; ++i) {
      const off = i * 4;
      const grid_off = i * 2;
  
      tilemapU8[off + 0] = map[grid_off + 0];
      tilemapU8[off + 1] = map[grid_off + 1];
      tilemapU8[off + 2] = 0;
      tilemapU8[off + 3] = 1.0;
    }
  
    let t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tilemapU8);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 8,8,0, gl.RGBA, gl.UNSIGNED_BYTE, tilemapU8);
    return t;
}

function draw_bg(gl,bgProgram, tileset, tilemap) { 
    var positionAttributeLocation = gl.getAttribLocation(bgProgram, "a_position");
    var texcoordAttributeLocation = gl.getAttribLocation(bgProgram, "a_texcoord");
    var textureUniformLocation = gl.getUniformLocation(bgProgram, "u_texture");
    var tilemapLocation = gl.getUniformLocation(bgProgram, "u_tilemap");
  
    // Create a buffer and put three 2d clip space points in it
    var positionBuffer = gl.createBuffer();
  
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    let grid_size = 8;
  
    var positions = [
      -1.0, -1.0,
      1.0, -1.0,
      -1.0,1.0,
      1.0,1.0
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
        new Float32Array([0,0,0,0,0,0,0,0]),
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
    gl.viewport(0,0,600,600);
    
    // Clear the canvas
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    // Tell it to use our program (pair of shaders)
    gl.useProgram(bgProgram);
  
    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);
  
    var texUnit = 0;
    gl.activeTexture(gl.TEXTURE0 + texUnit);
    gl.bindTexture(gl.TEXTURE_2D, tileset);
    gl.uniform1i(textureUniformLocation, texUnit);
  
    texUnit = 1;
    gl.activeTexture(gl.TEXTURE0 + texUnit);
    gl.bindTexture(gl.TEXTURE_2D, tilemap);
    gl.uniform1i(tilemapLocation, texUnit);
    
    // draw
    var primitiveType = gl.TRIANGLE_STRIP;
    var offset = 0;
    var count = 4;
    gl.drawArrays(primitiveType, offset, count);      
}

function draw_light(gl,program) {
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");

    let width = 600;
    let height = 600;
    let now = Date.now();
  
    // Create a buffer and put three 2d clip space points in it
    var positionBuffer = gl.createBuffer();
  
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var positions = [
        -1.0, -1.0,
        1.0, -1.0,
        -1.0,1.0,
        1.0,1.0
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
        // new Float32Array(spriteCoords(0,0)),
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
    
    // Tell WebGL how to convert from clip space to pixels
    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.viewport(0,0,600,600);
    
    // Clear the canvas
    // gl.clearColor(0.3, 0.3, 0.3, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT);
  
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);
  
    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);
  
    let t_location = gl.getUniformLocation(program, 't');    
    let t = (Math.sin(now / 200) + 1.0) / 2.0;
    gl.uniform1f(t_location, t);
  
    let t_raw =  now / 500 % 100;
    // console.log(t,t_raw);
    
  
    let t_raw_location = gl.getUniformLocation(program, 't_raw');  
    gl.uniform1f(t_raw_location, t_raw);
  
    
    // draw
    var primitiveType = gl.TRIANGLE_STRIP;
    var offset = 0;
    var count = 4;
    gl.drawArrays(primitiveType, offset, count);

}

console.log("hello test world?");
init();


