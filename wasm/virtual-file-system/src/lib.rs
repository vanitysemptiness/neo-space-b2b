use std::collections::HashMap;
use uuid::Uuid;
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct VirtualFile {
    id: String,
    name: String,
    path: String,
    file_type: FileType,
    size: usize,
    #[serde(skip)]
    content: Option<Vec<u8>>,
    metadata: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum FileType {
    Image,
    CSV,
    PDF,
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
    pub fn create_file(&mut self, path: String, name: String, file_type: JsValue, new_content: Vec<u8>) -> Result<String, JsValue> {
        let file_type: FileType = serde_wasm_bindgen::from_value(file_type)?;
        let id = Uuid::new_v4().to_string();
        let size = new_content.len();
        let file = VirtualFile {
            id: id.clone(),
            name,
            path,
            file_type,
            size,
            content: Some(new_content),
            metadata: HashMap::new(),
        };
        self.files.insert(id.clone(), file);
        Ok(id)
    }

    #[wasm_bindgen]
    pub fn read_file(&self, id: &str) -> Result<JsValue, JsValue> {
        match self.files.get(id) {
            Some(file) => Ok(serde_wasm_bindgen::to_value(file)?),
            None => Err(JsValue::from_str("File not found")),
        }
    }

    #[wasm_bindgen]
    pub fn update_file(&mut self, id: &str, new_content: Vec<u8>) -> Result<(), JsValue> {
        match self.files.get_mut(id) {
            Some(file) => {
                file.size = new_content.len();
                file.content = Some(new_content);
                Ok(())
            }
            None => Err(JsValue::from_str("File not found")),
        }
    }

    #[wasm_bindgen]
    pub fn delete_file(&mut self, id: &str) -> Result<(), JsValue> {
        if self.files.remove(id).is_some() {
            Ok(())
        } else {
            Err(JsValue::from_str("File not found"))
        }
    }

    #[wasm_bindgen]
    pub fn list_files(&self) -> Result<JsValue, JsValue> {
        let files: Vec<&VirtualFile> = self.files.values().collect();
        Ok(serde_wasm_bindgen::to_value(&files)?)
    }

    #[wasm_bindgen]
    pub fn get_file_content(&self, id: &str) -> Result<Vec<u8>, JsValue> {
        match self.files.get(id) {
            Some(file) => match &file.content {
                Some(content) => Ok(content.clone()),
                None => Err(JsValue::from_str("File content not loaded")),
            },
            None => Err(JsValue::from_str("File not found")),
        }
    }

    #[wasm_bindgen]
    pub fn set_file_metadata(&mut self, id: &str, key: String, value: String) -> Result<(), JsValue> {
        match self.files.get_mut(id) {
            Some(file) => {
                file.metadata.insert(key, value);
                Ok(())
            }
            None => Err(JsValue::from_str("File not found")),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_create_and_read_file() {
        let mut vfs = VirtualFileSystem::new();
        let file_type = serde_wasm_bindgen::to_value(&FileType::Image).unwrap();
        let id = vfs.create_file("/test".to_string(), "test.jpg".to_string(), file_type, vec![1, 2, 3]).unwrap();
        let file = vfs.read_file(&id).unwrap();
        let file: VirtualFile = serde_wasm_bindgen::from_value(file).unwrap();
        assert_eq!(file.name, "test.jpg");
        assert_eq!(file.size, 3);
    }

    #[wasm_bindgen_test]
    fn test_update_file() {
        let mut vfs = VirtualFileSystem::new();
        let file_type = serde_wasm_bindgen::to_value(&FileType::Image).unwrap();
        let id = vfs.create_file("/test".to_string(), "test.jpg".to_string(), file_type, vec![1, 2, 3]).unwrap();
        vfs.update_file(&id, vec![4, 5, 6, 7]).unwrap();
        let content = vfs.get_file_content(&id).unwrap();
        assert_eq!(content, vec![4, 5, 6, 7]);
    }

    #[wasm_bindgen_test]
    fn test_delete_file() {
        let mut vfs = VirtualFileSystem::new();
        let file_type = serde_wasm_bindgen::to_value(&FileType::Image).unwrap();
        let id = vfs.create_file("/test".to_string(), "test.jpg".to_string(), file_type, vec![1, 2, 3]).unwrap();
        vfs.delete_file(&id).unwrap();
        assert!(vfs.read_file(&id).is_err());
    }

    #[wasm_bindgen_test]
    fn test_list_files() {
        let mut vfs = VirtualFileSystem::new();
        let file_type = serde_wasm_bindgen::to_value(&FileType::Image).unwrap();
        vfs.create_file("/test".to_string(), "test1.jpg".to_string(), file_type.clone(), vec![1, 2, 3]).unwrap();
        vfs.create_file("/test".to_string(), "test2.jpg".to_string(), file_type, vec![4, 5, 6]).unwrap();
        let files = vfs.list_files().unwrap();
        let files: Vec<VirtualFile> = serde_wasm_bindgen::from_value(files).unwrap();
        assert_eq!(files.len(), 2);
    }

    #[wasm_bindgen_test]
    fn test_set_and_get_metadata() {
        let mut vfs = VirtualFileSystem::new();
        let file_type = serde_wasm_bindgen::to_value(&FileType::Image).unwrap();
        let id = vfs.create_file("/test".to_string(), "test.jpg".to_string(), file_type, vec![1, 2, 3]).unwrap();
        vfs.set_file_metadata(&id, "author".to_string(), "John Doe".to_string()).unwrap();
        let file = vfs.read_file(&id).unwrap();
        let file: VirtualFile = serde_wasm_bindgen::from_value(file).unwrap();
        assert_eq!(file.metadata.get("author"), Some(&"John Doe".to_string()));
    }
}