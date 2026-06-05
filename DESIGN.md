# DESIGN.md — "Kinetic Pink" 디자인 시스템

ㅈㄹ막걸리 팝업 사이트의 비주얼 시스템. 브루탈리스트 + 키치, 핑크 모노톤 베이스.

## 1. 컬러 토큰 (`:root`)
| 토큰 | 값 | 용도 |
|---|---|---|
| `--pink` | `#F0A0BC` | 메인 배경, 블랙 위 액센트 |
| `--black` | `#000000` | 텍스트, 보더, 다크 섹션 배경 |
| `--white` | `#FFFFFF` | 다크 섹션 텍스트, 카드 |
| `--red` | `#E11B2D` | DOOTA 그라데이션 왼쪽, eyebrow 강조 |
| `--blue` | `#0E7CA6` | DOOTA 그라데이션 오른쪽 |

- **선택 영역**: `::selection { background:#000; color:var(--pink); }`
- 다크 섹션(MEANING/PROGRAM/마퀴/생성기 띠배너)은 배경 블랙 + 핑크 액센트.

## 2. 타이포그래피
| 토큰 | 폰트 | 용도 |
|---|---|---|
| `--display` | `'Archivo Black','Paperlogy'` | 대형 헤드라인(영문 Archivo, 한글 Paperlogy 900) |
| `--mono` | `'Space Mono','Paperlogy'` | eyebrow/라벨/메타 (대문자) |
| `--body` | `'Inter','Paperlogy'` | 본문, 폼, 설명 |

- 한글 웹폰트 **Paperlogy** (jsDelivr `fonts-archive/Paperlogy`, weight 400/700/900).
- 헤더 규칙: 대문자, `letter-spacing:-.04em`, `line-height:.9~1.05`.
- ⚠️ **Space Mono의 `@` 글자가 소문자 `a`처럼 보임** → 인스타 핸들(@zr.makgeolli)이 들어가는 곳(체크박스·푸터)은 **Inter(body)** 로 렌더.

## 3. 핵심 컴포넌트
- **버튼**: `.btn` — 2px 블랙 보더, pill(rounded-full), hover `scale(1.06)`. variants: `--orange`(핑크필), `--invert`(화이트), `--block`.
- **DOOTA 브랜드 표기** `.doota`: 한 단어를 `linear-gradient(90deg, red 50%, blue 50%)` + `background-clip:text` 로 좌우 반반 색. (글자 쪼개지 않아 간격 없음. `DOOTA`/`두타` 모두 적용, i18n은 `colorizeBrand()`가 자동 래핑)
- **마퀴**: `transform:skewY(-2deg)` + `@keyframes marq` 무한 스크롤.
- **회전 스크롤 인디케이터**: 144px SVG `textPath`("SCROLL DOWN •") `@keyframes spin` 12s.
- **번호 리스트**(MADE WITH `.feat`, 스텝 `.step`): 블랙 정사각 박스 + 핑크 숫자(display) + 본문(Inter).
- **카루셀** `.carousel`: `object-fit:contain`(병 전체 노출), 자동회전 4s, 좌우 화살표 + 점.
- **모달/오버레이** `.overlay/.modal`: 핑크 배경 + 3px 블랙 보더, 샤프(둥근모서리 X).
- **스토리 카드**(Canvas 1080×1920): 핑크 배경 + 블랙 보더 + 상단 `ZR MAKGEOLLI · ㅈㄹ막걸리` + `KOREAN ALPHABET VER.` + 이름/초성 + 보틀 누끼 + 슬로건 + @핸들.
- **기프트 결과 모달**: 이모지(🔑/🪞) + 할인쿠폰은 `.coupon-badge`("COUPON", 점선 보더). 버튼 = **이미지 저장**(`btn--invert`, 흰 배경 메인) + `.iconbtn` 행(공유·팔로우·닫기 — 투명 동그라미 46px + 검정 보더 + 아이콘 + 10px 라벨).
- **기프트 티켓**(저장용 Canvas `gift-canvas` 1080×1350): 모달과 동일 — 핑크 배경·블랙 보더·굿즈 아이콘(또는 COUPON 박스)·당첨명·코드 박스·"코드+스토리" 안내·@핸들/날짜. `drawGiftTicket()`.

## 4. 폰트 사용 원칙(통일)
- 큰 제목·번호 = display.
- eyebrow/짧은 메타 라벨 = mono.
- 읽는 콘텐츠(설명·폼·라벨·체크박스·노트) = **Inter(body)** 로 통일. (예: 기프트 섹션 전체 Inter)

## 5. 금지/주의
- 그라데이션은 DOOTA 텍스트 외 사용 금지(브루탈 유지). 드롭섀도우는 네비/모달 깊이용 외 자제.
- Archivo Black은 라틴 전용 → 한글은 반드시 Paperlogy 폴백.
- 둥근 모서리는 pill 버튼·태그·네비·점에만.

## 6. 반응형
- 모바일: pill 네비 숨김, 카루셀 비율 `3/4`, 막꾸 카드 축소, 번호 박스 축소.
- 폭 기준: `max-width:680~1280px` wrap, 폰트 `clamp()`.
