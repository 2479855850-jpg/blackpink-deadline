/* ═══════════════════════════════════════════════════════
   BLACKPINK — script.js
   1. Scroll → video card center-scale + hide
   2. Nav links + lang button: hide on scroll-down
   3. Translation system (EN / 中文 / 한국어 / 日本語)
   4. Danmaku track builder
   5. IntersectionObserver scroll-reveal
   6. Discography horizontal scroll
   7. YouTube IFrame API audio player
   8. Hero music button
═══════════════════════════════════════════════════════ */

const lerp      = (a, b, t) => a + (b - a) * t;
const clamp     = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const easeOut   = t => 1 - Math.pow(1 - t, 3);


/* ════════════════════════════════════════
   1. VIDEO CARD CENTER-SCALE
════════════════════════════════════════ */
const navLinks   = document.querySelector('.nav-links');
const videoCard  = document.getElementById('video-card');
const heroText   = document.getElementById('hero-text');
const scrollHint = document.getElementById('scroll-hint');
const langBtn    = document.getElementById('lang-btn');

/* Is this a mobile / touch device? If so, skip the sticky-zoom hero
   and all scroll-driven inline-style writes. iOS Safari + full-viewport
   <video> + position: sticky is too fragile; a plain scroll is robust.
   NOTE: the CSS already handles the mobile layout via @media query,
   so this flag is purely to stop the JS rAF loop. Even if this script
   fails entirely, the page still works on mobile. */
const IS_MOBILE = window.matchMedia('(hover: none) and (pointer: coarse)').matches
               || window.innerWidth <= 1024;

let INIT_W = window.innerWidth;
let INIT_H = window.innerHeight;
let RANGE  = window.innerHeight;

let lastScrollY = 0;
let rafPending  = null;

function updateCard() {
  if (IS_MOBILE) return;       /* mobile: leave hero alone, rely on CSS */
  const sy = window.scrollY;
  const t  = clamp(sy / RANGE, 0, 1);

  /* Hide nav-links, lang-btn AND music-btn on scroll down, show on scroll up */
  const musicBtn = document.getElementById('music-btn');
  if (sy > lastScrollY && sy > 60) {
    navLinks.classList.add('hide-nav');
    langBtn.classList.add('hide-lang');
    if (musicBtn) musicBtn.classList.add('hide-lang');
  } else if (sy < lastScrollY) {
    navLinks.classList.remove('hide-nav');
    langBtn.classList.remove('hide-lang');
    if (musicBtn) musicBtn.classList.remove('hide-lang');
  }
  lastScrollY = sy;

  scrollHint.style.opacity = Math.max(0, 1 - t * 3).toString();

  /* Hide hero overlay elements (text) when video starts shrinking */
  if (t > 0.03) {
    heroText.classList.add('hide-hero-el');
  } else {
    heroText.classList.remove('hide-hero-el');
  }

  const newW   = lerp(INIT_W, 0, t);
  const newH   = lerp(INIT_H, 0, t);
  const newTop = (INIT_H - newH) / 2;

  videoCard.style.width        = newW + 'px';
  videoCard.style.height       = newH + 'px';
  videoCard.style.top          = newTop + 'px';
  videoCard.style.borderRadius = lerp(0, 32, clamp(t * 3, 0, 1)) + 'px';
  videoCard.style.boxShadow    =
    `0 ${lerp(0,24,t)}px ${lerp(0,72,t)}px rgba(0,0,0,${lerp(0,0.72,t)})`;

  heroText.style.opacity = (1 - clamp(t / 0.38, 0, 1)).toString();
  videoCard.style.opacity =
    t < 0.82 ? '1' : clamp(1 - (t - 0.82) / 0.18, 0, 1).toString();
  videoCard.style.visibility    = t >= 1 ? 'hidden' : 'visible';
  videoCard.style.pointerEvents = t >= 0.9 ? 'none' : '';

  /* Photo bg fixed from the start (behind video), until section-fade-dark reaches viewport top */
  const photoBg = document.querySelector('.p2-photobg');
  const fadeDark = document.querySelector('.section-fade-dark');
  if (photoBg) {
    const fadeTop = fadeDark ? fadeDark.getBoundingClientRect().top : 9999;
    if (fadeTop > 0) {
      photoBg.style.position = 'fixed';
      photoBg.style.top = '0';
      photoBg.style.left = '0';
      photoBg.style.right = '0';
      photoBg.style.height = '100vh';
      photoBg.style.zIndex = '0';
    } else {
      photoBg.style.position = '';
      photoBg.style.top = '';
      photoBg.style.left = '';
      photoBg.style.right = '';
      photoBg.style.height = '';
      photoBg.style.zIndex = '';
    }
  }

}

const navEl = document.getElementById('nav');
const galSection = document.getElementById('section-gallery');

function updateNavTheme() {
  if (!navEl || !galSection) return;
  const galTop = galSection.getBoundingClientRect().top;
  if (galTop < 80) {
    navEl.classList.add('nav-light');
  } else {
    navEl.classList.remove('nav-light');
  }
}

function onScrollFrame() {
  rafPending = null;
  updateCard();
  updateDisco();
  updateNavTheme();
}

window.addEventListener('scroll', () => {
  if (!rafPending) rafPending = requestAnimationFrame(onScrollFrame);
}, { passive: true });

window.addEventListener('resize', () => {
  INIT_W = window.innerWidth;
  INIT_H = window.innerHeight;
  RANGE  = window.innerHeight;
  updateCard();
  updateDisco();
});

updateCard();


/* ════════════════════════════════════════
   3. TRANSLATION SYSTEM
════════════════════════════════════════ */
const LANGS     = ['한국어', 'EN', '中文', '日本語'];
const LANG_KEYS = ['KO',    'EN', 'ZH',  'JA'];
let   langIdx   = 0;

const T = {
  'ht-label': {
    EN: 'Seoul · YG Entertainment · Est. 2016',
    ZH: '首尔 · YG娱乐 · 2016年创立',
    KO: '서울 · YG엔터테인먼트 · 2016년',
    JA: 'ソウル · YGエンタ · 2016年設立',
  },
  'ht-tour': {
    EN: 'DEADLINE WORLD TOUR',
    ZH: 'DEADLINE 世界巡演',
    KO: 'DEADLINE 월드투어',
    JA: 'DEADLINEワールドツアー',
  },
  'ht-members': {
    EN: 'Jisoo &nbsp;·&nbsp; Jennie &nbsp;·&nbsp; Rosé &nbsp;·&nbsp; Lisa',
    ZH: '知秀 &nbsp;·&nbsp; 珍妮 &nbsp;·&nbsp; 罗捷 &nbsp;·&nbsp; 莉莎',
    KO: '지수 &nbsp;·&nbsp; 제니 &nbsp;·&nbsp; 로제 &nbsp;·&nbsp; 리사',
    JA: 'ジス &nbsp;·&nbsp; ジェニー &nbsp;·&nbsp; ロゼ &nbsp;·&nbsp; リサ',
  },
  'about-tag': {
    EN: 'Global Phenomenon · Since 2016',
    ZH: '全球现象 · 自2016年起',
    KO: '글로벌 현상 · 2016년부터',
    JA: 'グローバル現象 · 2016年から',
  },
  'about-h': {
    EN: 'THE<br>WORLD\'S<br><span class="t-pink">BIGGEST</span>',
    ZH: '全球<br>最强<br><span class="t-pink">女团</span>',
    KO: '세계<br>최고의<br><span class="t-pink">걸그룹</span>',
    JA: '世界<br>最大<br><span class="t-pink">グループ</span>',
  },
  'about-body1': {
    EN: 'Formed by YG Entertainment, BLACKPINK — <strong>Jisoo, Jennie, Rosé, and Lisa</strong> — shattered every record in music history. First K-pop girl group to headline Coachella. <strong>Highest-grossing female world tour ever.</strong>',
    ZH: '由YG娱乐组建，BLACKPINK — <strong>知秀、珍妮、罗捷与莉莎</strong> — 打破了音乐史上的每一项纪录。首个登上科切拉音乐节头条的K-pop女子组合。<strong>史上票房最高的女性世界巡演。</strong>',
    KO: 'YG엔터테인먼트의 BLACKPINK — <strong>지수, 제니, 로제, 리사</strong> — 는 음악 역사의 모든 기록을 갈아치웠습니다. 코첼라 헤드라이너 최초의 K-팝 걸그룹. <strong>역대 여성 아티스트 최고 수익 월드 투어.</strong>',
    JA: 'YGエンタテインメントのBLACKPINK — <strong>ジス、ジェニー、ロゼ、リサ</strong> — は音楽史上のあらゆる記録を塗り替えました。コーチェラ初のK-POPガールズグループ。<strong>女性史上最高収益のワールドツアー。</strong>',
  },
  'about-body2': {
    EN: 'In 2026 they return with EP <strong>Deadline</strong>, making history as the first K-pop girl group to perform at Wembley Stadium, London.',
    ZH: '2026年，她们携EP <strong>Deadline</strong> 强势回归，成为首个登上伦敦温布利球场的K-pop女子组合。',
    KO: '2026년 EP <strong>Deadline</strong>으로 컴백하며 런던 웸블리 스타디움에 선 최초의 K-팝 걸그룹이 됩니다.',
    JA: '2026年にEP <strong>Deadline</strong>でカムバックし、ウェンブリー・スタジアム初のK-POPガールズグループとして歴史を刻みます。',
  },
  'jisoo-role':  { EN: 'Main Vocalist · Actress',     ZH: '主唱 · 演员',      KO: '메인 보컬 · 배우',       JA: 'メインボーカル · 女優' },
  'jennie-role': { EN: 'Main Rapper · Lead Dancer',   ZH: '主唱/主Rap · 主舞', KO: '메인 래퍼 · 리드 댄서',  JA: 'メインラッパー · リードダンサー' },
  'rose-role':   { EN: 'Main Vocalist · Lead Dancer', ZH: '主唱 · 主舞',       KO: '메인 보컬 · 리드 댄서',  JA: 'メインボーカル · リードダンサー' },
  'lisa-role':   { EN: 'Main Dancer · Lead Rapper',   ZH: '主舞 · 副Rap',      KO: '메인 댄서 · 리드 래퍼',  JA: 'メインダンサー · リードラッパー' },
  'tour-tag': {
    EN: 'Deadline World Tour · 2025–2026',
    ZH: 'Deadline 世界巡演 · 2025–2026',
    KO: 'Deadline 월드투어 · 2025–2026',
    JA: 'Deadlineワールドツアー · 2025–2026',
  },
  'tour-h': { EN: 'On Tour', ZH: '巡演中', KO: '투어 중', JA: 'ツアー中' },
  'ep-tag':  {
    EN: 'BLACKPINK · Playlist',
    ZH: 'BLACKPINK · 播放列表',
    KO: 'BLACKPINK · 플레이리스트',
    JA: 'BLACKPINK · プレイリスト',
  },
  'ep-body': {
    EN: 'BLACKPINK\'s top 10 most popular songs. Hit play and feel the energy.',
    ZH: 'BLACKPINK 最受欢迎的10首歌曲。点击播放，感受能量。',
    KO: 'BLACKPINK의 가장 인기 있는 10곡. 재생을 누르고 에너지를 느껴보세요.',
    JA: 'BLACKPINKの人気トップ10曲。再生してエナジーを感じてください。',
  },

  /* Stats */
  'stats-tag': { EN: 'Records & Achievements', ZH: '纪录与成就', KO: '기록과 성과', JA: '記録と実績' },
  'stat-yt':   { EN: 'YouTube Views',          ZH: 'YouTube 播放量',    KO: 'YouTube 조회수',      JA: 'YouTube 再生回数' },
  'stat-spot': { EN: 'Monthly Spotify Listeners', ZH: 'Spotify 月活听众', KO: 'Spotify 월간 청취자', JA: 'Spotify 月間リスナー' },
  'stat-gwr':  { EN: 'Guinness World Records', ZH: '吉尼斯世界纪录',    KO: '기네스 세계 기록',     JA: 'ギネス世界記録' },
  'stat-tour': { EN: 'World Tour Revenue',     ZH: '世界巡演收入',      KO: '월드투어 수익',       JA: 'ワールドツアー収益' },

  /* BLINK */
  'blink-tag':  { EN: 'BLINK · Official Fandom', ZH: 'BLINK · 官方粉丝团', KO: 'BLINK · 공식 팬덤', JA: 'BLINK · 公式ファンダム' },
  'blink-body': {
    EN: 'From Seoul to every corner of the world, BLINKs are more than fans — they are family. <strong>The loudest lightstick ocean</strong> in K-pop history.',
    ZH: '从首尔到世界每一个角落，BLINK 不仅是粉丝——更是家人。<strong>K-pop 史上最壮观的应援棒海洋。</strong>',
    KO: '서울에서 세계 곳곳까지, 블링크는 팬 그 이상 — 가족입니다. <strong>K-pop 역사상 가장 빛나는 응원봉 바다.</strong>',
    JA: 'ソウルから世界の隅々まで、BLINKはファン以上の存在 — 家族です。<strong>K-POP史上最も壮大なペンライトの海。</strong>',
  },
  'blink-t1': { EN: 'Lightstick Ocean', ZH: '应援棒海洋', KO: '응원봉 바다', JA: 'ペンライトの海' },
  'blink-d1': { EN: '100,000+ pink hammerbongs illuminate every stadium', ZH: '10万+粉色应援棒照亮每一座体育场', KO: '10만 개 이상의 핑크 응원봉이 모든 경기장을 밝힙니다', JA: '10万本以上のピンクのペンライトがスタジアムを照らす' },
  'blink-t2': { EN: 'Fan Projects', ZH: '粉丝应援', KO: '팬 프로젝트', JA: 'ファンプロジェクト' },
  'blink-d2': { EN: 'Charity drives, birthday events, streaming parties worldwide', ZH: '公益活动、生日应援、全球打榜派对', KO: '자선 활동, 생일 이벤트, 전 세계 스트리밍 파티', JA: 'チャリティ活動、誕生日イベント、世界中のストリーミングパーティ' },
  'blink-t3': { EN: 'Fanchants', ZH: '应援口号', KO: '팬챈트', JA: 'ファンチャント' },
  'blink-d3': { EN: 'Every lyric, every beat — BLINKs never miss', ZH: '每一句歌词、每一个节拍——BLINK 从不缺席', KO: '모든 가사, 모든 비트 — 블링크는 절대 빠지지 않습니다', JA: 'すべての歌詞、すべてのビート — BLINKは絶対に外さない' },
  'blink-cta': { EN: 'Join Weverse ↗', ZH: '加入 Weverse ↗', KO: 'Weverse 가입 ↗', JA: 'Weverse に参加 ↗' },

  /* Gallery */
  'gal-tag': { EN: 'The Members', ZH: '成员', KO: '멤버', JA: 'メンバー' },

  /* Discography */
  'disco-tag': { EN: 'Discography', ZH: '音乐作品', KO: '디스코그래피', JA: 'ディスコグラフィー' },

  /* Partners */
  'ptr-tag': { EN: 'Brand Ambassadors', ZH: '品牌代言', KO: '브랜드 앰배서더', JA: 'ブランドアンバサダー' },

  /* Nav */
  'nav-about':   { EN: 'About',   ZH: '关于', KO: '소개', JA: '概要' },
  'nav-members': { EN: 'Members', ZH: '成员', KO: '멤버', JA: 'メンバー' },
  'nav-tour':    { EN: 'Tour',    ZH: '巡演', KO: '투어', JA: 'ツアー' },
  'nav-music':   { EN: 'Music',   ZH: '音乐', KO: '음악', JA: '音楽' },

  /* Contact */
  'contact-tag': { EN: 'Contact', ZH: '联系方式', KO: '연락처', JA: 'お問い合わせ' },
};

const LANG_HTML_CODE = { EN: 'en', ZH: 'zh', KO: 'ko', JA: 'ja' };
function applyLang(key) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.dataset.i18n;
    if (T[k] && T[k][key]) el.innerHTML = T[k][key];
  });
  if (LANG_HTML_CODE[key]) document.documentElement.lang = LANG_HTML_CODE[key];
}

if (langBtn) {
  langBtn.addEventListener('click', () => {
    langIdx = (langIdx + 1) % LANGS.length;
    const key = LANG_KEYS[langIdx];
    document.getElementById('lang-label').textContent = LANGS[langIdx];
    applyLang(key);
  });
}


/* ════════════════════════════════════════
   4. DANMAKU TRACK BUILDER
════════════════════════════════════════ */
const SONGS = [
  'PINK VENOM', 'SHUT DOWN', 'How You Like That', 'DDU-DU DDU-DU',
  'Lovesick Girls', 'Kill This Love', 'Forever Young', 'Stay',
  "As If It's Your Last", 'JUMP', 'GO', 'Whistle', 'Boombayah',
  'Playing With Fire', 'Ice Cream', 'Pretty Savage', 'Crazy Over You',
  'Tally', 'Hard To Love', 'The Happiest Girl',
];
const FANS = [
  'BP IN YOUR AREA', 'FOREVER BLACKPINK', 'Lisa Dancing Queen',
  'Jennie Human Chanel', 'Jisoo Actress Queen', 'Rose Vocal Queen',
  'Born Pink Era', 'DEADLINE IS FIRE', 'We love you BLINKs',
  'BLACKPINK World Domination', 'Jennie x Rose Collab',
  'Lisa 4 Eva', 'Jisoo Unnie', 'YG Stan Forever',
  'First K-pop Girls at Wembley', 'BLINK Army Strong',
];

const DM_COLORS = ['dm-pink','dm-purple','dm-gold','dm-neon','dm-coral','dm-cyan'];
function buildTrack(items, pinkStep) {
  const half = items.map((item, i) => {
    const c = DM_COLORS[i % DM_COLORS.length];
    return `<span class="dm-item ${c}">${item}</span><span class="dm-sep"> · </span>`;
  }).join('');
  return half + half;
}

const dmSongs  = document.getElementById('dm-songs');
const dmFans   = document.getElementById('dm-fans');
const dmSongs2 = document.getElementById('dm-songs2');
const dmFans2  = document.getElementById('dm-fans2');
if (dmSongs)  dmSongs.innerHTML  = buildTrack(SONGS, 3);
if (dmFans)   dmFans.innerHTML   = buildTrack(FANS,  4);
if (dmSongs2) dmSongs2.innerHTML = buildTrack(SONGS, 4);
if (dmFans2)  dmFans2.innerHTML  = buildTrack(FANS,  3);


/* ════════════════════════════════════════
   5. INTERSECTION OBSERVER — SCROLL REVEAL
════════════════════════════════════════ */
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.sr').forEach(el => io.observe(el));


/* ════════════════════════════════════════
   6. DISCOGRAPHY — HORIZONTAL SCROLL
════════════════════════════════════════ */
const sectionDisco = document.getElementById('section-disco');
const discoTrack   = document.getElementById('disco-track');

function updateDisco() {
  if (!sectionDisco || !discoTrack) return;

  const rect   = sectionDisco.getBoundingClientRect();
  const totalH = sectionDisco.offsetHeight - window.innerHeight;
  if (totalH <= 0) return;

  const progress = clamp(-rect.top / totalH, 0, 1);
  const eased    = easeOut(progress);

  const trackW   = discoTrack.scrollWidth;
  const viewW    = window.innerWidth;
  const maxShift = Math.max(0, trackW - viewW + 128);

  discoTrack.style.transform = `translateX(${-eased * maxShift}px)`;
}

updateDisco();


/* ════════════════════════════════════════
   7. HTML5 AUDIO — LOCAL PREVIEW PLAYBACK
   Uses 30s Apple-provided previews shipped with the site.
   Fully offline-capable, no external calls.
════════════════════════════════════════ */

/* Build playlist: each track maps to /audio/NN.m4a by its 1-based index */
const trackEls = Array.from(document.querySelectorAll('.track'));
const PLAYLIST = trackEls.map((_, i) => `audio/${String(i + 1).padStart(2, '0')}.m4a`);

/* Single persistent <audio> element, reused for all tracks */
const audio = new Audio();
audio.preload = 'auto';
audio.volume  = 0.85;

let currentTrackIdx = -1;
let heroMode = false; /* true when playback was triggered from hero btn */

/* Pre-cue the first track so first play is instant */
if (PLAYLIST.length > 0) {
  audio.src = PLAYLIST[0];
}

/* Auto-advance when a preview finishes */
audio.addEventListener('ended', () => {
  if (heroMode) {
    playRandomTrack();
  } else {
    const nextIdx = currentTrackIdx + 1;
    if (nextIdx < PLAYLIST.length) {
      playTrackByIndex(nextIdx);
    } else {
      stopAllPlayback();
    }
  }
});

/* If the audio file fails to load, silently clear UI state */
audio.addEventListener('error', () => {
  document.querySelectorAll('.track').forEach(tr => tr.classList.remove('playing'));
  document.getElementById('music-btn')?.classList.remove('mb-playing');
});

function playTrackByIndex(idx) {
  if (idx < 0 || idx >= PLAYLIST.length) return;
  currentTrackIdx = idx;

  if (audio.src.indexOf(PLAYLIST[idx]) === -1) {
    audio.src = PLAYLIST[idx];
  }
  const p = audio.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});

  document.querySelectorAll('.track').forEach((tr, i) => {
    tr.classList.toggle('playing', i === idx);
  });
  document.getElementById('music-btn')?.classList.add('mb-playing');
}

function playRandomTrack() {
  const idx = Math.floor(Math.random() * PLAYLIST.length);
  playTrackByIndex(idx);
}

function stopAllPlayback() {
  audio.pause();
  audio.currentTime = 0;
  currentTrackIdx = -1;
  heroMode = false;
  document.querySelectorAll('.track').forEach(tr => tr.classList.remove('playing'));
  document.getElementById('music-btn')?.classList.remove('mb-playing');
}

function toggleTrack(idx) {
  if (currentTrackIdx === idx) {
    if (!audio.paused) {
      audio.pause();
      document.querySelectorAll('.track')[idx]?.classList.remove('playing');
      document.getElementById('music-btn')?.classList.remove('mb-playing');
    } else {
      const p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
      document.querySelectorAll('.track')[idx]?.classList.add('playing');
      document.getElementById('music-btn')?.classList.add('mb-playing');
    }
  } else {
    heroMode = false;
    playTrackByIndex(idx);
  }
}

/* Track play buttons */
document.querySelectorAll('.track').forEach((tr, idx) => {
  const btn = tr.querySelector('.track-play');
  if (btn) {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleTrack(idx);
    });
  }
});


/* ════════════════════════════════════════
   8. HERO MUSIC BUTTON
════════════════════════════════════════ */
const heroMusicBtn = document.getElementById('music-btn');
if (heroMusicBtn) {
  heroMusicBtn.addEventListener('click', () => {
    if (heroMusicBtn.classList.contains('mb-playing')) {
      stopAllPlayback();
    } else {
      heroMode = true;
      playRandomTrack();
    }
  });
}


/* ════════════════════════════════════════
   9. DEFAULT LANGUAGE — KOREAN
════════════════════════════════════════ */
applyLang('KO');
