# AuctionApp

A modern auction marketplace for discovering artists and bidding on unique artworks and collectibles. 
Built with React and TypeScript on the frontend, powered by Orchard Core (.NET) on the backend.

## Features

- User authentication (sign up, login, logout)
- Browse auctions and artists
- Search and filtering
- Save favorites

## Tech Stack

- Frontend: React, TypeScript, Vite, SCSS
- Backend: Orchard Core (.NET)
- Database: SQLite

## Installation

**Requirements:**
- Node.js 18+
- .NET SDK
- Git

**Setup:**
```bash
npm install
npm run restore
npm start
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

Press `Ctrl + C` to stop the application.

## Available Scripts

```bash
npm run restore  # Restore Orchard Core dependencies and seed data
npm run save     # Save Orchard Core configuration/state
```

## Troubleshooting

If you encounter issues after pulling updates, rerun the setup commands from the Installation section above.
