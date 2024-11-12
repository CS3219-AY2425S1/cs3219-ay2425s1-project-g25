"use client";
import ChatContainer from "@/components/Chat/ChatContainer";
import React, {use} from "react";

export default function Page({
	params,
	searchParams,
}: {
	params: Promise<{roomName: string}>;
	searchParams: Promise<{token: string}>;
}) {
	const {roomName} = use(params);
	const {token} = use(searchParams);
	return <ChatContainer token={token} roomId={roomName} />;
}
