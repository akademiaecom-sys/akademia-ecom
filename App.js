import { useState, useEffect, useCallback } from "react";
import { dbGet, dbSet, dbListen } from "./firebase";

const WEEKS = [
  {
    num:"01", label:"Tydzień 1", goal:"Założenie kont, edukacja, pierwsze kroki",
    tasks:[
      {id:"t1",num:"01",tags:[{label:"Edukacja",cls:"edu"}],title:"Obejrzyj Moduł START i Moduł DROPSHIPPING",desc:"Moduł START (3 lekcje, ~11 min) + Moduł DROPSHIPPING (8 lekcji, ~1h). Zrozumiesz podstawy modelu dropshipping."},
      {id:"t2",num:"02",tags:[{label:"Allegro",cls:"allegro"},{label:"OLX",cls:"olx"}],title:"Załóż 2 konta na Allegro + 1 konto na OLX",desc:"Dywersyfikacja i elastyczność to podstawa. Drugie konto przyda się przy zakładaniu firmy. Prześlij linki na Telegramie."},
      {id:"t3",num:"03",tags:[{label:"Edukacja",cls:"edu"}],title:"Obejrzyj Moduł Konfiguracja Allegro",desc:"17 lekcji (~1h) — konfiguracja konta, cennik dostaw, kody EAN/GTIN, finanse i wypłaty. Pomiń jeśli masz już konto."},
      {id:"t4",num:"04",tags:[{label:"Produkty",cls:"produkt"}],title:"Wystaw używane rzeczy LUB znajdź 10 produktów testowych",desc:"Masz używane przedmioty? Wystaw na Facebook Marketplace / Vinted / OLX. Nie masz? Znajdź 10 produktów i prześlij dostawców."},
    ],
    daily:["Raport dzienny na Telegramie (1–3 zdania lub głosówka)","Każdy poniedziałek: czytaj analizy produktowe z maila (12:00)","Co tydzień do poniedziałku 12:00: raport tygodniowy"],
  },
  {
    num:"02", label:"Tydzień 2", goal:"Pierwsze aukcje, nauka marketingu, weryfikacja schematu",
    tasks:[
      {id:"t5",num:"05",tags:[{label:"Edukacja",cls:"edu"}],title:"Obejrzyj Moduł Allegro START + Allegro Marketing",desc:"Allegro START (7 lekcji, ~34 min) + Marketing (12 lekcji) — złota zasada, trendy, ABC tytułów, miniatury, opisy, SUPERCENA."},
      {id:"t6",num:"06",tags:[{label:"Allegro",cls:"allegro"},{label:"OLX",cls:"olx"}],title:"Wystaw pierwsze aukcje do weryfikacji",desc:"Korzystaj ze schematu aukcji i materiałów z Warsztatów. Prześlij linki na Telegramie do weryfikacji."},
      {id:"t7",num:"07",tags:[{label:"Produkty",cls:"produkt"}],title:"Prześlij kolejne produkty do weryfikacji dostawców",desc:"Dodaj produkty do Excela lub wyślij na Telegramie. Uzupełnij dostawców i linki."},
      {id:"t8",num:"08",tags:[{label:"OLX",cls:"olx"}],title:"Opcjonalnie: Przejrzyj Moduł OLX",desc:"10 lekcji (~1h): weryfikacja konta, miniaturki, ogłoszenie które sprzedaje, wysyłka za pobraniem."},
    ],
    daily:["Raport dzienny na Telegramie każdego dnia pracy","Uzupełnij raport tygodniowy do poniedziałku 12:00","Uzupełniaj Excel z produktami na bieżąco"],
  },
  {
    num:"03", label:"Tydzień 3", goal:"Skalowanie aukcji, pierwsze zamówienie i opinia klienta",
    tasks:[
      {id:"t9",num:"09",tags:[{label:"Allegro",cls:"allegro"},{label:"OLX",cls:"olx"}],title:"Wystawiaj aukcje schematycznie — nowe produkty co tydzień",desc:"Każda aukcja na Allegro musi być wpisana do Excela. Produkty na OLX i Facebook Marketplace wystawiaj systematycznie."},
      {id:"t10",num:"10",tags:[{label:"Allegro",cls:"allegro"}],title:"Zrealizuj pierwsze zamówienie",desc:"Gdy wpadnie zamówienie — od razu informuj na Telegramie. Poślij zdjęcie z panelu zamówień."},
      {id:"t11",num:"11",tags:[{label:"Allegro",cls:"allegro"}],title:"Zadzwoń do klienta po opinię",desc:"Po realizacji zamówienia zadzwoń z prośbą o wystawienie opinii. Użyj schematu rozmowy z materiałów."},
      {id:"t12",num:"12",tags:[{label:"Produkty",cls:"produkt"}],title:"Tygodniowa weryfikacja dostawców — nowa paczka produktów",desc:"Nowe produkty do weryfikacji każdy tydzień. Dodaj do Excela lub wyślij na Telegramie."},
    ],
    daily:["Raport dzienny — co zostało zrobione danego dnia","Uzupełnij Excel: produkty + zamówienia do końca tygodnia","Raport tygodniowy do poniedziałku 12:00"],
  },
  {
    num:"04", label:"Tydzień 4", goal:"Realizacja celu aukcji, podsumowanie, przejście do Etapu 2",
    tasks:[
      {id:"t13",num:"13",tags:[{label:"Allegro",cls:"allegro"},{label:"OLX",cls:"olx"}],title:"Zrealizuj cel aukcji ustalony na rozmowie wprowadzającej",desc:"Wystawiaj tyle aukcji ile ustalono. Im więcej ponad cel, tym szybszy progress."},
      {id:"t14",num:"14",tags:[{label:"Produkty",cls:"produkt"}],title:"Uzupełnij Excel — wszystkie aukcje, dostawcy, zamówienia",desc:"Przed meetem podsumowującym upewnij się, że Excel jest kompletny."},
      {id:"t15",num:"15",tags:[{label:"Raport",cls:"raport"}],title:"Meet podsumowujący — po 30 dniach od startu",desc:"Spotkanie online podsumowujące cały 1 Etap. Wyniki, problemy, wnioski i przejście do Etapu 2."},
      {id:"t16",num:"16",tags:[{label:"Edukacja",cls:"edu"}],title:"Przejrzyj wszystkie materiały uzupełniające",desc:"Schemat aukcji, szukanie produktów, schemat rozmowy po opinię — stosuj je w każdej aukcji."},
    ],
    daily:["✅ 2 konta Allegro + 1 OLX skonfigurowane i aktywne","✅ Aukcje wystawione zgodnie z celem, Excel uzupełniony","✅ Pierwsze zamówienie zrealizowane, opinia uzyskana","🚀 Meet podsumowujący — przejście do Etapu 2"],
  },
];

const EDU_MODULES = [
  {id:"wstep",icon:"🎯",title:"Wstęp",sub:null,desc:"Przygotowanie ofert do skalowania i osiągnięcia przewagi konkurencyjnej.",points:["Cel etapu: skalowanie i przewaga konkurencyjna","Precyzyjna analiza cen dla optymalnych warunków do promocji","Skuteczne kampanie reklamowe zwiększające widoczność","Maksymalizacja współczynnika konwersji"]},
  {id:"aukcja",icon:"🏆",title:"Aukcja 2.0",desc:"",points:[],sub:[
    {id:"tytul",icon:"✍️",title:"Tytuł PRO",desc:"Optymalizacja tytułu pod kątem słów kluczowych.",points:["Analiza słów kluczowych — udział w transakcjach","Dobór fraz o najwyższym potencjale","Struktura: cecha główna + zastosowanie + parametry","Unikanie słów generycznych"]},
    {id:"miniaturka",icon:"🖼️",title:"Miniaturka PRO",desc:"Profesjonalne miniaturki przyciągające uwagę.",points:["Dynamiczne tło i kontekst użycia produktu","Mocne kolory i wysoki kontrast","Elementy graficzne podkreślające parametry","Lifestyle — produkt w akcji"]},
    {id:"zdjecia",icon:"📸",title:"Zdjęcia PRO",desc:"Galeria zdjęć pokazująca produkt z każdej strony.",points:["Zdjęcia techniczne na białym/ciemnym tle","Zdjęcia lifestyle","Szczegóły i detale produktu","Porównanie gabarytów"]},
    {id:"opis",icon:"📝",title:"Opis — Nagłówki",desc:"Struktura opisu z nagłówkami konwertującymi.",points:["Nagłówek: 'TRAFIŁEŚ NA PRODUKT PREMIUM'","Sekcje: O produkcie, Co nowego","Certyfikaty i normy (IPX7, IPX8)","Korzyści dla użytkownika"]},
    {id:"usp",icon:"⭐",title:"Wyróżniki — USP",desc:"5 kluczowych wyróżników budujących przewagę.",points:["Efekt PRZED/PO","Dodatkowa ochrona — gwarancja 5 lat","Social Proof — kolaż zdjęć od klientów","Certyfikaty europejskie","Profesjonalna obsługa po sprzedażowa"]},
  ]},
  {id:"kontakt",icon:"💬",title:"Kontakt z Klientem",desc:"",points:[],sub:[
    {id:"chatgpt",icon:"🤖",title:"Wykorzystanie Chat GPT",desc:"AI do obsługi klienta — profesjonalne odpowiedzi w ułamku czasu.",points:["Szablony odpowiedzi na najczęstsze pytania","Obsługa reklamacji w profesjonalnym tonie","Spójny, parlamentarny styl komunikacji","Oszczędność czasu"]},
  ]},
  {id:"abonamenty",icon:"📦",title:"Abonamenty Allegro",desc:"",points:[],sub:[
    {id:"abonament",icon:"💳",title:"Wykorzystanie Abonamentu",desc:"Abonament podstawowy (49 zł/mies.) — zniesienie opłaty transakcyjnej.",points:["Zniesienie opłaty transakcyjnej","Logo w ramach ofert i profilu","Zdalny dostęp mentora do edycji aukcji","Analiza sprzedaży i statystyki konta","Tagi ofertowe"]},
  ]},
  {id:"ads",icon:"📢",title:"Allegro ADS",desc:"",points:[],sub:[
    {id:"ads-w",icon:"🚀",title:"Schemat reklam",desc:"Konfiguracja pierwszych kampanii Allegro Ads.",points:["Pierwsze kampanie: Oferty Sponsorowane (CPC)","Dobór produktów — bestsellery z potencjałem","Ustawienie budżetu dziennego","Monitorowanie ROAS","Schemat: testuj → analizuj → skaluj"]},
  ]},
  {id:"analityka",icon:"📊",title:"Analityka",desc:"",points:[],sub:[
    {id:"analityka-w",icon:"📈",title:"Schemat analizy sprzedaży",desc:"Excel do śledzenia sprzedaży miesięcznej i wyników konta.",points:["Arkusz Excel: sprzedaż miesięczna","Kolumny: oferty, zamówienia, reklamacje, zysk","Analiza bestsellerów","Wynik konta Allegro","Cotygodniowy przegląd z mentorem"]},
  ]},
];

const TAG_STYLES = {
  allegro:{bg:"rgba(255,100,50,0.18)",color:"#ff9070"},
  olx:{bg:"rgba(50,180,120,0.18)",color:"#60e0a0"},
  edu:{bg:"rgba(100,150,255,0.18)",color:"#90b8ff"},
  raport:{bg:"rgba(200,100,255,0.18)",color:"#d090ff"},
  produkt:{bg:"rgba(255,200,50,0.18)",color:"#ffd060"},
};

const ALL_TASK_IDS = WEEKS.flatMap(w=>w.tasks.map(t=>t.id));
const getAllEduIds = () => EDU_MODULES.flatMap(m=>m.sub?m.sub.map(s=>s.id):[m.id]);
const fmt = d=>d?`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`:"";

export default function App() {
  const [section, setSection]     = useState("plan");
  const [weekIdx, setWeekIdx]     = useState(0);
  const [eduActive, setEduActive] = useState("wstep");
  const [taskDone, setTaskDone]   = useState({});
  const [taskNotes, setTaskNotes] = useState({});
  const [eduDone, setEduDone]     = useState({});
  const [eduNotes, setEduNotes]   = useState({});
  const [editId, setEditId]       = useState(null);
  const [editVal, setEditVal]     = useState("");
  const [editCtx, setEditCtx]     = useState("task");
  const [isMentor, setIsMentor]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(null);

  // Load from Firebase on mount + realtime sync
  useEffect(() => {
    const unsubs = [];
    unsubs.push(dbListen("taskDone",    v => v && setTaskDone(v)));
    unsubs.push(dbListen("taskNotes",   v => v && setTaskNotes(v)));
    unsubs.push(dbListen("eduDone",     v => v && setEduDone(v)));
    unsubs.push(dbListen("eduNotes",    v => v && setEduNotes(v)));
    return () => unsubs.forEach(u => u && u());
  }, []);

  const persist = useCallback(async (key, val) => {
    setSaving(true);
    await dbSet(key, val);
    setSaved(new Date());
    setSaving(false);
  }, []);

  const toggleTask = id => { const n={...taskDone,[id]:!taskDone[id]}; setTaskDone(n); persist("taskDone", n); };
  const toggleEdu  = id => { const n={...eduDone,[id]:!eduDone[id]};   setEduDone(n);  persist("eduDone",  n); };

  const saveNote = async () => {
    if (editCtx === "task") {
      const n={...taskNotes}; if(editVal.trim()) n[editId]=editVal.trim(); else delete n[editId];
      setTaskNotes(n); await persist("taskNotes", n);
    } else {
      const n={...eduNotes}; if(editVal.trim()) n[editId]=editVal.trim(); else delete n[editId];
      setEduNotes(n); await persist("eduNotes", n);
    }
    setEditId(null); setEditVal("");
  };

  const openNote = (id, ctx) => { setEditId(id); setEditCtx(ctx); setEditVal(ctx==="task"?(taskNotes[id]||""):(eduNotes[id]||"")); };

  const taskDoneCount = ALL_TASK_IDS.filter(i=>taskDone[i]).length;
  const eduIds = getAllEduIds(), eduDoneCount = eduIds.filter(i=>eduDone[i]).length;
  const week = WEEKS[weekIdx];
  const findEduItem = id => { for(const m of EDU_MODULES){ if(m.id===id) return m; if(m.sub){const s=m.sub.find(s=>s.id===id);if(s)return s;} } return null; };
  const eduItem = findEduItem(eduActive);
  const getEduModDone  = m => (m.sub?m.sub.map(s=>s.id):[m.id]).filter(i=>eduDone[i]).length;
  const getEduModTotal = m => m.sub ? m.sub.length : 1;

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0b1640",color:"#fff",height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        *{box-sizing:border-box;}body{margin:0;}
        .si{transition:all .15s;cursor:pointer;user-select:none;}
        .si:hover{background:rgba(255,255,255,0.07)!important;}
        .tc{transition:background .18s,border-color .18s;cursor:pointer;}
        .tc:hover{background:rgba(255,255,255,0.07)!important;border-color:rgba(245,197,24,0.4)!important;}
        .fade{animation:fade .22s ease;}
        @keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .dp{animation:dp 1.2s infinite;}
        @keyframes dp{0%,100%{opacity:1}50%{opacity:.25}}
        textarea{font-family:'DM Sans',sans-serif;outline:none;resize:vertical;}
        button{outline:none;border:none;cursor:pointer;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:99px;}
      `}</style>

      {/* TOP BAR */}
      <div style={{flexShrink:0,background:"#060d24",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"0 16px",display:"flex",alignItems:"center",gap:12,height:50,justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:"#1a2d6b",border:"1.5px solid #f5c518",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontFamily:"Syne",fontSize:5,fontWeight:800,color:"#f5c518",textAlign:"center",lineHeight:1.3}}>AKAD<br/>ECOM</span>
          </div>
          <div>
            <div style={{fontFamily:"Syne",fontSize:12,fontWeight:800}}>Klub Praktyków <span style={{color:"#f5c518"}}>E-Commerce</span></div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:"0.06em",textTransform:"uppercase",marginTop:1}}>Aktualizacja Plan Ecom</div>
          </div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {[{id:"plan",label:"📋 Plan"},{id:"edu",label:"📚 Edukacja"},{id:"mentor",label:"👁 Mentor"}].map(n=>{
            const isAct=section===n.id, isMT=n.id==="mentor";
            return (
              <button key={n.id} onClick={()=>{setSection(n.id);setIsMentor(n.id==="mentor");}}
                style={{fontFamily:"Syne",fontSize:11,fontWeight:700,padding:"5px 14px",borderRadius:99,transition:"all .18s",
                  border:`1.5px solid ${isAct?(isMT?"#d090ff":"#f5c518"):"rgba(255,255,255,0.12)"}`,
                  background:isAct?(isMT?"rgba(208,144,255,0.15)":"#f5c518"):"transparent",
                  color:isAct?(isMT?"#d090ff":"#0b1640"):(isMT?"#d090ff":"#8892b8")}}>
                {n.label}
              </button>
            );
          })}
        </div>
        <span style={{fontSize:11,color:saving?"#f5c518":saved?"#60e0a0":"transparent",display:"flex",alignItems:"center",gap:5,minWidth:80,justifyContent:"flex-end"}}>
          {saving?<><span className="dp" style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:"#f5c518"}}/>Zapisuję...</>:saved?`✓ ${fmt(saved)}`:"·"}
        </span>
      </div>

      {/* PROGRESS STRIP */}
      <div style={{flexShrink:0,background:"#060d24",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"5px 16px",display:"flex",gap:20,alignItems:"center"}}>
        {[{label:"Plan",count:taskDoneCount,total:ALL_TASK_IDS.length,color:"#f5c518",grad:"linear-gradient(90deg,#f5c518,#ffd84d)"},{label:"Edukacja",count:eduDoneCount,total:eduIds.length,color:"#d090ff",grad:"linear-gradient(90deg,#d090ff,#a060ff)"}].map(b=>(
          <div key={b.label} style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
            <span style={{fontFamily:"Syne",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:b.color,whiteSpace:"nowrap"}}>{b.label}</span>
            <div style={{flex:1,height:3,background:"rgba(255,255,255,0.07)",borderRadius:99}}>
              <div style={{height:"100%",width:`${Math.round(b.count/b.total*100)}%`,background:b.grad,borderRadius:99,transition:"width .4s"}}/>
            </div>
            <span style={{fontFamily:"Syne",fontSize:9,color:b.color,whiteSpace:"nowrap"}}>{b.count}/{b.total}</span>
          </div>
        ))}
      </div>

      {/* BODY */}
      <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>

        {/* SIDEBAR */}
        <div style={{width:210,flexShrink:0,background:"#060d24",borderRight:"1px solid rgba(255,255,255,0.07)",overflowY:"auto",padding:"10px 8px"}}>

          {section==="plan" && <>
            <div style={{fontFamily:"Syne",fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.2)",padding:"4px 8px 10px"}}>Tygodnie — Etap 1</div>
            {WEEKS.map((w,i)=>{
              const wd=w.tasks.filter(t=>taskDone[t.id]).length,full=wd===w.tasks.length,isAct=weekIdx===i;
              return (
                <div key={i} className="si" onClick={()=>setWeekIdx(i)}
                  style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:10,background:isAct?"rgba(245,197,24,0.1)":"transparent",border:`1px solid ${isAct?"rgba(245,197,24,0.25)":"transparent"}`,marginBottom:3}}>
                  <div style={{width:30,height:30,borderRadius:8,background:full?"rgba(96,224,160,0.12)":"rgba(255,255,255,0.05)",border:`1px solid ${full?"rgba(96,224,160,0.3)":isAct?"rgba(245,197,24,0.3)":"rgba(255,255,255,0.1)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontFamily:"Syne",fontSize:11,fontWeight:800,color:full?"#60e0a0":isAct?"#f5c518":"rgba(255,255,255,0.35)"}}>{w.num}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"Syne",fontSize:11,fontWeight:700,color:full?"#60e0a0":isAct?"#f5c518":"rgba(255,255,255,0.65)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{w.label}</div>
                    <div style={{height:2,background:"rgba(255,255,255,0.07)",borderRadius:99,marginTop:4}}>
                      <div style={{height:"100%",width:`${Math.round(wd/w.tasks.length*100)}%`,background:full?"#60e0a0":"#f5c518",borderRadius:99,transition:"width .3s"}}/>
                    </div>
                  </div>
                  {full&&<span style={{fontSize:12}}>✅</span>}
                </div>
              );
            })}
          </>}

          {section==="edu" && <>
            <div style={{fontFamily:"Syne",fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.2)",padding:"4px 8px 10px"}}>Moduły — Etap 2</div>
            {EDU_MODULES.map(m=>{
              const md=getEduModDone(m),mt=getEduModTotal(m),full=md===mt&&mt>0,pAct=m.sub?m.sub.some(s=>s.id===eduActive):eduActive===m.id;
              return (
                <div key={m.id} style={{marginBottom:3}}>
                  <div className="si" onClick={()=>setEduActive(m.sub?m.sub[0].id:m.id)}
                    style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:9,background:pAct?"rgba(208,144,255,0.1)":"transparent",border:`1px solid ${pAct?"rgba(208,144,255,0.22)":"transparent"}`}}>
                    <span style={{fontSize:14,flexShrink:0}}>{m.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"Syne",fontSize:11,fontWeight:700,color:full?"#60e0a0":pAct?"#d090ff":"rgba(255,255,255,0.65)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.title}</div>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:3}}>
                        <div style={{flex:1,height:2,background:"rgba(255,255,255,0.07)",borderRadius:99}}>
                          <div style={{height:"100%",width:`${Math.round(md/mt*100)}%`,background:full?"#60e0a0":"#d090ff",borderRadius:99,transition:"width .3s"}}/>
                        </div>
                        <span style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>{md}/{mt}</span>
                      </div>
                    </div>
                  </div>
                  {m.sub&&(
                    <div style={{paddingLeft:16,marginTop:1}}>
                      {m.sub.map(s=>{
                        const sDone=!!eduDone[s.id],sAct=eduActive===s.id;
                        return (
                          <div key={s.id} className="si" onClick={()=>setEduActive(s.id)}
                            style={{display:"flex",alignItems:"center",gap:7,padding:"6px 10px",borderRadius:8,background:sAct?"rgba(208,144,255,0.1)":"transparent",border:`1px solid ${sAct?"rgba(208,144,255,0.2)":"transparent"}`,marginBottom:1}}>
                            <span style={{fontSize:11}}>{s.icon}</span>
                            <span style={{fontFamily:"Syne",fontSize:10,fontWeight:600,color:sDone?"#60e0a0":sAct?"#d090ff":"rgba(255,255,255,0.45)",flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textDecoration:sDone?"line-through":"none"}}>{s.title}</span>
                            {sDone&&<span style={{fontSize:9,color:"#60e0a0"}}>✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </>}

          {section==="mentor" && <>
            <div style={{fontFamily:"Syne",fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.2)",padding:"4px 8px 10px"}}>Plan — Przegląd</div>
            {WEEKS.map((w,i)=>{
              const wd=w.tasks.filter(t=>taskDone[t.id]).length,full=wd===w.tasks.length;
              return (
                <div key={i} className="si" onClick={()=>{setSection("plan");setWeekIdx(i);setIsMentor(false);}}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:9,border:"1px solid transparent",marginBottom:2}}>
                  <span style={{fontFamily:"Syne",fontSize:10,fontWeight:700,color:full?"#60e0a0":"rgba(255,255,255,0.4)",width:22,textAlign:"center"}}>{w.num}</span>
                  <div style={{flex:1,height:3,background:"rgba(255,255,255,0.07)",borderRadius:99}}>
                    <div style={{height:"100%",width:`${Math.round(wd/w.tasks.length*100)}%`,background:full?"#60e0a0":"#d090ff",borderRadius:99}}/>
                  </div>
                  <span style={{fontSize:10,color:full?"#60e0a0":"rgba(255,255,255,0.25)"}}>{wd}/{w.tasks.length}</span>
                </div>
              );
            })}
            <div style={{fontFamily:"Syne",fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.15)",padding:"12px 8px 6px"}}>Edukacja</div>
            {EDU_MODULES.map(m=>{
              const md=getEduModDone(m),mt=getEduModTotal(m),full=md===mt&&mt>0;
              return (
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,marginBottom:2}}>
                  <span style={{fontSize:12}}>{m.icon}</span>
                  <div style={{flex:1,height:2,background:"rgba(255,255,255,0.07)",borderRadius:99}}>
                    <div style={{height:"100%",width:`${Math.round(md/mt*100)}%`,background:full?"#60e0a0":"#d090ff",borderRadius:99}}/>
                  </div>
                  <span style={{fontSize:9,color:full?"#60e0a0":"rgba(255,255,255,0.25)"}}>{md}/{mt}</span>
                </div>
              );
            })}
          </>}
        </div>

        {/* MAIN CONTENT */}
        <div style={{flex:1,overflowY:"auto",padding:"22px 24px"}}>

          {/* PLAN */}
          {section==="plan" && (
            <div key={`plan-${weekIdx}`} className="fade">
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,marginBottom:14,flexWrap:"wrap"}}>
                <div style={{fontFamily:"Syne",fontSize:"clamp(26px,5vw,40px)",fontWeight:800,lineHeight:1,letterSpacing:"-0.03em"}}>Tydzień <span style={{color:"#f5c518"}}>{week.num}</span></div>
                <div style={{background:"rgba(245,197,24,0.08)",border:"1px solid rgba(245,197,24,0.2)",borderRadius:12,padding:"10px 14px",maxWidth:260}}>
                  <div style={{fontFamily:"Syne",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:"#f5c518",marginBottom:3}}>Cel tygodnia</div>
                  <div style={{fontSize:13,color:"#ffd84d",lineHeight:1.5}}>{week.goal}</div>
                </div>
              </div>
              {(()=>{const wd=week.tasks.filter(t=>taskDone[t.id]).length;return(<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><div style={{flex:1,height:3,background:"rgba(255,255,255,0.07)",borderRadius:99}}><div style={{height:"100%",width:`${Math.round(wd/week.tasks.length*100)}%`,background:"#f5c518",borderRadius:99,transition:"width .4s"}}/></div><span style={{fontFamily:"Syne",fontSize:11,color:"#8892b8"}}>{wd}/{week.tasks.length}</span></div>);})()}
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
                {week.tasks.map(task=>{
                  const isDone=!!taskDone[task.id],note=taskNotes[task.id]||"",isEdit=editId===task.id&&editCtx==="task";
                  return (
                    <div key={task.id} className="tc" onClick={()=>toggleTask(task.id)}
                      style={{background:isDone?"rgba(245,197,24,0.06)":"rgba(255,255,255,0.04)",border:`1px solid ${isDone?"rgba(245,197,24,0.25)":"rgba(255,255,255,0.08)"}`,borderRadius:14,padding:"13px 16px",display:"flex",gap:13,alignItems:"flex-start"}}>
                      <div style={{width:22,height:22,borderRadius:6,flexShrink:0,marginTop:2,border:isDone?"2px solid #f5c518":"2px solid rgba(255,255,255,0.18)",background:isDone?"#f5c518":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#0b1640",fontWeight:800,transition:"all .2s"}}>{isDone&&"✓"}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:6,marginBottom:4,flexWrap:"wrap",alignItems:"center"}}>
                          <span style={{fontFamily:"Syne",fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:"#f5c518",textTransform:"uppercase"}}>Zadanie {task.num}</span>
                          {task.tags.map(tag=><span key={tag.label} style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:TAG_STYLES[tag.cls].bg,color:TAG_STYLES[tag.cls].color}}>{tag.label}</span>)}
                          {isDone&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:"rgba(96,224,160,0.1)",color:"#60e0a0"}}>✓ Ukończone</span>}
                        </div>
                        <div style={{fontFamily:"Syne",fontSize:14,fontWeight:700,marginBottom:4,lineHeight:1.3,color:isDone?"#8892b8":"#fff",textDecoration:isDone?"line-through":"none"}}>{task.title}</div>
                        <div style={{fontSize:13,color:"#8892b8",lineHeight:1.55}}>{task.desc}</div>
                        {note&&!isEdit&&(<div onClick={e=>e.stopPropagation()} style={{background:"rgba(208,144,255,0.07)",border:"1px solid rgba(208,144,255,0.18)",borderRadius:10,padding:"8px 12px",marginTop:9}}><div style={{fontSize:10,fontFamily:"Syne",color:"#d090ff",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:3}}>💬 Notatka od mentora</div><div style={{fontSize:13,color:"rgba(255,255,255,0.72)",lineHeight:1.55,whiteSpace:"pre-wrap"}}>{note}</div>{isMentor&&<button onClick={e=>{e.stopPropagation();openNote(task.id,"task");}} style={{fontFamily:"Syne",fontSize:10,padding:"3px 10px",borderRadius:99,background:"rgba(208,144,255,0.1)",border:"1px solid rgba(208,144,255,0.2)",color:"#d090ff",marginTop:6}}>✏️ Edytuj</button>}</div>)}
                        {isEdit&&(<div onClick={e=>e.stopPropagation()} style={{marginTop:8}}><textarea value={editVal} onChange={e=>setEditVal(e.target.value)} rows={2} placeholder="Notatka dla klienta..." style={{width:"100%",background:"rgba(208,144,255,0.06)",border:"1px solid rgba(208,144,255,0.3)",borderRadius:8,padding:"8px 12px",color:"#fff",fontSize:12,lineHeight:1.5,marginBottom:6}}/><div style={{display:"flex",gap:6}}><button onClick={saveNote} style={{fontFamily:"Syne",fontSize:11,fontWeight:700,padding:"5px 14px",borderRadius:99,background:"#d090ff",color:"#1a0d3b"}}>Zapisz</button><button onClick={()=>{setEditId(null);setEditVal("");}} style={{fontFamily:"Syne",fontSize:11,padding:"5px 14px",borderRadius:99,background:"transparent",border:"1px solid rgba(255,255,255,0.15)",color:"#8892b8"}}>Anuluj</button></div></div>)}
                        {isMentor&&!note&&!isEdit&&(<button onClick={e=>{e.stopPropagation();openNote(task.id,"task");}} style={{fontFamily:"Syne",fontSize:10,padding:"3px 10px",borderRadius:99,background:"rgba(208,144,255,0.08)",border:"1px solid rgba(208,144,255,0.2)",color:"#d090ff",marginTop:8}}>+ Dodaj notatkę</button>)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{background:"#1a2d6b",border:"1px solid rgba(245,197,24,0.15)",borderRadius:14,padding:"13px 16px"}}>
                <div style={{fontFamily:"Syne",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:"#f5c518",marginBottom:8}}>{weekIdx===3?"Podsumowanie 1 Etapu":"Zadania cykliczne"}</div>
                {week.daily.map((item,i)=>(<div key={i} style={{display:"flex",gap:9,fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.5,marginBottom:5,alignItems:"flex-start"}}><div style={{width:5,height:5,borderRadius:"50%",background:"#f5c518",flexShrink:0,marginTop:6}}/>{item}</div>))}
              </div>
            </div>
          )}

          {/* EDU */}
          {section==="edu" && eduItem && (
            <div key={eduActive} className="fade">
              <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>📚 Edukacja · Etap 2 · <span style={{color:"#d090ff"}}>{eduItem.title}</span></div>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,marginBottom:18,flexWrap:"wrap"}}>
                <div style={{fontFamily:"Syne",fontSize:"clamp(20px,4vw,30px)",fontWeight:800,letterSpacing:"-0.02em"}}>{eduItem.icon} {eduItem.title}</div>
                <button onClick={()=>toggleEdu(eduItem.id)} style={{padding:"8px 18px",borderRadius:99,background:eduDone[eduItem.id]?"rgba(96,224,160,0.12)":"rgba(208,144,255,0.1)",border:`1px solid ${eduDone[eduItem.id]?"rgba(96,224,160,0.35)":"rgba(208,144,255,0.28)"}`,color:eduDone[eduItem.id]?"#60e0a0":"#d090ff",fontFamily:"Syne",fontSize:11,fontWeight:700,flexShrink:0}}>
                  {eduDone[eduItem.id]?"✓ Przerobione":"Oznacz jako przerobione"}
                </button>
              </div>
              {eduItem.desc&&<p style={{fontSize:14,color:"rgba(255,255,255,0.65)",lineHeight:1.7,marginBottom:20,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:"13px 16px"}}>{eduItem.desc}</p>}
              {eduItem.points?.length>0&&(<div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"16px 18px",marginBottom:18}}><div style={{fontFamily:"Syne",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:"#d090ff",marginBottom:12}}>Kluczowe punkty ze spotkania</div>{eduItem.points.map((p,i)=>(<div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}><div style={{width:20,height:20,borderRadius:6,background:"rgba(208,144,255,0.1)",border:"1px solid rgba(208,144,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}><span style={{fontSize:10,color:"#d090ff",fontWeight:700}}>{i+1}</span></div><span style={{fontSize:13,color:"rgba(255,255,255,0.75)",lineHeight:1.6}}>{p}</span></div>))}</div>)}
              {eduNotes[eduItem.id]&&editId!==eduItem.id&&(<div style={{background:"rgba(208,144,255,0.07)",border:"1px solid rgba(208,144,255,0.2)",borderRadius:14,padding:"13px 16px",marginBottom:14}}><div style={{fontFamily:"Syne",fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",color:"#d090ff",marginBottom:5}}>💬 Notatka od mentora</div><div style={{fontSize:13,color:"rgba(255,255,255,0.75)",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{eduNotes[eduItem.id]}</div>{isMentor&&<button onClick={()=>openNote(eduItem.id,"edu")} style={{fontFamily:"Syne",fontSize:10,padding:"3px 10px",borderRadius:99,background:"rgba(208,144,255,0.1)",border:"1px solid rgba(208,144,255,0.2)",color:"#d090ff",marginTop:8}}>✏️ Edytuj</button>}</div>)}
              {editId===eduItem.id&&editCtx==="edu"&&(<div style={{background:"rgba(208,144,255,0.06)",border:"1px solid rgba(208,144,255,0.25)",borderRadius:14,padding:"13px 16px",marginBottom:14}}><textarea value={editVal} onChange={e=>setEditVal(e.target.value)} rows={3} placeholder="Wpisz notatkę..." style={{width:"100%",background:"rgba(208,144,255,0.06)",border:"1px solid rgba(208,144,255,0.3)",borderRadius:10,padding:"10px 12px",color:"#fff",fontSize:13,lineHeight:1.5,marginBottom:8}}/><div style={{display:"flex",gap:8}}><button onClick={saveNote} style={{fontFamily:"Syne",fontSize:11,fontWeight:700,padding:"6px 16px",borderRadius:99,background:"#d090ff",color:"#1a0d3b"}}>Zapisz</button><button onClick={()=>{setEditId(null);setEditVal("");}} style={{fontFamily:"Syne",fontSize:11,padding:"6px 16px",borderRadius:99,background:"transparent",border:"1px solid rgba(255,255,255,0.15)",color:"#8892b8"}}>Anuluj</button></div></div>)}
              {isMentor&&!eduNotes[eduItem.id]&&editId!==eduItem.id&&(<button onClick={()=>openNote(eduItem.id,"edu")} style={{fontFamily:"Syne",fontSize:11,fontWeight:700,padding:"7px 16px",borderRadius:99,background:"rgba(208,144,255,0.1)",border:"1px solid rgba(208,144,255,0.22)",color:"#d090ff",marginBottom:16}}>+ Dodaj notatkę do modułu</button>)}
              {(()=>{const pM=EDU_MODULES.find(m=>m.sub&&m.sub.some(s=>s.id===eduActive));if(!pM)return null;const idx=pM.sub.findIndex(s=>s.id===eduActive),prev=pM.sub[idx-1],next=pM.sub[idx+1];return(<div style={{display:"flex",gap:10,marginTop:24,paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.07)"}}>{prev&&<button onClick={()=>setEduActive(prev.id)} style={{fontFamily:"Syne",fontSize:11,padding:"7px 14px",borderRadius:99,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.55)"}}>← {prev.icon} {prev.title}</button>}<div style={{flex:1}}/>{next&&<button onClick={()=>setEduActive(next.id)} style={{fontFamily:"Syne",fontSize:11,padding:"7px 14px",borderRadius:99,background:"rgba(208,144,255,0.08)",border:"1px solid rgba(208,144,255,0.2)",color:"#d090ff"}}>{next.icon} {next.title} →</button>}</div>);})()}
            </div>
          )}

          {/* MENTOR */}
          {section==="mentor" && (
            <div className="fade">
              <div style={{fontFamily:"Syne",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"#d090ff",marginBottom:16}}>Panel Mentora — Pełny przegląd</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:24}}>
                {WEEKS.map((w,i)=>{const wd=w.tasks.filter(t=>taskDone[t.id]).length,full=wd===w.tasks.length;return(<div key={i} className="si" onClick={()=>{setSection("plan");setWeekIdx(i);setIsMentor(false);}} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"12px 14px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontFamily:"Syne",fontSize:12,fontWeight:700,color:full?"#60e0a0":"#fff"}}>{w.label}</span><span style={{fontSize:11,color:full?"#60e0a0":"rgba(255,255,255,0.35)"}}>{wd}/{w.tasks.length}</span></div><div style={{height:4,background:"rgba(255,255,255,0.07)",borderRadius:99,marginBottom:6}}><div style={{height:"100%",width:`${Math.round(wd/w.tasks.length*100)}%`,background:full?"#60e0a0":"#d090ff",borderRadius:99}}/></div><div style={{fontSize:11,color:"rgba(255,255,255,0.28)"}}>{w.goal}</div></div>);})}
              </div>
              {WEEKS.map((w,wi)=>(<div key={wi} style={{marginBottom:22}}><div style={{fontFamily:"Syne",fontSize:12,fontWeight:800,color:"#d090ff",marginBottom:8}}>{w.label} <span style={{fontSize:11,fontWeight:400,color:"rgba(255,255,255,0.25)"}}>— {w.goal}</span></div><div style={{display:"flex",flexDirection:"column",gap:6}}>{w.tasks.map(task=>{const isDone=!!taskDone[task.id],note=taskNotes[task.id]||"",isEdit=editId===task.id&&editCtx==="task";return(<div key={task.id} style={{background:isDone?"rgba(96,224,160,0.04)":"rgba(255,255,255,0.02)",border:`1px solid ${isDone?"rgba(96,224,160,0.15)":"rgba(255,255,255,0.07)"}`,borderRadius:11,padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2,flexWrap:"wrap"}}><span style={{fontFamily:"Syne",fontSize:10,color:"#d090ff",letterSpacing:"0.07em",textTransform:"uppercase"}}>#{task.num}</span>{task.tags.map(tag=><span key={tag.label} style={{fontSize:10,padding:"1px 7px",borderRadius:99,background:TAG_STYLES[tag.cls].bg,color:TAG_STYLES[tag.cls].color}}>{tag.label}</span>)}<span style={{marginLeft:"auto",fontSize:11,color:isDone?"#60e0a0":"rgba(255,255,255,0.18)"}}>{isDone?"✓ Ukończone":"○ Oczekuje"}</span></div><div style={{fontFamily:"Syne",fontSize:12,fontWeight:700,color:isDone?"#8892b8":"#fff",textDecoration:isDone?"line-through":"none",marginBottom:note||isEdit?6:0}}>{task.title}</div>{note&&!isEdit&&(<div style={{background:"rgba(208,144,255,0.07)",border:"1px solid rgba(208,144,255,0.16)",borderRadius:8,padding:"6px 10px",marginBottom:5}}><div style={{fontSize:10,fontFamily:"Syne",color:"#d090ff",marginBottom:2}}>Notatka</div><div style={{fontSize:12,color:"rgba(255,255,255,0.7)",lineHeight:1.5,whiteSpace:"pre-wrap"}}>{note}</div></div>)}{isEdit&&(<div><textarea value={editVal} onChange={e=>setEditVal(e.target.value)} rows={2} style={{width:"100%",background:"rgba(208,144,255,0.06)",border:"1px solid rgba(208,144,255,0.3)",borderRadius:8,padding:"7px 10px",color:"#fff",fontSize:12,lineHeight:1.5,marginBottom:5}}/><div style={{display:"flex",gap:6}}><button onClick={saveNote} style={{fontFamily:"Syne",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:99,background:"#d090ff",color:"#1a0d3b"}}>Zapisz</button><button onClick={()=>{setEditId(null);setEditVal("");}} style={{fontFamily:"Syne",fontSize:11,padding:"4px 12px",borderRadius:99,background:"transparent",border:"1px solid rgba(255,255,255,0.15)",color:"#8892b8"}}>Anuluj</button></div></div>)}<div style={{display:"flex",gap:7,marginTop:5}}><button onClick={()=>openNote(task.id,"task")} style={{fontFamily:"Syne",fontSize:10,padding:"3px 10px",borderRadius:99,background:"rgba(208,144,255,0.08)",border:"1px solid rgba(208,144,255,0.18)",color:"#d090ff"}}>{note?"✏️ Edytuj":"+Notatka"}</button>{note&&<button onClick={()=>{const n={...taskNotes};delete n[task.id];setTaskNotes(n);persist("taskNotes",n);}} style={{fontFamily:"Syne",fontSize:10,padding:"3px 10px",borderRadius:99,background:"rgba(255,80,80,0.07)",border:"1px solid rgba(255,80,80,0.18)",color:"rgba(255,120,120,0.8)"}}>🗑</button>}</div></div>);})}</div></div>))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
