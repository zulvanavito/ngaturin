const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkTable(tableName) {
  const res = await fetch(`${url}/rest/v1/${tableName}?select=*`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  console.log(tableName, res.status, res.statusText);
  if (res.ok) {
    console.log(JSON.stringify(await res.json(), null, 2));
  }
}

async function main() {
  await checkTable('blog_categories');
}

main();
