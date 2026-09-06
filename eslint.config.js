import neostandard from 'neostandard'

export default [
  ...neostandard({
    ts: true,
    noStyle: false,
  }),
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/generated/**',
      'apps/web/**',
      'packages/eslint-config/**',
      'packages/ui/**',
    ],
  },
]
