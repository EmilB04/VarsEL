# Frontend Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json .
COPY tsconfig.json .
COPY quasar.config.ts .
COPY src ./src
COPY public ./public
COPY /index.html ./index.html
COPY eslint.config.js ./eslint.config.js
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
