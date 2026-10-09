import type { Choice, Effects, Mission, Step, Tag } from "@/types/world";
import type { CrewId } from "@/types";

export const CREW3D: { id: CrewId; name: string; role: string; color: string }[] = [
  { id: "eva", name: "EVA", role: "Engineer", color: "#d4572a" }, { id: "sarah", name: "DR. SARAH", role: "Doctor", color: "#b9c46a" },
  { id: "ben", name: "BEN", role: "Scientist", color: "#7aa0c8" }, { id: "liam", name: "LIAM", role: "Pilot / Comms", color: "#e8a24a" },
];
const C = (id: string, label: string, tag: Tag, result: string, effects?: Effects, hint?: string, extra: Partial<Choice> = {}): Choice => ({ id, label, tag, result, effects, hint, next: "done", ...extra });
const S = (id: string, name: string, role: CrewId, pos: [number, number], radius: number, objective: string, title: string, body: string, choices: Choice[]): Step =>
  ({ id, name, role, pos, radius, objective, start: "n", nodes: { n: { id: "n", title, body, choices } } });
const LAND: [number, number] = [-4, 0], HAB: [number, number] = [10.5, 4.5], SOL: [number, number] = [9, -6], TOW: [number, number] = [0, -12], SCI: [number, number] = [-11, 4], MED: [number, number] = [3, -4.5];

export const MISSIONS: Mission[] = [
  { id: 1, title: "ARRIVAL", brief: "Touchdown on Mars. Learn the controls and bring the base online. Use 1-4 to switch crew, WASD to move, E to interact.", steps: [
    S("site", "INSPECT LANDING SITE", "liam", LAND, 3, "Inspect landing site", "LANDING SITE", "One landing leg sank about 10 cm into loose regolith. What do you do?", [
      C("lvl", "Re-level the leg and test ground strength", "SUCCESS", "Loose regolith carries weight unevenly. Re-leveling stops the lander tipping as the crew moves around it.", { minutes: 20, bonus: 15, fatigue: 3 }, "20 min"),
      C("look", "Walk the perimeter and photograph it", "PARTIAL", "You document the site well, but the tilt is still there.", { minutes: 15, science: 1, bonus: 5 }),
      C("skip", "Ignore it and go inside", "RISK", "Uneven settling continues overnight and the tilt grows.", { stress: 4, habitat: -2 })]),
    S("hab", "CHECK HABITAT", "sarah", HAB, 3.2, "Check habitat", "HABITAT PRESSURE", "Cabin pressure reads 98 kPa against a 101 kPa target. The door seal heater is cold. What first?", [
      C("seal", "Re-seat the door seal and recheck", "SUCCESS", "Cold seals stiffen and leak slowly. Re-seating restores a tight fit.", { minutes: 15, bonus: 15, habitat: 2 }),
      C("o2", "Top up pressure from the O2 reserve", "PARTIAL", "Pressure recovers, but the leak remains and you spent oxygen.", { oxygen: -4, minutes: 10 }),
      C("ign", "Ignore it, it is within tolerance", "RISK", "The leak slowly worsens and the crew notices the drop.", { habitat: -4, stress: 3 })]),
    S("power", "ACTIVATE POWER", "eva", SOL, 3.5, "Activate power", "SOLAR DEPLOYMENT", "The array is stowed. The battery holds 80%. How do you bring power online?", [
      C("tilt", "Deploy toward the sun, then verify bus voltage", "SUCCESS", "Panels facing the sun give the most power. Checking bus voltage confirms the whole chain works.", { power: 14, minutes: 25, bonus: 20, flag: "conservedPower" }, "25 min"),
      C("flat", "Deploy flat and move on", "PARTIAL", "Power rises, but flat panels collect less sunlight.", { power: 7, minutes: 10 }),
      C("bat", "Run on battery for now", "RISK", "Quick, but the battery drains with no recharge.", { battery: -10, power: -3 })]),
    S("o2", "CHECK OXYGEN", "sarah", MED, 3, "Check oxygen", "LIFE SUPPORT", "Cabin O2 is 19.5% and CO2 is rising. What is your priority?", [
      C("scrub", "Swap the CO2 scrubber cartridge", "SUCCESS", "Rising CO2 is the real danger. Scrubbers remove it, so a fresh cartridge fixes the cause.", { oxygen: 6, minutes: 15, bonus: 20 }),
      C("flow", "Increase O2 flow", "PARTIAL", "O2 improves, but CO2 keeps climbing.", { oxygen: 3, stress: 3 }),
      C("vent", "Vent the cabin to outside air", "FAILURE", "Mars air is about 95% carbon dioxide, so this makes things worse.", { oxygen: -8, stress: 8, habitat: -2 })]),
    S("comms", "ESTABLISH COMMUNICATIONS", "liam", TOW, 3.2, "Establish communications", "EARTH LINK", "Choose how to link with Earth.", [
      C("relay", "Use an orbiter as a relay", "SUCCESS", "Orbiters give a higher data rate than a direct link because they carry large antennas and a clearer path.", { comms: 14, minutes: 15, bonus: 20 }),
      C("direct", "Point the high-gain antenna directly", "PARTIAL", "It works, but pointing must be exact and the data rate is lower.", { comms: 8, minutes: 25 }),
      C("omni", "Use the omnidirectional antenna", "RISK", "Always on, but the signal is weak.", { comms: 3, stress: 2 })]),
    S("report", "FIRST MISSION REPORT", "ben", SCI, 2.8, "Complete first mission report", "MISSION REPORT", "Compile your first report to Earth.", [
      C("full", "Report all systems and plan Sol 2 science", "SUCCESS", "Earth replies minutes later, so a complete plan lets the crew keep working.", { science: 4, minutes: 20, bonus: 20 }),
      C("faults", "Report only the faults", "PARTIAL", "Earth gets the problems but not your plan.", { science: 1, minutes: 10 }),
      C("late", "Delay the report to finish setup", "RISK", "Earth has no data for a while and the crew is on its own.", { comms: -4, stress: 3 })]),
  ] },
  { id: 2, title: "FIRST ANOMALY", brief: "Magnetometer spikes appear overnight. Investigate carefully, and avoid jumping to conclusions.", steps: [
    S("tele", "REVIEW TELEMETRY", "ben", SCI, 2.8, "Review the overnight telemetry", "MAGNETOMETER SPIKES", "At 03:12 local the magnetometer spiked for 30 seconds, then dropped. How do you start?", [
      C("two", "Compare with a second sensor", "SUCCESS", "One sensor can lie. A second instrument shows if the signal is real or local.", { minutes: 15, science: 2, bonus: 20 }),
      C("noise", "Call it sensor noise and recalibrate", "PARTIAL", "Possible, but you did not test it.", { minutes: 20, science: 1 }),
      C("skip", "Ignore it", "RISK", "You may lose real data.", { stress: 2 })]),
    S("sensor", "INSPECT SENSOR", "ben", [-22, -16], 3, "Inspect the sensor in the investigation zone", "FIELD SENSOR", "At the sensor, the supply voltage ripples. What do you check?", [
      C("gnd", "Check grounding and shielding for static", "SUCCESS", "Dust carries static charge, which can inject noise into poorly grounded cables.", { minutes: 25, science: 2, bonus: 20, fatigue: 4 }),
      C("swap", "Replace the sensor", "PARTIAL", "A new sensor may still see the same noise.", { minutes: 30, fatigue: 5 }),
      C("tap", "Tap the casing and hope", "FAILURE", "Nothing improves and time is lost.", { minutes: 20, stress: 3 })]),
    S("sample", "COLLECT DATA", "ben", [-22, -14], 3, "Collect samples and readings", "SAMPLING", "How do you sample the area?", [
      C("three", "Take three spots plus temperature and wind", "SUCCESS", "Several samples with weather data let you separate a local effect from a regional one.", { minutes: 40, science: 6, bonus: 20, fatigue: 6 }),
      C("one", "Take one sample", "PARTIAL", "Useful but too little to compare.", { minutes: 15, science: 2 }),
      C("no", "Skip sampling", "FAILURE", "No data means no conclusion.", { stress: 2 })]),
    S("interp", "INTERPRET RESULTS", "ben", SCI, 2.8, "Interpret the results", "ANALYSIS", "The spikes match wind gusts and temperature swings. What best explains them?", [
      C("dd", "Dust-devil electrical discharge plus sensor noise", "SUCCESS", "Moving dust charges up. The spikes line up with wind, which fits this idea.", { science: 5, bonus: 25, minutes: 20 }),
      C("rock", "Iron-rich rock beneath the sensor", "PARTIAL", "Possible for a steady offset, but not for spikes tied to wind.", { science: 2 }),
      C("alien", "A machine signal", "FAILURE", "There is no evidence for that. The data fits natural causes.", { stress: 4, bonus: -10 })]),
    S("decide", "DECIDE NEXT ACTION", "liam", LAND, 3, "Decide how to proceed", "NEXT ACTION", "How far do you push this investigation?", [
      C("back", "Return and send a report", "SUCCESS", "Safe and efficient. Earth can advise while the crew rests.", { minutes: 15, bonus: 20, stress: -4 }),
      C("rover", "Send the rover to scan the area", "PARTIAL", "More data, but the rover spends battery.", { science: 3, fuel: -3, rover: -3, minutes: 30 }),
      C("dig", "Stay and dig deeper tonight", "RISK", "Big payoff, but the crew is tired and the dark is risky.", { science: 6, fatigue: 12, stress: 6, minutes: 90, flag: "deepDig" })]),
  ] },
  { id: 3, title: "RED STORM", brief: "A planet-scale dust storm is closing in. Visibility and sunlight will drop. Prepare, and choose carefully.", steps: [
    S("fc", "READ THE FORECAST", "liam", TOW, 3.2, "Read the storm forecast", "STORM WARNING", "Atmospheric opacity is rising fast. Forecast arrival is about three hours.", [
      C("alert", "Alert the crew and start the storm protocol", "SUCCESS", "Early warning gives time to prepare. Storms can cut sunlight a lot.", { minutes: 10, bonus: 20 }),
      C("wait", "Wait for confirmation first", "RISK", "You lose time you will need.", { minutes: 30, stress: 4 }),
      C("ign", "Assume it will pass", "FAILURE", "It will not. The crew is unprepared.", { stress: 8, bonus: -10 })]),
    S("solar", "SECURE SOLAR ARRAY", "eva", SOL, 3.5, "Secure the solar array", "SOLAR ARRAY", "Wind is rising. How do you protect the panels?", [
      C("stow", "Stow the panels flat and tie them down", "SUCCESS", "Stowed panels resist wind and avoid damage. Dust still cuts output, but the array survives.", { minutes: 30, bonus: 20, fatigue: 5 }),
      C("late", "Keep harvesting until the last minute", "RISK", "Power rises now, but wind later damages a panel.", { power: 6, minutes: 20, flag: "solarDamaged", habitat: -1 }),
      C("tilt", "Tilt the panels vertical", "PARTIAL", "Less area for the wind, but more dust sticks.", { minutes: 15 })]),
    S("crew", "PREPARE CREW AND HABITAT", "sarah", HAB, 3.2, "Prepare crew and habitat", "STORM DRILL", "Prepare the habitat and the crew.", [
      C("drill", "Run a drill, check suits, set a rest rotation", "SUCCESS", "A calm, rested crew makes fewer mistakes under pressure.", { minutes: 30, stress: -8, bonus: 20, fatigue: -4 }),
      C("seal", "Seal the habitat only", "PARTIAL", "Safe, but no rest plan and nerves rise.", { minutes: 15, stress: 3 }),
      C("skip", "Skip the drill to save time", "RISK", "Tension rises as the sky darkens.", { stress: 7 })]),
    S("load", "MANAGE POWER", "eva", SCI, 2.8, "Manage power loads", "POWER LOADS", "Solar output is falling. Which loads do you cut?", [
      C("shed", "Shed science loads, protect life support", "SUCCESS", "Life support must never lose power. Cutting science keeps the battery for what matters.", { minutes: 15, bonus: 25, science: -1, flag: "conservedPower", power: 6 }),
      C("all", "Keep everything on", "RISK", "Power sags and the battery drains.", { power: -10, battery: -12, stress: 4 }),
      C("heat", "Turn off the habitat heater", "FAILURE", "It gets cold fast, which stresses the crew and the equipment.", { power: 4, stress: 8, health: -4 })]),
    S("rover", "DECIDE ON THE ROVER", "liam", [6, 6], 3, "Decide on rover activity", "ROVER", "The rover is out collecting data. What now?", [
      C("park", "Bring it back and park it in the lee", "SUCCESS", "A parked rover under shelter avoids dust damage.", { minutes: 25, bonus: 20, rover: 2 }),
      C("go", "Keep the science traverse going", "RISK", "More data, but the storm hits the rover hard.", { science: 4, rover: -25, flag: "roverExposed", minutes: 30 }),
      C("leave", "Leave it where it is", "PARTIAL", "Some dust damage is likely.", { rover: -8 })]),
  ] },
  { id: 4, title: "SILENT COMMS", brief: "Earth has gone quiet. Diagnose the whole chain: antenna, power, and interference. Communication quality now matters.", steps: [
    S("ant", "INSPECT ANTENNA", "liam", TOW, 3.2, "Inspect the antenna", "ANTENNA", "No signal. The dish moves, but the link is dead. What do you check?", [
      C("feed", "Check pointing motors and dust on the feed", "SUCCESS", "Dust on the feed absorbs signal, and a pointing error can silently kill a link.", { minutes: 20, bonus: 15 }),
      C("reboot", "Reboot the radio only", "PARTIAL", "Sometimes works, but it hides the cause.", { minutes: 10 }),
      C("dish", "Replace the whole dish", "FAILURE", "Heavy work on a guess, and you waste energy.", { minutes: 60, fatigue: 8 })]),
    S("feed", "DIAGNOSE POWER FEED", "eva", SOL, 3.5, "Diagnose the power feed", "POWER BUS", "Battery 82%. Bus 17 V instead of 28 V. Solar output unstable. Which first?", [
      C("reg", "Check the bus regulator and connectors", "SUCCESS", "The battery is full, so the fault is between it and the bus. That points to the regulator or a connector.", { minutes: 20, bonus: 20, power: 8 }),
      C("panel", "Check panel output", "PARTIAL", "Reasonable, but the battery is fine so this is not the cause.", { minutes: 20 }),
      C("bat", "Replace the battery", "FAILURE", "A healthy battery is not the problem.", { minutes: 45, battery: -6, fatigue: 6 })]),
    S("noise", "CHECK INTERFERENCE", "ben", SCI, 2.8, "Check signal interference", "SPECTRUM", "Noise appears on the radio band. What is the first hypothesis to test?", [
      C("conj", "Check the Sun-Earth-Mars geometry for conjunction", "SUCCESS", "Near conjunction the Sun blocks the signal for weeks. The geometry is fine, so the fault is local.", { minutes: 15, science: 2, bonus: 20 }),
      C("dust", "Assume dust interference only", "PARTIAL", "Plausible, but you have not ruled out other causes.", { minutes: 10 }),
      C("jam", "Assume someone is jamming", "FAILURE", "There is no evidence for that.", { stress: 4 })]),
    S("fix", "REPAIR COMMUNICATIONS", "liam", TOW, 3.2, "Repair the communication system", "REPAIR OPTIONS", "How do you restore the link?", [
      C("local", "Repair locally: clean the feed, fix the connector", "SUCCESS", "Fixing the actual fault restores a clean, strong link.", { comms: 28, minutes: 60, bonus: 25, fatigue: 6 }, "60 min"),
      C("power", "Redirect power to the radio", "PARTIAL", "More radio power helps, but it strains the grid.", { comms: 14, power: -10, minutes: 20 }),
      C("backup", "Use the backup low-gain link", "PARTIAL", "Stable, but slow.", { comms: 12, minutes: 25 }),
      C("none", "Continue without Earth support", "RISK", "You keep working, but you lose guidance.", { comms: -6, stress: 6, flag: "noEarthSupport" })]),
    S("status", "SEND STATUS REPORT", "liam", TOW, 3.2, "Send the status report", "STATUS REPORT", "Request guidance from Earth. This needs a working link.", [
      C("ask", "Send status and request guidance", "SUCCESS", "Earth confirms the repair and advises on power use.", { stress: -6, bonus: 25, science: 2 }, "", { gate: { comms: 40, result: "The link is too weak. The message does not get through, and there is no guidance." } }),
      C("short", "Send a brief 'all OK'", "PARTIAL", "Earth knows you are alive but has few details.", { stress: -2, bonus: 5 }),
      C("hold", "Hold the report until the link improves", "RISK", "You stay silent and the crew feels isolated.", { stress: 4 })]),
  ] },
  { id: 5, title: "ROVER FAILURE", brief: "The rover has stopped far from base. Weigh battery, communication range and crew risk, then travel across the surface to reach it.", steps: [
    S("tele", "READ ROVER TELEMETRY", "liam", HAB, 3.2, "Read the rover telemetry", "ROVER TELEMETRY", "Battery 18%. Tilt 22°. Signal weak. What do you decide first?", [
      C("plan", "Plan a rescue and conserve rover power first", "SUCCESS", "A rover with 18% battery cannot afford chatter. Conserving gives you time to plan.", { minutes: 15, bonus: 20 }),
      C("reboot", "Attempt a remote reboot", "PARTIAL", "A reboot uses power and may not fix a mechanical fault.", { rover: -2, minutes: 10 }),
      C("wait", "Wait until morning", "RISK", "Cold nights drain batteries further.", { rover: -10, stress: 3 })]),
    S("bat", "MANAGE ROVER BATTERY", "liam", HAB, 3.2, "Manage the rover battery", "ROVER POWER", "Command the rover from base. Which mode?", [
      C("sleep", "Sleep mode with heaters only", "SUCCESS", "Heaters keep the battery alive overnight. That preserves the rover for repair.", { rover: 3, bonus: 20, minutes: 10 }),
      C("stream", "Keep telemetry streaming", "RISK", "More data now, but the battery runs down.", { rover: -8, science: 1 }),
      C("drive", "Try driving out", "FAILURE", "The rover digs in deeper and the battery drops.", { rover: -12, stress: 3 })]),
    S("crew", "CHOOSE THE RESCUE CREW", "sarah", MED, 3, "Check crew readiness for the EVA", "CREW READINESS", "Who goes out? Mind fatigue and oxygen.", [
      C("eva", "Send Eva only, with a relay beacon", "SUCCESS", "One rested engineer with a beacon is efficient and keeps oxygen use low.", { minutes: 15, bonus: 25 }),
      C("liam", "Send Liam alone", "PARTIAL", "He drives well, but is less able to fix the rover.", { minutes: 10 }),
      C("all", "Send the whole crew", "RISK", "More hands, but the base is left unattended and oxygen use climbs.", { oxygen: -8, fatigue: 8 })]),
    S("relay", "PLACE A COMMS RELAY", "eva", [14, 13], 3.5, "Navigate toward the rover, placing a relay", "RELAY BEACON", "Line of sight to the base drops soon. Where do you place the relay?", [
      C("ridge", "On the ridge with line of sight to both", "SUCCESS", "Radio at these frequencies needs line of sight. A ridge keeps both ends connected.", { comms: 8, minutes: 20, bonus: 20, fatigue: 4 }),
      C("here", "Right here", "PARTIAL", "It works, but the signal is blocked a little further on.", { comms: 3, minutes: 10 }),
      C("none", "Skip the relay", "RISK", "You lose contact beyond the ridge.", { comms: -8, stress: 5 })]),
    S("diag", "DIAGNOSE THE FAILURE", "eva", [22, 17.5], 3.2, "Diagnose the failure", "ROVER DIAGNOSTIC", "Rear-left wheel motor current spiked to three times normal, then the wheel stopped. What first?", [
      C("jam", "Inspect the wheel drive for a jam", "SUCCESS", "A current spike then a stall suggests a mechanical jam, such as regolith or a stone in the gearing.", { minutes: 25, bonus: 25 }),
      C("flash", "Reflash the software", "PARTIAL", "Rarely the cause of a current spike.", { minutes: 20 }),
      C("swap", "Swap the battery", "FAILURE", "The battery is not the issue.", { minutes: 30, fatigue: 6 })]),
    S("fix", "REPAIR OR ABANDON", "eva", [22, 17.5], 3.2, "Repair or abandon the rover", "FINAL DECISION", "The jam is cleared, but a wheel bearing is damaged. What do you do?", [
      C("fix", "Full repair on site", "SUCCESS", "Fixing it properly gives you a rover you can trust again.", { minutes: 90, fatigue: 12, rover: 40, bonus: 30, flag: "roverRepaired" }, "90 min"),
      C("limp", "Limp home in reduced mode", "PARTIAL", "You get home, but the rover is limited.", { minutes: 45, rover: 15, fatigue: 6 }),
      C("leave", "Abandon it and salvage the instruments", "RISK", "You keep the data, lose the vehicle, and science drops.", { science: -3, rover: -30, flag: "abandonedRover", minutes: 30 })]),
  ] },
];
export const WIP = [["06", "MEDICAL EMERGENCY"], ["07", "POWER COLLAPSE"], ["08", "SCIENTIFIC ANOMALY"], ["09", "THE DESCENT"], ["10", "LAST HORIZON"]] as const;
export const FLAG_NOTES: Record<string, { text: string; fx: Partial<Record<string, number>> }> = {
  conservedPower: { text: "Power conserved earlier: +10 power reserve.", fx: { power: 10 } },
  solarDamaged: { text: "A panel was damaged in the storm: -10 power.", fx: { power: -10 } },
  roverExposed: { text: "The rover took storm damage: -25 rover integrity.", fx: { rover: -25 } },
  noEarthSupport: { text: "You went without Earth support: -15 comms.", fx: { comms: -15 } },
  deepDig: { text: "The crew dug through the night: +10 fatigue.", fx: { fatigue: 10 } },
};
