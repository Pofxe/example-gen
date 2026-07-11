import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { WorksheetView } from '../components/WorksheetView';
import { readWorksheetFile, WorksheetParseError } from '../utils/importProblems';
import type { LoadedWorksheet } from '../types/worksheet';

export function LoadAssignmentPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [worksheet, setWorksheet] = useState<LoadedWorksheet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setFileName(file.name);

    try {
      const parsed = await readWorksheetFile(file);
      setWorksheet(parsed);
    } catch (err) {
      setWorksheet(null);
      setError(err instanceof WorksheetParseError ? err.message : 'Не удалось прочитать файл');
    }
  }, []);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  return (
    <div className="page topic-page">
      <Link to="/" className="back-link">
        ← На главную
      </Link>

      <header className="page-header">
        <h1>Загрузить задание</h1>
        <p className="page-header__subtitle">
          Откройте файл, скачанный из генератора (.md или .json)
        </p>
      </header>

      <section className="load-panel">
        <div
          className={`load-dropzone ${isDragging ? 'load-dropzone--active' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          role="button"
          tabIndex={0}
        >
          <span className="load-dropzone__icon" aria-hidden="true">
            📂
          </span>
          <p className="load-dropzone__title">Выберите файл или перетащите сюда</p>
          <p className="load-dropzone__hint">Форматы: .md (для ученика), .json</p>
          {fileName && !error && (
            <p className="load-dropzone__filename">{fileName}</p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".json,.md,.markdown,application/json,text/markdown"
            className="load-dropzone__input"
            onChange={onInputChange}
          />
        </div>

        {error && <p className="load-panel__error">{error}</p>}
      </section>

      {worksheet && (
        <section className="load-result">
          <WorksheetView worksheet={worksheet} />
        </section>
      )}
    </div>
  );
}
