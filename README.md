# Klondike Solitaire

A keyboard-first Klondike Solitaire game built in vanilla JavaScript with HTML5 Canvas. Single file, no dependencies, works on GitHub Pages.

## Play

Open `index.html` in any modern browser — or serve it from GitHub Pages.

## Controls

| Key | Action |
|-----|--------|
| `↑ ↓ ← →` | Navigate cards |
| `Enter` | Select / confirm placement |
| `E` | Draw from stock |
| `A` | Auto-place focused card |
| `Q` | Return card from foundation to tableau |
| `C` | Undo |
| `Shift+A` | Sweep all eligible cards to foundations |
| `Tab` | Cycle zone (Tableau / Stock / Foundation) |
| `U I O P J K L` | Jump to column 1–7 |
| `Shift+Column` | Smart stack select |
| `Shift+Space` | Cancel selection |
| `Esc` | Menu |
| `Z` | Restart |

Press `?` on the start screen for the full keybind reference.

## Features

- Draw 1 or Draw 3 mode
- Full undo history
- Auto-place and reverse auto-place with ambiguity resolution
- Smart stack selection
- Autocomplete when win condition is met
- Session statistics (games played, win rate)
- Web Audio API sound effects
- High-DPI canvas rendering

## Background

This project was an exercise in structured requirements gathering. The process began with research into keyboard ergonomics and Klondike Solitaire game mechanics, using LLMs to explore edge cases, rule ambiguities, and input design tradeoffs. That research was then distilled into a detailed requirements document — covering game logic, input systems, audio, rendering, and application flow — with prompt engineering focused specifically on writing requirements precise enough for an LLM to generate a complete, playable implementation from a single prompt. The game itself is the end artifact of that process.

## License

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
