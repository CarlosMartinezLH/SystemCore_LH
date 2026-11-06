import sys
import json
import base64
import io
from PIL import Image
from glasses_detector import GlassesClassifier

# Pre-load classifier once
classifier = GlassesClassifier()

def check_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    pred = classifier.predict(img)
    # pred is "present" or "absent"
    has_glasses = (pred == "present")
    return {
        "glasses": has_glasses,
        "label": pred
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        path = sys.argv[1]
        with open(path, "rb") as f:
            data = f.read()
    else:
        # Read base64 or raw from stdin
        raw = sys.stdin.read().strip()
        data = base64.b64decode(raw)
    
    result = check_image(data)
    print(json.dumps(result))

