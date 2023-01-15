const SharedHashMap = require("./SharedHashMap");

const AVERAGE_KEY_SIZE = 5; // bytes
const AVERAGE_VALUE_SIZE = 60; // bytes
const KEY_ENCODING = "ascii";

class SharedInvertedIndex {
    sharedHashMap;

    constructor(totalRowsCount, constructorData) {
        if (!constructorData) {
            this.sharedHashMap = new SharedHashMap(totalRowsCount * 2, AVERAGE_KEY_SIZE, AVERAGE_VALUE_SIZE, KEY_ENCODING);
        } else {
            this.sharedHashMap = constructorData.sharedHashMap;
        }

        this.totalRowsCount = totalRowsCount;
    }

    build(data, documentIndex) {
        data.split(' ').forEach((word, i) => {
            const originValue = this.sharedHashMap.tryGet(word);

            if (!originValue) {
                this.sharedHashMap.set(word, Buffer.from(JSON.stringify([[documentIndex, i]])))
            } else {

            }
        });
    }

    getIndex(value) {
        return this.sharedHashMap.tryGet(value);
    }

    toString() {
        return this.sharedHashMap.toString();
    }
}

module.exports = SharedInvertedIndex;