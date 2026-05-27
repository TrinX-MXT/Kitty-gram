import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    // Proxy убран — все запросы идут напрямую к бэкенду
})