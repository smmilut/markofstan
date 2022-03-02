import * as Rng from "./utils/random/rng.js";
import * as FP from "./utils/fp.js";
import { Dict } from "./utils/dict.js";


/**
 * Object that models string learning and imitation
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
    ANCHORSTART: "^",
    ANCHOREND: "$",
    init(exampleText) {
        this.rng = Rng.newRng({ seed: 0 });
        this.parse(exampleText);
    },
    /**
     * Learn from example text
     * @param {string} exampleText example strings separated by newlines
     */
    parse(exampleText) {
        this.chain = Dict.new();
        FP.pipe(
            FP.trim,
            FP.splitLines,
            FP.forEach(FP.pipe(
                FP.prepend(this.ANCHORSTART),
                FP.append(this.ANCHOREND),
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
                FP.forEach(function buildChain({ premise, nextChunk }) {
                    this.chain[premise] = this.addMatch(nextChunk, this.chain[premise]);
                }.bind(this)),
            )),
        )(exampleText);
        console.log("chain", this.chain);
    },
    /**
     * Learn that this character can be followed by this next character
     * @param {string} premise this character
     * @param {string} nextChunk the following character
     */
    addMatch(nextChunk, nextChunksDict_old) {
        let nextChunksDict = Dict.copy(nextChunksDict_old);

        let nextChunkInfo = FP.copyObj(nextChunksDict[nextChunk]);
        if (nextChunkInfo.weight === undefined) {
            /// nextChunk is new as a next character
            nextChunkInfo.weight = 0;
        }
        nextChunkInfo.weight += 1;
        nextChunksDict[nextChunk] = nextChunkInfo;

        return nextChunksDict;
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
            exceptionKeys = [this.ANCHOREND];
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
        let chunk = this.ANCHORSTART;
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
            } else if (chunk === this.ANCHOREND) {
                // Ending inside bounds
                return imitatedString + ".";
            } else {
                /// continue progress
                imitatedString += chunk;
            }
        }
        return imitatedString;
    },
}

/**
 * Instantiate a new Learner
 * @param {string} exampleText example strings separated by newlines
 * @returns new Learner instance
 */
export function newLearner(exampleText) {
    const learner = Object.create(Learner);
    learner.init(exampleText);
    return learner;
}

function mergeChains(chain1, chain2) {
    const newChain = Dict.new();
}