import { useState, useRef } from "react";
import { submitToAirtable } from "./airtable.js";

// ── SPECIALIZATIONS BY PROFESSION ─────────────────────────────────────────
const SPECS = {
  "Photographer":    ["Fashion","E-commerce","Editorial","Food","Product","Events","Commercial","Portrait","Architecture","Sports"],
  "Videographer":    ["Fashion Films","Weddings","Documentaries","Commercial","Music Videos","Social Content","Corporate","Events"],
  "Graphic Designer":["Brand Identity","UI/UX","Print","Packaging","Motion Graphics","Social Media","Typography","Illustration"],
  "Fashion Designer":["Ready-to-Wear","Couture","Sportswear","Accessories","Textiles","Costume","Sustainable"],
  "Model":           ["Fashion","Commercial","Editorial","Runway","Fitness","Talent","Plus Size","Kids/Family"],
  "Event Planner":   ["Corporate","Weddings","Activations","Concerts","Private","Exhibitions","Sports"],
  "Wedding Planner": ["Luxury","Destination","Budget-Friendly","Cultural","Outdoor","Micro-Weddings"],
  "Content Creator": ["Lifestyle","Fashion","Food","Travel","Tech","Beauty","Fitness","Gaming"],
  "Media Buyer":     ["Social Media","Google Ads","Programmatic","OOH","TV/Radio","Influencer","Affiliate"],
  "Art Director":    ["Fashion","Advertising","Film","Editorial","Brand","Digital","Retail"],
  "Account Manager": ["Creative Agency","Digital","PR","Media","Brand","Production"],
  "Interior Designer":["Residential","Commercial","Hospitality","Retail","Exhibition","Landscape"],
  "AI Artist / AI Video Creator":["Generative Art","AI Films","Concept Art","Product Viz","Fashion AI","Music Videos"],
};
const PROFESSIONS = Object.keys(SPECS);

// ── COLORS ─────────────────────────────────────────────────────────────────
const C = {
  bg:"#FFFFFF", surface:"#F5F5F5", border:"#E8E8E8",
  black:"#0A0A0A", gray:"#8A8A8A", gray2:"#BDBDBD", error:"#FF3B30",
};
const NHG = "'Neue Haas Grotesk Display Pro', 'Arial Narrow', sans-serif";
const DMS = "'DM Sans', sans-serif";

// ── SHARED UI ──────────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  return (
    <div style={{ width:"100%", height:3, background:C.border, borderRadius:99, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${(current/total)*100}%`, background:C.black, borderRadius:99, transition:"width 0.4s cubic-bezier(0.22,1,0.36,1)" }}/>
    </div>
  );
}

function StepMeta({ step, total, label }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <span style={{ fontFamily:DMS, fontSize:13, color:C.gray }}>{label}</span>
        <span style={{ fontFamily:DMS, fontSize:13, color:C.gray2 }}>{step} / {total}</span>
      </div>
      <ProgressBar current={step} total={total}/>
    </div>
  );
}

function BigTitle({ children }) {
  return (
    <h2 style={{ fontFamily:NHG, fontSize:"clamp(26px,6vw,32px)", fontWeight:800, lineHeight:1.2, color:C.black, marginBottom:28, letterSpacing:"-0.03em" }}>
      {children}
    </h2>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontFamily:DMS, fontSize:13, fontWeight:500, color:C.gray, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>
      {children}
    </div>
  );
}

function TextInput({ placeholder, value, onChange, type="text", multiline }) {
  const shared = { width:"100%", padding:"16px 18px", background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:14, fontFamily:DMS, fontSize:16, color:C.black, transition:"border-color 0.15s" };
  const handlers = {
    onFocus: e => e.target.style.borderColor = C.black,
    onBlur:  e => e.target.style.borderColor = C.border,
  };
  if (multiline) return <textarea style={{ ...shared, minHeight:100, resize:"none", lineHeight:1.6 }} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} {...handlers}/>;
  return <input type={type} style={shared} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} {...handlers}/>;
}

function OptionCard({ label, selected, onToggle, emoji }) {
  return (
    <div onClick={onToggle} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", background:selected?C.black:C.surface, border:`1.5px solid ${selected?C.black:C.border}`, borderRadius:14, cursor:"pointer", transition:"all 0.15s ease", marginBottom:8 }}>
      {emoji && <span style={{ fontSize:20 }}>{emoji}</span>}
      <span style={{ fontFamily:DMS, fontSize:16, fontWeight:400, color:selected?"#fff":C.black, flex:1 }}>{label}</span>
      <div style={{ width:22, height:22, borderRadius:"50%", border:`1.5px solid ${selected?"#ffffff55":C.gray2}`, background:selected?"rgba(255,255,255,0.2)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        {selected && <div style={{ width:9, height:9, borderRadius:"50%", background:"#fff" }}/>}
      </div>
    </div>
  );
}

function TagChip({ label, selected, onToggle }) {
  return (
    <button onClick={onToggle} style={{ padding:"9px 16px", borderRadius:99, border:`1.5px solid ${selected?C.black:C.border}`, background:selected?C.black:"#fff", color:selected?"#fff":C.black, fontFamily:DMS, fontSize:14, fontWeight:selected?500:400, transition:"all 0.15s ease", whiteSpace:"nowrap" }}>
      {label}
    </button>
  );
}

function TagCloud({ options, selected, onToggle }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
      {options.map(o => <TagChip key={o} label={o} selected={selected.includes(o)} onToggle={()=>onToggle(o)}/>)}
    </div>
  );
}

function ContinueBtn({ label="Continue →", onClick, disabled, loading }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{ width:"100%", padding:"18px", background:disabled||loading?C.border:C.black, color:disabled||loading?C.gray2:"#fff", border:"none", borderRadius:16, fontFamily:NHG, fontSize:17, fontWeight:700, letterSpacing:"-0.02em", transition:"all 0.2s ease", marginTop:8 }}>
      {loading ? "Submitting..." : label}
    </button>
  );
}

function BackBtn({ onClick }) {
  return <button onClick={onClick} style={{ background:"none", border:"none", padding:0, fontFamily:DMS, fontSize:15, color:C.gray, display:"flex", alignItems:"center", gap:4 }}>← Back</button>;
}

function YesNoMaybe({ value, onChange }) {
  return (
    <div style={{ display:"flex", gap:8 }}>
      {["Yes","Maybe","No"].map(opt=>(
        <button key={opt} onClick={()=>onChange(opt)} style={{ flex:1, padding:"14px 0", background:value===opt?C.black:C.surface, color:value===opt?"#fff":C.black, border:`1.5px solid ${value===opt?C.black:C.border}`, borderRadius:12, fontFamily:DMS, fontSize:15, fontWeight:500, transition:"all 0.15s" }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, margin:"8px 0 20px" }}>
      <span style={{ fontFamily:DMS, fontSize:12, color:C.gray2, textTransform:"uppercase", letterSpacing:"0.1em", whiteSpace:"nowrap" }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div style={{ background:"#FFF0F0", border:`1.5px solid ${C.error}`, borderRadius:12, padding:"14px 18px", marginBottom:16, fontFamily:DMS, fontSize:14, color:C.error, lineHeight:1.5 }}>
      ⚠️ {message}
    </div>
  );
}

// ── LANDING ────────────────────────────────────────────────────────────────
function Landing({ onSelect }) {
  return (
    <div className="fade-anim" style={{ padding:"60px 0 0" }}>
      <div style={{ fontFamily:DMS, fontSize:12, fontWeight:500, letterSpacing:"0.2em", color:C.gray, textTransform:"uppercase", marginBottom:32 }}>OTJ · Industry Research</div>
      <h1 style={{ fontFamily:NHG, fontSize:"clamp(36px,9vw,52px)", fontWeight:800, lineHeight:1.05, letterSpacing:"-0.04em", color:C.black, marginBottom:20 }}>
        Help us build<br/>the right<br/>platform. 🎯
      </h1>
      <p style={{ fontFamily:DMS, fontSize:16, lineHeight:1.7, color:C.gray, marginBottom:52, maxWidth:380 }}>
        OTJ is a booking system & task platform built for the creative industry in MENA. We need 5 minutes of your time before we write a single line of code.
      </p>
      <SectionDivider label="I am a..."/>
      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:40 }}>
        <button onClick={()=>onSelect("creative")} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px", background:C.black, border:"none", borderRadius:18, cursor:"pointer", textAlign:"left" }}>
          <div>
            <div style={{ fontFamily:NHG, fontSize:20, fontWeight:700, color:"#fff", marginBottom:4 }}>🎨 Creative Professional</div>
            <div style={{ fontFamily:DMS, fontSize:13, color:"rgba(255,255,255,0.55)" }}>Photographer, Designer, Director, Model, etc.</div>
          </div>
          <span style={{ fontSize:22, color:"rgba(255,255,255,0.4)", marginLeft:12 }}>→</span>
        </button>
        <button onClick={()=>onSelect("business")} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px", background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:18, cursor:"pointer", textAlign:"left" }}>
          <div>
            <div style={{ fontFamily:NHG, fontSize:20, fontWeight:700, color:C.black, marginBottom:4 }}>🏢 Brand / Business</div>
            <div style={{ fontFamily:DMS, fontSize:13, color:C.gray }}>Agency, Studio, Brand, or any company hiring creatives.</div>
          </div>
          <span style={{ fontSize:22, color:C.gray2, marginLeft:12 }}>→</span>
        </button>
      </div>
      <p style={{ fontFamily:DMS, fontSize:12, color:C.gray2, textAlign:"center" }}>~5 min · anonymous · MENA-focused</p>
    </div>
  );
}

// ── CREATIVE FORM ──────────────────────────────────────────────────────────
const CREATIVE_STEPS = 9;

function CreativeForm({ onDone }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    name:"", email:"", city:"", ageRange:"",
    profession:"", otherProfession:"", specializations:[], otherSpec:"",
    experience:"", portfolio:"",
    findJobs:[], findStruggle:"", clientStruggle:"",
    projectManage:[],
    wouldUse:{ specialized:"", booking:"", payments:"", communication:"" },
    availability:[], premium:"", phone:"",
  });
  const topRef = useRef(null);

  const set = (key,val) => setData(d=>({...d,[key]:val}));
  const toggleArr = (key,val) => setData(d=>({ ...d, [key]: d[key].includes(val)?d[key].filter(v=>v!==val):[...d[key],val] }));

  const next = () => { setStep(s=>s+1); setError(""); topRef.current?.scrollIntoView({ behavior:"smooth" }); };
  const back = () => { setStep(s=>s-1); setError(""); topRef.current?.scrollIntoView({ behavior:"smooth" }); };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      await submitToAirtable(data, "creative");
      onDone("creative");
    } catch(e) {
      setError("Something went wrong submitting. Please try again, or screenshot your answers and send to us directly.");
    }
    setLoading(false);
  };

  const steps = {
    1: <>
      <BigTitle>Let's start with the basics 👋</BigTitle>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <TextInput placeholder="Full Name" value={data.name} onChange={v=>set("name",v)}/>
        <TextInput placeholder="Email Address" type="email" value={data.email} onChange={v=>set("email",v)}/>
        <TextInput placeholder="City / Country (e.g. Cairo, Egypt)" value={data.city} onChange={v=>set("city",v)}/>
      </div>
      <div style={{ marginTop:20 }}>
        <Label>Age Range</Label>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {["18–24","25–30","30–40","40+"].map(a=><TagChip key={a} label={a} selected={data.ageRange===a} onToggle={()=>set("ageRange",a)}/>)}
        </div>
      </div>
      <div style={{ marginTop:28 }}><ContinueBtn onClick={next} disabled={!data.name||!data.email||!data.city||!data.ageRange}/></div>
    </>,

    2: <>
      <BigTitle>What's your main 🎯 profession?</BigTitle>
      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
        {PROFESSIONS.map(p=>(
          <OptionCard key={p} label={p} selected={data.profession===p} onToggle={()=>{ set("profession",p); set("specializations",[]); set("otherProfession",""); }}/>
        ))}
        {/* Other — write in */}
        <div onClick={()=>{ set("profession","Other"); set("specializations",[]); }} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", background:data.profession==="Other"?C.black:C.surface, border:`1.5px solid ${data.profession==="Other"?C.black:C.border}`, borderRadius:14, cursor:"pointer", transition:"all 0.15s ease", marginBottom:8 }}>
          <div style={{ width:22, height:22, borderRadius:"50%", border:`1.5px solid ${data.profession==="Other"?"#ffffff55":C.gray2}`, background:data.profession==="Other"?"rgba(255,255,255,0.2)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {data.profession==="Other"&&<div style={{ width:9, height:9, borderRadius:"50%", background:"#fff" }}/>}
          </div>
          <span style={{ fontFamily:DMS, fontSize:16, color:data.profession==="Other"?"#fff":C.gray, fontStyle:"italic" }}>Other — write yours</span>
        </div>
        {data.profession==="Other"&&(
          <div style={{ marginTop:4, marginBottom:8, animation:"slideUp 0.25s ease both" }}>
            <TextInput placeholder="e.g. Animator, 3D Artist, Podcast Producer..." value={data.otherProfession} onChange={v=>set("otherProfession",v)}/>
          </div>
        )}
      </div>
      <div style={{ marginTop:12 }}>
        <ContinueBtn onClick={next} disabled={!data.profession||(data.profession==="Other"&&!data.otherProfession)}/>
      </div>
    </>,

    3: <>
      <BigTitle>What's your specialization? 🔬</BigTitle>
      <p style={{ fontFamily:DMS, fontSize:15, color:C.gray, marginBottom:20, lineHeight:1.6 }}>
        Pick everything that describes your work as a <strong style={{ color:C.black }}>{data.profession==="Other"?data.otherProfession:data.profession}</strong>.
      </p>
      {data.profession!=="Other"&&(
        <TagCloud options={SPECS[data.profession]||[]} selected={data.specializations} onToggle={v=>toggleArr("specializations",v)}/>
      )}
      <div style={{ marginTop:data.profession!=="Other"?16:0 }}>
        {data.profession!=="Other"&&(
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8, marginBottom:8 }}>
            <TagChip label="Other — write yours" selected={data.specializations.includes("__other__")} onToggle={()=>toggleArr("specializations","__other__")}/>
          </div>
        )}
        {(data.specializations.includes("__other__")||data.profession==="Other")&&(
          <div style={{ animation:"slideUp 0.25s ease both" }}>
            <TextInput placeholder={data.profession==="Other"?"Describe your specialization...":"e.g. Underwater Photography, Wedding Reels..."} value={data.otherSpec} onChange={v=>set("otherSpec",v)}/>
          </div>
        )}
      </div>
      <div style={{ marginTop:24 }}>
        <Label>Years of experience</Label>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {["0–1","1–3","3–5","5+"].map(y=><TagChip key={y} label={y} selected={data.experience===y} onToggle={()=>set("experience",y)}/>)}
        </div>
      </div>
      <div style={{ marginTop:20 }}>
        <Label>Portfolio Link (optional)</Label>
        <TextInput placeholder="Instagram, Behance, Website..." value={data.portfolio} onChange={v=>set("portfolio",v)}/>
      </div>
      <div style={{ marginTop:20 }}>
        <ContinueBtn onClick={next} disabled={(data.profession!=="Other"&&data.specializations.filter(s=>s!=="__other__").length===0&&!data.otherSpec)||(data.profession==="Other"&&!data.otherSpec)||!data.experience}/>
      </div>
    </>,

    4: <>
      <BigTitle>How do you currently find jobs? 🔍</BigTitle>
      <p style={{ fontFamily:DMS, fontSize:15, color:C.gray, marginBottom:20 }}>Select all that apply.</p>
      <TagCloud options={["Instagram","WhatsApp","Referrals","Freelance platforms","Agencies","LinkedIn","Word of mouth","I don't have a system"]} selected={data.findJobs} onToggle={v=>toggleArr("findJobs",v)}/>
      <div style={{ marginTop:28 }}><ContinueBtn onClick={next} disabled={data.findJobs.length===0}/></div>
    </>,

    5: <>
      <BigTitle>What's your biggest struggle 😤 finding jobs?</BigTitle>
      <TextInput placeholder="Be honest — what actually frustrates you?" value={data.findStruggle} onChange={v=>set("findStruggle",v)} multiline/>
      <div style={{ marginTop:16 }}><ContinueBtn onClick={next} disabled={!data.findStruggle}/></div>
    </>,

    6: <>
      <BigTitle>And with clients? 🤝 What goes wrong?</BigTitle>
      <TextInput placeholder="Late payments, unclear briefs, scope creep..." value={data.clientStruggle} onChange={v=>set("clientStruggle",v)} multiline/>
      <div style={{ marginTop:16 }}>
        <Label>How do you manage projects today?</Label>
        <TagCloud options={["WhatsApp","Notion","Trello","Excel","Email","Just calls","No system"]} selected={data.projectManage} onToggle={v=>toggleArr("projectManage",v)}/>
      </div>
      <div style={{ marginTop:20 }}><ContinueBtn onClick={next} disabled={!data.clientStruggle||data.projectManage.length===0}/></div>
    </>,

    7: <>
      <BigTitle>Would OTJ solve your problems? 🧪</BigTitle>
      <p style={{ fontFamily:DMS, fontSize:15, color:C.gray, marginBottom:24, lineHeight:1.6 }}>Be real. Would you actually use a platform that does these things?</p>
      {[
        { key:"specialized", label:"Helps you get specialized, relevant jobs", emoji:"🎯" },
        { key:"booking",     label:"Organizes all your bookings in one place",  emoji:"📆" },
        { key:"payments",    label:"Structures and secures your payments",       emoji:"💸" },
        { key:"communication",label:"Keeps work comms separate from personal life",emoji:"💬" },
      ].map(item=>(
        <div key={item.key} style={{ marginBottom:16 }}>
          <div style={{ fontFamily:DMS, fontSize:15, fontWeight:500, color:C.black, marginBottom:8 }}>{item.emoji} {item.label}</div>
          <YesNoMaybe value={data.wouldUse[item.key]} onChange={v=>setData(d=>({...d,wouldUse:{...d.wouldUse,[item.key]:v}}))}/>
        </div>
      ))}
      <div style={{ marginTop:20 }}><ContinueBtn onClick={next} disabled={Object.values(data.wouldUse).some(v=>!v)}/></div>
    </>,

    8: <>
      <BigTitle>Your availability 📅 & pricing</BigTitle>
      <Label>You're open for</Label>
      <TagCloud options={["One-time jobs","Long-term contracts","Both"]} selected={data.availability} onToggle={v=>toggleArr("availability",v)}/>
      <div style={{ marginTop:24 }}>
        <Label>Would you pay for premium visibility or extra tools?</Label>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {["Yes","Maybe","No"].map(opt=><TagChip key={opt} label={opt} selected={data.premium===opt} onToggle={()=>set("premium",opt)}/>)}
        </div>
      </div>
      <div style={{ marginTop:20 }}><ContinueBtn onClick={next} disabled={data.availability.length===0||!data.premium}/></div>
    </>,

    9: <>
      <BigTitle>Last step — stay connected 📲</BigTitle>
      <p style={{ fontFamily:DMS, fontSize:15, color:C.gray, marginBottom:20, lineHeight:1.6 }}>Optional. Drop your number or leave it — no spam, just the beta invite.</p>
      <TextInput placeholder="Phone Number (optional)" type="tel" value={data.phone} onChange={v=>set("phone",v)}/>
      {error && <div style={{ marginTop:12 }}><ErrorBanner message={error}/></div>}
      <div style={{ marginTop:24 }}><ContinueBtn label="Submit — I'm in 🚀" onClick={handleSubmit} loading={loading}/></div>
      <p style={{ fontFamily:DMS, fontSize:12, color:C.gray2, textAlign:"center", marginTop:12 }}>Your answers help us build OTJ the right way.</p>
    </>,
  };

  return (
    <div ref={topRef}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        {step>1?<BackBtn onClick={back}/>:<div/>}
        <div style={{ fontFamily:DMS, fontSize:12, color:"#fff", background:C.black, padding:"4px 12px", borderRadius:99 }}>🎨 Creative</div>
      </div>
      <StepMeta step={step} total={CREATIVE_STEPS} label="Creative Form"/>
      <div className="step-anim" key={step}>{steps[step]}</div>
    </div>
  );
}

// ── BUSINESS FORM ──────────────────────────────────────────────────────────
const BIZ_STEPS = 6;

function BusinessForm({ onDone }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    bizName:"", industry:"", city:"", size:"",
    hireFreq:"", findCreatives:[], painPoints:[], projectManage:[],
    wouldUse:{ filter:"", book:"", tasks:"", comms:"", noComm:"" },
    subWould:{ verified:"", system:"", pm:"" },
    budget:"", mustHave:"", contactEmail:"",
  });
  const topRef = useRef(null);

  const set = (key,val) => setData(d=>({...d,[key]:val}));
  const toggleArr = (key,val) => setData(d=>({ ...d, [key]: d[key].includes(val)?d[key].filter(v=>v!==val):[...d[key],val] }));
  const next = () => { setStep(s=>s+1); setError(""); topRef.current?.scrollIntoView({ behavior:"smooth" }); };
  const back = () => { setStep(s=>s-1); setError(""); topRef.current?.scrollIntoView({ behavior:"smooth" }); };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      await submitToAirtable(data, "business");
      onDone("business");
    } catch(e) {
      setError("Something went wrong submitting. Please try again, or screenshot your answers and send to us directly.");
    }
    setLoading(false);
  };

  const steps = {
    1: <>
      <BigTitle>Tell us about your business 🏢</BigTitle>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <TextInput placeholder="Business / Brand Name" value={data.bizName} onChange={v=>set("bizName",v)}/>
        <TextInput placeholder="Industry (e.g. Fashion, F&B, Real Estate...)" value={data.industry} onChange={v=>set("industry",v)}/>
        <TextInput placeholder="City / Country" value={data.city} onChange={v=>set("city",v)}/>
      </div>
      <div style={{ marginTop:20 }}>
        <Label>Team Size</Label>
        {[{val:"Solo founder",emoji:"🧑"},{val:"Small team (2–10)",emoji:"👥"},{val:"Agency (10+)",emoji:"🏛️"},{val:"Enterprise",emoji:"🌐"}].map(({val,emoji})=>(
          <OptionCard key={val} label={val} emoji={emoji} selected={data.size===val} onToggle={()=>set("size",val)}/>
        ))}
      </div>
      <ContinueBtn onClick={next} disabled={!data.bizName||!data.industry||!data.city||!data.size}/>
    </>,

    2: <>
      <BigTitle>How do you hire creatives today? 🔎</BigTitle>
      <Label>How often do you hire?</Label>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:24 }}>
        {["Weekly","Monthly","Occasionally","Rarely","Never yet"].map(f=><TagChip key={f} label={f} selected={data.hireFreq===f} onToggle={()=>set("hireFreq",f)}/>)}
      </div>
      <Label>Where do you find creatives now?</Label>
      <TagCloud options={["Instagram","Referrals","Agencies","Freelance platforms","In-house team","LinkedIn","WhatsApp groups","No consistent method"]} selected={data.findCreatives} onToggle={v=>toggleArr("findCreatives",v)}/>
      <div style={{ marginTop:24 }}><ContinueBtn onClick={next} disabled={!data.hireFreq||data.findCreatives.length===0}/></div>
    </>,

    3: <>
      <BigTitle>What's actually broken? 😩</BigTitle>
      <p style={{ fontFamily:DMS, fontSize:15, color:C.gray, marginBottom:20 }}>Select your top hiring pain points.</p>
      <TagCloud options={["Finding the right specialization","Reliability & professionalism","Budget & pricing transparency","Communication chaos","Missed deadlines","No organized system","Vetting quality","Contracts & legals"]} selected={data.painPoints} onToggle={v=>toggleArr("painPoints",v)}/>
      <div style={{ marginTop:24 }}>
        <Label>How do you manage creative projects today?</Label>
        <TagCloud options={["WhatsApp","Email","Trello / Notion","In-house system","Google Sheets","No system"]} selected={data.projectManage} onToggle={v=>toggleArr("projectManage",v)}/>
      </div>
      <div style={{ marginTop:20 }}><ContinueBtn onClick={next} disabled={data.painPoints.length===0||data.projectManage.length===0}/></div>
    </>,

    4: <>
      <BigTitle>Would OTJ change how you work? 🚀</BigTitle>
      <p style={{ fontFamily:DMS, fontSize:15, color:C.gray, marginBottom:24, lineHeight:1.6 }}>Honest answers only.</p>
      {[
        { key:"filter", label:"Filter creatives by specialization — like a search engine for talent", emoji:"🔍" },
        { key:"book",   label:"Book creatives directly without back-and-forth",                      emoji:"📆" },
        { key:"tasks",  label:"Manage tasks, deliverables & deadlines in one place",                 emoji:"📋" },
        { key:"comms",  label:"Keep all project communication structured & searchable",              emoji:"💬" },
        { key:"noComm", label:"Avoid platform commissions with a flat subscription",                 emoji:"💸" },
      ].map(item=>(
        <div key={item.key} style={{ marginBottom:16 }}>
          <div style={{ fontFamily:DMS, fontSize:15, fontWeight:500, color:C.black, marginBottom:8 }}>{item.emoji} {item.label}</div>
          <YesNoMaybe value={data.wouldUse[item.key]} onChange={v=>setData(d=>({...d,wouldUse:{...d.wouldUse,[item.key]:v}}))}/>
        </div>
      ))}
      <div style={{ marginTop:16 }}><ContinueBtn onClick={next} disabled={Object.values(data.wouldUse).some(v=>!v)}/></div>
    </>,

    5: <>
      <BigTitle>Let's talk 💰 money</BigTitle>
      <p style={{ fontFamily:DMS, fontSize:15, color:C.gray, marginBottom:20, lineHeight:1.6 }}>Would your company pay a subscription for these?</p>
      {[
        { key:"verified", label:"Access to verified, specialized creatives", emoji:"✅" },
        { key:"system",   label:"A structured hiring & booking system",       emoji:"🗂️" },
        { key:"pm",       label:"Built-in project management tools",          emoji:"📊" },
      ].map(item=>(
        <div key={item.key} style={{ marginBottom:16 }}>
          <div style={{ fontFamily:DMS, fontSize:15, fontWeight:500, color:C.black, marginBottom:8 }}>{item.emoji} {item.label}</div>
          <YesNoMaybe value={data.subWould[item.key]} onChange={v=>setData(d=>({...d,subWould:{...d.subWould,[item.key]:v}}))}/>
        </div>
      ))}
      <div style={{ marginTop:20 }}>
        <Label>Monthly budget you'd realistically allocate?</Label>
        <TextInput placeholder="e.g. $200/month — no right answer, be real" value={data.budget} onChange={v=>set("budget",v)}/>
      </div>
      <div style={{ marginTop:16 }}><ContinueBtn onClick={next} disabled={Object.values(data.subWould).some(v=>!v)||!data.budget}/></div>
    </>,

    6: <>
      <BigTitle>Last question — the most important one 🎤</BigTitle>
      <p style={{ fontFamily:DMS, fontSize:15, color:C.gray, marginBottom:16, lineHeight:1.6 }}>
        What one feature would make OTJ an absolute <strong style={{ color:C.black }}>must-have</strong> for your business?
      </p>
      <TextInput placeholder="Don't hold back — your answer shapes what we build first." value={data.mustHave} onChange={v=>set("mustHave",v)} multiline/>
      <div style={{ marginTop:20 }}>
        <Label>Email for beta access (optional)</Label>
        <TextInput placeholder="your@company.com" type="email" value={data.contactEmail} onChange={v=>set("contactEmail",v)}/>
      </div>
      {error && <div style={{ marginTop:12 }}><ErrorBanner message={error}/></div>}
      <div style={{ marginTop:20 }}><ContinueBtn label="Submit — Build OTJ 🚀" onClick={handleSubmit} loading={loading} disabled={!data.mustHave}/></div>
    </>,
  };

  return (
    <div ref={topRef}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        {step>1?<BackBtn onClick={back}/>:<div/>}
        <div style={{ fontFamily:DMS, fontSize:12, color:C.black, background:C.surface, border:`1.5px solid ${C.border}`, padding:"4px 12px", borderRadius:99 }}>🏢 Business</div>
      </div>
      <StepMeta step={step} total={BIZ_STEPS} label="Business Form"/>
      <div className="step-anim" key={step}>{steps[step]}</div>
    </div>
  );
}

// ── THANK YOU ──────────────────────────────────────────────────────────────
function ThankYou({ type, onReset }) {
  return (
    <div className="fade-anim" style={{ paddingTop:60, textAlign:"center" }}>
      <div style={{ fontSize:56, marginBottom:24 }}>{type==="creative"?"🎨":"🏢"}</div>
      <h2 style={{ fontFamily:NHG, fontSize:36, fontWeight:800, color:C.black, marginBottom:16, letterSpacing:"-0.03em", lineHeight:1.1 }}>
        You're part of<br/>building OTJ.
      </h2>
      <p style={{ fontFamily:DMS, fontSize:16, color:C.gray, lineHeight:1.7, marginBottom:40, maxWidth:340, margin:"0 auto 40px" }}>
        Thank you. Your answers will directly shape what we build first. We'll reach out when the beta is ready.
      </p>
      <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
        <button onClick={()=>onReset("creative")} style={{ padding:"13px 22px", borderRadius:12, background:C.black, color:"#fff", border:"none", fontFamily:DMS, fontSize:14, fontWeight:500 }}>Send to a creative →</button>
        <button onClick={()=>onReset("business")} style={{ padding:"13px 22px", borderRadius:12, background:C.surface, color:C.black, border:`1.5px solid ${C.border}`, fontFamily:DMS, fontSize:14, fontWeight:500 }}>Send to a business →</button>
      </div>
      <button onClick={()=>onReset(null)} style={{ display:"block", margin:"20px auto 0", background:"none", border:"none", fontFamily:DMS, fontSize:13, color:C.gray2, cursor:"pointer" }}>Back to start</button>
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [doneType, setDoneType] = useState(null);

  const handleDone = (type) => { setDoneType(type); setScreen("done"); window.scrollTo({ top:0, behavior:"smooth" }); };
  const handleReset = (type) => { setScreen(type||"landing"); window.scrollTo({ top:0, behavior:"smooth" }); };

  return (
    <div style={{ background:"#fff", minHeight:"100vh", maxWidth:480, margin:"0 auto", padding:"0 24px 80px", fontFamily:DMS }}>
      {screen==="landing"  && <Landing onSelect={setScreen}/>}
      {screen==="creative" && <CreativeForm onDone={handleDone}/>}
      {screen==="business" && <BusinessForm onDone={handleDone}/>}
      {screen==="done"     && <ThankYou type={doneType} onReset={handleReset}/>}
    </div>
  );
}
