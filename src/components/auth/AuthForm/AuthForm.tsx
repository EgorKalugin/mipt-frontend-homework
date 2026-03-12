import { useState, type FormEvent } from 'react';
import type { AuthCredentials, Scope } from '../../../types';
import { ErrorMessage } from '../../common/ErrorMessage';
import styles from './AuthForm.module.css';

interface AuthFormProps {
  onSubmit: (credentials: AuthCredentials) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function AuthForm({ onSubmit, isLoading = false, error }: AuthFormProps) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [scope, setScope] = useState<Scope>('GIGACHAT_API_PERS');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (clientId.trim() && clientSecret.trim()) {
      onSubmit({ clientId: clientId.trim(), clientSecret: clientSecret.trim(), scope });
    }
  };

  const canSubmit = clientId.trim() && clientSecret.trim() && !isLoading;

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.logo}>
          <svg
            className={styles.logoIcon}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          GigaChat
        </div>

        <h1 className={styles.title}>Авторизация</h1>
        <p className={styles.subtitle}>
          Введите учётные данные для доступа к API
        </p>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="clientId">
            Client ID
          </label>
          <input
            id="clientId"
            type="text"
            className={styles.input}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Введите Client ID"
            disabled={isLoading}
            autoComplete="username"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="clientSecret">
            Client Secret
          </label>
          <input
            id="clientSecret"
            type="password"
            className={styles.input}
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="Введите Client Secret"
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="scope">
            Scope
          </label>
          <select
            id="scope"
            className={styles.select}
            value={scope}
            onChange={(e) => setScope(e.target.value as Scope)}
            disabled={isLoading}
          >
            <option value="GIGACHAT_API_PERS">Персональный</option>
            <option value="GIGACHAT_API_CORP">Корпоративный</option>
            <option value="GIGACHAT_API_B2B">B2B</option>
          </select>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={!canSubmit}
        >
          {isLoading ? 'Авторизация...' : 'Войти'}
        </button>

        {error && (
          <div className={styles.error}>
            <ErrorMessage message={error} />
          </div>
        )}

        <div className={styles.hint}>
          Получить ключи API можно на{' '}
          <a
            href="https://developers.sber.ru/portal/products/gigachat-api"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            портале разработчиков Сбера
          </a>
        </div>
      </form>
    </div>
  );
}
