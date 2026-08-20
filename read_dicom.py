import os
import re
import itk
import numpy as np


def read_dicom_study(base_dir):
    """
    Read a DICOM volume from the given directory, handling flat or nested folders.

    - If DICOM files are directly inside `base_dir`, that series is used.
    - If `base_dir` contains subfolders (optionally with timestamp names), the function scans
      each subfolder and picks the one with the most DICOM files (largest series).
    - In each subfolder, ITK's GDCMSeriesFileNames discovers all series and selects the largest.

    Args:
        base_dir (str): Path to the directory containing DICOM files or study subfolders.

    Returns:
        tuple: (image, volume_array, study_info)
            - image: ITK image object (itk.Image[float, 3])
            - volume_array: 3D numpy array of shape (num_slices, rows, cols)
            - study_info: dict with keys:
                'directory', 'series_uid', 'num_slices', 'dimensions' (cols, rows, slices),
                'spacing' (x, y, z in mm), 'range' (min, max), 'file_list'

    Raises:
        RuntimeError: If no DICOM series is found anywhere.
    """
    print(f"[DICOM Reader] Reading from: {base_dir}")

    # ------------------------------------------------------------------
    # Helper: find the largest series (by file count) inside a given folder
    # ------------------------------------------------------------------
    def _get_largest_series(folder):
        names_generator = itk.GDCMSeriesFileNames.New()
        names_generator.SetUseSeriesDetails(True)
        names_generator.SetDirectory(folder)
        series_uids = names_generator.GetSeriesUIDs()
        if not series_uids:
            return None, None
        # Pick the series with the most files
        largest_uid = max(series_uids,
                          key=lambda uid: len(names_generator.GetFileNames(uid)))
        file_list = names_generator.GetFileNames(largest_uid)
        return largest_uid, file_list

    # ------------------------------------------------------------------
    # 1. Try the base directory directly (flat case)
    # ------------------------------------------------------------------
    series_uid, file_list = _get_largest_series(base_dir)
    selected_dir = base_dir

    # ------------------------------------------------------------------
    # 2. If nothing found, scan immediate subdirectories.
    #    To mimic your original timestamp pattern, we first look for
    #    folders matching a 14‑digit timestamp, then fall back to all.
    # ------------------------------------------------------------------
    if not file_list:
        print("[DICOM Reader] No series in base directory – scanning subfolders...")

        timestamp_pattern = re.compile(r'\d{14}')  # optional pattern filter
        candidates = []

        for item in os.listdir(base_dir):
            sub_path = os.path.join(base_dir, item)
            if not os.path.isdir(sub_path):
                continue
            # If you want to restrict to timestamp‑named folders, uncomment the next line:
            # if not timestamp_pattern.search(item):
            #     continue
            uid, files = _get_largest_series(sub_path)
            if files:
                candidates.append((sub_path, uid, files))

        # Fallback: scan all subfolders without timestamp filter
        if not candidates:
            for item in os.listdir(base_dir):
                sub_path = os.path.join(base_dir, item)
                if os.path.isdir(sub_path):
                    uid, files = _get_largest_series(sub_path)
                    if files:
                        candidates.append((sub_path, uid, files))

        if not candidates:
            raise RuntimeError(f"No DICOM series found in {base_dir} or its subdirectories.")

        # Select the subfolder with the most DICOM files (largest series overall)
        selected_dir, series_uid, file_list = max(candidates, key=lambda x: len(x[2]))
        print(f"[DICOM Reader] Selected study folder: {os.path.basename(selected_dir)} "
              f"with {len(file_list)} files")
    else:
        print(f"[DICOM Reader] Using series directly from base directory ({len(file_list)} files)")

    # ------------------------------------------------------------------
    # 3. Read the selected series with ITK
    # ------------------------------------------------------------------
    PixelType = itk.ctype('float')
    ImageType = itk.Image[PixelType, 3]
    reader = itk.ImageSeriesReader[ImageType].New()
    reader.SetFileNames(file_list)

    print("[DICOM Reader] Loading volume...")
    reader.Update()
    image = reader.GetOutput()              # ITK image object
    print("[DICOM Reader] Volume loaded successfully")

    # ------------------------------------------------------------------
    # 4. Extract data and metadata
    # ------------------------------------------------------------------
    volume_array = itk.array_from_image(image)          # shape: (z, y, x)
    num_slices, rows, cols = volume_array.shape
    spacing = image.GetSpacing()                        # (x, y, z) spacing
    lo, hi = float(volume_array.min()), float(volume_array.max())

    dimensions = (cols, rows, num_slices)

    study_info = {
        'directory': selected_dir,
        'series_uid': series_uid,
        'num_slices': num_slices,
        'dimensions': dimensions,
        'spacing': spacing,
        'range': (lo, hi),
        'file_list': file_list
    }

    # ------------------------------------------------------------------
    # 5. Summary
    # ------------------------------------------------------------------
    print("=" * 50)
    print(f"[DICOM Reader] Study Summary:")
    print(f"  Directory : {selected_dir}")
    print(f"  Series UID: {series_uid[:20]}..." if series_uid else "  Series UID: N/A")
    print(f"  Dimensions: {cols} × {rows} × {num_slices}")
    print(f"  Spacing   : {spacing[0]:.2f} × {spacing[1]:.2f} × {spacing[2]:.2f} mm")
    print(f"  Range     : {lo:.1f} → {hi:.1f}")
    print(f"  Files     : {len(file_list)}")
    print("=" * 50)

    # Return exactly what your setup_vtk expects:
    return image, volume_array, study_info