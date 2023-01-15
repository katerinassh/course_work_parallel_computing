const CLIENT_OPERATIONS = Object.freeze({
    INIT_ENGINE: "initEngine",
    BUILD_INDEX: "buildIndex",
    GET_INDEX: "getIndex"
})

const SERVER_OPERATIONS = Object.freeze({
    UPDATE_STATUS: "updateStatus"
})

module.exports = {
    CLIENT_OPERATIONS,
    SERVER_OPERATIONS
}