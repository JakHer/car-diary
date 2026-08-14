# Car Diary

An app for tracking your vehicle's service history, including repairs,
inspections, mileage, and ownership expenses.

## Requirements

- Node.js 20 or newer
- npm

## Local development

```bash
npm install
npm run dev
```

## Available scripts

- `npm run dev` — start the development server
- `npm run build` — type-check and create a production build
- `npm run lint` — run static code analysis
- `npm run preview` — preview the production build locally

## Current features

- vehicle profile setup,
- service records with mileage, workshop, cost, and notes,
- service record editing and deletion,
- service timeline and vehicle summary,
- versioned local browser storage.

Data is currently stored in the browser under `car-diary:data:v2`. Clearing
site data will remove the saved vehicle and its service history.
