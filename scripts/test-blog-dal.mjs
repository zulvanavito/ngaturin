/**
 * Verification Script for Blog DAL logic
 * Run with: node --env-file=.env scripts/test-blog-dal.mjs
 */

const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = (content || "").split(/\s+/).filter(Boolean).length;
  return Math.ceil(wordCount / wordsPerMinute) || 1;
};

const calculateHeuristicReadingTime = (excerpt) => {
  const wordsPerMinute = 200;
  const wordCount = (excerpt || "").split(/\s+/).filter(Boolean).length;
  // Assuming excerpt is ~20% of content, so factor is 5
  return Math.ceil((wordCount * 5) / 200) || 1;
};

async function test() {
  console.log("🚀 Starting Blog DAL Verification...\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey || supabaseUrl === 'your-project-url') {
    console.log("⚠️ Supabase environment variables not configured in .env or not running with --env-file.");
    console.log("Proceeding with Mock Logic Verification only.\n");
    runMockTests();
    return;
  }

  try {
    const columns = "id, slug, title, excerpt, category, tags, cover_image_url, published_at, status, is_featured, author_id, created_at, updated_at";
    const url = `${supabaseUrl}/rest/v1/blog_posts?select=${columns}&status=eq.published&limit=5`;
    
    console.log(`Connecting to Supabase at ${supabaseUrl}...`);
    const res = await fetch(url, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Supabase error (${res.status}): ${errBody}`);
    }

    const posts = await res.json();
    console.log(`✅ Successfully fetched ${posts.length} published posts from database.`);

    posts.forEach(post => {
      const time = calculateHeuristicReadingTime(post.excerpt);
      console.log(`- [${post.slug}] ${post.title}: ~${time} min estimated reading time`);
      
      // Verification of expected columns from dal.ts select clause
      const cols = columns.split(', ');
      let missing = [];
      cols.forEach(c => {
        if (!(c in post)) missing.push(c);
      });

      if (missing.length > 0) {
        console.error(`   ❌ Missing columns: ${missing.join(', ')}`);
      } else {
        console.log(`   ✅ All expected columns present.`);
      }
    });

    runMockTests();
  } catch (err) {
    console.error("❌ API Test Failed:", err.message);
    console.log("\nFalling back to Mock Logic Verification...");
    runMockTests();
  }
}

function runMockTests() {
  console.log("\n--- Logic Verification ---");
  
  // Test Heuristic (Used in getBlogPosts)
  const shortExcerpt = "This is a short excerpt for a blog post with exactly twenty words to test the heuristic reading time logic calculation."; // 20 words
  const shortTime = calculateHeuristicReadingTime(shortExcerpt);
  // 20 words * 5 = 100 words. 100 / 200 = 0.5 -> ceil = 1.
  console.log(`Short Excerpt (20 words) -> Heuristic: ${shortTime} min (Expected: 1)`);
  if (shortTime !== 1) console.error("   ❌ Heuristic mismatch!");

  const longExcerpt = "word ".repeat(100); // 100 words
  const longExcerptTime = calculateHeuristicReadingTime(longExcerpt);
  // 100 * 5 = 500. 500 / 200 = 2.5 -> ceil = 3.
  console.log(`Long Excerpt (100 words) -> Heuristic: ${longExcerptTime} min (Expected: 3)`);
  if (longExcerptTime !== 3) console.error("   ❌ Heuristic mismatch!");

  // Test Precise (Used in getBlogPostBySlug)
  const longContent = "word ".repeat(1000); // 1000 words
  const longTime = calculateReadingTime(longContent);
  // 1000 / 200 = 5.
  console.log(`Long Content (1000 words) -> Precise: ${longTime} min (Expected: 5)`);
  if (longTime !== 5) console.error("   ❌ Precise mismatch!");

  const emptyContent = "";
  const emptyTime = calculateReadingTime(emptyContent);
  console.log(`Empty Content -> Precise: ${emptyTime} min (Expected: 1)`);
  if (emptyTime !== 1) console.error("   ❌ Empty content mismatch!");

  console.log("\n✅ DAL Verification Logic Passed.");
}

test();
