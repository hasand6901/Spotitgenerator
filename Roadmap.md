# Roadmap: Spot it! / Dobble Generator Website

## 📌 Projektübersicht
Ziel ist die Entwicklung einer Webanwendung (Client-Side / Single Page Application), die es Benutzern ermöglicht, individuelle "Dobble" bzw. "Spot it!" Kartensets zu generieren. Die App soll die mathematische Logik berechnen, Bilder hochladen/zuweisen lassen und eine druckfertige Ausgabe (z.B. PDF) erzeugen.

### 🧮 Unterstützte Varianten (Finite Projective Plane Logik)
1. **Minispiel (3 Symbole/Karte):** 7 Karten, 7 individuelle Symbole benötigt.
2. **Klein (4 Symbole/Karte):** 13 Karten, 13 individuelle Symbole benötigt.
3. **Mittel (6 Symbole/Karte):** 31 Karten, 31 individuelle Symbole benötigt.
4. **Original (8 Symbole/Karte):** 57 Karten, 57 individuelle Symbole benötigt.

---

## 🚀 Phase 1: Projekt-Setup & Grundgerüst
**Ziel:** Initialisierung der Projektstruktur und der Benutzeroberfläche.
* [ ] **Technologie-Stack definieren:** Auswahl von HTML/CSS/JS (Vanilla)
* [ ] **UI-Layout entwerfen:** * Header mit Titel.
    * Sidebar / Einstellungsbereich für die Variantenauswahl (3, 4, 6, 8 Symbole).
    * Upload-Bereich für eigene Bilder oder Auswahl von Beispielen (in images Ordner).
    * Vorschaubereich (Canvas oder DOM-Elemente) für die generierten Karten.
* [ ] **State-Management aufsetzen:** Speicherung der gewählten Variante, der hochgeladenen Bilder und des generierten Karten-Arrays.

## 🧠 Phase 2: Kernlogik (Der Dobble-Algorithmus)
**Ziel:** Implementierung der mathematischen Matrix zur Verteilung der Symbole.
* [ ] **Algorithmus für n=2 (3 Symbole):** Implementiere die Basis-Logik für 7 Karten.
* [ ] **Algorithmus generalisieren:** Schreibe eine Funktion `generateDobbleDeck(n)`, die für $n \in \{2, 3, 5, 7\}$ das korrekte Array von Arrays zurückgibt. 
    * Jedes Sub-Array repräsentiert eine Karte und enthält die IDs (0 bis $n^2+n$) der Symbole.
    * *Validierung:* Jedes Kartenpaar darf exakt nur eine übereinstimmende Symbol-ID haben.

## 🖼️ Phase 3: Asset-Management
**Ziel:** Verwaltung der Bilder/Symbole, die auf die Karten gedruckt werden sollen.
* [ ] **Standard-Set implementieren:** Ein Fallback-Set aus Bildern bereitgestellt in images Ordner, damit der Generator sofort testbar ist.
* [ ] **Bild-Upload ermöglichen:** * User kann eigene Bilder hochladen.
    * Bilder in den LocalStorage oder den temporären State laden (Base64/Blob).
* [ ] **Validierung der Bildanzahl:** Dem User anzeigen, wie viele Bilder für die gewählte Variante noch fehlen (z.B. "15 von 31 Bildern hochgeladen").

## 🎨 Phase 4: Karten-Rendering (Design & Verteilung)
**Ziel:** Visuelle Darstellung der Karten, bei der die Symbole organisch wirken.
* [ ] **Runde Kartenlayouts:** CSS/Canvas-Logik für runde Spielkarten erstellen.
* [ ] **Dynamische Positionierung:** * Symbole dürfen nicht überlappen.
    * Nutzung von Algorithmen wie Circle Packing oder vordefinierten Layout-Templates pro Karte.
* [ ] **Zufällige Skalierung & Rotation:** Jedes Symbol auf einer Karte muss zufällig skaliert und gedreht werden (wie im Originalspiel), um die optische Suche zu erschweren.

## 🖨️ Phase 5: Export & Print
**Ziel:** Bereitstellung eines druckfertigen Formats für den Nutzer.
* [ ] **Druckansicht generieren:** Anordnung der runden Karten auf einer DIN-A4-Ansicht (z.B. 4 bis 6 Karten pro Seite).
* [ ] **PDF-Export:** Integration einer Bibliothek wie `jsPDF` oder `html2pdf`, um die generierten Karten als hochwertiges PDF herunterzuladen.
* [ ] **Schneidemarken (Optional):** Hinzufügen von feinen Linien oder Kreisen um die Karten, um das Ausschneiden mit der Schere zu erleichtern.

## 🐛 Phase 6: Testing & Feinschliff
* [ ] **Responsive Design:** Sicherstellen, dass die UI auf Desktop und Tablet gut funktioniert (Upload vom Handy aus ermöglichen).
* [ ] **Edge Cases abfangen:** Was passiert, wenn zu große Bilder hochgeladen werden? (Auto-Resizing im Browser implementieren).
* [ ] **Performance Check:** Sicherstellen, dass das Rendern von 57 Karten den Browser nicht blockiert (ggf. Web Workers für die Generierung nutzen).