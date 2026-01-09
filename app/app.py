import os
from flask import Flask, render_template, request
from converters import json_to_xml, xml_to_json

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "replace-with-strong-secret")
MAX_INPUT_SIZE = int(os.environ.get("MAX_INPUT_SIZE", 2 * 1024 * 1024))

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/json-to-xml", methods=["POST"])
def api_json_to_xml():
    data = request.get_json(silent=True) or {}
    payload = data.get("payload", "")
    if len(payload.encode("utf-8")) > MAX_INPUT_SIZE:
        return {"error": "Input too large (max 2 MB)."}, 413
    root = data.get("root_name", "root")
    try:
        xml_str = json_to_xml(payload, root_name=root)
        return {"xml": xml_str}
    except ValueError as e:
        return {"error": str(e)}, 400

@app.route("/api/xml-to-json", methods=["POST"])
def api_xml_to_json():
    data = request.get_json(silent=True) or {}
    payload = data.get("payload", "")
    if len(payload.encode("utf-8")) > MAX_INPUT_SIZE:
        return {"error": "Input too large (max 2 MB)."}, 413
    try:
        json_str = xml_to_json(payload)
        return {"json": json_str}
    except ValueError as e:
        return {"error": str(e)}, 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
