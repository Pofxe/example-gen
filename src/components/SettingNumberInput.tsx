import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';

interface SettingNumberInputProps {
  label: ReactNode;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

function clamp(value: number, min?: number, max?: number): number {
  let next = value;
  if (min !== undefined) next = Math.max(min, next);
  if (max !== undefined) next = Math.min(max, next);
  return next;
}

function parseDraft(draft: string): number | null {
  const trimmed = draft.trim();
  if (trimmed === '' || trimmed === '-' || trimmed === '+') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function SettingNumberInput({
  label,
  value,
  onChange,
  min,
  max,
  disabled = false,
}: SettingNumberInputProps) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDraft(String(value));
    }
  }, [value, focused]);

  const commit = () => {
    const parsed = parseDraft(draft);
    if (parsed === null) {
      setDraft(String(value));
      return;
    }

    const next = clamp(parsed, min, max);
    setDraft(String(next));
    if (next !== value) {
      onChange(next);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  return (
    <label className="setting-field">
      <span className="setting-field__label">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={draft}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commit();
        }}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
      />
    </label>
  );
}
