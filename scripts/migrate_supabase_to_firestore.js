#!/usr/bin/env node
/**
 * Migration script: Supabase -> Firestore
 *
 * Usage:
 *  - Set environment variables:
 *      SUPABASE_URL
 *      SUPABASE_SERVICE_ROLE_KEY
 *      FIREBASE_SERVICE_ACCOUNT (JSON string) OR FIREBASE_SERVICE_ACCOUNT_PATH (file path)
 *  - Run: node scripts/migrate_supabase_to_firestore.js
 *
 * Notes:
 *  - This script is an idempotent scaffold: documents are written using the source row id as the Firestore document id.
 *  - For large datasets you should implement pagination; this basic script fetches all rows via a single select.
 */

const fs = require('fs')
const path = require('path')

async function main() {
  const { createClient } = require('@supabase/supabase-js')
  const admin = require('firebase-admin')

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env vars.')
    process.exit(1)
  }

  let serviceAccount
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    } catch (e) {
      console.error('FIREBASE_SERVICE_ACCOUNT is not valid JSON')
      process.exit(1)
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const p = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    if (!fs.existsSync(p)) {
      console.error('FIREBASE_SERVICE_ACCOUNT_PATH does not exist:', p)
      process.exit(1)
    }
    serviceAccount = require(p)
  } else {
    console.error('Missing Firebase service account. Set FIREBASE_SERVICE_ACCOUNT (JSON) or FIREBASE_SERVICE_ACCOUNT_PATH.')
    process.exit(1)
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })

  const firestore = admin.firestore()

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Tables to migrate: map supabase_table -> firestore_collection
  const tables = [
    ['user_profiles', 'users'],
    ['departments', 'departments'],
    ['classrooms', 'classrooms'],
    ['subjects', 'subjects'],
    ['batches', 'batches'],
    ['time_slots', 'time_slots'],
    ['timetables', 'timetables'],
    ['timetable_entries', 'timetable_entries'],
    ['subject_faculty', 'subject_faculty'],
    ['faculty_availability', 'faculty_availability']
  ]

  for (const [table, collection] of tables) {
    try {
      console.log(`Fetching from Supabase table: ${table}`)
      const { data, error } = await supabase.from(table).select('*')
      if (error) {
        console.error(`Error querying ${table}:`, error)
        continue
      }

      console.log(`Migrating ${data.length} rows from ${table} -> ${collection}`)

      let migrated = 0
      for (const row of data) {
        try {
          const docId = row.id || row.uid || row.uuid || undefined
          const docRef = docId ? firestore.collection(collection).doc(String(docId)) : firestore.collection(collection).doc()
          // Write row as-is; you may want to transform timestamps/JSON arrays
          await docRef.set(row, { merge: true })
          migrated++
        } catch (e) {
          console.error(`Failed to write row to ${collection}:`, e)
        }
      }
      console.log(`Migrated ${migrated}/${data.length} rows into ${collection}`)
    } catch (err) {
      console.error(`Unexpected error migrating table ${table}:`, err)
    }
  }

  console.log('Migration completed')
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration script failed:', err)
  process.exit(1)
})
