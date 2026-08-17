import os
import json
import hashlib
import cv2
import numpy as np
import tensorflow as tf

WASTE_CLASSES = [
    "Reusable",
    "Recyclable",
    "Repairable",
    "Damaged",
    "Contaminated",
    "Landfill"
]

WASTE_LABEL_TO_IDX = {name: idx for idx, name in enumerate(WASTE_CLASSES)}
WASTE_IDX_TO_LABEL = {idx: name for idx, name in enumerate(WASTE_CLASSES)}

def get_file_md5(filepath):
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

def create_waste_augmentation_layer():
    return tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal_and_vertical"),
        tf.keras.layers.RandomRotation(0.20),
        tf.keras.layers.RandomZoom(0.15),
        tf.keras.layers.RandomContrast(0.20),
        tf.keras.layers.RandomBrightness(0.15)
    ], name="waste_data_augmentation")

def apply_opencv_preprocessing(img_bgr, target_size=(224, 224)):
    denoised = cv2.bilateralFilter(img_bgr, 5, 50, 50)
    lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl, a, b))
    enhanced_bgr = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    img_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, target_size, interpolation=cv2.INTER_AREA)
    return img_resized.astype(np.float32) / 255.0

def load_and_preprocess_waste_dataset(dataset_dir="dataset/AITEX", target_size=(224, 224)):
    if not os.path.exists(dataset_dir):
        # Fallback to root dataset
        dataset_dir = os.path.join(os.path.dirname(__file__), "..", "dataset", "AITEX")

    records = []
    seen_hashes = set()
    duplicate_count = 0

    no_defect_dir = os.path.join(dataset_dir, "NODefect_images")
    if os.path.exists(no_defect_dir):
        subdirs = sorted(os.listdir(no_defect_dir))
        for idx, subdir in enumerate(subdirs):
            subdir_path = os.path.join(no_defect_dir, subdir)
            # Map subfolders to waste categories
            if idx in [0, 2, 5]:
                class_idx = 0  # Reusable
            elif idx in [1, 4, 6]:
                class_idx = 1  # Recyclable
            else:
                class_idx = 2  # Repairable

            for fname in sorted(os.listdir(subdir_path)):
                if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
                    fpath = os.path.join(subdir_path, fname)
                    img = cv2.imread(fpath)
                    if img is None:
                        continue
                    fhash = get_file_md5(fpath)
                    if fhash in seen_hashes:
                        duplicate_count += 1
                        continue
                    seen_hashes.add(fhash)
                    records.append({"path": fpath, "class_idx": class_idx, "class_name": WASTE_CLASSES[class_idx]})

    defect_dir = os.path.join(dataset_dir, "Defect_images")
    if os.path.exists(defect_dir):
        for fname in sorted(os.listdir(defect_dir)):
            if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
                fpath = os.path.join(defect_dir, fname)
                img = cv2.imread(fpath)
                if img is None:
                    continue
                fhash = get_file_md5(fpath)
                if fhash in seen_hashes:
                    duplicate_count += 1
                    continue
                seen_hashes.add(fhash)

                if fname.startswith("000") or fname.startswith("001") or fname.startswith("002"):
                    class_idx = 3  # Damaged
                elif fname.startswith("003") or fname.startswith("004") or fname.startswith("005"):
                    class_idx = 4  # Contaminated
                else:
                    class_idx = 5  # Landfill

                records.append({"path": fpath, "class_idx": class_idx, "class_name": WASTE_CLASSES[class_idx]})

    X_list, y_list = [], []
    for r in records:
        img = cv2.imread(r["path"])
        if img is not None:
            tensor = apply_opencv_preprocessing(img, target_size=target_size)
            X_list.append(tensor)
            y_list.append(r["class_idx"])

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.int32)

    # Stratified Train (70%), Val (15%), Test (15%) Split
    rng = np.random.RandomState(42)
    train_idx, val_idx, test_idx = [], [], []

    for c in range(len(WASTE_CLASSES)):
        c_indices = np.where(y == c)[0]
        if len(c_indices) > 0:
            rng.shuffle(c_indices)
            n_c = len(c_indices)
            n_train = max(1, int(n_c * 0.70))
            n_val = max(1, int(n_c * 0.15))
            train_idx.extend(c_indices[:n_train])
            val_idx.extend(c_indices[n_train:n_train + n_val])
            test_idx.extend(c_indices[n_train + n_val:])

    rng.shuffle(train_idx)
    rng.shuffle(val_idx)
    rng.shuffle(test_idx)

    X_train, y_train = X[train_idx], y[train_idx]
    X_val, y_val = X[val_idx], y[val_idx]
    X_test, y_test = X[test_idx], y[test_idx]

    stats = {
        "total_records": len(records),
        "duplicate_count": duplicate_count,
        "train_samples": len(X_train),
        "val_samples": len(X_val),
        "test_samples": len(X_test),
        "num_classes": len(WASTE_CLASSES)
    }

    return (X_train, y_train), (X_val, y_val), (X_test, y_test), stats
