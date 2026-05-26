// portfolio.jsx — main app
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "typePair": "bricolage",
  "accent": "#C9B89A",
  "heroVariant": "editorial",
  "projectDensity": "alternating",
  "cursor": "native",
  "microMagnetic": true,
  "microMarquee": true,
  "microReveal": true
}/*EDITMODE-END*/;

// ─── Data ────────────────────────────────────────────────────────────────────
const PROJECTS = [
  { n: "01", title: "Lumen Health", cat: "Brand & Product", desc:
    "Identity system and patient-facing app for a preventative-care clinic in Brooklyn. Reduced onboarding drop-off by 38%.",
    role: "Lead Designer", year: "2024", tile: "var(--tile-2)" },
  { n: "02", title: "Halcyon Studio", cat: "Editorial Site", desc:
    "Editorial portfolio and CMS for a furniture studio. A quiet system of grids, ratios and inked typography.",
    role: "Design + Build", year: "2024", tile: "var(--tile-3)" },
  { n: "03", title: "Sundial OS", cat: "Interface System", desc:
    "Operator-class desktop environment built around a calm, monochromatic command vocabulary. ⌘K everywhere.",
    role: "Design Director", year: "2023", tile: "var(--tile-4)" },
  { n: "04", title: "Marlow & Co.", cat: "Identity", desc:
    "Wordmark and stationery for a multidisciplinary practice. Quiet, but it carries.",
    role: "Designer", year: "2023", tile: "var(--tile)" },
  { n: "05", title: "Field Notes", cat: "Mobile App", desc:
    "A pocket research tool for anthropologists, ethnographers and the merely curious.",
    role: "Product Designer", year: "2022", tile: "var(--tile-2)" },
  { n: "06", title: "Atlas Atelier", cat: "Web + Commerce", desc:
    "End-to-end direct-to-consumer experience for a small-batch ceramics atelier. Quiet checkout, loud objects.",
    role: "Lead Designer", year: "2022", tile: "var(--tile-3)" },
];

const WRITINGS = [
  { date: "May · 2026", read: "8 min · Essay",
    title: "On Restraint as a Design Tool",
    teaser: "The discipline of saying no — to colors, to type, to motion — is, in practice, the most generative move you can make on a project. A short defense of the negative space." },
  { date: "Mar · 2026", read: "6 min · Notes",
    title: "Notes on the Editorial Grid",
    teaser: "Why the broadsheet still beats the carousel. A working theory of rhythm, hierarchy, and the rectangular page." },
  { date: "Feb · 2026", read: "11 min · Case",
    title: "Designing the First-Run Experience",
    teaser: "Most onboarding fails on the second screen. A walk through how we redesigned a 14-step flow into something that feels like one." },
  { date: "Dec · 2025", read: "4 min · Notes",
    title: "On Working Out Loud",
    teaser: "Publishing process is a forcing function. It changes what you make and how confidently you make it." },
];

const ARCHIVE = [
  { t: "Northwind Energy — Investor Site", y: "2024", tag: "Web", role: "Design + Build" },
  { t: "Ravello — Cookbook Identity",       y: "2024", tag: "Print", role: "Designer" },
  { t: "Cabin — Hospitality Brand",         y: "2023", tag: "Brand", role: "Designer" },
  { t: "Folio — Notebook for Writers",      y: "2023", tag: "Product", role: "Lead Designer" },
  { t: "Postcard — Email Reimagined",       y: "2022", tag: "Software", role: "Consulting" },
  { t: "Anchor — Boutique Hotel Web",       y: "2022", tag: "Web", role: "Designer" },
  { t: "Margins — Reading App",             y: "2021", tag: "Product", role: "Co-founder" },
  { t: "Sable — Bookshop Identity",         y: "2021", tag: "Brand", role: "Designer" },
];

const TOOLS = [
  ["Design",       "Figma · Origami · Cavalry · Procreate"],
  ["Engineering",  "TypeScript · React · Swift · Tailwind"],
  ["Words",        "iA Writer · Notion · Obsidian"],
  ["Photography",  "Capture One · Fuji X-T5 · Hasselblad 500c"],
  ["Currently",    "Reading Edward Tufte · Visual Display"],
];

const ACCENT_OPTIONS = ["#C9B89A", "#1A4D2E", "#7A5AE0", "#D14E26", "#5B6CFF"];

const TYPE_PAIRS = {
  bricolage:    { display:"'Bricolage Grotesque','Inter',ui-sans-serif,sans-serif", body:"'Inter',ui-sans-serif,sans-serif",  label:"Bricolage + Inter" },
  fraunces:     { display:"'Fraunces','Inter',ui-serif,Georgia,serif",              body:"'Inter',ui-sans-serif,sans-serif",  label:"Fraunces + Inter" },
  inter:        { display:"'Inter',ui-sans-serif,sans-serif",                       body:"'Inter',ui-sans-serif,sans-serif",  label:"Inter (only)" },
  instrument:   { display:"'Instrument Serif','Fraunces',ui-serif,Georgia,serif",   body:"'Geist','Inter',ui-sans-serif,sans-serif",  label:"Instrument + Geist" },
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const on = () => setY(window.scrollY || 0);
    window.addEventListener('scroll', on, { passive: true });
    on();
    return () => window.removeEventListener('scroll', on);
  }, []);
  return y;
}

function useReveal() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.unobserve(el); }});
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

// ─── Cursor ──────────────────────────────────────────────────────────────────
function CustomCursor({ mode }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  useEffect(() => {
    if (mode === 'native') return undefined;
    const d = dotRef.current, r = ringRef.current;
    let x = -100, y = -100, rx = -100, ry = -100;
    const onMove = (e) => { x = e.clientX; y = e.clientY; };
    let raf;
    const tick = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (d) { d.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`; }
      if (r) { r.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; }
      raf = requestAnimationFrame(tick);
    };
    const onOver = (e) => {
      const a = e.target?.closest?.('a,button,.tile,.mailto,.write-card,.arch-row,.chip');
      if (a) { d?.classList.add('hover'); r?.classList.add('hover'); }
    };
    const onOut = (e) => {
      const a = e.target?.closest?.('a,button,.tile,.mailto,.write-card,.arch-row,.chip');
      if (a) { d?.classList.remove('hover'); r?.classList.remove('hover'); }
    };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, [mode]);
  if (mode === 'native' || mode === 'crosshair') return null;
  return (
    <>
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────
function Nav({ theme, onTheme }) {
  const y = useScrollY();
  return (
    <nav className={"nav" + (y > 12 ? " scrolled" : "")}>
      <div className="wrap nav-inner">
        <a href="#top" className="brand">
          Studio<span style={{opacity:.4,margin:"0 6px"}}>·</span>Helix
          <small>est. 2018</small>
        </a>
        <div className="nav-links">
          <a href="#work" className="link-u">Work</a>
          <a href="#about" className="link-u">About</a>
          <a href="#writing" className="link-u">Writing</a>
          <a href="#archive" className="link-u">Archive</a>
          <a href="#contact" className="link-u">Contact</a>
        </div>
        <div className="nav-actions">
          <button className="theme-btn" onClick={onTheme} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <>
                <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3.2" fill="currentColor"/><g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M8 1.4V3"/><path d="M8 13v1.6"/><path d="M1.4 8H3"/><path d="M13 8h1.6"/><path d="M3.3 3.3l1.1 1.1"/><path d="M11.6 11.6l1.1 1.1"/><path d="M12.7 3.3l-1.1 1.1"/><path d="M4.4 11.6l-1.1 1.1"/></g></svg>
                Light
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" fill="none"><path d="M13.2 9.4A5.6 5.6 0 0 1 6.6 2.8a5.6 5.6 0 1 0 6.6 6.6Z" fill="currentColor"/></svg>
                Dark
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero({ variant }) {
  // Variants: editorial (default left), centered, two-col, marquee
  const status = (
    <div className="mono" style={{display:'inline-flex',alignItems:'center'}}>
      <span className="dot" />Currently building a quieter operating system &nbsp;·&nbsp; New York
    </div>
  );

  if (variant === 'marquee') {
    return (
      <section id="top" style={{paddingTop:'calc(82px + clamp(40px,8vh,120px))',paddingBottom:'clamp(60px,8vh,120px)'}}>
        <div className="wrap">
          <div className="mono" style={{marginBottom:24}}>Portfolio &nbsp;/&nbsp; 2018 — Present</div>
          <h1 className="display" style={{fontSize:'clamp(72px,18vw,280px)',margin:0,fontWeight:300,letterSpacing:'-.045em'}}>
            Designer<br/><em style={{fontStyle:'italic',fontWeight:400,opacity:.8}}>at large.</em>
          </h1>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:48,gap:32,flexWrap:'wrap'}}>
            <p style={{maxWidth:'40ch',margin:0,fontSize:18,lineHeight:1.55,color:'var(--mute)'}}>
              Independent designer working between brand, product and the editorial page. Selected works below — twenty more in the archive.
            </p>
            {status}
          </div>
        </div>
      </section>
    );
  }
  if (variant === 'centered') {
    return (
      <section id="top" style={{paddingTop:'calc(82px + clamp(56px,12vh,160px))',paddingBottom:'clamp(60px,10vh,140px)',textAlign:'center'}}>
        <div className="wrap" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:36}}>
          <div className="mono">{status}</div>
          <h1 className="display" style={{fontSize:'clamp(48px,9vw,128px)',margin:0,maxWidth:'18ch'}}>
            A practice in <em style={{fontStyle:'italic',fontWeight:400,opacity:.85}}>quiet</em>, considered design for ambitious teams.
          </h1>
          <p style={{maxWidth:'56ch',margin:0,fontSize:18,color:'var(--mute)',lineHeight:1.55}}>
            I help founders and product teams ship things that feel inevitable — through brand systems, editorial sites and patient interface work.
          </p>
          <div style={{display:'flex',gap:14,marginTop:8}}>
            <a className="chip" href="#work">Selected work ↓</a>
            <a className="chip" href="#contact">Get in touch →</a>
          </div>
        </div>
      </section>
    );
  }
  if (variant === 'twocol') {
    return (
      <section id="top" style={{paddingTop:'calc(82px + clamp(40px,8vh,120px))',paddingBottom:'clamp(60px,10vh,140px)'}}>
        <div className="wrap grid-12" style={{alignItems:'end'}}>
          <div style={{gridColumn:'span 5'}}>
            <div className="portrait">
              <div className="stripes" />
              <div className="tag-r">[ portrait · 4:5 ]</div>
              <div className="tag">drop image here</div>
            </div>
          </div>
          <div style={{gridColumn:'span 7'}}>
            <div className="mono" style={{marginBottom:20}}>{status}</div>
            <h1 className="display" style={{fontSize:'clamp(44px,7.5vw,108px)',margin:0,maxWidth:'14ch'}}>
              Hello — I'm a designer working at the seam of <em style={{fontStyle:'italic',fontWeight:400,opacity:.85}}>brand</em> and <em style={{fontStyle:'italic',fontWeight:400,opacity:.85}}>product</em>.
            </h1>
            <p style={{maxWidth:'52ch',marginTop:28,fontSize:18,color:'var(--mute)',lineHeight:1.55}}>
              Six years independent, with clients spanning healthcare, hospitality, publishing and a couple of operating systems you may have used today.
            </p>
          </div>
        </div>
      </section>
    );
  }
  // editorial (default)
  return (
    <section id="top" style={{paddingTop:'calc(82px + clamp(56px,12vh,160px))',paddingBottom:'clamp(60px,10vh,140px)'}}>
      <div className="wrap">
        <div style={{marginBottom:32}}>{status}</div>
        <h1 className="display" style={{fontSize:'clamp(48px,10vw,156px)',margin:0,maxWidth:'14ch',fontWeight:400}}>
          Designing quiet, considered systems for the next decade of software.
        </h1>
        <div className="grid-12" style={{marginTop:48,alignItems:'start'}}>
          <div style={{gridColumn:'span 2'}}>
            <div className="mono">Section / 00</div>
          </div>
          <div style={{gridColumn:'span 5'}}>
            <p style={{margin:0,fontSize:18,color:'var(--ink)',lineHeight:1.55,maxWidth:'42ch'}}>
              Independent designer — brand, product and editorial. Currently partnered with two early-stage teams and writing about the craft on the side.
            </p>
          </div>
          <div style={{gridColumn:'span 5'}}>
            <p style={{margin:0,fontSize:14,color:'var(--mute)',lineHeight:1.6,maxWidth:'42ch'}}>
              Previously at Field, Linear and a small consultancy in London. Open to long-term partnerships and one-week sprints. Booking from Q3 2026.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Project tile ────────────────────────────────────────────────────────────
function Tile({ project, height = 520, numSize = 280, marquee = true, reveal = true }) {
  const [ref, seen] = useReveal();
  const cls = "tile hover-lift" + (reveal && seen ? " in" : reveal ? "" : " in") +
              (marquee ? " marquee-on" : "");
  return (
    <a href="#work" ref={ref} className={cls}
       style={{display:'block',height,background:project.tile,textDecoration:'none',color:'inherit'}}>
      <div className="corner">{project.n} &nbsp;/&nbsp; {project.cat}</div>
      <div className="num" style={{
        fontSize: numSize, right: '6%', bottom: '-0.16em', letterSpacing: '-.06em',
      }}>{project.n}</div>
      <div className="meta">
        <span style={{maxWidth:'70%',overflow:'hidden'}}>
          {marquee ? (
            <span className="marquee"><span>{project.title} &nbsp; · &nbsp; {project.title} &nbsp; · &nbsp;</span></span>
          ) : project.title}
        </span>
        <span>{project.role} · {project.year}</span>
      </div>
      {reveal && <div className="veil" />}
    </a>
  );
}

// ─── Selected Projects ───────────────────────────────────────────────────────
function Selected({ density, marquee, reveal }) {
  return (
    <section id="work">
      <div className="wrap">
        <div className="sec-eyebrow">
          <span className="num">01</span><span>— Selected Work</span>
          <span className="line" /><span>Six of twenty-two</span>
        </div>

        <div style={{marginBottom:96}}>
          <div className="display" style={{
            fontSize:'clamp(28px,4vw,52px)',maxWidth:'22ch',lineHeight:1.1,
            marginBottom:8,color:'var(--ink)'}}>
            A small, opinionated set of recent partnerships across brand, product and editorial.
          </div>
          <div style={{color:'var(--mute)',fontSize:15,maxWidth:'52ch'}}>
            Each one is documented as a case study with the messy middle intact — sketches, dead ends, the brief before it became the brief.
          </div>
        </div>

        {density === 'uniform' ? (
          <UniformGrid marquee={marquee} reveal={reveal} />
        ) : (
          <Alternating marquee={marquee} reveal={reveal} />
        )}
      </div>
    </section>
  );
}

function Alternating({ marquee, reveal }) {
  // alternating asymmetric: full / split-12 / offset-7 / split-12
  const [p1, p2, p3, p4, p5, p6] = PROJECTS;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'clamp(40px,7vh,96px)'}}>

      {/* 1 — Full bleed */}
      <Tile project={p1} height={'min(620px,72vh)'} numSize={'clamp(180px,28vw,420px)'}
            marquee={marquee} reveal={reveal} />

      {/* 2/3 — Asymmetric split */}
      <div className="grid-12">
        <div style={{gridColumn:'span 7'}}>
          <Tile project={p2} height={520} numSize={280} marquee={marquee} reveal={reveal} />
        </div>
        <div style={{gridColumn:'span 5',display:'flex',flexDirection:'column',gap:24}}>
          <div className="mono">{p3.n} &nbsp;/&nbsp; {p3.cat}</div>
          <Tile project={p3} height={392} numSize={200} marquee={marquee} reveal={reveal} />
          <p style={{color:'var(--mute)',fontSize:14,margin:0,maxWidth:'34ch',lineHeight:1.6}}>
            {p3.desc}
          </p>
        </div>
      </div>

      {/* 4 — Offset right, copy left */}
      <div className="grid-12" style={{alignItems:'center'}}>
        <div style={{gridColumn:'span 4'}}>
          <div className="mono" style={{marginBottom:16}}>{p4.n} &nbsp;/&nbsp; {p4.cat}</div>
          <h3 className="display" style={{fontSize:'clamp(28px,3.6vw,46px)',margin:'0 0 18px',
            fontWeight:400,letterSpacing:'-.02em',lineHeight:1.05}}>
            {p4.title}
          </h3>
          <p style={{color:'var(--mute)',fontSize:15,margin:0,maxWidth:'34ch',lineHeight:1.6}}>
            {p4.desc}
          </p>
          <a href="#work" className="link-u always" style={{marginTop:24,display:'inline-block',
            fontFamily:'var(--mono)',fontSize:11,letterSpacing:'.08em',textTransform:'uppercase'}}>
            View case study →
          </a>
        </div>
        <div style={{gridColumn:'span 8',gridColumnStart:5}}>
          <Tile project={p4} height={480} numSize={260} marquee={marquee} reveal={reveal} />
        </div>
      </div>

      {/* 5/6 — Symmetric split */}
      <div className="grid-12">
        <div style={{gridColumn:'span 6'}}>
          <Tile project={p5} height={460} numSize={240} marquee={marquee} reveal={reveal} />
        </div>
        <div style={{gridColumn:'span 6'}}>
          <Tile project={p6} height={460} numSize={240} marquee={marquee} reveal={reveal} />
        </div>
      </div>

    </div>
  );
}

function UniformGrid({ marquee, reveal }) {
  return (
    <div className="grid-12">
      {PROJECTS.map((p) => (
        <div key={p.n} style={{gridColumn:'span 6'}}>
          <Tile project={p} height={440} numSize={220} marquee={marquee} reveal={reveal} />
          <div style={{display:'flex',justifyContent:'space-between',marginTop:18,
            color:'var(--mute)',fontSize:13.5}}>
            <span style={{color:'var(--ink)',fontSize:16}}>{p.title}</span>
            <span style={{fontFamily:'var(--mono)',fontSize:10.5,letterSpacing:'.04em',
              textTransform:'uppercase'}}>{p.cat}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about">
      <div className="wrap">
        <div className="sec-eyebrow">
          <span className="num">02</span><span>— About</span>
          <span className="line" /><span>Practice notes</span>
        </div>
        <div className="grid-12" style={{rowGap:48}}>
          <div style={{gridColumn:'span 4'}}>
            <div className="portrait">
              <div className="stripes" />
              <div className="tag-r">[ portrait · 4:5 ]</div>
              <div className="tag">drop image here</div>
            </div>
            <p className="mono" style={{marginTop:12}}>Brooklyn, NY · b. 1992</p>
          </div>

          <div style={{gridColumn:'span 8'}}>
            <h2 className="display" style={{
              fontSize:'clamp(28px,4.2vw,56px)',margin:'0 0 28px',fontWeight:400,
              letterSpacing:'-.025em',lineHeight:1.08,maxWidth:'22ch'}}>
              A designer who treats the brief as the most interesting object in the room.
            </h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'40px 56px'}}>
              <p style={{margin:0,fontSize:16,color:'var(--ink)',lineHeight:1.65,maxWidth:'42ch'}}>
                I'm an independent designer working between brand and product. My practice is small on purpose — usually one or two engagements at a time, with the kind of teams who want a long, careful look at what they're building.
              </p>
              <p style={{margin:0,fontSize:16,color:'var(--mute)',lineHeight:1.65,maxWidth:'42ch'}}>
                Before going independent in 2022 I led design at a small SaaS company and spent two years at a London consultancy working with publishers, museums and a national broadcaster.
              </p>
            </div>

            <div style={{marginTop:80}}>
              <div className="mono" style={{marginBottom:20}}>— Philosophy</div>
              <p className="display" style={{
                fontSize:'clamp(22px,2.4vw,34px)',margin:0,fontWeight:400,
                letterSpacing:'-.015em',lineHeight:1.25,maxWidth:'36ch',color:'var(--ink)'}}>
                <em style={{fontStyle:'italic',fontWeight:400,opacity:.85}}>“Restraint is a tool.”</em> Most projects are improved by removing things. The hard part is knowing which things, and in what order.
              </p>
            </div>

            <div style={{marginTop:80}}>
              <div className="mono" style={{marginBottom:8}}>— Tools &amp; Currently</div>
              <div>{TOOLS.map(([k,v]) => (
                <div key={k} className="skill-row">
                  <span className="k">{k}</span><span className="v">{v}</span>
                </div>
              ))}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Writing ─────────────────────────────────────────────────────────────────
function Writing() {
  return (
    <section id="writing">
      <div className="wrap">
        <div className="sec-eyebrow">
          <span className="num">03</span><span>— Writing &amp; Insights</span>
          <span className="line" /><span>Notes from the studio</span>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr',marginBottom:64}}>
          <h2 className="display" style={{
            fontSize:'clamp(28px,4vw,48px)',margin:0,fontWeight:400,
            letterSpacing:'-.02em',lineHeight:1.1,maxWidth:'28ch'}}>
            Process, half-baked ideas, occasional manifestos. Updated when there's something worth saying.
          </h2>
        </div>

        <div>
          {WRITINGS.map((w) => (
            <a key={w.title} className="write-card" href="#writing">
              <span className="date">{w.date}</span>
              <div>
                <h3>{w.title}</h3>
                <p>{w.teaser}</p>
              </div>
              <span className="meta">{w.read}<br/><span style={{opacity:.6}}>Read →</span></span>
            </a>
          ))}
        </div>

        <div style={{marginTop:48,textAlign:'center'}}>
          <a className="link-u always" href="#writing" style={{
            fontFamily:'var(--mono)',fontSize:11,letterSpacing:'.08em',textTransform:'uppercase'}}>
            View all writing →
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Archive ─────────────────────────────────────────────────────────────────
function Archive() {
  return (
    <section id="archive" className="tight">
      <div className="wrap">
        <div className="sec-eyebrow">
          <span className="num">04</span><span>— Archive</span>
          <span className="line" /><span>2018 – Present</span>
        </div>

        <div style={{marginBottom:48,maxWidth:'56ch'}}>
          <p style={{margin:0,fontSize:16,color:'var(--mute)',lineHeight:1.6}}>
            A condensed list of older work, small jobs and one-week sprints. Hover for the year &amp; role; ask for details if anything sparks.
          </p>
        </div>

        <div>
          {ARCHIVE.map((r, i) => (
            <a key={r.t} className="arch-row" href="#archive" style={{textDecoration:'none',color:'inherit'}}>
              <span className="y">{String(i + 1).padStart(2,'0')}</span>
              <span className="t">{r.t}</span>
              <span className="tag">{r.tag}</span>
              <span className="role">{r.role}</span>
              <span className="y">{r.y}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────
function Contact() {
  return (
    <section id="contact">
      <div className="wrap">
        <div className="sec-eyebrow">
          <span className="num">05</span><span>— Contact</span>
          <span className="line" /><span>Booking from Q3 2026</span>
        </div>

        <div style={{maxWidth:'24ch',marginBottom:48}}>
          <p className="mono">Have a project in mind?</p>
          <h2 className="display" style={{fontSize:'clamp(32px,5vw,72px)',margin:'8px 0 0',
            fontWeight:400,letterSpacing:'-.025em',lineHeight:1.05}}>
            Let's make something <em style={{fontStyle:'italic',fontWeight:400,opacity:.85}}>quiet</em>, useful and a little surprising.
          </h2>
        </div>

        <a className="mailto" href="mailto:studio@helix.work">
          studio@helix.work <span className="arrow">↗</span>
        </a>

        <div className="grid-12" style={{marginTop:64,rowGap:32}}>
          <div style={{gridColumn:'span 4'}}>
            <div className="mono" style={{marginBottom:14}}>— Elsewhere</div>
            <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:8,fontSize:15}}>
              <li><a className="link-u" href="#" >Twitter / X</a></li>
              <li><a className="link-u" href="#" >Are.na</a></li>
              <li><a className="link-u" href="#" >Read.cv</a></li>
              <li><a className="link-u" href="#" >LinkedIn</a></li>
              <li><a className="link-u" href="#" >GitHub</a></li>
            </ul>
          </div>

          <div style={{gridColumn:'span 4'}}>
            <div className="mono" style={{marginBottom:14}}>— Studio</div>
            <p style={{margin:0,fontSize:15,color:'var(--mute)',lineHeight:1.65,maxWidth:'30ch'}}>
              74 Greenpoint Avenue<br/>
              Brooklyn, NY 11222<br/>
              <br/>
              By appointment, weekdays.
            </p>
          </div>

          <div style={{gridColumn:'span 4'}}>
            <div className="mono" style={{marginBottom:14}}>— Misc</div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <a href="#" className="chip" style={{justifyContent:'center'}}>
                Download résumé · PDF
              </a>
              <a href="#" className="chip" style={{justifyContent:'center'}}>
                Subscribe to the studio letter
              </a>
              <p className="mono" style={{margin:'6px 0 0'}}>Response within 2 business days.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Foot() {
  return (
    <footer>
      <div className="wrap row">
        <div>© {new Date().getFullYear()} Studio Helix · All rights reserved</div>
        <div className="mono">v 4.2 · Last shipped May 2026</div>
        <div>
          <a className="link-u" href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // theme on html element
  useEffect(() => {
    document.documentElement.dataset.theme = t.theme === 'dark' ? 'dark' : 'light';
  }, [t.theme]);

  // cursor mode
  useEffect(() => {
    document.documentElement.dataset.cursor = t.cursor;
  }, [t.cursor]);

  // accent
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent);
  }, [t.accent]);

  // type pairing
  useEffect(() => {
    const pair = TYPE_PAIRS[t.typePair] || TYPE_PAIRS.bricolage;
    document.documentElement.style.setProperty('--display', pair.display);
    document.documentElement.style.setProperty('--body', pair.body);
  }, [t.typePair]);

  // magnetic links
  useEffect(() => {
    if (!t.microMagnetic) return undefined;
    const targets = document.querySelectorAll('.chip,.theme-btn,.mailto .arrow');
    targets.forEach(el => el.classList.add('mag'));
    const onMove = (e) => {
      targets.forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width/2, cy = r.top + r.height/2;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const d = Math.hypot(dx,dy);
        if (d < 90) {
          el.style.transform = `translate(${dx*0.18}px, ${dy*0.18}px)`;
        } else {
          el.style.transform = '';
        }
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      targets.forEach(el => { el.style.transform = ''; el.classList.remove('mag'); });
    };
  }, [t.microMagnetic, t.heroVariant, t.projectDensity]);

  const toggleTheme = useCallback(() => {
    setTweak('theme', t.theme === 'dark' ? 'light' : 'dark');
  }, [t.theme, setTweak]);

  return (
    <>
      <CustomCursor mode={t.cursor} />
      <Nav theme={t.theme} onTheme={toggleTheme} />
      <Hero variant={t.heroVariant} />
      <Selected density={t.projectDensity}
                marquee={t.microMarquee}
                reveal={t.microReveal} />
      <About />
      <Writing />
      <Archive />
      <Contact />
      <Foot />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakRadio label="Mode" value={t.theme}
                      options={[{value:'light',label:'Light'},{value:'dark',label:'Dark'}]}
                      onChange={(v)=>setTweak('theme', v)} />
          <TweakColor label="Accent" value={t.accent}
                      options={ACCENT_OPTIONS}
                      onChange={(v)=>setTweak('accent', v)} />
        </TweakSection>

        <TweakSection label="Typography">
          <TweakSelect label="Type pairing" value={t.typePair}
                       options={[
                         {value:'bricolage', label:'Bricolage + Inter'},
                         {value:'fraunces',  label:'Fraunces + Inter'},
                         {value:'inter',     label:'Inter (only)'},
                         {value:'instrument',label:'Instrument + Geist'},
                       ]}
                       onChange={(v)=>setTweak('typePair', v)} />
        </TweakSection>

        <TweakSection label="Layout">
          <TweakSelect label="Hero variant" value={t.heroVariant}
                       options={[
                         {value:'editorial', label:'Editorial — left'},
                         {value:'centered',  label:'Centered statement'},
                         {value:'twocol',    label:'Two-column w/ portrait'},
                         {value:'marquee',   label:'Marquee oversized'},
                       ]}
                       onChange={(v)=>setTweak('heroVariant', v)} />
          <TweakRadio label="Projects" value={t.projectDensity}
                      options={[
                        {value:'alternating',label:'Editorial'},
                        {value:'uniform',    label:'Grid'},
                      ]}
                      onChange={(v)=>setTweak('projectDensity', v)} />
        </TweakSection>

        <TweakSection label="Micro-interactions">
          <TweakSelect label="Cursor" value={t.cursor}
                       options={[
                         {value:'native',    label:'Native'},
                         {value:'dot',       label:'Dot + ring follower'},
                         {value:'crosshair', label:'Crosshair'},
                       ]}
                       onChange={(v)=>setTweak('cursor', v)} />
          <TweakToggle label="Magnetic links" value={t.microMagnetic}
                       onChange={(v)=>setTweak('microMagnetic', v)} />
          <TweakToggle label="Marquee on hover" value={t.microMarquee}
                       onChange={(v)=>setTweak('microMarquee', v)} />
          <TweakToggle label="Image reveal" value={t.microReveal}
                       onChange={(v)=>setTweak('microReveal', v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
