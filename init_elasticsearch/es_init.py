import json
import requests
import pandas as pd

ES_HOST = "http://localhost:9200"
INDEX_NAME = "news"
USERNAME = "elastic"
PASSWORD = "changeme"

df = pd.read_csv("news-6k.csv")
headers = {"Content-Type": "application/json"}

requests.delete(
    f"{ES_HOST}/{INDEX_NAME}",
    auth=(USERNAME, PASSWORD)
)

mapping = {
    "settings": {
        "analysis": {
            "filter": {
                "bigram_shingle": {
                    "type": "shingle",
                    "min_shingle_size": 2,
                    "max_shingle_size": 2,
                    "output_unigrams": False
                }
            },
            "analyzer": {
                "unigram": {
                    "type": "standard",
                    "stopwords": "_english_"
                },
                "unigram_bigram": {
                    "type": "custom",
                    "tokenizer": "standard",
                    "filter": ["lowercase", "stop", "bigram_shingle"]
                }
            }
        }
    },
    "mappings": {
        "_source": {"enabled": True},
        "properties": {
            "title": {
                "type": "text",
                "fields": {
                    "uni": {"type": "text", "analyzer": "unigram"},
                    "bi":  {"type": "text", "analyzer": "unigram_bigram"}
                }
            },
            "content": {
                "type": "text",
                "fields": {
                    "uni": {"type": "text", "analyzer": "unigram"},
                    "bi":  {"type": "text", "analyzer": "unigram_bigram"}
                }
            },
            "category": {"type": "keyword"},
            "published_at": {"type": "date"}
        }
    }
}

resp = requests.put(
    f"{ES_HOST}/{INDEX_NAME}",
    headers=headers,
    data=json.dumps(mapping),
    auth=(USERNAME, PASSWORD)
)
resp.raise_for_status()

bulk_lines = []

for _, row in df.iterrows():
    action = {"index": {"_index": INDEX_NAME, "_id": int(row["article_id"])}}
    doc = {
        "title": str(row["title"]) if pd.notna(row["title"]) else "",
        "content": str(row["content"]) if pd.notna(row["content"]) else "",
        "category": str(row["cate_name"]) if pd.notna(row["cate_name"]) else "",
        "published_at": str(row["publish_time"]) if pd.notna(row["publish_time"]) else None
    }
    bulk_lines.append(json.dumps(action, ensure_ascii=False))
    bulk_lines.append(json.dumps(doc, ensure_ascii=False))

bulk_body = "\n".join(bulk_lines) + "\n"
resp = requests.post(
    f"{ES_HOST}/_bulk",
    headers=headers,
    data=bulk_body.encode("utf-8"),
    auth=(USERNAME, PASSWORD)
)
resp.raise_for_status()

print(f"Indexed {len(df)} documents into '{INDEX_NAME}' successfully")
