# GCSE Revision Tracker

A responsive GCSE revision tracker built with plain HTML, CSS and JavaScript. It runs entirely in the browser and saves study data locally with `localStorage`.

## Features

- Tracks GCSE subjects: Maths, English, Biology, Chemistry, Physics, Geography, History, German and RE.
- Adds study sessions with a subject, date, duration and topic.
- Shows total hours revised overall and per subject.
- Calculates current and best daily revision streaks.
- Displays progress bars against a 20-hour goal for each subject.
- Saves sessions and theme preference locally in the browser.
- Includes a dark mode toggle.
- Uses a responsive, modern card-based layout for desktop and mobile.

## How to run

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

## Files

- `index.html` - application structure and form controls.
- `styles.css` - responsive layout, progress bars and light/dark themes.
- `script.js` - subject tracking, streak calculations, localStorage persistence and rendering.
