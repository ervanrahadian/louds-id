# Louds.id: Connect, share, and grow together

Live site: [loudsid.web.app](https://loudsid.web.app)

Public group chat. Join a group and talk instantly.

## Tech stack

- React 19
- Vite 7
- TypeScript
- Tailwind CSS 4
- Motion
- React Icons
- Firebase Auth + Firestore
- Firebase Hosting

## Features

- Google sign-in
- Admin-only group create, icon, rename, and delete (`ervanrahadian@gmail.com`, plus emails you add)
- Public groups with live messages
- Message text encrypted in Firestore
- Search groups and last messages
- Mobile list/detail layout and desktop split view
- Auto-scroll, day separators, and grouped bubbles
- Link detection in messages
- Delete your own messages
- Offline-friendly PWA shell

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with ESLint |
| `npm run deploy` | Build and deploy to Firebase Hosting |
| `npm run deploy:rules` | Deploy Firestore security rules |

## Deployment

```bash
npx firebase-tools login   # first time only
npm run deploy
npm run deploy:rules       # first time, or after changing firestore.rules
```
