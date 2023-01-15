const worker_threads = require("worker_threads");
const fs = require("fs");
const path = require("path");

if (!worker_threads.isMainThread) {
    const { dirname, files } = worker_threads.workerData;
    let proceedCount = 0;
    let totalWords = 0;

    files.forEach((fileName) => {
        fs.readFile(path.join(dirname, fileName), "utf-8", (err, data) => {
            totalWords += data.split(' ').length;
            proceedCount++;

            if (proceedCount === files.length) {
                worker_threads.parentPort.postMessage({ threadId: worker_threads.threadId, total: totalWords })
            }
        })
    })
}