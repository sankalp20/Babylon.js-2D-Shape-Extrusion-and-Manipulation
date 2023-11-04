import * as BABYLON from '@babylonjs/core';

var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);

var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 5, BABYLON.Vector3.Zero(), scene);
camera.attachControl(canvas, true);

var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// Create a ground plane
var ground = BABYLON.Mesh.CreateGround("ground", 6, 6, 2, scene);
var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
groundMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); // Set the ground color to black
ground.material = groundMaterial;

var drawingMode = false;
var lines = [];
var currentLine = null;
var dots = [];

var drawButton = document.getElementById("drawButton");
var doneButton = document.getElementById("doneButton");

drawButton.addEventListener("click", function () {
    drawingMode = true;
    dots = [];
    currentLine = null; // Clear the current line
    doneButton.disabled = false;
});

doneButton.addEventListener("click", function () {
    drawingMode = false;
    if (dots.length >= 2) {
        // Connect the dots with a line
        var line = createLineMesh(dots);
        lines.push(line);

        // Extrude the lines to give them a 3D appearance
        extrudeLinesTo3D(lines);
    }
    dots = [];
    doneButton.disabled = true;
});

canvas.addEventListener("pointerdown", function (event) {
    if (drawingMode) {
        var pickResult = scene.pick(event.clientX, event.clientY);
        if (pickResult.hit && pickResult.pickedMesh === ground) {
            var dotPosition = pickResult.pickedPoint.clone();
            dots.push(dotPosition);
            if (currentLine) {
                currentLine.dispose(); // Dispose of the old line
            }
            currentLine = createLineMesh(dots); // Update the line mesh in real-time
        }
    }
});

engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});

function createLineMesh(points) {
    if (points.length < 2) {
        return null;
    } else {
        return BABYLON.Mesh.CreateLines("line", points, scene);
    }
}

function extrudeLinesTo3D(lines) {
    var extrusionSettings = {
        amount: 5, // Extrusion height
        cap: BABYLON.Mesh.CAP_ALL,
    };

    for (var i = 0; i < lines.length; i++) {
        var extrudedLine = BABYLON.MeshBuilder.ExtrudeShape("extrudedLine", { shape: lines[i], ...extrusionSettings }, scene);
        extrudedLine.position.y = 0.01; // Slightly raise the extruded lines above the ground
    }
}