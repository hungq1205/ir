from flask import Blueprint, request, jsonify
from usecase import UseCase

def create_handler(usecase: UseCase) -> Blueprint:
    bp = Blueprint("api", __name__)

    @bp.route("/api/news/<int:id>")
    def get(id):
        return get_context(usecase, id)
    
    @bp.route("/api/news/relevant", methods=["POST"])
    def get_relevant():
        """body: current_id, positive_ids, negative_ids"""
        return get_relevant_context(usecase)

    @bp.route("/api/news", methods=["POST"])
    def create():
        """body: title, content, label"""
        return create_context(usecase)

    @bp.route("/api/news/search", methods=["POST"])
    def search():
        """body: must, should, must_not, category, page, page_size"""
        return search_context(usecase)

    return bp


def get_context(usecase: UseCase, id: str):
    new = usecase.get(id)
    if not new:
        return jsonify({"error": "Not found"}), 404
    return jsonify(new), 200

def get_relevant_context(usecase: UseCase):
    data = request.get_json()
    current_id = data.get("current_id")
    positive_ids = data.get("positive_ids", [])
    negative_ids = data.get("negative_ids", [])

    if current_id is None:
        return jsonify({"error": "Missing 'current_id' field"}), 400
    relevant = usecase.get_relevant(current_id, positive_ids, negative_ids)
    return jsonify(relevant), 200

def create_context(usecase: UseCase):
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")
    label = data.get("category")

    if not all([title, content, label]):
        return jsonify({"error": "Missing required fields"}), 400

    new = usecase.create(title, content, label)
    return jsonify(new), 201

def search_context(usecase: UseCase):
    data = request.get_json(silent=True) or {}

    must = data.get("must", [])
    should = data.get("should", [])
    must_not = data.get("must_not", [])
    category = data.get("category", "")
    page = int(data.get("page", 1))
    size = int(data.get("page_size", 10))

    if not isinstance(must, list) or not isinstance(should, list) or not isinstance(must_not, list):
        return jsonify({"error": "'must', 'should', and 'must_not' must be arrays"}), 400

    result = usecase.search(should, must, must_not, category, page, size)

    return jsonify({
        "total": result["total"],
        "page": page,
        "size": size,
        "news": result["news"]
    }), 200
