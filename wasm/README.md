
TODO: This file should tell the reader what info they can get from it at the top

This is a directory full of Rust WASM libs. 

They plugin with the React code in the layer above. 
They also can be tested and utilized on their own.



create a new lib (package) for neo-space:
in the `wasm` directory 
```bash
cargo new --lib whatever_you_want_to_call_it
```

add the project name to the `members` section of the Cargo.toml that is in this directory.
If you use VS code go into the `.vscode`