import { Socket } from "socket.io-client";
import { IPlayMatrix } from "../../components/game";

class GameService {
    public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
        return new Promise((rs, rj) => {
            socket.emit("join_game", { roomId });

            socket.on("room_joined" , () => rs(true));
            socket.on("room_joined_error", ({ error}) => rj(error));
        });
    }

    public async updateGame(socket: Socket, gameMatrix: IPlayMatrix) {
        socket.emit("update_game", { matrix: gameMatrix});
    }

    public async onGameUpdate(socket: Socket, listener: (matrix: IPlayMatrix) => void) {
        socket.on("on_game_update", ({ matrix }) => listener(matrix));
    }
}

export default new GameService();