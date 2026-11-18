import { wevuSfc } from '@wevu/test-utils/vitest'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [wevuSfc()],
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.ts', 'src/**/*.spec.ts', 'scripts/**/*.test.mjs'],
    reporters: 'default',
  },
})
