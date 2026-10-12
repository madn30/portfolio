interface PaperSliderProps {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
}

export function PaperSlider({ id, label, value, onChange }: PaperSliderProps) {
  const percent = Math.round(value * 100)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between font-hand text-xl leading-none text-ink">
        <label htmlFor={id}>{label}</label>
        <span aria-hidden="true">{percent}%</span>
      </div>
      <input
        id={id}
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="paper-slider"
        aria-label={`${label} volume`}
        aria-valuetext={`${percent} percent`}
      />
    </div>
  )
}
