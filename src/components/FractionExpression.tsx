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

function PowerDisplay({
  base,
  exponent,
  unknown,
}: {
  base?: number;
  exponent?: number;
  unknown?: 'base' | 'exponent';
}) {
  const baseText =
    unknown === 'base' ? '?' : base !== undefined ? String(base) : '?';
  const expText =
    unknown === 'exponent' ? '?' : exponent !== undefined ? String(exponent) : '?';

  return (
    <span className="power-display">
      <span className="power-display__base">{baseText}</span>
      <sup className="power-display__exp">{expText}</sup>
    </span>
  );
}

function GroupPowerDisplay({
  base,
  innerExponent,
  outerExponent,
  unknown,
}: {
  base: number;
  innerExponent: number;
  outerExponent: number;
  unknown?: 'exponent';
}) {
  return (
    <span className="group-power-display">
      <span className="group-power-display__paren">(</span>
      <PowerDisplay base={base} exponent={innerExponent} />
      <span className="group-power-display__paren">)</span>
      <sup className="power-display__exp">
        {unknown === 'exponent' ? '?' : outerExponent}
      </sup>
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
        if (part.kind === 'power') {
          return (
            <PowerDisplay
              key={i}
              base={part.base}
              exponent={part.exponent}
              unknown={part.unknown}
            />
          );
        }
        if (part.kind === 'group-power') {
          return (
            <GroupPowerDisplay
              key={i}
              base={part.base}
              innerExponent={part.innerExponent}
              outerExponent={part.outerExponent}
              unknown={part.unknown}
            />
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
