const net = require('node:net');
const {CLIENT_OPERATIONS} = require("../constants/operations");
const IndexEngine = require("../index-engine");
const { PROCESSING_STATUSES } = require("../constants/statuses");

const PORT = 9988;
const HOST = '127.0.0.1';

const ENGINE_THREADS_COUNT = 4;

const server = net.createServer();
const clientSockets = [];

server.listen(PORT, HOST, (data) => {
    console.log(`TCP Server is running [${HOST}:${PORT}]`);
})

server.on("connection", (socket) => {
    console.log(`New connection [${socket.remoteAddress}:${socket.remotePort}]`)
    clientSockets.push(socket);

    let engine;

    function sendResponse(data) {
        socket.write(Buffer.from(JSON.stringify(data)));
    }

    function sendStatusResponse(data) {
        sendResponse({
            ...data,
            type: 'status'
        })
    }

    function engineStatusListener(status) {
        switch (status) {
            case PROCESSING_STATUSES.INITIALIZED:
                sendStatusResponse({ status: "Engine initialized", statusCode: 1 })
                break;
            case PROCESSING_STATUSES.EVALUATING:
                sendStatusResponse({ status: "Evaluating", statusCode: 2 })
                break;
            case PROCESSING_STATUSES.INDEXING:
                sendStatusResponse({ status: "Indexing", statusCode: 3 })
                break;
            case PROCESSING_STATUSES.PROCESSED:
                sendStatusResponse({ status: "Processed", statusCode: 4 })
                break;
        }
    }

    if (engine) {
        engine.registerEngineStatusListener(engineStatusListener)
    } else {
        engine = new IndexEngine(ENGINE_THREADS_COUNT, [engineStatusListener]);
    }

    socket.on("data", (data) => {
        const { operation, data: operationData } = JSON.parse(data.toString())

        switch (operation) {
            case CLIENT_OPERATIONS.BUILD_INDEX:
                if (!engine) {
                    return;
                }

                engine.buildIndex();

                break;
            case CLIENT_OPERATIONS.GET_INDEX:
                if (!engine || engine.status !== PROCESSING_STATUSES.PROCESSED) return;

                const { word } = operationData;

                const index = engine.getWordIndex(word).toString();

                console.log('index', index, word)

                sendResponse({ response: index })

                break;
        }
    })
})
