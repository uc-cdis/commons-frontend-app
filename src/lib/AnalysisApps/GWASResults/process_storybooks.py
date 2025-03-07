import os
import fnmatch

def change_file_extensions(root_dir):
    # Walk through all directories and files in the specified root directory
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in fnmatch.filter(filenames, '*.stories.jsx'):
            # Construct the full file path
            old_file_path = os.path.join(dirpath, filename)
            # Create the new file name by replacing the extension
            new_file_name = filename.replace('.stories.jsx', '.oldStories.tsx')
            new_file_path = os.path.join(dirpath, new_file_name)
            # Rename the file
            os.rename(old_file_path, new_file_path)
            print(f'Renamed: {old_file_path} to {new_file_path}')

if __name__ == "__main__":
    # Specify the root directory you want to start from
    root_directory = './'  # Change this to your target directory
    change_file_extensions(root_directory)
