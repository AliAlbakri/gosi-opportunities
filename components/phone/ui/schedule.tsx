"use client";

export function DayStrip({ days, selected, onSelect }: { days: { key: string; label: string; date: string; open: boolean }[]; selected: string; onSelect: (key: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {days.map((day) => (
        <button
          key={day.key}
          type="button"
          disabled={!day.open}
          onClick={() => onSelect(day.key)}
          className={`grid h-16 w-12 shrink-0 place-items-center rounded-2xl text-[13px] font-semibold ${selected === day.key ? "bg-gosi-rich-blue text-white" : day.open ? "bg-white text-gosi-rich-blue" : "bg-gosi-midnight-10 text-gosi-midnight-50"}`}
        >
          <span>{day.label}</span>
          <span>{day.date}</span>
          {day.open && <span className="h-1.5 w-1.5 rounded-full bg-gosi-vivid-green" />}
        </button>
      ))}
    </div>
  );
}

export function SlotGrid({ groups, selected, onSelect }: { groups: { title: string; slots: { id: string; label: string }[] }[]; selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-gosi-midnight-50">{group.title}</p>
          <div className="grid grid-cols-2 gap-2">
            {group.slots.map((slot) => (
              <button key={slot.id} type="button" onClick={() => onSelect(slot.id)} className={`h-11 rounded-full text-[15px] font-semibold ${selected === slot.id ? "bg-gosi-vivid-green text-gosi-rich-blue" : "bg-white text-gosi-rich-blue"}`}>
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
