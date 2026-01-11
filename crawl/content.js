import fs from "fs";
import * as cheerio from "cheerio";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

const INPUT_CSV = "26k_vne_1001005_articles.csv";
const OUTPUT_CSV = INPUT_CSV.replace(".csv", "_content.csv");
const FAIL_CSV = INPUT_CSV.replace(".csv", "_content_failed.csv");

const START_INDEX = 14739;
const CONCURRENCY = 2;
const FLUSH_SIZE = 100;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const rows = parse(fs.readFileSync(INPUT_CSV), {
  columns: true,
  skip_empty_lines: true,
});

let resultsBuffer = [];
const fails = [];
let headerWritten = false;

function flushResults() {
  if (!resultsBuffer.length) return;

  const csv = stringify(resultsBuffer, {
    header: !headerWritten,
  });

  fs.appendFileSync(OUTPUT_CSV, csv, "utf8");
  headerWritten = true;
  resultsBuffer = [];
}

async function crawlArticle(row, index) {
  try {
    const res = await fetch(row.share_url, { timeout: 10_000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    const paragraphs = [];
    $('.fck_detail p.Normal, .fck_detail p.t-content').each((_, el) => {
      const text = $(el).text().trim();
      if (text) paragraphs.push(text);
    });

    if (!paragraphs.length)
      throw new Error("No content found");

    resultsBuffer.push({
      ...row,
      content: paragraphs.join("\n\n"),
    });

    if (resultsBuffer.length >= FLUSH_SIZE) {
      flushResults();
      console.log(`[FLUSH] ${index + 1}/${rows.length}`);
    }
  } catch (err) {
    console.log(`[SKIP] ${row.share_url}`);
    fails.push(row.share_url);
  }

  await sleep(250);
}

async function main() {
  if (fs.existsSync(OUTPUT_CSV)) fs.unlinkSync(OUTPUT_CSV);

  let index = START_INDEX;

  async function worker() {
    while (index < rows.length) {
      const i = index++;
      await crawlArticle(rows[i], i);
    }
  }

  await Promise.all(
    Array.from({ length: CONCURRENCY }, worker)
  );

  flushResults();
  fs.writeFileSync(FAIL_CSV, fails.join("\n"), "utf8");

  console.log("DONE");
  console.log("Articles:", headerWritten ? "written incrementally" : 0);
  console.log("Failed:", fails.length);
}

main();
