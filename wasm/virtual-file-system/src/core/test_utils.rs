

// consolidation of error reporting
// T is the type of the successful result
// E is the type of the error
// works for any successful request or error
pub fn assert_ok<T, E: std::fmt::Debug>(result: Result<T, E>, message: &str) -> T {
    match result {
        Ok(value) => value,
        Err(err) => {
            panic!("{}: {:?}", message, err);
        }
    }
}