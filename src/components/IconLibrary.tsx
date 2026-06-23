// src/components/IconLibrary.tsx
import * as Icons from "lucide-react";

// Wir erstellen ein Objekt, das die Icons speichert
export const iconMap: { [key: string]: any } = Icons;

// Eine Liste aller verfügbaren Namen für dein Dropdown
export const iconNames = Object.keys(Icons).filter(name => !name.includes("Icon"));