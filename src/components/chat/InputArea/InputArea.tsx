import React, { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import type { MessageAttachment } from '../../../types';
import styles from './InputArea.module.css';

interface InputAreaProps {
  onSend: (message: string, attachments?: MessageAttachment[]) => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function InputArea({
  onSend,
  onStop,
  isLoading = false,
  disabled = false,
  placeholder = 'Введите сообщение...',
}: InputAreaProps) {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = value.trim();
    if ((trimmedValue || attachments.length > 0) && !disabled) {
      onSend(trimmedValue, attachments.length > 0 ? attachments : undefined);
      setValue('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = ev.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          { type: 'image', data, mimeType: file.type, name: file.name },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset so the same file can be selected again
    e.target.value = '';
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const canSend = (value.trim().length > 0 || attachments.length > 0) && !disabled && !isLoading;

  return (
    <div className={styles.wrapper}>
      {attachments.length > 0 && (
        <div className={styles.attachments}>
          {attachments.map((att, i) => (
            <div key={i} className={styles.attachmentPreview}>
              <img src={att.data} alt={att.name ?? 'image'} className={styles.previewImg} />
              <button
                type="button"
                className={styles.removeAttachment}
                onClick={() => removeAttachment(i)}
                aria-label="Удалить изображение"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.fileInput}
          onChange={handleFileChange}
          disabled={disabled || isLoading}
        />
        <button
          type="button"
          className={styles.attachButton}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
          aria-label="Прикрепить изображение"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
          />
        </div>
        {isLoading ? (
          <button
            type="button"
            className={styles.stopButton}
            onClick={onStop}
            aria-label="Остановить генерацию"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!canSend}
            aria-label="Отправить"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </form>
      <div className={styles.hint}>Shift + Enter для новой строки · Ctrl+V для вставки изображения</div>
    </div>
  );
}
