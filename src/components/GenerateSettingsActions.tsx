interface GenerateSettingsActionsProps {
  useRandomSettings: boolean;
  onUseRandomSettingsChange: (value: boolean) => void;
  onApplyRandomSettings: () => void;
  onGenerate: () => void;
}

export function GenerateSettingsActions({
  useRandomSettings,
  onUseRandomSettingsChange,
  onApplyRandomSettings,
  onGenerate,
}: GenerateSettingsActionsProps) {
  return (
    <div className="generate-settings-block">
      <label className="setting-checkbox">
        <input
          type="checkbox"
          checked={useRandomSettings}
          onChange={(event) => onUseRandomSettingsChange(event.target.checked)}
        />
        <span>Случайные настройки при генерации</span>
      </label>

      <div className="generate-settings-block__actions">
        <button type="button" className="btn btn--ghost" onClick={onApplyRandomSettings}>
          Случайные настройки
        </button>
        <button type="button" className="btn btn--primary btn--generate" onClick={onGenerate}>
          Сгенерировать
        </button>
      </div>
    </div>
  );
}
