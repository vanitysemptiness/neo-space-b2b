
If you use nvim instead of VS code I doubt I need to explain the following.

why is the .vscode directory included in the project?
---
The original author of this project is too lazy to setup nvim so this project uses the rust-analyzer VS code plugin in VS-code and that plugin requires 
the specification of the root Cargo.toml if it is not in the project base.

It also requires you add other paths to whatever Cargo.toml you are adding if you add new
rust wasm features to this project. Just put the path to your new Cargo.toml under 
`rust-analyzer.linkedProjects` in the settings.json that is in this directory if you add one.

