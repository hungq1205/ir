from flask import Blueprint, request, jsonify
from usecase import UseCase

def create_handler(usecase: UseCase) -> Blueprint:
    bp = Blueprint("api", __name__)

    @bp.route("/api/news/<int:id>")
    def get(id):
        return get_context(usecase, id)

    @bp.route("/api/news", methods=["POST"])
    def create():
        return create_context(usecase)

    @bp.route("/api/news/search")
    def search():
        """path params: q(query), page, size"""
        return search_context(usecase)

    return bp


def get_context(usecase: UseCase, id: int):
    new = usecase.get(id)
    if not new:
        return jsonify({"error": "Not found"}), 404
    return jsonify(new), 200


def create_context(usecase: UseCase):
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")
    label = data.get("label")

    if not all([title, content, label]):
        return jsonify({"error": "Missing required fields"}), 400

    new = usecase.create(title, content, label)
    return jsonify(new), 201


def search_context(usecase: UseCase):
    q = request.args.get("q")
    page = int(request.args.get("page", 1))
    size = int(request.args.get("size", 10))

    if not q:
        return jsonify({"error": "Missing query param 'q'"}), 400

    result = usecase.search(q, page, size)
    return jsonify({
        "total": result["total"],
        "page": page,
        "size": size,
        "news": result["news"]
    }), 200
