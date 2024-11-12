// ChatContainer.tsx
import React, { useRef, useEffect } from 'react';
import { useChatService } from '@/hooks/useChatService';
import ChatUI from './ChatUI';

interface ChatContainerProps {
    roomId: string;
    token: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ roomId, token }) => {
    const {
        messages,
        newMessage,
        setNewMessage,
        handleSend,
        receiverInfo,
        loading: isStreaming,
        loadData,
        myInfo,
        toggleVoice,
        isVoiceEnabled,
        remoteStreams
    } = useChatService(token, { roomId, type: 'direct' });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <ChatUI
            messages={messages}
            newMessage={newMessage}
            isLoading={isStreaming}
            receiverInfo={receiverInfo}
            userInfo={myInfo}
            onMessageChange={setNewMessage}
            onSendMessage={handleSend}
            messagesEndRef={messagesEndRef}
            isVoiceEnabled={isVoiceEnabled}
            onToggleVoice={toggleVoice}
            remoteStreams={remoteStreams}
        />
    );
};

export default ChatContainer;
