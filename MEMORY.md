# MEMORY.md — 개발 컨텍스트 & 의사결정 로그

> 새 세션/협업자가 빠르게 맥락 잡기 위한 메모. (PRD=무엇, DESIGN=비주얼, MEMORY=어떻게/왜/주의)

## 1. 파일 맵
```
index.html            # 랜딩 (4개 언어 i18n 내장, 단일 파일)
name.html             # 초성 생성기 단독 페이지 (변환 로직 자체 포함, 4개 언어)
survey.html           # 시음·브랜드 설문 (4개 언어, 기본 en)
apps-script/Code.gs   # 구글시트 백엔드 (gift / survey / 레거시 응모 분기)
vercel.json           # rewrites: 언어별·/survey/*·/name 라우팅
assets/               # 웹 최적화 이미지 (≈1MB) — 배포 대상
_originals/           # 고화질 원본(대용량) — .gitignore, 배포 제외
.gitignore            # .claude/, .vercel, node_modules, _originals/
PRD.md / DESIGN.md / MEMORY.md / README.md
```

## 2. 아키텍처
- **정적 사이트** (빌드 없음) → Vercel. 백엔드는 **Google Apps Script 웹앱**(구글시트 DB).
- 프론트 → `fetch(CONFIG.WEBAPP_URL, {method:'POST', body: JSON.stringify(payload)})`. payload.`type` 으로 시트 분기.
- 동일 `WEBAPP_URL` 을 index/survey/name 3곳 `CONFIG` 에 입력. **✅ 연결 완료**(Apps Script 웹앱 배포 → gift/survey/namegen 시트 적재 검증 끝). Vercel Analytics Enable 됨.

## 3. i18n 규칙
- index/survey: `applyLang()` 가 `[data-i18n]`(index) / `[data-k]`(survey/name) 요소의 textContent, `[data-i18n-ph]`/`[data-k-ph]` placeholder 를 교체.
- 언어 감지 `detectLang()`: 경로 `/(ko|en|ja|zh)` > `?lang=` > localStorage(`zr_lang`) > 기본(index=ko, survey/name=en/현재 localStorage).
- 줄바꿈은 문자열에 `\n` + 해당 요소 CSS `white-space:pre-line` (예: 생성기 설명, 기프트 제목).

## 4. 초성 변환 로직 (index + name 양쪽에 복제)
- `toChosung()`: 한글 단어→음절별 초성 / 그 외→`NAME_MAP[소문자키]` 있으면 사용, 없으면 `romanChosung()` 휴리스틱.
- `NAME_MAP`: 영·일·중 흔한 이름 예외표 (발음/표기법 반영). `jungkook:'ㅈㄱ'` 등 포함.
- `romanChosung()`: 자음 디그래프 병합(zh/sh/ch/ts…) + **모음 이중자(`VOWEL_DI`: eo/eu/ae/oe/ui/oo/ou/ee/ea) = 한 음절로 묶음** + **중복자음 흡수(tt/ll/nn…)** → 토큰화 → 초성 추출. **받침 가능 자음(ㄱㄴㄹㅁㅂㅇ+묵음ㅎ)만 코다로 흡수**, 그 외 자음(ㄷㅌㅅㅈㅊㅋㅍ)은 **'으' 음절로 살림**(예: Edward→ㅇㄷㅇㄷ, Brad→ㅂㄹㄷ). 어두/자음군이 모음으로 이어지면 살림.
  - ⚠️ 버그4(모음 이중자): 인접한 **서로 다른 모음**을 무조건 별개 음절(+ㅇ)로 쪼개던 문제 → 한글 로마자(seo·young·taeyeon)·영어 이중모음에서 ㅇ 과잉. **`VOWEL_DI` 묶음으로 해결**: seo→ㅅ(서), jang won young→㈈ㅇㅇ, seo da bin→ㅅㄷㅂ, taeyeon→ㅌㅇ(태연), sean→ㅅ(션). 진짜 이중모음(haeun=ae+u 하은→ㅎㅇ)·일/중 다모음(aoi·inoue)은 NAME_MAP/단일모음 병치로 유지. `amy`는 NAME_MAP 'ㅇㅁ'→**'ㅇㅇㅁ'**(에이미) 수정. (※ 과거엔 모든 coda를 버려 d/t/k가 누락되던 버그도 있었음)
- ⚠️ name.html 은 별도 복사본 → 로직 수정 시 **두 파일 동기화** 필요(NAME_MAP 포함).

## 5. 기프트 가챠
- 가중치 `GIFTS`(index 스크립트): keyring 10 / mirror 40 / discount 50. `drawGift()` 가중 랜덤.
- 코드: 클라가 임시코드 생성 → 서버(`type:'gift'`)가 행번호 기반 `ZR-K/M/D-####` 반환(실패 시 클라 코드).
- 할인쿠폰 결과는 이모지 대신 `.coupon-badge`("COUPON"). 스핀 이모지는 🏷️ (ticket 🎟️ 의 "ADMIT ONE" 노출 피함).

## 6. 알려진 주의점 / Gotchas
- **DOOTA 간격**: 두 span으로 쪼개면 글자 사이 떠 보임 → `.doota` 단일 그라데이션으로 해결. (정적 HTML + `colorizeBrand()` i18n 둘 다 이 방식)
- **`@` 가독성**: Space Mono `@`≈`a` → 핸들 노출부는 Inter.
- **Canvas 폰트**: 스토리 카드 그리기 전 `document.fonts.load('900 …px Paperlogy')` + `document.fonts.ready` await. 보틀 이미지(`bottle-cut.png`)도 onload await.
- **인스타 공유**: Web Share API(files) — 모바일만 공유시트, 데스크톱은 다운로드 폴백. 자동 게시 불가(인스타 제약).
- **이미지 경로**: 반드시 `/assets/...` (루트 절대). `/en` `/survey/ja` 등 하위경로 라우트에서 상대경로 깨짐 방지.
- ⚠️ **DOM 요소 삭제 시 그 요소를 참조하는 JS도 같이 제거/가드** 必. `document.getElementById('없는id').addEventListener(...)` 가 null 에러를 던지면 **그 줄 이후 스크립트 전체가 중단** → 맨 끝의 `applyLang(LANG)` 초기화·각종 핸들러가 안 붙어 **i18n 미적용(HTML 기본값 노출)·언어토글·폼 전부 먹통**이 됨. (개인정보 동의 삭제로 `#privacy-link` 제거했을 때 실제 발생 → 리스너를 `if(el)` null-safe로 수정.) 증상: "번역 안 되고 기본 텍스트만 보임"이면 콘솔 에러부터 확인.
- **대용량 원본**: `_originals/`(56MB png 등)는 gitignore. 배포/Push 전 거대 파일 들어가지 않게 유지. 신규 이미지는 PIL로 웹 최적화 후 assets에.
- **막꾸 이미지**: `assets/makku.jpg`(우하단 제미나이 워터마크 제거 + 최적화본). 원본은 `_originals/makku.png`.
- **레거시 코드**: Code.gs 의 default(응모폼+쿠폰 `responses`) 분기는 현재 프론트 미사용 → 정리 가능하나 보존 중.
- **로컬 미리보기**: 정적 파일이라 Python `http.server` 등으로 폴더 서빙. (`.claude/launch.json` 은 gitignore)

## 7. 의사결정 로그 (요약)
- 응모폼/쿠폰 → **SNS 인증 기프트 가챠**로 전환 (UGC 확산 목적).
- "더 보러 가기"/스토어 링크 전면 삭제.
- 슬로건 `가볍게, 위트있게 한 잔!` → `DRINK HAPPY NOT HEAVY` (한 줄, 푸터 포함 전역).
- 라벨링: `초성/Korean Initial` → 영문은 `Korean Alphabet (Name)` 으로 통일(한국어는 '초성' 유지).
- 설문: 한국어 단일 → **외국인 대상 4개 언어 + 언어별 URL**, 문항 축소(국적·성별/맛 전체/디자인·가격/재구매/의견).
- 폴더명 공백 이슈로 `zr makgeolli` → `zr_makgeolli` (내용 이사, 옛 폴더 삭제 예정).
- 기프트 폼: **개인정보 동의 체크박스 제거 + 인스타 아이디 미저장**(payload `instagram:''`). 아이디 입력은 현장 스태프 확인용으로만. 안내문 2줄(확인 후 지급 / 1계정 1회).
- 행사 기간 단축: 2026.6.8 – **6.30** (hero-meta·마퀴·VISIT·카드·en 전부 반영).
- 생성기 사용 로깅 추가: A)구글시트 `namegen`(generate/share/save + 원본 이름·초성·언어·page) B)Vercel Analytics 커스텀이벤트(이름 없이). `logName()` 헬퍼가 둘 다 발사. 안내문 `gen.track` 4개 언어.
- ⚠️ 버그2: **name.html 생성기 함수명이 `open`이라 네이티브 `window.open`과 충돌** → 버튼 오작동 가능 → `openCard`로 리네임. // **name.html엔 원래 `CONFIG`가 없었음** → logName의 `CONFIG.WEBAPP_URL`이 ReferenceError로 시트 로깅 조용히 실패 → name.html에 CONFIG 추가. (교훈: 페이지마다 CONFIG 존재 확인, 전역 함수명은 네이티브와 충돌 주의)
- 기프트 결과 UX: 버튼 = **이미지 저장(흰 버튼, 메인)** + 공유·팔로우·닫기(투명 아이콘 `.iconbtn`). 저장은 **캔버스 기프트 티켓(`gift-canvas` 1080×1350, `drawGiftTicket()`)** PNG — 모달과 동일 디자인 + "코드·스토리 보여주세요" 안내. 공유=Web Share(티켓 이미지). gift.show 4개 언어 갱신.
- 대시보드: Code.gs에 `onOpen()`(메뉴 [📊 ZR > 대시보드 갱신]) + `buildDashboard()` + `getRows_()` 추가 → `Dashboard` 시트에 KPI 요약. **웹앱 재배포 불필요**(시트 바운드 함수). namegen/survey/gifts 읽어 집계.
- ⚠️ 버그3(또 CONFIG/요소 참조): 기프트 동의 삭제 때처럼 **`gift-insta` 제거 시 그 요소 참조 JS도 같이 삭제** 필요(안 하면 또 스크립트 중단). 처리 완료.
- 언어토글: 텍스트(KO/EN/JA/ZH) → **국기 이미지**(flagcdn SVG: kr/us/jp/cn)로 변경(3개 파일 동일). 활성 = `box-shadow` 링(밝은 배경 black, name.html 다크 배경 pink). `aria-label`/`alt`로 접근성·CDN 실패 시 폴백. (EN=미국기 us)
- 운영시간: **14:00–24:00 (MON–SUN)** 로 변경(index 4개 언어 `visit.hoursV` + PRD 반영. survey/name엔 시간 표기 없음).
- 중국어(zh) 전용 **小红书 현지화 완료**(중국은 인스타 불가): 헤더·쿠폰배너 "小红书认证" + s1d "在小红书关注" + **s2t/s2d: 快拍(스토리) → 笔记(피드 포스트)** + 태그 안내 `@zr.makgeolli #韩国旅游 #韩国旅行 #韩国米酒 #首尔美食 #首尔必吃 + DOOTA 地点(위치)` + handleL "小红书账号" + chk1/chk2/note/show 전부 小红书·笔记 기준. 공식계정 핸들 = `zr.makgeolli`(인스타와 동일 표기 사용).
  - 팔로우 링크 **언어별 분기**: `applyLang()`에서 `lang==='zh' ? CONFIG.XHS_URL : CONFIG.INSTA_URL`로 `gift-follow`/`gift-follow2` href 설정(언어 전환 시 갱신). ⚠️ `CONFIG.XHS_URL`은 현재 **검색 딥링크 placeholder** (`search_result?keyword=zr.makgeolli`) — 小红书 공식 프로필 URL(user/profile/{id}) 확정 시 교체 必.
  - 푸터 SNS(`footer-insta`)도 언어 분기에 포함 → zh는 텍스트 "小红书 @zr.makgeolli" + href XHS_URL, 그 외 Instagram. ⚠️ 다른 언어(ko/en/ja)는 그대로 Instagram/스토리.
- 생성기 입력 placeholder = 언어별 **흔한 이름**(KO 김민지 / EN EMMA / JA HIMARI / ZH XINYI) — 셀럽 이름 혼동 방지, "본인 이름 입력" 유도. 변환 **예시**는 설명부(JANG WON YOUNG·JUNG KOOK·Rihanna, 각 줄바꿈)로 분리.

## 8. 배포 절차
1. **Apps Script**: 구글시트 → Apps Script에 `Code.gs` 붙여넣기 → 웹앱 배포(실행:나 / 액세스:모든 사용자) → URL 획득.
2. `CONFIG.WEBAPP_URL` 3개 파일에 입력.
3. GitHub push → Vercel 자동 배포 (또는 `vercel`). Framework: Other(빌드 없음).
4. 코드 수정 시 Apps Script는 **배포 관리 → 새 버전** 재배포(URL 유지). 기존 테스트 시트 헤더 바뀌면 시트 삭제 후 재생성.
5. **대시보드**: Code.gs에 `onOpen`/`buildDashboard`/`getRows_` 포함 → 시트 새로고침 후 메뉴 **[📊 ZR > 대시보드 갱신]** 실행(웹앱 재배포 불필요). 매일 자동 원하면 시간 트리거 추가.
- (현재 상태: WEBAPP_URL 연결·시트 적재·Analytics Enable 완료. 남은 건 대시보드 함수만 Apps Script에 추가하면 끝.)

## 9. 열린 TODO (PRD §8과 동일)
- [x] WEBAPP_URL 입력·연결 완료 (gift/survey/namegen 적재 검증)
- [ ] 기프트 재고 캡(수량) 여부
- [x] 개인정보 동의 (B 채택: 미저장+동의 제거)
- [ ] OG 도메인 확정
- [ ] 小红书 공식 프로필 URL 확정 → `CONFIG.XHS_URL` 교체 (현재 검색 딥링크 placeholder)
- [x] 운영시간 14:00–24:00 (MON–SUN) 적용 완료 / [ ] 개인정보 문구 최종 확인
