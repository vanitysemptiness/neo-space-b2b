use std::collections::HashMap;
use uuid::Uuid;
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use sha2::{Sha256, Digest};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VirtualFile {
    id: String,
    name: String,
    file_type: SupportedFileType,
    size: usize,
    #[serde(skip)]
    content: Option<Vec<u8>>,
    metadata: HashMap<String, String>,
    checksum: String
}

impl VirtualFile {
    fn new(id: String, name: String, file_type: SupportedFileType, content: Vec<u8>) -> Self {
        let size = content.len();
        let checksum = Self::calculate_checksum(&content);
        VirtualFile {
            id,
            name, 
            file_type,
            size,
            content: Some(content),
            metadata: HashMap::new(),
            checksum,
        }
    }

    fn calculate_checksum(content: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(content);
        format!("{:x}", hasher.finalize())
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum SupportedFileType {
    Image,
    Video,
    Gif,
    CSV,
    Other(String),
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
        let file_type: SupportedFileType = serde_wasm_bindgen::from_value(file_type)?;
        let id = Uuid::new_v4().to_string();
        let file = VirtualFile:: new(id.clone(), name, file_type, content);
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

#[cfg(test)]
mod file_system_tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_create_and_read_file() {
        let mut vfs = VirtualFileSystem::new();
        let file_type = serde_wasm_bindgen::to_value(&SupportedFileType::Image).unwrap();
        let id = vfs.create_file("test.jpg".to_string(), file_type, vec![1, 2, 3]).unwrap();
        let file: VirtualFile = serde_wasm_bindgen::from_value(vfs.read_file(&id).unwrap()).unwrap();
        assert_eq!(file.name, "test.jpg");
        assert_eq!(file.size, 3);
    }

    #[wasm_bindgen_test]
    fn test_update_file() {
        let mut vfs = VirtualFileSystem::new();
        let file_type = serde_wasm_bindgen::to_value(&SupportedFileType::Image).unwrap();
        let id = vfs.create_file("test.jpg".to_string(), file_type, vec![1, 2, 3]).unwrap();
        vfs.update_file(&id, Some(vec![4, 5, 6, 7])).unwrap();
        let content = vfs.get_file_content(&id).unwrap();
        assert_eq!(content, vec![4, 5, 6, 7]);
    }

    #[wasm_bindgen_test]
    fn test_delete_file() {
        let mut vfs = VirtualFileSystem::new();
        let file_type = serde_wasm_bindgen::to_value(&SupportedFileType::Image).unwrap();
        let id = vfs.create_file("test.jpg".to_string(), file_type, vec![1, 2, 3]).unwrap();
        vfs.delete_file(&id).unwrap();
        assert!(vfs.read_file(&id).is_err());
    }

    #[wasm_bindgen_test]
    fn test_metadata() {
        let mut vfs = VirtualFileSystem::new();
        let file_type = serde_wasm_bindgen::to_value(&SupportedFileType::Image).unwrap();
        let id = vfs.create_file("test.jpg".to_string(), file_type, vec![1, 2, 3]).unwrap();
        // its not actually getting added to the file system
        vfs.set_file_metadata(&id, "position".to_string(), "100,100".to_string()).unwrap();
        let position: String = serde_wasm_bindgen::from_value(vfs.get_file_metadata(&id, "position").unwrap()).unwrap();
        assert_eq!(position, "100,100");
    }
}