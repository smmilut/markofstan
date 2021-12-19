/**
 * manage how to display output
 */

/** HTML element to display results */
let resultboxEl;
let imitationCount, wordLengthMin, wordLengthMax;

/** Always call init first */
export function init(htmlIds, options) {
    resultboxEl = document.getElementById(htmlIds.resultboxid);
    imitationCount = options.imitationCount;
    wordLengthMin = options.wordLengthMin;
    wordLengthMax = options.wordLengthMax;
}

export function showImitations(learner) {
    resultboxEl.innerHTML = "";
    const ulEl = document.createElement("ul");
    for (let imitationIndex = 0; imitationIndex < imitationCount; imitationIndex++) {
        const liEl = document.createElement("li");
        liEl.innerHTML = learner.imitate(wordLengthMin, wordLengthMax);
        ulEl.appendChild(liEl);
    }
    resultboxEl.appendChild(ulEl);
}
