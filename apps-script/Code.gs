/**
 * ㅈㄹ막걸리 × DOOTA 팝업 — 신청폼 백엔드
 * 구글시트를 DB로 사용하고, 응모마다 고유 쿠폰코드(ZRSS-0001 …)를 발급해 반환합니다.
 *
 * [배포 방법]
 * 1) 구글시트 → 확장 프로그램 → Apps Script 에 이 코드를 붙여넣기
 * 2) 상단 메뉴 '배포 > 새 배포' → 유형: 웹 앱
 *    - 실행 계정: 나
 *    - 액세스 권한: 모든 사용자(Anyone)
 * 3) 발급된 웹 앱 URL을 index.html 의 CONFIG.WEBAPP_URL 에 붙여넣기
 */

var SHEET_NAME = 'responses';
var SURVEY_SHEET = 'survey';
var GIFT_SHEET = 'gifts';
var NAMEGEN_SHEET = 'namegen';
var COUPON_PREFIX = 'ZRSS-';
var GIFT_PREFIX = { keyring:'ZR-K-', mirror:'ZR-M-', discount:'ZR-D-' };

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // 동시 제출 시 쿠폰 번호 중복 방지
  try {
    var data = JSON.parse(e.postData.contents);

    // ── 만족도 조사(survey.html)는 별도 시트로 ──
    if (data.type === 'survey') {
      var sv = getSurveySheet_();
      sv.appendRow([
        new Date(), data.language || '', data.nationality || '', data.gender || '',
        data.taste_overall || '', data.design || '', data.price || '', data.repurchase || '', data.comment || ''
      ]);
      return json_({ ok: true });
    }

    // ── 이름 생성기 로깅(index.html / name.html) → namegen 시트 ──
    if (data.type === 'namegen') {
      var ng = getNamegenSheet_();
      ng.appendRow([
        new Date(),
        data.event || 'generate',   // generate / share / save
        data.name || '',            // 입력 원본 이름
        data.chosung || '',         // 변환 결과
        data.language || '',
        data.page || ''             // index / name
      ]);
      return json_({ ok: true });
    }

    // ── SNS 인증 기프트 뽑기(index.html) → gifts 시트 + 코드 발급 ──
    if (data.type === 'gift') {
      var gf = getGiftSheet_();
      var gseq = gf.getLastRow();
      var gcode = (GIFT_PREFIX[data.gift] || 'ZR-G-') + ('0000' + gseq).slice(-4);
      gf.appendRow([
        new Date(),
        "'" + (data.instagram || ''),
        data.gift || '',
        data.followed ? 'Y' : 'N',
        data.story ? 'Y' : 'N',
        gcode,
        data.language || ''
      ]);
      return json_({ ok: true, code: gcode });
    }

    // ── 응모 폼(index.html) → 쿠폰 발급 ──
    var sheet = getSheet_();
    var seq = sheet.getLastRow();                 // 다음 순번 (헤더만 있으면 1 → 0001)
    var coupon = COUPON_PREFIX + ('0000' + seq).slice(-4);

    sheet.appendRow([
      new Date(),                 // timestamp
      data.language || '',        // language
      data.name || '',            // name
      data.name_chosung || '',    // name_chosung
      "'" + (data.phone || ''),   // phone (앞 0 보존 위해 텍스트)
      data.source || '',          // source
      data.consent ? 'Y' : 'N',   // consent
      coupon                      // coupon
    ]);

    return json_({ ok: true, coupon: coupon });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// 배포 확인용 (브라우저에서 URL 열면 표시)
function doGet() {
  return json_({ ok: true, service: 'ZR Makgeolli popup form', ts: new Date() });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['timestamp','language','name','name_chosung','phone','source','consent','coupon']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getSurveySheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SURVEY_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SURVEY_SHEET);
    sheet.appendRow(['timestamp','language','nationality','gender','overall','design','price','repurchase','comment']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getNamegenSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(NAMEGEN_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(NAMEGEN_SHEET);
    sheet.appendRow(['timestamp','event','name','chosung','language','page']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getGiftSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(GIFT_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(GIFT_SHEET);
    sheet.appendRow(['timestamp','instagram','gift','followed','story','code','language']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ===========================================================
   📊 대시보드 — 시트 상단 메뉴 [📊 ZR > 대시보드 갱신] 으로 실행
=========================================================== */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('📊 ZR')
    .addItem('대시보드 갱신', 'buildDashboard')
    .addToUi();
}

function getRows_(name) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
}

function buildDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dash = ss.getSheetByName('Dashboard');
  if (!dash) dash = ss.insertSheet('Dashboard', 0); else dash.clear();

  var pct = function (n, d) { return d ? (Math.round(n / d * 1000) / 10) + '%' : '-'; };
  var avg = function (a) { var v = a.map(Number).filter(function (x) { return !isNaN(x); }); return v.length ? Math.round(v.reduce(function (p, c) { return p + c; }, 0) / v.length * 100) / 100 : '-'; };
  var countBy = function (a) { var m = {}; a.forEach(function (x) { x = ('' + x).trim(); if (x) m[x] = (m[x] || 0) + 1; }); return Object.keys(m).map(function (k) { return [k, m[k]]; }).sort(function (x, y) { return y[1] - x[1]; }); };

  var o = [];
  o.push(['📊 ZR 팝업 대시보드', '', '갱신: ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm')]);
  o.push(['']);

  // 이름 생성기
  var ng = getRows_(NAMEGEN_SHEET);               // [ts, event, name, chosung, language, page]
  var gen = ng.filter(function (r) { return r[1] === 'generate'; });
  var nGen = gen.length;
  o.push(['── 이름 생성기 ──']);
  o.push(['총 생성수', nGen]);
  o.push(['공유수', ng.filter(function (r) { return r[1] === 'share'; }).length, '전환율', pct(ng.filter(function (r) { return r[1] === 'share'; }).length, nGen)]);
  o.push(['저장수', ng.filter(function (r) { return r[1] === 'save'; }).length, '전환율', pct(ng.filter(function (r) { return r[1] === 'save'; }).length, nGen)]);
  var ko = gen.filter(function (r) { return r[4] === 'ko'; }).length;
  o.push(['한국어', ko, '외국어', nGen - ko]);
  var idx = gen.filter(function (r) { return r[5] === 'index'; }).length;
  o.push(['메인(index)', idx, '/name', nGen - idx]);
  o.push(['']);
  o.push(['인기 이름 TOP10', '횟수']);
  var top = countBy(gen.map(function (r) { return r[2]; })).slice(0, 10);
  if (top.length) top.forEach(function (t) { o.push(t); }); else o.push(['(데이터 없음)']);
  o.push(['']);

  // 설문
  var sv = getRows_(SURVEY_SHEET);                // [ts, language, nationality, gender, overall, design, price, repurchase, comment]
  o.push(['── 시음·브랜드 설문 ──']);
  o.push(['응답수', sv.length]);
  o.push(['맛 만족도(평균/5)', avg(sv.map(function (r) { return r[4]; }))]);
  o.push(['디자인 호감도(평균/5)', avg(sv.map(function (r) { return r[5]; }))]);
  o.push(['가격 적정성(평균/5)', avg(sv.map(function (r) { return r[6]; }))]);
  o.push(['재구매 의향(평균/5)', avg(sv.map(function (r) { return r[7]; }))]);
  o.push(['']);
  o.push(['국적 분포', '응답']);
  var nat = countBy(sv.map(function (r) { return r[2]; }));
  if (nat.length) nat.forEach(function (t) { o.push(t); }); else o.push(['(없음)']);
  o.push(['']);
  o.push(['성별 분포', '응답']);
  var gd = countBy(sv.map(function (r) { return r[3]; }));
  if (gd.length) gd.forEach(function (t) { o.push(t); }); else o.push(['(없음)']);
  o.push(['']);

  // 기프트
  var gf = getRows_(GIFT_SHEET);                  // [ts, instagram, gift, followed, story, code, language]
  var gc = function (k) { return gf.filter(function (r) { return r[2] === k; }).length; };
  o.push(['── 기프트 뽑기 ──']);
  o.push(['총 발급수', gf.length]);
  o.push(['🔑 키링', gc('keyring'), pct(gc('keyring'), gf.length)]);
  o.push(['🪞 거울', gc('mirror'), pct(gc('mirror'), gf.length)]);
  o.push(['🏷️ 할인쿠폰', gc('discount'), pct(gc('discount'), gf.length)]);

  var width = 5;
  var data = o.map(function (r) { r = r.slice(0, width); while (r.length < width) r.push(''); return r; });
  dash.getRange(1, 1, data.length, width).setValues(data);
  dash.getRange(1, 1).setFontWeight('bold').setFontSize(14);
  dash.setColumnWidth(1, 200);
  try { ss.toast('대시보드 갱신 완료', '📊', 3); } catch (e) {}
}
