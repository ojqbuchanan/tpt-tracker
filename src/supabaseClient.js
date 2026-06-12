import { createClient } from "@supabase/supabase-js";

// Replace these with the values from Supabase → Project Settings → API
const SUPABASE_URL = "https://uawdclpjxebgviioodmx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhd2RjbHBqeGViZ3ZpaW9vZG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMTU0NzgsImV4cCI6MjA5Njc5MTQ3OH0.N4S1zxn6WK33xNj-C7vPRhAqlJQYDRWgGcZFLIhHY5w";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
