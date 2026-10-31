# Smriti

Learn crochet stitch by stitch. Smriti reads a written crochet pattern and builds the piece in 3D, round by round, so you can see what each round does before you make it.

## What it does

- **Pattern to 3D model.** Paste a pattern like `R3: [sc, inc] x6 (18)` and Smriti builds the piece from it.
- **Round by round.** Select a round to see the piece up to that point, with the round marked.
- **Stitch by stitch.** Play a round to watch each stitch get made, or jump to any stitch.
- **Count checking.** Every round's stitch count is worked out and compared with the count written in the pattern, so mistakes show up.

## How the shape is made

The model isn't drawn by hand. Each round's radius comes from its stitch count, the same way real crochet gets its shape:

- Increases make the round wider, so the piece flares out.
- Even rounds keep the width, so the piece goes straight up.
- Decreases pull it back in.

Change the pattern and the shape changes with it.

## Project structure

```
smriti/
  apps/web          React + Vite app, 3D model with React Three Fiber
  packages/parser   Pattern grammar (Peggy), stitch counting, round expansion
```

The parser is its own package so the same code can run in the browser and, later, on the server.

## Supported so far

Crochet in the round (amigurumi style), US terms:

- `ch`, `sl st`, `sc`, `hdc`, `dc`, `inc`, `dec`
- `in magic ring`, `in each st`
- Repeats like `[2 sc, inc] x6`
- Stitch counts like `(24)`

## Run it locally

Requires Node and pnpm.

```
pnpm install
pnpm dev     # start the app
pnpm test    # run parser tests
pnpm build   # production build
```

## Roadmap

- **Foundations:** animated 3D lessons for each stitch, with hook and yarn
- **Pattern library:** a set of ready-to-try patterns
- **Try your pattern:** paste or upload any pattern, no sign-up needed
- **Accounts:** sign in to save your own patterns
- **Backend:** Hono API and MongoDB
- **Knitting:** flat knitting patterns as grid charts
- **Hand guidance:** webcam-based feedback on how you hold the hook
