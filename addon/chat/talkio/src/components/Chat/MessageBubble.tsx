import { Message, UserInfo } from '@/types/message';
import { formatTime } from '@/utils/dateTime';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from '@/components/Chat/MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
  userInfo: UserInfo;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, userInfo }) => {
  const isUser = message.senderId === userInfo.id;

  return (
    <div className={`${styles.messageBubble} ${isUser ? styles.yourMessage : styles.otherMessage}`}>
      {!isUser && <div className={styles.senderName}>{message.sender}</div>}
      <div className={styles.messageContent}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
      </div>
      <div className={styles.messageTimestamp}>{formatTime(message.datetime)}</div>
    </div>
  );
};

export default MessageBubble;
