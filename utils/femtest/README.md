# femtest

## Description

femto-test ultra simple testing framework

## How to add to your project

1. Copy the [`utils/femtest`](./) folder somewhere under the root of your application.
2. Write some tests (see below).
3. Update the [`femtest/femtest.config.json`](femtest.config.json) to reference your tests (see below).
4. Navigate to the [`femtest/index.html`](index.html) to run tests and see results in the page.

## How to write tests

Import "test.js" and use `Test.itShould("your description", function yourTest() {}, "optional group name")` to add a test.

Tests succeed unless an exception is thrown. The `assert` utilities help to make assertions and throw `AssertError` on failure.

js```
import { Test, assert } from "../utils/femtest/test.js";

Test.itShould("do something / description here", function testSomething() {
    /// prepare test here
    const val1 = 2, val2 = 3, expected = 5, result = val1 + val2;
    /// assert at the end
    assert.strictEqual(expected, result);
},
"optionnal test group name");
```

The group name is optionnal. Group names that only differ by special characters are considered the same (e.g. `my super tests !` and `my--super / tests ++` will be aggregated together).

To group tests, you can alternately import `groupIt` :

js```
import { groupIt, assert } from "../utils/femtest/test.js";
const itShould = groupIt("example : equals")

itShould("return 5 as sum(2, 3)", function testFive() {
    const val1 = 2, val2 = 3, expected = 5, result = val1 + val2;
    assert.strictEqual(result, expected);
});
```

### How to choose which tests are run

Reference your test files' paths in `femtest.config.json` as a new list item inside `testFiles`. You can use absolute paths or relative to the `index.html`.

json```
"testFiles": [
        "/tests/exampleEquals.js",
        "../../tests/exampleImport.js",
        "/tests/exampleLater.js"
    ]
```

### Note on async tests

Asynchronous code can be tested, but some care must be taken, see example :

js```
itShould("eventually handle the correct value", function later() {
    let value = "initial";
    setTimeout(function after1s() {
        value = "after 1s";
    }, 1000);
    /*
        If your tested functions use async behaviour like "setTimeout",
         then you should wrap the "assert" parts in Promises.
    */
    return new Promise(function runLater(resolve, reject) {
        value = "when starting Promise executor";
        /// Starting long operation for 2s
        setTimeout(function after2s() {
            /// Testing behaviour after 2s
            try {
                /*
                    All assert and all possible exceptions thrown from your tests
                     should be wrapped in try ... catch, then be rejected.
                */
                assert.strictEqual(value, "after 1s");
                resolve();
            } catch (e) {
                reject(e);
            }
        }, 2000);

        value = "when returning from Promise executor";
    });
});
```

Or you can simplify by removing the `try..catch` as follows : use the new `resolve` and `reject` options on `assert` functions to pass the promise's own `resolve` and `reject` :

js```
itShould("eventually handle the correct value", function later() {
    let value = "initial";
    setTimeout(function after1s() {
        value = "after 1s";
    }, 1000);
    /*
        If your tested functions use async behaviour like "setTimeout",
         then you should wrap the "assert" parts in Promises,
         and pass it the resolve/reject.
    */
    return new Promise(function runLater(resolve, reject) {
        value = "when starting Promise executor";
        /// Starting long operation for 2s
        setTimeout(function after2s() {
            /// ==> here pass the resolve / reject
            assert.strictEqual(value, "after 1s", { resolve, reject });
        }, 2000);
        value = "when returning from Promise executor";
    });
});
```

## How to run

Run the web server in the root directory and browse to [the index.html](http://0.0.0.0:8000/utils/femtest/index.html)

### Examples

You can find examples in this repository's `test/` folder. They can be run live in this Github Page at the following location : 

## License

The code in this project is licensed under the MIT license as described in the `LICENSE` file.

The assets in this project are licensed under [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/) attributed to Pil Smmilut.
