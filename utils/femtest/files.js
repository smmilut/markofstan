import { requestJson } from "./httpUtils.js";

/**
 * @param {string} configPath path to config file
 * @returns {Array} filenames
 */
async function getFilenames(configPath) {
    const config = await requestJson({ url: configPath });
    return config.testFiles;
}

/**
 * Dynamically import modules from filenames, for side effects only
 * @param {Array} filenames 
 */
async function loadModulesFromFilenames(filenames) {
    const modulePromises = filenames.map(function loadModule(file) {
        return import(file);
    });
    await Promise.all(modulePromises);
    return modulePromises;
}

/**
 * Load modules whose filenames are listed at `configPath`
 * @param {string} configPath path to config file
 */
export async function gatherFiles(configPath) {
    const filenames = await getFilenames(configPath);
    await loadModulesFromFilenames(filenames);
    return filenames;
}
