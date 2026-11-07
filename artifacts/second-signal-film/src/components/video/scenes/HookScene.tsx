import { motion } from 'framer-motion';
import { C, img, display, body, ease } from '../shared';

const ITEMS = [
  ['calculator', 6, 8, -8], ['books', 22, 58, 6], ['bicycle', 74, 6, 5], ['keyboard', 84, 52, -6],
  ['camera', 40, 70, -4], ['hostel-kit', 4, 52, 9], ['study-table', 60, 64, 7], ['sports', 88, 18, -10],
  ['decorations', 28, 4, 4], ['electronics', 56, 2, -7], ['laptop-stand', 70, 36, 3], ['drawing-kit', 14, 30, -3],
] as const;

export function HookScene() {
  return (
    <motion.div className="absolute inset-0" style={{ background: C.ivory }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 1 }}>
      {ITEMS.map(([name, x, y, r], i) => (
        <motion.div key={name} className="absolute"
          style={{ left: `${x}vw`, top: `${y}vh`, width: '11vw', padding: '0.5vw 0.5vw 1.6vw', background: C.white, boxShadow: '0 1.2vw 2.4vw -1vw rgba(23,76,60,.25)', borderRadius: '0.4vw' }}
          initial={{ opacity: 0, y: -60, rotate: r * 2, scale: 1.15 }}
          animate={{ opacity: [0, 1, 1, 0.55], y: [-60, 0, 30, 70], rotate: r, scale: 1, filter: ['grayscale(0)', 'grayscale(0)', 'grayscale(0)', 'grayscale(1)'] }}
          transition={{ duration: 5, times: [0, 0.12, 0.55, 1], delay: i * 0.06, ease: 'easeOut' }}>
          <img src={img(name)} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', borderRadius: '0.2vw' }} />
        </motion.div>
      ))}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 45% at 50% 50%, rgba(248,247,242,.96) 40%, rgba(248,247,242,0) 100%)' }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ zIndex: 5 }}>
        {[['Every semester,', 0.3, C.charcoal], ['good things get', 1.0, C.charcoal], ['left behind.', 1.8, C.forest]].map(([t, d, col]) => (
          <div key={t as string} style={{ overflow: 'hidden', paddingBottom: '0.4vw' }}>
            <motion.div style={{ ...display, fontWeight: 800, fontSize: '6.4vw', lineHeight: 1.02, color: col as string }}
              initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: d as number, duration: 0.7, ease }}>{t}</motion.div>
          </div>
        ))}
        <motion.div style={{ ...body, marginTop: '2vw', fontSize: '1.5vw', color: C.grey, letterSpacing: '0.18em', textTransform: 'uppercase' }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.1, duration: 0.6 }}>
          Calculators · Cycles · Books · Desks
        </motion.div>
      </div>
      <motion.div className="absolute rounded-full" style={{ left: '50%', top: '50%', width: '4vw', height: '4vw', marginLeft: '-2vw', marginTop: '-2vw', background: C.forest, zIndex: 10 }}
        initial={{ scale: 0 }} animate={{ scale: [0, 1, 1, 60] }} transition={{ duration: 1.1, times: [0, 0.3, 0.45, 1], delay: 4.15, ease: 'easeIn' }} />
    </motion.div>
  );
}
