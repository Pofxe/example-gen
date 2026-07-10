import type { ExprPart } from '../types';

interface FractionExpressionProps {
  parts: ExprPart[];
  className?: string;
}

function FractionStack({
  num,
  den,
  whole,
}: {
  num: number;
  den: number;
  whole?: number;
}) {
  const showWhole = whole !== undefined && whole !== 0;
  const absWhole = whole !== undefined ? Math.abs(whole) : 0;
  const sign =
    (whole !== undefined && whole < 0) || num < 0 ? '−' : '';

  return (
    <span className="frac-display">
      {sign && <span className="frac-display__sign">{sign}</span>}
      {showWhole && <span className="frac-display__whole">{absWhole}</span>}
      <span className="frac-display__stack">
        <span className="frac-display__num">{Math.abs(num)}</span>
        <span className="frac-display__bar" />
        <span className="frac-display__den">{den}</span>
      </span>
    </span>
  );
}

export function FractionExpression({ parts, className = '' }: FractionExpressionProps) {
  return (
    <span className={`fraction-expression ${className}`}>
      {parts.map((part, i) => {
        if (part.kind === 'text') {
          return (
            <span key={i} className="fraction-expression__text">
              {part.text}
            </span>
          );
        }
        if (part.kind === 'decimal') {
          return (
            <span key={i} className="fraction-expression__decimal">
              {part.value}
            </span>
          );
        }
        return (
          <FractionStack
            key={i}
            num={part.num}
            den={part.den}
            whole={part.whole}
          />
        );
      })}
    </span>
  );
}
