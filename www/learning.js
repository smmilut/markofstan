import * as FP from "./utils/fp.js";
import { Dict } from "./utils/dict.js";
import { runBackground } from "./utils/background.js";
import * as Controller from "./controller.js";

export const ANCHORSTART = "^";
export const ANCHOREND = "$";

/**
 * @returns {Dict} a new empty Markov chain
 */
const newChain = Dict.new;

/**
 * @param {Dict} chainOld previous Markov chain
 * @param {match} match { premise, nextChunk } a chain link representing a match
 * @returns {Dict} the updated chain
 */
function addToChain(chainOld, { premise, nextChunk }) {
    /// Deep copy this chunk info only
    const chain = Dict.copy(chainOld);
    const nextChunksDict = Dict.copy(chain[premise]);
    const nextChunkInfo = FP.copyObj(nextChunksDict[nextChunk]);
    /// Create chunk info if it doesn't exist
    if (nextChunkInfo.weight === undefined) {
        nextChunkInfo.weight = 0;
    }
    /// Update weight
    nextChunkInfo.weight += 1;
    /// Update nextChunksDict copy
    nextChunksDict[nextChunk] = nextChunkInfo;
    /// Update chain copy
    chain[premise] = nextChunksDict;
    return chain;
}

/**
 * aggregates an array of matches into an existing chain
 * @param {Object} param {
 *   previousWorkDone: the existing chain
 *   latestWork: [ an array of :
 *     { premise, nextChunk },
 *   ]
 * }
 * @returns {Dict} chain
 */
function aggregateWorkToChain({ previousWorkDone: chainOld, latestWork: nextMatches, }) {
    return nextMatches.reduce(addToChain, chainOld);
}

/**
 * @param {integer} n 
 * @returns {Function} :: xs -> {
            nextWorkInput: the n first elements of xs,
            workRemaining: the remaining elements of xs,
        }
 */
function takeFromArray(n) {
    return function takeN(xs) {
        return {
            nextWorkInput: FP.slice2(0, n)(xs),
            workRemaining: FP.slice1(n)(xs),
        };
    };
}

/**
 * From one word, build an Array of "match" objects
 *   that each represent chain links that existed in the word.
 * @param {String} exampleWord representing one word example
 * @returns Array of matches : [{premise, nextChunk}, ...]
 */
const splitWordMatches = FP.pipe(
    FP.prepend(ANCHORSTART),
    FP.append(ANCHOREND),
    FP.asArray,
    FP.map(function sliceWord(_char, charIndex, word) {
        const leftSlice = FP.slice2(0, charIndex)(word);
        const rightSlice = FP.slice1(charIndex)(word);
        return {
            premise: FP.last(leftSlice),
            nextChunk: FP.first(rightSlice),
        };
    }),
    FP.filter(function removeEmpty({ premise, nextChunk }) {
        return premise !== undefined && nextChunk != undefined;
    }),
);

/**
 * Aggregate a new array into the existing array (not mutating inputs)
 * @param {object} param {
 *   previousWorkDone: existing array
 *   latestWork: new array
 * }
 * @returns 
 */
function aggregateWorkToArray({ previousWorkDone, latestWork, }) {
    return [...previousWorkDone, ...latestWork];
}

/**
 * @param {object} param {
 *   workRemaining: array of work
 * }
 * @returns {Boolean} 
 */
function isArrayWorkCompleted({ workRemaining, }) {
    return workRemaining === undefined || workRemaining.length === 0;
}

/**
 * Dispatch progress to the Controller
 * @param {String} title 
 * @returns {Function} :: { workInput, workRemaining, } -> (side effects)
 */
function namedProgressRemaining(title) {
    return function dispatchProgress({ workInput, workRemaining, }) {
        const progressPct = (workInput.length - workRemaining.length) * 100.0 / workInput.length;
        // console.log(title, "progress", progressPct);
        Controller.onRequestProgressUpdate({
            progressPct,
            title,
            isCompleted: progressPct >= 100,
        });
    };
}

/**
 * @param {String} exampleText example strings separated by newlines
 * @returns Array of lines, without empty lines
 */
const splitLines = FP.pipe(
    FP.trim,
    FP.splitLines,
);

/**
 * Build a Markov Chain from a list of string examples presented in a single line-separated text.
 * @param {String} exampleText example strings separated by newlines
 * @returns {Promise} that returns a Markov chain represented as a Dict(premise -> Dict(nextChunk -> {weight}))
 */
const parseTextToChain = FP.pipe(
    splitLines,
    runBackground({
        splitWork: takeFromArray(5000),
        doWork: FP.flatMap(splitWordMatches),
        aggregateWork: aggregateWorkToArray,
        initialWork: [],
        isWorkCompleted: isArrayWorkCompleted,
        dispatchProgress: namedProgressRemaining("(1/2) parsing"),
    }),
    FP.then(FP.pipe(
        FP.prop("workDone"),
        runBackground({
            splitWork: takeFromArray(2000),
            doWork: FP.identity,
            aggregateWork: aggregateWorkToChain,
            initialWork: newChain(),
            isWorkCompleted: isArrayWorkCompleted,
            dispatchProgress: namedProgressRemaining("(2/2) aggregating"),
        }),
    )),
    FP.then(
        FP.prop("workDone"),
    ),
);

/**
 * Object that models string learning
 * chain is :
 * {  // chain
 *   "premiseCharX" : {  // premise: { nextChunksDict }
 *     "nextCharX0": {  // nextChunk: { nextChunkInfo }
 *       weight: x0,  // nextChunkWeight
 *     },
 *     "nextCharX1": { weight: x1 },
 *     ...
 *   },
 *   "premiseCharY" : {
 *     "nextCharY0": { weight: y0 },
 *     "nextCharY1": { weight: y1 },
 *     ...
 *   },
 * }
 */
const Learner = {
    init() {
        this.chain = newChain();
    },
    /**
     * Learn from example text
     * @param {string} exampleText example strings separated by newlines
     */
    learn(exampleText) {
        return parseTextToChain(exampleText).then(function assignChain(c) {
            this.chain = c;
            console.log("chain", this.chain);
            return c;
        }.bind(this));
    },
};

/**
 * Instantiate a new Learner
 * @param {string} exampleText example strings separated by newlines
 * @returns new Learner instance
 */
export function newLearner() {
    const learner = Object.create(Learner);
    learner.init();
    return learner;
}

/** exported only for testing */
export const test = {
    newChain,
    addToChain,
    splitWordMatches,
    splitLines,
    parseTextToChain,
};
