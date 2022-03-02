import * as Rng from "./utils/random/rng.js";
import * as FP from "./utils/fp.js";
import * as Types from "./utils/types.js";


/**
 * Object that models string learning and imitation
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
        this.chain = Types.newDict();
        FP.pipe(
            FP.trim,
            FP.splitLines,
            FP.forEach(
                FP.pipe(
                    FP.prepend(this.ANCHORSTART),
                    FP.append(this.ANCHOREND),
                    FP.asArray,
                    FP.forEach(function iterWord(_char, charIndex, word) {
                        const leftSlice = FP.slice2(0, charIndex)(word);
                        const rightSlice = FP.slice1(charIndex)(word);
                        const premise = FP.last(leftSlice);
                        const nextChunk = FP.first(rightSlice);
                        this.addMatch(premise, nextChunk);
                    }.bind(this)),
                )
            ),
        )(exampleText);
        console.log(this.chain);
        for (const premise of Object.keys(this.chain)) {
            let premiseWeight = 0;
            for (const nextChunk of Object.keys(this.chain[premise])) {
                premiseWeight += this.chain[premise][nextChunk].weight;
            }
            this.chain[premise].weight = premiseWeight;
        }

    },
    /**
     * Learn that this character can be followed by this next character
     * @param {string} premise this character
     * @param {string} nextChunk the following character
     */
    addMatch(premise, nextChunk) {
        if (premise === undefined || nextChunk === undefined) {
            console.log(premise, nextChunk);
            return;
        }
        if (this.chain[premise] === undefined) {
            /// premise is new as a left character
            this.chain[premise] = Types.newDict();
        }
        if (this.chain[premise][nextChunk] === undefined) {
            /// nextChunk is new as a next character
            this.chain[premise][nextChunk] = Types.newDict();
            this.chain[premise][nextChunk].weight = 1;
        } else {
            this.chain[premise][nextChunk].weight += 1;
        }
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
        return this.rng.selectWeightedDict(this.chain[premise], exceptionKeys);
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