#!/bin/sh
# SPDX-License-Identifier: MPL-2.0

npx drizzle-kit migrate && node server/prod.js
