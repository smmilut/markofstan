/**
 * manage how to display output
 */

/** HTML element to display results */
let Output_resultboxEl;
let Output_imitationCount, Output_wordLengthMin, Output_wordLengthMax;

/** Always call init first */
export function init(
    {
        resultboxid = "resultbox",
    } = {},
    {
        imitationCount = 15,
        wordLengthMin = 5,
        wordLengthMax = 12,
    } = {}
) {
    Output_resultboxEl = document.getElementById(resultboxid);
    Output_imitationCount = imitationCount;
    Output_wordLengthMin = wordLengthMin;
    Output_wordLengthMax = wordLengthMax;
}

export function showImitations(learner) {
    Output_resultboxEl.innerHTML = "";
    const ulEl = document.createElement("ul");
    for (let imitationIndex = 0; imitationIndex < Output_imitationCount; imitationIndex++) {
        const liEl = document.createElement("li");
        liEl.innerHTML = learner.imitate(Output_wordLengthMin, Output_wordLengthMax);
        ulEl.appendChild(liEl);
    }
    Output_resultboxEl.appendChild(ulEl);
}
