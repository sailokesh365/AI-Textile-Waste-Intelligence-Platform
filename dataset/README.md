# Textile Waste Datasets

## Overview

This directory contains the datasets used for training, validating, and testing the AI Textile Waste Intelligence Platform.

These datasets will support textile material recognition, fabric classification, waste categorization, and future machine learning model development.

---

## Directory Structure

```
dataset/
│
├── raw/
│   ├── fashion-mnist/
│   ├── deepfashion/
│   └── fabric-images/
│
├── processed/
├── sample_images/
├── metadata/
└── README.md
```

---

## Datasets

### Fashion-MNIST

- Purpose: Clothing image classification
- Status: Integrated

### DeepFashion

- Purpose: Garment and fabric recognition
- Status: Directory prepared for integration

### Fabric Image Dataset

- Purpose: Fabric texture and material classification
- Status: Directory prepared for integration

---

## Data Processing Workflow

1. Collect textile image datasets.
2. Store original files in the `raw` directory.
3. Preprocess and clean the datasets.
4. Save processed datasets in the `processed` directory.
5. Use sample images for testing and validation.
6. Store dataset metadata inside the `metadata` directory.
7. Train and evaluate machine learning models.

---

## Future Scope

The datasets in this directory will be used to implement:

- Fabric Type Classification
- Material Recognition
- Textile Waste Classification
- Recycling Recommendation Engine
- Sustainability Intelligence
- Environmental Impact Analysis

---

## Notes

- Only publicly available datasets will be used.
- Raw datasets will remain unchanged.
- Processed datasets will be generated during preprocessing.
- Additional datasets may be integrated as the project evolves.
