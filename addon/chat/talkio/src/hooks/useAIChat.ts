import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AssistantDto, IChat, Message, ReceiverInfo, UserInfo } from '@/types/message';
import { fetchAssistantInfo, fetchConversationHistory, fetchAssistantMessage } from '@/services/chatAIService';
import { decodeToken } from "@/utils/tokenHelper";

export const useAIChat = (roomId: string, token: string): IChat => {
    const [ messages, setMessages ] = useState<Message[]>([]);
    const [ receiverInfo, setReceiverInfo ] = useState<ReceiverInfo | null>(null);
    const [ newMessage, setNewMessage ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const myInfo: UserInfo = useMemo(() => decodeToken(token), [ token ]);

    const loadData = useCallback(async () => {
        try {
            const [ info, history ] = await Promise.all([
                fetchAssistantInfo(new AbortController().signal),
                fetchConversationHistory(new AbortController().signal)
            ]);

            setReceiverInfo(info);

            const processedMessages = history.map((msg: Message) => ({
                ...msg,
                sender: msg.role === 'user' ? myInfo.username : info?.name || 'assistant',
            }));

            console.log(processedMessages);

            setMessages(processedMessages);
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        }
    }, [ myInfo.username ]);

    const startReceiving = async (userMessage: string) => {
        if (!receiverInfo) return;

        setLoading(true);
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        const newAssistantMessage: Message = {
            id: `${Date.now()}-receiver`,
            role: 'assistant',
            senderId: 'nill',
            sender: (receiverInfo as AssistantDto).name,
            content: '',
            datetime: new Date().toLocaleString(),
        };

        setMessages((prev) => [ ...prev, newAssistantMessage ]);

        try {
            const response = await fetchAssistantMessage(userMessage, abortControllerRef.current.signal);
            if (response && response.body) {
                const reader = response.body.getReader();
                let messageContent = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = new TextDecoder().decode(value);
                    const lines = chunk.split('\n\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const decodedData = decodeURIComponent(line.slice(6));
                            messageContent += decodedData;
                            updateReceiverMessage(newAssistantMessage.id, messageContent);
                        }
                    }
                }
            } else {
                console.error('Invalid response or response body missing');
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Receiving error:', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateReceiverMessage = (messageId: string, content: string) => {
        setMessages((prevMessages) => prevMessages.map((msg) => (msg.id === messageId ? { ...msg, content: content } : msg)));
    };

    const handleSend = () => {
        if (newMessage.trim()) {
            const userMessage: Message = {
                id: generateUniqueId(),
                role: 'user',
                sender: myInfo.username,
                senderId: myInfo.id,
                content: newMessage,
                datetime: new Date().toLocaleString(),
            };
            setMessages((prev) => [ ...prev, userMessage ]);
            startReceiving(newMessage);
            setNewMessage('');
        }
    };

    useEffect(() => {
        loadData();
    }, [ loadData ]);

    return {
        messages,
        receiverInfo,
        loading,
        newMessage,
        setNewMessage,
        handleSend,
        loadData,
        myInfo,
    };
};

const generateUniqueId = (() => {
    let counter = 0;
    return () => {
        const timestamp = Date.now();
        const uniqueId = `${timestamp}-${counter}`;
        counter = (counter + 1) % 1000;
        return uniqueId;
    };
})();
