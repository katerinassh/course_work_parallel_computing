const SharedMap = require("./SharedMap");

class SharedByteArray {
    buffer;
    index;
    lengths;

    // [indexHead, dataHead]
    headsIndexesBuffer;

    constructor(maxItems, averageBytesPerItem, constructorData) {
        const dataSize = maxItems * averageBytesPerItem;

        if (dataSize > Number.MAX_SAFE_INTEGER) {
            throw new Error('Data size may not be larger than Number.MAX_SAFE_INTEGER');
        }

        if (constructorData) {
            this.buffer = constructorData.dataBuffer;
            this.index = constructorData.indexBuffer;
            this.lengths = constructorData.lengthsBuffer;
            this.headsIndexesBuffer = constructorData.headsIndexesBuffer;
        } else {
            this.index = new SharedMap(maxItems);
            this.lengths = new SharedMap(maxItems);
            this.buffer = new SharedArrayBuffer(dataSize);

            this.headsIndexesBuffer = new SharedMap(2)
            this.headsIndexesBuffer.set(0, 0)
            this.headsIndexesBuffer.set(1, 0)
        }

        this.maxItems = maxItems;
        this.averageBytesPerItem = averageBytesPerItem;
    }

    hydrate() {
        SharedMap.init(this.index);
        SharedMap.init(this.lengths);
    }

    isFull() {
        return this.headsIndexesBuffer.get(0) >= this.maxItems;
    }

    clear() {
        new Uint32Array(this.buffer).fill(0);
        this.index.clear();
        this.lengths.clear();
        this.headsIndexesBuffer.set(0, 0);
        this.headsIndexesBuffer.set(1, 0);
    }

    get(pos) {
        const dataPos = this.index.get(pos);
        const length = this.lengths.get(pos);

        return Buffer.from(this.buffer.slice(dataPos, dataPos + length));
    }

    delete(pos) {
        const dataPos = this.index.get(pos);
        const length = this.lengths.get(pos);

        if (dataPos + length !== this.headsIndexesBuffer.get(1) || pos !== this.headsIndexesBuffer.get(0) - 1) {
            throw new Error(`Could not delete item ${pos}, it's not last`);
        }

        new Uint8Array(this.buffer, dataPos, length).fill(0);
        this.headsIndexesBuffer.set(1, this.headsIndexesBuffer.get(1) - 1);
        this.headsIndexesBuffer.set(0, this.headsIndexesBuffer.get(0) - 1);
    }

    push(item) {
        if (this._getFreeSpace() < item.length) {
            throw new Error(`Not enough array space: tried to push ${item.length} bytes, ${this.getFreeSpace()} bytes left`);
        }

        if (this.isFull()) {
            throw new Error(`Not enough index space: tried to add item ${this.headsIndexesBuffer.get(0) + 1} of ${this.headsIndexesBuffer.get(0)}`);
        }

        const indexPos = this.headsIndexesBuffer.get(0);
        const dataPos = this.headsIndexesBuffer.get(1);

        this.index.set(indexPos, dataPos);
        this.lengths.set(indexPos, item.byteLength);

        const array = new Uint8Array(this.buffer, dataPos, item.byteLength);
        array.set(item)

        this.headsIndexesBuffer.set(0, this.headsIndexesBuffer.get(0) + 1);
        this.headsIndexesBuffer.set(1, this.headsIndexesBuffer.get(1) + item.byteLength);

        return indexPos;
    }

    toString() {
        return (new Array(this.length)).fill(null).map((el, i) => this.get(i).toString()).toString()
    }

    _getFreeSpace() {
        return this.buffer.byteLength - this.headsIndexesBuffer.get(1);
    }

    get length() {
        return this.headsIndexesBuffer.get(0);
    }
}

module.exports = SharedByteArray;