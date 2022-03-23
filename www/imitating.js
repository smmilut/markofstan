import * as Rng from "./utils/random/rng.js";
import * as Learning from "./learning.js";
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
            exceptionKeys = [Learning.ANCHOREND];
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
        let chunk = Learning.ANCHORSTART;
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
            } else if (chunk === Learning.ANCHOREND) {
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