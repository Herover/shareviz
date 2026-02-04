# Develop

DataTortilla is written in Svelte using SvelteKit. While we try to keep the number of external dependencies down, it might also be good to know about

- **SQLite**: a simple relational database that writes it database to a local file.
- **Drizzle**: the ORM used to create SQL queries to SQLite.
- **ShareDB**: a library for real-time collaboration on JSON files, this allows many people to edit the same chart simultaniously over web-sockets. DataTortilla uses a custom file based backend.

## The code

The important folders are, in alphabetic order

- **server**: some code related to starting the HTTP server, as well as access control on ShareDB connections.
- **server_lib**: shared code that only runs on the server but is used by both code in `server` and `src`. Contains database functions and schemas.
- **src**: SvelteKit code.
- **src/lib**: Svelte components, stores, other most of the applications brain sits here.
- **src/routes/(app)**: pages you visit with the browser and some form action handlers.
- **src/routes/(chart)**: the public viewer route.
- **src/routes/api**: API endpoints.

The frontend generally use API endpoints to change data or load data that might change while using a page. There's also cases where we use `+layout.server.ts` and `+page.server.ts` files for loading data if it makes more sense in the situation.

Before you commit code, you also have to run the commands

- `npm run format` for automatic formatting of code.
- `npm run lint` for best linting. Most rules comes from existing best practice definitaions, but it's allowed to ignore rules when really required.

## Running the code

Requires node v24.

These environvent variables should be defined in both dev and prod settings:

```
PUBLIC_ORIGIN="http://localhost:5173"
PUBLIC_VIEWER_ORIGIN="http://view.localhost:5173"
ORIGIN="http://localhost:5173" # Required in prod to get working auth
AUTH_TRUST_HOST=true # Required in prod for auth
AUTH_SECRET="X"
AUTH_GITHUB_ID=Y
AUTH_GITHUB_SECRET=Z
```

### Development

- First install everything `npm install`.

- Then run any new database migrations `npx drizzle-kit migrate`.

- Run the dev server `npm run dev`, or `npm run dev -- --host` if you want to test with a external device.

If you run a editor like VSCode and get errors related to a node/better-sqlite3 version mismatch, then manually set the "Svelte Language-server: Runtime" setting to the path of your node executeable.

When creating drizzle schema changes, run `npx drizzle-kit generate` and then `npx drizzle-kit migrate`.

### Upgrading

In general, if you are using the application in a production environment and want to avoid dataloss, make a backup of the database and chart data before updating the code.

When running the application, charts will get migrated to new formats when required on startup (except local charts that are migrated when opened). Database migrations are run manually using `npx drizzle-kit migrate`.

New code is only merged to main if it's in a state where the application can be build and run correctly, but individual commits without release tags might not be stable.
