FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the app
RUN npm run build

# Install serve
RUN npm install -g serve

EXPOSE 5173

# Use environment variable at runtime
CMD ["sh", "-c", "serve -s dist -l 5173"]