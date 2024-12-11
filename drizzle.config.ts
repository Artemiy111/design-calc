import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dbCredentials: {
    url: 'file:.data/db.sqlite3',
  },
  dialect: 'turso',
  out: './server/db/migrations',
  schema: './server/db/schema.ts',
})
