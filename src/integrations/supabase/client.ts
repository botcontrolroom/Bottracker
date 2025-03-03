import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
// import { supabase } from "@/integrations/supabase/client";

// const SUPABASE_URL = import.meta.env.SUPABASE_URL;
// const SUPABASE_PUBLISHABLE_KEY = import.meta.env.SUPABASE_PUBLISHABLE_KEY;


const SUPABASE_URL = "https://mrqitiqgcmrinfnxdjlr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycWl0aXFnY21yaW5mbnhkamxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyOTA1ODYsImV4cCI6MjA1NTg2NjU4Nn0.fYhplo3JHv3ZfB3eDm764B6grDyFC0YLSO843HcXqHE";



if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);