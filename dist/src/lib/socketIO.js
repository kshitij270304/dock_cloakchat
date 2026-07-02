"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offNewMessage = exports.onNewMessage = exports.checkAcceptingMessagesViaSocket = exports.sendMessageViaSocket = exports.disconnectSocket = exports.getSocket = void 0;
const socket_io_client_1 = require("socket.io-client");
let socket = null;
const getSocket = () => {
    if (!socket) {
        socket = (0, socket_io_client_1.io)('http://localhost:3000', {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });
        socket.on('connect', () => {
            console.log('Connected to server via WebSocket');
        });
        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });
    }
    return socket;
};
exports.getSocket = getSocket;
const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
exports.disconnectSocket = disconnectSocket;
const sendMessageViaSocket = (username, content, sender) => {
    return new Promise((resolve, reject) => {
        const socket = (0, exports.getSocket)();
        socket.emit('send-message', { username, content, sender }, (response) => {
            if (response?.success) {
                resolve(response);
            }
            else {
                reject(response);
            }
        });
        // Listen for success response
        socket.once('send-message-success', (response) => {
            resolve(response);
        });
        // Listen for error response
        socket.once('send-message-error', (response) => {
            reject(response);
        });
        // Timeout after 5 seconds
        setTimeout(() => {
            reject({ success: false, message: 'Request timeout' });
        }, 5000);
    });
};
exports.sendMessageViaSocket = sendMessageViaSocket;
const checkAcceptingMessagesViaSocket = (username) => {
    return new Promise((resolve, reject) => {
        const socket = (0, exports.getSocket)();
        socket.emit('check-accepting-messages', { username });
        socket.once('check-accepting-messages-response', (response) => {
            if (response?.success) {
                resolve(response.isAccepting);
            }
            else {
                reject(response);
            }
        });
        // Timeout after 5 seconds
        setTimeout(() => {
            reject({ success: false, message: 'Request timeout' });
        }, 5000);
    });
};
exports.checkAcceptingMessagesViaSocket = checkAcceptingMessagesViaSocket;
const onNewMessage = (username, callback) => {
    const socket = (0, exports.getSocket)();
    socket.on(`new-message-${username}`, callback);
};
exports.onNewMessage = onNewMessage;
const offNewMessage = (username, callback) => {
    const socket = (0, exports.getSocket)();
    if (callback) {
        socket.off(`new-message-${username}`, callback);
    }
    else {
        socket.off(`new-message-${username}`);
    }
};
exports.offNewMessage = offNewMessage;
