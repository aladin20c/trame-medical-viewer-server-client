import os
import re
import itk


def read_dicom_study(base_dir):
    """
    Read DICOM study from the specific folder structure.
    
    Args:
        base_dir: Path to the directory containing study folders
        
    Returns:
        tuple: (image_data, spacing, dimensions, study_info)
    """
    
    print(f"[DICOM Reader] Reading from: {base_dir}")
    
    # Find all study folders (subdirectories with timestamps)
    study_folders = []
    for item in os.listdir(base_dir):
        item_path = os.path.join(base_dir, item)
        if os.path.isdir(item_path):
            # Check if it matches your naming pattern (contains 14-digit timestamp)
            if re.search(r'\d{14}', item):
                study_folders.append(item_path)
    
    if not study_folders:
        raise RuntimeError(f"No DICOM study folders found in {base_dir}")
    
    print(f"[DICOM Reader] Found {len(study_folders)} study folders")
    for folder in study_folders:
        print(f"  - {os.path.basename(folder)}")
    
    # Use the first study folder (or you could add logic to select specific one)
    selected_study = study_folders[0]
    study_name = os.path.basename(selected_study)
    print(f"[DICOM Reader] Selected study: {study_name}")
    
    # Find all DICOM files in the study folder
    dicom_files = []
    for file in os.listdir(selected_study):
        file_path = os.path.join(selected_study, file)
        if os.path.isfile(file_path):
            # Exclude 'info' file and any other non-DICOM files
            if 'info' not in file.lower():
                dicom_files.append(file_path)
    
    if not dicom_files:
        raise RuntimeError(f"No DICOM files found in {selected_study}")
    
    # Sort files by timestamp in filename (your specific format)
    def extract_timestamp(filename):
        match = re.search(r'(\d{14})', filename)
        return match.group(1) if match else '0'
    
    dicom_files.sort(key=extract_timestamp)
    
    print(f"[DICOM Reader] Found {len(dicom_files)} DICOM files")
    for f in dicom_files[:3]:
        print(f"  - {os.path.basename(f)}")
    if len(dicom_files) > 3:
        print(f"  ... and {len(dicom_files) - 3} more files")
    
    # Try ITK's automatic series detection first
    try:
        names_generator = itk.GDCMSeriesFileNames.New()
        names_generator.SetDirectory(selected_study)
        
        series_ids = names_generator.GetSeriesUIDs()
        if len(series_ids) > 0:
            print(f"[DICOM Reader] ITK detected {len(series_ids)} series")
            # Use the largest series
            largest_series = max(series_ids, key=lambda uid: len(names_generator.GetFileNames(uid)))
            dicom_files = names_generator.GetFileNames(largest_series)
            print(f"[DICOM Reader] Using largest series: {len(dicom_files)} files")
    except:
        print("[DICOM Reader] ITK detection failed, using manual file list")
    
    # Read the DICOM series
    PixelType = itk.ctype('float')
    ImageType = itk.Image[PixelType, 3]
    reader = itk.ImageSeriesReader[ImageType].New()
    reader.SetFileNames(dicom_files)
    
    print("[DICOM Reader] Loading volume...")
    reader.Update()
    image = reader.GetOutput()
    print("[DICOM Reader] Volume loaded successfully")
    
    # Extract metadata
    volume_array = itk.array_from_image(image)
    num_slices, rows, cols = volume_array.shape
    spacing = image.GetSpacing()
    lo, hi = float(volume_array.min()), float(volume_array.max())
    
    # Build study info dictionary
    study_info = {
        'study_name': study_name,
        'study_path': selected_study,
        'dimensions': (cols, rows, num_slices),
        'spacing': spacing,
        'range': (lo, hi),
        'num_files': len(dicom_files),
        'file_list': dicom_files
    }
    
    # Print summary
    print("=" * 50)
    print(f"[DICOM Reader] Study Summary:")
    print(f"  Study: {study_name}")
    print(f"  Dimensions: {cols} × {rows} × {num_slices}")
    print(f"  Spacing: {spacing[0]:.2f} × {spacing[1]:.2f} × {spacing[2]:.2f} mm")
    print(f"  Range: {lo:.1f} → {hi:.1f}")
    print(f"  Files: {len(dicom_files)}")
    print("=" * 50)
    
    return image, volume_array, study_info