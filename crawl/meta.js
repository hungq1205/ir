import fs from "fs";

const BASE_URL = "https://gw.vnexpress.net/ar/get_rule_1";

const CATEGORY_ID = 1001005;
const LIMIT = 50;
const MAX_ARTICLES = 100_000;

const allArticles = [];
const fails = [];

function writeCSV(filename, rows) {
	if (!rows.length) return;

	const headers = Object.keys(rows[0]);
	const csv = [
		headers.join(","),
		...rows.map(row =>
			headers.map(h =>
				`"${String(row[h] ?? "").replace(/"/g, '""')}"`
			).join(",")
		),
	].join("\n");

	fs.writeFileSync(filename, csv, "utf8");
}

async function crawlPages(pages) {
	for (const page of pages) {
		if (allArticles.length >= MAX_ARTICLES) break;

		const url = new URL(BASE_URL);
		url.search = new URLSearchParams({
			category_id: CATEGORY_ID,
			limit: LIMIT,
			page,
			data_select:
				"article_id,article_type,share_url,publish_time,thumbnail_url",
		});

		try {
			const res = await fetch(url, { timeout: 10_000 });

			if (!res.ok) {
				throw new Error(`HTTP ${res.status}`);
			}

			const json = await res.json();
			const articles =
				json?.data?.[CATEGORY_ID]?.data ?? [];

			if (!articles.length) {
				console.log(`[STOP] No data at page ${page}`);
				break;
			}

			for (const item of articles) {
				if (allArticles.length >= MAX_ARTICLES) break;

				allArticles.push({
					article_id: item.article_id,
					article_type: item.article_type,
					share_url: item.share_url,
					thumbnail_url: item.thumbnail_url,
					publish_time: item.publish_time,
				});
			}

			if (page % 10 === 0)
				console.log(`[OK] Page ${page} | Total: ${allArticles.length}`);
		} catch (err) {
			console.log(`[SKIP] Page ${page} error: ${err.message}`);
			fails.push(page);
			await sleep(30_000);
			continue;
		}

		await sleep(250);
	}
}
function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

(async () => {	
	await crawlPages(Array.from({ length: 10000 }, (_, i) => i + 1))
	
	writeCSV(`${Math.floor(allArticles.length / 1000)}k_vne_${CATEGORY_ID}_articles.csv`, allArticles);
	console.log("CSV written:", allArticles.length);
	
	fs.writeFileSync(`failed_vne_${CATEGORY_ID}_pages.csv`, fails.join(","), "utf8");
})();
  