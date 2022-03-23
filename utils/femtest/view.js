/**
 * view test results in the document
 * @param {object} results test results
 * @param {string} selector DOM selector of parent element
 * @param {object} doc the `document`
 */
export function view(results, selector, doc = document) {
    const elParent = doc.querySelector(selector);
    /// Append global test summary
    const elSummary = updateGlobalSummary(results.summary, doc);
    elParent.appendChild(elSummary);
    /// Promise to view each result
    results.promises.forEach(function promiseView(resultPromise) {
        resultPromise.then(
            function viewResult(result) {
                createResultGroup(result.groupName, elParent, doc);
                addResultToGroup(result, doc);
                updateGlobalSummary(results.summary, doc);
            }
        );
    });
}

/**
 * Create or update the result group
 * @param {string} groupName 
 * @param {Node} elParent parent Element where the group's Element will be appended if it is newly created
 * @param {object} doc the `document`
 * @returns {Node} HTML element for the result group
 */
function createResultGroup(groupName, elParent, doc = document) {
    const idGroup = groupNameToId(groupName);
    let elGroup = doc.getElementById(idGroup);
    if (!elGroup) {
        /// Create Section
        const elGroup = doc.createElement("section");
        elGroup.setAttribute("id", idGroup);
        elGroup.classList.add("box");
        /// Append header
        const elGroupHeader = doc.createElement("h3");
        elGroupHeader.textContent = `Tests for ${groupName} :`;
        elGroup.appendChild(elGroupHeader);
        elParent.appendChild(elGroup);
    }
    return elGroup;
}

/**
 * Sanitize and standardize the HTML id for test groups
 * @param {string} groupName 
 * @returns {string} ID usable for HTML
 */
function groupNameToId(groupName) {
    return `femtestGroup-${groupName.replace(/[^a-zA-Z0-9]+/g, "_")}`;
}

/**
 * Generate the result HTML and append it to the group's Node
 * @param {object} result { description, index, groupName, isCompleted, isPass, error, returned }
 * @param {object} doc the `document`
 * @returns {Node} HTML element for the test result
 */
function addResultToGroup(result, doc = document) {
    const idGroup = groupNameToId(result.groupName);
    const elGroup = doc.getElementById(idGroup);
    const elResult = resultToHtml(result, doc = document)
    elGroup.appendChild(elResult);
    return elResult;
}

/**
 * Generate the HTML for this test result, and return it
 * @param {object} result { description, index, groupName, isCompleted, isPass, error, returned }
 * @param {object} doc the `document`
 * @returns {Node} HTML element for the test result
 */
function resultToHtml(result, doc = document) {
    /// Create result
    const elResult = doc.createElement("article");
    /// Append result content
    const elResultPassFailIcon = doc.createElement("span");
    elResultPassFailIcon.classList.add("passfailIcon");
    const elResultPassFail = doc.createElement("span");
    elResultPassFail.classList.add("passfailText");
    const elResultDescription = doc.createElement("span");
    const elResultInfo = doc.createElement("p");
    if (result.isPass) {
        elResult.classList.add("pass");
        elResultPassFailIcon.textContent = "\u2714";
        elResultPassFailIcon.classList.add("passIcon");
        elResultPassFail.textContent = "OK";
        elResultPassFail.classList.add("passText");
        elResultDescription.textContent = `it should "${result.description}".`;
        if (result.returned !== undefined) {
            elResultInfo.textContent = `Returned : ${result.returned}`;
        }
    } else {
        elResult.classList.add("fail");
        elResultPassFailIcon.textContent = "\u2718";
        elResultPassFailIcon.classList.add("failIcon");
        elResultPassFail.textContent = "FAIL";
        elResultPassFail.classList.add("failText");
        elResultDescription.textContent = `it doesn't "${result.description}"`;
        if (result.error !== undefined) {
            const elError = doc.createElement("p");
            elError.classList.add("errorMsg");
            elError.innerHTML = `<code>${result.error}</code>`;
            elResultInfo.appendChild(elError);
            if (result.error.stack !== undefined) {
                const elStack = doc.createElement("pre");
                elStack.classList.add("stackTrace");
                elStack.textContent = `${result.error.stack}`;
                elResultInfo.appendChild(elStack);
            }
        }
    }
    elResult.appendChild(elResultPassFailIcon);
    elResult.appendChild(elResultPassFail);
    elResult.appendChild(elResultDescription);
    elResult.appendChild(elResultInfo);

    return elResult;
}

/**
 * Create or update the global summary
 * @param {object} summary { totalLength, totalRun, countOk, countFail }
 * @param {object} doc the `document`
 * @returns {Node} HTML element for the summary of test results
 */
function updateGlobalSummary(summary, doc = document) {
    const elSummary = createOrGetSummary("femtestGlobalSummary", doc);
    clearSummary(elSummary);
    /// Append title
    const elSummaryTitle = createSummaryTitle(doc);
    elSummary.appendChild(elSummaryTitle);
    /// Append summary result
    const elPassFailProgress = createSummaryPassFailProgress(summary, doc);
    elSummary.appendChild(elPassFailProgress);
    /// Append summary details line
    const elSummaryDetails = createSummaryDetailsLine(summary, doc);
    elSummary.appendChild(elSummaryDetails);
    return elSummary;
}

function createOrGetSummary(idSummary, doc = document) {
    let elSummary = doc.getElementById(idSummary);
    if (!elSummary) {
        /// Create summary section
        elSummary = doc.createElement("summary");
        elSummary.setAttribute("id", idSummary);
        elSummary.classList.add("box");
    }
    return elSummary;
}

function clearSummary(elSummary) {
    elSummary.innerHTML = "";
    return elSummary;
}

function createSummaryTitle(doc = document) {
    const elSummaryTitle = doc.createElement("h3");
    elSummaryTitle.textContent = "Summary :";
    return elSummaryTitle;
}

function createSummaryPassFailProgress(summary, doc = document) {
    const elContainer = doc.createElement("div");
    const elPassOrFail = doc.createElement("p");
    const elPassFailIcon = doc.createElement("span");
    elPassFailIcon.classList.add("passfailIcon");
    const elPassFailText = doc.createElement("span");
    elPassFailText.classList.add("passfailText");
    if (summary.totalRun < summary.totalLength) {
        /// progress
        elPassFailIcon.textContent = "\u231B";
        elPassFailIcon.classList.add("progressIcon");
        const progressPct = (100 * summary.totalRun / summary.totalLength).toFixed(1);
        elPassFailText.textContent = `IN PROGRESS ${progressPct}%`;
        elPassFailText.classList.add("progress");
        const elProgressBar = doc.createElement("progress");
        elProgressBar.max = 100;
        elProgressBar.value = progressPct;
        elContainer.appendChild(elProgressBar);
    } else if (summary.countFail === 0) {
        /// pass
        elPassFailIcon.textContent = "\u2714";
        elPassFailIcon.classList.add("passIcon");
        elPassFailText.textContent = "SUCCESS";
        elPassFailText.classList.add("passText");
    } else {
        /// fail
        elPassFailIcon.textContent = "\u2718";
        elPassFailIcon.classList.add("failIcon");
        elPassFailText.textContent = "FAILED";
        elPassFailText.classList.add("failText");
    }
    elPassOrFail.appendChild(elPassFailIcon);
    elPassOrFail.appendChild(elPassFailText);
    elContainer.appendChild(elPassOrFail);
    return elContainer;
}

function createSummaryDetailsLine(summary, doc = document) {
    const elSummaryDetails = doc.createElement("p");
    const elProgressSpan = doc.createElement("span");
    const elFailSpan = doc.createElement("span");
    const elPassSpan = doc.createElement("span");
    elProgressSpan.textContent = `${summary.totalRun}/${summary.totalLength} ran = `;
    const elFirstFail = updateFirstFailId("firstFail", doc);
    const failText = `${summary.countFail} FAIL`;
    if (elFirstFail) {
        const elAnchor = doc.createElement("a");
        elAnchor.setAttribute("href", "#firstFail");
        elAnchor.textContent = failText;
        elFailSpan.appendChild(elAnchor);
    } else {
        elFailSpan.textContent = failText;
    }
    elPassSpan.textContent = ` + ${summary.countOk} OK`;
    elSummaryDetails.appendChild(elProgressSpan);
    elSummaryDetails.appendChild(elFailSpan);
    elSummaryDetails.appendChild(elPassSpan);
    return elSummaryDetails;
}

/**
 * Update which test has the "firstFail" ID
 * @param {string} id "firstFail"
 * @param {object} doc the `document`
 * @returns {Node} HTML element for the first failed test, if it exists (or null)
 */
function updateFirstFailId(id, doc = document) {
    const elOldFirstFail = doc.querySelector(`#${id}`);
    const elNewFirstFail = doc.querySelector(".fail");
    if (elOldFirstFail) {
        elOldFirstFail.removeAttribute("id");
    }
    if (elNewFirstFail) {
        elNewFirstFail.id = id;
    }
    return elNewFirstFail;
}

/**
 * View the list of tested files
 * @param {Array} filenames array of file paths
 * @param {string} selector DOM selector of parent element
 * @param {object} doc the `document`
 */
export function viewFileList(filenames, selector, doc = document) {
    const elParent = doc.querySelector(selector);
    const listItems = filenames.map(function fileNameToLi(filename) {
        const elLi = doc.createElement("li");
        elLi.textContent = filename;
        return elLi;
    });
    listItems.forEach(function appendToParent(elLi) {
        elParent.appendChild(elLi);
    });
}