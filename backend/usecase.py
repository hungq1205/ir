from abc import ABC, abstractmethod

class UseCase(ABC):

    @abstractmethod
    def get(self, new_id: str) -> dict | None:
        """Get news by ID"""
        pass

    @abstractmethod
    def get_relevant(self, current_id: str, positive_ids: list[str], negative_ids: list[str], size: int = 5) -> list[dict]:
        """Get relevant news"""
        pass

    @abstractmethod
    def create(self, title: str, content: str, label: str) -> dict:
        """Create news"""
        pass

    @abstractmethod
    def search(self, should: list[str], must: list[str], must_not: list[str], category: str, page: int = 1, size: int = 10) -> dict:
        """Search news -> returns dict: { "total": n, "news": [...] }"""
        pass
