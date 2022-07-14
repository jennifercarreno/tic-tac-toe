import { Server, Socket } from "socket.io";
import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";

@SocketController()
export class GameController {
    private getSocketGameRoom(socket: Socket): string {
        const rooms = Array.from(socket.rooms.values())
        const socketRooms = rooms.filter((r) => r !== socket.id);
        const gameRoom = socketRooms && socketRooms[0];

        return gameRoom;
    }
    @OnMessage("update_game")
    public async updateGame(@SocketIO() io: Server, @ConnectedSocket() socket:Socket, @MessageBody() message: any ) {
        
        const gameRoom = this.getSocketGameRoom(socket);
        socket.to(gameRoom).emit("on_game_update", message);

    }
}