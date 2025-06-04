#!/bin/sh
npx drizzle-kit migrate && node server/prod.js
