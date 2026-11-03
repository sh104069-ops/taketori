'use strict';
/* =========================================================
   竹取物語を よもう（特別支援学校 中学部 国語1段階）
   ・GitHub Pages で動作（index.html / style.css / script.js）
   ・ふりがな記法： 漢字{よみ}  例）竹{たけ}
   ・学習記録は端末のブラウザ（localStorage）に保存
   ========================================================= */

/* ---------- 共通ユーティリティ ---------- */
const $ = (s) => document.querySelector(s);
const KANJI_RE = /([\u3005\u4E00-\u9FFF]+)\{([^}]+)\}/g;
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function rb(s) { return esc(s).replace(KANJI_RE, '<ruby>$1<rt>$2</rt></ruby>'); }
function plain(s) { return String(s == null ? '' : s).replace(KANJI_RE, '$1'); }
function yomi(s) { return String(s == null ? '' : s).replace(KANJI_RE, '$2'); }
function toHira(s) { return s.replace(/[\u30a1-\u30f6]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60)); }
function norm(s) { return toHira(String(s)).replace(/[\s\u3000、。!！?？・…「」]/g, ''); }
function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function today() { const d = new Date(); return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`; }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

/* ---------- 教材データ ---------- */
const UNIT_TITLE = '竹取物語（かぐや姫）を読もう';

const FEEL_CHIPS = ['うれしい', 'たのしい', 'かなしい', 'さびしい', 'びっくり', 'こわい', 'ふしぎ', 'くやしい', 'こまった', 'あんしん', 'すごい', 'かわいそう'];
const FEEL_KEYS = ['うれし', '嬉', 'たのし', '楽し', 'かなし', '悲', 'さびし', '寂', 'びっくり', 'おどろ', '驚', 'こわ', '怖', 'ふしぎ', '不思議', 'くやし', '悔', 'こま', '困', 'あんしん', '安心', 'すご', 'かわいそう', 'いや', '嫌', 'すき', '好', 'きらい', 'どきどき', 'わくわく', 'おもしろ', '面白', 'かっこい', 'きれい', 'やさし', '優', 'ありがと', 'ざんねん', '残念', 'しんぱい', '心配', 'つら', 'おこ', '怒', 'はら', 'いいな', 'よかった'];
const SENT_CHIPS = ['わたしは', 'ぼくは', 'が すきです。', 'を しました。', 'に 行{い}きました。'];
const SELF_FOLLOW = [
  'どうして そう おもったのかな？「〜から」を つかって おしえてね。',
  '下{した}の ことばを つかっても いいよ。'
];

const LESSONS = [
  {
    id: 1,
    title: 'ひかる 竹{たけ}と 小{ちい}さな 女{おんな}の子{こ}',
    goal: 'おはなしに 出{で}て くる 人{ひと}と、はじまりの 場面{ばめん}を しろう。',
    story: [
      'むかし むかし、竹{たけ}を とって くらす おじいさんが いました。なまえを「竹取{たけとり}の 翁{おきな}」と いいました。',
      'ある日{ひ}、おじいさんが 山{やま}へ 行{い}くと、ねもとが ぴかぴか 光{ひか}る 竹{たけ}が ありました。',
      'ふしぎに 思{おも}って 竹{たけ}を 切{き}って みると、中{なか}に 小{ちい}さな 小{ちい}さな 女{おんな}の子{こ}が すわって いました。',
      'おじいさんは 女{おんな}の子{こ}を 家{いえ}に つれて かえり、おばあさんと いっしょに たいせつに そだてました。'
    ],
    questions: [
      { type: 'choice', q: 'おじいさんの しごとは なんですか。', options: ['竹{たけ}を とって くらす', '魚{さかな}を とって くらす', 'お米{こめ}を つくって くらす'], answer: 0, hint: '1ばんめの 文{ぶん}を よみかえして みよう。', explain: 'おじいさんは 竹{たけ}を とって くらして いました。' },
      { type: 'choice', label: 'ことばの いみ', q: '「翁{おきな}」は どんな いみの ことばですか。', options: ['おじいさん', 'こども', 'おとのさま'], answer: 0, explain: '「翁{おきな}」は おじいさんの ことです。' },
      { type: 'tap', label: 'ぬきだそう', q: '竹{たけ}の ねもとは どう なって いましたか。ようすを あらわす ことばを 2つ えらぼう。', tokens: ['ねもとが', 'ぴかぴか', '光{ひか}る', '竹{たけ}が', 'ありました。'], answer: [1, 2], hint: '「どんな ようす」か を あらわす ことばを さがそう。', explain: '竹{たけ}の ねもとが「ぴかぴか 光{ひか}る」ようすでした。' },
      { type: 'choice', q: '竹{たけ}の 中{なか}に いたのは だれですか。', options: ['小{ちい}さな 女{おんな}の子{こ}', '小{ちい}さな 男{おとこ}の子{こ}', '小{ちい}さな うさぎ'], answer: 0, explain: '竹{たけ}の 中{なか}には 小{ちい}さな 女{おんな}の子{こ}が いました。' },
      { type: 'choice', label: '漢字{かんじ}', q: '「竹」の よみかたは どれですか。', options: ['たけ', 'はな', 'いし'], answer: 0, explain: '「竹」は「たけ」と よみます。' },
      { type: 'open', kind: 'feeling', q: '竹{たけ}の 中{なか}に 女{おんな}の子{こ}を 見{み}つけた とき、おじいさんは どんな 気{き}もち だったと おもいますか。',
        accept: ['びっくり', 'おどろ', '驚', 'うれし', '嬉', 'ふしぎ', '不思議', 'かわい', '可愛', 'よろこ', '喜', 'すご', 'どきどき', 'わくわく', 'こわ', 'たのし', 'あんしん', 'しあわせ', '幸'],
        askReason: true,
        follow: ['竹{たけ}を 切{き}ったら、中{なか}に 小{ちい}さな 女{おんな}の子{こ}が いたんだよ。あなたなら どう おもうかな？', '下{した}の ことばから、おじいさんの 気{き}もちに ちかい ものを えらんでも いいよ。'],
        chips: ['びっくり', 'うれしい', 'ふしぎ', 'かわいい'],
        model: 'びっくりしたけど、かわいくて うれしかった。' },
      { type: 'open', kind: 'self', q: 'あなたが おじいさん だったら、女{おんな}の子{こ}を 見{み}つけて どう しますか。', askReason: true,
        model: '家{いえ}に つれて かえって、たいせつに そだてる。' }
    ]
  },
  {
    id: 2,
    title: 'すくすく そだつ かぐや姫{ひめ}',
    goal: 'できごとの じゅんばんを たしかめよう。',
    story: [
      '女{おんな}の子{こ}を 見{み}つけてから、おじいさんが 竹{たけ}を 切{き}ると、竹{たけ}の 中{なか}から 金{きん}が 出{で}て くるように なりました。おじいさんの 家{いえ}は お金{かね}もちに なりました。',
      '女{おんな}の子{こ}は どんどん 大{おお}きく なり、三{みっ}か月{げつ}で 大人{おとな}に なりました。',
      'とても 美{うつく}しく、家{いえ}の 中{なか}が 明{あか}るく 光{ひか}る ほど でした。',
      '女{おんな}の子{こ}は「かぐや姫{ひめ}」と 名{な}づけられました。'
    ],
    questions: [
      { type: 'choice', q: '女{おんな}の子{こ}を 見{み}つけてから、竹{たけ}の 中{なか}から なにが 出{で}て きましたか。', options: ['金{きん}', '水{みず}', '花{はな}'], answer: 0, explain: '竹{たけ}の 中{なか}から 金{きん}が 出{で}て きました。' },
      { type: 'choice', q: '女{おんな}の子{こ}は どのくらいで 大人{おとな}に なりましたか。', options: ['三{みっ}か月{げつ}', '三{さん}年{ねん}', '三{みっ}日{か}'], answer: 0, explain: 'たった 三{みっ}か月{げつ}で 大人{おとな}に なりました。' },
      { type: 'choice', label: 'ことばの いみ', q: '「美{うつく}しい」は どんな いみですか。', options: ['とても きれい', 'とても こわい', 'とても ちいさい'], answer: 0, explain: '「美{うつく}しい」は「とても きれい」と いう いみです。' },
      { type: 'choice', label: '漢字{かんじ}', q: '「光る」の よみかたは どれですか。', options: ['ひかる', 'みえる', 'あかる'], answer: 0, explain: '「光る」は「ひかる」と よみます。' },
      { type: 'choice', label: '漢字{かんじ}', q: '「つき」を 漢字{かんじ}で かくと どれですか。', options: ['月', '日', '目'], answer: 0, explain: '「つき」は「月」と かきます。' },
      { type: 'order', label: 'じゅんばん', q: 'おはなしの じゅんばんに ならべよう。', items: ['光{ひか}る 竹{たけ}を 見{み}つけた', '女{おんな}の子{こ}を 家{いえ}に つれて かえった', '竹{たけ}から 金{きん}が 出{で}て きた', '三{みっ}か月{げつ}で 大人{おとな}に なった'], explain: '光{ひか}る 竹{たけ}→ つれて かえる → 金{きん}が 出{で}る → 大人{おとな}に なる の じゅんばんです。' },
      { type: 'open', kind: 'self', q: '「かぐや姫{ひめ}」と いう なまえを きいて、どんな かんじが しますか。', askReason: true, model: '光{ひか}って いて きれいな かんじ。' }
    ]
  },
  {
    id: 3,
    title: '主語{しゅご}と 述語{じゅつご}を 見{み}つけよう',
    goal: '「だれが」と「どうする」を 見{み}つけよう。',
    learn: [
      '<b class="tag t-sub">主語{しゅご}</b> … 「だれが（は）」「なにが（は）」に あたる ことば',
      '<b class="tag t-pre">述語{じゅつご}</b> … 「どうする」「どんなだ」「なんだ」に あたる ことば。文{ぶん}の さいごに ある ことが おおいよ。',
      'れい：<span class="u-sub">おじいさんが</span> 竹{たけ}を <span class="u-pre">切{き}りました。</span>'
    ],
    story: [
      'おじいさんが 竹{たけ}を 切{き}りました。',
      '竹{たけ}が ぴかぴか 光{ひか}りました。',
      'かぐや姫{ひめ}は とても 美{うつく}しい。',
      'おばあさんが 女{おんな}の子{こ}を そだてました。'
    ],
    questions: [
      { type: 'tap', label: '主語{しゅご}を さがそう', q: '「だれが」に あたる ことば（主語{しゅご}）を えらぼう。', tokens: ['おじいさんが', '竹{たけ}を', '切{き}りました。'], answer: [0], hint: '「だれが」切{き}ったのかな？', explain: '切{き}ったのは「おじいさんが」です。' },
      { type: 'tap', label: '述語{じゅつご}を さがそう', q: '「どうした」に あたる ことば（述語{じゅつご}）を えらぼう。', tokens: ['おじいさんが', '竹{たけ}を', '切{き}りました。'], answer: [2], hint: '文{ぶん}の さいごを 見{み}て みよう。', explain: '「切{き}りました」が 述語{じゅつご}です。' },
      { type: 'tap', label: '主語{しゅご}を さがそう', q: '「なにが」に あたる ことば（主語{しゅご}）を えらぼう。', tokens: ['竹{たけ}が', 'ぴかぴか', '光{ひか}りました。'], answer: [0], hint: '光{ひか}ったのは なにかな？', explain: '光{ひか}ったのは「竹{たけ}が」です。' },
      { type: 'tap', label: '述語{じゅつご}を さがそう', q: '「どんなだ」に あたる ことば（述語{じゅつご}）を えらぼう。', tokens: ['かぐや姫{ひめ}は', 'とても', '美{うつく}しい。'], answer: [2], hint: 'かぐや姫{ひめ}は「どんなだ」と いって いるかな？', explain: '「美{うつく}しい」が 述語{じゅつご}です。' },
      { type: 'choice', q: '「おばあさんが 女{おんな}の子{こ}を そだてました。」の 主語{しゅご}は どれですか。', options: ['おばあさんが', '女{おんな}の子{こ}を', 'そだてました'], answer: 0, explain: '「だれが」そだてたのか…「おばあさんが」です。' },
      { type: 'order', mode: 'sentence', label: '文{ぶん}を つくろう', q: 'ことばを ならべて 文{ぶん}を つくろう。（だれが → どのように → どうした）', items: ['かぐや姫{ひめ}が', 'にっこり', 'わらいました。'], explain: '「かぐや姫{ひめ}が にっこり わらいました。」' },
      { type: 'open', kind: 'sentence', q: '「だれが（は）」と「どうする」を つかって、じぶんの ことを 文{ぶん}に かこう。',
        follow: ['「わたしは」や「ぼくは」から はじめて みよう。れい：「わたしは 本{ほん}を よみます。」', '下{した}の ことばを つかっても いいよ。'],
        model: 'ぼくは きのう 竹{たけ}を 見{み}ました。' }
    ]
  },
  {
    id: 4,
    title: '五人{ごにん}の けっこんの もうしこみ',
    goal: 'かぐや姫{ひめ}の いった ことばと 気{き}もちを かんがえよう。',
    story: [
      'かぐや姫{ひめ}の うわさが ひろがり、たくさんの 男{おとこ}の人{ひと}が 会{あ}いに きました。',
      'とくに 熱心{ねっしん}な 五人{ごにん}が「けっこん して ください」と いいました。',
      'かぐや姫{ひめ}は「わたしが いう ものを もって きた 人{ひと}と けっこん します」と いいました。',
      'それは、ほとけの 石{いし}の はち、ほうらいの 玉{たま}の 枝{えだ}、火{ひ}ねずみの かわごろも、りゅうの くびの 玉{たま}、つばめの こやすがい でした。どれも 見{み}つけるのが とても むずかしい ものでした。'
    ],
    questions: [
      { type: 'choice', q: 'けっこんを もうしこんだのは 何人{なんにん}ですか。', options: ['五人{ごにん}', '三人{さんにん}', '十人{じゅうにん}'], answer: 0, explain: '熱心{ねっしん}な 五人{ごにん}が もうしこみました。' },
      { type: 'tap', label: 'ぬきだそう', q: 'かぐや姫{ひめ}は なんと いいましたか。かぐや姫{ひめ}の ことばを ぜんぶ えらぼう。', tokens: ['かぐや姫{ひめ}は', '「わたしが いう ものを', 'もって きた 人{ひと}と', 'けっこん します」と', 'いいました。'], answer: [1, 2, 3], hint: '「 」の 中{なか}が かぐや姫{ひめ}の ことばだよ。', explain: '「わたしが いう ものを もって きた 人{ひと}と けっこん します」です。' },
      { type: 'choice', q: 'かぐや姫{ひめ}は どうして むずかしい ものを たのんだと おもいますか。', options: ['けっこん したく なかったから', 'ものが ほしかったから', 'おなかが すいたから'], answer: 0, hint: 'どれも 見{み}つけるのが とても むずかしい ものだったね。', explain: 'むずかしい ものを たのめば、けっこん しなくて すむからです。' },
      { type: 'choice', label: '漢字{かんじ}', q: '「石」の よみかたは どれですか。', options: ['いし', 'いわ', 'すな'], answer: 0, explain: '「石」は「いし」と よみます。' },
      { type: 'choice', label: 'ことばの いみ', q: '「熱心{ねっしん}」は どんな いみですか。', options: ['いっしょうけんめい', 'ねむそう', 'おこって いる'], answer: 0, explain: '「熱心{ねっしん}」は いっしょうけんめい と いう いみです。' },
      { type: 'open', kind: 'feeling', q: '五人{ごにん}に「けっこん して ください」と いわれた とき、かぐや姫{ひめ}は どんな 気{き}もち だったと おもいますか。',
        accept: ['こま', '困', 'いや', '嫌', 'したくな', 'まよ', '迷', 'なや', '悩', 'こわ', 'びっくり', 'おどろ', 'めんどう', 'たいへん', 'どうしよう', 'ことわ', '断', 'うれし', 'はずかし', 'つら'],
        askReason: true,
        follow: ['かぐや姫{ひめ}は、ほんとうに けっこん したかったのかな？ ヒント：とても むずかしい ものを たのんだね。', '下{した}の ことばから えらんでも いいよ。'],
        chips: ['こまった', 'いやだな', 'どうしよう', 'まよう'],
        model: 'こまった。けっこん したく なかったから。' }
    ]
  },
  {
    id: 5,
    title: 'しっぱいした 五人{ごにん}と くわしく する ことば',
    goal: 'ことばを くわしく する「修飾語{しゅうしょくご}」を 見{み}つけよう。',
    learn: [
      '<b class="tag t-mod">修飾語{しゅうしょくご}</b> … ほかの ことばを くわしく する ことば（どんな・どのように・いつ・どこで）',
      'れい：<span class="u-mod">小{ちい}さな</span> 女{おんな}の子{こ} ／ <span class="u-mod">ぴかぴか</span> 光{ひか}る'
    ],
    story: [
      '五人{ごにん}は がんばりましたが、だれも ほんものを もって こられませんでした。',
      'ある 人{ひと}は、にせものの はちを もって きました。',
      'ある 人{ひと}は、職人{しょくにん}に にせものの 玉{たま}の 枝{えだ}を 作{つく}らせました。',
      'つばめの こやすがいを とろうと した 男{おとこ}の人{ひと}は、高{たか}い ところから おちて しまいました。',
      'けっきょく、かぐや姫{ひめ}は だれとも けっこん しませんでした。'
    ],
    questions: [
      { type: 'choice', q: '五人{ごにん}は ほんものを もって こられましたか。', options: ['だれも もって こられなかった', 'ひとりだけ もって きた', 'みんな もって きた'], answer: 0, explain: 'だれも ほんものを もって こられませんでした。' },
      { type: 'choice', q: 'かぐや姫{ひめ}は さいごに どう しましたか。', options: ['だれとも けっこん しなかった', 'ひとりと けっこん した', '月{つき}へ かえった'], answer: 0, explain: 'だれとも けっこん しませんでした。' },
      { type: 'tap', label: '修飾語{しゅうしょくご}を さがそう', q: '「女{おんな}の子{こ}」を くわしく して いる ことばを えらぼう。', tokens: ['小{ちい}さな', '女{おんな}の子{こ}が', 'すわって いました。'], answer: [0], hint: '「どんな」女{おんな}の子{こ}かな？', explain: '「小{ちい}さな」が 女{おんな}の子{こ}を くわしく して います。' },
      { type: 'tap', label: '修飾語{しゅうしょくご}を さがそう', q: '「ところ」を くわしく して いる ことばを えらぼう。', tokens: ['男{おとこ}の人{ひと}は', '高{たか}い', 'ところから', 'おちました。'], answer: [1], hint: '「どんな」ところかな？', explain: '「高{たか}い」が「ところ」を くわしく して います。' },
      { type: 'choice', q: '「竹{たけ}が ぴかぴか 光{ひか}る。」 「ぴかぴか」は どの ことばを くわしく して いますか。', options: ['光{ひか}る', '竹{たけ}が'], answer: 0, explain: '「どのように」光{ひか}るか → 「ぴかぴか」です。' },
      { type: 'order', mode: 'sentence', label: '文{ぶん}を つくろう', q: 'ことばを ならべて 文{ぶん}を つくろう。（くわしく する ことば → もの → どうした）', items: ['にせものの', '玉{たま}の 枝{えだ}を', 'もって きました。'], explain: '「にせものの 玉{たま}の 枝{えだ}を もって きました。」' },
      { type: 'open', kind: 'self', q: '五人{ごにん}の 男{おとこ}の人{ひと}に ひとこと いうと したら、なんと いいますか。', askReason: true, model: 'にせものは だめだよ。しょうじきが いちばん。' }
    ]
  },
  {
    id: 6,
    title: '帝{みかど}との 出会{であ}い',
    goal: '帝{みかど}と かぐや姫{ひめ}の ことばから 気{き}もちを かんがえよう。',
    story: [
      'かぐや姫{ひめ}の うわさは、国{くに}で いちばん えらい 帝{みかど}にも とどきました。',
      '帝{みかど}は かぐや姫{ひめ}に 会{あ}いに きました。',
      '帝{みかど}は「わたしの お城{しろ}に きて ほしい」と いいましたが、かぐや姫{ひめ}は「それは できません」と ことわりました。',
      'それからも 帝{みかど}と かぐや姫{ひめ}は 手紙{てがみ}を やりとりして、なかよく なりました。'
    ],
    questions: [
      { type: 'choice', label: 'ことばの いみ', q: '「帝{みかど}」は どんな 人{ひと}ですか。', options: ['国{くに}で いちばん えらい 人{ひと}', '竹{たけ}を とる 人{ひと}', '月{つき}の 人{ひと}'], answer: 0, explain: '帝{みかど}は 国{くに}で いちばん えらい 人{ひと}です。' },
      { type: 'tap', label: 'ぬきだそう', q: '帝{みかど}は なんと いいましたか。帝{みかど}の ことばを ぜんぶ えらぼう。', tokens: ['帝{みかど}は', '「わたしの お城{しろ}に', 'きて ほしい」と', 'いいました。'], answer: [1, 2], hint: '「 」の 中{なか}を さがそう。', explain: '「わたしの お城{しろ}に きて ほしい」です。' },
      { type: 'choice', label: 'ことばの いみ', q: '「ことわる」は どんな いみですか。', options: ['いやです と いう', 'ありがとう と いう', 'いっしょに あそぶ'], answer: 0, explain: '「ことわる」は「できません・いやです」と いう ことです。' },
      { type: 'choice', label: '漢字{かんじ}', q: '「手紙」の よみかたは どれですか。', options: ['てがみ', 'てかみ', 'しゅし'], answer: 0, explain: '「手紙」は「てがみ」と よみます。' },
      { type: 'choice', q: 'そのあと、帝{みかど}と かぐや姫{ひめ}は どう なりましたか。', options: ['手紙{てがみ}を やりとりして なかよく なった', 'けんかを した', 'もう 会{あ}わなかった'], answer: 0, explain: '手紙{てがみ}を やりとりして なかよく なりました。' },
      { type: 'open', kind: 'feeling', q: '帝{みかど}の さそいを ことわった とき、かぐや姫{ひめ}は どんな 気{き}もち だったと おもいますか。',
        accept: ['ごめん', 'もうしわけ', '申し訳', 'かなし', '悲', 'さびし', '寂', 'こま', '困', 'つら', 'ざんねん', '残念', 'いけな', 'いきたい', '行きたい', 'いや', 'ひみつ', 'まよ', '迷', 'なや', '悩', 'ほんとうは', 'しんぱい', 'うれし', 'はずかし'],
        askReason: true,
        follow: ['かぐや姫{ひめ}は 帝{みかど}の ことが きらい だったのかな？ ヒント：そのあと 手紙{てがみ}を やりとり したね。', '下{した}の ことばから えらんでも いいよ。'],
        chips: ['ごめんなさい', 'こまった', 'ざんねん', 'さびしい'],
        model: 'ごめんなさい。ほんとうは 行{い}けない わけが あったから。' }
    ]
  },
  {
    id: 7,
    title: '月{つき}を 見{み}て なく かぐや姫{ひめ}',
    goal: 'かぐや姫{ひめ}が ないた わけを 読{よ}みとろう。',
    story: [
      '三{さん}年{ねん}ほど たった 春{はる}ごろから、かぐや姫{ひめ}は 月{つき}を 見{み}ては かなしそうに するように なりました。',
      '八月{はちがつ}の 十五夜{じゅうごや}が ちかづくと、とうとう なきだして しまいました。',
      'おじいさんが わけを きくと、かぐや姫{ひめ}は いいました。',
      '「わたしは 月{つき}の 都{みやこ}の 人{ひと}です。十五夜{じゅうごや}に 月{つき}から むかえが きます。おじいさん、おばあさんと わかれるのが かなしいのです。」'
    ],
    questions: [
      { type: 'choice', q: 'かぐや姫{ひめ}は どこの 人{ひと}でしたか。', options: ['月{つき}の 都{みやこ}', '山{やま}の 村{むら}', '海{うみ}の 国{くに}'], answer: 0, explain: 'かぐや姫{ひめ}は 月{つき}の 都{みやこ}の 人{ひと}でした。' },
      { type: 'choice', q: 'むかえは いつ きますか。', options: ['八月{はちがつ}の 十五夜{じゅうごや}', 'お正月{しょうがつ}', '三{みっ}か月{げつ}ご'], answer: 0, explain: '八月{はちがつ}の 十五夜{じゅうごや}です。' },
      { type: 'tap', label: 'ぬきだそう', q: 'かぐや姫{ひめ}が ないて いた わけを ぬきだそう。（3つ えらぼう）', tokens: ['「わたしは', '月{つき}の 都{みやこ}の 人{ひと}です。', '十五夜{じゅうごや}に', '月{つき}から むかえが きます。', 'おじいさん、おばあさんと', 'わかれるのが', 'かなしいのです。」'], answer: [4, 5, 6], hint: '「かなしい」と いう ことばを さがそう。', explain: '「おじいさん、おばあさんと わかれるのが かなしい」から ないて いました。' },
      { type: 'choice', label: '漢字{かんじ}', q: '「月」の よみかたは どれですか。', options: ['つき', 'ひ', 'め'], answer: 0, explain: '「月」は「つき」と よみます。' },
      { type: 'choice', label: 'ことばの いみ', q: '「都{みやこ}」は どんな いみですか。', options: ['人{ひと}が たくさん すむ 大{おお}きな まち', '小{ちい}さな 山{やま}', 'ひろい 海{うみ}'], answer: 0, explain: '「都{みやこ}」は 大{おお}きな まちの ことです。' },
      { type: 'open', kind: 'feeling', q: 'かぐや姫{ひめ}の 話{はなし}を きいて、おじいさんは どんな 気{き}もちに なったと おもいますか。',
        accept: ['かなし', '悲', 'さびし', '寂', 'いや', '嫌', 'びっくり', 'おどろ', '驚', 'いかないで', '行かないで', 'はなれたくな', '離れたくな', 'つら', '辛', 'なき', '泣', 'しんぱい', '心配', 'こま', '困', 'まも', '守', 'ショック', 'しょっく', 'おこ'],
        askReason: true,
        follow: ['大{だい}じに そだてた かぐや姫{ひめ}が、月{つき}へ 行{い}って しまうんだよ。おじいさんは どう おもうかな？', '下{した}の ことばから えらんでも いいよ。'],
        chips: ['かなしい', 'さびしい', 'いかないで', 'びっくり'],
        model: 'かなしい。大{だい}じな かぐや姫{ひめ}と わかれたく ないから。' },
      { type: 'open', kind: 'self', q: '大{たい}せつな 人{ひと}と わかれる とき、あなたは どんな 気{き}もちに なりますか。', askReason: true, model: 'さびしい。いっしょに いると たのしいから。' }
    ]
  },
  {
    id: 8,
    title: '月{つき}からの むかえ',
    goal: '主語{しゅご}・述語{じゅつご}・修飾語{しゅうしょくご}を 見{み}わけよう。',
    learn: [
      '<b class="tag t-sub">主語{しゅご}</b> だれが・なにが　<b class="tag t-mod">修飾語{しゅうしょくご}</b> くわしく する　<b class="tag t-pre">述語{じゅつご}</b> どうする・どんなだ',
      'れい：<span class="u-sub">天人{てんにん}たちが</span> <span class="u-mod">ふわふわと</span> <span class="u-pre">おりて きました。</span>'
    ],
    story: [
      '帝{みかど}は かぐや姫{ひめ}を まもる ため、たくさんの 兵{へい}たいを おじいさんの 家{いえ}に おくりました。',
      '十五夜{じゅうごや}の 夜{よる}、空{そら}が ひるまのように 明{あか}るく なりました。',
      '月{つき}から 天人{てんにん}たちが ふわふわと おりて きました。',
      '兵{へい}たいたちは 力{ちから}が ぬけて、たたかう ことが できませんでした。'
    ],
    questions: [
      { type: 'choice', q: '帝{みかど}は かぐや姫{ひめ}を まもる ために なにを しましたか。', options: ['たくさんの 兵{へい}たいを おくった', '手紙{てがみ}を おくった', 'くすりを おくった'], answer: 0, explain: 'たくさんの 兵{へい}たいを おくりました。' },
      { type: 'tap', label: '主語{しゅご}を さがそう', q: '主語{しゅご}（だれが）を えらぼう。', tokens: ['天人{てんにん}たちが', 'ふわふわと', 'おりて きました。'], answer: [0], hint: '「だれが」おりて きたのかな？', explain: '「天人{てんにん}たちが」が 主語{しゅご}です。' },
      { type: 'tap', label: '修飾語{しゅうしょくご}を さがそう', q: '修飾語{しゅうしょくご}（どのように）を えらぼう。', tokens: ['天人{てんにん}たちが', 'ふわふわと', 'おりて きました。'], answer: [1], hint: '「どのように」おりて きたのかな？', explain: '「ふわふわと」が 修飾語{しゅうしょくご}です。' },
      { type: 'tap', label: '述語{じゅつご}を さがそう', q: '述語{じゅつご}（どうなった）を えらぼう。', tokens: ['空{そら}が', 'ひるまのように', '明{あか}るく なりました。'], answer: [2], hint: '文{ぶん}の さいごを 見{み}よう。', explain: '「明{あか}るく なりました」が 述語{じゅつご}です。' },
      { type: 'choice', q: '「兵{へい}たいたちは たたかう ことが できませんでした。」の 主語{しゅご}は どれですか。', options: ['兵{へい}たいたちは', 'たたかう', 'できませんでした'], answer: 0, explain: '「だれが」できなかったのか…「兵{へい}たいたちは」です。' },
      { type: 'order', mode: 'sentence', label: '文{ぶん}を つくろう', q: 'ことばを ならべて 文{ぶん}を つくろう。（修飾語{しゅうしょくご} → 主語{しゅご} → 述語{じゅつご}）', items: ['大{おお}きな', '月{つき}が', 'かがやきました。'], explain: '「大{おお}きな 月{つき}が かがやきました。」' },
      { type: 'open', kind: 'feeling', q: '天人{てんにん}が おりて きた とき、兵{へい}たいたちは どんな 気{き}もち だったと おもいますか。',
        accept: ['こわ', '怖', 'びっくり', 'おどろ', '驚', 'くやし', '悔', 'うごけ', '動け', 'ちから', '力', 'あせ', 'どうしよう', 'ふしぎ', 'まぶし', 'だめ', 'かなわな', 'にげ', '逃', 'ざんねん', 'こま', 'すご', 'きれい', 'なさけな'],
        askReason: true,
        follow: ['空{そら}が ひるまのように 明{あか}るく なって、力{ちから}が ぬけて しまったんだよ。兵{へい}たいたちは どう おもったかな？', '下{した}の ことばから えらんでも いいよ。'],
        chips: ['こわい', 'びっくり', 'くやしい', 'うごけない'],
        model: 'くやしい。かぐや姫{ひめ}を まもれなかったから。' }
    ]
  },
  {
    id: 9,
    title: 'かぐや姫{ひめ}との わかれ',
    goal: 'わかれの 場面{ばめん}の 気{き}もちを かんがえよう。',
    story: [
      'かぐや姫{ひめ}は、おじいさんと おばあさんに 手紙{てがみ}を かきました。帝{みかど}には 手紙{てがみ}と「ふしの くすり」を のこしました。',
      '天{てん}の はごろもを きると、かぐや姫{ひめ}は 人{ひと}の 心{こころ}を わすれて、月{つき}へ かえって いきました。',
      '帝{みかど}は「かぐや姫{ひめ}が いないなら、ふしの くすりは いらない」と いって、天{てん}に いちばん ちかい 山{やま}で くすりを もやさせました。',
      'その 山{やま}は「ふじの山{やま}」と よばれるように なったと いう ことです。'
    ],
    questions: [
      { type: 'choice', q: 'かぐや姫{ひめ}は 帝{みかど}に なにを のこしましたか。', options: ['手紙{てがみ}と ふしの くすり', '金{きん}', '玉{たま}の 枝{えだ}'], answer: 0, explain: '手紙{てがみ}と「ふしの くすり」を のこしました。' },
      { type: 'choice', q: '天{てん}の はごろもを きると、かぐや姫{ひめ}は どう なりましたか。', options: ['人{ひと}の 心{こころ}を わすれた', 'ねむって しまった', '小{ちい}さく なった'], answer: 0, explain: '人{ひと}の 心{こころ}を わすれて しまいました。' },
      { type: 'tap', label: 'ぬきだそう', q: '帝{みかど}は なんと いいましたか。帝{みかど}の ことばを ぜんぶ えらぼう。', tokens: ['帝{みかど}は', '「かぐや姫{ひめ}が いないなら、', 'ふしの くすりは いらない」と', 'いいました。'], answer: [1, 2], hint: '「 」の 中{なか}を さがそう。', explain: '「かぐや姫{ひめ}が いないなら、ふしの くすりは いらない」です。' },
      { type: 'choice', q: 'くすりを もやした 山{やま}は、なんと よばれる ように なりましたか。', options: ['ふじの山{やま}', 'たかおさん', 'あさまやま'], answer: 0, explain: '「ふじの山{やま}」です。山梨{やまなし}からも 見{み}える 富士山{ふじさん}だね。' },
      { type: 'choice', label: '漢字{かんじ}', q: '「心」の よみかたは どれですか。', options: ['こころ', 'あたま', 'からだ'], answer: 0, explain: '「心」は「こころ」と よみます。' },
      { type: 'open', kind: 'feeling', q: '月{つき}へ かえる とき、かぐや姫{ひめ}は どんな 気{き}もち だったと おもいますか。',
        accept: ['かなし', '悲', 'さびし', '寂', 'いや', '嫌', 'つら', 'かえりたくな', '帰りたくな', 'ありがと', 'わすれたくな', '忘れたくな', 'なき', 'なく', '泣', 'ごめん', 'ざんねん', 'はなれたくな', '離れたくな', 'げんきで', '元気で', 'しんぱい'],
        askReason: true,
        follow: ['かぐや姫{ひめ}は、おじいさん、おばあさんに 手紙{てがみ}を かいたね。どうして かいたのかな？', '下{した}の ことばから えらんでも いいよ。'],
        chips: ['かなしい', 'さびしい', 'ありがとう', 'かえりたくない'],
        model: 'さびしい。おじいさん、おばあさんと はなれたく ないから。' },
      { type: 'open', kind: 'self', q: 'ふじの山{やま}の おはなしを きいて、あなたは どう おもいましたか。', askReason: true, model: 'いつも 見{み}て いる 富士山{ふじさん}に こんな おはなしが あって びっくりした。' }
    ]
  },
  {
    id: 10,
    title: 'まとめ ― 竹取物語{たけとりものがたり}を ふりかえろう',
    goal: 'おはなしの じゅんばんを たしかめ、思{おも}った ことを つたえよう。',
    story: [
      '① 竹{たけ}の 中{なか}から 小{ちい}さな 女{おんな}の子{こ}が 見{み}つかり、かぐや姫{ひめ}と 名{な}づけられました。',
      '② 五人{ごにん}の 男{おとこ}の人{ひと}が けっこんを もうしこみましたが、だれも かぐや姫{ひめ}の たのんだ ものを もって こられませんでした。',
      '③ 帝{みかど}と かぐや姫{ひめ}は 手紙{てがみ}を やりとりして なかよく なりました。',
      '④ かぐや姫{ひめ}は 月{つき}を 見{み}て なき、じぶんは 月{つき}の 人{ひと}だと うちあけました。',
      '⑤ 十五夜{じゅうごや}に 月{つき}から むかえが きて、かぐや姫{ひめ}は 月{つき}へ かえって いきました。'
    ],
    questions: [
      { type: 'order', label: 'じゅんばん', q: 'おはなしの じゅんばんに ならべよう。', items: ['竹{たけ}の 中{なか}から 女{おんな}の子{こ}が 見{み}つかる', '五人{ごにん}の 男{おとこ}の人{ひと}が けっこんを もうしこむ', '帝{みかど}と 手紙{てがみ}を やりとりする', '月{つき}を 見{み}て かぐや姫{ひめ}が なく', '月{つき}から むかえが きて かえって いく'], explain: 'これで 竹取物語{たけとりものがたり}の ながれが わかったね。' },
      { type: 'choice', q: '竹取物語{たけとりものがたり}に 出{で}て こない 人{ひと}は だれですか。', options: ['うらしまたろう', '帝{みかど}', 'おじいさん'], answer: 0, explain: 'うらしまたろうは べつの おはなしの 人{ひと}です。' },
      { type: 'tap', label: '主語{しゅご}を さがそう', q: '主語{しゅご}（だれが）を えらぼう。', tokens: ['かぐや姫{ひめ}は', '月{つき}へ', 'かえりました。'], answer: [0], hint: '「だれが」かえったのかな？', explain: '「かぐや姫{ひめ}は」が 主語{しゅご}です。' },
      { type: 'tap', label: '修飾語{しゅうしょくご}を さがそう', q: '「女{おんな}の子{こ}」を くわしく して いる ことばを えらぼう。', tokens: ['おじいさんは', '小{ちい}さな', '女{おんな}の子{こ}を', 'そだてました。'], answer: [1], hint: '「どんな」女{おんな}の子{こ}かな？', explain: '「小{ちい}さな」が 修飾語{しゅうしょくご}です。' },
      { type: 'choice', label: '漢字{かんじ}', q: '「たけ」を 漢字{かんじ}で かくと どれですか。', options: ['竹', '木', '花'], answer: 0, explain: '「たけ」は「竹」と かきます。' },
      { type: 'open', kind: 'self', q: 'いちばん 心{こころ}に のこった 場面{ばめん}は どこですか。その わけも おしえてね。', askReason: true, model: '月{つき}へ かえる 場面{ばめん}。おじいさんが かわいそう だったから。' },
      { type: 'open', kind: 'self', q: 'かぐや姫{ひめ}に 手紙{てがみ}を かこう。つたえたい ことを かいてね。', askReason: false, model: 'かぐや姫{ひめ}へ。月{つき}でも げんきで いてね。' }
    ]
  }
];

const SELF_ITEMS = [
  ['understand', 'おはなしが わかった'],
  ['effort', 'もんだいを がんばった'],
  ['express', 'じぶんの 気{き}もちを つたえた']
];
const MARKS = [['◎', '😄', 'よく できた'], ['○', '🙂', 'できた'], ['△', '🤔', 'もうすこし']];
const TYPE_LABEL = { choice: 'えらぼう', tap: 'えらぼう', order: 'ならべよう', open: 'かんがえよう' };
const PRAISE = ['いいね！', 'すてきな 考{かんが}えだね！', 'よく かんがえたね！', 'なるほど！'];

/* ---------- 保存 ---------- */
const STORE_KEY = 'taketori-kokugo-v1';
function defaultStore() { return { students: {}, current: null, settings: { ruby: true, size: 'm', rate: 0.9 } }; }
function loadStore() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE_KEY));
    if (d && d.students) {
      const base = defaultStore();
      return { students: d.students, current: d.current || null, settings: Object.assign(base.settings, d.settings || {}) };
    }
  } catch (e) { /* 保存できない環境 */ }
  return defaultStore();
}
let store = loadStore();
function saveStore() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
  catch (e) { toast('ほぞん できませんでした（ブラウザの せってい を かくにん）'); }
}
function cur() { return store.students[store.current]; }

/* ---------- 画面の状態 ---------- */
const app = $('#app');
let S = null; // 学習中の状態

/* ---------- よみあげ ---------- */
let readQueue = null;
function say(text, onend) {
  if (!('speechSynthesis' in window)) { toast('この ブラウザは よみあげに たいおう していません'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(yomi(text).replace(/[①②③④⑤]/g, ''));
  u.lang = 'ja-JP';
  u.rate = Number(store.settings.rate) || 0.9;
  const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.indexOf('ja') === 0);
  if (v) u.voice = v;
  if (onend) u.onend = onend;
  speechSynthesis.speak(u);
}
function stopSpeak() {
  readQueue = null;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  document.querySelectorAll('.para.reading').forEach((p) => p.classList.remove('reading'));
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-say]');
  if (b) { e.preventDefault(); say(b.dataset.say); }
});

/* ---------- 共通UI ---------- */
function toast(msg) {
  const t = $('#toast');
  t.innerHTML = rb(msg);
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}
function openModal(html) { $('#modalBox').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); $('#modalBox').innerHTML = ''; }
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal(); });

function applySettings() {
  document.body.classList.toggle('no-ruby', !store.settings.ruby);
  document.body.classList.remove('size-s', 'size-m', 'size-l');
  document.body.classList.add('size-' + store.settings.size);
}
function updateBadge() {
  $('#studentBadge').textContent = store.current ? '👤 ' + store.current : '';
}
function lesson() { return LESSONS.find((l) => l.id === S.id); }
function confirmLeave() {
  if (S && S.step >= 1 && S.step <= 3) return confirm('とちゅうで やめますか？\n（この時間の きろくは のこりません）');
  return true;
}

$('#btnHome').onclick = () => { if (confirmLeave()) { S = null; renderHome(); } };
$('#btnRecord').onclick = () => { if (!store.current) { toast('さいしょに なまえを えらんでね'); return; } if (confirmLeave()) { S = null; renderRecords(); } };
$('#btnSettings').onclick = () => openSettings();

/* =========================================================
   ホーム／名前選択
   ========================================================= */
function renderHome() {
  stopSpeak(); updateBadge(); window.scrollTo(0, 0);
  if (!store.current || !store.students[store.current]) { renderStudentSelect(); return; }
  const st = cur();
  const doneCount = Object.keys(st.lessons).length;
  app.innerHTML = `
    <section class="card hero">
      <div class="moon" aria-hidden="true"></div>
      <div class="hero-text">
        <p class="unit-label">${rb('国語{こくご}　単元{たんげん}（全{ぜん}10時間{じかん}）')}</p>
        <h2>${rb('竹取物語{たけとりものがたり}（かぐや姫{ひめ}）を よもう')}</h2>
        <p>${rb('おわった 時間{じかん}：')}<b>${doneCount}</b> / 10</p>
        <div class="progress"><span style="width:${doneCount * 10}%"></span></div>
      </div>
    </section>
    <div class="lesson-grid">
      ${LESSONS.map((L) => {
        const r = st.lessons[L.id];
        return `<button class="lesson-tile ${r ? 'done' : ''}" data-id="${L.id}" type="button">
          <span class="lt-num">${rb(L.id + '時間目{じかんめ}')}</span>
          <span class="lt-title">${rb(L.title)}</span>
          <span class="lt-status">${r ? `✅ ${esc(r.date)}　${r.score}/${r.total}` : rb('まだ やって いない')}</span>
        </button>`;
      }).join('')}
    </div>
    <div class="center"><button class="btn ghost" id="changeStudent" type="button">👤 ${rb('なまえを かえる')}</button></div>`;
  app.querySelectorAll('.lesson-tile').forEach((b) => { b.onclick = () => startLesson(Number(b.dataset.id)); });
  $('#changeStudent').onclick = () => { store.current = null; saveStore(); renderHome(); };
}

function renderStudentSelect() {
  updateBadge();
  const names = Object.keys(store.students);
  app.innerHTML = `
    <section class="card center select-card">
      <div class="moon big" aria-hidden="true"></div>
      <h2>${rb('なまえを えらんでね')}</h2>
      ${names.length ? `<div class="student-list">${names.map((n) => `<button class="btn big student-btn" data-n="${esc(n)}" type="button">${esc(n)}</button>`).join('')}</div>` : ''}
      <p class="sub">${rb(names.length ? 'はじめての 人{ひと}は、なまえを かいてね。' : 'さいしょに なまえを かいてね。')}</p>
      <div class="new-student">
        <input id="newName" type="text" maxlength="20" placeholder="なまえ" autocomplete="off">
        <button id="addStudent" class="btn primary" type="button">はじめる</button>
      </div>
    </section>`;
  app.querySelectorAll('.student-btn').forEach((b) => { b.onclick = () => { store.current = b.dataset.n; saveStore(); renderHome(); }; });
  $('#addStudent').onclick = () => {
    const n = $('#newName').value.trim();
    if (!n) { toast('なまえを かいてね'); return; }
    if (!store.students[n]) store.students[n] = { lessons: {} };
    store.current = n; saveStore(); renderHome();
  };
}

/* =========================================================
   学習の流れ（めあて → よもう → もんだい → ふりかえり）
   ========================================================= */
const STEPS = ['めあて', 'よもう', 'もんだい', 'ふりかえり'];
function stepper(n) {
  return `<ol class="stepper">${STEPS.map((s, i) => `<li class="${i < n ? 'past' : ''} ${i === n ? 'now' : ''}"><span>${i + 1}</span>${s}</li>`).join('')}</ol>`;
}
function startLesson(id) {
  S = { id, step: 0, qIndex: 0, answers: [], self: {}, comment: '' };
  renderStep();
}
function renderStep() {
  stopSpeak(); window.scrollTo(0, 0);
  if (S.step === 0) renderGoal();
  else if (S.step === 1) renderRead();
  else if (S.step === 2) renderQuestion();
  else if (S.step === 3) renderReflect();
  else renderComplete();
}

function renderGoal() {
  const L = lesson();
  app.innerHTML = `${stepper(0)}
    <section class="card goal-card">
      <p class="lesson-no">${rb(L.id + '時間目{じかんめ}')}</p>
      <h2>${rb(L.title)}</h2>
      <div class="goal">
        <span class="goal-label">めあて</span>
        <p>${rb(L.goal)}</p>
        <button class="speak" data-say="${esc(L.goal)}" type="button" aria-label="よみあげ">🔊</button>
      </div>
      <button class="btn primary big" id="next" type="button">${rb('おはなしを よむ')} ▶</button>
    </section>`;
  $('#next').onclick = () => { S.step = 1; renderStep(); };
}

function storyHtml(L) {
  return `${L.learn ? `<div class="learn"><p class="learn-title">💡 ${rb('まなびの ポイント')}</p>${L.learn.map((x) => `<p>${learnRb(x)}</p>`).join('')}</div>` : ''}
    <div class="story-text">${L.story.map((p, i) => `<p class="para" data-i="${i}"><button class="speak sm" data-say="${esc(p)}" type="button" aria-label="よみあげ">🔊</button><span>${rb(p)}</span></p>`).join('')}</div>`;
}
// learn 内は HTML タグを含むので、タグ以外の部分だけふりがな変換
function learnRb(s) { return s.split(/(<[^>]+>)/).map((part) => (part.charAt(0) === '<' ? part : rb(part))).join(''); }

function renderRead() {
  const L = lesson();
  app.innerHTML = `${stepper(1)}
    <section class="card story">
      <h2>${rb(L.title)}</h2>
      <div class="story-tools">
        <button class="btn" id="readAll" type="button">🔊 ${rb('ぜんぶ よむ')}</button>
        <button class="btn ghost" id="stopRead" type="button">⏹ ${rb('とめる')}</button>
      </div>
      ${storyHtml(L)}
      <button class="btn primary big" id="next" type="button">${rb('もんだいに ちょうせん')} ▶</button>
    </section>`;
  $('#readAll').onclick = () => readAll(L.story);
  $('#stopRead').onclick = stopSpeak;
  $('#next').onclick = () => { S.step = 2; S.qIndex = 0; renderStep(); };
}
function readAll(paras) {
  stopSpeak();
  const token = {};
  readQueue = token;
  const go = (i) => {
    if (readQueue !== token) return;
    document.querySelectorAll('.para').forEach((p) => p.classList.toggle('reading', Number(p.dataset.i) === i));
    if (i >= paras.length) { stopSpeak(); return; }
    say(paras[i], () => go(i + 1));
  };
  go(0);
}

/* ---------- もんだい ---------- */
function renderQuestion() {
  const L = lesson();
  const q = L.questions[S.qIndex];
  S.qs = { tries: 0, done: false, sel: [], order: [] };
  const label = q.label || TYPE_LABEL[q.type];
  app.innerHTML = `${stepper(2)}
    <section class="card q-card">
      <div class="q-head">
        <span class="q-type t-${q.type}">${rb(label)}</span>
        <div class="dots">${L.questions.map((_, i) => `<i class="${i < S.qIndex ? 'past' : ''} ${i === S.qIndex ? 'now' : ''}"></i>`).join('')}</div>
        <button class="btn ghost small" id="peek" type="button">📖 ${rb('おはなし')}</button>
      </div>
      <p class="q-text"><span>${rb(q.q)}</span><button class="speak" data-say="${esc(q.q)}" type="button" aria-label="よみあげ">🔊</button></p>
      <div class="q-body" id="qBody"></div>
      <div class="q-feedback" id="qFb"></div>
      <div class="q-next" id="qNext"></div>
    </section>`;
  $('#peek').onclick = () => openModal(`<div class="modal-head"><h3>${rb(L.title)}</h3><button class="btn ghost small" data-close type="button">✕ ${rb('とじる')}</button></div>${storyHtml(L)}`);
  const body = $('#qBody');
  if (q.type === 'choice') renderChoice(q, body);
  else if (q.type === 'tap') renderTap(q, body);
  else if (q.type === 'order') renderOrder(q, body);
  else renderOpen(q, body);
}

function feedback(kind, html) {
  const fb = $('#qFb');
  fb.className = 'q-feedback ' + kind;
  fb.innerHTML = html;
}
// 選択・抜き出し・並べ替え共通の判定（2回までチャレンジ）
function judge(q, correct, responseText, revealHtml) {
  S.qs.tries++;
  if (correct) {
    feedback('good', `<p class="fb-title">⭕ ${S.qs.tries === 1 ? 'せいかい！' : 'できたね！'}</p><p>${rb(q.explain || '')}</p>`);
    finishQ(q, true, responseText);
    return 'done';
  }
  if (S.qs.tries < 2) {
    feedback('retry', `<p class="fb-title">🤔 おしい！ もういちど やって みよう。</p>${q.hint ? `<p>💡 ${rb(q.hint)}</p>` : ''}`);
    return 'retry';
  }
  feedback('bad', `<p class="fb-title">📝 こたえを たしかめよう</p>${revealHtml || ''}<p>${rb(q.explain || '')}</p>`);
  finishQ(q, false, responseText);
  return 'done';
}
function finishQ(q, ok, response, extra) {
  S.qs.done = true;
  S.answers[S.qIndex] = Object.assign({
    type: q.type,
    label: plain(q.label || TYPE_LABEL[q.type]),
    q: plain(q.q),
    ok,
    first: q.type === 'open' ? null : (ok && S.qs.tries === 1),
    response
  }, extra || {});
  const last = S.qIndex === lesson().questions.length - 1;
  $('#qNext').innerHTML = `<button class="btn primary big" id="goNext" type="button">${rb(last ? 'ふりかえりへ' : 'つぎの もんだい')} ▶</button>`;
  $('#goNext').onclick = () => {
    if (last) { S.step = 3; } else { S.qIndex++; }
    renderStep();
  };
  setTimeout(() => { const n = $('#goNext'); if (n) n.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
}

function renderChoice(q, body) {
  const order = shuffle(q.options.map((_, i) => i));
  body.innerHTML = `<div class="choices">${order.map((i) => `<button class="choice" data-i="${i}" type="button">${rb(q.options[i])}</button>`).join('')}</div>`;
  body.querySelectorAll('.choice').forEach((b) => {
    b.onclick = () => {
      if (S.qs.done || b.disabled) return;
      const i = Number(b.dataset.i);
      const ok = i === q.answer;
      b.classList.add(ok ? 'correct' : 'wrong');
      if (!ok) b.disabled = true;
      const r = judge(q, ok, plain(q.options[i]), `<p>${rb('こたえ：' + q.options[q.answer])}</p>`);
      if (r === 'done') {
        body.querySelectorAll('.choice').forEach((x) => { x.disabled = true; if (Number(x.dataset.i) === q.answer) x.classList.add('correct'); });
      }
    };
  });
}

function renderTap(q, body) {
  const multi = q.answer.length > 1;
  body.innerHTML = `<div class="tap-sentence">${q.tokens.map((t, i) => `<button class="token" data-i="${i}" type="button">${rb(t)}</button>`).join('')}</div>
    ${multi ? `<p class="sub">${rb('ことばを えらんで「けってい」を おそう。もう いちど おすと けせるよ。')}</p><div class="center"><button class="btn primary" id="decide" type="button">けってい</button></div>` : ''}`;
  const tokens = body.querySelectorAll('.token');
  const reveal = () => tokens.forEach((t) => { if (q.answer.includes(Number(t.dataset.i))) t.classList.add('correct'); t.disabled = true; });
  const respText = (arr) => arr.slice().sort((a, b) => a - b).map((i) => plain(q.tokens[i])).join(' ');
  const answerHtml = `<p>${rb('こたえ：' + q.answer.map((i) => q.tokens[i]).join(' '))}</p>`;
  tokens.forEach((t) => {
    t.onclick = () => {
      if (S.qs.done) return;
      const i = Number(t.dataset.i);
      if (!multi) {
        const ok = q.answer[0] === i;
        t.classList.add(ok ? 'correct' : 'wrong');
        if (!ok) t.disabled = true;
        if (judge(q, ok, plain(q.tokens[i]), answerHtml) === 'done') reveal();
      } else {
        const k = S.qs.sel.indexOf(i);
        if (k >= 0) S.qs.sel.splice(k, 1); else S.qs.sel.push(i);
        t.classList.toggle('selected', k < 0);
      }
    };
  });
  if (multi) {
    $('#decide').onclick = () => {
      if (S.qs.done) return;
      if (!S.qs.sel.length) { toast('ことばを えらんでね'); return; }
      const a = S.qs.sel.slice().sort((x, y) => x - y);
      const b = q.answer.slice().sort((x, y) => x - y);
      const ok = a.length === b.length && a.every((v, i) => v === b[i]);
      const resp = respText(S.qs.sel);
      const r = judge(q, ok, resp, answerHtml);
      if (r === 'retry') { S.qs.sel = []; tokens.forEach((t) => t.classList.remove('selected')); }
      else { tokens.forEach((t) => t.classList.remove('selected')); reveal(); $('#decide').disabled = true; }
    };
  }
}

function renderOrder(q, body) {
  const isSentence = q.mode === 'sentence';
  let pool = shuffle(q.items.map((_, i) => i));
  let guard = 0;
  while (pool.every((v, i) => v === i) && q.items.length > 1 && guard++ < 20) pool = shuffle(pool);
  S.qs.order = [];
  const draw = () => {
    const placed = S.qs.order;
    const rest = pool.filter((i) => !placed.includes(i));
    body.innerHTML = `
      <p class="sub">${rb(isSentence ? 'したの ことばを じゅんばんに タップしよう。' : 'したの カードを はじめから じゅんばんに タップしよう。')}</p>
      <div class="order-slots ${isSentence ? 'sentence' : 'list'}">
        ${placed.length ? placed.map((i, k) => `<button class="slot filled" data-k="${k}" type="button">${isSentence ? '' : `<b>${k + 1}</b>`}${rb(q.items[i])}</button>`).join('') : `<span class="placeholder">${rb('ここに ならぶよ')}</span>`}
      </div>
      <div class="order-pool">${rest.map((i) => `<button class="card-item" data-i="${i}" type="button">${rb(q.items[i])}</button>`).join('')}</div>
      <div class="center">
        <button class="btn ghost" id="resetOrder" type="button">↺ ${rb('やりなおす')}</button>
        <button class="btn primary" id="decide" type="button" ${placed.length === q.items.length && !S.qs.done ? '' : 'disabled'}>けってい</button>
      </div>`;
    if (S.qs.done) { body.querySelectorAll('button').forEach((b) => { b.disabled = true; }); return; }
    body.querySelectorAll('.card-item').forEach((b) => { b.onclick = () => { S.qs.order.push(Number(b.dataset.i)); draw(); }; });
    body.querySelectorAll('.slot').forEach((b) => { b.onclick = () => { S.qs.order.splice(Number(b.dataset.k), 1); draw(); }; });
    $('#resetOrder').onclick = () => { S.qs.order = []; draw(); };
    $('#decide').onclick = () => {
      const ok = S.qs.order.every((v, i) => v === i);
      const resp = S.qs.order.map((i) => plain(q.items[i])).join(isSentence ? ' ' : ' → ');
      const correctHtml = isSentence
        ? `<p>${rb('こたえ：' + q.items.join(' '))}</p>`
        : `<ol class="answer-list">${q.items.map((x) => `<li>${rb(x)}</li>`).join('')}</ol>`;
      const r = judge(q, ok, resp, correctHtml);
      if (r === 'retry') { S.qs.order = []; }
      draw();
    };
  };
  draw();
}

/* ---------- 記述（問答） ---------- */
function bot(markup) {
  S.qs.dialog.push({ who: 'bot', text: plain(markup) });
  const c = $('#chat');
  c.insertAdjacentHTML('beforeend', `<div class="bubble bot"><span class="avatar">👴</span><div class="msg"><span class="who">${rb('おきな')}</span>${rb(markup)}<button class="speak sm" data-say="${esc(markup)}" type="button" aria-label="よみあげ">🔊</button></div></div>`);
  c.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function me(text) {
  S.qs.dialog.push({ who: 'me', text });
  $('#chat').insertAdjacentHTML('beforeend', `<div class="bubble me"><div class="msg">${esc(text)}</div><span class="avatar">🙂</span></div>`);
}
function renderOpen(q, body) {
  Object.assign(S.qs, { dialog: [], texts: [], round: 0, stage: 'main' });
  const chips = q.chips || (q.kind === 'sentence' ? SENT_CHIPS : FEEL_CHIPS);
  body.innerHTML = `
    <div class="chat" id="chat"></div>
    <div class="chips hidden" id="chips">
      <p class="sub">${rb('ことばを おすと こたえに 入{はい}るよ')}</p>
      ${chips.map((c) => `<button class="chip" data-c="${esc(c)}" type="button">${rb(c)}</button>`).join('')}
    </div>
    <div class="answer-row" id="answerRow">
      <textarea id="ans" rows="3" placeholder="ここに こたえを かこう（🎤 こえで 入力{にゅうりょく}しても いいよ）"></textarea>
      <div class="answer-btns">
        <button class="btn ghost small" id="showChips" type="button">💡 ${rb('ことばの ヒント')}</button>
        <button class="btn primary" id="send" type="button">こたえる</button>
      </div>
    </div>`;
  $('#ans').placeholder = 'ここに こたえを かこう（こえで 入力しても いいよ）';
  bot(q.q);
  body.querySelectorAll('.chip').forEach((b) => {
    b.onclick = () => { const a = $('#ans'); a.value = (a.value + plain(b.dataset.c)).trim(); a.focus(); };
  });
  $('#showChips').onclick = () => $('#chips').classList.remove('hidden');
  $('#send').onclick = () => {
    const a = $('#ans');
    const v = a.value.trim();
    if (!v) { toast('こたえを かいてね'); return; }
    a.value = '';
    handleOpen(q, v);
  };
}

function handleOpen(q, text) {
  const qs = S.qs;
  me(text);
  qs.texts.push(text);
  const t = norm(text);
  const dontKnow = t.length < 2 || /わから|わかんな|しらな|知らな|^\?+$|^？+$/.test(t);
  const hasReason = /から|ので|ため|だって/.test(t);

  // 「どうして？」への こたえ
  if (qs.stage === 'reason') {
    if (!dontKnow && (t.length >= 4 || hasReason)) { acceptOpen(q, true, 'reason'); return; }
    qs.stage = 'reason2';
    bot('ゆっくりで いいよ。「〜だから」と みじかく おしえてね。');
    return;
  }
  if (qs.stage === 'reason2') { acceptOpen(q, true, 'reason'); return; }

  let hit = false;
  if (!dontKnow) {
    if (q.kind === 'feeling') hit = q.accept.some((k) => t.includes(norm(k)));
    else if (q.kind === 'sentence') hit = /[はが]/.test(t) && t.length >= 5;
    else hit = t.length >= 5 || FEEL_KEYS.some((k) => t.includes(norm(k))); // self：じぶんの 考え
  }

  if (hit) {
    if (q.askReason && !hasReason) {
      qs.stage = 'reason';
      const p = q.kind === 'feeling' ? `${pick(PRAISE)} どうして そう おもったの？ おはなしの どこから わかったかな？「〜から」を つかって おしえてね。`
                                     : `${pick(PRAISE)} どうして そう おもったの？「〜から」を つかって おしえてね。`;
      bot(p);
      return;
    }
    acceptOpen(q, true, 'main');
    return;
  }

  qs.round++;
  const follow = q.follow || SELF_FOLLOW;
  if (qs.round === 1) {
    const lead = dontKnow ? 'だいじょうぶ。いっしょに かんがえよう。'
      : (q.kind === 'sentence' ? '「だれが（は）」が 入{はい}って いるかな？ もうすこし ふやして みよう。' : 'うーん、もうすこし かんがえて みよう。');
    bot(lead + ' ' + follow[0]);
    if (dontKnow) $('#chips').classList.remove('hidden');
  } else if (qs.round === 2) {
    bot(follow[1] || '下{した}の ことばから えらんでも いいよ。');
    $('#chips').classList.remove('hidden');
  } else {
    acceptOpen(q, false, 'model');
  }
}
function acceptOpen(q, good, via) {
  const qs = S.qs;
  let msg;
  if (!good) {
    msg = `よく がんばったね。こんな 考{かんが}えも あるよ：「${q.model}」 あとで 先生{せんせい}と いっしょに たしかめよう。`;
  } else if (q.kind === 'feeling') {
    msg = via === 'reason' ? `${pick(PRAISE)} わけも つたえられたね。おはなしを よく 読{よ}んで いるね。` : `${pick(PRAISE)} 気{き}もちが よく つたわったよ。`;
  } else if (q.kind === 'sentence') {
    msg = `${pick(PRAISE)}「だれが（は）」と「どうする」が ある 文{ぶん}が かけたね。`;
  } else {
    msg = via === 'reason' ? `${pick(PRAISE)} わけも いえたね。あなたの 気{き}もちが よく わかったよ。` : `${pick(PRAISE)} あなたの 考{かんが}えが つたわったよ。`;
  }
  bot(msg);
  $('#answerRow').classList.add('hidden');
  $('#chips').classList.add('hidden');
  feedback(good ? 'good' : 'retry', `<p class="fb-title">${good ? '🌟 こたえ られたね！' : '📝 先生{せんせい}と たしかめよう'}</p>`.replace(KANJI_RE, '<ruby>$1<rt>$2</rt></ruby>'));
  finishQ(q, true, qs.texts.join(' ／ '), { dialog: qs.dialog.slice(), needsCheck: !good, rounds: qs.texts.length });
}

/* ---------- ふりかえり ---------- */
function renderReflect() {
  const L = lesson();
  const closed = S.answers.filter((a) => a && a.type !== 'open');
  const score = closed.filter((a) => a.ok).length;
  app.innerHTML = `${stepper(3)}
    <section class="card reflect">
      <h2>${rb('きょうの ふりかえり')}</h2>
      <p class="score-line">${rb('もんだい')}：<b>${score}</b> / ${closed.length} ${rb('せいかい')}</p>
      ${SELF_ITEMS.map(([key, text]) => `
        <div class="self-row">
          <p>${rb(text)}</p>
          <div class="marks">${MARKS.map(([m, emo, cap]) => `<button class="mark ${S.self[key] === m ? 'on' : ''}" data-k="${key}" data-m="${m}" type="button"><span class="emo">${emo}</span><span>${m}</span><small>${rb(cap)}</small></button>`).join('')}</div>
        </div>`).join('')}
      <div class="comment-box">
        <p>${rb('きょう わかった こと・おもった こと')}</p>
        <textarea id="comment" rows="3" placeholder="かいてみよう">${esc(S.comment)}</textarea>
      </div>
      <button class="btn primary big" id="saveRec" type="button">📒 ${rb('きろく する')}</button>
    </section>`;
  app.querySelectorAll('.mark').forEach((b) => {
    b.onclick = () => {
      S.self[b.dataset.k] = b.dataset.m;
      app.querySelectorAll(`.mark[data-k="${b.dataset.k}"]`).forEach((x) => x.classList.toggle('on', x === b));
    };
  });
  $('#comment').oninput = (e) => { S.comment = e.target.value; };
  $('#saveRec').onclick = () => {
    if (SELF_ITEMS.some(([k]) => !S.self[k])) { toast('3つの ふりかえりを えらんでね'); return; }
    const st = cur();
    const prev = st.lessons[L.id];
    st.lessons[L.id] = {
      date: today(),
      score,
      total: closed.length,
      first: closed.filter((a) => a.first).length,
      answers: S.answers,
      self: Object.assign({}, S.self),
      comment: S.comment.trim(),
      teacher: prev ? prev.teacher || '' : '',
      attempts: prev ? (prev.attempts || 1) + 1 : 1
    };
    saveStore();
    S.step = 4; renderStep();
  };
}

function renderComplete() {
  const L = lesson();
  const r = cur().lessons[L.id];
  const nextL = LESSONS.find((x) => x.id === L.id + 1);
  app.innerHTML = `
    <section class="card center complete">
      <div class="moon big" aria-hidden="true"></div>
      <h2>${rb(L.id + '時間目{じかんめ} おわり！')}</h2>
      <p class="score-big">${r.score} / ${r.total}</p>
      <p>${rb('よく がんばったね。きろく しました。')}</p>
      <div class="btn-row">
        ${nextL ? `<button class="btn primary big" id="goNextL" type="button">${rb(nextL.id + '時間目{じかんめ}へ')} ▶</button>` : ''}
        <button class="btn" id="goRec" type="button">📒 ${rb('きろくを 見{み}る')}</button>
        <button class="btn" id="printThis" type="button">🖨 ${rb('この 時間{じかん}を 印刷{いんさつ}')}</button>
        <button class="btn ghost" id="goHome" type="button">🏠 ホーム</button>
      </div>
    </section>`;
  if (nextL) $('#goNextL').onclick = () => startLesson(nextL.id);
  $('#goRec').onclick = () => { S = null; renderRecords(); };
  $('#printThis').onclick = () => printRecords([L.id], false);
  $('#goHome').onclick = () => { S = null; renderHome(); };
}

/* =========================================================
   学習記録
   ========================================================= */
function selfText(s) { return s ? `${s.understand || '-'}${s.effort || '-'}${s.express || '-'}` : ''; }
function renderRecords() {
  stopSpeak(); updateBadge(); window.scrollTo(0, 0);
  const st = cur();
  const names = Object.keys(store.students);
  app.innerHTML = `
    <section class="card">
      <div class="rec-head">
        <h2>📒 ${rb('学習{がくしゅう}の きろく')}</h2>
        ${names.length > 1 ? `<select id="studentSel">${names.map((n) => `<option ${n === store.current ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>` : `<span class="badge">👤 ${esc(store.current)}</span>`}
      </div>
      <p class="sub">◎○△ は「わかった・がんばった・つたえた」の じこひょうか です。先生の らん は 先生が 入力します。</p>
      <div class="table-wrap">
        <table class="rec-table">
          <thead><tr><th>時</th><th>日づけ</th><th>学習内容</th><th>正答</th><th>自己評価</th><th>ふりかえり</th><th>先生から</th><th></th></tr></thead>
          <tbody>
            ${LESSONS.map((L) => {
              const r = st.lessons[L.id];
              return `<tr class="${r ? '' : 'empty'}">
                <td class="c">${L.id}</td>
                <td class="c">${r ? esc(r.date) : '—'}</td>
                <td>${esc(plain(L.title))}</td>
                <td class="c">${r ? `${r.score}/${r.total}` : ''}</td>
                <td class="c self">${r ? esc(selfText(r.self)) : ''}</td>
                <td>${r ? esc(r.comment) : ''}</td>
                <td>${r ? `<textarea class="tcomment" data-id="${L.id}" rows="2" placeholder="所見">${esc(r.teacher)}</textarea>` : ''}</td>
                <td class="c">${r ? `<button class="btn small" data-detail="${L.id}" type="button">くわしく</button>` : ''}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="btn-row">
        <button class="btn primary" id="printAll" type="button">🖨 ${rb('ぜんぶ 印刷{いんさつ}（10時間{じかん}）')}</button>
        <button class="btn" id="printSummary" type="button">🖨 ${rb('一覧{いちらん}だけ 印刷{いんさつ}')}</button>
        <button class="btn ghost" id="backHome" type="button">🏠 ホーム</button>
      </div>
    </section>`;
  const sel = $('#studentSel');
  if (sel) sel.onchange = () => { store.current = sel.value; saveStore(); renderRecords(); };
  app.querySelectorAll('.tcomment').forEach((ta) => {
    ta.oninput = () => { cur().lessons[ta.dataset.id].teacher = ta.value; saveStore(); };
  });
  app.querySelectorAll('[data-detail]').forEach((b) => { b.onclick = () => openDetail(Number(b.dataset.detail)); });
  $('#printAll').onclick = () => printRecords(LESSONS.map((l) => l.id), true);
  $('#printSummary').onclick = () => printRecords(LESSONS.map((l) => l.id), true, true);
  $('#backHome').onclick = renderHome;
}

function answerDetailHtml(r) {
  return `<table class="detail-table"><thead><tr><th>No</th><th>種類</th><th>問題</th><th>解答</th><th>結果</th></tr></thead><tbody>
    ${r.answers.map((a, i) => {
      if (!a) return '';
      let res;
      if (a.type === 'open') res = a.needsCheck ? '要確認' : '回答';
      else res = a.ok ? (a.first ? '◎' : '○') : '△';
      const dlg = a.type === 'open' && a.dialog
        ? `<div class="dlg">${a.dialog.map((d) => `<div class="${d.who}"><b>${d.who === 'bot' ? '教材' : '生徒'}：</b>${esc(d.text)}</div>`).join('')}</div>`
        : '';
      return `<tr><td class="c">${i + 1}</td><td class="c">${esc(a.label)}</td><td>${esc(a.q)}</td><td>${esc(a.response)}${dlg}</td><td class="c">${res}</td></tr>`;
    }).join('')}
  </tbody></table>
  <p class="legend">結果：◎1回目で正解　○2回目で正解　△正答を確認　／　記述：「要確認」は問答の後も教材の想定と異なった回答です。</p>`;
}
function openDetail(id) {
  const L = LESSONS.find((x) => x.id === id);
  const r = cur().lessons[id];
  openModal(`
    <div class="modal-head"><h3>${id}時間目　${esc(plain(L.title))}</h3><button class="btn ghost small" data-close type="button">✕ とじる</button></div>
    <p>日付：${esc(r.date)}　正答：${r.score}/${r.total}（1回目で正解 ${r.first}）　自己評価：${esc(selfText(r.self))}　取り組み回数：${r.attempts || 1}</p>
    ${answerDetailHtml(r)}
    <p><b>ふりかえり：</b>${esc(r.comment) || '（なし）'}</p>
    <div class="btn-row"><button class="btn primary" id="printOne" type="button">🖨 この時間を印刷</button></div>`);
  $('#printOne').onclick = () => { closeModal(); printRecords([id], false); };
}

/* ---------- 印刷 ---------- */
function printRecords(ids, withSummary, summaryOnly) {
  const st = cur();
  const done = ids.filter((id) => st.lessons[id]);
  if (!done.length) { toast('きろくが ありません'); return; }
  let html = `<div class="p-head"><h1>国語「${UNIT_TITLE}」学習記録</h1>
    <div class="p-meta"><span>氏名：${esc(store.current)}</span><span>印刷日：${today()}</span></div></div>`;
  if (withSummary) {
    html += `<table class="p-table"><thead><tr><th style="width:3em">時</th><th style="width:6em">日付</th><th>学習内容</th><th style="width:4em">正答</th><th style="width:5em">自己評価<br><small>分・頑・伝</small></th><th>ふりかえり（生徒）</th><th>教師の所見</th></tr></thead><tbody>
      ${LESSONS.map((L) => {
        const r = st.lessons[L.id];
        return `<tr><td class="c">${L.id}</td><td class="c">${r ? esc(r.date) : ''}</td><td>${esc(plain(L.title))}<br><small>めあて：${esc(plain(L.goal))}</small></td>
          <td class="c">${r ? `${r.score}/${r.total}` : ''}</td><td class="c">${r ? esc(selfText(r.self)) : ''}</td><td>${r ? esc(r.comment) : ''}</td><td>${r ? esc(r.teacher) : ''}</td></tr>`;
      }).join('')}
    </tbody></table>`;
  }
  if (!summaryOnly) {
    done.forEach((id) => {
      const L = LESSONS.find((x) => x.id === id);
      const r = st.lessons[id];
      html += `<section class="p-lesson">
        <h2>${id}時間目　${esc(plain(L.title))}</h2>
        <p class="p-info">日付：${esc(r.date)}　めあて：${esc(plain(L.goal))}<br>正答：${r.score}/${r.total}（1回目で正解 ${r.first}）　自己評価（分かった・頑張った・伝えた）：${esc(selfText(r.self))}</p>
        ${answerDetailHtml(r)}
        <p><b>ふりかえり（生徒）：</b>${esc(r.comment) || ''}</p>
        <p><b>教師の所見：</b>${esc(r.teacher) || ''}</p>
      </section>`;
    });
  }
  $('#printArea').innerHTML = html;
  setTimeout(() => window.print(), 100);
}

/* =========================================================
   せってい
   ========================================================= */
function openSettings() {
  const s = store.settings;
  openModal(`
    <div class="modal-head"><h3>⚙️ せってい</h3><button class="btn ghost small" data-close type="button">✕ とじる</button></div>
    <div class="set-row"><span>ふりがな</span>
      <div class="seg"><button class="${s.ruby ? 'on' : ''}" data-ruby="1" type="button">あり</button><button class="${!s.ruby ? 'on' : ''}" data-ruby="0" type="button">なし</button></div></div>
    <div class="set-row"><span>もじの 大きさ</span>
      <div class="seg">${[['s', 'ふつう'], ['m', '大きい'], ['l', 'とても大きい']].map(([k, n]) => `<button class="${s.size === k ? 'on' : ''}" data-size="${k}" type="button">${n}</button>`).join('')}</div></div>
    <div class="set-row"><span>よみあげの はやさ</span>
      <input type="range" id="rate" min="0.5" max="1.3" step="0.1" value="${s.rate}"><b id="rateV">${s.rate}</b></div>
    <hr>
    <p class="sub">【先生用】記録は この端末の ブラウザに 保存されます。別の端末へ移す・バックアップするときは 書き出し／読み込み を使ってください。</p>
    <div class="btn-row">
      <button class="btn" id="exportData" type="button">💾 記録を書き出す</button>
      <label class="btn" for="importFile">📂 記録を読み込む</label>
      <input type="file" id="importFile" accept="application/json,.json" hidden>
    </div>
    <div class="btn-row">
      ${store.current ? `<button class="btn danger" id="delStudent" type="button">${esc(store.current)} さんの記録を消す</button>` : ''}
      <button class="btn danger" id="delAll" type="button">すべての記録を消す</button>
    </div>`);
  const box = $('#modalBox');
  box.querySelectorAll('[data-ruby]').forEach((b) => { b.onclick = () => { s.ruby = b.dataset.ruby === '1'; saveStore(); applySettings(); openSettings(); }; });
  box.querySelectorAll('[data-size]').forEach((b) => { b.onclick = () => { s.size = b.dataset.size; saveStore(); applySettings(); openSettings(); }; });
  $('#rate').oninput = (e) => { s.rate = Number(e.target.value); $('#rateV').textContent = s.rate; saveStore(); };
  $('#exportData').onclick = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `taketori-kiroku-${today().replace(/\//g, '')}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $('#importFile').onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const d = JSON.parse(rd.result);
        if (!d.students) throw new Error('format');
        Object.keys(d.students).forEach((n) => {
          if (!store.students[n]) store.students[n] = { lessons: {} };
          Object.assign(store.students[n].lessons, d.students[n].lessons || {});
        });
        saveStore(); closeModal(); toast('記録を読み込みました'); renderHome();
      } catch (err) { toast('読み込めませんでした（ファイルを確認）'); }
    };
    rd.readAsText(f);
  };
  const del = $('#delStudent');
  if (del) del.onclick = () => {
    if (!confirm(`${store.current} さんの記録をすべて消します。よろしいですか？`)) return;
    delete store.students[store.current]; store.current = null; saveStore(); closeModal(); S = null; renderHome();
  };
  $('#delAll').onclick = () => {
    if (!confirm('すべての生徒の記録を消します。元に戻せません。よろしいですか？')) return;
    store = defaultStore(); saveStore(); applySettings(); closeModal(); S = null; renderHome();
  };
}

/* ---------- 起動 ---------- */
if ('speechSynthesis' in window) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); }
applySettings();
renderHome();
