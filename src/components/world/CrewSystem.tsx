import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Astronaut from "./Astronaut";
import { height } from "./MarsWorld";
import { decals, dustFx } from "./kit";
import { cam } from "./camera";
import { game } from "@/game/engine/store";
import { CREW3D, MISSIONS } from "@/data/world/missions";
import { EMG_STATIONS } from "@/data/knowledge/emergencies";
import { ARENA_RADIUS, colliders, START } from "@/data/world/layout";

const tmp = new THREE.Vector3();
const wrap = (d: number) => ((d + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
export default function CrewSystem() {
  const groups = useRef<(THREE.Group | null)[]>([]), rings = useRef<(THREE.Mesh | null)[]>([]);
  const speeds = useRef(CREW3D.map(() => ({ current: 0 }))), acts = useRef(CREW3D.map(() => ({ current: 0 })));
  const pen = useRef(0), foot = useRef(CREW3D.map(() => ({ d: 0, s: 1 }))), intro = useRef(-1), rot = useRef(CREW3D.map(() => 0)), keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true; const g = game.get();
      if (/^Digit[1-4]$/.test(e.code)) game.setActive(Number(e.code.slice(5)) - 1);
      if (e.code === "Escape") game.togglePause();
      if (e.code === "Tab") { e.preventDefault(); game.cycle(); }
      if (e.code === "KeyE" && g.screen === "play" && !g.dialog && !g.paused) { if (g.nearby) acts.current[g.active].current = 1; game.interact(); }
    };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); game.markReady("crew");
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);
  useFrame((st, rawDt) => {
    const dt = Math.min(rawDt, 0.05), g = game.get(), k = keys.current, me = groups.current[g.active];
    if (g.screen === "play" && me) {
      if (!g.paused) { if (k.ArrowLeft) cam.yaw += dt * 1.8; if (k.ArrowRight) cam.yaw -= dt * 1.8; }
      const f = (k.KeyW ? 1 : 0) - (k.KeyS ? 1 : 0), r = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0), moving = !g.dialog && !g.paused && (f !== 0 || r !== 0);
      if (moving) {
        const sy = Math.sin(cam.yaw), cy = Math.cos(cam.yaw); let mx = -sy * f + cy * r, mz = -cy * f - sy * r; const l = Math.hypot(mx, mz); mx /= l; mz /= l;
        const sp = k.ShiftLeft || k.ShiftRight ? 6 : 3; me.position.x += mx * sp * dt; me.position.z += mz * sp * dt;
        for (const c of colliders(g.mission + 1)) { const dx = me.position.x - c.x, dz = me.position.z - c.z, d = Math.hypot(dx, dz), min = c.r + 0.45; if (d < min && d > 0) { me.position.x = c.x + (dx / d) * min; me.position.z = c.z + (dz / d) * min; } }
        const rr = Math.hypot(me.position.x, me.position.z); if (rr > ARENA_RADIUS) { me.position.x *= ARENA_RADIUS / rr; me.position.z *= ARENA_RADIUS / rr; }
        rot.current[g.active] += wrap(Math.atan2(mx, mz) - rot.current[g.active]) * Math.min(1, dt * 10);
        const fp = foot.current[g.active], yaw = rot.current[g.active]; fp.d += sp * dt;
        if (fp.d > 0.8) { fp.d = 0; fp.s *= -1; const px = me.position.x + Math.cos(yaw) * 0.16 * fp.s, pz = me.position.z - Math.sin(yaw) * 0.16 * fp.s; decals.push("foot", px, height(px, pz), pz, yaw); if (sp > 4) dustFx.emit(px, height(px, pz), pz, -mx * sp, -mz * sp, 2, 0.4); }
        speeds.current[g.active].current += (sp - speeds.current[g.active].current) * Math.min(1, dt * 8);
      } else speeds.current[g.active].current *= Math.max(0, 1 - dt * 10);
      me.position.y = height(me.position.x, me.position.z);
      const stn = g.emgRun ? EMG_STATIONS[g.emgRun.id][g.emgRun.idx] : null, tgt = stn ?? MISSIONS[g.mission].steps[g.step], dd = Math.hypot(me.position.x - tgt.pos[0], me.position.z - tgt.pos[1]);
      if (g.emgRun && !g.paused && !g.dialog) { pen.current += dt; if (pen.current > 5) { pen.current = 0; game.emgPenalty(); } }
      game.setNear(Math.round(dd), dd < tgt.radius);
    }
    CREW3D.forEach((_, i) => {
      const o = groups.current[i]; if (!o) return; acts.current[i].current = Math.max(0, acts.current[i].current - dt * 1.2);
      if (rings.current[i]) rings.current[i]!.visible = g.screen === "play" && i === g.active;
      if (i !== g.active || g.screen !== "play") { speeds.current[i].current = 0; const a = groups.current[g.active]; if (a && g.screen === "play") { const dx = a.position.x - o.position.x, dz = a.position.z - o.position.z; if (Math.hypot(dx, dz) < 10) rot.current[i] += wrap(Math.atan2(dx, dz) - rot.current[i]) * Math.min(1, dt * 3); } }
      o.rotation.y = rot.current[i]; o.position.y = height(o.position.x, o.position.z);
    });
    const t = st.clock.elapsedTime;
    if (g.screen === "play" && me) {
      const p = me.position, dlg = !!g.dialog, dist = dlg ? 4 : cam.dist, pit = dlg ? 0.12 : cam.pitch, cp = Math.cos(pit);
      tmp.set(p.x + Math.sin(cam.yaw) * cp * dist, p.y + Math.max(0.8, 1.6 + Math.sin(pit) * dist), p.z + Math.cos(cam.yaw) * cp * dist);
      if (tmp.y - p.y < 4) for (const c of colliders(g.mission + 1)) { const dx = tmp.x - c.x, dz = tmp.z - c.z, d2 = Math.hypot(dx, dz); if (d2 < c.r + 0.3 && d2 > 0) { tmp.x = c.x + (dx / d2) * (c.r + 0.3); tmp.z = c.z + (dz / d2) * (c.r + 0.3); } }
      st.camera.position.lerp(tmp, 1 - Math.exp(-(dlg ? 4 : 8) * dt)); st.camera.lookAt(p.x, p.y + 1.4, p.z);
    } else {
      if (g.screen === "boot") intro.current = -1; else if (intro.current < 0) intro.current = t;
      const k0 = g.screen === "boot" || intro.current < 0 ? 1 : Math.exp(-(t - intro.current) * 0.45), a = t * 0.07 + 0.6, rad = 24 + 70 * k0;
      tmp.set(Math.sin(a) * rad, 5 + 45 * k0 + Math.sin(t * 0.1) * 1.5, Math.cos(a) * rad - 4);
      st.camera.position.lerp(tmp, 1 - Math.exp(-2 * dt)); st.camera.lookAt(0, 3, -4);
    }
  });
  return <>{CREW3D.map((c, i) => (
    <group key={c.id} ref={el => { groups.current[i] = el; }} position={[START[i][0], 0, START[i][1]]}>
      <Astronaut color={c.color} speed={speeds.current[i]} acting={acts.current[i]} />
      <mesh ref={el => { rings.current[i] = el; }} rotation-x={-Math.PI / 2} position-y={0.04} visible={false}><ringGeometry args={[0.55, 0.7, 32]} /><meshBasicMaterial color="#e8a24a" transparent opacity={0.9} /></mesh>
    </group>))}</>;
}
