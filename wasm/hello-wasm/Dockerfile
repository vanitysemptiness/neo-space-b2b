# Use the official Rust image as a parent image
FROM rust:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Install wasm-pack
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Install Node.js and npm
RUN apt-get update && apt-get install -y nodejs npm

# Copy the current directory contents into the container
COPY . .

# Build the WebAssembly module
RUN wasm-pack build --target web

# Install http-server
RUN npm install -g http-server

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run http-server when the container launches
CMD ["http-server", "-p", "8080"]