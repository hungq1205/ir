from usecase import UseCase
from repo import Repo
from es_client import ESClient

class Service(UseCase):
    def __init__(self, es_client: ESClient, repo: Repo):
        self.es = es_client
        self.repo = repo

    def get(self, id: int) -> dict | None:
        news = self.repo.get_by_ids([id])

        return news[0] if news else None

    def create(self, title: str, content: str, label: str) -> dict:
        new_id = self.repo.insert(title, content, label)
        new_doc = {"id": new_id, "title": title, "content": content, "label": label}
        self.es.index_document(new_id, new_doc)

        return new_doc

    def search(self, query: str, page: int = 1, size: int = 10) -> dict:
        from_ = (page - 1) * size
        hits, total = self.es.search(query, from_=from_, size=size)
        ids = [int(h["_id"]) for h in hits]
        docs = self.repo.get_by_ids(ids)

        return { "total": total, "news": docs }
