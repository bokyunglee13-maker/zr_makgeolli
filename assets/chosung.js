/* ============================================================
   ZR Makgeolli — 초성(Korean Alphabet) 변환 엔진 (공유 모듈)
   index.html / name.html 공통. <script src="/assets/chosung.js"></script>
   사용:  toChosung(name, lang)   // lang: 'ko'|'en'|'ja'|'zh' (기본 'en')
   - 한글/자모 입력은 언어 무관 직접 처리
   - NAME_MAP(불규칙 예외) 우선 → 없으면 언어별 로마자 규칙
   - 공통 규칙 + 언어별 분기 (ja=모라, zh=병음 분해, ko/en=라틴 휴리스틱)
   ============================================================ */
(function (global) {
  'use strict';

  var CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  var V = 'aeiou';

  /* 한글/자모 → 초성 (언어 공통) */
  function hangul(w) {
    var s = '';
    for (var k = 0; k < w.length; k++) {
      var c = w.charCodeAt(k);
      if (c >= 0xAC00 && c <= 0xD7A3) s += CHO[Math.floor((c - 0xAC00) / 588)];
      else if (c >= 0x3131 && c <= 0x314E) s += w[k];
    }
    return s;
  }

  /* ===== 불규칙 예외표 (언어 공통; 발음/관용 표기 반영) ===== */
  var NAME_MAP = {
    // --- 한국 성씨(비표준 로마자) ---
    kim:'ㄱ', lee:'ㄹ', park:'ㅂ', choi:'ㅊ', jeong:'ㅈ', jung:'ㅈ', kang:'ㄱ', cho:'ㅈ', jo:'ㅈ',
    yoon:'ㅇ', yun:'ㅇ', jang:'ㅈ', lim:'ㄹ', im:'ㅇ', shin:'ㅅ', oh:'ㅇ', seo:'ㅅ', kwon:'ㄱ',
    hwang:'ㅎ', ahn:'ㅇ', an:'ㅇ', yoo:'ㅇ', hong:'ㅎ', jeon:'ㅈ', ko:'ㄱ', go:'ㄱ', moon:'ㅁ', mun:'ㅁ',
    son:'ㅅ', bae:'ㅂ', baek:'ㅂ', nam:'ㄴ', noh:'ㄴ', roh:'ㄴ', ha:'ㅎ', heo:'ㅎ', koo:'ㄱ', gu:'ㄱ',
    // --- 영어권 ---
    jason:'ㅈㅇㅅ',james:'ㅈㅇㅅ',jake:'ㅈㅇㅋ',jane:'ㅈㅇ',jay:'ㅈㅇ',mike:'ㅁㅇㅋ',michael:'ㅁㅇㅋ',david:'ㄷㅇㅂㄷ',kate:'ㅋㅇㅌ',nate:'ㄴㅇㅌ',
    grace:'ㄱㄹㅇㅅ',chris:'ㅋㄹㅅ',chloe:'ㅋㄹㅇ',ryan:'ㄹㅇㅇ',brian:'ㅂㄹㅇㅇ',ethan:'ㅇㄷ',nathan:'ㄴㅇㅅ',emily:'ㅇㅁㄹ',emma:'ㅇㅁ',olivia:'ㅇㄹㅂㅇ',
    sophia:'ㅅㅍㅇ',william:'ㅇㄹㅇ',daniel:'ㄷㄴㅇ',kevin:'ㅋㅂ',joseph:'ㅈㅅㅍ',thomas:'ㅌㅁㅅ',peter:'ㅍㅌ',robert:'ㄹㅂㅌ',charles:'ㅊㅅ',george:'ㅈㅈ',
    henry:'ㅎㄹ',jack:'ㅈ',luke:'ㄹㅋ',noah:'ㄴㅇ',leo:'ㄹㅇ',max:'ㅁㅅ',sam:'ㅅ',ben:'ㅂ',tom:'ㅌ',amy:'ㅇㅇㅁ',anna:'ㅇㄴ',sarah:'ㅅㄹ',sara:'ㅅㄹ',soul:'ㅅㅇ',nicole:'ㄴㅋ',
    rachel:'ㄹㅇㅊ',jessica:'ㅈㅅㅋ',jennifer:'ㅈㄴㅍ',ashley:'ㅇㅅㄹ',laura:'ㄹㄹ',maria:'ㅁㄹㅇ',hannah:'ㅎㄴ',lucas:'ㄹㅋㅅ',oscar:'ㅇㅅㅋ',oliver:'ㅇㄹㅂ',
    mia:'ㅁㅇ',ava:'ㅇㅂ',ella:'ㅇㄹ',lily:'ㄹㄹ',nina:'ㄴㄴ',tina:'ㅌㄴ',jungkook:'ㅈㄱ',kook:'ㄱ',
    // --- 일본(엔진이 대부분 처리하나 관용형 보존) ---
    sato:'ㅅㅌ',satou:'ㅅㅌ',suzuki:'ㅅㅈㅋ',takahashi:'ㄷㅋㅎㅅ',tanaka:'ㄷㄴㅋ',watanabe:'ㅇㅌㄴㅂ',ito:'ㅇㅌ',itou:'ㅇㅌ',yamamoto:'ㅇㅁㅁㅌ',nakamura:'ㄴㅋㅁㄹ',
    kobayashi:'ㄱㅂㅇㅅ',kato:'ㄱㅌ',katou:'ㄱㅌ',yoshida:'ㅇㅅㄷ',yamada:'ㅇㅁㄷ',sasaki:'ㅅㅅㅋ',yamaguchi:'ㅇㅁㄱㅊ',matsumoto:'ㅁㅊㅁㅌ',inoue:'ㅇㄴㅇㅇ',kimura:'ㄱㅁㄹ',
    hayashi:'ㅎㅇㅅ',shimizu:'ㅅㅁㅈ',yamashita:'ㅇㅁㅅㅌ',mori:'ㅁㄹ',ikeda:'ㅇㅋㄷ',hashimoto:'ㅎㅅㅁㅌ',ishikawa:'ㅇㅅㅋㅇ',ogawa:'ㅇㄱㅇ',goto:'ㄱㅌ',gotou:'ㄱㅌ',
    okamoto:'ㅇㅋㅁㅌ',nakajima:'ㄴㅋㅈㅁ',maeda:'ㅁㅇㄷ',fujita:'ㅎㅈㅌ',fujii:'ㅎㅈ',fujiwara:'ㅎㅈㅇㄹ',murakami:'ㅁㄹㄱㅁ',kondo:'ㄱㄷ',kondou:'ㄱㄷ',ishii:'ㅇㅅ',
    saito:'ㅅㅇㅌ',saitou:'ㅅㅇㅌ',matsuda:'ㅁㅊㄷ',hara:'ㅎㄹ',takeda:'ㄷㅋㄷ',nakano:'ㄴㅋㄴ',ono:'ㅇㄴ',tamura:'ㄷㅁㄹ',
    yuki:'ㅇㅋ',haruki:'ㅎㄹㅋ',akira:'ㅇㅋㄹ',ren:'ㄹ',sora:'ㅅㄹ',riku:'ㄹㅋ',haru:'ㅎㄹ',hinata:'ㅎㄴㅌ',tsubasa:'ㅊㅂㅅ',daiki:'ㄷㅇㅋ',kaito:'ㄱㅇㅌ',
    yuna:'ㅇㄴ',mei:'ㅁㅇ',aoi:'ㅇㅇㅇ',rin:'ㄹ',sho:'ㅅ',ryo:'ㄹ',yuto:'ㅇㅌ',sota:'ㅅㅌ',ryota:'ㄹㅌ',hana:'ㅎㄴ',sakura:'ㅅㅋㄹ',yui:'ㅇㅇ',kenta:'ㄱㅌ',
    shota:'ㅅㅌ',naoki:'ㄴㅇㅋ',takeshi:'ㄷㅋㅅ',kenji:'ㄱㅈ',daisuke:'ㄷㅇㅅㅋ',
    // --- 중국(엔진이 대부분 처리하나 관용형 보존) ---
    wang:'ㅇ',li:'ㄹ',zhang:'ㅈ',liu:'ㄹ',chen:'ㅊ',yang:'ㅇ',huang:'ㅎ',zhao:'ㅈㅇ',wu:'ㅇ',zhou:'ㅈㅇ',xu:'ㅅ',sun:'ㅅ',ma:'ㅁ',zhu:'ㅈ',hu:'ㅎ',guo:'ㄱ',he:'ㅎ',
    gao:'ㄱㅇ',lin:'ㄹ',luo:'ㄹ',zheng:'ㅈ',liang:'ㄹ',xie:'ㅅ',tang:'ㅌ',han:'ㅎ',feng:'ㅍ',deng:'ㄷ',cao:'ㅊㅇ',peng:'ㅍ',zeng:'ㅈ',xiao:'ㅅㅇ',tian:'ㅌ',dong:'ㄷ',
    pan:'ㅍ',yuan:'ㅇㅇ',cai:'ㅊㅇ',jiang:'ㅈ',du:'ㄷ',ye:'ㅇ',cheng:'ㅊ',wei:'ㅇㅇ',su:'ㅅ',lu:'ㄹ',ding:'ㄷ',shen:'ㅅ',yao:'ㅇㅇ',fan:'ㅍ',jin:'ㅈ',qin:'ㅊ',
    qiu:'ㅊ',meng:'ㅁ',jia:'ㅈ',fang:'ㅍ',wen:'ㅇ',song:'ㅅ',tao:'ㅌㅇ',mao:'ㅁㅇ',lei:'ㄹㅇ',long:'ㄹ',bai:'ㅂㅇ',cui:'ㅊㅇ',qian:'ㅊ',hou:'ㅎㅇ',
    shi:'ㅅ',hao:'ㅎㅇ',ming:'ㅁ',hua:'ㅎ',jing:'ㅈ',jun:'ㅈ',na:'ㄴ',xin:'ㅅ',ying:'ㅇ',yan:'ㅇ',ling:'ㄹ',juan:'ㅈ',ping:'ㅍ',bo:'ㅂ',bin:'ㅂ',
    fei:'ㅍㅇ',kai:'ㅋㅇ',xiang:'ㅅ',chao:'ㅊㅇ',yong:'ㅇ',gang:'ㄱ',jie:'ㅈ',dan:'ㄷ',lan:'ㄹ',qing:'ㅊ',xue:'ㅅ',rui:'ㄹㅇ',yi:'ㅇ',hui:'ㅎㅇ',
    qi:'ㅊ',xia:'ㅅ',fen:'ㅍ',xiaoming:'ㅅㅇㅁ',xiaohong:'ㅅㅇㅎ',jiahao:'ㅈㅎㅇ',haoran:'ㅎㅇㄹ',yifan:'ㅇㅍ',ziyi:'ㅈㅇ',yutong:'ㅇㅌ'
  };

  /* ============ 영어/한국어 공용 라틴 휴리스틱 ============ */
  var LATIN    = {b:'ㅂ',c:'ㅋ',d:'ㄷ',f:'ㅍ',g:'ㄱ',h:'ㅎ',j:'ㅈ',k:'ㅋ',l:'ㄹ',m:'ㅁ',n:'ㄴ',p:'ㅍ',q:'ㅋ',r:'ㄹ',s:'ㅅ',t:'ㅌ',v:'ㅂ',w:'ㅇ',x:'ㅅ',y:'ㅇ',z:'ㅈ'};
  var DIGRAPHS = {zh:'ㅈ',sh:'ㅅ',ch:'ㅊ',th:'ㅅ',ph:'ㅍ',wh:'ㅇ',ck:'ㅋ',ng:'ㅇ',qu:'ㅋ',ts:'ㅊ'};
  var VOWEL_DI = {eo:1,eu:1,ae:1,oe:1,ui:1,oo:1,ou:1,ee:1,ea:1}; // 모음 이중자=한 음절(서eo·영ou·태ae·션ea)
  var CODA     = 'ㄱㄴㄹㅁㅂㅇㅎㅋ';                                // 받침 흡수(ㅋ=/k/는 ㄱ받침). 그 외(ㄷㅌㅅㅈㅊㅍ)는 '으'음절로 살림

  function romanLatin(word, opts) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return '';
    // 영어 묵음 final-e: 자음+e 로 끝나면 e 제거 (nicole→nicol). ko에선 비활성(에 발음 유지)
    if (opts && opts.silentE && word.length >= 4 && /[bcdfgjklmnprstvz]e$/.test(word)) word = word.slice(0, -1);
    var tk = [], i, two, ch, cho, last;
    for (i = 0; i < word.length;) {
      two = word.slice(i, i + 2);
      if (DIGRAPHS[two]) { tk.push({ c: true, cho: DIGRAPHS[two] }); i += 2; continue; }
      if (VOWEL_DI[two]) { tk.push({ c: false, v: two }); i += 2; continue; }
      ch = word[i];
      if (V.indexOf(ch) >= 0) { tk.push({ c: false, v: ch }); i++; continue; }
      if (ch === 'y') { var nx = word[i + 1]; tk.push(nx && V.indexOf(nx) >= 0 ? { c: true, cho: 'ㅇ' } : { c: false, v: 'y' }); i++; continue; }
      cho = LATIN[ch] || 'ㅇ'; last = tk[tk.length - 1];
      if (!(last && last.c && last.cho === cho)) tk.push({ c: true, cho: cho });
      i++;
    }
    var out = '';
    for (i = 0; i < tk.length; i++) {
      var cur = tk[i], prev = tk[i - 1], prevV = prev && !prev.c;
      if (cur.c) {
        var nextV = tk[i + 1] && !tk[i + 1].c, va = false;
        for (var j = i + 1; j < tk.length; j++) { if (!tk[j].c) { va = true; break; } }
        if (nextV || CODA.indexOf(cur.cho) < 0 || (!prevV && va)) out += cur.cho;
      } else {
        if (i === 0 || (prevV && prev.v !== cur.v)) out += 'ㅇ';
      }
    }
    return out;
  }
  function romanize_en(w) { return romanLatin(w, { silentE: true }); }
  function romanize_ko(w) { return romanLatin(w, { silentE: false }); }

  /* ============ 일본어 (로마자 → 모라) ============
     - 모든 모음=음절, 묵음 없음, CV(+ん) 구조
     - 어두 무성자음 か/た/ち → ㄱ/ㄷ/ㅈ, 어중 → ㅋ/ㅌ/ㅊ (한국 외래어 표기 규칙)
     - ふ(f)→ㅎ, つ(ts)→ㅊ, 장음(ou/ei 등) 한 음절, っ(촉음)·ん 코다 */
  var JA_LONG = { ou: 1, oo: 1, uu: 1, ei: 1, ee: 1, aa: 1, ii: 1 };
  var JA_FIX  = { g:'ㄱ', s:'ㅅ', sh:'ㅅ', z:'ㅈ', j:'ㅈ', ts:'ㅊ', d:'ㄷ', n:'ㄴ', h:'ㅎ', f:'ㅎ', b:'ㅂ', p:'ㅍ', m:'ㅁ', y:'ㅇ', r:'ㄹ', w:'ㅇ', v:'ㅂ' };
  function romanize_ja(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return '';
    var out = '', i = 0, first = true;
    function onset(s) {
      if (s === 'k') return first ? 'ㄱ' : 'ㅋ';
      if (s === 't') return first ? 'ㄷ' : 'ㅌ';
      if (s === 'ch') return first ? 'ㅈ' : 'ㅊ';
      return JA_FIX[s] || 'ㅇ';
    }
    while (i < word.length) {
      var ch = word[i], two = word.slice(i, i + 2);
      // moraic n (ん)
      if (ch === 'n' && !(V.indexOf(word[i + 1]) >= 0 || word[i + 1] === 'y')) { i++; continue; }
      // 단독 모음 음절
      if (V.indexOf(ch) >= 0) {
        if (JA_LONG[two]) { out += 'ㅇ'; i += 2; first = false; continue; }
        out += 'ㅇ'; i++; first = false; continue;
      }
      // っ(촉음): 같은 자음 중첩 → 첫 글자 스킵
      if (ch === word[i + 1] && V.indexOf(ch) < 0) { i++; continue; }
      var cons, adv;
      if (two === 'sh' || two === 'ch' || two === 'ts') { cons = two; adv = 2; }
      else { cons = ch; adv = 1; }
      var cho = onset(cons); first = false;
      i += adv;
      if (word[i] === 'y' && V.indexOf(word[i + 1]) >= 0) i++; // 요음(kya 등) 글라이드 스킵
      var t2 = word.slice(i, i + 2);
      if (V.indexOf(word[i]) >= 0) {
        if (JA_LONG[t2]) { out += cho; i += 2; continue; }
        out += cho; i++; continue;
      }
      out += cho; // 모음 없는 자음(예외)
    }
    return out;
  }

  /* ============ 중국어 (병음 음절 분해) ============
     성모(초성) + 운모(중·종성). 운모 중 한국어로 2음절이 되는 복운모는 ㅇ 추가.
     예: zhao=자오(ㅈㅇ), gao=가오(ㄱㅇ), wei=웨이(ㅇㅇ), xiao=샤오(ㅅㅇ) */
  var ZH_INI = { b:'ㅂ',p:'ㅍ',m:'ㅁ',f:'ㅍ',d:'ㄷ',t:'ㅌ',n:'ㄴ',l:'ㄹ',g:'ㄱ',k:'ㅋ',h:'ㅎ',j:'ㅈ',q:'ㅊ',x:'ㅅ',r:'ㄹ',z:'ㅈ',c:'ㅊ',s:'ㅅ',y:'ㅇ',w:'ㅇ', zh:'ㅈ', ch:'ㅊ', sh:'ㅅ' };
  var ZH_FIN = ['iang','iong','uang','ueng','uai','uan','iao','ian','ang','eng','ing','ong','iou','uei','uen',
                'ai','ei','ao','ou','an','en','er','ia','ie','iu','in','ua','uo','ui','un','ue',
                'a','o','e','i','u'];
  var ZH_EXTRA = { ai:1, ei:1, ao:1, ou:1, ui:1, uei:1, iao:1, uai:1 }; // 2음절(ㅇ 추가) 운모
  function romanize_zh(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '').replace(/v/g, 'u');
    if (!word) return '';
    var out = '', i = 0, guard = 0;
    while (i < word.length && guard++ < 40) {
      var two = word.slice(i, i + 2), ini = '', icho = 'ㅇ';
      if (ZH_INI[two]) { ini = two; icho = ZH_INI[two]; }
      else if (ZH_INI[word[i]]) { ini = word[i]; icho = ZH_INI[word[i]]; }
      var j = i + ini.length, fin = '';
      for (var f = 0; f < ZH_FIN.length; f++) {
        var cand = ZH_FIN[f].trim();
        if (cand && word.slice(j, j + cand.length) === cand) { fin = cand; break; }
      }
      if (!fin) {
        if (V.indexOf(word[j]) >= 0) fin = word[j];
        else { out += icho; i = (j > i ? j : i + 1); continue; }
      }
      out += icho + (ZH_EXTRA[fin] ? 'ㅇ' : '');
      i = j + fin.length;
    }
    return out;
  }

  /* ============ 디스패처 ============ */
  function toChosung(name, lang) {
    lang = (lang || 'en').slice(0, 2);
    var fn = lang === 'ja' ? romanize_ja : lang === 'zh' ? romanize_zh : lang === 'ko' ? romanize_ko : romanize_en;
    var words = String(name || '').trim().split(/\s+/).filter(Boolean), out = [];
    for (var w, n = 0; n < words.length; n++) {
      w = words[n];
      var part = '';
      if (/[가-힣ㄱ-ㅎ]/.test(w)) part = hangul(w);
      else { var key = w.toLowerCase().replace(/[^a-z]/g, ''); part = NAME_MAP[key] || fn(w); }
      if (part) out.push(part);
    }
    return out.join(' ') || 'ㅈㄹ';
  }

  global.toChosung = toChosung;
  global.CHO = CHO; // 일부 페이지 호환
})(typeof window !== 'undefined' ? window : this);
