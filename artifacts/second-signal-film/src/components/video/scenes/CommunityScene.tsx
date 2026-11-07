import { motion } from 'framer-motion';
import { C, img, display, body, ease } from '../shared';

const COLS = [
  [['books', 'Semester 3 textbooks', 'Free'], ['camera', 'DSLR for the fest', '3 days']],
  [['drawing-kit', 'Engineering drawing kit', 'Free'], ['sports', 'Badminton set', '₹300']],
  [['study-table', 'Folding study table', '₹900'], ['decorations', 'Fest decorations', 'Free']],
];

function Card({ p, t, m }: { p: string; t: string; m: string }) {
  return (
    <div style={{ background: C.white, borderRadius: '1vw', border: `1px solid ${C.beige}`, overflow: 'hidden', marginBottom: '1.4vw', boxShadow: '0 1.4vw 2.6vw -1.6vw rgba(23,76,60,.3)' }}>
      <img src={img(p)} alt="" style={{ width: '100%', height: '16vw', objectFit: 'cover', display: 'block' }} />
      <div style={{ padding: '1vw 1.2vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ ...display, fontWeight: 700, fontSize: '1.35vw', color: C.charcoal }}>{t}</span>
        <span style={{ ...body, fontWeight: 700, fontSize: '1.2vw', color: C.forest, background: C.sageSoft, padding: '0.25vw 0.7vw', borderRadius: '99px' }}>{m}</span>
      </div>
    </div>
  );
}

const Bubble = ({ me, text, d }: { me?: boolean; text: string; d: number }) => (
  <motion.div style={{ ...body, alignSelf: me ? 'flex-end' : 'flex-start', background: me ? C.forest : C.white, color: me ? C.ivory : C.charcoal, fontSize: '1.6vw', padding: '1vw 1.4vw', borderRadius: me ? '1.4vw 1.4vw 0.3vw 1.4vw' : '1.4vw 1.4vw 1.4vw 0.3vw', maxWidth: '26vw', boxShadow: '0 1vw 2vw -1vw rgba(23,76,60,.35)', border: me ? 'none' : `1px solid ${C.beige}` }}
    initial={{ opacity: 0, scale: 0.6, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: d, type: 'spring', stiffness: 320, damping: 20 }}>{text}</motion.div>
);

export function CommunityScene() {
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ background: C.ivory }}
      initial={{ opacity: 0, x: '8vw' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.94, filter: 'blur(8px)' }} transition={{ duration: 0.6, ease }}>
      <div className="absolute" style={{ left: '4vw', top: 0, width: '54vw', height: '100vh', display: 'flex', gap: '1.4vw' }}>
        {COLS.map((col, ci) => (
          <motion.div key={ci} style={{ flex: 1 }} initial={{ y: `${40 + ci * 15}vh` }} animate={{ y: `${-14 - ci * 8}vh` }} transition={{ duration: 6.8, ease: [0.3, 0.6, 0.4, 1] }}>
            {[...col, ...col].map(([p, t, m], i) => <Card key={i} p={p} t={t} m={m} />)}
          </motion.div>
        ))}
      </div>
      <div className="absolute" style={{ right: '5vw', top: '14vh', width: '34vw' }}>
        <motion.div style={{ ...display, fontWeight: 800, fontSize: '4.6vw', lineHeight: 1.02, color: C.charcoal }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease }}>
          Your campus,<br /><span style={{ color: C.forest }}>one feed away.</span>
        </motion.div>
        <motion.div style={{ ...body, fontSize: '1.5vw', color: C.grey, marginTop: '1vw' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          Friends, communities and messages, all in one place.
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1vw', marginTop: '3vw' }}>
          <Bubble text="Is the drawing kit still free?" d={1.9} />
          <Bubble me text="Yes! Pick up at Hostel B by 6." d={3.0} />
          <Bubble text="Perfect, see you there." d={4.0} />
        </div>
        <motion.div style={{ ...body, fontSize: '1.15vw', color: C.grey, marginTop: '1.6vw', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>Prototype · simulated chat</motion.div>
      </div>
    </motion.div>
  );
}
