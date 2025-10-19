import requests
import json
import pandas as pd

ES_HOST = "http://localhost:9200"
INDEX_NAME = "news"
USERNAME = "elastic"
PASSWORD = "changeme"

df = pd.read_csv("news-1000.csv")

headers = {"Content-Type": "application/json"}
mapping = {
    "mappings": {
        "_source": {"enabled": True},
        "properties": {
            "title": {"type": "text", "analyzer": "standard"},
            "content": {"type": "text", "analyzer": "standard"},
            "label": {"type": "keyword"}
        }
    }
}

resp = requests.put(
    f"{ES_HOST}/{INDEX_NAME}", 
    headers=headers, 
    data=json.dumps(mapping), 
    auth=(USERNAME, PASSWORD)
)
if resp.status_code not in (200, 201):
    print("Index creation response:", resp.status_code, resp.text)

bulk_lines = []
for _, row in df.iterrows():
    action = {"index": {"_index": INDEX_NAME, "_id": int(row["id"])}}
    doc = {
        "title": str(row["title"]),
        "content": str(row["content"]),
        "label": str(row["label"]),
    }
    bulk_lines.append(json.dumps(action))
    bulk_lines.append(json.dumps(doc))

bulk_body = "\n".join(bulk_lines) + "\n"
resp = requests.post(
    f"{ES_HOST}/_bulk", 
    headers=headers, 
    data=bulk_body.encode("utf-8"), 
    auth=(USERNAME, PASSWORD)
)
resp.raise_for_status()

result = resp.json()
if result.get("errors"):
    print("Bulk index errors detected")
else:
    print(f"Indexed {len(df)} documents into '{INDEX_NAME}' successfully")
