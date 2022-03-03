export const Dict = {};

const Dict_specialKey_isType = Symbol("Dict type");

/** New dictionary */
Dict.new = function Dict_new() {
    const d = Object.create(null);
    d[Dict_specialKey_isType] = true;
    return d;
};

Dict.copy = function Dict_copy(dict) {
    let dictCopy;
    if (dict === undefined) {
        dictCopy = Dict.new();
    } else {
        dictCopy = Object.assign(Dict.new(), dict);
    }
    return dictCopy;
};

Dict.of = Dict.copy;


Dict.deepCopy = function Dict_deepCopy(dict) {
    if (dict === undefined || dict[Dict_specialKey_isType] !== true) {
        /// not a Dict
        return dict;
    }
    let dictCopy = Dict.new();
    for (const [key, value] of Object.entries(dict)) {
        dictCopy[key] = Dict.deepCopy(value);
    }
    return dictCopy;
};

Dict.assign = function Dict_assign(updatedFields, oldDict) {
    return Object.assign(
        Dict.copy(oldDict),
        updatedFields
    );
};

Object.freeze(Dict);
