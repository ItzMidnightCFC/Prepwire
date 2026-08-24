import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://mxpwhbneyalbwqopigaf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14cHdoYm5leWFsYndxb3BpZ2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTI0MTYsImV4cCI6MjA4MzMyODQxNn0.baGh1ajl5wIi-sO8maB1phUoMpkt0dspLlegWrecMZM";

export const supabase = createClient(supabaseUrl, supabaseKey);
