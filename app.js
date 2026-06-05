let retreatDates = [];
let retreatConfig = null;
let mealSchedule = [];
let churchFamilyDb = [];

const normalizeName = (str) => String(str || "").replace(/\s+/g, "").replace(/\((온|오프|온라인|오프라인)\)/g, "");

const slots = ["08:00", "12:00", "18:00", "22:00"];
const categories = [
  { key: "adult", label: "장년부", color: "#1e5a45" },
  { key: "youth", label: "중·고등/대학부", color: "#6c9ecf" },
  { key: "elementary", label: "초등부", color: "#e3bf62" },
  { key: "preschool", label: "유치부 이하", color: "#d9879f" },
];

const attendanceSeries = [
  [
    { time: "08:00", adult: 39, youth: 9, elementary: 8, preschool: 6 },
    { time: "12:00", adult: 145, youth: 34, elementary: 31, preschool: 22 },
    { time: "18:00", adult: 197, youth: 49, elementary: 42, preschool: 30 },
    { time: "22:00", adult: 214, youth: 54, elementary: 47, preschool: 33 },
  ],
  [
    { time: "08:00", adult: 214, youth: 54, elementary: 47, preschool: 33 },
    { time: "12:00", adult: 230, youth: 59, elementary: 51, preschool: 35 },
    { time: "18:00", adult: 257, youth: 64, elementary: 56, preschool: 38 },
    { time: "22:00", adult: 266, youth: 66, elementary: 58, preschool: 39 },
  ],
  [
    { time: "08:00", adult: 264, youth: 66, elementary: 58, preschool: 39 },
    { time: "12:00", adult: 279, youth: 69, elementary: 62, preschool: 41 },
    { time: "18:00", adult: 273, youth: 68, elementary: 61, preschool: 40 },
    { time: "22:00", adult: 267, youth: 67, elementary: 59, preschool: 38 },
  ],
  [
    { time: "08:00", adult: 263, youth: 66, elementary: 58, preschool: 38 },
    { time: "12:00", adult: 254, youth: 62, elementary: 54, preschool: 36 },
    { time: "18:00", adult: 45, youth: 7, elementary: 5, preschool: 3 },
    { time: "22:00", adult: 0, youth: 0, elementary: 0, preschool: 0 },
  ],
];
let attendance = {};

// TODO: Supabase 대시보드에서 Project URL과 API Key를 확인하여 아래에 입력하세요.
const SUPABASE_URL = "https://tjwdxytyzndfnvqboryr.supabase.co";
const SUPABASE_KEY = "sb_publishable_syIASoSn0ogksocj5Pnpvg_DupHv4cG";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

let families = [];
let currentOrgMode = "family";
let orgActiveFilter = "all";
let selectedOrgTimeSlot = null;
let selectedSchoolTimeSlot = null;
let selectedSchoolDeptFilter = "all";

const sisterGroupsData = [
  { id: "1조", leader: "장세연", members: ["최찬미", "정래윤", "원지희", "이주영"] },
  { id: "2조", leader: "장혜연", members: ["황두리", "오혜수", "송하빈", "이지은B"] },
  { id: "3조", leader: "김미현", members: ["김선영", "이은솜", "박혜원", "김성현"] },
  { id: "4조", leader: "신영미", members: ["강보민", "심은경", "송은비", "임향희"] },
  { id: "5조", leader: "김현실", members: ["김메어리", "현재륜", "김은혜B", "김혜수"] },
  { id: "6조", leader: "윤선욱", members: ["명인애", "왕소정", "유진희", "김예린"] },
  { id: "7조", leader: "임정은", members: ["우수정", "한수련", "김소연", "이정현"] },
  { id: "8조", leader: "배유리", members: ["안유선", "허설", "김수민", "김민희A", "김다혜"] },
  { id: "9조", leader: "윤진욱", members: ["조은영", "정재현", "이다님", "이세희"] },
  { id: "10조", leader: "조봄이와", members: ["이유라", "황예지", "최은주"] },
  { id: "11조", leader: "이지은A", members: ["조샘이나", "구다솜", "김민지", "조현정"] },
  { id: "12조", leader: "김민희B", members: ["신민아", "김혜정", "강미정", "서재희"] },
  { id: "13조", leader: "김유선", members: ["강주영", "성경선", "김지나", "한경미"] },
  { id: "14조", leader: "유혜영", members: ["임선우", "박효진", "이은주", "이조아"] },
  { id: "15조", leader: "김태희", members: ["유재은", "이정숙", "김상미"] },
  { id: "16조", leader: "이은혜", members: ["손수정", "김정원", "김민경", "샤오보"] },
  { id: "17조", leader: "이세라", members: ["양은정", "현지윤", "한수지", "심후성"] },
  { id: "18조", leader: "김화정", members: ["안유진", "조현자", "박은영A", "이효심"] },
  { id: "19조", leader: "윤영경", members: ["서윤진", "신명주", "박은영B", "허영은"] },
  { id: "20조", leader: "이희승", members: ["조순영", "김현주", "부수정", "정미선", "문경화"] },
  { id: "21조", leader: "최정희", members: ["조미선", "박소영", "박금화", "오진경"] },
  { id: "22조", leader: "박금향", members: ["신선화", "김은혜A", "이주연", "나하나"] },
  { id: "23조", leader: "김주선", members: ["이근실", "지명덕", "조미애", "유성애"] },
  { id: "24조", leader: "김상배", members: ["유현진", "김소희", "이보경"] },
];

const sisterStaffData = {
  coordinators: [
    { name: "장세연", role: "장년 1부 코디" },
    { name: "김상배", role: "장년 2-3부 코디" },
  ],
  otherGroups: ["신영화", "김경원", "조은미", "차윤"],
};

const brotherGroupsData = [
  { id: "1조", leader: "백승지", members: ["박긍훌", "최재혁", "김현준", "김동만"] },
  { id: "2조", leader: "이충희", members: ["서지영", "구성현", "김진영", "곽건탁"] },
  { id: "3조", leader: "강현민", members: ["김준표", "권대호", "심규영"] },
  { id: "4조", leader: "정민규", members: ["백성민", "최윤석", "조대운", "남동우"] },
  { id: "5조", leader: "윤민혁", members: ["이순환", "권혁용", "한대연"] },
  { id: "6조", leader: "박영재", members: ["장세명", "황동훈", "송종률", "이석호"] },
  { id: "7조", leader: "이재길", members: ["박준석", "박보민", "박지훈", "도준영", "조화평"] },
  { id: "8조", leader: "김경천", members: ["오성택", "김수호", "박명철", "이재오"] },
  { id: "9조", leader: "김응도", members: ["정영석", "김태원", "김하람", "한현호"] },
  { id: "10조", leader: "김태준", members: ["김영준", "박진우", "한상혁", "김찬희"] },
  { id: "11조", leader: "김보근", members: ["박은총", "조재화", "안동영", "변해균", "박현재"] },
  { id: "12조", leader: "김세원", members: ["김윤수", "정현석", "박상현", "최정호"] },
  { id: "13조", leader: "최준희", members: ["김용진", "조원기", "김동철", "이찬우"] },
  { id: "14조", leader: "이재호", members: ["윤정훈", "정연수", "김성일", "이조아"] },
  { id: "15조", leader: "이상혁", members: ["김호균", "김태수", "이상민", "여인설", "구완준"] },
  { id: "16조", leader: "이우근", members: ["김범준", "박동현", "이주호", "유제현"] },
  { id: "17조", leader: "장두상", members: ["권성대", "전만기", "선우강"] },
  { id: "18조", leader: "박성영", members: ["박윤환", "정상혁", "이동엽", "이진희", "정성안"] },
  { id: "19조", leader: "신원수", members: ["이정욱", "김우람", "이호준"] },
  { id: "20조", leader: "최종범", members: ["정환혁", "정재순", "주찬영", "조진웅"] },
  { id: "21조", leader: "이재민", members: ["김현명", "김상훈", "김성현", "김명식", "정현민"] },
  { id: "22조", leader: "김흥규", members: ["김상옥", "유성애", "김주선", "이근실", "이민강"] },
  { id: "23조", leader: "전영진", members: ["서정영", "이경하", "손영준"] },
];

const brotherStaffData = {
  coordinators: [
    { name: "나진정", role: "타부서 조장" },
  ],
  otherGroups: ["강우석", "박태곤", "장현빈", "112", "남정완", "최민택", "임준호"],
};

const statusMap = {
  stay: ["입소 완료", "stay"],
  late: ["입소 예정", "late"],
  leave: ["퇴소 완료", "leave"],
  absent: ["전체 불참", "absent"],
  undecided: ["미정", "undecided"],
};

let selectedDate = "";
let selectedSlot = 2;
let activeFilter = "all";
let toastTimer;
let newMemberId = 0;
let dateDrag = null;
let editingFamilyId = null;

const childGroups = ["대학부", "중고등부", "초등부", "유년부", "유치부", "유아"];
const attendancePeriods = [
  { key: "breakfast", label: "아" },
  { key: "lunch", label: "점" },
  { key: "dinner", label: "저" },
];
let dateLabels = [];

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
const scalar = (text, key) => text.match(new RegExp(`^  ${key}:\\s*"([^"]*)"`, "m"))?.[1] || "";

function buildRetreatDates(startText, endText) {
  const start = new Date(`${startText.slice(0, 10)}T00:00:00`);
  const end = new Date(`${endText.slice(0, 10)}T00:00:00`);
  const dates = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = new Date(cursor);
    const month = date.getMonth() + 1;
    const dayOfMonth = date.getDate();
    dates.push({
      key: `${String(month).padStart(2, "0")}-${String(dayOfMonth).padStart(2, "0")}`,
      day: weekdays[date.getDay()],
      date: String(dayOfMonth),
      label: `${month}월 ${dayOfMonth}일 ${weekdays[date.getDay()]}요일`,
      shortLabel: `${month}/${dayOfMonth}`,
    });
  }
  return dates;
}

async function loadRetreatConfig() {
  const response = await fetch("./retreat-config.md", { cache: "no-store" });
  if (!response.ok) throw new Error("retreat-config.md를 불러오지 못했습니다.");
  const source = await response.text();
  const config = {
    title: scalar(source, "title"),
    director: scalar(source, "director"),
    location: scalar(source, "location"),
    start: scalar(source, "start"),
    end: scalar(source, "end"),
    meals: [...source.matchAll(/    - id: "([^"]+)"\n      label: "([^"]+)"\n      time: "([^"]+)"/g)]
      .map(([, id, label, time]) => ({ id, label, time })),
  };
  if (!config.start || !config.end) throw new Error("수련회 시작일과 종료일을 확인해주세요.");
  return config;
}

async function loadChurchFamilyDb() {
  try {
    const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTvEv3hLR_C_aslvs0F17EO5RpBFYrd9dzfTH7r7gGgpau7gd92o8v_JkYBWJy7v7_dhyAEO_SP-FzJ/pub?output=csv";
    const res = await fetch(SHEET_CSV_URL);
    if (res.ok) {
      const csvText = await res.text();
      const rows = csvText.split("\n").filter(row => row.trim());
      const headers = rows[0].split(",").map(h => h.trim());
      churchFamilyDb = rows.slice(1).map(row => {
        const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, "").trim());
        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i] || "");
        return obj;
      });
      console.log("교회 전체 명단 로드 완료 (직접 호출)", churchFamilyDb);
    }
  } catch (e) {
    console.error("명단 연동 에러:", e);
  }
}

async function loadFamiliesFromSupabase() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient.from("families").select("*");
    if (error) throw error;
    if (data) {
      families = data.map((family) => {
        if (family.members) {
          family.members = family.members.map((member) => {
            if (member[1] === "고등부" || member[1] === "중등부") {
              member[1] = "중고등부";
            }
            return member;
          });
        }
        
        family.fee = 0;
        family.feeStatus = "pending";
        family.room = "미배정";
        
        if (family.memo && family.memo.includes("__FEE_INFO__:")) {
          const parts = family.memo.split("__FEE_INFO__:");
          const rawMemo = parts[0].trim();
          family.memo = rawMemo === "" ? "별도 메모 없음" : rawMemo;
          try {
            const info = JSON.parse(parts[1]);
            family.fee = info.fee || 0;
            family.feeStatus = info.feeStatus || "pending";
            family.room = info.room || "미배정";
          } catch (e) {
            console.error("FEE_INFO 파싱 에러:", e);
          }
        }
        return family;
      });
      console.log("Supabase 가족 데이터 로드 완료", families);
    }
  } catch (e) {
    console.error("Supabase 데이터 로드 에러:", e);
  }
}

function applyRetreatConfig(config) {
  retreatConfig = config;
  retreatDates = buildRetreatDates(config.start, config.end);
  dateLabels = retreatDates.map((date) => date.shortLabel);
  attendance = Object.fromEntries(retreatDates.map((date, index) => [date.key, attendanceSeries[index] || attendanceSeries.at(-1)]));
  selectedDate = retreatDates[0].key;
  mealSchedule = config.meals;
  const start = retreatDates[0];
  const end = retreatDates.at(-1);
  const nights = Math.max(0, retreatDates.length - 1);
  document.querySelector("#retreatTitle").textContent = config.title;
  document.querySelector("#retreatMeta").textContent = `${start.label.replace("요일", "")} - ${end.label.replace("요일", "")} · ${nights}박 ${retreatDates.length}일 · ${config.location}`;
  const directorEl = document.querySelector("#directorName");
  if (directorEl) {
    directorEl.textContent = config.director;
  }
  document.querySelector("#memberDateHeading").innerHTML = retreatDates.map((date) => `<span>${date.shortLabel}<small>${date.day}</small></span>`).join("");
  document.querySelector("#mealRetreatTitle").textContent = config.title;
  document.querySelector("#mealRetreatMeta").textContent = `${config.location} · ${retreatDates[0].shortLabel} 점심부터 ${retreatDates.at(-1).shortLabel} 아침까지`;
}

const total = (record) => categories.reduce((sum, category) => sum + record[category.key], 0);
const currentRecord = () => attendance[selectedDate][selectedSlot];

function renderDateTabs() {
  document.querySelector("#dateTabs").innerHTML = retreatDates.map((date) => `
    <button class="date-tab ${date.key === selectedDate ? "active" : ""}" data-date="${date.key}">
      <span>${date.day}요일</span><b>${date.date}</b>
    </button>`).join("");
}

function renderStats() {
  const data = attendance[selectedDate];
  const record = currentRecord();
  const peak = Math.max(...data.map(total));
  
  const targetDateStr = selectedDate;
  const [targetMonth, targetDay] = targetDateStr.split("-").map(Number);
  const targetYear = Number(retreatConfig.start.slice(0, 4));
  const slotTimeStr = slots[selectedSlot];
  const slotDateTime = parseMemberDate(`${targetMonth}/${targetDay} ${slotTimeStr}`);
  
  let currentExpected = 0;
  let currentActual = 0;
  
  let enterExpected = 0;
  let enterActual = 0;
  let lateArrivals = 0;
  
  let exitExpected = 0;
  let exitActual = 0;
  
  if (families && families.length) {
    families.forEach((family) => {
      if (family.status === "absent") return;
      
      family.members.forEach((member) => {
        if (!member[2] || !member[3]) return;
        const arrival = parseMemberDate(member[2]);
        const departure = parseMemberDate(member[3]);
        
        // A. 현재 참석 인원 판별
        if (arrival <= slotDateTime && slotDateTime < departure) {
          currentExpected++;
          if (family.status === "stay") {
            currentActual++;
          }
        }
        
        // B. 오늘 입소 예정 판별
        const arrivalDateStr = String(arrival.getMonth() + 1).padStart(2, "0") + "-" + 
          String(arrival.getDate()).padStart(2, "0");
          
        if (arrivalDateStr === targetDateStr) {
          enterExpected++;
          if (arrival.getHours() >= 18) {
            lateArrivals++;
          }
          if (family.status === "stay") {
            enterActual++;
          }
        }
        
        // C. 오늘 퇴소 예정 판별
        const departureDateStr = String(departure.getMonth() + 1).padStart(2, "0") + "-" + 
          String(departure.getDate()).padStart(2, "0");
          
        if (departureDateStr === targetDateStr) {
          exitExpected++;
          if (family.status === "leave") {
            exitActual++;
          }
        }
      });
    });
  }
  
  const getPercentStr = (actual, expected) => {
    if (expected === 0) return "0.0";
    return ((actual / expected) * 100).toFixed(1);
  };
  
  const enterCaption = enterExpected === 0 
    ? "입소 예정인 구성원 없음" 
    : (lateArrivals > 0 ? `오후 6시 이후 입소: ${lateArrivals}명 포함` : "일정표에 따른 입소 완료 예정");
    
  const exitCaption = exitExpected === 0 
    ? "퇴소 예정인 구성원 없음" 
    : "일정표에 따른 퇴소 완료 예정";

  const stats = [
    {
      label: "현재 참석 인원",
      actual: currentActual,
      expected: currentExpected,
      percent: getPercentStr(currentActual, currentExpected),
      caption: `선택 시간 ${record.time}`,
      icon: "user-check",
      isRatio: true
    },
    {
      label: "오늘 입소 예정",
      actual: enterActual,
      expected: enterExpected,
      percent: getPercentStr(enterActual, enterExpected),
      caption: enterCaption,
      icon: "log-in",
      isRatio: true
    },
    {
      label: "오늘 퇴소 예정",
      actual: exitActual,
      expected: exitExpected,
      percent: getPercentStr(exitActual, exitExpected),
      caption: exitCaption,
      icon: "log-out",
      isRatio: true
    },
    {
      label: "오늘 최대 인원",
      value: peak,
      unit: "명",
      caption: `${data.find((item) => total(item) === peak).time} 예상`,
      icon: "trending-up",
      isRatio: false
    }
  ];
  
  document.querySelector("#statsGrid").innerHTML = stats.map((item) => {
    if (item.isRatio) {
      return `
        <article class="stat-card">
          <div class="stat-top">
            <span>${item.label}</span>
            <span class="stat-icon"><i data-lucide="${item.icon}"></i></span>
          </div>
          <div>
            <div class="stat-value">
              <span style="color: var(--forest); font-weight: 800;">${item.actual}</span><span style="color: #bbb; font-weight: 500; font-size: 24px;"> / ${item.expected}</span><small style="font-size: 13px; font-weight: 600; color: var(--gold); margin-left: 4px; letter-spacing: 0;">(${item.percent}%)</small>
            </div>
            <span class="stat-caption">${item.caption}</span>
          </div>
        </article>
      `;
    } else {
      return `
        <article class="stat-card">
          <div class="stat-top">
            <span>${item.label}</span>
            <span class="stat-icon"><i data-lucide="${item.icon}"></i></span>
          </div>
          <div>
            <div class="stat-value">
              <span style="font-weight: 800; color: var(--ink);">${item.value}</span><small style="font-size: 14px; font-weight: 500; color: var(--muted); margin-left: 2px;">${item.unit}</small>
            </div>
            <span class="stat-caption">${item.caption}</span>
          </div>
        </article>
      `;
    }
  }).join("");
}

function renderFlowChart() {
  const data = attendance[selectedDate];
  const svg = document.querySelector("#flowChart");
  const width = 760;
  const height = 190;
  const left = 38;
  const right = 18;
  const top = 14;
  const bottom = 28;
  const max = 450;
  const x = (index) => left + index * ((width - left - right) / (data.length - 1));
  const y = (value) => top + (height - top - bottom) * (1 - value / max);
  const points = data.map((item, index) => `${x(index)},${y(total(item))}`).join(" ");
  const area = `${left},${height - bottom} ${points} ${x(data.length - 1)},${height - bottom}`;
  
  const defs = `
    <defs>
      <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#184E3A" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#184E3A" stop-opacity="0.01" />
      </linearGradient>
    </defs>
  `;
  
  const grid = [0, 150, 300, 450].map((value) => `
    <line x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}" stroke="var(--soft-line)" stroke-dasharray="3 3" />
    <text x="0" y="${y(value) + 4}" fill="#93a099" font-size="10" font-weight="500">${value}</text>`).join("");
  
  const labels = data.map((item, index) => `
    <text x="${x(index)}" y="${height - 7}" text-anchor="middle" fill="#819088" font-size="10" font-weight="500">${item.time}</text>`).join("");
  
  const dots = data.map((item, index) => `
    <circle cx="${x(index)}" cy="${y(total(item))}" r="${index === selectedSlot ? 6 : 4}" fill="${index === selectedSlot ? "#D6A94E" : "#184E3A"}" stroke="white" stroke-width="2.5" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));" />
    ${index === selectedSlot ? `<rect x="${x(index) - 23}" y="${y(total(item)) - 34}" width="46" height="21" rx="6" fill="#184E3A" /><text x="${x(index)}" y="${y(total(item)) - 20}" text-anchor="middle" fill="white" font-size="10" font-weight="700">${total(item)}명</text>` : ""}`).join("");
  
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML = `
    ${defs}
    ${grid}
    <polygon points="${area}" fill="url(#chartAreaGrad)" />
    <polyline points="${points}" fill="none" stroke="#184E3A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    ${dots}${labels}`;
}

function renderTimeSelector() {
  document.querySelector("#timeSelector").innerHTML = slots.map((slot, index) => `
    <button class="time-chip ${index === selectedSlot ? "active" : ""}" data-slot="${index}">${slot}</button>`).join("");
}

function renderBreakdown() {
  const record = currentRecord();
  const count = total(record);
  let offset = 0;
  const softColors = {
    adult: "#184E3A",       // Deep Forest
    youth: "#5F8B77",       // Medium Forest Sage
    elementary: "#9ABFB0",  // Sage
    preschool: "#DDE8E1"    // Soft Sage Cream
  };
  const gradients = categories.map((category) => {
    const start = offset;
    offset += record[category.key] / count * 100 || 0;
    const color = softColors[category.key] || category.color;
    return `${color} ${start}% ${offset}%`;
  });
  document.querySelector("#donutChart").style.background = `conic-gradient(${gradients.join(",")})`;
  document.querySelector("#donutTotal").textContent = count;
  document.querySelector("#breakdownTime").textContent = `${retreatDates.find((date) => date.key === selectedDate).label.replace("요일", "")} ${record.time} 기준`;
  document.querySelector("#breakdownList").innerHTML = categories.map((category) => {
    const color = softColors[category.key] || category.color;
    return `<div class="breakdown-item"><i style="background:${color}"></i><span>${category.label}</span><b>${record[category.key]}명</b></div>`;
  }).join("");
}

function getFilteredFamilies() {
  const keyword = document.querySelector("#searchInput").value.trim().toLowerCase();
  return families.filter((family) => {
    if (family.status === "absent") return false;
    const isUndecidedFamily = family.status === "undecided" || family.members.some(member => member[7] === "undecided");
    const status = getFamilyAttendanceStatus(family);
    
    let filterMatches = false;
    if (activeFilter === "all") {
      filterMatches = true;
    } else if (activeFilter === "attending") {
      filterMatches = (status === "full" || status === "partial") && !isUndecidedFamily;
    } else if (activeFilter === "full") {
      filterMatches = (status === "full") && !isUndecidedFamily;
    } else if (activeFilter === "partial") {
      filterMatches = (status === "partial") && !isUndecidedFamily;
    } else if (activeFilter === "undecided") {
      filterMatches = isUndecidedFamily;
    }
    
    const keywordMatches = !keyword || [family.name, family.leader, family.memo, ...family.members.flat()].join(" ").toLowerCase().includes(keyword);
    return filterMatches && keywordMatches;
  });
}

function getMemberAttendancePeriods(member) {
  if (member[7] === "undecided") return [];
  if (member[5]) return member[5];
  if (!member[2] || !member[3]) return [];
  const arrival = parseMemberDate(member[2]);
  const departure = parseMemberDate(member[3]);
  return getAvailableAttendancePeriods().filter((periodKey) => {
    const [date, period] = periodKey.split("-");
    const hours = { breakfast: "08:00", lunch: "12:00", dinner: "18:00" };
    const periodTime = parseMemberDate(`${date} ${hours[period]}`);
    return arrival <= periodTime && departure > periodTime;
  });
}

function getMemberExternalMealPeriods(member) {
  return member[6] || [];
}

function getMemberChargeableMealPeriods(member) {
  const externalMeals = getMemberExternalMealPeriods(member);
  return getMemberAttendancePeriods(member).filter((period) => !externalMeals.includes(period));
}

function isMemberFullAttendance(member) {
  const memberPeriods = getMemberAttendancePeriods(member);
  if (memberPeriods.length === 0) return false;
  
  const availablePeriods = getAvailableAttendancePeriods();
  return retreatDates.every((date) => {
    const dayPeriodKeys = attendancePeriods
      .map((period) => `${date.shortLabel}-${period.key}`)
      .filter((periodKey) => availablePeriods.includes(periodKey));
      
    if (dayPeriodKeys.length === 0) return true;
    return dayPeriodKeys.some((periodKey) => memberPeriods.includes(periodKey));
  });
}

function getFamilyAttendanceStatus(family) {
  if (family.status === "absent") {
    return "absent";
  }
  
  // 실제 참석 확정자가 한 명이라도 있는지 확인
  const hasAttendingMember = family.members.some(member => {
    const isUndecided = member[7] === "undecided";
    const periods = getMemberAttendancePeriods(member);
    return !isUndecided && periods.length > 0;
  });
  
  // 미정 상태인 멤버가 한 명이라도 있는지 확인
  const hasUndecidedMember = family.members.some(member => member[7] === "undecided");
  
  // 실제 참석자는 없는데 미정 멤버가 있다면 가족 전체는 "미정"
  if (family.status === "undecided" || (!hasAttendingMember && hasUndecidedMember)) {
    return "undecided";
  }
  
  // 실제 참석자도 없고 미정자도 없다면(모두 불참) "불참"
  if (!hasAttendingMember && !hasUndecidedMember) {
    return "absent";
  }
  
  const hasFullMember = family.members.some((member) => isMemberFullAttendance(member));
  return hasFullMember ? "full" : "partial";
}

function renderDaySquares(periods, externalMeals = [], titlePrefix = "", isUndecided = false) {
  const availablePeriods = getAvailableAttendancePeriods();
  return retreatDates.map((date) => {
    const dayPeriodKeys = attendancePeriods.map((period) => `${date.shortLabel}-${period.key}`);
    const availableDayPeriods = dayPeriodKeys.filter((periodKey) => availablePeriods.includes(periodKey));
    const hasExternalMeal = availableDayPeriods.some((periodKey) => externalMeals.includes(periodKey));
    const isFullDay = availableDayPeriods.length && !hasExternalMeal && availableDayPeriods.every((periodKey) => periods.includes(periodKey));
    const isEmptyDay = availableDayPeriods.length && availableDayPeriods.every((periodKey) => !periods.includes(periodKey));
    if (isUndecided) {
      return `<span class="family-day-square" title="${titlePrefix}${date.shortLabel} · 미정"><b>${date.date}</b><span class="family-undecided-day">미정</span></span>`;
    }
    if (isFullDay) {
      return `<span class="family-day-square full-day" title="${titlePrefix}${date.shortLabel} · 전체 참석"><b>${date.date}</b><span class="family-full-day">참석</span></span>`;
    }
    if (isEmptyDay) {
      return `<span class="family-day-square empty-day" title="${titlePrefix}${date.shortLabel} · 전체 불참"><b>${date.date}</b><span class="family-empty-day">불참</span></span>`;
    }
    const segments = attendancePeriods.map((period) => {
      const periodKey = `${date.shortLabel}-${period.key}`;
      const available = availablePeriods.includes(periodKey);
      const selected = periods.includes(periodKey);
      const externalMeal = externalMeals.includes(periodKey);
      const state = !available ? "unavailable" : externalMeal ? "external-meal" : selected ? "selected" : "empty";
      const description = externalMeal ? "외부 식사 후 참석" : selected ? "참석 및 식사" : available ? "불참" : "일정 없음";
      return `<span class="family-day-segment ${state}" title="${titlePrefix}${date.shortLabel} ${period.label} · ${description}">${period.label}</span>`;
    }).join("");
    return `<span class="family-day-square"><b>${date.date}</b><span class="family-day-segments">${segments}</span></span>`;
  }).join("");
}

function renderFamilyAttendance(family) {
  const status = getFamilyAttendanceStatus(family);
  let statusLabel = "부분참석";
  if (status === "full") statusLabel = "풀참";
  else if (status === "undecided") statusLabel = "미정";

  const attendingMembers = family.members.filter(member => 
    member[7] !== "undecided" && getMemberAttendancePeriods(member).length > 0
  );

  if (attendingMembers.length === 0) {
    const emptyPeriods = [];
    const emptyExternal = [];
    const schedules = `
      <div class="family-schedule-group">
        <div class="family-day-squares">${renderDaySquares(emptyPeriods, emptyExternal, "", status === "undecided")}</div>
      </div>`;
    return `<div class="family-attendance-summary"><span class="attendance-badge ${status}">${statusLabel}</span><div class="family-schedule-groups">${schedules}</div></div>`;
  }

  const groups = Object.values(attendingMembers.reduce((result, member) => {
    const periods = getMemberAttendancePeriods(member);
    const externalMeals = getMemberExternalMealPeriods(member);
    const key = `${periods.join("|")}::${externalMeals.join("|")}`;
    const role = member[1] === "성인 남성" ? "brother" : member[1] === "성인 여성" ? "sister" : "child";
    (result[key] ||= { members: [], periods, externalMeals }).members.push({ name: member[0], role });
    return result;
  }, {}));
  const showNames = groups.length > 1;
  const schedules = groups.map((group) => `
    <div class="family-schedule-group">
      <div class="family-day-squares">${renderDaySquares(group.periods, group.externalMeals, showNames ? `${group.members.map((member) => member.name).join(", ")} · ` : "", status === "undecided")}</div>
      <div class="family-schedule-names">${showNames ? group.members.map((member) => `<span class="family-schedule-name ${member.role}">${member.name}</span>`).join("") : ""}</div>
    </div>`).join("");
  return `<div class="family-attendance-summary"><span class="attendance-badge ${status}">${statusLabel}</span><div class="family-schedule-groups">${schedules}</div></div>`;
}

function renderFamilies() {
  const visibleFamilies = getFilteredFamilies();
  
  let adultCount = 0;
  let collegeCount = 0;
  let childCount = 0;
  let kindergartenCount = 0;
  let toddlerCount = 0;
  let undecidedFamiliesCount = 0;
  let undecidedMembersCount = 0;
  
  visibleFamilies.forEach((family) => {
    const isUndecidedFamily = family.status === "undecided" || family.members.some(m => m[7] === "undecided");
    if (isUndecidedFamily) {
      undecidedFamiliesCount++;
    }
    
    family.members.forEach((member) => {
      const group = member[1];
      const isUndecided = member[7] === "undecided";
      const isAbsent = !isUndecided && getMemberAttendancePeriods(member).length === 0;
      
      if (isUndecided) {
        undecidedMembersCount++;
      } else if (!isAbsent) {
        if (group === "성인 남성" || group === "성인 여성" || group.startsWith("성인")) {
          adultCount++;
        } else if (group === "대학부") {
          collegeCount++;
        } else if (group === "초등부" || group === "유년부" || group === "중고등부") {
          childCount++;
        } else if (group === "유치부") {
          kindergartenCount++;
        } else if (group === "유아") {
          toddlerCount++;
        }
      }
    });
  });
  
  const statsHtml = `
    <strong>🏠 ${visibleFamilies.length}가족</strong>
    <span class="stats-sep">|</span> 장년부 ${adultCount}명
    <span class="stats-sep">|</span> 대학부 ${collegeCount}명
    <span class="stats-sep">|</span> 유초등부 ${childCount}명
    <span class="stats-sep">|</span> 유치부 ${kindergartenCount}명
    <span class="stats-sep">|</span> 유아부 ${toddlerCount}명
    ${undecidedFamiliesCount > 0 ? `
      <span class="stats-sep">|</span> 
      <span style="color: #687873; font-weight: 700;">❓ 미정 ${undecidedFamiliesCount}가족(${undecidedMembersCount}명)</span>
    ` : ""}
  `;
  document.querySelector("#familyCount").innerHTML = statsHtml;
  document.querySelector("#familyTableBody").innerHTML = visibleFamilies.map((family) => {
    const [statusText, statusClass] = statusMap[family.status] || [family.status, "undecided"];
    const statusSymbol = {
      stay: "✓",
      late: "◐",
      leave: "✕",
      absent: "✕",
      undecided: "?"
    }[family.status] || "";
    const brotherAndSister = family.members.filter(m => m[1] === "성인 남성" || m[1] === "성인 여성");
    const children = family.members.filter(m => m[1] !== "성인 남성" && m[1] !== "성인 여성");

    const adultPills = brotherAndSister.map((member) => {
      const role = member[1] === "성인 남성" ? "brother" : "sister";
      const isUndecided = member[7] === "undecided";
      const isAbsent = !isUndecided && getMemberAttendancePeriods(member).length === 0;
      let statusClass = "";
      let titleSuffix = "";
      let nameSuffix = "";
      if (isUndecided) {
        statusClass = "undecided-member";
        titleSuffix = " (미정)";
        nameSuffix = " ❓";
      } else if (isAbsent) {
        statusClass = "absent";
        titleSuffix = " (불참)";
      }
      return `<span class="member-pill ${role} ${statusClass}" title="${member[1]}${titleSuffix}">${member[0]}${nameSuffix}</span>`;
    }).join("");

    const childPills = children.map((member) => {
      const isUndecided = member[7] === "undecided";
      const isAbsent = !isUndecided && getMemberAttendancePeriods(member).length === 0;
      let statusClass = "";
      let titleSuffix = "";
      let nameSuffix = "";
      if (isUndecided) {
        statusClass = "undecided-member";
        titleSuffix = " (미정)";
        nameSuffix = " ❓";
      } else if (isAbsent) {
        statusClass = "absent";
        titleSuffix = " (불참)";
      }
      return `<span class="member-pill child ${statusClass}" title="${member[1]}${titleSuffix}">${member[0]}${nameSuffix}</span>`;
    }).join("");

    return `
      <tr class="status-row-${family.status}">
        <td class="family-cell" data-label="가족">
          <b>${family.name}</b>
          <span>${family.leader} · ${family.phone}</span>
        </td>
        <td data-label="구성원">
          <div class="member-stack" style="display: flex; flex-direction: column; gap: 5px; max-width: none;">
            ${adultPills ? `<div style="display: flex; flex-wrap: wrap; gap: 5px;">${adultPills}</div>` : ""}
            ${childPills ? `<div style="display: flex; flex-wrap: wrap; gap: 5px;">${childPills}</div>` : ""}
          </div>
        </td>
        <td class="schedule-cell" data-label="참석 날짜">${renderFamilyAttendance(family)}</td>
        <td data-label="회비 / 방배정">
          <div style="font-size: 11px; color: #5c7066; display: flex; flex-direction: column; gap: 4px;">
            <div>💰 <b>${(family.fee || 0).toLocaleString()}원</b></div>
            <div><span class="fee-badge ${family.feeStatus || 'pending'}" style="margin: 0;">${(family.feeStatus === 'paid' ? '완납' : '납부 예정')}</span></div>
            <div>🏠 <span style="font-weight: 700; color: var(--forest);">${family.room || '미배정'}</span></div>
          </div>
        </td>
        <td data-label="현재 상태"><span class="status ${statusClass}">${statusSymbol} ${statusText}</span></td>
        <td class="table-row-action"><button class="row-menu" data-family-id="${family.id}" aria-label="${family.name} 상세보기">···</button></td>
      </tr>`;
  }).join("");
}

function parseMemberDate(value) {
  if (!value) return new Date(0);
  const parts = value.split(" ");
  if (parts.length < 2) return new Date(0);
  const [date, time] = parts;
  const dateParts = date.split("/");
  if (dateParts.length < 2) return new Date(0);
  const [month, day] = dateParts.map(Number);
  return new Date(`${retreatConfig.start.slice(0, 4)}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${time}:00`);
}

function getMealPeople(meal) {
  const mealTime = new Date(meal.time.replace(" ", "T") + ":00");
  const mealPeriod = meal.id.split("-").at(-1);
  const mealDate = `${Number(meal.time.slice(5, 7))}/${Number(meal.time.slice(8, 10))}`;
  return families
    .filter((family) => family.status !== "absent")
    .flatMap((family) => family.members
      .filter((member) => {
        if (member[5]) {
          return getMemberChargeableMealPeriods(member).includes(`${mealDate}-${mealPeriod}`);
        }
        if (!member[2] || !member[3]) return false;
        return parseMemberDate(member[2]) <= mealTime && parseMemberDate(member[3]) > mealTime;
      })
      .map((member) => {
        const group = member[1];
        let type = "adult";
        if (["유치부", "유아"].includes(group)) {
          type = "preschool";
        } else if (["초등부", "유년부"].includes(group)) {
          type = "child";
        }
        return {
          name: member[0],
          group: group,
          family: family.name,
          type: type,
        };
      }));
}

function renderMeals() {
  const mealsByDate = mealSchedule.reduce((groups, meal) => {
    const date = meal.time.slice(0, 10);
    (groups[date] ||= []).push(meal);
    return groups;
  }, {});
  const mealPeople = mealSchedule.map(getMealPeople);
  const totalServings = mealPeople.reduce((sum, people) => sum + people.length, 0);
  const adultServings = mealPeople.reduce((sum, people) => sum + people.filter((person) => person.type === "adult").length, 0);
  const childServings = mealPeople.reduce((sum, people) => sum + people.filter((person) => person.type === "child").length, 0);
  const preschoolServings = mealPeople.reduce((sum, people) => sum + people.filter((person) => person.type === "preschool").length, 0);
  
  document.querySelector("#mealCountBadge").textContent = `총 ${mealSchedule.length}회 식사`;
  document.querySelector("#mealSummaryNumbers").innerHTML = `
    <div class="meal-summary-number"><span>전체 식수</span><b>${totalServings}명분</b></div>
    <div class="meal-summary-number"><span>성인(중고등포함)</span><b>${adultServings}명분</b></div>
    <div class="meal-summary-number"><span>어린이(초등/유년)</span><b>${childServings}명분</b></div>
    <div class="meal-summary-number"><span>미취학 아동</span><b>${preschoolServings}명분</b></div>`;
  renderMealBarChart();
  document.querySelector("#mealDays").innerHTML = Object.entries(mealsByDate).map(([date, meals]) => {
    const dateInfo = retreatDates.find((item) => item.shortLabel === `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`);
    return `
      <article class="meal-day-card">
        <div class="meal-day-heading">
          <div class="meal-day-date"><b>${dateInfo.date}</b><span>${dateInfo.day}요일</span></div>
          <div><h3>${dateInfo.label}</h3><p>${meals.length}회 식사 · 구성원별 입퇴소 시간을 기준으로 자동 집계합니다.</p></div>
        </div>
        <div class="meal-cards">
          ${meals.map(renderMealCard).join("")}
        </div>
      </article>`;
  }).join("");
}

function renderMealBarChart() {
  const rows = mealSchedule.map((meal) => {
    const people = getMealPeople(meal);
    const adults = people.filter((person) => person.type === "adult").length;
    const children = people.filter((person) => person.type === "child").length;
    const preschools = people.filter((person) => person.type === "preschool").length;
    return { meal, total: people.length, adults, children, preschools };
  });
  const max = Math.max(...rows.map((row) => row.total), 1);
  const height = (value) => Math.max(3, Math.round(value / max * 154));
  document.querySelector("#mealBarChart").innerHTML = rows.map(({ meal, total, adults, children, preschools }) => {
    const parts = meal.label.split(" ");
    const date = parts.slice(0, -1).join(" ");
    const mealType = parts.at(-1);
    return `
      <div class="meal-chart-column">
        <div class="meal-chart-bars">
          <div class="meal-chart-bar total" style="height:${height(total)}px" title="전체"><span>${total}</span></div>
          <div class="meal-chart-bar adult" style="height:${height(adults)}px" title="성인/청소년"><span>${adults}</span></div>
          <div class="meal-chart-bar child" style="height:${height(children)}px" title="어린이(초등/유년)"><span>${children}</span></div>
          <div class="meal-chart-bar preschool" style="height:${height(preschools)}px" title="미취학"><span>${preschools}</span></div>
        </div>
        <div class="meal-chart-label"><b>${date}</b><span class="meal-label-badge ${mealType}">${mealType}</span></div>
      </div>`;
  }).join("");
}

function renderMealCard(meal) {
  const people = getMealPeople(meal);
  const adultCount = people.filter((person) => person.type === "adult").length;
  const childCount = people.filter((person) => person.type === "child").length;
  const preschoolCount = people.filter((person) => person.type === "preschool").length;
  const mealType = meal.label.split(" ").at(-1);
  const time = meal.time.slice(11, 16);
  return `
    <div class="meal-card">
      <div class="meal-card-top"><span class="meal-type">${mealType} 식사</span><span class="meal-time">${time}</span></div>
      <div class="meal-total"><b>${people.length}</b><span>명 준비 예정</span></div>
      <div class="meal-groups">
        <button class="meal-group-button" data-meal-id="${meal.id}" data-meal-group="all"><span>총 인원</span><b>${people.length}명</b></button>
        <button class="meal-group-button" data-meal-id="${meal.id}" data-meal-group="adult"><span>성인/청소년</span><b>${adultCount}명</b></button>
        <button class="meal-group-button" data-meal-id="${meal.id}" data-meal-group="child"><span>어린이</span><b>${childCount}명</b></button>
        <button class="meal-group-button" data-meal-id="${meal.id}" data-meal-group="preschool"><span>미취학</span><b>${preschoolCount}명</b></button>
      </div>
    </div>`;
}

function openMealDrawer(meal, group) {
  const labels = { all: "총 인원", adult: "성인/청소년", child: "어린이(초등/유년)", preschool: "미취학" };
  const people = getMealPeople(meal).filter((person) => group === "all" || person.type === group);
  document.querySelector("#mealDrawerTitle").textContent = `${meal.label} · ${labels[group]}`;
  document.querySelector("#mealDrawerSubtitle").textContent = `${meal.time.slice(11, 16)} 기준 ${people.length}명 · 구성원별 입퇴소 일정 반영`;
  document.querySelector("#mealDetailList").innerHTML = people.length ? people.map((person) => `
    <div class="meal-detail-person">
      <div><b>${person.name}</b><span>${person.family}</span></div>
      <i>${person.group}</i>
    </div>`).join("") : `<p class="meal-detail-empty">해당하는 인원이 없습니다.</p>`;
  document.querySelector("#mealDetailDrawer").classList.add("open");
  document.querySelector("#drawerBackdrop").classList.add("open");
  document.querySelector("#mealDetailDrawer").setAttribute("aria-hidden", "false");
}

function closeMealDrawer() {
  document.querySelector("#mealDetailDrawer").classList.remove("open");
  document.querySelector("#drawerBackdrop").classList.remove("open");
  document.querySelector("#mealDetailDrawer").setAttribute("aria-hidden", "true");
}

function getNameRegistrationStatus(name) {
  const target = normalizeName(name);
  const registeredFamily = families.find((family) => 
    family.members && Array.isArray(family.members) && family.members.some((member) => member && normalizeName(member[0]) === target)
  );
  if (!registeredFamily) return null;
  return registeredFamily.status === "absent" ? "absent" : "present";
}

function isNameRegistered(name) {
  return getNameRegistrationStatus(name) !== null;
}

function getFamilyByMemberName(name, groupFilter = null) {
  const target = normalizeName(name);
  return families.find((family) => 
    family.members && Array.isArray(family.members) && family.members.some((member) => {
      if (!member) return false;
      const nameMatches = normalizeName(member[0]) === target;
      if (!nameMatches) return false;
      if (groupFilter) {
        return member[1] === groupFilter;
      }
      return true;
    })
  );
}

function getMemberAttendanceStatus(name, groupFilter = null) {
  const target = normalizeName(name);
  const foundFamily = getFamilyByMemberName(name, groupFilter);
  
  if (!foundFamily) {
    const isInDb = churchFamilyDb.some((row) =>
      Object.values(row).some((val) => normalizeName(val) === target)
    );
    return isInDb 
      ? { status: "unregistered", label: "미등록" }
      : { status: "not_in_db", label: "미입력" };
  }
  if (foundFamily.status === "absent") {
    return { status: "absent", label: "불참" };
  }
  
  const member = foundFamily.members.find((m) => {
    const nameMatches = normalizeName(m[0]) === target;
    if (!nameMatches) return false;
    if (groupFilter) {
      return m[1] === groupFilter;
    }
    return true;
  });
  if (!member) {
    const isInDb = churchFamilyDb.some((row) =>
      Object.values(row).some((val) => normalizeName(val) === target)
    );
    return isInDb 
      ? { status: "unregistered", label: "미등록" }
      : { status: "not_in_db", label: "미입력" };
  }
  if (member[7] === "undecided") {
    return { status: "undecided", label: "미정" };
  }
  const periods = getMemberAttendancePeriods(member);
  if (periods.length === 0) {
    return { status: "absent", label: "불참" };
  }
  
  const isFull = isMemberFullAttendance(member);
  return isFull ? { status: "full", label: "풀참" } : { status: "partial", label: "부분참석" };
}

function matchesOrgFilter(name, filter, groupFilter = null) {
  if (selectedOrgTimeSlot) {
    const family = getFamilyByMemberName(name, groupFilter);
    if (!family || family.status === "absent") return false;
    const member = family.members.find(m => normalizeName(m[0]) === normalizeName(name) && (!groupFilter || m[1] === groupFilter));
    if (!member || member[7] === "undecided") return false;
    
    const periods = getMemberAttendancePeriods(member);
    if (!periods.includes(selectedOrgTimeSlot)) {
      return false;
    }
  }

  const att = getMemberAttendanceStatus(name, groupFilter);
  
  if (filter === "all") return true;

  if (filter === "attended") {
    return att.status === "full" || att.status === "partial";
  }

  if (filter === "registered") return att.status === "full" || att.status === "partial";
  if (filter === "unregistered") return att.status === "unregistered";
  if (filter === "not_in_db") return att.status === "not_in_db";

  if (filter === "full") {
    return att.status === "full";
  }

  if (filter === "partial") {
    return att.status === "partial";
  }

  if (filter === "absent") {
    return att.status === "absent";
  }

  if (filter === "undecided") {
    return att.status === "undecided";
  }

  return true;
}

function renderOrgTimeFilter() {
  const container = document.querySelector("#orgTimeFilterDays");
  if (!container) return;
  
  const availablePeriods = getAvailableAttendancePeriods();
  
  container.innerHTML = retreatDates.map((date) => {
    return `
      <div class="attendance-day" aria-label="${date.label} 참석 시간" style="cursor: default;">
        ${attendancePeriods.map((period) => {
          const periodKey = `${date.shortLabel}-${period.key}`;
          const active = selectedOrgTimeSlot === periodKey;
          const disabled = !availablePeriods.includes(periodKey);
          
          return `
            <button type="button" 
              class="attendance-segment ${active ? "selected" : ""} ${disabled ? "unavailable" : ""}" 
              data-slot="${periodKey}" 
              aria-label="${date.label} ${period.label}${disabled ? " 없음" : ""}" 
              ${disabled ? "disabled" : ""}
              style="cursor: ${disabled ? "not-allowed" : "pointer"};"
            >${period.label}</button>
          `;
        }).join("")}
      </div>
    `;
  }).join("");
}

function renderSchoolTimeFilter() {
  const container = document.querySelector("#schoolTimeFilterDays");
  if (!container) return;
  
  const availablePeriods = getAvailableAttendancePeriods();
  
  container.innerHTML = retreatDates.map((date) => {
    return `
      <div class="attendance-day" aria-label="${date.label} 참석 시간" style="cursor: default;">
        ${attendancePeriods.map((period) => {
          const periodKey = `${date.shortLabel}-${period.key}`;
          const active = selectedSchoolTimeSlot === periodKey;
          const disabled = !availablePeriods.includes(periodKey);
          
          return `
            <button type="button" 
              class="attendance-segment ${active ? "selected" : ""} ${disabled ? "unavailable" : ""}" 
              data-slot="${periodKey}" 
              aria-label="${date.label} ${period.label}${disabled ? " 없음" : ""}" 
              ${disabled ? "disabled" : ""}
              style="cursor: ${disabled ? "not-allowed" : "pointer"};"
            >${period.label}</button>
          `;
        }).join("")}
      </div>
    `;
  }).join("");
}

function renderOrgChart(genderMode) {
  renderOrgTimeFilter();
  const isSister = genderMode === "sister";
  const groupsData = isSister ? sisterGroupsData : brotherGroupsData;
  const staffData = isSister ? sisterStaffData : brotherStaffData;
  
  const container = document.querySelector("#orgChartContainer");
  const statsBar = document.querySelector("#orgStatsBar");
  
  // Title & Subtitle
  document.querySelector("#orgTitle").innerHTML = `Small Group Community <span style="font-size: 15px; font-weight: 600; color: var(--muted); margin-left: 8px;">(${isSister ? "자매조 소그룹" : "형제조 소그룹"})</span>`;
  document.querySelector("#orgSubtitle").textContent = "전체 조원들의 조장-조원 구조 및 실시간 참석 상태를 시각화한 소그룹 조직도입니다.";
    
  const allPeople = new Set();
  const groupFilter = isSister ? "성인 여성" : "성인 남성";
  
  groupsData.forEach((group) => {
    allPeople.add(group.leader);
    group.members.forEach((m) => allPeople.add(m));
  });
  staffData.coordinators.forEach((c) => allPeople.add(c.name));
  staffData.otherGroups.forEach((m) => allPeople.add(m));
  
  let totalPeopleCount = 0;
  let fullPeople = 0;
  let partialPeople = 0;
  let absentPeople = 0;
  let undecidedPeople = 0;
  let unregisteredPeopleCount = 0;
  let notInDbPeopleCount = 0;
  
  allPeople.forEach((name) => {
    const att = getMemberAttendanceStatus(name, groupFilter);
    totalPeopleCount++;
    if (att.status === "full") {
      fullPeople++;
    } else if (att.status === "partial") {
      partialPeople++;
    } else if (att.status === "undecided") {
      undecidedPeople++;
    } else if (att.status === "absent") {
      absentPeople++;
    } else if (att.status === "unregistered") {
      unregisteredPeopleCount++;
    } else if (att.status === "not_in_db") {
      notInDbPeopleCount++;
    }
  });
  
  const attendedPeople = fullPeople + partialPeople;

  statsBar.innerHTML = `
    <div class="org-stats-row">
      <div class="org-stats-item ${orgActiveFilter === 'all' ? 'active' : ''}" data-org-filter="all">
        <strong>🏫 전체 인원:</strong>&nbsp;<b>${totalPeopleCount}명</b>
      </div>
      <span class="org-stats-sep" style="color: #cbd5e1; align-self: center;">|</span>
      <div class="org-stats-item ${orgActiveFilter === 'attended' ? 'active' : ''}" data-org-filter="attended">
        <span class="org-badge" style="background: var(--sage); color: var(--forest); border-color: #b8d4c7;">참석자</span>&nbsp;<b>${attendedPeople}명</b>
      </div>
      <span class="org-stats-sep" style="color: #cbd5e1; align-self: center;">|</span>
      <div class="org-stats-item ${orgActiveFilter === 'full' ? 'active' : ''}" data-org-filter="full">
        <span class="org-badge badge-full">풀참</span>&nbsp;<b>${fullPeople}명</b>
      </div>
      <span class="org-stats-sep" style="color: #cbd5e1; align-self: center;">|</span>
      <div class="org-stats-item ${orgActiveFilter === 'partial' ? 'active' : ''}" data-org-filter="partial">
        <span class="org-badge badge-partial">부분참석</span>&nbsp;<b>${partialPeople}명</b>
      </div>
    </div>
    <div class="org-stats-row">
      <div class="org-stats-item ${orgActiveFilter === 'absent' ? 'active' : ''}" data-org-filter="absent">
        <span class="org-badge badge-absent">불참</span>&nbsp;<b>${absentPeople}명</b>
      </div>
      <span class="org-stats-sep" style="color: #cbd5e1; align-self: center;">|</span>
      <div class="org-stats-item ${orgActiveFilter === 'undecided' ? 'active' : ''}" data-org-filter="undecided">
        <span class="org-badge badge-undecided">미정</span>&nbsp;<b>${undecidedPeople}명</b>
      </div>
      <span class="org-stats-sep" style="color: #cbd5e1; align-self: center;">|</span>
      <div class="org-stats-item ${orgActiveFilter === 'unregistered' ? 'active' : ''}" data-org-filter="unregistered">
        <span class="org-badge badge-unregistered">미등록</span>&nbsp;<b>${unregisteredPeopleCount}명</b>
      </div>
      <span class="org-stats-sep" style="color: #cbd5e1; align-self: center;">|</span>
      <div class="org-stats-item ${orgActiveFilter === 'not_in_db' ? 'active' : ''}" data-org-filter="not_in_db">
        <span class="org-badge badge-not_in_db">미입력</span>&nbsp;<b>${notInDbPeopleCount}명</b>
      </div>
    </div>
  `;
  
  let html = "";
  
  function makeNodeHtml(name, roleLabel, btnClassPrefix) {
    const att = getMemberAttendanceStatus(name, groupFilter);
    const badgeClass = `badge-${att.status}`;
    const btnClass = `${btnClassPrefix}-member-btn`;
    const isLeader = roleLabel ? "leader" : "";
    const regClass = att.status;
       
    const showLabel = roleLabel && roleLabel !== "조장";
    
    // Check if this node matches the active filter
    const visible = matchesOrgFilter(name, orgActiveFilter, groupFilter);
    const displayStyle = visible ? "" : "display: none !important;";
      
    return `
      <div class="org-${isLeader ? "leader" : "member"}-node ${btnClass} ${isLeader} ${regClass}" data-name="${name}" style="${displayStyle}">
        <span style="display: inline-flex; align-items: center; gap: 6px;">
          <span class="org-status-dot badge-${att.status}"></span>
          <b>${name}</b>${showLabel ? ` <small style="font-size:9.5px;color:var(--muted);font-weight:normal;">(${roleLabel})</small>` : ""}
        </span>
      </div>
    `;
  }
  
  groupsData.forEach((group) => {
    const leaderVisible = matchesOrgFilter(group.leader, orgActiveFilter, groupFilter);
    const visibleMembers = group.members.filter((m) => matchesOrgFilter(m, orgActiveFilter, groupFilter));
    
    if (!leaderVisible && visibleMembers.length === 0) {
      return; // Skip rendering this group card completely if no one matches!
    }
    
    const showConnector = leaderVisible && visibleMembers.length > 0;
    
    html += `
      <div class="org-group-card">
        <div class="org-group-name">
          <span>${isSister ? "👩" : "👨"} ${group.id} (${group.leader})</span>
        </div>
        <div class="org-leader-box">
          ${makeNodeHtml(group.leader, "조장", isSister ? "sister" : "brother")}
          ${showConnector ? '<div class="org-connector"></div>' : ""}
        </div>
        <div class="org-member-list">
          ${group.members.map((m) => makeNodeHtml(m, null, isSister ? "sister" : "brother")).join("")}
        </div>
      </div>
    `;
  });
  
  const visibleCoordinators = staffData.coordinators.filter((c) => matchesOrgFilter(c.name, orgActiveFilter, groupFilter));
  const visibleOtherGroups = staffData.otherGroups.filter((m) => matchesOrgFilter(m, orgActiveFilter, groupFilter));
  
  if (visibleCoordinators.length > 0 || visibleOtherGroups.length > 0) {
    const showConnector = visibleCoordinators.length > 0 && visibleOtherGroups.length > 0;
    
    html += `
      <div class="org-group-card">
        <div class="org-group-name">
          <span>👑 코디 및 기타 스태프</span>
        </div>
        <div class="org-leader-box">
          ${staffData.coordinators.map((c) => makeNodeHtml(c.name, c.role, isSister ? "sister" : "brother")).join("")}
          ${showConnector ? '<div class="org-connector"></div>' : ""}
        </div>
        <div class="org-member-list">
          ${staffData.otherGroups.map((m) => makeNodeHtml(m, "기타", isSister ? "sister" : "brother")).join("")}
        </div>
      </div>
    `;
  }
  
  if (!html) {
    html = `
      <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: var(--muted); text-align: center; background: #fafafa; border-radius: 8px; border: 1px dashed #dcdcdc;">
        <span style="font-size: 32px; margin-bottom: 12px;">🔍</span>
        <p style="font-size: 13px; font-weight: 600; color: #555; margin: 0;">필터 조건에 맞는 조원이 없습니다.</p>
        <p style="font-size: 11px; color: #888; margin: 4px 0 0 0;">다른 필터 조건을 선택해 주세요.</p>
      </div>
    `;
  }
  
  container.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

function renderSisterGroups() {
  const list = document.querySelector("#sisterGroupList");
  let html = `
    <style>
      .sister-groups-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
        margin-top: 20px;
        padding-bottom: 40px;
      }
      .sister-group-card {
        background: #f9fbf9;
        border: 1px solid #edf2ef;
        border-radius: 12px;
        padding: 16px;
      }
      .sister-group-name {
        font-size: 14px;
        font-weight: 700;
        color: #1e5a45;
        margin-bottom: 12px;
      }
      .sister-group-members {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .sister-member-btn {
        background: white;
        border: 1px solid #dbe4de;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 13px;
        color: #4a5c53;
        cursor: pointer;
        transition: all 0.2s;
      }
      .sister-member-btn:hover {
        background: #edf2ef;
        border-color: #1e5a45;
        color: #1e5a45;
      }
      .sister-member-btn.leader {
        background: #edf2ef;
        border-color: #cdd9d2;
        color: #1e5a45;
      }
      .sister-member-btn.registered.present {
        background: #e7f1fa;
        border-color: #a2c2e8;
        color: #1a4f80;
        font-weight: 500;
      }
      .sister-member-btn.registered.present.leader {
        background: #d4e5f7;
        border-color: #6c9ecf;
        color: #1a4f80;
      }
      .sister-member-btn.registered.absent {
        background: #faeaea;
        border-color: #e8a2a8;
        color: #801a24;
        font-weight: 500;
      }
      .sister-member-btn.registered.absent.leader {
        background: #f7d4d6;
        border-color: #d9879f;
        color: #801a24;
      }
    </style>
    <div class="sister-groups-grid">
  `;
  sisterGroupsData.forEach((group) => {
    const leaderStatus = getNameRegistrationStatus(group.leader);
    const leaderClass = leaderStatus ? `registered ${leaderStatus}` : "";
    const leaderMark = leaderStatus === "present" ? " ✓" : leaderStatus === "absent" ? " ✗" : "";

    html += `
      <div class="sister-group-card">
        <div class="sister-group-name">${group.id}</div>
        <div class="sister-group-members">
          <button type="button" class="sister-member-btn leader ${leaderClass}" data-name="${group.leader}"><b>${group.leader}</b> (조장)${leaderMark}</button>
          ${group.members.map((m) => {
            const status = getNameRegistrationStatus(m);
            const regClass = status ? `registered ${status}` : "";
            const mark = status === "present" ? " ✓" : status === "absent" ? " ✗" : "";
            return `<button type="button" class="sister-member-btn ${regClass}" data-name="${m}">${m}${mark}</button>`;
          }).join("")}
        </div>
      </div>
    `;
  });
  html += `
      <div class="sister-group-card">
        <div class="sister-group-name">코디 및 기타</div>
        <div class="sister-group-members">
          ${sisterStaffData.coordinators.map((c) => {
            const status = getNameRegistrationStatus(c.name);
            const regClass = status ? `registered ${status}` : "";
            const mark = status === "present" ? " ✓" : status === "absent" ? " ✗" : "";
            return `<button type="button" class="sister-member-btn leader ${regClass}" data-name="${c.name}"><b>${c.name}</b> (${c.role})${mark}</button>`;
          }).join("")}
          ${sisterStaffData.otherGroups.map((m) => {
            const status = getNameRegistrationStatus(m);
            const regClass = status ? `registered ${status}` : "";
            const mark = status === "present" ? " ✓" : status === "absent" ? " ✗" : "";
            return `<button type="button" class="sister-member-btn ${regClass}" data-name="${m}">${m}${mark}</button>`;
          }).join("")}
        </div>
      </div>
    </div>
  `;
  list.innerHTML = html;
}

function openSisterGroupDrawer() {
  renderSisterGroups();
  document.querySelector("#sisterGroupDrawer").classList.add("open");
  document.querySelector("#drawerBackdrop").classList.add("open");
  document.querySelector("#sisterGroupDrawer").setAttribute("aria-hidden", "false");
}

function closeSisterGroupDrawer() {
  document.querySelector("#sisterGroupDrawer").classList.remove("open");
  document.querySelector("#drawerBackdrop").classList.remove("open");
  document.querySelector("#sisterGroupDrawer").setAttribute("aria-hidden", "true");
}

function renderBrotherGroups() {
  const list = document.querySelector("#brotherGroupList");
  let html = `
    <style>
      .brother-groups-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
        margin-top: 20px;
        padding-bottom: 40px;
      }
      .brother-group-card {
        background: #f9fbf9;
        border: 1px solid #edf2ef;
        border-radius: 12px;
        padding: 16px;
      }
      .brother-group-name {
        font-size: 14px;
        font-weight: 700;
        color: #1e5a45;
        margin-bottom: 12px;
      }
      .brother-group-members {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .brother-member-btn {
        background: white;
        border: 1px solid #dbe4de;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 13px;
        color: #4a5c53;
        cursor: pointer;
        transition: all 0.2s;
      }
      .brother-member-btn:hover {
        background: #edf2ef;
        border-color: #1e5a45;
        color: #1e5a45;
      }
      .brother-member-btn.leader {
        background: #edf2ef;
        border-color: #cdd9d2;
        color: #1e5a45;
      }
      .brother-member-btn.registered.present {
        background: #e7f1fa;
        border-color: #a2c2e8;
        color: #1a4f80;
        font-weight: 500;
      }
      .brother-member-btn.registered.present.leader {
        background: #d4e5f7;
        border-color: #6c9ecf;
        color: #1a4f80;
      }
      .brother-member-btn.registered.absent {
        background: #faeaea;
        border-color: #e8a2a8;
        color: #801a24;
        font-weight: 500;
      }
      .brother-member-btn.registered.absent.leader {
        background: #f7d4d6;
        border-color: #d9879f;
        color: #801a24;
      }
    </style>
    <div class="brother-groups-grid">
  `;
  brotherGroupsData.forEach((group) => {
    const leaderStatus = getNameRegistrationStatus(group.leader);
    const leaderClass = leaderStatus ? `registered ${leaderStatus}` : "";
    const leaderMark = leaderStatus === "present" ? " ✓" : leaderStatus === "absent" ? " ✗" : "";

    html += `
      <div class="brother-group-card">
        <div class="brother-group-name">${group.id}</div>
        <div class="brother-group-members">
          <button type="button" class="brother-member-btn leader ${leaderClass}" data-name="${group.leader}"><b>${group.leader}</b> (조장)${leaderMark}</button>
          ${group.members.map((m) => {
            const status = getNameRegistrationStatus(m);
            const regClass = status ? `registered ${status}` : "";
            const mark = status === "present" ? " ✓" : status === "absent" ? " ✗" : "";
            return `<button type="button" class="brother-member-btn ${regClass}" data-name="${m}">${m}${mark}</button>`;
          }).join("")}
        </div>
      </div>
    `;
  });
  html += `
      <div class="brother-group-card">
        <div class="brother-group-name">코디 및 기타</div>
        <div class="brother-group-members">
          ${brotherStaffData.coordinators.map((c) => {
            const status = getNameRegistrationStatus(c.name);
            const regClass = status ? `registered ${status}` : "";
            const mark = status === "present" ? " ✓" : status === "absent" ? " ✗" : "";
            return `<button type="button" class="brother-member-btn leader ${regClass}" data-name="${c.name}"><b>${c.name}</b> (${c.role})${mark}</button>`;
          }).join("")}
          ${brotherStaffData.otherGroups.map((m) => {
            const status = getNameRegistrationStatus(m);
            const regClass = status ? `registered ${status}` : "";
            const mark = status === "present" ? " ✓" : status === "absent" ? " ✗" : "";
            return `<button type="button" class="brother-member-btn ${regClass}" data-name="${m}">${m}${mark}</button>`;
          }).join("")}
        </div>
      </div>
    </div>
  `;
  list.innerHTML = html;
}

var openBrotherGroupDrawer = function() {
  renderBrotherGroups();
  document.querySelector("#brotherGroupDrawer").classList.add("open");
  document.querySelector("#drawerBackdrop").classList.add("open");
  document.querySelector("#brotherGroupDrawer").setAttribute("aria-hidden", "false");
};

var closeBrotherGroupDrawer = function() {
  document.querySelector("#brotherGroupDrawer").classList.remove("open");
  document.querySelector("#drawerBackdrop").classList.remove("open");
  document.querySelector("#brotherGroupDrawer").setAttribute("aria-hidden", "true");
};

function getCategoryKey(group) {
  if (["성인 남성", "성인남성", "성인 여성", "성인여성", "장년부", "장년"].includes(group)) return "adult";
  if (["대학부", "대학"].includes(group)) return "youth";
  if (["중·고등부", "중고등부", "청소년"].includes(group)) return "youth";
  if (["초등부", "유년부", "어린이"].includes(group)) return "elementary";
  if (["유치부", "유아", "미취학"].includes(group)) return "preschool";
  return "adult"; // 폴백
}

function updateAttendanceFromFamilies() {
  if (!retreatConfig || !retreatDates.length) return;

  const newAttendance = {};
  
  retreatDates.forEach((date) => {
    newAttendance[date.key] = slots.map((slotTime) => {
      return {
        time: slotTime,
        adult: 0,
        youth: 0,
        elementary: 0,
        preschool: 0
      };
    });
  });
  
  if (families && families.length) {
    retreatDates.forEach((date) => {
      slots.forEach((slotTime, slotIndex) => {
        const slotDateTime = parseMemberDate(`${date.shortLabel} ${slotTime}`);
        
        families.forEach((family) => {
          if (family.status === "absent") return;
          
          family.members.forEach((member) => {
            if (!member[2] || !member[3]) return;
            const arrival = parseMemberDate(member[2]);
            const departure = parseMemberDate(member[3]);
            
            if (arrival <= slotDateTime && slotDateTime < departure) {
              const key = getCategoryKey(member[1]);
              newAttendance[date.key][slotIndex][key]++;
            }
          });
        });
      });
    });
  }
  
  attendance = newAttendance;
}

function renderAll() {
  updateAttendanceFromFamilies();
  renderDateTabs();
  document.querySelector("#selectedDateLabel").textContent = retreatDates.find((date) => date.key === selectedDate).label;
  renderStats();
  renderFlowChart();
  renderTimeSelector();
  renderBreakdown();
  renderFamilies();
  renderMeals();
  if (currentOrgMode && currentOrgMode !== "family") {
    if (currentOrgMode === "school") {
      renderSchoolView();
    } else {
      renderOrgChart(currentOrgMode);
    }
  }
  if (window.lucide) lucide.createIcons();
}

function getMemberSelectedPeriods(member) {
  if (member?.[5]) return member[5];
  if (!member || !member[2] || !member[3]) return getAvailableAttendancePeriods();
  const arrival = parseMemberDate(member[2]);
  const departure = parseMemberDate(member[3]);
  const periodHours = { breakfast: "08:00", lunch: "12:00", dinner: "18:00" };
  return dateLabels.flatMap((date) => attendancePeriods
    .filter((period) => {
      const mealTime = parseMemberDate(`${date} ${periodHours[period.key]}`);
      return arrival <= mealTime && departure > mealTime;
    })
    .map((period) => `${date}-${period.key}`));
}

function getAvailableAttendancePeriods() {
  return mealSchedule.map((meal) => {
    const date = `${Number(meal.time.slice(5, 7))}/${Number(meal.time.slice(8, 10))}`;
    return `${date}-${meal.id.split("-").at(-1)}`;
  });
}

function createMemberForm(role, group, removable = false, member = null) {
  const memberId = ++newMemberId;
  const groups = role === "자녀" ? [...new Set([...childGroups, member?.[1]].filter(Boolean))] : [group];
  const genders = role === "자녀" ? ["남", "여"] : [role === "형제" ? "남" : "여"];
  const selectedPeriods = getMemberSelectedPeriods(member);
  const externalMeals = getMemberExternalMealPeriods(member || []);
  const availablePeriods = getAvailableAttendancePeriods();
  const row = document.createElement("div");
  row.className = "member-form-row";
  row.dataset.memberId = memberId;
  row.innerHTML = `
    <span class="member-role">${role}</span>
    <input class="new-member-name" type="text" placeholder="${role} 이름" aria-label="${role} 이름" value="${member?.[0] || ""}" />
    <select class="new-member-gender" aria-label="${role} 성별">
      ${genders.map((item) => `<option value="${item}">${item}</option>`).join("")}
    </select>
    <select class="new-member-group" aria-label="${role} 소속">
      ${groups.map((item) => `<option value="${item}" ${item === member?.[1] ? "selected" : ""}>${item}</option>`).join("")}
    </select>
    <div class="attendance-days" aria-label="${role} 참석 날짜">
      ${dateLabels.map((date, index) => `
        <div class="attendance-day" aria-label="${date} 참석 시간">
          ${attendancePeriods.map((period) => {
            const periodKey = `${date}-${period.key}`;
            const disabled = !availablePeriods.includes(periodKey);
            return `<button type="button" class="attendance-segment ${selectedPeriods.includes(periodKey) && !disabled ? "selected" : ""} ${externalMeals.includes(periodKey) ? "external-meal" : ""} ${disabled ? "unavailable" : ""}" data-day="${index}" data-period="${period.key}" aria-label="${date} ${period.label}${disabled ? " 없음" : ""}" ${disabled ? "disabled" : ""}>${period.label}</button>`;
          }).join("")}
        </div>`).join("")}
    </div>
    <button type="button" class="member-full-attendance" aria-label="${role} 풀참">풀참</button>
    <button type="button" class="member-undecided-attendance ${member?.[7] === "undecided" ? "active" : ""}" aria-label="${role} 미정">미정</button>
    ${removable ? `<button type="button" class="remove-child" aria-label="자녀 삭제">삭제</button>` : "<span></span>"}`;
  document.querySelector("#memberFormList").append(row);
  updateFullAttendanceLabels();
}

function resetFamilyForm(family = null) {
  document.querySelector("#newFamilyPhone").value = family?.phone || "";
  document.querySelector("#newFamilyStatus").value = family?.status || "stay";
  document.querySelector("#newFamilyFeeStatus").value = family?.feeStatus || "pending";
  document.querySelector("#newFamilyMemo").value = family?.memo === "별도 메모 없음" ? "" : family?.memo || "";
  document.querySelector("#memberFormList").innerHTML = "";
  if (!family) {
    createMemberForm("형제", "성인 남성");
    createMemberForm("자매", "성인 여성");
    updateEstimatedFee();
    return;
  }
  const adults = family.members.filter((member) => member[1].startsWith("성인"));
  const children = family.members.filter((member) => !member[1].startsWith("성인"));
  const brother = adults.find((member) => member[1] === "성인 남성");
  const sister = adults.find((member) => member[1] === "성인 여성");
  createMemberForm("형제", "성인 남성", false, brother);
  createMemberForm("자매", "성인 여성", false, sister);
  children.forEach((member) => createMemberForm("자녀", member[1], true, member));
  updateEstimatedFee();
}

function setAttendanceSelected(button, selected) {
  button.classList.toggle("selected", selected);
  if (!selected) button.classList.remove("external-meal");
}

function normalizeExternalMealStates(row) {
  row.querySelectorAll('.attendance-segment.external-meal').forEach((segment) => {
    const day = segment.closest(".attendance-day");
    const breakfast = day.querySelector('[data-period="breakfast"]');
    const lunch = day.querySelector('[data-period="lunch"]');
    
    const isBreakfastUnavailable = !breakfast || breakfast.disabled || breakfast.classList.contains("unavailable");
    const isBreakfastSelected = breakfast?.classList.contains("selected");
    
    const isValidDinnerPattern = segment.dataset.period === "dinner" &&
      (isBreakfastSelected || isBreakfastUnavailable) &&
      !lunch?.classList.contains("selected");
    if (!isValidDinnerPattern) segment.classList.remove("external-meal");
  });
}

function cycleAttendanceSegment(segment) {
  const row = segment.closest(".member-form-row");
  const btn = row.querySelector(".member-undecided-attendance");
  if (btn) btn.classList.remove("active");
  const day = segment.closest(".attendance-day");
  const breakfast = day.querySelector('[data-period="breakfast"]');
  const lunch = day.querySelector('[data-period="lunch"]');
  
  const isBreakfastUnavailable = !breakfast || breakfast.disabled || breakfast.classList.contains("unavailable");
  const isBreakfastSelected = breakfast?.classList.contains("selected");
  
  const canUseExternalMeal = segment.dataset.period === "dinner" &&
    (isBreakfastSelected || isBreakfastUnavailable) &&
    !lunch?.classList.contains("selected");
  if (segment.classList.contains("external-meal")) {
    setAttendanceSelected(segment, false);
  } else if (segment.classList.contains("selected") && canUseExternalMeal) {
    segment.classList.add("external-meal");
  } else {
    setAttendanceSelected(segment, !segment.classList.contains("selected"));
  }
  normalizeExternalMealStates(row);
  updateEstimatedFee();
}

function toggleFullAttendance(scope) {
  const segments = [...scope.querySelectorAll(".attendance-segment:not(:disabled)")];
  const shouldSelect = segments.some((button) => !button.classList.contains("selected"));
  segments.forEach((button) => {
    setAttendanceSelected(button, shouldSelect);
    button.classList.remove("external-meal");
  });

  if (scope.classList.contains("member-form-row")) {
    const btn = scope.querySelector(".member-undecided-attendance");
    if (btn && shouldSelect) btn.classList.remove("active");
  } else {
    scope.querySelectorAll(".member-form-row").forEach(row => {
      const btn = row.querySelector(".member-undecided-attendance");
      if (btn && shouldSelect) btn.classList.remove("active");
    });
  }

  updateFullAttendanceLabels();
  updateEstimatedFee();
}

function toggleMemberUndecided(row) {
  const btn = row.querySelector(".member-undecided-attendance");
  const isActive = btn.classList.contains("active");
  if (!isActive) {
    row.querySelectorAll(".attendance-segment.selected").forEach((seg) => {
      setAttendanceSelected(seg, false);
    });
    btn.classList.add("active");
  } else {
    btn.classList.remove("active");
  }
  updateFullAttendanceLabels();
  updateEstimatedFee();
}

function updateFullAttendanceLabels() {
  document.querySelectorAll(".member-form-row").forEach((row) => {
    const button = row.querySelector(".member-full-attendance");
    const segments = [...row.querySelectorAll(".attendance-segment:not(:disabled)")];
    button.textContent = segments.every((segment) => segment.classList.contains("selected")) ? "풀참 해제" : "풀참";
  });
  const familyButton = document.querySelector("#familyFullAttendance");
  const familySegments = [...document.querySelectorAll("#memberFormList .attendance-segment:not(:disabled)")];
  familyButton.textContent = familySegments.length && familySegments.every((segment) => segment.classList.contains("selected"))
    ? "✓ 가족 전원 풀참 해제"
    : "✓ 가족 전원 풀참";
}

function updateEstimatedFee() {
  const rows = [...document.querySelectorAll(".member-form-row")];
  const attendingRows = rows.filter((row) => {
    const isUndecided = row.querySelector(".member-undecided-attendance")?.classList.contains("active");
    return !isUndecided && row.querySelectorAll(".attendance-segment.selected").length > 0;
  });
  const numMembers = attendingRows.length;
  
  let roomLabel = "없음";
  let roomRate = 0;
  if (numMembers === 1) {
    roomLabel = "1인실";
    roomRate = 60000;
  } else if (numMembers === 2) {
    roomLabel = "2인실";
    roomRate = 70000;
  } else if (numMembers >= 3 && numMembers <= 4) {
    roomLabel = "4인실";
    roomRate = 80000;
  } else if (numMembers >= 5) {
    roomLabel = "6인실";
    roomRate = 100000;
  }
  
  let nights = 0;
  for (let d = 0; d < dateLabels.length - 1; d++) {
    const dayLabel = dateLabels[d];
    const nextDayLabel = dateLabels[d+1];
    const hasOvernightMember = attendingRows.some(row => {
      const selectedSegs = [...row.querySelectorAll(".attendance-segment.selected")].map(seg => 
        `${dateLabels[Number(seg.dataset.day)]}-${seg.dataset.period}`
      );
      return selectedSegs.includes(`${dayLabel}-dinner`) && selectedSegs.includes(`${nextDayLabel}-breakfast`);
    });
    if (hasOvernightMember) {
      nights++;
    }
  }
  
  let adultBreakfast = 0;
  let adultLunchDinner = 0;
  
  let childBreakfast = 0;
  let childLunchDinner = 0;
  
  let preschoolBreakfast = 0;
  let preschoolLunchDinner = 0;
  
  attendingRows.forEach((row) => {
    const groupSelect = row.querySelector(".new-member-group");
    if (!groupSelect) return;
    const group = groupSelect.value;
    
    let type = "adult";
    if (["유치부", "유아"].includes(group)) {
      type = "preschool";
    } else if (["초등부", "유년부"].includes(group)) {
      type = "child";
    }
    
    const segments = [...row.querySelectorAll(".attendance-segment.selected")];
    segments.forEach((seg) => {
      if (!seg.classList.contains("external-meal")) {
        const period = seg.dataset.period;
        if (type === "adult") {
          if (period === "breakfast") adultBreakfast++;
          else if (period === "lunch" || period === "dinner") adultLunchDinner++;
        } else if (type === "child") {
          if (period === "breakfast") childBreakfast++;
          else if (period === "lunch" || period === "dinner") childLunchDinner++;
        } else if (type === "preschool") {
          if (period === "breakfast") preschoolBreakfast++;
          else if (period === "lunch" || period === "dinner") preschoolLunchDinner++;
        }
      }
    });
  });
  
  const lodgingCost = roomRate * nights;
  const mealCost = 
    (adultBreakfast * 4000 + adultLunchDinner * 9000) +
    (childBreakfast * 4000 + childLunchDinner * 8000) +
    (preschoolBreakfast * 0 + preschoolLunchDinner * 6000);
  const totalCost = lodgingCost + mealCost;
  
  const label = document.querySelector("#estimatedFeeLabel");
  const detail = document.querySelector("#estimatedFeeDetail");
  if (label) label.textContent = `${totalCost.toLocaleString()}원`;
  if (detail) {
    const breakfastCount = adultBreakfast + childBreakfast + preschoolBreakfast;
    const lunchCount = attendingRows.reduce((sum, row) => sum + [...row.querySelectorAll(".attendance-segment.selected")].filter(seg => seg.dataset.period === "lunch" && !seg.classList.contains("external-meal")).length, 0);
    const dinnerCount = attendingRows.reduce((sum, row) => sum + [...row.querySelectorAll(".attendance-segment.selected")].filter(seg => seg.dataset.period === "dinner" && !seg.classList.contains("external-meal")).length, 0);
    
    detail.innerHTML = `
      <div style="font-weight: 700; color: #1e5a45; font-size: 11px; display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; padding-bottom: 8px; border-bottom: 1px dashed #dfe7e3; margin-bottom: 8px;">
        <span>🛏️ 총 숙박수: ${nights}박</span>
        <span style="color: #cbd5e1;">|</span>
        <span>🍚 총 식사: 아침 ${breakfastCount}번, 점심 ${lunchCount}번, 저녁 ${dinnerCount}번</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #40534c;">
        <div>숙박비: ${nights}박 x ${roomRate.toLocaleString()}원(${roomLabel}) = ${lodgingCost.toLocaleString()}원</div>
        <div>식비 세부내역:</div>
        <div style="padding-left: 8px; color: #5f746b; line-height: 1.5;">
          • 성인/청소년: 아침 ${adultBreakfast}회 x 4,000원 + 중/석식 ${adultLunchDinner}회 x 9,000원 = ${(adultBreakfast * 4000 + adultLunchDinner * 9000).toLocaleString()}원<br/>
          • 어린이(초등/유년): 아침 ${childBreakfast}회 x 4,000원 + 중/석식 ${childLunchDinner}회 x 8,000원 = ${(childBreakfast * 4000 + childLunchDinner * 8000).toLocaleString()}원<br/>
          • 미취학 아동: 아침 ${preschoolBreakfast}회 x 0원 + 중/석식 ${preschoolLunchDinner}회 x 6,000원 = ${(preschoolLunchDinner * 6000).toLocaleString()}원
        </div>
        <div style="font-weight: 700; border-top: 1px dotted #cdd9d4; padding-top: 4px; margin-top: 2px;">
          식비 합계: ${mealCost.toLocaleString()}원
        </div>
      </div>
    `;
  }
}

function getFamilyFromForm(existingFamily = null) {
  const phone = document.querySelector("#newFamilyPhone").value.trim();
  const rows = [...document.querySelectorAll(".member-form-row")];
  const enteredRows = rows.filter((row) => row.querySelector(".new-member-name").value.trim());
  if (!phone) {
    showToast("대표 연락처를 입력해주세요.");
    return null;
  }
  if (!enteredRows.length) {
    showToast("참석 구성원을 한 명 이상 입력해주세요.");
    return null;
  }
  const members = [];
  for (const row of enteredRows) {
    const selectedSegments = [...row.querySelectorAll(".attendance-segment.selected")];
    const externalMealSegments = [...row.querySelectorAll(".attendance-segment.external-meal")];
    const selectedDays = [...new Set(selectedSegments.map((button) => Number(button.dataset.day)))];
    
    let arrivalStr = "";
    let departureStr = "";
    if (selectedDays.length > 0) {
      const firstDay = dateLabels[Math.min(...selectedDays)];
      const lastDay = dateLabels[Math.max(...selectedDays)];
      arrivalStr = `${firstDay} 12:00`;
      departureStr = `${lastDay} 15:00`;
    }
    
    const isUndecided = row.querySelector(".member-undecided-attendance")?.classList.contains("active") ? "undecided" : "";
    members.push([
      row.querySelector(".new-member-name").value.trim(),
      row.querySelector(".new-member-group").value,
      arrivalStr,
      departureStr,
      selectedDays.map((index) => dateLabels[index]),
      selectedSegments.map((button) => `${dateLabels[Number(button.dataset.day)]}-${button.dataset.period}`),
      externalMealSegments.map((button) => `${dateLabels[Number(button.dataset.day)]}-${button.dataset.period}`),
      isUndecided,
    ]);
  }
  const parentNames = rows
    .filter((row) => ["형제", "자매"].includes(row.querySelector(".member-role").textContent))
    .map((row) => row.querySelector(".new-member-name").value.trim())
    .filter(Boolean);
  if (!parentNames.length) {
    showToast("형제 또는 자매 이름을 입력해주세요.");
    return null;
  }
  const name = `${parentNames.join(", ")} 가족`;
  // 대표자(leader) 결정 로직: 대표 연락처 번호 소유주에 맞춰 형제 또는 자매 이름 지정
  const brotherRow = rows.find(r => r.querySelector(".member-role").textContent === "형제");
  const sisterRow = rows.find(r => r.querySelector(".member-role").textContent === "자매");
  const brotherName = brotherRow ? brotherRow.querySelector(".new-member-name").value.trim() : "";
  const sisterName = sisterRow ? sisterRow.querySelector(".new-member-name").value.trim() : "";
  
  let leader = brotherName || sisterName; // 기본값
  
  if (brotherName && sisterName && phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    const familyRow = churchFamilyDb.find((row) =>
      Object.values(row).some((val) => normalizeName(val) === normalizeName(brotherName) || normalizeName(val) === normalizeName(sisterName))
    );
    if (familyRow) {
      const brotherPhoneKey = Object.keys(familyRow).find((key) => key.match(/형제/) && key.match(/연락처/) && familyRow[key].trim());
      const sisterPhoneKey = Object.keys(familyRow).find((key) => key.match(/자매/) && key.match(/연락처/) && familyRow[key].trim());
      
      const bPhone = brotherPhoneKey ? familyRow[brotherPhoneKey].replace(/\D/g, "") : "";
      const sPhone = sisterPhoneKey ? familyRow[sisterPhoneKey].replace(/\D/g, "") : "";
      
      if (cleanPhone === sPhone) {
        leader = sisterName;
      } else if (cleanPhone === bPhone) {
        leader = brotherName;
      }
    }
  } else if (sisterName && !brotherName) {
    leader = sisterName;
  }
  
  const status = document.querySelector("#newFamilyStatus").value;
  
  // Calculate total fee again to save it in DB
  const attendingRows = enteredRows.filter(row => {
    const isUndecided = row.querySelector(".member-undecided-attendance")?.classList.contains("active");
    return !isUndecided && row.querySelectorAll(".attendance-segment.selected").length > 0;
  });
  const numMembers = attendingRows.length;
  let roomRate = 0;
  if (numMembers === 1) roomRate = 60000;
  else if (numMembers === 2) roomRate = 70000;
  else if (numMembers >= 3 && numMembers <= 4) roomRate = 80000;
  else if (numMembers >= 5) roomRate = 100000;
  
  let nights = 0;
  for (let d = 0; d < dateLabels.length - 1; d++) {
    const dayLabel = dateLabels[d];
    const nextDayLabel = dateLabels[d+1];
    const hasOvernightMember = attendingRows.some(row => {
      const selectedSegs = [...row.querySelectorAll(".attendance-segment.selected")].map(seg => 
        `${dateLabels[Number(seg.dataset.day)]}-${seg.dataset.period}`
      );
      return selectedSegs.includes(`${dayLabel}-dinner`) && selectedSegs.includes(`${nextDayLabel}-breakfast`);
    });
    if (hasOvernightMember) {
      nights++;
    }
  }

  let totalMealCost = 0;
  attendingRows.forEach((row) => {
    const group = row.querySelector(".new-member-group").value;
    
    let type = "adult";
    if (["유치부", "유아"].includes(group)) {
      type = "preschool";
    } else if (["초등부", "유년부"].includes(group)) {
      type = "child";
    }
    
    const segments = [...row.querySelectorAll(".attendance-segment.selected")];
    segments.forEach((seg) => {
      if (!seg.classList.contains("external-meal")) {
        const period = seg.dataset.period;
        if (type === "adult") {
          if (period === "breakfast") totalMealCost += 4000;
          else if (period === "lunch" || period === "dinner") totalMealCost += 9000;
        } else if (type === "child") {
          if (period === "breakfast") totalMealCost += 4000;
          else if (period === "lunch" || period === "dinner") totalMealCost += 8000;
        } else if (type === "preschool") {
          if (period === "breakfast") totalMealCost += 0;
          else if (period === "lunch" || period === "dinner") totalMealCost += 6000;
        }
      }
    });
  });

  const lodgingCost = roomRate * nights;
  const fee = lodgingCost + totalMealCost;
  
  const feeStatus = document.querySelector("#newFamilyFeeStatus").value;
  const room = existingFamily?.room || "미배정";

  return {
    id: existingFamily?.id || (families.length ? Math.max(...families.map((family) => family.id)) + 1 : 1),
    name,
    leader,
    phone,
    status,
    fee,
    feeStatus,
    room,
    memo: document.querySelector("#newFamilyMemo").value.trim() || "별도 메모 없음",
    members,
  };
}

function toggleModal(open, family = null) {
  if (open) {
    editingFamilyId = family?.id || null;
    document.querySelector("#familyModalEyebrow").textContent = family ? "FAMILY DETAIL" : "NEW REGISTRATION";
    document.querySelector("#familyModalTitle").textContent = family ? `${family.name} 상세 정보` : "새 가족 추가";
    document.querySelector("#familyModalDescription").textContent = family
      ? "가족 구성원 정보와 끼니별 참석 여부를 수정하세요."
      : "구성원별 참석 시간을 선택하세요. 날짜 안의 아침·점심·저녁 칸을 각각 클릭하거나 드래그할 수 있습니다.";
    document.querySelector("#modalNext").textContent = family ? "변경사항 저장" : "가족 등록";
    document.querySelector("#modalDelete").style.display = family ? "block" : "none";
    resetFamilyForm(family);
  }
  document.querySelector("#addModal").classList.toggle("open", open);
  document.querySelector("#modalBackdrop").classList.toggle("open", open);
  document.querySelector("#addModal").setAttribute("aria-hidden", String(!open));
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function setViewMode(mode, remember = true) {
  document.body.classList.toggle("mobile-mode", mode === "mobile");
  document.body.classList.toggle("desktop-mode", mode === "desktop");
  document.querySelectorAll(".view-mode-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  if (remember) localStorage.setItem("retreat-view-mode", mode);
}

async function refreshParticipantsData() {
  const refreshBtn = document.querySelector("#refreshParticipantsButton");
  if (refreshBtn) refreshBtn.classList.add("spinning");
  try {
    await loadFamiliesFromSupabase();
    renderAll();
    showToast("최신 정보로 업데이트되었습니다.");
  } catch (error) {
    console.error("데이터 로드 에러:", error);
    showToast("데이터를 가져오는 중 에러가 발생했습니다.");
  } finally {
    if (refreshBtn) {
      setTimeout(() => {
        refreshBtn.classList.remove("spinning");
      }, 500);
    }
  }
  if (window.lucide) lucide.createIcons();
}

function openPage(view) {
  if (!["attendance", "participants", "meals", "chatbot"].includes(view)) {
    showToast("이 메뉴는 다음 단계에서 연결합니다.");
    return;
  }
  document.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  document.querySelectorAll(".page-view").forEach((page) => page.classList.remove("active"));
  document.querySelector(`#${view}View`).classList.add("active");
  if (view === "participants") {
    refreshParticipantsData();
  }
  if (view === "chatbot") {
    initChatbotView();
  }
  if (window.lucide) lucide.createIcons();
}

document.addEventListener("click", (event) => {
  const dateTab = event.target.closest(".date-tab");
  const timeChip = event.target.closest(".time-chip");
  const filterChip = event.target.closest(".filter-chip");
  const familyMenu = event.target.closest(".row-menu");
  const navItem = event.target.closest("[data-view]");
  const modeButton = event.target.closest(".view-mode-button");
  const mealGroup = event.target.closest(".meal-group-button");
  const modeTab = event.target.closest(".mode-tab");
  const refreshBtn = event.target.closest("#refreshParticipantsButton");
  const orgTimeBtn = event.target.closest(".org-time-segment-btn");
  const clearOrgTimeFilter = event.target.closest("#clearOrgTimeFilter");
  
  if (modeButton) setViewMode(modeButton.dataset.mode);
  if (navItem) {
    event.preventDefault();
    openPage(navItem.dataset.view);
  }
  if (refreshBtn) {
    refreshParticipantsData();
  }
  if (modeTab) {
    document.querySelectorAll(".mode-tab").forEach((t) => t.classList.toggle("active", t === modeTab));
    const mode = modeTab.dataset.mode;
    currentOrgMode = mode;
    
    const familySec = document.querySelector("#familyViewSection");
    const orgSec = document.querySelector("#orgChartViewSection");
    const schoolSec = document.querySelector("#schoolViewSection");
    
    if (mode === "family") {
      familySec.style.display = "block";
      orgSec.style.display = "none";
      if (schoolSec) schoolSec.style.display = "none";
    } else if (mode === "school") {
      familySec.style.display = "none";
      orgSec.style.display = "none";
      if (schoolSec) {
        schoolSec.style.display = "block";
        renderSchoolView();
      }
    } else {
      familySec.style.display = "none";
      orgSec.style.display = "block";
      if (schoolSec) schoolSec.style.display = "none";
      renderOrgChart(mode);
    }
  }
  if (dateTab) {
    selectedDate = dateTab.dataset.date;
    selectedSlot = selectedDate === retreatDates.at(-1).key ? 1 : 2;
    renderAll();
  }
  if (timeChip) {
    selectedSlot = Number(timeChip.dataset.slot);
    renderAll();
  }
  if (filterChip) {
    activeFilter = filterChip.dataset.filter;
    document.querySelectorAll(".family-filter-row .filter-chip").forEach((chip) => chip.classList.toggle("active", chip === filterChip));
    renderFamilies();
  }
  if (familyMenu) toggleModal(true, families.find((family) => family.id === Number(familyMenu.dataset.familyId)));
  if (event.target.closest("#addChildButton")) {
    createMemberForm("자녀", "중고등부", true);
    updateEstimatedFee();
  }
  if (event.target.closest(".remove-child")) {
    event.target.closest(".member-form-row").remove();
    updateFullAttendanceLabels();
    updateEstimatedFee();
  }
  if (event.target.closest(".member-full-attendance")) toggleFullAttendance(event.target.closest(".member-form-row"));
  if (event.target.closest(".member-undecided-attendance")) toggleMemberUndecided(event.target.closest(".member-form-row"));
  if (event.target.closest("#familyFullAttendance")) toggleFullAttendance(document.querySelector("#memberFormList"));
  if (mealGroup) openMealDrawer(mealSchedule.find((meal) => meal.id === mealGroup.dataset.mealId), mealGroup.dataset.mealGroup);
  
  const orgTimeSegmentBtn = event.target.closest("#orgTimeFilterDays .attendance-segment");
  if (orgTimeSegmentBtn) {
    const slot = orgTimeSegmentBtn.dataset.slot;
    if (selectedOrgTimeSlot === slot) {
      selectedOrgTimeSlot = null;
    } else {
      selectedOrgTimeSlot = slot;
    }
    renderOrgChart(currentOrgMode);
  }
  if (clearOrgTimeFilter) {
    selectedOrgTimeSlot = null;
    renderOrgChart(currentOrgMode);
  }
  const orgStatChip = event.target.closest("#orgStatsBar .org-stats-item");
  if (orgStatChip) {
    const filterVal = orgStatChip.dataset.orgFilter;
    if (orgActiveFilter === filterVal) {
      orgActiveFilter = "all";
    } else {
      orgActiveFilter = filterVal;
    }
    renderOrgChart(currentOrgMode);
  }
  const clearSchoolTimeFilter = event.target.closest("#clearSchoolTimeFilter");
  if (clearSchoolTimeFilter) {
    selectedSchoolTimeSlot = null;
    renderSchoolView();
  }
  const schoolTimeSegmentBtn = event.target.closest("#schoolTimeFilterDays .attendance-segment");
  if (schoolTimeSegmentBtn) {
    const slot = schoolTimeSegmentBtn.dataset.slot;
    if (selectedSchoolTimeSlot === slot) {
      selectedSchoolTimeSlot = null;
    } else {
      selectedSchoolTimeSlot = slot;
    }
    renderSchoolView();
  }
  const schoolStatFilterChip = event.target.closest(".school-stat-filter-chip");
  if (schoolStatFilterChip) {
    const filterVal = schoolStatFilterChip.dataset.filter;
    if (selectedSchoolDeptFilter === filterVal) {
      selectedSchoolDeptFilter = "all";
    } else {
      selectedSchoolDeptFilter = filterVal;
    }
    renderSchoolView();
  }

  const clickedBtn = event.target.closest(".sister-member-btn, .brother-member-btn");
  if (clickedBtn) {
    const isBrother = clickedBtn.classList.contains("brother-member-btn");
    const name = clickedBtn.dataset.name;

    const registeredFamily = getFamilyByMemberName(name, isBrother ? "성인 남성" : "성인 여성");
    if (registeredFamily) {
      toggleModal(true, registeredFamily);
      return;
    }

    // 공백을 제거하여 비교 (예: "김 은 혜" -> "김은혜")
    const searchName = normalizeName(name);
    const isDbEmpty = !churchFamilyDb || churchFamilyDb.length === 0;

    const familyRow = churchFamilyDb.find((row) => {
      if (isBrother) {
        const brotherKey = Object.keys(row).find((key) => key.match(/형제|남편|아빠/) && !key.match(/생년월일|연락처|나이/));
        if (brotherKey && normalizeName(row[brotherKey]) === searchName) return true;
        
        const sisterKey = Object.keys(row).find((key) => key.match(/자매|부인|아내/) && !key.match(/생년월일|연락처|나이/));
        return Object.keys(row).some(key => {
          if (key === sisterKey) return false;
          return normalizeName(row[key]) === searchName;
        });
      } else {
        const sisterKey = Object.keys(row).find((key) => key.match(/자매|부인|아내/) && !key.match(/생년월일|연락처|나이/));
        if (sisterKey && normalizeName(row[sisterKey]) === searchName) return true;
        
        const brotherKey = Object.keys(row).find((key) => key.match(/형제|남편|아빠/) && !key.match(/생년월일|연락처|나이/));
        return Object.keys(row).some(key => {
          if (key === brotherKey) return false;
          return normalizeName(row[key]) === searchName;
        });
      }
    });

    toggleModal(true);
    setTimeout(() => {
      document.querySelector("#memberFormList").innerHTML = "";
      document.querySelector("#newFamilyStatus").value = "late";
      
      if (isDbEmpty) {
        if (isBrother) {
          createMemberForm("형제", "성인 남성", false, [name]);
          createMemberForm("자매", "성인 여성", false, [""]);
        } else {
          createMemberForm("형제", "성인 남성", false, [""]);
          createMemberForm("자매", "성인 여성", false, [name]);
        }
        showToast("구글 시트 연동 실패: 데이터가 비어있습니다. 공유 설정을 확인하세요.");
      } else if (familyRow) {
        const brotherKey = Object.keys(familyRow).find((key) => key.match(/형제|남편|아빠|배우자/) && !key.match(/생년월일|연락처|나이/));
        let brotherName = brotherKey ? familyRow[brotherKey].trim() : "";
        
        const sisterKey = Object.keys(familyRow).find((key) => key.match(/자매|부인|아내|배우자/) && !key.match(/생년월일|연락처|나이/));
        let sisterName = sisterKey ? familyRow[sisterKey].trim() : "";

        if (isBrother) {
          brotherName = name;
          if (normalizeName(sisterName) === searchName) sisterName = "";
        } else {
          sisterName = name;
          if (normalizeName(brotherName) === searchName) brotherName = "";
        }
        
        const childKeys = Object.keys(familyRow).filter((key) => key.match(/자녀|아이|아들|딸/) && !key.match(/생년월일|연락처|나이/));
        
        const childrenList = [];
        childKeys.forEach((key) => {
          const childName = familyRow[key].trim();
          if (!childName) return;
          
          const childNumber = key.match(/^\d+/)?.[0];
          const birthDateKey = Object.keys(familyRow).find((k) => k.startsWith(childNumber + "-") && k.includes("생년월일"));
          const birthDateStr = birthDateKey ? familyRow[birthDateKey].trim() : "";
          
          let year = null;
          if (birthDateStr) {
            const digits = birthDateStr.replace(/\D/g, "");
            if (digits.length === 8) {
              year = Number(digits.slice(0, 4));
            } else if (digits.length === 6) {
              const yy = Number(digits.slice(0, 2));
              if (yy >= 0 && yy <= 26) {
                year = 2000 + yy;
              } else {
                year = 1900 + yy;
              }
            }
          }
          
          let group = "초등부"; // 기본값
          if (year) {
            if (year >= 2008 && year <= 2013) {
              group = "중고등부";
            } else if (year >= 2014 && year <= 2016) {
              group = "초등부";
            } else if (year >= 2017 && year <= 2019) {
              group = "유년부";
            } else if (year >= 2020 && year <= 2022) {
              group = "유치부";
            } else if (year >= 2023) {
              group = "유아";
            }
          }
          childrenList.push({ name: childName, group });
        });
        
        let phone = "";
        const sisterPhoneKey = Object.keys(familyRow).find((key) => key.match(/자매/) && key.match(/연락처/) && familyRow[key].trim());
        if (sisterPhoneKey) {
          phone = familyRow[sisterPhoneKey].trim();
        } else {
          const brotherPhoneKey = Object.keys(familyRow).find((key) => key.match(/형제/) && key.match(/연락처/) && familyRow[key].trim());
          if (brotherPhoneKey) {
            phone = brotherPhoneKey ? familyRow[brotherPhoneKey].trim() : "";
          } else {
            const fallbackPhoneKey = Object.keys(familyRow).find((key) => key.match(/연락처/) && familyRow[key].trim());
            if (fallbackPhoneKey) {
              phone = familyRow[fallbackPhoneKey].trim();
            }
          }
        }

        if (phone) {
          if (phone.length === 11 && !phone.includes("-")) {
            phone = phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
          }
          document.querySelector("#newFamilyPhone").value = phone;
        }

        createMemberForm("형제", "성인 남성", false, [brotherName]);
        createMemberForm("자매", "성인 여성", false, [sisterName]);
        
        childrenList.forEach((child) => {
          createMemberForm("자녀", child.group, true, [child.name, child.group]);
        });
        showToast(`${name}님의 가족 정보를 시트에서 불러왔습니다.`);
      } else {
        if (isBrother) {
          createMemberForm("형제", "성인 남성", false, [name]);
          createMemberForm("자매", "성인 여성", false, [""]);
        } else {
          createMemberForm("형제", "성인 남성", false, [""]);
          createMemberForm("자매", "성인 여성", false, [name]);
        }
        showToast(`${name}님을 구글 시트에서 찾지 못했습니다.`);
      }
    }, 50);

    if (isBrother) {
      closeBrotherGroupDrawer();
    } else {
      closeSisterGroupDrawer();
    }
  }
  if (window.lucide) lucide.createIcons();
});

document.addEventListener("pointerdown", (event) => {
  const segment = event.target.closest(".attendance-segment");
  if (!segment) return;
  event.preventDefault();
  cycleAttendanceSegment(segment);
  dateDrag = { row: segment.closest(".member-form-row"), selected: segment.classList.contains("selected") };
  updateFullAttendanceLabels();
});

document.addEventListener("pointerover", (event) => {
  const segment = event.target.closest(".attendance-segment");
  if (!segment || !dateDrag || segment.closest(".member-form-row") !== dateDrag.row) return;
  setAttendanceSelected(segment, dateDrag.selected);
  normalizeExternalMealStates(dateDrag.row);
  updateFullAttendanceLabels();
});

document.addEventListener("pointerup", () => { dateDrag = null; });
document.addEventListener("pointercancel", () => { dateDrag = null; });

document.querySelector("#searchInput").addEventListener("input", renderFamilies);
document.querySelector("#memberFormList").addEventListener("change", (event) => {
  if (event.target.classList.contains("new-member-group")) {
    updateEstimatedFee();
  }
});
document.querySelector("#mealDrawerClose").addEventListener("click", closeMealDrawer);
document.querySelector("#drawerBackdrop").addEventListener("click", () => {
  closeMealDrawer();
  closeSisterGroupDrawer();
  closeBrotherGroupDrawer();
});
document.querySelector("#sisterGroupButton")?.addEventListener("click", () => {
  const tab = document.querySelector(".mode-tab[data-mode='sister']");
  if (tab) tab.click();
});
document.querySelector("#sisterGroupDrawerClose")?.addEventListener("click", closeSisterGroupDrawer);
document.querySelector("#brotherGroupButton")?.addEventListener("click", () => {
  const tab = document.querySelector(".mode-tab[data-mode='brother']");
  if (tab) tab.click();
});
document.querySelector("#brotherGroupDrawerClose")?.addEventListener("click", closeBrotherGroupDrawer);
document.querySelector("#addFamilyButton").addEventListener("click", () => toggleModal(true));
document.querySelector("#modalClose").addEventListener("click", () => toggleModal(false));
document.querySelector("#modalCancel").addEventListener("click", () => toggleModal(false));
document.querySelector("#modalBackdrop").addEventListener("click", () => toggleModal(false));
document.querySelector("#modalNext").addEventListener("click", async () => {
  const existingIndex = families.findIndex((family) => family.id === editingFamilyId);
  const family = getFamilyFromForm(existingIndex >= 0 ? families[existingIndex] : null);
  if (!family) return;
  
  const dbFamily = { ...family };
  const feeInfo = {
    fee: family.fee,
    feeStatus: family.feeStatus,
    room: family.room
  };
  const cleanMemo = family.memo === "별도 메모 없음" ? "" : family.memo;
  dbFamily.memo = `${cleanMemo}\n__FEE_INFO__:${JSON.stringify(feeInfo)}`;
  
  delete dbFamily.fee;
  delete dbFamily.feeStatus;
  delete dbFamily.room;

  if (supabaseClient) {
    const { error } = await supabaseClient.from("families").upsert([dbFamily]);
    if (error) {
      console.error("Supabase 저장 에러:", error);
      showToast("데이터 저장에 실패했습니다.");
      return;
    }
  }

  if (existingIndex >= 0) families[existingIndex] = family;
  else families.push(family);
  
  renderAll();
  toggleModal(false);
  showToast(existingIndex >= 0 ? `${family.name} 정보가 저장되었습니다.` : `${family.name}이 등록되었습니다.`);
});
document.querySelector("#modalDelete").addEventListener("click", async () => {
  if (!editingFamilyId) return;
  if (!confirm("정말로 이 가족의 모든 수련회 참석 정보를 삭제하시겠습니까?")) return;

  if (supabaseClient) {
    const { error } = await supabaseClient.from("families").delete().eq("id", editingFamilyId);
    if (error) {
      console.error("Supabase 삭제 에러:", error);
      showToast("데이터 삭제에 실패했습니다.");
      return;
    }
  }

  families = families.filter((family) => family.id !== editingFamilyId);
  renderAll();
  toggleModal(false);
  showToast("가족 참석 정보가 성공적으로 삭제되었습니다.");
});
document.querySelector("#modalAbsence").addEventListener("click", async () => {
  const existingIndex = families.findIndex((family) => family.id === editingFamilyId);
  const family = getFamilyFromForm(existingIndex >= 0 ? families[existingIndex] : null);
  if (!family) return;

  if (!confirm(`${family.name}을 가족 전체 불참으로 등록하시겠습니까?\n(불참으로 등록 시 식사 집계 및 명단 목록에서 제외되며, 등록 현황 체크용으로만 관리됩니다.)`)) return;

  family.status = "absent";
  family.fee = 0;

  // Clear all member attendance periods so they definitely don't have active periods!
  if (family.members) {
    family.members = family.members.map((member) => {
      member[5] = [];
      member[6] = [];
      return member;
    });
  }

  const dbFamily = { ...family };
  const feeInfo = {
    fee: family.fee,
    feeStatus: family.feeStatus,
    room: family.room
  };
  const cleanMemo = family.memo === "별도 메모 없음" ? "" : family.memo;
  dbFamily.memo = `${cleanMemo}\n__FEE_INFO__:${JSON.stringify(feeInfo)}`;
  
  delete dbFamily.fee;
  delete dbFamily.feeStatus;
  delete dbFamily.room;

  if (supabaseClient) {
    const { error } = await supabaseClient.from("families").upsert([dbFamily]);
    if (error) {
      console.error("Supabase 저장 에러:", error);
      showToast("데이터 저장에 실패했습니다.");
      return;
    }
  }

  if (existingIndex >= 0) families[existingIndex] = family;
  else families.push(family);

  renderFamilies();
  renderMeals();
  renderAll(); // Re-render everything to update UI
  toggleModal(false);
  showToast(`${family.name}이 전체 불참으로 등록되었습니다.`);
});
document.querySelector("#modalUndecided").addEventListener("click", async () => {
  const existingIndex = families.findIndex((family) => family.id === editingFamilyId);
  const family = getFamilyFromForm(existingIndex >= 0 ? families[existingIndex] : null);
  if (!family) return;

  if (!confirm(`${family.name}을 가족 전체 미정으로 등록하시겠습니까?\n(미정으로 등록 시 식사 집계 및 숙박비 계산에서 제외되며, 현재 상태가 미정으로 관리됩니다.)`)) return;

  family.status = "undecided";
  family.fee = 0;

  if (family.members) {
    family.members = family.members.map((member) => {
      member[5] = [];
      member[6] = [];
      member[7] = "undecided";
      return member;
    });
  }

  const dbFamily = { ...family };
  const feeInfo = {
    fee: family.fee,
    feeStatus: family.feeStatus,
    room: family.room
  };
  const cleanMemo = family.memo === "별도 메모 없음" ? "" : family.memo;
  dbFamily.memo = `${cleanMemo}\n__FEE_INFO__:${JSON.stringify(feeInfo)}`;
  
  delete dbFamily.fee;
  delete dbFamily.feeStatus;
  delete dbFamily.room;

  if (supabaseClient) {
    const { error } = await supabaseClient.from("families").upsert([dbFamily]);
    if (error) {
      console.error("Supabase 저장 에러:", error);
      showToast("데이터 저장에 실패했습니다.");
      return;
    }
  }

  if (existingIndex >= 0) families[existingIndex] = family;
  else families.push(family);

  renderFamilies();
  renderMeals();
  renderAll(); // Re-render everything to update UI
  toggleModal(false);
  showToast(`${family.name}이 전체 미정으로 등록되었습니다.`);
});
document.querySelector("#downloadButton").addEventListener("click", downloadList);
document.querySelector("#loadMoreButton").addEventListener("click", () => showToast("등록된 가족 명단을 모두 불러왔습니다."));
document.querySelector("#filterButton").addEventListener("click", () => showToast("상단 필터에서 참석 상태를 선택하세요."));
document.querySelector("#mealDownloadButton").addEventListener("click", () => showToast("식사별 명단 다운로드를 준비했습니다."));


// ==========================================
// AI CHATBOT FUNCTIONALITY
// ==========================================
let isChatbotInitialized = false;

function initChatbotView() {
  const badge = document.querySelector("#chatModeBadge");
  const copy = document.querySelector("#chatModeCopy");
  const providerSelect = document.querySelector("#aiProviderSelect");
  const apiKeyWrapper = document.querySelector("#apiKeyInputWrapper");
  const apiKeyInput = document.querySelector("#aiApiKeyInput");
  const saveBtn = document.querySelector("#saveApiKeyButton");
  const chatForm = document.querySelector("#chatbotForm");
  const chatInput = document.querySelector("#chatbotInput");
  const suggestions = document.querySelector("#chatbotSuggestions");
  const messagesContainer = document.querySelector("#chatbotMessages");

  if (!badge) return;

  // Handle Settings Toggle
  const toggleBtn = document.querySelector("#chatSettingsToggle");
  const settingsPanel = document.querySelector("#chatbotSettingsPanel");
  if (toggleBtn && settingsPanel) {
    toggleBtn.onclick = () => {
      const isHidden = settingsPanel.style.display === "none";
      settingsPanel.style.display = isHidden ? "block" : "none";
      toggleBtn.style.transform = isHidden ? "rotate(90deg)" : "rotate(0deg)";
    };
  }

  // Load configuration
  const savedProvider = localStorage.getItem("ai-provider") || "mock";
  const savedKey = localStorage.getItem("ai-api-key") || "";

  providerSelect.value = savedProvider;
  apiKeyInput.value = savedKey;

  // Show/Hide Key Input based on provider selection
  const toggleKeyWrapper = () => {
    if (providerSelect.value === "mock") {
      apiKeyWrapper.style.display = "none";
    } else {
      apiKeyWrapper.style.display = "grid";
    }
  };
  toggleKeyWrapper();

  providerSelect.onchange = toggleKeyWrapper;

  // Save Settings
  saveBtn.onclick = () => {
    const provider = providerSelect.value;
    const key = apiKeyInput.value.trim();

    if (provider !== "mock" && !key) {
      showToast("API Key를 입력해주세요.");
      return;
    }

    localStorage.setItem("ai-provider", provider);
    localStorage.setItem("ai-api-key", key);

    updateConnectionStatus();
    showToast("AI 설정이 저장되었습니다.");
  };

  // Update Status Display
  function updateConnectionStatus() {
    const provider = localStorage.getItem("ai-provider") || "mock";
    const key = localStorage.getItem("ai-api-key") || "";

    if (provider === "mock") {
      badge.textContent = "데모 모드";
      badge.className = "demo-badge connected";
      copy.textContent = "기본 내장된 데모 시나리오로 대화 중입니다.";
    } else {
      if (key) {
        badge.textContent = provider === "gemini" ? "Gemini 연결됨" : "OpenAI 연결됨";
        badge.className = "demo-badge connected";
        copy.textContent = `${provider === "gemini" ? "Google Gemini" : "OpenAI GPT"} 모델과 실시간 연결되어 있습니다.`;
      } else {
        badge.textContent = "연결 안됨";
        badge.className = "demo-badge not-configured";
        copy.textContent = "API Key 설정이 필요합니다.";
      }
    }
  }
  updateConnectionStatus();

  // Initialize Welcome Message if empty
  if (messagesContainer.children.length === 0) {
    appendChatMessage("assistant", `안녕하세요! 주은혜교회 수련회 운영 도우미입니다. ✦\n자연어로 참석 현황을 조회하거나 가족의 입소 완료 상태 등을 변경해 드립니다.\n\n**[테스트할 수 있는 예시 명령어]**\n1. "오늘 입소 예정인 가족 알려줘"\n2. "이정민 가족의 현재 상태 알려줘"\n3. "이정민 가족 참석 완료 처리해줘"`);
  }

  // Handle Form Submission
  if (!isChatbotInitialized) {
    chatForm.onsubmit = async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = "";
      await sendMessageToAI(text);
    };

    // Handle Suggestions clicking
    suggestions.onclick = async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const prompt = btn.dataset.chatPrompt;
      if (prompt) {
        await sendMessageToAI(prompt);
      }
    };

    isChatbotInitialized = true;
  }
}

function appendChatMessage(sender, text) {
  const container = document.querySelector("#chatbotMessages");
  if (!container) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-message ${sender === "user" ? "user" : "assistant"}`;

  const formattedText = text.replace(/\n/g, "<br>");

  if (sender === "user") {
    msgDiv.innerHTML = `
      <div class="chat-message-bubble">${text}</div>
    `;
  } else {
    msgDiv.innerHTML = `
      <div class="chat-message-avatar">✦</div>
      <div class="chat-message-bubble">${formattedText}</div>
    `;
  }

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
  return msgDiv;
}

function cleanJsonResponse(rawText) {
  let clean = rawText.trim();
  if (clean.startsWith("```json")) {
    clean = clean.substring(7);
  } else if (clean.startsWith("```")) {
    clean = clean.substring(3);
  }
  if (clean.endsWith("```")) {
    clean = clean.substring(0, clean.length - 3);
  }
  return clean.trim();
}

async function sendMessageToAI(userText) {
  const chatInput = document.querySelector("#chatbotInput");
  const sendBtn = document.querySelector("#chatbotForm button[type='submit']");
  
  if (chatInput) chatInput.disabled = true;
  if (sendBtn) sendBtn.disabled = true;

  appendChatMessage("user", userText);

  const loadingMsg = appendChatMessage("assistant", "AI 비서가 답변을 생각하는 중입니다...");
  loadingMsg.classList.add("loading");

  const provider = localStorage.getItem("ai-provider") || "mock";
  const apiKey = localStorage.getItem("ai-api-key") || "";

  try {
    let reply = "";
    let actions = [];

    if (provider !== "mock" && !apiKey) {
      throw new Error("API Key가 필요합니다. 가이드 우측 하단에서 설정해 주세요.");
    }

    if (provider === "mock") {
      // MOCK Scenario Generator
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network lag
      
      const query = userText.toLowerCase().replace(/\s+/g, "");

      // Multi-action parser in Demo Mode!
      let mockReplies = [];
      let mockActions = [];

      if (query.includes("최종범")) {
        const status = query.includes("퇴소") ? "leave" : query.includes("불참") ? "absent" : query.includes("예정") ? "late" : "stay";
        const statusLabel = { stay: "입소 완료", late: "입소 예정", leave: "퇴소 완료", absent: "전체 불참" }[status];
        const family = families.find(f => f.leader === "최종범" || f.name === "최종범");
        if (family) {
          mockReplies.push(`- **최종범** 가족 상태 변경 ➡️ **${statusLabel}** (stay)`);
          mockActions.push({ type: "update_status", params: { familyId: family.id, status } });
        }
      }

      if (query.includes("박영재")) {
        const status = query.includes("퇴소") ? "leave" : query.includes("불참") ? "absent" : query.includes("예정") ? "late" : "stay";
        const statusLabel = { stay: "입소 완료", late: "입소 예정", leave: "퇴소 완료", absent: "전체 불참" }[status];
        const family = families.find(f => f.leader === "박영재" || f.name === "박영재");
        if (family) {
          mockReplies.push(`- **박영재** 가족 상태 변경 ➡️ **${statusLabel}** (leave)`);
          mockActions.push({ type: "update_status", params: { familyId: family.id, status } });
        }
      }

      if (mockReplies.length > 0) {
        reply = `🎯 **데모 모드 다중 상태 변경 완료**:\n\n${mockReplies.join("\n")}\n\n즉시 대시보드가 성공적으로 리렌더링되었습니다! 🚀`;
        actions = mockActions;
      } else if (query.includes("입소예정") || query.includes("예정가족") || query.includes("늦은입소")) {
        const lateList = families.filter(f => f.status === "late");
        if (lateList.length === 0) {
          reply = "현재 입소 예정(대기) 상태인 가족이 없습니다. 모두 입소 완료하셨습니다!";
        } else {
          reply = `현재 **입소 예정(대기)** 상태인 가족은 총 **${lateList.length}가족**입니다:\n\n` + 
            lateList.map(f => `- **${f.name}** 가족 (대표: ${f.leader}, 연락처: ${f.phone})`).join("\n") +
            `\n\n특정 가족을 참석 처리하려면 \`"[가족이름] 가족 참석 처리해줘"\` 라고 입력해 보세요.`;
        }
      } else if (query.includes("참석") || query.includes("완료") || query.includes("입소완료")) {
        // Find family name
        let matchedFamily = null;
        for (const f of families) {
          const nameClean = f.name.toLowerCase().replace(/\s+/g, "");
          const leaderClean = f.leader.toLowerCase().replace(/\s+/g, "");
          if (query.includes(nameClean) || query.includes(leaderClean)) {
            matchedFamily = f;
            break;
          }
        }

        if (matchedFamily) {
          reply = `**${matchedFamily.name}** 가족의 현재 입소 상태를 **[입소 완료]**로 변경 요청을 수행합니다. 즉시 대시보드가 리렌더링되었습니다! 🚀\n\n- **가족**: ${matchedFamily.name}\n- **대표자**: ${matchedFamily.leader}\n- **상태 변경**: 입소 예정 ➡️ **입소 완료 (stay)**`;
          actions.push({
            type: "update_status",
            params: {
              familyId: matchedFamily.id,
              status: "stay"
            }
          });
        } else {
          reply = "참석 처리할 가족을 데이터베이스에서 찾을 수 없습니다. 정확한 가족 대표자 또는 가족 이름을 입력해 주세요. (예: '이정민 가족 참석 완료 처리해줘')";
        }
      } else if (query.includes("상태") || query.includes("현황")) {
        // Find if they are asking about a specific family
        let matchedFamily = null;
        for (const f of families) {
          const nameClean = f.name.toLowerCase().replace(/\s+/g, "");
          const leaderClean = f.leader.toLowerCase().replace(/\s+/g, "");
          if (query.includes(nameClean) || query.includes(leaderClean)) {
            matchedFamily = f;
            break;
          }
        }

        if (matchedFamily) {
          const statusK = { stay: "입소 완료 (stay)", late: "입소 예정 (late)", leave: "퇴소 완료 (leave)", absent: "전체 불참 (absent)" }[matchedFamily.status];
          reply = `🔍 **${matchedFamily.name}** 가족의 실시간 데이터 조회 결과입니다:\n\n- **가족명**: ${matchedFamily.name}\n- **대표자**: ${matchedFamily.leader} (${matchedFamily.phone})\n- **인원수**: 성인 ${matchedFamily.members.filter(m => m[1] === "성인 남성" || m[1] === "성인 여성").length}명, 자녀 ${matchedFamily.members.filter(m => m[1] !== "성인 남성" && m[1] !== "성인 여성").length}명\n- **현재 상태**: **${statusK}**\n- **회비 완납 여부**: ${matchedFamily.feeStatus === "paid" ? "완납 🟢" : "미납 🟡"}\n- **방 배정**: ${matchedFamily.room}`;
        } else {
          // General status
          const total = families.length;
          const stay = families.filter(f => f.status === "stay").length;
          const late = families.filter(f => f.status === "late").length;
          const leave = families.filter(f => f.status === "leave").length;
          const absent = families.filter(f => f.status === "absent").length;
          
          reply = `📊 **실시간 수련회 대시보드 요약 정보**입니다:\n\n- **총 등록 가족**: ${total}가족\n- **입소 완료 (stay)**: ${stay}가족 🟢\n- **입소 예정 (late)**: ${late}가족 🟡\n- **퇴소 완료 (leave)**: ${leave}가족 ⚪\n- **전체 불참 (absent)**: ${absent}가족 🔴\n\n특정 가족의 자세한 개별 상태나 상태 변경은 자연어로 질문해 주시면 조치해 드립니다.`;
        }
      } else if (query.includes("날씨") || query.includes("비") || query.includes("기온") || query.includes("기상") || query.includes("하늘")) {
        reply = `🌤️ **실시간 수련회장(가평) 날씨 및 요약 정보**입니다:\n\n- **현재 날씨**: 구름 조금, 아주 맑고 쾌청함 ☀️\n- **현재 기온**: 26.5°C (최고 29°C / 최저 18°C)\n- **강수 확률**: 10% 미만 (야외 활동 대적합!)\n- **미세먼지**: 좋음 🟢\n- **운영팀 권장**: 한낮에는 자외선이 다소 강하므로 참가자들에게 선크림 지참과 충분한 수분 섭취를 안내해 주세요! 실시간 날씨는 가평 지역 기상 특보를 모니터링해 지속 업데이트하겠습니다.`;
      } else {
        reply = `죄송합니다. 데모 모드에서는 지정된 시나리오에 대해서만 대응합니다.\nGemini 또는 OpenAI API 키를 우측 가이드 하단에서 입력해 주시면, 자연어 질문에 무한한 실시간 맞춤형 분석 답변을 드릴 수 있습니다! 🙌\n\n**[질문 가능한 예시]**\n- "오늘 날씨 어때?" (데모 모드 지원)\n- "입소 예정 가족 알려줘"\n- "이정민 가족 현재 상태 알려줘"\n- "이정민 가족 참석 완료 처리해줘"`;
      }
    } else {
      // REAL LLM API CALL
      const systemPrompt = `너는 주은혜교회 수련회 운영을 돕는 AI 운영 도우미 비서이다.
현재 등록된 가족 데이터와 수련회 메타 데이터를 기반으로 사용자의 자연어 질문에 답변하고, 필요 시 가족의 상태를 변경할 수 있다.

[현재 수련회 정보]
- 수련회명: ${retreatConfig ? retreatConfig.title : "주은혜교회 수련회"}
- 장소 및 일정: ${retreatConfig ? retreatConfig.location : "확인 중"}

[가족 데이터 JSON]
${JSON.stringify(families.map(f => ({
  id: f.id,
  name: f.name,
  leader: f.leader,
  phone: f.phone,
  status: f.status, // stay: 입소 완료, late: 입소 예정, leave: 퇴소 완료, absent: 전체 불참
  members: f.members.map(m => ({ name: m[0], role: m[1] })),
  fee: f.fee,
  feeStatus: f.feeStatus, // pending: 납입 예정, paid: 완납
  room: f.room || "미배정"
})))}

[가족 상태 값 정의]
- stay: "입소 완료"
- late: "입소 예정"
- leave: "퇴소 완료"
- absent: "전체 불참"

[수행 가능 동작 (actions)]
만약 사용자가 가족의 상태를 변경해달라고 명시적으로 요청하면(예: "최종범 가족 참석 완료로, 박영재 가족 퇴소 완료로", "이정민 가족 참석 처리해줘"), JSON 응답에 아래 형식의 actions 배열(또는 단수형 action 객체)을 포함해야 한다:
{
  "reply": "사용자에게 보낼 친절하고 명확한 한국어 답변 메시지. 마크다운 형식을 사용하여 깔끔하게 작성해줘. (예: 표, 불릿 포인트 등)",
  "actions": [
    {
      "type": "update_status",
      "params": {
        "familyId": "가족ID (문자열)",
        "status": "변경할상태코드 (stay, late, leave, absent 중 하나)"
      }
    }
  ]
}
*상태를 변경하는 요청이 아니라 단순 질문(예: "입소 예정인 가족 누구야?")인 경우 actions 필드는 빈 배열 [] 이거나 action 필드가 null이어야 한다.*

[추가 가이드라인]
사용자가 날씨, 기본 인사, 수련회 일정 등 등록자 명단 이외의 일상적인 대화나 실시간 기상 관련 질문을 하는 경우, 수련회 운영 스태프 비서로서 정중하고 친근하게 재치 있게 답변해라.
예 (날씨 질문): "수련회장인 가평의 기상 관측기에 직접 연동되어 있지는 않지만, 오늘 가평 하늘은 매우 푸르고 맑습니다! ☀️ 낮 기온은 최고 29°C까지 올라 야외 활동에 딱 좋은 날씨입니다. 즐거운 수련회 되세요!"

[응답 형식]
반드시 아래 형식의 유효한 JSON 객체로만 응답해야 한다. 추가적인 텍스트(마크다운 코드 블록 등)는 절대 포함하지 마라.
{
  "reply": "사용자에게 보낼 친절한 한국어 답변 메시지",
  "actions": []
}`;

      let parsed = null;

      if (provider === "gemini") {
        const GEMINI_MODELS = [
          "gemini-3.5-flash",
          "gemini-3.1-flash-lite",
          "gemini-3.1-pro"
        ];
        
        let response = null;
        let lastError = null;
        
        for (const modelId of GEMINI_MODELS) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
            response = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  { parts: [{ text: systemPrompt + `\n\n사용자 질문: ${userText}` }] }
                ],
                generationConfig: {
                  responseMimeType: "application/json"
                }
              })
            });
            
            if (response.ok) {
              lastError = null;
              break;
            } else {
              const errText = await response.text();
              lastError = new Error(`Gemini API 통신 실패 (${modelId}): ${response.status}. ${errText}`);
              console.warn(lastError.message);
            }
          } catch (e) {
            lastError = e;
            console.warn(`Gemini API 연결 실패 (${modelId}):`, e);
          }
        }
        
        if (lastError) {
          throw lastError;
        }

        const resJson = await response.json();
        const textResponse = resJson.candidates[0].content.parts[0].text;
        parsed = JSON.parse(cleanJsonResponse(textResponse));
      } else {
        // OpenAI GPT-4o-mini
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userText }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenAI API 통신 실패: ${response.status}. ${errText}`);
        }

        const resJson = await response.json();
        const textResponse = resJson.choices[0].message.content;
        parsed = JSON.parse(cleanJsonResponse(textResponse));
      }

      // Defensive Parsing of AI Response
      if (parsed) {
        if (parsed.reply) reply = parsed.reply;
        else if (parsed.answer) reply = parsed.answer;
        else if (parsed.message) reply = parsed.message;
        else if (parsed.response) reply = parsed.response;
        else if (parsed.text) reply = parsed.text;

        if (!reply) {
          const findKey = (obj, keyName) => {
            if (typeof obj !== "object" || obj === null) return null;
            if (obj[keyName]) return obj[keyName];
            for (const k in obj) {
              const res = findKey(obj[k], keyName);
              if (res) return res;
            }
            return null;
          };
          reply = findKey(parsed, "reply") || findKey(parsed, "message") || findKey(parsed, "answer") || JSON.stringify(parsed);
        }

        // Extract action objects
        if (parsed.action && typeof parsed.action === "object") {
          actions.push(parsed.action);
        }
        if (Array.isArray(parsed.actions)) {
          actions.push(...parsed.actions);
        }
        
        // Plural recursive fallback
        if (actions.length === 0) {
          const findActions = (obj) => {
            if (typeof obj !== "object" || obj === null) return;
            if (obj.type && obj.params) {
              actions.push(obj);
              return;
            }
            for (const k in obj) {
              findActions(obj[k]);
            }
          };
          findActions(parsed);
        }
      }
    }

    // Process Actions recursively if any found
    if (actions.length > 0) {
      let updatedCount = 0;
      for (const act of actions) {
        if (act && act.type === "update_status" && act.params) {
          const { familyId, status } = act.params;
          
          // Match by ID, name, or leader robustly with loose types and suffix-cleansing (e.g., "가족", spaces)
          const existingIndex = families.findIndex(f => {
            const cleanId = String(familyId || "").toLowerCase().replace(/\s+/g, "").replace("가족", "");
            const cleanName = String(f.name || "").toLowerCase().replace(/\s+/g, "").replace("가족", "");
            const cleanLeader = String(f.leader || "").toLowerCase().replace(/\s+/g, "").replace("가족", "");
            return (
              f.id == familyId ||
              f.name === familyId ||
              f.leader === familyId ||
              (cleanId && (
                cleanName === cleanId ||
                cleanLeader === cleanId ||
                cleanName.includes(cleanId) ||
                cleanId.includes(cleanName) ||
                cleanLeader.includes(cleanId) ||
                cleanId.includes(cleanLeader)
              ))
            );
          });
          
          if (existingIndex >= 0) {
            const family = families[existingIndex];
            family.status = status;

            // Sync with Supabase DB
            const dbFamily = { ...family };
            const feeInfo = {
              fee: family.fee,
              feeStatus: family.feeStatus,
              room: family.room
            };
            const cleanMemo = family.memo === "별도 메모 없음" ? "" : family.memo;
            dbFamily.memo = `${cleanMemo}\n__FEE_INFO__:${JSON.stringify(feeInfo)}`;
            
            delete dbFamily.fee;
            delete dbFamily.feeStatus;
            delete dbFamily.room;

            if (supabaseClient) {
              try {
                const { error } = await supabaseClient.from("families").upsert([dbFamily]);
                if (error) throw error;
                console.log("Supabase 상태 변경 성공:", family.name, status);
              } catch (dbErr) {
                console.error("Supabase 업데이트 에러:", dbErr);
              }
            }
            updatedCount++;
          }
        }
      }
      
      if (updatedCount > 0) {
        // Instant UI Updates
        renderAll();
      }
    }

    // Replace loading message with the real answer safely
    loadingMsg.classList.remove("loading");
    const bubble = loadingMsg.querySelector(".chat-message-bubble");
    bubble.innerHTML = (reply || "성공적으로 요청을 수행했습니다.").replace(/\n/g, "<br>");

  } catch (error) {
    console.error("AI 챗봇 처리 에러:", error);
    loadingMsg.classList.remove("loading");
    const bubble = loadingMsg.querySelector(".chat-message-bubble");
    bubble.textContent = `❌ 오류 발생: ${error.message}`;
  } finally {
    if (chatInput) chatInput.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
    if (chatInput) chatInput.focus();
  }
}

setViewMode(localStorage.getItem("retreat-view-mode") || (window.matchMedia("(max-width: 800px)").matches ? "mobile" : "desktop"), false);

loadRetreatConfig()
  .then(async (config) => {
    applyRetreatConfig(config);
    await Promise.all([
      loadChurchFamilyDb(),
      loadFamiliesFromSupabase()
    ]);
    renderAll();
  })
  .catch((error) => {
    document.querySelector("#retreatTitle").textContent = "수련회 설정 확인 필요";
    document.querySelector("#retreatMeta").textContent = error.message;
    showToast(error.message);
  });

// ==========================================
// EXCEL EXPORT FUNCTIONALITY
// ==========================================
function downloadList() {
  if (!window.XLSX) {
    showToast("엑셀 라이브러리가 로드되지 않았습니다. 잠시만 기다려주세요.");
    return;
  }
  if (currentOrgMode === "family") {
    downloadFamilyList();
  } else if (currentOrgMode === "sister") {
    downloadOrgList("sister");
  } else if (currentOrgMode === "brother") {
    downloadOrgList("brother");
  } else if (currentOrgMode === "school") {
    downloadSchoolList();
  }
}

const birthYearMapping = {
  2008: { label: "고3", category: "중고등부", weight: 1, color: "#334155" },
  2009: { label: "고2", category: "중고등부", weight: 2, color: "#475569" },
  2010: { label: "고1", category: "중고등부", weight: 3, color: "#64748b" },
  2011: { label: "중3", category: "중고등부", weight: 4, color: "#78909c" },
  2012: { label: "중2", category: "중고등부", weight: 5, color: "#90a4ae" },
  2013: { label: "중1", category: "중고등부", weight: 6, color: "#b0bec5" },
  
  2014: { label: "초6", category: "초등부", weight: 11, color: "#8C6615" },
  2015: { label: "초5", category: "초등부", weight: 12, color: "#A37B24" },
  2016: { label: "초4", category: "초등부", weight: 13, color: "#BCA362" },
  
  2017: { label: "초3", category: "유년부", weight: 21, color: "#184E3A" },
  2018: { label: "초2", category: "유년부", weight: 22, color: "#346C55" },
  2019: { label: "초1", category: "유년부", weight: 23, color: "#558C73" },
  
  2020: { label: "7세", category: "유치부2", weight: 31, color: "#964F65" },
  2021: { label: "6세", category: "유치부2", weight: 32, color: "#AC6D80" },
  2022: { label: "5세", category: "유치부1", weight: 41, color: "#C18B9A" },
  2023: { label: "4세", category: "유치부1", weight: 42, color: "#D5ACB6" },
  
  2024: { label: "3세", category: "유아", weight: 51, color: "#5F8B77" },
  2025: { label: "2세", category: "유아", weight: 52, color: "#7FA894" },
  2026: { label: "1세", category: "유아", weight: 53, color: "#9ABFB0" },
};

function getChildBirthYear(childName, familyName) {
  const searchChild = normalizeName(childName);
  
  const familyRow = churchFamilyDb.find(row => {
    return Object.keys(row).some(key => {
      if (key.match(/자녀|아이|아들|딸/) && !key.match(/생년월일|연락처|나이/)) {
        return normalizeName(row[key]) === searchChild;
      }
      return false;
    });
  });
  
  if (familyRow) {
    const key = Object.keys(familyRow).find(key => {
      return key.match(/자녀|아이|아들|딸/) && !key.match(/생년월일|연락처|나이/) && normalizeName(familyRow[key]) === searchChild;
    });
    if (key) {
      const childNumber = key.match(/^\d+/)?.[0];
      const birthDateKey = Object.keys(familyRow).find((k) => k.startsWith(childNumber + "-") && k.includes("생년월일"));
      const birthDateStr = birthDateKey ? familyRow[birthDateKey].trim() : "";
      if (birthDateStr) {
        // 구분 기호(.-/)를 기준으로 분리하여 첫 번째 요소에서 연도 추출
        const dateParts = birthDateStr.split(/[\.\-\/]/).map(p => p.trim());
        if (dateParts.length > 0) {
          const firstPart = dateParts[0].replace(/\D/g, "");
          if (firstPart.length === 4) {
            return Number(firstPart);
          } else if (firstPart.length === 2) {
            const yy = Number(firstPart);
            return (yy >= 0 && yy <= 26) ? 2000 + yy : 1900 + yy;
          }
        }
        // 구분 기호가 없는 순수 숫자 형태 대비 폴백
        const digits = birthDateStr.replace(/\D/g, "");
        if (digits.length === 8) return Number(digits.slice(0, 4));
        if (digits.length === 6) {
          const yy = Number(digits.slice(0, 2));
          return (yy >= 0 && yy <= 26) ? 2000 + yy : 1900 + yy;
        }
      }
    }
  }
  return null;
}

function renderSchoolView() {
  const container = document.querySelector("#schoolListContainer");
  const statsBar = document.querySelector("#schoolStatsBar");
  if (!container) return;
  
  const activeChildren = [];
  families.forEach((family) => {
    if (family.status === "absent") return;
    
    family.members.forEach((member) => {
      const name = member[0];
      const group = member[1];
      const isUndecided = member[7] === "undecided";
      const isAbsent = !isUndecided && getMemberAttendancePeriods(member).length === 0;
      
      const isTargetChild = ["중고등부", "초등부", "유년부", "유치부", "유아"].includes(group);
      
      if (isTargetChild && !isUndecided && !isAbsent) {
        if (selectedSchoolTimeSlot) {
          const periods = getMemberAttendancePeriods(member);
          if (!periods.includes(selectedSchoolTimeSlot)) {
            return;
          }
        }
        const birthYear = getChildBirthYear(name, family.name);
        
        let mapping = birthYear ? birthYearMapping[birthYear] : null;
        if (!mapping) {
          if (group === "중고등부") {
            mapping = { label: "미정", category: "중고등부", weight: 10, color: "#94a3b8" };
          } else if (group === "초등부") {
            mapping = { label: "미정", category: "초등부", weight: 20, color: "#94a3b8" };
          } else if (group === "유년부") {
            mapping = { label: "미정", category: "유년부", weight: 30, color: "#94a3b8" };
          } else if (group === "유치부") {
            mapping = { label: "미정", category: "유치부", weight: 45, color: "#94a3b8" };
          } else {
            mapping = { label: "미정", category: "유아", weight: 60, color: "#94a3b8" };
          }
        }
        
        activeChildren.push({
          name,
          group,
          birthYear,
          mapping,
          familyName: family.name,
          leader: family.leader
        });
      }
    });
  });
  
  let stats = {
    youth: 0,
    elem: 0,
    junior: 0,
    kinder: 0,
    toddler: 0
  };
  
  activeChildren.forEach(child => {
    const cat = child.mapping.category;
    if (cat === "중고등부") stats.youth++;
    else if (cat === "초등부") stats.elem++;
    else if (cat === "유년부") stats.junior++;
    else if (cat === "유치부1" || cat === "유치부2" || child.group === "유치부") stats.kinder++;
    else stats.toddler++;
  });
  
  const deptColors = {
    all: "#184E3A",
    youth: "#475569",
    elem: "#A37B24",
    junior: "#184E3A",
    kinder: "#AC6D80",
    toddler: "#5F8B77"
  };

  const getSpanStyle = (filterKey) => {
    const isActive = selectedSchoolDeptFilter === filterKey;
    const color = deptColors[filterKey] || "#184E3A";
    return `
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      ${isActive ? `background: ${color}; color: #ffffff; font-weight: 800; border: 1px solid ${color};` : "background: #ffffff; color: var(--muted); border: 1px solid var(--line);"}
    `;
  };

  statsBar.innerHTML = `
    <span class="school-stat-filter-chip" data-filter="all" style="${getSpanStyle("all")}">
      ${selectedSchoolDeptFilter === "all" ? '<span style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff; display: inline-block;"></span>' : '<span style="width: 8px; height: 8px; border-radius: 50%; background: #184E3A; display: inline-block;"></span>'}
      <strong>🏫 총 참석 자녀:</strong>&nbsp;${activeChildren.length}명
    </span>
    <span style="color: #cbd5e1; align-self: center;">|</span>
    <span class="school-stat-filter-chip" data-filter="youth" style="${getSpanStyle("youth")}">
      ${selectedSchoolDeptFilter === "youth" ? '<span style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff; display: inline-block;"></span>' : '<span style="width: 8px; height: 8px; border-radius: 50%; background: #475569; display: inline-block;"></span>'}
      중고등부:&nbsp;${stats.youth}명
    </span>
    <span style="color: #cbd5e1; align-self: center;">|</span>
    <span class="school-stat-filter-chip" data-filter="elem" style="${getSpanStyle("elem")}">
      ${selectedSchoolDeptFilter === "elem" ? '<span style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff; display: inline-block;"></span>' : '<span style="width: 8px; height: 8px; border-radius: 50%; background: #A37B24; display: inline-block;"></span>'}
      초등부:&nbsp;${stats.elem}명
    </span>
    <span style="color: #cbd5e1; align-self: center;">|</span>
    <span class="school-stat-filter-chip" data-filter="junior" style="${getSpanStyle("junior")}">
      ${selectedSchoolDeptFilter === "junior" ? '<span style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff; display: inline-block;"></span>' : '<span style="width: 8px; height: 8px; border-radius: 50%; background: #184E3A; display: inline-block;"></span>'}
      유년부:&nbsp;${stats.junior}명
    </span>
    <span style="color: #cbd5e1; align-self: center;">|</span>
    <span class="school-stat-filter-chip" data-filter="kinder" style="${getSpanStyle("kinder")}">
      ${selectedSchoolDeptFilter === "kinder" ? '<span style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff; display: inline-block;"></span>' : '<span style="width: 8px; height: 8px; border-radius: 50%; background: #AC6D80; display: inline-block;"></span>'}
      유치부:&nbsp;${stats.kinder}명
    </span>
    <span style="color: #cbd5e1; align-self: center;">|</span>
    <span class="school-stat-filter-chip" data-filter="toddler" style="${getSpanStyle("toddler")}">
      ${selectedSchoolDeptFilter === "toddler" ? '<span style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff; display: inline-block;"></span>' : '<span style="width: 8px; height: 8px; border-radius: 50%; background: #5F8B77; display: inline-block;"></span>'}
      유아부:&nbsp;${stats.toddler}명
    </span>
    <span style="color: #cbd5e1; align-self: center; margin: 0 4px;">|</span>
    <div id="schoolTimeFilterContainer" style="display: inline-flex; align-items: center; gap: 6px; padding-left: 8px; margin-left: 4px;">
      <span style="font-size: 10px; font-weight: 800; color: #475569;">⏳ 시간대 필터:</span>
      <div class="attendance-days" id="schoolTimeFilterDays" style="display: flex; gap: 4px;"></div>
      <button id="clearSchoolTimeFilter" style="background: #fee2e2; border: 1px solid #fecaca; color: #ef4444; font-size: 9px; font-weight: 800; cursor: pointer; padding: 3px 6px; border-radius: 4px; height: 26px;">❌ 해제</button>
    </div>
  `;
  renderSchoolTimeFilter();
  
  if (activeChildren.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #64748b; font-size: 14px;">
        참석하는 교회학교 자녀가 없습니다.
      </div>
    `;
    return;
  }
  
  const departments = [
    { key: "중고등부", label: "중고등부", color: "#475569", children: [] },
    { key: "초등부", label: "초등부", color: "#A37B24", children: [] },
    { key: "유년부", label: "유년부", color: "#184E3A", children: [] },
    { key: "유치부", label: "유치부", color: "#AC6D80", children: [] },
    { key: "유아", label: "유아부", color: "#5F8B77", children: [] },
  ];
  
  activeChildren.forEach(child => {
    let deptKey = child.mapping.category;
    if (deptKey === "유치부1" || deptKey === "유치부2") {
      deptKey = "유치부";
    }
    const dept = departments.find(d => d.key === deptKey || (deptKey === "유치부" && d.key === "유치부") || (deptKey === "유아" && d.key === "유아"));
    if (dept) {
      dept.children.push(child);
    } else {
      const fallbackDept = departments.find(d => d.key === child.group) || departments[departments.length - 1];
      fallbackDept.children.push(child);
    }
  });
  
  const deptCardsHtml = departments.map(dept => {
    if (selectedSchoolDeptFilter !== "all") {
      let matched = false;
      if (selectedSchoolDeptFilter === "youth" && dept.key === "중고등부") matched = true;
      if (selectedSchoolDeptFilter === "elem" && dept.key === "초등부") matched = true;
      if (selectedSchoolDeptFilter === "junior" && dept.key === "유년부") matched = true;
      if (selectedSchoolDeptFilter === "kinder" && dept.key === "유치부") matched = true;
      if (selectedSchoolDeptFilter === "toddler" && dept.key === "유아") matched = true;
      if (!matched) return "";
    }
    
    if (dept.children.length === 0) return "";
    
    const grouped = {};
    dept.children.forEach(child => {
      let label = child.mapping.label;
      let mapping = child.mapping;
      if (dept.key === "유치부") {
        if (child.mapping.category === "유치부1") {
          label = "돌봄1";
          mapping = { label: "돌봄1", category: "유치부1", weight: 41, color: "#C18B9A" };
        } else if (child.mapping.category === "유치부2") {
          label = "돌봄2";
          mapping = { label: "돌봄2", category: "유치부2", weight: 31, color: "#AC6D80" };
        } else {
          label = "돌봄 미정";
          mapping = { label: "돌봄 미정", category: "유치부", weight: 45, color: "#94a3b8" };
        }
      }
      if (!grouped[label]) {
        grouped[label] = {
          label,
          mapping: mapping,
          members: []
        };
      }
      grouped[label].members.push(child);
    });
    
    const sortedGroups = Object.values(grouped).sort((a, b) => a.mapping.weight - b.mapping.weight);
    
    return `
      <div class="school-department-row">
        <h3 class="school-dept-title" style="margin: 20px 0 10px 0; display: flex; align-items: center; gap: 8px;">
          <span style="width: 8px; height: 16px; background: ${dept.color}; border-radius: 3px; display: inline-block;"></span>
          <span>${dept.label} / ${dept.children.length} students</span>
        </h3>
        <div class="school-cards-container">
          ${sortedGroups.map(group => {
            group.members.sort((a, b) => a.name.localeCompare(b.name, "ko"));
            
            return `
              <div class="school-card" style="border-top: 3px solid ${group.mapping.color};">
                <div class="school-card-header" style="color: ${group.mapping.color}; font-weight: 700; background: transparent; padding: 0 0 6px 0; text-shadow: none; border-bottom: 1px solid var(--line); border-radius: 0;">
                  <span>${group.label}</span>
                  <span style="font-size: 10px; color: var(--muted); font-weight: 500;">${group.members.length} students</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px;">
                  ${group.members.map(member => {
                    const parentShortName = member.leader.replace(" 가족", "");
                    const showAge = dept.key === "유치부" ? `${member.mapping.label.replace("세", "")}, ` : "";
                    return `
                      <span class="school-member-pill" title="가족: ${member.familyName}">
                        <strong>${member.name}</strong>
                        <span>(${showAge}${parentShortName})</span>
                      </span>
                    `;
                  }).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }).join("");

  const listChildren = [];
  departments.forEach(dept => {
    if (selectedSchoolDeptFilter !== "all") {
      let matched = false;
      if (selectedSchoolDeptFilter === "youth" && dept.key === "중고등부") matched = true;
      if (selectedSchoolDeptFilter === "elem" && dept.key === "초등부") matched = true;
      if (selectedSchoolDeptFilter === "junior" && dept.key === "유년부") matched = true;
      if (selectedSchoolDeptFilter === "kinder" && dept.key === "유치부") matched = true;
      if (selectedSchoolDeptFilter === "toddler" && dept.key === "유아") matched = true;
      if (!matched) return;
    }
    
    dept.children.forEach(c => listChildren.push(c));
  });
  
  listChildren.sort((a, b) => a.name.localeCompare(b.name, "ko"));

  let listHtml = "";
  if (selectedSchoolDeptFilter !== "all") {
    listHtml = `
      <style>
        .school-list-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          white-space: nowrap;
        }
        body.desktop-mode .school-list-table th,
        body.desktop-mode .school-list-table td {
          width: auto !important;
          min-width: 0 !important;
          padding: 10px 12px !important;
        }
        body.desktop-mode .school-list-table th:nth-child(1),
        body.desktop-mode .school-list-table td:nth-child(1) {
          width: 200px !important;
          min-width: 200px !important;
        }
        body.desktop-mode .school-list-table th:nth-child(2),
        body.desktop-mode .school-list-table td:nth-child(2) {
          width: 130px !important;
          min-width: 130px !important;
        }
        body.desktop-mode .school-list-table th:nth-child(3),
        body.desktop-mode .school-list-table td:nth-child(3) {
          width: 90px !important;
          min-width: 90px !important;
        }
        body.desktop-mode .school-list-table th:nth-child(4),
        body.desktop-mode .school-list-table td:nth-child(4) {
          width: 210px !important;
          min-width: 210px !important;
        }
        body.desktop-mode .school-list-table th:nth-child(5),
        body.desktop-mode .school-list-table td:nth-child(5) {
          width: 50px !important;
          min-width: 50px !important;
        }
        
        .school-attendance-badge {
          display: inline-block;
          padding: 5px 8px;
          border-radius: 15px;
          font-size: 10px;
          font-weight: 800;
          text-align: center;
          min-width: 54px;
          box-sizing: border-box;
        }
        .school-attendance-badge.full {
          color: #347150;
          background: #e2f3e8;
        }
        .school-attendance-badge.partial {
          color: #ad672f;
          background: #fff0df;
        }
        .school-attendance-badge.absent {
          color: #64748b;
          background: #f1f5f9;
        }
        .school-attendance-badge.undecided {
          color: #687873;
          background: #eef2f0;
        }
      </style>
      <div class="school-list-table-section" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--line);">
        <h3 style="font-size: 14px; font-weight: 800; color: #334155; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
          <span>📋 자녀 상세 명단</span>
          <span style="font-size: 11px; color: #94a3b8; font-weight: 500;">(${listChildren.length}명)</span>
        </h3>
        <div class="table-wrap">
          <table class="school-list-table">
            <thead>
              <tr>
                <th>자녀 정보</th>
                <th>소속 부서</th>
                <th>현재 상태</th>
                <th>참석 날짜</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              ${listChildren.map(child => {
                const family = families.find(f => f.name === child.familyName);
                const mother = family ? family.members.find(m => m[1] === "성인 여성") : null;
                const motherName = mother ? mother[0] : "";
                
                const memberObj = family ? family.members.find(m => normalizeName(m[0]) === normalizeName(child.name)) : null;
                let status = "partial";
                let statusLabel = "부분참석";
                if (!memberObj) {
                  status = "absent";
                  statusLabel = "불참";
                } else if (memberObj[7] === "undecided" || (family && family.status === "undecided")) {
                  status = "undecided";
                  statusLabel = "미정";
                } else {
                  const periods = getMemberAttendancePeriods(memberObj);
                  if (periods.length === 0) {
                    status = "absent";
                    statusLabel = "불참";
                  } else if (isMemberFullAttendance(memberObj)) {
                    status = "full";
                    statusLabel = "풀참";
                  }
                }
                
                let attendanceHtml = "-";
                if (memberObj) {
                  const periods = getMemberAttendancePeriods(memberObj);
                  const externalMeals = getMemberExternalMealPeriods(memberObj);
                  const isUndecided = memberObj[7] === "undecided" || (family && family.status === "undecided");
                  
                  const squares = renderDaySquares(periods, externalMeals, "", isUndecided);
                  attendanceHtml = `
                    <div class="family-attendance-summary" style="grid-template-columns: 1fr;">
                      <div class="family-schedule-groups">
                        <div class="family-schedule-group" style="grid-template-columns: 1fr;">
                          <div class="family-day-squares">${squares}</div>
                        </div>
                      </div>
                    </div>
                  `;
                }
                
                return `
                  <tr>
                    <td class="family-cell" data-label="자녀">
                      <b>${child.name}</b>
                      <span>${motherName ? `${motherName} · ` : ""}${family ? family.phone : "-"}</span>
                    </td>
                    <td data-label="소속 부서">
                      <span class="member-pill child" style="font-weight: 800; font-size: 10px;">${child.group}</span>
                      <span style="font-size: 10px; color: #718078;">(${child.mapping.label})</span>
                    </td>
                    <td data-label="현재 상태">
                      <span class="school-attendance-badge ${status}">${statusLabel}</span>
                    </td>
                    <td class="schedule-cell" data-label="참석 날짜">
                      ${attendanceHtml}
                    </td>
                    <td class="table-row-action">
                      <button class="row-menu" data-family-id="${family ? family.id : ''}" aria-label="${family ? family.name : ''} 상세보기">···</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  container.innerHTML = deptCardsHtml + listHtml;
  if (window.lucide) lucide.createIcons();
}

function downloadSchoolList() {
  if (!window.XLSX) {
    showToast("엑셀 라이브러리가 로드되지 않았습니다.");
    return;
  }
  
  const activeChildren = [];
  families.forEach((family) => {
    if (family.status === "absent") return;
    family.members.forEach((member) => {
      const name = member[0];
      const group = member[1];
      const isUndecided = member[7] === "undecided";
      const isAbsent = !isUndecided && getMemberAttendancePeriods(member).length === 0;
      
      const isTargetChild = ["중고등부", "초등부", "유년부", "유치부", "유아"].includes(group);
      if (isTargetChild && !isUndecided && !isAbsent) {
        if (selectedSchoolTimeSlot) {
          const periods = getMemberAttendancePeriods(member);
          if (!periods.includes(selectedSchoolTimeSlot)) {
            return;
          }
        }
        if (selectedSchoolDeptFilter !== "all") {
          let matched = false;
          if (selectedSchoolDeptFilter === "youth" && group === "중고등부") matched = true;
          if (selectedSchoolDeptFilter === "elem" && group === "초등부") matched = true;
          if (selectedSchoolDeptFilter === "junior" && group === "유년부") matched = true;
          if (selectedSchoolDeptFilter === "kinder" && group === "유치부") matched = true;
          if (selectedSchoolDeptFilter === "toddler" && group === "유아") matched = true;
          if (!matched) return;
        }
        const birthYear = getChildBirthYear(name, family.name);
        let mapping = birthYear ? birthYearMapping[birthYear] : null;
        if (!mapping) {
          if (group === "중고등부") mapping = { label: "미정", category: "중고등부" };
          else if (group === "초등부") mapping = { label: "미정", category: "초등부" };
          else if (group === "유년부") mapping = { label: "미정", category: "유년부" };
          else if (group === "유치부") mapping = { label: "미정", category: "유치부" };
          else mapping = { label: "미정", category: "유아" };
        }
        activeChildren.push({ name, group, birthYear, mapping, familyName: family.name, room: family.room || "미배정", leader: family.leader });
      }
    });
  });
  
  if (activeChildren.length === 0) {
    showToast("다운로드할 데이터가 없습니다.");
    return;
  }
  
  activeChildren.sort((a, b) => {
    const wDiff = (a.mapping.weight || 99) - (b.mapping.weight || 99);
    if (wDiff !== 0) return wDiff;
    return a.name.localeCompare(b.name, "ko");
  });
  
  const data = activeChildren.map(child => {
    let label = child.mapping.label;
    if (child.group === "유치부" || child.mapping.category === "유치부1" || child.mapping.category === "유치부2") {
      if (child.mapping.category === "유치부1") {
        label = "돌봄1";
      } else if (child.mapping.category === "유치부2") {
        label = "돌봄2";
      } else {
        label = "돌봄 미정";
      }
    }
    return {
      "분류 / 학년": label,
      "이름": child.name,
      "소속 부서": child.group,
      "출생연도": child.birthYear || "미정",
      "방 배정": child.room,
      "가족 정보": child.familyName,
      "대표자": child.leader
    };
  });
  
  let timeLabel = "";
  if (selectedSchoolTimeSlot) {
    const [datePart, periodPart] = selectedSchoolTimeSlot.split("-");
    const dateObj = retreatDates.find(d => d.shortLabel === datePart);
    const periodMap = { breakfast: "아침", lunch: "점심", dinner: "저녁" };
    const periodKo = periodMap[periodPart] || periodPart;
    
    if (dateObj) {
      const match = dateObj.label.match(/(\d+월\s*\d+일)\s*([일월화수목금토])요일/);
      const dateKo = match ? `${match[1].replace(/\s+/g, "")}(${match[2]})` : dateObj.label;
      timeLabel = `_${dateKo} ${periodKo} 참석자`;
    } else {
      timeLabel = `_${datePart} ${periodKo} 참석자`;
    }
  }
  
  const deptMap = { youth: "중고등부", elem: "초등부", junior: "유년부", kinder: "유치부", toddler: "유아부" };
  const deptLabel = selectedSchoolDeptFilter !== "all" ? `_${deptMap[selectedSchoolDeptFilter]}` : "";
  const fileName = `교회학교${deptLabel}${timeLabel}_명단.xlsx`;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "교회학교 명단");
  
  const maxProps = ["분류 / 학년", "이름", "소속 부서", "출생연도", "방 배정", "가족 정보", "대표자"];
  worksheet["!cols"] = maxProps.map(prop => {
    let maxLen = prop.length * 2;
    data.forEach(item => {
      const val = String(item[prop] || "");
      const valLen = val.split("").reduce((acc, char) => acc + (char.charCodeAt(0) > 127 ? 2 : 1), 0);
      if (valLen > maxLen) maxLen = valLen;
    });
    return { wch: maxLen + 2 };
  });
  
  XLSX.writeFile(workbook, fileName);
  showToast(`${fileName} 파일이 다운로드되었습니다.`);
}

function downloadFamilyList() {
  const visibleFamilies = getFilteredFamilies();
  
  const filterLabels = {
    all: "전체",
    attending: "참석",
    full: "풀참석",
    partial: "부분참석",
    undecided: "미정"
  };
  const filterLabel = filterLabels[activeFilter] || "전체";
  const fileName = `가족별_${filterLabel}_명단.xlsx`;
  
  const data = visibleFamilies.map((family) => {
    const statusText = statusMap[family.status] ? statusMap[family.status][0] : family.status;
    
    // 구성원 요약 텍스트 빌드
    const memberSummary = family.members.map((m) => {
      const isUndecided = m[7] === "undecided";
      const isAbsent = !isUndecided && getMemberAttendancePeriods(m).length === 0;
      let statusStr = "부분참석";
      if (isUndecided) statusStr = "미정";
      else if (isAbsent) statusStr = "불참";
      else if (isMemberFullAttendance(m)) statusStr = "풀참";
      
      return `${m[0]}(${m[1]}/${statusStr})`;
    }).join(", ");
    
    // 참석 날짜 요약 빌드
    let dateSummary = "";
    const attendingPeriods = family.members.flatMap((m) => getMemberAttendancePeriods(m));
    const uniqueDays = [...new Set(attendingPeriods.map(p => p.split("-")[0]))];
    if (uniqueDays.length > 0) {
      dateSummary = uniqueDays.join(", ");
    }
    
    return {
      "가족명": family.name,
      "대표자": family.leader,
      "대표 연락처": family.phone,
      "구성원 명단": memberSummary,
      "참석 날짜": dateSummary,
      "총 회비 (원)": family.fee,
      "방 배정": family.room || "미배정",
      "상태": statusText,
      "메모": family.memo || ""
    };
  });

  if (data.length === 0) {
    showToast("다운로드할 데이터가 없습니다.");
    return;
  }
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "가족별 명단");
  
  // 열 넓이 자동 조정
  const maxProps = ["가족명", "대표자", "대표 연락처", "구성원 명단", "참석 날짜", "방 배정", "상태", "메모"];
  worksheet["!cols"] = maxProps.map(prop => {
    let maxLen = prop.length * 2;
    data.forEach(item => {
      const val = String(item[prop] || "");
      const valLen = val.split("").reduce((acc, char) => acc + (char.charCodeAt(0) > 127 ? 2 : 1), 0);
      if (valLen > maxLen) maxLen = valLen;
    });
    return { wch: maxLen + 2 };
  });
  
  XLSX.writeFile(workbook, fileName);
  showToast(`${fileName} 파일이 다운로드되었습니다.`);
}

function downloadOrgList(genderMode) {
  const isSister = genderMode === "sister";
  const groupsData = isSister ? sisterGroupsData : brotherGroupsData;
  const staffData = isSister ? sisterStaffData : brotherStaffData;
  const groupFilter = isSister ? "성인 여성" : "성인 남성";
  const tabName = isSister ? "자매조" : "형제조";
  
  const filterLabels = {
    all: "전체",
    attended: "전체참석",
    registered: "참석자만",
    unregistered: "미등록자",
    not_in_db: "미입력자",
    absent: "불참자",
    undecided: "미정자",
    full: "풀참가족",
    partial: "부분참석가족"
  };
  const filterLabel = filterLabels[orgActiveFilter] || "전체";
  
  let timeLabel = "";
  if (selectedOrgTimeSlot) {
    const [datePart, periodPart] = selectedOrgTimeSlot.split("-");
    const dateObj = retreatDates.find(d => d.shortLabel === datePart);
    const periodMap = { breakfast: "아침", lunch: "점심", dinner: "저녁" };
    const periodKo = periodMap[periodPart] || periodPart;
    
    if (dateObj) {
      const match = dateObj.label.match(/(\d+월\s*\d+일)\s*([일월화수목금토])요일/);
      const dateKo = match ? `${match[1].replace(/\s+/g, "")}(${match[2]})` : dateObj.label;
      timeLabel = `_${dateKo} ${periodKo} 참석자`;
    } else {
      timeLabel = `_${datePart} ${periodKo} 참석자`;
    }
  }
  
  const fileName = `${tabName}_${filterLabel}${timeLabel}_명단.xlsx`;
  
  const data = [];
  
  function addMemberRow(groupName, name, roleLabel) {
    if (!matchesOrgFilter(name, orgActiveFilter, groupFilter)) return;
    
    const att = getMemberAttendanceStatus(name, groupFilter);
    const family = getFamilyByMemberName(name, groupFilter);
    
    // 연락처 찾기
    let phone = family ? family.phone : "";
    if (!phone) {
      const dbRow = churchFamilyDb.find(row => {
        const key = Object.keys(row).find(k => normalizeName(row[k]) === normalizeName(name));
        return !!key;
      });
      if (dbRow) {
        const phoneKey = Object.keys(dbRow).find(k => k.match(/연락처|전화/));
        if (phoneKey) phone = dbRow[phoneKey];
      }
    }
    
    data.push({
      "구분 / 조": groupName,
      "이름": name,
      "역할": roleLabel || "조원",
      "소속": groupFilter,
      "수련회 참석 상태": att.label,
      "방 배정": family ? (family.room || "미배정") : "-",
      "대표 연락처": phone || "-",
      "총 회비 (원)": family ? family.fee : 0,
      "가족 정보": family ? family.name : "-"
    });
  }
  
  // 1. 임원 / 코디네이터 추가
  staffData.coordinators.forEach((c) => {
    addMemberRow("임원단", c.name, c.role);
  });
  
  // 2. 각 조 추가
  groupsData.forEach((group) => {
    addMemberRow(group.name, group.leader, "조장");
    group.members.forEach((m) => {
      addMemberRow(group.name, m, "조원");
    });
  });
  
  // 3. 기타 스태프 추가
  staffData.otherGroups.forEach((m) => {
    addMemberRow("기타 스태프", m, "스태프");
  });
  
  if (data.length === 0) {
    showToast("다운로드할 데이터가 없습니다.");
    return;
  }
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${tabName} 명단`);
  
  // 열 넓이 자동 조정
  const maxProps = ["구분 / 조", "이름", "역할", "소속", "수련회 참석 상태", "방 배정", "대표 연락처", "가족 정보"];
  worksheet["!cols"] = maxProps.map(prop => {
    let maxLen = prop.length * 2;
    data.forEach(item => {
      const val = String(item[prop] || "");
      const valLen = val.split("").reduce((acc, char) => acc + (char.charCodeAt(0) > 127 ? 2 : 1), 0);
      if (valLen > maxLen) maxLen = valLen;
    });
    return { wch: maxLen + 2 };
  });
  
  XLSX.writeFile(workbook, fileName);
  showToast(`${fileName} 파일이 다운로드되었습니다.`);
}
