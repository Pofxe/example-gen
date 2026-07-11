import { useEffect, useRef, useState, type FormEvent } from 'react';
import { verifyJsonExportPassword } from '../utils/jsonExportPassword';

interface JsonExportPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function JsonExportPasswordDialog({
  open,
  onClose,
  onSuccess,
}: JsonExportPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setPassword('');
      setError(null);
      setIsChecking(false);
      return;
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsChecking(true);

    try {
      const isValid = await verifyJsonExportPassword(password);
      if (!isValid) {
        setError('Неверный пароль');
        return;
      }

      onSuccess();
      onClose();
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="export-dialog-backdrop" onClick={onClose}>
      <div
        className="export-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="export-dialog-title" className="export-dialog__title">
          Пароль для JSON
        </h3>
        <p className="export-dialog__text">
          JSON содержит ответы. Введите пароль, чтобы скачать файл.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="export-dialog__field">
            <span className="export-dialog__label">Пароль</span>
            <input
              ref={inputRef}
              type="password"
              className="export-dialog__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isChecking}
            />
          </label>

          {error && <p className="export-dialog__error">{error}</p>}

          <div className="export-dialog__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!password || isChecking}
            >
              {isChecking ? 'Проверка…' : 'Скачать JSON'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
