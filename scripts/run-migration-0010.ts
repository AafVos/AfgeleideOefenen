/**
 * Migration 0010: Add is_skipped flag to user_progress.
 * Run with: npx tsx scripts/run-migration-0010.ts
 *
 * Note: Supabase JS client cannot run arbitrary DDL. Use the Supabase SQL
 * Editor or `psql` to run the .sql file directly. This script just prints
 * the SQL so you can paste it into the SQL editor.
 */
import * as fs from 'fs'
import * as path from 'path'

const sqlPath = path.join(
  __dirname,
  '..',
  'supabase',
  'migrations',
  '0010_user_progress_skipped.sql',
)

const sql = fs.readFileSync(sqlPath, 'utf8')

console.log('────────────────────────────────────────────────────────────')
console.log('Run this SQL in Supabase Dashboard → SQL Editor:')
console.log('────────────────────────────────────────────────────────────')
console.log(sql)
console.log('────────────────────────────────────────────────────────────')
