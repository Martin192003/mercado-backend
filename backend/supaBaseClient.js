// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sakuygyooydxdrbrqzwk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNha3V5Z3lvb3lkeGRyYnJxendrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NDY2MTUsImV4cCI6MjA2MDEyMjYxNX0.ydrreJ7V1ctyZ0rF-L8UrKBo70kCAoP4gwD9l1xFRVg' 
            
export const supabase = createClient(supabaseUrl, supabaseAnonKey)