const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('needs').select('*');
  if (error) {
    console.error("DB Error:", error.message);
  } else {
    console.log("Needs count:", data.length);
  }
}
test();
