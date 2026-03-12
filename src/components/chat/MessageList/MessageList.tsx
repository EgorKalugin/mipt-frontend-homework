import { useEffect, useRef } from 'react';
import type { Message as MessageType } from '../../../types';
import { Message } from '../Message';
import { TypingIndicator } from '../TypingIndicator';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: MessageType[];
  isTyping?: boolean;
}

export function MessageList({ messages, isTyping = false }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className={styles.list}>
      <div className={styles.messages}>
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
      <div ref={scrollRef} className={styles.scrollAnchor} />
    </div>
  );
}
