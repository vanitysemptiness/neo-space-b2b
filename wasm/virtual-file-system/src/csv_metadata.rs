use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use csv::{ReaderBuilder, StringRecord};
use web_sys::console;
use std::collections::{HashMap, HashSet};

use crate::types::{DataType, ColumnMetadata, SqlStatements, NumericStats, StringStats};
use crate::sql_conversion::generate_sql_statements;
use crate::statistical_methods::{analyze_distribution, quick_frequency_check};

// Threshold for considering a column categorical/enum
const ENUM_RATIO_THRESHOLD: f64 = 0.1;
const MIN_ROWS_FOR_ENUM: usize = 10;

#[derive(Debug)]
struct ColumnAnalysis {
    could_be_integer: bool,
    could_be_float: bool,
    could_be_boolean: bool,
    could_be_enum: bool,
    unique_values: HashSet<String>,
    total_values: usize,
    non_empty_values: usize,
}

impl ColumnAnalysis {
    fn new() -> Self {
        ColumnAnalysis {
            could_be_integer: true,
            could_be_float: true,
            could_be_boolean: true,
            could_be_enum: true,
            unique_values: HashSet::new(),
            total_values: 0,
            non_empty_values: 0,
        }
    }
}

fn analyze_column(values: impl Iterator<Item = String>) -> ColumnAnalysis {
    let mut analysis = ColumnAnalysis::new();
    
    for value in values {
        analysis.total_values += 1;
        
        if !value.trim().is_empty() {
            analysis.non_empty_values += 1;
            analysis.unique_values.insert(value.clone());
            
            analysis.could_be_integer &= could_be_integer(&value);
            analysis.could_be_float &= could_be_float(&value);
            analysis.could_be_boolean &= could_be_boolean(&value);
        }
    }
    
    analysis.could_be_enum = could_be_enum(&analysis);
    
    analysis
}

fn could_be_integer(value: &str) -> bool {
    value.trim().parse::<i64>().is_ok()
}

fn could_be_float(value: &str) -> bool {
    value.trim().parse::<f64>().is_ok()
}

fn could_be_boolean(value: &str) -> bool {
    match value.trim().to_lowercase().as_str() {
        "true" | "false" | "1" | "0" | "yes" | "no" | "t" | "f" | "y" | "n" => true,
        _ => false
    }
}

// When is something likely categorical
// Limited set (1-8)
// Each value represents a distinct group
// Values have semantic meaning beyond their numeric value
pub fn could_be_enum(analysis: &ColumnAnalysis) -> bool {
    // Quick rejection checks
    if analysis.total_values < MIN_ROWS_FOR_ENUM {
        return false;
    }
    
    // Convert unique_values to Vec<String> for analysis
    let values: Vec<String> = analysis.unique_values.iter().cloned().collect();
    
    // Do quick frequency check first
    let quick_check = quick_frequency_check(&values);
    if !quick_check.should_analyze {
        return false;
    }
    
    // Only if quick check passes, do full distribution analysis
    let distribution = analyze_distribution(&values);
    distribution.is_categorical
}

fn determine_best_type(analysis: &ColumnAnalysis) -> DataType {
    if analysis.unique_values.is_empty() {
        return DataType::Text;
    }
    
    if analysis.could_be_boolean && analysis.unique_values.len() <= 2 {
        DataType::Boolean
    } else if analysis.could_be_integer {
        DataType::Integer
    } else if analysis.could_be_float {
        DataType::Float
    } else if analysis.could_be_enum {
        DataType::Enum
    } else {
        DataType::Text
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
        
        let mut column_values: HashMap<String, Vec<String>> = headers.iter()
            .map(|h| (h.to_string(), Vec::new()))
            .collect();
        
        let mut row_count = 0;
        let mut sample_rows = Vec::with_capacity(5);
        
        let mut record = StringRecord::new();
        while row_count < 1000 && reader.read_record(&mut record)
            .map_err(|e| JsValue::from_str(&e.to_string()))? 
        {
            row_count += 1;
            
            if sample_rows.len() < 5 {
                sample_rows.push(record.iter().map(String::from).collect());
            }
            
            for (i, value) in record.iter().enumerate() {
                let col_name = headers.get(i).unwrap().to_string();
                column_values.get_mut(&col_name).unwrap().push(value.to_string());
            }
        }
        
        let mut columns = HashMap::new();
        for (col_name, values) in column_values {
            let analysis = analyze_column(values.into_iter());
            let data_type = determine_best_type(&analysis);
            let unique_count = analysis.unique_values.len();
            let sample_values: Vec<String> = analysis.unique_values
                .into_iter()
                .take(5)
                .collect();
                    
            columns.insert(col_name.clone(), ColumnMetadata {
                name: col_name,
                data_type,
                sample_values,
                nullable: analysis.non_empty_values < analysis.total_values,
                unique_count,
                numeric_stats: None,
                string_stats: None,
            });
        }
        
        let sql_statements = Some(generate_sql_statements("my_table", &columns));
        
        let metadata = CSVMetadata {
            row_count,
            column_count: headers.len(),
            columns,
            sample_rows,
            sql_statements,
        };
        
        console::log_1(&format!("{}", metadata).into());
        
        Ok(metadata)
    }
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

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    pub const POKEMON_CSV: &[u8] = include_bytes!("../../../datasets/pokemon.csv");

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

    #[wasm_bindgen_test]
    fn test_pokemon_csv() {
        console::log_1(&"Starting Pokemon CSV test".into());
        
        let csv_data = POKEMON_CSV;
        let bytes: Vec<u8> = csv_data.to_vec();
        
        let metadata = CSVMetadata::new(&bytes).unwrap();
        console::log_1(&format!("Pokemon CSV Metadata:\n{}", metadata).into());
        
        let columns = &metadata.columns;
        
        // Test column count and basic structure
        assert!(metadata.column_count > 0);
        
        // Identifier columns
        assert!(matches!(columns.get("#").unwrap().data_type, DataType::Integer));
        // there are dupes for mega evolutions so not unique in this case, nor is it an identifier column
        // assert_eq!(columns.get("#").unwrap().unique_count, metadata.row_count);  // Should be unique
        
        assert!(matches!(columns.get("Name").unwrap().data_type, DataType::Text));
        assert_eq!(columns.get("Name").unwrap().unique_count, metadata.row_count); // Should be unique
        
        // Enum columns
        assert!(matches!(columns.get("Type 1").unwrap().data_type, DataType::Enum));
        assert!(columns.get("Type 1").unwrap().unique_count < 20); // Pokemon has 18 types
        
        assert!(matches!(columns.get("Type 2").unwrap().data_type, DataType::Enum));
        assert!(columns.get("Type 2").unwrap().unique_count < 20);
        
        // Integer stats columns - verify type and ranges
        let stat_columns = ["Total", "HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
        for col_name in stat_columns.iter() {
            let col = columns.get(*col_name).unwrap();
            assert!(
                matches!(col.data_type, DataType::Integer),
                "Expected {} to be Integer, got {:?}", col_name, col.data_type
            );
            
            if let Some(stats) = &col.numeric_stats {
                assert!(
                    stats.min >= 0 && stats.max <= 800_i64,
                    "Stats for {} outside expected range: min={}, max={}", 
                    col_name, stats.min, stats.max
                );
            }
        }
        
        // Generation - should be detected as enum due to low cardinality
        let gen_col = columns.get("Generation").unwrap();
        assert!(
            matches!(gen_col.data_type, DataType::Enum),
            "Expected Generation to be Enum, got {:?}", gen_col.data_type
        );
        assert!(gen_col.unique_count <= 8); // Pokemon has 8 generations max
        
        // Legendary - should be boolean
        let legendary_col = columns.get("Legendary").unwrap();
        assert!(
            matches!(legendary_col.data_type, DataType::Boolean),
            "Expected Legendary to be Boolean, got {:?}", legendary_col.data_type
        );
        assert_eq!(legendary_col.unique_count, 2); // Only true/false
    }
}