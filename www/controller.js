import * as Input from "./input.js";
import * as Output from "./output.js";
import * as Learning from "./learning.js";

/**
 * manage what to do on input
 */

/** Object that learns from strings */
let learner;

/** Always call init first */
export function init() {
    Input.disableImitateButton();
}

/** Input sends new example text */
export function onAskLearn(exampleText) {
    learner = Learning.newLearner(exampleText);
    Input.enableImitateButton();
}

/** Input asks for imitations */
export function onAskImitate() {
    if (learner !== undefined) {
        Output.showImitations(learner);
    }
}
