import * as Controller from "./controller.js";
import * as Input from "./input.js";
import * as Output from "./output.js";

/**
 * Init all sub modules
 * 
 * Call this first.
 */
 function initSubModules() {
    Input.init();
    Output.init();
    Controller.init();
}

(function init() {
    initSubModules();
})();
