# Etapa 1: build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: producción
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# --- ESTA ES LA LÍNEA NUEVA QUE SOLUCIONA EL 404 ---
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]