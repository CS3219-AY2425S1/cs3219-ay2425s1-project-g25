import { Message, UserInfo } from "@/types/message";

export default interface ChatService {
  sendIceCandidate(targetId: string, candidate: RTCIceCandidateInit): void;
  sendOffer(targetId: string, offer: RTCSessionDescriptionInit): void;
  sendAnswer(targetId: string, answer: RTCSessionDescriptionInit): void;
  startConnection(): Promise<void>;
  joinRoom(roomId: string): Promise<void>;
  leaveRoom(roomId: string): Promise<void>;
  onReceiveMessage(callback: (message: Message) => void): void;
  onRoomMembers(callback: (members: UserInfo[]) => void): void;
  onUserJoined(callback: (userInfo: UserInfo, roomName: string) => void): void;
  onUserLeft(callback: (userInfo: UserInfo, roomName: string) => void): void;
  onReceiveOffer(callback: (senderId: string, offer: RTCSessionDescriptionInit) => void): void;
  onReceiveAnswer(callback: (senderId: string, answer: RTCSessionDescriptionInit) => void): void;
  onReceiveIceCandidate(callback: (senderId: string, candidate: RTCIceCandidateInit) => void): void;
  offReceiveMessage(callback: (message: Message) => void): void;
  offRoomMembers(callback: (members: UserInfo[]) => void): void;
  offUserJoined(callback: (userInfo: UserInfo, roomName: string) => void): void;
  offUserLeft(callback: (userInfo: UserInfo, roomName: string) => void): void;
  offReceiveOffer(callback: (senderId: string, offer: RTCSessionDescriptionInit) => void): void;
  offReceiveAnswer(callback: (senderId: string, answer: RTCSessionDescriptionInit) => void): void;
  offReceiveIceCandidate(callback: (senderId: string, candidate: RTCIceCandidateInit) => void): void;
  stopConnection(): void;
}