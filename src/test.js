const IndexEngine = require("./index-engine");
const { PROCESSING_STATUSES } = require("./constants/statuses");

const indexEngine = new IndexEngine(20);

const startTime = new Date();

indexEngine.buildIndex();
indexEngine.registerEngineStatusListener((status) => {
    if (status === PROCESSING_STATUSES.PROCESSED) {
        const finishTime = new Date();

        const time = finishTime - startTime;

        console.log(time);
    }
})
