export function MetricChips({
  bmi,
  bf,
  waist,
}: {
  bmi: number;
  bf: number;
  waist: number;
}) {
  const items = [
    { label: "BMI", value: bmi.toFixed(1), unit: "" },
    { label: "Body Fat", value: bf.toFixed(0), unit: "%" },
    { label: "Waist", value: waist.toFixed(1), unit: "cm" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-line bg-card p-2.5 text-center">
          <div className="text-[10px] text-muted">{it.label}</div>
          <div className="mt-0.5 text-sm font-bold text-fg">
            {it.value}
            {it.unit && <span className="ml-0.5 text-[10px] font-medium text-muted">{it.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
