# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 이 파일은 **규칙(어떻게 행동하라)** 만 담는다. 프로젝트 **내용(무엇이 맞나·왜 왔나)** 은 전부 `정본/` 폴더에 있다. 내용 디테일을 여기 복붙하지 말 것(중복=표류).

## 무엇 / 어디서 읽나
정적 다국어(ko/en/ja/zh) 팝업 사이트. 빌드·번들러·package.json 없음 — 각 HTML이 인라인 `<style>`+`<script>`로 자기완결. 백엔드 = Google Apps Script→구글시트. Vercel 배포.

**`정본/README.md` 를 먼저 본다.** 작업 종류에 따라 해당 챕터만 읽어 토큰·집중을 아낀다:

| 작업 | 읽을 곳 |
|---|---|
| 스펙·라우트·구조·기능·데이터·배포 | `정본/01-개요와구조.md` |
| **디자인(컬러·타이포·컴포넌트)** | **`정본/02-디자인.md` 만** |
| 결정 이유·맥락 확인 | `정본/03-변경이력.md` |
| 남은 일·작업 전 주의(gotchas) | `정본/04-할일과참고.md` |

## 명령어 (빌드·테스트 없음 — 순수 정적)
- **로컬 프리뷰**: `node .claude/serve.cjs`(포트 5510, 이 레포 루트). 형제 레포 프리뷰는 `node .claude/serve-editions.cjs`(5520, `../zr-editions`). ⚠️ 이 환경 `python`은 MS Store 스텁이라 안 됨 → node.
- **배포**: `git push origin main` → Vercel 자동(Framework: Other, 빌드 명령 없음). `vercel --prod`도 가능. **배포·푸시는 외부 공개 행위 → 진행 전 사용자에게 확인.**
- **백엔드**: `apps-script/Code.gs`를 구글시트 Apps Script에 붙여넣고 웹앱 배포 → URL을 index/survey/name의 `CONFIG.WEBAPP_URL`에 입력. 코드 수정 후엔 **새 버전** 재배포.

## 구조 (빠른 맵)
```
index/name/match/survey.html (각자 i18n 내장)
  ├ assets/chosung.js  (공유 엔진 window.toChosung)
  └ fetch(CONFIG.WEBAPP_URL, type:gift/survey/namegen) ─▶ Apps Script ─▶ 구글시트
vercel.json (언어·기능 라우트 rewrite)
```
**전체 구조 도식(mermaid)·핵심 정보 표 = `정본/README.md`.** 파일·아키텍처 상세 = `정본/01-개요와구조.md`.

## 정본 규칙 (canonical doc)
프로젝트의 확정 지식은 **`정본/` 한 곳**에만. 새 md를 흩뿌리지 않는다.
- 확정된 내용은 **해당 챕터를 갱신**(새 문서 만들지 말 것). 라우팅: 디자인→02, 스펙/기능→01.
- **변경의 "왜/어떻게"는 항상 `03-변경이력.md`에 append** — 덮어쓰지 말고 쌓는다. 제거는 진짜 R&D 파편·중복만.
- `정본/`은 **자기완결** — 내부에서 외부 md를 "참조하라"고 하지 않는다(챕터 간 링크는 OK).
- **한 단계 끝나면 정본을 갱신하고, 사용자(주인장)가 최종 확인한다.** (사용자가 "정본 업데이트해줘"라고 하면 위 라우팅대로 해당 챕터+03을 갱신.)
- CLAUDE.md(이 파일)는 **일하는 방식이 바뀔 때만** 갱신(새 명령어·규칙·구조·라우팅). 평소 내용 변경은 정본에서.

## 형제 레포 — 혼동 금지
`../zr-editions`는 **별도 레포·별도 Vercel 프로젝트**(POLYC "비단일" 에디션, github `bokyunglee13-maker/zr-editions` → `zr-editions.vercel.app`, 자체 `정본`/문서 보유). 엔진(`assets/chosung.js`)·Apps Script `namegen` 엔드포인트만 공유(`page=polyc/match`로 구분). `.claude/serve-editions.cjs`는 그 프리뷰 전용.
- 에디션 작업은 **`../zr-editions`에서**, 이 레포 사이트 파일을 고치지 않는다.
- 이 레포(`zr_makgeolli` / `zr-makgeolli.vercel.app`)는 원본 DOOTA 사이트 — 에디션 작업 중 건드리지 않는다.
