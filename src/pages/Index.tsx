import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

type Section = "home" | "scan" | "stats" | "memes" | "settings" | "about";

interface Threat {
  id: number;
  name: string;
  type: string;
  severity: "critical" | "high" | "low";
  status: "found" | "deleted" | "quarantine";
}

const MEME_THREATS: string[] = [
  "Вирус_Прокрастинации.exe",
  "КРИПТОЛОХ_3000.bat",
  "ТвояБывшая.dll",
  "НалоговаяПроверка.sys",
  "БоссВОтпуске.trojan",
  "МамаЗвонит.spyware",
  "ПонедельникБлин.worm",
  "ПятницаНастала.exe",
  "СосискиСгорели.alert",
  "КотНасрал.log",
  "ИнтернетОтключили.fatal",
  "БосМайнинг.hidden",
  "ЗвонокБанка.phishing",
  "ДиетаФейл.cookie",
  "ЛамборгиниМечта.mlm",
];

const MEME_IMAGES = [
  { emoji: "🦠", label: "ВИРУС-ПРОКРАСТИН", desc: "Заставляет смотреть TikTok 6 часов" },
  { emoji: "💀", label: "СКЕЛЕТ СИСТЕМ", desc: "Съел оперативную память и ушёл" },
  { emoji: "🐛", label: "ЧЕРВЬ СУДЬБЫ", desc: "Размножается по Wi-Fi соседей" },
  { emoji: "👾", label: "ПРИШЕЛЕЦ 8БИТ", desc: "Пришёл из 1995, остался навсегда" },
  { emoji: "🤡", label: "КЛОУН.EXE", desc: "Критическая угроза: здравому смыслу" },
  { emoji: "🧟", label: "ЗОМБИ-ПРОЦЕСС", desc: "Умер, но не остановился" },
];

const VOICE_ALERTS = [
  "Внимание! Обнаружен вирус прокрастинации!",
  "Критическая угроза! Ваш кот смотрит на вас подозрительно!",
  "ОПАСНОСТЬ! Холодильник открыт уже в третий раз!",
  "Система под атакой! Понедельник наступает!",
  "Тревога! Обнаружена ваша бывшая в контактах!",
  "Срочно! Босс пишет в нерабочее время!",
];

const FUNNY_TIPS = [
  "💡 Совет: Выключите компьютер и выйдите на улицу. Там вирусов нет (почти).",
  "💡 Совет: Антивирус — это как фитнес. Все знают, что нужен, но никто не использует.",
  "💡 Совет: Если вирус не найден — значит, он очень хорошо прячется.",
  "💡 Совет: Ваш пароль '12345' — это не пароль, это приглашение.",
  "💡 Совет: Перезагрузка решает 90% проблем. Оставшиеся 10% — это вы.",
];

function useAudioEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const musicIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.3);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const playBeep = useCallback((freq: number, duration: number, type: OscillatorType = "square") => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, [getCtx]);

  const playAlert = useCallback(() => {
    [800, 600, 800, 600].forEach((f, i) => {
      setTimeout(() => playBeep(f, 0.15, "square"), i * 150);
    });
  }, [playBeep]);

  const playSuccess = useCallback(() => {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playBeep(f, 0.2, "sine"), i * 100);
    });
  }, [playBeep]);

  const playDelete = useCallback(() => {
    [400, 300, 200, 100].forEach((f, i) => {
      setTimeout(() => playBeep(f, 0.12, "sawtooth"), i * 80);
    });
  }, [playBeep]);

  const playClick = useCallback(() => {
    playBeep(1200, 0.05, "square");
  }, [playBeep]);

  const startMusic = useCallback(() => {
    const ctx = getCtx();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    const notes = [130.81, 164.81, 196.00, 220.00, 261.63, 220.00, 196.00, 164.81];
    const bassNotes = [65.41, 82.41, 98.00, 110.00];
    const tempo = 0.25;

    const playLoop = (time: number) => {
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g);
        g.connect(masterGain);
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, time + i * tempo);
        g.gain.setValueAtTime(0.04, time + i * tempo);
        g.gain.exponentialRampToValueAtTime(0.001, time + i * tempo + tempo * 0.9);
        osc.start(time + i * tempo);
        osc.stop(time + i * tempo + tempo);
      });

      bassNotes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g);
        g.connect(masterGain);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, time + i * tempo * 2);
        g.gain.setValueAtTime(0.06, time + i * tempo * 2);
        g.gain.exponentialRampToValueAtTime(0.001, time + i * tempo * 2 + tempo * 1.8);
        osc.start(time + i * tempo * 2);
        osc.stop(time + i * tempo * 2 + tempo * 2);
      });
    };

    const loopDuration = notes.length * tempo;
    let startTime = ctx.currentTime;
    playLoop(startTime);

    musicIntervalRef.current = setInterval(() => {
      startTime += loopDuration;
      playLoop(startTime);
    }, loopDuration * 1000);

    setMusicPlaying(true);
  }, [getCtx, volume]);

  const stopMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
    if (gainRef.current) {
      gainRef.current.gain.exponentialRampToValueAtTime(0.001, getCtx().currentTime + 0.5);
    }
    setMusicPlaying(false);
  }, [getCtx]);

  const toggleMusic = useCallback(() => {
    if (musicPlaying) stopMusic();
    else startMusic();
  }, [musicPlaying, startMusic, stopMusic]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (gainRef.current) {
      gainRef.current.gain.setValueAtTime(v, getCtx().currentTime);
    }
  }, [getCtx]);

  const speak = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ru-RU";
      utterance.rate = 1.1;
      utterance.pitch = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return { playAlert, playSuccess, playDelete, playClick, toggleMusic, musicPlaying, setVolume, volume, speak };
}

const Index = () => {
  const [section, setSection] = useState<Section>("home");
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState("");
  const [threats, setThreats] = useState<Threat[]>([]);
  const [totalScanned, setTotalScanned] = useState(0);
  const [glitching, setGlitching] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const [currentTip, setCurrentTip] = useState(0);
  const [protectionLevel, setProtectionLevel] = useState(42);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [memeMode, setMemeMode] = useState(true);
  const [aggressionLevel, setAggressionLevel] = useState(50);
  const [deletedCount, setDeletedCount] = useState(0);

  const audio = useAudioEngine();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(t => (t + 1) % FUNNY_TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 300);
    }, 5000 + Math.random() * 5000);
    return () => clearInterval(glitchInterval);
  }, []);

  const addFloatingEmoji = (emoji: string) => {
    const id = Date.now();
    const x = 10 + Math.random() * 80;
    setFloatingEmojis(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 1000);
  };

  const startScan = () => {
    if (scanning) return;
    setScanning(true);
    setScanProgress(0);
    setThreats([]);
    setTotalScanned(0);
    audio.playAlert();
    if (voiceEnabled) audio.speak("Начинаю сканирование. Держитесь крепче!");

    const phases = [
      "Ищу вирусы в холодильнике...",
      "Проверяю мысли на наличие малвари...",
      "Сканирую соседей по Wi-Fi...",
      "Анализирую ваши посты в соцсетях...",
      "Ищу кота в системных файлах...",
      "Проверяю, не утёк ли ваш мозг...",
      "Финальная проверка кармы...",
    ];

    let progress = 0;
    let phaseIdx = 0;
    const foundThreats: Threat[] = [];

    const interval = setInterval(() => {
      progress += Math.random() * 3 + 0.5;
      setTotalScanned(prev => prev + Math.floor(Math.random() * 500 + 100));

      if (phaseIdx < phases.length && progress > (phaseIdx + 1) * (100 / phases.length)) {
        setScanPhase(phases[phaseIdx]);
        phaseIdx++;
      }

      if (Math.random() < 0.08 && foundThreats.length < 8) {
        const name = MEME_THREATS[Math.floor(Math.random() * MEME_THREATS.length)];
        const severities: Threat["severity"][] = ["critical", "high", "low"];
        const types = ["МЕМОВИРУС", "ПРОКРАСТИН-ЧЕРВЬ", "РОФЛ-ТРОЯН", "ЛОЛ-ШПИОН", "КРИНЖ-БОТНЕТ"];
        const threat: Threat = {
          id: Date.now() + Math.random(),
          name,
          type: types[Math.floor(Math.random() * types.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          status: "found",
        };
        foundThreats.push(threat);
        setThreats([...foundThreats]);
        addFloatingEmoji("🦠");
        audio.playAlert();
        if (voiceEnabled && foundThreats.length <= 3) {
          audio.speak(`Обнаружен ${threat.type}!`);
        }
      }

      if (progress >= 100) {
        clearInterval(interval);
        setScanProgress(100);
        setScanPhase("Сканирование завершено! Боже, что тут было...");
        setScanning(false);
        audio.playSuccess();
        if (voiceEnabled) audio.speak(`Сканирование завершено! Найдено ${foundThreats.length} угроз. Вам стоит задуматься о своей жизни.`);
        addFloatingEmoji("🎉");
        addFloatingEmoji("💀");
      } else {
        setScanProgress(Math.min(progress, 99));
      }
    }, 120);
  };

  const deleteThreat = (id: number) => {
    setThreats(prev => prev.map(t => t.id === id ? { ...t, status: "deleted" } : t));
    audio.playDelete();
    addFloatingEmoji("💥");
    setDeletedCount(c => c + 1);
    if (voiceEnabled) {
      const msgs = ["Уничтожен!", "Готово!", "Прощай, вирус!", "Пока-пока!"];
      audio.speak(msgs[Math.floor(Math.random() * msgs.length)]);
    }
  };

  const deleteAll = () => {
    const activeCount = threats.filter(t => t.status !== "deleted").length;
    setThreats(prev => prev.map(t => ({ ...t, status: "deleted" })));
    audio.playSuccess();
    setDeletedCount(c => c + activeCount);
    addFloatingEmoji("🔥");
    addFloatingEmoji("💀");
    addFloatingEmoji("✅");
    if (voiceEnabled) audio.speak("Все угрозы уничтожены! Вы в безопасности... наверное.");
  };

  const navItems: { id: Section; icon: string; label: string }[] = [
    { id: "home", icon: "Shield", label: "Главная" },
    { id: "scan", icon: "Scan", label: "Скан" },
    { id: "stats", icon: "BarChart3", label: "Статистика" },
    { id: "memes", icon: "Laugh", label: "Мемы" },
    { id: "settings", icon: "Settings", label: "Настройки" },
    { id: "about", icon: "Info", label: "О нас" },
  ];

  const severityColor = (s: Threat["severity"]) => {
    if (s === "critical") return "var(--neon-red)";
    if (s === "high") return "var(--neon-yellow)";
    return "var(--neon-green)";
  };

  return (
    <div className="min-h-screen bg-grid" style={{ background: "var(--bg-dark)", fontFamily: "'Rajdhani', sans-serif" }}>
      <div className="crt-overlay" />
      <div className="scan-line" />

      {floatingEmojis.map(e => (
        <div
          key={e.id}
          className="fixed pointer-events-none z-50 text-4xl animate-float-up"
          style={{ left: `${e.x}%`, bottom: "20%" }}
        >
          {e.emoji}
        </div>
      ))}

      {/* Header */}
      <header className="border-b relative overflow-hidden sticky top-0 z-40"
        style={{ borderColor: "rgba(255,0,255,0.4)", background: "rgba(5,5,16,0.97)" }}>
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={`text-3xl ${glitching ? "animate-glitch" : ""}`} style={{ filter: "drop-shadow(0 0 10px #ff00ff)" }}>
              🛡️
            </div>
            <div>
              <h1
                className="font-orbitron font-black text-lg glitch-text"
                data-text="МЕМАВИРУС 3000"
                style={{ color: "var(--neon-pink)", textShadow: "0 0 10px var(--neon-pink), 0 0 30px var(--neon-pink)" }}
              >
                МЕМАВИРУС 3000
              </h1>
              <div className="font-mono-tech text-xs" style={{ color: "var(--neon-cyan)" }}>
                v6.6.6 · {protectionLevel > 70 ? "✅ НОРМ" : protectionLevel > 40 ? "⚠️ ПОД УГРОЗОЙ" : "💀 АААААА"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="btn-neon px-3 py-1.5 rounded text-xs"
              onClick={() => { audio.toggleMusic(); audio.playClick(); }}
            >
              {audio.musicPlaying ? "🎵 СТОП" : "🎵 МУЗОН"}
            </button>
            <div className="hidden md:flex flex-col items-end gap-1">
              <span className="font-mono-tech text-xs" style={{ color: "var(--neon-green)" }}>ЗАЩИТА: {protectionLevel}%</span>
              <div className="w-28 h-2 rounded overflow-hidden" style={{ background: "rgba(0,255,65,0.1)", border: "1px solid var(--neon-green)" }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${protectionLevel}%`,
                    background: protectionLevel > 70 ? "var(--neon-green)" : protectionLevel > 40 ? "var(--neon-yellow)" : "var(--neon-red)",
                    boxShadow: "0 0 8px currentColor"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex" style={{ height: "calc(100vh - 61px)" }}>
        {/* Sidebar */}
        <nav className="w-16 md:w-52 flex flex-col border-r py-4 gap-1 shrink-0 overflow-y-auto scrollbar-neon"
          style={{ borderColor: "rgba(0,255,255,0.2)", background: "rgba(5,5,16,0.9)" }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); audio.playClick(); }}
              className="flex items-center gap-3 px-3 md:px-4 py-3 mx-2 rounded transition-all duration-200 font-orbitron text-xs relative"
              style={{
                color: section === item.id ? "var(--neon-pink)" : "rgba(0,255,255,0.6)",
                background: section === item.id ? "rgba(255,0,255,0.1)" : "transparent",
                border: section === item.id ? "1px solid rgba(255,0,255,0.4)" : "1px solid transparent",
                boxShadow: section === item.id ? "0 0 15px rgba(255,0,255,0.2)" : "none",
                textShadow: section === item.id ? "0 0 5px var(--neon-pink)" : "none",
              }}
            >
              {section === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r"
                  style={{ background: "var(--neon-pink)", boxShadow: "0 0 8px var(--neon-pink)" }} />
              )}
              <Icon name={item.icon} fallback="Shield" size={18} />
              <span className="hidden md:block">{item.label}</span>
            </button>
          ))}
          <div className="flex-1" />
          <div className="mx-2 px-3 py-3 text-center font-mono-tech text-xs"
            style={{ color: "rgba(0,255,255,0.4)", borderTop: "1px solid rgba(0,255,255,0.1)" }}>
            <div>УДАЛЕНО</div>
            <div className="text-2xl font-orbitron font-bold neon-green mt-1">{deletedCount}</div>
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1 overflow-y-auto scrollbar-neon p-4 md:p-6">

          {/* ГЛАВНАЯ */}
          {section === "home" && (
            <div className="space-y-5 animate-fade-in">
              <div className="panel panel-pink rounded-lg p-6 relative overflow-hidden text-center">
                <div className="absolute top-2 right-3 font-mono-tech text-xs animate-pulse" style={{ color: "var(--neon-green)" }}>● ОНЛАЙН</div>
                <div className="text-7xl mb-3" style={{ filter: "drop-shadow(0 0 20px #ff00ff)" }}>🛡️</div>
                <h2 className="font-orbitron text-2xl font-black mb-2" style={{ color: "var(--neon-cyan)" }}>
                  ДОБРО ПОЖАЛОВАТЬ<br />
                  <span style={{ color: "var(--neon-pink)" }}>В МАТРИЦУ ЗАЩИТЫ</span>
                </h2>
                <p className="font-rajdhani text-base mb-4" style={{ color: "rgba(0,255,255,0.7)" }}>
                  Единственный антивирус, защищающий от вирусов и экзистенциального кризиса одновременно
                </p>
                <button className="btn-neon btn-neon-cyan px-8 py-3 rounded text-sm"
                  onClick={() => { setSection("scan"); audio.playClick(); }}>
                  🚀 НАЧАТЬ СКАНИРОВАНИЕ
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "УГРОЗ", value: threats.filter(t => t.status === "found").length, icon: "Bug", color: "var(--neon-red)" },
                  { label: "УДАЛЕНО", value: deletedCount, icon: "Trash2", color: "var(--neon-green)" },
                  { label: "ЗАЩИТА", value: `${protectionLevel}%`, icon: "Shield", color: "var(--neon-cyan)" },
                  { label: "МЕМОВ", value: MEME_IMAGES.length, icon: "Laugh", color: "var(--neon-yellow)" },
                ].map(s => (
                  <div key={s.label} className="panel rounded-lg p-4 text-center">
                    <Icon name={s.icon} fallback="Shield" size={22} className="mx-auto mb-2" style={{ color: s.color }} />
                    <div className="font-orbitron text-2xl font-bold" style={{ color: s.color, textShadow: `0 0 10px ${s.color}` }}>{s.value}</div>
                    <div className="font-mono-tech text-xs mt-1" style={{ color: "rgba(0,255,255,0.5)" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="panel rounded-lg p-4 border-l-2" style={{ borderLeftColor: "var(--neon-yellow)" }}>
                <p className="font-rajdhani text-sm" style={{ color: "var(--neon-yellow)" }}>{FUNNY_TIPS[currentTip]}</p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button className="btn-neon px-4 py-2 rounded" onClick={() => {
                  const alert = VOICE_ALERTS[Math.floor(Math.random() * VOICE_ALERTS.length)];
                  audio.playAlert();
                  if (voiceEnabled) audio.speak(alert);
                  addFloatingEmoji("🚨");
                }}>🚨 ТРЕВОГА!</button>
                <button className="btn-neon btn-neon-green px-4 py-2 rounded" onClick={() => {
                  setProtectionLevel(p => Math.min(100, p + 10));
                  audio.playSuccess();
                  addFloatingEmoji("💪");
                }}>💪 УСИЛИТЬ ЗАЩИТУ</button>
                <button className="btn-neon btn-neon-cyan px-4 py-2 rounded" onClick={() => {
                  audio.playClick();
                  if (voiceEnabled) audio.speak("Система оптимизирована. Теперь компьютер думает, что он умный.");
                  addFloatingEmoji("⚡");
                }}>⚡ ОПТИМИЗАЦИЯ</button>
              </div>
            </div>
          )}

          {/* СКАНИРОВАНИЕ */}
          {section === "scan" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-orbitron text-xl font-bold" style={{ color: "var(--neon-cyan)" }}>⬡ ЦЕНТР СКАНИРОВАНИЯ</h2>

              <div className="panel rounded-lg p-6">
                <div className="flex justify-center mb-5">
                  <div className="relative w-36 h-36">
                    <div className="absolute inset-0 rounded-full border-2 animate-pulse"
                      style={{ borderColor: "var(--neon-cyan)", boxShadow: "0 0 20px var(--neon-cyan)" }} />
                    <div className="absolute inset-4 rounded-full border" style={{ borderColor: "rgba(0,255,255,0.3)" }} />
                    <div className="absolute inset-8 rounded-full border" style={{ borderColor: "rgba(0,255,255,0.2)" }} />
                    <div className="absolute inset-0 rounded-full" style={{
                      background: scanning ? "conic-gradient(from 0deg, transparent 0%, rgba(0,255,255,0.3) 20%, transparent 21%)" : "transparent",
                      animation: scanning ? "spin-slow 1s linear infinite" : "none",
                    }} />
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                      {scanning ? "🔍" : scanProgress === 100 ? "✅" : "🛡️"}
                    </div>
                    {threats.filter(t => t.status === "found").map((_, i) => (
                      <div key={i} className="absolute w-3 h-3 rounded-full animate-pulse"
                        style={{
                          background: "var(--neon-red)", boxShadow: "0 0 8px var(--neon-red)",
                          top: `${20 + Math.sin(i * 1.3) * 40}%`, left: `${20 + Math.cos(i * 1.3) * 40}%`,
                        }} />
                    ))}
                  </div>
                </div>

                <div className="text-center font-mono-tech text-sm mb-4" style={{ color: "var(--neon-green)" }}>
                  {scanning ? scanPhase : scanProgress === 100 ? "СИСТЕМА ПРОВЕРЕНА. МЫ В ШО..." : "ГОТОВ К БИТВЕ С МИРОВЫМ ЗЛО"}
                </div>

                <div className="w-full h-4 rounded overflow-hidden mb-2"
                  style={{ background: "rgba(0,255,65,0.1)", border: "1px solid var(--neon-green)" }}>
                  <div className="h-full transition-all duration-200"
                    style={{ width: `${scanProgress}%`, background: "linear-gradient(90deg, var(--neon-green), var(--neon-cyan))", boxShadow: "0 0 10px var(--neon-green)" }} />
                </div>
                <div className="flex justify-between font-mono-tech text-xs mb-4" style={{ color: "rgba(0,255,255,0.5)" }}>
                  <span>{Math.round(scanProgress)}%</span>
                  <span>{totalScanned.toLocaleString()} файлов</span>
                </div>

                <div className="flex gap-3 justify-center flex-wrap">
                  <button className="btn-neon btn-neon-green px-8 py-3 rounded text-sm"
                    onClick={startScan} disabled={scanning} style={{ opacity: scanning ? 0.5 : 1 }}>
                    {scanning ? "⏳ СКАНИРУЮ..." : "🚀 ЗАПУСТИТЬ СКАН"}
                  </button>
                  {threats.some(t => t.status === "found") && (
                    <button className="btn-neon px-6 py-3 rounded text-sm" onClick={deleteAll}>💥 УНИЧТОЖИТЬ ВСЁ</button>
                  )}
                </div>
              </div>

              {threats.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-orbitron text-sm font-bold" style={{ color: "var(--neon-red)" }}>
                    ⚠️ УГРОЗЫ ({threats.filter(t => t.status === "found").length})
                  </h3>
                  {threats.map(t => (
                    <div key={t.id} className="panel rounded-lg p-4 flex items-center gap-4 transition-all duration-300"
                      style={{
                        opacity: t.status === "deleted" ? 0.4 : 1,
                        borderColor: t.status === "deleted" ? "rgba(0,255,65,0.2)" : `${severityColor(t.severity)}44`,
                        boxShadow: t.status !== "deleted" ? `0 0 10px ${severityColor(t.severity)}22` : "none",
                      }}>
                      <span className="text-2xl">{t.status === "deleted" ? "💀" : t.severity === "critical" ? "☠️" : t.severity === "high" ? "⚠️" : "🐛"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono-tech text-sm truncate" style={{ color: t.status === "deleted" ? "rgba(0,255,65,0.5)" : severityColor(t.severity) }}>{t.name}</div>
                        <div className="font-rajdhani text-xs" style={{ color: "rgba(0,255,255,0.5)" }}>{t.type} · {t.severity.toUpperCase()}</div>
                      </div>
                      <div className="shrink-0">
                        {t.status === "deleted"
                          ? <span className="font-orbitron text-xs" style={{ color: "var(--neon-green)" }}>✓ УДАЛЁН</span>
                          : <button className="btn-neon px-3 py-1 rounded text-xs" onClick={() => deleteThreat(t.id)}>💥 УДАЛИТЬ</button>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* СТАТИСТИКА */}
          {section === "stats" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-orbitron text-xl font-bold" style={{ color: "var(--neon-cyan)" }}>⬡ СТАТИСТИКА УГРОЗ</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Вирусов поймано", value: "1,337", sub: "за всё время", emoji: "🦠" },
                  { label: "Нервов потрачено", value: "∞", sub: "пользователем", emoji: "😤" },
                  { label: "Чашек кофе выпито", value: "42", sub: "разработчиком", emoji: "☕" },
                ].map(s => (
                  <div key={s.label} className="panel rounded-lg p-5 text-center">
                    <div className="text-4xl mb-3">{s.emoji}</div>
                    <div className="font-orbitron text-3xl font-black mb-1" style={{ color: "var(--neon-pink)", textShadow: "0 0 15px var(--neon-pink)" }}>{s.value}</div>
                    <div className="font-rajdhani text-sm font-bold" style={{ color: "var(--neon-cyan)" }}>{s.label}</div>
                    <div className="font-mono-tech text-xs" style={{ color: "rgba(0,255,255,0.4)" }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="panel rounded-lg p-5">
                <h3 className="font-orbitron text-sm mb-4" style={{ color: "var(--neon-cyan)" }}>TOP-5 УГРОЗ НЕДЕЛИ</h3>
                <div className="space-y-3">
                  {[
                    { name: "Вирус Прокрастинации", pct: 87, color: "var(--neon-pink)" },
                    { name: "Червь Понедельника", pct: 74, color: "var(--neon-red)" },
                    { name: "Троян Бывшей", pct: 63, color: "var(--neon-yellow)" },
                    { name: "Шпион Босса", pct: 45, color: "var(--neon-cyan)" },
                    { name: "Кот-Ботнет", pct: 31, color: "var(--neon-green)" },
                  ].map(item => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="font-mono-tech text-xs shrink-0 w-44 truncate" style={{ color: "rgba(0,255,255,0.7)" }}>{item.name}</div>
                      <div className="flex-1 h-5 rounded overflow-hidden" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${item.color}44` }}>
                        <div className="h-full rounded" style={{ width: `${item.pct}%`, background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                      </div>
                      <div className="font-orbitron text-xs w-10 text-right shrink-0" style={{ color: item.color }}>{item.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel rounded-lg p-5">
                <h3 className="font-orbitron text-sm mb-4" style={{ color: "var(--neon-cyan)" }}>ИСТОРИЯ СКАНИРОВАНИЙ</h3>
                <div className="space-y-2 font-mono-tech text-xs">
                  {[
                    { date: "Сегодня 03:17", result: "12 угроз", s: "warn" },
                    { date: "Вчера 22:44", result: "0 угроз", s: "clean" },
                    { date: "Вт 15:30", result: "ВАШ КОТ — ВИРУС", s: "critical" },
                    { date: "Пн 09:00", result: "Понедельник обнаружен", s: "critical" },
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b" style={{ borderColor: "rgba(0,255,255,0.1)" }}>
                      <span style={{ color: "rgba(0,255,255,0.5)" }}>{r.date}</span>
                      <span style={{ color: r.s === "clean" ? "var(--neon-green)" : r.s === "critical" ? "var(--neon-red)" : "var(--neon-yellow)" }}>{r.result}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* МЕМЫ */}
          {section === "memes" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-orbitron text-xl font-bold" style={{ color: "var(--neon-cyan)" }}>⬡ МЕМ-БИБЛИОТЕКА УГРОЗ</h2>
              <p className="font-rajdhani" style={{ color: "rgba(0,255,255,0.6)" }}>Официальная классификация по стандарту LMAO-9001</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MEME_IMAGES.map((m, i) => (
                  <div key={i} className="panel panel-pink rounded-lg p-5 cursor-pointer transition-all duration-200 hover:scale-105"
                    onClick={() => {
                      audio.playAlert();
                      addFloatingEmoji(m.emoji);
                      if (voiceEnabled) audio.speak(`Обнаружена угроза: ${m.label}!`);
                    }}>
                    <div className="text-6xl text-center mb-3" style={{ filter: "drop-shadow(0 0 10px var(--neon-pink))" }}>{m.emoji}</div>
                    <div className="font-orbitron text-sm font-bold text-center mb-1" style={{ color: "var(--neon-pink)" }}>{m.label}</div>
                    <div className="font-rajdhani text-xs text-center mb-3" style={{ color: "rgba(0,255,255,0.6)" }}>{m.desc}</div>
                    <div className="text-center">
                      <span className="font-mono-tech text-xs px-2 py-0.5 rounded"
                        style={{ background: "rgba(255,0,255,0.2)", color: "var(--neon-pink)", border: "1px solid rgba(255,0,255,0.3)" }}>
                        УРОВЕНЬ: КРИНЖ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="panel rounded-lg p-5 border-l-2" style={{ borderLeftColor: "var(--neon-yellow)" }}>
                <h3 className="font-orbitron text-sm mb-2" style={{ color: "var(--neon-yellow)" }}>🏆 СЕРТИФИКАТ БЕЗОПАСНОСТИ</h3>
                <p className="font-rajdhani text-sm" style={{ color: "rgba(0,255,255,0.7)" }}>
                  Настоящим подтверждается, что ваш компьютер признан "условно живым" по стандарту ISO/МЕМ/2024. Подписано: МЕМАВИРУС 3000™
                </p>
              </div>
            </div>
          )}

          {/* НАСТРОЙКИ */}
          {section === "settings" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-orbitron text-xl font-bold" style={{ color: "var(--neon-cyan)" }}>⬡ ПАРАМЕТРЫ СИСТЕМЫ</h2>
              <div className="space-y-3">
                {[
                  { label: "Голосовые уведомления", sub: "Кричать о вирусах вслух", state: voiceEnabled, toggle: () => { setVoiceEnabled(v => !v); audio.playClick(); }, emoji: "🔊" },
                  { label: "Звуковые эффекты", sub: "Пиу-пиу и бип-бип", state: notifEnabled, toggle: () => { setNotifEnabled(v => !v); audio.playClick(); }, emoji: "🎮" },
                  { label: "МЕМ-режим", sub: "Находить только мемные вирусы", state: memeMode, toggle: () => { setMemeMode(v => !v); audio.playClick(); }, emoji: "😂" },
                ].map(item => (
                  <div key={item.label} className="panel rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <div className="font-orbitron text-sm" style={{ color: "var(--neon-cyan)" }}>{item.label}</div>
                        <div className="font-rajdhani text-xs" style={{ color: "rgba(0,255,255,0.4)" }}>{item.sub}</div>
                      </div>
                    </div>
                    <button onClick={item.toggle} className="relative w-14 h-7 rounded-full transition-all duration-300"
                      style={{
                        background: item.state ? "var(--neon-green)" : "rgba(0,0,0,0.5)",
                        border: `1px solid ${item.state ? "var(--neon-green)" : "rgba(0,255,255,0.3)"}`,
                        boxShadow: item.state ? "0 0 15px var(--neon-green)" : "none",
                      }}>
                      <div className="absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300"
                        style={{ background: item.state ? "var(--bg-dark)" : "rgba(0,255,255,0.5)", left: item.state ? "calc(100% - 26px)" : "2px" }} />
                    </button>
                  </div>
                ))}

                <div className="panel rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="font-orbitron text-sm" style={{ color: "var(--neon-pink)" }}>⚡ АГРЕССИВНОСТЬ ЗАЩИТЫ</div>
                      <div className="font-rajdhani text-xs" style={{ color: "rgba(0,255,255,0.4)" }}>Насколько злобно реагировать на угрозы</div>
                    </div>
                    <span className="font-orbitron text-lg font-bold" style={{ color: "var(--neon-pink)" }}>{aggressionLevel}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={aggressionLevel}
                    onChange={e => { setAggressionLevel(Number(e.target.value)); audio.playClick(); }}
                    className="w-full" style={{ accentColor: "var(--neon-pink)" }} />
                  <div className="flex justify-between font-mono-tech text-xs mt-1" style={{ color: "rgba(0,255,255,0.3)" }}>
                    <span>ДОБРЫЙ</span><span>НЕЙТРАЛ</span><span>БЕРСЕРК</span>
                  </div>
                </div>

                <div className="panel rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="font-orbitron text-sm" style={{ color: "var(--neon-cyan)" }}>🎵 ГРОМКОСТЬ МУЗЫКИ</div>
                      <div className="font-rajdhani text-xs" style={{ color: "rgba(0,255,255,0.4)" }}>Киберпанк нон-стоп</div>
                    </div>
                    <span className="font-orbitron text-lg font-bold" style={{ color: "var(--neon-cyan)" }}>{Math.round(audio.volume * 100)}%</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.05} value={audio.volume}
                    onChange={e => audio.setVolume(Number(e.target.value))}
                    className="w-full" style={{ accentColor: "var(--neon-cyan)" }} />
                </div>

                <div className="panel rounded-lg p-4 border" style={{ borderColor: "rgba(255,0,64,0.4)" }}>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: "var(--neon-red)" }}>⚠️ ОПАСНАЯ ЗОНА</h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="btn-neon px-4 py-2 rounded text-xs"
                      style={{ borderColor: "var(--neon-red)", color: "var(--neon-red)" }}
                      onClick={() => { audio.playAlert(); if (voiceEnabled) audio.speak("Система сброшена! Всё пропало! Паника!"); setProtectionLevel(5); setDeletedCount(0); addFloatingEmoji("💀"); }}>
                      💀 СБРОСИТЬ ВСЁ
                    </button>
                    <button className="btn-neon px-4 py-2 rounded text-xs"
                      style={{ borderColor: "var(--neon-yellow)", color: "var(--neon-yellow)" }}
                      onClick={() => { audio.playSuccess(); setProtectionLevel(100); addFloatingEmoji("🦾"); if (voiceEnabled) audio.speak("Максимальная защита активирована! Вы непобедимы!"); }}>
                      🦾 РЕЖИМ БОГ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* О ПРОГРАММЕ */}
          {section === "about" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-orbitron text-xl font-bold" style={{ color: "var(--neon-cyan)" }}>⬡ О ПРОГРАММЕ</h2>

              <div className="panel panel-pink rounded-lg p-6 text-center">
                <div className="text-7xl mb-4">🛡️</div>
                <h3 className="font-orbitron text-2xl font-black mb-2" style={{ color: "var(--neon-pink)" }}>МЕМАВИРУС 3000™</h3>
                <div className="font-mono-tech text-sm mb-4" style={{ color: "var(--neon-cyan)" }}>ВЕРСИЯ 6.6.6 · BUILD 1337 · LEET EDITION</div>
                <p className="font-rajdhani text-base" style={{ color: "rgba(0,255,255,0.7)" }}>
                  Единственный в мире антивирус, сертифицированный по стандарту ISO/МЕМ-9001. Обнаруживает угрозы, которых нет. Защищает от того, чего вы боитесь.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "🧬 ТЕХНОЛОГИИ", items: ["Квантовый ИИ на блокчейне", "Нейросеть из 3 нейронов", "Облачный метаверс-движок", "Защита на уровне ДНК"] },
                  { title: "🏆 НАГРАДЫ", items: ["Лучший мем 2024", "Дарвиновская премия (почти)", "Приз симпатий котов", "1 место: самый бесполезный IT-продукт"] },
                ].map(block => (
                  <div key={block.title} className="panel rounded-lg p-5">
                    <h3 className="font-orbitron text-sm font-bold mb-3" style={{ color: "var(--neon-yellow)" }}>{block.title}</h3>
                    <ul className="space-y-2">
                      {block.items.map(item => (
                        <li key={item} className="font-rajdhani text-sm flex items-center gap-2" style={{ color: "rgba(0,255,255,0.7)" }}>
                          <span style={{ color: "var(--neon-green)" }}>▶</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="panel rounded-lg p-5">
                <h3 className="font-orbitron text-sm mb-3" style={{ color: "var(--neon-cyan)" }}>📜 ЛИЦЕНЗИОННОЕ СОГЛАШЕНИЕ</h3>
                <p className="font-mono-tech text-xs leading-relaxed" style={{ color: "rgba(0,255,255,0.5)" }}>
                  Устанавливая МЕМАВИРУС 3000, вы соглашаетесь: (1) смеяться не менее 2 раз в день; (2) принять тот факт, что ваш кот — это вирус; (3) вечность смотреть на глитч-эффекты. Программа поставляется "КАК ЕСТЬ". © 2024 ВасяСофт. Все права защищены котом.
                </p>
              </div>

              <div className="flex justify-center">
                <button className="btn-neon btn-neon-cyan px-6 py-3 rounded"
                  onClick={() => { audio.playSuccess(); addFloatingEmoji("❤️"); addFloatingEmoji("🛡️"); if (voiceEnabled) audio.speak("Спасибо за использование Мемавирус три тысячи! Вы наш герой!"); }}>
                  ❤️ ПОСТАВИТЬ 5 ЗВЁЗД
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Index;