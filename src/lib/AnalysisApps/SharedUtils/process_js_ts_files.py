import os

# Function to process files
def process_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()

        # Remove instances of '*/}'
        content = content.replace('*/}', '')

        # Remove instances of '*/'
        content = content.replace('*/', '')

        # Add block comments at the start and end of the content
        new_content = f'/*\n{content}\n*/'

        # Write the modified content back to the file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(new_content)

        print(f"Processed file: {file_path}")
    except Exception as e:
        print(f"Failed to process {file_path}: {e}")

# Function to recursively walk through a directory
def process_directory(directory):
    # List of file extensions to process
    valid_extensions = {'.tsx', '.ts', '.jsx', '.js'}

    # Walk through the directory
    for root, _, files in os.walk(directory):
        for file in files:
            # Check if the file has a valid extension
            if any(file.endswith(ext) for ext in valid_extensions):
                file_path = os.path.join(root, file)
                process_file(file_path)

# Main function to start processing
if __name__ == "__main__":
    # Provide the directory you want to start processing from
    directory_to_process = input("Enter the directory path to process: ")

    if os.path.isdir(directory_to_process):
        process_directory(directory_to_process)
    else:
        print("Invalid directory path.")
