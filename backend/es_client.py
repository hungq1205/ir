from elasticsearch import Elasticsearch 

class ESClient:
    def __init__(self, es, index_name="news"):
        self.es = es
        self.index_name = index_name

    def index_document(self, doc_id: int, document: dict):
        return self.es.index(index=self.index_name, id=doc_id, document=document)

    def search(self, query: str, from_: int = 0, size: int = 10):
        body = {
            "from": from_,
            "size": size,
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": ["title", "content", "label"],
                    "operator": "and"
                }
            }
        }
        res = self.es.search(index=self.index_name, body=body)
        hits = res["hits"]["hits"]
        total = res["hits"]["total"]["value"] if "total" in res["hits"] else len(hits)
        return hits, total
