import * as Crypto from "crypto-js";
import { WebGLDisplay } from "./display/WebGLDisplay";
import { noise } from "./perlin.js";
import * as glu from "./display/GLUtils";

function init() {
    console.log(noise);
    // var picture = document.getElementById("picture");
    console.log("about to retrieve encrypted image")
    var data = new XMLHttpRequest();

    let req_url = "tiny_dungeon_world_3_dark_test_7.png.enc.b64"
    if (req_url.endsWith(".png")) {
        console.log("unencrypted png")
        data.responseType = 'blob';
        data.open('GET', req_url, true);
        data.onreadystatechange = load;
        data.send(null);
    } else {
        data.open('GET', req_url, true);
        data.onreadystatechange = load_encrypted;
        data.send(null);
    }
}

function load() {
    console.log("ready?");
    if(this.readyState == 4 && this.status==200){
        console.log(this.responseURL,"got back data", this.response.length, "bytes")
        if (this.responseURL.endsWith("png")) {
            console.log("unencrypted", this.response)
            var reader = new FileReader();
            reader.onloadend = function() {
                console.log("reader returned", reader.result)
                setup(reader.result as string).catch(console.error);
            }
            reader.readAsDataURL(this.response);
        }
    } else {
        console.log("sad path",this);
    }
}

function load_encrypted() {
    console.log("ready?");
    if(this.readyState == 4 && this.status==200){
        console.log(this.responseURL,"got back data", this.response.length, "bytes")
        console.log("encrypted")
        console.log("Crypto:",Crypto);
        var dec = Crypto.AES.decrypt(this.responseText, process.env.ASSET_KEY);
        var plain = Crypto.enc.Base64.stringify( dec );

        let bytes = atob(plain)
        const binary = new Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            binary[i] = bytes.charCodeAt(i);
        }
        const byteArray = new Uint8Array(binary);

        const blob = new Blob([byteArray])
        const url = URL.createObjectURL(blob)    
        setup(url).catch(console.error);
    } else {
        console.log("sad path",this);
    }
}

function initializeSpritePosition() {
    let rand_x = Math.floor(Math.random() * 8)
    let rand_y = Math.floor(Math.random() * 8)
    return {
        x: rand_x,
        y: rand_y,
        sprite_x: Math.floor(Math.random() * 16),
        sprite_y: Math.floor(Math.random() * 32),
        target_x: rand_x,
        target_y: rand_y,
        target_time: 250
    };
}

function updateSpritePosition(sprite, now, interval) {
    let progress = 1 - ((sprite.target_time - now) / interval);
    if (progress > 1) {
        let new_target_x = sprite.target_x - (1 - Math.floor(Math.random() * 3));
        if (new_target_x > 7) { new_target_x -= 2; }
        let new_target_y = sprite.target_y - (1 - Math.floor(Math.random() * 3));
        if (new_target_y > 7) { new_target_y -= 2; }

        progress = 0;
        sprite.x = sprite.target_x;
        sprite.y = sprite.target_y;
        sprite.target_x = new_target_x;
        sprite.target_y = new_target_y;
        sprite.target_time = now + interval;
    }

    return {
        x: (sprite.x * (1 - progress)) + (sprite.target_x * progress),
        y: (sprite.y * (1 - progress)) + (sprite.target_y * progress)
    };
}

let display: WebGLDisplay;
let sprite1: any;
let sprite2: any;
let lastFrameTime: number;
let performanceDiv: HTMLDivElement;
let lastMapUpdateTime: number;

function draw_frame(timestamp: number) {
    // console.log("Drawing frame at", timestamp);
    
    const frameStartTime = performance.now();

    const gl = display.gl;
    const tileSetTexture = display.tileSetTexture;
    const tileMap = display.tileMapTexture;
    const fgProgram = display.fgProgram;
    const bgProgram = display.bgProgram;
    const lightProgram = display.lightProgram;

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    let now = Date.now();

    let sprite1Pos = updateSpritePosition(sprite1, now, 1000);
    let sprite2Pos = updateSpritePosition(sprite2, now, 500);

    let camera_pos_x = sprite1Pos.x;
    let camera_pos_y = sprite1Pos.y;

    display.drawBackground(sprite1Pos.x, sprite1Pos.y);
    display.drawForeground(sprite1.sprite_x, sprite1.sprite_y, sprite1Pos.x, sprite1Pos.y, camera_pos_x, camera_pos_y);
    display.drawForeground(sprite2.sprite_x, sprite2.sprite_y, sprite2Pos.x, sprite2Pos.y, camera_pos_x, camera_pos_y);
    display.drawLighting(sprite1Pos.x, sprite1Pos.y, sprite2Pos.x, sprite2Pos.y, camera_pos_x, camera_pos_y);

    const currentTime = Date.now();
    if (currentTime - lastMapUpdateTime >= 3000) {
        // Regenerate and reload the map every 3 seconds
        let newMap = makeMap();
        display.createTilemap(newMap, 10, 10);
        console.log("regenerating map");
        lastMapUpdateTime = currentTime;
    }

    const frameEndTime = performance.now();
    const frameDuration = frameEndTime - frameStartTime;
    const fps = 1000 / (frameEndTime - lastFrameTime);

    // Update the performance info div
    performanceDiv.textContent = `Render time: ${frameDuration.toFixed(2)}ms | FPS: ${fps.toFixed(2)}`;

    lastFrameTime = frameEndTime;
    requestAnimationFrame(draw_frame);
}

async function setup(tilesetBlobUrl: string) {
    const canvas = document.createElement("canvas");
    performanceDiv = document.createElement("div");

    function resizeCanvas() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isPortrait = viewportHeight > viewportWidth;
        
        // Use 95% of the smaller dimension
        const canvasSize = Math.floor((isPortrait ? viewportWidth : viewportHeight) * 0.95);

        canvas.width = canvasSize;
        canvas.height = canvasSize;
        
        // Center the canvas
        canvas.style.display = "block";
        canvas.style.margin = "auto";
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.bottom = "0";
        canvas.style.left = "0";
        canvas.style.right = "0";

        // Resize WebGL viewport if display is initialized
        if (display) {
            display.resize(canvasSize, canvasSize);
        }
    }

    // Initial setup
    resizeCanvas();
    document.body.appendChild(canvas);

    // Setup performance div
    performanceDiv.id = "performanceInfo";
    performanceDiv.style.position = "fixed";
    performanceDiv.style.top = "10px";
    performanceDiv.style.left = "10px";
    performanceDiv.style.color = "white";
    performanceDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    performanceDiv.style.padding = "5px";
    document.body.appendChild(performanceDiv);

    // Initialize WebGLDisplay
    display = new WebGLDisplay(canvas);
    await display.initialize(tilesetBlobUrl);

    console.log("WebGLDisplay initialized");

    // Add resize event listener
    window.addEventListener('resize', resizeCanvas);

    // Create initial map
    let map = makeMap();
    display.createTilemap(map, 10, 10);

    console.log("Tilemap created");

    // Initialize sprite positions
    sprite1 = initializeSpritePosition();
    sprite2 = initializeSpritePosition();

    lastFrameTime = performance.now();
    lastMapUpdateTime = Date.now();

    console.log("Starting animation loop");
    requestAnimationFrame(draw_frame);
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
    
      let grid_size = 100
    
      let map = []
      
      for (let i = 0; i < grid_size; i++) {
        if ((i % 10 == 0) || (i % 10 == 9)) {
            map.push(22,5)
        } else if (i <= 9) {
            map.push(17,5);                
        } else {
            let r = Math.floor(Math.random() * options.length);
            // console.log("r",r);
            let o = options[r];
            // console.log("o",o);
            map.push(o[0],o[1]);          
        }
      }
    
      return map;    
}

console.log("hello test world?");
init();


