# ㅈㄹ막걸리 × DOOTA 팝업

다국어(한·영·일·중) 팝업 이벤트 사이트. 정적(HTML) + **Apps Script/구글시트** 백엔드 + **Vercel** 배포. 언어별 **고유 URL**(QR용).

문서: **[PRD.md](PRD.md)** (무엇) · **[DESIGN.md](DESIGN.md)** (비주얼) · **[MEMORY.md](MEMORY.md)** (개발/주의/결정)

## 파일
```
index.html            # 랜딩 (HERO·ABOUT·MEANING·TASTE·MADE WITH·GALLERY·PROGRAM·생성기·VISIT·기프트뽑기)
name.html             # Korean Alphabet Name 생성기 단독 페이지
survey.html           # 시음·브랜드 설문 (외국인 대상, 4개 언어)
apps-script/Code.gs   # 구글시트 백엔드 (gift / survey 분기)
vercel.json           # 라우팅(언어별 + /survey/* + /name)
assets/               # 웹 최적화 이미지   /  _originals/ = 원본(gitignore)
```

## 라우트 (배포 후)
| | URL |
|---|---|
| 랜딩(언어별) | `/ko` `/en` `/ja` `/zh` |
| 생성기 단독 | `/name` |
| 설문(언어별) | `/survey/ko` `/survey/en` `/survey/ja` `/survey/zh` |

→ **언어별로 QR을 따로** 만들면 됩니다.

## 빠른 셋업
1. **Apps Script**: 구글시트 → 확장 프로그램 → Apps Script에 `apps-script/Code.gs` 붙여넣기 → **배포 → 웹 앱**(실행: 나 / 액세스: 모든 사용자) → URL 복사.
2. **`index.html` · `survey.html` · `name.html`** 의 `CONFIG.WEBAPP_URL` 에 같은 URL 입력. *(미입력 시 화면은 정상, 폼 제출만 비활성)*
3. **Vercel**: GitHub push → Import (Framework: **Other**, 빌드 없음) → Deploy. 이후 push 시 자동 재배포.
> 코드 수정 시 Apps Script는 **배포 관리 → 새 버전** 재배포. 시트 헤더가 바뀌면 기존 시트 삭제 후 재생성.

## 데이터(구글시트)
- `gifts`: timestamp · instagram(빈값) · gift · followed · story · code · language
- `survey`: timestamp · language · nationality · gender · overall · design · price · repurchase · comment
- `namegen`: timestamp · event(generate/share/save) · name · chosung · language · page
- `Dashboard`: 시트 메뉴 **[📊 ZR > 대시보드 갱신]** 으로 KPI 요약 자동 생성 (`buildDashboard()`)
- 분석: 구글시트(내용·전환) + Vercel Analytics(방문수·이벤트, Enable됨)

## 현재 열린 항목
**완료**: WEBAPP_URL 연결·시트 적재·Vercel Analytics·개인정보(미저장). **남음**: 기프트 재고 캡(수량 정하면) / OG 도메인 확정 / 운영시간·개인정보 문구 최종 — 자세한 건 [PRD.md](PRD.md) §8.
