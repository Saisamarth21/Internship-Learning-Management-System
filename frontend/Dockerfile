FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the app
RUN npm run build

# Install serve to run the production build
RUN npm install -g serve

EXPOSE 5173

# Start the app
CMD ["serve", "-s", "dist", "-l", "5173"] 