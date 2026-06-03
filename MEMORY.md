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
- 동일 `WEBAPP_URL` 을 index/survey/name 3곳 `CONFIG` 에 넣어야 함. **현재 placeholder (`…/XXXXXXXX/exec`) — 미입력 상태.**

## 3. i18n 규칙
- index/survey: `applyLang()` 가 `[data-i18n]`(index) / `[data-k]`(survey/name) 요소의 textContent, `[data-i18n-ph]`/`[data-k-ph]` placeholder 를 교체.
- 언어 감지 `detectLang()`: 경로 `/(ko|en|ja|zh)` > `?lang=` > localStorage(`zr_lang`) > 기본(index=ko, survey/name=en/현재 localStorage).
- 줄바꿈은 문자열에 `\n` + 해당 요소 CSS `white-space:pre-line` (예: 생성기 설명, 기프트 제목).

## 4. 초성 변환 로직 (index + name 양쪽에 복제)
- `toChosung()`: 한글 단어→음절별 초성 / 그 외→`NAME_MAP[소문자키]` 있으면 사용, 없으면 `romanChosung()` 휴리스틱.
- `NAME_MAP`: 영·일·중 흔한 이름 예외표 (발음/표기법 반영). `jungkook:'ㅈㄱ'` 등 포함.
- `romanChosung()`: 디그래프 병합(zh/sh/ch/ts…) → 토큰화 → onset 자음 + 모음 음절(ㅇ) 추출, coda 제외.
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

## 8. 배포 절차
1. **Apps Script**: 구글시트 → Apps Script에 `Code.gs` 붙여넣기 → 웹앱 배포(실행:나 / 액세스:모든 사용자) → URL 획득.
2. `CONFIG.WEBAPP_URL` 3개 파일에 입력.
3. GitHub push → Vercel 자동 배포 (또는 `vercel`). Framework: Other(빌드 없음).
4. 코드 수정 시 Apps Script는 **배포 관리 → 새 버전** 재배포(URL 유지). 기존 테스트 시트 헤더 바뀌면 시트 삭제 후 재생성.

## 9. 열린 TODO (PRD §8과 동일)
- [ ] WEBAPP_URL 입력
- [ ] 기프트 재고 캡(수량) 여부
- [ ] 개인정보 동의 (A)/(B)
- [ ] OG 도메인 확정
- [ ] 운영시간/개인정보 문구 최종 확인
