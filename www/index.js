import * as Controller from "./controller.js";
import * as Input from "./input.js";
import * as Output from "./output.js";

/**
 * Init all sub modules
 * 
 * Call this first.
 */
 function initSubModules() {
    Input.init({
        examplesId: "examples",
        learnButtonId: "learnButton",
        imitateButtonId: "imitateButton",
    });
    Output.init(
        {
            resultboxid: "resultbox",
        },
        {
            imitationCount: 15,
            wordLengthMin: 5,
            wordLengthMax: 12,
        },
    );
    Controller.init();
}

(function init() {
    initSubModules();
})();
