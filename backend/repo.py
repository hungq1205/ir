import psycopg2
import os

class Repo:
    def insert(self, title, content, label):
        conn = get_connection()
        c = conn.cursor()
        c.execute(
            "INSERT INTO news (title, content, label) VALUES (%s, %s, %s) RETURNING id;",
            (title, content, label)
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
            SELECT id, title, content, label
            FROM news
            WHERE id = ANY(%s)
            ORDER BY array_position(%s, id)
        """
        c.execute(query, (ids, ids))
        rows = c.fetchall()
        conn.close()
        return [
            {"id": r[0], "title": r[1], "content": r[2], "label": r[3]} for r in rows
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