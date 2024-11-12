import { Room } from "../../domain/entities/Room";

export interface IRoomRepository {
	getRoomDetails(roomId: string): Promise<Room>;
}
