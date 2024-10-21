virtual-file-system
---



## Running Tests

Running the wasm_bindgen_test (s)
```bash
wasm-pack test --node
```
note: debugging `wasm-bindgen` tests requires you use a debugger in a browser, likely `chrome` is the best here.

Normally you would run 
```bash
cargo test
```
for `wasm-bindgen` this will not work, we have to compile to webassembly and test that binary.