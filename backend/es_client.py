from elasticsearch import Elasticsearch 

class ESClient:
    def __init__(self, es, index_name="news"):
        self.es = es
        self.index_name = index_name

    def index_document(self, doc_id: int, document: dict):
        return self.es.index(index=self.index_name, id=doc_id, document=document)

    def search(self, query: str):
        body = {
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": ["title", "content", "label"]
                }
            }
        }
        res = self.es.search(index=self.index_name, body=body)
        return res["hits"]["hits"]
