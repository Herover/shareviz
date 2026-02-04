# Hosting

You need a server and 2 things to host a DataTortilla server:

- The DataTortilla server, either using Docker or running NodeJS directly
- A reverse proxy, in the example we use Nginx + Lets Encrypt

A design goal is to keep hosting of DataTortilla simple and cheap. Therefore the number of external services required is kepts at a minimum. This also means that you can't run DataTortilla is a high-availability setup. The logic here is that the cost of having to maintain the required infrastructure is expected to be higher than the gains of doing so.

- Upgrades to the NodeJS server usually only takes a few seconds, meaning editors won't feel much impact.

- A single Nginx server with a bit of cache can deliver thousands of requests per second even on a low powered server, meaning viewers won't be impacted during updates.

- SQLite + flat JSON files can run thousands of reads/writes per second even on old hard drives, and if you have enough editors for this to happen, you probably also have enough money for a nice server with fast drives.

Hopefully these choises will also make life easier to sys admins.

This guide assumes your server is a Linux server with a recent Debian or Ubuntu distribution.

## Docker Compose

The simplest way is to install Docker and use the docker-compose file.

1. Install Docker on your server.

2. Clone the repository and open a terminal in its folder.

3. Create a appropriate .env file.

4. Run `docker compose up -d` to start the server. This build the app, create a data folder, and run database migrations.

5. To update, first read the related release notes to make sure there's no additional manual steps, make a backup of the `data` folder, then run `git pull && docker compose up --build -d`.

You access the logs by running `docker compose logs`, read the Compose documentation for more information.

## Manual

This is how you run DataTortilla without Docker.

1. Install `node`.

2. Install everything `npm install`.

3. Build the server `npm run build`.

4. Then run any new database migrations `npx drizzle-kit migrate`. This should be done when you update as well.

5. Run the server `node server/prod.js`. Remember that the server will terminate when you leave the shell, so you must set up some way to run the application in the background. Logs will be written to stdout/stderr and it's up to you to store these as well.

## Reverse proxy using Nginx

Nginx is used to provide a HTTPS certificate, and routing requests to the NodeJS server.

You need to configs, one for the site that editors access, ex.

```
server {
    server_name     dt.leonora.app;    # setup your domain here

    gzip            on;
    gzip_types      text/plain application/xml text/css application/javascript;
    gzip_min_length 1000;

    access_log /var/log/dt-app/access.log;
    error_log /var/log/dt-app/error.log warn;

    location / {
        #expires $expires;

        proxy_redirect                      off;
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  $scheme;
        proxy_read_timeout          1m;
        proxy_connect_timeout       1m;
        proxy_pass                          http://127.0.0.1:5173; # set the address of the Node.js instance here
    }

    location /sharedb {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

And for viewers

```
# Make sure this directory exists
proxy_cache_path /data/nginx/cache keys_zone=dtv:10m loader_threshold=300 loader_files=200 max_size=500m;

server {             # the port nginx is listening on
    server_name     dtv.leonora.app;    # setup your domain here

    gzip            on;
    gzip_types      text/plain application/xml text/css application/javascript;
    gzip_min_length 1000;

    access_log /var/log/dt-viewer/access.log;
    error_log /var/log/dt-viewer/error.log warn;

    location @proxied {
        #expires $expires;

        proxy_redirect                      off;
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  $scheme;
        proxy_read_timeout          1m;
        proxy_connect_timeout       1m;
        proxy_cache dtv;
        proxy_cache_valid 200 60m;
        proxy_cache_valid 404 1m;
        proxy_pass                          http://127.0.0.1:5173; # set the address of the Node.js instance here
    }

    location /view {
        try_files /dev/null @proxied;
    }
    location /_app {
        try_files /dev/null @proxied;
    }
    location /api/publication {
        try_files /dev/null @proxied;
    }
    location /fonts {
        try_files /dev/null @proxied;
    }
}
```

You can safely set up the viewer domain to cache requests as well.

Use Certbot to aquire HTTPS certificates for the servers.

## Upgrades

Always check release notes to make sure there's no manual actions required from you.

- Before upgrading, consider backup up the `data` directory.
- If you are not using the Docker image, make sure to run `npx drizzle-kit migrate` while the server is not running.
- The server may upgrade chart definitions, the files that encode how a chart should look. This happens on every restart, and will block starting the server on servers with huge amounts of charts that requires changes. You can see if it's done by scanning the logs for a line that starts with `checking charts for migrations` and another line saying `done migrating`.
