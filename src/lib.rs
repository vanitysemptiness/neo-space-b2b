use rendering::Renderer;
use wasm_bindgen::prelude::*;

mod rendering;


#[wasm_bindgen(start)]
pub fn start() -> Result<(), JsValue> {
    // let renderer = Renderer::new()?;
    Ok(())
}