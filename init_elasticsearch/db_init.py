import psycopg2
import pandas as pd

df = pd.read_csv("news-1000.csv")

conn = psycopg2.connect(
    host="localhost",
    port=5433,
    user="postgres",
    password="postgres",
    database="newsdb"
)

c = conn.cursor()
for _, row in df.iterrows():
    c.execute(
        """
        INSERT INTO news (id, title, content, label)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (id) DO NOTHING
        """,
        (int(row["id"]), row["title"], row["content"], row["label"])
    )

conn.commit()
conn.close()
print(f"Inserted {len(df)} records into database")