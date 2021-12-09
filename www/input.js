import * as Controller from "./controller.js";
/**
 * manage user input and communicate with the Controller
 */

/** HTML element for inputting example strings */
let examplesEl;
let learnButton;
let imitateButton;

/** Always call init first */
export function init(htmlIds) {
    examplesEl = document.getElementById(htmlIds.examplesId);
    learnButton = document.getElementById(htmlIds.learnButtonId);
    learnButton.addEventListener("click", learnClicked);
    imitateButton = document.getElementById(htmlIds.imitateButtonId);
    imitateButton.addEventListener("click", imitateClicked);
}

/** Learn button clicked */
function learnClicked(_event) {
    const exampleText = examplesEl.value;
    Controller.onAskLearn(exampleText);
}

/** imitate button clicked */
function imitateClicked(_event) {
    Controller.onAskImitate();
}

export function disableImitateButton() {
    imitateButton.disabled = true;
}

export function enableImitateButton() {
    imitateButton.disabled = false;
}
