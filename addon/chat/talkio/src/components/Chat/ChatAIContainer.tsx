// ChatAIContainer.tsx
import React, {useRef} from "react";
import {useAIChat} from "@/hooks/useAIChat";
import ChatUI from "./ChatUI";
interface ChatContainerProps {
	roomId: string;
	token: string;
}

const ChatAIContainer: React.FC<ChatContainerProps> = ({roomId, token}) => {
	const {
		messages,
		newMessage,
		setNewMessage,
		handleSend,
		receiverInfo,
		loading: isLoading,
		myInfo,
	} = useAIChat(roomId, token);

	const messagesEndRef = useRef<HTMLDivElement>(null);

	return (
		<ChatUI
			messages={messages}
			newMessage={newMessage}
			isLoading={isLoading}
			receiverInfo={receiverInfo}
			userInfo={myInfo}
			onMessageChange={setNewMessage}
			onSendMessage={handleSend}
			messagesEndRef={messagesEndRef}
		/>
	);
};

export default ChatAIContainer;
