// Author: Josh Menzies -  https://jmenzies722.github.io/Menzies-Portfolio/port.html
var Detector = {

    // Check if canvas is supported
    canvas: !!window.CanvasRenderingContext2D,

    // Check if WebGL is supported
    webgl: (function () {
        try {
            return !!(
                window.WebGLRenderingContext &&
                !!document.createElement('canvas').getContext('experimental-webgl')
            );
        } catch (e) {
            return false;
        }
    })(),