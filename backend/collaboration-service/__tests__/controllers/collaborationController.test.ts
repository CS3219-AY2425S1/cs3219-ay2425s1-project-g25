// File: __tests__/controllers/collaborationController.test.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createSession, handleMatchNotification } from '../../controllers/collaborationController';
import Session from '../../models/Session';
import { producer } from '../../utils/kafkaClient';
import { EachMessagePayload, KafkaMessage } from 'kafkajs';
 

// Mock the kafka producer
jest.mock('../../utils/kafkaClient', () => ({
    producer: {
        send: jest.fn(),
    },
    COLLAB_TOPIC: 'collaboration_topic'
}));

describe('Collaboration Controller Tests', () => {
    let mongoServer: MongoMemoryServer;
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    // Setup before all tests
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    // Cleanup after all tests
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    // Setup before each test
    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    // Cleanup after each test
    afterEach(async () => {
        await Session.deleteMany({});
        jest.clearAllMocks();
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('createSession', () => {
        it('should create a new session successfully', async () => {
            const matchId = 'match-123';
            const userIds = ['user1', 'user2'];

            const sessionId = await createSession(matchId, userIds);

            const session = await Session.findOne({ sessionId });
            expect(session).toBeTruthy();
            expect(session?.matchId).toBe(matchId);
            expect(session?.codeContent).toBe('');
            expect(sessionId).toContain('session-');
            expect(sessionId).toContain(userIds.join('-'));
        });

        it('should create unique session IDs for different user combinations', async () => {
            const matchId1 = 'match-123';
            const matchId2 = 'match-456';
            const users1 = ['userA', 'userB'];
            const users2 = ['userC', 'userD'];

            const sessionId1 = await createSession(matchId1, users1);
            const sessionId2 = await createSession(matchId2, users2);

            expect(sessionId1).not.toBe(sessionId2);

            const sessions = await Session.find({});
            expect(sessions).toHaveLength(2);
        });
    });

    describe('handleMatchNotification', () => {
        it('should process match notification and create session', async () => {
            const mockKafkaMessage: KafkaMessage = {
                key: Buffer.from('match-123'),
                value: Buffer.from(JSON.stringify({
                    user1: { userId: 'user1', socketId: 'socket1' },
                    user2: { userId: 'user2', socketId: 'socket2' },
                    category: 'algo',
                    difficulty: 'easy',
                    matchId: 'match-123'
                })),
                timestamp: '0',
                size: 0,
                attributes: 0,
                offset: '0'
            };

            const mockPayload: Partial<EachMessagePayload> = {
                topic: 'match_topic',
                partition: 0,
                message: mockKafkaMessage
            };

            await handleMatchNotification(mockPayload as EachMessagePayload);

            // Verify console logs
            expect(consoleLogSpy).toHaveBeenCalledWith('Collab service creating session');
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Sent Session ID'));
            expect(consoleErrorSpy).not.toHaveBeenCalled();

            // Verify session creation
            const sessions = await Session.find({});
            expect(sessions).toHaveLength(1);
            expect(sessions[0].matchId).toBe('match-123');

            // Verify Kafka message
            expect(producer.send).toHaveBeenCalledWith({
                topic: 'collaboration_topic',
                messages: [
                    {
                        key: 'match-123',
                        value: expect.any(String)
                    }
                ]
            });

            const kafkaCall = (producer.send as jest.Mock).mock.calls[0][0];
            const sentMessage = JSON.parse(kafkaCall.messages[0].value);
            expect(sentMessage).toHaveProperty('sessionId');
        });

        it('should handle invalid message format gracefully', async () => {
            const mockKafkaMessage: KafkaMessage = {
                key: null,
                value: Buffer.from('invalid json'),
                timestamp: '0',
                size: 0,
                attributes: 0,
                offset: '0'
            };

            const mockPayload: Partial<EachMessagePayload> = {
                topic: 'match_topic',
                partition: 0,
                message: mockKafkaMessage
            };

            await handleMatchNotification(mockPayload as EachMessagePayload);

            // Verify console logs
            expect(consoleLogSpy).toHaveBeenCalledWith('Collab service creating session');
            expect(consoleErrorSpy).toHaveBeenCalledWith('No match ID/value found in message.');

            // Verify no session was created
            const sessions = await Session.find({});
            expect(sessions).toHaveLength(0);
            expect(producer.send).not.toHaveBeenCalled();
        });

        it('should handle missing user IDs gracefully', async () => {
            const mockKafkaMessage: KafkaMessage = {
                key: Buffer.from('match-123'),
                value: Buffer.from(JSON.stringify({
                    category: 'algo',
                    difficulty: 'easy',
                    matchId: 'match-123'
                })),
                timestamp: '0',
                size: 0,
                attributes: 0,
                offset: '0'
            };

            const mockPayload: Partial<EachMessagePayload> = {
                topic: 'match_topic',
                partition: 0,
                message: mockKafkaMessage
            };

            await handleMatchNotification(mockPayload as EachMessagePayload);

            // Verify console logs
            expect(consoleLogSpy).toHaveBeenCalledWith('Collab service creating session');
            expect(consoleErrorSpy).toHaveBeenCalledWith('User IDs not found in message.');

            // Verify no session was created
            const sessions = await Session.find({});
            expect(sessions).toHaveLength(0);
            expect(producer.send).not.toHaveBeenCalled();
        });
    });
});
