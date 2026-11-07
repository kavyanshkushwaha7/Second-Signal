import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSceneTimer } from '@/lib/video';
import { C, img, display, body, ease } from '../shared';

const WAYS = [
  { verb: 'Buy.', photo: 'calculator', title: 'Casio fx-991EX', tag: 'Sell', meta: '₹450 · Like new', owner: 'Aarav M. · Engineering' },
  { verb: 'Give.', photo: 'hostel-kit', title: 'Hostel essentials kit', tag: 'Give Away', meta: 'Free · Pick up Hostel B', owner: 'Meera K. · Year 4' },
  { verb: 'Borrow.', photo: 'bicycle', title: 'City bicycle', tag: 'Borrow', meta: '7 days · Return by Fri', owner: 'Rohan S. · Physics' },
  { verb: 'Exchange.', photo: 'keyboard', title: 'Mechanical keyboard', tag: 'Exchange', meta: 'Wants: wireless mouse', owner: 'Tanvi P. · CSE' },
];

export function WaysScene() {
  const [k, setK] = useState(0);
  useSceneTimer([{ time: 1450, callback: () => setK(1) }, { time: 2900, callback: () => setK(2) }, { time: 4350, callback: () => setK(3) }]);
  const w = WAYS[k];
  return (
    <motion.div className="absolute inset-0" style={{ background: C.ivory }}
      initial={{ opacity: 1 }} exit={{ opacity: 0, x: '-8vw' }} transition={{ duration: 0.6, ease }}>
      <div className="absolute" style={{ left: '7vw', top: '14vh' }}>
        <motion.div style={{ ...body, fontSize: '1.4vw', color: C.grey, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.5vw' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Four ways to pass it on</motion.div>
        {WAYS.map((x, i) => (
          <motion.div key={x.verb} style={{ ...display, fontWeight: 800, fontSize: '6.8vw', lineHeight: 1.05, position: 'relative', width: 'fit-content' }}
            initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0, color: i === k ? C.forest : '#CFCDC4' }}
            transition={{ opacity: { delay: 0.1 + i * 0.1 }, x: { delay: 0.1 + i * 0.1, duration: 0.6, ease }, color: { duration: 0.3 } }}>
            {x.verb}
            <motion.div style={{ position: 'absolute', left: 0, right: 0, bottom: '0.6vw', height: '0.9vw', background: C.sage, zIndex: -1, transformOrigin: 'left', opacity: 0.6 }}
              animate={{ scaleX: i === k ? 1 : 0 }} transition={{ duration: 0.45, ease }} />
          </motion.div>
        ))}
      </div>
      <div className="absolute" style={{ right: '7vw', top: '10vh', width: '38vw', height: '80vh', perspective: '1200px' }}>
        <AnimatePresence mode="popLayout">
          <motion.div key={w.photo} className="absolute inset-0" style={{ background: C.white, borderRadius: '1.4vw', border: `1px solid ${C.beige}`, boxShadow: '0 3vw 5vw -2.5vw rgba(23,76,60,.35)', overflow: 'hidden' }}
            initial={{ opacity: 0, scale: 0.8, z: -200, rotate: 4 }} animate={{ opacity: 1, scale: 1, z: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.12, y: '-6vh', rotate: -3 }} transition={{ duration: 0.6, ease }}>
            <div style={{ height: '68%', overflow: 'hidden', position: 'relative' }}>
              <motion.img src={img(w.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: 'easeOut' }} />
              <div style={{ ...body, position: 'absolute', left: '1.4vw', top: '1.4vw', background: C.forest, color: C.ivory, fontSize: '1.3vw', fontWeight: 700, padding: '0.5vw 1.1vw', borderRadius: '99px' }}>{w.tag}</div>
            </div>
            <div style={{ padding: '1.8vw 2vw' }}>
              <div style={{ ...display, fontWeight: 800, fontSize: '2.6vw', color: C.charcoal }}>{w.title}</div>
              <div style={{ ...body, fontSize: '1.7vw', color: C.forest, fontWeight: 700, marginTop: '0.4vw' }}>{w.meta}</div>
              <div style={{ ...body, fontSize: '1.4vw', color: C.grey, marginTop: '0.6vw' }}>{w.owner}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
