export interface Message {
    id: string;
    role: string;
    sender: string;
    senderId: string;
    content: string;
    datetime: string;
}
export interface IInitialize {
    loadData: (roomId: string, token: string) => Promise<void>;
    receiverInfo: ReceiverInfo | null;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export interface ISendMessage {
    newMessage: string;
    setNewMessage: React.Dispatch<React.SetStateAction<string>>;
    handleSend: () => void;
}

export interface IReceiveMessage {
    loading: boolean;
    startReceiving: (message: string) => void;
}
export interface UserInfo {
    id: string;
    username: string;
}


export interface GroupReceiver {
    id: string;
    name: string;
    type: 'group';
    members: UserInfo[];
}
export interface AssistantDto {
    id: string;
    object: string;
    createdAt: number;
    name: string;
    description?: string;
    model: string;
    instructions?: string;
    tools?: string;
    metadata?: string;
    temperature?: number;
    responseFormat?: string;
}
export type ReceiverInfo = AssistantDto | UserInfo | GroupReceiver | null;
export interface RoomInfo {
    roomId: string;
    type: 'group' | 'direct';
}


export interface IChat {
    messages: Message[];
    receiverInfo: ReceiverInfo | null;
    loading: boolean;
    newMessage: string;
    setNewMessage: React.Dispatch<React.SetStateAction<string>>;
    handleSend: () => void;
    loadData: () => Promise<void>;
    myInfo: UserInfo;
    remoteStreams?: MediaStream[] | null;
    toggleVoice?: () => Promise<void> | null;
    isVoiceEnabled?: boolean | null;
    notifications?: string[] | null;
}


export interface JoinRoomRequestDto {
    RoomId: string;
}

export interface LeaveRoomRequestDto {
    RoomId: string;
}

export interface SendMessageRequestDto {
    RoomId: string;
    Message: Message;
}

export interface RoomInfoDto {
    RoomId: string;
    Type: string; // 'group' | 'direct'
}