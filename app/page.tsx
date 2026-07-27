"use client";

import { useEffect, useRef, useState } from "react";\nimport { createShuffleBag } from "./activityRandomizer";

const activities = [
  {
    name: "Хранитель доски",
    icon: "🗂️",
    description: "Наводи порядок в общей доске на всех встречах этой недели.",
  },
  {
    name: "Мемолог",
    icon: "😂",
    description: "Каждый день открывай встречу свежим мемом или анекдотом.",
  },
  {
    name: "Пушкин",
    icon: "🪶",
    description: "Делись коротким четверостишием с командой один раз в день.",
  },
  {
    name: "Прогнозист",
    icon: "🌤️",
    description: "Каждое утро предсказывай погоду для всей команды.",
  },
  {
    name: "Сам себе режиссёр",
    icon: "🎬",
    description: "Подключайся на Дейли с камерой и фоном на выбор всю неделю.",
  },
  {
    name: "Джокер",
    icon: "🃏",
    description: "Придумай новый сектор для следующего вращения колеса.",
  },
] as const;

export default function Home() {
  const [rotation, setRotation] = useState(0);
  const [uprightRotation, setUprightRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bagRef = useRef<number[]>([]);
  const lastSelectedRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const spin = () => {
    if (isSpinning) return;

    if (bagRef.current.length === 0) {
      bagRef.current = createShuffleBag(
        activities.length,
        lastSelectedRef.current,
      );
    }
    const next = bagRef.current.shift()!;
    lastSelectedRef.current = next;
    const currentMod = ((rotation % 360) + 360) % 360;
    const targetMod = (360 - next * 60) % 360;
    const adjustment = (targetMod - currentMod + 360) % 360;
    const nextRotation = rotation + 5 * 360 + adjustment;
    const uprightMod = ((uprightRotation % 360) + 360) % 360;
    const uprightAdjustment = ((targetMod - uprightMod + 540) % 360) - 180;
    const nextUprightRotation = uprightRotation + uprightAdjustment;

    setSelected(null);
    setIsSpinning(true);
    setRotation(nextRotation);

    if (timerRef.current) clearTimeout(timerRef.current);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timerRef.current = setTimeout(() => {
      setUprightRotation(nextUprightRotation);
      setSelected(next);
      setIsSpinning(false);
    }, reducedMotion ? 120 : 4300);
  };

  return (
    <main className="site-shell">
      <div className="doodle doodle-clock" aria-hidden="true">10:05</div>
      <div className="doodle doodle-star" aria-hidden="true">☆</div>
      <div className="doodle doodle-bolt" aria-hidden="true">ϟ</div>
      <div className="doodle doodle-cup" aria-hidden="true">☕</div>

      <header className="hero">
        <span className="eyebrow"><span />Командная игра<span /></span>
        <h1>Колесо<br className="mobile-break" /> активностей</h1>
        <p>Крути и получай активность на неделю!</p>
      </header>

      <section className="game" aria-label="Колесо активностей">
        <div className="wheel-stage">
          <div className="pointer" aria-hidden="true"><i /></div>
          <div
            className={`wheel${isSpinning ? " is-spinning" : ""}`}
            style={{ transform: `rotate(${rotation}deg)` }}
            aria-hidden="true"
          >
            {activities.map((activity, index) => (
              <div
                className="wheel-label"
                style={{ "--angle": `${index * 60}deg` } as React.CSSProperties}
                key={activity.name}
              >
                <div
                  className="label-content"
                  style={{ transform: `rotate(${-index * 60 - uprightRotation}deg)` }}
                >
                  <span>{activity.icon}</span>
                  <strong>{activity.name}</strong>
                </div>
              </div>
            ))}
            <div className="wheel-center">★</div>
          </div>
        </div>

        <aside className="result-panel" aria-live="polite">
          <span className="result-kicker">Твой выбор</span>
          {selected === null ? (
            <>
              <div className="result-placeholder">?</div>
              <h2>{isSpinning ? "Колесо решает…" : "Готов испытать удачу?"}</h2>
              <p>
                {isSpinning
                  ? "Ещё мгновение — и узнаешь свою активность."
                  : "Нажми на кнопку: случай выберет твою роль на эту неделю."}
              </p>
            </>
          ) : (
            <div className="result-card">
              <div className="confetti" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, index) => <i key={index} />)}
              </div>
              <div className="result-icon">{activities[selected].icon}</div>
              <span className="result-number">Активность {selected + 1} из 6</span>
              <h2>{activities[selected].name}</h2>
              <p>{activities[selected].description}</p>
            </div>
          )}

          <button className="spin-button" onClick={spin} disabled={isSpinning}>
            <span>{isSpinning ? "Крутим…" : selected === null ? "Крутить колесо" : "Крутить ещё раз"}</span>
            <b aria-hidden="true">↗</b>
          </button>
          <small>Каждое вращение — новый случайный результат</small>
        </aside>
      </section>

      <footer>
        <span>6 активностей</span>
        <span className="footer-star">✦</span>
        <span>1 весёлая неделя</span>
      </footer>
    </main>
  );
}
