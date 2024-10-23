use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use csv::{ReaderBuilder, StringRecord};
use web_sys::console;

struct QueryBuilder {
    query: String,
}

impl QueryBuilder {
    fn new(initial: impl Into<String>) -> Self {
        QueryBuilder {
            query: initial.into()
        }
    }

    fn push(&mut self, sql: impl Into<String>) {
        self.query.push_str(&sql.into());
    }

    fn build(self) -> String {
        self.query
    }
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Debug)]
pub struct CSVMetadata {
    row_count: usize,
    column_count: usize,
    columns: HashMap<String, ColumnMetadata>,
    sample_rows: Vec<Vec<String>>,
    sql_statements: Option<SqlStatements>,
}

#[derive(Serialize, Deserialize, Debug)]
struct ColumnMetadata {
    name: String,
    data_type: DataType,
    sample_values: Vec<String>,
    nullable: bool,
    unique_count: usize,
    numeric_stats: Option<NumericStats>,
    string_stats: Option<StringStats>,
}

#[derive(Serialize, Deserialize, Debug)]
struct NumericStats {
    min: f64,
    max: f64,
    mean: f64,
    null_count: usize,
    distinct_count: usize,
}

#[derive(Serialize, Deserialize, Debug)]
struct StringStats {
    min_length: usize,
    max_length: usize,
    null_count: usize,
    distinct_count: usize,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
enum DataType {
    Integer,
    Float,
    Text,
    Unknown,
}

impl DataType {
    fn to_sql_type(&self) -> &str {
        match self {
            DataType::Integer => "INTEGER",
            DataType::Float => "NUMERIC",
            DataType::Text => "TEXT",
            DataType::Unknown => "TEXT",
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SqlStatements {
    pub create_table: String,
    pub insert_template: String,
}

impl std::fmt::Display for CSVMetadata {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "\n=== CSV Metadata Summary ===")?;
        writeln!(f, "Row Count: {}", self.row_count)?;
        writeln!(f, "Column Count: {}", self.column_count)?;
        
        writeln!(f, "\n=== Columns ===")?;
        for (name, metadata) in &self.columns {
            writeln!(f, "\nColumn: {}", name)?;
            writeln!(f, "  Type: {:?}", metadata.data_type)?;
            writeln!(f, "  Nullable: {}", metadata.nullable)?;
            writeln!(f, "  Unique Values: {}", metadata.unique_count)?;
            writeln!(f, "  Sample Values: {:?}", metadata.sample_values)?;
            
            if let Some(stats) = &metadata.numeric_stats {
                writeln!(f, "  Numeric Stats:")?;
                writeln!(f, "    Min: {}", stats.min)?;
                writeln!(f, "    Max: {}", stats.max)?;
                writeln!(f, "    Mean: {}", stats.mean)?;
                writeln!(f, "    Null Count: {}", stats.null_count)?;
                writeln!(f, "    Distinct Count: {}", stats.distinct_count)?;
            }
            
            if let Some(stats) = &metadata.string_stats {
                writeln!(f, "  String Stats:")?;
                writeln!(f, "    Min Length: {}", stats.min_length)?;
                writeln!(f, "    Max Length: {}", stats.max_length)?;
                writeln!(f, "    Null Count: {}", stats.null_count)?;
                writeln!(f, "    Distinct Count: {}", stats.distinct_count)?;
            }
        }
        
        writeln!(f, "\n=== Sample Rows ===")?;
        for (i, row) in self.sample_rows.iter().enumerate() {
            writeln!(f, "Row {}: {:?}", i + 1, row)?;
        }
        
        if let Some(sql) = &self.sql_statements {
            writeln!(f, "\n=== SQL Statements ===")?;
            writeln!(f, "Create Table SQL:\n{}", sql.create_table)?;
            writeln!(f, "\nInsert Template:\n{}", sql.insert_template)?;
        }
        
        Ok(())
    }
}

#[wasm_bindgen]
impl CSVMetadata {
    #[wasm_bindgen(constructor)]
    pub fn new(csv_data: &[u8]) -> Result<CSVMetadata, JsValue> {
        console::log_1(&"Starting CSV metadata analysis...".into());
        
        let mut reader = ReaderBuilder::new()
            .has_headers(true)
            .from_reader(csv_data);
        
        let headers = reader.headers()
            .map_err(|e| {
                console::error_1(&format!("Header read error: {}", e).into());
                JsValue::from_str(&format!("Failed to read headers: {}", e))
            })?
            .clone();
        
        console::log_1(&format!("Found {} columns: {:?}", headers.len(), headers).into());
        
        let mut columns: HashMap<String, ColumnMetadata> = HashMap::new();
        let mut sample_rows: Vec<Vec<String>> = Vec::with_capacity(5);
        let mut row_count = 0;
        let mut value_counts: HashMap<String, HashMap<String, usize>> = HashMap::new();
        
        // Initialize columns
        for header in headers.iter() {
            columns.insert(header.to_string(), ColumnMetadata {
                name: header.to_string(),
                data_type: DataType::Unknown,
                sample_values: Vec::with_capacity(5),
                nullable: false,
                unique_count: 0,
                numeric_stats: None,
                string_stats: None,
            });
        }
        
        let mut record = StringRecord::new();
        while row_count < 1000 {
            // Convert CSV error to JsValue explicitly
            if !reader.read_record(&mut record).map_err(|e| JsValue::from_str(&e.to_string()))? {
                break;
            }
            
            row_count += 1;
            
            if sample_rows.len() < 5 {
                sample_rows.push(record.iter().map(String::from).collect());
            }
            
            for (i, value) in record.iter().enumerate() {
                let col_name = headers.get(i).unwrap().to_string();
                let col_meta = columns.get_mut(&col_name).unwrap();
                
                value_counts
                    .entry(col_name.clone())
                    .or_default()
                    .entry(value.to_string())
                    .and_modify(|count| *count += 1)
                    .or_insert(1);
                
                if col_meta.sample_values.len() < 5 {
                    col_meta.sample_values.push(value.to_string());
                }
                
                if let Some(inferred_type) = infer_data_type(value) {
                    match col_meta.data_type {
                        DataType::Unknown => {
                            col_meta.data_type = inferred_type;
                        },
                        DataType::Integer => {
                            if matches!(inferred_type, DataType::Float) {
                                col_meta.data_type = DataType::Float;
                            }
                        },
                        _ => {}
                    }
                }
            }
        }
        
        for (col_name, counts) in value_counts {
            if let Some(col_meta) = columns.get_mut(&col_name) {
                col_meta.unique_count = counts.len();
            }
        }
        
        let sql_statements = generate_sql_statements("my_table", &columns);
        
        let metadata = CSVMetadata {
            row_count,
            column_count: headers.len(),
            columns,
            sample_rows,
            sql_statements: Some(sql_statements),
        };
        
        console::log_1(&format!("{}", metadata).into());
        
        Ok(metadata)
    }
    
    #[wasm_bindgen(getter)]
    pub fn sql(&self) -> Option<String> {
        self.sql_statements.as_ref().map(|s| s.create_table.clone())
    }
    
    #[wasm_bindgen(getter)]
    pub fn insert_template(&self) -> Option<String> {
        self.sql_statements.as_ref().map(|s| s.insert_template.clone())
    }
}

fn infer_data_type(value: &str) -> Option<DataType> {
    if value.is_empty() {
        return None;
    }
    
    if value.parse::<i64>().is_ok() {
        Some(DataType::Integer)
    } else if value.parse::<f64>().is_ok() {
        Some(DataType::Float)
    } else {
        Some(DataType::Text)
    }
}

fn generate_sql_statements(table_name: &str, columns: &HashMap<String, ColumnMetadata>) -> SqlStatements {
    let mut create_builder = QueryBuilder::new(format!("CREATE TABLE {} (\n", table_name));
    
    let column_defs: Vec<String> = columns.iter()
        .map(|(name, meta)| {
            format!("    {} {} {}",
                name,
                meta.data_type.to_sql_type(),
                if meta.nullable { "NULL" } else { "NOT NULL" }
            )
        })
        .collect();
    
    create_builder.push(column_defs.join(",\n"));
    create_builder.push("\n);");
    
    let mut insert_builder = QueryBuilder::new(format!("INSERT INTO {} (", table_name));
    
    // Column names
    insert_builder.push(
        columns.keys()
            .map(|k| k.to_string())
            .collect::<Vec<_>>()
            .join(", ")
    );
    
    // Parameters
    insert_builder.push(") VALUES (");
    insert_builder.push(
        (1..=columns.len())
            .map(|i| format!("${}", i))
            .collect::<Vec<_>>()
            .join(", ")
    );
    insert_builder.push(");");

    SqlStatements {
        create_table: create_builder.build(),
        insert_template: insert_builder.build(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_csv_metadata_generation() {
        let csv_data = b"id,name,price,quantity\n1,Item 1,10.50,100\n2,Item 2,15.75,200\n3,Item 3,20.00,300";
        
        let metadata = CSVMetadata::new(csv_data).unwrap();
        console::log_1(&format!("\nTest Metadata:\n{}", metadata).into());
        
        assert_eq!(metadata.row_count, 3);
        assert_eq!(metadata.column_count, 4);
        
        let columns = &metadata.columns;
        assert!(matches!(columns.get("id").unwrap().data_type, DataType::Integer));
        assert!(matches!(columns.get("name").unwrap().data_type, DataType::Text));
        assert!(matches!(columns.get("price").unwrap().data_type, DataType::Float));
        assert!(matches!(columns.get("quantity").unwrap().data_type, DataType::Integer));

        // Test SQL generation
        let sql = metadata.sql().unwrap();
        assert!(sql.contains("CREATE TABLE my_table"));
        assert!(sql.contains("id INTEGER"));
        assert!(sql.contains("price NUMERIC"));
    }

    #[wasm_bindgen_test]
    fn test_large_numbers() {
        let csv_data = b"big_int,small_int\n9999999999,-42\n8888888888,-100";
        
        let metadata = CSVMetadata::new(csv_data).unwrap();
        console::log_1(&format!("\nLarge Numbers Test Metadata:\n{}", metadata).into());
        
        let columns = &metadata.columns;
        assert!(matches!(columns.get("big_int").unwrap().data_type, DataType::Integer));
        assert!(matches!(columns.get("small_int").unwrap().data_type, DataType::Integer));
    }

    #[wasm_bindgen_test]
    fn test_mixed_number_types() {
        let csv_data = b"mixed\n1\n2.5\n3";
        
        let metadata = CSVMetadata::new(csv_data).unwrap();
        console::log_1(&format!("\nMixed Numbers Test Metadata:\n{}", metadata).into());
        
        let columns = &metadata.columns;
        assert!(matches!(columns.get("mixed").unwrap().data_type, DataType::Float));
    }
}