import os
import json
import time
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers, callbacks
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix

try:
    from waste_preprocessing import load_and_preprocess_waste_dataset, WASTE_CLASSES, create_waste_augmentation_layer
except ImportError:
    from ml_model.waste_preprocessing import load_and_preprocess_waste_dataset, WASTE_CLASSES, create_waste_augmentation_layer

os.makedirs("models", exist_ok=True)
os.makedirs("ml_model", exist_ok=True)

def build_waste_model(input_shape=(224, 224, 3), num_classes=6):
    aug_layer = create_waste_augmentation_layer()
    base_model = tf.keras.applications.ResNet50V2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False

    inputs = layers.Input(shape=input_shape)
    x = aug_layer(inputs)
    x = layers.Rescaling(2.0, offset=-1.0)(x)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)

    model = models.Model(inputs, outputs, name="Waste_Condition_Classifier")
    return model, base_model

def train_and_evaluate_waste_model():
    print("==================================================")
    print("Training Second AI Model — Waste Condition Classification")
    print("==================================================")

    (X_train, y_train), (X_val, y_val), (X_test, y_test), stats = load_and_preprocess_waste_dataset()
    print(f"Dataset Loaded -> Train: {X_train.shape}, Val: {X_val.shape}, Test: {X_test.shape}")

    class_weights_arr = compute_class_weight('balanced', classes=np.unique(y_train), y=y_train)
    class_weight_dict = {int(cls): float(weight) for cls, weight in zip(np.unique(y_train), class_weights_arr)}

    model, base_model = build_waste_model(input_shape=(224, 224, 3), num_classes=len(WASTE_CLASSES))

    # Phase 1: Train Top Classifier Head
    print("Phase 1: Training classifier head...")
    model.compile(
        optimizer=optimizers.Adam(learning_rate=1e-3),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=10,
        batch_size=16,
        class_weight=class_weight_dict,
        verbose=1
    )

    # Phase 2: Fine-Tuning Top Layers
    print("Phase 2: Fine-tuning top layers...")
    base_model.trainable = True
    for layer in base_model.layers[:-25]:
        layer.trainable = False
    for layer in base_model.layers:
        if isinstance(layer, layers.BatchNormalization):
            layer.trainable = False

    model.compile(
        optimizer=optimizers.Adam(learning_rate=1e-4),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    cb_list = [
        callbacks.EarlyStopping(monitor='val_loss', patience=7, restore_best_weights=True),
        callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, min_lr=1e-6, verbose=0)
    ]

    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=20,
        batch_size=16,
        class_weight=class_weight_dict,
        callbacks=cb_list,
        verbose=1
    )

    # Evaluate on Test Set
    print("\n--- Model Evaluation on Test Set ---")
    probs = model.predict(X_test)
    y_pred = np.argmax(probs, axis=1)
    test_acc = float(np.mean(y_pred == y_test))

    print(f"Test Accuracy: {test_acc * 100:.2f}%")
    report = classification_report(y_test, y_pred, target_names=WASTE_CLASSES, zero_division=0)
    print("Classification Report:\n", report)

    # Save Model Artifacts
    ml_dir = os.path.dirname(__file__)
    models_dir = os.path.join(ml_dir, "..", "models")
    os.makedirs(models_dir, exist_ok=True)

    model.save(os.path.join(ml_dir, "waste_model.keras"))
    model.save(os.path.join(models_dir, "waste_model.keras"))

    labels_data = {
        "classes": WASTE_CLASSES,
        "label_to_index": {c: idx for idx, c in enumerate(WASTE_CLASSES)},
        "index_to_label": {idx: c for idx, c in enumerate(WASTE_CLASSES)}
    }

    with open(os.path.join(ml_dir, "waste_class_labels.json"), "w") as f:
        json.dump(labels_data, f, indent=2)
    with open(os.path.join(models_dir, "waste_class_labels.json"), "w") as f:
        json.dump(labels_data, f, indent=2)

    print("\nSuccessfully saved waste_model.keras and waste_class_labels.json!")
    return test_acc

if __name__ == "__main__":
    train_and_evaluate_waste_model()
