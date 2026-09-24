import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/rest\/v1\/?$/, '') ||
  'https://cpvtdcfnrmrcyhghrren.supabase.co'

export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  'sb_publishable_y7qlVP60n_MsqQNBr2L8aQ_1FuRZR_W'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const isSupabaseConfigured = () => Boolean(supabase)
