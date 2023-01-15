const ENGINE_OPERATIONS = Object.freeze({
    CHANGE_ENGINE_STATUS: 'changeEngineStatus',
    START_EVALUATION: 'startEvaluation',
    WORKER_FINISHED_EVALUATING: 'workerFinishedEvaluating',
    START_INDEXING: 'startIndexing',
    WORKER_FINISHED_INDEXING: 'workerFinishedIndexing'
})

module.exports = ENGINE_OPERATIONS;