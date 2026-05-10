import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setup() {
  console.log('Setting up storage bucket...')
  const { data, error } = await supabase.storage.createBucket('listing-documents', {
    public: false, // Documents should be private, only accessible via signed URLs or to admin
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    fileSizeLimit: 10485760 // 10MB
  })

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Bucket already exists.')
    } else {
      console.error('Error creating bucket:', error.message)
    }
  } else {
    console.log('Bucket created successfully.')
  }
}

setup()
