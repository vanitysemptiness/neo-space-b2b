use wasm_bindgen::prelude::*;
use serde_wasm_bindgen;
use crate::core::{VirtualFileSystem, SupportedFileType};

#[wasm_bindgen]
pub struct WasmFileSystem {
    inner: VirtualFileSystem
}

#[wasm_bindgen]
impl WasmFileSystem {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        WasmFileSystem {
            inner: VirtualFileSystem::new()
        }
    }

    #[wasm_bindgen]
    pub fn create_file(&mut self, name: String, file_type: JsValue, content: Vec<u8>) -> Result<String, JsValue> {
        let file_type: SupportedFileType = serde_wasm_bindgen::from_value(file_type)?;
        self.inner.create_file(name, file_type, content)
            .map_err(|e| JsValue::from_str(&e))
    }

    #[wasm_bindgen]
    pub fn read_file(&self, id: &str) -> Result<JsValue, JsValue> {
        self.inner.read_file(id)
            .map_err(|e| JsValue::from_str(&e))
            .and_then(|file| serde_wasm_bindgen::to_value(file).map_err(|e| e.into()))
    }

    #[wasm_bindgen]
    pub fn update_file(&mut self, id: &str, new_content: Option<Vec<u8>>) -> Result<(), JsValue> {
        self.inner.update_file(id, new_content)
            .map_err(|e| JsValue::from_str(&e))
    }

    #[wasm_bindgen]
    pub fn delete_file(&mut self, id: &str) -> Result<(), JsValue> {
        self.inner.delete_file(id)
            .map_err(|e| JsValue::from_str(&e))
    }

    #[wasm_bindgen]
    pub fn list_files(&self) -> Result<JsValue, JsValue> {
        let files = self.inner.list_files();
        serde_wasm_bindgen::to_value(&files).map_err(|e| e.into())
    }

    #[wasm_bindgen]
    pub fn get_file_content(&self, id: &str) -> Result<Vec<u8>, JsValue> {
        self.inner.get_file_content(id)
            .map_err(|e| JsValue::from_str(&e))
    }

    #[wasm_bindgen]
    pub fn set_file_metadata(&mut self, id: &str, key: String, value: String) -> Result<(), JsValue> {
        self.inner.set_file_metadata(id, key, value)
            .map_err(|e| JsValue::from_str(&e))
    }

    #[wasm_bindgen]
    pub fn get_file_metadata(&self, id: &str, key: &str) -> Result<JsValue, JsValue> {
        self.inner.get_file_metadata(id, key)
            .map_err(|e| JsValue::from_str(&e))
            .and_then(|value| serde_wasm_bindgen::to_value(&value).map_err(|e| e.into()))
    }
}