import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTables() {
  // Query information_schema
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .limit(1);

  if (error) {
    console.log("Error querying blog_categories:", error.message);
  } else {
    console.log("blog_categories exists:", data);
  }
}

checkTables();
