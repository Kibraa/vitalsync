# Multi-stage build : permet de reduire la taille de l'image finale
# et d'ameliorer la securite en ne gardant que le necessaire en production.
# Stage 1 - Installation des dependances et execution des tests
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm test

# Stage 2 - Image de production legere
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js .
EXPOSE 3000
CMD ["node", "server.js"]
