const murmurhash = require('murmurhash');
const SharedLinkedList  = require("./SharedLinkedList")
const SharedMap  = require("./SharedMap");
const SharedByteArray  = require("./SharedByteArray");

class SharedHashMap {
    map;
    index;
    keys;
    items;

    constructor(maxItems, averageKeySize, averageItemSize, keyEncoding, sharedData) {

        if (sharedData) {
            this.map = sharedData.map;
            this.index = sharedData.index;
            this.keys = sharedData.keys;
            this.items = sharedData.items;
        } else {
            this.map = new SharedLinkedList(maxItems);
            this.index = new SharedMap(maxItems);
            this.keys = new SharedByteArray(maxItems, averageKeySize);
            this.items = new SharedByteArray(maxItems, averageItemSize);
        }

        this.maxItems = maxItems;
        this.averageKeySize = averageKeySize;
        this.averageItemSize = averageItemSize;
    }

    has(key) {
        const hash = this._getHash(key);
        const keyBuffer = Buffer.from(key, this.keyEncoding);

        return this._getExistingKeyPos(keyBuffer, hash) !== undefined;
    }

    get(key) {
        const value = this.tryGet(key);

        if (value === undefined) {
            throw new Error(`Key not set: ${key}`);
        }

        return value;
    }

    tryGet(key) {
        const hash = this._getHash(key);
        const keyBuffer = Buffer.from(key, this.keyEncoding);

        const keyPos = this._getExistingKeyPos(keyBuffer, hash);

        if (keyPos === undefined) {
            return undefined;
        }

        const itemPos = this.index.get(keyPos);

        return this.items.get(itemPos);
    }

    set(key, item) {
        const hash = this._getHash(key);
        const keyBuffer = Buffer.from(key, this.keyEncoding);

        let keyPos = this._getExistingKeyPos(keyBuffer, hash);
        let itemPos;

        if (keyPos === undefined) {
            if (this.keys.isFull()) {
                throw new Error(`Hash map is full`);
            }

            keyPos = this._getNewKeyPos(keyBuffer, hash);
        } else {
            this.items.delete(this.index.get(keyPos));
        }

        itemPos = this.items.push(item);
        this.index.set(keyPos, itemPos);

        return keyPos;
    }

    toString() {
        return JSON.stringify(this.keys.toString().split(',').reduce((acc, key, i) => ({
            ...acc,
            [key]: this.items.get(this.index.get(i)).toString()
        }), {}))
    }

    _getExistingKeyPos(key, hash) {
        return this.map.fetch(hash).find(potential => this.keys.get(potential).equals(key));
    }

    _getNewKeyPos(key, hash) {
        const newPos = this.keys.push(key);
        this.map.push(hash, newPos);

        return newPos;
    }

    _getHash(key) {
        return murmurhash(key) % this.maxItems;
    }
}

module.exports = SharedHashMap;