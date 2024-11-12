import { BaseApi } from "../../infrastructure/Api/BaseApi";
import { Room } from "../../domain/entities/Room";

const API_URL = "/api/match";

export class RoomRemoteDataSource extends BaseApi {
    constructor() {
        super(API_URL);
    }

    async getRoomDetails(roomId: string): Promise<Room> {
        return await this.protectedGet<Room>(`/room/${roomId}`);
    }
}

export const roomRemoteDataSource = new RoomRemoteDataSource();
