# MockFlow — Frontend

The visual workflow editor: Next.js 16, ReactFlow, Tailwind 4, Zustand, shadcn/ui.

See the [root README](../README.md) for the full project overview, architecture, and deployment guide.

## Develop

```bash
cp .env.example .env.local   # Supabase URL + anon key
npm install
npm run dev                  # http://localhost:3000
```

Deployed mock endpoints are served by Netlify Functions — run `netlify dev` from the repo root to test the full save → deploy → curl loop locally.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — eslint
- `npm test` — vitest (executor + expression evaluator)

## Key paths

- `src/components/editor/` — canvas, toolbar, node config panel
- `src/components/nodes/` — the 6 node types
- `src/lib/productionExecutor.ts` — client-side workflow executor (mirrors `backend/src/workflowExecutor.ts`)
- `src/lib/safeEval.ts` — expression evaluator for Conditional nodes
- `src/lib/templates.ts` — built-in workflow templates
