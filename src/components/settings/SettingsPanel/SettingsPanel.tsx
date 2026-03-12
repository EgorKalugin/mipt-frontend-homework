import { useState } from 'react';
import type { Settings, Scope } from '../../../types';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

export function SettingsPanel({ settings, onSave, onClose }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Настройки</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Закрыть"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Внешний вид</h3>
            <div className={styles.field}>
              <label className={styles.label}>Тема</label>
              <div className={styles.themeToggle}>
                <button
                  className={`${styles.themeButton} ${localSettings.theme === 'light' ? styles.themeButtonActive : ''}`}
                  onClick={() =>
                    setLocalSettings({ ...localSettings, theme: 'light' })
                  }
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  Светлая
                </button>
                <button
                  className={`${styles.themeButton} ${localSettings.theme === 'dark' ? styles.themeButtonActive : ''}`}
                  onClick={() =>
                    setLocalSettings({ ...localSettings, theme: 'dark' })
                  }
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  Тёмная
                </button>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>API настройки</h3>
            <div className={styles.field}>
              <label className={styles.label}>Scope</label>
              <select
                className={styles.select}
                value={localSettings.scope}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    scope: e.target.value as Scope,
                  })
                }
              >
                <option value="GIGACHAT_API_PERS">Персональный</option>
                <option value="GIGACHAT_API_CORP">Корпоративный</option>
                <option value="GIGACHAT_API_B2B">B2B</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Модель</label>
              <select
                className={styles.select}
                value={localSettings.model}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, model: e.target.value })
                }
              >
                <option value="GigaChat">GigaChat</option>
                <option value="GigaChat-Plus">GigaChat-Plus</option>
                <option value="GigaChat-Pro">GigaChat-Pro</option>
              </select>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Параметры генерации</h3>
            <div className={styles.field}>
              <label className={styles.label}>
                Temperature (креативность)
              </label>
              <div className={styles.rangeWrapper}>
                <input
                  type="range"
                  className={styles.range}
                  min="0"
                  max="2"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      temperature: parseFloat(e.target.value),
                    })
                  }
                />
                <span className={styles.rangeValue}>
                  {localSettings.temperature.toFixed(1)}
                </span>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Максимум токенов</label>
              <div className={styles.rangeWrapper}>
                <input
                  type="range"
                  className={styles.range}
                  min="256"
                  max="4096"
                  step="256"
                  value={localSettings.maxTokens}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      maxTokens: parseInt(e.target.value),
                    })
                  }
                />
                <span className={styles.rangeValue}>
                  {localSettings.maxTokens}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={handleSave}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
