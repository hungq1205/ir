from usecase import UseCase
from repo import Repo
from es_client import ESClient

class Service(UseCase):
    def __init__(self, es_client: ESClient, repo: Repo):
        self.es = es_client
        self.repo = repo

    def get(self, id: str) -> dict | None:
        news = self.repo.get_by_ids([str(id)])
        return news[0] if news else None

    def get_relevant(self, current_id: str, positive_ids: list[str], negative_ids: list[str], size: int = 5) -> list[dict]:
        hits = self.es.get_relevant(current_id, positive_ids, negative_ids, size=size)
        ids = [h["_id"] for h in hits]
        docs = self.repo.get_by_ids(ids)
        return docs

    def create(self, title: str, thumbnail: str, content: str, category: str, published_at: str) -> dict:
        new_id = self.repo.insert(title, thumbnail, content, category, published_at)
        new_doc = {"id": new_id, "thumbnail": thumbnail, "title": title, "content": content, "category": category, "published_at": published_at}
        self.es.index_document(new_id, new_doc)
        return new_doc

    def search(self, should: list[str], must: list[str], must_not: list[str], category: str, page: int = 1, size: int = 10) -> dict:
        hits, total = self.es.search(should, must, must_not, category, page=page, size=size)
        ids = [h["_id"] for h in hits]
        docs = self.repo.get_by_ids(ids)

        for doc, hit in zip(docs, hits):
            doc["score"] = hit["_score"]

        return { "total": total, "news": docs }
