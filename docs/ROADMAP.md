# What is built, what is not

Built and tested (see `scripts/run-tests.sh` and `scripts/closure-page.e2e.py`)
- Mission Closure: rocket equation, sourced masses, receipts, predict-then-reveal, fix tag, EN/বাংলা.
- Mission Advisor: rule-based hints that ask the question and never give the answer. No AI model, no network.
- Smart Debrief: score, resource efficiency, scientific accuracy, teamwork, mistakes, coaching, from the final simulation numbers.
- Mars Greenhouse: water, light, temperature and power make food; solar power drops with dust optical depth. Solar numbers are TEXTBOOK until checked against the NASA Mars Fact Sheet; crop yield is SIM.
- Classroom Challenge: a teacher builds a mission as a code or link; students play it; ranking is lowest launch mass among valid, safe designs; CSV export. Results are stored per browser (no server).

Not built
- Real Terrain Navigation. It needs a real NASA elevation tile (for example a Jezero DEM from the Mars Trek or HiRISE archive) pre-processed into a small height grid. Nobody on the team has downloaded and cleaned one yet, so there is no terrain feature, and the game does not claim one.
- A shared online leaderboard (needs the backend).
- An LLM-based assistant. The advisor is deliberately deterministic.
