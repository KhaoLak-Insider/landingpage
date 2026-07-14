"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

interface ArrayEditorProps {
  title: string;
  description: string;
  values: string[];
  placeholder: string;
  onChange: (values: string[]) => void;
}

export default function ArrayEditor({
  title,
  description,
  values,
  placeholder,
  onChange,
}: ArrayEditorProps) {
  const [draft, setDraft] = useState("");

  function addValue() {
    const nextValue = draft.trim();
    if (!nextValue) return;

    onChange([...values, nextValue]);
    setDraft("");
  }

  function updateValue(index: number, value: string) {
    onChange(
      values.map((current, currentIndex) =>
        currentIndex === index ? value : current,
      ),
    );
  }

  function removeValue(index: number) {
    onChange(values.filter((_, currentIndex) => currentIndex !== index));
  }

  function moveValue(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= values.length) return;

    const nextValues = [...values];
    [nextValues[index], nextValues[targetIndex]] = [
      nextValues[targetIndex],
      nextValues[index],
    ];

    onChange(nextValues);
  }

  return (
    <div className="array-editor">
      <div className="array-editor__heading">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span>{values.length}</span>
      </div>

      <div className="array-editor__list">
        {values.map((value, index) => (
          <div className="array-editor__row" key={`${index}-${value}`}>
            <input
              value={value}
              onChange={(event) => updateValue(index, event.target.value)}
            />

            <button
              type="button"
              onClick={() => moveValue(index, -1)}
              disabled={index === 0}
              title="Nach oben"
            >
              <ArrowUp size={14} />
            </button>

            <button
              type="button"
              onClick={() => moveValue(index, 1)}
              disabled={index === values.length - 1}
              title="Nach unten"
            >
              <ArrowDown size={14} />
            </button>

            <button
              type="button"
              onClick={() => removeValue(index)}
              className="array-editor__delete"
              title="Eintrag entfernen"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {values.length === 0 && (
          <div className="array-editor__empty">
            Noch keine Einträge vorhanden.
          </div>
        )}
      </div>

      <div className="array-editor__add">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addValue();
            }
          }}
        />

        <button type="button" onClick={addValue}>
          <Plus size={14} />
          Hinzufügen
        </button>
      </div>
    </div>
  );
}
