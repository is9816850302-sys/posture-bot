"""
Flask-приложение для определения позы человека на фото с помощью MediaPipe Pose.
Загружает изображение, рисует скелет и возвращает исходное и обработанное изображения.
Дополнительно: live-анализ осанки по видеопотоку для Telegram WebApp.
"""

import base64
import math
import os
import tempfile
import time
import uuid
from pathlib import Path
from threading import Lock
from typing import Optional, Tuple
from urllib.request import urlretrieve

import cv2
import mediapipe as mp
import numpy as np
from flask import Flask, render_template, request, flash, redirect, jsonify
from werkzeug.utils import secure_filename

from mediapipe.tasks.python import vision
from mediapipe.tasks.python.vision import drawing_utils, PoseLandmarksConnections

app = Flask(__name__)
app.config["SECRET_KEY"] = "pose-detection-secret-key"
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pose_landmarker.task")
POSE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"


def _ensure_model():
    if not os.path.isfile(MODEL_PATH):
        urlretrieve(POSE_MODEL_URL, MODEL_PATH)


_ensure_model()

# ---------------------------------------------------------------------------
#  Live-анализ: сессии и глобальный детектор
# ---------------------------------------------------------------------------
_sessions: dict = {}
_sessions_lock = Lock()

_landmarker = None
_landmarker_lock = Lock()

MAX_SNAPSHOTS = 5
SESSION_TTL = 600  # 10 min


def _get_landmarker():
    global _landmarker
    if _landmarker is None:
        base_options = mp.tasks.BaseOptions(model_asset_path=MODEL_PATH)
        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.IMAGE,
        )
        _landmarker = vision.PoseLandmarker.create_from_options(options)
    return _landmarker


def _detect_landmarks(frame: np.ndarray):
    """Принимает BGR-кадр, возвращает список landmarks первого человека или None."""
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))
    with _landmarker_lock:
        result = _get_landmarker().detect(mp_image)
    if not result.pose_landmarks:
        return None
    return result.pose_landmarks[0]


def _classify(value: float, ok_thresh: float, warn_thresh: float) -> str:
    if value < ok_thresh:
        return "ok"
    if value < warn_thresh:
        return "warning"
    return "problem"


def _analyze_posture(landmarks) -> dict:
    """Вычисляет метрики осанки по нормализованным landmarks."""
    lm = landmarks
    ls, rs = lm[11], lm[12]   # плечи
    lh, rh = lm[23], lm[24]   # таз
    le, re = lm[7], lm[8]     # уши
    nose = lm[0]

    sw = max(abs(ls.x - rs.x), 0.01)
    hw = max(abs(lh.x - rh.x), 0.01)

    smx, smy = (ls.x + rs.x) / 2, (ls.y + rs.y) / 2
    hmx, hmy = (lh.x + rh.x) / 2, (lh.y + rh.y) / 2

    head_tilt = abs(le.y - re.y) / sw
    shoulder_diff = abs(ls.y - rs.y) / sw
    hip_diff = abs(lh.y - rh.y) / hw
    trunk_lean = math.degrees(math.atan2(abs(smx - hmx), max(abs(smy - hmy), 0.01)))
    forward_lean = abs(nose.x - hmx) / sw

    return {
        "head_tilt": {
            "value": round(head_tilt, 3),
            "status": _classify(head_tilt, 0.08, 0.15),
            "label": "Наклон головы",
        },
        "shoulder_level": {
            "value": round(shoulder_diff, 3),
            "status": _classify(shoulder_diff, 0.08, 0.15),
            "label": "Уровень плеч",
        },
        "hip_level": {
            "value": round(hip_diff, 3),
            "status": _classify(hip_diff, 0.08, 0.15),
            "label": "Уровень таза",
        },
        "trunk_lean": {
            "value": round(trunk_lean, 1),
            "status": _classify(trunk_lean, 3.0, 7.0),
            "label": "Наклон корпуса",
        },
        "forward_lean": {
            "value": round(forward_lean, 3),
            "status": _classify(forward_lean, 0.3, 0.5),
            "label": "Смещение головы",
        },
    }


def _compile_report(session: dict) -> dict:
    """Формирует итоговый отчёт по накопленным данным сессии."""
    history = session["metrics_history"]
    if not history:
        return {
            "frames_analyzed": 0,
            "summary": {},
            "issues": [],
            "syndromes": [],
            "exercises": [],
            "snapshots": [],
        }

    summary = {}
    for key in history[0]:
        values = [h[key]["value"] for h in history]
        avg = sum(values) / len(values)
        prob_cnt = sum(1 for h in history if h[key]["status"] == "problem")
        warn_cnt = sum(1 for h in history if h[key]["status"] == "warning")
        total = len(history)

        if prob_cnt / total > 0.3:
            status = "problem"
        elif (prob_cnt + warn_cnt) / total > 0.3:
            status = "warning"
        else:
            status = "ok"

        summary[key] = {
            "value": round(avg, 3),
            "status": status,
            "label": history[0][key]["label"],
            "problem_pct": round(prob_cnt / total * 100),
        }

    issues = []
    exercises = []

    _issue_map = {
        "head_tilt": (
            "Наклон головы",
            "Голова наклонена в сторону — возможен мышечный дисбаланс шеи.",
            "Растяжка боковых мышц шеи: наклоны головы к плечу, 15 сек на каждую сторону",
        ),
        "shoulder_level": (
            "Асимметрия плеч",
            "Одно плечо выше другого. Возможна сколиотическая осанка или гипертонус трапеции.",
            "Шраги с гантелями 3×15 + растяжка верхней трапеции",
        ),
        "hip_level": (
            "Перекос таза",
            "Таз наклонён в сторону. Может быть связано с разницей длины ног.",
            "Растяжка квадратной мышцы поясницы + укрепление средней ягодичной",
        ),
        "trunk_lean": (
            "Наклон корпуса",
            "Корпус отклоняется от вертикали при ходьбе.",
            "Планка 3×30 сек + боковая планка 3×20 сек на каждую сторону",
        ),
        "forward_lean": (
            "Смещение головы вперёд",
            "Голова смещена вперёд относительно корпуса (forward head posture).",
            "Ретракция подбородка (chin tucks) 3×12 + растяжка грудных мышц у дверного проёма",
        ),
    }

    for key, (title, desc, exercise) in _issue_map.items():
        if summary.get(key, {}).get("status") in ("warning", "problem"):
            issues.append({"title": title, "description": desc})
            exercises.append(exercise)

    syndromes = []
    s_bad = summary.get("shoulder_level", {}).get("status") in ("warning", "problem")
    f_bad = summary.get("forward_lean", {}).get("status") in ("warning", "problem")
    h_bad = summary.get("head_tilt", {}).get("status") in ("warning", "problem")
    hip_bad = summary.get("hip_level", {}).get("status") in ("warning", "problem")
    trunk_bad = summary.get("trunk_lean", {}).get("status") in ("warning", "problem")

    if f_bad and (s_bad or h_bad):
        syndromes.append({
            "name": "Верхний перекрёстный синдром",
            "description": (
                "Выдвижение головы вперёд и округление плеч. "
                "Связан с ослаблением глубоких сгибателей шеи и ромбовидных мышц "
                "при укорочении грудных и верхней трапеции."
            ),
        })
    if hip_bad and trunk_bad:
        syndromes.append({
            "name": "Нижний перекрёстный синдром",
            "description": (
                "Перекос таза и наклон корпуса могут указывать на дисбаланс "
                "между подвздошно-поясничной мышцей и ягодичными."
            ),
        })

    return {
        "frames_analyzed": session["frames_analyzed"],
        "summary": summary,
        "issues": issues,
        "syndromes": syndromes,
        "exercises": exercises,
        "snapshots": session["snapshots"],
    }


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def draw_pose_on_image(image_path: str) -> Tuple[Optional[bytes], Optional[str]]:
    """
    Загружает изображение, находит позу через MediaPipe PoseLandmarker, рисует скелет.
    Возвращает (bytes изображения с скелетом в JPEG, None) или (None, сообщение об ошибке).
    """
    image = cv2.imread(image_path)
    if image is None:
        return None, "Не удалось прочитать изображение."

    image_with_skeleton = image.copy()

    base_options = mp.tasks.BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.IMAGE,
    )

    with vision.PoseLandmarker.create_from_options(options) as landmarker:
        mp_image = mp.Image.create_from_file(image_path)
        result = landmarker.detect(mp_image)

        if not result.pose_landmarks:
            return None, "На фото не обнаружен человек. Попробуйте другое изображение."

        for landmarks in result.pose_landmarks:
            drawing_utils.draw_landmarks(
                image_with_skeleton,
                landmarks,
                PoseLandmarksConnections.POSE_LANDMARKS,
            )

    _, buffer = cv2.imencode(".jpg", image_with_skeleton)
    return buffer.tobytes(), None


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "GET":
        return render_template("index.html")

    if "file" not in request.files:
        flash("Файл не выбран.", "error")
        return redirect(request.url)

    file = request.files["file"]
    if file.filename == "":
        flash("Файл не выбран.", "error")
        return redirect(request.url)

    if not allowed_file(file.filename):
        flash("Разрешены только форматы JPG и PNG.", "error")
        return redirect(request.url)

    temp_dir = tempfile.mkdtemp()
    original_path = os.path.join(temp_dir, secure_filename(file.filename))
    try:
        file.save(original_path)

        skeleton_bytes, error_msg = draw_pose_on_image(original_path)
        if error_msg:
            flash(error_msg, "error")
            return redirect(request.url)

        with open(original_path, "rb") as f:
            original_b64 = base64.b64encode(f.read()).decode("utf-8")
        skeleton_b64 = base64.b64encode(skeleton_bytes).decode()

        return render_template(
            "index.html",
            show_result=True,
            original_b64=original_b64,
            skeleton_b64=skeleton_b64,
        )
    finally:
        try:
            for f in Path(temp_dir).iterdir():
                f.unlink(missing_ok=True)
            os.rmdir(temp_dir)
        except OSError:
            pass


# ---------------------------------------------------------------------------
#  Telegram WebApp
# ---------------------------------------------------------------------------

@app.route("/tg")
def telegram_webapp():
    return render_template("webapp.html")


# ---------------------------------------------------------------------------
#  Live-анализ (используется из webapp.html)
# ---------------------------------------------------------------------------

@app.route("/live/start", methods=["POST"])
def live_start():
    sid = uuid.uuid4().hex
    with _sessions_lock:
        # очистка старых сессий
        now = time.time()
        expired = [k for k, v in _sessions.items() if now - v["created"] > SESSION_TTL]
        for k in expired:
            del _sessions[k]

        _sessions[sid] = {
            "created": now,
            "frames_analyzed": 0,
            "metrics_history": [],
            "snapshots": [],
        }
    return jsonify({"session_id": sid})


@app.route("/live/frame", methods=["POST"])
def live_frame():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "no json body"}), 400

    sid = data.get("session_id", "")
    frame_b64 = data.get("frame", "")
    if not sid or not frame_b64:
        return jsonify({"error": "missing session_id or frame"}), 400

    with _sessions_lock:
        session = _sessions.get(sid)
    if session is None:
        return jsonify({"error": "session not found"}), 404

    # Декодируем кадр
    try:
        if "," in frame_b64:
            frame_b64 = frame_b64.split(",", 1)[1]
        raw = base64.b64decode(frame_b64)
        arr = np.frombuffer(raw, np.uint8)
        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    except Exception:
        return jsonify({"error": "bad frame"}), 400

    if frame is None:
        return jsonify({"error": "bad frame"}), 400

    landmarks = _detect_landmarks(frame)
    if landmarks is None:
        return jsonify({"status": "waiting"})

    metrics = _analyze_posture(landmarks)

    with _sessions_lock:
        session["frames_analyzed"] += 1
        session["metrics_history"].append(metrics)

        has_problem = any(m["status"] == "problem" for m in metrics.values())
        if has_problem and len(session["snapshots"]) < MAX_SNAPSHOTS:
            annotated = frame.copy()
            drawing_utils.draw_landmarks(
                annotated, landmarks, PoseLandmarksConnections.POSE_LANDMARKS,
            )
            _, buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 70])
            session["snapshots"].append(base64.b64encode(buf).decode())

    statuses = [m["status"] for m in metrics.values()]
    if "problem" in statuses:
        overall = "red"
    elif "warning" in statuses:
        overall = "yellow"
    else:
        overall = "green"

    return jsonify({
        "status": overall,
        "metrics": metrics,
        "frames_analyzed": session["frames_analyzed"],
    })


@app.route("/live/stop", methods=["POST"])
def live_stop():
    data = request.get_json(silent=True)
    sid = data.get("session_id", "") if data else ""

    with _sessions_lock:
        session = _sessions.pop(sid, None)

    if session is None:
        return jsonify({"error": "session not found"}), 404

    return jsonify(_compile_report(session))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
