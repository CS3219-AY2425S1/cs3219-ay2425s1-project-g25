FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# For development environment
FROM base AS dev
EXPOSE 3004
CMD ["npm", "run", "dev"]

# For production environment
FROM base AS build
RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /app
# Copy only the built files and necessary files for production
COPY --from=build /app/dist ./dist
COPY package*.json ./
# Install only production dependencies
RUN npm install --only=production
EXPOSE 3004
CMD ["npm", "start"]
