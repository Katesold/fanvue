# Fanvue Funds Console

A unified dashboard for operations specialists to review creator payouts, track payment settlements, and investigate fraud signals in real time.

## Project Structure

```
fanvue/
├── client/                    # React Frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── styles/           # Global SCSS styles
│   │   ├── test/             # Test setup
│   │   └── types/            # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
├── server/                    # Express.js Backend (TypeScript)
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── data/             # Seed data (in-memory store)
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API route definitions
│   │   └── types/            # TypeScript type definitions
│   ├── tests/                # Jest + Supertest tests
│   └── package.json
├── package.json              # Root package.json with workspace scripts
└── FS_FINTEGRATIONS_CHALLENGE.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation of all dependencies

```bash
npm run install:all
```

### Development

```bash
# Run both client and server concurrently
npm run dev

# Or run them separately:
npm run dev:client  # Frontend on http://localhost:3000
npm run dev:server  # Backend on http://localhost:4000
```

### Testing

```bash
# Run all tests
npm run test

npm run test:client

npm run test:server
```

### Build

```bash
npm run build
```

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite (with SWC)
- React Query for data fetching
- SCSS Modules for styling
- React Router v7
- Vitest + React Testing Library

### Backend
- Express.js with TypeScript
- In-memory data store (JSON)
- Jest + Supertest for testing

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payouts` | List all payouts (filter by `?status=`) |
| GET | `/api/payouts/snapshot` | Get funds snapshot summary |
| GET | `/api/payouts/:id` | Get payout details with related data |
| POST | `/api/decisions/:payoutId` | Create approval/rejection/hold decision |
| GET | `/api/health` | Health check |

## AI Usage Disclosure

Prompts used:
1. "for the @FS_FINTEGRATIONS_CHALLENGE.md challenge I will use express js with the csr pattern, react, modular scss, typescript and react testing library on the front end and jest with supertest on the backend. restructure the project and install add the necessary libraries to the package json, but I will install and run the app."

2. are the commands windows compatible in package.json? if not change them and make it platform agnostic

3. add hover styles on interacting elements and use the secondary-color when hovered. add missing colour varaiables to the variables scsss

4. separate the apis to different files under client\src\api 1 endpoint per file structure. in the footer create a sitemap link, use the logo in the footer, header, and call the endpoints on the frontend to display the data avaiable. implement: Single-page layout with a lightweight header showing: total scheduled today, held amount, and flagged amount. Create smaller reusable components for the elemnts on the page: total scheduled today, held amount, and flagged amount should all use the same custom button component. implement: A filter pill group for “All”, “Pending”, “Flagged”, “Paid”. Persist the last-selected filter in `localStorage` after and create a hook for persistence, usePersistentState that will use the localstorage as described. create a table component that uses a table header and tablebody components within so that the Table is reusable. Display the available data beneath the header in a parent container component that is used for data fetching logicwith react query. make sure that table has these features: A table listing payouts with columns: creator, amount & currency, method, scheduled date, status, and risk score.

5. change all front end components to align with accessbility best practices to AAA standards. use mobile first development practices. now implement the filtering logic and endpoint when clicking on the different filters those new endpoints should be used. create them on the express server to satisfy the requirements from the FS_FINTEGRATIONS_CHALLENGE.md file. continue to apply functional programming principles and modularity. create hooks for data fetching with react query and utils folder and functions within it for functions such as formatCurrency use optimistic updates, loading incdicators, usedeferredvalue for heavy rerendering 

6. implement the modal when clicked on the table satisfying the requirements for: Selecting a payout reveals an inline drawer or modal with related invoices (at least IDs & statuses), latest payment attempt, and fraud notes. Provide “Approve”, “Hold”, and “Reject” buttons; require a free-text reason for “Reject”. Surface success/error feedback inline. use the existing endpoints to action them on the server.

6. add some more examples that can be actioned such as flagged in the seed data. move out the icons to separate folders and components. 

### Decisions
Familiarity with the stack was the deciding factor in buliding the project with Express.js and React as well as their capability of handling the task.

modular scss has been chosen for it's robust features and modularity as well as fast speed, built in with the react ecosystem

Considerations:
large data sets - pagination
filtering for table to help finding rows faster
virtualisation for data if massive dataset with changing values
authentication
data integrity with SQL (insert ignore) and idempotency key (preferably relational DB setup)


