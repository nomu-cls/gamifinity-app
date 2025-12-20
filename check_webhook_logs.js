import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnrwzjparinnlmbqdpuf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucnd6anBhcmlubmxtYnFkcHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMjkxNTksImV4cCI6MjA4MTYwNTE1OX0.FHEowoPfqbOxzJRbvdHCYvN1-zs6wg6tk2l_dVgY22k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
    console.log('Checking webhook logs...');
    const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching logs:', error);
        return;
    }

    console.log('Recent Webhook Logs:', JSON.stringify(data, null, 2));
}

checkLogs();
