export function SegmentedControl({
  items,
  value,
  onChange,
  label,
}: {
  items: readonly string[];
  value: string;
  onChange: (nextValue: string) => void;
  label?: string;
}) {
  return (
    <div className="segmented-control" role="group" aria-label={label}>
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className={item === value ? 'segment selected' : 'segment'}
          aria-pressed={item === value}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
