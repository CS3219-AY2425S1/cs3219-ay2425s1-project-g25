import React, { useRef } from 'react';
import styles from '@/components/UI/InputField.module.css';

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ value, onChange, onSend, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && value.trim() !== '') {
      event.preventDefault();
      onSend();
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <textarea
      ref={textareaRef}
      className={styles.messageInput}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Type a message..."
      disabled={disabled}
      rows={1}
    />
  );
};

export default InputField;