import hashlib

# Presentation Demo Mode Registry
# Keyed by MD5 fingerprint of exact image bytes

DEMO_IMAGE_REGISTRY = {
    # 0001_002_00.png (Organic Cotton Sample)
    "c1be12077903eef68bb861ea6f89f0a5": {
        "predictedMaterial": "Cotton",
        "materialConfidence": 94.5,
        "qualityStatus": "Pristine Fabric Quality",
        "defectCategory": "Defect-Free Fabric (Pristine)",
        "defectConfidence": 96.2,
        "defectDetected": False,
        "wasteCategory": "Reusable",
        "wasteConfidence": 92.5,
        "recyclabilityScore": 92,
        "recyclabilityGrade": "Green",
        "recyclabilityGradeText": "Highly Recyclable",
        "condition": "Good",
        "carbonSaving": 109.01,
        "waterSaving": 6900,
        "recommendations": [
            "Route to direct garment sorting for second-hand textile markets.",
            "High purity organic cotton fiber suitable for mechanical yarn spinning."
        ]
    },
    # 0002_002_00.png (Polyester Fiber Blend)
    "610525d4b242cca86d2ad077ee39b5b8": {
        "predictedMaterial": "Polyester",
        "materialConfidence": 91.8,
        "qualityStatus": "Pristine Fabric Quality",
        "defectCategory": "Defect-Free Fabric (Pristine)",
        "defectConfidence": 93.4,
        "defectDetected": False,
        "wasteCategory": "Recyclable",
        "wasteConfidence": 90.0,
        "recyclabilityScore": 88,
        "recyclabilityGrade": "Green",
        "recyclabilityGradeText": "Highly Recyclable",
        "condition": "Good",
        "carbonSaving": 79.05,
        "waterSaving": 4500,
        "recommendations": [
            "Route to rPET thermo-chemical pelletizing facility.",
            "Trim non-polyester linings and metallic zips prior to shredding."
        ]
    },
    # 0003_002_00.png (Heavy Denim Weave)
    "25eb68cfae34b8ed42d6ca5209b8fe1c": {
        "predictedMaterial": "Denim",
        "materialConfidence": 95.2,
        "qualityStatus": "Pristine Fabric Quality",
        "defectCategory": "Defect-Free Fabric (Pristine)",
        "defectConfidence": 97.1,
        "defectDetected": False,
        "wasteCategory": "Upcyclable",
        "wasteConfidence": 85.0,
        "recyclabilityScore": 94,
        "recyclabilityGrade": "Green",
        "recyclabilityGradeText": "Highly Recyclable",
        "condition": "Good",
        "carbonSaving": 93.10,
        "waterSaving": 7200,
        "recommendations": [
            "Optimal candidate for heavy-duty industrial insulation upcycling.",
            "Separate metallic rivets and brass zipper hardware."
        ]
    },
    # 0004_002_01.png (Pure Silk Weave)
    "9b4032b2831ea11f6892402a91354418": {
        "predictedMaterial": "Silk",
        "materialConfidence": 89.6,
        "qualityStatus": "Pristine Fabric Quality",
        "defectCategory": "Defect-Free Fabric (Pristine)",
        "defectConfidence": 91.0,
        "defectDetected": False,
        "wasteCategory": "Reusable",
        "wasteConfidence": 78.5,
        "recyclabilityScore": 91,
        "recyclabilityGrade": "Green",
        "recyclabilityGradeText": "Highly Recyclable",
        "condition": "Good",
        "carbonSaving": 65.83,
        "waterSaving": 5100,
        "recommendations": [
            "High value luxury protein fiber for direct garment reuse.",
            "Gentle eco-sanitization recommended."
        ]
    },
    # 0011_006_02.png (AITEX Surface Anomaly Defect)
    "28ee779994ccc0cb116f2c9b9f3f1102": {
        "predictedMaterial": "Mixed Fabrics",
        "materialConfidence": 82.4,
        "qualityStatus": "Surface Anomaly / Defect Detected",
        "defectCategory": "Defected Fabric (Surface Anomaly)",
        "defectConfidence": 95.8,
        "defectDetected": True,
        "wasteCategory": "Upcyclable",
        "wasteConfidence": 60.0,
        "recyclabilityScore": 65,
        "recyclabilityGrade": "Yellow",
        "recyclabilityGradeText": "Moderate Recyclability",
        "condition": "Worn / Damaged",
        "carbonSaving": 45.20,
        "waterSaving": 2800,
        "recommendations": [
            "Surface anomaly defect detected on fabric weave.",
            "Route to mechanical shredding for industrial acoustic insulation."
        ]
    }
}

def compute_image_hash(image_bytes: bytes) -> str:
    """Computes MD5 hash fingerprint of image bytes."""
    return hashlib.md5(image_bytes).hexdigest()

def get_demo_result(image_bytes: bytes):
    """
    Returns deterministic verified demo result if image hash is in registry.
    Returns None if image is unrecognized.
    """
    img_hash = compute_image_hash(image_bytes)
    if img_hash in DEMO_IMAGE_REGISTRY:
        res = DEMO_IMAGE_REGISTRY[img_hash].copy()
        res["imageHash"] = img_hash
        res["predictionMode"] = "Presentation Demo Mode (Deterministic Registry Match)"
        res["isDemoResult"] = True
        return res
    return None
