THREE.OrbitControls = function (object, domElement) {
    this.object = object;
    this.domElement = (domElement !== undefined) ? domElement : document;

	 // API properties
    this.enabled = true;
    this.center = new THREE.Vector3();
    this.userZoom = true;
    this.userZoomSpeed = 1.0;
    this.userRotate = true;
    this.userRotateSpeed = 1.0;
    this.userPan = true;
    this.userPanSpeed = 2.0;
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;
    this.minDistance = 0;
    this.maxDistance = Infinity;

	 // Keycodes for controlling the camera
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40, ROTATE: 65, ZOOM: 83, PAN: 68 };

	 // Internal variables
    let scope = this;
    const EPS = 0.000001;
    const PIXELS_PER_ROUND = 1800;
    let rotateStart = new THREE.Vector2();
    let rotateEnd = new THREE.Vector2();
    let rotateDelta = new THREE.Vector2();
    let zoomStart = new THREE.Vector2();
    let zoomEnd = new THREE.Vector2();
    let zoomDelta = new THREE.Vector2();
    let phiDelta = 0;
    let thetaDelta = 0;
    let scale = 1;
    let lastPosition = new THREE.Vector3();
    const STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
    let state = STATE.NONE;

	   // Event for notifying changes
    const changeEvent = { type: 'change' };

	 // Function to rotate the camera left
    this.rotateLeft = function (angle) {
        if (angle === undefined) {
            angle = getAutoRotationAngle();
        }
        thetaDelta -= angle;
    };
 // Function to rotate the camera right
    this.rotateRight = function (angle) {
        if (angle === undefined) {
            angle = getAutoRotationAngle();
        }
        thetaDelta += angle;
    };

	 // Function to rotate the camera up
    this.rotateUp = function (angle) {
        if (angle === undefined) {
            angle = getAutoRotationAngle();
        }
        phiDelta -= angle;
    };

	 // Function to rotate the camera down
    this.rotateDown = function (angle) {
        if (angle === undefined) {
            angle = getAutoRotationAngle();
        }
        phiDelta += angle;
    };

	 // Function to zoom in
    this.zoomIn = function (zoomScale) {
        if (zoomScale === undefined) {
            zoomScale = getZoomScale();
        }
        scale /= zoomScale;
    };

	// Function to zoom out
    this.zoomOut = function (zoomScale) {
        if (zoomScale === undefined) {
            zoomScale = getZoomScale();
        }
        scale *= zoomScale;
    };

	 // Function to pan the camera
    this.pan = function (distance) {
        distance.transformDirection(this.object.matrix);
        distance.multiplyScalar(scope.userPanSpeed);
        this.object.position.add(distance);
        this.center.add(distance);
    };

	    // Update the camera
    this.update = function () {
        let position = this.object.position;
        let offset = position.clone().sub(this.center);

        let theta = Math.atan2(offset.x, offset.z);
        let phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

        if (this.autoRotate) {
            this.rotateLeft(getAutoRotationAngle());
        }

        theta += thetaDelta;
        phi += phiDelta;

        phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));
        phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

        let radius = offset.length() * scale;

        radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

        offset.x = radius * Math.sin(phi) * Math.sin(theta);
        offset.y = radius * Math.cos(phi);
        offset.z = radius * Math.sin(phi) * Math.cos(theta);

        position.copy(this.center).add(offset);

        this.object.lookAt(this.center);

        thetaDelta = 0;
        phiDelta = 0;
        scale = 1;

        if (lastPosition.distanceTo(this.object.position) > 0) {
            this.dispatchEvent(changeEvent);
            lastPosition.copy(this.object.position);
        }
    };

    function getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
    }

    function getZoomScale() {
        return Math.pow(0.95, scope.userZoomSpeed);
    }

    function onMouseDown(event) {
        if (scope.enabled === false) return;
        if (scope.userRotate === false) return;

        event.preventDefault();

        if (state === STATE.NONE) {
            if (event.button === 0) state = STATE.ROTATE;
            if (event.button === 1) state = STATE.ZOOM;
            if (event.button === 2) state = STATE.PAN;
        }

        if (state === STATE.ROTATE) {
            rotateStart.set(event.clientX, event.clientY);
        } else if (state === STATE.ZOOM) {
            zoomStart.set(event.clientX, event.clientY);
        }
        
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);
    }

	 // Event listener for mouse down event
    function onMouseMove(event) {
        if (scope.enabled === false) return;
        event.preventDefault();
        
        if (state === STATE.ROTATE) {
            rotateEnd.set(event.clientX, event.clientY);
            rotateDelta.subVectors(rotateEnd, rotateStart);
            scope.rotateLeft(2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed);
            scope.rotateUp(2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed);
            rotateStart.copy(rotateEnd);
        } else if (state === STATE.ZOOM) {
            zoomEnd.set(event.clientX, event.clientY);
            zoomDelta.subVectors(zoomEnd, zoomStart);

            if (zoomDelta.y > 0) {
                scope.zoomIn();
            } else {
                scope.zoomOut();
            }

            zoomStart.copy(zoomEnd);
        }
    }

    function onMouseUp(event) {
        if (scope.enabled === false) return;
        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mouseup', onMouseUp, false);
        state = STATE.NONE;
    }

    function onMouseWheel(event) {
        if (scope.enabled === false) return;
        if (scope.userZoom === false) return;
        let delta = 0;

        if (event.wheelDelta) {
            delta = event.wheelDelta;
        } else if (event.detail) {
            delta = -event.detail;
        }

        if (delta > 0) {
            scope.zoomOut();
        } else {
            scope.zoomIn();
        }
    }

	 // Event listener for key down event
    function onKeyDown(event) {
        if (scope.enabled === false) return;
        if (scope.userPan === false) return;
        switch (event.keyCode) {
            case scope.keys.ROTATE:
                state = STATE.ROTATE;
                break;
            case scope.keys.ZOOM:
                state = STATE.ZOOM;
                break;
            case scope.keys.PAN:
                state = STATE.PAN;
                break;
        }
    }
        // Event listener for key up event
    function onKeyUp(event) {
        switch (event.keyCode) {
            case scope.keys.ROTATE:
            case scope.keys.ZOOM:
            case scope.keys.PAN:
                state = STATE.NONE;
                break;
        }
    }
 	// Add event listeners
    this.domElement.addEventListener('contextmenu', function (event) { event.preventDefault(); }, false);
    this.domElement.addEventListener('mousedown', onMouseDown, false);
    this.domElement.addEventListener('mousewheel', onMouseWheel, false);
    this.domElement.addEventListener('DOMMouseScroll', onMouseWheel, false);
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);
};

// Set the prototype of OrbitControls to inherit from EventDispatcher
THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
