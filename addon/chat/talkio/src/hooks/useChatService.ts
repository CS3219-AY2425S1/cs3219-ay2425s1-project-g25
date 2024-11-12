import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import ChatHubService from "../services/chatHubService";
import {
  Message,
  RoomInfo,
  ReceiverInfo,
  GroupReceiver,
  IChat,
  UserInfo,
} from "@/types/message";
import { decodeToken } from "@/utils/tokenHelper";
import { WebRTCService } from "@/services/webRTCService";

export function useChatService(
  accessToken: string,
  room: RoomInfo
): IChat {
  const chatServiceRef = useRef<ChatHubService>();
  if (!chatServiceRef.current) {
    chatServiceRef.current = new ChatHubService(accessToken);
  }
  const chatService = chatServiceRef.current;

  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<UserInfo[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const setLocalAudioLevel = useState(0)[ 1 ];

  const isVoiceEnabledRef = useRef(isVoiceEnabled);
  useEffect(() => {
    isVoiceEnabledRef.current = isVoiceEnabled;
  }, [isVoiceEnabled]);

  const webRTCServiceRef = useRef<WebRTCService>();
  if (!webRTCServiceRef.current) {
    webRTCServiceRef.current = new WebRTCService(
      chatService,
      isVoiceEnabledRef,
      (stream: MediaStream) => {
        setRemoteStreams((prevStreams) => {
          const streamExists = prevStreams.some(
            (s) => s.id === stream.id
          );
          if (!streamExists) {
            return [...prevStreams, stream];
          }
          return prevStreams;
        });
      },
      (level: number) => {
        setLocalAudioLevel(level);
      }
    );
  }

  const userInfo: UserInfo = useMemo(
    () => decodeToken(accessToken),
    [accessToken]
  );

  const derivedReceiverInfo: ReceiverInfo = useMemo(() => {
    if (room.type === "group") {
      return {
        id: room.roomId,
        name: "Group Chat",
        type: "group",
        members: participants,
      } as GroupReceiver;
    } else {
      const otherParticipant = participants.find((p) => p.id !== userInfo.id);
      return otherParticipant
        ? {
          id: otherParticipant.id,
          username: otherParticipant.username,
          type: "direct",
        }
        : null;
    }
  }, [room, participants, userInfo]);

  const initializeChatService = useCallback(async () => {
    try {
      setLoading(true);
      await chatService.startConnection();
      await chatService.joinRoom(room.roomId);
      console.log("Chat service initialized and joined room:", room.roomId);
    } catch (error) {
      console.error("Failed to initialize chat service:", error);
    } finally {
      setLoading(false);
    }
  }, [chatService, room.roomId]);

  const webRTCHandlersRef = useRef({
    handleOffer: (senderId: string, offer: RTCSessionDescriptionInit) =>
      webRTCServiceRef.current?.handleIncomingOffer(senderId, offer),
    handleAnswer: (senderId: string, answer: RTCSessionDescriptionInit) =>
      webRTCServiceRef.current?.handleIncomingAnswer(senderId, answer),
    handleIceCandidate: (senderId: string, candidate: RTCIceCandidateInit) =>
      webRTCServiceRef.current?.handleIncomingCandidate(senderId, candidate)
  });

  const toggleVoice = useCallback(async () => {
    if (isVoiceEnabled) {
      console.log("Disabling voice chat...");
      webRTCServiceRef.current?.cleanup();
      setIsVoiceEnabled(false);
    } else {
      console.log("Enabling voice chat...");
      setIsVoiceEnabled(true);

      if (derivedReceiverInfo && 'id' in derivedReceiverInfo) {
        const targetId = derivedReceiverInfo.id;
        await webRTCServiceRef.current?.setupConnection();
        await webRTCServiceRef.current?.createAndSendOffer(targetId);
      } else {
        console.error("No target available for voice chat.");
      }
    }
  }, [isVoiceEnabled, derivedReceiverInfo]);

  useEffect(() => {
    const messageHandler = (message: Message) => {
      console.log("Received message:", message);
      setMessages((prev) => [...prev, message]);
    };

    const membersHandler = (members: UserInfo[]) => {
      console.log("Room members updated:", members);
      setParticipants(members);
    };

    const userJoinedHandler = (userInfo: UserInfo, roomName: string) => {
      console.log(`${userInfo.username} joined ${roomName}`);
      setNotifications((prev) => [
        ...prev,
        `${userInfo.username} joined ${roomName}`,
      ]);
      setParticipants((prev) => [...prev, userInfo]);
    };

    const userLeftHandler = (userInfo: UserInfo, roomName: string) => {
      console.log(`${userInfo.username} left ${roomName}`);
      setNotifications((prev) => [
        ...prev,
        `${userInfo.username} left ${roomName}`,
      ]);
      setParticipants((prev) => prev.filter((user) => user.id !== userInfo.id));
    };

    chatService.onReceiveMessage(messageHandler);
    chatService.onRoomMembers(membersHandler);
    chatService.onUserJoined(userJoinedHandler);
    chatService.onUserLeft(userLeftHandler);

    chatService.onReceiveOffer(webRTCHandlersRef.current.handleOffer);
    chatService.onReceiveAnswer(webRTCHandlersRef.current.handleAnswer);
    chatService.onReceiveIceCandidate(webRTCHandlersRef.current.handleIceCandidate);

    initializeChatService();

    return () => {
      chatService.offReceiveMessage(messageHandler);
      chatService.offRoomMembers(membersHandler);
      chatService.offUserJoined(userJoinedHandler);
      chatService.offUserLeft(userLeftHandler);

      chatService.offReceiveOffer(webRTCHandlersRef!.current.handleOffer);
      chatService.offReceiveAnswer(webRTCHandlersRef!.current.handleAnswer);
      chatService.offReceiveIceCandidate(webRTCHandlersRef!.current.handleIceCandidate);

      chatService.leaveRoom(room.roomId);
      webRTCServiceRef.current?.cleanup();
      console.log("Cleaned up chat service.");
    };
  }, [chatService, room.roomId, initializeChatService]);

  useEffect(() => {
    return () => {
      chatService.stopConnection();
      console.log("Chat service connection stopped.");
      webRTCServiceRef.current?.cleanup();
    };
  }, [chatService]);

  const handleSend = useCallback(() => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      chatService.send(room.roomId, newMessage);
      setNewMessage("");
    }
  }, [chatService, newMessage, room.roomId]);

  return {
    messages,
    receiverInfo: derivedReceiverInfo,
    newMessage,
    setNewMessage,
    handleSend,
    loading,
    loadData: initializeChatService,
    myInfo: userInfo,
    toggleVoice,
    isVoiceEnabled,
    notifications,
    remoteStreams,
  };
}