#!/usr/bin/env node

const { spawn } = require('node:child_process')
const fs = require('node:fs')

const env = { ...process.env }

;(async() => {
  // If running the web server then set up the database
  if (process.argv.slice(2).join(' ').includes('start')) {
    // Push schema to database (creates tables if missing)
    await exec('npx prisma db push --skip-generate')

    // Seed if first run (no users exist)
    try {
      await exec('node -e "const{PrismaClient}=require(\'@prisma/client\');new PrismaClient().user.count().then(c=>{if(c===0){process.exit(1)}else{process.exit(0)}})"')
      console.log('[entrypoint] Database already seeded, skipping.')
    } catch {
      console.log('[entrypoint] First run — seeding database...')
      await exec('node prisma/seed.js')
    }
  }

  // Launch application
  await exec(process.argv.slice(2).join(' '))
})()

function exec(command) {
  const child = spawn(command, { shell: true, stdio: 'inherit', env })
  return new Promise((resolve, reject) => {
    child.on('exit', code => {
      if (code === 0) resolve()
      else reject(new Error(`${command} failed rc=${code}`))
    })
  })
}
