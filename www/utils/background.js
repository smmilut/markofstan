/**
 * Return a function that takes work as a parameter and
 *   runs this work in the background using `requestIdleCallback`.
 * 
 * It :
 *  - splits work into chunks using options.splitWork :: workRemaining -> { nextWorkInput, workRemaining, }
 *  - performs work on a chunk using options.doWork :: nextWorkInput -> latestWork
 *  - aggregates the new work done with the previous work done using options.aggregateWork :: { previousWorkDone, latestWork, } -> workDone
 *  - starts the aggregation with the object options.initialWork
 *  - checks if work is completed using options.isWorkCompleted :: { latestWork, workDone, workRemaining, } -> bool
 *  - reports progress using options.dispatchProgress :: { workDone, workRemaining, } -> (side effects)
 *  - forces to run after a while, using the options.timeout that is sent to the corresponding `requestIdleCallback` option
 * 
 * The Promise resolves with an object like :
 * {
 *   workDone,              // the final result of the work
 *   workRemaining,         // for debugging, maybe there is some work not completed
 *   accumulatedDuration,   // (ms) the busy time : sum of durations of every time the work was run
 *   fullDuration,          // (ms) the time to complete, including idle time
 * }
 * For any exception during work, the Promise is rejected with the error.
 * 
 * @param {object} options 
 * @returns {Function} runBackgroundWithInput :: workInput -> Promise({ workDone, workRemaining, accumulatedDuration, fullDuration, })
 */
export function runBackground({
    splitWork,          // :: workRemaining -> { nextWorkInput, workRemaining, }
    doWork,             // :: nextWorkInput -> latestWork
    aggregateWork,      // :: { previousWorkDone, latestWork, } -> workDone
    initialWork,        // initial value of workDone (for having a previousWorkDone, e.g. [] to grow)
    isWorkCompleted,    // :: { latestWork, workDone, workRemaining, } -> bool
    dispatchProgress,   // :: { workDone, workRemaining, } -> (side effects)
    timeout,            // standard parameter of `requestIdleCallback` : is there a timeout ? (default to undefined / so no)
}) {
    return function runBackgroundWithInput(workInput) {
        return new Promise(function promiseBackgroundResult(resolve, reject) {
            (function requestNewIdleWork({
                workRemaining,
                workDone,
                accumulatedDuration,
                startDate,
            }) {
                requestIdleCallback(function runIdleCallback(deadline) {
                    if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
                        try {
                            let newWorkRemaining = workRemaining;
                            let newWorkDone = workDone;
                            let newAccumulatedDuration = accumulatedDuration;
                            while (deadline.timeRemaining() > 0 || deadline.didTimeout) {
                                // console.log("continue work this time");
                                // console.log(deadline.timeRemaining(), "ms left at beginning");
                                const splitted = splitWork(workRemaining);
                                const nextWorkInput = splitted.nextWorkInput;
                                newWorkRemaining = splitted.workRemaining;
                                const chunkStartDate = new Date();
                                const latestWork = doWork(nextWorkInput);
                                newWorkDone = aggregateWork({ previousWorkDone: workDone, latestWork });
                                newAccumulatedDuration = accumulatedDuration + (new Date() - chunkStartDate);
                                // console.log(workDone, latestWork, newWorkDone);
                                if (isWorkCompleted({
                                    workInput,
                                    latestWork,
                                    workDone: newWorkDone,
                                    workRemaining: newWorkRemaining,
                                })) {
                                    resolve({
                                        workDone: newWorkDone,
                                        workRemaining: newWorkRemaining,
                                        accumulatedDuration: newAccumulatedDuration,
                                        fullDuration: (new Date()) - startDate,
                                    });
                                    return;
                                }
                                // console.log(deadline.timeRemaining(), "ms left at end");

                                workRemaining = newWorkRemaining;
                                workDone = newWorkDone;
                                accumulatedDuration = newAccumulatedDuration;
                            }
                            // console.log("continue work next time");
                            dispatchProgress({
                                workInput,
                                workDone: newWorkDone,
                                workRemaining: newWorkRemaining,
                            });
                            requestNewIdleWork({
                                workRemaining: newWorkRemaining,
                                workDone: newWorkDone,
                                accumulatedDuration: newAccumulatedDuration,
                                startDate,
                            });
                            return;
                        } catch (e) {
                            reject(e);
                            return;
                        }
                    } else {
                        // console.log("no time remaining");
                        requestNewIdleWork({
                            workRemaining,
                            workDone,
                            accumulatedDuration,
                            startDate,
                        });
                        return;
                    }
                },
                    { timeout }
                );
            })({
                workRemaining: workInput,
                workDone: initialWork,
                accumulatedDuration: 0,
                startDate: new Date(),
            });

        });
    };
}
