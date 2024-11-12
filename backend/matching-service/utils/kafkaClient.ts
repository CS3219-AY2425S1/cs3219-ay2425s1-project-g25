import { Kafka } from "kafkajs";
import {
    handleCollabMessage,
    handleQuestionMessage,
} from "../workers/matchWorker";

const HOST = process.env.KAFKA_HOST || "localhost";
const PORT = process.env.KAFKA_PORT || "9092";

const kafka = new Kafka({
    clientId: "matching-service",
    brokers: [`${HOST}:${PORT}`],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "matching-service-group" });
const admin = kafka.admin();

export const MATCH_TOPIC = "match_topic";
export const COLLAB_TOPIC = "collaboration_topic";
export const QUESTION_TOPIC = "question_topic";

/**
 * Initializes Kafka with a retry mechanism.
 */
async function initKafka(maxRetries = 5, retryDelay = 2000) {
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await admin.connect();

            // Check and create topics with the correct replication factor
            const topics = await admin.listTopics();
            const topicsToCreate = [];

            if (!topics.includes(MATCH_TOPIC)) {
                topicsToCreate.push({
                    topic: MATCH_TOPIC,
                    numPartitions: 1,
                    replicationFactor: 1,
                });
            }

            if (!topics.includes(COLLAB_TOPIC)) {
                topicsToCreate.push({
                    topic: COLLAB_TOPIC,
                    numPartitions: 1,
                    replicationFactor: 1,
                });
            }

            if (topicsToCreate.length > 0) {
                await admin.createTopics({
                    topics: topicsToCreate,
                });
                console.log(
                    "Created missing topics:",
                    topicsToCreate.map((t) => t.topic)
                );
            } else {
                console.log("All required topics exist.");
            }

            await admin.disconnect();
            await producer.connect();
            await consumer.connect();
            console.log("Connected to Kafka");
            return;
        } catch (error) {
            retries++;
            console.error(
                `Failed to connect to Kafka (attempt ${retries} of ${maxRetries}):`,
                error
            );
            if (retries >= maxRetries) {
                console.error("Max retries reached. Exiting.");
                throw error;
            }
            await new Promise((resolve) =>
                setTimeout(resolve, retryDelay * retries)
            );
        }
    }
}

export async function setUpKafkaSubscribers() {
    await initKafka();

    await consumer.subscribe({ topic: COLLAB_TOPIC, fromBeginning: true });
    await consumer.subscribe({ topic: QUESTION_TOPIC, fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            if (topic === COLLAB_TOPIC) {
                await handleCollabMessage(message);
            } else if (topic === QUESTION_TOPIC) {
                await handleQuestionMessage(message);
            }
        },
    });
}
