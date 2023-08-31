var THREEx = THREEx || {};

/**
 * THREEx.WindowResize helps handle window resizing.
 * It updates the renderer and camera when the window is resized.
 *
 * Usage:
 *
 * Step 1: Start updating the renderer and camera
 *
 * var windowResize = THREEx.WindowResize(aRenderer, aCamera);
 *
 * Step 2: Stop updating the renderer and camera
 *
 * windowResize.stop();
 */

THREEx.WindowResize = function (renderer, camera) {
    var callback = function () {
        // Notify the renderer of the size change
        renderer.setSize(window.innerWidth, window.innerHeight);
        // Update the camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    };

    // Bind the resize event
    window.addEventListener('resize', callback, false);

    // Return .stop() function to stop watching window resize
    return {
        /**
         * Stop watching window resize
         */
        stop: function () {
            window.removeEventListener('resize', callback);
        }
    };
};
