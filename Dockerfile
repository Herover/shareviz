FROM node:24-slim

COPY . /app

WORKDIR /app

RUN npm install \
    && npm run build

ENTRYPOINT ["/app/prod.sh"]
