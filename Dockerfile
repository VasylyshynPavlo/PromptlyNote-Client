# syntax=docker/dockerfile:1

# --- Stage 1: build the Angular app ---
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies with a clean, reproducible install
COPY package.json package-lock.json* ./
RUN npm ci

# Build the production bundle
COPY . .
RUN npm run build

# --- Stage 2: serve the static bundle with nginx ---
FROM nginx:1.27-alpine AS runtime

# SPA-aware nginx config (routes fall back to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Angular's application builder emits the browser bundle under dist/client/browser
COPY --from=build /app/dist/client/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]