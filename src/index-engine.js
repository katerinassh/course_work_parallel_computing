const path = require("path");
const EventEmitter = require('events');
const { PROCESSING_STATUSES } = require("./constants/statuses");
const { evaluate, buildIndex } = require("./workers/worker-initiators");
const SharedInvertedIndex = require("./utils/shared-structures/SharedInvertedIndex");

function initEngine(threads) {
    const dataDirname = path.join(__dirname, "../common");

    const engineEmitter = new EventEmitter();
    let engineStatus = PROCESSING_STATUSES.INITIALIZED;

    let handledThreadsCount = 0;
    let totalRowsCount = 0;
    const filesPortions = (new Array(threads)).fill(null);

    engineEmitter.on("startEvaluation", () => {
        engineEmitter.emit("changeEngineStatus", PROCESSING_STATUSES.EVALUATING)

        evaluate(dataDirname, threads, engineEmitter);
    })

    engineEmitter.on("workerFinishedEvaluating", ({ total, threadId: workerId, filesPortion }) => {
        totalRowsCount += total;
        handledThreadsCount++;

        filesPortions[workerId - 1] = filesPortion;

        // All workers finished evaluation
        if (handledThreadsCount === threads) {
            engineEmitter.emit("startIndexing")
        }
    })

    engineEmitter.on("startIndexing", () => {
        engineEmitter.emit("changeEngineStatus", PROCESSING_STATUSES.INDEXING)

        buildIndex(dataDirname, threads, totalRowsCount, filesPortions, engineEmitter);
    })

    engineEmitter.on("workerFinishedIndexing", (invertedIndex) => {
        // TODO replace with context propagator
        const sharedInvertedIndex = SharedInvertedIndex.deserialize(invertedIndex);

        // writeOutput(sharedInvertedIndex.toString());
    })

    engineEmitter.on("changeEngineStatus", (status) => {
        engineStatus = status;
    })

    engineEmitter.emit("startEvaluation");
}

module.exports = initEngine;
