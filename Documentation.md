# JSON ⇄ XML Converter — Complete Bundle (Linux + Docker + Nginx)

## Overview
This bundle provides a production-ready web app to convert **JSON ↔ XML** with pretty formatting, realtime UI, tree view visualization, and export of the converted payload. It includes:
- Flask app (`app/`) with API endpoints and web UI
- Docker packaging (Python image + Gunicorn)
- Nginx reverse proxy with **wildcard TLS certificates** (no Certbot required)
- Compose file to run everything on Linux

## Features
- **Convert JSON → XML** (custom root element) and **XML → JSON**
- **Realtime conversion** as you type (debounced ~300ms)
- **Side-by-side previews** for **As‑is** and **To‑be (Converted)**
- **Tree view** toggles for JSON/XML structures
- **Export** converted payload as `.json` or `.xml`
- **Input size guard** (default 2 MB, configurable)
- **Multi-user capable** via Gunicorn workers/threads

## Project Structure
```
json-xml-converter-bundle/
├─ Documentation.md
├─ docker-compose.yml
├─ .env
├─ nginx-conf/
│  └─ default.conf
├─ certs/
│  ├─ fullchain.pem   # PLACE YOUR WILDCARD CERT HERE
│  └─ privkey.pem     # PLACE YOUR PRIVATE KEY HERE
└─ app/
   ├─ Dockerfile
   ├─ requirements.txt
   ├─ gunicorn.conf.py
   ├─ app.py
   ├─ converters.py
   ├─ templates/
   │  ├─ base.html
   │  └─ index.html
   ├─ static/
   │  ├─ styles.css
   │  └─ app.js
   └─ tests/
      └─ sample.json
```

## Materials Needed
- **Linux host** with Docker and Docker Compose installed
- **Domain** pointing to your server (DNS A/AAAA)
- **Wildcard TLS certificate files**:
  - `certs/fullchain.pem` (certificate + intermediate chain)
  - `certs/privkey.pem` (private key)
- Open **ports 80 and 443** on the host firewall

## Source Code Implementation (Key Files)

### `app/app.py`
- Flask routes:
  - `GET /` — serves UI
  - `POST /api/json-to-xml` — converts JSON string to XML (pretty)
  - `POST /api/xml-to-json` — converts XML string to JSON (pretty)
- Size limit guard via `MAX_INPUT_SIZE` env
- Gunicorn used in Docker for concurrency

### `app/converters.py`
- Pure functions using `json` and `xmltodict`:
  - `json_to_xml(json_str, root_name)`
  - `xml_to_json(xml_str)`
- Handles non-dict JSON by wrapping in `{"_content": value}` for valid XML

### `app/templates/index.html`
- Realtime UI using `fetch` to API endpoints
- Dual previews with **Raw**/**Tree** toggles
- **Export** button to download converted payload

### `app/static/app.js`
- JSON tree renderer with `<details>/<summary>` for nested structures
- XML tree renderer via `DOMParser` with attributes and `#text`

### `nginx-conf/default.conf`
- HTTP → HTTPS redirect
- TLS termination using mounted wildcard certs
- Reverse proxy to `converter:8000`
- Upload size limit aligned with app

### `app/Dockerfile`
- Python 3.11 slim base, installs `requirements.txt`
- Runs as non-root `appuser`, serves via Gunicorn

## Usage Guide (Docker on Linux)

> **Assumptions**: You have placed your wildcard cert files in `certs/fullchain.pem` and `certs/privkey.pem`, and your domain points to this host.

1. **Download or copy the bundle** to your server, e.g. `/mnt/json-xml-converter-bundle`.
2. **Set environment variables** (optional, or edit `.env`):
   ```bash
   cd /mnt/json-xml-converter-bundle
   echo "FLASK_SECRET_KEY=replace-with-strong-secret" > .env
   echo "MAX_INPUT_SIZE=2097152" >> .env
   ```
3. **Edit Nginx domain** in `nginx-conf/default.conf`:
   ```nginx
   server_name converter.yourcompany.com;  # change to your domain
   ssl_certificate     /etc/nginx/certs/fullchain.pem;
   ssl_certificate_key /etc/nginx/certs/privkey.pem;
   ```
4. **Place your cert files**:
   ```bash
   ls certs/fullchain.pem certs/privkey.pem  # both should exist
   ```
5. **Build and start**:
   ```bash
   docker compose build converter
   docker compose up -d nginx converter
   ```
6. **Verify Nginx config**:
   ```bash
   docker compose exec nginx nginx -t
   docker compose logs -f nginx
   ```
7. **Open the app**:
   - `https://converter.yourcompany.com`
   - Try JSON → XML and XML → JSON, toggle **Raw/Tree**, click **Export Converted**

## Optional: Without wildcard (Let’s Encrypt)
If you don’t have a wildcard cert and prefer Let’s Encrypt HTTP-01:
- Use a different Compose + Certbot webroot setup.
- Ensure DNS resolves, port 80 open, then run:
  ```bash
  docker compose run --rm --entrypoint certbot certbot certonly     --webroot -w /var/www/certbot     -d "your.domain"     --email "you@example.com"     --agree-tos --no-eff-email
  docker compose restart nginx
  docker compose up -d certbot
  ```
*(Not included in this wildcard bundle by default.)*

## Scaling & Hardening
- **Gunicorn**: tune `workers` and `threads` in `app/gunicorn.conf.py` (e.g., `workers = 2 * CPU + 1`).
- **Nginx**: add HSTS, security headers, rate limiting if exposed publicly.
- **Request limits**: keep `client_max_body_size` aligned with app `MAX_INPUT_SIZE`.
- **HTTPS only**: HTTP is redirect only.
- **Monitoring**: tail logs via `docker compose logs -f ...`; consider Prometheus/Grafana.

## Troubleshooting
- **Mount errors**: Ensure `./nginx-conf` and `./certs` exist and contain the required files.
- **Bad gateway**: Check `converter` logs; confirm app is listening on `0.0.0.0:8000`.
- **Certificate issues**: Confirm paths and file permissions; `nginx -t` should be OK.
- **DNS mismatch**: `server_name` must match the domain you access.

## License
MIT License — feel free to adapt for internal use.

## Credits
Built with Flask and xmltodict.
