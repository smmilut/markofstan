import { gatherFiles } from "./files.js";
import { Test } from "./test.js";
import { view, viewFileList } from "./view.js";

/**
 * Get list of test files, load tests, run them, display results
 */
async function gatherRunView() {
    const filenames = await gatherFiles("./femtest.config.json");
    viewFileList(filenames, "#filelist", document);
    view(Test.getResultPromises(), "#results", document);
}

/// GO
gatherRunView();
