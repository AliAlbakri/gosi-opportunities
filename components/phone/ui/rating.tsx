export function RatingStars({ value }: { value: number }) {
  const filled = Math.round(value);
  return <span className="text-[15px] text-gosi-rich-blue" aria-label={`${value.toFixed(1)} stars`}>{"★★★★★".slice(0, filled)}<span className="text-gosi-midnight-25">{"★★★★★".slice(filled)}</span></span>;
}

export function RatingSummary({ score, count, bars }: { score: number; count: number; bars: number[] }) {
  const max = Math.max(...bars, 1);
  return (
    <div className="rounded-[20px] bg-white p-4 text-gosi-rich-blue">
      <p className="text-[28px] font-bold">{score.toFixed(1)}</p>
      <RatingStars value={score} />
      <p className="text-[13px] text-gosi-midnight-50">{count} reviews</p>
      <div className="mt-3 space-y-1">
        {bars.map((bar, index) => (
          <div key={index} className="flex items-center gap-2 text-[11px]">
            <span className="w-3">{5 - index}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gosi-midnight-10"><span className="block h-full bg-gosi-vivid-green" style={{ width: `${(bar / max) * 100}%` }} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}
