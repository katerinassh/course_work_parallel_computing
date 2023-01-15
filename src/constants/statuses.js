const PROCESSING_STATUSES = Object.freeze({
    NOT_INITIALIZED: 'notInitialized',
    INITIALIZED: 'initialized',
    EVALUATING: 'evaluating',
    INDEXING: 'indexing',
    ERRORED: 'errored',
    PROCESSED: 'processed',
})

const WORKER_NODES_STATUSES = Object.freeze({
    INITIALIZING: "initializing",
    INITIALIZED: "initialized",
    DATA_FETCHING: "dataFetching",
    DATA_FETCHED: "dataFetched",
    INDEXING: "indexing",
    INDEXING_FINISHED: "indexingFinished",
    ERRORED: "errored",
})

module.exports = {
    PROCESSING_STATUSES,
    WORKER_NODES_STATUSES
}