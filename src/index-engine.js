const path = require("path");
const EventEmitter = require('events');
const { PROCESSING_STATUSES } = require("./constants/statuses");
const { evaluate, buildIndex } = require("./workers/worker-initiators");
const SharedInvertedIndex = require("./utils/shared-structures/SharedInvertedIndex");
const ENGINE_OPERATIONS = require("./constants/engine-operations");

DATA_DIRNAME = path.join(__dirname, "../common");

class IndexEngine {
    engineEmitter;
    status = PROCESSING_STATUSES.NOT_INITIALIZED;
    invertedIndex;

    _threadsCount = 2;
    _handledThreadsCount = 0;
    _totalRowsCount = 0;
    _filesPortions;
    _statusListeners = [];

    constructor(threadsCount, statusListeners) {
        this._threadsCount = threadsCount;
        this.engineEmitter = new EventEmitter();
        this._filesPortions = (new Array(this._threadsCount)).fill(null);
        this._statusListeners = statusListeners;

        this._registerEngineEvents();
        this._updateEngineStatus(PROCESSING_STATUSES.INITIALIZED);
    }

    buildIndex() {
        this.engineEmitter.emit(ENGINE_OPERATIONS.START_EVALUATION);
    }

    getWordIndex(word) {
        return this.invertedIndex.getIndex(word);
    }

    registerEngineStatusListener(listener) {
        this._statusListeners.push(listener);
    }

    _startIndexing() {
        this.engineEmitter.emit(ENGINE_OPERATIONS.START_INDEXING);
    }

    _updateEngineStatus(status) {
        console.log('status', status);
        this.engineEmitter.emit(ENGINE_OPERATIONS.CHANGE_ENGINE_STATUS, status);
    }

    _registerEngineEvents() {
        this.engineEmitter.on(ENGINE_OPERATIONS.START_EVALUATION, () => {
            this._updateEngineStatus(PROCESSING_STATUSES.EVALUATING);

            evaluate(DATA_DIRNAME, this._threadsCount, this.engineEmitter);
        })

        this.engineEmitter.on(ENGINE_OPERATIONS.WORKER_FINISHED_EVALUATING, ({ total, threadId: workerId, filesPortion }) => {
            this._totalRowsCount += total;
            this._handledThreadsCount++;

            this._filesPortions[workerId - 1] = filesPortion;

            // All workers finished evaluation
            if (this._handledThreadsCount === this._threadsCount) {
                this._startIndexing();
                this._handledThreadsCount = 0;
            }
        })

        this.engineEmitter.on(ENGINE_OPERATIONS.START_INDEXING, () => {
            this._updateEngineStatus(PROCESSING_STATUSES.INDEXING);

            buildIndex(DATA_DIRNAME, this._threadsCount, this._totalRowsCount, this._filesPortions, this.engineEmitter);
        })

        this.engineEmitter.on(ENGINE_OPERATIONS.WORKER_FINISHED_INDEXING, (invertedIndex) => {
            this.invertedIndex = SharedInvertedIndex.deserialize(invertedIndex);

            this._handledThreadsCount++;

            if (this._handledThreadsCount === this._threadsCount) {
                this._updateEngineStatus(PROCESSING_STATUSES.PROCESSED);
            }
        })

        this.engineEmitter.on(ENGINE_OPERATIONS.CHANGE_ENGINE_STATUS, (status) => {
            this.status = status;

            this._statusListeners.forEach((listener) => {
                listener(status);
            })
        })
    }
}

module.exports = IndexEngine;
