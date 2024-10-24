pub mod core;

#[cfg(target_arch = "wasm32")]
pub mod wasm;

// Re-export commonly used types and traits for external users
pub use core::{
    VirtualFileSystem,
    VirtualFile,
    SupportedFileType,
    FileMetadata,
    CSVMetadata
};

// Re-export the WASM interfaces when targeting wasm32
#[cfg(target_arch = "wasm32")]
pub use wasm::{WasmFileSystem, WasmCSVMetadata};

// When in test configuration, expose test utilities
#[cfg(test)]
pub use core::test_utils::*;