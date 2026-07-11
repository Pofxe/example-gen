import { useCallback, useState } from 'react';

export function useRandomSettingsOnGenerate<T>(
  settings: T,
  setSettings: (value: T) => void,
  randomize: () => T,
) {
  const [useRandomSettings, setUseRandomSettings] = useState(false);

  const applyRandomSettings = useCallback(() => {
    setSettings(randomize());
  }, [randomize, setSettings]);

  const resolveSettingsForGenerate = useCallback((): T => {
    if (!useRandomSettings) {
      return settings;
    }

    const nextSettings = randomize();
    setSettings(nextSettings);
    return nextSettings;
  }, [randomize, setSettings, settings, useRandomSettings]);

  return {
    useRandomSettings,
    setUseRandomSettings,
    applyRandomSettings,
    resolveSettingsForGenerate,
  };
}
