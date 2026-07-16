# Spot-Datenmodell

## Gemeinsame Basis: `spots`

Alle Kategorien verwenden weiterhin die gemeinsamen Stammdaten in `spots`:

- Identität: `id`, `title`, `title_en`, `slug`, `category_id`
- Texte: `description`, `description_en`, `long_description`, `long_description_en`
- Standort: `latitude`, `longitude`
- Medien: `image_url`, `gallery`, `gallery_urls`, `youtube_url`, `youtube_timestamp`
- Redaktion: `tags`, `details_config`, `template`
- Veröffentlichung: `is_published`, `show_on_homepage`, `show_in_app`
- SEO: `seo_title`, `seo_description`, `seo_title_en`, `seo_description_en`
- Zeitstempel: `created_at`, `updated_at`

Die bisherigen Spezialfelder bleiben während der Übergangsphase ebenfalls in
`spots`. Sie werden nicht gelöscht.

## Spezialtabellen

| Kategorie | Tabelle | Zusätzlich normalisierte Felder |
| --- | --- | --- |
| Restaurant | `restaurant_details` | Öffnungszeiten, Preisniveau, Preisspanne, Reservierungslink, Google-Bewertung |
| Strand | `beach_details` | Beste Monate, beste Besuchszeit, Parkplatzinformationen |
| Ausflüge | `excursion_details` | Öffnungszeiten, Preise, beste Monate/Zeit, Parkplatz, Tour- und Buchungslink |
| Strandbar | `beach_bar_details` | Öffnungszeiten, Preise, beste Zeit, Parkplatz, Reservierungslink, Google-Bewertung |
| Markt | `market_details` | Öffnungszeiten, Preise, beste Zeit, Parkplatz |
| Natur | `nature_details` | Beste Monate/Zeit, Parkplatz, Tourlink |
| Tempel | `temple_details` | Öffnungszeiten, Preisniveau, beste Zeit, Parkplatz |
| Local Food | `local_food_details` | Öffnungszeiten, Preise, Reservierungslink, Google-Bewertung |
| Geheimtipp | `insider_tip_details` | Beste Monate/Zeit, Parkplatz, Tour- und Buchungslink |
| Unterkunft | bestehendes Hotelmodell | `premium_hotels`, `premium_rooms` und kompatible Hotelprofiltabellen |

Jede Spezialtabelle besitzt genau eine Zeile pro `spot_id`. Die Daten werden
vorerst automatisch aus den Legacy-Feldern synchronisiert. Öffentliche Seiten
bevorzugen die Spezialtabellen und verwenden die alten Spotfelder als Fallback.
