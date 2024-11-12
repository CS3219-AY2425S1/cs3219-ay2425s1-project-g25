import { AssistantDto, Message } from "@/types/message";

;

const API_BASE_URL = 'http://localhost:7001/api/assistant';

export const fetchAssistantMessage = async (userMessage: string, signal: AbortSignal) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
            signal: signal,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response;

    } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Streaming error:', error.message);
        } else {
            console.error('An unknown error occurred');
        }
        return null;
    }
};

export const fetchAssistantInfo = async (signal: AbortSignal): Promise<AssistantDto> => {
    try {
        const response = await fetch(`${API_BASE_URL}/info`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: signal,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch assistant info');
        }

        const assistantInfo = await response.json();
        return assistantInfo;

    } catch (error) {
        console.error('Error fetching assistant info:', error);
        throw error;
    }
};

export const fetchConversationHistory = async (signal: AbortSignal): Promise<Message[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/history`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: signal,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch conversation history');
        }

        const history = await response.json();
        console.log(history)
        return history;

    } catch (error) {
        console.error('Error fetching conversation history:', error);
        throw error;
    }
};