import React from 'react';
import { SendIcon } from 'lucide-react';
import styles from '@/components/UI/SendButton.module.css';

interface SendButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const SendButton: React.FC<SendButtonProps> = ({ onClick, disabled }) => (
  <button className={styles.sendButton} onClick={onClick} disabled={disabled}>
    <SendIcon className={styles.sendIcon} />
  </button>
);

export default SendButton;