# ㅈㄹ막걸리 × DOOTA 팝업

다국어(한/영/일/중) 이벤트 랜딩 + 응모폼 + 시음 만족도 설문. 데이터는 **Apps Script + 구글시트**, 배포는 **Vercel**, 언어별 **고유 URL**(QR용).

## 파일 구조
```
index.html            # 랜딩 + 응모폼 + 초성 생성기 (다국어)
survey.html           # 시음/브랜드 만족도 설문 (QR용, 현재 한국어)
apps-script/Code.gs   # 구글시트 연동 백엔드 (응모=쿠폰발급 / 설문=별도시트)
vercel.json           # 언어별 주소(/ko /en /ja /zh) + /survey 라우팅
assets/               # 제품 이미지 (pour, bottle-*, styling)
```

---

## 1) 구글시트 + Apps Script 설정  ★코드 넣고 할 설정★

**한 개의 웹 앱이 응모폼과 설문 둘 다 받습니다.** `type:'survey'`면 `survey` 시트로, 아니면 `responses` 시트(+쿠폰)로 자동 분기됩니다.

1. 구글 드라이브 → **새 구글 스프레드시트** 생성 (예: `ZR팝업_DB`)
2. 메뉴 **확장 프로그램 → Apps Script**
3. 기본 `Code.gs` 내용을 지우고 **`apps-script/Code.gs` 전체**를 붙여넣고 저장 💾
4. 우측 상단 **배포 → 새 배포** → 유형(톱니) **웹 앱** 선택
   - 설명: 아무거나 / **실행 계정: 나** / **액세스 권한: 모든 사용자(Anyone)**
   - **배포** → 권한 요청 뜨면: 본인 구글 계정 선택 → "Google에서 확인하지 않은 앱" → **고급 → 이동(안전하지 않음)** → 허용
5. 발급된 **웹 앱 URL**(`…/exec`) 복사
6. **`index.html`과 `survey.html`** 의 `CONFIG.WEBAPP_URL`에 **둘 다 동일하게** 붙여넣기
7. 끝! 첫 제출 시 `responses` / `survey` 시트와 헤더가 **자동 생성**됩니다.

> ⚠️ **코드를 수정하면** 자동 반영 안 됨 → 배포 → **배포 관리 → ✏️편집 → 버전: 새 버전 → 배포**. (URL은 그대로 유지됩니다.)

**시트 컬럼**
- `responses`: timestamp · language · name · name_chosung · phone · source · consent · **coupon(ZRSS-0001…)**
- `survey`: timestamp · age · visitor_type · sweet · acidity · fizz · throat · aroma · overall · design · brand · price · repurchase · nps · channels · comment

---

## 2) 만족도 조사는 어떻게? → 별도 HTML + QR ✅

- **별도 페이지(`survey.html`)가 맞습니다.** 이유: 설문은 **시음 *후*** 응답 → 응모폼과 타이밍·맥락이 다르고, 데이터도 분리돼야 분석이 깔끔합니다.
- **운영 방식: 팝업 테이블/배너에 QR** → 스캔하면 `survey.html`로 이동 → 제출 → `survey` 시트 적재.
- QR이 가리킬 주소: `https://<도메인>/survey`

---

## 3) Vercel 배포 + 언어별 주소(QR용)

### 배포
- **GitHub 방식**: 이 폴더를 GitHub에 push → vercel.com에서 **Import** → Framework Preset **Other**(빌드 없음) → Deploy
- **CLI 방식**: 폴더에서 `vercel` 실행 (정적 파일이라 설정 불필요)

### 언어별 고유 URL (`vercel.json`이 처리)
배포 후 아래 주소가 **각각 해당 언어로 바로 열립니다** → 언어별 QR을 따로 만드세요:

| 언어 | 주소 |
|------|------|
| 🇰🇷 한국어 | `https://<도메인>/ko` |
| 🇺🇸 English | `https://<도메인>/en` |
| 🇯🇵 日本語 | `https://<도메인>/ja` |
| 🇨🇳 中文 | `https://<도메인>/zh` |
| 📋 설문 | `https://<도메인>/survey` |

- 원리: `/en` 등은 `index.html`로 서빙되고, 페이지가 URL을 읽어 해당 언어로 시작합니다(경로 > `?lang=` > 저장값 > ko 순).
- 루트 `https://<도메인>/` 는 기본 한국어.
- `?lang=en` 쿼리 방식도 동작합니다(예: `/index.html?lang=en`).

---

## 확정된 결정사항
- 응모폼: 이벤트 응모(경품) · 회차/인원 제한 없음 · 맛평가 제외
- 경품: 성수 팝업 2,000원 할인쿠폰(응모 시 코드 자동 발급·시트 저장·성공화면 표시)
- 마지막 CTA: 인스타그램 + 스토어 버튼
- 도메인: Vercel 기본

## TBD / 다음 후보
- 운영시간(`visit.hoursV`), 개인정보 보유기간(`privacy.body`) 최종 확정
- **설문 다국어화**(현재 한국어) — 본 사이트처럼 4개 언어 토글 추가 가능
- 설문도 언어별 주소(`/survey/en` 등) 필요 시 분리 가능
