
mod file_system;
mod file_metadata;
mod csv_metadata;
mod sql_conversion;
mod statistical_methods;
mod types;
pub(crate) mod test_utils;

// Re-export public items
pub use self::file_system::{VirtualFileSystem, VirtualFile, SupportedFileType};
pub use self::file_metadata::FileMetadata;
pub use self::csv_metadata::CSVMetadata;
pub use self::sql_conversion::generate_sql_statements;
pub use self::statistical_methods::{analyze_distribution, quick_frequency_check};
pub use self::types::*;
pub use self::test_utils::assert_ok;