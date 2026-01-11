import psycopg2
import os

class Repo:
    def insert(self, title, thumbnail, content, category):
        conn = get_connection()
        c = conn.cursor()
        c.execute(
            """
            INSERT INTO news (title, thumbnail, content, category)
            VALUES (%s, %s, %s, %s)
            RETURNING id;
            """,
            (title, thumbnail, content, category)
        )
        new_id = c.fetchone()[0]
        conn.commit()
        conn.close()
        return new_id

    def get_by_ids(self, ids):
        if not ids:
            return []
        conn = get_connection()
        c = conn.cursor()
        query = """
            SELECT id, title, thumbnail, content, category, published_at
            FROM news
            WHERE id = ANY(%s)
            ORDER BY published_at DESC
        """
        c.execute(query, (ids,))
        rows = c.fetchall()
        conn.close()
        return [
            {"id": r[0], "title": r[1], 'thumbnail': r[2], "content": r[3], "category": r[4], "published_at": r[5]} for r in rows
        ]

def get_connection():
    conn = psycopg2.connect(
        host="localhost",
        port=5433,
        user="postgres",
        password="postgres",
        database="newsdb"
    )
    return conn