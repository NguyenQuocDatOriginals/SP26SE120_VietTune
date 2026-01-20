import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Upload, Music, MapPin, FileAudio, Info, Shield, Check, Search, Plus, AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";

// ===== CONSTANTS =====
const SUPPORTED_FORMATS = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/vnd.wave",
  "audio/flac",
  "audio/x-flac",
];

const GENRES = [
  "Dân ca",
  "Hát xẩm",
  "Ca trù",
  "Chầu văn",
  "Quan họ",
  "Hát then",
  "Cải lương",
  "Tuồng",
  "Chèo",
  "Nhã nhạc",
  "Ca Huế",
  "Đờn ca tài tử",
  "Hát bội",
  "Hò",
  "Lý",
  "Vọng cổ",
  "Hát ru",
  "Hát ví",
  "Hát giặm",
  "Bài chòi",
  "Khác",
];

const LANGUAGES = [
  "Tiếng Việt",
  "Tiếng Thái",
  "Tiếng Tày",
  "Tiếng Nùng",
  "Tiếng H'Mông",
  "Tiếng Mường",
  "Tiếng Khmer",
  "Tiếng Chăm",
  "Tiếng Ê Đê",
  "Tiếng Ba Na",
  "Tiếng Gia Rai",
  "Tiếng Dao",
  "Tiếng Sán Chay",
  "Tiếng Cơ Ho",
  "Tiếng Xơ Đăng",
  "Tiếng Sán Dìu",
  "Tiếng Hrê",
  "Tiếng Mnông",
  "Tiếng Ra Glai",
  "Tiếng Giáy",
  "Tiếng Cơ Tu",
  "Tiếng Bru-Vân Kiều",
  "Khác",
];

const ETHNICITIES = [
  "Kinh",
  "Tày",
  "Thái",
  "Mường",
  "Khmer",
  "H'Mông",
  "Nùng",
  "Hoa",
  "Dao",
  "Gia Rai",
  "Ê Đê",
  "Ba Na",
  "Xơ Đăng",
  "Sán Chay",
  "Cơ Ho",
  "Chăm",
  "Sán Dìu",
  "Hrê",
  "Mnông",
  "Ra Glai",
  "Giáy",
  "Stră",
  "Bru-Vân Kiều",
  "Cơ Tu",
  "Giẻ Triêng",
  "Tà Ôi",
  "Mạ",
  "Khơ Mú",
  "Co",
  "Chơ Ro",
  "Hà Nhì",
  "Xinh Mun",
  "Chu Ru",
  "Lào",
  "La Chí",
  "Kháng",
  "Phù Lá",
  "La Hủ",
  "La Ha",
  "Pà Thẻn",
  "Lự",
  "Ngái",
  "Chứt",
  "Lô Lô",
  "Mảng",
  "Cờ Lao",
  "Bố Y",
  "Cống",
  "Si La",
  "Pu Péo",
  "Rơ Măm",
  "Brâu",
  "Ơ Đu",
  "Khác",
];

const REGIONS = [
  "Trung du và miền núi Bắc Bộ",
  "Đồng bằng Bắc Bộ",
  "Bắc Trung Bộ",
  "Nam Trung Bộ",
  "Cao nguyên Trung Bộ",
  "Đông Nam Bộ",
  "Tây Nam Bộ",
];

const PROVINCES = [
  "TP. Hà Nội",
  "TP. Hải Phòng",
  "TP. Huế",
  "TP. Đà Nẵng",
  "TP. Hồ Chí Minh",
  "TP. Cần Thơ",
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cao Bằng",
  "Điện Biên",
  "Đắk Lắk",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Tĩnh",
  "Hưng Yên",
  "Khánh Hòa",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hóa",
  "Tuyên Quang",
  "Vĩnh Long",
];

const EVENT_TYPES = [
  "Đám cưới",
  "Đám tang",
  "Lễ hội đình",
  "Lễ hội chùa",
  "Tết Nguyên đán",
  "Hội xuân",
  "Lễ cầu mùa",
  "Lễ cúng tổ tiên",
  "Lễ cấp sắc",
  "Lễ hội đâm trâu",
  "Lễ hội cồng chiêng",
  "Sinh hoạt cộng đồng",
  "Biểu diễn nghệ thuật",
  "Ghi âm studio",
  "Ghi âm thực địa",
  "Khác",
];

const PERFORMANCE_TYPES = [
  { key: "instrumental", label: "Chỉ nhạc cụ (Instrumental)" },
  { key: "acappella", label: "Chỉ giọng hát không đệm (Acappella)" },
  {
    key: "vocal_accompaniment",
    label: "Giọng hát có nhạc đệm (Vocal with accompaniment)",
  },
];

const INSTRUMENTS = [
  "Alal (Ba Na)",
  "Aráp (Ba Na)",
  "Aráp (Ca Dong)",
  "Aráp (Gia Rai)",
  "Aráp (Rơ Năm)",
  "Aráp (Stră)",
  "Biên khánh (Kinh)",
  "Bro (Ba Na)",
  "Bro (Gia Rai)",
  "Bro (Giẻ Triêng)",
  "Bro (Xơ Đăng)",
  "Bẳng bu (Thái)",
  "Chul (Ba Na)",
  "Chul (Gia Rai)",
  "Chênh Kial (Ba Na)",
  "Cò ke (Mường)",
  "Cồng, chiêng (Ba Na)",
  "Cồng, chiêng (Gia Rai)",
  "Cồng, chiêng (Giẻ Triêng)",
  "Cồng, chiêng (Hrê)",
  "Cồng, chiêng (Ê Đê)",
  "Dàn nhạc ngũ âm (Khmer)",
  "Goong (Ba Na)",
  "Goong (Gia Rai)",
  "Goong (Giẻ Triêng)",
  "Goong đe (Ba Na)",
  "Hơgơr (Ê Đê)",
  "Hơgơr cân (Mnâm)",
  "Hơgơr cân (Rơ Năm)",
  "Hơgơr prong (Gia Rai)",
  "Hơgơr tuôn (Hà Lang)",
  "Hơgơr tăk (Ba Na)",
  "Khinh khung (Ba Na)",
  "Khinh khung (Gia Rai)",
  "Khèn (H'Mông)",
  "Khèn (Ta Ôi)",
  "Khèn (Ê Đê)",
  "Khên (Vân Kiều)",
  "Knăh ring (Ba Na)",
  "Knăh ring (Gia Rai)",
  "K'lông put (Gia Rai)",
  "K'ny (Ba Na)",
  "K'ny (Gia Rai)",
  "K'ny (Rơ Ngao)",
  "K'ny (Xơ Đăng)",
  "Kèn bầu (Chăm)",
  "Kèn bầu (Kinh)",
  "Kèn bầu (Thái)",
  "Kềnh (H'Mông)",
  "M'linh (Dao)",
  "M'linh (Mường)",
  "M'nhum (Gia Rai)",
  "Mõ (Kinh)",
  "Phách (Kinh)",
  "Pí cổng (Thái)",
  "Pí lè (Thái)",
  "Pí lè (Tày)",
  "Pí một lao (Kháng)",
  "Pí một lao (Khơ Mú)",
  "Pí một lao (La Ha)",
  "Pí một lao (Thái)",
  "Pí pặp (Thái)",
  "Pí phướng (Thái)",
  "Pí đôi (Thái)",
  "Púa (H'Mông)",
  "Púa (Lô Lô)",
  "Qeej (H'Mông)",
  "Rang leh (Ca Dong)",
  "Rang leh (Stră)",
  "Rang rai (Ba Na)",
  "Rang rai (Gia Rai)",
  "Song lang (Kinh)",
  "Sáo ngang (Kinh)",
  "Sênh tiền (Kinh)",
  "T'rum (Gia Rai)",
  "Ta in (Hà Nhì)",
  "Ta lư (Vân Kiều)",
  "Ta pòl (Ba Na)",
  "Ta pòl (Brâu)",
  "Ta pòl (Gia Rai)",
  "Ta pòl (Rơ Năm)",
  "Tam thập lục (Kinh)",
  "Teh ding (Gia Rai)",
  "Tiêu (Kinh)",
  "Tol alao (Ca Dong)",
  "Tông đing (Ba Na)",
  "Tông đing (Ca Dong)",
  "Tơ nốt (Ba Na)",
  "Trống bộc (Kinh)",
  "Trống cái (Kinh)",
  "Trống chầu (Kinh)",
  "Trống cơm (Kinh)",
  "Trống dẹt (Kinh)",
  "Trống khẩu (Kinh)",
  "Trống lắng (Kinh)",
  "Trống mảnh (Kinh)",
  "Trống quần (Kinh)",
  "Trống đế (Kinh)",
  "Trống đồng (Kinh)",
  "Tính tẩu (Thái)",
  "Tính tẩu (Tày)",
  "Vang (Gia Rai)",
  "Đinh Duar (Giẻ Triêng)",
  "Đinh Khén (Xơ Đăng)",
  "Đinh tuk (Ba Na)",
  "Đao đao (Khơ Mú)",
  "Đuk đik (Giẻ Triêng)",
  "Đàn bầu (Kinh)",
  "Đàn môi (H'Mông)",
  "Đàn nguyệt (Kinh)",
  "Đàn nhị (Chăm)",
  "Đàn nhị (Dao)",
  "Đàn nhị (Giáy)",
  "Đàn nhị (Kinh)",
  "Đàn nhị (Nùng)",
  "Đàn nhị (Tày)",
  "Đàn t'rưng (Ba Na)",
  "Đàn t'rưng (Gia Rai)",
  "Đàn tam (Kinh)",
  "Đàn tranh (Kinh)",
  "Đàn tứ (Kinh)",
  "Đàn tỳ bà (Kinh)",
  "Đàn đá (Kinh)",
  "Đàn đáy (Kinh)",
];

// Mapping genre to typical ethnicity
const GENRE_ETHNICITY_MAP: Record<string, string[]> = {
  "Ca trù": ["Kinh"],
  "Quan họ": ["Kinh"],
  "Chầu văn": ["Kinh"],
  "Nhã nhạc": ["Kinh"],
  "Ca Huế": ["Kinh"],
  "Đờn ca tài tử": ["Kinh"],
  "Hát bội": ["Kinh"],
  "Cải lương": ["Kinh"],
  Tuồng: ["Kinh"],
  Chèo: ["Kinh"],
  "Hát xẩm": ["Kinh"],
  "Hát then": ["Tày", "Nùng"],
  Khèn: ["H'Mông"],
  "Cồng chiêng": ["Ba Na", "Gia Rai", "Ê Đê", "Xơ Đăng", "Giẻ Triêng"],
};

// ===== VIETNAMESE LUNAR CALENDAR =====
// Based on Ho Ngoc Duc's algorithm - https://www.informatik.uni-leipzig.de/~duc/amlich/

const PI = Math.PI;

function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd =
    dd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  if (jd < 2299161) {
    jd =
      dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

function getNewMoonDay(k: number, timeZone: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 =
    C1 -
    0.0074 * Math.sin(dr * (M - Mpr)) +
    0.0004 * Math.sin(dr * (2 * F + M));
  C1 =
    C1 -
    0.0004 * Math.sin(dr * (2 * F - M)) -
    0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 =
    C1 +
    0.001 * Math.sin(dr * (2 * F - Mpr)) +
    0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltat: number;
  if (T < -11) {
    deltat =
      0.001 +
      0.000839 * T +
      0.0002261 * T2 -
      0.00000845 * T3 -
      0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  const JdNew = Jd1 + C1 - deltat;
  return Math.floor(JdNew + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn: number, timeZone: number): number {
  const T = (jdn - 0.5 - timeZone / 24 - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL =
    DL +
    (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) +
    0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L * dr;
  L = L - PI * 2 * Math.floor(L / (PI * 2));
  return Math.floor((L / PI) * 6);
}

function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last: number;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

function convertSolar2Lunar(
  dd: number,
  mm: number,
  yy: number,
  timeZone: number = 7,
): { day: number; month: number; year: number; leap: boolean } {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = true;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap };
}

// Vietnamese Zodiac (Can Chi) calculation
const CAN = [
  "Giáp",
  "Ất",
  "Bính",
  "Đinh",
  "Mậu",
  "Kỷ",
  "Canh",
  "Tân",
  "Nhâm",
  "Quý",
];
const CHI = [
  "Tý",
  "Sửu",
  "Dần",
  "Mão",
  "Thìn",
  "Tỵ",
  "Ngọ",
  "Mùi",
  "Thân",
  "Dậu",
  "Tuất",
  "Hợi",
];

function getCanChi(lunarYear: number): string {
  const can = CAN[(lunarYear + 6) % 10];
  const chi = CHI[(lunarYear + 8) % 12];
  return `${can} ${chi}`;
}

function getLunarDateString(dd: number, mm: number, yy: number): string {
  const lunar = convertSolar2Lunar(dd, mm, yy);
  return `${lunar.day}`;
}

function getFullLunarDateString(dd: number, mm: number, yy: number): string {
  const lunar = convertSolar2Lunar(dd, mm, yy);
  const canChi = getCanChi(lunar.year);
  return `${lunar.day}/${lunar.month}${lunar.leap ? " nhuận" : ""} năm ${canChi}`;
}

// Convert lunar date to solar date
function jdToDate(jd: number): { day: number; month: number; year: number } {
  let a;
  if (jd > 2299160) {
    a = Math.floor((jd - 1867216.25) / 36524.25);
    a = jd + 1 + a - Math.floor(a / 4);
  } else {
    a = jd;
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  let m;
  if (e < 14) {
    m = e - 1;
  } else {
    m = e - 13;
  }
  let year;
  if (m > 2) {
    year = c - 4716;
  } else {
    year = c - 4715;
  }
  return { day, month: m, year };
}

function convertLunar2Solar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  lunarLeap: boolean = false,
  timeZone: number = 7,
): { day: number; month: number; year: number } | null {
  let a11: number, b11: number;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone);
    b11 = getLunarMonth11(lunarYear, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
    b11 = getLunarMonth11(lunarYear + 1, timeZone);
  }

  const k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) {
    off += 12;
  }

  if (b11 - a11 > 365) {
    const leapMonth = getLeapMonthInYear(lunarYear);

    if (lunarLeap && lunarMonth !== leapMonth) {
      return null; // Invalid leap month request
    }

    // Adjust offset if the target month is after the leap month, or is the leap month itself
    if (lunarLeap || lunarMonth > leapMonth) {
      off += 1;
    }
  }

  const monthStart = getNewMoonDay(k + off, timeZone);
  return jdToDate(monthStart + lunarDay - 1);
}

// Get the leap month number for a lunar year (returns 0 if no leap month)
function getLeapMonthInYear(lunarYear: number): number {
  // Use convertSolar2Lunar to find leap month by checking dates throughout the year
  // This approach uses the proven conversion algorithm

  // A lunar year spans approximately from late Jan/early Feb of solar year
  // to late Jan/early Feb of the next solar year
  // Check solar dates from (lunarYear) to (lunarYear + 1) to cover all lunar months

  const yearsToCheck = [lunarYear, lunarYear + 1];

  for (const solarYear of yearsToCheck) {
    for (let solarMonth = 1; solarMonth <= 12; solarMonth++) {
      // Check multiple days in each solar month to ensure we catch the leap month
      // (leap months can be short, so checking only day 15 might miss some)
      for (const day of [5, 15, 25]) {
        // Make sure the day is valid for this month
        const maxDay = new Date(solarYear, solarMonth, 0).getDate();
        if (day > maxDay) continue;

        const lunar = convertSolar2Lunar(day, solarMonth, solarYear);
        if (lunar.year === lunarYear && lunar.leap) {
          return lunar.month;
        }
      }
    }
  }

  return 0; // No leap month found
}

// Get lunar months for a lunar year (including leap month if any)
function getLunarMonthsForYear(
  lunarYear: number,
): { month: number; leap: boolean; label: string }[] {
  const leapMonth = getLeapMonthInYear(lunarYear);

  const months: { month: number; leap: boolean; label: string }[] = [];
  for (let m = 1; m <= 12; m++) {
    months.push({ month: m, leap: false, label: `Tháng ${m}` });
    if (leapMonth === m) {
      months.push({ month: m, leap: true, label: `Tháng ${m} nhuận` });
    }
  }
  return months;
}

// ===== UTILITY FUNCTIONS =====

// Check if click is on scrollbar
const isClickOnScrollbar = (event: MouseEvent): boolean => {
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  if (
    scrollbarWidth > 0 &&
    event.clientX >= document.documentElement.clientWidth
  ) {
    return true;
  }
  return false;
};

const inferMimeFromName = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (!ext) return "";
  if (ext === "mp3") return "audio/mpeg";
  if (ext === "wav") return "audio/wav";
  if (ext === "flac") return "audio/flac";
  return "";
};

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

// ===== REUSABLE COMPONENTS =====

function SearchableDropdown({
  value,
  onChange,
  options,
  placeholder = "-- Chọn --",
  searchable = true,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isClickOnScrollbar(event)) return;
      const target = event.target as Node;
      const clickedOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(target);
      const clickedOutsideMenu =
        menuRef.current && !menuRef.current.contains(target);
      if (
        clickedOutsideDropdown &&
        (menuRef.current ? clickedOutsideMenu : true)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateRect = () => {
      if (buttonRef.current)
        setMenuRect(buttonRef.current.getBoundingClientRect());
    };
    if (isOpen) updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-5 py-3 pr-10 text-neutral-900 border border-neutral-400 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-left flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        style={{ backgroundColor: "#FFFCF5" }}
      >
        <span className={value ? "text-neutral-900" : "text-neutral-400"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-neutral-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen &&
        menuRect &&
        createPortal(
          <div
            ref={(el) => (menuRef.current = el)}
            className="rounded-2xl shadow-xl border border-neutral-300 overflow-hidden"
            style={{
              backgroundColor: "#FFFCF5",
              position: "absolute",
              left: Math.max(8, menuRect.left + (window.scrollX ?? 0)),
              top: menuRect.bottom + (window.scrollY ?? 0) + 8,
              width: menuRect.width,
              zIndex: 40,
            }}
          >
            {searchable && (
              <div className="p-3 border-b border-neutral-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-full pl-9 pr-3 py-2 text-neutral-900 placeholder-neutral-500 border border-neutral-400 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    style={{ backgroundColor: "#FFFCF5" }}
                    autoFocus
                  />
                </div>
              </div>
            )}
            <div
              className="max-h-60 overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#9B2C2C rgba(255, 255, 255, 0.3)",
              }}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-5 py-3 text-neutral-400 text-sm text-center">
                  Không tìm thấy kết quả
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-5 py-3 text-left text-sm transition-colors ${
                      value === option
                        ? "bg-primary-600 text-white font-medium"
                        : "text-neutral-900 hover:bg-primary-100 hover:text-primary-700"
                    }`}
                  >
                    {option}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function MultiSelectTags({
  values,
  onChange,
  options,
  placeholder = "Chọn nhạc cụ...",
  disabled = false,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

  const filteredOptions = useMemo(() => {
    const available = options.filter((opt) => !values.includes(opt));
    if (!search) return available;
    return available.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, values, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isClickOnScrollbar(event)) return;
      const target = event.target as Node;
      const clickedOutsideContainer =
        containerRef.current && !containerRef.current.contains(target);
      const clickedOutsideMenu =
        menuRef.current && !menuRef.current.contains(target);
      if (
        clickedOutsideContainer &&
        (menuRef.current ? clickedOutsideMenu : true)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateRect = () => {
      if (inputRef.current)
        setMenuRect(inputRef.current.getBoundingClientRect());
    };
    if (isOpen) updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen]);

  const addTag = (tag: string) => {
    onChange([...values, tag]);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={inputRef}
        onClick={() => !disabled && setIsOpen(true)}
        className={`min-h-[48px] px-4 py-2.5 border border-neutral-400 rounded-2xl focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"
        }`}
        style={{ backgroundColor: "#FFFCF5" }}
      >
        <div className="flex flex-wrap gap-1.5">
          {values.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-600 text-white text-xs rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
          {!disabled && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={values.length === 0 ? placeholder : ""}
              className="flex-1 min-w-[120px] bg-transparent text-neutral-900 placeholder-neutral-500 text-sm focus:outline-none py-1"
            />
          )}
        </div>
      </div>

      {isOpen &&
        menuRect &&
        !disabled &&
        createPortal(
          <div
            ref={(el) => (menuRef.current = el)}
            className="rounded-2xl shadow-xl border border-neutral-300 overflow-hidden"
            style={{
              backgroundColor: "#FFFCF5",
              position: "absolute",
              left: Math.max(8, menuRect.left + (window.scrollX ?? 0)),
              top: menuRect.bottom + (window.scrollY ?? 0) + 8,
              width: menuRect.width,
              zIndex: 40,
            }}
          >
            <div
              className="max-h-60 overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#9B2C2C rgba(255, 255, 255, 0.3)",
              }}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-5 py-3 text-neutral-400 text-sm text-center">
                  {search ? "Không tìm thấy kết quả" : "Đã chọn tất cả"}
                </div>
              ) : (
                filteredOptions.slice(0, 50).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => addTag(option)}
                    className="w-full px-5 py-3 text-left text-sm text-neutral-900 hover:bg-primary-100 hover:text-primary-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4 text-primary-600" />
                    {option}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày/tháng/năm",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showLunarMonthDropdown, setShowLunarMonthDropdown] = useState(false);
  const [showLunarYearDropdown, setShowLunarYearDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const lunarMonthDropdownRef = useRef<HTMLDivElement>(null);
  const lunarYearDropdownRef = useRef<HTMLDivElement>(null);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const date = new Date(value);
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const selectedDate = value ? new Date(value) : null;

  // Generate year range (100 years back to current year - auto updates each new year)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const years = Array.from(
    { length: currentYear - (currentYear - 100) + 1 },
    (_, i) => currentYear - i,
  );

  // Get current lunar info
  const currentLunar = convertSolar2Lunar(
    new Date().getDate(),
    new Date().getMonth() + 1,
    new Date().getFullYear(),
  );

  // Find the lunar month whose first day (mùng 1) appears in the current solar month view
  const viewLunar = useMemo(() => {
    const lastDay = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + 1,
      0,
    ).getDate();

    // Check each day in the solar month to find where a lunar month starts
    for (let d = 1; d <= lastDay; d++) {
      const lunar = convertSolar2Lunar(
        d,
        viewDate.getMonth() + 1,
        viewDate.getFullYear(),
      );
      if (lunar.day === 1) {
        return lunar; // Found the lunar month that starts in this solar month
      }
    }
    // If no lunar month starts in this solar month, use the lunar month of day 1
    return convertSolar2Lunar(
      1,
      viewDate.getMonth() + 1,
      viewDate.getFullYear(),
    );
  }, [viewDate]);

  const lunarYears = Array.from(
    { length: currentYear - (currentYear - 100) + 1 },
    (_, i) => currentYear - i,
  );
  const lunarMonths = getLunarMonthsForYear(viewLunar.year);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isClickOnScrollbar(event)) return;
      const target = event.target as Node;
      const clickedOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(target);
      const clickedOutsideMenu =
        menuRef.current && !menuRef.current.contains(target);
      if (
        clickedOutsideDropdown &&
        (menuRef.current ? clickedOutsideMenu : true)
      ) {
        setIsOpen(false);
        setShowMonthDropdown(false);
        setShowYearDropdown(false);
        setShowLunarMonthDropdown(false);
        setShowLunarYearDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close month/year dropdowns when clicking outside them
  useEffect(() => {
    const handleClickOutsideDropdowns = (event: MouseEvent) => {
      if (isClickOnScrollbar(event)) return;
      const target = event.target as Node;
      if (
        showMonthDropdown &&
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(target)
      ) {
        setShowMonthDropdown(false);
      }
      if (
        showYearDropdown &&
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(target)
      ) {
        setShowYearDropdown(false);
      }
      if (
        showLunarMonthDropdown &&
        lunarMonthDropdownRef.current &&
        !lunarMonthDropdownRef.current.contains(target)
      ) {
        setShowLunarMonthDropdown(false);
      }
      if (
        showLunarYearDropdown &&
        lunarYearDropdownRef.current &&
        !lunarYearDropdownRef.current.contains(target)
      ) {
        setShowLunarYearDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideDropdowns);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideDropdowns);
  }, [
    showMonthDropdown,
    showYearDropdown,
    showLunarMonthDropdown,
    showLunarYearDropdown,
  ]);

  useEffect(() => {
    const updateRect = () => {
      if (buttonRef.current)
        setMenuRect(buttonRef.current.getBoundingClientRect());
    };
    if (isOpen) updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Convert Sunday=0 to Monday-first format (Monday=0, Sunday=6)
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const days = getDaysInMonth(viewDate);
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const handleDateClick = (day: number) => {
    const year = viewDate.getFullYear();
    const month = (viewDate.getMonth() + 1).toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    const isoString = `${year}-${month}-${dayStr}`;
    onChange(isoString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = viewDate.getMonth() + 1;
    const nextYear =
      nextMonth > 11 ? viewDate.getFullYear() + 1 : viewDate.getFullYear();
    const actualNextMonth = nextMonth > 11 ? 0 : nextMonth;

    // Don't allow navigating to future months
    if (
      nextYear > currentYear ||
      (nextYear === currentYear && actualNextMonth > currentMonth)
    ) {
      return;
    }
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const canGoNext = !(
    viewDate.getFullYear() === currentYear &&
    viewDate.getMonth() >= currentMonth
  );

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const solarDate = date.toLocaleDateString("vi-VN");
    const lunarStr = getFullLunarDateString(
      date.getDate(),
      date.getMonth() + 1,
      date.getFullYear(),
    );
    return `${solarDate} (${lunarStr})`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-5 py-3 pr-10 text-neutral-900 border border-neutral-400 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-left flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        style={{ backgroundColor: "#FFFCF5" }}
      >
        <span className={value ? "text-neutral-900" : "text-neutral-400"}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-neutral-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen &&
        menuRect &&
        createPortal(
          <div
            ref={(el) => (menuRef.current = el)}
            className="rounded-2xl shadow-xl border border-neutral-300 overflow-hidden"
            style={{
              backgroundColor: "#FFFCF5",
              position: "absolute",
              left: Math.max(8, menuRect.left + (window.scrollX ?? 0)),
              top: menuRect.bottom + (window.scrollY ?? 0) + 8,
              width: Math.max(320, menuRect.width),
              zIndex: 40,
            }}
          >
            <div className="p-3 border-b border-neutral-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 hover:bg-primary-100 rounded-full transition-colors flex-shrink-0"
              >
                <ChevronDown className="h-4 w-4 text-neutral-600 rotate-90" />
              </button>

              <div className="flex items-center gap-2 flex-1 justify-center">
                {/* Month Dropdown */}
                <div className="relative" ref={monthDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMonthDropdown(!showMonthDropdown);
                      setShowYearDropdown(false);
                    }}
                    className="px-4 py-1.5 border border-neutral-400 rounded-full text-sm font-medium text-neutral-900 transition-colors flex items-center gap-1"
                    style={{ backgroundColor: "#FFFCF5" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#FFF7E6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#FFFCF5")
                    }
                  >
                    {monthNames[viewDate.getMonth()]}
                    <ChevronDown
                      className={`h-3 w-3 text-neutral-500 transition-transform ${showMonthDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showMonthDropdown && (
                    <div
                      className="absolute top-full left-0 mt-1 rounded-xl shadow-xl border border-neutral-300 overflow-hidden z-10 min-w-[120px]"
                      style={{ backgroundColor: "#FFFCF5" }}
                    >
                      <div
                        className="max-h-48 overflow-y-auto"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#9B2C2C rgba(255,255,255,0.3)",
                        }}
                      >
                        {monthNames.map((month, index) => {
                          const isFutureMonth =
                            viewDate.getFullYear() === currentYear &&
                            index > currentMonth;
                          return (
                            <button
                              key={month}
                              type="button"
                              onClick={() => {
                                if (!isFutureMonth) {
                                  setViewDate(
                                    new Date(viewDate.getFullYear(), index, 1),
                                  );
                                  setShowMonthDropdown(false);
                                }
                              }}
                              disabled={isFutureMonth}
                              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                isFutureMonth
                                  ? "text-neutral-400 cursor-not-allowed"
                                  : viewDate.getMonth() === index
                                    ? "bg-primary-600 text-white font-medium"
                                    : "text-neutral-900 hover:bg-primary-100 hover:text-primary-700"
                              }`}
                            >
                              {month}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Year Dropdown */}
                <div className="relative" ref={yearDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowYearDropdown(!showYearDropdown);
                      setShowMonthDropdown(false);
                    }}
                    className="px-4 py-1.5 border border-neutral-400 rounded-full text-sm font-medium text-neutral-900 transition-colors flex items-center gap-1"
                    style={{ backgroundColor: "#FFFCF5" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#FFF7E6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#FFFCF5")
                    }
                  >
                    Năm {viewDate.getFullYear()}
                    <ChevronDown
                      className={`h-3 w-3 text-neutral-500 transition-transform ${showYearDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showYearDropdown && (
                    <div
                      className="absolute top-full right-0 mt-1 rounded-xl shadow-xl border border-neutral-300 overflow-hidden z-10 min-w-[120px]"
                      style={{ backgroundColor: "#FFFCF5" }}
                    >
                      <div
                        className="max-h-48 overflow-y-auto"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#9B2C2C rgba(255,255,255,0.3)",
                        }}
                      >
                        {years.map((year) => (
                          <button
                            key={year}
                            type="button"
                            onClick={() => {
                              // If switching to current year and current view month is in future, adjust to current month
                              let newMonth = viewDate.getMonth();
                              if (
                                year === currentYear &&
                                newMonth > currentMonth
                              ) {
                                newMonth = currentMonth;
                              }
                              setViewDate(new Date(year, newMonth, 1));
                              setShowYearDropdown(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                              viewDate.getFullYear() === year
                                ? "bg-primary-600 text-white font-medium"
                                : "text-neutral-900 hover:bg-primary-100 hover:text-primary-700"
                            }`}
                          >
                            Năm {year}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                disabled={!canGoNext}
                className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                  canGoNext
                    ? "hover:bg-primary-100"
                    : "opacity-30 cursor-not-allowed"
                }`}
              >
                <ChevronDown className="h-4 w-4 text-neutral-600 -rotate-90" />
              </button>
            </div>

            {/* Lunar Calendar Selection */}
            <div className="px-3 py-2 border-b border-neutral-200 flex items-center justify-center gap-2">
              <span className="text-xs text-neutral-500">Âm lịch:</span>

              {/* Lunar Month Dropdown */}
              <div className="relative" ref={lunarMonthDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowLunarMonthDropdown(!showLunarMonthDropdown);
                    setShowLunarYearDropdown(false);
                    setShowMonthDropdown(false);
                    setShowYearDropdown(false);
                  }}
                  className="px-4 py-1.5 border border-neutral-400 rounded-full text-sm font-medium text-neutral-900 transition-colors flex items-center gap-1"
                  style={{ backgroundColor: "#FFFCF5" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#FFF7E6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#FFFCF5")
                  }
                >
                  Tháng {viewLunar.month}
                  {viewLunar.leap ? " nhuận" : ""}
                  <ChevronDown
                    className={`h-3 w-3 text-neutral-500 transition-transform ${showLunarMonthDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showLunarMonthDropdown && (
                  <div
                    className="absolute top-full left-0 mt-1 rounded-xl shadow-xl border border-neutral-300 overflow-hidden z-10 min-w-[150px]"
                    style={{ backgroundColor: "#FFFCF5" }}
                  >
                    <div
                      className="max-h-48 overflow-y-auto"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#dc2626 rgba(255,255,255,0.3)",
                      }}
                    >
                      {lunarMonths.map((lm) => {
                        const isFutureLunarMonth =
                          viewLunar.year === currentLunar.year &&
                          (lm.month > currentLunar.month ||
                            (lm.month === currentLunar.month &&
                              lm.leap &&
                              !currentLunar.leap));
                        return (
                          <button
                            key={`${lm.month}-${lm.leap}`}
                            type="button"
                            onClick={() => {
                              if (!isFutureLunarMonth) {
                                // Convert first day of lunar month to solar date
                                const solarDate = convertLunar2Solar(
                                  1,
                                  lm.month,
                                  viewLunar.year,
                                  lm.leap,
                                );
                                if (solarDate) {
                                  // Navigate to the solar month containing the first day of lunar month
                                  setViewDate(
                                    new Date(
                                      solarDate.year,
                                      solarDate.month - 1,
                                      1,
                                    ),
                                  );
                                }
                                setShowLunarMonthDropdown(false);
                              }
                            }}
                            disabled={isFutureLunarMonth}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                              isFutureLunarMonth
                                ? "text-neutral-400 cursor-not-allowed"
                                : viewLunar.month === lm.month &&
                                    viewLunar.leap === lm.leap
                                  ? "bg-primary-600 text-white font-medium"
                                  : "text-neutral-900 hover:bg-primary-100 hover:text-primary-700"
                            }`}
                          >
                            {lm.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Lunar Year Dropdown */}
              <div className="relative" ref={lunarYearDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowLunarYearDropdown(!showLunarYearDropdown);
                    setShowLunarMonthDropdown(false);
                    setShowMonthDropdown(false);
                    setShowYearDropdown(false);
                  }}
                  className="px-4 py-1.5 border border-neutral-400 rounded-full text-sm font-medium text-neutral-900 transition-colors flex items-center gap-1"
                  style={{ backgroundColor: "#FFFCF5" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#FFF7E6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#FFFCF5")
                  }
                >
                  Năm {getCanChi(viewLunar.year)}
                  <ChevronDown
                    className={`h-3 w-3 text-neutral-500 transition-transform ${showLunarYearDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showLunarYearDropdown && (
                  <div
                    className="absolute top-full right-0 mt-1 rounded-xl shadow-xl border border-neutral-300 overflow-hidden z-10 min-w-[200px]"
                    style={{ backgroundColor: "#FFFCF5" }}
                  >
                    <div
                      className="max-h-48 overflow-y-auto"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#dc2626 rgba(255,255,255,0.3)",
                      }}
                    >
                      {lunarYears.map((year) => {
                        const isFutureYear = year > currentLunar.year;
                        return (
                          <button
                            key={year}
                            type="button"
                            onClick={() => {
                              if (!isFutureYear) {
                                // Convert lunar to solar and update view
                                let targetLunarMonth = viewLunar.month;
                                let targetLunarLeap = viewLunar.leap;

                                // Check if we need to adjust month for future
                                if (
                                  year === currentLunar.year &&
                                  targetLunarMonth > currentLunar.month
                                ) {
                                  targetLunarMonth = currentLunar.month;
                                  targetLunarLeap = false;
                                }

                                // Convert first day of lunar month to solar date
                                const solarDate = convertLunar2Solar(
                                  1,
                                  targetLunarMonth,
                                  year,
                                  targetLunarLeap,
                                );
                                if (solarDate) {
                                  // Navigate to the solar month containing the first day of lunar month
                                  setViewDate(
                                    new Date(
                                      solarDate.year,
                                      solarDate.month - 1,
                                      1,
                                    ),
                                  );
                                }
                                setShowLunarYearDropdown(false);
                              }
                            }}
                            disabled={isFutureYear}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors whitespace-nowrap ${
                              isFutureYear
                                ? "text-neutral-400 cursor-not-allowed"
                                : viewLunar.year === year
                                  ? "bg-primary-600 text-white font-medium"
                                  : "text-neutral-900 hover:bg-primary-100 hover:text-primary-700"
                            }`}
                          >
                            Năm {getCanChi(year)} ({year})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-neutral-500 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (day === null) {
                    return (
                      <div key={`empty-${index}`} className="aspect-[1/1.3]" />
                    );
                  }

                  const isSelected =
                    selectedDate &&
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === viewDate.getMonth() &&
                    selectedDate.getFullYear() === viewDate.getFullYear();

                  const today = new Date();
                  const isToday =
                    today.getDate() === day &&
                    today.getMonth() === viewDate.getMonth() &&
                    today.getFullYear() === viewDate.getFullYear();

                  const dayDate = new Date(
                    viewDate.getFullYear(),
                    viewDate.getMonth(),
                    day,
                  );
                  const isFuture = dayDate > today;

                  // Get lunar date
                  const lunarDay = getLunarDateString(
                    day,
                    viewDate.getMonth() + 1,
                    viewDate.getFullYear(),
                  );
                  const lunar = convertSolar2Lunar(
                    day,
                    viewDate.getMonth() + 1,
                    viewDate.getFullYear(),
                  );
                  const isLunarFirstDay = lunar.day === 1;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => !isFuture && handleDateClick(day)}
                      disabled={isFuture}
                      className={`aspect-[1/1.3] rounded-lg transition-colors flex flex-col items-center justify-center py-1 ${
                        isFuture
                          ? "text-neutral-400 cursor-not-allowed"
                          : isSelected
                            ? "bg-primary-600 text-white font-medium"
                            : isToday
                              ? "bg-primary-100 text-primary-700 font-medium"
                              : "text-neutral-900 hover:bg-primary-50"
                      }`}
                    >
                      <span className="text-sm leading-none">{day}</span>
                      <span
                        className={`text-[10px] leading-none mt-0.5 ${
                          isFuture
                            ? "text-neutral-300"
                            : isSelected
                              ? "text-white/70"
                              : isLunarFirstDay
                                ? "text-primary-600 font-medium"
                                : "text-neutral-400"
                        }`}
                      >
                        {isLunarFirstDay
                          ? `${lunar.day}/${lunar.month}${lunar.leap ? " nhuận" : ""}`
                          : lunarDay}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  multiline = false,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  const baseClasses = `w-full px-5 py-3 text-neutral-900 placeholder-neutral-500 border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
    disabled ? "opacity-50 cursor-not-allowed" : ""
  }`;
  const bgStyle = { backgroundColor: "#FFFCF5" };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`${baseClasses} rounded-2xl resize-none`}
        style={bgStyle}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`${baseClasses} rounded-full`}
      style={bgStyle}
    />
  );
}

function FormField({
  label,
  required = false,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-800">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-neutral-800/60">{hint}</p>}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  optional = false,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2 bg-primary-600/20 rounded-lg">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-neutral-800 flex items-center gap-2">
          {title}
          {optional && (
            <span
              className="text-xs font-normal text-neutral-800/50 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#F5F0E8" }}
            >
              Tùy chọn
            </span>
          )}
        </h3>
        {subtitle && (
          <p className="text-sm text-neutral-800/70 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function CollapsibleSection({
  icon: Icon,
  title,
  subtitle,
  optional = false,
  defaultOpen = true,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  optional?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="border border-neutral-200 rounded-2xl overflow-hidden shadow-md"
      style={{ backgroundColor: "#FFFCF5" }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between transition-colors"
        style={{ backgroundColor: "#FFFCF5" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#F5F0E8")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#FFFCF5")
        }
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-600/20 rounded-lg">
            <Icon className="h-5 w-5 text-primary-600" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
              {title}
              {optional && (
                <span
                  className="text-xs font-normal text-neutral-800/50 px-2 py-0.5 rounded-full border border-neutral-300"
                  style={{ backgroundColor: "#F5F0E8" }}
                >
                  Tùy chọn
                </span>
              )}
            </h3>
            {subtitle && (
              <p className="text-sm text-neutral-800/70">{subtitle}</p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-neutral-800/70 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="p-6 pt-2 space-y-4">{children}</div>}
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function UploadMusic() {
  const [file, setFile] = useState<File | null>(null);
  const [audioInfo, setAudioInfo] = useState<{
    name: string;
    size: number;
    type: string;
    duration: number;
    bitrate?: number;
    sampleRate?: number;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [artistUnknown, setArtistUnknown] = useState(false);
  const [composer, setComposer] = useState("");
  const [composerUnknown, setComposerUnknown] = useState(false);
  const [language, setLanguage] = useState("");
  const [noLanguage, setNoLanguage] = useState(false);
  const [customLanguage, setCustomLanguage] = useState("");
  const [genre, setGenre] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [recordingDate, setRecordingDate] = useState("");
  const [dateEstimated, setDateEstimated] = useState(false);
  const [dateNote, setDateNote] = useState("");
  const [recordingLocation, setRecordingLocation] = useState("");

  const [ethnicity, setEthnicity] = useState("");
  const [customEthnicity, setCustomEthnicity] = useState("");
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [eventType, setEventType] = useState("");
  const [customEventType, setCustomEventType] = useState("");
  const [performanceType, setPerformanceType] = useState("");
  const [instruments, setInstruments] = useState<string[]>([]);

  const [description, setDescription] = useState("");
  const [fieldNotes, setFieldNotes] = useState("");
  const [transcription, setTranscription] = useState("");
  const [lyricsFile, setLyricsFile] = useState<File | null>(null);

  const [collector, setCollector] = useState("");
  const [copyright, setCopyright] = useState("");
  const [archiveOrg, setArchiveOrg] = useState("");
  const [catalogId, setCatalogId] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiresInstruments =
    performanceType === "instrumental" ||
    performanceType === "vocal_accompaniment";
  const allowsLyrics =
    performanceType === "acappella" ||
    performanceType === "vocal_accompaniment";

  // Check for genre-ethnicity mismatch
  const genreEthnicityWarning = useMemo(() => {
    if (!genre || !ethnicity) return null;

    const expectedEthnicities = GENRE_ETHNICITY_MAP[genre];
    if (expectedEthnicities && !expectedEthnicities.includes(ethnicity)) {
      return `Lưu ý: Thể loại "${genre}" thường là đặc trưng của người ${expectedEthnicities.join(", ")}. Tuy nhiên, giao lưu văn hóa giữa các dân tộc là điều bình thường.`;
    }
    return null;
  }, [genre, ethnicity]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Kiểm tra kích thước file (giới hạn 50MB như đã ghi trong UI)
    const maxSizeInBytes = 50 * 1024 * 1024; // 50MB
    if (selected.size > maxSizeInBytes) {
      setErrors((prev) => ({
        ...prev,
        file: "File quá lớn. Vui lòng chọn file nhỏ hơn 50MB",
      }));
      setFile(null);
      setAudioInfo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const mime = selected.type || inferMimeFromName(selected.name);
    if (!SUPPORTED_FORMATS.includes(mime)) {
      setErrors((prev) => ({
        ...prev,
        file: "Chỉ hỗ trợ file MP3, WAV hoặc FLAC",
      }));
      setFile(null);
      setAudioInfo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.file;
      return newErrors;
    });
    setFile(selected);
    setIsAnalyzing(true);

    const url = URL.createObjectURL(selected);
    const audio = new Audio();
    let cleanedUp = false;

    const onLoaded = () => {
      if (cleanedUp) return;
      const durationSeconds = isFinite(audio.duration)
        ? Math.round(audio.duration)
        : 0;

      const bitrate =
        durationSeconds > 0
          ? Math.round((selected.size * 8) / durationSeconds / 1000)
          : undefined;

      setAudioInfo({
        name: selected.name,
        size: selected.size,
        type: mime,
        duration: durationSeconds,
        bitrate,
      });

      if (!title) {
        const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }

      setIsAnalyzing(false);
      cleanup();
    };

    const onError = () => {
      if (cleanedUp) return;
      setErrors((prev) => ({
        ...prev,
        file: "Không thể phân tích file âm thanh",
      }));
      setFile(null);
      setAudioInfo(null);
      setIsAnalyzing(false);
      cleanup();
    };

    const cleanup = () => {
      cleanedUp = true;
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("error", onError);
      audio.src = "";
      URL.revokeObjectURL(url);
    };

    audio.preload = "metadata";
    audio.src = url;
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("error", onError);
  };

  const handleLyricsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setLyricsFile(selected);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!file) newErrors.file = "Vui lòng chọn file âm thanh";
    if (!title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";
    if (!artistUnknown && !artist.trim()) {
      newErrors.artist = "Vui lòng nhập tên nghệ sĩ hoặc chọn 'Không rõ'";
    }
    if (!composerUnknown && !composer.trim()) {
      newErrors.composer =
        "Vui lòng nhập tên tác giả hoặc chọn 'Dân gian/Không rõ'";
    }
    if (!genre) newErrors.genre = "Vui lòng chọn thể loại";
    if (requiresInstruments && instruments.length === 0) {
      newErrors.instruments = "Vui lòng chọn ít nhất một nhạc cụ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      setSubmitStatus("error");
      setSubmitMessage("Vui lòng điền đầy đủ thông tin bắt buộc");
      setTimeout(() => {
        setSubmitStatus("idle");
        setSubmitMessage("");
      }, 5000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    const formData = {
      id: Date.now(),
      file: {
        name: audioInfo?.name,
        type: audioInfo?.type,
        size: audioInfo?.size,
        duration: audioInfo?.duration,
        bitrate: audioInfo?.bitrate,
      },
      basicInfo: {
        title,
        artist: artistUnknown ? "Không rõ nghệ sĩ" : artist,
        composer: composerUnknown ? "Dân gian/Không rõ tác giả" : composer,
        language: language === "Khác" ? customLanguage : language,
        genre: genre === "Khác" ? customGenre : genre,
        recordingDate,
        dateEstimated,
        dateNote,
        recordingLocation,
      },
      culturalContext: {
        ethnicity: ethnicity === "Khác" ? customEthnicity : ethnicity,
        region,
        province,
        eventType: eventType === "Khác" ? customEventType : eventType,
        performanceType,
        instruments,
      },
      additionalNotes: {
        description,
        fieldNotes,
        transcription,
        hasLyricsFile: !!lyricsFile,
      },
      adminInfo: {
        collector,
        copyright,
        archiveOrg,
        catalogId,
      },
      uploadedAt: new Date().toISOString(),
    };

    const reader = new FileReader();
    reader.onload = function (ev) {
      const audioData = ev.target?.result;
      if (!audioData) {
        setIsSubmitting(false);
        setSubmitStatus("error");
        setSubmitMessage("Lỗi khi đọc file. Vui lòng thử lại.");
        return;
      }

      const newRecording = {
        ...formData,
        audioData,
      };

      try {
        // Lấy danh sách recordings hiện tại
        let recordings = [];
        try {
          const stored = localStorage.getItem("localRecordings");
          recordings = stored ? JSON.parse(stored) : [];
        } catch (parseError) {
          console.warn("Không thể đọc dữ liệu cũ, sẽ tạo mới:", parseError);
          recordings = [];
        }

        // Thêm recording mới vào đầu danh sách
        recordings.unshift(newRecording);

        // Giữ tối đa 5 bản ghi (giảm từ 10 để tránh vượt quá giới hạn localStorage)
        if (recordings.length > 5) {
          recordings = recordings.slice(0, 5);
        }

        // Thử lưu vào localStorage
        const dataToSave = JSON.stringify(recordings);

        // Kiểm tra kích thước (localStorage limit thường là 5-10MB)
        const sizeInMB = new Blob([dataToSave]).size / (1024 * 1024);

        if (sizeInMB > 8) {
          // Nếu quá lớn, chỉ giữ lại 2 bản ghi mới nhất
          const reducedRecordings = recordings.slice(0, 2);
          localStorage.setItem(
            "localRecordings",
            JSON.stringify(reducedRecordings),
          );

          setSubmitStatus("success");
          setSubmitMessage(
            `Đã đóng góp bản thu thành công: ${title} (Đã tự động xóa các bản ghi cũ do giới hạn bộ nhớ)`,
          );
        } else {
          localStorage.setItem("localRecordings", dataToSave);

          setSubmitStatus("success");
          setSubmitMessage(`Đã đóng góp bản thu thành công: ${title}`);
        }

        setTimeout(() => {
          resetForm();
          setIsSubmitting(false);
        }, 3000);
      } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error);
        setIsSubmitting(false);
        setSubmitStatus("error");

        // Cung cấp thông báo lỗi chi tiết hơn
        if (error instanceof Error) {
          if (
            error.name === "QuotaExceededError" ||
            error.message.includes("quota")
          ) {
            setSubmitMessage(
              "Dung lượng lưu trữ đã đầy. Vui lòng xóa một số bản ghi cũ hoặc sử dụng file nhỏ hơn.",
            );
          } else {
            setSubmitMessage(
              `Lỗi: ${error.message}. Vui lòng thử lại hoặc sử dụng file nhỏ hơn.`,
            );
          }
        } else {
          setSubmitMessage(
            "Lỗi không xác định khi lưu dữ liệu. Vui lòng thử lại với file nhỏ hơn.",
          );
        }
      }
    };

    reader.onerror = () => {
      setIsSubmitting(false);
      setSubmitStatus("error");
      setSubmitMessage("Lỗi khi đọc file. Vui lòng thử lại.");
    };

    reader.readAsDataURL(file!);
  };

  const resetForm = () => {
    setFile(null);
    setAudioInfo(null);
    setTitle("");
    setArtist("");
    setArtistUnknown(false);
    setComposer("");
    setComposerUnknown(false);
    setLanguage("");
    setNoLanguage(false);
    setCustomLanguage("");
    setGenre("");
    setCustomGenre("");
    setRecordingDate("");
    setDateEstimated(false);
    setDateNote("");
    setRecordingLocation("");
    setEthnicity("");
    setCustomEthnicity("");
    setRegion("");
    setProvince("");
    setEventType("");
    setCustomEventType("");
    setPerformanceType("");
    setInstruments([]);
    setDescription("");
    setFieldNotes("");
    setTranscription("");
    setLyricsFile(null);
    setCollector("");
    setCopyright("");
    setArchiveOrg("");
    setCatalogId("");
    setErrors({});
    setSubmitStatus("idle");
    setSubmitMessage("");
    setIsSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Required Fields Note */}
      <div className="flex items-center gap-2 text-sm text-neutral-800/60">
        <span className="text-red-400">*</span>
        <span>Trường bắt buộc</span>
      </div>

      {submitStatus === "success" && (
        <div className="flex items-center gap-3 p-4 bg-green-100 border border-green-300 rounded-2xl">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700">{submitMessage}</p>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-200">{submitMessage}</p>
        </div>
      )}

      <div
        className="border border-neutral-200 rounded-2xl p-8 shadow-md"
        style={{ backgroundColor: "#FFFCF5" }}
      >
        <SectionHeader
          icon={Upload}
          title="Tải lên file âm thanh"
          subtitle="Hỗ trợ định dạng MP3, WAV, FLAC"
        />

        <div className="mt-4">
          <div
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              errors.file
                ? "border-red-500/50 bg-red-500/5"
                : file
                  ? "border-primary-500/50 bg-primary-600/5"
                  : "border-neutral-200 hover:border-primary-400"
            } ${isAnalyzing ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.flac"
              onChange={handleFileChange}
              className="sr-only"
              disabled={isAnalyzing}
            />

            {isAnalyzing ? (
              <div className="space-y-3">
                <div className="animate-spin h-10 w-10 border-3 border-primary-600 border-t-transparent rounded-full mx-auto" />
                <p className="text-neutral-800/70">Đang phân tích file...</p>
              </div>
            ) : file && audioInfo ? (
              <div className="space-y-3">
                <div className="p-3 bg-primary-600/20 rounded-2xl w-fit mx-auto">
                  <FileAudio className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <p className="text-neutral-800 font-medium">
                    {audioInfo.name}
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-2 text-sm text-neutral-800/60">
                    <span>{formatFileSize(audioInfo.size)}</span>
                    <span>•</span>
                    <span>{formatDuration(audioInfo.duration)}</span>
                    {audioInfo.bitrate && (
                      <>
                        <span>•</span>
                        <span>~{audioInfo.bitrate} kbps</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setAudioInfo(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-sm text-neutral-800/60 hover:text-red-400 transition-colors"
                >
                  Chọn file khác
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-primary-600/20 rounded-2xl w-fit mx-auto">
                  <Upload className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <p className="text-neutral-800">
                    Kéo thả file hoặc click để chọn
                  </p>
                  <p className="text-sm text-neutral-800/60 mt-1">
                    MP3, WAV, FLAC - Tối đa 50MB
                  </p>
                </div>
              </div>
            )}
          </div>
          {errors.file && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.file}
            </p>
          )}
        </div>
      </div>

      <div
        className="border border-neutral-200 rounded-2xl p-8 shadow-md"
        style={{ backgroundColor: "#FFFCF5" }}
      >
        <SectionHeader
          icon={Music}
          title="Thông tin mô tả cơ bản"
          subtitle="Thông tin chính về bản nhạc"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Tiêu đề/Tên bản nhạc" required>
            <TextInput
              value={title}
              onChange={setTitle}
              placeholder="Nhập tên bản nhạc"
              required
            />
            {errors.title && (
              <p className="text-sm text-red-400">{errors.title}</p>
            )}
          </FormField>

          <div className="space-y-2">
            <FormField
              label="Nghệ sĩ/Người biểu diễn"
              required={!artistUnknown}
            >
              <TextInput
                value={artist}
                onChange={setArtist}
                placeholder="Tên người hát hoặc chơi nhạc cụ"
                required={!artistUnknown}
                disabled={artistUnknown}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={artistUnknown}
                onChange={(e) => {
                  setArtistUnknown(e.target.checked);
                  if (e.target.checked) setArtist("");
                }}
                className="w-4 h-4 rounded border-neutral-400 text-primary-600 focus:ring-primary-500"
                style={{ backgroundColor: "#FFFCF5" }}
              />
              Không rõ
            </label>
            {errors.artist && (
              <p className="text-sm text-red-400">{errors.artist}</p>
            )}
          </div>

          <div className="space-y-2">
            <FormField label="Nhạc sĩ/Tác giả" required={!composerUnknown}>
              <TextInput
                value={composer}
                onChange={setComposer}
                placeholder="Tên người sáng tác"
                disabled={composerUnknown}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={composerUnknown}
                onChange={(e) => {
                  setComposerUnknown(e.target.checked);
                  if (e.target.checked) setComposer("");
                }}
                className="w-4 h-4 rounded border-neutral-400 text-primary-600 focus:ring-primary-500"
                style={{ backgroundColor: "#FFFCF5" }}
              />
              Dân gian/Không rõ tác giả
            </label>
            {errors.composer && (
              <p className="text-sm text-red-400">{errors.composer}</p>
            )}
          </div>

          <div className="space-y-2">
            <FormField label="Ngôn ngữ">
              <SearchableDropdown
                value={language}
                onChange={(val) => {
                  setLanguage(val);
                  if (val !== "Khác") setCustomLanguage("");
                }}
                options={LANGUAGES}
                placeholder="Chọn ngôn ngữ"
                disabled={noLanguage}
              />
            </FormField>
            {language === "Khác" && !noLanguage && (
              <TextInput
                value={customLanguage}
                onChange={setCustomLanguage}
                placeholder="Nhập tên ngôn ngữ khác..."
              />
            )}
            <label className="flex items-center gap-2 text-sm text-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={noLanguage}
                onChange={(e) => {
                  setNoLanguage(e.target.checked);
                  if (e.target.checked) {
                    setLanguage("");
                    setCustomLanguage("");
                  }
                }}
                className="w-4 h-4 rounded border-neutral-400 text-primary-600 focus:ring-primary-500"
                style={{ backgroundColor: "#FFFCF5" }}
              />
              Không có ngôn ngữ
            </label>
          </div>

          <div className="space-y-2">
            <FormField label="Thể loại/Loại hình" required>
              <SearchableDropdown
                value={genre}
                onChange={(val) => {
                  setGenre(val);
                  if (val !== "Khác") setCustomGenre("");
                }}
                options={GENRES}
                placeholder="Chọn thể loại"
              />
              {errors.genre && (
                <p className="text-sm text-red-400">{errors.genre}</p>
              )}
            </FormField>
            {genre === "Khác" && (
              <TextInput
                value={customGenre}
                onChange={setCustomGenre}
                placeholder="Nhập tên thể loại khác..."
              />
            )}
          </div>

          <div className="space-y-2">
            <FormField label="Ngày ghi âm">
              <DatePicker
                value={recordingDate}
                onChange={setRecordingDate}
                placeholder="Chọn ngày/tháng/năm"
                disabled={dateEstimated}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={dateEstimated}
                onChange={(e) => {
                  setDateEstimated(e.target.checked);
                  if (e.target.checked) setRecordingDate("");
                }}
                className="w-4 h-4 rounded border-neutral-400 text-primary-600 focus:ring-primary-500"
                style={{ backgroundColor: "#FFFCF5" }}
              />
              Ngày ước tính/không chính xác
            </label>
            {dateEstimated && (
              <TextInput
                value={dateNote}
                onChange={setDateNote}
                placeholder="Ghi chú về ngày tháng (Ví dụ: khoảng năm 1990)"
              />
            )}
          </div>

          <FormField
            label="Địa điểm ghi âm"
            hint="Ví dụ: Đình làng X, Nhà văn hóa Y"
          >
            <TextInput
              value={recordingLocation}
              onChange={setRecordingLocation}
              placeholder="Nhập địa điểm cụ thể"
            />
          </FormField>
        </div>
      </div>

      <CollapsibleSection
        icon={MapPin}
        title="Thông tin bối cảnh văn hóa"
        subtitle="Thông tin về nguồn gốc và bối cảnh biểu diễn"
      >
        {/* Genre-Ethnicity Warning */}
        {genreEthnicityWarning && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-yellow-500/20 border border-yellow-500/40 rounded-2xl">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-200 text-sm leading-relaxed">
              {genreEthnicityWarning}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <FormField label="Thuộc tính dân tộc">
              <SearchableDropdown
                value={ethnicity}
                onChange={(val) => {
                  setEthnicity(val);
                  if (val !== "Khác") setCustomEthnicity("");
                }}
                options={ETHNICITIES}
                placeholder="Chọn dân tộc"
              />
            </FormField>
            {ethnicity === "Khác" && (
              <TextInput
                value={customEthnicity}
                onChange={setCustomEthnicity}
                placeholder="Nhập tên dân tộc khác..."
              />
            )}
          </div>

          <FormField label="Khu vực">
            <SearchableDropdown
              value={region}
              onChange={setRegion}
              options={REGIONS}
              placeholder="Chọn khu vực"
              searchable={false}
            />
          </FormField>

          <FormField label="Tỉnh/Thành phố">
            <SearchableDropdown
              value={province}
              onChange={setProvince}
              options={PROVINCES}
              placeholder="Chọn tỉnh thành"
            />
          </FormField>

          <div className="space-y-2">
            <FormField label="Loại sự kiện">
              <SearchableDropdown
                value={eventType}
                onChange={(val) => {
                  setEventType(val);
                  if (val !== "Khác") setCustomEventType("");
                }}
                options={EVENT_TYPES}
                placeholder="Chọn loại sự kiện"
              />
            </FormField>
            {eventType === "Khác" && (
              <TextInput
                value={customEventType}
                onChange={setCustomEventType}
                placeholder="Nhập loại sự kiện khác..."
              />
            )}
          </div>

          <div className="md:col-span-2">
            <FormField label="Loại hình biểu diễn">
              <div className="flex flex-wrap gap-2">
                {PERFORMANCE_TYPES.map((pt) => (
                  <button
                    key={pt.key}
                    type="button"
                    onClick={() => {
                      setPerformanceType(pt.key);
                      if (pt.key === "acappella") {
                        setInstruments([]);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm transition-all border border-neutral-200 ${
                      performanceType === pt.key
                        ? "bg-primary-600 text-white"
                        : "text-neutral-700"
                    }`}
                    style={
                      performanceType !== pt.key
                        ? { backgroundColor: "#FFFCF5" }
                        : undefined
                    }
                    onMouseEnter={(e) => {
                      if (performanceType !== pt.key) {
                        e.currentTarget.style.backgroundColor = "#F5F0E8";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (performanceType !== pt.key) {
                        e.currentTarget.style.backgroundColor = "#FFFCF5";
                      }
                    }}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          {requiresInstruments && (
            <div className="md:col-span-2">
              <FormField
                label="Nhạc cụ sử dụng"
                required={requiresInstruments}
                hint="Chọn một hoặc nhiều nhạc cụ"
              >
                <MultiSelectTags
                  values={instruments}
                  onChange={setInstruments}
                  options={INSTRUMENTS}
                  placeholder="Tìm và chọn nhạc cụ..."
                />
                {errors.instruments && (
                  <p className="text-sm text-red-400">{errors.instruments}</p>
                )}
              </FormField>
            </div>
          )}

          {allowsLyrics && (
            <div className="md:col-span-2">
              <FormField
                label="Tải lên lời bài hát (nếu có)"
                hint="File .txt hoặc .docx"
              >
                <div className="flex items-center gap-3">
                  <label
                    className="px-4 py-2 rounded-xl cursor-pointer text-sm text-neutral-800 border border-neutral-300 transition-colors shadow-sm hover:shadow-md inline-block"
                    style={{ backgroundColor: "#FFFCF5" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#F5F0E8")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#FFFCF5")
                    }
                  >
                    Chọn file
                    <input
                      type="file"
                      accept=".txt,.doc,.docx"
                      onChange={handleLyricsFileChange}
                      className="sr-only"
                    />
                  </label>
                  <span className="text-neutral-800/60 text-sm">
                    {lyricsFile ? lyricsFile.name : "Chưa chọn file"}
                  </span>
                </div>
              </FormField>
            </div>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        icon={Info}
        title="Ghi chú bổ sung"
        optional
        defaultOpen={false}
      >
        <div className="space-y-4">
          <FormField
            label="Mô tả nội dung"
            hint="Lời bài hát, chủ đề, ý nghĩa văn hóa"
          >
            <TextInput
              value={description}
              onChange={setDescription}
              placeholder="Mô tả chi tiết về bản nhạc..."
              multiline
              rows={4}
            />
          </FormField>

          <FormField
            label="Ghi chú thực địa"
            hint="Quan sát về bối cảnh, phong cách trình diễn"
          >
            <TextInput
              value={fieldNotes}
              onChange={setFieldNotes}
              placeholder="Những quan sát đặc biệt..."
              multiline
              rows={3}
            />
          </FormField>

          <FormField
            label="Phiên âm/Bản dịch"
            hint="Nếu sử dụng ngôn ngữ dân tộc thiểu số"
          >
            <TextInput
              value={transcription}
              onChange={setTranscription}
              placeholder="Phiên âm hoặc bản dịch tiếng Việt..."
              multiline
              rows={3}
            />
          </FormField>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        icon={Shield}
        title="Thông tin quản trị và bản quyền"
        optional
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Người thu thập/Ghi âm">
            <TextInput
              value={collector}
              onChange={setCollector}
              placeholder="Tên người hoặc tổ chức ghi âm"
            />
          </FormField>

          <FormField label="Bản quyền">
            <TextInput
              value={copyright}
              onChange={setCopyright}
              placeholder="Thông tin về quyền sở hữu, giấy phép"
            />
          </FormField>

          <FormField label="Tổ chức lưu trữ">
            <TextInput
              value={archiveOrg}
              onChange={setArchiveOrg}
              placeholder="Nơi bảo quản bản gốc"
            />
          </FormField>

          <FormField label="Mã định danh" hint="ISRC hoặc mã catalog riêng">
            <TextInput
              value={catalogId}
              onChange={setCatalogId}
              placeholder="VD: ISRC-VN-XXX-00-00000"
            />
          </FormField>
        </div>
      </CollapsibleSection>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-neutral-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md border-2 border-primary-600"
            style={{ backgroundColor: "#FFFCF5" }}
            onMouseEnter={(e) =>
              !isSubmitting &&
              (e.currentTarget.style.backgroundColor = "#F5F0E8")
            }
            onMouseLeave={(e) =>
              !isSubmitting &&
              (e.currentTarget.style.backgroundColor = "#FFFCF5")
            }
          >
            Đặt lại
          </button>
          <button
            type="submit"
            disabled={!file || isAnalyzing || isSubmitting}
            className="btn-liquid-glass-primary px-8 py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Đóng góp
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
