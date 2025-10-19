import requests
import json
from requests.auth import HTTPBasicAuth

class ESClient:
    def __init__(self, es_url: str, index_name: str, username: str | None = None, password: str | None = None):
        self.es_url = es_url.rstrip("/")
        self.index_name = index_name
        self.auth = HTTPBasicAuth(username, password) if username and password else None
        self.default_headers = {"Content-Type": "application/json"}

    def index_document(self, doc_id: int, document: dict):
        url = f"{self.es_url}/{self.index_name}/_doc/{doc_id}"
        response = requests.put(url, headers=self.default_headers, data=json.dumps(document), auth=self.auth)
        response.raise_for_status()
        return response.json()

    def search(self, should: list[str], must: list[str], must_not: list[str], category: str, page: int = 1, size: int = 10):
        should = should or []
        must = must or []
        must_not = must_not or []

        bool_query = {
            "bool": {
                "must": [
                    {"multi_match": {"query": q, "fields": ["title", "content"], "operator": "and"}}
                    for q in must
                ],
                "should": [
                    {"multi_match": {"query": q, "fields": ["title", "content"], "operator": "or"}}
                    for q in should
                ],
                "must_not": [
                    {"multi_match": {"query": q, "fields": ["title", "content"], "operator": "or"}}
                    for q in must_not
                ],
                "filter": [{"term": {"label": category}}] if category else [],
            }
        }

        body = {
            "from": (page - 1) * size,
            "size": size,
            "query": bool_query
        }

        url = f"{self.es_url}/{self.index_name}/_search"
        response = requests.post(url, headers=self.default_headers, data=json.dumps(body), auth=self.auth)
        response.raise_for_status()

        res = response.json()
        hits = res["hits"]["hits"]
        total = res["hits"]["total"]["value"] if "total" in res["hits"] else len(hits)
        return hits, total
