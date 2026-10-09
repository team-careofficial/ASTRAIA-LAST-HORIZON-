export type Dest = "moon" | "mars";
export type Kind = "real" | "concept" | "sim";
/** One selectable part. Every numeric field is a DELTA or absolute value that evaluate() sums, so choices always change the maths. */
export interface Opt {
  id: string; name: string; desc: string; why: string; learn: string; kind: Kind;
  mass?: number; cost?: number; draw?: number; gen?: number; reserve?: number; rel?: number; sci?: number; fuel?: number;
  fk?: number; cons?: number; risk?: number; stormK?: number; thermalK?: number; roverBat?: number; roverSpeed?: number; sciK?: number;
  cap?: Record<Dest, number>; wants?: string[];
}
export interface Design { objective: string; launch: string; craft: string; propulsion: string; payload: string[]; power: string; battery: string; comms: string; thermal: string; life: string; nav: string; crew: string; rover: string; duration: string }
export const DEFAULT_DESIGN: Design = { objective: "geology", launch: "heavy", craft: "standard", propulsion: "chem", payload: ["spec", "cam"], power: "std", battery: "std", comms: "relay", thermal: "basic", life: "basic", nav: "std", crew: "std", rover: "std", duration: "std" };

export const OBJECTIVES: Opt[] = [
  { id: "geology", name: "Geology", desc: "Read the rocks to learn how the world formed.", wants: ["spec", "drill"], risk: 0, why: "Rocks are a recorded history. A spectrometer and a drill tell you what they are made of and how old they might be.", learn: "Planetary geology uses chemistry and layering to reconstruct history. Rovers carry spectrometers and drills for exactly this.", kind: "real" },
  { id: "resources", name: "Resource mapping", desc: "Find water and useful minerals for future crews.", wants: ["drill", "sample"], risk: 1, why: "Water can become drinking water, oxygen and fuel. Future bases depend on knowing where it is.", learn: "Using local resources is called in-situ resource utilisation (ISRU). It is a major idea in exploration planning.", kind: "real" },
  { id: "habit", name: "Habitability", desc: "Ask whether life could ever have existed here.", wants: ["spec", "atmos", "sample"], risk: 2, why: "Life needs water, energy and the right chemistry. You need several instruments to check them together.", learn: "Habitability studies look for past liquid water, organics and energy sources. Samples are the best evidence.", kind: "real" },
  { id: "atmos", name: "Atmosphere and environment", desc: "Measure weather, dust and radiation.", wants: ["atmos", "cam"], risk: 0, why: "Dust, wind and radiation decide how safe a base is. Measuring them first protects later crews.", learn: "Environmental stations record pressure, temperature, wind and dust over many days.", kind: "real" },
  { id: "tech", name: "Technology demo", desc: "Prove new hardware that future missions will need.", wants: ["rad", "cam"], risk: 3, why: "New technology is risky but valuable. A demo lets engineers test it before a bigger mission depends on it.", learn: "NASA technology demonstrations fly new systems on small missions so larger missions can use them with confidence.", kind: "real" },
];
export const LAUNCHERS: Opt[] = [
  { id: "medium", name: "Medium Lift", desc: "Affordable, but carries little.", cost: 90, cap: { moon: 14, mars: 7 }, risk: 2, why: "A smaller rocket is cheaper but limits how much you can bring. Mars needs far more energy than the Moon.", learn: "Payload capacity falls sharply for Mars because the spacecraft needs much more speed to leave Earth for Mars.", kind: "sim" },
  { id: "heavy", name: "Heavy Lift", desc: "Balanced capacity and price.", cost: 150, cap: { moon: 30, mars: 16 }, risk: 0, why: "A balanced choice for most missions: enough room for fuel margin without spending the whole budget.", learn: "Heavy-lift rockets exist to send big payloads beyond Earth orbit.", kind: "sim" },
  { id: "super", name: "Super Heavy", desc: "Huge capacity at a huge price.", cost: 240, cap: { moon: 55, mars: 32 }, risk: 3, why: "Lets you carry large crews and spare fuel, but costs a lot and has less flight experience.", learn: "Super-heavy vehicles are the concept route for crewed Mars architectures.", kind: "concept" },
];
export const CRAFTS: Opt[] = [
  { id: "compact", name: "Compact Lander", desc: "Light and cheap, with thin margins.", mass: 4.5, cost: 80, fuel: 80, gen: 3, risk: 4, why: "Less mass means a smaller rocket works, but there is less fuel and less power to spare.", learn: "Every spacecraft is a trade between mass, power and capability. Small ones have little room for error.", kind: "sim" },
  { id: "standard", name: "Standard Lander", desc: "Proven, balanced design.", mass: 7, cost: 130, fuel: 100, gen: 4.5, risk: 0, why: "A balanced lander: decent fuel, decent power, manageable cost.", learn: "Landers carry the instruments and rovers down to the surface.", kind: "sim" },
  { id: "heavy", name: "Heavy Explorer", desc: "Big power and fuel, big mass.", mass: 11, cost: 200, fuel: 125, gen: 6, risk: 2, why: "More fuel and power, but it needs a bigger launcher and costs more.", learn: "Bigger spacecraft can do more science, but landing a heavier vehicle is harder.", kind: "sim" },
];
export const PROPULSION: Opt[] = [
  { id: "chem", name: "Storable chemical", desc: "Proven, simple, reliable.", fk: 1, risk: 0, why: "Storable fuels do not need cooling. They are heavy for the energy they give, but very dependable.", learn: "Storable bipropellant engines have flown on many planetary missions.", kind: "real" },
  { id: "cryo", name: "Methane and oxygen", desc: "More push per tonne, needs cold storage.", mass: 0.6, cost: 35, fk: 1.25, risk: 3, draw: 0.2, why: "Cryogenic propellant gives more delta-v for the same tank, but must be kept cold and the system is more complex.", learn: "Methane and oxygen engines are a concept direction for future Mars missions, partly because they can be made from local resources.", kind: "concept" },
  { id: "ion", name: "Electric assist", desc: "Very efficient, slow, power hungry.", mass: 0.9, cost: 60, fk: 1.15, risk: 2, draw: 0.8, why: "Electric thrusters use propellant very efficiently but need a lot of electrical power and push gently.", learn: "Ion propulsion has flown on missions such as Dawn. It trades thrust for efficiency.", kind: "real" },
];
export const PAYLOADS: Opt[] = [
  { id: "spec", name: "Spectrometer", desc: "Reads rock and soil chemistry.", mass: 0.6, cost: 25, draw: 0.5, sci: 14, why: "Different minerals reflect light differently. A spectrometer turns that into a list of ingredients.", learn: "Spectrometers identify elements and minerals from light or X-rays.", kind: "real" },
  { id: "cam", name: "Mast camera", desc: "Sees terrain for driving and science.", mass: 0.3, cost: 12, draw: 0.2, sci: 6, why: "You cannot choose a target if you cannot see it. Cameras also help avoid hazards.", learn: "Mast cameras give rovers a human-height view.", kind: "real" },
  { id: "seis", name: "Seismometer", desc: "Listens for quakes and impacts.", mass: 0.5, cost: 20, draw: 0.3, sci: 10, why: "Waves from quakes reveal what lies deep underground.", learn: "A seismometer measures ground motion. InSight used one on Mars.", kind: "real" },
  { id: "atmos", name: "Environment sensor", desc: "Pressure, temperature, wind, dust.", mass: 0.4, cost: 15, draw: 0.3, sci: 8, why: "Weather data keeps crews safe and shows how the climate behaves.", learn: "Environment stations are standard on landers and rovers.", kind: "real" },
  { id: "rad", name: "Radiation detector", desc: "Counts harmful particles.", mass: 0.3, cost: 12, draw: 0.2, sci: 6, why: "Without a thick atmosphere or magnetic field, radiation reaches the surface. Crews need to know how much.", learn: "Radiation monitors have flown on Mars missions to prepare for human exploration.", kind: "real" },
  { id: "drill", name: "Drill", desc: "Reaches fresh rock under the surface.", mass: 1.2, cost: 45, draw: 1, sci: 18, why: "Surface rock is weathered. Drilling reaches fresher material, but it is heavy and uses power.", learn: "Rover drills collect powdered rock for instruments inside the rover.", kind: "real" },
  { id: "sample", name: "Sample container", desc: "Stores samples for later return.", mass: 0.8, cost: 25, draw: 0.1, sci: 12, why: "Samples can be studied in far better labs on Earth, if they ever come back.", learn: "Sample caching is a core idea of Mars sample return plans.", kind: "real" },
];
export const ROVERS: Opt[] = [
  { id: "none", name: "No rover", desc: "Static lander science only.", mass: -1.2, cost: -30, sci: -8, roverBat: -25, roverSpeed: 0.7, risk: -1, why: "Saves mass and money but the science stays within reach of the lander.", learn: "Static landers study one place very well. Rovers study many places.", kind: "sim" },
  { id: "std", name: "Standard rover", desc: "Six wheels, solar wings, scanner.", roverBat: 0, roverSpeed: 1, why: "A balanced rover can reach several sites and scan targets.", learn: "Six-wheel rocker-bogie style suspensions help rovers climb over rocks.", kind: "real" },
  { id: "adv", name: "Advanced rover", desc: "Faster, bigger battery, more power draw.", mass: 0.9, cost: 45, draw: 0.4, sci: 8, roverBat: 15, roverSpeed: 1.2, risk: 1, why: "Goes further and faster, but costs mass, money and power.", learn: "Longer range lets a rover visit more science targets before sunset.", kind: "sim" },
];
export const POWERS: Opt[] = [
  { id: "small", name: "Small solar array", desc: "Light, but less power.", mass: -0.3, cost: -10, gen: -0.8, risk: 3, why: "Fewer panels mean less power, especially in dust or at night.", learn: "Solar arrays produce power in proportion to their area and the sunlight they receive.", kind: "real" },
  { id: "std", name: "Standard array", desc: "Balanced generation.", why: "Enough for normal operations in good sunlight.", learn: "Most landers and rovers have used solar power.", kind: "real" },
  { id: "large", name: "Large solar array", desc: "More power, more to deploy.", mass: 0.5, cost: 22, gen: 1.2, risk: 1, why: "More generation gives you margin when dust or night cut sunlight.", learn: "Bigger arrays give margin but need reliable deployment.", kind: "real" },
  { id: "rtg", name: "Radioisotope source", desc: "Steady power, even in storms and at night.", mass: 1.4, cost: 70, gen: 0.6, stormK: 0.3, risk: -2, why: "A radioisotope power source does not depend on sunlight, so dust storms barely affect it.", learn: "Radioisotope power systems have powered Curiosity and Perseverance on Mars.", kind: "real" },
];
export const BATTERIES: Opt[] = [
  { id: "small", name: "Small battery", desc: "Light, short reserve.", mass: 0.8, cost: 15, reserve: 10, risk: 3, why: "A small battery runs out quickly in storms or at night.", learn: "Batteries store daytime power for use at night or in dust.", kind: "sim" },
  { id: "std", name: "Standard battery", desc: "Balanced reserve.", mass: 1.6, cost: 30, reserve: 25, why: "Enough reserve for a normal night and short storms.", learn: "Reserve capacity is a safety margin.", kind: "sim" },
  { id: "large", name: "Large battery", desc: "Long reserve, extra mass.", mass: 3, cost: 55, reserve: 45, risk: -2, why: "Ride out long storms and the lunar night, at the price of mass and cost.", learn: "The lunar night lasts about two Earth weeks, so batteries and heaters matter.", kind: "real" },
];
export const COMMS: Opt[] = [
  { id: "low", name: "Low-gain only", desc: "Simple, weak link.", mass: 0.2, cost: 10, rel: -15, draw: 0.2, risk: 4, why: "A weak antenna gives a less reliable link, especially in storms or at long distance.", learn: "Low-gain antennas are wide-beam and low-rate.", kind: "real" },
  { id: "relay", name: "Relay + medium-gain", desc: "Uses orbiters as relays.", mass: 0.6, cost: 30, rel: 0, draw: 0.4, why: "Relaying through an orbiter gives dependable contact with moderate hardware.", learn: "Mars rovers often send data via orbiters rather than directly to Earth.", kind: "real" },
  { id: "high", name: "High-gain + relay", desc: "Strongest, heaviest link.", mass: 1.2, cost: 60, rel: 15, draw: 0.7, risk: -3, why: "A steerable dish keeps a strong link, but weighs more and uses power.", learn: "High-gain antennas focus power into a narrow beam.", kind: "real" },
];
export const THERMALS: Opt[] = [
  { id: "basic", name: "Basic thermal", desc: "Simple radiators and heaters.", why: "Fine for mild conditions, weak against deep cold.", learn: "Spacecraft must stay inside a narrow temperature range.", kind: "real" },
  { id: "insul", name: "Insulation + heaters", desc: "Multi-layer blankets and heater units.", mass: 0.4, cost: 18, draw: 0.2, thermalK: 0.6, risk: -3, why: "Insulation keeps heat in, so a power dip does not freeze the habitat as quickly.", learn: "Multi-layer insulation and radioisotope heater units are real spacecraft thermal tools.", kind: "real" },
  { id: "adv", name: "Active thermal loop", desc: "Pumped fluid loop, best control.", mass: 0.9, cost: 45, draw: 0.3, thermalK: 0.35, risk: -5, why: "A pumped loop moves heat where it is needed. It is the best protection, and the heaviest.", learn: "Pumped fluid loops are used on spacecraft and the ISS.", kind: "real" },
];
export const LIFES: Opt[] = [
  { id: "basic", name: "Stored supplies", desc: "Carry what you need.", why: "Simple, but supplies run out faster on longer missions.", learn: "Stored consumables are the simplest approach.", kind: "real" },
  { id: "recycle", name: "Water recycling", desc: "Reclaim water from humidity and waste.", mass: 0.8, cost: 35, draw: 0.3, cons: 0.85, risk: -2, why: "Recycling cuts how much water you must launch, so supplies last longer.", learn: "The ISS recycles a large share of its water.", kind: "real" },
  { id: "closed", name: "Closed-loop support", desc: "Recycles water and oxygen.", mass: 1.8, cost: 80, draw: 0.6, cons: 0.7, risk: -3, why: "The longest-lasting option, but heavy and complex. More parts that can break.", learn: "Closed-loop life support is a research goal for deep-space missions.", kind: "concept" },
];
export const NAVS: Opt[] = [
  { id: "basic", name: "Basic navigation", desc: "Simple guidance, wider landing area.", mass: -0.1, cost: -8, fk: 0.95, risk: 4, why: "A rougher landing means more fuel spent and a higher chance of a hazardous touchdown.", learn: "Older landers aimed at big safe ellipses.", kind: "real" },
  { id: "std", name: "Standard navigation", desc: "Reliable guidance.", why: "Good enough for a normal descent.", learn: "Inertial sensors and radar are standard.", kind: "real" },
  { id: "precise", name: "Terrain-relative navigation", desc: "Compares camera views to a map.", mass: 0.2, cost: 25, draw: 0.2, fk: 1.05, risk: -4, why: "Matching the surface to a map lets the lander dodge hazards and land close to targets.", learn: "Terrain-relative navigation was used for the Mars 2020 landing of Perseverance.", kind: "real" },
];
export const CREWS: Opt[] = [
  { id: "min", name: "Crew of 2", desc: "Lean team, less to supply.", mass: -0.8, cost: -15, cons: 0.8, sciK: 0.85, risk: 1, why: "Fewer people use less air, water and food, but there are fewer hands for repairs and science.", learn: "Crew size trades capability for supplies.", kind: "sim" },
  { id: "std", name: "Crew of 4", desc: "Balanced team.", why: "Four people can cover engineering, medicine, science and comms.", learn: "Many mission studies assume small crews of around four.", kind: "concept" },
  { id: "ext", name: "Crew of 6", desc: "More science, more supplies.", mass: 1.6, cost: 40, cons: 1.3, sciK: 1.2, risk: 3, why: "More people do more science, but consume more and add more things that can go wrong.", learn: "Bigger crews need larger habitats and more supplies.", kind: "concept" },
];
export const DURATIONS: Opt[] = [
  { id: "short", name: "Short", desc: "Fast, cheaper, less science.", sciK: 0.8, cons: 0.8, cost: 0.9, risk: -2, why: "Less time on the surface means less exposure and fewer supplies, but fewer discoveries.", learn: "Short stays reduce risk.", kind: "sim" },
  { id: "std", name: "Standard", desc: "Balanced plan.", sciK: 1, cons: 1, cost: 1, why: "Gives time to explore without stretching supplies.", learn: "Mission length is a core planning choice.", kind: "sim" },
  { id: "long", name: "Long", desc: "More science, more strain.", sciK: 1.3, cons: 1.25, cost: 1.15, risk: 4, why: "Longer missions find more, but supplies and equipment are stressed for longer.", learn: "Long stays increase exposure to radiation and wear.", kind: "sim" },
];
export const BUDGET: Record<Dest, number> = { moon: 520, mars: 800 };

export interface Group { key: keyof Design; title: string; opts: Opt[]; multi?: boolean; help: string }
export const GROUPS: Record<string, Group> = {
  objective: { key: "objective", title: "Science objective", opts: OBJECTIVES, help: "What do you want to learn?" },
  craft: { key: "craft", title: "Spacecraft", opts: CRAFTS, help: "The vehicle that carries everything down." },
  propulsion: { key: "propulsion", title: "Propulsion", opts: PROPULSION, help: "How the spacecraft moves and lands." },
  launch: { key: "launch", title: "Launch vehicle", opts: LAUNCHERS, help: "The rocket. It must lift your total mass." },
  payload: { key: "payload", title: "Science payload", opts: PAYLOADS, multi: true, help: "Pick instruments. Each adds mass, cost and power draw." },
  rover: { key: "rover", title: "Rover", opts: ROVERS, help: "The vehicle you drive in Rover mode." },
  power: { key: "power", title: "Power system", opts: POWERS, help: "How electricity is made." },
  battery: { key: "battery", title: "Battery and fuel reserve", opts: BATTERIES, help: "Stored energy for night and storms." },
  comms: { key: "comms", title: "Communications", opts: COMMS, help: "Your link to Earth." },
  thermal: { key: "thermal", title: "Thermal system", opts: THERMALS, help: "Keeps equipment from freezing or overheating." },
  life: { key: "life", title: "Life support", opts: LIFES, help: "Air, water and food efficiency." },
  nav: { key: "nav", title: "Navigation", opts: NAVS, help: "Guidance and landing accuracy." },
  crew: { key: "crew", title: "Crew capacity", opts: CREWS, help: "How many people go." },
  duration: { key: "duration", title: "Mission duration", opts: DURATIONS, help: "How long you stay." },
};
export const STEPS = [
  { id: "objective", n: "01", title: "OBJECTIVE", groups: ["objective"] },
  { id: "destination", n: "02", title: "DESTINATION", groups: [] as string[] },
  { id: "spacecraft", n: "03", title: "SPACECRAFT", groups: ["craft", "propulsion"] },
  { id: "launch", n: "04", title: "LAUNCH VEHICLE", groups: ["launch"] },
  { id: "payload", n: "05", title: "PAYLOAD", groups: ["payload", "rover"] },
  { id: "systems", n: "06", title: "SYSTEMS", groups: ["power", "battery", "comms", "thermal", "life", "nav"] },
  { id: "crew", n: "07", title: "CREW", groups: ["crew", "duration"] },
  { id: "review", n: "08", title: "REVIEW", groups: [] as string[] },
];

const pick = (a: Opt[], id: string) => a.find(x => x.id === id) ?? a[0];
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const sum = (a: Opt[], k: keyof Opt) => a.reduce((s, o) => s + ((o[k] as number | undefined) ?? 0), 0);

export function evaluate(d: Design, dest: Dest) {
  const L = pick(LAUNCHERS, d.launch), cr = pick(CRAFTS, d.craft), pr = pick(PROPULSION, d.propulsion), pw = pick(POWERS, d.power), bt = pick(BATTERIES, d.battery), cm = pick(COMMS, d.comms),
    th = pick(THERMALS, d.thermal), lf = pick(LIFES, d.life), nv = pick(NAVS, d.nav), cw = pick(CREWS, d.crew), rv = pick(ROVERS, d.rover), du = pick(DURATIONS, d.duration), ob = pick(OBJECTIVES, d.objective);
  const pl = d.payload.map(id => PAYLOADS.find(p => p.id === id)).filter((p): p is Opt => !!p);
  const parts = [cr, pr, pw, bt, cm, th, lf, nv, cw, rv, ...pl];
  const mass = Math.max(0.5, sum(parts, "mass")), cap = L.cap![dest];
  const cost = (L.cost! + sum(parts, "cost")) * (du.cost ?? 1), budget = BUDGET[dest];
  const powerMargin = (cr.gen ?? 0) + (pw.gen ?? 0) - (1.2 + sum([pr, cm, th, lf, nv, rv, ...pl], "draw"));
  const sciBase = 30 + sum(pl, "sci") + (rv.sci ?? 0) + ob.wants!.filter(w => d.payload.includes(w)).length * 6;
  const science = Math.max(5, sciBase * (du.sciK ?? 1) * (cw.sciK ?? 1));
  const fk = (pr.fk ?? 1) * (nv.fk ?? 1);
  const fuelMargin = Math.max(0, (cr.fuel ?? 100) * fk * (1 - (0.6 * mass) / cap));
  const comms = clamp(70 + (cm.rel ?? 0), 0, 100), warnings: string[] = [];
  const load = mass / cap;
  let risk = 18 + (dest === "mars" ? 12 : 4) + sum([ob, L, cr, pr, pw, bt, cm, th, lf, nv, cw, du, rv], "risk");
  if (load > 0.85) risk += (load - 0.85) * 60; if (fuelMargin < 45) risk += (45 - fuelMargin) * 0.5; if (powerMargin < 0.8) risk += (0.8 - powerMargin) * 8; if (pl.length === 0) risk += 10;
  risk = clamp(Math.round(risk), 0, 100);
  if (mass > cap) warnings.push(`Too heavy for this launch vehicle (${mass.toFixed(1)} t of ${cap} t).`);
  if (cost > budget) warnings.push(`Over budget by ${(cost - budget).toFixed(0)} M$.`);
  if (powerMargin < 0) warnings.push("Not enough power for all systems.");
  if (pl.length === 0) warnings.push("Choose at least one instrument.");
  if (fuelMargin < 35 && mass <= cap) warnings.push("Fuel margin is thin.");
  if (risk > 60 && warnings.length === 0) warnings.push("Mission risk is high. Add margin or shorten the mission.");
  return { mass, cap, cost, budget, powerMargin, science, fuelMargin, comms, risk, warnings, valid: mass <= cap && cost <= budget && powerMargin >= 0 && pl.length > 0, reserve: bt.reserve ?? 25, relDelta: cm.rel ?? 0,
    cons: (du.cons ?? 1) * (cw.cons ?? 1) * (lf.cons ?? 1), stormK: pw.stormK ?? 1, thermalK: th.thermalK ?? 1, roverBat: rv.roverBat ?? 0, roverSpeed: rv.roverSpeed ?? 1 };
}
const BASE = { moon: evaluate(DEFAULT_DESIGN, "moon"), mars: evaluate(DEFAULT_DESIGN, "mars") };
/** How the design changes the live game. The default design reproduces the original start values. */
export function designMods(d: Design, dest: Dest) {
  const e = evaluate(d, dest), b = BASE[dest];
  return { battery: 80 + (e.reserve - 25), power: 68 + clamp((e.powerMargin - 2.2) * 6, -15, 15), comms: 78 + e.relDelta, fuel: clamp(e.fuelMargin, 10, 100), sci: clamp(e.science / 60, 0.4, 2), cons: e.cons, commsK: 1 - e.relDelta / 30, relDelta: e.relDelta, reserve: e.reserve, drainK: Math.sqrt(25 / e.reserve), fuelMargin: e.fuelMargin,
    genK: clamp(1 + (e.powerMargin - 2.2) * 0.08, 0.7, 1.3), stormK: e.stormK, thermalK: e.thermalK, stressK: clamp(1 + (e.risk - b.risk) / 100, 0.8, 1.3), roverBat: e.roverBat, roverSpeed: e.roverSpeed };
}
/** Human-readable effect lines for one option, sign-aware. good = helpful for the player. */
export function effectLines(o: Opt): { t: string; good: boolean }[] {
  const L: { t: string; good: boolean }[] = [], s = (n: number, u: string, dec = 1, goodPos = true) => L.push({ t: `${n > 0 ? "+" : ""}${n.toFixed(dec)}${u}`, good: goodPos ? n > 0 : n < 0 });
  if (o.cap) L.push({ t: `${o.cap.moon} t Moon · ${o.cap.mars} t Mars`, good: true });
  if (o.mass) s(o.mass, " t mass", 1, false);
  if (o.cost && Math.abs(o.cost) > 2) s(o.cost, " M$", 0, false); else if (o.cost && o.cost !== 1) L.push({ t: `cost x${o.cost.toFixed(2)}`, good: o.cost < 1 });
  if (o.draw) s(o.draw, " kW draw", 1, false); if (o.gen && !o.fuel) s(o.gen, " kW power", 1, true); if (o.gen && o.fuel) L.push({ t: `${o.gen} kW power · ${o.fuel}% fuel`, good: true });
  if (o.reserve) L.push({ t: `${o.reserve}% power reserve`, good: o.reserve >= 25 }); if (o.rel) s(o.rel, "% comms", 0, true); if (o.sci) s(o.sci, "% science", 0, true); if (o.sciK && o.sciK !== 1) L.push({ t: `science x${o.sciK}`, good: o.sciK > 1 });
  if (o.cons && o.cons !== 1) L.push({ t: `supplies x${o.cons}`, good: o.cons < 1 });
  if (o.fk && o.fk !== 1) L.push({ t: `fuel efficiency x${o.fk}`, good: o.fk > 1 }); if (o.thermalK) L.push({ t: "better cold protection", good: true }); if (o.stormK != null && o.stormK < 1) L.push({ t: "storm-proof power", good: true });
  if (o.roverSpeed && o.roverSpeed !== 1) L.push({ t: `rover speed x${o.roverSpeed}`, good: o.roverSpeed > 1 }); if (o.roverBat) s(o.roverBat, "% rover battery", 0, true);
  if (o.risk) s(o.risk, " risk", 0, false);
  return L;
}
