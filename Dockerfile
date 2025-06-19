# Use the official Node.js image to build the app
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files to install packages
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy the .env file into the container
COPY .env .env

# Build the Vite app for production
RUN npm run build

# Use a lightweight web server to serve the built app
FROM nginx:stable-alpine AS production

# Copy the built files from the builder stage to the Nginx public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Remove default Nginx config and replace it with a custom one
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for serving the app
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
