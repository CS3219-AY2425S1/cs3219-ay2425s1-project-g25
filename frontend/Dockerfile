# Use the official Node.js image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install all dependencies, including devDependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000 for the frontend
EXPOSE 3000

# Start the React development server
CMD ["npm", "start", "--", "--poll"]
