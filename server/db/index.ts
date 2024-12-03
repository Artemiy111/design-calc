import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

const client = createClient({ url: 'file:db.sqlite3' })
export const db = drizzle({ client }) 