import { io } from "socket.io-client";
import './global.scss';
import './style.scss';

const server = io();

// socket.on("connect", () => {
//   console.log(socket.connected); // true
// });

// socket.on("disconnect", () => {
//   console.log(socket.connected); // false
// });
