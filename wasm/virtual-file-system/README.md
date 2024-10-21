virtual-file-system
---
This lib is a virtual file system for the files uploaded to the users neo-space canvas.
This lib will also cache metadata about the user's files so that certain relationships between uploaded files are easier to pickout and provide to an LLM or various other pattern finding algorithms.

## Why write a virtual file system for a canvas app

The canvas needs a file management system to do more intensive operations on files of various types.
Rust compiled to webassembly can be better at this than plain JS. 
The load times and indexing of file details is faster with webassembly than JS, [some say its almost instant](https://www.figma.com/blog/webassembly-cut-figmas-load-time-by-3x/).
The [browser sandbox](https://www.browserstack.com/guide/what-is-browser-sandboxing#:~:text=Web%20Browser%20Sandbox%3A%20A%20web,in%20an%20isolated%2C%20safe%20environment.) does not allow WASM to access files on the user's local, so they must provide them and we can operate on a copy. 


## Running Tests

Running the wasm_bindgen_test (s)
```bash
wasm-pack test --node
```
note: debugging `wasm-bindgen` tests requires you use a debugger in a browser, likely `chrome` is the best here.
if you are using vs code you may need something like this in a `launch.json`
```json
{
    "type": "chrome",
    "request": "launch",
    "name": "Debug wasm-pack tests",
    "url": "file://${workspaceFolder}/target/wasm32-unknown-unknown/debug/deps/your_test_runner.html",
    "webRoot": "${workspaceFolder}",
    "sourceMaps": true,
    "sourceMapPathOverrides": {
        "webpack:///./src/*": "${webRoot}/src/*"
    }
}
file paths may vary
the above would change your run/debug command to `wasm-pack test --chrome --headless` 

```
Normally you would run 
```bash
cargo test
```
for `wasm-bindgen` this will not work, we have to compile to webassembly and test that binary.