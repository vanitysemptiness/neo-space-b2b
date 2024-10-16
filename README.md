neo-space
---
the infinite canvas that does everything and makes all of computing interoperable.
find the live copy at: https://neospacecanvas.com/ 


###### the design gist
the simple stuff (canvas and basic upload and draw functions are done in JS)
the memorey management, rendering of complex screen objects and render culling Rust WASM.

Project Setup
---
two ways to get this to run at `localhost:8080`...

Right now the WASM features are experimental so you can just run the HTML/JS
```bash
npm run build
npm start
```

###### Running with the docker container
To build and run the Docker container:
```bash
docker build -t neo-space-canvas .
docker run -p 8080:80 neo-space-canvas
```

###### Running without the docker container (but why would you?)
Build the WASM module:
```bash
cd wasm && wasm-pack build --target web
```