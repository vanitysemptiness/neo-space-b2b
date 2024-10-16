


use wasm_bindgen::prelude::*;

/* 
    Rust is null safe when you use Option<whatever_type>
    It's wrapped and you extract the value or get an error, not a null pointer.

    Above Result is used for operations that might fail
    () is like void in java, not returning any value.
    JsValue is a type from wasm_bindgen that represents a JavaScript value
    Result<(), JsValue> means the function will either return successfully with 
        no value (Ok(())), or fail with a JavaScript value (Err(JsValue))

    #[wasm_bindgen(start)] compiles the code to webassembly
*/ 
#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> { // 
    // window is the global window obj of webpage, .expect accesses whats in the Option
    let window = web_sys::window().expect("no global window... so creating one");
    // representation of the Domain Object Model of the webpage, 
    let document = window.document().expect("should have a doc window");
    // this is the <body> element of the webpage
    let body = document.body().expect("doc body");
    // create paragraph element in html <p>, ? is error propagation if create fails
    let val = document.create_element("p")?;
    // inserts this text in the above paragraph element
    val.set_inner_html("Hello from rust WebAssembly");
    // pass a reference to val to body to add it to html body
    body.append_child(&val)?;
    // returns in rust do not require a ;
    Ok(())
}
