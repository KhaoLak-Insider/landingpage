"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

interface Props {
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
}: Props) {
  const [draft, setDraft] = useState("");

  function addValue() {
    const value = draft.trim();
    if (!value) return;

    onChange([...values, value]);
    setDraft("");
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;

    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="hotel-array-editor">
      <div className="hotel-array-editor__heading">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span>{values.length}</span>
      </div>

      <div className="hotel-array-editor__list">
        {values.map((value, index) => (
          <div className="hotel-array-editor__row" key={`${value}-${index}`}>
            <input
              value={value}
              onChange={(event) =>
                onChange(
                  values.map((item, itemIndex) =>
                    itemIndex === index ? event.target.value : item,
                  ),
                )
              }
            />

            <button
              type="button"
              disabled={index === 0}
              onClick={() => move(index, -1)}
              title="Nach oben"
            >
              <ArrowUp size={14} />
            </button>

            <button
              type="button"
              disabled={index === values.length - 1}
              onClick={() => move(index, 1)}
              title="Nach unten"
            >
              <ArrowDown size={14} />
            </button>

            <button
              type="button"
              className="hotel-array-editor__delete"
              onClick={() =>
                onChange(values.filter((_, itemIndex) => itemIndex !== index))
              }
              title="Löschen"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {values.length === 0 && (
          <div className="hotel-array-editor__empty">
            Noch keine Einträge vorhanden.
          </div>
        )}
      </div>

      <div className="hotel-array-editor__add">
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
