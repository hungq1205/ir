import psycopg2
import pandas as pd
from psycopg2.extras import execute_batch

df = pd.read_csv("news-6k.csv")

conn = psycopg2.connect(
    host="localhost",
    port=5433,
    user="postgres",
    password="postgres",
    database="newsdb"
)

records = []
for _, row in df.iterrows():
    records.append((
        row["article_id"],
        row["thumbnail_url"] or "",
        row["title"] if row["title"] else "Untitled",
        row["content"],
        row["cate_name"],
        pd.to_datetime(row["publish_time"], errors="coerce", unit="s") if not pd.isna(row["publish_time"]) else pd.Timestamp.now()
    ))

with conn:
    with conn.cursor() as c:
        execute_batch(
            c,
            """
            INSERT INTO news (id, thumbnail, title, content, category, published_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            records,
            page_size=200
        )

conn.close()
print(f"Inserted {len(records)} records into database")
