import { USER_AGENT } from "./shared";

const queries = process.argv.slice(2);
if (queries.length === 0) {
  console.error("usage: bun scripts/images/_commons-search.ts query [query…]");
  process.exit(1);
}

for (const query of queries) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("list", "search");
  url.searchParams.set("srsearch", query);
  url.searchParams.set("srnamespace", "6");
  url.searchParams.set("srlimit", "8");
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  const data = (await response.json()) as {
    query?: { search?: Array<{ title: string }> };
  };
  console.log(`\n=== ${query} ===`);
  for (const hit of data.query?.search ?? []) console.log(hit.title);
}
