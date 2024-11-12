import { roomRepository } from "../../data/repositories/RoomRepositoryImpl";
import { Room } from "../../domain/entities/Room";
import { IRoomRepository } from "../../domain/repositories/IRoomRepository";


export class RoomUseCases {
    constructor(private roomRepository: IRoomRepository) {}

    /**
     * A room's details (read-only view model).
     * @returns Promise resolving to a room's details (view model).
     */
    async getRoomDetails(roomId: string): Promise<Room> {
        const room = this.roomRepository.getRoomDetails(roomId);
		return room;
    }
}

export const roomUseCases = new RoomUseCases(roomRepository);
