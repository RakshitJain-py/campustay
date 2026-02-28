import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Need service key for raw sql or RPC, but we'll try without first

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    console.log("Checking how public_identities is defined...");

    // We can't easily query information_schema from the anon client.
    // Let's check if explicitly referencing the foreign key in the query helps.

    const testPropertyId = "e4b1379b-fdd0-4d2d-9a6d-02ee0cb8af6d";

    // Attempt 1: Try without alias first to see if that works
    console.log("\n--- Attempting without alias:");
    const { data: noAlias, error: err1 } = await supabase
        .from("reviews")
        .select(`
          id,
          user_id,
          public_identities (name, avatar_url)
        `)
        .eq("property_id", testPropertyId)
        .limit(2);
    console.log(JSON.stringify(noAlias, null, 2));
    console.log("Error:", err1?.message);

    // Attempt 2: Try explicit FK syntax if multiple paths exist
    console.log("\n--- Attempting with explicit FK:");
    const { data: explicitFk, error: err2 } = await supabase
        .from("reviews")
        .select(`
          id,
          user_id,
          public_identities!reviews_user_id_fkey (name, avatar_url)
        `)
        .eq("property_id", testPropertyId)
        .limit(2);
    console.log(JSON.stringify(explicitFk, null, 2));
    console.log("Error:", err2?.message);
}

checkSchema();
