# Insider KI-Redaktion
## Architektur- und Umsetzungskonzept für Khao Lak Insider

**Status:** Verbindliche Planungsgrundlage  
**Projekt:** Khao Lak Insider  
**Ziel:** Aufbau einer modularen, kontrollierten KI-Redaktion als zusätzlicher Admin-Bereich, ohne das bestehende CMS grundlegend zu verändern.

---

## 1. Ausgangslage

Khao Lak Insider besitzt bereits ein funktionierendes CMS, bestehende Supabase-Tabellen und verschiedene Inhaltsbereiche wie Hotels, Zimmer, Spots und Blogbeiträge. Diese vorhandene Struktur bleibt grundsätzlich bestehen.

Die neue **Insider KI-Redaktion** wird als zusätzlicher Admin-Menüpunkt ergänzt. Sie ist keine zweite Inhaltsverwaltung und kein Ersatz für das bestehende CMS. Sie dient als vorgeschaltete Produktions-, Prüf- und Steuerungszentrale für spezialisierte KI-Agenten.

Die KI-Agenten erstellen, prüfen und optimieren Inhalte. Die endgültige redaktionelle Freigabe und Veröffentlichung bleibt immer beim Administrator.

## 2. Leitprinzipien

1. **Bestehendes CMS erhalten**  
   Bestehende CMS-Seiten und produktive Tabellen werden nur dort angepasst, wo eine technische Verbindung zur KI-Redaktion notwendig ist.

2. **Keine automatische Veröffentlichung**  
   Agenten dürfen Inhalte ausschließlich als Entwurf, Vorschlag oder Prüfbericht anlegen. Der Status `published` darf nur durch einen Menschen gesetzt werden.

3. **Spezialisierte Agenten statt Universal-Agent**  
   Jeder Agent besitzt eine klar abgegrenzte Aufgabe, eigene Arbeitsanweisungen und nur die dafür erforderlichen Zugriffsrechte.

4. **Eine gemeinsame technische Basis**  
   Die Agenten nutzen denselben Agent-Core, dieselbe Aufgabenverwaltung und dieselben Protokoll- und Versionsmechanismen.

5. **Nachvollziehbarkeit**  
   Jede automatische Änderung wird mit Agent, Zeitpunkt, Eingabedaten, Ergebnis, Quellen und Versionsstand protokolliert.

6. **Fakten vor Textmenge**  
   Unbestätigte Angaben dürfen nicht als Tatsachen formuliert werden. Unsicherheiten werden sichtbar markiert.

7. **Schrittweiser Ausbau**  
   Zuerst wird ein vollständiger Blog-Workflow gebaut. Danach wird dieselbe Architektur auf Spots, Nachrichten und weitere Inhaltstypen übertragen.

## 3. Zielbild

```text
Bestehendes CMS
├── Dashboard
├── Hotels
├── Spots
├── Zimmer
├── Blog
├── Medien
└── Insider KI-Redaktion
    ├── Übersicht
    ├── Aufgaben
    ├── Agenten
    ├── Freigaben
    ├── Quellen & Prüfhinweise
    ├── Versionen
    └── Protokolle
```

Die KI-Redaktion arbeitet mit den bestehenden Inhaltstabellen. Sie legt keine parallelen Kopien der eigentlichen Inhalte an. Zusätzliche Tabellen speichern ausschließlich Aufgaben, Prüfungen, Laufprotokolle, Feedback und Versionen.

## 4. Agentenmodell

### 4.1 Orchestrator / Redaktionsleitung

Der Orchestrator ist kein schreibender Agent. Er steuert den Workflow.

**Aufgaben:**
- neue Aufgaben erkennen oder anlegen
- passenden Agenten auswählen
- Eingabedaten zusammenstellen
- Reihenfolge der Prüfschritte steuern
- Fehler und Wiederholungen behandeln
- menschliche Freigabe einfordern
- Statusübergänge verwalten

### 4.2 Blog-Agent

**Aufgabe:** Erstellung vollständiger Blogentwürfe.

**Eingaben:**
- freigegebenes Thema
- Hauptkeyword und Suchintention
- vorhandene Blogbeiträge
- passende Spots und interne Links
- redaktionelle Vorgaben
- bestätigte Quellen

**Ausgaben:**
- Titel und Slug
- Kurzbeschreibung
- strukturierter Artikel
- FAQ
- vorgeschlagene interne Links
- Quellenliste
- Hinweise zu unsicheren Fakten

### 4.3 Spot-Agent

**Aufgabe:** Neue Spots als Entwurf anlegen oder bestehende Einträge vervollständigen.

**Mögliche Inhaltstypen:**
- Hotels
- Strände
- Restaurants
- Sehenswürdigkeiten
- Märkte
- Ausflugsziele

**Regel:** Der Agent verändert keine bereits bestätigten Kerndaten ohne sichtbaren Änderungsvorschlag.

### 4.4 News-Agent

**Aufgabe:** Relevante aktuelle Nachrichten und Änderungen erkennen.

**Themen:**
- Einreisebestimmungen
- lokale Ereignisse
- Infrastruktur
- Nationalparks
- Verkehr
- Wetterwarnungen
- saisonale Veranstaltungen

**Ausgabe:** Kein fertiger veröffentlichter Artikel, sondern ein Nachrichtenvorschlag mit Datum, Quellen, Relevanzbewertung und redaktionellem Entwurf.

### 4.5 Korrektur-Agent

**Aufgabe:** Sprachliche Qualitätskontrolle.

**Prüft:**
- Rechtschreibung und Grammatik
- Wiederholungen
- Lesefluss
- unnötige Füllsätze
- widersprüchliche Formulierungen
- einheitliche Ansprache und Tonalität

**Regel:** Fakten werden nicht eigenmächtig geändert.

### 4.6 SEO-Agent

**Aufgabe:** Suchmaschinenbezogene Prüfung und Optimierung.

**Prüft:**
- Suchintention
- Seitentitel und Meta Description
- Überschriftenstruktur
- thematische Vollständigkeit
- Keyword-Kannibalisierung
- interne Verlinkung
- FAQ-Potenzial
- Ähnlichkeit zu bestehenden Artikeln

**Regel:** Lesbarkeit und inhaltliche Qualität haben Vorrang vor Keyword-Dichte.

### 4.7 Fakten- und Quellen-Agent (spätere Ausbaustufe)

**Aufgabe:** Konkrete Angaben gegen gespeicherte oder externe Quellen prüfen.

**Besonders relevant für:**
- Preise
- Öffnungszeiten
- Entfernungen
- Eintrittsgebühren
- Fahrpläne
- Hotel- und Zimmerdaten
- gesetzliche oder behördliche Regelungen

### 4.8 Übersetzungs-Agent (spätere Ausbaustufe)

Erstellt die englische Version erst nach Abschluss der deutschen fachlichen und sprachlichen Prüfung. Dadurch werden Fehler nicht unnötig in mehrere Sprachen übertragen.

## 5. Standard-Workflow für Blogbeiträge

```text
Thema geplant oder freigegeben
        ↓
Orchestrator legt Aufgabe an
        ↓
Blog-Agent erstellt Entwurf
        ↓
Korrektur-Agent prüft Sprache
        ↓
SEO-Agent prüft Struktur und Suchintention
        ↓
Optional: Fakten-Agent prüft kritische Angaben
        ↓
Entwurf wartet in der KI-Redaktion
        ↓
Martin prüft im CMS
        ↓
Änderungswunsch oder Freigabe
        ↓
Bei Änderung: neue Version erzeugen
        ↓
Manuelle Veröffentlichung
```

### Statusmodell

- `planned` – Thema oder Aufgabe ist geplant
- `queued` – Aufgabe wartet auf Ausführung
- `running` – ein Agent arbeitet
- `awaiting_review` – menschliche Prüfung erforderlich
- `revision_requested` – Änderungswunsch wurde eingereicht
- `approved` – redaktionell freigegeben
- `published` – im bestehenden CMS veröffentlicht
- `failed` – technischer oder inhaltlicher Fehler
- `cancelled` – Aufgabe wurde beendet

## 6. Technische Architektur

### 6.1 Bestehende Systeme

- Next.js Admin- und CMS-Oberfläche
- Supabase als Datenbank und Authentifizierung
- bestehende Tabellen für Inhalte
- vorhandene Admin-Rollen und Zugriffsregeln

### 6.2 Neue Bausteine

- Admin-Bereich `/admin/ai-editorial` oder vergleichbare Route
- Agent-Core als serverseitige Logik
- Aufgaben- und Statusverwaltung
- Agentenspezifische Prompts und Konfigurationen
- automatisierte Aufrufe über geplante Jobs
- Protokollierung und Versionierung
- Anbindung an die bestehenden Inhaltstabellen

### 6.3 Agent-Core

Der Agent-Core übernimmt wiederkehrende Aufgaben:

- Agentenkonfiguration laden
- Berechtigungen prüfen
- Kontextdaten aus Supabase laden
- KI-Aufruf ausführen
- strukturiertes Ergebnis validieren
- Ergebnis speichern
- Folgeaufgabe anlegen
- Fehler protokollieren
- Kosten- und Nutzungsdaten speichern

Neue Agenten sollen später überwiegend durch Konfiguration und Prompt-Dateien ergänzt werden können, ohne den gesamten Ablauf neu zu programmieren.

## 7. Vorgeschlagene zusätzliche Tabellen

Die tatsächlichen Namen und Felder werden erst nach Analyse der vorhandenen Supabase-Struktur festgelegt.

### `ai_agents`

Speichert die Agentendefinitionen.

Mögliche Felder:
- `id`
- `key`
- `name`
- `description`
- `is_active`
- `model`
- `prompt_version`
- `allowed_content_types`
- `created_at`
- `updated_at`

### `ai_tasks`

Zentrale Aufgabenwarteschlange.

Mögliche Felder:
- `id`
- `task_type`
- `assigned_agent_key`
- `content_type`
- `content_id`
- `status`
- `priority`
- `input_payload`
- `result_payload`
- `error_message`
- `scheduled_for`
- `started_at`
- `completed_at`
- `created_by`
- `created_at`

### `ai_runs`

Technisches Laufprotokoll pro Agentenaufruf.

Mögliche Felder:
- `id`
- `task_id`
- `agent_key`
- `model`
- `prompt_version`
- `input_snapshot`
- `output_snapshot`
- `token_usage`
- `estimated_cost`
- `duration_ms`
- `status`
- `created_at`

### `ai_reviews`

Prüfberichte von Korrektur-, SEO- oder Fakten-Agenten.

Mögliche Felder:
- `id`
- `task_id`
- `content_type`
- `content_id`
- `review_type`
- `score`
- `approved`
- `warnings`
- `suggestions`
- `created_at`

### `ai_feedback`

Speichert menschliche Änderungswünsche und Freigaben.

Mögliche Felder:
- `id`
- `task_id`
- `content_type`
- `content_id`
- `feedback_text`
- `feedback_type`
- `created_by`
- `created_at`

### `ai_content_versions`

Speichert frühere Fassungen automatisch erzeugter oder überarbeiteter Inhalte.

Mögliche Felder:
- `id`
- `content_type`
- `content_id`
- `version_number`
- `content_snapshot`
- `change_reason`
- `created_by_type`
- `created_by_id`
- `created_at`

## 8. Verbindung zum bestehenden CMS

Die KI-Redaktion greift auf dieselben Inhaltsdatensätze zu wie das bestehende CMS.

Beispiel Blog:

1. Der Blog-Agent erzeugt einen neuen Datensatz in der vorhandenen Blogtabelle.
2. Der Datensatz erhält den bereits im Projekt verwendeten Entwurfsstatus.
3. In `ai_tasks` wird die Verbindung über `content_type` und `content_id` gespeichert.
4. Die KI-Redaktion zeigt Agentenstatus, Quellen und Prüfberichte.
5. Der vorhandene Blogeditor bleibt für die eigentliche redaktionelle Bearbeitung und Veröffentlichung zuständig.

So entstehen keine doppelten Artikel und keine Schattenverwaltung.

## 9. Benutzeroberfläche der Insider KI-Redaktion

### 9.1 Übersicht

Kennzahlen und offene Aufgaben:
- heute erzeugte Entwürfe
- wartende Freigaben
- laufende Agenten
- abgeschlossene Prüfungen
- fehlgeschlagene Aufgaben
- geschätzte KI-Kosten

### 9.2 Aufgabenliste

Spalten:
- Inhalt
- Inhaltstyp
- zuständiger Agent
- aktueller Status
- Priorität
- letzte Aktivität
- offene Warnungen
- Aktion

### 9.3 Detailansicht

Enthält:
- aktuellen Entwurf
- Agentenlauf und Statushistorie
- verwendete Quellen
- SEO- und Korrekturberichte
- Faktenwarnungen
- Versionsverlauf
- Eingabefeld für Änderungswünsche
- Link zum bestehenden CMS-Editor
- Freigabe- und Abbruchfunktionen

### 9.4 Agentenverwaltung

Zu Beginn nur lesend oder stark eingeschränkt:
- Agent aktiv/inaktiv
- Aufgabe und Berechtigungen
- verwendetes Modell
- Prompt-Version
- letzter erfolgreicher Lauf
- Fehlerquote

Prompts sollten nicht unkontrolliert direkt im Browser bearbeitet werden. Sie bleiben versioniert im Projekt oder in einer kontrollierten Konfiguration.

## 10. Tägliche Automatisierung

Für den Blog-Agenten wird ein täglicher geplanter Lauf eingerichtet.

Vor der Erstellung prüft das System:
- Gibt es bereits einen automatisch erzeugten Artikel für diesen Tag?
- Ist ein freigegebenes Thema verfügbar?
- Existiert ein sehr ähnlicher Beitrag?
- Sind genügend verlässliche Informationen vorhanden?
- Ist das tägliche Kostenlimit noch verfügbar?

Wenn keine geeignete Aufgabe vorhanden ist, wird kein Füllartikel erzeugt. Stattdessen wird ein Hinweis in der KI-Redaktion angelegt.

## 11. Themenplanung

Der Blog-Agent darf in der ersten Version nicht frei und unbegrenzt Themen auswählen.

Empfohlener Ablauf:

1. Themen werden manuell angelegt oder von der KI vorgeschlagen.
2. KI-Vorschläge erhalten den Status `suggested`.
3. Erst nach menschlicher Freigabe gelangen sie in die Produktionswarteschlange.
4. Priorität, Kategorie, Hauptkeyword und geplantes Datum können manuell gesetzt werden.

Später können Search-Console-Daten oder Inhaltslücken als zusätzliche Signale dienen.

## 12. Prompt- und Rollenstrategie

Jeder Agent erhält:
- eindeutige Rolle
- klaren Auftrag
- erlaubte Datenquellen
- verbotene Aktionen
- erwartetes strukturiertes Ausgabeformat
- Prüfkriterien
- Abbruchbedingungen

Beispielhafte Grundregel für alle Agenten:

> Erfinde keine konkreten Angaben. Nutze bestätigte Projektdaten und freigegebene Quellen. Markiere fehlende oder unsichere Informationen sichtbar. Veröffentliche niemals selbstständig.

Prompts werden versioniert. Jeder `ai_run` speichert die verwendete Prompt-Version, damit Ergebnisse später nachvollzogen werden können.

## 13. Sicherheit und Berechtigungen

- KI-Zugangsschlüssel ausschließlich serverseitig speichern
- Service-Role-Zugriff niemals an den Browser ausliefern
- Agenten erhalten nur erforderliche Tabellen- und Aktionsrechte
- Veröffentlichung bleibt an die vorhandene Admin-Rolle gebunden
- geplante Jobs werden gegen unberechtigte Aufrufe abgesichert
- RLS-Regeln werden vor Aktivierung jedes Agenten geprüft
- sensible Laufdaten sind nur für Administratoren sichtbar

## 14. Qualitäts- und Fehlerregeln

Ein Inhalt darf nicht zur Freigabe vorgeschlagen werden, wenn:
- das strukturierte Ergebnis ungültig ist
- Pflichtfelder fehlen
- kritische Fakten ohne Quelle enthalten sind
- interne Links nicht existieren
- ein nahezu identischer Beitrag vorhanden ist
- die Korrekturprüfung schwerwiegende Mängel meldet
- ein technischer Teilschritt fehlgeschlagen ist

Fehler werden nicht still überschrieben. Aufgaben erhalten den Status `failed` und können kontrolliert erneut gestartet werden.

## 15. Kostenkontrolle

Zu speichern sind möglichst:
- verwendetes Modell
- Eingabe- und Ausgabemenge
- geschätzte Kosten pro Lauf
- Kosten pro Agent
- Kosten pro Inhalt
- Tages- und Monatswerte

Zusätzliche Schutzmaßnahmen:
- maximales Tagesbudget
- maximale Überarbeitungsanzahl pro Inhalt
- keine Endlosschleifen zwischen Agenten
- kleinere Modelle für einfache Prüfaufgaben, sofern die Qualität ausreicht
- bestehende Ergebnisse und geprüfte Daten wiederverwenden

## 16. Umsetzung in Phasen

### Phase 0 – Bestandsaufnahme

Vor jeder Änderung:
- Admin-Struktur analysieren
- bestehende Blogtabelle und Statusfelder prüfen
- Supabase-Clients und Serverzugriffe identifizieren
- RLS und Rollen prüfen
- vorhandene Cron-, Edge-Function- oder API-Struktur prüfen
- Dokument mit tatsächlichen Dateipfaden und Tabellennamen ergänzen

**Ergebnis:** Technischer Ist-Bericht, noch keine produktiven Änderungen.

### Phase 1 – Grundgerüst

- neuer Admin-Menüpunkt „Insider KI-Redaktion“
- Übersichtsseite
- Tabellen für Agentenaufgaben, Läufe, Reviews, Feedback und Versionen
- Agent-Core
- Rollen- und Zugriffsschutz
- manuell startbare Testaufgabe

### Phase 2 – Blog-Workflow

- Themenverwaltung
- Blog-Agent
- Korrektur-Agent
- SEO-Agent
- Erstellung in der bestehenden Blogtabelle
- Detailansicht mit Quellen und Prüfberichten
- Änderungswunsch und Versionierung
- manuelle Freigabe

### Phase 3 – Automatisierung

- täglicher geplanter Lauf
- Fehlerbehandlung und Wiederholungslogik
- Kostenübersicht
- Benachrichtigung bei neuem Entwurf oder Fehler

### Phase 4 – Weitere Inhalte

- Spot-Agent
- Hotel-/Zimmer-Spezialisierung
- Restaurant- und Strand-Spezialisierung
- News-Agent
- Fakten-Agent
- Übersetzungs-Agent

### Phase 5 – Wachstum und Optimierung

- Search-Console-Integration
- Erkennung veralteter Inhalte
- automatische Vorschläge für interne Links
- Themencluster
- Content-Kalender
- Newsletter- und Social-Media-Agenten

## 17. Definition of Done für die erste Version

Die erste produktive Version gilt als abgeschlossen, wenn:

- die bestehende CMS-Funktion unverändert weiterläuft
- der neue Admin-Menüpunkt erreichbar und rollenbasiert geschützt ist
- ein geplantes Blogthema verarbeitet werden kann
- der Blog-Agent einen Entwurf in der bestehenden Blogtabelle anlegt
- Korrektur- und SEO-Agent Prüfberichte erzeugen
- Quellen und Warnungen sichtbar sind
- ein Änderungswunsch eine neue Version erzeugt
- kein Agent veröffentlichen kann
- Fehler und Kosten nachvollziehbar protokolliert werden
- mindestens mehrere vollständige Testläufe erfolgreich durchgeführt wurden

## 18. Nicht-Ziele der ersten Version

Nicht Bestandteil des ersten Ausbaus:
- vollautonome Themenwahl ohne Freigabe
- automatische Veröffentlichung
- automatische Änderung bestätigter Spot-Daten
- selbstständige externe Kommunikation mit Hotels oder Partnern
- gleichzeitige Einführung aller geplanten Agenten
- kompletter Umbau des vorhandenen CMS

## 19. Erste Anweisung für die Umsetzung in VS Code

```text
Analysiere zunächst das bestehende Khao-Lak-Insider-Projekt, ohne Dateien oder Datenbankstrukturen zu verändern.

Prüfe insbesondere:
1. die bestehende Admin-Navigation und alle Admin-Routen,
2. die vorhandene Blogtabelle einschließlich Status- und Veröffentlichungsfeldern,
3. sämtliche Supabase-Clients, Server Actions, API-Routen und Edge Functions,
4. bestehende Rollen, Authentifizierung und RLS-Regeln,
5. vorhandene Cronjobs oder Automatisierungen,
6. geeignete Stellen für den neuen Admin-Menüpunkt „Insider KI-Redaktion“.

Vergleiche den Ist-Zustand mit dem Dokument „Insider KI-Redaktion – Architektur- und Umsetzungskonzept“.

Erstelle danach einen konkreten technischen Umsetzungsplan mit:
- tatsächlichen Tabellen- und Spaltennamen,
- betroffenen Dateien und Routen,
- notwendigen Migrationen,
- Sicherheitsrisiken,
- einer sinnvollen Reihenfolge der Änderungen.

Nimm noch keine produktiven Änderungen vor, bis die Bestandsaufnahme vollständig dokumentiert ist.
```

## 20. Festgehaltene Architekturentscheidung

Das bestehende CMS bleibt die zentrale Inhalts- und Veröffentlichungsoberfläche. Die **Insider KI-Redaktion** wird als zusätzlicher, modularer Admin-Bereich aufgebaut. Mehrere spezialisierte Agenten arbeiten auf einer gemeinsamen technischen Basis und übergeben ihre Ergebnisse kontrolliert an die vorhandenen Inhalte. Der Mensch bleibt bei jeder Veröffentlichung und bei kritischen Datenänderungen die letzte Instanz.
