"use client";

import { useEffect, useRef, useState } from "react";

type CharacterSet = "Base Character" | "Pistol" | "Rifle" | "Sword";
type AnimationName =
  | "idle"
  | "walk"
  | "run"
  | "jump"
  | "hit"
  | "death"
  | "roll"
  | "slide"
  | "attack";
type PlayerId = 1 | 2;
type MatchPhase = "active" | "finished";

export const SPRITE_MANIFEST: Record<
  CharacterSet,
  Record<AnimationName, number>
> = {
  "Base Character": {
    idle: 4,
    walk: 8,
    run: 8,
    jump: 8,
    hit: 3,
    death: 5,
    roll: 7,
    slide: 5,
    attack: 13,
  },
  Pistol: {
    idle: 4,
    walk: 8,
    run: 8,
    jump: 8,
    hit: 3,
    death: 7,
    roll: 7,
    slide: 5,
    attack: 3,
  },
  Rifle: {
    idle: 4,
    walk: 8,
    run: 8,
    jump: 8,
    hit: 3,
    death: 7,
    roll: 7,
    slide: 5,
    attack: 2,
  },
  Sword: {
    idle: 4,
    walk: 8,
    run: 8,
    jump: 8,
    hit: 3,
    death: 8,
    roll: 7,
    slide: 5,
    attack: 6,
  },
};

const CHARACTER_SETS = Object.keys(SPRITE_MANIFEST) as CharacterSet[];
const ANIMATIONS = Object.keys(
  SPRITE_MANIFEST["Base Character"],
) as AnimationName[];
const TOTAL_SPRITES = CHARACTER_SETS.reduce(
  (setTotal, set) =>
    setTotal +
    ANIMATIONS.reduce(
      (animationTotal, animation) =>
        animationTotal + SPRITE_MANIFEST[set][animation],
      0,
    ),
  0,
);

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const GROUND_Y = 596;
const LEFT_BOUND = 96;
const RIGHT_BOUND = CANVAS_WIDTH - 96;
const FIGHTER_DISTANCE = 106;

const WEAPON_LABELS: Record<CharacterSet, string> = {
  "Base Character": "Punhos",
  Sword: "Espada",
  Pistol: "Pistola",
  Rifle: "Rifle",
};

const ANIMATION_FPS: Record<AnimationName, number> = {
  idle: 8,
  walk: 12,
  run: 15,
  jump: 12,
  hit: 14,
  death: 10,
  roll: 15,
  slide: 14,
  attack: 17,
};

interface AttackSpec {
  label: string;
  weapon: CharacterSet;
  damage: number;
  range: number;
  knockback: number;
  ranged?: boolean;
  superCost?: number;
}

const ATTACKS: Record<
  "base" | "sword" | "pistol" | "rifle" | "super",
  AttackSpec
> = {
  base: {
    label: "Golpe",
    weapon: "Base Character",
    damage: 8,
    range: 132,
    knockback: 82,
  },
  sword: {
    label: "Corte",
    weapon: "Sword",
    damage: 13,
    range: 178,
    knockback: 112,
  },
  pistol: {
    label: "Disparo",
    weapon: "Pistol",
    damage: 10,
    range: 650,
    knockback: 92,
    ranged: true,
  },
  rifle: {
    label: "Rajada",
    weapon: "Rifle",
    damage: 16,
    range: 880,
    knockback: 138,
    ranged: true,
  },
  super: {
    label: "Pulso máximo",
    weapon: "Rifle",
    damage: 30,
    range: 1100,
    knockback: 230,
    ranged: true,
    superCost: 100,
  },
};

interface ActiveAttack {
  spec: AttackSpec;
  resolved: boolean;
}

interface Fighter {
  id: PlayerId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  health: number;
  super: number;
  weapon: CharacterSet;
  animation: AnimationName;
  frame: number;
  frameClock: number;
  locked: boolean;
  attack: ActiveAttack | null;
  hitFlash: number;
}

interface ArenaEffect {
  kind: "hit" | "shot" | "super";
  x: number;
  y: number;
  targetX: number;
  color: string;
  age: number;
  duration: number;
}

interface GameState {
  p1: Fighter;
  p2: Fighter;
  timer: number;
  elapsed: number;
  phase: MatchPhase;
  result: string;
  notice: string;
  noticeUntil: number;
  effects: ArenaEffect[];
}

interface HudState {
  p1Health: number;
  p2Health: number;
  p1Super: number;
  p2Super: number;
  p1Weapon: CharacterSet;
  p2Weapon: CharacterSet;
  timer: number;
  status: string;
  phase: MatchPhase;
  result: string;
}

interface LoadingState {
  loaded: number;
  failed: number;
  ready: boolean;
}

interface ControlEntry {
  keys: string[];
  label: string;
}

const P1_CONTROLS: ControlEntry[] = [
  { keys: ["A", "D"], label: "Mover" },
  { keys: ["Shift esq."], label: "Correr" },
  { keys: ["W"], label: "Pular" },
  { keys: ["S"], label: "Deslizar" },
  { keys: ["Q"], label: "Rolar" },
  { keys: ["J"], label: "Golpe" },
  { keys: ["K"], label: "Espada" },
  { keys: ["L"], label: "Pistola" },
  { keys: ["I"], label: "Rifle" },
  { keys: ["U"], label: "Super (100%)" },
];

const P2_CONTROLS: ControlEntry[] = [
  { keys: ["←", "→"], label: "Mover" },
  { keys: ["Shift dir."], label: "Correr" },
  { keys: ["↑"], label: "Pular" },
  { keys: ["↓"], label: "Deslizar" },
  { keys: ["Num 0"], label: "Rolar" },
  { keys: ["Num 1"], label: "Golpe" },
  { keys: ["Num 2"], label: "Espada" },
  { keys: ["Num 3"], label: "Pistola" },
  { keys: ["Num 5"], label: "Rifle" },
  { keys: ["Num Enter"], label: "Super (100%)" },
];

const GAME_KEYS = new Set([
  "KeyA",
  "KeyD",
  "ShiftLeft",
  "KeyW",
  "KeyS",
  "KeyQ",
  "KeyJ",
  "KeyK",
  "KeyL",
  "KeyI",
  "KeyU",
  "ArrowLeft",
  "ArrowRight",
  "ShiftRight",
  "ArrowUp",
  "ArrowDown",
  "Numpad0",
  "Numpad1",
  "Numpad2",
  "Numpad3",
  "Numpad5",
  "NumpadEnter",
  "Digit0",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit5",
  "Enter",
  "KeyR",
]);

function createFighter(id: PlayerId, x: number, facing: 1 | -1): Fighter {
  return {
    id,
    x,
    y: 0,
    vx: 0,
    vy: 0,
    facing,
    health: 100,
    super: 0,
    weapon: "Base Character",
    animation: "idle",
    frame: 0,
    frameClock: 0,
    locked: false,
    attack: null,
    hitFlash: 0,
  };
}

function createGame(): GameState {
  return {
    p1: createFighter(1, 370, 1),
    p2: createFighter(2, 910, -1),
    timer: 60,
    elapsed: 0,
    phase: "active",
    result: "",
    notice: "LUTEM!",
    noticeUntil: 1.25,
    effects: [],
  };
}

function statusFor(game: GameState): string {
  if (game.phase === "finished") {
    return "";
  }
  if (game.noticeUntil > game.elapsed) {
    return game.notice;
  }
  return "";
}

function hudFor(game: GameState): HudState {
  return {
    p1Health: Math.round(game.p1.health),
    p2Health: Math.round(game.p2.health),
    p1Super: Math.round(game.p1.super),
    p2Super: Math.round(game.p2.super),
    p1Weapon: game.p1.weapon,
    p2Weapon: game.p2.weapon,
    timer: Math.max(0, Math.ceil(game.timer)),
    status: statusFor(game),
    phase: game.phase,
    result: game.result,
  };
}

function spriteKey(
  set: CharacterSet,
  animation: AnimationName,
  frame: number,
): string {
  return `${set}|${animation}|${frame}`;
}

function spriteUrl(
  set: CharacterSet,
  animation: AnimationName,
  frame: number,
): string {
  const folder = encodeURIComponent(set);
  const file = encodeURIComponent(`${animation} (${frame}).png`);
  return `/assets/animated-prototype-character/${folder}/${file}`;
}

function setAnimation(
  fighter: Fighter,
  animation: AnimationName,
  locked = false,
  restart = false,
) {
  if (
    !restart &&
    fighter.animation === animation &&
    fighter.locked === locked
  ) {
    return;
  }
  fighter.animation = animation;
  fighter.frame = 0;
  fighter.frameClock = 0;
  fighter.locked = locked;
}

function finishAction(fighter: Fighter) {
  fighter.locked = false;
  fighter.attack = null;
  fighter.vx = 0;
  setAnimation(fighter, fighter.y < 0 ? "jump" : "idle", false, true);
}

function keepInsideArena(fighter: Fighter) {
  fighter.x = Math.max(LEFT_BOUND, Math.min(RIGHT_BOUND, fighter.x));
}

function resolveFighterCollision(p1: Fighter, p2: Fighter) {
  if (Math.abs(p1.y - p2.y) > 130) {
    return;
  }
  const delta = p2.x - p1.x;
  const distance = Math.abs(delta);
  if (distance >= FIGHTER_DISTANCE) {
    return;
  }
  const direction = delta >= 0 ? 1 : -1;
  const correction = (FIGHTER_DISTANCE - distance) / 2;
  p1.x -= correction * direction;
  p2.x += correction * direction;
  keepInsideArena(p1);
  keepInsideArena(p2);
}

function winnerLabel(player: Fighter): string {
  return player.id === 1 ? "P1 VENCEU" : "P2 VENCEU";
}

function finishByTime(game: GameState) {
  game.timer = 0;
  game.phase = "finished";
  if (game.p1.health === game.p2.health) {
    game.result = "TEMPO · EMPATE";
  } else {
    game.result =
      game.p1.health > game.p2.health
        ? `TEMPO · ${winnerLabel(game.p1)}`
        : `TEMPO · ${winnerLabel(game.p2)}`;
  }
  for (const fighter of [game.p1, game.p2]) {
    if (fighter.health > 0) {
      fighter.attack = null;
      fighter.locked = false;
      fighter.vx = 0;
      setAnimation(fighter, "idle", false, true);
    }
  }
}

function finishByKnockout(
  game: GameState,
  winner: Fighter,
  defeated: Fighter,
) {
  game.phase = "finished";
  game.result = `K.O. · ${winnerLabel(winner)}`;
  defeated.health = 0;
  defeated.attack = null;
  defeated.vx = winner.facing * 130;
  setAnimation(defeated, "death", true, true);
}

function resolveAttack(
  game: GameState,
  attacker: Fighter,
  defender: Fighter,
) {
  const activeAttack = attacker.attack;
  if (!activeAttack || activeAttack.resolved) {
    return;
  }

  activeAttack.resolved = true;
  const { spec } = activeAttack;
  const delta = defender.x - attacker.x;
  const inFront = delta * attacker.facing > -28;
  const inRange = Math.abs(delta) <= spec.range;
  const nearSameHeight = Math.abs(defender.y - attacker.y) < 165;
  const dodged = defender.animation === "roll" && defender.locked;
  const color = attacker.id === 1 ? "#ffb454" : "#55e8ff";

  if (spec.ranged) {
    game.effects.push({
      kind: spec.superCost ? "super" : "shot",
      x: attacker.x + attacker.facing * 54,
      y: GROUND_Y + attacker.y - 126,
      targetX:
        inRange && inFront
          ? defender.x
          : attacker.x + attacker.facing * Math.min(spec.range, 760),
      color,
      age: 0,
      duration: spec.superCost ? 0.42 : 0.2,
    });
  }

  if (
    game.phase !== "active" ||
    defender.health <= 0 ||
    !inFront ||
    !inRange ||
    !nearSameHeight ||
    dodged
  ) {
    if (dodged) {
      game.notice = `P${defender.id} esquivou`;
      game.noticeUntil = game.elapsed + 0.8;
    }
    return;
  }

  defender.health = Math.max(0, defender.health - spec.damage);
  defender.hitFlash = 0.16;
  defender.vx = attacker.facing * spec.knockback;
  attacker.super = spec.superCost
    ? attacker.super
    : Math.min(100, attacker.super + spec.damage * 1.75 + 4);
  defender.super = Math.min(100, defender.super + spec.damage * 1.15 + 2);

  game.effects.push({
    kind: "hit",
    x: defender.x - attacker.facing * 16,
    y: GROUND_Y + defender.y - 132,
    targetX: defender.x,
    color,
    age: 0,
    duration: 0.3,
  });
  game.notice = `P${attacker.id} · ${spec.label} · ${spec.damage} DANO`;
  game.noticeUntil = game.elapsed + 0.9;

  if (defender.health <= 0) {
    finishByKnockout(game, attacker, defender);
    return;
  }

  defender.attack = null;
  setAnimation(defender, "hit", true, true);
}

function advanceAnimation(
  game: GameState,
  fighter: Fighter,
  opponent: Fighter,
  deltaSeconds: number,
) {
  const frameCount = SPRITE_MANIFEST[fighter.weapon][fighter.animation];
  const frameDuration = 1 / ANIMATION_FPS[fighter.animation];
  fighter.frameClock += deltaSeconds;

  while (fighter.frameClock >= frameDuration) {
    fighter.frameClock -= frameDuration;
    fighter.frame += 1;

    if (fighter.animation === "attack" && fighter.attack) {
      const hitFrame = Math.max(1, Math.floor(frameCount * 0.46));
      if (fighter.frame >= hitFrame) {
        resolveAttack(game, fighter, opponent);
      }
    }

    if (fighter.frame < frameCount) {
      continue;
    }

    if (fighter.animation === "death") {
      fighter.frame = frameCount - 1;
      fighter.frameClock = 0;
      break;
    }

    if (
      fighter.animation === "attack" ||
      fighter.animation === "hit" ||
      fighter.animation === "roll" ||
      fighter.animation === "slide"
    ) {
      finishAction(fighter);
      break;
    }

    fighter.frame = 0;
  }
}

function updatePhysics(fighter: Fighter, deltaSeconds: number) {
  if (fighter.y < 0 || fighter.vy !== 0) {
    fighter.vy += 1740 * deltaSeconds;
    fighter.y += fighter.vy * deltaSeconds;
    if (fighter.y >= 0) {
      fighter.y = 0;
      fighter.vy = 0;
      if (!fighter.locked && fighter.animation === "jump") {
        setAnimation(fighter, "idle", false, true);
      }
    }
  }
}

function updateMovement(
  game: GameState,
  fighter: Fighter,
  heldKeys: Set<string>,
  deltaSeconds: number,
) {
  if (fighter.health <= 0) {
    fighter.x += fighter.vx * deltaSeconds;
    fighter.vx *= Math.pow(0.02, deltaSeconds);
    keepInsideArena(fighter);
    return;
  }

  if (fighter.locked) {
    if (
      fighter.animation === "roll" ||
      fighter.animation === "slide" ||
      fighter.animation === "hit"
    ) {
      fighter.x += fighter.vx * deltaSeconds;
      fighter.vx *= Math.pow(0.075, deltaSeconds);
      keepInsideArena(fighter);
    }
    return;
  }

  if (game.phase !== "active") {
    fighter.vx = 0;
    return;
  }

  const leftCode = fighter.id === 1 ? "KeyA" : "ArrowLeft";
  const rightCode = fighter.id === 1 ? "KeyD" : "ArrowRight";
  const runCode = fighter.id === 1 ? "ShiftLeft" : "ShiftRight";
  const direction =
    (heldKeys.has(rightCode) ? 1 : 0) - (heldKeys.has(leftCode) ? 1 : 0);
  const running = heldKeys.has(runCode);
  const speed = running ? 330 : 205;

  fighter.vx = direction * speed;
  fighter.x += fighter.vx * deltaSeconds;
  keepInsideArena(fighter);

  if (fighter.y < 0) {
    setAnimation(fighter, "jump");
  } else if (direction !== 0) {
    setAnimation(fighter, running ? "run" : "walk");
  } else {
    setAnimation(fighter, "idle");
  }
}

function directionFor(
  fighter: Fighter,
  heldKeys: Set<string>,
): 1 | -1 {
  const leftCode = fighter.id === 1 ? "KeyA" : "ArrowLeft";
  const rightCode = fighter.id === 1 ? "KeyD" : "ArrowRight";
  if (heldKeys.has(leftCode) && !heldKeys.has(rightCode)) {
    return -1;
  }
  if (heldKeys.has(rightCode) && !heldKeys.has(leftCode)) {
    return 1;
  }
  return fighter.facing;
}

function startJump(game: GameState, fighter: Fighter) {
  if (
    game.phase !== "active" ||
    fighter.health <= 0 ||
    fighter.locked ||
    fighter.y < 0
  ) {
    return;
  }
  fighter.vy = -735;
  fighter.y = -1;
  fighter.vx = 0;
  setAnimation(fighter, "jump", false, true);
}

function startEvasiveMove(
  game: GameState,
  fighter: Fighter,
  animation: "roll" | "slide",
  direction: 1 | -1,
) {
  if (
    game.phase !== "active" ||
    fighter.health <= 0 ||
    fighter.locked ||
    fighter.y < 0
  ) {
    return;
  }
  fighter.attack = null;
  fighter.vx = direction * (animation === "roll" ? 515 : 405);
  setAnimation(fighter, animation, true, true);
}

function startAttack(
  game: GameState,
  fighter: Fighter,
  attack: AttackSpec,
) {
  if (
    game.phase !== "active" ||
    fighter.health <= 0 ||
    fighter.locked ||
    fighter.y < 0
  ) {
    return;
  }

  if (attack.superCost && fighter.super < attack.superCost) {
    game.notice = `P${fighter.id} · SUPER ${Math.floor(
      fighter.super,
    )}% / 100%`;
    game.noticeUntil = game.elapsed + 1.15;
    return;
  }

  if (attack.superCost) {
    fighter.super = Math.max(0, fighter.super - attack.superCost);
  }
  fighter.weapon = attack.weapon;
  fighter.vx = 0;
  fighter.attack = { spec: attack, resolved: false };
  setAnimation(fighter, "attack", true, true);
}

function updateEffects(game: GameState, deltaSeconds: number) {
  for (const effect of game.effects) {
    effect.age += deltaSeconds;
  }
  game.effects = game.effects.filter(
    (effect) => effect.age < effect.duration,
  );
}

function drawArena(ctx: CanvasRenderingContext2D) {
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  sky.addColorStop(0, "#070b11");
  sky.addColorStop(0.58, "#161c21");
  sky.addColorStop(1, "#0a0d10");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const glow = ctx.createRadialGradient(640, 340, 40, 640, 340, 530);
  glow.addColorStop(0, "rgba(102, 128, 134, 0.18)");
  glow.addColorStop(0.52, "rgba(38, 55, 60, 0.1)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.62;
  ctx.strokeStyle = "#33434a";
  ctx.lineWidth = 2;
  for (let x = 50; x < CANVAS_WIDTH; x += 118) {
    ctx.beginPath();
    ctx.moveTo(x, 82);
    ctx.lineTo(x + 62, 82);
    ctx.lineTo(x + 88, 108);
    ctx.lineTo(x + 88, 394);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = "#11171b";
  ctx.beginPath();
  ctx.moveTo(0, 438);
  ctx.lineTo(CANVAS_WIDTH, 438);
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.lineTo(0, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = "rgba(117, 154, 160, 0.2)";
  ctx.lineWidth = 1;
  for (let x = -220; x <= CANVAS_WIDTH + 220; x += 100) {
    ctx.beginPath();
    ctx.moveTo(640, 438);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }
  for (let y = 470; y < CANVAS_HEIGHT; y += 44) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }
  ctx.restore();

  const platform = ctx.createLinearGradient(0, 520, 0, 690);
  platform.addColorStop(0, "#30383b");
  platform.addColorStop(0.52, "#20272a");
  platform.addColorStop(1, "#101518");
  ctx.fillStyle = platform;
  ctx.beginPath();
  ctx.moveTo(72, 566);
  ctx.lineTo(1208, 566);
  ctx.lineTo(1254, 646);
  ctx.lineTo(1164, 682);
  ctx.lineTo(116, 682);
  ctx.lineTo(26, 646);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#557078";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(72, 566);
  ctx.lineTo(1208, 566);
  ctx.stroke();

  ctx.strokeStyle = "rgba(105, 237, 255, 0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(640, 607, 430, 48, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(640, 565);
  ctx.lineTo(640, 681);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.035)";
  ctx.fillRect(0, 434, CANVAS_WIDTH, 4);
}

function drawEffects(ctx: CanvasRenderingContext2D, game: GameState) {
  for (const effect of game.effects) {
    const progress = effect.age / effect.duration;
    const opacity = 1 - progress;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = effect.color;
    ctx.fillStyle = effect.color;
    ctx.shadowColor = effect.color;
    ctx.shadowBlur = effect.kind === "super" ? 34 : 18;

    if (effect.kind === "shot" || effect.kind === "super") {
      ctx.lineCap = "round";
      ctx.lineWidth = effect.kind === "super" ? 12 - progress * 7 : 4;
      ctx.beginPath();
      ctx.moveTo(effect.x, effect.y);
      ctx.lineTo(effect.targetX, effect.y + (effect.targetX - effect.x) * 0.015);
      ctx.stroke();
      if (effect.kind === "super") {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          effect.x,
          effect.y,
          34 + progress * 90,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    } else {
      ctx.translate(effect.x, effect.y);
      ctx.rotate(progress * 0.8);
      for (let ray = 0; ray < 8; ray += 1) {
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(12, -2, 24 + progress * 24, 4);
      }
      ctx.beginPath();
      ctx.arc(0, 0, 14 + progress * 22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawFighter(
  ctx: CanvasRenderingContext2D,
  fighter: Fighter,
  sprites: Map<string, HTMLImageElement>,
) {
  const canvasY = GROUND_Y + fighter.y;
  ctx.save();
  ctx.globalAlpha = Math.max(0.12, 0.42 - Math.abs(fighter.y) / 620);
  ctx.fillStyle = fighter.id === 1 ? "#ffb454" : "#55e8ff";
  ctx.filter = "blur(8px)";
  ctx.beginPath();
  ctx.ellipse(fighter.x, GROUND_Y + 8, 56, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const frame =
    Math.min(
      fighter.frame,
      SPRITE_MANIFEST[fighter.weapon][fighter.animation] - 1,
    ) + 1;
  const sprite = sprites.get(
    spriteKey(fighter.weapon, fighter.animation, frame),
  );
  const color = fighter.id === 1 ? "#ffb454" : "#55e8ff";

  ctx.save();
  ctx.translate(fighter.x, canvasY);
  ctx.scale(fighter.facing, 1);
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.filter =
    fighter.id === 1
      ? "sepia(1) saturate(2.7) hue-rotate(342deg) brightness(1.12) drop-shadow(0 0 9px #ff9f3f)"
      : "sepia(1) saturate(2.7) hue-rotate(142deg) brightness(1.16) drop-shadow(0 0 9px #39dffb)";
  if (fighter.hitFlash > 0) {
    ctx.filter += " brightness(2.6)";
  }

  if (sprite) {
    const scale = 1.3;
    const sourceWidth = sprite.naturalWidth || 512;
    const sourceHeight = sprite.naturalHeight || 512;
    ctx.drawImage(
      sprite,
      (-sourceWidth / 2) * scale,
      -sourceHeight * 0.703 * scale,
      sourceWidth * scale,
      sourceHeight * scale,
    );
  } else {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -164, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-27, -138, 54, 96);
    ctx.fillRect(-38, -42, 26, 52);
    ctx.fillRect(12, -42, 26, 52);
  }
  ctx.restore();

  ctx.save();
  ctx.font = "700 14px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.fillText(`P${fighter.id}`, fighter.x, canvasY - 246);
  ctx.restore();
}

function drawEndState(ctx: CanvasRenderingContext2D, game: GameState) {
  if (game.phase !== "finished") {
    return;
  }
  ctx.save();
  ctx.fillStyle = "rgba(4, 7, 9, 0.56)";
  ctx.fillRect(0, 238, CANVAS_WIDTH, 160);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f5f7f2";
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 22;
  ctx.font = "900 66px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(game.result.startsWith("K.O.") ? "K.O." : "TEMPO", 640, 310);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#c8d1d0";
  ctx.font = "700 22px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(game.result, 640, 352);
  ctx.font = "500 15px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("PRESSIONE R PARA NOVA LUTA", 640, 382);
  ctx.restore();
}

function drawGame(
  ctx: CanvasRenderingContext2D,
  game: GameState,
  sprites: Map<string, HTMLImageElement>,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawArena(ctx);
  drawEffects(ctx, game);

  const fighters =
    game.p1.x <= game.p2.x ? [game.p1, game.p2] : [game.p2, game.p1];
  for (const fighter of fighters) {
    drawFighter(ctx, fighter, sprites);
  }
  drawEndState(ctx, game);
}

function ControlMap({ entries }: { entries: ControlEntry[] }) {
  return (
    <dl className="key-map">
      {entries.map((entry) => (
        <div className="key-map__row" key={`${entry.label}-${entry.keys.join()}`}>
          <dt>
            {entry.keys.map((key) => (
              <kbd className="key-chip" key={key}>
                {key}
              </kbd>
            ))}
          </dt>
          <dd>{entry.label}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FightGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const gameRef = useRef<GameState>(createGame());
  const [loading, setLoading] = useState<LoadingState>({
    loaded: 0,
    failed: 0,
    ready: false,
  });
  const [hud, setHud] = useState<HudState>(() => hudFor(createGame()));

  useEffect(() => {
    let cancelled = false;
    let completed = 0;
    let failed = 0;
    const cache = new Map<string, HTMLImageElement>();
    spriteCacheRef.current = cache;

    const requests: Promise<void>[] = [];
    for (const set of CHARACTER_SETS) {
      for (const animation of ANIMATIONS) {
        const frameCount = SPRITE_MANIFEST[set][animation];
        for (let frame = 1; frame <= frameCount; frame += 1) {
          requests.push(
            new Promise<void>((resolve) => {
              const image = new Image();
              image.decoding = "async";
              image.onload = () => {
                if (!cancelled) {
                  cache.set(spriteKey(set, animation, frame), image);
                  completed += 1;
                  setLoading({
                    loaded: completed,
                    failed,
                    ready: false,
                  });
                }
                resolve();
              };
              image.onerror = () => {
                if (!cancelled) {
                  completed += 1;
                  failed += 1;
                  setLoading({
                    loaded: completed,
                    failed,
                    ready: false,
                  });
                }
                resolve();
              };
              image.src = spriteUrl(set, animation, frame);
            }),
          );
        }
      }
    }

    void Promise.all(requests).then(() => {
      if (!cancelled) {
        setLoading({
          loaded: completed,
          failed,
          ready: true,
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading.ready) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    let animationFrame = 0;
    let previousTime = performance.now();
    let lastHudSync = 0;
    const heldKeys = new Set<string>();

    const resetMatch = () => {
      const nextGame = createGame();
      gameRef.current = nextGame;
      heldKeys.clear();
      setHud(hudFor(nextGame));
    };

    const fighterForCode = (code: string): Fighter | null => {
      const game = gameRef.current;
      if (
        code.startsWith("Arrow") ||
        code.startsWith("Numpad") ||
        code.startsWith("Digit") ||
        code === "Enter" ||
        code === "ShiftRight"
      ) {
        return game.p2;
      }
      if (code === "KeyR") {
        return null;
      }
      return game.p1;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!GAME_KEYS.has(event.code)) {
        return;
      }
      event.preventDefault();
      heldKeys.add(event.code);

      if (event.code === "KeyR") {
        if (!event.repeat) {
          resetMatch();
        }
        return;
      }
      if (event.repeat) {
        return;
      }

      const game = gameRef.current;
      const fighter = fighterForCode(event.code);
      if (!fighter) {
        return;
      }

      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          startJump(game, fighter);
          break;
        case "KeyS":
        case "ArrowDown":
          startEvasiveMove(
            game,
            fighter,
            "slide",
            directionFor(fighter, heldKeys),
          );
          break;
        case "KeyQ":
        case "Numpad0":
        case "Digit0":
          startEvasiveMove(
            game,
            fighter,
            "roll",
            directionFor(fighter, heldKeys),
          );
          break;
        case "KeyJ":
        case "Numpad1":
        case "Digit1":
          startAttack(game, fighter, ATTACKS.base);
          break;
        case "KeyK":
        case "Numpad2":
        case "Digit2":
          startAttack(game, fighter, ATTACKS.sword);
          break;
        case "KeyL":
        case "Numpad3":
        case "Digit3":
          startAttack(game, fighter, ATTACKS.pistol);
          break;
        case "KeyI":
        case "Numpad5":
        case "Digit5":
          startAttack(game, fighter, ATTACKS.rifle);
          break;
        case "KeyU":
        case "NumpadEnter":
        case "Enter":
          startAttack(game, fighter, ATTACKS.super);
          break;
        default:
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      heldKeys.delete(event.code);
    };

    const onBlur = () => {
      heldKeys.clear();
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    const tick = (now: number) => {
      const elapsedSeconds = Math.max(0, (now - previousTime) / 1000);
      const deltaSeconds = Math.min(0.034, elapsedSeconds);
      previousTime = now;
      const game = gameRef.current;
      game.elapsed += elapsedSeconds;

      if (game.phase === "active") {
        game.timer -= elapsedSeconds;
        if (game.timer <= 0) {
          finishByTime(game);
        }
      }

      if (game.p1.x < game.p2.x) {
        game.p1.facing = 1;
        game.p2.facing = -1;
      } else {
        game.p1.facing = -1;
        game.p2.facing = 1;
      }

      updateMovement(game, game.p1, heldKeys, deltaSeconds);
      updateMovement(game, game.p2, heldKeys, deltaSeconds);
      updatePhysics(game.p1, deltaSeconds);
      updatePhysics(game.p2, deltaSeconds);
      resolveFighterCollision(game.p1, game.p2);
      advanceAnimation(game, game.p1, game.p2, deltaSeconds);
      advanceAnimation(game, game.p2, game.p1, deltaSeconds);
      updateEffects(game, deltaSeconds);

      game.p1.hitFlash = Math.max(0, game.p1.hitFlash - deltaSeconds);
      game.p2.hitFlash = Math.max(0, game.p2.hitFlash - deltaSeconds);
      drawGame(context, game, spriteCacheRef.current);

      if (now - lastHudSync > 50) {
        lastHudSync = now;
        setHud(hudFor(game));
      }
      animationFrame = requestAnimationFrame(tick);
    };

    drawGame(context, gameRef.current, spriteCacheRef.current);
    setHud(hudFor(gameRef.current));
    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
      heldKeys.clear();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [loading.ready]);

  const loadingLabel = loading.ready
    ? loading.failed > 0
      ? `${loading.loaded}/${TOTAL_SPRITES} sprites · ${loading.failed} fallback`
      : `${loading.loaded}/${TOTAL_SPRITES} sprites prontos`
    : `Carregando ${loading.loaded}/${TOTAL_SPRITES} sprites`;

  return (
    <main
      className="prototype-shell"
      data-testid="fight-game"
      data-assets-ready={loading.ready}
      data-phase={hud.phase}
      data-result={hud.result}
      aria-label="Protótipo desktop de jogo de luta 2D"
    >
      <header className="game-header">
        <div>
          <p className="round-label">PROTÓTIPO JOGÁVEL · DESKTOP</p>
          <h1>Fight Turn</h1>
        </div>
        <div
          className="asset-status"
          data-testid="loading-progress"
          role="progressbar"
          aria-label={loadingLabel}
          aria-valuemin={0}
          aria-valuemax={TOTAL_SPRITES}
          aria-valuenow={loading.loaded}
        >
          {loadingLabel}
        </div>
      </header>

      <section className="arena-frame" aria-label="Arena da luta">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          data-testid="game-canvas"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          tabIndex={0}
          aria-label="Arena 2D com dois lutadores. Use o mapa de comandos abaixo."
        >
          Seu navegador precisa oferecer suporte a Canvas para exibir a luta.
        </canvas>

        <div className="hud">
          <section
            className="hud-player hud-player--p1"
            aria-label="Estado do Jogador 1"
          >
            <div className="player-name">
              <span>P1</span>
              <strong>ÂMBAR</strong>
              <span
                className="weapon-badge"
                data-testid="p1-weapon"
                aria-label={`Arma do Jogador 1: ${WEAPON_LABELS[hud.p1Weapon]}`}
              >
                {WEAPON_LABELS[hud.p1Weapon]}
              </span>
            </div>
            <div
              className="health-track"
              role="progressbar"
              data-testid="p1-health"
              aria-label={`Vida do Jogador 1: ${hud.p1Health}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={hud.p1Health}
            >
              <span
                className="health-fill"
                style={{ width: `${hud.p1Health}%` }}
              />
            </div>
            <div
              className="super-track"
              role="progressbar"
              data-testid="p1-super"
              aria-label={`Super do Jogador 1: ${hud.p1Super}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={hud.p1Super}
            >
              <span
                className={`super-fill${hud.p1Super >= 100 ? " is-ready" : ""}`}
                style={{ width: `${hud.p1Super}%` }}
              />
            </div>
          </section>

          <div className="timer-block">
            <span className="round-label">ROUND 1</span>
            <strong
              className="timer"
              data-testid="timer"
              aria-label={`${hud.timer} segundos restantes`}
            >
              {String(hud.timer).padStart(2, "0")}
            </strong>
          </div>

          <section
            className="hud-player hud-player--p2"
            aria-label="Estado do Jogador 2"
          >
            <div className="player-name">
              <span
                className="weapon-badge"
                data-testid="p2-weapon"
                aria-label={`Arma do Jogador 2: ${WEAPON_LABELS[hud.p2Weapon]}`}
              >
                {WEAPON_LABELS[hud.p2Weapon]}
              </span>
              <strong>CIANO</strong>
              <span>P2</span>
            </div>
            <div
              className="health-track"
              role="progressbar"
              data-testid="p2-health"
              aria-label={`Vida do Jogador 2: ${hud.p2Health}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={hud.p2Health}
            >
              <span
                className="health-fill"
                style={{ width: `${hud.p2Health}%` }}
              />
            </div>
            <div
              className="super-track"
              role="progressbar"
              data-testid="p2-super"
              aria-label={`Super do Jogador 2: ${hud.p2Super}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={hud.p2Super}
            >
              <span
                className={`super-fill${hud.p2Super >= 100 ? " is-ready" : ""}`}
                style={{ width: `${hud.p2Super}%` }}
              />
            </div>
          </section>
        </div>

        <div
          className="fight-status"
          data-testid="fight-status"
          role="status"
          aria-live="polite"
        >
          {hud.status}
        </div>

        {!loading.ready && (
          <div
            className="loading-overlay"
            role="status"
            aria-label="Preparando os quadros da arena"
          >
            <span>Preparando a arena</span>
            <strong aria-hidden="true">
              {loading.loaded} / {TOTAL_SPRITES}
            </strong>
          </div>
        )}
      </section>

      <p
        className="visually-hidden"
        data-testid="match-result"
        role="status"
        aria-live="assertive"
      >
        {hud.result}
      </p>

      <section className="controls-grid" aria-label="Mapa de comandos">
        <article className="control-card control-card--p1">
          <div className="control-card__heading">
            <span>P1</span>
            <h2>Comandos Âmbar</h2>
          </div>
          <ControlMap entries={P1_CONTROLS} />
        </article>

        <article className="control-card control-card--p2">
          <div className="control-card__heading">
            <span>P2</span>
            <h2>Comandos Ciano</h2>
          </div>
          <ControlMap entries={P2_CONTROLS} />
        </article>
      </section>

      <p className="footer-note">
        <kbd className="key-chip">R</kbd>
        reinicia a luta · O P2 permanece parado até receber um comando
      </p>
    </main>
  );
}

export default FightGame;
