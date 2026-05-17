const canvas = document.querySelector("#flightCanvas");
const ctx = canvas.getContext("2d");
const canvasWrap = canvas.parentElement;

const controls = {
  wingArea: document.querySelector("#wingArea"),
  centerGravity: document.querySelector("#centerGravity"),
  foldAngle: document.querySelector("#foldAngle"),
  launchAngle: document.querySelector("#launchAngle"),
  launchPower: document.querySelector("#launchPower"),
  payload: document.querySelector("#payloadToggle"),
};

const numberInputs = {
  wingArea: document.querySelector("#wingAreaNumber"),
  centerGravity: document.querySelector("#centerGravityNumber"),
  foldAngle: document.querySelector("#foldAngleNumber"),
  launchAngle: document.querySelector("#launchAngleNumber"),
  launchPower: document.querySelector("#launchPowerNumber"),
};

const labels = {
  wingArea: document.querySelector("#wingAreaValue"),
  centerGravity: document.querySelector("#centerGravityValue"),
  foldAngle: document.querySelector("#foldAngleValue"),
  launchAngle: document.querySelector("#launchAngleValue"),
  launchPower: document.querySelector("#launchPowerValue"),
  launchHint: document.querySelector("#launchHint"),
  mission: document.querySelector("#missionLabel"),
  missionRule: document.querySelector("#missionRule"),
  target: document.querySelector("#targetHint"),
  score: document.querySelector("#scoreLabel"),
  distance: document.querySelector("#distanceMetric"),
  time: document.querySelector("#timeMetric"),
  speed: document.querySelector("#speedMetric"),
  aoa: document.querySelector("#aoaMetric"),
  ld: document.querySelector("#ldMetric"),
  stability: document.querySelector("#stabilityMetric"),
  feedback: document.querySelector("#feedbackText"),
  announcer: document.querySelector("#resultAnnouncer"),
  windHint: document.querySelector("#windHint"),
  crosswind: document.querySelector("#crosswindMetric"),
  turbulence: document.querySelector("#turbulenceMetric"),
  groundEffect: document.querySelector("#groundEffectMetric"),
  stall: document.querySelector("#stallMetric"),
  presetHint: document.querySelector("#presetHint"),
  foldingHint: document.querySelector("#foldingHint"),
  foldingExplain: document.querySelector("#foldingExplain"),
  leftCrease: document.querySelector("#leftCrease"),
  rightCrease: document.querySelector("#rightCrease"),
  noseFold: document.querySelector("#noseFold"),
  reportBadge: document.querySelector("#reportBadge"),
  reportMaxAoa: document.querySelector("#reportMaxAoa"),
  reportMinLd: document.querySelector("#reportMinLd"),
  reportStallTime: document.querySelector("#reportStallTime"),
  reportImpact: document.querySelector("#reportImpact"),
  reportAdvice: document.querySelector("#reportAdvice"),
  scoreStars: document.querySelector("#scoreStars"),
  bestDistanceScore: document.querySelector("#bestDistanceScore"),
  bestHangtimeScore: document.querySelector("#bestHangtimeScore"),
  bestEggScore: document.querySelector("#bestEggScore"),
  runBadges: document.querySelector("#runBadges"),
  compareHint: document.querySelector("#compareHint"),
  compareADistance: document.querySelector("#compareADistance"),
  compareBDistance: document.querySelector("#compareBDistance"),
  compareATime: document.querySelector("#compareATime"),
  compareBTime: document.querySelector("#compareBTime"),
  compareAAoa: document.querySelector("#compareAAoa"),
  compareBAoa: document.querySelector("#compareBAoa"),
  compareALd: document.querySelector("#compareALd"),
  compareBLd: document.querySelector("#compareBLd"),
  compareAImpact: document.querySelector("#compareAImpact"),
  compareBImpact: document.querySelector("#compareBImpact"),
  guideOverlay: document.querySelector("#guideOverlay"),
  guideEyebrow: document.querySelector("#guideEyebrow"),
  guideTitle: document.querySelector("#guideTitle"),
  guideText: document.querySelector("#guideText"),
};

const missionButtons = [...document.querySelectorAll("[data-mission]")];
const foldButtons = [...document.querySelectorAll("[data-fold]")];
const viewButtons = [...document.querySelectorAll("[data-view]")];
const sideTabButtons = [...document.querySelectorAll("[data-side-tab]")];
const sidePanels = [...document.querySelectorAll("[data-side-panel]")];
const wingTipInputs = [...document.querySelectorAll("input[name='wingTip']")];
const launchButton = document.querySelector("#launchButton");
const resetButton = document.querySelector("#resetButton");
const randomPresetButton = document.querySelector("#randomPresetButton");
const savePresetButton = document.querySelector("#savePresetButton");
const loadPresetButton = document.querySelector("#loadPresetButton");
const foldPreviewButton = document.querySelector("#foldPreviewButton");
const saveSlotAButton = document.querySelector("#saveSlotAButton");
const saveSlotBButton = document.querySelector("#saveSlotBButton");
const runCompareButton = document.querySelector("#runCompareButton");
const guideOpenButton = document.querySelector("#guideOpenButton");
const guideSkipButton = document.querySelector("#guideSkipButton");
const guidePrevButton = document.querySelector("#guidePrevButton");
const guideNextButton = document.querySelector("#guideNextButton");
const guideDots = [...document.querySelectorAll(".guide-stepper span")];

const STORAGE_KEY = "paper-plane-engineer-preset-v3";
const SCORE_STORAGE_KEY = "paper-plane-engineer-scores-v1";
const COMPARE_STORAGE_KEY = "paper-plane-engineer-compare-v1";
const GUIDE_STORAGE_KEY = "paper-plane-engineer-guide-seen-v1";
const FIXED_STEP = 1 / 120;
const MAX_ACCUMULATED_TIME = 0.18;

const MISSIONS = {
  distance: {
    label: "远航挑战",
    hint: "目标 32 m",
    target: 32,
    rule: "飞行距离达到 32 m 即达标；重点观察升阻比和失速区间。",
  },
  hangtime: {
    label: "滞空挑战",
    hint: "目标 6.5 s",
    target: 6.5,
    rule: "滞空时间达到 6.5 s 即达标；低速稳定滑翔比猛冲更重要。",
  },
  egg: {
    label: "投送挑战",
    hint: "靶心 22 m",
    target: 22,
    rule: "开启鸡蛋载荷，落点在 19-25 m 且垂直冲击小于 3.2 m/s 即达标。",
  },
};

const FOLD_PRESETS = {
  dart: {
    label: "标准镖型",
    explain: "尖锐机头、较小翼面和中前重心，适合远航冲刺。",
    design: { wingArea: 108, centerGravity: 41, foldAngle: 13, launchAngle: 18, launchPower: 78, payload: false, wingTip: "flat" },
    creases: { left: 58, right: 42, nose: 18 },
  },
  glider: {
    label: "宽翼滑翔",
    explain: "翼面展开更大，折叠角更柔和，牺牲一点速度换更长滞空。",
    design: { wingArea: 166, centerGravity: 47, foldAngle: 18, launchAngle: 13, launchPower: 60, payload: false, wingTip: "winglet" },
    creases: { left: 66, right: 34, nose: 28 },
  },
  stunt: {
    label: "上反稳翼",
    explain: "翼尖上反提供横向自稳定，适合乱流和教学演示。",
    design: { wingArea: 148, centerGravity: 45, foldAngle: 20, launchAngle: 15, launchPower: 66, payload: false, wingTip: "dihedral" },
    creases: { left: 62, right: 38, nose: 24 },
  },
  cargo: {
    label: "载荷投送",
    explain: "重心略前、翼面更大、力度更温和，优先保证落地冲击。",
    design: { wingArea: 158, centerGravity: 40, foldAngle: 16, launchAngle: 14, launchPower: 58, payload: true, wingTip: "dihedral" },
    creases: { left: 64, right: 36, nose: 33 },
  },
};

const GUIDE_STEPS = [
  {
    tab: "mission",
    view: "2d",
    title: "先选一种折法",
    text: "从标准镖型、宽翼滑翔、上反稳翼或载荷投送开始。折法会自动映射机翼面积、重心、折叠角和翼尖形状。",
  },
  {
    tab: "design",
    view: "2d",
    title: "再像工程师一样调参数",
    text: "在参数投掷里微调翼面、重心、折叠角、投掷角和力度。右侧数值框支持键盘微调，也可以把方案存入 A/B 试验台。",
  },
  {
    tab: "mission",
    view: "3d",
    title: "切到 3D 或风洞看原理",
    text: "3D 视角可以拖拽旋转、滚轮缩放；风洞模式会显示气流线、升力、阻力和失速红区。",
  },
  {
    tab: "analysis",
    view: "2d",
    title: "投掷后看复盘",
    text: "点击投掷后，系统会自动切到数据复盘，显示成绩、星级、最大迎角、最低升阻比、失速时长和改进建议。",
  },
];

let activeMission = "distance";
let activeFold = "dart";
let viewMode = "2d";
let activeSideTab = "mission";
let foldPreview = null;
let sim = null;
let compareSlots = loadCompareSlots();
let guideIndex = 0;
let lastFrame = 0;
let accumulator = 0;
let previewTime = 0;
let animationStarted = false;
let viewSize = { cssWidth: 1200, cssHeight: 680, dpr: 1 };
const cameraOrbit = {
  yaw: -0.88,
  pitch: 0.3,
  distance: 18,
  target: { x: 18, y: 1.8, z: 0 },
  dragging: false,
  mode: "orbit",
  lastX: 0,
  lastY: 0,
  userMoved: false,
};

const environment = {
  crosswind: 0.8,
  turbulence: 0.46,
  gustPhase: 0,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function readDesign() {
  const wingTip = wingTipInputs.find((input) => input.checked)?.value ?? "flat";
  return {
    wingArea: Number(controls.wingArea.value),
    centerGravity: Number(controls.centerGravity.value),
    foldAngle: Number(controls.foldAngle.value),
    launchAngle: Number(controls.launchAngle.value),
    launchPower: Number(controls.launchPower.value),
    payload: controls.payload.checked,
    wingTip,
  };
}

function applyDesign(design) {
  Object.entries(numberInputs).forEach(([key, input]) => {
    const range = controls[key];
    const value = clamp(Number(design[key] ?? range.value), Number(range.min), Number(range.max));
    range.value = value;
    input.value = value;
  });
  controls.payload.checked = Boolean(design.payload);
  wingTipInputs.forEach((input) => {
    input.checked = input.value === (design.wingTip ?? "flat");
  });
}

function evaluateDesign(d) {
  const area = d.wingArea / 110;
  const cgOffset = (d.centerGravity - 45) / 35;
  const cgPenalty = Math.abs(cgOffset);
  const foldIdeal = d.payload ? 18 : 15;
  const foldPenalty = Math.abs(d.foldAngle - foldIdeal) / 38;
  const tipLift = d.wingTip === "dihedral" ? 1.07 : d.wingTip === "winglet" ? 1.02 : 1;
  const tipDrag = d.wingTip === "winglet" ? 0.84 : d.wingTip === "dihedral" ? 1.04 : 1;
  const tipStability = d.wingTip === "dihedral" ? 0.2 : d.wingTip === "winglet" ? 0.1 : 0;
  const stability = clamp(0.96 - cgPenalty * 0.58 - foldPenalty * 0.7 + tipStability, 0.18, 1.18);
  const baseLift = 0.034 * area * tipLift * (0.76 + d.foldAngle / 34) * (0.74 + stability * 0.42);
  const baseDrag =
    0.0092 *
    tipDrag *
    (0.8 + area * 0.42 + d.foldAngle / 30 + cgPenalty * 0.48 + (d.payload ? 0.34 : 0));

  return {
    area,
    cgOffset,
    stability,
    baseLift,
    baseDrag,
    mass: d.payload ? 1.32 : 1,
  };
}

function calculateAero(state) {
  const relVx = state.vx;
  const gust = Math.sin(state.time * 3.9 + environment.gustPhase) * environment.turbulence;
  const relVy = state.vy - gust;
  const sideSlip = environment.crosswind * (1.12 - state.metrics.stability * 0.35);
  const speed = Math.max(0.001, Math.hypot(relVx, relVy, sideSlip));
  const flightPath = Math.atan2(relVy, relVx);
  const rawAoa = state.rotation - flightPath;
  const aoa = clamp(rawAoa, -0.75, 0.75);
  const absAoa = Math.abs(aoa);
  const criticalAoa = 0.39 + state.metrics.stability * 0.08;
  const stallSeverity = clamp((absAoa - criticalAoa) / 0.28, 0, 1);
  const groundEffect = state.y < 1.65 ? clamp((1.65 - state.y) / 1.65, 0, 1) : 0;
  const liftCoeff = state.metrics.baseLift * (1 + absAoa * 0.48) * (1 - stallSeverity * 0.68) * (1 + groundEffect * 0.32);
  const dragCoeff = state.metrics.baseDrag * (1 + absAoa * 1.45 + stallSeverity * 2.2 + sideSlip * 0.07);
  const lift = Math.max(0, liftCoeff * speed * speed);
  const drag = dragCoeff * speed * speed;
  const ldRatio = drag > 0.001 ? lift / drag : 0;

  return { aoa, criticalAoa, drag, flightPath, groundEffect, gust, ldRatio, lift, sideSlip, speed, stallSeverity };
}

function startSimulation() {
  foldPreview = null;
  const design = readDesign();
  const metrics = evaluateDesign(design);
  const angle = (design.launchAngle * Math.PI) / 180;
  const launchSpeed = 6 + design.launchPower * 0.16 - (design.payload ? 0.9 : 0);

  environment.crosswind = Number((Math.sin(Date.now() / 17000) * 0.8 + 0.8).toFixed(2));
  environment.turbulence = activeMission === "egg" ? 0.36 : 0.46;
  environment.gustPhase = Math.random() * Math.PI * 2;

  sim = {
    design,
    metrics,
    x: 1.1,
    y: 1.25,
    vx: Math.cos(angle) * launchSpeed,
    vy: Math.sin(angle) * launchSpeed,
    rotation: angle,
    time: 0,
    path: [],
    done: false,
    result: null,
    aero: null,
    launchPoint: { x: 1.1, y: 1.25 },
    impactVy: 0,
    accumulatorPoints: 0,
    report: {
      maxAoa: 0,
      minLd: Infinity,
      stallTime: 0,
      maxSpeed: 0,
      groundEffectPeak: 0,
      stallEntered: false,
    },
  };

  resetReport("飞行中");
  labels.score.textContent = "飞行中";
  labels.feedback.textContent = "正在记录速度、迎角、升阻比、失速风险和着陆冲击。";
  announce("投掷开始");
  accumulator = 0;
  lastFrame = performance.now();
  ensureAnimationLoop();
}

function stepSimulation(dt) {
  if (!sim || sim.done) return;

  const aero = calculateAero(sim);
  const safeSpeed2d = Math.max(0.001, Math.hypot(sim.vx, sim.vy));
  const windDrift = environment.crosswind * (1 - sim.metrics.stability) * 0.035;
  const wobbleForce = Math.sin(sim.time * 7.1 + environment.gustPhase) * environment.turbulence * (1 - sim.metrics.stability);
  const ax = (-aero.drag * sim.vx) / safeSpeed2d / sim.metrics.mass + (-sim.vy / safeSpeed2d) * aero.lift;
  const ay =
    (-aero.drag * sim.vy) / safeSpeed2d / sim.metrics.mass +
    (sim.vx / safeSpeed2d) * aero.lift -
    9.8 +
    wobbleForce +
    aero.groundEffect * 1.12;

  sim.vx += ax * dt;
  sim.vy += ay * dt;
  sim.x += (sim.vx - windDrift) * dt;
  sim.y += sim.vy * dt;
  sim.time += dt;
  sim.aero = aero;

  const targetRotation = aero.flightPath + aero.aoa * 0.26 + sim.metrics.cgOffset * 0.09;
  sim.rotation += (targetRotation - sim.rotation) * dt * (1.5 + sim.metrics.stability * 3.7);
  sim.rotation += wobbleForce * dt * 0.24;

  updateFlightReport(sim, aero, dt);

  sim.accumulatorPoints += dt;
  if (sim.accumulatorPoints >= 0.035 || sim.path.length === 0) {
    sim.path.push({
      x: sim.x,
      y: Math.max(0, sim.y),
      stability: sim.metrics.stability,
      stall: aero.stallSeverity,
    });
    sim.accumulatorPoints = 0;
  }

  if (sim.y <= 0 || sim.time > 18 || sim.x > 76) {
    sim.y = 0;
    sim.impactVy = Math.abs(sim.vy);
    sim.done = true;
    sim.result = scoreFlight(sim);
    labels.score.textContent = sim.result.score;
    labels.feedback.textContent = sim.result.feedback;
    renderReport(sim);
    updateScores(sim);
    setSideTab("analysis");
    announce(`${sim.result.score}。${sim.result.feedback}`);
  }
}

function updateFlightReport(state, aero, dt) {
  const maxAoa = Math.abs((aero.aoa * 180) / Math.PI);
  state.report.maxAoa = Math.max(state.report.maxAoa, maxAoa);
  state.report.minLd = Math.min(state.report.minLd, aero.ldRatio);
  state.report.maxSpeed = Math.max(state.report.maxSpeed, aero.speed);
  state.report.groundEffectPeak = Math.max(state.report.groundEffectPeak, aero.groundEffect);
  if (aero.stallSeverity > 0.22) state.report.stallTime += dt;
  if (aero.stallSeverity > 0.55) state.report.stallEntered = true;
}

function scoreFlight(state) {
  const distance = state.x;
  const hangtime = state.time;
  const impact = state.impactVy;
  const aero = state.aero ?? calculateAero(state);
  const stableText =
    state.metrics.stability > 0.82 ? "姿态很稳" : state.metrics.stability > 0.5 ? "姿态可控" : "姿态摇摆明显";
  const stallText = state.report.stallEntered ? "飞行中出现失速，迎角需要收小。" : "迎角基本在安全区间。";

  if (activeMission === "distance") {
    const pass = distance >= MISSIONS.distance.target;
    return {
      score: pass ? `达标 ${distance.toFixed(1)} m` : `${distance.toFixed(1)} m`,
      pass,
      feedback: pass
        ? `远航达标。${stableText}，最低升阻比 ${state.report.minLd.toFixed(1)}，${stallText}`
        : `还差 ${(MISSIONS.distance.target - distance).toFixed(1)} m。${buildAdvice(state).join(" ")}`,
    };
  }

  if (activeMission === "hangtime") {
    const pass = hangtime >= MISSIONS.hangtime.target;
    return {
      score: pass ? `达标 ${hangtime.toFixed(1)} s` : `${hangtime.toFixed(1)} s`,
      pass,
      feedback: pass
        ? `滞空达标。${stableText}，地效峰值 ${Math.round(state.report.groundEffectPeak * 100)}%，${stallText}`
        : `滞空不足。${buildAdvice(state).join(" ")}`,
    };
  }

  const target = MISSIONS.egg.target;
  const error = Math.abs(distance - target);
  const pass = state.design.payload && impact < 3.2 && error <= 3;
  return {
    score: pass ? "投送成功" : `${distance.toFixed(1)} m / 冲击 ${impact.toFixed(1)}`,
    pass,
    feedback: pass
      ? `鸡蛋安全送达靶区。落点误差 ${error.toFixed(1)} m，垂直冲击 ${impact.toFixed(1)} m/s。`
      : `投送未完成。落点误差 ${error.toFixed(1)} m，垂直冲击 ${impact.toFixed(1)} m/s。${buildAdvice(state).join(" ")}`,
  };
}

function buildAdvice(state) {
  const advice = [];
  if (state.report.stallTime > 0.25) advice.push("迎角持续偏高，减少折叠角或投掷角。");
  if (state.report.minLd < 2.8) advice.push("升阻比偏低，尝试小翼或降低翼面/折叠角。");
  if (state.metrics.stability < 0.55) advice.push("稳定性不足，选择上反稳翼或把重心调回 40%-50%。");
  if (activeMission === "distance" && state.x < MISSIONS.distance.target) advice.push("远航关可用标准镖型并适度提高出手力度。");
  if (activeMission === "hangtime" && state.time < MISSIONS.hangtime.target) advice.push("滞空关可用宽翼滑翔，机翼面积提高到 145 cm² 以上。");
  if (activeMission === "egg") {
    if (!state.design.payload) advice.push("投送关需要开启鸡蛋载荷。");
    if (state.impactVy >= 3.2) advice.push("落地冲击偏大，降低力度并增大翼面。");
    if (state.x < MISSIONS.egg.target - 3) advice.push("落点偏近，略增力度或角度。");
    if (state.x > MISSIONS.egg.target + 3) advice.push("落点偏远，降低力度或角度。");
  }
  return advice.length ? advice : ["参数接近目标，微调出手角度和力度即可。"];
}

function renderReport(state) {
  const report = state.report;
  const pass = Boolean(state.result?.pass);
  labels.reportBadge.textContent = pass ? "达标" : "需调整";
  labels.reportBadge.className = pass ? "pass" : "fail";
  labels.reportMaxAoa.textContent = `${report.maxAoa.toFixed(0)}°`;
  labels.reportMinLd.textContent = Number.isFinite(report.minLd) ? report.minLd.toFixed(1) : "--";
  labels.reportStallTime.textContent = `${report.stallTime.toFixed(2)} s`;
  labels.reportImpact.textContent = `${state.impactVy.toFixed(1)} m/s`;
  labels.reportAdvice.textContent = buildReportSummary(state);
}

function buildReportSummary(state) {
  const notes = [];
  notes.push(state.report.stallEntered ? "出现明显失速，机头抬得太多。" : "没有进入严重失速。");
  notes.push(state.report.minLd < 2.8 ? "升阻比偏低，能量被阻力消耗得快。" : "升阻比表现可用。");
  notes.push(state.impactVy > 3.2 ? "落地冲击偏大，不适合带载荷。" : "落地冲击较温和。");
  notes.push(buildAdvice(state)[0]);
  return notes.join(" ");
}

function resetReport(status = "未飞行") {
  labels.reportBadge.textContent = status;
  labels.reportBadge.className = "";
  labels.reportMaxAoa.textContent = "--";
  labels.reportMinLd.textContent = "--";
  labels.reportStallTime.textContent = "--";
  labels.reportImpact.textContent = "--";
  labels.reportAdvice.textContent = "完成一次投掷后，这里会生成类似工程试飞报告的复盘。";
}

function loadScores() {
  try {
    return JSON.parse(localStorage.getItem(SCORE_STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveScores(scores) {
  localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
}

function scoreValueForMission(state, mission = activeMission) {
  if (mission === "distance") return state.x;
  if (mission === "hangtime") return state.time;
  const error = Math.abs(state.x - MISSIONS.egg.target);
  return state.result?.pass ? 100 - error * 8 - state.impactVy * 4 : Math.max(0, 55 - error * 5 - state.impactVy * 6);
}

function starsForRun(state, mission = activeMission) {
  const noStall = state.report.stallTime < 0.15;
  const lowImpact = state.impactVy < 3.2;
  if (mission === "distance") {
    return (state.x >= 32 ? 1 : 0) + (state.x >= 42 ? 1 : 0) + (noStall ? 1 : 0);
  }
  if (mission === "hangtime") {
    return (state.time >= 6.5 ? 1 : 0) + (state.time >= 8 ? 1 : 0) + (noStall ? 1 : 0);
  }
  return (state.result?.pass ? 1 : 0) + (lowImpact ? 1 : 0) + (noStall ? 1 : 0);
}

function badgesForRun(state) {
  const badges = [];
  if (state.report.stallTime < 0.15) badges.push("无失速");
  if (state.impactVy < 3.2) badges.push("低冲击");
  if (state.report.minLd >= 3.2) badges.push("高升阻比");
  return badges.length ? badges.join(" / ") : "继续调参";
}

function updateScores(state) {
  const scores = loadScores();
  const mission = activeMission;
  const value = scoreValueForMission(state, mission);
  const stars = starsForRun(state, mission);
  const previous = scores[mission];
  if (!previous || value > previous.value || stars > previous.stars) {
    scores[mission] = {
      value,
      stars: Math.max(stars, previous?.stars ?? 0),
      distance: state.x,
      time: state.time,
      impact: state.impactVy,
      noStall: state.report.stallTime < 0.15,
      lowImpact: state.impactVy < 3.2,
    };
    saveScores(scores);
  }
  labels.scoreStars.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
  labels.runBadges.textContent = badgesForRun(state);
  renderScores();
}

function renderScores() {
  const scores = loadScores();
  labels.bestDistanceScore.textContent = scores.distance ? `${scores.distance.distance.toFixed(1)} m / ${scores.distance.stars}★` : "--";
  labels.bestHangtimeScore.textContent = scores.hangtime ? `${scores.hangtime.time.toFixed(1)} s / ${scores.hangtime.stars}★` : "--";
  labels.bestEggScore.textContent = scores.egg ? `${scores.egg.value.toFixed(0)} 分 / ${scores.egg.stars}★` : "--";
}

function updateMetrics() {
  const state = sim;
  const design = state?.design ?? readDesign();
  const metrics = state?.metrics ?? evaluateDesign(design);
  const previewSpeed = 6 + design.launchPower * 0.16;
  const aero =
    state?.aero ??
    calculateAero({
      design,
      metrics,
      x: 1.1,
      y: 1.25,
      vx: Math.cos((design.launchAngle * Math.PI) / 180) * previewSpeed,
      vy: Math.sin((design.launchAngle * Math.PI) / 180) * previewSpeed,
      rotation: (design.launchAngle * Math.PI) / 180,
      time: previewTime,
    });

  labels.distance.textContent = `${(state?.x ?? 0).toFixed(1)} m`;
  labels.time.textContent = `${(state?.time ?? 0).toFixed(1)} s`;
  labels.speed.textContent = `${aero.speed.toFixed(1)} m/s`;
  labels.aoa.textContent = `${((aero.aoa * 180) / Math.PI).toFixed(0)}°`;
  labels.ld.textContent = aero.ldRatio.toFixed(1);
  labels.stability.textContent = metrics.stability > 0.82 ? "稳定" : metrics.stability > 0.5 ? "可控" : "摇摆";
  labels.stability.style.color =
    metrics.stability > 0.82 ? "var(--good)" : metrics.stability > 0.5 ? "var(--warn)" : "var(--danger)";
  labels.crosswind.textContent = `${environment.crosswind.toFixed(1)} m/s`;
  labels.turbulence.textContent = environment.turbulence < 0.4 ? "低" : environment.turbulence < 0.6 ? "中" : "高";
  labels.groundEffect.textContent = aero.groundEffect > 0.15 ? `${Math.round(aero.groundEffect * 100)}%` : "未进入";
  labels.stall.textContent = aero.stallSeverity > 0.55 ? "失速" : aero.stallSeverity > 0.22 ? "临界" : "安全";
  labels.stall.style.color =
    aero.stallSeverity > 0.55 ? "var(--danger)" : aero.stallSeverity > 0.22 ? "var(--warn)" : "var(--good)";
}

function updateLabels() {
  const design = readDesign();
  labels.wingArea.textContent = `${design.wingArea} cm²`;
  labels.centerGravity.textContent = `${design.centerGravity}%`;
  labels.foldAngle.textContent = `${design.foldAngle}°`;
  labels.launchAngle.textContent = `${design.launchAngle}°`;
  labels.launchPower.textContent = `${design.launchPower}%`;
  labels.launchHint.textContent = `力度 ${design.launchPower}%`;
  labels.windHint.textContent = `侧风 ${environment.crosswind.toFixed(1)} m/s`;
  labels.mission.textContent = MISSIONS[activeMission].label;
  labels.target.textContent = MISSIONS[activeMission].hint;
  labels.missionRule.textContent = MISSIONS[activeMission].rule;
  controls.payload.disabled = activeMission !== "egg";
  if (activeMission !== "egg" && activeFold !== "cargo") controls.payload.checked = false;
  Object.entries(numberInputs).forEach(([key, input]) => {
    input.value = controls[key].value;
  });
  updateFoldVisual();
  updateMetrics();
}

function resetSimulation() {
  sim = null;
  foldPreview = null;
  accumulator = 0;
  labels.score.textContent = "等待投掷";
  labels.feedback.textContent = "调好参数后投掷，系统会根据升力、阻力、重心、侧风、地效和着陆冲击给出反馈。";
  resetReport();
  announce("已重置");
  updateMetrics();
}

function applyFoldPreset(key) {
  const preset = FOLD_PRESETS[key];
  if (!preset) return;
  activeFold = key;
  applyDesign(preset.design);
  foldButtons.forEach((button) => button.classList.toggle("active", button.dataset.fold === key));
  if (key === "cargo") activeMission = "egg";
  missionButtons.forEach((button) => button.classList.toggle("active", button.dataset.mission === activeMission));
  resetSimulation();
  updateLabels();
  announce(`已应用${preset.label}折法`);
}

function updateFoldVisual() {
  const preset = FOLD_PRESETS[activeFold];
  const design = readDesign();
  const creases =
    activeFold === "custom" || !preset
      ? {
          left: clamp(70 - design.wingArea / 5, 36, 68),
          right: clamp(30 + design.wingArea / 5, 32, 64),
          nose: clamp(10 + design.centerGravity / 2, 18, 44),
        }
      : preset.creases;
  labels.foldingHint.textContent = preset?.label ?? "手动微调";
  labels.foldingExplain.textContent =
    preset?.explain ?? "你正在手动修改参数，折线会根据翼面、重心和折叠角实时估算。";
  labels.leftCrease.style.left = `${creases.left}%`;
  labels.rightCrease.style.left = `${creases.right}%`;
  labels.noseFold.style.top = `${creases.nose}%`;
}

function setCustomFold() {
  activeFold = "custom";
  foldButtons.forEach((button) => button.classList.remove("active"));
}

function applyRandomPreset() {
  const keys = Object.keys(FOLD_PRESETS);
  applyFoldPreset(keys[Math.floor(Math.random() * keys.length)]);
}

function savePreset() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ design: readDesign(), activeFold, activeMission }));
  labels.presetHint.textContent = "已保存";
  announce("当前方案已保存");
}

function loadPreset() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    labels.presetHint.textContent = "暂无保存";
    announce("没有找到已保存方案");
    return;
  }
  try {
    const saved = JSON.parse(raw);
    activeFold = saved.activeFold ?? "custom";
    activeMission = saved.activeMission ?? activeMission;
    applyDesign(saved.design ?? saved);
    foldButtons.forEach((button) => button.classList.toggle("active", button.dataset.fold === activeFold));
    missionButtons.forEach((button) => button.classList.toggle("active", button.dataset.mission === activeMission));
    labels.presetHint.textContent = "已载入";
    resetSimulation();
    updateLabels();
    announce("已载入保存方案");
  } catch {
    labels.presetHint.textContent = "读取失败";
  }
}

function loadCompareSlots() {
  try {
    return JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveCompareSlots() {
  localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareSlots));
}

function saveCompareSlot(slot) {
  compareSlots[slot] = { design: readDesign(), activeFold, activeMission };
  saveCompareSlots();
  labels.compareHint.textContent = `已保存方案 ${slot}`;
  announce(`已保存方案 ${slot}`);
}

function runCompare() {
  if (!compareSlots.A?.design || !compareSlots.B?.design) {
    labels.compareHint.textContent = "请先保存 A 和 B";
    announce("请先保存 A 和 B 两个方案");
    return;
  }
  const resultA = simulateDesign(compareSlots.A.design, activeMission);
  const resultB = simulateDesign(compareSlots.B.design, activeMission);
  renderCompare(resultA, resultB);
  labels.compareHint.textContent = `按${MISSIONS[activeMission].label}规则`;
  announce("A/B 对比试飞完成");
}

function simulateDesign(design, mission) {
  const previousEnv = { ...environment };
  environment.crosswind = 0.8;
  environment.turbulence = mission === "egg" ? 0.36 : 0.46;
  environment.gustPhase = 0.7;

  const metrics = evaluateDesign(design);
  const angle = (design.launchAngle * Math.PI) / 180;
  const launchSpeed = 6 + design.launchPower * 0.16 - (design.payload ? 0.9 : 0);
  const state = {
    design,
    metrics,
    x: 1.1,
    y: 1.25,
    vx: Math.cos(angle) * launchSpeed,
    vy: Math.sin(angle) * launchSpeed,
    rotation: angle,
    time: 0,
    impactVy: 0,
    report: {
      maxAoa: 0,
      minLd: Infinity,
      stallTime: 0,
      maxSpeed: 0,
      groundEffectPeak: 0,
      stallEntered: false,
    },
  };

  for (let i = 0; i < 2400; i += 1) {
    const aero = calculateAero(state);
    const dt = FIXED_STEP;
    const safeSpeed2d = Math.max(0.001, Math.hypot(state.vx, state.vy));
    const windDrift = environment.crosswind * (1 - state.metrics.stability) * 0.035;
    const wobbleForce = Math.sin(state.time * 7.1 + environment.gustPhase) * environment.turbulence * (1 - state.metrics.stability);
    const ax = (-aero.drag * state.vx) / safeSpeed2d / state.metrics.mass + (-state.vy / safeSpeed2d) * aero.lift;
    const ay =
      (-aero.drag * state.vy) / safeSpeed2d / state.metrics.mass +
      (state.vx / safeSpeed2d) * aero.lift -
      9.8 +
      wobbleForce +
      aero.groundEffect * 1.12;

    state.vx += ax * dt;
    state.vy += ay * dt;
    state.x += (state.vx - windDrift) * dt;
    state.y += state.vy * dt;
    state.time += dt;
    state.aero = aero;
    const targetRotation = aero.flightPath + aero.aoa * 0.26 + state.metrics.cgOffset * 0.09;
    state.rotation += (targetRotation - state.rotation) * dt * (1.5 + state.metrics.stability * 3.7);
    state.rotation += wobbleForce * dt * 0.24;
    updateFlightReport(state, aero, dt);
    if (state.y <= 0 || state.time > 18 || state.x > 76) break;
  }

  state.impactVy = Math.abs(state.vy);
  state.result = scoreFlightForMission(state, mission);
  Object.assign(environment, previousEnv);
  return state;
}

function scoreFlightForMission(state, mission) {
  if (mission === "distance") return { pass: state.x >= MISSIONS.distance.target };
  if (mission === "hangtime") return { pass: state.time >= MISSIONS.hangtime.target };
  const error = Math.abs(state.x - MISSIONS.egg.target);
  return { pass: state.design.payload && state.impactVy < 3.2 && error <= 3 };
}

function renderCompare(a, b) {
  labels.compareADistance.textContent = `${a.x.toFixed(1)} m`;
  labels.compareBDistance.textContent = `${b.x.toFixed(1)} m`;
  labels.compareATime.textContent = `${a.time.toFixed(1)} s`;
  labels.compareBTime.textContent = `${b.time.toFixed(1)} s`;
  labels.compareAAoa.textContent = `${a.report.maxAoa.toFixed(0)}°`;
  labels.compareBAoa.textContent = `${b.report.maxAoa.toFixed(0)}°`;
  labels.compareALd.textContent = Number.isFinite(a.report.minLd) ? a.report.minLd.toFixed(1) : "--";
  labels.compareBLd.textContent = Number.isFinite(b.report.minLd) ? b.report.minLd.toFixed(1) : "--";
  labels.compareAImpact.textContent = `${a.impactVy.toFixed(1)}`;
  labels.compareBImpact.textContent = `${b.impactVy.toFixed(1)}`;
}

function announce(text) {
  labels.announcer.textContent = text;
}

function resizeCanvas() {
  const rect = canvasWrap.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = Math.max(320, Math.round(rect.width));
  const cssHeight = Math.max(360, Math.round(rect.height));
  viewSize = { cssWidth, cssHeight, dpr };
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function worldToCanvas(x, y, view) {
  return { x: view.left + x * view.scale, y: view.ground - y * view.scale };
}

function getView() {
  const maxX = Math.max(38, sim?.x ? sim.x + 8 : 38);
  const scale = clamp((viewSize.cssWidth - 84) / maxX, 9, 25);
  return { width: viewSize.cssWidth, height: viewSize.cssHeight, left: 42, ground: viewSize.cssHeight - 82, scale };
}

function drawScene() {
  const view = getView();
  ctx.clearRect(0, 0, view.width, view.height);

  if (viewMode === "3d") {
    drawScene3D(view);
    return;
  }

  if (viewMode === "wind") {
    drawWindTunnel(view);
    return;
  }

  const sky = ctx.createLinearGradient(0, 0, 0, view.height);
  sky.addColorStop(0, "#cfe8f0");
  sky.addColorStop(0.68, "#edf5ef");
  sky.addColorStop(1, "#d7dfd1");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, view.width, view.height);

  drawMeasureLines(view);
  drawTarget(view);
  drawLaunchMarker(view);
  drawRunway(view);
  drawPath(view);
  drawWind(view);

  const design = readDesign();
  if (sim) {
    const p = worldToCanvas(sim.x, Math.max(0.15, sim.y), view);
    drawVelocityVector(p, sim);
    drawPlane(p, sim.rotation, design, 1);
  } else {
    const y = 2.2 + Math.sin(previewTime * 2.1) * 0.12;
    const p = worldToCanvas(2.3, y, view);
    drawPlane(p, (-8 * Math.PI) / 180, design, 1);
  }
}

function drawScene3D(view) {
  const sky = ctx.createLinearGradient(0, 0, 0, view.height);
  sky.addColorStop(0, "#bcdde8");
  sky.addColorStop(0.58, "#eaf4ef");
  sky.addColorStop(1, "#cbd6c7");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, view.width, view.height);

  const camera = createCamera(view);
  drawRunway3D(view, camera);
  drawTarget3D(view, camera);
  drawLaunchMarker3D(view, camera);
  drawPath3D(view, camera);
  drawWind3D(view);

  const design = readDesign();
  if (!sim && foldPreview) {
    const progress = getFoldPreviewProgress();
    drawFoldingPreview3D(view, camera, design, progress);
    drawFoldTimeline(view, progress);
    ctx.fillStyle = "rgb(23 32 42 / 0.72)";
    ctx.font = "700 12px sans-serif";
    ctx.fillText("3D 折纸预览：A4 纸沿折线翻折，最后形成纸飞机", 18, 28);
    return;
  }

  const pose = sim
    ? {
        x: sim.x,
        y: Math.max(0.2, sim.y),
        z: lateralOffset(sim),
        pitch: sim.rotation,
        roll: rollFromState(sim),
      }
    : {
        x: 2.4,
        y: 2.2 + Math.sin(previewTime * 2.1) * 0.16,
        z: Math.sin(previewTime * 1.4) * 0.18,
        pitch: (-8 * Math.PI) / 180,
        roll: Math.sin(previewTime * 1.8) * 0.1,
      };
  drawVelocityVector3D(view, camera, pose);
  drawPlane3D(view, camera, pose, design);

  ctx.fillStyle = "rgb(23 32 42 / 0.72)";
  ctx.font = "700 12px sans-serif";
  ctx.fillText("3D 透视视角：轨迹、机翼上反和速度矢量随参数变化", 18, 28);
}

function drawWindTunnel(view) {
  const design = readDesign();
  const metrics = evaluateDesign(design);
  const state = {
    design,
    metrics,
    x: 0,
    y: 1.6,
    vx: 12,
    vy: Math.sin(previewTime * 1.3) * 0.4,
    rotation: ((design.foldAngle + design.launchAngle * 0.35) * Math.PI) / 180,
    time: previewTime,
  };
  const aero = calculateAero(state);
  const stall = aero.stallSeverity;

  const gradient = ctx.createLinearGradient(0, 0, 0, view.height);
  gradient.addColorStop(0, "#d7ecf1");
  gradient.addColorStop(1, "#edf5ef");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, view.width, view.height);

  drawWindTunnelGrid(view);
  drawStreamlines(view, aero, stall);

  const center = { x: view.width * 0.48, y: view.height * 0.5 };
  drawWindTunnelPlane(center, design, aero);
  drawForceArrow(center.x, center.y, 0, -clamp(aero.lift * 18, 34, 118), "#2f8a54", "升力");
  drawForceArrow(center.x, center.y, clamp(aero.drag * 36, 36, 130), 0, "#d8662a", "阻力");
  drawForceArrow(center.x, center.y, 0, 54, "#60707c", "重力");

  if (stall > 0.22) {
    ctx.fillStyle = `rgb(184 63 55 / ${0.12 + stall * 0.22})`;
    ctx.fillRect(0, 0, view.width, view.height);
    ctx.fillStyle = "#b83f37";
    ctx.font = "800 18px sans-serif";
    ctx.fillText("失速红区：迎角过高，气流开始分离", 18, 32);
  } else {
    ctx.fillStyle = "rgb(23 32 42 / 0.72)";
    ctx.font = "800 18px sans-serif";
    ctx.fillText("风洞模式：观察气流、升力、阻力与失速边界", 18, 32);
  }

  ctx.fillStyle = "rgb(255 255 255 / 0.84)";
  ctx.strokeStyle = "rgb(23 32 42 / 0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(18, view.height - 112, 310, 82, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#17202a";
  ctx.font = "700 13px sans-serif";
  ctx.fillText(`迎角 ${((aero.aoa * 180) / Math.PI).toFixed(0)}°`, 34, view.height - 84);
  ctx.fillText(`升阻比 ${aero.ldRatio.toFixed(1)}`, 134, view.height - 84);
  ctx.fillText(`失速强度 ${Math.round(stall * 100)}%`, 34, view.height - 54);
  ctx.fillText(`风速 ${aero.speed.toFixed(1)} m/s`, 178, view.height - 54);
}

function drawWindTunnelGrid(view) {
  ctx.strokeStyle = "rgb(20 108 148 / 0.1)";
  ctx.lineWidth = 1;
  for (let x = 0; x < view.width; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, view.height);
    ctx.stroke();
  }
  for (let y = 0; y < view.height; y += 42) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(view.width, y);
    ctx.stroke();
  }
}

function drawStreamlines(view, aero, stall) {
  ctx.lineWidth = 2;
  for (let i = 0; i < 13; i += 1) {
    const baseY = 92 + i * ((view.height - 190) / 12);
    ctx.strokeStyle = stall > 0.22 && i > 4 && i < 9 ? "rgb(184 63 55 / 0.62)" : "rgb(20 108 148 / 0.42)";
    ctx.beginPath();
    for (let x = 0; x <= view.width; x += 18) {
      const aroundWing = Math.exp(-Math.pow((x - view.width * 0.48) / 170, 2));
      const bend = aroundWing * (i < 6 ? -28 : 18) * (1 + aero.aoa);
      const separated = stall * aroundWing * Math.sin(x * 0.07 + previewTime * 6 + i) * 24;
      const y = baseY + bend + separated;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawWindTunnelPlane(center, design, aero) {
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(-aero.aoa * 0.5);
  const scale = clamp(design.wingArea / 115, 0.78, 1.35);
  ctx.fillStyle = "#fbfbf4";
  ctx.strokeStyle = "#73808a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(84, 0);
  ctx.lineTo(-72, -42 * scale);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-72, 42 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgb(20 108 148 / 0.5)";
  ctx.beginPath();
  ctx.moveTo(84, 0);
  ctx.lineTo(-22, 0);
  ctx.moveTo(-20, 0);
  ctx.lineTo(-72, -42 * scale);
  ctx.moveTo(-20, 0);
  ctx.lineTo(-72, 42 * scale);
  ctx.stroke();
  ctx.restore();
}

function drawForceArrow(x, y, dx, dy, color, label) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dx, y + dy);
  ctx.stroke();
  const angle = Math.atan2(dy, dx);
  ctx.save();
  ctx.translate(x + dx, y + dy);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-10, -6);
  ctx.lineTo(-10, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.font = "800 13px sans-serif";
  ctx.fillText(label, x + dx + 8, y + dy - 8);
}

function createCamera(view) {
  const target = getCameraTarget();
  const cp = Math.cos(cameraOrbit.pitch);
  const sp = Math.sin(cameraOrbit.pitch);
  const cy = Math.cos(cameraOrbit.yaw);
  const sy = Math.sin(cameraOrbit.yaw);
  const camera = {
    x: target.x + cameraOrbit.distance * cp * cy,
    y: target.y + cameraOrbit.distance * sp,
    z: target.z + cameraOrbit.distance * cp * sy,
  };
  const forward = normalize3(sub3(target, camera));
  const worldUp = { x: 0, y: 1, z: 0 };
  const right = normalize3(cross3(forward, worldUp));
  const up = normalize3(cross3(right, forward));
  return { position: camera, forward, right, up, focal: view.width * 0.86 };
}

function getCameraTarget() {
  if (!cameraOrbit.userMoved) {
    if (sim) {
      cameraOrbit.target.x = clamp(sim.x + 8, 10, 50);
      cameraOrbit.target.y = 2.1;
      cameraOrbit.target.z = 0;
    } else if (foldPreview) {
      cameraOrbit.target.x = 8;
      cameraOrbit.target.y = 1.7;
      cameraOrbit.target.z = 0;
    } else {
      cameraOrbit.target.x = 15;
      cameraOrbit.target.y = 1.8;
      cameraOrbit.target.z = 0;
    }
  }
  return cameraOrbit.target;
}

function project3D(point, view, camera) {
  const rel = sub3(point, camera.position);
  const depth = dot3(rel, camera.forward);
  if (depth <= 0.2) return null;
  const x = dot3(rel, camera.right);
  const y = dot3(rel, camera.up);
  const scale = camera.focal / depth;
  return {
    x: view.width * 0.5 + x * scale,
    y: view.height * 0.55 - y * scale,
    depth,
    scale,
  };
}

function drawRunway3D(view, camera) {
  const corners = [
    { x: 0, y: 0, z: -5 },
    { x: 76, y: 0, z: -7.5 },
    { x: 76, y: 0, z: 7.5 },
    { x: 0, y: 0, z: 5 },
  ].map((point) => project3D(point, view, camera));

  if (corners.some((point) => !point)) return;
  ctx.fillStyle = "#51616a";
  ctx.beginPath();
  corners.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgb(255 255 255 / 0.42)";
  ctx.lineWidth = 1;
  for (let m = 0; m <= 75; m += 5) {
    const left = project3D({ x: m, y: 0.02, z: -5.5 }, view, camera);
    const right = project3D({ x: m, y: 0.02, z: 5.5 }, view, camera);
    if (!left || !right) continue;
    ctx.beginPath();
    ctx.moveTo(left.x, left.y);
    ctx.lineTo(right.x, right.y);
    ctx.stroke();
    if (m % 10 === 0) {
      ctx.fillStyle = "rgb(255 255 255 / 0.9)";
      ctx.font = "700 11px sans-serif";
      ctx.fillText(`${m}m`, left.x + 4, left.y - 4);
    }
  }

  ctx.strokeStyle = "rgb(255 255 255 / 0.7)";
  ctx.lineWidth = 3;
  for (let m = 6; m < 76; m += 9) {
    const a = project3D({ x: m, y: 0.04, z: 0 }, view, camera);
    const b = project3D({ x: m + 4, y: 0.04, z: 0 }, view, camera);
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

function drawTarget3D(view, camera) {
  if (activeMission !== "egg") return;
  const targetX = MISSIONS.egg.target;
  const points = [
    { x: targetX - 3, y: 0.08, z: -2.8 },
    { x: targetX + 3, y: 0.08, z: -2.8 },
    { x: targetX + 3, y: 0.08, z: 2.8 },
    { x: targetX - 3, y: 0.08, z: 2.8 },
  ].map((point) => project3D(point, view, camera));
  if (points.some((point) => !point)) return;
  ctx.fillStyle = "rgb(216 102 42 / 0.24)";
  ctx.strokeStyle = "#d8662a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawLaunchMarker3D(view, camera) {
  const point = project3D({ x: 1.1, y: 1.25, z: 0 }, view, camera);
  if (!point) return;
  ctx.fillStyle = "#17202a";
  ctx.beginPath();
  ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "700 12px sans-serif";
  ctx.fillText("投掷点", point.x + 8, point.y - 8);
}

function drawPath3D(view, camera) {
  if (!sim?.path.length) return;
  ctx.lineWidth = 3;
  for (let i = 1; i < sim.path.length; i += 1) {
    const prevPoint = {
      x: sim.path[i - 1].x,
      y: sim.path[i - 1].y,
      z: pathLateralOffset(sim.path[i - 1].x, sim.path[i - 1].y),
    };
    const currentPoint = {
      x: sim.path[i].x,
      y: sim.path[i].y,
      z: pathLateralOffset(sim.path[i].x, sim.path[i].y),
    };
    const prev = project3D(prevPoint, view, camera);
    const current = project3D(currentPoint, view, camera);
    if (!prev || !current) continue;
    ctx.strokeStyle = pathColor(sim.path[i]);
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();
  }
}

function drawVelocityVector3D(view, camera, pose) {
  if (!sim) return;
  const start = project3D({ x: pose.x, y: pose.y, z: pose.z }, view, camera);
  const end = project3D(
    {
      x: pose.x + clamp(sim.vx * 0.22, 1.4, 4),
      y: pose.y + sim.vy * 0.16,
      z: pose.z + environment.crosswind * 0.18,
    },
    view,
    camera,
  );
  if (!start || !end) return;
  ctx.strokeStyle = "#d8662a";
  ctx.fillStyle = "#d8662a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(end.x, end.y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawFoldingPreview3D(view, camera, design, progress) {
  const wingT = clamp((progress - 0.08) / 0.62, 0, 1);
  const noseT = clamp((progress - 0.24) / 0.44, 0, 1);
  const launchT = clamp((progress - 0.82) / 0.18, 0, 1);
  const easedWing = easeInOutCubic(wingT);
  const easedNose = easeInOutCubic(noseT);
  const easedLaunch = easeInOutCubic(launchT);
  const pose = {
    x: lerp(10, 3.2, easedLaunch),
    y: lerp(1.55, 2.3, easedLaunch),
    z: 0,
    pitch: lerp((-16 * Math.PI) / 180, (-7 * Math.PI) / 180, easedLaunch),
    roll: Math.sin(previewTime * 0.9) * 0.08,
  };
  const model = makePlaneModel(design, easedWing, easedNose);
  drawPlaneShadow3D(view, camera, pose, model);
  drawPlaneModel3D(view, camera, pose, model, {
    leftFill: "#fff8dc",
    rightFill: "#f6fbfa",
    tailFill: "#e8f0f1",
    creaseAlpha: 0.82,
    thickness: 0.024,
  });
}

function drawFoldTimeline(view, progress) {
  const x = 18;
  const y = view.height - 118;
  const width = Math.min(260, view.width * 0.38);
  ctx.fillStyle = "rgb(255 255 255 / 0.82)";
  ctx.strokeStyle = "rgb(23 32 42 / 0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, width, 48, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#60707c";
  ctx.font = "700 12px sans-serif";
  ctx.fillText(progress < 0.33 ? "1. 找中线" : progress < 0.72 ? "2. 翻折机翼" : "3. 成型起飞", x + 12, y + 18);
  ctx.fillStyle = "rgb(20 108 148 / 0.18)";
  ctx.fillRect(x + 12, y + 29, width - 24, 7);
  ctx.fillStyle = "#146c94";
  ctx.fillRect(x + 12, y + 29, (width - 24) * progress, 7);
}

function drawPlane3D(view, camera, pose, design) {
  const model = makePlaneModel(design, 1, 1);
  drawPlaneShadow3D(view, camera, pose, model);
  drawPlaneModel3D(view, camera, pose, model, {
    leftFill: "#fbfbf4",
    rightFill: "#eef7f6",
    tailFill: "#dfe9eb",
    creaseAlpha: 0.7,
    thickness: 0.035,
  });

  const body = model.body;
  const cgLocal = { x: -body * 0.72 + (design.centerGravity / 100) * body * 1.5, y: 0.15, z: 0 };
  const cg = project3D(transformPlanePoint(cgLocal, pose), view, camera);
  if (cg) {
    ctx.fillStyle = design.payload ? "#d8662a" : "#146c94";
    ctx.beginPath();
    ctx.arc(cg.x, cg.y, design.payload ? 5 : 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function makePlaneModel(design, foldProgress, noseProgress) {
  const areaScale = clamp(design.wingArea / 125, 0.72, 1.35);
  const span = lerp(1.9 * areaScale, 1.25 * areaScale, foldProgress);
  const body = lerp(1.25, 1.8, noseProgress);
  const finalDihedral = design.wingTip === "dihedral" ? 0.34 : design.wingTip === "winglet" ? 0.16 : 0.08;
  const dihedral = finalDihedral * foldProgress;
  const fold = design.foldAngle / 35;
  return {
    body,
    nose: { x: body, y: 0.04 + 0.06 * noseProgress, z: 0 },
    tail: { x: -body * 0.72, y: -0.05, z: 0 },
    left: { x: lerp(-0.95, -0.35, noseProgress), y: -dihedral, z: -span * (1 + fold * 0.12) },
    right: { x: lerp(-0.95, -0.35, noseProgress), y: -dihedral, z: span * (1 + fold * 0.12) },
    spine: { x: -0.18, y: 0.1 * foldProgress, z: 0 },
    leftInner: { x: -0.52, y: -dihedral * 0.34, z: -span * 0.48 },
    rightInner: { x: -0.52, y: -dihedral * 0.34, z: span * 0.48 },
  };
}

function drawPlaneModel3D(view, camera, pose, model, style) {
  const projected = {};
  Object.entries(model).forEach(([key, point]) => {
    if (typeof point === "object") projected[key] = project3D(transformPlanePoint(point, pose), view, camera);
  });
  if ([projected.nose, projected.left, projected.right, projected.spine, projected.tail].some((point) => !point)) return;

  drawPlaneThickness3D(view, camera, pose, model, style.thickness);
  drawPlaneFace([projected.tail, projected.left, projected.spine], style.tailFill, "#8a969c");
  drawPlaneFace([projected.tail, projected.spine, projected.right], "#d8e5e8", "#8a969c");
  drawPlaneFace([projected.nose, projected.left, projected.spine], style.leftFill, "#73808a");
  drawPlaneFace([projected.nose, projected.spine, projected.right], style.rightFill, "#73808a");

  drawCreaseLine3D(view, camera, pose, model.nose, model.tail, `rgb(23 32 42 / ${style.creaseAlpha})`, 1.6);
  drawCreaseLine3D(view, camera, pose, model.leftInner, model.nose, "rgb(20 108 148 / 0.38)", 1.2);
  drawCreaseLine3D(view, camera, pose, model.rightInner, model.nose, "rgb(20 108 148 / 0.38)", 1.2);
  drawHighlightLine(projected.nose, projected.spine);
}

function drawPlaneShadow3D(view, camera, pose, model) {
  const shadowPose = { ...pose, y: 0.04, pitch: 0, roll: 0 };
  const points = [model.nose, model.right, model.tail, model.left]
    .map((point) => project3D(transformPlanePoint(point, shadowPose), view, camera))
    .filter(Boolean);
  if (points.length < 4) return;
  ctx.fillStyle = "rgb(23 32 42 / 0.16)";
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fill();
}

function drawPlaneThickness3D(view, camera, pose, model, thickness) {
  const edgePairs = [
    ["left", "nose"],
    ["nose", "right"],
    ["left", "tail"],
    ["tail", "right"],
  ];
  edgePairs.forEach(([a, b]) => {
    const lowA = { ...model[a], y: model[a].y - thickness };
    const lowB = { ...model[b], y: model[b].y - thickness };
    const points = [model[a], model[b], lowB, lowA]
      .map((point) => project3D(transformPlanePoint(point, pose), view, camera))
      .filter(Boolean);
    if (points.length === 4) drawPlaneFace(points, "rgb(198 211 214 / 0.86)", "#7f8c91");
  });
}

function drawCreaseLine3D(view, camera, pose, a, b, color, width) {
  const start = project3D(transformPlanePoint(a, pose), view, camera);
  const end = project3D(transformPlanePoint(b, pose), view, camera);
  if (!start || !end) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
}

function drawHighlightLine(a, b) {
  ctx.strokeStyle = "rgb(255 255 255 / 0.72)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function drawPlaneFace(points, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function transformPlanePoint(point, pose) {
  const pitch = pose.pitch;
  const roll = pose.roll;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  const pitched = {
    x: point.x * cp - point.y * sp,
    y: point.x * sp + point.y * cp,
    z: point.z,
  };
  return {
    x: pose.x + pitched.x,
    y: pose.y + pitched.y * cr - pitched.z * sr,
    z: pose.z + pitched.y * sr + pitched.z * cr,
  };
}

function lateralOffset(state) {
  return Math.sin(state.time * 1.4 + environment.gustPhase) * environment.crosswind * (1.15 - state.metrics.stability * 0.45);
}

function pathLateralOffset(x, y) {
  return Math.sin(x * 0.22 + y * 0.35 + environment.gustPhase) * environment.crosswind * 0.45;
}

function rollFromState(state) {
  return clamp(Math.sin(state.time * 2.6 + environment.gustPhase) * (1.15 - state.metrics.stability), -0.55, 0.55);
}

function drawWind3D(view) {
  ctx.fillStyle = "rgb(20 108 148 / 0.72)";
  ctx.font = "700 12px sans-serif";
  ctx.fillText(`侧风 ${environment.crosswind.toFixed(1)} m/s`, view.width - 112, 28);
  ctx.strokeStyle = "rgb(20 108 148 / 0.55)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    const y = 48 + i * 18;
    ctx.beginPath();
    ctx.moveTo(view.width - 112, y);
    ctx.lineTo(view.width - 52, y);
    ctx.stroke();
  }
}

function sub3(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot3(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross3(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function normalize3(v) {
  const length = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

function drawMeasureLines(view) {
  ctx.strokeStyle = "rgb(23 32 42 / 0.18)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgb(23 32 42 / 0.68)";
  ctx.font = "700 12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (let m = 0; m <= 80; m += 5) {
    const p = worldToCanvas(m, 0, view);
    if (p.x > view.width - 12) break;
    const major = m % 10 === 0;
    ctx.beginPath();
    ctx.moveTo(p.x, major ? 34 : view.ground - 18);
    ctx.lineTo(p.x, view.ground + (major ? 16 : 10));
    ctx.stroke();
    if (major) ctx.fillText(`${m}m`, p.x, view.ground + 26);
  }
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

function drawTarget(view) {
  if (activeMission !== "egg") return;
  const target = worldToCanvas(MISSIONS.egg.target, 0, view).x;
  const radius = 3 * view.scale;
  ctx.fillStyle = "rgb(216 102 42 / 0.16)";
  ctx.fillRect(target - radius, view.ground - 10, radius * 2, 16);
  ctx.strokeStyle = "#d8662a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(target, view.ground - 42);
  ctx.lineTo(target, view.ground + 8);
  ctx.stroke();
  ctx.fillStyle = "#8a3c15";
  ctx.font = "700 12px sans-serif";
  ctx.fillText("靶心", target - 13, view.ground - 50);
}

function drawLaunchMarker(view) {
  const point = worldToCanvas(1.1, 1.25, view);
  ctx.fillStyle = "#17202a";
  ctx.beginPath();
  ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgb(23 32 42 / 0.72)";
  ctx.font = "700 12px sans-serif";
  ctx.fillText("投掷点", point.x + 8, point.y - 8);
}

function drawRunway(view) {
  ctx.fillStyle = "#50606a";
  ctx.fillRect(0, view.ground + 8, view.width, 74);
  ctx.fillStyle = "rgb(255 255 255 / 0.85)";
  for (let x = 18; x < view.width; x += 72) {
    ctx.fillRect(x, view.ground + 42, 36, 4);
  }
  ctx.fillStyle = "#2c393f";
  ctx.fillRect(0, view.ground + 4, view.width, 5);
}

function drawPath(view) {
  if (!sim?.path.length) return;
  ctx.lineWidth = 3;
  for (let i = 1; i < sim.path.length; i += 1) {
    const prev = worldToCanvas(sim.path[i - 1].x, sim.path[i - 1].y, view);
    const current = worldToCanvas(sim.path[i].x, sim.path[i].y, view);
    ctx.strokeStyle = pathColor(sim.path[i]);
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();
  }
}

function pathColor(point) {
  if (point.stall > 0.45) return "#b83f37";
  if (point.stability < 0.52) return "#b66a00";
  return "#146c94";
}

function drawVelocityVector(pos, state) {
  const len = clamp(Math.hypot(state.vx, state.vy) * 2.3, 18, 58);
  const angle = Math.atan2(-state.vy, state.vx);
  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(angle);
  ctx.strokeStyle = "#d8662a";
  ctx.fillStyle = "#d8662a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(len, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(len, 0);
  ctx.lineTo(len - 8, -5);
  ctx.lineTo(len - 8, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawWind(view) {
  ctx.fillStyle = "rgb(20 108 148 / 0.72)";
  ctx.font = "700 12px sans-serif";
  ctx.fillText(`侧风 ${environment.crosswind.toFixed(1)} m/s`, view.width - 112, 28);
  ctx.strokeStyle = "rgb(20 108 148 / 0.55)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    const y = 48 + i * 18;
    ctx.beginPath();
    ctx.moveTo(view.width - 112, y);
    ctx.lineTo(view.width - 52, y);
    ctx.stroke();
  }
}

function drawPlane(pos, rotation, d, alpha) {
  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;

  const areaScale = clamp(d.wingArea / 120, 0.75, 1.35);
  const span = 46 * areaScale;
  const body = 72;
  const fold = d.foldAngle / 32;

  ctx.fillStyle = "#fbfbf4";
  ctx.strokeStyle = "#73808a";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(body / 2, 0);
  ctx.lineTo(-body / 2, -span * (0.46 + fold * 0.1));
  ctx.lineTo(-body / 5, 0);
  ctx.lineTo(-body / 2, span * (0.46 + fold * 0.1));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#aab5bb";
  ctx.beginPath();
  ctx.moveTo(body / 2, 0);
  ctx.lineTo(-body / 4, 0);
  ctx.moveTo(-body / 6, 0);
  ctx.lineTo(-body / 2, -span * 0.42);
  ctx.moveTo(-body / 6, 0);
  ctx.lineTo(-body / 2, span * 0.42);
  ctx.stroke();

  if (d.wingTip === "winglet") {
    ctx.strokeStyle = "#d8662a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-body / 2, -span * 0.48);
    ctx.lineTo(-body / 2 + 11, -span * 0.66);
    ctx.moveTo(-body / 2, span * 0.48);
    ctx.lineTo(-body / 2 + 11, span * 0.66);
    ctx.stroke();
  }

  if (d.wingTip === "dihedral") {
    ctx.strokeStyle = "#2f8a54";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-body / 2, -span * 0.48);
    ctx.lineTo(-body / 3, -span * 0.34);
    ctx.moveTo(-body / 2, span * 0.48);
    ctx.lineTo(-body / 3, span * 0.34);
    ctx.stroke();
  }

  const cgX = -body / 2 + (d.centerGravity / 100) * body;
  ctx.fillStyle = d.payload ? "#d8662a" : "#146c94";
  ctx.beginPath();
  ctx.arc(cgX, 0, d.payload ? 5 : 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function animationLoop(now) {
  if (!lastFrame) lastFrame = now;
  const frameTime = Math.min(MAX_ACCUMULATED_TIME, (now - lastFrame) / 1000);
  lastFrame = now;
  previewTime += frameTime;

  if (sim && !sim.done) {
    accumulator += frameTime;
    while (accumulator >= FIXED_STEP) {
      stepSimulation(FIXED_STEP);
      accumulator -= FIXED_STEP;
    }
  }

  updateMetrics();
  drawScene();
  requestAnimationFrame(animationLoop);
}

function ensureAnimationLoop() {
  if (animationStarted) return;
  animationStarted = true;
  requestAnimationFrame(animationLoop);
}

function startFoldPreview() {
  sim = null;
  accumulator = 0;
  foldPreview = {
    startedAt: performance.now(),
    duration: 2600,
  };
  setViewMode("3d");
  labels.score.textContent = "折叠预览";
  labels.feedback.textContent = "正在预览纸面沿中线、翼面折线和机头折线翻折成型的过程。";
  announce("开始播放折叠预览");
  ensureAnimationLoop();
}

function getFoldPreviewProgress() {
  if (!foldPreview) return 1;
  const elapsed = performance.now() - foldPreview.startedAt;
  const progress = clamp(elapsed / foldPreview.duration, 0, 1);
  if (progress >= 1) foldPreview = null;
  return easeInOutCubic(progress);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function setViewMode(mode) {
  viewMode = mode;
  canvasWrap.classList.toggle("is-3d", mode === "3d");
  viewButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === mode));
  drawScene();
}

function resetCamera() {
  cameraOrbit.yaw = -0.88;
  cameraOrbit.pitch = 0.3;
  cameraOrbit.distance = 18;
  cameraOrbit.userMoved = false;
  drawScene();
}

function setSideTab(tab) {
  activeSideTab = tab;
  sideTabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.sideTab === tab);
  });
  sidePanels.forEach((panel) => {
    panel.hidden = panel.dataset.sidePanel !== tab;
  });
}

function openGuide(startIndex = 0) {
  guideIndex = startIndex;
  labels.guideOverlay.hidden = false;
  renderGuide();
}

function closeGuide(markSeen = true) {
  labels.guideOverlay.hidden = true;
  if (markSeen) localStorage.setItem(GUIDE_STORAGE_KEY, "1");
}

function renderGuide() {
  const step = GUIDE_STEPS[guideIndex];
  labels.guideEyebrow.textContent = `第 ${guideIndex + 1} 步 / ${GUIDE_STEPS.length}`;
  labels.guideTitle.textContent = step.title;
  labels.guideText.textContent = step.text;
  guideDots.forEach((dot, index) => dot.classList.toggle("active", index === guideIndex));
  guidePrevButton.disabled = guideIndex === 0;
  guideNextButton.textContent = guideIndex === GUIDE_STEPS.length - 1 ? "完成" : "下一步";
  setSideTab(step.tab);
  setViewMode(step.view);
}

function nextGuideStep() {
  if (guideIndex >= GUIDE_STEPS.length - 1) {
    closeGuide(true);
    return;
  }
  guideIndex += 1;
  renderGuide();
}

function previousGuideStep() {
  guideIndex = Math.max(0, guideIndex - 1);
  renderGuide();
}

function onCanvasPointerDown(event) {
  if (viewMode !== "3d") return;
  cameraOrbit.dragging = true;
  cameraOrbit.mode = event.shiftKey || event.button === 1 || event.button === 2 ? "pan" : "orbit";
  cameraOrbit.lastX = event.clientX;
  cameraOrbit.lastY = event.clientY;
  cameraOrbit.userMoved = true;
  canvas.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function onCanvasPointerMove(event) {
  if (viewMode !== "3d" || !cameraOrbit.dragging) return;
  const dx = event.clientX - cameraOrbit.lastX;
  const dy = event.clientY - cameraOrbit.lastY;
  cameraOrbit.lastX = event.clientX;
  cameraOrbit.lastY = event.clientY;

  if (cameraOrbit.mode === "pan") {
    panCamera(dx, dy);
  } else {
    cameraOrbit.yaw -= dx * 0.006;
    cameraOrbit.pitch = clamp(cameraOrbit.pitch + dy * 0.0048, -0.18, 1.18);
  }
  drawScene();
  event.preventDefault();
}

function onCanvasPointerUp(event) {
  if (!cameraOrbit.dragging) return;
  cameraOrbit.dragging = false;
  canvas.releasePointerCapture?.(event.pointerId);
}

function onCanvasWheel(event) {
  if (viewMode !== "3d") return;
  cameraOrbit.distance = clamp(cameraOrbit.distance * (1 + event.deltaY * 0.0012), 7, 34);
  cameraOrbit.userMoved = true;
  drawScene();
  event.preventDefault();
}

function onCanvasDoubleClick(event) {
  if (viewMode !== "3d") return;
  resetCamera();
  event.preventDefault();
}

function panCamera(dx, dy) {
  const camera = createCamera(getView());
  const scale = cameraOrbit.distance / Math.max(260, viewSize.cssWidth);
  cameraOrbit.target.x += (-camera.right.x * dx + camera.up.x * dy) * scale;
  cameraOrbit.target.y += (-camera.right.y * dx + camera.up.y * dy) * scale;
  cameraOrbit.target.z += (-camera.right.z * dx + camera.up.z * dy) * scale;
  cameraOrbit.target.x = clamp(cameraOrbit.target.x, -4, 70);
  cameraOrbit.target.y = clamp(cameraOrbit.target.y, 0.4, 8);
  cameraOrbit.target.z = clamp(cameraOrbit.target.z, -18, 18);
}

function syncControlFromNumber(key) {
  const range = controls[key];
  const input = numberInputs[key];
  const value = clamp(Number(input.value), Number(range.min), Number(range.max));
  range.value = value;
  input.value = value;
  setCustomFold();
  if (!sim || sim.done) updateLabels();
}

function nudgeNumberInput(input, direction) {
  const step = Number(input.step || 1);
  input.value = Number(input.value) + direction * step;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

missionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeMission = button.dataset.mission;
    missionButtons.forEach((item) => item.classList.toggle("active", item === button));
    resetSimulation();
    updateLabels();
  });
});

foldButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyFoldPreset(button.dataset.fold);
    startFoldPreview();
  });
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => setViewMode(button.dataset.view));
});

sideTabButtons.forEach((button) => {
  button.addEventListener("click", () => setSideTab(button.dataset.sideTab));
});

canvas.addEventListener("pointerdown", onCanvasPointerDown);
canvas.addEventListener("pointermove", onCanvasPointerMove);
canvas.addEventListener("pointerup", onCanvasPointerUp);
canvas.addEventListener("pointercancel", onCanvasPointerUp);
canvas.addEventListener("wheel", onCanvasWheel, { passive: false });
canvas.addEventListener("dblclick", onCanvasDoubleClick);
canvas.addEventListener("contextmenu", (event) => {
  if (viewMode === "3d") event.preventDefault();
});

Object.entries(controls).forEach(([key, control]) => {
  control.addEventListener("input", () => {
    if (numberInputs[key]) {
      numberInputs[key].value = control.value;
      setCustomFold();
    }
    if (key === "payload") setCustomFold();
    if (!sim || sim.done) updateLabels();
  });
});

Object.entries(numberInputs).forEach(([key, input]) => {
  input.addEventListener("change", () => syncControlFromNumber(key));
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      nudgeNumberInput(input, event.shiftKey ? 5 : 1);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      nudgeNumberInput(input, event.shiftKey ? -5 : -1);
    }
  });
});

wingTipInputs.forEach((input) =>
  input.addEventListener("change", () => {
    setCustomFold();
    updateLabels();
  }),
);
launchButton.addEventListener("click", startSimulation);
resetButton.addEventListener("click", resetSimulation);
randomPresetButton.addEventListener("click", applyRandomPreset);
savePresetButton.addEventListener("click", savePreset);
loadPresetButton.addEventListener("click", loadPreset);
foldPreviewButton.addEventListener("click", startFoldPreview);
saveSlotAButton.addEventListener("click", () => saveCompareSlot("A"));
saveSlotBButton.addEventListener("click", () => saveCompareSlot("B"));
runCompareButton.addEventListener("click", runCompare);
guideOpenButton.addEventListener("click", () => openGuide(0));
guideSkipButton.addEventListener("click", () => closeGuide(true));
guideNextButton.addEventListener("click", nextGuideStep);
guidePrevButton.addEventListener("click", previousGuideStep);
labels.guideOverlay.addEventListener("click", (event) => {
  if (event.target === labels.guideOverlay) closeGuide(true);
});
window.addEventListener("keydown", (event) => {
  if (labels.guideOverlay.hidden) return;
  if (event.key === "Escape") closeGuide(true);
  if (event.key === "ArrowRight") nextGuideStep();
  if (event.key === "ArrowLeft") previousGuideStep();
});

if (typeof window.ResizeObserver === "function") {
  new window.ResizeObserver(resizeCanvas).observe(canvasWrap);
} else {
  window.addEventListener("resize", resizeCanvas);
}

resizeCanvas();
applyFoldPreset("dart");
setSideTab(activeSideTab);
renderScores();
if (!localStorage.getItem(GUIDE_STORAGE_KEY)) openGuide(0);
ensureAnimationLoop();
