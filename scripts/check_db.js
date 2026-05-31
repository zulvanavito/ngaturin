const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkTable(tableName) {
  const res = await fetch(`${url}/rest/v1/${tableName}?select=*&limit=1`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  console.log(tableName, res.status, res.statusText);
  if (res.ok) {
    console.log(await res.json());
  }
}

async function main() {
  await checkTable('blog_categories');
  await checkTable('post_categories');
  await checkTable('categories');
}

main();
