import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

/** Drop real GLB files into public/models and they replace the procedural stand-ins. Tune scale and rotation here. */
export const MODEL_CFG = { astronaut: { scale: 1, rotY: 0, y: 0 }, rover: { scale: 1, rotY: 0, y: 0 }, ship: { scale: 1, rotY: 0, y: 0 }, habitat: { scale: 1, rotY: 0, y: 0 }, lander: { scale: 1, rotY: 0, y: 0 } };
const cache = new Map<string, boolean>();
/** True only when the file really exists, so a missing model never crashes the scene. */
export function useAsset(url: string): boolean {
  const [ok, setOk] = useState(cache.get(url) ?? false);
  useEffect(() => {
    if (cache.has(url)) { setOk(cache.get(url)!); return; }
    let live = true;
    fetch(url, { method: "HEAD" }).then(r => { const good = r.ok && !(r.headers.get("content-type") || "").includes("text/html"); cache.set(url, good); if (live) setOk(good); }).catch(() => { cache.set(url, false); });
    return () => { live = false; };
  }, [url]);
  return ok;
}
const prep = (o: THREE.Object3D) => o.traverse(c => { const m = c as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
export function Glb({ url, scale, rotY, y }: { url: string; scale: number; rotY: number; y: number }) {
  const { scene } = useGLTF(url), c = useMemo(() => { const k = SkeletonUtils.clone(scene); prep(k); return k; }, [scene]);
  return <primitive object={c} scale={scale} rotation-y={rotY} position-y={y} />;
}
/** Animated astronaut: picks Idle, Walk or Run clips by name from the GLB. */
export function GlbAstronaut({ url, speed }: { url: string; speed: { current: number } }) {
  const g = useRef<THREE.Group>(null), { scene, animations } = useGLTF(url), c = useMemo(() => { const k = SkeletonUtils.clone(scene); prep(k); return k; }, [scene]);
  const { actions } = useAnimations(animations, g), cur = useRef(""), cfg = MODEL_CFG.astronaut;
  useFrame(() => {
    const v = speed.current, find = (re: RegExp) => Object.keys(actions).find(k => re.test(k)), name = (v < 0.3 ? find(/idle/i) : v < 4.5 ? find(/walk/i) : find(/run/i) ?? find(/walk/i)) ?? Object.keys(actions)[0];
    if (name && name !== cur.current) { actions[cur.current]?.fadeOut(0.25); actions[name]?.reset().fadeIn(0.25).play(); cur.current = name; }
  });
  return <group ref={g} scale={cfg.scale} rotation-y={cfg.rotY} position-y={cfg.y}><primitive object={c} /></group>;
}
