<div align="center">

[![License](https://img.shields.io/badge/License-Apache--2.0-green)](LICENSE.txt)

</div>

# Lumi Insert — Frontend

### A responsive, minimalist client dashboard for **Lumi Insert**, an open-source ERP/POS system — built with Svelte and designed to consume the [Lumi Insert Backend](https://github.com/KelvinKhodes/lumi-insert-erp) REST API.

🔗 **Live Demo:** [lumi-insert.my.id](https://lumi-insert.my.id)

---

## 🛠 Tech Stack
- **Core:** Svelte, JavaScript
- **Styling:** Tailwind CSS
- **Design Language:** Minimalist, macOS/SwiftUI-inspired UI
- **Auth:** JWT Bearer Token (consumes backend's Double Token Strategy)
- **Build/Deploy:** Vite (static build), served via Nginx

## ✨ Core Features
### 1. Full API Coverage
A complete service layer covering every backend endpoint, with consistent **loading, error, and success** state handling on every request — no silent failures, no unhandled edge cases.

### 2. Authenticated Session Handling
Automatically attaches the JWT Access Token to every protected request and integrates with the backend's refresh-token flow to keep sessions alive without manual re-login.

### 3. Operational Dashboard
- **Top Sales Product** and **Top Refund Product** panels, filterable by period (Today / Last 7 Days / Last 30 Days), showing the top 7 items per category.
- **Recent Payments** panel for at-a-glance transaction activity.

### 4. Core Business Modules
Forms, tables, cards, and modals for managing products, transactions, stock, and other ERP entities — built directly against the backend's REST contract, with no mock or placeholder data.

### 5. Responsive, Cross-Device UI
Fully responsive layout that adapts from desktop down to mobile, keeping the same minimalist visual language across screen sizes.

## Documentation
- ### Live Application
  Access the deployed dashboard at: [lumi-insert.my.id](https://lumi-insert.my.id)
- ### Backend API Reference
  This frontend is built against the Lumi Insert Backend's OpenAPI/Swagger spec — see the [backend repository](https://github.com/KelvinKhodes/lumi-insert-erp) for full endpoint documentation.

> _Dashboard screenshots coming soon._

---

# ⚙️ Quick Start

## Prerequisites
- Node.js (LTS)
- npm or a compatible package manager
- A running instance of the [Lumi Insert Backend](https://github.com/KelvinKhodes/lumi-insert-erp)

## Installation
```bash
git clone https://github.com/KelvinKhodes/lumi-insert-front-end.git
cd lumi-insert-front-end
npm install
```

## Configuration
Copy the example environment file and point it to your backend instance.
```bash
cp .env.example .env
vim .env
```
Key variable:
```
VITE_API_BASE_URL=http://localhost:8080
```

## Development
```bash
npm run dev
```

## Build and Deploy (Production)
```bash
npm run build
```
The static output can be served directly via Nginx (as in the production deployment at [lumi-insert.my.id](https://lumi-insert.my.id)) or any static file host.

---

# 🛡 License
This project is released under the Apache License 2.0. See [LICENSE](LICENSE.txt) file for details.