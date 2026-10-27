
const SUPABASE_URL = "https://jrhpuqtgokjkfzbnfyud.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_kyR8IZENt2_pVTQJ1I0OSg_d5lpTfcQ";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLIC_KEY
);
