use wasm_bindgen::prelude::*;
use web_sys::console;
use serde::Serialize;
use crate::core::{CSVMetadata, DataType, ColumnMetadata, SqlStatements, NumericStats, StringStats};

#[wasm_bindgen]
pub struct WasmCSVMetadata {
    inner: CSVMetadata
}

#[wasm_bindgen]
impl WasmCSVMetadata {
    #[wasm_bindgen(constructor)]
    pub fn new(csv_data: &[u8]) -> Result<WasmCSVMetadata, JsValue> {
        console::log_1(&"Starting CSV metadata analysis...".into());
        
        CSVMetadata::analyze(csv_data)
            .map(|metadata| WasmCSVMetadata { inner: metadata })
            .map_err(|e| JsValue::from_str(&e))
    }

    #[wasm_bindgen]
    pub fn get_row_count(&self) -> usize {
        self.inner.row_count
    }

    #[wasm_bindgen]
    pub fn get_column_count(&self) -> usize {
        self.inner.column_count
    }

    #[wasm_bindgen]
    pub fn get_metadata(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.inner)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
    }

    #[wasm_bindgen]
    pub fn get_column_info(&self, column_name: &str) -> Result<JsValue, JsValue> {
        self.inner.columns.get(column_name)
            .ok_or_else(|| JsValue::from_str("Column not found"))
            .and_then(|col| serde_wasm_bindgen::to_value(col)
                .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e))))
    }

    #[wasm_bindgen]
    pub fn get_sample_rows(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.inner.sample_rows)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
    }

    #[wasm_bindgen]
    pub fn get_sql_statements(&self) -> Result<JsValue, JsValue> {
        self.inner.sql_statements.as_ref()
            .ok_or_else(|| JsValue::from_str("No SQL statements available"))
            .and_then(|sql| serde_wasm_bindgen::to_value(sql)
                .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e))))
    }

    #[wasm_bindgen]
    pub fn to_string(&self) -> String {
        format!("{:#?}", self.inner)
    }
}

// WASM-specific tests
#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_csv_metadata_creation() {
        let csv_data = b"id,name,value\n1,test,100\n2,example,200";
        let metadata = WasmCSVMetadata::new(csv_data).unwrap();
        assert_eq!(metadata.get_row_count(), 2);
        assert_eq!(metadata.get_column_count(), 3);
    }

    #[wasm_bindgen_test]
    fn test_column_info() {
        let csv_data = b"id,name,value\n1,test,100\n2,example,200";
        let metadata = WasmCSVMetadata::new(csv_data).unwrap();
        
        let column_info: ColumnMetadata = serde_wasm_bindgen::from_value(
            metadata.get_column_info("id").unwrap()
        ).unwrap();
        
        assert_eq!(column_info.name, "id");
        assert!(matches!(column_info.data_type, DataType::Integer));
    }

    #[wasm_bindgen_test]
    fn test_sample_rows() {
        let csv_data = b"id,name,value\n1,test,100\n2,example,200";
        let metadata = WasmCSVMetadata::new(csv_data).unwrap();
        
        let samples: Vec<Vec<String>> = serde_wasm_bindgen::from_value(
            metadata.get_sample_rows().unwrap()
        ).unwrap();
        
        assert!(!samples.is_empty());
        assert_eq!(samples[0].len(), 3);
    }
}