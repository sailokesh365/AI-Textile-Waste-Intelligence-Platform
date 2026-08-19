FROM node:20-alpine

WORKDIR /app

# Install system dependencies if required
RUN apk add --no-cache curl

# Copy package manifests and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Create uploads directory for persistent storage
RUN mkdir -p /app/uploads

# Expose backend port (Local: 5000, Cloud Run: 8080)
EXPOSE 5000 8080

# Container healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["npm", "start"]
