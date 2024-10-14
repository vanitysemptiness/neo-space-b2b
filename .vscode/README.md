
If you use nvim instead of VS code I doubt I need to explain the following.

why is the .vscode directory included in the project?
---
The original author of this project is too lazy to setup nvim so this project uses the rust-analyzer VS code plugin in VS-code and that plugin requires 
the specification of the root Cargo.toml if it is not in the project base.

The `Cargo.toml` in the `wasm` directory is a catch all for the libs at lower layers. 
If we make that visible to the `rust-analyzer` extension the subdirectories will be seen as well. 