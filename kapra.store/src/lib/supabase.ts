import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://porvflhkbxteqnnhnzpi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcnZmbGhrYnh0ZXFubmhuenBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNDg1OTAsImV4cCI6MjA1MjgyNDU5MH0.aK6Ukc8Tvi5B78xsPhYiArXo2RZyb43SBVnxFIeBgHs'

export const supabase = createClient(supabaseUrl, supabaseKey) 