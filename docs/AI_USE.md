# Use of AI in this project

## Tools
- **Claude** (Claude Code and claude.ai): first drafts of `src/compute/closure.ts`, `src/data/real/missionData.ts`,
  `scripts/closure.test.ts`, `scripts/run-tests.sh`, the closure page, and the project documentation.
- **ChatGPT image generation**: 12 concept images used only as reference for look, colour and layout
  (`design/reference/`). They are not shipped as game assets.

## What the AI did
- Drafted the closure maths (rocket equation, launcher capacity, cost), its 9 tests and the data file structure.
- Read the NASA pages listed in `docs/DATA_SOURCES.md` and entered the values with source and retrieval date.
- Drafted the documentation. Prompts: `presentation/CHATGPT_DESIGN_PROMPT.txt`, `presentation/CHATGPT_PROMPTS_REMAINING.txt`.

## What the AI did not do
- No AI model computes a number at run time. All closure maths is deterministic code.
- AI did not choose the challenge or decide the team's goals.

## What the team did
TEAM: describe in your own words what each member decided, reviewed, ran and tested
(idea and design decisions, checking each NASA value against the live page, running the tests,
usability test, classroom pilot). Do not submit this file with this paragraph unfilled.

## Background images in the game (public/images/scenes)
Tool: ChatGPT image generation. Purpose: photographic backdrops for menu, destination, design, closure and launch screens (cropped, resized and darkened; one mirrored).
They are AI-generated concept art and are labelled as such. Prompts: presentation/CHATGPT_*.txt. Any numbers visible inside these images are placeholders, blurred or covered in the game, and are not game data.

## Launch video (public/video/launch.mp4)
A 6 s launch clip supplied by the team (source and licence to be confirmed: TEAM: add the site or tool it came from). Re-encoded to 720 px, audio removed. If it is AI-generated it is labelled as such; if it is stock footage the licence must allow use in a competition entry.
