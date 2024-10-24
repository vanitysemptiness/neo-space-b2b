// core/file_system.rs
use std::collections::HashMap;
use uuid::Uuid;
use sha2::{Sha256, Digest};
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VirtualFile {
    pub id: String,
    pub name: String,
    pub file_type: SupportedFileType,
    pub size: usize,
    #[serde(skip)]
    pub content: Option<Vec<u8>>,
    pub metadata: HashMap<String, String>,
    pub checksum: String
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum SupportedFileType {
    Image,
    Video,
    Gif,
    CSV,
    Other(String),
}

impl VirtualFile {
    pub fn new(id: String, name: String, file_type: SupportedFileType, content: Vec<u8>) -> Self {
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

pub struct VirtualFileSystem {
    files: HashMap<String, VirtualFile>,
}

impl VirtualFileSystem {
    pub fn new() -> Self {
        VirtualFileSystem {
            files: HashMap::new(),
        }
    }

    pub fn create_file(&mut self, name: String, file_type: SupportedFileType, content: Vec<u8>) -> Result<String, String> {
        let id = Uuid::new_v4().to_string();
        let file = VirtualFile::new(id.clone(), name, file_type, content);
        self.files.insert(id.clone(), file);
        Ok(id)
    }

    pub fn read_file(&self, id: &str) -> Result<&VirtualFile, String> {
        self.files.get(id)
            .ok_or_else(|| "File not found".to_string())
    }

    //TODO: there is a cloned content in here, does it not make sense to use Rc<RefCell<>> here?
    pub fn update_file(&mut self, id: &str, new_content: Option<Vec<u8>>) -> Result<(), String> {
        self.files.get_mut(id)
            .ok_or_else(|| "File not found".to_string())
            .map(|file| {
                if let Some(content) = new_content {
                    let content_clone = content.clone();
                    let size = content.len();
                    file.content = Some(content);
                    file.size = size;
                    file.checksum = VirtualFile::calculate_checksum(&content_clone);
                }
            })
    }

    pub fn delete_file(&mut self, id: &str) -> Result<(), String> {
        self.files.remove(id)
            .map(|_| ())
            .ok_or_else(|| "File not found".to_string())
    }

    pub fn list_files(&self) -> Vec<&VirtualFile> {
        self.files.values().collect()
    }

    pub fn get_file_content(&self, id: &str) -> Result<Vec<u8>, String> {
        self.files.get(id)
            .and_then(|file| file.content.as_ref())
            .cloned()
            .ok_or_else(|| "File content not found".to_string())
    }

    pub fn set_file_metadata(&mut self, id: &str, key: String, value: String) -> Result<(), String> {
        self.files.get_mut(id)
            .ok_or_else(|| "File not found".to_string())
            .map(|file| {
                file.metadata.insert(key, value);
            })
    }

    pub fn get_file_metadata(&self, id: &str, key: &str) -> Result<String, String> {
        self.files.get(id)
            .and_then(|file| file.metadata.get(key))
            .cloned()
            .ok_or_else(|| "Metadata not found".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_and_read_file() {
        let mut vfs = VirtualFileSystem::new();
        let id = vfs.create_file("test.jpg".to_string(), SupportedFileType::Image, vec![1, 2, 3]).unwrap();
        let file = vfs.read_file(&id).unwrap();
        assert_eq!(file.name, "test.jpg");
        assert_eq!(file.size, 3);
    }

    #[test]
    fn test_update_file() {
        let mut vfs = VirtualFileSystem::new();
        let id = vfs.create_file("test.jpg".to_string(), SupportedFileType::Image, vec![1, 2, 3]).unwrap();
        vfs.update_file(&id, Some(vec![4, 5, 6, 7])).unwrap();
        let content = vfs.get_file_content(&id).unwrap();
        assert_eq!(content, vec![4, 5, 6, 7]);
    }

    #[test]
    fn test_delete_file() {
        let mut vfs = VirtualFileSystem::new();
        let id = vfs.create_file("test.jpg".to_string(), SupportedFileType::Image, vec![1, 2, 3]).unwrap();
        vfs.delete_file(&id).unwrap();
        assert!(vfs.read_file(&id).is_err());
    }

    #[test]
    fn test_metadata() {
        let mut vfs = VirtualFileSystem::new();
        let id = vfs.create_file("test.jpg".to_string(), SupportedFileType::Image, vec![1, 2, 3]).unwrap();
        vfs.set_file_metadata(&id, "position".to_string(), "100,100".to_string()).unwrap();
        let position = vfs.get_file_metadata(&id, "position").unwrap();
        assert_eq!(position, "100,100");
    }
}