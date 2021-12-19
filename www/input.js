import * as Controller from "./controller.js";
/**
 * manage user input and communicate with the Controller
 */

/** HTML element for inputting example strings */
let Input_examplesEl;
let Input_learnButton;
let Input_imitateButton;

/** Always call init first */
export function init(
    {
        examplesId = "examples",
        learnButtonId = "learnButton",
        imitateButtonId = "imitateButton",
    } = {}
) {
    Input_examplesEl = document.getElementById(examplesId);
    Input_learnButton = document.getElementById(learnButtonId);
    Input_learnButton.addEventListener("click", learnClicked);
    Input_imitateButton = document.getElementById(imitateButtonId);
    Input_imitateButton.addEventListener("click", imitateClicked);
}

/** Learn button clicked */
function learnClicked(_event) {
    const exampleText = Input_examplesEl.value;
    Controller.onAskLearn(exampleText);
}

/** imitate button clicked */
function imitateClicked(_event) {
    Controller.onAskImitate();
}

export function disableImitateButton() {
    Input_imitateButton.disabled = true;
}

export function enableImitateButton() {
    Input_imitateButton.disabled = false;
}
