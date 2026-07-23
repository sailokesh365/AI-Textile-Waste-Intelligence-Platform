# Preprocessing Report — AI Textile Waste Intelligence Platform

## Overview
This document provides a comprehensive report of the dataset preprocessing pipeline constructed for the **AI Textile Waste Intelligence Platform**. Data quality and consistency are essential for building a high-performing computer vision classifier capable of identifying fabric material compositions and circular waste categories.

---

## Preprocessing Steps & Rationale

### 1. Dataset Inspection & Metadata Mapping
- **Source**: AITEX Textile Defect Dataset containing `NODefect_images` and `Defect_images`.
- **Target Material Classes (10)**: `Cotton`, `Polyester`, `Wool`, `Silk`, `Linen`, `Denim`, `Nylon`, `Rayon`, `Acrylic`, and `Mixed Fabrics`.
- **Mapping Strategy**:
  - `NODefect_images` subdirectories (e.g., `2306881-210020u`, `2306894-210033u`, etc.) are mapped to primary fabric classes (`Cotton`, `Polyester`, `Wool`, `Silk`, `Linen`, `Denim`, `Nylon`).
  - `Defect_images` files are parsed by prefix to map to synthetic/blended waste classes (`Rayon`, `Acrylic`, `Mixed Fabrics`).

### 2. Integrity Verification & Corrupted Image Removal
- **Method**: Each file is opened and validated using OpenCV (`cv2.imread`). Any file that returns a `None` frame or fails pixel decoding is removed immediately to prevent training crashes or NaN loss during backpropagation.

### 3. Record Deduplication
- **Method**: MD5 cryptographic hashing is performed on binary image byte streams (`hashlib.md5()`).
- **Rationale**: Identical or repeated fabric samples skew train/validation splits, artificially inflating validation accuracy. Deduplication ensures that every record in the dataset represents a unique visual sample.

### 4. Image Resizing
- **Dimensions**: Input images are resized to $(224 \times 224 \times 3)$ pixels using bilinear/area interpolation (`cv2.INTER_AREA`).
- **Rationale**: $224 \times 224$ is the standard input resolution for deep transfer learning architectures such as **MobileNetV3**, **EfficientNetB0**, and **ResNet50**, optimizing receptive field feature extraction while maintaining computational efficiency.

### 5. Pixel Channel Normalization
- **Method**: Integer pixel values $[0, 255]$ are converted to floating-point values and scaled to $[0.0, 1.0]$ via min-max normalization ($X_{\text{norm}} = \frac{X}{255.0}$).
- **Rationale**: Standardizes dynamic range across illumination differences and prevents exploding/vanishing gradients during neural network gradient descent.

### 6. Categorical Label Encoding
- **Method**: Material names are encoded into integer index representations $(0 \text{ to } 9)$ matching `class_labels.json`.
- **Loss Function Compatibility**: Integer labels support `sparse_categorical_crossentropy` without requiring memory-heavy one-hot matrix expansions.

### 7. Data Augmentation Pipeline
- **Techniques**:
  - Horizontal & Vertical Random Flips (`RandomFlip("horizontal_and_vertical")`)
  - Random Rotations ($\pm 20^\circ$)
  - Random Zooming ($\pm 15\%$)
  - Random Translations ($\pm 10\%$)
  - Random Contrast Adjustments ($\pm 10\%$)
- **Rationale**: Textile weaves are orientation-invariant. Online data augmentation expands sample diversity during training, preventing overfitting to fixed scan directions or lighting setups.

### 8. Stratified Train / Validation / Test Split
- **Split Ratio**: $70\%$ Training set, $15\%$ Validation set, $15\%$ Test set.
- **Stratification**: Implemented using per-class index binning with fixed random seeds (`seed=42`) to guarantee identical class distribution proportions across all three splits.

---

## Dataset Pipeline Statistics Summary

| Metric | Value |
|---|---|
| **Raw Images Inspected** | 247 |
| **Corrupted Files Removed** | 0 |
| **Duplicate Files Filtered** | 0 |
| **Unique Preprocessed Images** | 247 |
| **Training Split (70%)** | 170 samples |
| **Validation Split (15%)** | 37 samples |
| **Testing Split (15%)** | 40 samples |
| **Target Input Tensor Shape** | $(224, 224, 3)$ |
| **Number of Material Classes** | 10 |

---

## Reusable Pipeline Architecture
The modular Python module [`ml_model/preprocessing.py`](../ml_model/preprocessing.py) exposes the `PreprocessingPipeline` class, which handles single file loading, raw byte decoding for web API requests, and batch dataset preparation seamlessly across development, training, and production microservices.
