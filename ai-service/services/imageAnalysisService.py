import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim


def _decode_image(image_file):
    file_bytes = np.frombuffer(image_file.read(), np.uint8)
    decoded_image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    if decoded_image is None:
        raise ValueError("Unable to decode uploaded image.")
    return decoded_image


def analyze_image_evidence(image_file):
    image = _decode_image(image_file)
    grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(grayscale, (512, 512), interpolation=cv2.INTER_AREA)

    blurred = cv2.GaussianBlur(resized, (9, 9), 0)
    similarity_score, similarity_map = ssim(resized, blurred, full=True)

    residual = cv2.absdiff(resized, blurred)
    edges = cv2.Canny(resized, 80, 160)
    residual_mean = float(np.mean(residual))
    residual_std = float(np.std(residual))
    edge_density = float(np.mean(edges > 0))
    local_similarity = float(np.mean(similarity_map))

    tamper_score = min(
        100.0,
        ((1.0 - similarity_score) * 55.0)
        + min(residual_mean / 2.0, 20.0)
        + min(residual_std / 3.0, 15.0)
        + min(edge_density * 100.0, 10.0),
    )
    tampered = tamper_score >= 35.0 or local_similarity < 0.88

    explanation = (
        f"Computed grayscale structural similarity against a smoothed reference image. "
        f"SSIM={similarity_score:.4f}, residualMean={residual_mean:.2f}, residualStd={residual_std:.2f}, "
        f"edgeDensity={edge_density:.4f}. "
        f"{'Localized inconsistencies indicate possible tampering.' if tampered else 'No strong tampering indicators were detected.'}"
    )

    return {
        "tampered": tampered,
        "similarityScore": round(float(similarity_score), 4),
        "explanation": explanation,
    }
