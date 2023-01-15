const net = require('node:net');
const { CLIENT_OPERATIONS } = require("../src/constants/operations");

const socket = new net.Socket();

function request(data) {
    socket.write(Buffer.from(JSON.stringify(data)))
}

socket.on('data', (data) => {
    const { status, statusCode, type, response } = JSON.parse(data.toString())

    if (type === 'status') {
        console.log(`Status update: ${status}`)

        switch (statusCode) {
            case 1:
                request({
                    operation: CLIENT_OPERATIONS.BUILD_INDEX
                })
                break;
            case 4:
                request({
                    operation: CLIENT_OPERATIONS.GET_INDEX,
                    data: {
                        word: "movie"
                    }
                })
                break;
        }
    } else {

        console.log('Server response: ', response)
    }
});

socket.connect({
    port: 9988,
    host: '127.0.0.1',
}, () => {
    const someOperation = {
        operation: CLIENT_OPERATIONS.BUILD_INDEX
    }
    // socket.write(Buffer.from(JSON.stringify(someOperation)));
});
