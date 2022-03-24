/**
 * manage how to display output
 */

/** HTML element to display results */
let Output_resultboxEl, Output_progressEl, Output_progressBarEl, Output_progressLabelEl;
let Output_imitationCount, Output_wordLengthMin, Output_wordLengthMax;

/** Always call init first */
export function init(
    {
        resultboxQry = "#resultbox",
        progressQry = "#progress",
        progressBarQry = "#progressBar",
        progressLabelQry = "#progress label"
    } = {},
    {
        imitationCount = 10,
        wordLengthMin = 4,
        wordLengthMax = 15,
    } = {}
) {
    Output_resultboxEl = document.querySelector(resultboxQry);
    Output_progressEl = document.querySelector(progressQry);
    Output_progressBarEl = document.querySelector(progressBarQry);
    Output_progressLabelEl = document.querySelector(progressLabelQry);
    Output_imitationCount = imitationCount;
    Output_wordLengthMin = wordLengthMin;
    Output_wordLengthMax = wordLengthMax;
    hide(Output_progressEl);
}

export function showImitations(imitator) {
    Output_resultboxEl.innerHTML = "";
    const ulEl = document.createElement("ul");
    for (let imitationIndex = 0; imitationIndex < Output_imitationCount; imitationIndex++) {
        const liEl = document.createElement("li");
        liEl.innerHTML = imitator.imitate(Output_wordLengthMin, Output_wordLengthMax);
        ulEl.appendChild(liEl);
    }
    Output_resultboxEl.appendChild(ulEl);
}

export function scheduleProgressUpdate({ progressPct, title, isCompleted, }) {
    requestAnimationFrame(function animateProgressUpdate() {
        progressUpdate({ progressPct, title, isCompleted, });
    });
}

function progressUpdate({ progressPct, title, isCompleted, }) {
    if(isCompleted) {
        hide(Output_progressEl);
    } else {
        Output_progressLabelEl.innerHTML = title;
        Output_progressBarEl.max = 100;
        Output_progressBarEl.value = progressPct;
        show(Output_progressEl);
    }
}

function hide(el) {
    el.style.visibility = "hidden";
}

function show(el) {
    el.style.visibility = "visible";
}