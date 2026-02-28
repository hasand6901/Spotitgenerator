# Spot it! / Dobble Generator

A client-side single page application that generates custom **Spot it!** / **Dobble** card sets using the mathematical logic of finite projective planes. Upload your own images or use the defaults, then export a print-ready PDF.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## Features

- **4 Game Variants** based on finite projective planes:

  | Variant  | Symbols/Card | Total Cards | Images Needed |
  |----------|:------------:|:-----------:|:-------------:|
  | Mini     | 3            | 7           | 7             |
  | Small    | 4            | 13          | 13            |
  | Medium   | 6            | 31          | 31            |
  | Original | 8            | 57          | 57            |

- **Image Management** — upload custom images or load 57 built-in defaults
- **Card Options** — random size variation, position jitter, round/square images
- **Random Rotation & Scaling** — symbols are rotated and sized randomly for an authentic Dobble feel
- **PDF Export** — high-quality A4 PDF with 4 cards per page via jsPDF
- **Bilingual UI** — German / English language toggle (persisted in localStorage)
- **Responsive Design** — works on desktop and tablet

## Getting Started

### Prerequisites

Any modern web browser (Chrome, Firefox, Edge, Safari). No build tools required.

### Run Locally

1. Clone or download the repository
2. Serve the folder with any static file server, e.g.:
   ```bash
   npx http-server -p 8080
   ```
3. Open `http://localhost:8080` in your browser

> You can also open `index.html` directly in a browser, but image loading for defaults requires a local server due to CORS.

## Usage

1. **Choose a variant** — select Mini, Small, Medium or Original
2. **Load images** — click "Load default images" or upload your own
3. **Configure options** — toggle size variation, position jitter, and round images
4. **Generate** — click "Generate cards" to see the preview
5. **Export** — click "Export as PDF" to download a print-ready PDF

## Project Structure

```
├── index.html          # Main SPA page
├── style.css           # Dark theme styles (CSS variables, responsive)
├── dobble.js           # Dobble algorithm (finite projective plane)
├── app.js              # Application logic, rendering & PDF export
├── lang.js             # i18n system (DE/EN) with localStorage
├── Roadmap.md          # Development roadmap
├── de-icon.png         # German flag icon
├── uk-icon.png         # UK flag icon
└── images/             # 57 default symbol images (Number=01.png … Number=57.png)
```

## Algorithm

The card generation uses **finite projective planes** of order $n \in \{2, 3, 5, 7\}$. For a given order $n$:

- Each card has $n + 1$ symbols
- The deck contains $n^2 + n + 1$ cards
- Every pair of cards shares **exactly one** common symbol

This is implemented in `generateDobbleDeck(n)` and validated by `validateDeck(deck)`.

## Technologies

- **Vanilla HTML / CSS / JS** — no frameworks or build step
- **[jsPDF](https://github.com/parallax/jsPDF)** — PDF generation
- **[Inter](https://fonts.google.com/specimen/Inter)** — UI font (Google Fonts)
- **[Material Icons Outlined](https://fonts.google.com/icons)** — UI icons
- **[dotLottie Player](https://github.com/dotlottie/player-component)** — welcome animation

## License

This project is for personal and educational use.

---

> **Disclaimer:** This site is not affiliated in any way with Dobble, Spot It!, its creators or distributors. Dobble and Spot It! are trademarks of **ASMODEE GROUP**.
