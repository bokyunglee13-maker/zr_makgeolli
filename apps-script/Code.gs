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
        new Date(), data.age || '', data.visitor_type || '',
        data.taste_sweet || '', data.taste_acidity || '', data.taste_fizz || '',
        data.taste_throat || '', data.taste_aroma || '', data.taste_overall || '',
        data.design || '', data.brand || '', data.price || '',
        data.repurchase || '', data.nps || '', data.channels || '', data.comment || ''
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
    sheet.appendRow(['timestamp','age','visitor_type','sweet','acidity','fizz','throat','aroma','overall','design','brand','price','repurchase','nps','channels','comment']);
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
