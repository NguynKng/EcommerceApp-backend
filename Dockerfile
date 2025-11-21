# Stage 1: Build
FROM node:18 as builder

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Stage 2: Run (dùng Alpine nhưng không build thêm)
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 8000

CMD ["npm", "start"]
