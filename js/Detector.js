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

    // Check if Web Workers are supported
    workers: !!window.Worker,

    // Check if File API is supported
    fileapi: window.File && window.FileReader && window.FileList && window.Blob,

    // Create and return an error message for WebGL support
    getWebGLErrorMessage: function () {
        var element = document.createElement('div');
        element.id = 'webgl-error-message';
        element.style.fontFamily = 'monospace';
        element.style.fontSize = '13px';
        element.style.fontWeight = 'normal';
        element.style.textAlign = 'center';
        element.style.background = '#fff';
        element.style.color = '#000';
        element.style.padding = '1.5em';
        element.style.width = '400px';
        element.style.margin = '5em auto 0';

        if (!this.webgl) {
            element.innerHTML = window.WebGLRenderingContext
                ? 'Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />' +
                  'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
                : 'Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>' +
                  'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.';
        }

        return element;
    },

    // Add an error message for WebGL support to a specified parent
    addGetWebGLMessage: function (parameters) {
        parameters = parameters || {};
        var parent = parameters.parent !== undefined ? parameters.parent : document.body;
        var id = parameters.id !== undefined ? parameters.id : 'oldie';

        var element = this.getWebGLErrorMessage();
        element.id = id;

        parent.appendChild(element);
    },
};