/**
 * Make Http requests
 * @module httpUtils
 */


/**
 * promisified XMLHttpRequest
 * @param {object} options options = {
 *  method,  // default: "GET"
 *  url,
 *  async,  // default: true
 *  requestHeaders : [{name, value}],
 *  data
 * }
 * @returns {object} { status, statusText, responseText}
 */
export function request(
    {
        method = "GET",
        url,
        async = true,
        requestHeaders,
        data,
    } = {}
) {
    return new Promise(function promiseHttpRequest(resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, async);
        if (requestHeaders) {
            requestHeaders.forEach(function setRequestHeader(requestHeader) {
                xhr.setRequestHeader(requestHeader.name, requestHeader.value);
            });
        };
        xhr.onloadend = function httpRequestLoadEnd() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                resolve({
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                });
            } else {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                });
            };
        };
        xhr.onerror = function httpRequestError() {
            reject({
                status: xhr.status,
                statusText: xhr.statusText,
                responseText: xhr.responseText,
            });
        };
        xhr.send(data);
    });
}

/**
 * Await for the Json file and parse it
 * @param {object} options options = {
 *  method,  // default: "GET"
 *  url,
 *  async,  // default: true
 *  requestHeaders : [{name, value}],
 *  data
 * }
 * @returns {object} Json parsed object
 */
export async function requestJson(
{
    method = "GET",
    url,
    async = true,
    requestHeaders,
    data,
} = {}
) {
    const rawJson = await request({
        method,
        url,
        async,
        requestHeaders,
        data,
    });
    return JSON.parse(rawJson.responseText);
}