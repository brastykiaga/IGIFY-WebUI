import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    watch: {
      // Editors that write through a temporary directory inside src/ (dot
      // prefixed, ending in .tmpdir) can otherwise crash the file watcher with
      // EBUSY on Windows.
      ignored: ['**/.*.tmpdir/**', '**/*.tmp', '**/*.TMP', '**/*~RF*', '**/.~*', '**/.git/**'],
    },
  },
  preview: { host: '0.0.0.0' },
})
