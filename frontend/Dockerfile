FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# <-- Add this:
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the app (VITE_API_URL is now in process.env)
RUN npm run build

RUN npm install -g serve

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
