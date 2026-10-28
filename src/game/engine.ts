// ZONA MORTA: MIAMI — motor do jogo (canvas 2D, top-down)
export const CH = 640;
const ROAD = 80;
const DAY_LEN = 240; // segundos reais por dia
export const SAVE_KEY = "zonamorta_miami_v1";

export type ItemId =
  | "agua" | "agua_suja" | "enlatado" | "pecas" | "gasolina" | "kit"
  | "faca" | "machado" | "filtro" | "coleira" | "madeira";

export const ITEMS: Record<ItemId, { nome: string; icon: string; desc: string }> = {
  agua: { nome: "Água limpa", icon: "💧", desc: "+40 sede" },
  agua_suja: { nome: "Água suja", icon: "🟤", desc: "+25 sede, mas faz mal (-15 vida). Use o filtro." },
  enlatado: { nome: "Enlatado", icon: "🥫", desc: "+35 fome. Companheiros comem 1 por dia." },
  pecas: { nome: "Peças", icon: "🔩", desc: "Repara veículos (+40 integridade)." },
  gasolina: { nome: "Gasolina", icon: "⛽", desc: "Abastece veículos (+50%)." },
  kit: { nome: "Kit médico", icon: "🩹", desc: "+50 vida, ou recruta um sobrevivente ferido." },
  faca: { nome: "Faca", icon: "🔪", desc: "Arma rápida (22 dano)." },
  machado: { nome: "Machado", icon: "🪓", desc: "Arma forte (38 dano) e corta árvores." },
  filtro: { nome: "Filtro", icon: "🧪", desc: "Transforma toda água suja em limpa. Reutilizável." },
  coleira: { nome: "Coleira", icon: "🦮", desc: "Faz um cão te acompanhar." },
  madeira: { nome: "Madeira", icon: "🪵", desc: "8 madeiras constroem um abrigo." },
};

export type VehicleType = "carro" | "moto" | "van" | "kombi" | "caminhao";
export const VEHICLE_TYPES: Record<VehicleType, { nome: string; len: number; wid: number; speed: number; hp: number; turn: number; fuelUse: number; cargo: boolean; colors: string[] }> = {
  carro: { nome: "Carro", len: 44, wid: 22, speed: 270, hp: 100, turn: 2.4, fuelUse: 1, cargo: false, colors: ["#c0392b", "#2e86c1", "#e8e1d0", "#1f2a33"] },
  moto: { nome: "Moto", len: 26, wid: 10, speed: 330, hp: 50, turn: 3.4, fuelUse: 0.5, cargo: false, colors: ["#111", "#d35400"] },
  van: { nome: "Van", len: 54, wid: 26, speed: 220, hp: 140, turn: 1.9, fuelUse: 1.3, cargo: true, colors: ["#ecf0f1", "#7f8c8d"] },
  kombi: { nome: "Kombi", len: 48, wid: 26, speed: 190, hp: 110, turn: 2, fuelUse: 1.1, cargo: true, colors: ["#48c9b0", "#f5b041"] },
  caminhao: { nome: "Caminhão", len: 76, wid: 30, speed: 170, hp: 220, turn: 1.4, fuelUse: 1.8, cargo: true, colors: ["#a04000", "#1a5276"] },
};
export type WreckType = "aviao" | "helicoptero" | "onibus" | "carreta";
export const WRECK_TYPES: Record<WreckType, { nome: string; w: number; h: number }> = {
  aviao: { nome: "Avião (destroço)", w: 200, h: 150 },
  helicoptero: { nome: "Helicóptero (destroço)", w: 120, h: 90 },
  onibus: { nome: "Ônibus (destroço)", w: 170, h: 50 },
  carreta: { nome: "Carreta (destroço)", w: 190, h: 50 },
};

type Rect = { x: number; y: number; w: number; h: number };
type ContainerKind = "geladeira" | "armario" | "guarda" | "caixa" | "destroco";
interface Container extends Rect { id: string; kind: ContainerKind; loot: ItemId[] }
interface Bed extends Rect { id: string }
interface Tree { id: string; x: number; y: number; r: number; palm: boolean }
interface Wreck extends Rect { id: string; type: WreckType }
interface Chunk {
  roads: Rect[]; water: Rect | null; floors: Rect[]; walls: Rect[]; rubble: { x: number; y: number; r: number }[];
  containers: Container[]; beds: Bed[]; trees: Tree[]; wrecks: Wreck[]; solids: Rect[];
}
export interface Vehicle { id: string; type: VehicleType; x: number; y: number; angle: number; speed: number; fuel: number; hp: number; needsParts: boolean; color: string; touched: boolean }
interface Npc { id: string; kind: "sobrevivente" | "cao"; x: number; y: number }
export interface Companion { id: string; kind: "sobrevivente" | "cao"; name: string; x: number; y: number; hp: number; maxHp: number; cd: number }
interface Zombie { x: number; y: number; hp: number; maxHp: number; speed: number; dmg: number; cd: number; smart: boolean; hit: number; wa: number; wt: number }
interface Shelter { id: string; x: number; y: number; hasBed: boolean }
type Weapon = "punho" | "faca" | "machado";
const WEAPONS: Record<Weapon, { dmg: number; range: number; cd: number; nome: string }> = {
  punho: { dmg: 10, range: 36, cd: 0.4, nome: "Punhos" },
  faca: { dmg: 22, range: 42, cd: 0.35, nome: "Faca" },
  machado: { dmg: 38, range: 50, cd: 0.6, nome: "Machado" },
};

const LOOT: Record<ContainerKind, ItemId[]> = {
  geladeira: ["agua", "agua", "enlatado", "agua_suja", "enlatado"],
  armario: ["enlatado", "pecas", "kit", "filtro", "faca", "agua"],
  guarda: ["mochila" as ItemId, "coleira", "kit", "enlatado"],
  caixa: ["pecas", "gasolina", "machado", "pecas", "gasolina"],
  destroco: ["pecas", "pecas", "gasolina", "kit"],
};
const CONTAINER_NAMES: Record<ContainerKind, [string, string]> = {
  geladeira: ["geladeira", "🧊"], armario: ["armário", "🗄️"], guarda: ["guarda-roupa", "👕"], caixa: ["caixa de ferramentas", "📦"], destroco: ["destroço", "🔧"],
};
const NAMES = ["Rosa", "Diego", "Carla", "Marcus", "Lúcia", "Tony", "Bia", "Rafa", "Inês", "Joel"];

// ---------- utilidades ----------
function mulberry(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(x: number, y: number, s: number) {
  let h = s ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return h ^ (h >>> 16);
}
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const mod = (a: number, n: number) => ((a % n) + n) % n;
function angDiff(a: number, b: number) { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }
function distRect(px: number, py: number, R: Rect) {
  const nx = clamp(px, R.x, R.x + R.w), ny = clamp(py, R.y, R.y + R.h);
  return Math.hypot(px - nx, py - ny);
}
function overlap(a: Rect, b: Rect, pad = 0) {
  return a.x - pad < b.x + b.w && a.x + a.w + pad > b.x && a.y - pad < b.y + b.h && a.y + a.h + pad > b.y;
}
function pushRect(p: { x: number; y: number }, r: number, R: Rect) {
  const nx = clamp(p.x, R.x, R.x + R.w), ny = clamp(p.y, R.y, R.y + R.h);
  const dx = p.x - nx, dy = p.y - ny, d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return false;
  if (d2 === 0) {
    const l = p.x - R.x, rr = R.x + R.w - p.x, t = p.y - R.y, b = R.y + R.h - p.y, m = Math.min(l, rr, t, b);
    if (m === l) p.x = R.x - r; else if (m === rr) p.x = R.x + R.w + r; else if (m === t) p.y = R.y - r; else p.y = R.y + R.h + r;
    return true;
  }
  const d = Math.sqrt(d2); p.x = nx + (dx / d) * r; p.y = ny + (dy / d) * r; return true;
}
function pushCircle(p: { x: number; y: number }, r: number, c: { x: number; y: number; r: number }) {
  const dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy), m = r + c.r;
  if (d >= m || d === 0) return false;
  p.x = c.x + (dx / d) * m; p.y = c.y + (dy / d) * m; return true;
}
const vRadius = (v: Vehicle) => VEHICLE_TYPES[v.type].len * 0.42;

// ---------- geração procedural ----------
function shelterWalls(s: Shelter): Rect[] {
  const x = s.x - 50, y = s.y - 50, t = 8;
  return [
    { x, y, w: 100, h: t }, { x, y, w: t, h: 100 }, { x: x + 100 - t, y, w: t, h: 100 },
    { x, y: y + 100 - t, w: 30, h: t }, { x: x + 70, y: y + 100 - t, w: 30, h: t },
  ];
}

function genChunk(cx: number, cy: number, seed: number, onVehicle: (v: Vehicle) => void, onNpc: (n: Npc) => void): Chunk {
  const r = mulberry(hash(cx, cy, seed));
  const ox = cx * CH, oy = cy * CH;
  const c: Chunk = { roads: [], water: null, floors: [], walls: [], rubble: [], containers: [], beds: [], trees: [], wrecks: [], solids: [] };
  c.roads.push({ x: ox, y: oy, w: CH, h: ROAD }, { x: ox, y: oy, w: ROAD, h: CH });
  const occupied: Rect[] = [...c.roads];
  const origin = cx === 0 && cy === 0;
  const isRiver = mod(cx, 6) === 3;
  const roll = (kind: ContainerKind) => {
    const n = Math.floor(r() * 3) + (r() < 0.4 ? 1 : 0);
    const out: ItemId[] = [];
    for (let i = 0; i < n; i++) out.push(LOOT[kind][Math.floor(r() * LOOT[kind].length)]);
    return out;
  };
  let houseCount = 0;
  if (isRiver) {
    c.water = { x: ox + 250, y: oy + ROAD, w: 150, h: CH - ROAD };
    occupied.push(c.water);
  } else {
    const slots: Rect[] = [
      { x: ox + 110, y: oy + 110, w: 220, h: 180 }, { x: ox + 380, y: oy + 360, w: 220, h: 200 },
      { x: ox + 380, y: oy + 110, w: 200, h: 170 }, { x: ox + 110, y: oy + 370, w: 210, h: 190 },
    ];
    slots.forEach((S, i) => {
      const v = r();
      if ((origin && i === 0) || (!origin && v < 0.5)) {
        const id = `${cx},${cy},h${i}`;
        const t = 10, door = 56, dx = S.x + S.w / 2 - door / 2;
        c.floors.push(S);
        c.walls.push(
          { x: S.x, y: S.y, w: dx - S.x, h: t }, { x: dx + door, y: S.y, w: S.x + S.w - dx - door, h: t },
          { x: S.x, y: S.y, w: t, h: S.h },
        );
        if (r() < 0.35) { const g = S.y + 40 + r() * (S.h - 100); c.walls.push({ x: S.x + S.w - t, y: S.y, w: t, h: g - S.y }, { x: S.x + S.w - t, y: g + 44, w: t, h: S.y + S.h - g - 44 }); }
        else c.walls.push({ x: S.x + S.w - t, y: S.y, w: t, h: S.h });
        if (r() < 0.4) { const g = S.x + 30 + r() * (S.w - 100); c.walls.push({ x: S.x, y: S.y + S.h - t, w: g - S.x, h: t }, { x: g + 44, y: S.y + S.h - t, w: S.x + S.w - g - 44, h: t }); }
        else c.walls.push({ x: S.x, y: S.y + S.h - t, w: S.w, h: t });
        for (let k = 0; k < 7; k++) c.rubble.push({ x: S.x + 20 + r() * (S.w - 40), y: S.y + 20 + r() * (S.h - 40), r: 2 + r() * 5 });
        c.containers.push({ id: id + "g", kind: "geladeira", x: S.x + S.w - t - 34, y: S.y + t + 4, w: 30, h: 24, loot: roll("geladeira") });
        c.containers.push({ id: id + "a", kind: "armario", x: S.x + t + 4, y: S.y + t + 4, w: 24, h: 44, loot: roll("armario") });
        if (r() < 0.6 || origin) c.containers.push({ id: id + "w", kind: "guarda", x: S.x + S.w - t - 28, y: S.y + S.h - t - 50, w: 24, h: 46, loot: roll("guarda") });
        if (r() < 0.4 || origin) c.containers.push({ id: id + "c", kind: "caixa", x: S.x + S.w / 2 - 14, y: S.y + S.h - t - 26, w: 28, h: 22, loot: origin ? ["machado", "gasolina"] : roll("caixa") });
        if (r() < 0.6 || origin) c.beds.push({ id: id + "b", x: S.x + t + 6, y: S.y + S.h - t - 62, w: 36, h: 56 });
        if (!origin && r() < 0.22) onNpc({ id: id + "sv", kind: "sobrevivente", x: S.x + S.w / 2, y: S.y + S.h / 2 });
        occupied.push(S); houseCount++;
      } else if (!origin && v < 0.6) {
        const types: WreckType[] = ["aviao", "helicoptero", "onibus", "carreta"];
        const type = types[Math.floor(r() * 4)], W = WRECK_TYPES[type];
        const wr: Wreck = { id: `${cx},${cy},wr${i}`, type, x: S.x + (S.w - W.w) / 2, y: S.y + (S.h - W.h) / 2, w: W.w, h: W.h };
        c.wrecks.push(wr); occupied.push(wr);
        c.containers.push({ id: wr.id + "c", kind: "destroco", x: wr.x + wr.w / 2 - 12, y: wr.y + wr.h + 4, w: 24, h: 18, loot: roll("destroco") });
      }
    });
  }
  // árvores
  const tries = isRiver ? 16 : 12;
  for (let i = 0; i < tries; i++) {
    const tx = ox + ROAD + 20 + r() * (CH - ROAD - 40), ty = oy + ROAD + 20 + r() * (CH - ROAD - 40);
    const tr = { x: tx - 22, y: ty - 22, w: 44, h: 44 };
    if (occupied.some((o) => overlap(tr, o, 6))) continue;
    if (c.containers.some((o) => overlap(tr, o, 10))) continue;
    c.trees.push({ id: `${cx},${cy},t${i}`, x: tx, y: ty, r: 12, palm: r() < 0.6 });
    occupied.push(tr);
  }
  // veículos
  const nv = origin ? 2 : (r() < 0.6 ? 1 : 0) + (r() < 0.3 ? 1 : 0);
  for (let i = 0; i < nv; i++) {
    const p = r();
    let type: VehicleType = p < 0.4 ? "carro" : p < 0.55 ? "moto" : p < 0.7 ? "van" : p < 0.85 ? "kombi" : "caminhao";
    if (origin) type = i === 0 ? "kombi" : "moto";
    const T = VEHICLE_TYPES[type];
    const v: Vehicle = {
      id: `${cx},${cy},v${i}`, type, x: ox + 140 + i * 220 + r() * 120, y: oy + (r() < 0.5 ? 22 : 58), angle: r() < 0.5 ? 0 : Math.PI,
      speed: 0, fuel: r() < 0.35 ? 0 : 10 + r() * 60, hp: T.hp * (0.2 + r() * 0.8), needsParts: r() < 0.3,
      color: T.colors[Math.floor(r() * T.colors.length)], touched: false,
    };
    if (origin) { v.fuel = 0; v.needsParts = i === 1; v.hp = T.hp * 0.7; }
    onVehicle(v);
  }
  if (r() < 0.14 || (cx === 1 && cy === 0)) onNpc({ id: `${cx},${cy},dg`, kind: "cao", x: ox + 40, y: oy + 200 + r() * 300 });
  c.solids = [...c.walls, ...c.containers, ...c.wrecks];
  if (c.water) c.solids.push(c.water);
  void houseCount;
  return c;
}

// ---------- estado ----------
export interface Input { joy: { x: number; y: number }; attack: boolean }
type Target =
  | { kind: "sair" | "dormir" | "colocarCama" | "soltarCama" | "rio"; label: string; ref?: unknown }
  | { kind: "container"; label: string; ref: Container }
  | { kind: "cama"; label: string; ref: Bed }
  | { kind: "camaChao"; label: string; ref: { id: string; x: number; y: number } }
  | { kind: "arvore"; label: string; ref: Tree }
  | { kind: "npc"; label: string; ref: Npc }
  | { kind: "veiculo"; label: string; ref: Vehicle }
  | { kind: "shelter"; label: string; ref: Shelter };

interface Float { x: number; y: number; text: string; color: string; t: number }
interface Particle { x: number; y: number; vx: number; vy: number; t: number; color: string; size: number }

export class Game {
  seed = 1337;
  input: Input = { joy: { x: 0, y: 0 }, attack: false };
  paused = false;
  chunks = new Map<string, Chunk>();
  vehicles = new Map<string, Vehicle>();
  npcs = new Map<string, Npc>();
  zombies: Zombie[] = [];
  companions: Companion[] = [];
  shelters: Shelter[] = [];
  droppedBeds: { id: string; x: number; y: number }[] = [];
  looted = new Set<string>();
  lootLeft: Record<string, ItemId[]> = {};
  cut = new Set<string>();
  chop: Record<string, number> = {};
  npcGone = new Set<string>();
  p = { x: 300, y: 40, hp: 100, hunger: 80, thirst: 80, angle: 0, cd: 0, vehicleId: null as string | null, carryingBed: false, backpack: false, equipped: "punho" as Weapon, hurt: 0 };
  inv: Partial<Record<ItemId, number>> = { agua: 1, enlatado: 1 };
  time = 7 / 24;
  day = 1;
  kills = 0;
  dead = false;
  wasNight = false;
  panelVehicle: string | null = null;
  target: Target | null = null;
  msgs: { text: string; t: number }[] = [];
  floats: Float[] = [];
  parts: Particle[] = [];
  shake = 0;
  spawnT = 0;
  saveT = 0;
  swing = 0;

  constructor(save?: string | null) {
    if (save) { try { this.load(JSON.parse(save)); } catch { /* save corrompido: novo jogo */ } }
    this.wasNight = this.isNight();
  }

  // ---- mundo ----
  chunk(cx: number, cy: number) {
    const k = cx + "," + cy;
    let c = this.chunks.get(k);
    if (!c) {
      c = genChunk(cx, cy, this.seed,
        (v) => { if (!this.vehicles.has(v.id)) this.vehicles.set(v.id, v); },
        (n) => { if (!this.npcGone.has(n.id)) this.npcs.set(n.id, n); });
      this.chunks.set(k, c);
    }
    return c;
  }
  nearChunks(x: number, y: number) {
    const cx = Math.floor(x / CH), cy = Math.floor(y / CH), out: Chunk[] = [];
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) out.push(this.chunk(cx + i, cy + j));
    return out;
  }
  solidsAt(x: number, y: number) {
    const rects: Rect[] = [], circles: { x: number; y: number; r: number }[] = [];
    for (const c of this.nearChunks(x, y)) {
      for (const s of c.solids) rects.push(s);
      for (const b of c.beds) if (!this.looted.has(b.id)) rects.push(b);
      for (const t of c.trees) if (!this.cut.has(t.id)) circles.push(t);
    }
    for (const s of this.shelters) if (Math.abs(s.x - x) < 300 && Math.abs(s.y - y) < 300) rects.push(...shelterWalls(s));
    return { rects, circles };
  }
  move(e: { x: number; y: number }, dx: number, dy: number, r: number, skipVehicle?: string) {
    e.x += dx; e.y += dy;
    const { rects, circles } = this.solidsAt(e.x, e.y);
    let hit = false;
    for (let k = 0; k < 2; k++) {
      for (const R of rects) if (pushRect(e, r, R)) hit = true;
      for (const C of circles) if (pushCircle(e, r, C)) hit = true;
      for (const v of this.vehicles.values()) {
        if (v.id === skipVehicle || v.id === this.p.vehicleId && !skipVehicle) { if (v.id === skipVehicle) continue; }
        if (Math.abs(v.x - e.x) > 120 || Math.abs(v.y - e.y) > 120) continue;
        if (this.p.vehicleId === v.id && skipVehicle === undefined) continue;
        if (pushCircle(e, r, { x: v.x, y: v.y, r: vRadius(v) })) hit = true;
      }
    }
    return hit;
  }

  // ---- tempo ----
  hours() { return this.time * 24; }
  isNight() { const h = this.hours(); return h >= 19 || h < 6; }
  darkness() {
    const h = this.hours();
    if (h >= 7 && h < 18) return 0;
    if (h >= 18 && h < 20) return ((h - 18) / 2) * 0.82;
    if (h >= 5 && h < 7) return (1 - (h - 5) / 2) * 0.82;
    return 0.82;
  }
  zStats() {
    const d = this.day, night = this.isNight() ? 1.15 : 1;
    return { speed: Math.min(140, (32 + d * 9) * night), hp: 30 + d * 12, dmg: 6 + d * 2.5, smart: d >= 3, detect: 240 + d * 35 };
  }

  // ---- inventário ----
  cap() { return this.p.backpack ? 30 : 15; }
  used() { return Object.values(this.inv).reduce((a, b) => a + (b || 0), 0); }
  count(i: ItemId) { return this.inv[i] || 0; }
  add(i: ItemId, n = 1) {
    if (this.used() + n > this.cap()) return false;
    this.inv[i] = this.count(i) + n;
    if (i === "machado" && this.p.equipped !== "machado") this.p.equipped = "machado";
    if (i === "faca" && this.p.equipped === "punho") this.p.equipped = "faca";
    return true;
  }
  take(i: ItemId, n = 1) {
    if (this.count(i) < n) return false;
    this.inv[i] = this.count(i) - n;
    if (!this.inv[i]) delete this.inv[i];
    if ((i === "faca" || i === "machado") && this.p.equipped === i && !this.count(i)) this.p.equipped = this.count("machado") ? "machado" : this.count("faca") ? "faca" : "punho";
    return true;
  }
  say(text: string) { this.msgs.push({ text, t: 3.5 }); if (this.msgs.length > 4) this.msgs.shift(); }
  float(x: number, y: number, text: string, color = "#fff") { this.floats.push({ x, y, text, color, t: 1 }); }
  burst(x: number, y: number, color: string, n = 8) {
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = 40 + Math.random() * 120; this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0.5 + Math.random() * 0.4, color, size: 2 + Math.random() * 3 }); }
  }

  useItem(i: ItemId) {
    if (this.dead || !this.count(i)) return;
    const p = this.p;
    switch (i) {
      case "agua": this.take(i); p.thirst = Math.min(100, p.thirst + 40); this.say("Você bebeu água limpa."); break;
      case "agua_suja": this.take(i); p.thirst = Math.min(100, p.thirst + 25); p.hp -= 15; p.hurt = 0.4; this.say("Água suja! Você passou mal (-15 vida)."); break;
      case "enlatado": this.take(i); p.hunger = Math.min(100, p.hunger + 35); this.say("Você comeu um enlatado."); break;
      case "kit": if (p.hp >= 100) { this.say("Vida já está cheia."); return; } this.take(i); p.hp = Math.min(100, p.hp + 50); this.say("Ferimentos tratados (+50)."); break;
      case "filtro": { const n = this.count("agua_suja"); if (!n) { this.say("Sem água suja para filtrar. Pegue no rio."); return; } this.take("agua_suja", n); this.inv.agua = this.count("agua") + n; this.say(`Filtrou ${n} água(s).`); break; }
      case "faca": case "machado": p.equipped = i; this.say(`${ITEMS[i].nome} equipada.`); break;
      default: this.say(`${ITEMS[i].nome}: ${ITEMS[i].desc}`);
    }
  }
  drop(i: ItemId) { this.take(i, this.count(i)); this.say(`${ITEMS[i].nome} descartado.`); }
  healCompanion(id: string) {
    const c = this.companions.find((x) => x.id === id);
    if (!c) return;
    if (!this.take("kit")) { this.say("Precisa de um kit médico."); return; }
    c.hp = c.maxHp; this.say(`${c.name} foi tratado.`);
  }
  feedCompanion(id: string) {
    const c = this.companions.find((x) => x.id === id);
    if (!c) return;
    if (!this.take("enlatado")) { this.say("Sem enlatados."); return; }
    c.hp = Math.min(c.maxHp, c.hp + 15); this.say(`${c.name} comeu (+15 vida).`);
  }
  buildShelter() {
    if (this.p.vehicleId) { this.say("Saia do veículo para construir."); return; }
    if (this.count("madeira") < 8) { this.say(`Precisa de 8 madeiras (tem ${this.count("madeira")}). Corte árvores com o machado.`); return; }
    const x = this.p.x, y = this.p.y - 30;
    const area = { x: x - 55, y: y - 55, w: 110, h: 110 };
    const { rects } = this.solidsAt(x, y);
    if (rects.some((r) => overlap(area, r))) { this.say("Espaço ocupado. Vá para uma área aberta."); return; }
    this.take("madeira", 8);
    this.shelters.push({ id: "s" + Date.now(), x, y, hasBed: false });
    this.p.y = y + 70;
    this.say("Abrigo construído! Traga uma cama para poder dormir.");
    this.burst(x, y, "#a0784a", 20);
    this.save();
  }

  // ---- interação ----
  findTarget(): Target | null {
    const p = this.p;
    if (p.vehicleId) return { kind: "sair", label: "Sair do veículo" };
    const nearShelter = this.shelters.find((s) => Math.hypot(s.x - p.x, s.y - p.y) < 80);
    if (p.carryingBed) {
      if (nearShelter && !nearShelter.hasBed) return { kind: "colocarCama", label: "Colocar cama no abrigo" };
      const v = this.nearestVehicle(60);
      if (v) return { kind: "veiculo", label: VEHICLE_TYPES[v.type].nome, ref: v };
      return { kind: "soltarCama", label: "Soltar cama" };
    }
    if (nearShelter?.hasBed) return { kind: "dormir", label: "Dormir", ref: nearShelter };
    let best: Target | null = null, bd = 34;
    const consider = (d: number, t: Target) => { if (d < bd) { bd = d; best = t; } };
    for (const c of this.nearChunks(p.x, p.y)) {
      for (const k of c.containers) if (!this.looted.has(k.id)) consider(distRect(p.x, p.y, k), { kind: "container", label: "Vasculhar " + CONTAINER_NAMES[k.kind][0], ref: k });
      for (const b of c.beds) if (!this.looted.has(b.id)) consider(distRect(p.x, p.y, b), { kind: "cama", label: "Pegar cama", ref: b });
      for (const t of c.trees) if (!this.cut.has(t.id)) consider(Math.hypot(t.x - p.x, t.y - p.y) - t.r - 4, { kind: "arvore", label: "Cortar árvore", ref: t });
      if (c.water) consider(distRect(p.x, p.y, c.water) - 6, { kind: "rio", label: "Pegar água do rio" });
    }
    for (const b of this.droppedBeds) consider(Math.hypot(b.x - p.x, b.y - p.y) - 20, { kind: "camaChao", label: "Pegar cama", ref: b });
    for (const n of this.npcs.values()) if (Math.abs(n.x - p.x) < 80 && Math.abs(n.y - p.y) < 80) consider(Math.hypot(n.x - p.x, n.y - p.y) - 12, { kind: "npc", label: n.kind === "cao" ? "Chamar cão" : "Ajudar ferido", ref: n });
    const v = this.nearestVehicle(60);
    if (v) consider(Math.hypot(v.x - p.x, v.y - p.y) - vRadius(v), { kind: "veiculo", label: VEHICLE_TYPES[v.type].nome, ref: v });
    if (!best && nearShelter) return { kind: "shelter", label: "Dormir (precisa de cama)", ref: nearShelter };
    return best;
  }
  nearestVehicle(range: number) {
    let best: Vehicle | null = null, bd = range;
    for (const v of this.vehicles.values()) { const d = Math.hypot(v.x - this.p.x, v.y - this.p.y) - vRadius(v); if (d < bd) { bd = d; best = v; } }
    return best;
  }
  interact() {
    if (this.dead || this.paused) return;
    const t = this.findTarget(), p = this.p;
    if (!t) { this.say("Nada por perto para interagir."); return; }
    switch (t.kind) {
      case "sair": this.exitVehicle(); break;
      case "container": {
        const k = t.ref, left = this.lootLeft[k.id] ?? [...k.loot];
        if (!left.length) { this.looted.add(k.id); this.say(`O ${CONTAINER_NAMES[k.kind][0]} está vazio.`); break; }
        const rest: ItemId[] = [];
        for (const it of left) {
          if ((it as string) === "mochila") { if (!p.backpack) { p.backpack = true; this.float(p.x, p.y - 30, "🎒 Mochila! +15 espaço", "#ffd166"); } continue; }
          if (this.add(it)) this.float(p.x + (Math.random() - 0.5) * 30, p.y - 30 - rest.length * 4, `+1 ${ITEMS[it].icon} ${ITEMS[it].nome}`, "#9ef0c9");
          else rest.push(it);
        }
        this.burst(k.x + k.w / 2, k.y + k.h / 2, "#d9c9a0", 6);
        if (rest.length) { this.lootLeft[k.id] = rest; this.say("Mochila cheia! Ainda há itens aqui."); }
        else { this.looted.add(k.id); delete this.lootLeft[k.id]; }
        break;
      }
      case "cama": this.looted.add(t.ref.id); p.carryingBed = true; this.say("Carregando cama (mais lento). Leve até seu abrigo."); break;
      case "camaChao": this.droppedBeds = this.droppedBeds.filter((b) => b !== t.ref); p.carryingBed = true; break;
      case "soltarCama": p.carryingBed = false; this.droppedBeds.push({ id: "b" + Date.now(), x: p.x, y: p.y + 20 }); break;
      case "colocarCama": (this.shelters.find((s) => Math.hypot(s.x - p.x, s.y - p.y) < 80) as Shelter).hasBed = true; p.carryingBed = false; this.say("Cama instalada! Agora você pode dormir à noite."); this.save(); break;
      case "dormir": this.sleep(); break;
      case "shelter": this.say("Encontre uma cama numa casa e carregue até aqui."); break;
      case "arvore": {
        if (!this.count("machado")) { this.say("Precisa de um machado para cortar árvores."); break; }
        const tr = t.ref; this.chop[tr.id] = (this.chop[tr.id] || 0) + 1; this.shake = 4; this.burst(tr.x, tr.y, "#8b5a2b", 6);
        if (this.chop[tr.id] >= 3) {
          if (this.used() + 3 > this.cap()) { this.say("Sem espaço para madeira."); this.chop[tr.id] = 2; break; }
          this.cut.add(tr.id); this.add("madeira", 3); this.float(tr.x, tr.y - 30, "+3 🪵 Madeira", "#ffd166"); delete this.chop[tr.id];
        } else this.float(tr.x, tr.y - 30, `Cortando ${this.chop[tr.id]}/3`, "#fff");
        break;
      }
      case "rio": if (this.add("agua_suja")) { this.float(p.x, p.y - 30, "+1 🟤 Água suja", "#9ec9f0"); this.say("Água do rio precisa ser filtrada."); } else this.say("Mochila cheia."); break;
      case "npc": {
        const n = t.ref;
        if (n.kind === "sobrevivente") {
          if (!this.take("kit")) { this.say("Sobrevivente ferido: “Me ajuda... preciso de um kit médico.”"); break; }
          const name = NAMES[Math.abs(hash(n.x | 0, n.y | 0, 7)) % NAMES.length];
          this.companions.push({ id: n.id, kind: "sobrevivente", name, x: n.x, y: n.y, hp: 60, maxHp: 80, cd: 0 });
          this.say(`${name} se juntou ao grupo! Precisa de 1 enlatado e 1 água por dia.`);
        } else {
          if (!this.take("coleira")) { this.say("O cão rosna desconfiado. Você precisa de uma coleira."); break; }
          this.companions.push({ id: n.id, kind: "cao", name: "Caramelo", x: n.x, y: n.y, hp: 50, maxHp: 50, cd: 0 });
          this.say("Caramelo agora te acompanha! Precisa de 1 enlatado por dia.");
        }
        this.npcs.delete(n.id); this.npcGone.add(n.id); this.burst(n.x, n.y, "#ffd166", 14); this.save();
        break;
      }
      case "veiculo": this.panelVehicle = t.ref.id; break;
    }
  }
  canStart(v: Vehicle) {
    if (v.needsParts) return "Precisa de peças";
    if (v.hp < VEHICLE_TYPES[v.type].hp * 0.2) return "Muito danificado";
    if (v.fuel <= 0) return "Sem combustível";
    return null;
  }
  vehicleAction(a: "entrar" | "abastecer" | "reparar") {
    const v = this.panelVehicle ? this.vehicles.get(this.panelVehicle) : null;
    if (!v) return;
    const T = VEHICLE_TYPES[v.type];
    v.touched = true;
    if (a === "abastecer") {
      if (v.fuel >= 99) { this.say("Tanque cheio."); return; }
      if (!this.take("gasolina")) { this.say("Você não tem gasolina."); return; }
      v.fuel = Math.min(100, v.fuel + 50); this.say("Abastecido (+50%).");
    } else if (a === "reparar") {
      if (!v.needsParts && v.hp >= T.hp) { this.say("Veículo já está inteiro."); return; }
      if (!this.take("pecas")) { this.say("Você não tem peças."); return; }
      v.needsParts = false; v.hp = Math.min(T.hp, v.hp + T.hp * 0.4); this.say("Reparado com peças.");
    } else {
      if (this.p.carryingBed && !T.cargo) { this.say("A cama não cabe. Use van, Kombi ou caminhão."); return; }
      this.p.vehicleId = v.id; this.panelVehicle = null;
      const why = this.canStart(v);
      this.say(why ? `O motor não liga: ${why}.` : `${T.nome} ligado! Cuidado com batidas.`);
    }
  }
  exitVehicle() {
    const v = this.p.vehicleId ? this.vehicles.get(this.p.vehicleId) : null;
    this.p.vehicleId = null;
    if (!v) return;
    v.speed = 0;
    const a = v.angle + Math.PI / 2, d = VEHICLE_TYPES[v.type].wid / 2 + 18;
    this.p.x = v.x + Math.cos(a) * d; this.p.y = v.y + Math.sin(a) * d;
    this.move(this.p, 0, 0, 12);
    this.save();
  }
  sleep() {
    if (!this.isNight()) { this.say("Só dá para dormir à noite (19h–6h)."); return; }
    if (this.zombies.some((z) => Math.hypot(z.x - this.p.x, z.y - this.p.y) < 200)) { this.say("Zumbis por perto! Impossível dormir."); return; }
    if (this.hours() >= 19) this.newDay();
    this.time = 7 / 24;
    this.zombies = [];
    this.p.hp = Math.min(100, this.p.hp + 40);
    this.p.hunger = Math.max(0, this.p.hunger - 15); this.p.thirst = Math.max(0, this.p.thirst - 15);
    this.wasNight = false;
    this.say(`Você dormiu. Dia ${this.day} começou (+40 vida).`);
    this.save();
  }
  newDay() {
    this.day++;
    for (const c of this.companions) {
      const ok = this.count("enlatado") > 0 && (c.kind === "cao" || this.count("agua") > 0);
      if (ok) { this.take("enlatado"); if (c.kind !== "cao") this.take("agua"); }
      else { c.hp -= 30; this.say(`${c.name} passou fome/sede (-30 vida).`); }
    }
    this.removeDeadCompanions();
    this.say(`Dia ${this.day}: os zumbis estão mais fortes.`);
  }
  removeDeadCompanions() {
    for (const c of this.companions.filter((c) => c.hp <= 0)) { this.say(`${c.name} morreu...`); this.burst(c.x, c.y, "#8b0000", 16); }
    this.companions = this.companions.filter((c) => c.hp > 0);
  }

  attack() {
    const p = this.p;
    if (p.vehicleId || p.cd > 0 || this.dead) return;
    if (p.carryingBed) { this.say("Solte a cama para lutar."); p.cd = 0.5; return; }
    const W = WEAPONS[p.equipped];
    p.cd = W.cd; this.swing = 0.18;
    let hit = false;
    for (const z of this.zombies) {
      const d = Math.hypot(z.x - p.x, z.y - p.y);
      if (d > W.range + 12) continue;
      if (Math.abs(angDiff(Math.atan2(z.y - p.y, z.x - p.x), p.angle)) > 1.2 && d > 18) continue;
      const dmg = Math.round(W.dmg * (0.85 + Math.random() * 0.3));
      z.hp -= dmg; z.hit = 0.15; hit = true;
      const a = Math.atan2(z.y - p.y, z.x - p.x); this.move(z, Math.cos(a) * 18, Math.sin(a) * 18, 12);
      this.float(z.x, z.y - 20, "-" + dmg, "#ff6b6b"); this.burst(z.x, z.y, "#7a1010", 6);
    }
    if (hit) this.shake = 3;
  }

  // ---- loop ----
  update(dt: number) {
    if (this.dead || this.paused) return;
    const p = this.p;
    this.time += dt / DAY_LEN;
    if (this.time >= 1) { this.time -= 1; this.newDay(); }
    const night = this.isNight();
    if (night && !this.wasNight) { this.say("A noite chegou. Uma horda se aproxima!"); for (let i = 0; i < 4 + this.day * 2; i++) this.spawnZombie(true); }
    this.wasNight = night;

    p.thirst = Math.max(0, p.thirst - dt * 0.22);
    p.hunger = Math.max(0, p.hunger - dt * 0.15);
    if (p.thirst <= 0 || p.hunger <= 0) p.hp -= dt * 1.5;
    else if (p.thirst > 50 && p.hunger > 50) p.hp = Math.min(100, p.hp + dt * 0.4);
    p.cd = Math.max(0, p.cd - dt); p.hurt = Math.max(0, p.hurt - dt); this.swing = Math.max(0, this.swing - dt);

    const j = this.input.joy, mag = Math.min(1, Math.hypot(j.x, j.y));
    const v = p.vehicleId ? this.vehicles.get(p.vehicleId) : undefined;
    if (v) this.drive(v, dt, j, mag);
    else {
      if (mag > 0.1) {
        p.angle = Math.atan2(j.y, j.x);
        const sp = (p.carryingBed ? 85 : 140) * mag;
        this.move(p, Math.cos(p.angle) * sp * dt, Math.sin(p.angle) * sp * dt, 12);
      }
      if (this.input.attack) this.attack();
    }

    // zumbis
    this.spawnT -= dt;
    const st = this.zStats();
    const want = Math.min(45, night ? 8 + this.day * 4 : 3 + this.day);
    if (this.spawnT <= 0) { this.spawnT = night ? 1.2 : 2.5; if (this.zombies.length < want) this.spawnZombie(false); }
    const veh = v;
    for (const z of this.zombies) {
      z.cd = Math.max(0, z.cd - dt); z.hit = Math.max(0, z.hit - dt);
      let tx = p.x, ty = p.y, td = Math.hypot(p.x - z.x, p.y - z.y), tc: Companion | null = null;
      for (const c of this.companions) { const d = Math.hypot(c.x - z.x, c.y - z.y); if (d < td) { td = d; tx = c.x; ty = c.y; tc = c; } }
      if (td < st.detect) {
        let ax = tx, ay = ty;
        if (z.smart && !tc) { ax += j.x * 60; ay += j.y * 60; }
        const a = Math.atan2(ay - z.y, ax - z.x);
        const sprint = this.day >= 5 && td < 140 ? 1.35 : 1;
        this.move(z, Math.cos(a) * z.speed * sprint * dt, Math.sin(a) * z.speed * sprint * dt, 12);
        z.wa = a;
        const reach = 22 + (tc ? 12 : veh ? vRadius(veh) : 12);
        if (td < reach && z.cd <= 0) {
          z.cd = 1.1;
          if (tc) { tc.hp -= z.dmg; this.float(tc.x, tc.y - 20, "-" + Math.round(z.dmg), "#ffb3b3"); }
          else if (veh) { veh.hp -= z.dmg * 0.5; this.float(veh.x, veh.y - 20, "-" + Math.round(z.dmg * 0.5), "#ffd166"); }
          else { p.hp -= z.dmg; p.hurt = 0.3; this.shake = 6; this.float(p.x, p.y - 24, "-" + Math.round(z.dmg), "#ff4d4d"); this.burst(p.x, p.y, "#a00", 5); }
        }
      } else {
        z.wt -= dt; if (z.wt <= 0) { z.wt = 2 + Math.random() * 3; z.wa = Math.random() * 6.28; }
        this.move(z, Math.cos(z.wa) * z.speed * 0.3 * dt, Math.sin(z.wa) * z.speed * 0.3 * dt, 12);
      }
    }
    for (let a = 0; a < this.zombies.length; a++) for (let b = a + 1; b < this.zombies.length; b++) {
      const A = this.zombies[a], B = this.zombies[b], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
      if (d > 0 && d < 22) { const k = (22 - d) / 2 / d; A.x -= dx * k; A.y -= dy * k; B.x += dx * k; B.y += dy * k; }
    }
    // companheiros
    this.companions.forEach((c, i) => {
      c.cd = Math.max(0, c.cd - dt);
      if (Math.hypot(c.x - p.x, c.y - p.y) > 500) { c.x = p.x - 30 - i * 15; c.y = p.y + 30; }
      let foe: Zombie | null = null, fd = 170;
      for (const z of this.zombies) { const d = Math.hypot(z.x - c.x, z.y - c.y); if (d < fd) { fd = d; foe = z; } }
      const sp = c.kind === "cao" ? 190 : 150;
      if (foe) {
        const a = Math.atan2(foe.y - c.y, foe.x - c.x);
        if (fd > 24) this.move(c, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt, 10);
        else if (c.cd <= 0) {
          c.cd = 0.8; const dmg = c.kind === "cao" ? 11 : 14; foe.hp -= dmg; foe.hit = 0.15;
          this.float(foe.x, foe.y - 20, "-" + dmg, "#ffd166"); this.burst(foe.x, foe.y, "#7a1010", 4);
        }
      } else {
        const ox = p.x - Math.cos(p.angle) * (40 + i * 22), oy = p.y - Math.sin(p.angle) * (40 + i * 22);
        const d = Math.hypot(ox - c.x, oy - c.y);
        if (d > 20) { const a = Math.atan2(oy - c.y, ox - c.x); this.move(c, Math.cos(a) * Math.min(sp, d * 3) * dt, Math.sin(a) * Math.min(sp, d * 3) * dt, 10); }
      }
    });
    this.removeDeadCompanions();
    const before = this.zombies.length;
    for (const z of this.zombies) if (z.hp <= 0) { this.kills++; this.burst(z.x, z.y, "#5a1010", 14); }
    this.zombies = this.zombies.filter((z) => z.hp > 0 && Math.hypot(z.x - p.x, z.y - p.y) < 1100);
    void before;

    // efeitos
    for (const f of this.floats) { f.t -= dt; f.y -= 30 * dt; }
    this.floats = this.floats.filter((f) => f.t > 0);
    for (const q of this.parts) { q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.9; q.vy *= 0.9; }
    this.parts = this.parts.filter((q) => q.t > 0);
    for (const m of this.msgs) m.t -= dt;
    this.msgs = this.msgs.filter((m) => m.t > 0);
    this.shake = Math.max(0, this.shake - dt * 20);
    for (const ve of this.vehicles.values()) if ((ve.needsParts || ve.hp < VEHICLE_TYPES[ve.type].hp * 0.25) && Math.random() < dt * 3 && Math.abs(ve.x - p.x) < 700 && Math.abs(ve.y - p.y) < 700) this.parts.push({ x: ve.x, y: ve.y, vx: (Math.random() - 0.5) * 10, vy: -20, t: 1.2, color: "rgba(60,60,60,0.5)", size: 6 });

    this.target = this.findTarget();
    if (p.hp <= 0) { p.hp = 0; this.dead = true; if (typeof localStorage !== "undefined") localStorage.removeItem(SAVE_KEY); return; }
    this.saveT += dt; if (this.saveT > 10) { this.saveT = 0; this.save(); }
  }

  drive(v: Vehicle, dt: number, j: { x: number; y: number }, mag: number) {
    const T = VEHICLE_TYPES[v.type], p = this.p, why = this.canStart(v);
    v.touched = true;
    if (!why && mag > 0.15) {
      const ta = Math.atan2(j.y, j.x), da = angDiff(ta, v.angle);
      const reverse = Math.abs(da) > 2.5 && Math.abs(v.speed) < 40;
      if (!reverse) v.angle += clamp(da, -T.turn * dt, T.turn * dt) * Math.min(1, 0.3 + Math.abs(v.speed) / 80);
      const target = reverse ? -T.speed * 0.3 : T.speed * mag * (Math.abs(da) > 1.6 ? 0.2 : 1);
      v.speed += (target - v.speed) * Math.min(1, dt * 1.4);
      v.fuel = Math.max(0, v.fuel - dt * (Math.abs(v.speed) / T.speed) * 0.8 * T.fuelUse);
      if (v.fuel <= 0) this.say("Acabou a gasolina!");
    } else v.speed *= 1 - Math.min(1, dt * 1.8);
    const before = Math.abs(v.speed);
    const hit = this.move(v, Math.cos(v.angle) * v.speed * dt, Math.sin(v.angle) * v.speed * dt, vRadius(v), v.id);
    if (hit) {
      if (before > 70) {
        const dmg = Math.round(before * 0.07); v.hp -= dmg; this.shake = 8;
        this.float(v.x, v.y - 30, `Batida! -${dmg}`, "#ffd166"); this.burst(v.x, v.y, "#ccc", 8);
      }
      v.speed *= before > 70 ? -0.25 : 0.6;
    }
    if (Math.abs(v.speed) > 45) for (const z of this.zombies) {
      if (Math.hypot(z.x - v.x, z.y - v.y) < vRadius(v) + 12) {
        const dmg = Math.round(Math.abs(v.speed) * 0.8); z.hp -= dmg; z.hit = 0.2; v.hp -= 2;
        this.move(z, Math.cos(v.angle) * 30, Math.sin(v.angle) * 30, 12);
        this.float(z.x, z.y - 20, "-" + dmg, "#ff6b6b"); this.burst(z.x, z.y, "#7a1010", 10); v.speed *= 0.85;
      }
    }
    if (v.hp <= 0) { v.hp = 0; v.needsParts = true; this.say("O veículo quebrou! Precisa de peças."); }
    p.x = v.x; p.y = v.y;
  }

  spawnZombie(horde: boolean) {
    const st = this.zStats();
    for (let tr = 0; tr < 6; tr++) {
      const a = Math.random() * 6.28, d = horde ? 420 + Math.random() * 200 : 480 + Math.random() * 250;
      const x = this.p.x + Math.cos(a) * d, y = this.p.y + Math.sin(a) * d;
      const { rects } = this.solidsAt(x, y);
      if (rects.some((r) => distRect(x, y, r) < 14)) continue;
      if (this.shelters.some((s) => Math.hypot(s.x - x, s.y - y) < 150)) continue;
      const hpv = st.hp * (0.8 + Math.random() * 0.4);
      this.zombies.push({ x, y, hp: hpv, maxHp: hpv, speed: st.speed * (0.8 + Math.random() * 0.4), dmg: st.dmg, cd: 0, smart: st.smart, hit: 0, wa: Math.random() * 6.28, wt: 0 });
      return;
    }
  }

  // ---- render ----
  render(ctx: CanvasRenderingContext2D, W: number, H: number) {
    const p = this.p;
    const scale = clamp(Math.min(W, H) / 620, 0.65, 1.3);
    const sx = (Math.random() - 0.5) * this.shake, sy = (Math.random() - 0.5) * this.shake;
    const camX = p.x - W / 2 / scale, camY = p.y - H / 2 / scale;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#cdbb8c"; ctx.fillRect(0, 0, W, H);
    ctx.setTransform(scale, 0, 0, scale, -camX * scale + sx, -camY * scale + sy);
    const vw = W / scale, vh = H / scale;
    const c0x = Math.floor(camX / CH), c0y = Math.floor(camY / CH), c1x = Math.floor((camX + vw) / CH), c1y = Math.floor((camY + vh) / CH);
    const vis: Chunk[] = [];
    for (let cx = c0x; cx <= c1x; cx++) for (let cy = c0y; cy <= c1y; cy++) vis.push(this.chunk(cx, cy));
    // chão
    for (let cx = c0x; cx <= c1x; cx++) for (let cy = c0y; cy <= c1y; cy++) {
      const r = mulberry(hash(cx, cy, 99));
      ctx.fillStyle = "#9bab6a";
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(cx * CH + 100 + r() * 500, cy * CH + 100 + r() * 500, 40 + r() * 60, 30 + r() * 40, 0, 0, 7); ctx.fill(); }
    }
    for (const c of vis) {
      for (const rd of c.roads) { ctx.fillStyle = "#3b3d44"; ctx.fillRect(rd.x, rd.y, rd.w, rd.h); }
    }
    ctx.strokeStyle = "#e6c34a"; ctx.lineWidth = 3; ctx.setLineDash([22, 18]);
    for (const c of vis) for (const rd of c.roads) { ctx.beginPath(); if (rd.w > rd.h) { ctx.moveTo(rd.x + ROAD, rd.y + ROAD / 2); ctx.lineTo(rd.x + rd.w, rd.y + ROAD / 2); } else { ctx.moveTo(rd.x + ROAD / 2, rd.y + ROAD); ctx.lineTo(rd.x + ROAD / 2, rd.y + rd.h); } ctx.stroke(); }
    ctx.setLineDash([]);
    const tnow = performance.now() / 1000;
    for (const c of vis) if (c.water) {
      const w = c.water; ctx.fillStyle = "#2a7fa6"; ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = "#c9b27a"; ctx.fillRect(w.x - 8, w.y, 8, w.h); ctx.fillRect(w.x + w.w, w.y, 8, w.h);
      ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 2;
      for (let yy = w.y + 20; yy < w.y + w.h; yy += 40) { ctx.beginPath(); ctx.moveTo(w.x + 30 + Math.sin(tnow + yy) * 10, yy + ((tnow * 20) % 40)); ctx.lineTo(w.x + 70 + Math.sin(tnow + yy) * 10, yy + ((tnow * 20) % 40)); ctx.stroke(); }
      ctx.fillStyle = "#6b5a45"; ctx.fillRect(w.x - 8, w.y - ROAD, w.w + 16, 6); ctx.fillRect(w.x - 8, w.y - 6, w.w + 16, 6);
    }
    for (const c of vis) {
      for (const f of c.floors) {
        ctx.fillStyle = "#b39a78"; ctx.fillRect(f.x, f.y, f.w, f.h);
        ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 1;
        for (let x = f.x; x < f.x + f.w; x += 20) { ctx.beginPath(); ctx.moveTo(x, f.y); ctx.lineTo(x, f.y + f.h); ctx.stroke(); }
      }
      ctx.fillStyle = "#6e6253"; for (const rb of c.rubble) { ctx.beginPath(); ctx.arc(rb.x, rb.y, rb.r, 0, 7); ctx.fill(); }
      ctx.fillStyle = "#4a3a2c"; for (const w of c.walls) ctx.fillRect(w.x, w.y, w.w, w.h);
      for (const wr of c.wrecks) this.drawWreck(ctx, wr);
      ctx.font = "16px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (const k of c.containers) {
        const done = this.looted.has(k.id);
        ctx.fillStyle = done ? "#5c5247" : k.kind === "geladeira" ? "#dfe6e9" : k.kind === "caixa" ? "#c0392b" : k.kind === "destroco" ? "#7f8c8d" : "#8e6e4e";
        ctx.fillRect(k.x, k.y, k.w, k.h);
        ctx.globalAlpha = done ? 0.35 : 1; ctx.fillText(CONTAINER_NAMES[k.kind][1], k.x + k.w / 2, k.y + k.h / 2); ctx.globalAlpha = 1;
      }
      for (const b of c.beds) if (!this.looted.has(b.id)) this.drawBed(ctx, b.x + b.w / 2, b.y + b.h / 2);
    }
    for (const s of this.shelters) {
      ctx.fillStyle = "#8a6a44"; ctx.fillRect(s.x - 50, s.y - 50, 100, 100);
      ctx.fillStyle = "#5b4128"; for (const w of shelterWalls(s)) ctx.fillRect(w.x, w.y, w.w, w.h);
      if (s.hasBed) this.drawBed(ctx, s.x, s.y - 5);
      ctx.fillStyle = "#ffd166"; ctx.font = "bold 11px sans-serif"; ctx.fillText("ABRIGO", s.x, s.y - 60);
    }
    for (const b of this.droppedBeds) this.drawBed(ctx, b.x, b.y);
    for (const ve of this.vehicles.values()) if (ve.x > camX - 100 && ve.x < camX + vw + 100 && ve.y > camY - 100 && ve.y < camY + vh + 100) this.drawVehicle(ctx, ve);
    for (const n of this.npcs.values()) {
      if (n.kind === "cao") this.drawDog(ctx, n.x, n.y, 0, false);
      else { this.drawPerson(ctx, n.x, n.y, 0, "#3b82c4", true); ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.fillText("❗", n.x, n.y - 26); }
    }
    for (const c of this.companions) {
      if (c.kind === "cao") this.drawDog(ctx, c.x, c.y, 0, true); else this.drawPerson(ctx, c.x, c.y, 0, "#2ec4b6", false);
      this.bar(ctx, c.x, c.y - 22, c.hp / c.maxHp, "#2ec4b6");
    }
    for (const z of this.zombies) {
      const tint = Math.min(1, this.day / 8);
      ctx.fillStyle = z.hit > 0 ? "#fff" : `rgb(${80 + tint * 70},${130 - tint * 50},${70 - tint * 30})`;
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(z.x + Math.cos(z.wa - 0.5) * 6, z.y + Math.sin(z.wa - 0.5) * 6); ctx.lineTo(z.x + Math.cos(z.wa - 0.3) * 20, z.y + Math.sin(z.wa - 0.3) * 20);
      ctx.moveTo(z.x + Math.cos(z.wa + 0.5) * 6, z.y + Math.sin(z.wa + 0.5) * 6); ctx.lineTo(z.x + Math.cos(z.wa + 0.3) * 20, z.y + Math.sin(z.wa + 0.3) * 20); ctx.stroke();
      ctx.beginPath(); ctx.arc(z.x, z.y, 12, 0, 7); ctx.fill();
      ctx.fillStyle = "#c0392b"; ctx.beginPath(); ctx.arc(z.x + Math.cos(z.wa) * 6, z.y + Math.sin(z.wa) * 6, 2.5, 0, 7); ctx.fill();
      if (z.hp < z.maxHp) this.bar(ctx, z.x, z.y - 20, z.hp / z.maxHp, "#e74c3c");
    }
    if (!p.vehicleId) {
      this.drawPerson(ctx, p.x, p.y, p.angle, p.hurt > 0 ? "#ff6b6b" : "#ff7a59", false);
      if (p.carryingBed) this.drawBed(ctx, p.x, p.y - 18, 0.7);
      const W = WEAPONS[p.equipped];
      if (this.swing > 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(p.x, p.y, W.range, p.angle - 1 + (1 - this.swing / 0.18) * 0.6, p.angle + 1 - (this.swing / 0.18) * 0.6); ctx.stroke();
      }
    }
    for (const c of vis) for (const t of c.trees) {
      if (this.cut.has(t.id)) { ctx.fillStyle = "#7a5230"; ctx.beginPath(); ctx.arc(t.x, t.y, 9, 0, 7); ctx.fill(); continue; }
      ctx.fillStyle = "#6b4423"; ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, 7); ctx.fill();
      ctx.globalAlpha = Math.hypot(t.x - p.x, t.y - p.y) < 40 ? 0.35 : 0.95;
      if (t.palm) {
        ctx.strokeStyle = "#2f7a3a"; ctx.lineWidth = 9; ctx.lineCap = "round";
        for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.28 + Math.sin(tnow + t.x) * 0.05; ctx.beginPath(); ctx.moveTo(t.x, t.y); ctx.quadraticCurveTo(t.x + Math.cos(a) * 22, t.y + Math.sin(a) * 22 - 4, t.x + Math.cos(a) * 36, t.y + Math.sin(a) * 36); ctx.stroke(); }
        ctx.lineCap = "butt";
      } else { ctx.fillStyle = "#3d7a3a"; ctx.beginPath(); ctx.arc(t.x, t.y, 30, 0, 7); ctx.fill(); ctx.fillStyle = "#4f9447"; ctx.beginPath(); ctx.arc(t.x - 8, t.y - 8, 16, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    for (const q of this.parts) { ctx.fillStyle = q.color; ctx.globalAlpha = Math.min(1, q.t * 2); ctx.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size); }
    ctx.globalAlpha = 1;
    // destaque do alvo
    const t = this.target;
    if (t && t.ref && typeof t.ref === "object" && "x" in (t.ref as object)) {
      const R = t.ref as { x: number; y: number; w?: number; h?: number };
      const cx = R.w ? R.x + R.w / 2 : R.x, cy = R.h ? R.y + R.h / 2 : R.y;
      ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.arc(cx, cy, 26 + Math.sin(tnow * 6) * 3, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    }
    // noite
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const h = this.hours();
    if (h >= 16.5 && h < 19.5) { ctx.fillStyle = `rgba(255,110,60,${0.18 * Math.sin(((h - 16.5) / 3) * Math.PI)})`; ctx.fillRect(0, 0, W, H); }
    const dark = this.darkness();
    if (dark > 0) {
      const px = W / 2, py = H / 2, rad = (p.vehicleId ? 320 : 230) * scale;
      const g = ctx.createRadialGradient(px, py, 30 * scale, px, py, rad);
      g.addColorStop(0, `rgba(4,8,28,${dark * 0.1})`); g.addColorStop(1, `rgba(4,8,28,${dark})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (p.hurt > 0) { ctx.fillStyle = `rgba(200,0,0,${p.hurt})`; ctx.fillRect(0, 0, W, H); }
    ctx.setTransform(scale, 0, 0, scale, -camX * scale, -camY * scale);
    ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
    for (const f of this.floats) { ctx.globalAlpha = Math.min(1, f.t * 2); ctx.fillStyle = "#000"; ctx.fillText(f.text, f.x + 1, f.y + 1); ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y); }
    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  bar(ctx: CanvasRenderingContext2D, x: number, y: number, f: number, col: string) {
    ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(x - 14, y, 28, 4); ctx.fillStyle = col; ctx.fillRect(x - 14, y, 28 * clamp(f, 0, 1), 4);
  }
  drawPerson(ctx: CanvasRenderingContext2D, x: number, y: number, a: number, col: string, injured: boolean) {
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.ellipse(x + 2, y + 4, 13, 10, 0, 0, 7); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.fill();
    ctx.fillStyle = "#f1c27d"; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 3, y + Math.sin(a) * 3, 6, 0, 7); ctx.fill();
    if (injured) { ctx.fillStyle = "#c0392b"; ctx.fillRect(x - 6, y + 4, 8, 3); }
    if (this.p.x === x && this.p.y === y && this.p.equipped !== "punho") { ctx.fillStyle = "#ddd"; ctx.fillRect(x + Math.cos(a + 0.6) * 12 - 2, y + Math.sin(a + 0.6) * 12 - 2, 5, 5); }
  }
  drawDog(ctx: CanvasRenderingContext2D, x: number, y: number, _a: number, collar: boolean) {
    ctx.fillStyle = "#c68642"; ctx.beginPath(); ctx.ellipse(x, y, 13, 7, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 12, y - 2, 6, 0, 7); ctx.fill();
    if (collar) { ctx.fillStyle = "#e63946"; ctx.fillRect(x + 7, y - 6, 3, 9); }
  }
  drawBed(ctx: CanvasRenderingContext2D, x: number, y: number, s = 1) {
    ctx.fillStyle = "#e8e1d0"; ctx.fillRect(x - 18 * s, y - 28 * s, 36 * s, 56 * s);
    ctx.fillStyle = "#e07a5f"; ctx.fillRect(x - 18 * s, y - 6 * s, 36 * s, 34 * s);
    ctx.fillStyle = "#fff"; ctx.fillRect(x - 12 * s, y - 24 * s, 24 * s, 12 * s);
  }
  drawVehicle(ctx: CanvasRenderingContext2D, v: Vehicle) {
    const T = VEHICLE_TYPES[v.type], broken = this.canStart(v) === "Precisa de peças" || v.hp < T.hp * 0.2;
    ctx.save(); ctx.translate(v.x, v.y); ctx.rotate(v.angle);
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(-T.len / 2 + 3, -T.wid / 2 + 4, T.len, T.wid);
    ctx.fillStyle = broken ? "#4a4a4a" : v.color;
    if (v.type === "moto") {
      ctx.fillStyle = "#222"; ctx.fillRect(-T.len / 2, -2, 6, 4); ctx.fillRect(T.len / 2 - 6, -2, 6, 4);
      ctx.fillStyle = broken ? "#4a4a4a" : v.color; ctx.fillRect(-T.len / 2 + 5, -T.wid / 2, T.len - 10, T.wid);
    } else {
      ctx.fillRect(-T.len / 2, -T.wid / 2, T.len, T.wid);
      ctx.fillStyle = "rgba(150,210,240,0.85)";
      const front = v.type === "caminhao" ? T.len / 2 - 14 : T.len / 2 - 14;
      ctx.fillRect(front, -T.wid / 2 + 3, 6, T.wid - 6);
      if (v.type === "caminhao") { ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(-T.len / 2, -T.wid / 2, T.len - 22, T.wid); }
      if (v.type === "kombi") { ctx.fillStyle = "#fff"; ctx.fillRect(-T.len / 2, -T.wid / 2, T.len * 0.45, T.wid); }
    }
    if (this.p.vehicleId === v.id && this.darkness() > 0.3) {
      ctx.fillStyle = "rgba(255,240,180,0.25)"; ctx.beginPath(); ctx.moveTo(T.len / 2, 0); ctx.lineTo(T.len / 2 + 160, -50); ctx.lineTo(T.len / 2 + 160, 50); ctx.fill();
    }
    ctx.restore();
  }
  drawWreck(ctx: CanvasRenderingContext2D, w: Wreck) {
    const cx = w.x + w.w / 2, cy = w.y + w.h / 2;
    ctx.fillStyle = "rgba(20,20,20,0.35)"; ctx.beginPath(); ctx.ellipse(cx, cy, w.w * 0.6, w.h * 0.6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#6d6d6d";
    if (w.type === "aviao") { ctx.fillRect(w.x, cy - 14, w.w, 28); ctx.fillRect(cx - 20, w.y, 40, w.h); ctx.fillStyle = "#444"; ctx.fillRect(w.x, cy - 30, 20, 60); }
    else if (w.type === "helicoptero") { ctx.beginPath(); ctx.ellipse(w.x + 35, cy, 35, 25, 0, 0, 7); ctx.fill(); ctx.fillRect(w.x + 60, cy - 6, 60, 12); ctx.strokeStyle = "#333"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.lineTo(w.x + 70, w.y + w.h); ctx.stroke(); }
    else if (w.type === "onibus") { ctx.fillStyle = "#a8872a"; ctx.fillRect(w.x, w.y, w.w, w.h); ctx.fillStyle = "#333"; for (let i = 0; i < 7; i++) ctx.fillRect(w.x + 10 + i * 22, w.y + 4, 14, 6); }
    else { ctx.fillStyle = "#5a2a1a"; ctx.fillRect(w.x, w.y, 40, w.h); ctx.fillStyle = "#777"; ctx.fillRect(w.x + 44, w.y, w.w - 44, w.h); }
    ctx.fillStyle = "#1a1a1a"; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(w.x + ((i * 53) % w.w), w.y + ((i * 31) % w.h), 6, 0, 7); ctx.fill(); }
  }

  // ---- HUD ----
  hud() {
    const v = this.p.vehicleId ? this.vehicles.get(this.p.vehicleId) : null;
    const pv = this.panelVehicle ? this.vehicles.get(this.panelVehicle) : null;
    const vinfo = (x: Vehicle) => ({ nome: VEHICLE_TYPES[x.type].nome, fuel: Math.round(x.fuel), hp: Math.round(x.hp), maxHp: VEHICLE_TYPES[x.type].hp, needsParts: x.needsParts, why: this.canStart(x), cargo: VEHICLE_TYPES[x.type].cargo });
    return {
      hp: Math.round(this.p.hp), hunger: Math.round(this.p.hunger), thirst: Math.round(this.p.thirst),
      day: this.day, hours: this.hours(), night: this.isNight(),
      inv: { ...this.inv }, cap: this.cap(), used: this.used(), backpack: this.p.backpack,
      equipped: WEAPONS[this.p.equipped].nome, target: this.target?.label ?? null,
      vehicle: v ? vinfo(v) : null, panel: pv ? vinfo(pv) : null,
      carryingBed: this.p.carryingBed,
      companions: this.companions.map((c) => ({ id: c.id, name: c.name, kind: c.kind, hp: Math.round(c.hp), maxHp: c.maxHp })),
      msgs: this.msgs.map((m) => m.text), dead: this.dead, kills: this.kills, zombies: this.zombies.length,
    };
  }

  // ---- save ----
  save() {
    if (this.dead || typeof localStorage === "undefined") return;
    const data = {
      v: 1, p: this.p, inv: this.inv, time: this.time, day: this.day, kills: this.kills,
      looted: [...this.looted], lootLeft: this.lootLeft, cut: [...this.cut], chop: this.chop, npcGone: [...this.npcGone],
      companions: this.companions, shelters: this.shelters, droppedBeds: this.droppedBeds,
      vehicles: [...this.vehicles.values()].filter((v) => v.touched),
    };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch { /* armazenamento cheio */ }
  }
  load(d: ReturnType<typeof JSON.parse>) {
    Object.assign(this.p, d.p); this.inv = d.inv || {}; this.time = d.time; this.day = d.day; this.kills = d.kills || 0;
    this.looted = new Set(d.looted); this.lootLeft = d.lootLeft || {}; this.cut = new Set(d.cut); this.chop = d.chop || {};
    this.npcGone = new Set(d.npcGone); this.companions = d.companions || []; this.shelters = d.shelters || []; this.droppedBeds = d.droppedBeds || [];
    for (const v of d.vehicles || []) this.vehicles.set(v.id, v);
  }
}

