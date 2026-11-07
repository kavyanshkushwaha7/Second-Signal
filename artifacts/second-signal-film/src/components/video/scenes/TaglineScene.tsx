import { motion } from 'framer-motion';
import { C, display, body, ease, LogoMark, Wordmark } from '../shared';

const LINES: [string, string, number][] = [['Give', 'More.', 0.05], ['Waste', 'Less.', 0.7], ['Connect', 'Better.', 1.85]];

export function TaglineScene() {
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ background: C.forest }}
      initial={{ clipPath: 'circle(0% at 50% 50%)' }} animate={{ clipPath: 'circle(150% at 50% 50%)' }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease }}>
      <motion.div className="absolute rounded-full" style={{ right: '-18vw', top: '-30vh', width: '60vw', height: '60vw', border: `0.2vw solid ${C.sage}`, opacity: 0.25 }}
        initial={{ scale: 0.6 }} animate={{ scale: 1.1 }} transition={{ duration: 5.3, ease: 'easeOut' }} />
      <motion.div className="absolute rounded-full" style={{ right: '-8vw', top: '-12vh', width: '36vw', height: '36vw', border: `0.2vw solid ${C.sage}`, opacity: 0.35 }}
        initial={{ scale: 0.6 }} animate={{ scale: 1.1 }} transition={{ duration: 5.3, ease: 'easeOut' }} />
      <div className="absolute" style={{ left: '8vw', top: '13vh' }}>
        {LINES.map(([a, b, d]) => (
          <div key={a} style={{ overflow: 'hidden' }}>
            <motion.div style={{ ...display, fontWeight: 800, fontSize: '8.6vw', lineHeight: 1.04, color: C.ivory }}
              initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ delay: d, duration: 0.55, ease: [0.2, 0.9, 0.2, 1] }}>
              {a} <span style={{ color: C.sage }}>{b}</span>
            </motion.div>
          </div>
        ))}
      </div>
      <motion.div className="absolute flex items-center" style={{ left: '8vw', bottom: '10vh', gap: '1.2vw' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.8, duration: 0.6, ease }}>
        <div style={{ borderRadius: '1.2vw', boxShadow: `0 0 0 0.2vw ${C.sage}` }}><LogoMark size="4.4vw" delay={2.9} /></div>
        <Wordmark size="3vw" light />
        <span style={{ ...body, fontSize: '1.4vw', color: C.sage, marginLeft: '1.4vw', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Campus reuse, together</span>
      </motion.div>
    </motion.div>
  );
}
