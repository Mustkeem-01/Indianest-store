
#// Stage 1:-

FROM node:22-bookworm-slim AS frontend-build

WORKDIR /app/frontend

COPY frontend/ ./

ENV VITE_API_URL= 
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY = $VITE_CLERK_PUBLISHABLE_KEY
RUN npm install --no-audit  --no-found \ && npm run build

#/// Stage 2 :-

    FROM node:22-bookworm-slim AS backend-build
    WORKDIR /app
    COPY backend/ ./
    RUN npm install --no-audit --no-fund \ && npm run build

#/// Stage 3 :-

    FROM node:22-bookworm-slim AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    COPY backend/Package.json backend/package-lock.json ./
    RUN npm install --omit=dev --no-fund && npm cache --force

    COPY --from=backend-build /app/dist ./dist
    COPY --from=frontend-build /app/frontend/dist ./public

    EXPOSE 3000
    USER node

    CMD {"node", "dist/index.js"}