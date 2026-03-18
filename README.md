# Lab 3 — Business Logic API
### ITSAR2 313 – System Architecture and Integration 2
### Section: BIST 3B

## Members
| # | Name |
|---|------|
| 1 | Sagum, Patrick Ruiz |
| 2 | Henson, Princess Terana Caram Rasonable |
| 3 | Gargarita, Trisha Faith Casiano |
| 4 | Mogat, Ela Mae Trojillo |
| 5 | Tibo-oc, Paul Felippe Gelle |

## Documentation

**Lab 3 Report (Google Drive):** [Lab 3 - Business Logic API.docx](https://drive.google.com/file/d/1q9tHKl4EtrPbDu1Wmrph7LR2gFoxvt9V/view?usp=sharing)

## System Architecture

| Layer | File | Responsibility |
|-------|------|----------------|
| Presentation | curl client | Sends HTTP requests |
| Business Logic | server/controllers/orderController.js | Validates rules, processes orders |
| Data | server/data/products.json | Stores products and stock |

## Stack

| Layer | Technology |
|------|------------|
| API | Node.js + Express |
| Data | JSON file storage |
| Testing | curl |

## Seeded Data

- 5 products are restored on every setup run from `server/data/products.seed.json`
- initial stock: Laptop 10, Smartphone 25, Tablet 15, Monitor 8, Keyboard 50

## Prerequisites

- Node.js 18+
- npm
- curl
- Git Bash (only if using the bash script alternative below)

## Setup (Branch: `lab3`)

From repository root:

```bash
bash scripts/setup.sh
bash scripts/serve.sh
```

`scripts/setup.sh` does:
- installs Node dependencies if needed
- copies `.env` if missing
- resets `server/data/products.json` to the seeded baseline (5 products, original stock)

`scripts/serve.sh` starts the API on port 3000.

Why first run can take time:
- npm must download packages on the first run

Reruns are faster because `node_modules/` is reused.

## Terminal Note (Windows)

For scripted setup/start, use Git Bash (or WSL). If using Command Prompt/PowerShell only, use the manual equivalent below.

Manual equivalent:

```bash
cd server
npm install
cp .env.example .env
node server.js
```

Server: http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List all products |
| GET | /api/products/:id | Get product by ID |
| POST | /api/orders | Place an order |

## Business Rules

| Rule | Error Code | HTTP |
|------|------------|------|
| Missing fields | VALIDATION_ERROR | 400 |
| Quantity is zero | INVALID_QUANTITY | 400 |
| Negative quantity | INVALID_QUANTITY | 400 |
| Non-integer quantity | INVALID_QUANTITY | 400 |
| Product not found | PRODUCT_NOT_FOUND | 404 |
| Out of stock | OUT_OF_STOCK | 400 |
| Quantity exceeds stock | STOCK_EXCEEDED | 400 |

## Running Tests

Start the API from `server/`, then run all 13 curl commands from `tests/curl-tests.md`.

## Deliverables

| Item | Location |
|------|----------|
| API source code | `server/` |
| curl test suite | `tests/curl-tests.md` |
| Lab 3 report (PDF) | `docs/lab3-report.pdf` |
| Lab 3 source report (DOCX) | `docs/lab3-report.docx` |

## Requirements

See **Prerequisites** above.
