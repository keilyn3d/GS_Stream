'use strict'; 

//var socket = io();
var socket = io.connect(null, {port: 5000, rememberTransport: false});
socket.on('connect', function(){
    socket.emit('my_event', {data: 'I\'m connected!'});
});

// Get the viewport_canvas
const viewportCanvas = document.getElementById('myCanvas');
const viewportCtx = viewportCanvas.getContext('2d');
const img1 = new Image()

// Get nnImg_X canvases
const nnImg1Canvas = document.getElementById('nnImg_1');
const nnImg1Ctx = nnImg1Canvas.getContext('2d');
const nnImg1 = new Image()
let nnImg1Name = ""

const nnImg2Canvas = document.getElementById('nnImg_2');
const nnImg2Ctx = nnImg2Canvas.getContext('2d');
const nnImg2 = new Image()
let nnImg2Name = ""


const nnImg3Canvas = document.getElementById('nnImg_3');
const nnImg3Ctx = nnImg3Canvas.getContext('2d');
const nnImg3 = new Image()
let nnImg3Name = ""


// Depreciated drawButton
const drawButton = document.getElementById('drawButton');

// listen for img1
socket.on('img1', function(msg) {
        console.log("Update Viewport!")
        let arrayBufferView = new Uint8Array(msg['image']);
        console.log(arrayBufferView);

        var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
        var img1_url = URL.createObjectURL(blob);
        console.log(img1_url);
        img1.onload = function () {
            viewportCanvas.height = img1.height;
            viewportCanvas.width = img1.width;
            viewportCtx.drawImage(img1, 0, 0);
        }
        img1.src = img1_url
});

// Step
let step = 1;

const stepValue = document.getElementById('stepValue');
const message = document.getElementById('message');
const increase = document.getElementById('increase');
const decrease = document.getElementById('decrease');

increase.addEventListener('click', function() {
    if (step < 10) {
        step++;
        stepValue.value = step;
        message.textContent = '';
    } else {
        message.textContent = 'The value cannot exceed 10.';
    }
});

decrease.addEventListener('click', function() {
    if (step > 1) {
        step--;
        stepValue.value = step;
        message.textContent = '';
    } else {
        message.textContent = 'The value cannot be less than 1.';
    }
});

stepValue.addEventListener('input', function() {
    const inputValue = parseInt(this.value, 10);
    if (inputValue >= 1 && inputValue <= 10) {
        step = inputValue;
        message.textContent = '';
    } else {
        message.textContent = 'Value must be between 1 and 10.';
    }
})

    // Listens for nnImg_1
socket.on('nnImg_1', function(msg){
        console.log("Update 1st Nearest img!")
        let arrayBufferView = new Uint8Array(msg['image']);
        nnImg1Name = msg['filename'];

        var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
        var nnimg1_url = URL.createObjectURL(blob);
        console.log(nnimg1_url);
        nnImg1.onload = function () {
            nnImg1Ctx.drawImage(nnImg1, 0, 0);
        }
        nnImg1.src = nnimg1_url;
});

// Listens for nnImg_2
socket.on('nnImg_2', function(msg){
        console.log("Update 2nd Nearest img!")
        let arrayBufferView = new Uint8Array(msg['image']);
        nnImg2Name = msg['filename'];

        var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
        var nnimg2_url = URL.createObjectURL(blob);
        console.log(nnimg2_url);
        nnImg2.onload = function () {
            nnImg2Ctx.drawImage(nnImg2, 0, 0);
        }
        nnImg2.src = nnimg2_url;
});

// Listens for nnImg_2
socket.on('nnImg_3', function(msg){
        console.log("Update 3rd Nearest img!")
        let arrayBufferView = new Uint8Array(msg['image']);
        nnImg3Name = msg['filename'];

        var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
        var nnimg3_url = URL.createObjectURL(blob);
        console.log(nnimg3_url);
        nnImg3.onload = function () {
            nnImg3Ctx.drawImage(nnImg3, 0, 0);
        }
        nnImg3.src = nnimg3_url;

});

// nnImg_X Click Handler
nnImg1Canvas.addEventListener("click", function() {
    console.log("nnImg_1, was clicked");
    socket.emit("nnImgClick", {idx: 1, filename: nnImg1Name})
})
nnImg2Canvas.addEventListener("click", function() {
    console.log("nnImg_2, was clicked")
    socket.emit("nnImgClick", {idx: 2, filename: nnImg2Name})
})
nnImg3Canvas.addEventListener("click", function() {
    console.log("nnImg_3, was clicked")
    socket.emit("nnImgClick", {idx: 3, filename: nnImg3Name})
})

// FPS limit
let lastKeyPressedTime = 0;
window.addEventListener("keypress", keyEventHandler, false);
function keyEventHandler(event){
       const currentTime = new Date().getTime();
       if (currentTime - lastKeyPressedTime > 30) { // 100ms = 0.1 second
           lastKeyPressedTime = currentTime;
           socket.emit("key_control", {key: event.key, step: step})
        console.log(event.key);
       } else {
          console.log("Too many requests!");
       }
}

// Pose Reset
const reset = document.getElementById('reset');
reset.addEventListener('click', function() {
    console.log("pose_reset")
    socket.emit("pose_reset")
})