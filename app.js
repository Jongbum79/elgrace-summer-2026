let retreatDates = [];
let retreatConfig = null;
let mealSchedule = [];
let churchFamilyDb = [];

const slots = ["08:00", "12:00", "18:00", "22:00"];
const categories = [
  { key: "adultM", label: "성인 남성", color: "#1e5a45" },
  { key: "adultF", label: "성인 여성", color: "#81a98e" },
  { key: "youth", label: "중·고등부", color: "#6c9ecf" },
  { key: "elementary", label: "초등부", color: "#e3bf62" },
  { key: "preschool", label: "유치부 이하", color: "#d9879f" },
];

const attendanceSeries = [
  [
    { time: "08:00", adultM: 18, adultF: 21, youth: 9, elementary: 8, preschool: 6 },
    { time: "12:00", adultM: 66, adultF: 79, youth: 34, elementary: 31, preschool: 22 },
    { time: "18:00", adultM: 91, adultF: 106, youth: 49, elementary: 42, preschool: 30 },
    { time: "22:00", adultM: 98, adultF: 116, youth: 54, elementary: 47, preschool: 33 },
  ],
  [
    { time: "08:00", adultM: 98, adultF: 116, youth: 54, elementary: 47, preschool: 33 },
    { time: "12:00", adultM: 106, adultF: 124, youth: 59, elementary: 51, preschool: 35 },
    { time: "18:00", adultM: 121, adultF: 136, youth: 64, elementary: 56, preschool: 38 },
    { time: "22:00", adultM: 125, adultF: 141, youth: 66, elementary: 58, preschool: 39 },
  ],
  [
    { time: "08:00", adultM: 124, adultF: 140, youth: 66, elementary: 58, preschool: 39 },
    { time: "12:00", adultM: 132, adultF: 147, youth: 69, elementary: 62, preschool: 41 },
    { time: "18:00", adultM: 129, adultF: 144, youth: 68, elementary: 61, preschool: 40 },
    { time: "22:00", adultM: 126, adultF: 141, youth: 67, elementary: 59, preschool: 38 },
  ],
  [
    { time: "08:00", adultM: 124, adultF: 139, youth: 66, elementary: 58, preschool: 38 },
    { time: "12:00", adultM: 119, adultF: 135, youth: 62, elementary: 54, preschool: 36 },
    { time: "18:00", adultM: 21, adultF: 24, youth: 7, elementary: 5, preschool: 3 },
    { time: "22:00", adultM: 0, adultF: 0, youth: 0, elementary: 0, preschool: 0 },
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
};

let selectedDate = "";
let selectedSlot = 2;
let activeFilter = "all";
let toastTimer;
let newMemberId = 0;
let dateDrag = null;
let editingFamilyId = null;

const childGroups = ["중고등부", "초등부", "유년부", "유치부", "유아"];
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
  document.querySelector("#directorName").textContent = config.director;
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
  const dayIndex = retreatDates.findIndex((date) => date.key === selectedDate);
  const enter = [318, 47, 22, 0][dayIndex] || 0;
  const exit = [0, 4, 7, 376][dayIndex] || 0;
  const stats = [
    ["현재 참석 인원", total(record), "명", `선택 시간 ${record.time}`, "♙"],
    ["오늘 입소 예정", enter, "명", dayIndex === 0 ? "오후 6시 이후 29명" : "추가 입소 포함", "↘"],
    ["오늘 퇴소 예정", exit, "명", exit ? "퇴소 시간 확인 필요" : "예정 없음", "↗"],
    ["오늘 최대 인원", peak, "명", `${data.find((item) => total(item) === peak).time} 예상`, "◷"],
  ];
  document.querySelector("#statsGrid").innerHTML = stats.map(([label, value, unit, caption, icon]) => `
    <article class="stat-card">
      <div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div>
      <div class="stat-value">${value}<small>${unit}</small><span class="stat-caption">${caption}</span></div>
    </article>`).join("");
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
  const grid = [0, 150, 300, 450].map((value) => `
    <line x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}" stroke="#edf2ef" />
    <text x="0" y="${y(value) + 4}" fill="#93a099" font-size="10">${value}</text>`).join("");
  const labels = data.map((item, index) => `
    <text x="${x(index)}" y="${height - 7}" text-anchor="middle" fill="#819088" font-size="10">${item.time}</text>`).join("");
  const dots = data.map((item, index) => `
    <circle cx="${x(index)}" cy="${y(total(item))}" r="${index === selectedSlot ? 6 : 4}" fill="${index === selectedSlot ? "#f7a45c" : "#1e5a45"}" stroke="white" stroke-width="3" />
    ${index === selectedSlot ? `<rect x="${x(index) - 23}" y="${y(total(item)) - 34}" width="46" height="21" rx="5" fill="#1e5a45" /><text x="${x(index)}" y="${y(total(item)) - 19}" text-anchor="middle" fill="white" font-size="10" font-weight="700">${total(item)}명</text>` : ""}`).join("");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML = `
    ${grid}
    <polygon points="${area}" fill="rgba(129,169,142,.12)" />
    <polyline points="${points}" fill="none" stroke="#1e5a45" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
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
  const gradients = categories.map((category) => {
    const start = offset;
    offset += record[category.key] / count * 100 || 0;
    return `${category.color} ${start}% ${offset}%`;
  });
  document.querySelector("#donutChart").style.background = `conic-gradient(${gradients.join(",")})`;
  document.querySelector("#donutTotal").textContent = count;
  document.querySelector("#breakdownTime").textContent = `${retreatDates.find((date) => date.key === selectedDate).label.replace("요일", "")} ${record.time} 기준`;
  document.querySelector("#breakdownList").innerHTML = categories.map((category) => `
    <div class="breakdown-item"><i style="background:${category.color}"></i><span>${category.label}</span><b>${record[category.key]}명</b></div>`).join("");
}

function getFilteredFamilies() {
  const keyword = document.querySelector("#searchInput").value.trim().toLowerCase();
  return families.filter((family) => {
    if (family.status === "absent") return false;
    const filterMatches =
      activeFilter === "all" ||
      (activeFilter === "partial" && getFamilyAttendanceStatus(family) === "partial") ||
      (activeFilter === "late" && family.status === "late");
    const keywordMatches = !keyword || [family.name, family.leader, family.memo, ...family.members.flat()].join(" ").toLowerCase().includes(keyword);
    return filterMatches && keywordMatches;
  });
}

function getMemberAttendancePeriods(member) {
  if (member[5]) return member[5];
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

function getFamilyAttendanceStatus(family) {
  const availablePeriods = getAvailableAttendancePeriods();
  const allDaysSelected = family.members.every((member) =>
    availablePeriods.every((period) => getMemberAttendancePeriods(member).includes(period)));
  return allDaysSelected ? "full" : "partial";
}

function renderDaySquares(periods, externalMeals = [], titlePrefix = "") {
  const availablePeriods = getAvailableAttendancePeriods();
  return retreatDates.map((date) => {
    const dayPeriodKeys = attendancePeriods.map((period) => `${date.shortLabel}-${period.key}`);
    const availableDayPeriods = dayPeriodKeys.filter((periodKey) => availablePeriods.includes(periodKey));
    const hasExternalMeal = availableDayPeriods.some((periodKey) => externalMeals.includes(periodKey));
    const isFullDay = availableDayPeriods.length && !hasExternalMeal && availableDayPeriods.every((periodKey) => periods.includes(periodKey));
    const isEmptyDay = availableDayPeriods.length && availableDayPeriods.every((periodKey) => !periods.includes(periodKey));
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
  const statusLabel = status === "full" ? "풀참" : "부분참석";
  const groups = Object.values(family.members.reduce((result, member) => {
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
      <div class="family-day-squares">${renderDaySquares(group.periods, group.externalMeals, showNames ? `${group.members.map((member) => member.name).join(", ")} · ` : "")}</div>
      <div class="family-schedule-names">${showNames ? group.members.map((member) => `<span class="family-schedule-name ${member.role}">${member.name}</span>`).join("") : ""}</div>
    </div>`).join("");
  return `<div class="family-attendance-summary"><span class="attendance-badge ${status}">${statusLabel}</span><div class="family-schedule-groups">${schedules}</div></div>`;
}

function renderFamilies() {
  const visibleFamilies = getFilteredFamilies();
  document.querySelector("#familyCount").textContent = `${visibleFamilies.length}가족 표시 중`;
  document.querySelector("#familyTableBody").innerHTML = visibleFamilies.map((family) => {
    const [statusText, statusClass] = statusMap[family.status];
    const brotherAndSister = family.members.filter(m => m[1] === "성인 남성" || m[1] === "성인 여성");
    const children = family.members.filter(m => m[1] !== "성인 남성" && m[1] !== "성인 여성");

    const adultPills = brotherAndSister.map((member) => {
      const role = member[1] === "성인 남성" ? "brother" : "sister";
      return `<span class="member-pill ${role}" title="${member[1]}">${member[0]}</span>`;
    }).join("");

    const childPills = children.map((member) => {
      return `<span class="member-pill child" title="${member[1]}">${member[0]}</span>`;
    }).join("");

    return `
      <tr>
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
            <div>🏠 <span style="font-weight: 700; color: #1e5a45;">${family.room || '미배정'}</span></div>
          </div>
        </td>
        <td data-label="현재 상태"><span class="status ${statusClass}">${statusText}</span></td>
        <td class="table-row-action"><button class="row-menu" data-family-id="${family.id}" aria-label="${family.name} 상세보기">···</button></td>
      </tr>`;
  }).join("");
}

function parseMemberDate(value) {
  const [date, time] = value.split(" ");
  const [month, day] = date.split("/").map(Number);
  return new Date(`${retreatConfig.start.slice(0, 4)}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${time}:00`);
}

function getMealPeople(meal) {
  const mealTime = new Date(meal.time.replace(" ", "T") + ":00");
  const mealPeriod = meal.id.split("-").at(-1);
  const mealDate = `${Number(meal.time.slice(5, 7))}/${Number(meal.time.slice(8, 10))}`;
  return families
    .filter((family) => family.status !== "absent")
    .flatMap((family) => family.members
      .filter((member) => member[5]
        ? getMemberChargeableMealPeriods(member).includes(`${mealDate}-${mealPeriod}`)
        : parseMemberDate(member[2]) <= mealTime && parseMemberDate(member[3]) > mealTime)
      .map((member) => {
        const isPreschool = ["유치부", "유아"].includes(member[1]);
        return {
          name: member[0],
          group: member[1],
          family: family.name,
          type: isPreschool ? "preschool" : "standard",
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
  const standardServings = mealPeople.reduce((sum, people) => sum + people.filter((person) => person.type === "standard").length, 0);
  const preschoolServings = mealPeople.reduce((sum, people) => sum + people.filter((person) => person.type === "preschool").length, 0);
  
  document.querySelector("#mealCountBadge").textContent = `총 ${mealSchedule.length}회 식사`;
  document.querySelector("#mealSummaryNumbers").innerHTML = `
    <div class="meal-summary-number"><span>전체 식수</span><b>${totalServings}명분</b></div>
    <div class="meal-summary-number"><span>성인/취학자녀</span><b>${standardServings}명분</b></div>
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
    const standards = people.filter((person) => person.type === "standard").length;
    const preschools = people.filter((person) => person.type === "preschool").length;
    return { meal, total: people.length, standards, preschools };
  });
  const max = Math.max(...rows.map((row) => row.total), 1);
  const height = (value) => Math.max(3, Math.round(value / max * 154));
  document.querySelector("#mealBarChart").innerHTML = rows.map(({ meal, total, standards, preschools }) => {
    const parts = meal.label.split(" ");
    const date = parts.slice(0, -1).join(" ");
    const mealType = parts.at(-1);
    return `
      <div class="meal-chart-column">
        <div class="meal-chart-bars">
          <div class="meal-chart-bar total" style="height:${height(total)}px"><span>${total}</span></div>
          <div class="meal-chart-bar adult" style="height:${height(standards)}px" title="성인/취학자녀"><span>${standards}</span></div>
          <div class="meal-chart-bar child" style="height:${height(preschools)}px" title="미취학"><span>${preschools}</span></div>
        </div>
        <div class="meal-chart-label"><b>${date}</b><span class="meal-label-badge ${mealType}">${mealType}</span></div>
      </div>`;
  }).join("");
}

function renderMealCard(meal) {
  const people = getMealPeople(meal);
  const standardCount = people.filter((person) => person.type === "standard").length;
  const preschoolCount = people.filter((person) => person.type === "preschool").length;
  const mealType = meal.label.split(" ").at(-1);
  const time = meal.time.slice(11, 16);
  return `
    <div class="meal-card">
      <div class="meal-card-top"><span class="meal-type">${mealType} 식사</span><span class="meal-time">${time}</span></div>
      <div class="meal-total"><b>${people.length}</b><span>명 준비 예정</span></div>
      <div class="meal-groups">
        <button class="meal-group-button" data-meal-id="${meal.id}" data-meal-group="all"><span>총 인원</span><b>${people.length}명</b></button>
        <button class="meal-group-button" data-meal-id="${meal.id}" data-meal-group="standard"><span>성인/취학자녀</span><b>${standardCount}명</b></button>
        <button class="meal-group-button" data-meal-id="${meal.id}" data-meal-group="preschool"><span>미취학</span><b>${preschoolCount}명</b></button>
      </div>
      <div class="meal-action"><button class="view-meal-detail" data-meal-id="${meal.id}">상세 명단 보기 <span>→</span></button></div>
    </div>`;
}

function openMealDrawer(meal, group) {
  const labels = { all: "총 인원", standard: "성인/취학자녀", preschool: "미취학" };
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
  const normalizeName = (str) => String(str || "").replace(/\s+/g, "");
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

function getFamilyByMemberName(name) {
  const normalizeName = (str) => String(str || "").replace(/\s+/g, "");
  const target = normalizeName(name);
  return families.find((family) => 
    family.members && Array.isArray(family.members) && family.members.some((member) => member && normalizeName(member[0]) === target)
  );
}

function getMemberAttendanceStatus(name) {
  const normalizeName = (str) => String(str || "").replace(/\s+/g, "");
  const target = normalizeName(name);
  const foundFamily = getFamilyByMemberName(name);
  
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
  
  const member = foundFamily.members.find((m) => normalizeName(m[0]) === target);
  if (!member) {
    const isInDb = churchFamilyDb.some((row) =>
      Object.values(row).some((val) => normalizeName(val) === target)
    );
    return isInDb 
      ? { status: "unregistered", label: "미등록" }
      : { status: "not_in_db", label: "미입력" };
  }
  const periods = getMemberAttendancePeriods(member);
  if (periods.length === 0) {
    return { status: "absent", label: "불참" };
  }
  
  const availablePeriods = getAvailableAttendancePeriods();
  const isFull = availablePeriods.every((period) => periods.includes(period));
  return isFull ? { status: "full", label: "풀참" } : { status: "partial", label: "부분참석" };
}

function matchesOrgFilter(name, filter) {
  if (filter === "all") return true;
  const att = getMemberAttendanceStatus(name);
  if (filter === "registered") return att.status === "full" || att.status === "partial";
  if (filter === "unregistered") return att.status === "unregistered";
  if (filter === "not_in_db") return att.status === "not_in_db";
  if (filter === "absent") return att.status === "absent";
  if (filter === "full") return att.status === "full";
  if (filter === "partial") return att.status === "partial";
  return true;
}

function renderOrgChart(genderMode) {
  const isSister = genderMode === "sister";
  const groupsData = isSister ? sisterGroupsData : brotherGroupsData;
  const staffData = isSister ? sisterStaffData : brotherStaffData;
  
  const container = document.querySelector("#orgChartContainer");
  const statsBar = document.querySelector("#orgStatsBar");
  
  // Title & Subtitle
  document.querySelector("#orgTitle").textContent = isSister ? "👩 자매조 조직도" : "👨 형제조 조직도";
  document.querySelector("#orgSubtitle").textContent = isSister 
    ? "전체 자매조원들의 조장-조원 구조 및 실시간 참석 상태(풀참/부분참석/불참)를 시각화한 조직도입니다."
    : "전체 형제조원들의 조장-조원 구조 및 실시간 참석 상태(풀참/부분참석/불참)를 시각화한 조직도입니다.";
    
  let totalCount = 0;
  let fullCount = 0;
  let partialCount = 0;
  let absentCount = 0;
  let unregisteredCount = 0;
  let notInDbCount = 0;
  
  function updateStats(name) {
    totalCount++;
    const att = getMemberAttendanceStatus(name);
    if (att.status === "full") fullCount++;
    else if (att.status === "partial") partialCount++;
    else if (att.status === "absent") absentCount++;
    else if (att.status === "unregistered") unregisteredCount++;
    else if (att.status === "not_in_db") notInDbCount++;
  }
  
  groupsData.forEach((group) => {
    updateStats(group.leader);
    group.members.forEach((m) => updateStats(m));
  });
  staffData.coordinators.forEach((c) => updateStats(c.name));
  staffData.otherGroups.forEach((m) => updateStats(m));
  
  statsBar.innerHTML = `
    <div class="org-stats-item"><span>전체 인원:</span><b>${totalCount}명</b></div>
    <div class="org-stats-item"><span class="org-badge badge-full">풀참:</span><b>${fullCount}명</b></div>
    <div class="org-stats-item"><span class="org-badge badge-partial">부분참석:</span><b>${partialCount}명</b></div>
    <div class="org-stats-item"><span class="org-badge badge-absent">불참:</span><b>${absentCount}명</b></div>
    <div class="org-stats-item"><span class="org-badge badge-unregistered">미등록:</span><b>${unregisteredCount}명</b></div>
    <div class="org-stats-item"><span class="org-badge badge-not_in_db">미입력:</span><b>${notInDbCount}명</b></div>
  `;
  
  let html = "";
  
  function makeNodeHtml(name, roleLabel, btnClassPrefix) {
    const att = getMemberAttendanceStatus(name);
    const badgeClass = `badge-${att.status}`;
    const btnClass = `${btnClassPrefix}-member-btn`;
    const isLeader = roleLabel ? "leader" : "";
    const regClass = att.status !== "unregistered" && att.status !== "not_in_db"
      ? `registered ${att.status === "absent" ? "absent" : "present"}` 
      : "";
      
    const showLabel = roleLabel && roleLabel !== "조장";
    
    // Check if this node matches the active filter
    const visible = matchesOrgFilter(name, orgActiveFilter);
    const displayStyle = visible ? "" : "display: none !important;";
      
    return `
      <div class="org-${isLeader ? "leader" : "member"}-node ${btnClass} ${isLeader} ${regClass}" data-name="${name}" style="${displayStyle}">
        <span><b>${name}</b>${showLabel ? ` <small style="font-size:9.5px;color:var(--muted);font-weight:normal;">(${roleLabel})</small>` : ""}</span>
        <span class="org-badge ${badgeClass}">${att.label}</span>
      </div>
    `;
  }
  
  groupsData.forEach((group) => {
    const leaderVisible = matchesOrgFilter(group.leader, orgActiveFilter);
    const visibleMembers = group.members.filter((m) => matchesOrgFilter(m, orgActiveFilter));
    
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
  
  const visibleCoordinators = staffData.coordinators.filter((c) => matchesOrgFilter(c.name, orgActiveFilter));
  const visibleOtherGroups = staffData.otherGroups.filter((m) => matchesOrgFilter(m, orgActiveFilter));
  
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

function renderAll() {
  renderDateTabs();
  document.querySelector("#selectedDateLabel").textContent = retreatDates.find((date) => date.key === selectedDate).label;
  renderStats();
  renderFlowChart();
  renderTimeSelector();
  renderBreakdown();
  renderFamilies();
  renderMeals();
  if (currentOrgMode && currentOrgMode !== "family") {
    renderOrgChart(currentOrgMode);
  }
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
    const isValidDinnerPattern = segment.dataset.period === "dinner" &&
      breakfast?.classList.contains("selected") &&
      !lunch?.classList.contains("selected");
    if (!isValidDinnerPattern) segment.classList.remove("external-meal");
  });
}

function cycleAttendanceSegment(segment) {
  const row = segment.closest(".member-form-row");
  const day = segment.closest(".attendance-day");
  const breakfast = day.querySelector('[data-period="breakfast"]');
  const lunch = day.querySelector('[data-period="lunch"]');
  const canUseExternalMeal = segment.dataset.period === "dinner" &&
    breakfast?.classList.contains("selected") &&
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
  const numMembers = rows.length;
  
  let roomLabel = "";
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
    roomRate = 90000;
  }
  
  let breakfastCount = 0;
  let lunchCount = 0;
  let dinnerCount = 0;
  
  // Lodging nights calculation:
  // "만약 28일 저녁은 참석으로 표기 되어 있고, 29일 즉 다음날 아침에 참석 표시가 없으면... 카운트 안해"
  let nights = 0;
  for (let d = 0; d < dateLabels.length - 1; d++) {
    const dayLabel = dateLabels[d];
    const nextDayLabel = dateLabels[d+1];
    const hasOvernightMember = rows.some(row => {
      const selectedSegs = [...row.querySelectorAll(".attendance-segment.selected")].map(seg => 
        `${dateLabels[Number(seg.dataset.day)]}-${seg.dataset.period}`
      );
      return selectedSegs.includes(`${dayLabel}-dinner`) && selectedSegs.includes(`${nextDayLabel}-breakfast`);
    });
    if (hasOvernightMember) {
      nights++;
    }
  }
  
  rows.forEach((row) => {
    const groupSelect = row.querySelector(".new-member-group");
    if (!groupSelect) return;
    const group = groupSelect.value;
    const isPreschool = ["유치부", "유아"].includes(group);
    
    const segments = [...row.querySelectorAll(".attendance-segment.selected")];
    segments.forEach((seg) => {
      if (!isPreschool && !seg.classList.contains("external-meal")) {
        const period = seg.dataset.period;
        if (period === "breakfast") {
          breakfastCount++;
        } else if (period === "lunch") {
          lunchCount++;
        } else if (period === "dinner") {
          dinnerCount++;
        }
      }
    });
  });
  
  const lunchDinnerCount = lunchCount + dinnerCount;
  const lodgingCost = roomRate * nights;
  const mealCost = (breakfastCount * 4000) + (lunchDinnerCount * 10000);
  const totalCost = lodgingCost + mealCost;
  
  const label = document.querySelector("#estimatedFeeLabel");
  const detail = document.querySelector("#estimatedFeeDetail");
  if (label) label.textContent = `${totalCost.toLocaleString()}원`;
  if (detail) {
    detail.innerHTML = `
      <div style="font-weight: 700; color: #1e5a45; font-size: 11px; display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; padding-bottom: 8px; border-bottom: 1px dashed #dfe7e3; margin-bottom: 8px;">
        <span>🛏️ 총 숙박수: ${nights}박</span>
        <span style="color: #cbd5e1;">|</span>
        <span>🍚 총 식사: 아침 ${breakfastCount}번, 점심 ${lunchCount}번, 저녁 ${dinnerCount}번 (점심/저녁 합계: ${lunchDinnerCount}번)</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #40534c;">
        <div>숙박비: ${nights}박 x ${roomRate.toLocaleString()}원(${roomLabel}) = ${lodgingCost.toLocaleString()}원</div>
        <div>식비: 아침 ${breakfastCount}번 x 4,000원 + 점심,저녁 ${lunchDinnerCount}번 x 10,000원 = ${mealCost.toLocaleString()}원</div>
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
    if (!selectedDays.length) {
      showToast(`${row.querySelector(".new-member-name").value.trim()}님의 참석 날짜를 선택해주세요.`);
      return null;
    }
    const firstDay = dateLabels[Math.min(...selectedDays)];
    const lastDay = dateLabels[Math.max(...selectedDays)];
    members.push([
      row.querySelector(".new-member-name").value.trim(),
      row.querySelector(".new-member-group").value,
      `${firstDay} 12:00`,
      `${lastDay} 15:00`,
      selectedDays.map((index) => dateLabels[index]),
      selectedSegments.map((button) => `${dateLabels[Number(button.dataset.day)]}-${button.dataset.period}`),
      externalMealSegments.map((button) => `${dateLabels[Number(button.dataset.day)]}-${button.dataset.period}`),
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
    const normalizeName = (str) => String(str || "").replace(/\s+/g, "");
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
  const numMembers = enteredRows.length;
  let roomRate = 0;
  if (numMembers === 1) roomRate = 60000;
  else if (numMembers === 2) roomRate = 70000;
  else if (numMembers >= 3 && numMembers <= 4) roomRate = 80000;
  else if (numMembers >= 5) roomRate = 90000;
  
  let nights = 0;
  for (let d = 0; d < dateLabels.length - 1; d++) {
    const dayLabel = dateLabels[d];
    const nextDayLabel = dateLabels[d+1];
    const hasOvernightMember = enteredRows.some(row => {
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
  enteredRows.forEach((row) => {
    const group = row.querySelector(".new-member-group").value;
    const isPreschool = ["유치부", "유아"].includes(group);
    const segments = [...row.querySelectorAll(".attendance-segment.selected")];
    segments.forEach((seg) => {
      if (!isPreschool && !seg.classList.contains("external-meal")) {
        const period = seg.dataset.period;
        if (period === "breakfast") totalMealCost += 4000;
        else if (period === "lunch" || period === "dinner") totalMealCost += 10000;
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
    
    if (mode === "family") {
      familySec.style.display = "block";
      orgSec.style.display = "none";
    } else {
      familySec.style.display = "none";
      orgSec.style.display = "block";
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
    const orgFilter = filterChip.dataset.orgFilter;
    if (orgFilter) {
      orgActiveFilter = orgFilter;
      document.querySelectorAll(".org-filter-row .filter-chip").forEach((chip) => chip.classList.toggle("active", chip === filterChip));
      renderOrgChart(currentOrgMode);
    } else {
      activeFilter = filterChip.dataset.filter;
      document.querySelectorAll(".family-filter-row .filter-chip").forEach((chip) => chip.classList.toggle("active", chip === filterChip));
      renderFamilies();
    }
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
  if (event.target.closest("#familyFullAttendance")) toggleFullAttendance(document.querySelector("#memberFormList"));
  if (mealGroup) openMealDrawer(mealSchedule.find((meal) => meal.id === mealGroup.dataset.mealId), mealGroup.dataset.mealGroup);

  const clickedBtn = event.target.closest(".sister-member-btn, .brother-member-btn");
  if (clickedBtn) {
    const isBrother = clickedBtn.classList.contains("brother-member-btn");
    const name = clickedBtn.dataset.name;

    const registeredFamily = getFamilyByMemberName(name);
    if (registeredFamily) {
      toggleModal(true, registeredFamily);
      return;
    }

    // 공백을 제거하여 비교 (예: "김 은 혜" -> "김은혜")
    const normalizeName = (str) => String(str || "").replace(/\s+/g, "");
    const searchName = normalizeName(name);
    const isDbEmpty = !churchFamilyDb || churchFamilyDb.length === 0;

    const familyRow = churchFamilyDb.find((row) =>
      Object.values(row).some((val) => normalizeName(val) === searchName)
    );

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
document.querySelector("#downloadButton").addEventListener("click", () => showToast("참석 명단 다운로드를 준비했습니다."));
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
