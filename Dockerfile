# syntax=docker/dockerfile:1
#
# Multi-stage image.
#   Production (default):  docker build --build-arg VITE_API_BASE_URL=https://api.example.com/api/v1 -t frontend .
#                          docker run -p 8080:8080 frontend
#   Development:           docker build --target dev -t frontend-dev .
#                          docker run -p 5173:5173 -v "$PWD/src:/app/src" frontend-dev

# ---- deps: install once, shared by dev and build -----------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- dev: Vite dev server with hot reload -----------------------------------
FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---- build: type-check + bundle to /app/dist ---------------------------------
FROM deps AS build
# Vite inlines VITE_* variables at BUILD time, so the API URL is a build arg,
# not a runtime env var. Rebuild the image to point at a different backend.
ARG VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY . .
RUN npm run build

# ---- prod: static files served by nginx (no Node at runtime) ------------------
# The unprivileged variant runs as a non-root user and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1
