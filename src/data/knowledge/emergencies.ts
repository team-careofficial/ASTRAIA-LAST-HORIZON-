import type { Choice, DialogNode, Effects, Tag } from "@/types/world";
const C = (id: string, label: string, tag: Tag, result: string, effects: Effects, next: string): Choice => ({ id, label, tag, result, effects, next });
const N = (id: string, title: string, body: string, choices: Choice[]): DialogNode => ({ id, title, body, choices });
export interface Emergency { title: string; nodes: Record<string, DialogNode> }
/** Realistic emergency procedures, run through the same dialog engine as missions. */
export const EMERGENCIES: Record<string, Emergency> = {
  power: { title: "POWER FAILURE", nodes: {
    n1: N("n1", "POWER FAILURE · STEP 1 OF 3", "WARNING: habitat power is critically low. Protect life support first. What do you do?", [
      C("shed", "Shed non-essential loads (science, lights)", "SUCCESS", "Life support keeps running while you buy time. Load shedding is the first response to a shortfall.", { power: 6, minutes: 5, bonus: 15 }, "n2"),
      C("bat", "Switch everything to battery", "RISK", "The battery covers the load briefly, but drains fast and leaves no reserve.", { battery: -10, power: 3 }, "n2"),
      C("wait", "Wait and watch the readings", "FAILURE", "Power keeps sinking and the crew grows tense.", { power: -4, stress: 6 }, "n2")]),
    n2: N("n2", "POWER FAILURE · STEP 2 OF 3", "Find the cause. What do you check?", [
      C("gen", "Compare array output with the load", "SUCCESS", "You see output has dropped, not that the load has jumped. That points at dust, shading or a connector.", { minutes: 10, bonus: 15 }, "n3"),
      C("load", "Assume a faulty load and power cycle everything", "PARTIAL", "Resetting loads wastes energy and does not find the cause.", { power: -3, minutes: 10 }, "n3"),
      C("guess", "Guess and move on", "FAILURE", "Without a cause, the fault returns.", { stress: 4, minutes: 5 }, "n3")]),
    n3: N("n3", "POWER FAILURE · STEP 3 OF 3", "Verify the fix before resuming normal work.", [
      C("verify", "Check bus voltage and report to Earth", "SUCCESS", "A stable bus confirms the repair. Earth now knows your state.", { power: 4, bonus: 20, stress: -3 }, "done"),
      C("skip", "Resume work immediately", "RISK", "Without checking, a hidden fault can come back at a bad time.", { stress: 3 }, "done")]) } },
  oxygen: { title: "CABIN AIR WARNING", nodes: {
    n1: N("n1", "CABIN AIR · STEP 1 OF 3", "WARNING: oxygen is low and CO₂ may be rising. What first?", [
      C("confirm", "Confirm the readings on a second sensor", "SUCCESS", "A second sensor rules out a bad reading before you act.", { minutes: 5, bonus: 15 }, "n2"),
      C("vent", "Vent the cabin to outside air", "FAILURE", "Mars air is mostly CO₂ and far too thin to breathe.", { oxygen: -8, stress: 8, habitat: -2 }, "n2"),
      C("flow", "Increase oxygen flow only", "PARTIAL", "More O₂ helps, but CO₂ is still rising.", { oxygen: 3, stress: 2 }, "n2")]),
    n2: N("n2", "CABIN AIR · STEP 2 OF 3", "Next, restore the air.", [
      C("scrub", "Replace the CO₂ scrubber cartridge", "SUCCESS", "Scrubbers remove the CO₂ that makes the air dangerous.", { oxygen: 6, minutes: 10, bonus: 15 }, "n3"),
      C("ignore", "Wait for it to improve", "FAILURE", "CO₂ keeps rising and the crew tires.", { oxygen: -4, stress: 5 }, "n3")]),
    n3: N("n3", "CABIN AIR · STEP 3 OF 3", "Check the crew before resuming.", [
      C("check", "Medical check of every crew member", "SUCCESS", "Early signs of high CO₂ are easy to miss. A check keeps everyone safe.", { stress: -3, bonus: 15 }, "done"),
      C("skip", "Skip the checks", "RISK", "Someone may still be unwell.", { stress: 3 }, "done")]) } },
  comms: { title: "COMMUNICATION FAILURE", nodes: {
    n1: N("n1", "COMMS FAILURE · STEP 1 OF 2", "The Earth link is nearly gone. Where do you start?", [
      C("ant", "Check antenna pointing and dust on the feed", "SUCCESS", "The simplest causes come first: pointing and dust.", { comms: 8, minutes: 10, bonus: 15 }, "n2"),
      C("swap", "Replace the radio", "RISK", "A big job on a guess.", { minutes: 40, stress: 3 }, "n2")]),
    n2: N("n2", "COMMS FAILURE · STEP 2 OF 2", "Report your status.", [
      C("backup", "Use the low-gain backup link", "SUCCESS", "Slow but reliable. Earth knows you are safe.", { comms: 6, stress: -3, bonus: 15 }, "done"),
      C("silent", "Stay silent and keep working", "RISK", "Earth cannot help if it does not know what is wrong.", { stress: 4 }, "done")]) } },
};

/** Where the crew must physically go for each emergency step. Step names match the dialog nodes n1, n2, n3. */
export interface EmgStation { name: string; verb: string; pos: [number, number]; radius: number }
export const EMG_STATIONS: Record<string, EmgStation[]> = {
  power: [{ name: "Habitat power panel", verb: "SHED LOADS", pos: [10.5, 5], radius: 3 }, { name: "Solar array field", verb: "INSPECT ARRAYS", pos: [6, -6], radius: 3.2 }, { name: "Bus monitor", verb: "VERIFY BUS", pos: [14, 4.6], radius: 3 }],
  oxygen: [{ name: "Cabin air sensor", verb: "CONFIRM READINGS", pos: [12, 5], radius: 3 }, { name: "Scrubber cabinet", verb: "SWAP SCRUBBER", pos: [17, -2.5], radius: 3 }, { name: "Medical station", verb: "CREW CHECK", pos: [3, -5.5], radius: 2.6 }],
  comms: [{ name: "Antenna base", verb: "CHECK ANTENNA", pos: [0, -13], radius: 3 }, { name: "Radio console", verb: "BACKUP LINK", pos: [-11.5, 4], radius: 2.6 }],
};
