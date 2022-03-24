import * as Input from "./input.js";
import * as Output from "./output.js";
import * as Learning from "./learning.js";
import * as Imitating from "./imitating.js";

/**
 * manage what to do on input
 */

/** Object that learns from strings */
let Controller_learner;
let Controller_imitator;

/** Always call init first */
export function init() {
    Input.disableImitateButton();
}

/** Input sends new example text */
export function onAskLearn(exampleText) {
    Controller_learner = Learning.newLearner();
    Controller_learner.learn(exampleText).then(function enableImitate() {
        onRequestProgressUpdate({
            progressPct: 100,
            title: "completed",
            isCompleted: true,
        });
        Controller_imitator = Imitating.newImitator(Controller_learner.chain);
        Input.enableImitateButton();
    });
}

/** Input asks for imitations */
export function onAskImitate() {
    if (Controller_learner !== undefined) {
        Output.showImitations(Controller_imitator);
    }
}

export const onRequestProgressUpdate = Output.scheduleProgressUpdate;
