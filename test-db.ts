import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envFile = fs.readFileSync(".env", "utf8");
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=(.*)/);

const supabase = createClient(urlMatch[1], keyMatch[1]);
supabase.from("investments").select("*").then((res) => console.log(JSON.stringify(res.data, null, 2)));
