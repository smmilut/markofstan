/**
 * @module fp
 * stolen from https://github.com/getify/Functional-Light-JS
 * the good parts come from them, the mistakes come from me
 */

/**
 * Filter arguments to only call `fn` with 1 argument
 * @param {*} fn 
 * @returns function of 1 argument
 */
export function unary(fn) {
    return function callWithOneArg(arg) {
        return fn(arg);
    };
}

/**
 * Filter arguments to only call `fn` with 2 arguments
 * @param {*} fn 
 * @returns function of 2 argument
 */
export function binary(fn) {
    return function callWithTwoArgs(arg1, arg2) {
        return fn(arg1, arg2);
    };
}

/**
 * @param {*} x 
 * @returns x
 */
export function identity(x) {
    return x;
}

/**
 * @param {*} c 
 * @returns function that always returns `c`
 */
export function constant(c) {
    return function getConstant() {
        return c;
    };
}

/**
 * @param {*} fn function that accepts arguments separately
 * @returns version of `fn` that accepts an array of arguments
 */
export function spread(fn) {
    return function applySpreadArgs(argsArray) {
        return fn(...argsArray);
    };
}

/**
 * @param {*} fn function that accepts an array of arguments
 * @returns version of `fn` that accepts arguments separately
 */
export function gather(fn) {
    return function applyGatheredArgs(...args) {
        return fn(args);
    };
}

/**
 * @param {*} fn 
 * @param  {...any} someArgs may optionally apply some args initially
 * @returns function that allows to apply the rest of the arguments and run `fn`
 */
export function partial(fn, ...someArgs) {
    return function applyRest(...restOfArgs) {
        return fn(...someArgs, ...restOfArgs);
    };
}

/**
 * @param {*} fn 
 * @returns function that takes arguments in opposite order as `fn`
 */
export function reverse(fn) {
    return function applyReversedArgs(...args) {
        return fn(...args.reverse());
    };
}

/**
 * 
 * @param {*} fn 
 * @param  {...any} someArgs may optionally apply some args initially, they are the right-most parameters in order
 * @returns function that allows to apply the rest of the arguments starting from the left and run `fn`
 */
export function partialRight(fn, ...someArgs) {
    return function applyRest(...restOfArgs) {
        return fn(...restOfArgs, ...someArgs);
    };
}

/**
 * @param {*} fn 
 * @param {*} arity optionally specify count of expected arguments. Mandatory if number can't be deduced.
 * @returns `fn` that will partially apply its arguments one by one
 */
export function curry(fn, arity = fn.length) {
    return (function nextPartial(storedArgs = []) {
        return renameFn(
            `${fn.name}_curry_arg${storedArgs.length}of${arity}`,
            function (nextArg) {
                /// This enclosing function  must remain anonymous for the dynamic name trick to work.
                const args = [...storedArgs, nextArg];
                if (args.length >= arity) {
                    return fn(...args);
                } else {
                    return nextPartial(args);
                }
            }
        );
    })();
}

/**
 * @param {*} fn 
 * @param {*} arity optionally specify count of expected arguments. Mandatory if number can't be deduced.
 * @returns `fn` that will partially apply its arguments, not necessarily one by one
 */
export function curryMany(fn, arity = fn.length) {
    return (function nextPartial(storedArgs = []) {
        return renameFn(
            `${fn.name}_curryMany_arg${storedArgs.length}of${arity}`,
            function (...nextArgs) {
                /// This enclosing function  must remain anonymous for the dynamic name trick to work.
                const args = [...storedArgs, ...nextArgs];
                if (args.length >= arity) {
                    return fn(...args);
                } else {
                    return nextPartial(args);
                }
            }
        );
    })();
}

/**
 * Note : if the resulting function is called with fewer arguments, then
 *   it is still curried, wating for the rest.
 * @param {*} fn 
 * @returns function that should take all its arguments in one call (not always)
 */
export function uncurry(fn) {
    return function uncurried(...args) {
        let resultOrFunc = fn;
        for (const arg of args) {
            resultOrFunc = resultOrFunc(arg);
        }
        return resultOrFunc;
    }
}

/**
 * @param  {...any} fns 
 * @returns f(g(h(etc...)))
 */
export function compose(...fns) {
    if (fns.some(isntFunction)) {
        const notFunctions = fns.
            filter(isntFunction).
            map(jsonStringifyWithReplacer(
                function replaceUndefined(_key, value) {
                    if (value === undefined) { return null; }
                    return value;
                })).
            join(", ");
        throw new TypeError(`FP.compose : failed to compose because argument was not a function : ${notFunctions}`);
    }
    return renameFn(
        "composed(" + fns.map(function (f) { return f.name || "anonymous"; }).join(" < ") + ")",
        function (result) {
            // copy the array of functions
            let fns_copy = [...fns];
            while (fns_copy.length > 0) {
                // take the last function off the end of the list
                // and execute it
                result = fns_copy.pop()(result);
            }
            return result;
        }
    );
}

export const pipe = reverse(compose);

/**
 * Run each fns[i] separately on all the [args], then
 *   run `after` on the results as separate arguments
 * @param {Function} after :: results -> final
 * @param  {...Function} fns :: args -> result
 * @returns {Function} :: args -> final
 */
export function converge(after, ...fns) {
    return function applyConverged(...args) {
        return pipe(
            map(function applyFn(fn) { return fn(...args); }),
            spread(after),
        )(fns);
    };
}

/* ---------- Pointfree Classic Utilities ---------- */

/**
 * Turn method into function
 * @param {integer} arity arity of the method
 * @param {string} methodName name of the object's method
 * @returns {Function} f(...args, object)
 */
export function invoker(arity, methodName) {
    return renameFn(
        methodName,
        curryMany(function invoke(...args) {
            const obj = args[arity];
            const method = obj[methodName];
            if (isFunction(method)) {
                return obj[methodName](...(args.slice(0, arity)));
            } else {
                const objStr = JSON.stringify(
                    obj,
                    function replacer(_key, value) {
                        if (isFunction(value)) {
                            const functionHeader = value.toString().split(")")[0] + ")";
                            return functionHeader;
                        }
                        return value;
                    }
                );
                throw new TypeError(`Not a function : ${objStr} doesn't have a callable method named \"${methodName}\".`);
            }
        }, arity + 1)
    );
}

export const map = invoker(1, "map");

export const reduce = invoker(2, "reduce");

export const forEach = invoker(1, "forEach");

export const filter = invoker(1, "filter");

export const flatMap = invoker(1, "flatMap");

/**
 * @returns a copy that is sorted with .sort()
 */
export const sorted = pipe(shallowCopyArray, invoker(0, "sort"));
/**
 * @param {*} compareFn 
 * @returns a copy that is sorted with .sort(compareFn)
 */
export const sortedWith = curryMany(function sortedWith(compareFn, xs) {
    return shallowCopyArray(xs).sort(compareFn);
});

/**
 * Useful for generating comparison functions for sorting
 * @param {*} p 
 * @param {*} a 
 * @param {*} b 
 * @returns a.p - b.p
 */
export const compareWithProp = curryMany(function compareWithProp(p, a, b) {
    return prop(p, a) - prop(p, b);
});

/**
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
export const zip = curryMany(function zip(a, b) {
    let result = [];
    const size = Math.min(a.length, b.length);
    for (let index = 0; index < size; index++) {
        result[index] = [a[index], b[index]];
    }
    return result;
});

export const toString = invoker(0, "toString");

/** Array.slice with 1 parameter */
export const slice1 = invoker(1, "slice");
/** Array.slice with 2 parameters */
export const slice2 = invoker(2, "slice");

export const append = invoker(1, "concat");

export const prepend = curryMany(reverse(append), 2);

export const split = invoker(1, "split");

export const join = invoker(1, "join");

export const matchAll = invoker(1, "matchAll");

/**
 * From a regex that has named groups, return a function that
 *   takes an array of strings to
 *   match them against the regex and
 *   returns the flat result of all named groups into an object
 * @param {regex} regex 
 * @returns F :: string -> { regexMatchedGroup0, regexMatchedGroup1, regexMatchedGroup2, ... }
 */
export function matchAllNamedGroups(regex) {
    return flatMap(
        pipe(
            matchAll(regex),
            shallowCopyArray,
            map(prop("groups")),
        ),
    );
};

export const replace = invoker(2, "replace");

export const splitLines = split(/\r\n|\r|\n/g);

export const trim = invoker(0, "trim");

/** pad with zeros */
export const padZeros = curryMany(function padStart(numZeros, n) {
    return n.toString().padStart(numZeros, "0");
});

/**
 * @param {string} p property name
 * @param {Object} o 
 * @returns o[p]
 */
export const prop = curryMany(function prop(p, o) {
    return o[p];
});

/**
 * @param {string} path property path "property0.property1.property2"
 * @param {Object} o 
 * @returns o[property0][property1][property2]
 */
export const path = curryMany(function path(propStr, o) {
    return compose(
        reduce(
            compose(binary, reverse)(prop),
            o
        ),
        split("."),
    )(propStr);
});

export function copyObj(obj) {
    return Object.assign({}, obj);
}

/**
 * @param {object} updatedFields 
 * @param {object} oldObject 
 * @returns new object based on oldObject but with fields updated (without modifying input)
 */
export const assign = curryMany(function assign(updatedFields, oldObject) {
    return Object.assign(
        copyObj(oldObject),
        updatedFields
    );
});

/**
 * Turn a "constructor" function into a function that doesn't need "new"
 * @param {Function} constructorFn "constructor" function that needs to be called with "new"
 * @param  {...any} args 
 * @returns {Function} :: args -> constructed object
 */
export function newInstance(constructorFn) {
    return function getConstructorParams(...args) {
        return new constructorFn(...args);
    };
}

export const then = invoker(1, "then");

export const add = curryMany(function add(n1, n2) {
    return n1 + n2;
});

export const mul = curryMany(function mul(n1, n2) {
    return n1 * n2;
});

export const sum = reduce(add, 0);

export const last = curryMany(function last(xs) {
    return xs[xs.length - 1];
});
export const first = prop(0);

export const asDate = newInstance(Date);

export function shallowCopyArray(xs) {
    return [...xs];
}

export function asArray(str) {
    return [...(str)];
}

/**
 * @param {*} start 
 * @param {*} end 
 * @returns (curried) generator of values between start and end
 */
export const range = curryMany(function* range(start, end) {
    yield start;
    if (start >= end) return;
    yield* range(start + 1, end);
});


export function log(msgFn = prepend("logThrough : ")) {
    return function logX(x) {
        console.log(msgFn(x));
        return x;
    }
}

export function inspect(x) {
    const type = typeof x;
    if (type === "function") {
        return `${type} ${x.name || "anonymous"}(${", ".repeat(x.length)})`;
    } else {
        return `${type} ${JSON.stringify(x)}`;
    }
}

/* ---------- Misc Function Utilities ---------- */
/**
 * As a side effect, the function signature is lost (its .length property in particular)
 * @param {string} customName 
 * @param {Function} fn 
 * @returns {Function} with fn.name === customName
 */
export function renameFn(customName, fn) {
    /// Trick to give the composed function a dynamic name
    /// https://dev.to/tmikeschu/dynamically-assigning-a-function-name-in-javascript-2d70
    const { [customName]: renamedFn } = {
        [customName]: function (...args) {
            return fn(...args);
        }
    };
    return renamedFn;
}

export function jsonStringifyWithReplacer(replacer, spacer) {
    return function jsonStringify(o) {
        return JSON.stringify(o, replacer, spacer);
    }
}
function isFunction(f) { return typeof f === "function"; };
function isntFunction(f) { return !isFunction(f); };
