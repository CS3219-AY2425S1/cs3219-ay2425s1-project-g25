"use client";
import ChatAIContainer from "@/components/Chat/ChatAIContainer";

export default function Page() {
	return (
		<ChatAIContainer
			token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIyMzQ1Njc4OTAiLCJ1c2VybmFtZSI6IkNoYXRpbyIsImlhdCI6MTUxNjIzOTAyMn0.kuqpqTllOQ0mkYbHbNuxLFSxFy2L5fVI3XvK-gHvFB8"
			roomId="roomName"
		/>
	);
}
