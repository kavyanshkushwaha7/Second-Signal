import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSceneTimer } from '@/lib/video';
import { C, img, display, body, ease } from '../shared';

const CANDS = [
  { p: 'calculator', t: 'Casio fx-991EX', s: 94, why: 'Same model family · available now · 0.4 km' },
  { p: 'electronics', t: 'Graphing calculator', s: 71, why: 'Similar category · 2 weeks free' },
  { p: 'laptop-stand', t: 'Study gear bundle', s: 38, why: 'Partial match' },
];

export function MatchScene() {
  const [locked, setLocked] = useState(false);
  useSceneTimer([{ time: 4100, callback: () => setLocked(true) }]);
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ background: C.ivory }}
      initial={{ opacity: 0, y: '6vh' }} animate={{ opacity: 1, y: 0 }} exit={{ clipPath: 'circle(0% at 50% 50%)' }} transition={{ duration: 0.7, ease }}>
      <motion.div className="absolute" style={{ ...body, left: '6vw', top: '7vh', fontSize: '1.3vw', fontWeight: 700, color: C.forest, background: C.sageSoft, border: `1px solid ${C.sage}`, padding: '0.5vw 1.1vw', borderRadius: '99px', letterSpacing: '0.04em' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        Demo matching · sample data, no live AI connected
      </motion.div>
      <motion.div className="absolute" style={{ ...display, left: '6vw', top: '15vh', fontWeight: 800, fontSize: '4.2vw', color: C.charcoal, lineHeight: 1.05 }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease }}>
        Need meets <span style={{ color: C.forest }}>have.</span>
      </motion.div>
      <motion.div className="absolute overflow-hidden" style={{ left: '6vw', top: '36vh', width: '36vw', background: C.white, border: `1px solid ${C.beige}`, borderRadius: '1.4vw', padding: '2.2vw', boxShadow: '0 2.4vw 4vw -2vw rgba(23,76,60,.3)' }}
        initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.6, ease }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9vw' }}>
          <div style={{ ...display, width: '3.4vw', height: '3.4vw', borderRadius: '50%', background: C.sage, color: C.forest, fontWeight: 800, fontSize: '1.4vw', display: 'grid', placeItems: 'center' }}>NR</div>
          <div><div style={{ ...display, fontWeight: 700, fontSize: '1.4vw', color: C.charcoal }}>Nisha R.</div><div style={{ ...body, fontSize: '1.1vw', color: C.grey }}>Want List · Main Campus</div></div>
        </div>
        <div style={{ ...display, fontWeight: 700, fontSize: '2.3vw', color: C.charcoal, marginTop: '1.4vw', lineHeight: 1.2 }}>
          “I need a scientific calculator for two weeks.”
        </div>
        <motion.div className="absolute" style={{ left: 0, right: 0, top: 0, height: '30%', background: `linear-gradient(180deg, rgba(168,189,170,0), rgba(168,189,170,.55))` }}
          initial={{ y: '-100%', opacity: 0 }} animate={{ y: ['-100%', '330%', '-100%', '330%'], opacity: [0, 1, 1, 0] }} transition={{ delay: 1.3, duration: 2.4, ease: 'easeInOut' }} />
      </motion.div>
      <div className="absolute" style={{ left: '48vw', top: '10vh', width: '46vw', height: '80vh' }}>
        {CANDS.map((c, i) => {
          const top = i === 0;
          return (
            <motion.div key={c.t} className="absolute" style={{ left: 0, right: 0, top: `${i * 25}vh`, background: C.white, borderRadius: '1.2vw', border: `0.15vw solid ${top && locked ? C.forest : C.beige}`, display: 'flex', gap: '1.4vw', padding: '1.2vw', alignItems: 'center', boxShadow: '0 1.6vw 3vw -1.8vw rgba(23,76,60,.35)', zIndex: 3 - i }}
              initial={{ opacity: 0, x: 80, rotate: 3 }}
              animate={{ opacity: locked && !top ? 0.35 : 1, x: 0, rotate: 0, scale: locked && top ? 1.05 : 1, y: locked && top ? '6vh' : 0 }}
              transition={{ delay: locked ? 0 : 2.0 + i * 0.25, duration: 0.55, ease }}>
              <img src={img(c.p)} alt="" style={{ width: '10vw', height: '10vw', objectFit: 'cover', borderRadius: '0.8vw' }} />
              <div style={{ flex: 1 }}>
                <div style={{ ...display, fontWeight: 800, fontSize: '1.9vw', color: C.charcoal }}>{c.t}</div>
                <div style={{ ...body, fontSize: '1.25vw', color: C.grey, marginTop: '0.3vw' }}>{c.why}</div>
                <div style={{ height: '0.6vw', background: C.beige, borderRadius: 99, marginTop: '0.9vw', overflow: 'hidden' }}>
                  <motion.div style={{ height: '100%', background: i === 0 ? C.forest : C.sage, transformOrigin: 'left', width: `${c.s}%` }}
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 2.4 + i * 0.25, duration: 1, ease }} />
                </div>
              </div>
              <div style={{ ...display, fontWeight: 800, fontSize: '2.8vw', color: i === 0 ? C.forest : C.grey, minWidth: '7vw', textAlign: 'right' }}>{c.s}%</div>
            </motion.div>
          );
        })}
        <motion.div className="absolute" style={{ ...body, left: 0, top: '31vh', fontSize: '1.4vw', fontWeight: 700, color: C.ivory, background: C.forest, padding: '0.5vw 1.1vw', borderRadius: '99px', zIndex: 5 }}
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: locked ? 1 : 0, scale: locked ? 1 : 0.6 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
          Best match · Borrow · Like new
        </motion.div>
      </div>
    </motion.div>
  );
}
