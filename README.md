# AI Textile Waste Intelligence Platform

## 📌 Current Project Status

| Milestone | Status |
|-----------|--------|
| ✅ Milestone 1 – Project Setup & Inventory Management | Completed |
| 🚀 Milestone 2 – AI Material Classification & Waste Analysis | In Progress / Completed |
| ⏳ Milestone 3 – Advanced AI Analytics & Deployment | Planned |

---

# 🌍 Project Overview

The **AI Textile Waste Intelligence Platform** is an enterprise-grade full-stack Artificial Intelligence application developed to automate textile waste classification, fabric material recognition, waste categorization, recyclability assessment, and intelligent inventory management.

The platform combines **React.js**, **Node.js**, **MongoDB**, **Python**, **TensorFlow**, and **FastAPI** to create an end-to-end intelligent textile waste management system.

---

# 🎯 Milestone 1 Features (Completed)

### 🔐 User Authentication
- User Registration
- User Login
- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes

### 🗄 Database Integration
- MongoDB Connection
- User Database
- Inventory Database
- Image Metadata Storage

### 📦 Textile Inventory Management
- Register New Textile Waste Batch
- Edit Existing Batch
- Delete Batch
- Search Inventory
- Filter Inventory
- Inventory Statistics Dashboard

### 🌐 Backend Development
- REST API Development
- Express.js Server
- MongoDB Integration
- Controllers
- Routes
- Middleware
- Services

### 💻 Frontend Development
- Landing Page
- Login & Registration Pages
- Inventory Management Page
- Dashboard
- Responsive Navigation
- React Routing

---

# 🚀 Milestone 2 Features

- Textile Image Upload
- Image Preprocessing
- Exploratory Data Analysis (EDA)
- Dataset Cleaning
- Model Training
- Model Evaluation
- TensorFlow Model Saving
- FastAPI AI Microservice
- Material Classification
- Waste Categorization
- Recyclability Assessment
- Backend AI Integration
- Frontend Prediction Interface
- AI Analytics Dashboard

---

---

## 🏗️ System Architecture

```
                                    +-----------------------+
                                    |   React 19 Frontend   |
                                    | (Vite + Tailwind CSS) |
                                    +-----------+-----------+
                                                |
                                      HTTP / REST API Calls
                                                |
                                    +-----------v-----------+
                                    | Node.js / Express API |
                                    |     Authentication    |
                                    +-----------+-----------+
                                                |
                                         FastAPI AI Proxy
                                                |
                                    +-----------v-----------+
                                    | FastAPI Microservice  |
                                    | (TensorFlow / Keras)  |
                                    +-----------------------+
```

---

## 📁 Project Folder Structure

```
AI-Textile-Waste-Intelligence-Platform/
├── dataset/                    # Textile Dataset (AITEX Weave & Defect Database)
│   ├── AITEX/                  # Raw NODefect_images and Defect_images
│   ├── processed/              # Processed tensor cache
│   └── metadata/               # Dataset index metadata
├── docs/                       # Project Documentation & Milestone Reports
│   ├── eda/                    # Generated EDA & Evaluation Plots
│   │   ├── class_distribution.png
│   │   ├── pixel_distribution.png
│   │   ├── color_distribution.png
│   │   ├── resolution_distribution.png
│   │   ├── sample_images.png
│   │   ├── outlier_analysis.png
│   │   ├── training_curves.png
│   │   ├── confusion_matrix.png
│   │   ├── roc_curve.png
│   │   └── prediction_examples.png
│   ├── EDA_Report.md           # Full Exploratory Data Analysis Report
│   ├── preprocessing_report.md # Data Preprocessing Report
│   ├── training_report.md      # Model Benchmarking & Training Report
│   └── evaluation_report.md    # Model Evaluation & Metrics Report
├── models/                     # Saved Model Artifacts for Deployment
│   ├── textile_model.keras     # Primary trained TensorFlow model
│   ├── model_weights.weights.h5# Extracted model weights
│   ├── class_labels.json       # Index-to-label map
│   └── prediction_config.json  # Input dimensions & confidence thresholds
├── ml_model/                   # Machine Learning Source Code
│   ├── preprocessing.py        # Reusable data loading, cleaning & split pipeline
│   ├── eda_analysis.py         # Automated EDA script
│   ├── train.py                # Transfer Learning auto-selection trainer
│   ├── evaluate.py             # Evaluation & confusion matrix generator
│   ├── inference_pipeline.py   # Standalone Python inference module
│   ├── predictor.py            # Microservice prediction handler
│   ├── main.py                 # FastAPI microservice server
│   ├── run_pipeline.py         # Master pipeline runner script
│   └── requirements.txt        # Python ML dependencies
├── backend/                    # Node.js + Express REST API Server
│   ├── controllers/            # Predict, Upload, History, Classification controllers
│   ├── routes/                 # API endpoint routing (/api/predict, /api/upload, /api/history)
│   ├── services/               # AI proxy microservice client & local fallback
│   ├── models/                 # Mongoose schemas (User, UploadedImage, MaterialClassification)
│   └── server.js               # Main Express app
└── frontend/                   # React 19 Frontend Web Client
    ├── src/
    │   ├── Analysis/           # ImageAnalysisPage, AnalysisResultCard, HistoryPage
    │   ├── Authentication/     # Login, Register, Profile, AuthContext
    │   ├── Dashboard/          # Analytics & Circular Stats Dashboard
    │   ├── Inventory/          # Batch Inventory Ledger
    │   └── Shared/             # Navbar, Footer, Axios Instance
    └── package.json            # Frontend dependencies
```

---

## 📊 Dataset Information

- **Dataset Source**: AITEX Textile Defect Database (10 Mapped Material Classes).
- **Total Images**: 247 unique high-resolution fabric scans.
- **Classes**: `Cotton`, `Polyester`, `Wool`, `Silk`, `Linen`, `Denim`, `Nylon`, `Rayon`, `Acrylic`, `Mixed Fabrics`.
- **Integrity**: Verified 0 corrupted files and 0 binary duplicate files via MD5 checksum hashing.

---

## 🔄 Preprocessing Pipeline

The reusable preprocessing pipeline (`ml_model/preprocessing.py`) executes:
1. **Integrity Validation**: Filters out unreadable images using OpenCV decoding.
2. **Deduplication**: MD5 hashing to prevent data leakage between splits.
3. **Resizing**: Scaled to $(224 \times 224 \times 3)$ for transfer learning model input.
4. **Channel Normalization**: Min-Max scaling to $[0.0, 1.0]$.
5. **Categorical Label Encoding**: Maps material names to integer indices $(0 - 9)$.
6. **Data Augmentation**: Random horizontal/vertical flips, rotations ($\pm 20^\circ$), zoom ($\pm 15\%$), and contrast transforms.
7. **Stratified Splitting**: 70% Training, 15% Validation, and 15% Testing.

---

## 📈 Exploratory Data Analysis (EDA) Summary

All graphs are saved in `docs/eda/`:
- **`class_distribution.png`**: Class frequency breakdown across 10 classes.
- **`pixel_distribution.png`**: Grayscale intensity distribution.
- **`color_distribution.png`**: RGB channel density profiles.
- **`resolution_distribution.png`**: Aspect ratio and width distributions.
- **`sample_images.png`**: Micro-texture grid of fabric weaves.
- **`outlier_analysis.png`**: IQR brightness & contrast outlier identification.

---

## 🧠 Model Architecture & Transfer Learning Selection

The training pipeline automatically benchmarks 3 transfer learning backbones:
1. **MobileNetV3**: Fast, lightweight mobile feature extractor.
2. **EfficientNetB0**: Scaled compound feature representation.
3. **ResNet50**: Deep residual network.

### Training Setup & Callbacks
- **Optimizer**: `Adam(lr=1e-3)`
- **Loss**: `sparse_categorical_crossentropy`
- **Callbacks**:
  - `EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)`
  - `ModelCheckpoint(monitor='val_accuracy', save_best_only=True)`
  - `ReduceLROnPlateau(factor=0.5, patience=2, min_lr=1e-6)`

The best model is automatically selected and saved to `models/textile_model.keras`.

---

## 📉 Evaluation Metrics

Evaluation is performed on the unseen 15% test set:
- **Test Accuracy**: Evaluated on test split.
- **Top-5 Accuracy**: Evaluated top-5 probabilities.
- **Confusion Matrix**: `docs/eda/confusion_matrix.png`
- **ROC Curves**: `docs/eda/roc_curve.png`
- **Prediction Examples**: `docs/eda/prediction_examples.png`
- **Report**: `docs/evaluation_report.md`

---

## 🔌 Backend APIs

| Endpoint | Method | Description |
|---|---|---|
| `POST /api/predict` | `POST` | Upload image, run TensorFlow model, return material, confidence, top-5 predictions, and recyclability score. |
| `POST /api/upload` | `POST` | Upload textile image and save database metadata. |
| `GET /api/history` | `GET` | Retrieve user classification prediction history. |
| `GET /api/health` | `GET` | Health check endpoint for backend and microservice status. |

---

## 💻 Frontend Pages

1. **Image Analysis Page (`/analysis`)**: Drag-and-drop image upload, real-time inference progress bar, preprocessed image preview, predicted material card, confidence gauge, top-5 predictions breakdown, and disposal recommendations.
2. **History Page (`/history`)**: Searchable table archive of past predictions with direct links to full reports.
3. **Dashboard Page (`/dashboard`)**: Aggregated circular economy statistics.
4. **Inventory Page (`/inventory`)**: Textile waste batch ledger.

---

## ⚙️ Installation & Running Guide

### 1. Environment Setup
```bash
# Clone repository
git clone https://github.com/sailokesh365/AI-Textile-Waste-Intelligence-Platform.git
cd AI-Textile-Waste-Intelligence-Platform

# Python Virtual Environment
python -m venv .venv
.venv\Scripts\activate

# Install Python ML dependencies
pip install -r ml_model/requirements.txt
pip install matplotlib seaborn scikit-learn
```

### 2. Run Full Training & Evaluation Pipeline
```bash
python ml_model/run_pipeline.py
```

### 3. Run Python FastAPI Microservice
```bash
cd ml_model
uvicorn main:app --host 127.0.0.1 --port 8000
```

### 4. Run Backend Node.js Express Server
```bash
cd backend
npm install
npm start
```
*Runs on `http://localhost:5000`*

### 5. Run Frontend React Web Client
```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:5173`*

---

## 🔄 Prediction Workflow

```
[User Uploads Image] ──> [Frontend React UI] ──> [Node.js Express /api/predict]
                                                               |
                                                   [FastAPI Microservice]
                                                               |
                                                 [OpenCV Preprocessing (224x224)]
                                                               |
                                                 [TensorFlow Model Inference]
                                                               |
                                                  [Top-5 Predictions & Scores]
                                                               |
                                                 [Return JSON Response & UI Render]
```

---

## 🔮 Future Improvements
- **Hyperspectral Imaging Integration**: Expand beyond RGB vision to near-infrared (NIR) sensors for precise polymer blend spectroscopy.
- **On-Edge Device Deployment**: Quantize model to TensorFlow Lite (TFLite) / ONNX for handheld industrial sorting scanners.
- **Defect Segmentation**: Add Mask R-CNN / YOLOv8 for pixel-level damage localization.

---

## 👥 Contributors & License
- **Developed By**:
Sai Lokesh Reddy Pannala
B.Tech – Information Technology
ACE Engineering College
Infosys Springboard Internship Project

- **License**: This project is licensed under the MIT License.