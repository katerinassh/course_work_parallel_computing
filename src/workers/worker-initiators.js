const worker_threads = require("worker_threads");
const fs = require("fs");
const path = require("path");
const SharedInvertedIndex = require("../utils/shared-structures/SharedInvertedIndex");
const ENGINE_OPERATIONS = require("../constants/engine-operations");

const EVALUATING_WORKER_FILENAME = 'evaluating-worker.js';
const INDEXING_WORKER_FILENAME = 'indexing-worker.js';

function evaluate(dirname, threads, engineEmitter) {
    fs.readdir(dirname, (err, files) => {
        const portionCount = Math.ceil(files.length / threads);

        for (let i = 0; i < threads; i++) {
            const portion = files.slice(i * portionCount, (i + 1) * portionCount);

            const worker = new worker_threads.Worker(path.join(__dirname, EVALUATING_WORKER_FILENAME), {
                workerData: { files: portion, dirname }
            })

            worker.on("message", (data) => {
                engineEmitter.emit(ENGINE_OPERATIONS.WORKER_FINISHED_EVALUATING, {
                    ...data,
                    filesPortion: portion
                })
            })
        }
    })
}

function buildIndex(dirname, threads, totalRowsCount, filesPortions, engineEmitter) {
    const sharedInvertedIndex = new SharedInvertedIndex(totalRowsCount);

    for (let i = 0; i < threads; i++) {
        const worker = new worker_threads.Worker(path.join(__dirname, INDEXING_WORKER_FILENAME), {
            workerData: {
                sharedInvertedIndex: SharedInvertedIndex.serialize(sharedInvertedIndex),
                filesPortion: filesPortions[i],
                dirname
            }
        })

        worker.on("message", (invertedIndex) => {
            engineEmitter.emit("workerFinishedIndexing", invertedIndex);
        })
    }
}

module.exports = {
    evaluate,
    buildIndex
}