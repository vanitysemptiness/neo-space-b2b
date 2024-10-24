// core/csv_metadata.rs
use std::collections::{HashMap, HashSet};
use serde::{Serialize, Deserialize};
use csv::{ReaderBuilder, StringRecord};

use crate::core::types::{DataType, ColumnMetadata, SqlStatements, NumericStats, StringStats};
use crate::core::sql_conversion::generate_sql_statements;
use crate::core::statistical_methods::{analyze_distribution, quick_frequency_check};

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

#[derive(Debug, Serialize, Deserialize)]
pub struct CSVMetadata {
    pub row_count: usize,
    pub column_count: usize,
    pub columns: HashMap<String, ColumnMetadata>,
    pub sample_rows: Vec<Vec<String>>,
    pub sql_statements: Option<SqlStatements>,
}

impl CSVMetadata {
    pub fn analyze(csv_data: &[u8]) -> Result<Self, String> {
        let mut reader = ReaderBuilder::new()
            .has_headers(true)
            .from_reader(csv_data);
        
        let headers = reader.headers()
            .map_err(|e| format!("Failed to read headers: {}", e))?
            .clone();
        
        let mut column_values: HashMap<String, Vec<String>> = headers.iter()
            .map(|h| (h.to_string(), Vec::new()))
            .collect();
        
        let mut row_count = 0;
        let mut sample_rows = Vec::with_capacity(5);
        
        let mut record = StringRecord::new();
        while row_count < 1000 && reader.read_record(&mut record)
            .map_err(|e| e.to_string())? 
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
            let analysis = analyze_column(values.iter());
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
        
        Ok(CSVMetadata {
            row_count,
            column_count: headers.len(),
            columns,
            sample_rows,
            sql_statements,
        })
    }
}

fn analyze_column<'a>(values: impl Iterator<Item = &'a String>) -> ColumnAnalysis {
    let mut analysis = ColumnAnalysis::new();
    
    for value in values {
        analysis.total_values += 1;
        
        if !value.trim().is_empty() {
            analysis.non_empty_values += 1;
            analysis.unique_values.insert(value.clone());
            
            analysis.could_be_integer &= could_be_integer(value);
            analysis.could_be_float &= could_be_float(value);
            analysis.could_be_boolean &= could_be_boolean(value);
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

fn could_be_enum(analysis: &ColumnAnalysis) -> bool {
    if analysis.total_values < MIN_ROWS_FOR_ENUM {
        return false;
    }
    
    let values: Vec<String> = analysis.unique_values.iter().cloned().collect();
    let quick_check = quick_frequency_check(&values);
    
    if !quick_check.should_analyze {
        return false;
    }
    
    analyze_distribution(&values).is_categorical
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

#[cfg(test)]
mod tests {

    use super::*;

    const SAMPLE_CSV: &[u8] = b"id,name,price,quantity\n1,Item 1,10.50,100\n2,Item 2,15.75,200\n3,Item 3,20.00,300";
    const POKEMON_CSV: &[u8] = include_bytes!("../../../../datasets/pokemon.csv");

    #[test]
    fn test_csv_metadata_generation() {
        let metadata = CSVMetadata::analyze(SAMPLE_CSV).unwrap();
        
        assert_eq!(metadata.row_count, 3);
        assert_eq!(metadata.column_count, 4);
        
        let columns = &metadata.columns;
        assert!(matches!(columns.get("id").unwrap().data_type, DataType::Integer));
        assert!(matches!(columns.get("name").unwrap().data_type, DataType::Text));
        assert!(matches!(columns.get("price").unwrap().data_type, DataType::Float));
        assert!(matches!(columns.get("quantity").unwrap().data_type, DataType::Integer));
    }

    #[test]
    fn test_pokemon_csv() {
        let metadata = CSVMetadata::analyze(POKEMON_CSV).unwrap();
        let columns = &metadata.columns;
        
        // Test column count
        assert!(metadata.column_count > 0);
        
        // Type columns should be enums
        assert!(matches!(columns.get("Type 1").unwrap().data_type, DataType::Enum));
        assert!(columns.get("Type 1").unwrap().unique_count < 20); // Pokemon has 18 types
        
        assert!(matches!(columns.get("Type 2").unwrap().data_type, DataType::Enum));
        assert!(columns.get("Type 2").unwrap().unique_count < 20);
        
        // Stats columns should be integers
        let stat_columns = ["Total", "HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
        for col_name in stat_columns.iter() {
            let col = columns.get(*col_name).unwrap();
            assert!(
                matches!(col.data_type, DataType::Integer),
                "Expected {} to be Integer, got {:?}", col_name, col.data_type
            );
        }
        
        // Generation should be an enum
        let gen_col = columns.get("Generation").unwrap();
        assert!(
            matches!(gen_col.data_type, DataType::Enum),
            "Expected Generation to be Enum, got {:?}", gen_col.data_type
        );
        assert!(gen_col.unique_count <= 8);
        
        // Legendary should be boolean
        let legendary_col = columns.get("Legendary").unwrap();
        assert!(
            matches!(legendary_col.data_type, DataType::Boolean),
            "Expected Legendary to be Boolean, got {:?}", legendary_col.data_type
        );
        assert_eq!(legendary_col.unique_count, 2);
    }
}

// wasm/csv_metadata_bindings.rs
use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen]
pub struct WasmCSVMetadata(CSVMetadata);

#[wasm_bindgen]
impl WasmCSVMetadata {
    #[wasm_bindgen(constructor)]
    pub fn new(csv_data: &[u8]) -> Result<WasmCSVMetadata, JsValue> {
        console::log_1(&"Starting CSV metadata analysis...".into());
        
        CSVMetadata::analyze(csv_data)
            .map(WasmCSVMetadata)
            .map_err(|e| JsValue::from_str(&e))
    }

    #[wasm_bindgen]
    pub fn to_string(&self) -> String {
        format!("{:#?}", self.0)
    }

    #[wasm_bindgen]
    pub fn get_metadata(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.0)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }
}