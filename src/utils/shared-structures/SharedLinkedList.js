const DATA_START_OFFSET = 0;
const EMPTY_POS = 0;

class SharedLinkedList {
    buffer;
    index;
    data;
    links;
    head = [DATA_START_OFFSET];

    constructor(size, constructorData) {
        const bytesPerColumn = size * Uint32Array.BYTES_PER_ELEMENT;

        if (!constructorData?.buffer) {
            this.buffer = new SharedArrayBuffer(bytesPerColumn * 3 + Uint32Array.BYTES_PER_ELEMENT);
        } else {
            this.buffer = constructorData.buffer;
        }

        this.head = new Uint32Array(this.buffer, 0, 1)
        this.index = new Uint32Array(this.buffer, 4, size);
        this.data = new Uint32Array(this.buffer, bytesPerColumn + 4, size);
        this.links = new Uint32Array(this.buffer, bytesPerColumn * 2 + 4, size);

        this.size = size;
    }

    push(key, value) {
        if (this.head[0] >= this.size) {
            throw new Error(`Linked list is full`);
        }

        const pos = this.head[0];
        const last = this._findLast(key);

        if (last === undefined) {
            this.index[key] = pos + 1;
        } else {
            this.links[last] = pos;
        }

        this.data[pos] = value;
        this.head[0]++;

        return pos;
    }

    fetch(key) {
        if (!this._isValidKey(key)) {
            throw new Error(`Key out of range: ${key}`);
        }

        if (!this.has(key)) {
            return [];
        }

        const out = [];

        let pos = this.index[key] - 1;
        out.push(this.data[pos]);

        while (this.links[pos] !== EMPTY_POS) {
            pos = this.links[pos];
            out.push(this.data[pos]);
        }

        return out;
    }

    has(key) {
        return this.index[key] !== EMPTY_POS;
    }

    toString() {
        return `head: [${this.head.toString()}] index: [${this.index.toString()}] links: [${this.links.toString()}] data: [${this.data.toString()}]`;
    }

    _isValidKey(key) {
        return this.index[key] !== undefined;
    }

    _findLast(key) {
        if (!this._isValidKey(key)) {
            throw new Error(`Key out of range: ${key}`);
        }

        if (!this.has(key)) {
            return undefined;
        }

        let pos = this.index[key] - 1;
        let next = this.links[pos];

        while (next !== EMPTY_POS) {
            pos = next;
            next = this.links[next];
        }

        return pos;
    }
}

module.exports = SharedLinkedList;