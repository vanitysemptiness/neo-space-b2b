use std::collections::HashMap;

const MIN_CATEGORY_SIZE_RATIO: f64 = 0.02;  // Min 5% of values to consider a category
const MIN_TOTAL_VALUES: usize = 10;          // Minimum values needed for statistical analysis
const MAX_CATEGORIES: usize = 20;            // Maximum reasonable number of categories
const CONFIDENCE_THRESHOLD: f64 = 0.7;       // Threshold for categorical determination

#[derive(Debug, Clone)]
pub struct DistributionAnalysis {
    pub is_categorical: bool,
    pub category_count: usize,
    pub confidence_score: f64,
    pub debug_info: DebugInfo,
}

#[derive(Debug, Clone)]
pub struct DebugInfo {
    pub unique_ratio: f64,
    pub repeat_ratio: f64,
    pub distribution_score: f64,
    pub entropy: f64,
    pub value_frequencies: HashMap<String, usize>,
}

pub struct QuickCheck {
    pub should_analyze: bool,
    pub frequencies: HashMap<String, usize>,
    pub total_count: usize,
}

pub fn quick_frequency_check(values: &[String]) -> QuickCheck {
    let mut frequencies = HashMap::new();
    let total_count = values.len();
    
    // Early exit conditions
    if total_count < MIN_TOTAL_VALUES {
        return QuickCheck {
            should_analyze: false,
            frequencies,
            total_count,
        };
    }
    
    // Calculate frequencies
    for value in values {
        *frequencies.entry(value.clone()).or_insert(0) += 1;
    }
    
    // Quick validation checks
    let unique_count = frequencies.len();
    if unique_count == total_count || unique_count > MAX_CATEGORIES {
        return QuickCheck {
            should_analyze: false,
            frequencies,
            total_count,
        };
    }
    
    // Check if any category has significant representation
    let min_category_size = (total_count as f64 * MIN_CATEGORY_SIZE_RATIO) as usize;
    let has_significant_categories = frequencies.values()
        .any(|&count| count >= min_category_size);
    
    QuickCheck {
        should_analyze: has_significant_categories,
        frequencies,
        total_count,
    }
}

pub fn analyze_distribution(values: &[String]) -> DistributionAnalysis {
    let quick_check = quick_frequency_check(values);
    
    if !quick_check.should_analyze {
        return create_analysis(
            false,
            0.0,
            quick_check.frequencies.len(),
            quick_check.frequencies,
            quick_check.total_count
        );
    }

    let frequencies = quick_check.frequencies;
    let total_count = quick_check.total_count;
    let unique_count = frequencies.len();

    // Special case for small sets with clear categories
    if unique_count <= 8 && total_count >= MIN_TOTAL_VALUES {
        let min_category_size = total_count as f64 * MIN_CATEGORY_SIZE_RATIO;
        let all_categories_significant = frequencies.values()
            .all(|&count| count as f64 >= min_category_size);
            
        if all_categories_significant {
            // console::log_1(&"Found small but significant categorical set".into());
            return create_analysis(true, 1.0, unique_count, frequencies, total_count);
        }
    }

    let repeat_ratio = calculate_repeat_ratio(&frequencies, total_count);
    let distribution_score = calculate_distribution_score(&frequencies, total_count);
    let entropy = calculate_entropy(&frequencies, total_count);
    
    let confidence_score = calculate_confidence_score(
        unique_count,
        total_count,
        repeat_ratio,
        distribution_score,
        entropy
    );

    create_analysis(
        confidence_score > CONFIDENCE_THRESHOLD,
        confidence_score,
        unique_count,
        frequencies,
        total_count
    )
}

fn calculate_repeat_ratio(frequencies: &HashMap<String, usize>, total_count: usize) -> f64 {
    let repeating_values = frequencies.values()
        .filter(|&&count| count > 1)
        .sum::<usize>();
    
    repeating_values as f64 / total_count as f64
}

fn calculate_distribution_score(frequencies: &HashMap<String, usize>, total_count: usize) -> f64 {
    let expected_per_category = total_count as f64 / frequencies.len() as f64;
    
    let variance_sum: f64 = frequencies.values()
        .map(|&count| {
            let diff = count as f64 - expected_per_category;
            (diff * diff) / expected_per_category
        })
        .sum();
    
    1.0 / (1.0 + (-variance_sum / frequencies.len() as f64).exp())
}

fn calculate_entropy(frequencies: &HashMap<String, usize>, total_count: usize) -> f64 {
    -frequencies.values()
        .map(|&count| {
            let p = count as f64 / total_count as f64;
            if p > 0.0 { p * p.ln() } else { 0.0 }
        })
        .sum::<f64>()
}

fn calculate_confidence_score(
    unique_count: usize,
    total_count: usize,
    repeat_ratio: f64,
    distribution_score: f64,
    entropy: f64,
) -> f64 {
    let mut score = 0.0;
    
    // Factor 1: Category stability (0.4 weight)
    // For categorical data, categories shouldn't grow with data size
    let category_ratio = unique_count as f64 / (total_count as f64).sqrt();
    score += 0.4 * (1.0 / (1.0 + category_ratio));
    
    // Factor 2: Repeat ratio (0.4 weight)
    // Most important - categorical data should have lots of repeats
    score += 0.4 * repeat_ratio;
    
    // Factor 3: Category utilization (0.2 weight)
    // All categories should be used somewhat, but don't need to be even
    let min_usage = MIN_CATEGORY_SIZE_RATIO;
    let categories_well_used = entropy / unique_count as f64;
    score += 0.2 * categories_well_used.min(1.0);
    
    // Bonus for ideal category count range (like Pokemon's 18 types)
    if (5..=25).contains(&unique_count) && repeat_ratio > 0.5 {
        score += 0.1;
    }
    
    score.min(1.0).max(0.0)
}

fn create_analysis(
    is_categorical: bool,
    confidence_score: f64,
    category_count: usize,
    frequencies: HashMap<String, usize>,
    total_count: usize,
) -> DistributionAnalysis {
    let unique_ratio = category_count as f64 / total_count as f64;
    let repeat_ratio = calculate_repeat_ratio(&frequencies, total_count);
    let distribution_score = calculate_distribution_score(&frequencies, total_count);
    let entropy = calculate_entropy(&frequencies, total_count);

    // console::log_1(&format!(
    //     "Distribution Analysis:
    //     Categories: {}
    //     Total Values: {}
    //     Unique Ratio: {:.3}
    //     Repeat Ratio: {:.3}
    //     Distribution Score: {:.3}
    //     Entropy: {:.3}
    //     Confidence: {:.3}
    //     Is Categorical: {}",
    //     category_count,
    //     total_count,
    //     unique_ratio,
    //     repeat_ratio,
    //     distribution_score,
    //     entropy,
    //     confidence_score,
    //     is_categorical
    // ).into());

    DistributionAnalysis {
        is_categorical,
        category_count,
        confidence_score,
        debug_info: DebugInfo {
            unique_ratio,
            repeat_ratio,
            distribution_score,
            entropy,
            value_frequencies: frequencies,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_categorical_detection() {
        // Test Pokemon generations (should be categorical)
        let generations: Vec<String> = vec![
            "1", "1", "1", "2", "2", "2", "3", "3", "3", "4", "4", "5", "5", "6", "6", "7", "7"
        ].iter().map(|s| s.to_string()).collect();

        let analysis = analyze_distribution(&generations);
        assert!(analysis.is_categorical);
        assert!(analysis.category_count < 8);

        // Test Pokemon stats (should not be categorical)
        let stats: Vec<String> = vec![
            "45", "50", "65", "70", "80", "85", "90", "95", "100", "110", "120", "130"
        ].iter().map(|s| s.to_string()).collect();

        let analysis = analyze_distribution(&stats);
        assert!(!analysis.is_categorical);

        // Test Pokemon types (should be categorical)
        let types: Vec<String> = vec![
            "Fire", "Fire", "Water", "Water", "Grass", "Grass",
            "Electric", "Electric", "Psychic", "Psychic"
        ].iter().map(|s| s.to_string()).collect();

        let analysis = analyze_distribution(&types);
        assert!(analysis.is_categorical);
        assert!(analysis.category_count < 10);
    }

    #[test]
    fn test_edge_cases() {
        // Test single value
        let single = vec!["value".to_string()];
        let analysis = analyze_distribution(&single);
        assert!(!analysis.is_categorical);

        // Test all unique values
        let unique: Vec<String> = (0..20)
            .map(|i| i.to_string())
            .collect();
        let analysis = analyze_distribution(&unique);
        assert!(!analysis.is_categorical);

        // Test boolean-like values (should be categorical)
        let boolean: Vec<String> = vec![
            "true", "false", "true", "false", "true",
            "false", "true", "false", "true", "false"
        ].iter().map(|s| s.to_string()).collect();
        let analysis = analyze_distribution(&boolean);
        assert!(analysis.is_categorical);
    }

    #[test]
    fn test_pokemon_types() {
        // Read and parse the Pokemon CSV
        const pokemon_data: &[u8] = include_bytes!("../../../../datasets/pokemon.csv");
        let mut rdr = csv::ReaderBuilder::new()
            .has_headers(true)
            .from_reader(&pokemon_data[..]);
        
        // Extract Type 1 column
        let type_1: Vec<String> = rdr.records()
            .filter_map(|result| result.ok())
            .filter_map(|record| record.get(2).map(String::from))  // Assuming "Type 1" is the 3rd column
            .collect();
    
        let analysis = analyze_distribution(&type_1);
        
        println!("\nPokemon Type 1 Analysis Debug:");
        println!("Total pokemon: {}", type_1.len());
        println!("Unique types: {}", analysis.category_count);
        println!("Confidence score: {:.3}", analysis.confidence_score);
        println!("Distribution score: {:.3}", analysis.debug_info.distribution_score);
        println!("Entropy: {:.3}", analysis.debug_info.entropy);
        println!("Repeat ratio: {:.3}", analysis.debug_info.repeat_ratio);
        
        println!("\nType 1 Frequencies:");
        let mut frequencies: Vec<_> = analysis.debug_info.value_frequencies.iter().collect();
        frequencies.sort_by(|a, b| b.1.cmp(a.1));
        for (type_name, count) in frequencies {
            println!("{}: {} occurrences ({:.1}%)", 
                type_name, 
                count, 
                (*count as f64 / type_1.len() as f64) * 100.0
            );
        }
    
        assert!(
            analysis.is_categorical,
            "Pokemon types should be categorical!\nConfidence Score: {}\nCategory Count: {}\nEntropy: {}", 
            analysis.confidence_score,
            analysis.category_count,
            analysis.debug_info.entropy
        );
        
        // Verify expected properties
        assert!(analysis.category_count > 10, "Should find at least 10 Pokemon types");
        assert!(analysis.category_count < 20, "Should find less than 20 Pokemon types");
        assert!(analysis.confidence_score > CONFIDENCE_THRESHOLD, 
            "Confidence score {} should exceed threshold {}", 
            analysis.confidence_score, CONFIDENCE_THRESHOLD
        );
    }
}