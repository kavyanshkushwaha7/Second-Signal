import { motion } from 'framer-motion';
import { C, display, body, ease } from '../shared';

const WORD = 'SecondSignal';

export function SignalScene() {
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ background: C.forest }}
      initial={{ opacity: 1 }} exit={{ clipPath: 'circle(0% at 22% 62%)' }} transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div key={i} className="absolute rounded-full" style={{ left: '22vw', top: '62vh', width: '10vw', height: '10vw', marginLeft: '-5vw', marginTop: '-5vw', border: `0.15vw solid ${C.sage}` }}
          initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 9, opacity: [0, 0.5, 0] }}
          transition={{ duration: 2.6, delay: 0.6 + i * 1.3, ease: 'easeOut' }} />
      ))}
      <motion.svg viewBox="0 0 32 32" className="absolute" style={{ left: '8vw', top: '18vh', width: '30vw', height: '30vw' }}
        initial={{ scale: 1.25 }} animate={{ scale: 1 }} transition={{ duration: 5, ease: 'easeOut' }}>
        <circle cx="11" cy="21" r="2.6" fill={C.ivory} />
        <motion.path d="M11 14.5a6.5 6.5 0 0 1 6.5 6.5" stroke={C.sage} strokeWidth="2.2" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.6, ease }} />
        <motion.path d="M11 8.5A12.5 12.5 0 0 1 23.5 21" stroke={C.ivory} strokeWidth="2.2" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.75, duration: 0.7, ease }} />
      </motion.svg>
      <div className="absolute" style={{ left: '44vw', top: '32vh' }}>
        <div style={{ ...display, fontWeight: 800, fontSize: '7.6vw', lineHeight: 1, color: C.ivory, display: 'flex' }}>
          {WORD.split('').map((ch, i) => (
            <motion.span key={i} style={{ color: i >= 6 ? C.sage : C.ivory, display: 'inline-block' }}
              initial={{ opacity: 0, y: '0.4em' }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 + i * 0.05, duration: 0.45, ease }}>{ch}</motion.span>
          ))}
        </div>
        <motion.div style={{ height: '0.25vw', background: C.sage, marginTop: '1.6vw', transformOrigin: 'left', width: '40vw' }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 2.2, duration: 0.8, ease }} />
        <motion.div style={{ ...body, fontSize: '2.3vw', color: C.ivory, opacity: 0.9, marginTop: '1.6vw' }}
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 0.9, x: 0 }} transition={{ delay: 2.6, duration: 0.6 }}>
          The campus reuse marketplace.
        </motion.div>
        <motion.div style={{ ...body, fontSize: '1.5vw', color: C.sage, marginTop: '0.8vw', letterSpacing: '0.16em', textTransform: 'uppercase' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2, duration: 0.6 }}>
          From one student to the next
        </motion.div>
      </div>
    </motion.div>
  );
}
