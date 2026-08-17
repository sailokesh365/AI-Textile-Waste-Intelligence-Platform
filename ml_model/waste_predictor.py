import os
import json
import cv2
import numpy as np
import tensorflow as tf

_WASTE_MODEL = None
_WASTE_CLASSES = ["Reusable", "Recyclable", "Repairable", "Damaged", "Contaminated", "Landfill"]

def get_waste_model():
    global _WASTE_MODEL, _WASTE_CLASSES
    if _WASTE_MODEL is None:
        model_path = os.path.join(os.path.dirname(__file__), "waste_model.keras")
        if not os.path.exists(model_path):
            model_path = os.path.join(os.path.dirname(__file__), "..", "models", "waste_model.keras")

        labels_path = os.path.join(os.path.dirname(__file__), "waste_class_labels.json")
        if not os.path.exists(labels_path):
            labels_path = os.path.join(os.path.dirname(__file__), "..", "models", "waste_class_labels.json")

        if os.path.exists(labels_path):
            with open(labels_path, 'r') as f:
                data = json.load(f)
                _WASTE_CLASSES = data.get("classes", _WASTE_CLASSES)

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Waste model file missing at {model_path}")

        _WASTE_MODEL = tf.keras.models.load_model(model_path)
    return _WASTE_MODEL, _WASTE_CLASSES

def predict_waste_condition(image_bytes):
    model, classes = get_waste_model()

    nparr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("Failed to decode image bytes.")

    denoised = cv2.bilateralFilter(img_bgr, 5, 50, 50)
    lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl, a, b))
    enhanced_bgr = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    img_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (224, 224), interpolation=cv2.INTER_AREA)

    tensor = img_resized.astype(np.float32) / 255.0
    input_batch = np.expand_dims(tensor, axis=0)

    probs = model.predict(input_batch, verbose=0)[0]
    top_idx = int(np.argmax(probs))
    waste_category = classes[top_idx]
    confidence = float(round(probs[top_idx] * 100, 1))

    # Base condition score mapping per category
    base_scores = {
        "Reusable": 92,
        "Recyclable": 85,
        "Repairable": 68,
        "Damaged": 45,
        "Contaminated": 30,
        "Landfill": 12
    }
    base_score = base_scores.get(waste_category, 50)
    condition_score = int(round(base_score * (confidence / 100.0) + (100 - confidence) * 0.5))
    condition_score = max(5, min(99, condition_score))

    return {
        "Waste Category": waste_category,
        "Confidence": confidence,
        "Condition Score": condition_score
    }

if __name__ == "__main__":
    print("Testing waste_predictor.py...")
    dummy = np.ones((224, 224, 3), dtype=np.uint8) * 120
    _, buf = cv2.imencode('.jpg', dummy)
    res = predict_waste_condition(buf.tobytes())
    print("Prediction Output:", json.dumps(res, indent=2))
