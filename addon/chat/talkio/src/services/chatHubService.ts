// chatHubService.ts
import {
  Message,
  JoinRoomRequestDto,
  LeaveRoomRequestDto,
  SendMessageRequestDto,
  UserInfo,
} from "@/types/message";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";
import ChatService from "./chatService";

class ChatHubService implements ChatService {
  private connection: HubConnection | null = null;
  private isConnecting: boolean = false;
  private connectionEstablishedPromise: Promise<void> | null = null;

  // Store event handlers
  private receiveMessageHandlers: Array<(message: Message) => void> = [];
  private roomMembersHandlers: Array<(members: UserInfo[]) => void> = [];
  private userJoinedHandlers: Array<(userInfo: UserInfo, roomName: string) => void> = [];
  private userLeftHandlers: Array<(userInfo: UserInfo, roomName: string) => void> = [];
  private receiveOfferHandlers: Array<(senderId: string, offer: RTCSessionDescriptionInit) => void> = [];
  private receiveAnswerHandlers: Array<(senderId: string, answer: RTCSessionDescriptionInit) => void> = [];
  private receiveIceCandidateHandlers: Array<(senderId: string, candidate: RTCIceCandidateInit) => void> = [];

  constructor(public readonly accessToken: string) { }

  public async startConnection(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) return;
    if (this.isConnecting && this.connectionEstablishedPromise) {
      await this.connectionEstablishedPromise;
      return;
    }

    this.isConnecting = true;

    this.connectionEstablishedPromise = new Promise<void>(async (resolve, reject) => {
      try {
        const connection = new HubConnectionBuilder()
          .withUrl("http://localhost:7001/hubs/chat", {
            accessTokenFactory: async () => this.accessToken,
          })
          .configureLogging(LogLevel.Debug)
          .withAutomaticReconnect()
          .build();

        this.connection = connection;

        await connection.start();
        this.registerEventHandlers(connection);

        console.log("SignalR Connected");

        // Wait until the connection state is 'Connected'
        while (this.connection.state !== HubConnectionState.Connected) {
          await new Promise((res) => setTimeout(res, 10));
        }

        resolve();
      } catch (err) {
        console.error("SignalR Connection Error: ", err);
        reject(err);
      } finally {
        this.isConnecting = false;
      }
    });

    return this.connectionEstablishedPromise;
  }

  private registerEventHandlers(connection: HubConnection) {
    // Message handlers
    connection.on("ReceiveMessage", (message: Message) => {
      console.log("Received message:", message);
      this.receiveMessageHandlers.forEach((handler) => handler(message));
    });

    connection.on("RoomMembers", (members: UserInfo[]) => {
      console.log("Room members:", members);
      this.roomMembersHandlers.forEach((handler) => handler(members));
    });

    connection.on("UserJoined", (userInfo: UserInfo, roomName: string) => {
      this.userJoinedHandlers.forEach((handler) => handler(userInfo, roomName));
    });

    connection.on("UserLeft", (userInfo: UserInfo, roomName: string) => {
      this.userLeftHandlers.forEach((handler) => handler(userInfo, roomName));
    });

    // WebRTC signaling events
    connection.on("ReceiveOffer", (senderId: string, offer: RTCSessionDescriptionInit) => {
      console.log("Received WebRTC offer from:", senderId);
      this.receiveOfferHandlers.forEach((handler) => handler(senderId, offer));
    });

    connection.on("ReceiveAnswer", (senderId: string, answer: RTCSessionDescriptionInit) => {
      console.log("Received WebRTC answer from:", senderId);
      this.receiveAnswerHandlers.forEach((handler) => handler(senderId, answer));
    });

    connection.on("ReceiveIceCandidate", (senderId: string, candidate: RTCIceCandidateInit) => {
      console.log("Received ICE candidate from:", senderId);
      this.receiveIceCandidateHandlers.forEach((handler) => handler(senderId, candidate));
    });
  }

  public async stopConnection(): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.stop();
      this.connection = null;
      console.log("SignalR Disconnected");
    } catch (err) {
      console.error("SignalR Disconnection Error: ", err);
    }
  }

  public async joinRoom(roomId: string): Promise<void> {
    if (!this.connection) {
      throw new Error("Cannot join room: connection is not established.");
    }
    if (this.connection.state !== HubConnectionState.Connected) {
      throw new Error("Cannot join room: connection is not in 'Connected' state.");
    }
    const request: JoinRoomRequestDto = { RoomId: roomId };
    await this.connection.invoke("JoinRoom", request);
  }

  public async leaveRoom(roomId: string): Promise<void> {
    if (!this.connection) return;
    if (this.connection.state !== HubConnectionState.Connected) {
      throw new Error("Cannot leave room: connection is not in 'Connected' state.");
    }
    const request: LeaveRoomRequestDto = { RoomId: roomId };
    await this.connection.invoke("LeaveRoom", request);
  }

  public async send(roomId: string, messageContent: string): Promise<void> {
    if (!this.connection) return;
    if (this.connection.state !== HubConnectionState.Connected) {
      throw new Error("Cannot send message: connection is not in 'Connected' state.");
    }

    const messageDto: Message = {
      id: crypto.randomUUID(),
      role: "user",
      sender: "nil",
      senderId: "nil",
      content: messageContent,
      datetime: new Date().toISOString(),
    };

    const request: SendMessageRequestDto = {
      RoomId: roomId,
      Message: messageDto,
    };

    await this.connection.invoke("SendMessageToRoom", request);
  }

  public onReceiveMessage(callback: (message: Message) => void): void {
    this.receiveMessageHandlers.push(callback);
  }

  public offReceiveMessage(callback: (message: Message) => void): void {
    this.receiveMessageHandlers = this.receiveMessageHandlers.filter((h) => h !== callback);
  }

  public onRoomMembers(callback: (members: UserInfo[]) => void): void {
    this.roomMembersHandlers.push(callback);
  }

  public offRoomMembers(callback: (members: UserInfo[]) => void): void {
    this.roomMembersHandlers = this.roomMembersHandlers.filter((h) => h !== callback);
  }

  public onUserJoined(callback: (userInfo: UserInfo, roomName: string) => void): void {
    this.userJoinedHandlers.push(callback);
  }

  public offUserJoined(callback: (userInfo: UserInfo, roomName: string) => void): void {
    this.userJoinedHandlers = this.userJoinedHandlers.filter((h) => h !== callback);
  }


  public onUserLeft(callback: (userInfo: UserInfo, roomName: string) => void): void {
    this.userLeftHandlers.push(callback);
  }

  public offUserLeft(callback: (userInfo: UserInfo, roomName: string) => void): void {
    this.userLeftHandlers = this.userLeftHandlers.filter((h) => h !== callback);
  }


  public async sendOffer(targetId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error("Cannot send offer: connection is not in 'Connected' state.");
    }
    await this.connection.invoke("SendOffer", targetId, offer);
  }

  public async sendAnswer(targetId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error("Cannot send answer: connection is not in 'Connected' state.");
    }
    await this.connection.invoke("SendAnswer", targetId, answer);
  }

  public async sendIceCandidate(targetId: string, candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error("Cannot send ICE candidate: connection is not in 'Connected' state.");
    }
    await this.connection.invoke("SendIceCandidate", targetId, candidate);
  }

  public onReceiveOffer(callback: (senderId: string, offer: RTCSessionDescriptionInit) => void): void {
    this.receiveOfferHandlers.push(callback);
  }

  public offReceiveOffer(callback: (senderId: string, offer: RTCSessionDescriptionInit) => void): void {
    this.receiveOfferHandlers = this.receiveOfferHandlers.filter((h) => h !== callback);
  }

  public onReceiveAnswer(callback: (senderId: string, answer: RTCSessionDescriptionInit) => void): void {
    this.receiveAnswerHandlers.push(callback);
  }

  public offReceiveAnswer(callback: (senderId: string, answer: RTCSessionDescriptionInit) => void): void {
    this.receiveAnswerHandlers = this.receiveAnswerHandlers.filter((h) => h !== callback);
  }

  public onReceiveIceCandidate(callback: (senderId: string, candidate: RTCIceCandidateInit) => void): void {
    this.receiveIceCandidateHandlers.push(callback);
  }

  public offReceiveIceCandidate(callback: (senderId: string, candidate: RTCIceCandidateInit) => void): void {
    this.receiveIceCandidateHandlers = this.receiveIceCandidateHandlers.filter((h) => h !== callback);
  }
}

export default ChatHubService;
