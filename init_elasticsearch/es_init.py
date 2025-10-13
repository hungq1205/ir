from elasticsearch import Elasticsearch, helpers
import pandas as pd

ES_HOST = "http://localhost:9200"
INDEX_NAME = "news"

USERNAME = "elastic"
PASSWORD = "changeme"

df = pd.read_csv("news-1000.csv")

mapping = {
    "mappings": {
        "_source": { "enabled": False },
        "properties": {
            "title": {"type": "text", "analyzer": "standard"},
            "content": {"type": "text", "analyzer": "standard"},
            "label": {"type": "keyword"}
        }
    }
}

es = Elasticsearch(
    ES_HOST,
    basic_auth=(USERNAME, PASSWORD),
    verify_certs=False
)
es.indices.create(index=INDEX_NAME, body=mapping)

actions = []
for _, row in df.iterrows():
    doc = {
        "title": row["title"],
        "content": row["content"],
        "label": row["label"]
    }
    actions.append({
        "_index": INDEX_NAME,
        "_id": row["id"],
        "_source": doc
    })
    print(f"Prepared document {row['id']}")

helpers.bulk(es, actions)
print(f"Indexed {len(actions)} documents into '{INDEX_NAME}'")
