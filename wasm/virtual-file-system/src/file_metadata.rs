use wasm_bindgen::prelude::*;

/// what do users want to know
/// row count
/// column count
/// memory footprint
/// missing values or zero values
/// date ranges -> will have to support later
/// file creation, modification date
/// 

#[wasm_bindgen]
pub fn get_csv_schema(csv_content: &str) -> Result<String, JsValue> {
    let mut lines = csv_content.lines();
    let header = lines.next().ok_or_else(|| JsValue::from_str("Empty CSV"))?;
    let first_row = lines.next().ok_or_else(|| JsValue::from_str("Only header in CSV"))?;

    let columns: Vec<&str> = header.split(',').collect();
    let values: Vec<&str> = first_row.split(',').collect();

    if columns.len() != values.len() {
        return Err(JsValue::from_str("Mismatched header and data columns"));
    }

    let mut schema = String::from("Schema { fields: [");
    for (i, (col, val)) in columns.iter().zip(values.iter()).enumerate() {
        let data_type = if val.parse::<i64>().is_ok() {
            "Int64"
        } else if val.parse::<f64>().is_ok() {
            "Float64"
        } else {
            "Utf8"
        };
        schema.push_str(&format!("Field {{ name: \"{}\", data_type: {} }}", col, data_type));
        if i < columns.len() - 1 {
            schema.push_str(", ");
        }
    }
    schema.push_str("] }");

    Ok(schema)
}

#[cfg(test)]
mod file_metadata_tests {
    use crate::{file_system, test_utils};

    use super::*;
    use wasm_bindgen_test::*;
    use file_system::{VirtualFileSystem, SupportedFileType};
    use test_utils::assert_ok;

    #[wasm_bindgen_test]
    fn test_get_csv_schema() {
        let csv_content = "id,name,age\n1,Alice,30\n2,Bob,25\n3,Charlie,35";
        let schema = assert_ok(get_csv_schema(csv_content), "Failed to get CSV content");
        
        let expected_schema = "Schema { \
            fields: [\
                Field { name: \"id\", data_type: Int64 }, \
                Field { name: \"name\", data_type: Utf8 }, \
                Field { name: \"age\", data_type: Int64 }\
            ] \
        }";
    
        assert_eq!(schema, expected_schema);
    }
}