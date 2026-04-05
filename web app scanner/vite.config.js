import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const certDir = path.join(__dirname, '.certs')
const keyFile = path.join(certDir, 'key.pem')
const certFile = path.join(certDir, 'cert.pem')

// Generate self-signed certs if they don't exist yet
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true })

if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
  try {
    execSync(
      `openssl req -x509 -newkey rsa:2048 -keyout "${keyFile}" -out "${certFile}" -days 3650 -nodes -subj "/CN=localhost"`,
      { stdio: 'ignore' }
    )
    console.log('✅ SSL certificate generated')
  } catch {
    console.warn('⚠️  openssl not found — using HTTP (camera will not work on mobile)')
  }
}

const hasCerts = fs.existsSync(keyFile) && fs.existsSync(certFile)

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    https: hasCerts
      ? { key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile) }
      : false,
  },
  preview: {
    host: '0.0.0.0',
    https: hasCerts
      ? { key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile) }
      : false,
  }
})
