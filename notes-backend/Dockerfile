FROM node:18-alpine

# Добавляем зависимости для OpenSSL (Prisma) И для компиляции native-модулей (bcrypt)
RUN apk add --no-cache openssl libc6-compat python3 make g++

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Теперь npm install сам скомпилирует bcrypt внутри контейнера
RUN npm install

RUN npx prisma generate

COPY . .

EXPOSE 3000
CMD ["npm", "start"]