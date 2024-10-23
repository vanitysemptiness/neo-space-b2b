use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum DataType {
    Integer,
    Float,
    Text,
    Enum,
    Boolean,
    Unknown,
}

impl DataType {
    pub fn to_sql_type(&self) -> &str {
        match self {
            DataType::Integer => "INTEGER",
            DataType::Float => "NUMERIC",
            DataType::Text => "TEXT",
            DataType::Boolean => "BOOLEAN",
            DataType::Enum => "ENUM",
            DataType::Unknown => "TEXT"
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ColumnMetadata {
    pub name: String,
    pub data_type: DataType,
    pub sample_values: Vec<String>,
    pub nullable: bool,
    pub unique_count: usize,
    pub numeric_stats: Option<NumericStats<i64>>,  // Use i64 for Pokemon stats
    pub string_stats: Option<StringStats>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NumericStats<T> {
    pub min: T,
    pub max: T,
    pub mean: f64,  // mean stays f64 for precision
    pub null_count: usize,
    pub distinct_count: usize,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StringStats {
    pub min_length: usize,
    pub max_length: usize,
    pub null_count: usize,
    pub distinct_count: usize,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SqlStatements {
    pub create_table: String,
    pub insert_template: String,
}