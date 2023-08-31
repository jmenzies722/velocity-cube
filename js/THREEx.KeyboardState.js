var THREEx = THREEx || {};

/**
 * THREEx.KeyboardState.js keeps track of the current state of the keyboard.
 * It allows querying the keyboard state at any time without the need for events.
 * This is particularly useful in loop-driven applications, such as 3D demos or games.
 *
 * Usage:
 *
 * Step 1: Create the object
 *
 * var keyboard = new THREEx.KeyboardState();
 *
 * Step 2: Query the keyboard state
 *
 * This will return true if shift and A are pressed, false otherwise:
 *
 * keyboard.pressed("shift+A")
 *
 * Step 3: Stop listening to the keyboard
 *
 * keyboard.destroy();
 *
 * NOTE: This library may be useful as a standalone library, independent from three.js.
 * You can rename it to "keyboardForGame".
 */

THREEx.KeyboardState = function () {
    // To store the current state
    this.keyCodes = {};
    this.modifiers = {};

    // Create callbacks to bind/unbind keyboard events
    var self = this;
    this._onKeyDown = function (event) { self._onKeyChange(event, true); };
    this._onKeyUp = function (event) { self._onKeyChange(event, false); };

    // Bind key events
    document.addEventListener("keydown", this._onKeyDown, false);
    document.addEventListener("keyup", this._onKeyUp, false);
};

/**
 * To stop listening to keyboard events
 */
THREEx.KeyboardState.prototype.destroy = function () {
    // Unbind key events
    document.removeEventListener("keydown", this._onKeyDown, false);
    document.removeEventListener("keyup", this._onKeyUp, false);
};

THREEx.KeyboardState.MODIFIERS = ['shift', 'ctrl', 'alt', 'meta'];

THREEx.KeyboardState.ALIAS = {
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40,
    'space': 32,
    'pageup': 33,
    'pagedown': 34,
    'tab': 9
};

/**
 * To process the keyboard DOM event
 */
THREEx.KeyboardState.prototype._onKeyChange = function (event, pressed) {
    // Update this.keyCodes
    var keyCode = event.keyCode;
    this.keyCodes[keyCode] = pressed;

    // Update this.modifiers
    this.modifiers['shift'] = event.shiftKey;
    this.modifiers['ctrl'] = event.ctrlKey;
    this.modifiers['alt'] = event.altKey;
    this.modifiers['meta'] = event.metaKey;
};

/**
 * Query the keyboard state to know if a key is pressed or not
 *
 * @param {String} keyDesc - The description of the key (e.g., shift+A)
 * @returns {Boolean} - True if the key is pressed, false otherwise
 */
THREEx.KeyboardState.prototype.pressed = function (keyDesc) {
    var keys = keyDesc.split("+");
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var pressed;
        if (THREEx.KeyboardState.MODIFIERS.indexOf(key) !== -1) {
            pressed = this.modifiers[key];
        } else if (Object.keys(THREEx.KeyboardState.ALIAS).indexOf(key) != -1) {
            pressed = this.keyCodes[THREEx.KeyboardState.ALIAS[key]];
        } else {
            pressed = this.keyCodes[key.toUpperCase().charCodeAt(0)];
        }
        if (!pressed) return false;
    }
    return true;
};
