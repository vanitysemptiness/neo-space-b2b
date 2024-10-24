use std::collections::HashMap;

pub struct FileMetadata {
    pub row_count: usize,
    pub column_count: usize,
    pub missing_values: usize,
    pub zero_values: usize,
    pub column_types: HashMap<String, String>,
}

impl FileMetadata {
    pub fn analyze_csv(content: &str) -> Result<Self, String> {
        let mut lines = content.lines();
        let header = lines.next().ok_or_else(|| "Empty CSV".to_string())?;
        let columns: Vec<&str> = header.split(',').collect();
        let column_count = columns.len();
        
        let mut row_count = 0;
        let mut missing_values = 0;
        let mut zero_values = 0;
        let mut column_types = HashMap::new();
        
        for line in lines {
            row_count += 1;
            let values: Vec<&str> = line.split(',').collect();
            
            for (i, value) in values.iter().enumerate() {
                if value.trim().is_empty() {
                    missing_values += 1;
                } else if value.trim() == "0" {
                    zero_values += 1;
                }
                
                if row_count == 1 {
                    let col_name = columns[i];
                    let data_type = if value.parse::<i64>().is_ok() {
                        "Integer"
                    } else if value.parse::<f64>().is_ok() {
                        "Float"
                    } else {
                        "Text"
                    };
                    column_types.insert(col_name.to_string(), data_type.to_string());
                }
            }
        }
        
        Ok(FileMetadata {
            row_count,
            column_count,
            missing_values,
            zero_values,
            column_types,
        })
    }
}