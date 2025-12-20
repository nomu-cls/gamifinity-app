import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnrwzjparinnlmbqdpuf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucnd6anBhcmlubmxtYnFkcHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMjkxNTksImV4cCI6MjA4MTYwNTE1OX0.FHEowoPfqbOxzJRbvdHCYvN1-zs6wg6tk2l_dVgY22k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking for recent bookings...');
    const { data, error } = await supabase
        .from('user_stories')
        .select('id, user_id, line_user_id, email, is_session_booked, booked_at, event_schedule, updated_at')
        // .eq('is_session_booked', true)
        .order('updated_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Recent bookings:', JSON.stringify(data, null, 2));
}

check();
