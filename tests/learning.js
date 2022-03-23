import * as Learning from "../www/learning.js";
import { groupIt, assert } from "../utils/femtest/test.js";
const itShould = groupIt("learning");

itShould("split a block of text", function splitBlock() {
    const text = `Cogip
Floteo
Soprotec
Sogefrap
Botea
Mireo
Cofrap
Sogiflup
`;
    const result = Learning.test.splitLines(text);
    const expected = [
        "Cogip",
        "Floteo",
        "Soprotec",
        "Sogefrap",
        "Botea",
        "Mireo",
        "Cofrap",
        "Sogiflup",
    ];
    assert.arraysEqual(result, expected);
});

itShould("parse a single word into an array of matches", function parseWord0() {
    const inputWord = "Oflloteo";
    const expected = [
        {
            premise: Learning.ANCHORSTART,
            nextChunk: "O",
        },
        {
            premise: "O",
            nextChunk: "f",
        }, {
            premise: "f",
            nextChunk: "l",
        }, {
            premise: "l",
            nextChunk: "l",
        }, {
            premise: "l",
            nextChunk: "o",
        }, {
            premise: "o",
            nextChunk: "t",
        }, {
            premise: "t",
            nextChunk: "e",
        }, {
            premise: "e",
            nextChunk: "o",
        }, {
            premise: "o",
            nextChunk: Learning.ANCHOREND,
        },
    ]
    const result = Learning.test.splitWordMatches(inputWord);
    assert.arraysEqual(result, expected, { equality: assert.objectsShallowStrictEqual });
});

itShould("add a new match to an empty chain", function addMatchEmptyChain() {
    const chain_orig = Learning.test.newChain();
    const result = Learning.test.addToChain(chain_orig, { premise: "X", nextChunk: "Y", });
    const expected = { "X": { "Y": { weight: 1 } } };
    assert.objectsDeepEqual(result, expected);
});

itShould("add the same match to an existing chain", function addSameMatchExistingChain() {
    const chain_orig = { "X": { "Y": { weight: 1 } } };
    const result = Learning.test.addToChain(chain_orig, { premise: "X", nextChunk: "Y", });
    const expected = { "X": { "Y": { weight: 2 } } };
    assert.objectsDeepEqual(result, expected);
});

itShould("add a different match to an existing chain", function addNewMatchExistingChain() {
    const chain_orig = { "X": { "Y": { weight: 1 } } };
    const result = Learning.test.addToChain(chain_orig, { premise: "X", nextChunk: "Z", });
    const expected = {
        "X": {
            "Y": { weight: 1 },
            "Z": { weight: 1 },
        }
    };
    assert.objectsDeepEqual(result, expected);
});
