"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socket = exports.getSocket = void 0;
const socket_io_client_1 = require("socket.io-client");
let socketInstance = null;
const getSocket = () => {
    if (!socketInstance) {
        socketInstance = (0, socket_io_client_1.io)("http://localhost:3000", {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });
    }
    return socketInstance;
};
exports.getSocket = getSocket;
exports.socket = (0, exports.getSocket)();
