import os
import cv2
import numpy as np
import base64
from inference_pipeline import TextileInferencePipeline

_PIPELINE = None

def get_pipeline():
    """Returns singleton instance of TextileInferencePipeline."""
    global _PIPELINE
    if _PIPELINE is None:
        model_path = os.path.join(os.path.dirname(__file__), "..", "models", "textile_model.keras")
        if not os.path.exists(model_path):
            model_path = os.path.join(os.path.dirname(__file__), "textile_model.keras")
        
        config_path = os.path.join(os.path.dirname(__file__), "..", "models", "prediction_config.json")
        labels_path = os.path.join(os.path.dirname(__file__), "..", "models", "class_labels.json")

        _PIPELINE = TextileInferencePipeline(
            model_path=model_path,
            config_path=config_path if os.path.exists(config_path) else None,
            labels_path=labels_path if os.path.exists(labels_path) else None
        )
    return _PIPELINE

def predict_textile(image_bytes):
    """
    Main prediction function called by FastAPI & microservice handlers.
    Runs real TensorFlow model inference on raw image bytes.
    """
    pipeline = get_pipeline()
    result = pipeline.predict(image_bytes)

    # Convert resized visual to base64 for preview in UI
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is not None:
        target_w, target_h = pipeline.config.get("input_shape", [224, 224])[0:2]
        img_resized = cv2.resize(img, (target_w, target_h))
        _, buffer = cv2.imencode('.png', img_resized)
        preprocessed_base64 = base64.b64encode(buffer).decode('utf-8')
    else:
        preprocessed_base64 = ""

    result["preprocessedBase64"] = preprocessed_base64
    return result

def get_model():
    """Exposes model object for health checks."""
    pipeline = get_pipeline()
    return pipeline.model

if __name__ == "__main__":
    print("Testing predictor.py...")
    # Create test dummy image bytes
    dummy = np.ones((224, 224, 3), dtype=np.uint8) * 128
    _, buf = cv2.imencode('.jpg', dummy)
    res = predict_textile(buf.tobytes())
    print("Material Predicted:", res["predictedMaterial"], f"({res['materialConfidence']}%)")
