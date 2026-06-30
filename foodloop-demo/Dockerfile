FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx vite optimize

ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "--host", "::", "--port", "8080"]
