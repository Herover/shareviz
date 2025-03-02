Website for creating simple data visualizations, that can be shared as images or embedded into websites!

The goal is to allow non-technical users to collaborate on creating simple but effective data visualizations, while allowing programmers to extend the functionality. It is also simple to host on your own infrastructure, and comes with SSO.

Not ready for production.

# Comparison with other tools

"Is it like INSERT-DATAVIZ-TOOL-HERE, but for free?" Probably! But, more like a free/discount version of it. This tools isn't made to compete with some of the amazing commercial tools that already exists, but to fill out a niche for organizations where the requirements to host your own data, free access to source code, or price isn't met elsewhere. It is also limited how much a tiny open-source project can do compared to the commercial counterparts.

There's currently no hosted version, but there might be in the future.

# Running the code

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

## Development

- First install everything `npm install`.

- Then run any new database migrations `npx drizzle-kit migrate`.

- Run the dev server `npm run dev`, or `npm run dev -- --host` if you want to test with a external device.

## Production

- Install everything `npm install`.

- Build the server `npm run build`.

- Then run any new database migrations `npx drizzle-kit migrate`.

- Run the server `node server/prod.js`.

## Upgrading

In general, if you are using the application in a production environment and want to avoid dataloss, make a backup of the database and chart data before updating the code.

When running the application, charts will get migrated to new formats when required on startup (except local charts that are migrated when opened). Database migrations are run manually using `npx drizzle-kit migrate`.

New code is only merged to main if it's in a state where the application can be build and run correctly, but individual commits without release tags might not be stable.
