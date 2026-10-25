# -*- coding: utf-8 -*-
"""
Озвучка шагов всех практик: одна фраза субтитров = один файл docs/audio/<код>.mp3, список с длительностями — docs/audio/index.js.

  python make_audio.py silero xenia          # Silero (российский синтезатор, без интернета; лицензия CC BY-NC 4.0 — только некоммерческий сайт, с указанием)
  python make_audio.py edge ru-RU-SvetlanaNeural   # нейроголос Microsoft через edge-tts (нужен интернет)
  python make_audio.py silero xenia --only cvetok  # только одна сцена

Фразы берутся из самого сайта: скрипт открывает docs/index.html в невидимом браузере, загружает модули практик
и режет текст шагов той же функцией, что и плеер (DFSC.Voice.chunks / say / key). Поэтому коды файлов совпадают.
Уже озвученные фразы не пересобираются; фразы, которых больше нет в тексте, удаляются.
Нужны: playwright, torch + soundfile (для Silero) или edge-tts, ffmpeg в PATH.
"""
import asyncio, json, os, subprocess, sys, urllib.request

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(HERE, '..', 'docs')
AUD = os.path.join(DOCS, 'audio')
ENGINE, VOICE = sys.argv[1], sys.argv[2]
ONLY = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
LABEL = {'silero': 'синтез речи Silero (голос %s, CC BY-NC 4.0)', 'edge': 'нейроголос Microsoft %s'}[ENGINE] % VOICE
os.makedirs(AUD, exist_ok=True)
# модель и временные файлы — в папке с латинским путём: torch не открывает файлы по пути с кириллицей
CACHE = os.environ.get('DFS_TTS_CACHE', 'C:/tmp/tts_cache')
os.makedirs(CACHE, exist_ok=True)


def collect():
    from playwright.sync_api import sync_playwright
    url = 'file:///' + os.path.abspath(os.path.join(DOCS, 'index.html')).replace('\\', '/') + '#/p/cvetok'
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome', args=['--mute-audio'])
        pg = b.new_page()
        pg.add_init_script("try{speechSynthesis.speak=function(){};}catch(e){}")
        pg.goto(url); pg.wait_for_function("window.DFSC && DFSC.LESSONS && DFSC.S3 && DFSC.Voice", timeout=30000)
        items = pg.evaluate("""(function(){
          var D=DFSC, out={}, names=Object.keys(D.S3).concat(Object.keys(D.A||{}).filter(function(n){return !D.S3[n];}));
          names.forEach(function(n){
            var s; try { s = D.S3[n] ? D.S3[n]() : D.A[n](); } catch(e) { return; }
            if (!s || !s.steps) return;
            s.steps.forEach(function(st){ D.Voice.chunks(st.d).forEach(function(c){ var k=D.Voice.key(c.t); out[k]={say:D.Voice.say(c.t), scene:n}; }); });
          });
          return out; })()""")
        b.close()
    return items


def synth_silero(jobs):
    import torch, soundfile as sf
    pt = os.path.join(CACHE, 'v5_ru.pt')
    if not os.path.exists(pt):
        urllib.request.urlretrieve('https://models.silero.ai/models/tts/ru/v5_ru.pt', pt)
    model = torch.package.PackageImporter(pt).load_pickle('tts_models', 'model')
    for k, text in jobs:
        audio = model.apply_tts(text=text, speaker=VOICE, sample_rate=48000, put_accent=True, put_yo=True)
        wav = os.path.join(CACHE, k + '.wav'); sf.write(wav, audio.numpy(), 48000)
        to_mp3(wav, k)


def synth_edge(jobs):
    import edge_tts
    async def go():
        for k, text in jobs:
            src = os.path.join(CACHE, k + '.src.mp3')
            await edge_tts.Communicate(text, VOICE, rate='-8%').save(src)
            to_mp3(src, k)
    asyncio.run(go())


def to_mp3(src, k):
    # тишина по краям срезается, громкость выравнивается, моно 64 кбит/с — около 8 КБ на секунду речи
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af',
                    'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-18:TP=-2',
                    '-ac', '1', '-ar', '44100', '-b:a', '64k', os.path.join(AUD, k + '.mp3')], check=True)


def duration(k):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(AUD, k + '.mp3')], capture_output=True, text=True)
    return round(float(r.stdout.strip() or 0), 2)


items = collect()
if ONLY:
    items = {k: v for k, v in items.items() if v['scene'] == ONLY}
jobs = [(k, v['say']) for k, v in items.items() if not os.path.exists(os.path.join(AUD, k + '.mp3'))]
print('фраз всего', len(items), 'нужно озвучить', len(jobs), 'знаков', sum(len(t) for _, t in jobs))
if jobs:
    (synth_silero if ENGINE == 'silero' else synth_edge)(jobs)
# список: все существующие файлы, которые есть в тексте (при --only — не трогаем чужие сцены)
idx = os.path.join(AUD, 'index.js')
old = {}
if os.path.exists(idx):
    try:
        txt = open(idx, encoding='utf-8').read(); old = json.loads(txt[txt.index('files:') + 6: txt.rindex('}', 0, txt.rindex('}')) + 1])
    except Exception:
        old = {}
keep = dict(old) if ONLY else {}
for k in items:
    if os.path.exists(os.path.join(AUD, k + '.mp3')):
        keep[k] = duration(k)
if not ONLY:
    for f in os.listdir(AUD):
        if f.endswith('.mp3') and f[:-4] not in keep:
            os.remove(os.path.join(AUD, f))
with open(idx, 'w', encoding='utf-8') as fh:
    fh.write('/* Озвучка: список записанных фраз {код: длительность, с}. Собирается скриптом tools/make_audio.py, вручную не править. */\n')
    fh.write('window.DFSC = window.DFSC || {};\nDFSC.AUDIO = { voice: %s, files: %s };\n' % (json.dumps(LABEL, ensure_ascii=False), json.dumps(keep, sort_keys=True)))
print('готово: файлов', len(keep), 'секунд', round(sum(keep.values())))
