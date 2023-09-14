var THREEx = THREEx || {};

/**
 * THREEx.WindowResize helps handle window resizing.
 * It updates the renderer and camera when the window is resized.*/

THREEx.WindowResize = function (renderer, camera) {
    var callback = function () {
        // Notify the renderer of the size change
        renderer.setSize(window.innerWidth, window.innerHeight);
        // Update the camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    };


window.addEventListener('resize', callback, false);

    // Return .stop() function to stop watching window resize
    return {
        stop: function () {
        window.removeEventListener('resize', callback);
        }
    };
};
