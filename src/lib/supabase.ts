import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  || 'https://jkbfjyesyveastwrbcrg.supabase.co';

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYmZqeWVzeXZlYXN0d3JiY3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Nzg3OTIsImV4cCI6MjA5NTU1NDc5Mn0.ofafxQlJSzWjtykvrt-GUu6biPmmKZYKUR-ffu0M-tY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
