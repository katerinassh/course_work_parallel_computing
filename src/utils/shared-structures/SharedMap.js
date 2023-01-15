const EMPTY_POS = Math.pow(2, 32) - 1;

class SharedMap {
    buffer;
    index;

    constructor(maxItems, buffer) {
        const dataSize = maxItems * Uint32Array.BYTES_PER_ELEMENT;

        if (!buffer) {
            this.buffer = new SharedArrayBuffer(dataSize);
        } else {
            this.buffer = buffer;
        }

        this.index = new Uint32Array(this.buffer, 0, maxItems);
        this.maxItems = maxItems;
    }

    static init(obj) {
        Object.setPrototypeOf(obj, SharedMap.prototype);

        return obj;
    }

    clear() {
        this.index.fill(EMPTY_POS);
    }

    set(key, value) {
        if (!this.isValidKey(key)) {
            throw new Error(`Key out of range: ${key}`);
        }

        this.index[key] = value;

        return value;
    }

    get(key) {
        if (!this.isValidKey(key)) {
            throw new Error(`Key out of range: ${key}`);
        }

        if (!this.has(key)) {
            throw new Error(`Key not set: ${key}`);
        }

        return this.index[key];
    }

    delete(key) {
        this.index[key] = EMPTY_POS;
    }

    has(key) {
        return this.index[key] !== EMPTY_POS;
    }

    toString() {
        return this.index.toString();
    }

    static serialize(sharedMap) {
        return {
            buffer: sharedMap.buffer,
            maxItems: sharedMap.maxItems
        }
    }

    static deserialize(serialized) {
        const { buffer, maxItems } = serialized;

        return new SharedMap(maxItems, buffer)
    }

    isValidKey(key) {
        return this.index[key] !== undefined;
    }
}

module.exports = SharedMap;