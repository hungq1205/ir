from flask import Flask
from elasticsearch import Elasticsearch
from repo import Repo
from es_client import ESClient
from usecase import UseCase
from service import Service
from handler import create_handler

ES_HOST = "http://localhost:9200"
INDEX_NAME = "news"

USERNAME = "elastic"
PASSWORD = "changeme"

def create_app():
    app = Flask(__name__)

    es_client = ESClient(
        Elasticsearch(
            ES_HOST,
            basic_auth=(USERNAME, PASSWORD),
            verify_certs=False
        ),
        INDEX_NAME
    )

    repo = Repo()
    usecase = Service(es_client, repo)
    app.register_blueprint(create_handler(usecase))

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=3000, debug=True)
