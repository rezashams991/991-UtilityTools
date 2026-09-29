# 991-UtilityTools

**Universal browser utilities** – 5 zero-dependency ES modules shared by every 991 tool.  
File handling, drag & drop, reordering, previews, and unified status boxes — all client-side.

---

## Table of Contents

- [Features](#features)
- [File Structure](#file-structure)
- [Usage](#usage)
- [Module List](#module-list)
- [Browser Compatibility](#browser-compatibility)
- [License](#license)
- [Changelog](#changelog)

---

## Features

- **100% Client-Side** – No uploads, no servers, no data leaves the device.
- **Zero Dependencies** – Pure JavaScript ES modules.
- **Framework Agnostic** – Works with any site or framework.
- **Shared Across Tools** – One source of truth for file I/O and UI helpers.

---

## File Structure

```
991-utility-tools/
├── src/
│   ├── fileHandler.js
│   ├── dragDrop.js
│   ├── reorder.js
│   ├── filePreview.js
│   ├── statusBox.js
│   └── index.js
├── LICENSE
├── CHANGELOG.md
└── README.md
```


---

## Module List

| Module | Version | Description |
|--------|---------|-------------|
| **index**       | 0.9 | Main entry point — exports all modules. |
| **fileHandler** | 0.9 | File I/O, dedupe, download, byte formatting. |
| **dragDrop**    | 0.9 | Universal drag & drop with file filtering. |
| **reorder**     | 0.9 | Drag-to-reorder list for multi-file tools. |
| **filePreview** | 0.9 | Preview images/PDFs with zoom and full-screen view. |
| **statusBox**   | 0.9 | Unified message box with automatic version footer. |

---

## Browser Compatibility

- **Chrome** 80+
- **Firefox** 75+
- **Edge** 80+
- **Safari** 13+

---

## License

MIT — see [LICENSE](LICENSE).

---

## Changelog

See [CHANGELOG](CHANGELOG.md) for the full version history.

---

*Built with ❤ by [Reza Shams](https://github.com/rezashams991)*