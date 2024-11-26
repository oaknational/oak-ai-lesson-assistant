import pandas as pd

def remove_empty_rows(input_csv, output_csv, column_name):
    # Read the CSV file
    df = pd.read_csv(input_csv)
    
    # Remove rows where the specified column is empty (NaN or empty string)
    df = df[df[column_name].notna() & (df[column_name] != '')]
    
    # Save the cleaned data to a new CSV file
    df.to_csv(output_csv, index=False)
    print(f"Rows with empty '{column_name}' column removed and saved to {output_csv}")

# Example usage
remove_empty_rows('lesson_plan_parts_2.csv', 'lesson_plan_parts_valid.csv', 'subject_id')