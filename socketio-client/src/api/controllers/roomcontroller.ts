import { Server, Socket } from "socket.io";
import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";

@SocketController()
export class RoomController {
    @OnMessage("join_game")
    public async joinGame(@SocketIO() io: Server, @ConnectedSocket() socket:Socket, @MessageBody() message: any ) {
        console.log(socket.id, "joining room: ", message);
        // console.log("sockets length: ", socket)
        const connectedSockets = io.sockets.adapter.rooms;
        console.log("connected sockets: ", io.sockets.adapter.rooms.size);

        const room_array = Array.from(socket.rooms.values());
        const socketRooms = room_array.filter((r) => r !== socket.id);
        // console.log("room_array: ", room_array[0]);
        // console.log("socketRooms: ", socketRooms);

        if (socketRooms.length > 0 || (connectedSockets && connectedSockets.size === 2)) {
            console.log("room is full")
            socket.emit("room_join_error", {
                error: "Room is full",
                
            });
            
        } else {
            await socket.join(message.roomId);
            socket.emit("room_joined");

            if(io.sockets.adapter.rooms.get(message.roomId).size === 2) {
                console.log("two players in room")
                socket.emit("start_game", { start: true, symbol: "x" });
                socket.to(message.roomId).emit("start_game", { start: false, symbol: "o" });
                
            
                    }
        }
    }
}