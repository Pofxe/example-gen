import type { ReactNode } from 'react';

interface WorksheetExpressionProps {
  text: string;
}

/** Отображает текстовое выражение с базовым математическим форматированием */
export function WorksheetExpression({ text }: WorksheetExpressionProps) {
  return <span className="worksheet-expression">{renderMathText(text)}</span>;
}

function renderMathText(text: string): ReactNode[] {
  const pattern =
    /(\d+)\^(\d+|\?)|(\d+)²|(\d+)³|([√∛])(\?|\d+)|([−+\×÷=<>()?])/g;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      nodes.push(<span key={key++}>{text.slice(lastIndex, index)}</span>);
    }

    if (match[1] !== undefined) {
      nodes.push(
        <span key={key++} className="worksheet-expression__pow">
          {match[1]}
          <sup>{match[2]}</sup>
        </span>,
      );
    } else if (match[3] !== undefined) {
      nodes.push(
        <span key={key++} className="worksheet-expression__pow">
          {match[3]}
          <sup>2</sup>
        </span>,
      );
    } else if (match[4] !== undefined) {
      nodes.push(
        <span key={key++} className="worksheet-expression__pow">
          {match[4]}
          <sup>3</sup>
        </span>,
      );
    } else if (match[5] !== undefined) {
      nodes.push(
        <span key={key++} className="worksheet-expression__root">
          {match[5]}
          {match[6]}
        </span>,
      );
    } else if (match[7] !== undefined) {
      nodes.push(
        <span key={key++} className="worksheet-expression__op">
          {match[7] === '-' ? '−' : match[7]}
        </span>,
      );
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return nodes.length > 0 ? nodes : [text];
}
