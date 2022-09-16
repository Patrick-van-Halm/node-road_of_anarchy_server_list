FROM node:18.9-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "."]