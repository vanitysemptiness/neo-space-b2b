# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the app
RUN npm run build

# Install serve package globally
RUN npm install -g serve

# Expose port 3000
EXPOSE 8080

# Start serve
CMD ["serve", "-s", "build", "-l", "3000"]