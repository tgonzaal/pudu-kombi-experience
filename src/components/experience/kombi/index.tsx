"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Body } from "./body";
import { Wheels } from "./wheels";
import { Interior } from "./interior";
import {
  CopilotDoor,
  DriverDoor,
  EngineLid,
  SlidingDoor,
  Tailgate,
} from "./doors";
import { useKombiMaterials } from "./materials";
import { useBrandTextures } from "./textures";
import { isInstantMode } from "../instant";
import type { KombiOpenState, PartKey } from "./constants";

const EASE = "power3.inOut";

/** Anima la rotación Y de una puerta con bisagra vertical. */
function useHingeY(
  ref: React.RefObject<THREE.Group | null>,
  open: boolean,
  angle: number,
) {
  useEffect(() => {
    if (!ref.current) return;
    const tween = gsap.to(ref.current.rotation, {
      y: open ? angle : 0,
      duration: 1.3,
      ease: EASE,
      overwrite: "auto",
    });
    if (isInstantMode()) tween.progress(1);
    return () => {
      tween.kill();
    };
  }, [ref, open, angle]);
}

/** Anima la rotación Z de una tapa con bisagra horizontal superior. */
function useHingeZ(
  ref: React.RefObject<THREE.Group | null>,
  open: boolean,
  angle: number,
) {
  useEffect(() => {
    if (!ref.current) return;
    const tween = gsap.to(ref.current.rotation, {
      z: open ? angle : 0,
      duration: 1.4,
      ease: EASE,
      overwrite: "auto",
    });
    if (isInstantMode()) tween.progress(1);
    return () => {
      tween.kill();
    };
  }, [ref, open, angle]);
}

/**
 * La Kombi PUDÚ completa: carrocería, interior estudio y las cinco
 * partes móviles animadas cinematográficamente con GSAP.
 */
export function Kombi({
  open,
  onToggle,
}: {
  open: KombiOpenState;
  onToggle: (part: PartKey) => void;
}) {
  const m = useKombiMaterials();
  const tex = useBrandTextures();

  const driverRef = useRef<THREE.Group>(null);
  const copilotRef = useRef<THREE.Group>(null);
  const sliderRef = useRef<THREE.Group>(null);
  const tailgateRef = useRef<THREE.Group>(null);
  const engineRef = useRef<THREE.Group>(null);

  useHingeY(driverRef, open.driver, -1.15);
  useHingeY(copilotRef, open.copilot, 1.15);
  useHingeZ(tailgateRef, open.tailgate, -1.75);
  useHingeZ(engineRef, open.engine, -1.25);

  // La corrediza se desplaza en dos tiempos: se separa y luego desliza
  useEffect(() => {
    const g = sliderRef.current;
    if (!g) return;
    const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
    if (open.slider) {
      tl.to(g.position, { z: 1.0, duration: 0.45, ease: "power2.out" }).to(
        g.position,
        { x: -0.88, duration: 1.1, ease: EASE },
      );
    } else {
      tl.to(g.position, { x: 0, duration: 1.0, ease: EASE }).to(g.position, {
        z: 0.86,
        duration: 0.4,
        ease: "power2.in",
      });
    }
    if (isInstantMode()) tl.progress(1);
    return () => {
      tl.kill();
    };
  }, [open.slider]);

  return (
    <group>
      <Body m={m} tex={tex} />
      <Wheels m={m} />
      <Interior m={m} tex={tex} />
      <DriverDoor groupRef={driverRef} m={m} onToggle={onToggle} />
      <CopilotDoor groupRef={copilotRef} m={m} onToggle={onToggle} />
      <SlidingDoor groupRef={sliderRef} m={m} tex={tex} onToggle={onToggle} />
      <Tailgate groupRef={tailgateRef} m={m} onToggle={onToggle} />
      <EngineLid groupRef={engineRef} m={m} tex={tex} onToggle={onToggle} />
    </group>
  );
}
