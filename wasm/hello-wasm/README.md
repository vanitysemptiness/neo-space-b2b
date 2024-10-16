# Hello Rust WebAssembly

This is a simple Rust WebAssembly project that displays "Hello from Rust WebAssembly!" on a web page.

## Prerequisites

Before you begin, ensure you have the following installed:

1. [Rust](https://www.rust-lang.org/tools/install)
2. [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
3. [Node.js](https://nodejs.org/) (for running a local server)
4. [Docker](https://www.docker.com/get-started) (optional, for containerized setup)
5. [Docker Compose](https://docs.docker.com/compose/install/) (optional, for easier Docker management)

## Running the Project

### With Docker Compose

1. Make sure Docker Desktop is running.
2. In the `hello-wasm` directory, run:
   ```
   docker-compose up --build
   ```
3. Open your web browser and navigate to `http://localhost:8080`.

You should now see "Hello from Rust WebAssembly!" displayed on the web page.

To stop the container, press Ctrl+C in the terminal where docker-compose is running.

### With Docker

1. In the `hello-wasm` directory, build the Docker image:
   ```
   docker build -t hello-wasm .
   ```
2. Run the Docker container:
   ```
   docker run -p 8080:8080 hello-wasm
   ```
3. Open your web browser and navigate to `http://localhost:8080`.

### Without Docker

1. Build the WebAssembly module:
   ```
   wasm-pack build --target web
   ```
2. Install a simple HTTP server (if you don't have one):
   ```
   npm install -g http-server
   ```
3. Start the server:
   ```
   http-server
   ```
4. Open your web browser and navigate to `http://localhost:8080` (or the URL provided by your HTTP server).

## Modifying the Project

To make changes to the Rust code:

1. Edit the `src/lib.rs` file.
2. If running without Docker:
   - Rebuild the WebAssembly module using `wasm-pack build --target web`.
   - Refresh your browser to see the changes.
3. If running with Docker or Docker Compose:
   - Stop the running container (Ctrl+C if using docker-compose).
   - Rebuild and restart:
     - For Docker: `docker build -t hello-wasm . && docker run -p 8080:8080 hello-wasm`
     - For Docker Compose: `docker-compose up --build`
   - Refresh your browser to see the changes.