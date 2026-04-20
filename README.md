# 🎵 Vinyl Record Collection Tracker

A simple, clean web app to catalog and manage your vinyl record collection. Track your records, monitor spending, and organize your music library.

![Language](https://img.shields.io/badge/JavaScript-vanilla-yellow)
![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)

## Features

✨ **Core Functionality:**
- Add, edit, and delete records from your collection
- Track artist, album, year, genre, and price
- Monitor total collection value
- Search across your entire collection
- Multiple sorting options (artist, album, year, price, genre)

💾 **Data Management:**
- All data stored locally in browser (localStorage)
- Export collection to CSV
- Import collection from CSV
- No server required - runs entirely in your browser

🎨 **User Interface:**
- Clean, responsive design
- Collection summary dashboard
- Easy-to-use forms
- Mobile-friendly

## Quick Start

### Option 1: Download and Run Locally

1. Clone the repository:
```bash
git clone https://github.com/gsolis31/Records.git
cd Records
```

2. Open `record-collection.html` in your browser:
```bash
open record-collection.html
```

That's it! No installation or dependencies required.

### Option 2: GitHub Pages

Access the live version at: `https://gsolis31.github.io/Records/record-collection.html`

## Usage

### Adding a Record
1. Click "+ Add New Record"
2. Fill in the details:
   - Artist name
   - Album title
   - Release year
   - Genre
   - Purchase price
   - Notes (optional)
3. Click "Save"

### Organizing Your Collection
- **Search:** Use the search bar to filter by any field
- **Sort:** Choose from multiple sorting options (artist, year, price, etc.)
- **Export:** Download your collection as CSV for backup or analysis
- **Import:** Restore or bulk-add records from CSV file

### Data Storage
- Collection data is stored in your browser's localStorage
- Data persists between sessions
- To backup, use the Export CSV feature
- To transfer between devices, export from one and import to another

## Project Structure

```
Records/
├── record-collection.html    # Main application page
├── record-collection.css     # Styling
├── record-collection.js      # Application logic
├── index.html               # Landing page (optional)
├── styles.css               # Landing page styles
├── script.js                # Landing page scripts
├── images/                  # Image assets
└── README.md                # This file
```

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires JavaScript enabled and localStorage support.

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

Personal project for managing vinyl record collections.

---

**Note:** All data is stored locally in your browser. Remember to export your collection regularly for backup purposes!
