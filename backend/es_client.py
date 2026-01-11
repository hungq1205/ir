import requests
import json
from requests.auth import HTTPBasicAuth
from collections import defaultdict

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

    def get_relevant(
        self,
        current_id: int,
        positive_ids: list[int],
        negative_ids: list[int],
        size: int = 5
    ):
        term_weights = defaultdict(float)

        # current article: alpha = 1.0
        for term, w in self._get_terms(current_id).items():
            term_weights[term] += 1.0 * w

        # positive samples: beta = 0.6
        for pid in positive_ids:
            for term, w in self._get_terms(pid).items():
                term_weights[term] += 0.6 * w / max(len(positive_ids), 1)

        # negative samples: gamma = 0.3
        for nid in negative_ids:
            for term, w in self._get_terms(nid).items():
                term_weights[term] -= 0.3 * w / max(len(negative_ids), 1)

        term_weights = {t: w for t, w in term_weights.items() if w > 0}
        top_terms = sorted(term_weights.items(), key=lambda x: x[1], reverse=True)[:30]

        should = []
        for term, weight in top_terms:
            field = "title.bi" if "_" in term else "title.uni"
            should.append({
                "match": {
                    field: {
                        "query": term,
                        "boost": round(weight, 3)
                    }
                }
            })

        body = {
            "size": size,
            "query": {
                "bool": {
                    "should": should,
                    "must_not": [
                        {"terms": {"_id": [current_id] + positive_ids}}
                    ],
                    "minimum_should_match": 1
                }
            }
        }

        url = f"{self.es_url}/{self.index_name}/_search"
        r = requests.post(url, json=body, auth=self.auth)
        r.raise_for_status()

        return r.json()["hits"]["hits"]

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
    
    def _get_terms(self, doc_id: int, max_terms: int = 20):
        url = f"{self.es_url}/{self.index_name}/_termvectors/{doc_id}"
        body = {
            "fields": ["title.uni", "title.bi", "content.uni"],
            "term_statistics": True
        }
        r = requests.post(url, json=body, auth=self.auth)
        r.raise_for_status()

        tv = r.json().get("term_vectors", {})
        terms = {}

        for field in tv.values():
            for term, stats in field["terms"].items():
                tf = stats["term_freq"]
                idf = stats.get("idf", 1.0)
                terms[term] = tf * idf

        return dict(sorted(terms.items(), key=lambda x: x[1], reverse=True)[:max_terms])
