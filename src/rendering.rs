use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, Window};
use js_sys::Math;

#[derive(Clone, Copy)]
struct Square {
    start_x: f64,
    start_y: f64,
    width: f64,
    height: f64,
    color: [f64; 4],
}

#[wasm_bindgen]
pub struct Renderer {
    context: CanvasRenderingContext2d,
    canvas: HtmlCanvasElement,
    squares: Vec<Square>,
    grid_size: f64,
    dpr: f64,
}

#[wasm_bindgen]
impl Renderer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Result<Renderer, JsValue> {
        let window = web_sys::window().unwrap();
        let document = window.document().unwrap();
        let canvas = document.get_element_by_id("canvas").unwrap();
        let canvas: HtmlCanvasElement = canvas.dyn_into::<HtmlCanvasElement>()?;
        
        let context = canvas
            .get_context("2d")?
            .unwrap()
            .dyn_into::<CanvasRenderingContext2d>()?;

        let dpr = window.device_pixel_ratio();
        let grid_size = 40.0 * dpr;

        let renderer = Renderer { 
            context, 
            canvas,
            squares: Vec::new(),
            grid_size,
            dpr,
        };
        renderer.resize_canvas(&window);

        Ok(renderer)
    }

    pub fn resize_canvas(&self, window: &Window) {
        let width = window.inner_width().unwrap().as_f64().unwrap();
        let height = window.inner_height().unwrap().as_f64().unwrap();

        self.canvas.set_width((width * self.dpr) as u32);
        self.canvas.set_height((height * self.dpr) as u32);

        self.canvas.style().set_property("width", &format!("{}px", width)).unwrap();
        self.canvas.style().set_property("height", &format!("{}px", height)).unwrap();

        self.context.scale(self.dpr, self.dpr).unwrap();
    }

    pub fn clear(&self) {
        self.context.clear_rect(
            0.0,
            0.0,
            self.canvas.width() as f64,
            self.canvas.height() as f64,
        );
    }

    pub fn add_square(&mut self, start_x: f64, start_y: f64, end_x: f64, end_y: f64) {
        let width = (end_x - start_x).abs();
        let height = (end_y - start_y).abs();
        let color = [
            Math::random(),
            Math::random(),
            Math::random(),
            1.0,
        ];
        let square = Square {
            start_x: start_x.min(end_x),
            start_y: start_y.min(end_y),
            width,
            height,
            color,
        };
        self.squares.push(square);
        self.draw_all_squares();
    }

    pub fn draw_all_squares(&self) {
        self.clear();
        for square in &self.squares {
            self.draw_square(square);
        }
    }

    fn draw_square(&self, square: &Square) {
        self.context.set_fill_style(&JsValue::from_str(&format!(
            "rgba({},{},{},{})",
            (square.color[0] * 255.0) as u8,
            (square.color[1] * 255.0) as u8,
            (square.color[2] * 255.0) as u8,
            square.color[3]
        )));

        self.context.fill_rect(
            square.start_x,
            square.start_y,
            square.width,
            square.height
        );

        // Draw border
        self.context.set_stroke_style(&JsValue::from_str("black"));
        self.context.set_line_width(1.0);
        self.context.stroke_rect(
            square.start_x,
            square.start_y,
            square.width,
            square.height
        );
    }
}