CREATE TABLE webhook_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    payload jsonb,
    error_message text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (optional but good practice, though we will insert via service role or anon key with policy)
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon insert (since webhook uses anon key)
CREATE POLICY "Enable insert for everyone" ON webhook_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for everyone" ON webhook_logs FOR SELECT USING (true);
