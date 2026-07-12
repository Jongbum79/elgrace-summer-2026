(function () {
  if (!window.React || !window.ReactDOM) {
    console.error("React 또는 ReactDOM을 찾을 수 없습니다.");
    return;
  }

  const h = React.createElement;
  const { useEffect, useMemo, useRef, useState } = React;
  const ROOM_LAYOUT_URL = "./assets/building_structure.json";
  let globalLayoutData = null;

  const STATUS_LABELS = {
    stay: "입소 완료",
    late: "입소 예정",
    leave: "퇴소 완료",
    absent: "전체 불참",
    undecided: "미정",
  };

  const STATUS_TONES = {
    stay: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    late: "bg-amber-50 text-amber-700 ring-amber-200",
    leave: "bg-slate-100 text-slate-600 ring-slate-200",
    absent: "bg-rose-50 text-rose-700 ring-rose-200",
    undecided: "bg-stone-100 text-stone-600 ring-stone-200",
  };

  const ROOM_STATUS_TONES = {
    empty: "border-slate-200 bg-white/90",
    partial: "border-emerald-200 bg-emerald-50/50",
    full: "border-emerald-300 bg-emerald-100/70",
    overflow: "border-rose-300 bg-rose-50",
    unavailable: "border-slate-200 bg-slate-100/80 opacity-80",
    selected: "ring-2 ring-[#1e5a45]/20 border-[#1e5a45]",
    drop: "ring-2 ring-emerald-400 border-emerald-400 scale-[1.01]",
  };

  const ROOM_TYPE_LABELS = {
    single: "1인실",
    twin: "2인실",
    ondol_4: "4인실 온돌",
    "6_person": "6인실",
    "12_person": "12인실",
  };

  let root = null;
  let layoutPromise = null;
  let renderNonce = 0;

  function cx(...parts) {
    return parts.filter(Boolean).join(" ");
  }

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function normalizeRoomValue(value) {
    const raw = String(value || "").trim();
    if (!raw || raw === "미배정") return "";
    
    let buildingPrefix = "";
    if (raw.includes("휴락동")) {
      buildingPrefix = "휴락동 ";
    } else if (raw.includes("동락홀")) {
      buildingPrefix = "동락홀 ";
    }
    
    const digitMatch = raw.match(/(\d{3})/);
    if (digitMatch) {
      return `${buildingPrefix}${digitMatch[1]}호`;
    }
    return buildingPrefix + normalizeText(raw).replace(/[()]/g, "");
  }

  function getFamilyId(family, index) {
    return String(family?.id ?? index);
  }

  function getMemberName(member) {
    if (Array.isArray(member)) return String(member[0] || "").trim();
    return String(member?.name || "").trim();
  }

  function getMemberRole(member) {
    if (Array.isArray(member)) return String(member[1] || "").trim();
    return String(member?.role || member?.group || member?.type || "").trim();
  }

  function isMemberAttending(member) {
    if (!member) return false;
    if (member[7] === "undecided") return false;
    if (member[5] && Array.isArray(member[5]) && member[5].length > 0) return true;
    if (member[2] && member[3]) return true;
    return false;
  }

  function getFamilyHeadcount(family) {
    if (!family || !Array.isArray(family.members)) return 0;
    return family.members.filter((member) => getMemberName(member) && isMemberAttending(member)).length || 0;
  }

  function isMemberStayingOvernightOnNight(member, nightIdx) {
    if (!member) return false;
    if (member[7] === "undecided") return false;
    const dateLabels = ["7/27", "7/28", "7/29", "7/30"];
    const dayLabel = dateLabels[nightIdx];
    const nextDayLabel = dateLabels[nightIdx + 1];
    const periods = typeof getMemberAttendancePeriods === "function" ? getMemberAttendancePeriods(member) : [];
    return periods.includes(`${dayLabel}-dinner`) && periods.includes(`${nextDayLabel}-breakfast`);
  }

  function getFamilyStayHeadcountOnNight(family, nightIdx) {
    if (!family || !Array.isArray(family.members)) return 0;
    return family.members.filter((member) => {
      return getMemberName(member) && isMemberStayingOvernightOnNight(member, nightIdx);
    }).length || 0;
  }

  function getFamilyStayNights(family) {
    if (!family || !Array.isArray(family.members)) return [];
    const nights = [];
    for (let d = 0; d < 3; d++) {
      if (getFamilyStayHeadcountOnNight(family, d) > 0) {
        nights.push(d);
      }
    }
    return nights;
  }

  function getRoomOccupancyByNight(room, familiesInRoom) {
    const nightHeads = [0, 0, 0];
    (familiesInRoom || []).forEach((family) => {
      for (let nightIdx = 0; nightIdx < 3; nightIdx++) {
        nightHeads[nightIdx] += getFamilyStayHeadcountOnNight(family, nightIdx);
      }
    });
    return nightHeads;
  }

  function getRoomMaxOccupancy(room, familiesInRoom) {
    const nightHeads = getRoomOccupancyByNight(room, familiesInRoom);
    return Math.max(...nightHeads);
  }

  function canFamilyFitInRoom(family, room, familiesInRoom) {
    if (!room || room.unavailable || room.capacity <= 0) return false;
    
    const nightHeads = [0, 0, 0];
    (familiesInRoom || []).forEach((f) => {
      const fId = f._familyId || f.id || f.name;
      const targetId = family._familyId || family.id || family.name;
      if (String(fId) === String(targetId)) return;
      
      for (let n = 0; n < 3; n++) {
        nightHeads[n] += getFamilyStayHeadcountOnNight(f, n);
      }
    });

    const limit = getRoomAssignmentLimit(room);
    for (let n = 0; n < 3; n++) {
      const familyNightSize = getFamilyStayHeadcountOnNight(family, n);
      if (nightHeads[n] + familyNightSize > limit) {
        return false;
      }
    }
    return true;
  }

  function getFamilyComposition(family) {
    const counts = { brother: 0, sister: 0, child: 0, total: 0 };
    (family?.members || []).forEach((member) => {
      if (!getMemberName(member) || !isMemberAttending(member)) return;
      const role = getMemberRole(member);
      counts.total += 1;
      if (role === "성인 남성") counts.brother += 1;
      else if (role === "성인 여성") counts.sister += 1;
      else counts.child += 1;
    });
    return counts;
  }

  function getFamilyRoomValue(family, draftAssignments) {
    const familyId = family?.id;
    if (familyId && draftAssignments && Object.prototype.hasOwnProperty.call(draftAssignments, familyId)) {
      return draftAssignments[familyId] || "미배정";
    }
    return family?.room || "미배정";
  }

  function createDbFamily(family) {
    const dbFamily = { ...family };
    const feeInfo = {
      fee: family.fee ?? 0,
      feeStatus: family.feeStatus || "pending",
      room: family.room || "미배정",
    };
    const cleanMemo = family.memo === "별도 메모 없음" ? "" : family.memo || "";
    dbFamily.memo = `${cleanMemo}\n__FEE_INFO__:${JSON.stringify(feeInfo)}`;
    delete dbFamily.fee;
    delete dbFamily.feeStatus;
    delete dbFamily.room;
    Object.keys(dbFamily).forEach((key) => {
      if (key.startsWith("_")) {
        delete dbFamily[key];
      }
    });
    return dbFamily;
  }

  async function loadRoomLayout() {
    if (!layoutPromise) {
      layoutPromise = fetch(ROOM_LAYOUT_URL)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`방 배정표를 불러오지 못했습니다. (${response.status})`);
          }
          return response.json();
        })
        .then((data) => {
          const index = buildLayoutIndex(data);
          globalLayoutData = index;
          return index;
        });
    }
    return layoutPromise;
  }

  function buildLayoutIndex(data) {
    const buildings = Array.isArray(data?.buildings) ? data.buildings.map((building, buildingIndex) => ({
      building: building.building,
      buildingIndex,
      floors: Array.isArray(building.floors)
        ? building.floors.map((floor, floorIndex) => {
            const rooms = Array.isArray(floor.rooms)
              ? floor.rooms.map((room, roomIndex) => ({
                  ...room,
                  building: building.building,
                  buildingOrder: buildingIndex,
                  floor: floor.floor,
                  floorLabel: floor.label || `${floor.floor}층`,
                  floorIndex,
                  roomIndex,
                  id: `${building.building}|${floor.floor}|${room.room_number}`,
                  label: room.room_label || `${room.room_number}호`,
                }))
              : [];
            const serviceSpaces = Array.isArray(floor.service_spaces) ? floor.service_spaces : [];
            return {
              ...floor,
              label: floor.label || `${floor.floor}층`,
              rooms,
              serviceSpaces,
            };
          })
        : [],
    })) : [];

    const rooms = [];
    const serviceSpaces = [];
    const roomById = new Map();
    const roomByLabel = new Map();
    const roomByNumber = new Map();

    buildings.forEach((building) => {
      building.floors.forEach((floor) => {
        floor.rooms.forEach((room) => {
          rooms.push(room);
          roomById.set(room.id, room);
          
          const plainLabel = normalizeRoomValue(room.room_label);
          const prefixedLabel = normalizeRoomValue(`${room.building} ${room.room_label}`);
          
          // Map prefixed first (higher priority/unique)
          roomByLabel.set(prefixedLabel, room);
          if (!roomByLabel.has(plainLabel)) {
            roomByLabel.set(plainLabel, room);
          }
          
          roomByLabel.set(normalizeRoomValue(`${room.building} ${room.room_number}`), room);
          roomByLabel.set(normalizeRoomValue(`${room.building} ${room.room_number}호`), room);
          
          roomByNumber.set(`${room.building} ${room.room_number}`, room);
          if (!roomByNumber.has(String(room.room_number))) {
            roomByNumber.set(String(room.room_number), room);
          }
        });
        floor.serviceSpaces.forEach((space) => {
          serviceSpaces.push({
            ...space,
            building: building.building,
            floor: floor.floor,
            floorLabel: floor.label,
            id: `${building.building}|${floor.floor}|service|${space.cell || space.label}`,
          });
        });
      });
    });

    return {
      raw: data,
      buildings,
      rooms,
      serviceSpaces,
      roomById,
      roomByLabel,
      roomByNumber,
    };
  }

  function resolveRoom(layoutIndex, roomValue) {
    const normalized = normalizeRoomValue(roomValue);
    if (!normalized) return null;
    if (layoutIndex.roomByLabel.has(normalized)) return layoutIndex.roomByLabel.get(normalized);
    const digits = String(roomValue || "").match(/(\d{3})/);
    if (digits) {
      let buildingPrefix = "";
      if (String(roomValue).includes("휴락동")) buildingPrefix = "휴락동 ";
      else if (String(roomValue).includes("동락홀")) buildingPrefix = "동락홀 ";
      
      const key = `${buildingPrefix}${digits[1]}`;
      if (layoutIndex.roomByNumber.has(key)) return layoutIndex.roomByNumber.get(key);
      if (layoutIndex.roomByNumber.has(digits[1])) return layoutIndex.roomByNumber.get(digits[1]);
    }
    return null;
  }

  function buildDraftAssignments(familyList) {
    const next = {};
    (Array.isArray(familyList) ? familyList : []).forEach((family, index) => {
      const familyId = getFamilyId(family, index);
      next[familyId] = family?.room || "미배정";
    });
    return next;
  }

  function serializeAssignments(assignments) {
    return Object.keys(assignments || {})
      .sort()
      .map((key) => `${key}:${assignments[key] || "미배정"}`)
      .join("|");
  }



  function familyDisplayName(family) {
    if (!family) return "이름 없음";
    const baseName = family.name || "";
    
    const hasFamilySuffix = baseName.endsWith("가족");
    const cleanBaseName = hasFamilySuffix ? baseName.slice(0, -2).trim() : baseName.trim();
    
    const parts = cleanBaseName.split(",").map(p => p.trim()).filter(Boolean);
    
    if (parts.length > 1 && family.members && Array.isArray(family.members)) {
      const attendingParts = parts.filter(name => {
        const member = family.members.find(m => m && m[0] === name);
        if (!member) return true;
        return isMemberAttending(member);
      });
      
      if (attendingParts.length > 0) {
        return attendingParts.join(", ") + (hasFamilySuffix ? " 가족" : "");
      }
    }
    
    return baseName;
  }

  function familyLeader(family) {
    return family?.leader || family?.name || "대표 없음";
  }

  function familyMatchesQuery(family, query) {
    if (!query) return true;
    const needle = normalizeText(query);
    const roomValue = normalizeText(family?.room || "");
    const draftRoomValue = normalizeText(family?._roomValue || "");
    return [
      family?.name,
      family?.leader,
      roomValue,
      draftRoomValue,
      String(family?.id || ""),
      family?.phone,
    ].some((value) => normalizeText(value).includes(needle));
  }

  function isRoomQueryMatch(room, familiesInRoom, query) {
    if (!query) return true;
    const needle = normalizeText(query);
    if (normalizeText(room.label || "").includes(needle)) return true;
    return familiesInRoom.some((f) => familyMatchesQuery(f, query));
  }

  function familySortRank(family, roomValue, roomExists) {
    const statusWeight = {
      stay: 0,
      late: 1,
      leave: 2,
      absent: 3,
      undecided: 4,
    };
    const assignedWeight = roomValue && roomExists ? 1 : 0;
    return assignedWeight * 10 + (statusWeight[family?.status] ?? 9);
  }

  function roomStatus(room, occupancyCount, maxOccupancy) {
    if (room?.unavailable || room?.capacity <= 0) return "unavailable";
    if (occupancyCount <= 0) return "empty";
    if (maxOccupancy > getRoomAssignmentLimit(room)) return "overflow";
    if (maxOccupancy >= room.capacity) return "full";
    return "partial";
  }

  function renderNightProgressBar(room, familiesInRoom) {
    const nightHeads = getRoomOccupancyByNight(room, familiesInRoom);
    const FAMILY_COLORS = [
      "bg-emerald-600",
      "bg-indigo-500",
      "bg-amber-500",
      "bg-sky-500",
      "bg-rose-500"
    ];
    return h("div", { className: "mt-2.5 flex gap-1 w-full" },
      [0, 1, 2].map(nightIdx => {
        const nightHead = nightHeads[nightIdx];
        const familiesOnNight = (familiesInRoom || []).filter(f => getFamilyStayNights(f).includes(nightIdx));
        
        const segments = familiesOnNight.map(family => {
          const famIdx = (familiesInRoom || []).findIndex(f => (f._familyId || f.id) === (family._familyId || family.id));
          const colorClass = FAMILY_COLORS[famIdx >= 0 ? famIdx % FAMILY_COLORS.length : 0];
          const fSize = getFamilyStayHeadcountOnNight(family, nightIdx);
          const limitOrCapacity = Math.max(room.capacity, getRoomAssignmentLimit(room));
          const widthPercent = limitOrCapacity > 0 ? (fSize / limitOrCapacity) * 100 : 0;
          return h("div", {
            key: family._familyId || family.id,
            className: cx("h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full", colorClass),
            style: { width: `${widthPercent}%` },
            title: `${familyDisplayName(family)}: ${fSize}명`
          });
        });
        
        return h("div", {
          key: nightIdx,
          className: "h-2 flex-1 rounded-full bg-slate-100 ring-1 ring-slate-200/50 overflow-hidden relative flex",
          title: `7월 ${27 + nightIdx}일 숙박: ${nightHead}/${room.capacity}명`
        },
          segments
        );
      })
    );
  }

  function getRoomAssignmentLimit(room) {
    if (!room || room.unavailable || room.capacity <= 0) return 0;
    if (room.capacity === 4) return 5;
    return room.capacity;
  }

  function shouldShowOccupancyDetails(room) {
    return !room?.unavailable && room?.capacity > 0;
  }

  function roomToneClass(status, isSelected, isDropTarget) {
    return cx(
      "transition-all duration-200",
      ROOM_STATUS_TONES[status] || ROOM_STATUS_TONES.empty,
      isSelected ? ROOM_STATUS_TONES.selected : "",
      isDropTarget ? ROOM_STATUS_TONES.drop : ""
    );
  }

  function familyStatusTone(status) {
    return STATUS_TONES[status] || STATUS_TONES.undecided;
  }

  function toRoomBadge(room) {
    return room?.room_type_label || ROOM_TYPE_LABELS[room?.room_type] || `${room?.capacity || 0}인실`;
  }

  function toCompactRoomBadge(room) {
    if (room?.unavailable) return room.unavailable_reason || room.room_type_label || "사용불가";
    if (room?.room_type === "single") return "1인 침대";
    if (room?.room_type === "twin") return "2인 침대";
    if (room?.room_type === "ondol_4") return "4인 온돌";
    if (room?.room_type === "6_person") return "6인실";
    if (room?.room_type === "12_person") return "12인실";
    return toRoomBadge(room);
  }

  function clampString(value, length) {
    const text = String(value || "");
    return text.length > length ? `${text.slice(0, length - 1)}…` : text;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getPreferredRoomCapacities(size) {
    if (size <= 1) return [1, 2, 4, 6, 12];
    if (size === 2) return [2, 4, 6, 12];
    if (size <= 4) return [4, 6, 12];
    if (size <= 6) return [6, 12];
    return [12, 6, 4, 2, 1];
  }

  function getRoomPreferenceTier(size, roomCapacity) {
    const preferred = getPreferredRoomCapacities(size);
    const tier = preferred.indexOf(roomCapacity);
    return tier === -1 ? preferred.length : tier;
  }

  function getFamilyEarliestArrival(family) {
    if (!family || !Array.isArray(family.members) || family.members.length === 0) return new Date(9999, 11, 31);
    let earliest = null;
    family.members.forEach((member) => {
      const dateStr = member[2];
      if (dateStr) {
        const d = typeof parseMemberDate === "function" ? parseMemberDate(dateStr) : new Date(dateStr);
        if (d && d.getTime() > 0) {
          if (!earliest || d < earliest) earliest = d;
        }
      }
    });
    return earliest || new Date(9999, 11, 31);
  }

  function buildRoomFamilyMap(familiesList, draftAssignments, layoutIndex) {
    const byRoom = new Map();
    const orphaned = [];

    layoutIndex.rooms.forEach((room) => {
      byRoom.set(room.id, {
        room,
        families: [],
        headcount: 0,
      });
    });

    (Array.isArray(familiesList) ? familiesList : []).forEach((family, index) => {
      const familyId = getFamilyId(family, index);
      const roomValue = getFamilyRoomValue({ ...family, id: familyId }, draftAssignments);
      const room = resolveRoom(layoutIndex, roomValue);
      const familySize = getFamilyHeadcount(family);

      if (!room) {
        if (normalizeRoomValue(roomValue)) {
          orphaned.push({
            family,
            familyId,
            roomValue,
            familySize,
          });
        }
        return;
      }

      const bucket = byRoom.get(room.id);
      bucket.families.push({
        ...family,
        _familyId: familyId,
        _roomValue: roomValue,
        _size: familySize,
      });
    });

    byRoom.forEach((bucket) => {
      bucket.families.sort((a, b) => {
        const nightsA = getFamilyStayNights(a);
        const nightsB = getFamilyStayNights(b);
        const minA = nightsA.length > 0 ? Math.min(...nightsA) : 999;
        const minB = nightsB.length > 0 ? Math.min(...nightsB) : 999;
        if (minA !== minB) return minA - minB;

        const arrA = getFamilyEarliestArrival(a);
        const arrB = getFamilyEarliestArrival(b);
        if (arrA.getTime() !== arrB.getTime()) return arrA.getTime() - arrB.getTime();

        return a.name.localeCompare(b.name);
      });
      // Compute headcount as maximum overnight occupancy
      bucket.headcount = getRoomMaxOccupancy(bucket.room, bucket.families);
    });

    return { byRoom, orphaned };
  }

  function scoreRoomForFamily(roomBucket, familySize, familyNights = [0, 1, 2]) {
    const nightHeads = [0, 0, 0];
    (roomBucket.families || []).forEach((f) => {
      for (let n = 0; n < 3; n++) {
        nightHeads[n] += getFamilyStayHeadcountOnNight(f, n);
      }
    });
    const nights = familyNights && familyNights.length > 0 ? familyNights : [0, 1, 2];
    const maxOccupiedBefore = Math.max(...nights.map((n) => nightHeads[n] || 0));
    const limit = getRoomAssignmentLimit(roomBucket.room);
    const available = limit - maxOccupiedBefore;
    const remainingAfter = available - familySize;
    const isLargeRoom = (roomBucket.room.capacity >= 6 && familySize < 6) ? 1000 : 0;
    const hasExisting = maxOccupiedBefore > 0 ? 0 : 1;
    return {
      available,
      remainingAfter,
      score: [
        isLargeRoom,
        getRoomPreferenceTier(familySize, roomBucket.room.capacity),
        remainingAfter,
        hasExisting,
        roomBucket.room.capacity,
        roomBucket.room.buildingOrder || 0,
        roomBucket.room.floor || 0,
        roomBucket.room.room_number || 0,
      ],
    };
  }

  function FloorPlanCard({
    floor,
    density,
    roomBundle,
    selectedRoomId,
    setSelectedRoomId,
    setSelectedFamilyId,
    mobileTab,
    setMobileTab,
    dropRoomId,
    dragState,
    layoutIndex,
    renderFloorRow,
    renderCorridorBand,
    splitFloorItems,
    getFloorColumnRange,
    groupServiceSpacesForRow,
    sortByWorkbookPosition,
    getRoomTypeTone,
  }) {
    const scrollContainerRef = useRef(null);
    const [scrollInfo, setScrollInfo] = useState({ scrollLeft: 0, scrollWidth: 1, clientWidth: 1 });

    const handleScroll = () => {
      const el = scrollContainerRef.current;
      if (el) {
        setScrollInfo({
          scrollLeft: el.scrollLeft,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
        });
      }
    };

    useEffect(() => {
      const el = scrollContainerRef.current;
      if (el) {
        handleScroll();
        const resizeObserver = new ResizeObserver(() => {
          handleScroll();
        });
        resizeObserver.observe(el);
        return () => resizeObserver.disconnect();
      }
    }, []);

    useEffect(() => {
      const timer = setTimeout(handleScroll, 50);
      return () => clearTimeout(timer);
    }, [floor, density, roomBundle]);

    const columnRange = getFloorColumnRange(floor);
    const isDongrak = floor.building === "동락홀";
    const planMinWidth = isDongrak 
      ? (density === "compact" ? 430 : 660)
      : Math.max(columnRange.span * (density === "compact" ? 86 : 118), density === "compact" ? 860 : 1320);
    
    const { northRooms, southRooms, northServices, southServices, corridorServices } = splitFloorItems(floor);
    const northItems = northRooms.concat(groupServiceSpacesForRow(northServices)).sort(sortByWorkbookPosition);
    const southItems = southRooms.concat(groupServiceSpacesForRow(southServices)).sort(sortByWorkbookPosition);
    const floorCapacity = (floor.rooms || []).reduce((sum, room) => sum + (room.unavailable ? 0 : room.capacity || 0), 0);
    const usedBeds = (floor.rooms || []).reduce((sum, room) => sum + getRoomMaxOccupancy(room, roomBundle.byRoom.get(room.id)?.families || []), 0);

    const span = isDongrak ? Math.max(northItems.length, southItems.length) : columnRange.span;

    const renderMinimapRow = (rowItems) => {
      const cells = Array.from({ length: span });
      rowItems.forEach((item, idx) => {
        const col = isDongrak ? idx : Math.max((item.column || columnRange.min) - columnRange.min, 0);
        const colSpan = isDongrak ? 1 : (item.column_span || 1);
        
        const isRoom = item.type !== "service_space" && item.type !== "service_stack";
        let colorClass = "bg-slate-200 border-slate-300"; // Service
        let isOccupied = false;
        
        if (isRoom) {
          const bucket = roomBundle.byRoom.get(item.id);
          const headCount = bucket?.headcount || 0;
          isOccupied = headCount > 0;
          if (item.unavailable || item.capacity <= 0) {
            colorClass = "bg-slate-100 border-slate-200"; // Unavailable
          } else if (isOccupied) {
            const maxOcc = getRoomMaxOccupancy(item, bucket?.families || []);
            const status = roomStatus(item, bucket?.families.length || 0, maxOcc);
            if (status === "overflow") {
              colorClass = "bg-rose-500 border-rose-600";
            } else if (status === "full") {
              colorClass = "bg-emerald-700 border-emerald-800";
            } else {
              colorClass = "bg-emerald-500 border-emerald-600";
            }
          } else {
            colorClass = "bg-white border-slate-200"; // Empty room
          }
        }

        const handleClick = () => {
          const scrollContainer = scrollContainerRef.current;
          if (scrollContainer) {
            const scrollWidth = scrollContainer.scrollWidth;
            const scrollLeftTarget = col * (scrollWidth / span);
            scrollContainer.scrollTo({
              left: scrollLeftTarget,
              behavior: "smooth",
            });
          }
        };

        for (let s = 0; s < colSpan; s++) {
          if (col + s < span) {
            cells[col + s] = h("div", {
              key: `${item.id || item.cell}-${s}`,
              onClick: handleClick,
              className: cx(
                "h-3.5 w-3.5 shrink-0 border rounded-[3px] transition cursor-pointer hover:scale-110 active:scale-95",
                colorClass
              ),
              title: isRoom ? `${item.label}: ${isOccupied ? "배정 완료" : "미배정"}` : item.label
            });
          }
        }
      });

      for (let i = 0; i < span; i++) {
        if (!cells[i]) {
          cells[i] = h("div", { key: `empty-${i}`, className: "h-3.5 w-3.5 shrink-0 bg-transparent" });
        }
      }

      return h("div", { className: "flex gap-1" }, cells);
    };

    const ratio = scrollInfo.scrollWidth > 0 ? scrollInfo.clientWidth / scrollInfo.scrollWidth : 0;
    const offsetRatio = scrollInfo.scrollWidth > 0 ? scrollInfo.scrollLeft / scrollInfo.scrollWidth : 0;
    
    const viewportWidthPct = Math.min(ratio * 100, 100);
    const viewportLeftPct = Math.min(offsetRatio * 100, 100 - viewportWidthPct);

    return h(
      "article",
      {
        key: `${floor.building || "building"}-${floor.floor}`,
        className: "overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm",
      },
      h("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" },
        h("div", { className: "flex flex-wrap items-baseline gap-x-2.5 gap-y-1" },
          h("h5", { className: "text-lg font-bold text-slate-900" }, floor.label || `${floor.floor}층`),
          h("span", { className: "text-sm text-slate-500" }, `${floor.rooms.length}개 방 · 정원 ${floorCapacity}명 · 현재 ${usedBeds}명`)
        ),
        h("div", { className: "flex flex-wrap gap-1.5" },
          ["single", "twin", "ondol_4", "6_person", "12_person", "unavailable"].map((type) => {
            const count = (floor.rooms || []).filter((room) => room.room_type === type).length;
            if (!count) return null;
            const sample = (floor.rooms || []).find((room) => room.room_type === type);
            return h("span", { key: type, className: cx("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", getRoomTypeTone(sample)) }, `${toRoomBadge(sample)} ${count}`);
          })
        )
      ),

      h("div", { className: "mt-2.5 relative rounded-xl border border-slate-200/60 bg-slate-50/60 p-2 w-fit shadow-sm select-none overflow-x-auto" },
        h("div", { className: "space-y-0.5 relative w-fit mx-auto px-0.5 py-1.5" },
          renderMinimapRow(northItems),
          h("div", { className: "h-px bg-slate-200 w-full my-0.5" }),
          renderMinimapRow(southItems),
          h("div", {
            className: "absolute -top-1.5 -bottom-1.5 border-[2px] border-rose-500 bg-transparent pointer-events-none rounded-md transition-all duration-75 shadow-sm",
            style: {
              left: `${viewportLeftPct}%`,
              width: `${viewportWidthPct}%`,
            }
          })
        )
      ),

      h("div", {
        ref: scrollContainerRef,
        onScroll: handleScroll,
        className: "mt-4 overflow-x-auto rounded-[24px] border border-slate-100 bg-slate-50/70 p-4"
      },
        h("div", { className: "space-y-2", style: { minWidth: `${planMinWidth}px` } },
          renderFloorRow(northItems, columnRange, `${floor.floor}-north`, density),
          renderCorridorBand(floor, corridorServices, columnRange),
          renderFloorRow(southItems, columnRange, `${floor.floor}-south`, density)
        )
      )
    );
  }

  function renderIcon(name, className = "h-4 w-4") {
    return h("span", {
      className: "inline-flex items-center justify-center shrink-0",
      dangerouslySetInnerHTML: {
        __html: `<i data-lucide="${name}" class="${className}"></i>`
      }
    });
  }

  function RoomAssignmentApp({ refreshKey }) {
    const [layoutState, setLayoutState] = useState({
      loading: true,
      error: null,
      data: null,
    });
    const [draftAssignments, setDraftAssignments] = useState(() => buildDraftAssignments(typeof families !== "undefined" ? families : []));
    const [baselineAssignments, setBaselineAssignments] = useState(() => buildDraftAssignments(typeof families !== "undefined" ? families : []));
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [selectedFamilyId, setSelectedFamilyId] = useState(null);
    const [mobileTab, setMobileTab] = useState("rooms");
    const [familySheetOpen, setFamilySheetOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [buildingFilter, setBuildingFilter] = useState("all");
    const [floorFilter, setFloorFilter] = useState("all");
    const [roomTypeFilter, setRoomTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [familyStateFilter, setFamilyStateFilter] = useState("unassigned");
    const [queueSizeFilter, setQueueSizeFilter] = useState("all");
    const [saving, setSaving] = useState(false);
    const [dragState, setDragState] = useState(null);
    const [dropRoomId, setDropRoomId] = useState(null);
    const [toastHint, setToastHint] = useState("");
    const [autoAssigning, setAutoAssigning] = useState(false);
    const [autoAssignProgress, setAutoAssignProgress] = useState({ index: 0, total: 0, family: "", room: "" });
    const [activeTooltip, setActiveTooltip] = useState(null); // { familyId, family, rect }
    const lastDropAtRef = useRef(0);
    const dragRef = useRef({
      active: false,
      familyId: null,
      familyName: "",
      pointerId: null,
      startX: 0,
      startY: 0,
      x: 0,
      y: 0,
      didMove: false,
    });

    const familiesList = (typeof families !== "undefined" && Array.isArray(families) ? families : [])
      .filter((family) => {
        if (family.status === "absent" || family.status === "undecided") return false;
        return getFamilyStayNights(family).length > 0;
      });
    const draftToken = useMemo(() => serializeAssignments(draftAssignments), [draftAssignments]);
    const baselineToken = useMemo(() => serializeAssignments(baselineAssignments), [baselineAssignments]);
    const isDirty = draftToken !== baselineToken;

    useEffect(() => {
      let cancelled = false;
      loadRoomLayout()
        .then((data) => {
          if (cancelled) return;
          setLayoutState({ loading: false, error: null, data });
        })
        .catch((error) => {
          if (cancelled) return;
          setLayoutState({ loading: false, error: error.message || "방 배정표를 불러오지 못했습니다.", data: null });
        });
      return () => {
        cancelled = true;
      };
    }, [refreshKey]);

    useEffect(() => {
      if (!activeTooltip) return;
      const handleGlobalClick = () => {
        setActiveTooltip(null);
      };
      window.addEventListener("click", handleGlobalClick);
      return () => {
        window.removeEventListener("click", handleGlobalClick);
      };
    }, [activeTooltip]);

    useEffect(() => {
      if (!layoutState.data) return;
      if (isDirty) return;
      const nextDraft = buildDraftAssignments(familiesList);
      setDraftAssignments(nextDraft);
      setBaselineAssignments(nextDraft);
      setSelectedRoomId((current) => current && layoutState.data.roomById.has(current) ? current : null);
      setSelectedFamilyId((current) => {
        if (!current) return null;
        return familiesList.some((family, index) => getFamilyId(family, index) === current) ? current : null;
      });
    }, [refreshKey, layoutState.data]);

    useEffect(() => {
      if (!window.lucide?.createIcons) return;
      window.lucide.createIcons();
    }, [layoutState.data, draftToken, selectedRoomId, selectedFamilyId, mobileTab, familySheetOpen, query, buildingFilter, floorFilter, roomTypeFilter, statusFilter, familyStateFilter, dragState, saving, toastHint, autoAssigning, autoAssignProgress]);

    const roomBundle = useMemo(() => {
      if (!layoutState.data) {
        return { byRoom: new Map(), orphaned: [], roomLookup: null };
      }
      return buildRoomFamilyMap(familiesList, draftAssignments, layoutState.data);
    }, [layoutState.data, draftToken, refreshKey]);

    const selectedRoom = useMemo(() => {
      if (!layoutState.data || !selectedRoomId) return null;
      return layoutState.data.roomById.get(selectedRoomId) || null;
    }, [layoutState.data, selectedRoomId]);

    const selectedFamily = useMemo(() => {
      if (!selectedRoomId && !selectedFamilyId) return null;
      const family = familiesList.find((item, index) => getFamilyId(item, index) === selectedFamilyId) || null;
      return family;
    }, [familiesList, selectedFamilyId, selectedRoomId]);

    const roomStats = useMemo(() => {
      if (!layoutState.data) {
        return {
          roomCount: 0,
          assignedBeds: 0,
          assignedFamiliesCount: 0,
          emptyRooms: 0,
          fullRooms: 0,
          overRooms: 0,
          unassignedFamilies: 0,
          orphanedFamilies: 0,
          utilization: 0,
        };
      }
      let assignedBeds = 0;
      let totalCapacity = 0;
      let emptyRooms = 0;
      let fullRooms = 0;
      let overRooms = 0;
      const assignedFamilies = new Set();

      layoutState.data.rooms.forEach((room) => {
        const bucket = roomBundle.byRoom.get(room.id);
        const usedBeds = bucket?.headcount || 0;
        if (room.unavailable || room.capacity <= 0) return;
        totalCapacity += room.capacity;
        assignedBeds += usedBeds;
        if (usedBeds <= 0) emptyRooms += 1;
        if (usedBeds >= room.capacity) fullRooms += 1;
        if (usedBeds > getRoomAssignmentLimit(room)) overRooms += 1;
        bucket?.families.forEach((family) => assignedFamilies.add(family._familyId));
      });

      const validRoomAssignedFamilies = assignedFamilies.size;
      const unassignedFamilies = familiesList.filter((family, index) => {
        const value = getFamilyRoomValue({ ...family, id: getFamilyId(family, index) }, draftAssignments);
        return !resolveRoom(layoutState.data, value);
      }).length;

      return {
        roomCount: layoutState.data.rooms.length,
        assignedBeds,
        assignedFamiliesCount: validRoomAssignedFamilies,
        emptyRooms,
        fullRooms,
        overRooms,
        unassignedFamilies,
        orphanedFamilies: roomBundle.orphaned.length,
        utilization: totalCapacity ? Math.round((assignedBeds / totalCapacity) * 100) : 0,
      };
    }, [layoutState.data, roomBundle, draftToken, refreshKey]);

    const dailyUsageData = useMemo(() => {
      if (!layoutState.data) return null;
      
      const activeRooms = layoutState.data.rooms.filter(r => !r.unavailable && r.capacity > 0);
      const roomTypes = ["1인실", "2인실", "4인실", "6인실", "12인실"];
      
      const totalByType = {};
      roomTypes.forEach(t => {
        totalByType[t] = 0;
      });
      
      activeRooms.forEach(r => {
        let t = r.room_type_label || `${r.capacity}인실`;
        if (t === "4인실 온돌") t = "4인실";
        if (roomTypes.includes(t)) {
          totalByType[t] = (totalByType[t] || 0) + 1;
        }
      });
      
      const roomOccupancy = {};
      activeRooms.forEach(r => {
        roomOccupancy[r.id] = [0, 0, 0];
      });
      
      familiesList.forEach((family, idx) => {
        if (["absent", "undecided"].includes(family.status)) return;
        
        const familyId = getFamilyId(family, idx);
        const roomValue = getFamilyRoomValue({ ...family, id: familyId }, draftAssignments);
        const resolved = resolveRoom(layoutState.data, roomValue);
        if (!resolved || resolved.unavailable || resolved.capacity <= 0) return;
        
        for (let nightIdx = 0; nightIdx < 3; nightIdx++) {
          const headcount = getFamilyStayHeadcountOnNight(family, nightIdx);
          if (roomOccupancy[resolved.id]) {
            roomOccupancy[resolved.id][nightIdx] += headcount;
          }
        }
      });
      
      const occupiedByType = {};
      roomTypes.forEach(t => {
        occupiedByType[t] = [0, 0, 0];
      });
      
      activeRooms.forEach(r => {
        let t = r.room_type_label || `${r.capacity}인실`;
        if (t === "4인실 온돌") t = "4인실";
        if (!roomTypes.includes(t)) return;
        const occ = roomOccupancy[r.id] || [0, 0, 0];
        for (let nightIdx = 0; nightIdx < 3; nightIdx++) {
          if (occ[nightIdx] > 0) {
            occupiedByType[t][nightIdx] += 1;
          }
        }
      });
      
      return {
        roomTypes,
        totalByType,
        occupiedByType
      };
    }, [layoutState.data, familiesList, draftAssignments]);

    const filteredFamilies = useMemo(() => {
      return familiesList
        .map((family, index) => {
          const familyId = getFamilyId(family, index);
          const roomValue = getFamilyRoomValue({ ...family, id: familyId }, draftAssignments);
          const room = layoutState.data ? resolveRoom(layoutState.data, roomValue) : null;
          const roomExists = Boolean(room);
          return {
            ...family,
            _familyId: familyId,
            _roomValue: roomValue,
            _roomExists: roomExists,
            _size: getFamilyHeadcount(family),
            _queryMatch: familyMatchesQuery(family, query),
          };
        })
        .filter((family) => {
          if (["absent", "undecided"].includes(family.status)) return false;
          if (getFamilyStayNights(family).length === 0) return false;
          if (!family._queryMatch) return false;
          
          if (!query) {
            if (statusFilter !== "all" && family.status !== statusFilter) return false;
            if (familyStateFilter === "unassigned" && family._roomExists) return false;
            if (queueSizeFilter !== "all") {
              const size = family._size;
              if (queueSizeFilter === "1") {
                if (size !== 1) return false;
              } else if (queueSizeFilter === "2") {
                if (size !== 2) return false;
              } else if (queueSizeFilter === "3-4") {
                if (size < 3 || size > 4) return false;
              } else if (queueSizeFilter === "5+") {
                if (size < 5) return false;
              }
            }
            if (familyStateFilter === "assigned" && !family._roomExists) return false;
            if (familyStateFilter === "orphaned" && family._roomExists) return false;
            if (buildingFilter !== "all" && family._roomExists) {
              if (!layoutState.data) return false;
              const room = resolveRoom(layoutState.data, family._roomValue);
              if (!room || room.building !== buildingFilter) return false;
            }
            if (floorFilter !== "all" && family._roomExists) {
              if (!layoutState.data) return false;
              const room = resolveRoom(layoutState.data, family._roomValue);
              if (!room || String(room.floor) !== floorFilter) return false;
            }
            if (roomTypeFilter !== "all" && family._roomExists) {
              if (!layoutState.data) return false;
              const room = resolveRoom(layoutState.data, family._roomValue);
              if (!room || room.room_type !== roomTypeFilter) return false;
            }
          }
          return true;
        })
        .sort((a, b) => {
          const roomA = layoutState.data ? resolveRoom(layoutState.data, a._roomValue) : null;
          const roomB = layoutState.data ? resolveRoom(layoutState.data, b._roomValue) : null;
          const rankA = familySortRank(a, a._roomValue, roomA);
          const rankB = familySortRank(b, b._roomValue, roomB);
          if (rankA !== rankB) return rankA - rankB;
          if (b._size !== a._size) return b._size - a._size;
          return normalizeText(a.name).localeCompare(normalizeText(b.name));
        });
    }, [familiesList, draftToken, query, buildingFilter, floorFilter, roomTypeFilter, statusFilter, familyStateFilter, queueSizeFilter, layoutState.data, refreshKey]);

    const mobileUnassignedFamilies = useMemo(() => {
      return filteredFamilies
        .filter((family) => {
          if (!query && family._roomExists) return false;
          return true;
        })
        .filter((family) => !["absent", "undecided"].includes(family.status))
        .slice(0, 80);
    }, [filteredFamilies, query]);

    const visibleRooms = useMemo(() => {
      if (!layoutState.data) return [];
      return layoutState.data.buildings
        .map((building) => {
          if (buildingFilter !== "all" && building.building !== buildingFilter) return null;
          
          const floors = building.floors
            .map((floor) => {
              if (floorFilter !== "all" && String(floor.floor) !== floorFilter) return null;
              
              const rooms = floor.rooms
                .map((room) => {
                  if (roomTypeFilter !== "all" && room.room_type !== roomTypeFilter) return null;
                  const bucket = roomBundle.byRoom.get(room.id);
                  const familiesInRoom = bucket?.families || [];
                  const maxOccupancy = getRoomMaxOccupancy(room, familiesInRoom);
                  const status = roomStatus(room, familiesInRoom.length, maxOccupancy);
                  const isSelected = selectedRoomId === room.id;
                  const isDropTarget = dropRoomId === room.id;
                  
                  return {
                    ...room,
                    status,
                    usedBeds: maxOccupancy,
                    familiesInRoom,
                    isSelected,
                    isDropTarget,
                  };
                })
                .filter(Boolean);

              if (roomTypeFilter !== "all" && !rooms.length) return null;

              const floorServiceSpaces = floor.serviceSpaces || [];
              if (!rooms.length && !floorServiceSpaces.length) return null;

              return {
                ...floor,
                rooms,
                serviceSpaces: floorServiceSpaces,
              };
            })
            .filter(Boolean);

          if (!floors.length) return null;
          return {
            ...building,
            floors,
          };
        })
        .filter(Boolean);
    }, [layoutState.data, roomBundle, selectedRoomId, dropRoomId, buildingFilter, floorFilter, roomTypeFilter, refreshKey]);

    const selectedRoomBucket = selectedRoom && roomBundle.byRoom.get(selectedRoom.id);
    const selectedRoomSuggestions = useMemo(() => {
      if (!layoutState.data || !selectedRoom) return [];
      return familiesList
        .map((family, index) => {
          const familyId = getFamilyId(family, index);
          const roomValue = getFamilyRoomValue({ ...family, id: familyId }, draftAssignments);
          const room = resolveRoom(layoutState.data, roomValue);
          return {
            family,
            familyId,
            roomValue,
            room,
            size: getFamilyHeadcount(family),
          };
        })
        .filter((item) => !resolveRoom(layoutState.data, item.roomValue))
        .filter((item) => canFamilyFitInRoom(item.family, selectedRoom, selectedRoomBucket?.families || []))
        .sort((a, b) => {
          if (b.size !== a.size) return b.size - a.size;
          return normalizeText(a.family.name).localeCompare(normalizeText(b.family.name));
        })
        .slice(0, 6);
    }, [layoutState.data, selectedRoom, selectedRoomBucket, familiesList, draftToken, refreshKey]);

    const selectedFamilySuggestions = useMemo(() => {
      if (!layoutState.data || !selectedFamily) return [];
      const familySize = getFamilyHeadcount(selectedFamily);
      return layoutState.data.rooms
        .map((room) => {
          const bucket = roomBundle.byRoom.get(room.id);
          return {
            room,
            bucket,
            familySize,
          };
        })
        .filter((item) => canFamilyFitInRoom(selectedFamily, item.room, item.bucket?.families || []))
        .sort((a, b) => {
          const familyNights = getFamilyStayNights(selectedFamily);
          const scoreA = scoreRoomForFamily(a.bucket || { room: a.room, families: [], headcount: 0 }, familySize, familyNights).score;
          const scoreB = scoreRoomForFamily(b.bucket || { room: b.room, families: [], headcount: 0 }, familySize, familyNights).score;
          for (let i = 0; i < scoreA.length; i += 1) {
            if (scoreA[i] !== scoreB[i]) return scoreA[i] - scoreB[i];
          }
          return 0;
        })
        .slice(0, 8);
    }, [layoutState.data, selectedFamily, roomBundle, refreshKey]);

    function updateAssignment(familyId, roomValue, options = {}) {
      let resolvedValue = roomValue;
      if (roomValue && roomValue !== "미배정") {
        if (typeof roomValue === "object" && roomValue.building && roomValue.label) {
          resolvedValue = `${roomValue.building} ${roomValue.label}`;
        } else if (layoutState.data) {
          const room = resolveRoom(layoutState.data, roomValue);
          if (room) {
            resolvedValue = `${room.building} ${room.label}`;
          }
        }
      }
      setDraftAssignments((prev) => ({ ...prev, [familyId]: resolvedValue || "미배정" }));
      setToastHint(resolvedValue && resolvedValue !== "미배정" ? "배정 초안을 업데이트했습니다." : "배정 초안을 해제했습니다.");
      if (options.preserveView) return;
      if (resolvedValue && resolvedValue !== "미배정" && layoutState.data) {
        const room = resolveRoom(layoutState.data, resolvedValue);
        setSelectedRoomId(room?.id || null);
        setSelectedFamilyId(null);
        setMobileTab("rooms");
      } else {
        setSelectedFamilyId(familyId);
        setSelectedRoomId(null);
      }
    }

    function startDrag(family, event, options = {}) {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current = {
        active: true,
        familyId: family._familyId,
        familyName: family.name,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        x: event.clientX,
        y: event.clientY,
        didMove: false,
        rect: event.currentTarget.getBoundingClientRect(),
        familyObj: family,
        enableTooltip: Boolean(options.enableTooltip),
      };
      setDragState({
        familyId: family._familyId,
        familyName: family.name,
        x: event.clientX,
        y: event.clientY,
      });
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch (e) {
        /* noop */
      }
    }

    function finishDragAt(clientX, clientY) {
      const drag = dragRef.current;
      if (!drag.active) return;
      if (!drag.didMove) {
        if (drag.enableTooltip) {
          setActiveTooltip({ family: drag.familyObj, rect: drag.rect });
        }
      } else {
        const elements = document.elementsFromPoint(clientX, clientY);
        const isDropQueue = elements.some((el) => el?.dataset?.dropQueue || el?.closest("[data-drop-queue]"));
        if (isDropQueue) {
          lastDropAtRef.current = Date.now();
          const family = familiesList.find((item, index) => getFamilyId(item, index) === drag.familyId);
          if (family) {
            updateAssignment(drag.familyId, "미배정", { preserveView: true });
            showToast(`${family.name}의 배정을 해제했습니다.`);
          }
        } else {
          const roomElement = elements.find((element) => element?.dataset?.dropRoomId);
          const roomId = roomElement?.dataset?.dropRoomId || null;
          if (roomId && layoutState.data?.roomById.has(roomId)) {
            lastDropAtRef.current = Date.now();
            const room = layoutState.data.roomById.get(roomId);
            const family = familiesList.find((item, index) => getFamilyId(item, index) === drag.familyId);
            if (family) {
              if (room.unavailable || room.capacity <= 0) {
                showToast(`${room.label}은(는) ${room.unavailable_reason || "사용할 수 없는 공간"}입니다.`);
              } else {
                const bucket = roomBundle.byRoom.get(roomId);
                if (!canFamilyFitInRoom(family, room, bucket?.families || [])) {
                  showToast(`${room.label}의 날짜별 정원을 초과합니다.`);
                } else {
                  updateAssignment(drag.familyId, room, { preserveView: true });
                  showToast(`${family.name} → ${room.label} 배정 초안을 적용했습니다.`);
                }
              }
            }
          }
        }
      }
      dragRef.current = {
        active: false,
        familyId: null,
        familyName: "",
        pointerId: null,
        startX: 0,
        startY: 0,
        x: 0,
        y: 0,
        didMove: false,
      };
      setDragState(null);
      setDropRoomId(null);
    }

    useEffect(() => {
      if (!dragState) return;

      const onMove = (event) => {
        const drag = dragRef.current;
        if (!drag.active) return;
        drag.x = event.clientX;
        drag.y = event.clientY;
        if (!drag.didMove) {
          const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
          if (distance > 6) drag.didMove = true;
        }
        setDragState({
          familyId: drag.familyId,
          familyName: drag.familyName,
          x: event.clientX,
          y: event.clientY,
        });
        const elements = document.elementsFromPoint(event.clientX, event.clientY);
        const roomElement = elements.find((element) => element?.dataset?.dropRoomId);
        const roomId = roomElement?.dataset?.dropRoomId || null;
        if (roomId && layoutState.data?.roomById.has(roomId)) {
          const room = layoutState.data.roomById.get(roomId);
          const family = familiesList.find((item, index) => getFamilyId(item, index) === drag.familyId);
          const bucket = roomBundle.byRoom.get(roomId);
          setDropRoomId(canFamilyFitInRoom(family, room, bucket?.families || []) ? roomId : null);
        } else {
          setDropRoomId(null);
        }
      };

      const onUp = (event) => {
        finishDragAt(event.clientX, event.clientY);
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      window.addEventListener("pointercancel", onUp, { passive: true });
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };
    }, [dragState, layoutState.data, roomBundle, refreshKey]);

    async function saveChanges() {
      if (!isDirty) {
        showToast("저장할 변경사항이 없습니다.");
        return;
      }
      setSaving(true);
      try {
        const changedFamilies = familiesList
          .map((family, index) => {
            const familyId = getFamilyId(family, index);
            const nextRoom = draftAssignments[familyId] || "미배정";
            const currentRoom = baselineAssignments[familyId] || family.room || "미배정";
            if (normalizeRoomValue(nextRoom) === normalizeRoomValue(currentRoom)) return null;
            return {
              family,
              familyId,
              nextRoom,
            };
          })
          .filter(Boolean);

        if (!changedFamilies.length) {
          setBaselineAssignments(draftAssignments);
          showToast("저장할 변경사항이 없습니다.");
          return;
        }

        // 1. Build nextFamilies list with new room assignments
        const nextFamilies = familiesList.map((family, index) => {
          const familyId = getFamilyId(family, index);
          const changed = changedFamilies.find((item) => item.familyId === familyId);
          const nextRoom = changed ? changed.nextRoom : family.room;
          return {
            ...family,
            room: nextRoom,
          };
        });

        // 2. Recalculate fees for all families in nextFamilies using window.calculateFamilyFee
        const updatedFamilies = nextFamilies.map(f => {
          if (window.calculateFamilyFee) {
            const feeResult = window.calculateFamilyFee(f, nextFamilies);
            const fee = typeof feeResult === "object" ? feeResult.total : feeResult;
            return {
              ...f,
              fee: fee
            };
          }
          return f;
        });

        // 3. Find families whose room OR fee has changed
        const familiesToUpdate = updatedFamilies.filter((f, idx) => {
          const original = familiesList[idx];
          return f.room !== original.room || f.fee !== original.fee;
        });

        if (typeof supabaseClient !== "undefined" && supabaseClient && familiesToUpdate.length > 0) {
          const payload = familiesToUpdate.map(family => createDbFamily(family));
          const { error } = await supabaseClient.from("families").upsert(payload);
          if (error) throw error;
        }

        // 4. Update the global families array with new rooms and fees
        familiesToUpdate.forEach(updatedFamily => {
          if (typeof families !== "undefined" && Array.isArray(families)) {
            const globalIndex = families.findIndex((f) => f.id === updatedFamily.id);
            if (globalIndex >= 0) {
              families[globalIndex].room = updatedFamily.room;
              families[globalIndex].fee = updatedFamily.fee;
            }
          }
        });

        setDraftAssignments(buildDraftAssignments(nextFamilies));
        setBaselineAssignments(buildDraftAssignments(nextFamilies));
        setSelectedRoomId(null);
        setSelectedFamilyId(null);
        setToastHint("방 배정이 저장되었습니다.");
        if (typeof renderAll === "function") renderAll();
        showToast(`방 배정 및 회비 변경사항 ${familiesToUpdate.length}건을 저장했습니다.`);
      } catch (error) {
        console.error("방 배정 저장 실패:", error);
        showToast("방 배정을 저장하지 못했습니다.");
      } finally {
        setSaving(false);
      }
    }

    async function autoAssignRooms() {
      if (!layoutState.data || autoAssigning) return;
      setAutoAssigning(true);
      setToastHint("자동 배정을 시작합니다.");
      setAutoAssignProgress({ index: 0, total: 0, family: "", room: "" });

      try {
        const next = { ...draftAssignments };
        const roomBuckets = new Map();
        layoutState.data.rooms.forEach((room) => {
          const bucket = roomBundle.byRoom.get(room.id) || {
            room,
            families: [],
            headcount: 0,
          };
          roomBuckets.set(room.id, {
            room,
            families: [...bucket.families],
            headcount: bucket.headcount || 0,
          });
        });

        const candidates = familiesList
          .map((family, index) => ({
            family,
            familyId: getFamilyId(family, index),
            size: getFamilyHeadcount(family),
            roomValue: getFamilyRoomValue({ ...family, id: getFamilyId(family, index) }, draftAssignments),
          }))
          .filter((item) => !resolveRoom(layoutState.data, item.roomValue))
          .filter((item) => !["absent", "undecided"].includes(item.family.status))
          .sort((a, b) => {
            if (a.size !== b.size) return a.size - b.size;
            const statusOrder = { stay: 0, late: 1, leave: 2, absent: 3, undecided: 4 };
            if ((statusOrder[a.family.status] ?? 9) !== (statusOrder[b.family.status] ?? 9)) {
              return (statusOrder[a.family.status] ?? 9) - (statusOrder[b.family.status] ?? 9);
            }
            return normalizeText(a.family.name).localeCompare(normalizeText(b.family.name));
          });

        let placedCount = 0;
        setAutoAssignProgress({ index: 0, total: candidates.length, family: "", room: "" });

        for (let index = 0; index < candidates.length; index += 1) {
          const item = candidates[index];
          const options = layoutState.data.rooms
            .map((room) => {
              const bucket = roomBuckets.get(room.id);
              return {
                room,
                bucket,
              };
            })
            .filter((option) => canFamilyFitInRoom(item.family, option.room, option.bucket?.families || []))
            .sort((a, b) => {
              const familyNights = getFamilyStayNights(item.family);
              const scoreA = scoreRoomForFamily(a.bucket || { room: a.room, families: [], headcount: 0 }, item.size, familyNights).score;
              const scoreB = scoreRoomForFamily(b.bucket || { room: b.room, families: [], headcount: 0 }, item.size, familyNights).score;
              for (let i = 0; i < scoreA.length; i += 1) {
                if (scoreA[i] !== scoreB[i]) return scoreA[i] - scoreB[i];
              }
              return 0;
            });

          const chosen = options[0];
          setAutoAssignProgress({
            index: index + 1,
            total: candidates.length,
            family: item.family.name,
            room: chosen ? chosen.room.label : "배정 불가",
          });
          setSelectedFamilyId(item.familyId);
          setSelectedRoomId(chosen ? chosen.room.id : null);

          if (chosen) {
            next[item.familyId] = `${chosen.room.building} ${chosen.room.label}`;
            const currentBucket = roomBuckets.get(chosen.room.id);
            currentBucket.headcount += item.size;
            currentBucket.families.push({
              ...item.family,
              _familyId: item.familyId,
              _size: item.size,
            });
            placedCount += 1;
            setToastHint(`${item.family.name} → ${chosen.room.label}`);
            setDraftAssignments({ ...next });
          } else {
            setToastHint(`${item.family.name}은(는) 배정 가능한 방이 없습니다.`);
          }

          await sleep(160);
        }

        setDraftAssignments(next);
        setToastHint(`자동 배정 초안을 ${placedCount}가족에게 적용했습니다.`);
        showToast(`자동 배정 초안을 ${placedCount}가족에게 적용했습니다.`);
      } finally {
        setSelectedRoomId(null);
        setSelectedFamilyId(null);
        setAutoAssigning(false);
        setAutoAssignProgress({ index: 0, total: 0, family: "", room: "" });
      }
    }

    function clearSelectedFamily() {
      if (!selectedFamilyId) return;
      updateAssignment(selectedFamilyId, "미배정");
    }
    function focusRoom(roomId) {
      setSelectedRoomId(roomId);
      setSelectedFamilyId(null);
      if (window.innerWidth < 1024) {
        setMobileTab("rooms");
        setFamilySheetOpen(true);
      }
    }

    function focusFamily(familyId) {
      setSelectedFamilyId(familyId);
      setSelectedRoomId(null);
      if (window.innerWidth < 1024) setMobileTab("families");
    }

    function assignFamilyToSelectedRoom(family) {
      if (!selectedRoom) {
        showToast("방을 먼저 선택해 주세요.");
        return;
      }
      const bucket = roomBundle.byRoom.get(selectedRoom.id);
      if (!canFamilyFitInRoom(family, selectedRoom, bucket?.families || [])) {
        showToast(`${selectedRoom.label}의 날짜별 정원을 초과합니다.`);
        return;
      }
      updateAssignment(family._familyId, selectedRoom);
      showToast(`${family.name} → ${selectedRoom.label} 배정 초안을 적용했습니다.`);
    }

    function hasDifferentSchedules(family) {
      if (!family || !Array.isArray(family.members)) return false;
      const attendingMembers = family.members.filter(member => {
        if (!member) return false;
        if (member[7] === "undecided") return false;
        const periods = member[5] || [];
        return periods.length > 0;
      });
      if (attendingMembers.length <= 1) return false;
      const keys = new Set();
      attendingMembers.forEach(member => {
        const periods = member[5] || [];
        const externalMeals = member[6] || [];
        const key = `${periods.join("|")}::${externalMeals.join("|")}`;
        keys.add(key);
      });
      return keys.size > 1;
    }

    function renderTooltip() {
      if (!activeTooltip) return null;
      const { family, rect } = activeTooltip;
      const comp = getFamilyComposition(family);

      const isDiff = hasDifferentSchedules(family);
      const maxWidth = isDiff ? 490 : 320;

      const tooltipWidth = Math.min(maxWidth, window.innerWidth - 20);
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      if (left < 10) left = 10;
      if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;

      const tooltipStyle = {
        position: "fixed",
        zIndex: 100,
        backgroundColor: "white",
        border: "1px solid #cbd5e1",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        width: `${tooltipWidth}px`,
        left: `${left}px`,
        top: `${rect.top - 8}px`,
        transform: "translateY(-100%)",
      };

      const htmlContent = typeof renderFamilyAttendance === "function" ? renderFamilyAttendance(family) : "";

      return h("div", {
        style: tooltipStyle,
        className: "family-attendance-tooltip pointer-events-auto",
        onClick: (e) => e.stopPropagation()
      },
        h("div", {
          style: {
            position: "absolute",
            bottom: "-6px",
            left: `${rect.left + rect.width / 2 - left}px`,
            transform: "translateX(-50%) rotate(45deg)",
            width: "12px",
            height: "12px",
            backgroundColor: "white",
            borderRight: "1px solid #cbd5e1",
            borderBottom: "1px solid #cbd5e1",
          }
        }),
        h("div", {
          className: "text-sm text-slate-700",
          dangerouslySetInnerHTML: { __html: htmlContent }
        }),
        h("div", { className: "mt-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-500 text-center" },
          `형제 ${comp.brother}명 | 자매 ${comp.sister}명 | 자녀 ${comp.child}명 | 총 ${comp.total}명`
        )
      );
    }

    function renderDailyUsageTable() {
      if (!dailyUsageData) return null;
      
      const { roomTypes, totalByType, occupiedByType } = dailyUsageData;
      
      const totalRoomsAll = Object.values(totalByType).reduce((a, b) => a + b, 0);
      const occupiedAll = [0, 0, 0];
      roomTypes.forEach(t => {
        const occ = occupiedByType[t] || [0, 0, 0];
        for (let i = 0; i < 3; i++) {
          occupiedAll[i] += occ[i];
        }
      });
      
      const dates = [
        { label: "7/27 (1일차)", index: 0 },
        { label: "7/28 (2일차)", index: 1 },
        { label: "7/29 (3일차)", index: 2 }
      ];
      
      return h("div", { className: "mt-4 sm:mt-6 rounded-2xl sm:rounded-[28px] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm overflow-hidden" },
        h("div", { className: "flex items-center justify-between mb-3 sm:mb-4" },
          h("div", null,
            h("div", { className: "flex items-center gap-2" },
              renderIcon("calendar", "h-4 w-4 sm:h-5 sm:w-5 text-[#1e5a45]"),
              h("h3", { className: "text-base sm:text-lg font-semibold text-slate-900" }, "날짜별 방 사용 현황")
            ),
            h("p", { className: "text-[10px] sm:text-xs text-slate-500 mt-1 pl-6 sm:pl-7" }, "해당 날짜에 최소 1명 이상 숙박하는 방 / 배정 가능한 총 방 수")
          )
        ),
        h("div", { className: "overflow-x-auto" },
          h("table", { className: "daily-usage-table w-full border-collapse text-left text-xs sm:text-sm text-slate-600" },
            h("thead", null,
              h("tr", { className: "border-b border-slate-100 bg-slate-50/50" },
                h("th", { className: "px-2 sm:px-4 py-2 sm:py-3 font-semibold text-slate-700" }, "방 타입"),
                dates.map(d => h("th", { key: d.index, className: "px-2 sm:px-4 py-2 sm:py-3 font-semibold text-slate-700 text-center" }, d.label))
              )
            ),
            h("tbody", null,
              roomTypes.map(t => {
                const total = totalByType[t] || 0;
                const occ = occupiedByType[t] || [0, 0, 0];
                return h("tr", { key: t, className: "border-b border-slate-100/70 hover:bg-slate-50/30 transition-colors" },
                  h("td", { className: "px-2 sm:px-4 py-2 sm:py-3 font-medium text-slate-800" }, t),
                  [0, 1, 2].map(i => {
                    const used = occ[i];
                    return h("td", { key: i, className: "px-2 sm:px-4 py-2 sm:py-3 text-center text-slate-900 font-semibold" }, `${used}/${total}`);
                  })
                );
              }),
              h("tr", { className: "bg-slate-50/70 font-semibold" },
                h("td", { className: "px-2 sm:px-4 py-3 sm:py-3.5 text-slate-900" }, "합계"),
                [0, 1, 2].map(i => {
                  const used = occupiedAll[i];
                  return h("td", { key: i, className: "px-2 sm:px-4 py-3 sm:py-3.5 text-center text-slate-900 font-bold text-sm sm:text-base" }, `${used}/${totalRoomsAll}`);
                })
              )
            )
          )
        )
      );
    }

    function renderSummaryChip(icon, label, value, tone) {
      return h(
        "div",
        { className: cx("rounded-2xl border bg-white/85 px-4 py-3 shadow-sm backdrop-blur", tone) },
        h("div", { className: "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500" }, renderIcon(icon, "h-4 w-4"), label),
        h("div", { className: "mt-2 text-2xl font-semibold text-slate-900" }, value)
      );
    }

    function renderRoomCard(room, bucket) {
      const selected = selectedRoomId === room.id;
      const dragTarget = dropRoomId === room.id;
      const familiesInRoom = bucket?.families || [];
      const maxOccupancy = getRoomMaxOccupancy(room, familiesInRoom);
      const status = roomStatus(room, familiesInRoom.length, maxOccupancy);
      const fillPercent = room.capacity > 0 ? Math.min(100, Math.round((maxOccupancy / room.capacity) * 100)) : 0;
      const canAssign = !room.unavailable && room.capacity > 0;
      const showOccupancy = shouldShowOccupancyDetails(room);

      return h(
        "div",
        {
          key: room.id,
          "data-drop-room-id": canAssign ? room.id : undefined,
          className: cx(
            "group relative flex min-h-[170px] flex-col rounded-[24px] border p-4 text-left shadow-sm transition-all duration-200",
            roomToneClass(status, selected, dragTarget),
            canAssign ? "hover:-translate-y-0.5 hover:shadow-lg" : "cursor-not-allowed"
          ),
        },
        h("div", { className: "flex items-start justify-between gap-3" },
          h("div", null,
            h("div", { className: "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500" },
              renderIcon("building-2", "h-3.5 w-3.5"),
              room.building
            ),
            h("div", { className: "flex items-center gap-2" },
              h("h4", { className: "mt-1 text-sm font-semibold text-slate-900" }, room.label),
              canAssign ? h("span", { className: cx("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ring-1", 
                maxOccupancy > 0 ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200"
              ) }, maxOccupancy > 0 ? "배정" : "미배정") : null
            ),
            h("div", { className: "mt-1 flex flex-wrap items-center gap-1.5" },
              h("span", { className: "rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200" }, room.floorLabel || `${room.floor}층`),
              toCompactRoomBadge(room) !== room.label ? h("span", { className: "rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600" }, toCompactRoomBadge(room)) : null
            )
          ),
          h("div", { className: "flex flex-col items-end gap-1" },
            h("span", { className: "rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200" }, `정원 ${room.capacity}명`),
            h("span", { className: cx("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", {
              empty: "bg-slate-50 text-slate-500 ring-slate-200",
              partial: "bg-emerald-50 text-emerald-700 ring-emerald-200",
              full: "bg-emerald-100 text-emerald-700 ring-emerald-300",
              overflow: "bg-rose-50 text-rose-700 ring-rose-200",
            }[status]) }, status === "empty" ? "비어 있음" : status === "partial" ? "부분 사용" : status === "full" ? "만실" : "초과")
          )
        ),
        h("div", { className: "mt-4 space-y-3" },
          canAssign ? renderNightProgressBar(room, familiesInRoom) : null,
          canAssign && room.capacity >= 6 ? h("div", { className: "flex items-center justify-between text-[11px] font-medium text-slate-500" },
            h("span", null, `입실 ${maxOccupancy}명`),
            h("span", null, `잔여 ${Math.max(room.capacity - maxOccupancy, 0)}명`)
          ) : null,
          canAssign ? (familiesInRoom.length
            ? h("div", { className: "flex flex-wrap gap-2" },
                familiesInRoom.map((family) =>
                  h("button", {
                    key: `${room.id}-${family._familyId}`,
                    type: "button",
                    onPointerDown: (event) => startDrag(family, event, { enableTooltip: true }),
                    onClick: (event) => event.stopPropagation(),
                    className: "inline-flex max-w-full items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-sm cursor-grab active:cursor-grabbing touch-none",
                  },
                    h("span", { className: "h-1.5 w-1.5 rounded-full bg-[#1e5a45] shrink-0" }),
                    h("span", { className: "whitespace-normal break-all text-left" }, familyDisplayName(family)),
                    h("span", { className: "text-slate-400 shrink-0" }, `(${family._size})`)
                  )
                )
              )
            : h(
                "div",
                {
                  className:
                    "rounded-2xl border border-dashed border-slate-200 bg-white/80 px-3 py-4 text-sm text-slate-500",
                },
                "아직 배정된 가족이 없습니다. 드래그하거나 자동 배정을 사용해 보세요."
              )) : null,
          canAssign ? h("div", { className: "flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-500" },
            h("span", null, room.source_text || `${room.label} 정보`),
            h("span", null, `${room.row || 0}행 · ${room.column || 0}열`)
          ) : null
        )
      );
    }

    function renderFamilyCard(family) {
      const room = layoutState.data ? resolveRoom(layoutState.data, family._roomValue) : null;
      const roomLabel = room?.label || "미배정";
      const isSelected = selectedFamilyId === family._familyId;
      const isAssigned = Boolean(room);
      const statusTone = familyStatusTone(family.status);

      return h(
        "article",
        {
          key: family._familyId,
          className: cx(
            "rounded-[24px] border bg-white/90 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
            isSelected ? "border-[#1e5a45] ring-2 ring-[#1e5a45]/15" : "border-slate-200"
          ),
          onClick: () => focusFamily(family._familyId),
        },
        h("div", { className: "flex items-start justify-between gap-3" },
          h("div", null,
            h("div", { className: "flex items-center gap-2" },
              h("h4", { className: "text-base font-semibold text-slate-900" }, familyDisplayName(family)),
              h("span", { className: cx("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", statusTone) }, STATUS_LABELS[family.status] || "미정")
            ),
            h("p", { className: "mt-1 text-sm text-slate-500" }, familyLeader(family)),
          ),
          h(
            "button",
            {
              type: "button",
              onPointerDown: (event) => startDrag(family, event),
              className:
                "inline-flex items-center gap-1 rounded-full bg-[#1e5a45]/10 px-2.5 py-1 text-[11px] font-semibold text-[#1e5a45] transition hover:bg-[#1e5a45]/15 active:scale-95",
              title: "드래그하여 방에 배정",
            },
            renderIcon("move", "h-3.5 w-3.5"),
            "드래그"
          )
        ),
        h("div", { className: "mt-4 grid gap-3 sm:grid-cols-3" },
          h("div", { className: "rounded-2xl bg-slate-50 px-3 py-2" },
            h("div", { className: "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500" }, "인원"),
            h("div", { className: "mt-1 text-base font-semibold text-slate-900" }, `${family._size}명`)
          ),
          h("div", { className: "rounded-2xl bg-slate-50 px-3 py-2" },
            h("div", { className: "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500" }, "방"),
            h("div", { className: "mt-1 text-base font-semibold text-slate-900" }, roomLabel)
          ),
          h("div", { className: "rounded-2xl bg-slate-50 px-3 py-2" },
            h("div", { className: "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500" }, "연락처"),
            h("div", { className: "mt-1 text-base font-semibold text-slate-900" }, family.phone || "미입력")
          )
        ),
        h("div", { className: "mt-4 flex flex-wrap items-center gap-2" },
          h("button", {
            type: "button",
            onClick: (event) => {
              event.stopPropagation();
              updateAssignment(family._familyId, "미배정");
            },
            className: "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50",
          }, "미배정으로 변경"),
          h("button", {
            type: "button",
            onClick: (event) => {
              event.stopPropagation();
              setSelectedFamilyId(family._familyId);
              if (selectedRoom) updateAssignment(family._familyId, selectedRoom);
              else showToast("먼저 배정할 방을 선택해 주세요.");
            },
            className: "rounded-full bg-[#1e5a45] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#184a39]",
          }, "선택한 방에 배정")
        ),
        !isAssigned
          ? h("div", { className: "mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 px-3 py-2 text-sm text-amber-700" },
              "현재 미배정 상태입니다. 드래그하거나 추천 방을 선택해 주세요."
            )
          : null
      );
    }

    function renderQueueFamilyCard(family) {
      const room = layoutState.data ? resolveRoom(layoutState.data, family._roomValue) : null;
      const roomLabel = room?.label || "미배정";
      const isSelected = selectedFamilyId === family._familyId;
      const isAssigned = Boolean(room);
      const composition = getFamilyComposition(family);

      return h(
        "article",
        {
          key: family._familyId,
          className: cx(
            "group rounded-2xl border bg-white px-3 py-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
            isSelected ? "border-[#1e5a45] ring-2 ring-[#1e5a45]/15" : "border-slate-200"
          ),
          onClick: () => focusFamily(family._familyId),
        },
        h("div", { className: "flex items-center gap-2" },
          h(
            "button",
            {
              type: "button",
              onPointerDown: (event) => startDrag(family, event),
              onClick: (event) => event.stopPropagation(),
              className: "flex h-9 w-9 shrink-0 touch-none items-center justify-center rounded-xl bg-[#1e5a45]/10 text-[#1e5a45] transition active:scale-95",
              title: "드래그하여 방에 배정",
              "aria-label": `${family.name} 드래그하여 방에 배정`,
            },
            renderIcon("grip-vertical", "h-4 w-4")
          ),
          h("div", { className: "min-w-0 flex-1" },
            h("div", { className: "flex items-center gap-2" },
              h("h4", { className: "truncate text-sm font-semibold text-slate-950" }, familyDisplayName(family)),
              h("span", { className: cx("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1", isAssigned ? "bg-slate-100 text-slate-600 ring-slate-200" : "bg-amber-50 text-amber-700 ring-amber-200") }, roomLabel)
            ),
            h("div", { className: "mt-1 text-[10px] font-semibold text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis" },
              `형제 ${composition.brother} · 자매 ${composition.sister} · 자녀 ${composition.child} · 총 ${composition.total}명`
            )
          )
        )
      );
    }

    function getRoomTypeTone(room) {
      const type = room?.room_type;
      if (room?.unavailable || type === "unavailable") return "bg-slate-100 text-slate-500 ring-slate-200";
      if (type === "single") return "bg-sky-50 text-sky-700 ring-sky-200";
      if (type === "twin") return "bg-indigo-50 text-indigo-700 ring-indigo-200";
      if (type === "ondol_4") return "bg-amber-50 text-amber-700 ring-amber-200";
      if (type === "6_person") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
      if (type === "12_person") return "bg-rose-50 text-rose-700 ring-rose-200";
      return "bg-slate-100 text-slate-600 ring-slate-200";
    }

    function getFloorColumnRange(floor) {
      const columns = []
        .concat((floor.rooms || []).map((room) => room.column))
        .concat((floor.serviceSpaces || []).map((space) => space.column))
        .filter((column) => Number.isFinite(Number(column)));
      if (!columns.length) return { min: 1, max: 1, span: 1 };
      const min = Math.min(...columns);
      const max = Math.max(...columns);
      return { min, max, span: Math.max(max - min + 1, 1) };
    }

    function sortByWorkbookPosition(a, b) {
      if ((a.row || 0) !== (b.row || 0)) return (a.row || 0) - (b.row || 0);
      return (a.column || 0) - (b.column || 0);
    }

    function splitFloorItems(floor) {
      const corridorRow = floor.corridor_row || floor.corridorRow || 0;
      const rooms = floor.rooms || [];
      const serviceSpaces = floor.serviceSpaces || [];
      const northRooms = rooms.filter((room) => room.corridor_relationship !== "south_of_corridor").sort(sortByWorkbookPosition);
      const southRooms = rooms.filter((room) => room.corridor_relationship === "south_of_corridor").sort(sortByWorkbookPosition);
      const northServices = serviceSpaces.filter((space) => space.type !== "corridor" && (!corridorRow || space.row < corridorRow)).sort(sortByWorkbookPosition);
      const southServices = serviceSpaces.filter((space) => space.type !== "corridor" && corridorRow && space.row > corridorRow).sort(sortByWorkbookPosition);
      const corridorServices = serviceSpaces.filter((space) => space.type === "corridor" || (corridorRow && space.row === corridorRow)).sort(sortByWorkbookPosition);
      return { northRooms, southRooms, northServices, southServices, corridorServices };
    }

    function groupServiceSpacesForRow(spaces) {
      const blockingLabels = new Set(["당직실", "비품실", "미화원실", "조리원실"]);
      const byColumn = new Map();
      spaces
        .filter((space) => !blockingLabels.has(normalizeText(space.label)))
        .forEach((space) => {
          const key = space.column;
          if (!byColumn.has(key)) {
            byColumn.set(key, {
              ...space,
              type: "service_stack",
              labels: [],
            });
          }
          byColumn.get(key).labels.push(space.label);
        });
      return [...byColumn.values()].sort(sortByWorkbookPosition);
    }

    function renderServiceCell(space, columnRange) {
      const col = Math.max((space.column || columnRange.min) - columnRange.min + 1, 1);
      const labels = space.labels || [space.label];
      const text = labels.filter(Boolean).join(" / ");
      const icon = text.includes("계단") ? "stairs" : text.includes("화장실") ? "shower-head" : text.includes("세탁") ? "washing-machine" : "panel-top";
      return h(
        "div",
        {
          key: space.id || `${space.label}-${space.cell}`,
          className: "flex h-full min-h-[108px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/55 px-2 text-center text-[10px] font-semibold leading-4 text-slate-400",
          style: { gridColumn: `${col} / span 1` },
          title: `${text || "공용공간"} · ${space.cell || ""}`,
        },
        h("span", { className: "flex flex-col items-center gap-1" },
          renderIcon(icon, "h-3.5 w-3.5"),
          labels.map((label) => h("span", { key: label }, label || "공용"))
        )
      );
    }

    function renderMapRoomTile(room, bucket, density = "desktop") {
      const selected = selectedRoomId === room.id;
      const dragTarget = dropRoomId === room.id;
      const familiesInRoom = bucket?.families || [];
      const maxOccupancy = getRoomMaxOccupancy(room, familiesInRoom);
      const status = roomStatus(room, familiesInRoom.length, maxOccupancy);
      const compact = density === "compact";
      const canAssign = !room.unavailable && room.capacity > 0;
      const showOccupancy = shouldShowOccupancyDetails(room);
      const isQueryMatch = isRoomQueryMatch(room, familiesInRoom, query);

      return h(
        "div",
        {
          key: room.id,
          "data-drop-room-id": canAssign ? room.id : undefined,
          className: cx(
            "group relative flex flex-col rounded-2xl border text-left shadow-sm transition-all duration-200",
            compact ? "min-h-[94px] p-3" : "min-h-[96px] p-3",
            roomToneClass(status, selected, dragTarget),
            canAssign ? "hover:-translate-y-0.5 hover:shadow-lg" : "cursor-not-allowed",
            !isQueryMatch && "opacity-20 pointer-events-none"
          ),
          title: `${room.label} · ${toRoomBadge(room)} · ${room.cell || ""}`,
        },
        h("div", { className: "flex flex-col gap-1 w-full" },
          h("div", { className: "flex items-center justify-between gap-1 w-full" },
            h("div", { className: cx("font-semibold text-slate-950", compact ? "text-xs" : "text-sm") }, room.label),
            canAssign ? h("span", { className: cx("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ring-1", 
              maxOccupancy > 0 ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200"
            ) }, maxOccupancy > 0 ? "배정" : "미배정") : null
          ),
          h("div", { className: "flex flex-wrap items-center gap-1" },
            toCompactRoomBadge(room) !== room.label ? h("span", { className: cx("inline-flex max-w-full rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1", getRoomTypeTone(room)) }, toCompactRoomBadge(room)) : null
          )
        ),
        canAssign ? renderNightProgressBar(room, familiesInRoom) : null,
        canAssign && room.capacity >= 6 ? h("div", { className: "mt-1.5 flex items-center justify-between text-[10px] font-medium text-slate-500" },
          h("span", null, `${maxOccupancy}/${room.capacity}명`),
          h("span", null, maxOccupancy ? `잔여 ${Math.max(room.capacity - maxOccupancy, 0)}` : "드롭 가능")
        ) : null,
        canAssign ? h("div", { className: "mt-2 flex flex-wrap gap-1" },
          familiesInRoom.length
            ? familiesInRoom.map((family) =>
                h("span", {
                  key: `${room.id}-${family._familyId}`,
                  onPointerDown: (event) => startDrag(family, event, { enableTooltip: true }),
                  onClick: (event) => event.stopPropagation(),
                  className: "inline-flex max-w-full touch-none items-center gap-1 rounded-full bg-white px-1.5 py-1 text-[10px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-sm cursor-grab active:cursor-grabbing",
                  title: "다른 방으로 드래그",
                },
                  h("span", { className: "h-1.5 w-1.5 rounded-full bg-[#1e5a45] shrink-0" }),
                  h("span", { className: "whitespace-nowrap truncate text-left" }, familyDisplayName(family).replace(" 가족", ""))
                )
              )
            : h("span", { className: "rounded-full border border-dashed border-slate-200 bg-white/70 px-2 py-1 text-[10px] font-medium text-slate-400" }, "비어 있음")
        ) : null
      );
    }

    function renderFloorRow(items, columnRange, keyPrefix, density = "desktop") {
      if (!items.length) {
        return h("div", {
          key: `${keyPrefix}-empty`,
          className: "min-h-[44px] rounded-2xl border border-dashed border-slate-200 bg-white/35",
        });
      }
      
      const isDongrak = keyPrefix.includes("동락홀") || (items[0] && items[0].building === "동락홀");
      
      return h(
        "div",
        {
          key: keyPrefix,
          className: "grid gap-2.5",
          style: { 
            gridTemplateColumns: isDongrak 
              ? `repeat(${items.length}, minmax(${density === "compact" ? "74px" : "116px"}, 1fr))`
              : `repeat(${columnRange.span}, minmax(${density === "compact" ? "74px" : "116px"}, 1fr))` 
          },
        },
        items.map((item, idx) => {
          const col = isDongrak ? idx + 1 : Math.max((item.column || columnRange.min) - columnRange.min + 1, 1);
          if (item.type === "service_space" || item.type === "service_stack") {
            return h("div", {
              key: item.id || item.cell,
              className: "relative flex items-center justify-center rounded-2xl border border-slate-200/50 bg-slate-100/50 p-2.5 text-center text-xs font-medium text-slate-400 select-none",
              style: { gridColumn: isDongrak ? `${col} / span 1` : `${col} / span ${item.column_span || 1}` },
            }, item.label);
          }
          return h(
            "div",
            { key: item.id, style: { gridColumn: `${col} / span 1` }, className: "min-w-0" },
            renderMapRoomTile(item, roomBundle.byRoom.get(item.id), density)
          );
        })
      );
    }

    function renderCorridorBand(floor, corridorServices, columnRange) {
      const isDongrak = floor.building === "동락홀";
      
      const activeServices = isDongrak ? [] : corridorServices.filter((space) => {
        const label = space.label?.replace(/\s+/g, "").trim();
        return label && label !== "복도";
      });

      return h(
        "div",
        {
          className: "relative my-3 grid min-h-[44px] items-center rounded-full border border-slate-200/80 bg-slate-100/70 px-4",
          style: { 
            gridTemplateColumns: isDongrak 
              ? `1fr` 
              : `repeat(${columnRange.span}, minmax(116px, 1fr))` 
          },
        },
        h("div", { className: "relative z-10 col-span-full mx-auto text-xs font-bold text-slate-500 uppercase tracking-wider" },
          `${floor.label || `${floor.floor}층`} 복도`
        ),
        activeServices.map((space) => {
          const col = Math.max((space.column || columnRange.min) - columnRange.min + 1, 1);
          return h("span", {
            key: space.id || space.cell,
            className: "relative z-20 justify-self-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 shadow-sm border border-slate-200",
            style: { gridColumn: `${col} / span 1` },
          }, space.label.replace(/\s+/g, " "));
        })
      );
    }

    function renderFloorPlan(floor, density = "desktop") {
      return h(FloorPlanCard, {
        key: `${floor.building || "building"}-${floor.floor}`,
        floor,
        density,
        roomBundle,
        selectedRoomId,
        setSelectedRoomId,
        setSelectedFamilyId,
        mobileTab,
        setMobileTab,
        dropRoomId,
        dragState,
        layoutIndex: layoutState.data,
        renderFloorRow,
        renderCorridorBand,
        splitFloorItems,
        getFloorColumnRange,
        groupServiceSpacesForRow,
        sortByWorkbookPosition,
        getRoomTypeTone,
      });
    }

    function renderInspector() {
      if (!layoutState.data) {
        return h("div", { className: "rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" }, "방 배정 데이터를 불러오는 중입니다.");
      }

      const family = selectedFamily;
      const room = selectedRoom;

      if (!room && !family) {
        return h(
          "div",
          { className: "rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" },
          h("div", { className: "flex items-center gap-2 text-sm font-semibold text-slate-500" }, renderIcon("sparkles", "h-4 w-4"), "인스펙터"),
          h("h3", { className: "mt-3 text-lg font-semibold text-slate-900" }, "방이나 가족을 선택하면 세부 정보가 표시됩니다."),
          h("p", { className: "mt-2 text-sm leading-6 text-slate-500" }, "이 패널에서 선택 항목의 수용 인원, 배정 현황, 추천 후보를 확인하고 바로 배정할 수 있습니다.")
        );
      }

      if (room) {
        const bucket = selectedRoomBucket || { families: [], headcount: 0 };
        const maxOccupancy = getRoomMaxOccupancy(room, bucket.families);
        const usedBeds = maxOccupancy;
        const remaining = Math.max(room.capacity - maxOccupancy, 0);
        const status = roomStatus(room, bucket.families.length, maxOccupancy);
        return h(
          "div",
          { className: "rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" },
          h("div", { className: "flex items-start justify-between gap-3" },
            h("div", null,
              h("div", { className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500" }, renderIcon("bed-double", "h-4 w-4"), "선택된 방"),
              h("h3", { className: "mt-2 text-2xl font-semibold text-slate-900" }, room.label),
              h("div", { className: "mt-2 flex flex-wrap gap-2" },
                h("span", { className: "rounded-full bg-[#1e5a45]/10 px-2.5 py-1 text-[11px] font-semibold text-[#1e5a45]" }, room.building),
                h("span", { className: "rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600" }, room.floorLabel || `${room.floor}층`),
                h("span", { className: "rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600" }, toRoomBadge(room)),
                h("span", { className: cx("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", {
                  empty: "bg-slate-50 text-slate-500 ring-slate-200",
                  partial: "bg-emerald-50 text-emerald-700 ring-emerald-200",
                  full: "bg-emerald-100 text-emerald-700 ring-emerald-300",
                  overflow: "bg-rose-50 text-rose-700 ring-rose-200",
                }[status]) }, status === "empty" ? "비어 있음" : status === "partial" ? "부분 사용" : status === "full" ? "만실" : "초과")
              )
            ),
            h("button", {
              type: "button",
              onClick: () => setSelectedRoomId(null),
              className: "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50",
            }, "닫기")
          ),
          h("div", { className: "mt-5 grid gap-4 sm:grid-cols-3" },
            renderSummaryChip("users", "배정 인원", `${usedBeds}명`, "text-slate-900"),
            renderSummaryChip("door-open", "남은 자리", `${remaining}명`, "text-slate-900"),
            renderSummaryChip("check-circle-2", "정원", `${room.capacity}명`, "text-slate-900")
          ),
          h("div", { className: "mt-5 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4" },
            h("div", { className: "flex items-center justify-between text-sm font-semibold text-slate-700" },
              h("span", null, "날짜별 배정 현황"),
              h("span", null, `${Math.min(100, Math.round((usedBeds / room.capacity) * 100))}%`)
            ),
            h("div", { className: "mt-1" },
              renderNightProgressBar(room, bucket.families)
            ),
            h("p", { className: "mt-3 text-sm leading-6 text-slate-600" },
              room.source_text || "원본 셀 정보가 없습니다.",
              " · ",
              room.cell || "-"
            )
          ),
          h("div", { className: "mt-5" },
            h("div", { className: "flex items-center justify-between" },
              h("h4", { className: "text-sm font-semibold text-slate-900" }, "현재 배정 가족"),
              h("span", { className: "text-xs text-slate-500" }, `${bucket.families.length}가족`)
            ),
            bucket.families.length
              ? h("div", { className: "mt-3 space-y-2" },
                  bucket.families.map((familyItem) =>
                    h("div", {
                      key: familyItem._familyId,
                      className: "flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-3",
                    },
                      h("div", null,
                        h("div", { className: "font-semibold text-slate-900" }, familyItem.name),
                        h("div", { className: "mt-0.5 text-xs text-slate-500" }, `${familyItem.leader || "대표 미상"} · ${familyItem._size}명`)
                      ),
                      h("button", {
                        type: "button",
                        onClick: () => updateAssignment(familyItem._familyId, "미배정"),
                        className: "rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50",
                      }, "해제")
                    )
                  )
                )
              : h("div", { className: "mt-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500" }, "이 방에는 아직 가족이 배정되지 않았습니다.")
          ),
          h("div", { className: "mt-5" },
            h("div", { className: "flex items-center justify-between" },
              h("h4", { className: "text-sm font-semibold text-slate-900" }, "추천 가능한 가족"),
              h("span", { className: "text-xs text-slate-500" }, `${selectedRoomSuggestions.length}명`)
            ),
            selectedRoomSuggestions.length
              ? h("div", { className: "mt-3 flex flex-wrap gap-2" },
                  selectedRoomSuggestions.map((item) =>
                    h("button", {
                      key: item.familyId,
                      type: "button",
                      onClick: () => updateAssignment(item.familyId, room),
                      className: "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100",
                    }, `${familyDisplayName(item.family)} · ${item.size}명`)
                  )
                )
              : h("div", { className: "mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500" }, "이 방에 더 들어올 수 있는 가족이 없습니다.")
          )
        );
      }

      const familySize = getFamilyHeadcount(family);
      const roomValue = getFamilyRoomValue({ ...family, id: selectedFamilyId }, draftAssignments);
      const roomResolved = resolveRoom(layoutState.data, roomValue);
      const suggestions = selectedFamilySuggestions;

      return h(
        "div",
        { className: "rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" },
        h("div", { className: "flex items-start justify-between gap-3" },
          h("div", null,
            h("div", { className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500" }, renderIcon("users", "h-4 w-4"), "선택된 가족"),
            h("h3", { className: "mt-2 text-2xl font-semibold text-slate-900" }, familyDisplayName(family)),
            h("div", { className: "mt-2 flex flex-wrap gap-2" },
              h("span", { className: cx("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", familyStatusTone(family.status)) }, STATUS_LABELS[family.status] || "미정"),
              h("span", { className: "rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600" }, `${familySize}명`),
              h("span", { className: "rounded-full bg-[#1e5a45]/10 px-2.5 py-1 text-[11px] font-semibold text-[#1e5a45]" }, roomResolved ? roomResolved.label : "미배정")
            )
          ),
          h("button", {
            type: "button",
            onClick: () => setSelectedFamilyId(null),
            className: "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50",
          }, "닫기")
        ),
        h("div", { className: "mt-5 grid gap-4 sm:grid-cols-3" },
          renderSummaryChip("bed-double", "현재 방", roomResolved ? roomResolved.label : "미배정", "text-slate-900"),
          renderSummaryChip("users", "가족 인원", `${familySize}명`, "text-slate-900"),
          renderSummaryChip("route", "상태", STATUS_LABELS[family.status] || "미정", "text-slate-900")
        ),
        h("div", { className: "mt-5 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4" },
          h("h4", { className: "text-sm font-semibold text-slate-900" }, "추천 방"),
          suggestions.length
            ? h("div", { className: "mt-3 space-y-2" },
                suggestions.map((item) =>
                  h("button", {
                    key: item.room.id,
                    type: "button",
                    onClick: () => updateAssignment(selectedFamilyId, item.room),
                    className: "flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-sm",
                  },
                    h("div", null,
                      h("div", { className: "font-semibold text-slate-900" }, item.room.label),
                      h("div", { className: "mt-0.5 text-xs text-slate-500" }, `${item.room.building} · ${item.room.floorLabel || `${item.room.floor}층`} · ${item.room.room_type_label || toRoomBadge(item.room)}`)
                    ),
                    h("div", { className: "text-right" },
                      h("div", { className: "text-sm font-semibold text-emerald-700" }, `잔여 ${item.available - familySize}명`),
                      h("div", { className: "text-xs text-slate-500" }, `정원 ${item.room.capacity}명`)
                    )
                  )
                )
              )
            : h("div", { className: "mt-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500" }, "추천 가능한 방이 없습니다. 필터를 바꾸거나 다른 방을 선택해 주세요.")
        ),
        h("div", { className: "mt-5 flex flex-wrap gap-2" },
          h("button", {
            type: "button",
            onClick: () => updateAssignment(selectedFamilyId, "미배정"),
            className: "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50",
          }, "미배정으로 되돌리기"),
          h("button", {
            type: "button",
            onClick: () => {
              if (!selectedRoom) {
                showToast("먼저 배정할 방을 선택해 주세요.");
                return;
              }
              updateAssignment(selectedFamilyId, selectedRoom);
            },
            className: "rounded-full bg-[#1e5a45] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#184a39]",
          }, "선택한 방에 배정")
        )
      );
    }

    function renderMobileRoomCard(room, bucket) {
      const selected = selectedRoomId === room.id;
      const dragTarget = dropRoomId === room.id;
      const familiesInRoom = bucket?.families || [];
      const maxOccupancy = getRoomMaxOccupancy(room, familiesInRoom);
      const status = roomStatus(room, familiesInRoom.length, maxOccupancy);
      const remaining = Math.max(room.capacity - maxOccupancy, 0);
      const canAssign = !room.unavailable && room.capacity > 0;
      const showOccupancy = shouldShowOccupancyDetails(room);
      const isQueryMatch = isRoomQueryMatch(room, familiesInRoom, query);

      return h(
        "div",
        {
          key: room.id,
          "data-drop-room-id": canAssign ? room.id : undefined,
          onClick: () => {
            if (!canAssign) {
              showToast(`${room.label}은(는) ${room.unavailable_reason || "사용할 수 없는 공간"}입니다.`);
              return;
            }
            focusRoom(room.id);
          },
          className: cx(
            "min-h-[112px] w-full rounded-lg border p-3 text-left shadow-sm transition active:scale-[0.98] cursor-pointer",
            roomToneClass(status, selected, dragTarget),
            !isQueryMatch && "opacity-20 pointer-events-none"
          ),
        },
        h("div", { className: "flex items-start justify-between gap-2" },
          h("div", { className: "min-w-0 flex-1 w-full" },
            h("div", { className: "flex items-center justify-between gap-1 w-full" },
              h("div", { className: "text-sm font-semibold leading-5 text-slate-950" }, room.label),
              canAssign ? h("span", { className: cx("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ring-1", 
                maxOccupancy > 0 ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200"
              ) }, maxOccupancy > 0 ? "배정" : "미배정") : null
            ),
            h("div", { className: "mt-1 flex flex-wrap items-center gap-1" },
              toCompactRoomBadge(room) !== room.label ? h("span", { className: cx("inline-flex max-w-full rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1", getRoomTypeTone(room)) }, toCompactRoomBadge(room)) : null
            )
          ),
          h("span", { className: "text-[10px] font-medium text-slate-500" }, `정원 ${room.capacity}명`)
        ),
        canAssign ? renderNightProgressBar(room, familiesInRoom) : null,
        canAssign && room.capacity >= 6 ? h("div", { className: "mt-2 flex items-center justify-between text-[11px] font-medium text-slate-500" },
          h("span", null, `${maxOccupancy}/${room.capacity}명`),
          h("span", null, remaining ? `+${remaining}` : "완료")
        ) : !canAssign ? h("div", { className: "mt-2 text-[10px] font-semibold text-slate-500" }, room.unavailable_reason || "사용할 수 없는 공간") : null,
        canAssign || familiesInRoom.length ? h("div", { className: "mt-3 flex flex-wrap gap-1.5" },
          familiesInRoom.length
            ? familiesInRoom.map((family) =>
                h("span", {
                  key: `${room.id}-${family._familyId}`,
                  onClick: (event) => {
                    event.stopPropagation();
                    if (window.innerWidth < 1024 || document.body.classList.contains("mobile-mode")) {
                      if (confirm(`${familyDisplayName(family)}을(를) ${room.label}에서 배정 취소하시겠습니까?`)) {
                        updateAssignment(family._familyId, "미배정");
                        showToast(`${familyDisplayName(family)} 배정이 취소되었습니다.`);
                      }
                    } else {
                      setActiveTooltip({ family, rect: event.currentTarget.getBoundingClientRect() });
                    }
                  },
                  className: "max-w-full rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 whitespace-nowrap truncate text-left cursor-pointer",
                }, familyDisplayName(family).replace(" 가족", ""))
              )
            : h("span", { className: "rounded-md border border-dashed border-slate-200 bg-white/70 px-2 py-1 text-[11px] font-medium text-slate-400" }, "비어 있음")
        ) : null
      );
    }

    function renderMobileFamilyRow(family) {
      const composition = getFamilyComposition(family);
      return h(
        "div",
        {
          key: family._familyId,
          className: "flex min-h-[64px] items-center gap-3 border-b border-slate-100 px-4 py-2.5 last:border-b-0 active:bg-slate-50",
          onClick: () => {
            if (selectedRoom) {
              assignFamilyToSelectedRoom(family);
            } else {
              focusFamily(family._familyId);
            }
          },
        },
        h("div", { className: "min-w-0 flex-1" },
          h("div", { className: "flex min-w-0 items-center gap-1.5" },
            h("div", { className: "truncate text-sm font-semibold text-slate-950" }, familyDisplayName(family)),
            h("span", { className: "shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200" }, `${family._size}명`)
          ),
          h("div", { className: "mt-1 truncate text-xs text-slate-500" }, `형제 ${composition.brother} · 자매 ${composition.sister} · 자녀 ${composition.child}`)
        ),
        h("button", {
          type: "button",
          onClick: (event) => {
            event.stopPropagation();
            assignFamilyToSelectedRoom(family);
          },
          className: cx(
            "flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-xs font-semibold active:scale-95",
            selectedRoom ? "bg-[#1e5a45] text-white" : "border border-slate-200 bg-white text-slate-700"
          ),
        }, selectedRoom ? "넣기" : "방 선택")
      );
    }

    function renderMobileExperience() {
      const selectedBucket = selectedRoom ? roomBundle.byRoom.get(selectedRoom.id) : null;
      const selectedFamilies = selectedBucket?.families || [];
      const selectedUsed = selectedRoom ? getRoomMaxOccupancy(selectedRoom, selectedFamilies) : 0;
      const selectedRemaining = selectedRoom ? Math.max(selectedRoom.capacity - selectedUsed, 0) : 0;
      const buildingOptions = [
        { key: "all", label: "전체 건물", icon: "layout-dashboard" },
        { key: "휴락동", label: "휴락동", icon: "building-2" },
        { key: "동락홀", label: "동락홀", icon: "hotel" },
      ];
      const floorOptions = buildingFilter === "all"
        ? []
        : [...new Set((layoutState.data?.rooms || [])
            .filter((room) => room.building === buildingFilter)
            .map((room) => room.floor))]
            .sort((a, b) => a - b);
      const renderMobileFilterButton = (key, label, active, onClick, icon) =>
        h("button", {
          key,
          type: "button",
          onClick,
          className: cx(
            "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold shadow-sm transition active:scale-[0.98]",
            active
              ? "bg-[#1e5a45] text-white"
              : "border border-slate-200 bg-white text-slate-600"
          ),
        }, icon ? renderIcon(icon, "h-3.5 w-3.5") : null, label);

      return h(
        "div",
        { className: "lg:hidden min-h-screen overflow-x-hidden bg-[#f7f7f4] pb-[164px] text-slate-950" },
        h("div", { className: "sticky top-0 z-30 border-b border-slate-200 bg-[#f7f7f4]/95 px-4 pb-3 pt-3 backdrop-blur" },
          h("div", { className: "flex items-center justify-between gap-3" },
            h("div", { className: "min-w-0" },
              h("div", { className: "flex items-center gap-2 text-[11px] font-semibold text-slate-500" }, renderIcon("bed-double", "h-4 w-4"), "방 배정"),
              h("h2", { className: "mt-1 truncate text-[22px] font-semibold leading-7 text-slate-950" }, "모바일 배정")
            ),
            h("div", { className: "flex shrink-0 items-center gap-2" },
              h("button", {
                type: "button",
                onClick: autoAssignRooms,
                disabled: autoAssigning,
                className: cx(
                  "flex h-11 w-11 items-center justify-center rounded-lg border shadow-sm active:scale-95",
                  autoAssigning ? "border-slate-200 bg-slate-100 text-slate-400" : "border-slate-200 bg-white text-[#1e5a45]"
                ),
                title: "자동 배정",
              }, autoAssigning ? renderIcon("loader-circle", "h-5 w-5 animate-spin") : renderIcon("wand-sparkles", "h-5 w-5")),
              h("button", {
                type: "button",
                onClick: saveChanges,
                disabled: saving || !isDirty || autoAssigning,
                className: cx(
                  "flex h-11 w-11 items-center justify-center rounded-lg shadow-sm active:scale-95",
                  saving || !isDirty || autoAssigning ? "bg-slate-200 text-slate-500" : "bg-[#1e5a45] text-white"
                ),
                title: "저장",
              }, saving ? renderIcon("loader-circle", "h-5 w-5 animate-spin") : renderIcon("save", "h-5 w-5"))
            )
          ),
          h("div", { className: "mt-3 grid grid-cols-3 gap-2" },
            h("div", { className: "rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200" },
              h("div", { className: "text-[10px] font-semibold text-slate-500" }, "방"),
              h("div", { className: "mt-1 text-base font-semibold" }, roomStats.roomCount)
            ),
            h("div", { className: "rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200" },
              h("div", { className: "text-[10px] font-semibold text-slate-500" }, "미배정"),
              h("div", { className: "mt-1 text-base font-semibold" }, mobileUnassignedFamilies.length)
            ),
            h("div", { className: "rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200" },
              h("div", { className: "text-[10px] font-semibold text-slate-500" }, "사용률"),
              h("div", { className: "mt-1 text-base font-semibold" }, `${roomStats.utilization}%`)
            )
          ),
          h("div", { className: "mt-3 space-y-2" },
            h("div", { className: "grid grid-cols-3 gap-2" },
              buildingOptions.map((option) => renderMobileFilterButton(
                option.key,
                option.label,
                buildingFilter === option.key,
                () => {
                  setBuildingFilter(option.key);
                  setFloorFilter("all");
                },
                option.icon
              ))
            ),
            buildingFilter !== "all"
              ? h("div", { className: "flex flex-wrap gap-2" },
                  [renderMobileFilterButton("all-floors", "전층", floorFilter === "all", () => setFloorFilter("all"))]
                    .concat(floorOptions.map((floorNum) => {
                      const floorVal = String(floorNum);
                      const isSelected = floorFilter === floorVal;
                      return renderMobileFilterButton(
                        floorVal,
                        `${floorNum}F`,
                        isSelected,
                        () => setFloorFilter(isSelected ? "all" : floorVal)
                      );
                    }))
                )
              : null
          ),
          h("div", {
            className: cx(
              "mt-3 rounded-2xl border px-3 py-3 shadow-sm",
              selectedRoom
                ? "border-[#1e5a45]/15 bg-[#1e5a45]/10"
                : "border-amber-200 bg-amber-50"
            )
          },
            h("div", { className: "flex items-start gap-2.5" },
              h("div", {
                className: cx(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                  selectedRoom ? "bg-[#1e5a45] text-white" : "bg-amber-500 text-white"
                )
              }, renderIcon(selectedRoom ? "users" : "door-open", "h-4 w-4")),
              h("div", { className: "min-w-0" },
                h("div", {
                  className: cx(
                    "text-sm font-semibold",
                    selectedRoom ? "text-[#184a39]" : "text-amber-900"
                  )
                }, selectedRoom ? `${selectedRoom.label}에 배정할 가족을 선택하세요` : "먼저 배정할 방을 선택하세요"),
                h("div", {
                  className: cx(
                    "mt-0.5 text-xs leading-5",
                    selectedRoom ? "text-[#1e5a45]" : "text-amber-800"
                  )
                }, selectedRoom ? "하단 미배정 가족 목록에서 가족을 탭하면 바로 배정됩니다." : "방 카드를 탭하면 하단에 배정할 가족 목록이 열립니다.")
              )
            )
          )
        ),
        selectedRoom
          ? h("div", { className: "mx-4 mt-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm" },
              h("div", { className: "flex items-center justify-between gap-2" },
                h("div", { className: "min-w-0" },
                  h("div", { className: "truncate text-sm font-semibold text-slate-950" }, `${selectedRoom.label} 선택됨`),
                  h("div", { className: "mt-0.5 text-xs text-slate-500" }, `${selectedUsed}/${selectedRoom.capacity}명 · 잔여 ${selectedRemaining}명`),
                  h("div", { className: "mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#1e5a45]/10 px-2.5 py-1 text-[11px] font-semibold text-[#1e5a45]" },
                    renderIcon("hand-pointer", "h-3.5 w-3.5"),
                    "아래 가족을 탭하면 이 방에 배정됩니다."
                  )
                ),
                h("button", {
                  type: "button",
                  onClick: () => setSelectedRoomId(null),
                  className: "flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500",
                }, renderIcon("x", "h-5 w-5"))
              )
            )
          : null,
        h("main", { className: "px-4 pt-3" },
          renderDailyUsageTable(),
          visibleRooms.map((building) =>
            h("section", { key: `mobile-${building.building}`, className: "mb-6" },
              h("div", { className: "mb-2 flex items-center justify-between" },
                h("h3", { className: "truncate text-sm font-semibold text-slate-700" }, building.building),
                h("span", { className: "text-xs font-medium text-slate-500" }, `${building.floors.length}개 층`)
              ),
              building.floors.map((floor) =>
                h("div", { key: `mobile-${building.building}-${floor.floor}`, className: "mb-4" },
                  h("div", { className: "mb-2 text-xs font-semibold text-slate-500" }, floor.label || `${floor.floor}층`),
                  h("div", { className: "grid grid-cols-2 gap-2" },
                    floor.rooms.map((room) => renderMobileRoomCard(room, roomBundle.byRoom.get(room.id)))
                  )
                )
              )
            )
          )
        ),
        h("aside", {
          className: cx(
            "mobile-room-sheet fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] rounded-t-2xl border border-slate-200 bg-white shadow-[0_-18px_48px_rgba(15,23,42,0.18)] transition-transform duration-300",
            familySheetOpen ? "translate-y-0" : "translate-y-[calc(100%-76px)]"
          ),
        },
          h("button", {
            type: "button",
            onClick: () => setFamilySheetOpen((open) => !open),
            className: "flex min-h-[56px] w-full items-center justify-between px-4 text-left",
          },
            h("div", null,
              h("div", { className: "mx-auto mb-2 h-1 w-10 rounded-full bg-slate-300" }),
              h("div", { className: "flex items-center gap-2 text-sm font-semibold text-slate-950" },
                renderIcon("users", "h-4 w-4 text-[#1e5a45]"),
                query ? `검색 결과 ${mobileUnassignedFamilies.length}` : `미배정 가족 ${mobileUnassignedFamilies.length}`
              ),
              h("div", { className: "mt-1 text-xs font-medium text-slate-500" },
                selectedRoom ? `${selectedRoom.label}에 배정할 가족을 선택하세요.` : "방을 먼저 선택하면 가족을 배정할 수 있습니다."
              )
            ),
            renderIcon(familySheetOpen ? "chevron-down" : "chevron-up", "h-5 w-5 text-slate-400")
          ),
          h("div", { className: "border-t border-slate-100 px-4 pb-3" },
            h("label", { className: "mt-3 flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500" },
              renderIcon("search", "h-4 w-4"),
              h("input", {
                value: query,
                onChange: (event) => setQuery(event.target.value),
                className: "min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400",
                placeholder: "가족 검색",
              })
            )
          ),
          h("div", { className: "max-h-[52vh] overflow-y-auto overscroll-contain pb-24" },
            mobileUnassignedFamilies.length
              ? mobileUnassignedFamilies.map((family) => renderMobileFamilyRow(family))
              : h("div", { className: "px-4 py-8 text-center text-sm text-slate-500" }, query ? "검색 결과가 없습니다." : "미배정 가족이 없습니다.")
          )
        )
      );
    }

    if (layoutState.loading) {
      return h(
        "div",
        { className: "mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8" },
        h("div", { className: "rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-sm" },
          h("div", { className: "h-6 w-40 animate-pulse rounded-full bg-slate-200" }),
          h("div", { className: "mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4" },
            Array.from({ length: 4 }).map((_, index) => h("div", { key: index, className: "h-24 animate-pulse rounded-[24px] bg-slate-100" }))
          ),
          h("div", { className: "mt-6 grid gap-4 lg:grid-cols-[1.25fr_0.85fr]" },
            h("div", { className: "space-y-4" },
              Array.from({ length: 3 }).map((_, index) => h("div", { key: index, className: "h-40 animate-pulse rounded-[28px] bg-slate-100" }))
            ),
            h("div", { className: "space-y-4" },
              Array.from({ length: 2 }).map((_, index) => h("div", { key: index, className: "h-56 animate-pulse rounded-[28px] bg-slate-100" }))
            )
          )
        )
      );
    }

    if (layoutState.error) {
      return h(
        "div",
        { className: "mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8" },
        h("div", { className: "rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm" },
          h("div", { className: "text-sm font-semibold uppercase tracking-[0.22em]" }, "Room Assignment"),
          h("h2", { className: "mt-3 text-2xl font-semibold" }, "방 배정 데이터를 불러오지 못했습니다."),
          h("p", { className: "mt-2 text-sm leading-6" }, layoutState.error),
          h("button", {
            type: "button",
            onClick: () => {
              setLayoutState({ loading: true, error: null, data: null });
              layoutPromise = null;
              loadRoomLayout()
                .then((data) => setLayoutState({ loading: false, error: null, data }))
                .catch((error) => setLayoutState({ loading: false, error: error.message || "방 배정표를 불러오지 못했습니다.", data: null }));
            },
            className: "mt-5 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700",
          }, "다시 시도")
        )
      );
    }

    const isMobileMode = document.body.classList.contains("mobile-mode") || window.innerWidth < 1024;

    return h(
      React.Fragment,
      null,
      isMobileMode ? renderMobileExperience() : null,
      !isMobileMode
        ? h(
            "div",
            { className: "mx-auto max-w-[1900px] px-4 py-6 sm:px-6 lg:px-8" },
      h("div", { className: "rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,246,240,0.98))] shadow-[0_18px_60px_rgba(17,24,39,0.08)]" },
        h("div", { className: "border-b border-slate-200/80 px-5 py-5 sm:px-6" },
          h("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between" },
            h("div", null,
              h("div", { className: "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500" },
                renderIcon("bed-double", "h-4 w-4"),
                "Room Assignment"
              ),
              h("h2", { className: "mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl" }, "방 배정"),
              toastHint
                ? h("div", { className: "mt-3 inline-flex items-center gap-2 rounded-full bg-[#1e5a45]/10 px-3 py-1.5 text-sm font-medium text-[#1e5a45]" },
                    renderIcon("sparkles", "h-4 w-4"),
                    toastHint
                  )
                : null
            ),
            h("div", { className: "flex flex-wrap items-center gap-2" },
              h("button", {
                type: "button",
                onClick: autoAssignRooms,
                disabled: autoAssigning,
                className: cx(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition",
                  autoAssigning
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : "border-[#1e5a45]/20 bg-white text-[#1e5a45] hover:-translate-y-0.5 hover:border-[#1e5a45]/30 hover:shadow-md"
                ),
              }, autoAssigning ? renderIcon("loader-circle", "h-4 w-4 animate-spin") : renderIcon("wand-sparkles", "h-4 w-4"), autoAssigning ? "배정 중" : "자동 배정"),
              h("button", {
                type: "button",
                onClick: saveChanges,
                disabled: saving || !isDirty || autoAssigning,
                className: cx(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition",
                  saving || !isDirty || autoAssigning
                    ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-[#1e5a45] text-white hover:-translate-y-0.5 hover:bg-[#184a39] hover:shadow-md"
                ),
              }, saving ? renderIcon("loader-circle", "h-4 w-4 animate-spin") : renderIcon("save", "h-4 w-4"), saving ? "저장 중" : isDirty ? "변경 저장" : "저장 완료"),
              h("button", {
                type: "button",
                disabled: autoAssigning,
                onClick: () => {
                  if (!confirm("현재 초안을 모두 초기화하고 기존 저장 상태로 되돌릴까요?")) return;
                  const next = buildDraftAssignments(familiesList);
                  setDraftAssignments(next);
                  setBaselineAssignments(next);
                  setSelectedRoomId(null);
                  setSelectedFamilyId(null);
                  setToastHint("방 배정 초안을 초기화했습니다.");
                },
                className: cx(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition",
                  autoAssigning
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
                ),
              }, renderIcon("rotate-ccw", "h-4 w-4"), "초안 초기화"),
              h("button", {
                type: "button",
                disabled: autoAssigning,
                onClick: () => {
                  if (!confirm("모든 방 배정(기존 배정 포함)을 전부 해제하시겠습니까? 저장하려면 완료 후 변경 저장을 클릭해야 합니다.")) return;
                  const next = {};
                  familiesList.forEach((family, index) => {
                    const familyId = getFamilyId(family, index);
                    next[familyId] = "미배정";
                  });
                  setDraftAssignments(next);
                  setSelectedRoomId(null);
                  setSelectedFamilyId(null);
                  setToastHint("모든 방 배정을 해제했습니다.");
                },
                className: cx(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition",
                  autoAssigning
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : "border-rose-200 bg-white text-rose-600 hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-md"
                ),
              }, renderIcon("trash-2", "h-4 w-4"), "기존 배정 전체 초기화")
            )
          ),
          h("div", { className: "mt-5 grid gap-3 md:grid-cols-4 xl:grid-cols-7" },
            renderSummaryChip("building-2", "전체 방", `${roomStats.roomCount}개`, "text-slate-900"),
            renderSummaryChip("users", "배정 가족", `${roomStats.assignedFamiliesCount}가족`, "text-slate-900"),
            renderSummaryChip("door-open", "빈 방", `${roomStats.emptyRooms}개`, "text-slate-900"),
            renderSummaryChip("check", "만실", `${roomStats.fullRooms}개`, "text-slate-900"),
            renderSummaryChip("user-round-search", "미배정 가족", `${roomStats.unassignedFamilies}가족`, "text-slate-900"),
            renderSummaryChip("triangle-alert", "객실 나눔 배정", `${roomStats.overRooms}개`, "text-slate-900"),
            renderSummaryChip("layout-dashboard", "배정률", `${roomStats.utilization}%`, "text-slate-900")
          ),
          renderDailyUsageTable(),
          h("div", { className: "mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" },
            h("div", { className: "flex flex-wrap items-center gap-2" },
              [
                { key: "all", label: "전체 건물", icon: "layout-dashboard" },
                { key: "휴락동", label: "휴락동", icon: "building-2" },
                { key: "동락홀", label: "동락홀", icon: "hotel" }
              ].map((buildingOption) => {
                const isSelected = buildingFilter === buildingOption.key;
                return h("button", {
                  key: buildingOption.key,
                  type: "button",
                  onClick: () => {
                    setBuildingFilter(buildingOption.key);
                    setFloorFilter("all");
                  },
                  className: cx(
                    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition shadow-sm",
                    isSelected 
                      ? "bg-[#1e5a45] text-white" 
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )
                }, renderIcon(buildingOption.icon, "h-4 w-4"), buildingOption.label);
              }),
              buildingFilter !== "all" && h("div", { className: "inline-flex items-center gap-2" }, [
                h("span", { key: "sep", className: "text-slate-300 font-light mx-1" }, "|"),
                h("button", {
                  key: "all-floors",
                  type: "button",
                  onClick: () => setFloorFilter("all"),
                  className: cx(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition shadow-sm",
                    floorFilter === "all"
                      ? "bg-slate-700 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )
                }, "전층")
              ].concat(
                [...new Set((layoutState.data?.rooms || [])
                  .filter(r => r.building === buildingFilter)
                  .map(r => r.floor))]
                  .sort((a, b) => a - b)
                  .map((floorNum) => {
                    const floorVal = String(floorNum);
                    const isSelected = floorFilter === floorVal;
                    return h("button", {
                      key: floorVal,
                      type: "button",
                      onClick: () => {
                        setFloorFilter(isSelected ? "all" : floorVal);
                      },
                      className: cx(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition shadow-sm",
                        isSelected 
                          ? "bg-slate-700 text-white" 
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )
                    }, `${floorNum}F`);
                  })
              ))
            ),
            h("div", { className: "w-full lg:w-80" },
              h("label", { className: "flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm" },
                renderIcon("search", "h-4 w-4"),
                h("input", {
                  value: query,
                  onChange: (event) => setQuery(event.target.value),
                  className: "w-full bg-transparent outline-none placeholder:text-slate-400",
                  placeholder: "가족명, 대표자, 방 번호 검색",
                })
              )
            )
          ),
          h("div", { className: "mt-4 flex flex-wrap gap-2 lg:hidden" },
            h("button", {
              type: "button",
              onClick: () => setMobileTab("rooms"),
              className: cx("rounded-full px-3 py-2 text-sm font-semibold transition", mobileTab === "rooms" ? "bg-[#1e5a45] text-white" : "border border-slate-200 bg-white text-slate-600"),
            }, "방 현황"),
            h("button", {
              type: "button",
              onClick: () => setMobileTab("families"),
              className: cx("rounded-full px-3 py-2 text-sm font-semibold transition", mobileTab === "families" ? "bg-[#1e5a45] text-white" : "border border-slate-200 bg-white text-slate-600"),
            }, "가족 대기열")
          )
        ),
        h("div", { className: "grid gap-5 px-5 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_290px] 2xl:grid-cols-[minmax(0,1fr)_340px]" },
          h("div", { className: cx("space-y-5", mobileTab === "rooms" ? "block" : "hidden lg:block") },
            h("div", { className: "rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm" },
              h("div", { className: "flex items-center justify-between gap-3" },
                h("div", null,
                  h("h3", { className: "text-lg font-semibold text-slate-900" }, "건물·층별 방 현황")
                ),
                h("div", { className: "hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 lg:inline-flex" }, "드래그 가능한 카드")
              ),
              h("div", { className: "mt-4 space-y-5" },
                visibleRooms.map((building) =>
                  h("section", { key: building.building, className: "space-y-4" },
                    h("div", { className: "flex items-center justify-between" },
                      h("div", { className: "flex items-center gap-2" },
                        renderIcon("building-2", "h-4 w-4 text-[#1e5a45]"),
                        h("h4", { className: "text-base font-semibold text-slate-900" }, building.building)
                      ),
                      h("span", { className: "rounded-full bg-[#1e5a45]/10 px-3 py-1 text-xs font-semibold text-[#1e5a45]" }, `${building.floors.length}개 층`)
                    ),
                    h("div", { className: "space-y-4" },
                      building.floors.map((floor) => renderFloorPlan(floor))
                    )
                  )
                )
              )
            )
          ),
          h("div", {
            "data-drop-queue": "true",
            className: cx(
              "rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto",
              mobileTab !== "rooms" ? "block" : "hidden lg:block"
            )
          },
            h("div", { className: "mt-0 space-y-4" },
              h("div", { className: "flex items-center justify-between" },
                h("h3", { className: "text-lg font-semibold text-slate-900" }, "가족 대기열"),
                h("span", { className: "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500" }, `${filteredFamilies.length}가족`)
              ),
              h("div", { className: "flex flex-wrap gap-1 pb-1 border-b border-slate-100" },
                [
                  { key: "all", label: "전체" },
                  { key: "1", label: "1인" },
                  { key: "2", label: "2인" },
                  { key: "3-4", label: "3~4인" },
                  { key: "5+", label: "5인+" },
                ].map((btn) => {
                  const active = queueSizeFilter === btn.key;
                  return h("button", {
                    key: btn.key,
                    type: "button",
                    onClick: () => setQueueSizeFilter(btn.key),
                    className: cx(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200 border",
                      active
                        ? "bg-[#1e5a45] text-white border-[#1e5a45] shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    )
                  }, 
                    btn.key === "all" ? renderIcon("filter", "h-3 w-3") : renderIcon("user", "h-3 w-3"),
                    btn.label
                  );
                })
              ),
              h("div", { className: "space-y-2" },
                filteredFamilies.length
                  ? filteredFamilies.map((family) => renderQueueFamilyCard(family))
                  : h("div", { className: "rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500" }, "조건에 맞는 가족이 없습니다.")
              )
            )
          )
        )
      )
    )
  : null,
      autoAssigning
        ? h(
            "div",
            {
              className:
                "pointer-events-none fixed left-1/2 top-6 z-[75] w-[min(92vw,520px)] -translate-x-1/2 rounded-full border border-[#1e5a45]/15 bg-white/95 px-4 py-3 shadow-[0_18px_50px_rgba(17,24,39,0.16)] backdrop-blur",
            },
            h("div", { className: "flex items-center gap-3" },
              h("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-[#1e5a45]/10 text-[#1e5a45]" },
                renderIcon("wand-sparkles", "h-5 w-5 animate-pulse")
              ),
              h("div", { className: "min-w-0 flex-1" },
                h("div", { className: "flex items-center justify-between gap-3" },
                  h("p", { className: "truncate text-sm font-semibold text-slate-900" }, "스마트 자동 배정 진행 중"),
                  h("p", { className: "shrink-0 text-xs font-medium text-slate-500" }, `${autoAssignProgress.index}/${autoAssignProgress.total}`)
                ),
                h("div", { className: "mt-2 h-2 overflow-hidden rounded-full bg-slate-100" },
                  h("div", {
                    className: "h-full rounded-full bg-[#1e5a45] transition-all duration-300",
                    style: { width: `${autoAssignProgress.total ? (autoAssignProgress.index / autoAssignProgress.total) * 100 : 0}%` },
                  })
                ),
                h("p", { className: "mt-2 truncate text-xs text-slate-500" },
                  autoAssignProgress.family
                    ? `${autoAssignProgress.family} → ${autoAssignProgress.room}`
                    : "최적의 방을 계산하고 있습니다."
                )
              )
            )
          )
        : null,
      dragState
        ? h(
            "div",
            {
              className:
                "pointer-events-none fixed z-[80] rounded-full bg-[#1e5a45] px-4 py-2 text-sm font-semibold text-white shadow-2xl ring-4 ring-[#1e5a45]/15",
              style: {
                left: dragState.x + 14,
                top: dragState.y + 14,
                transform: "translate3d(0,0,0)",
              },
            },
            `${dragState.familyName} 드래그 중`
          )
        : null,
      renderTooltip()
    );
  }

  function mountRoomAssignment() {
    const rootEl = document.getElementById("roomAssignmentRoot");
    if (!rootEl || !window.ReactDOM?.createRoot) return;
    if (!root) root = ReactDOM.createRoot(rootEl);
    root.render(h(RoomAssignmentApp, { refreshKey: renderNonce }));
  }

  window.RoomAssignmentPage = {
    sync() {
      if (!root) {
        mountRoomAssignment();
        return;
      }
      renderNonce += 1;
      root.render(h(RoomAssignmentApp, { refreshKey: renderNonce }));
    },
    mount: mountRoomAssignment,
    checkRoomConflict(familyId, nextFamily, allFamilies) {
      if (!globalLayoutData) return true;
      const roomValue = nextFamily.room;
      if (!roomValue || roomValue === "미배정") return true;
      
      const room = resolveRoom(globalLayoutData, roomValue);
      if (!room) return true;
      
      const otherFamilies = (allFamilies || []).filter((f) => {
        if (String(f.id) === String(familyId)) return false;
        if (f.status === "absent" || f.status === "undecided") return false;
        return normalizeRoomValue(f.room) === normalizeRoomValue(roomValue);
      });
      
      return canFamilyFitInRoom(nextFamily, room, otherFamilies);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountRoomAssignment);
  } else {
    mountRoomAssignment();
  }
})();
