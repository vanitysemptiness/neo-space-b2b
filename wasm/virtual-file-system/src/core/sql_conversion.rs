use std::collections::HashMap;
use crate::core::types::{SqlStatements, ColumnMetadata, DataType};

struct QueryBuilder {
    query: String,
}

impl QueryBuilder {
    fn new(initial: impl Into<String>) -> Self {
        QueryBuilder {
            query: initial.into()
        }
    }

    fn push(&mut self, sql: impl Into<String>) {
        self.query.push_str(&sql.into());
    }

    fn build(self) -> String {
        self.query
    }
}

pub fn generate_sql_statements(table_name: &str, columns: &HashMap<String, ColumnMetadata>) -> SqlStatements {
    let mut create_builder = QueryBuilder::new(format!("CREATE TABLE {} (\n", table_name));
    
    // For enum columns, we need to create the enum type first
    let mut enum_types = Vec::new();
    for (col_name, meta) in columns.iter() {
        if matches!(meta.data_type, DataType::Enum) {
            let type_name = format!("{}_type", col_name.to_lowercase());
            let values = meta.sample_values.join("', '");
            enum_types.push(format!("CREATE TYPE {} AS ENUM ('{}');\n", type_name, values));
        }
    }
    
    let column_defs: Vec<String> = columns.iter()
        .map(|(name, meta)| {
            let sql_type = match meta.data_type {
                DataType::Enum => format!("{}_type", name.to_lowercase()),
                _ => meta.data_type.to_sql_type().to_string()
            };
            
            format!("    {} {} {}",
                name,
                sql_type,
                if meta.nullable { "NULL" } else { "NOT NULL" }
            )
        })
        .collect();
    
    // Add enum type creations first
    for enum_type in enum_types {
        create_builder.push(&enum_type);
    }
    
    // Add column definitions
    create_builder.push(column_defs.join(",\n"));
    create_builder.push("\n);");
    
    // Generate insert statement template
    let mut insert_builder = QueryBuilder::new(format!("INSERT INTO {} (", table_name));
    
    // Column names
    insert_builder.push(
        columns.keys()
            .map(|k| k.to_string())
            .collect::<Vec<_>>()
            .join(", ")
    );
    
    // Parameters
    insert_builder.push(") VALUES (");
    insert_builder.push(
        (1..=columns.len())
            .map(|i| format!("${}", i))
            .collect::<Vec<_>>()
            .join(", ")
    );
    insert_builder.push(");");

    SqlStatements {
        create_table: create_builder.build(),
        insert_template: insert_builder.build(),
    }
}