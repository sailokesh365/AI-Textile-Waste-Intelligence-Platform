# Stage 1: Build Vite React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm ci

# Set build-time environment arguments (defaults to relative proxy paths)
ARG VITE_API_BASE_URL=/api
ARG VITE_SERVER_BASE_URL=

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SERVER_BASE_URL=$VITE_SERVER_BASE_URL

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:1.27-alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set default port (80 for Docker Compose / local, Cloud Run will override with PORT=8080)
ENV PORT=80

# Copy custom Nginx configuration template (Nginx entrypoint automatically substitutes ${PORT})
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Expose HTTP port
EXPOSE 80 8080

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-80}/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
