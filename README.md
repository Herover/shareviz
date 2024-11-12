Website for creating simple data visualizations, that can be shared as images or embedded into websites!

The goal is to allow non-technical users to collaborate on creating simple but effective data visualizations, while allowing programmers to extend the functionality. It is also simple to host on your own infrastructure, and comes with SSO.

Not ready for production.

# Comparison with other tools

"Is it like INSERT-DATAVIZ-TOOL-HERE, but for free?" Probably! But, more like a free/discount version of it. This tools isn't made to compete with some of the amazing commercial tools that already exists, but to fill out a niche for organizations where the requirements to host your own data, free access to source code, or price isn't met elsewhere. It is also limited how much a tiny open-source project can do compared to the commercial counterparts.

There's currently no hosted version, but there might be in the future.

# Development

* First install everything `npm install`.

* Then run any new database migrations `npx drizzle-kit migrate --config drizze.config.ts`.

* Run the dev server `npm run dev`, or `npm run dev -- --host` if you want to test with a external device.

# Production

* Install everything `npm install`.

* Build the server `npm run build`.

* Then run any new database migrations `npx drizzle-kit migrate --config drizze.config.ts`.

* Run the server `node server/prod.js`.
