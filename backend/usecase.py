from abc import ABC, abstractmethod

class UseCase(ABC):

    @abstractmethod
    def get(self, new_id: int) -> dict | None:
        """Get news by ID"""
        pass

    @abstractmethod
    def create(self, title: str, content: str, label: str) -> dict:
        """Create news"""
        pass

    @abstractmethod
    def search(self, query: str) -> list[dict]:
        """Search news"""
        pass
