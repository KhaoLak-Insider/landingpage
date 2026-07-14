"use client";

import {
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  ContentStatus,
  HotelFaqItem,
} from "../types";
import { createId } from "../utils";

interface Props {
  items: HotelFaqItem[];
  onChange: (items: HotelFaqItem[]) => void;
}

export default function FaqEditor({ items, onChange }: Props) {
  function addItem() {
    const nextOrder =
      items.length > 0
        ? Math.max(...items.map((item) => item.sort_order)) + 1
        : 1;

    onChange([
      ...items,
      {
        id: createId(),
        category: "",
        question_de: "",
        question_en: "",
        answer_de: "",
        answer_en: "",
        status: "draft",
        sort_order: nextOrder,
        verified_at: null,
      },
    ]);
  }

  function updateItem(index: number, patch: Partial<HotelFaqItem>) {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function removeItem(index: number) {
    onChange(
      items
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          sort_order: itemIndex + 1,
        })),
    );
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];

    onChange(
      next.map((item, itemIndex) => ({
        ...item,
        sort_order: itemIndex + 1,
      })),
    );
  }

  return (
    <div className="hotel-faq-editor">
      <div className="hotel-faq-editor__toolbar">
        <p>
          Fragen, Antworten, Kategorien und Veröffentlichungsstatus pflegen.
        </p>
        <button type="button" onClick={addItem}>
          <Plus size={14} />
          FAQ hinzufügen
        </button>
      </div>

      <div className="hotel-faq-editor__list">
        {items.map((item, index) => (
          <article className="hotel-faq-editor__item" key={item.id}>
            <div className="hotel-faq-editor__item-header">
              <div>
                <span>FAQ {index + 1}</span>
                <strong>
                  {item.question_de || "Neue, unbenannte Frage"}
                </strong>
              </div>

              <div>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(index, -1)}
                  title="Nach oben"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, 1)}
                  title="Nach unten"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  className="hotel-faq-editor__delete"
                  onClick={() => removeItem(index)}
                  title="FAQ löschen"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="admin-hotel-grid admin-hotel-grid--two">
              <label className="admin-hotel-field">
                <span>Kategorie</span>
                <input
                  value={item.category}
                  onChange={(event) =>
                    updateItem(index, { category: event.target.value })
                  }
                />
              </label>

              <label className="admin-hotel-field">
                <span>Status</span>
                <select
                  value={item.status}
                  onChange={(event) =>
                    updateItem(index, {
                      status: event.target.value as ContentStatus,
                    })
                  }
                >
                  <option value="draft">Entwurf</option>
                  <option value="published">Veröffentlicht</option>
                  <option value="archived">Archiviert</option>
                </select>
              </label>

              <label className="admin-hotel-field">
                <span>Frage Deutsch</span>
                <textarea
                  rows={3}
                  value={item.question_de}
                  onChange={(event) =>
                    updateItem(index, {
                      question_de: event.target.value,
                    })
                  }
                />
              </label>

              <label className="admin-hotel-field">
                <span>Frage Englisch</span>
                <textarea
                  rows={3}
                  value={item.question_en}
                  onChange={(event) =>
                    updateItem(index, {
                      question_en: event.target.value,
                    })
                  }
                />
              </label>

              <label className="admin-hotel-field">
                <span>Antwort Deutsch</span>
                <textarea
                  rows={7}
                  value={item.answer_de}
                  onChange={(event) =>
                    updateItem(index, {
                      answer_de: event.target.value,
                    })
                  }
                />
              </label>

              <label className="admin-hotel-field">
                <span>Antwort Englisch</span>
                <textarea
                  rows={7}
                  value={item.answer_en}
                  onChange={(event) =>
                    updateItem(index, {
                      answer_en: event.target.value,
                    })
                  }
                />
              </label>
            </div>
          </article>
        ))}
      </div>

      {items.length === 0 && (
        <div className="hotel-faq-editor__empty">
          Noch keine FAQ-Einträge vorhanden.
        </div>
      )}
    </div>
  );
}
