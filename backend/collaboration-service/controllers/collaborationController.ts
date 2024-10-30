// controllers/collaborationController.js
import { EachMessagePayload } from 'kafkajs';
import { COLLAB_TOPIC, producer } from '../utils/kafkaClient';
import Session from 'models/Session';
import { YDocManager } from 'utils/yjs';


export const createSession = async ( matchId: string, userIds: string[]) => {
    // Create unique sessionId:
    const sessionId = `session-${Date.now()}-${userIds.join('-')}`;

    // Create new Session document in mongodb
    const newSession = new Session({ sessionId, matchId, userIds, codeContent: '' });
    await newSession.save();
    
    // Initialize Yjs document manager for this session
    YDocManager.initializeDoc(sessionId);

    return sessionId;
};

/**
 * Process the message from the Kafka topic and create a new session.
 * Emits a Kafka message back to the matching service with the session ID.
 * @param message - Kafka message payload
 */
export async function handleMatchNotification(message: EachMessagePayload) {
    /**
     * message contains all the info from the kafka message from matching-service. 
     * message looks like this:
     * {
     *  topic: 'match_topic',
     *  message: {
     *      key: matchId,
     *      value: {
     *         user1: { userId: user1.userId, socketId: user1.socketId },
                user2: { userId: user2.userId, socketId: user2.socketId },
                category: 'algo',
                difficulty: 'easy',
                matchId: 123 (mongoDB Id for match),
     *      }
     *  }
     * }
     */

    // Validation for message format
    const matchId = message.message.key?.toString();
    if (!matchId) {
        console.error("No match ID found in message.");
        return;
    }

    // TODO: Exact necessary fields from message and create session.
    // We want the ID from this session that was created, to return.
    const sessionId = await createSession(matchId, [ message.message.value?.user1?.userId, message.message.value?.user2?.userId]);

    // Send the session ID back to the matching service
    const messageBody = JSON.stringify({ sessionId });
    await producer.send({
        topic: COLLAB_TOPIC,
        messages: [
            {
                key: matchId,
                value: messageBody,
            },
        ],
    });

    console.log(`Sent Session ID ${sessionId} to collab service.`); // modify
}