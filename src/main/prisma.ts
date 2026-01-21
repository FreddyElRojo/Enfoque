import { PrismaClient } from '@prisma/client'
import path from 'path'
import { app } from 'electron' // ← Import faltante

export let prisma: PrismaClient

if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
  const dbPath = 'D:/aplicaciones/Enfoque/enfoque-app/prisma/dev.db'
  process.env.DATABASE_URL = `file:${dbPath}`
  console.log('DEV - DATABASE_URL:', process.env.DATABASE_URL)
} else {
  const dbPath = path.join(app.getPath('userData'), 'enfoque.db')
  process.env.DATABASE_URL = `file:${dbPath}`
  console.log('PROD - DATABASE_URL:', process.env.DATABASE_URL)
}

prisma = new PrismaClient()