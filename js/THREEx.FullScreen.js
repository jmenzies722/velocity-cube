var THREEx = THREEx || {};
THREEx.FullScreen = THREEx.FullScreen || {};

/**
 * Checks if fullscreen API is available
 * @returns {Boolean} true if fullscreen API is available, false otherwise
 */
THREEx.FullScreen.available = function () {
    return this._hasWebkitFullScreen || this._hasMozFullScreen;
};

/**
 * Checks if fullscreen is currently activated
 * @returns {Boolean} true if fullscreen is currently activated, false otherwise
 */
THREEx.FullScreen.activated = function () {
    if (this._hasWebkitFullScreen) {
        return document.webkitIsFullScreen;
    } else if (this._hasMozFullScreen) {
        return document.mozFullScreen;
    } else {
        console.assert(false);
    }
};

/**
 * Requests fullscreen on a given element
 * @param {DomElement} element - Element to make fullscreen (optional, defaults to document.body)
 */
THREEx.FullScreen.request = function (element) {
    element = element || document.body;
    if (this._hasWebkitFullScreen) {
        element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (this._hasMozFullScreen) {
        element.mozRequestFullScreen();
    } else {
        console.assert(false);
    }
};

/**
 * Cancels fullscreen
 */
THREEx.FullScreen.cancel = function () {
    if (this._hasWebkitFullScreen) {
        document.webkitCancelFullScreen();
    } else if (this._hasMozFullScreen) {
        document.mozCancelFullScreen();
    } else {
        console.assert(false);
    }
};

// Internal functions to determine which fullscreen API implementation is available
THREEx.FullScreen._hasWebkitFullScreen = 'webkitCancelFullScreen' in document ? true : false;
THREEx.FullScreen._hasMozFullScreen = 'mozCancelFullScreen' in document ? true : false;

/**
 * Binds a key to trigger fullscreen
 * @param {Object} opts - Options for binding the key
 * @param {Number} opts.charCode - Character code for the key (default is 'f')
 * @param {Boolean} opts.dblclick - Enable double-click to toggle fullscreen (default is false)
 * @param {DomElement} opts.element - Element to make fullscreen (optional)
 * @returns {Object} - An object with an 'unbind' function to remove the key binding
 */
THREEx.FullScreen.bindKey = function (opts) {
    opts = opts || {};
    var charCode = opts.charCode || 'f'.charCodeAt(0);
    var dblclick = opts.dblclick !== undefined ? opts.dblclick : false;
    var element = opts.element;

    var toggle = function () {
        if (THREEx.FullScreen.activated()) {
            THREEx.FullScreen.cancel();
        } else {
            THREEx.FullScreen.request(element);
        }
    };

    var onKeyPress = function (event) {
        if (event.which !== charCode) return;
        toggle();
    }.bind(this);

    document.addEventListener('keypress', onKeyPress, false);

    if (dblclick) {
        document.addEventListener('dblclick', toggle, false);
    }

    return {
        unbind: function () {
            document.removeEventListener('keypress', onKeyPress, false);
            if (dblclick) {
                document.removeEventListener('dblclick', toggle, false);
            }
        }
    };
};
