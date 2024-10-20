use std::collections::HashMap;
use uuid::Uuid;
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VirtualFile {
    id: String,
    name: String,
    file_type: FileType,
    size: usize,
    #[serde(skip)]
    content: Option<Vec<u8>>,
    metadata: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum FileType {
    Image,
    Video,
    Gif,
    CSV,
    Other(String),
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub enum SqlDialect {
    PostgreSQL,
    MySQL,
    SQLite
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub enum DataType {
    Int64,
    Float64,
    Utf8
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct Field {
    name: String,
    data_type: DataType,
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct Schema {
    fields: Vec<Field>,
}}


impl Schema {
    pub fn to_sql(&self, dialect: SqlDialect, table_name: &str) -> String {
        let columns: Vec<String> = self.fields.iter().map(|field| {
            let sql_type = match (dialect, &field.data_type) {
                (SqlDialect::PostgreSQL, DataType::Int64) => "BIGINT",
                (SqlDialect::PostgreSQL, DataType::Float64) => "DOUBLE PRECISION",
                (SqlDialect::PostgreSQL, DataType::Utf8) => "TEXT",
                (SqlDialect::MySQL, DataType::Int64) => "BIGINT",
                (SqlDialect::MySQL, DataType::Float64) => "DOUBLE",
                (SqlDialect::MySQL, DataType::Utf8) => "TEXT",
                (SqlDialect::SQLite, DataType::Int64) => "INTEGER",
                (SqlDialect::SQLite, DataType::Float64) => "REAL",
                (SqlDialect::SQLite, DataType::Utf8) => "TEXT",
            };
            format!("    {} {}", field.name, sql_type)
        }).collect();

        format!("CREATE TABLE {} (\n{}\n);", table_name, columns.join(",\n"))
    }
}

// Function to parse the schema string
pub fn parse_schema(schema_str: &str) -> Result<Schema, Box<dyn std::error::Error>> {
    let schema_str = schema_str.replace("Schema", "").trim().to_string();
    let schema: Schema = serde_json::from_str(&schema_str)?;
    Ok(schema)
}

#[wasm_bindgen]
pub struct VirtualFileSystem {
    files: HashMap<String, VirtualFile>,
}

#[wasm_bindgen]
impl VirtualFileSystem {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        VirtualFileSystem {
            files: HashMap::new(),
        }
    }

    #[wasm_bindgen]
    pub fn create_file(&mut self, name: String, file_type: JsValue, content: Vec<u8>) -> Result<String, JsValue> {
        let file_type: FileType = serde_wasm_bindgen::from_value(file_type)?;
        let id = Uuid::new_v4().to_string();
        let file = VirtualFile {
            id: id.clone(),
            name,
            file_type,
            size: content.len(),
            content: Some(content),
            metadata: HashMap::new(),
        };
        self.files.insert(id.clone(), file);
        Ok(id)
    }

    #[wasm_bindgen]
    pub fn read_file(&self, id: &str) -> Result<JsValue, JsValue> {
        self.files.get(id)
            .ok_or_else(|| JsValue::from_str("File not found"))
            .and_then(|file| serde_wasm_bindgen::to_value(file).map_err(|e| e.into()))
    }

    #[wasm_bindgen]
    pub fn update_file(&mut self, id: &str, new_content: Option<Vec<u8>>) -> Result<(), JsValue> {
        self.files.get_mut(id)
            .ok_or_else(|| JsValue::from_str("File not found"))
            .map(|file| {
                if let Some(content) = new_content {
                    let size = content.len();
                    file.content = Some(content);
                    file.size = size;
                }
            })
    }

    #[wasm_bindgen]
    pub fn delete_file(&mut self, id: &str) -> Result<(), JsValue> {
        self.files.remove(id)
            .map(|_| ())
            .ok_or_else(|| JsValue::from_str("File not found"))
    }

    #[wasm_bindgen]
    pub fn list_files(&self) -> Result<JsValue, JsValue> {
        let files: Vec<&VirtualFile> = self.files.values().collect();
        serde_wasm_bindgen::to_value(&files).map_err(|e| e.into())
    }

    #[wasm_bindgen]
    pub fn get_file_content(&self, id: &str) -> Result<Vec<u8>, JsValue> {
        self.files.get(id)
            .and_then(|file| file.content.as_ref())
            .cloned()
            .ok_or_else(|| JsValue::from_str("File content not found"))
    }

    #[wasm_bindgen]
    pub fn set_file_metadata(&mut self, id: &str, key: String, value: String) -> Result<(), JsValue> {
        self.files.get_mut(id)
            .ok_or_else(|| JsValue::from_str("File not found"))
            .map(|file| {
                file.metadata.insert(key, value);
            })
    }

    #[wasm_bindgen]
    pub fn get_file_metadata(&self, id: &str, key: &str) -> Result<JsValue, JsValue> {
        self.files.get(id)
            .and_then(|file| file.metadata.get(key))
            .ok_or_else(|| JsValue::from_str("Metadata not found"))
            .and_then(|value| serde_wasm_bindgen::to_value(value).map_err(|e| e.into()))
    }
}

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
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_get_csv_schema() {
        let csv_content = "id,name,age\n1,Alice,30\n2,Bob,25\n3,Charlie,35";
        let schema = get_csv_schema(csv_content).unwrap();
        
        let expected_schema = "Schema { \
            fields: [\
                Field { name: \"id\", data_type: Int64 }, \
                Field { name: \"name\", data_type: Utf8 }, \
                Field { name: \"age\", data_type: Int64 }\
            ] \
        }";
    
        assert_eq!(schema, expected_schema);
    }

    #[wasm_bindgen_test]
    fn test_create_and_read_file() {
        let mut vfs = VirtualFileSystem::new();
        let file_type = serde_wasm_bindgen::to_value(&FileType::Image).unwrap();
        let id = vfs.create_file("test.jpg".to_string(), file_type, vec![1, 2, 3]).unwrap();
        let file: VirtualFile = serde_wasm_bindgen::from_value(vfs.read_file(&id).unwrap()).unwrap();
        assert_eq!(file.name, "test.jpg");
        assert_eq!(file.size, 3);
    }

    #[wasm_bindgen_test]
    fn test_update_file() {
        let mut vfs = VirtualFileSystem::new();
        let file_type = serde_wasm_bindgen::to_value(&FileType::Image).unwrap();
        let id = vfs.create_file("test.jpg".to_string(), file_type, vec![1, 2, 3]).unwrap();
        vfs.update_file(&id, Some(vec![4, 5, 6, 7])).unwrap();
        let content = vfs.get_file_content(&id).unwrap();
        assert_eq!(content, vec![4, 5, 6, 7]);
    }

    #[wasm_bindgen_test]
    fn test_delete_file() {
        let mut vfs = VirtualFileSystem::new();
        let file_type = serde_wasm_bindgen::to_value(&FileType::Image).unwrap();
        let id = vfs.create_file("test.jpg".to_string(), file_type, vec![1, 2, 3]).unwrap();
        vfs.delete_file(&id).unwrap();
        assert!(vfs.read_file(&id).is_err());
    }

    #[wasm_bindgen_test]
    fn test_metadata() {
        let mut vfs = VirtualFileSystem::new();
        let file_type = serde_wasm_bindgen::to_value(&FileType::Image).unwrap();
        let id = vfs.create_file("test.jpg".to_string(), file_type, vec![1, 2, 3]).unwrap();
        vfs.set_file_metadata(&id, "position".to_string(), "100,100".to_string()).unwrap();
        let position: String = serde_wasm_bindgen::from_value(vfs.get_file_metadata(&id, "position").unwrap()).unwrap();
        assert_eq!(position, "100,100");
    }
}