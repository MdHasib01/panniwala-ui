import React, { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react';
import { useScrollProgress, cueWindow, useIsDesktop, useReduced } from '@/src/lib/motion';
import jarImage from '@/src/assets/package1.png';
import {
  ShieldCheck,
  Droplets,
  Microscope,
  Sparkles,
  FlaskConical,
  Award,
  Filter,
  type LucideIcon,
} from 'lucide-react';

interface Step {
  num: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

const STEPS: Step[] = [
  {
    num: '১',
    title: 'মাইক্রন সেডিমেন্ট ফিল্টার',
    desc: 'পানিতে থাকা দৃশ্যমান সূক্ষ্ম বালুকণা, ধূলিকণা ও অন্যান্য ভাসমান পদার্থ সম্পূর্ণ দূর করে।',
    icon: Filter,
  },
  {
    num: '২',
    title: 'অ্যাক্টিভেটেড কার্বন ফিল্টার',
    desc: 'পানির স্বাভাবিক স্বাদ অক্ষুণ্ণ রেখে অপ্রীতিকর গন্ধ, অতিরিক্ত ক্লোরিন ও কীটনাশক অপসারণ করে।',
    icon: Droplets,
  },
  {
    num: '৩',
    title: 'রিভার্স অসমোসিস (RO) মেমব্রেন',
    desc: '০.০০০১ মাইক্রন মেমব্রেনের মাধ্যমে ক্ষতিকর ভারী ধাতু যেমন আর্সেনিক, সীসা ও লবণ দূর করে।',
    icon: Microscope,
  },
  {
    num: '৪',
    title: 'আল্ট্রাভায়োলেট (UV) স্টেরিলাইজার',
    desc: 'উচ্চ ক্ষমতার UV রশ্মির মাধ্যমে পানিতে থাকা ক্ষতিকর ব্যাকটেরিয়া ও ভাইরাসের ডিএনএ ধ্বংস করে।',
    icon: Sparkles,
  },
  {
    num: '৫',
    title: 'ওজোনাইজেশন (Ozonation)',
    desc: 'অক্সিজেন প্রযুক্তির সাহায্যে পানিকে দীর্ঘদিন প্রাকৃতিকভাবে সতেজ ও জীবাণুমুক্ত রাখে।',
    icon: ShieldCheck,
  },
  {
    num: '৬',
    title: 'ন্যাচারাল মিনারেল রি-অ্যাডিং',
    desc: 'মানবদেহের জন্য উপকারী ক্যালসিয়াম ও ম্যাগনেসিয়াম খনিজ সঠিক মাত্রায় নিশ্চিত করা হয়।',
    icon: FlaskConical,
  },
  {
    num: '৭',
    title: 'অটোমেটেড জার স্যানিটাইজিং',
    desc: '৭০ ডিগ্রি তাপে স্বয়ংক্রিয় জেট ওয়াশারে প্রতিটি জার পরিষ্কার করে এয়ার-টাইট সিল করা হয়।',
    icon: Award,
  },
];

const METRICS = [
  { label: 'TDS', value: '৩০ - ৪৫ ppm', note: 'আদর্শ স্বাদ ও মান' },
  { label: 'pH ব্যালেন্স', value: '৭.২ - ৭.৫', note: 'নিরপেক্ষ' },
  { label: 'কলিফর্ম ও ই-কোলাই', value: '০ (শূন্য)', note: 'ব্যাকটেরিয়ামুক্ত' },
  { label: 'ক্লোরিন ও আর্সেনিক', value: '০.০০ mg/L', note: 'সম্পূর্ণ নিরাপদ' },
];

// Scroll choreography (act progress 0 to 1)
const START = 0.06;
const END = 0.86;
const SPAN = (END - START) / STEPS.length;
const RESULTS_AT = 0.88;
const stepStart = (i: number) => START + i * SPAN;

// Ring geometry
const CX = 300;
const CY = 300;
const R = 272;
const SEG_DEG = 360 / STEPS.length;
const GAP_DEG = 5;

const polar = (deg: number, r = R) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
};

const arcPath = (i: number) => {
  const a0 = i * SEG_DEG + GAP_DEG / 2;
  const a1 = (i + 1) * SEG_DEG - GAP_DEG / 2;
  const s = polar(a0);
  const e = polar(a1);
  return `M ${s.x} ${s.y} A ${R} ${R} 0 0 1 ${e.x} ${e.y}`;
};

/** Sediment specks inside the jar body, each cleared by one stage. */
const SPECKS = Array.from({ length: 30 }, (_, i) => ({
  left: 34 + ((i * 37) % 32),
  top: 34 + ((i * 53) % 46),
  size: 3 + (i % 4),
  stage: i % STEPS.length,
}));

const RingSegment: React.FC<{ i: number; p: MotionValue<number> }> = ({ i, p }) => {
  const s = stepStart(i);
  const length = useTransform(p, [s, s + SPAN], [0, 1]);
  const lit = useTransform(p, [s, s + 0.02], [0, 1]);
  const node = polar(i * SEG_DEG + GAP_DEG / 2 + (SEG_DEG - GAP_DEG) / 2);
  return (
    <g>
      <path d={arcPath(i)} fill="none" stroke="#d9e6ed" strokeWidth={6} strokeLinecap="round" />
      <motion.path
        d={arcPath(i)}
        fill="none"
        stroke="#0873b1"
        strokeWidth={6}
        strokeLinecap="round"
        style={{ pathLength: length }}
      />
      <circle cx={node.x} cy={node.y} r={17} fill="#ffffff" stroke="#d9e6ed" strokeWidth={2} />
      <motion.circle cx={node.x} cy={node.y} r={17} fill="#0873b1" style={{ opacity: lit }} />
      <text
        x={node.x}
        y={node.y + 6}
        textAnchor="middle"
        className="font-display"
        fontSize={17}
        fontWeight={700}
        fill="#4a6475"
      >
        {STEPS[i].num}
      </text>
      <motion.text
        x={node.x}
        y={node.y + 6}
        textAnchor="middle"
        className="font-display"
        fontSize={17}
        fontWeight={700}
        fill="#ffffff"
        style={{ opacity: lit }}
      >
        {STEPS[i].num}
      </motion.text>
    </g>
  );
};

const Speck: React.FC<{ speck: (typeof SPECKS)[number]; p: MotionValue<number> }> = ({ speck, p }) => {
  const s = stepStart(speck.stage);
  const opacity = useTransform(p, [s + SPAN * 0.25, s + SPAN], [1, 0]);
  const y = useTransform(p, [s, s + SPAN], [0, 14]);
  return (
    <motion.span
      className="absolute rounded-full bg-[#6e5432]/55"
      style={{
        left: `${speck.left}%`,
        top: `${speck.top}%`,
        width: speck.size,
        height: speck.size,
        opacity,
        y,
      }}
    />
  );
};

const Caption: React.FC<{ step: Step; i: number; p: MotionValue<number> }> = ({ step, i, p }) => {
  const s = stepStart(i);
  const last = i === STEPS.length - 1;
  const { input, output } =
    i === 0
      ? // Greet: already visible when the stage arrives
        { input: [0, s + SPAN - 0.025, s + SPAN + 0.005], output: [1, 1, 0] }
      : cueWindow(s, last ? RESULTS_AT - 0.01 : s + SPAN);
  const opacity = useTransform(p, input, output);
  const y = useTransform(p, input, i === 0 ? [0, 0, -12] : [14, 0, 0, -12]);
  const Icon = step.icon;
  return (
    <motion.div className="[grid-area:1/1]" style={{ opacity, y }}>
      <div className="flex items-center gap-3">
        <span className="w-11 h-11 rounded-2xl bg-accent text-accent-ink flex items-center justify-center shadow-e2">
          <Icon className="w-5 h-5" />
        </span>
        <span className="text-sm font-semibold text-accent tabular">ধাপ {step.num} / ৭</span>
      </div>
      <h3 className="mt-4 font-display text-2xl sm:text-3xl lg:text-[2.1rem] font-bold tracking-[-0.015em] text-ink leading-[1.15]">
        {step.title}
      </h3>
      <p className="mt-2.5 text-sm sm:text-base text-ink-soft leading-relaxed max-w-md">{step.desc}</p>
    </motion.div>
  );
};

const Results: React.FC<{ p: MotionValue<number> }> = ({ p }) => {
  const opacity = useTransform(p, [RESULTS_AT - 0.005, RESULTS_AT + 0.03], [0, 1]);
  const y = useTransform(p, [RESULTS_AT - 0.005, RESULTS_AT + 0.03], [16, 0]);
  return (
    <motion.div className="[grid-area:1/1]" style={{ opacity, y }}>
      <MetricsPanel />
    </motion.div>
  );
};

const MetricsPanel: React.FC = () => (
  <div className="rounded-3xl bg-surface ring-1 ring-hairline shadow-e2 p-5 sm:p-6 max-w-md">
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-display text-xl sm:text-2xl font-bold text-ink">ল্যাব টেস্ট রিপোর্ট</h3>
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-ink bg-accent px-2.5 py-1 rounded-full">
        <ShieldCheck className="w-3.5 h-3.5" /> BDS-1414 PASS
      </span>
    </div>
    <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4">
      {METRICS.map((m) => (
        <div key={m.label} className="border-t border-hairline pt-3">
          <dt className="text-xs text-ink-soft">{m.label}</dt>
          <dd className="mt-0.5 font-display text-lg font-bold text-ink tabular">{m.value}</dd>
          <dd className="text-[11px] font-semibold text-accent">{m.note}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const Heading: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div>
    <h2
      id="purity-title"
      className={`font-display font-bold tracking-[-0.02em] text-ink leading-[1.1] ${
        compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl lg:text-5xl'
      }`}
    >
      ৭ ধাপে পরিশোধন, আপনার চোখের সামনে
    </h2>
    {!compact && (
      <p className="mt-3 text-sm sm:text-base text-ink-soft max-w-md">
        স্ক্রল করুন, প্রতিটি ধাপে পানি আরও স্বচ্ছ হয়ে উঠবে।
      </p>
    )}
  </div>
);

/** Static version for reduced motion: the whole process readable at once, nothing pinned. */
const StaticProcess: React.FC = () => (
  <section id="purity" aria-labelledby="purity-title" className="py-20 sm:py-28 bg-canvas">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12">
      <div className="lg:col-span-7">
        <Heading />
        <ol className="mt-10 space-y-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.num} className="flex gap-4">
                <span className="w-10 h-10 shrink-0 rounded-xl bg-accent-wash text-accent flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-ink">
                    {step.num}. {step.title}
                  </h3>
                  <p className="text-sm text-ink-soft leading-relaxed">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="lg:col-span-5 space-y-8">
        <img src={jarImage} alt="" className="w-3/4 mx-auto h-auto" />
        <MetricsPanel />
      </div>
    </div>
  </section>
);

export const PurityProcess: React.FC = () => {
  const reduced = useReduced();
  const isDesktop = useIsDesktop();
  const sectionRef = useRef<HTMLElement>(null);
  const p = useScrollProgress({ target: sectionRef, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);

  // Murky water and a murky ground fade as the stages pass.
  const murk = useTransform(p, [START, END], [1, 0]);
  const clearGlow = useTransform(p, [END - 0.1, RESULTS_AT], [0, 1]);

  useMotionValueEvent(p, 'change', (v) => {
    const next = v >= RESULTS_AT ? STEPS.length : Math.max(0, Math.min(STEPS.length - 1, Math.floor((v - START) / SPAN)));
    setActive(next);
  });

  if (reduced) return <StaticProcess />;

  const visual = (
    <div className="relative aspect-square w-[min(80vw,40svh)] sm:w-[min(70vw,46svh)] lg:w-[min(46vw,74svh)] max-w-[640px] mx-auto">
      {/* Clean light that blooms once the water is clear */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(120,198,232,0.55),rgba(245,250,252,0)_70%)]"
        style={{ opacity: clearGlow }}
      />
      <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
        {STEPS.map((_, i) => (
          <RingSegment key={i} i={i} p={p} />
        ))}
      </svg>
      {/* The jar: clear underneath, a murky copy on top that fades stage by stage */}
      <div className="absolute inset-[17%]">
        <img src={jarImage} alt="" className="absolute inset-0 w-full h-full object-contain select-none" draggable={false} />
        <motion.img
          src={jarImage}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain select-none [filter:sepia(0.85)_saturate(1.5)_hue-rotate(-14deg)_brightness(0.8)_contrast(1.05)]"
          style={{ opacity: murk }}
        />
        <div className="absolute inset-0" aria-hidden="true">
          {SPECKS.map((s, i) => (
            <Speck key={i} speck={s} p={p} />
          ))}
        </div>
      </div>
    </div>
  );

  const captions = (
    <div className="grid">
      {STEPS.map((step, i) => (
        <Caption key={step.num} step={step} i={i} p={p} />
      ))}
      <Results p={p} />
    </div>
  );

  const stepDots = (
    <ol className="flex items-center gap-1.5" aria-hidden="true">
      {STEPS.map((step, i) => (
        <li
          key={step.num}
          className={`h-1.5 rounded-full transition-[background-color,transform] duration-200 origin-left w-7 ${
            i <= active ? 'bg-accent' : 'bg-hairline'
          } ${i === active ? 'scale-x-125' : ''}`}
        />
      ))}
    </ol>
  );

  return (
    <section
      id="purity"
      ref={sectionRef}
      data-pinned
      aria-labelledby="purity-title"
      className="relative h-[460vh] lg:h-[480vh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-canvas">
        {/* Murky ground that clears with the water */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_70%_50%,rgba(150,128,92,0.20),rgba(235,232,224,0.55)_55%,rgba(245,250,252,0))]"
          style={{ opacity: murk }}
        />

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-16 pb-24 lg:pb-0">
          {isDesktop ? (
            <div className="grid grid-cols-12 gap-10 h-full items-center">
              <div className="col-span-5 space-y-10">
                <Heading />
                {captions}
                {stepDots}
              </div>
              <div className="col-span-7">{visual}</div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-between gap-4">
              <Heading compact />
              {visual}
              <div className="space-y-4">
                {stepDots}
                {captions}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

