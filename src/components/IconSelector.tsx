import { iconMap, iconNames } from "@/src/components/IconLibrary";

export default function IconSelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (
    <select 
      className="p-2 border rounded w-1/3" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
    >
      {iconNames.map(name => {
        const Icon = iconMap[name];
        return (
          <option key={name} value={name}>
            {name} {/* Hier sehen die Leute den Namen */}
          </option>
        );
      })}
    </select>
  );
}