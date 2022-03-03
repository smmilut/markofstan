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
        imitationCount = 10,
        wordLengthMin = 4,
        wordLengthMax = 15,
    } = {}
) {
    Output_resultboxEl = document.getElementById(resultboxid);
    Output_imitationCount = imitationCount;
    Output_wordLengthMin = wordLengthMin;
    Output_wordLengthMax = wordLengthMax;
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
