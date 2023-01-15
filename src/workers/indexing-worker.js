const worker_threads = require("worker_threads");
const SharedInvertedIndex = require("../utils/shared-structures/SharedInvertedIndex");
const fs = require("fs")
const path = require("path");

if (!worker_threads.isMainThread) {
    const { sharedInvertedIndex: serializedSharedInvertedIndex, filesPortion, dirname } = worker_threads.workerData;
    let handledFiles = 0;

    const sharedInvertedIndex = SharedInvertedIndex.deserialize(serializedSharedInvertedIndex);

    filesPortion.forEach((fileName) => {
        fs.readFile(path.join(dirname, fileName), (err, data) => {
            sharedInvertedIndex.build(data.toString(), fileName);

            handledFiles++;

            if (handledFiles === filesPortion.length) {
                worker_threads.parentPort.postMessage(SharedInvertedIndex.serialize(sharedInvertedIndex));
            }
        })
    })
}