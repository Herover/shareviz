FROM node:22-alpine

COPY . /app

WORKDIR /app

RUN npm install \
    && npm run build

ENTRYPOINT ["/app/prod.sh"]
