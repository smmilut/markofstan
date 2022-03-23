export * from "./assert.js";

export const Test = (function build_Test() {
    const tests = [];
    return {
        /**
         * Write test with this.
         * 
         * @param {String} description test description in the present tense : "It should `description`"
         * @param {Function} runTest test function to run, throws on failure
         */
        itShould: function Test_itShould(description, runTest, groupName = "ungrouped") {
            tests.push({
                description,
                runTest,
                groupName,
            });
        },
        /**
         * run all tests and return results
         * @returns {object} {
                promises: [ Promise(result0), Promise(result1), ...],
                summary: { totalLength, totalRun, countOk, countFail },
            }
         */
        getResultPromises: function Test_getResultPromises() {
            const results = tests.reduce(
                function aggregateTestResultPromises(results, test, i) {
                    const resultPromise = (new Promise(
                        function promiseRunTest(resolve, _reject) {
                            resolve(test.runTest());
                        }
                    )).then(
                        function handleTestPass(value) {
                            results.summary.countOk++;
                            return {
                                returned: value,
                                isPass: true,
                            };
                        },
                        function handleTestFail(error) {
                            results.summary.countFail++;
                            return {
                                error: error,
                                isPass: false,
                            };
                        }
                    ).then(
                        function finishResult(result) {
                            results.summary.totalRun++;
                            return Object.assign({
                                description: test.description,
                                index: i,
                                groupName: test.groupName,
                                isCompleted: true,
                            }, result);
                        }
                    );
                    results.promises.push(resultPromise);
                    return results;
                },
                {
                    promises: [],
                    summary: {
                        totalLength: tests.length,
                        totalRun: 0,
                        countOk: 0,
                        countFail: 0,
                    },
                }
            );
            return results;
        },
    };
})();

/**
 * @param {string} groupName 
 * @returns function `itShould` preloaded with the groupName
 */
export function groupIt(groupName) {
    return function itShould(description, test) {
        return Test.itShould(description, test, groupName);
    };
}
