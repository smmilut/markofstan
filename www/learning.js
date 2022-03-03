import * as Rng from "./utils/random/rng.js";
import * as FP from "./utils/fp.js";
import { Dict } from "./utils/dict.js";

const ANCHORSTART = "^";
const ANCHOREND = "$";

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
 * @returns {Dict} Markov chain represented as a Dict(premise -> Dict(nextChunk -> {weight}))
 */
const parseTextToChain = FP.pipe(
    splitLines,
    FP.flatMap(splitWordMatches),
    FP.reduce(addToChain, newChain()),
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
        this.chain = parseTextToChain(exampleText);
        console.log("chain", this.chain);
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

/**
 * Object that models string imitation
 */
const Imitator = {
    init(chain, seed = 0) {
        this.rng = Rng.newRng({ seed: seed });
        this.chain = chain;
    },
    /**
     * Imitate the examples, and provide a random character that is likely to follow `char`
     * @param {string} premise preceding character
     * @param {boolean} canEnd are we allowed to give the termination character
     * @returns random character that is likely to follow char
     */
    imitateCharAfter(premise, canEnd) {
        let exceptionKeys;
        if (canEnd) {
            exceptionKeys = []
        } else {
            exceptionKeys = [ANCHOREND];
        }
        return this.rng.selectWeightedDict(this.chain[premise], exceptionKeys).key;
    },
    /**
     * Generate a random word that imitates the example strings
     * @param {integer} wordLengthMin minimum word length
     * @param {integer} wordLengthMax maximum word length
     * @returns a string that imitates the example strings
     */
    imitate(wordLengthMin, wordLengthMax) {
        let imitatedString = "";
        let chunk = ANCHORSTART;
        for (let charIndex = 0; charIndex < wordLengthMax; charIndex++) {
            const canEnd = charIndex > wordLengthMin;
            if (this.chain[chunk] === undefined) {
                /// No next character.
                if (canEnd) {
                    return imitatedString;
                } else {
                    /// Ending prematurely.
                    return imitatedString + "!";
                }
            }
            chunk = this.imitateCharAfter(chunk, canEnd);
            if (chunk === undefined) {
                /// Ending prematurely.
                return imitatedString + "!!";
            } else if (chunk === ANCHOREND) {
                // Ending inside bounds
                return imitatedString + ".";
            } else {
                /// continue progress
                imitatedString += chunk;
            }
        }
        return imitatedString;
    },
};

/**
 * Instantiate a new Imitator
 * @param {Dict} chain Markov chained learned
 * @returns new Imitator instance
 */
 export function newImitator(...args) {
    const imitator = Object.create(Imitator);
    imitator.init(...args);
    return imitator;
}