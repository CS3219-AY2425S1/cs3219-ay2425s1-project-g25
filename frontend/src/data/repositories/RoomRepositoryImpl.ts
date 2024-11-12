import { roomRemoteDataSource } from './RoomRemoteDataSource';
import { Room } from '../../domain/entities/Room';
import { IRoomRepository } from 'domain/repositories/IRoomRepository';

export class RoomRepositoryImpl implements IRoomRepository {
    private dataSource = roomRemoteDataSource;

    async getRoomDetails(roomId: string): Promise<Room> {
        return this.dataSource.getRoomDetails(roomId);
    }
}

export const roomRepository = new RoomRepositoryImpl();
