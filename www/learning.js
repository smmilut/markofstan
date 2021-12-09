import * as Rng from "./utils/random/rng.js";

/** New dictionary */
function newDict() {
    return Object.create(null);
}

/**
 * Object that models string learning and imitation
 */
const Learner = {
    ANCHORSTART: "^",
    ANCHOREND: "$",
    init: function Learner_init(exampleText) {
        this.rng = Rng.newRng({ seed: 0 });
        this.parse(exampleText);
    },
    /**
     * Learn from example text
     * @param {string} exampleText example strings separated by newlines
     */
    parse: function Learner_parse(exampleText) {
        this.chain = newDict();
        const exampleStrings = exampleText.trim().split(/\r\n|\r|\n/g);
        for (const exampleString of exampleStrings) {
            /// split string characters, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
            const exampleChars = [...(this.ANCHORSTART + exampleString + this.ANCHOREND)];
            for (let charIndex = 0; charIndex < exampleChars.length - 1; charIndex++) {
                const thisChar = exampleChars[charIndex];
                const nextChar = exampleChars[charIndex + 1];
                this.addMatch(thisChar, nextChar);
            }
        }
        console.log(this.chain);
        for (const char of Object.keys(this.chain)) {
            let charWeight = 0;
            for (const secondChar of Object.keys(this.chain[char])) {
                charWeight += this.chain[char][secondChar].weight;
            }
            this.chain[char].weight = charWeight;
        }

    },
    /**
     * Learn that this character can be followed by this next character
     * @param {string} thisChar this character
     * @param {string} nextChar the following character
     */
    addMatch: function Learner_addMatch(thisChar, nextChar) {
        if (this.chain[thisChar] === undefined) {
            /// thisChar is new as a left character
            this.chain[thisChar] = newDict();
        }
        if (this.chain[thisChar][nextChar] === undefined) {
            /// nextChar is new as a next character
            this.chain[thisChar][nextChar] = { weight: 1 };
        } else {
            this.chain[thisChar][nextChar].weight += 1;
        }
    },
    /**
     * Imitate the examples, and provide a random character that is likely to follow `char`
     * @param {string} char preceding character
     * @param {boolean} canEnd are we allowed to give the termination character
     * @returns random character that is likely to follow char
     */
    imitateCharAfter: function Learner_imitateCharAfter(char, canEnd) {
        let exceptionKeys;
        if (canEnd) {
            exceptionKeys = []
        } else {
            exceptionKeys = [this.ANCHOREND];
        }
        return this.rng.selectWeightedDict(this.chain[char], exceptionKeys);
    },
    /**
     * Generate a random word that imitates the example strings
     * @param {integer} wordLengthMin minimum word length
     * @param {integer} wordLengthMax maximum word length
     * @returns a string that imitates the example strings
     */
    imitate: function Learner_imitate(wordLengthMin, wordLengthMax) {
        let imitatedString = "";
        let char = this.ANCHORSTART;
        for (let charIndex = 0; charIndex < wordLengthMax; charIndex++) {
            const canEnd = charIndex > wordLengthMin;
            if (this.chain[char] === undefined) {
                /// No next character.
                if (canEnd) {
                    return imitatedString;
                } else {
                    /// Ending prematurely.
                    return imitatedString + "!";
                }
            }
            char = this.imitateCharAfter(char, canEnd);
            if (char === undefined) {
                /// Ending prematurely.
                return imitatedString + "!!";
            } else if (char === this.ANCHOREND) {
                // Ending inside bounds
                return imitatedString + ".";
            } else {
                /// continue progress
                imitatedString += char;
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