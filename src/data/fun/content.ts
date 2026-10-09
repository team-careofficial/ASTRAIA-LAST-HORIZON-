// All facts here are well-established, general-knowledge space facts (tag: REAL).
export const FACTS: { t: string; text: string }[] = [
  { t: "A Mars day is a SOL", text: "One sol on Mars lasts 24 hours 39 minutes 35 seconds — a little longer than an Earth day." },
  { t: "The Moon is drifting away", text: "The Moon moves about 3.8 cm farther from Earth every year, measured with lasers bounced off mirrors left by Apollo astronauts." },
  { t: "A giant volcano", text: "Olympus Mons on Mars is about 22 km tall — roughly two and a half times the height of Mount Everest." },
  { t: "Long lunar days", text: "One day-night cycle on the Moon lasts about 29.5 Earth days, so daylight and night each last about two weeks." },
  { t: "Fast, but not instant", text: "Light takes about 1.3 seconds to travel from the Moon to Earth." },
  { t: "Two tiny moons", text: "Mars has two small moons, Phobos and Deimos. Phobos is slowly moving closer to Mars." },
  { t: "First flight on another world", text: "NASA's Ingenuity helicopter made the first powered, controlled flight on another planet in April 2021." },
  { t: "A long Mars year", text: "A year on Mars lasts about 687 Earth days — almost twice as long as ours." },
  { t: "Thin, poisonous air", text: "Mars's air is about 95% carbon dioxide and very thin. Humans could not breathe it." },
  { t: "No sound in space", text: "Sound needs air to travel through. In the vacuum of space, no one can hear you scream — or your engines." },
  { t: "Light-weight on the Moon", text: "Moon gravity is about one sixth of Earth's. A person who weighs 60 kg on Earth would weigh about 10 kg on the Moon." },
  { t: "Why Mars is red", text: "Mars looks red because its dust contains iron oxide — the same stuff as rust." },
];
export const factOfDay = () => FACTS[Math.floor(Date.now() / 86400000) % FACTS.length];

export type Level = "easy" | "medium" | "hard";
export interface Q { q: string; a: string[]; c: number; why: string }
export const QUIZ: Record<Level, Q[]> = {
  easy: [
    { q: "Which planet is called the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Mercury"], c: 1, why: "Iron oxide (rust) in the dust gives Mars its red colour." },
    { q: "What does a rover do?", a: ["Flies in orbit", "Drives on a planet's surface", "Makes rocket fuel", "Sends TV signals"], c: 1, why: "Rovers are robot explorers that drive around and study rocks and soil." },
    { q: "What is the Moon?", a: ["A star", "A planet", "Earth's natural satellite", "A comet"], c: 2, why: "A satellite is something that orbits a planet. The Moon orbits Earth." },
    { q: "Why do astronauts wear spacesuits?", a: ["For fashion", "To stay warm and breathe", "To fly faster", "To be louder"], c: 1, why: "Space has no air, and temperatures swing wildly. Suits give air and protection." },
    { q: "What do solar panels make?", a: ["Water", "Electricity from sunlight", "Wind", "Rocks"], c: 1, why: "Solar cells turn sunlight into electricity — vital for rovers and habitats." },
    { q: "Which is closer to Earth?", a: ["The Moon", "Mars", "Jupiter", "Neptune"], c: 0, why: "The Moon is only about 384,000 km away. Mars is at least 55 million km away." },
    { q: "Can sound travel through empty space?", a: ["Yes, loudly", "Yes, quietly", "No", "Only in daylight"], c: 2, why: "Sound needs a medium like air. Space is a vacuum." },
    { q: "Gravity is the force that…", a: ["Pulls things together", "Makes light", "Heats rockets", "Blocks radio"], c: 0, why: "Gravity pulls objects toward each other — and keeps planets in orbit." },
  ],
  medium: [
    { q: "About how strong is Moon gravity compared with Earth?", a: ["Same", "About 1/2", "About 1/6", "About 1/20"], c: 2, why: "Moon gravity is about 1.62 m/s², roughly one sixth of Earth's 9.81 m/s²." },
    { q: "What is Mars's air mostly made of?", a: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], c: 2, why: "About 95% CO₂ — and the air is very thin." },
    { q: "Why is Mars red?", a: ["Red plants", "Iron oxide in dust", "Red sunlight", "Lava everywhere"], c: 1, why: "Iron oxide, like rust, coats the surface dust." },
    { q: "Radio messages between Earth and Mars take about…", a: ["1 second", "3 to 22 minutes", "2 hours", "1 day"], c: 1, why: "It depends on where the planets are in their orbits. Mars crews cannot chat live with Earth." },
    { q: "How long is a lunar night, roughly?", a: ["12 hours", "3 days", "About 2 weeks", "6 months"], c: 2, why: "The Moon rotates slowly: about 14 Earth days of dark, then 14 of light." },
    { q: "A 'sol' is…", a: ["A Martian day", "A type of rocket", "A solar flare", "A Moon crater"], c: 0, why: "Sol = one solar day on Mars, about 24 h 39 min." },
    { q: "A spectrometer is used to…", a: ["Steer a rover", "Find what materials are made of", "Cool batteries", "Land safely"], c: 1, why: "It splits light to reveal which elements and minerals are present." },
  ],
  hard: [
    { q: "Why do Mars missions use relay orbiters?", a: ["To make rockets lighter", "To pass data between rovers and Earth", "To block dust", "To make oxygen"], c: 1, why: "Orbiters overhead can receive a lot of data from a rover quickly, then send it on to Earth." },
    { q: "Doubling a rocket's payload usually needs…", a: ["The same fuel", "Slightly more fuel", "Much more fuel (the rocket equation)", "Less fuel"], c: 2, why: "Fuel carries its own weight, so mass grows exponentially with the speed change you need." },
    { q: "Terrain-relative navigation helps a lander to…", a: ["Talk to Earth", "Avoid hazards by matching camera images to maps", "Save fuel on the way", "Charge batteries"], c: 1, why: "Used in Mars 2020's landing: the lander compares what it sees with stored maps to pick a safe spot." },
    { q: "Perchlorates in Mars soil matter because they are…", a: ["A fuel source only", "Harmful chemicals for humans", "Harmless", "Radioactive"], c: 1, why: "Perchlorates are toxic in quantity, so soil must be treated before use for food or water." },
    { q: "A global dust storm on Mars is mostly dangerous for rovers because it…", a: ["Melts wheels", "Cuts sunlight reaching solar panels", "Creates oxygen", "Freezes water"], c: 1, why: "Less light means less power. The Opportunity rover was lost after the 2018 storm." },
    { q: "Mars has weak radiation protection because…", a: ["It is too hot", "It has no thick atmosphere or global magnetic field", "It is too small to have gravity", "It has no sun"], c: 1, why: "Without a thick atmosphere or a global magnetic field, more cosmic radiation reaches the surface." },
  ],
};
export const RANKS = ["Space Cadet", "Rover Driver", "Pilot", "Navigator", "Mission Specialist", "Commander", "Mars Pioneer"];
export const rankOf = (lvl: number) => RANKS[Math.min(RANKS.length - 1, Math.floor((lvl - 1) / 2))];
