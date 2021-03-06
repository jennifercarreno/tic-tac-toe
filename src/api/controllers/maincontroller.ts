import { SocketController, OnConnect, ConnectedSocket, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";

@SocketController()
class MainController {
    @OnConnect()
    public onConnection(
        @ConnectedSocket() socket: Socket, 
        @SocketIO() io: Server)
        {
        console.log("new socket connected: ", socket.id)
    }

}