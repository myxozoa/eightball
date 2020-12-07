import { createServer } from "http";
import { Server, Socket } from "socket.io";

const app = createServer();
const port = process.env.LISTEN_PORT || 3001;

const io = new Server(app, { serveClient: false });

io.on("connection", (socket: Socket) => {
  console.log(socket.id);
});

app.listen(port);
