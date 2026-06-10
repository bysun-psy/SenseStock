import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "./supabaseClient";

function useMediaQuery(query:string):boolean {
  const [matches,setMatches]=useState(()=>typeof window!=='undefined'?window.matchMedia(query).matches:false);
  useEffect(()=>{
    const mq=window.matchMedia(query);
    setMatches(mq.matches);
    const fn=(e:MediaQueryListEvent)=>setMatches(e.matches);
    mq.addEventListener('change',fn);
    return()=>mq.removeEventListener('change',fn);
  },[query]);
  return matches;
}

const SIDEBAR_CSS = `
  .ss-aside { transition: width 0.22s ease; overflow: hidden; }
  .ss-aside.collapsed { width: 52px !important; }
  .ss-aside.collapsed .ss-logo-name,
  .ss-aside.collapsed .ss-nav-label,
  .ss-aside.collapsed .ss-user-info,
  .ss-aside.collapsed .ss-logout-btn { opacity:0; width:0; pointer-events:none; }
  .ss-aside.collapsed .ss-avatar { margin:0 auto; }
  .ss-logo-name,.ss-nav-label,.ss-user-info,.ss-logout-btn { opacity:1; transition:opacity 0.15s; overflow:hidden; white-space:nowrap; }
  .ss-nav-item { position:relative; min-height:36px; }
  .ss-toggle-btn { width:24px; height:24px; border-radius:6px; background:none; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--slate); flex-shrink:0; padding:0; }
  .bottom-nav { display:none; }
  .desktop-hide { display:none; }
  @media (max-width:768px) {
    .ss-aside { display:none !important; }
    .bottom-nav { display:flex !important; position:fixed; bottom:0; left:0; right:0; height:60px; background:var(--canvas); border-top:1px solid var(--hairline); z-index:50; align-items:stretch; }
    .bottom-nav-item { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:12px; font-weight:500; color:var(--slate); padding:0; }
    .bottom-nav-item.active { color:var(--primary); font-weight:600; }
    .bottom-nav-item.active .bnav-icon { color:var(--primary); }
    .bnav-icon { color:var(--slate); display:flex; }
    .mobile-content { padding-bottom:100px !important; }
    .app { height:100dvh !important; padding-bottom:60px !important; }
    .mobile-topbar { padding:14px 16px !important; }
    .mobile-topbar h1 { font-size:22px !important; white-space:nowrap; overflow:visible !important; text-overflow:clip !important; }
    .mobile-topbar .topbar-sub { display:none; }
    .mobile-topbar .topbar-actions { gap:6px !important; flex-shrink:1 !important; min-width:0; }
    .mobile-topbar .topbar-actions .btn { flex-shrink:0; }
    .mobile-pad { padding:16px !important; }
    .mobile-pad-x { padding-left:16px !important; padding-right:16px !important; }
    .mobile-grid-1 { grid-template-columns:1fr !important; }
    .mobile-grid-2 { grid-template-columns:1fr 1fr !important; }
    .mobile-hide { display:none !important; }
    .desktop-hide { display:block !important; }
    .mobile-scroll-x { overflow-x:auto !important; -webkit-overflow-scrolling:touch; }
    .mobile-h2 { font-size:20px !important; }
    .mobile-full { width:100% !important; max-width:100% !important; }
  }
`;
const STYLE_SHEET = `
:root {
  --primary:#6457E7; --primary-pressed:#5346D6; --primary-deep:#4538B5; --primary-soft:#EFEDFC;
  --brand-navy:#1F1A38; --brand-yellow:#E5B72D; --brand-orange:#E48F50; --brand-orange-deep:#B25E29;
  --brand-pink:#E2557F; --brand-pink-deep:#C03A60; --brand-purple-300:#B7A8F0; --brand-purple-800:#4A3F8F;
  --brand-teal:#4FB2A6; --brand-green:#3BA063;
  --tint-peach:#FAEBDD; --tint-rose:#F8E4E6; --tint-mint:#DDEDEA; --tint-lavender:#EAE4F2;
  --tint-sky:#DCE9F4; --tint-yellow:#FDECC8; --tint-yellow-bold:#FFD059;
  --canvas:#FFFFFF; --surface:#F7F6F3; --surface-soft:#FBFAF8;
  --hairline:#ECEBE8; --hairline-soft:#F1F0EE; --hairline-strong:#DEDCD7;
  --ink-deep:#1A1916; --ink:#2A2926; --charcoal:#37352F;
  --slate:#787774; --steel:#9B9A97; --stone:#B5B3AD;
  --on-dark:#FFFFFF; --on-dark-muted:rgba(255,255,255,0.72);
  --error:#D03A3A; --link-blue:#2382E2;
  --use-1:#E63946; --use-2:#C42E2E; --use-3:#A8231F; --use-4:#F4A23B; --use-5:#F0B82E;
  --use-6:#E69A1F; --use-7:#F4D31E; --use-8:#2BAA50; --use-9:#2B7FD3; --use-10:#1A2E5C; --use-11:#A1318C;
  --r-sm:6px; --r-md:8px; --r-lg:12px; --r-full:9999px;
  --shadow-2:0 4px 12px rgba(15,15,15,.08); --shadow-3:0 24px 48px -8px rgba(15,15,15,.20); --shadow-4:0 16px 48px -8px rgba(15,15,15,.16);
  --fs-body:14px; --fs-sm:12px; --fs-label:12px; --fs-btn:14px; --fs-nav:14px; --fs-input:14px; --fs-section:16px; --fs-topbar:22px;
  --h-btn:36px; --h-btn-sm:30px; --h-btn-ghost:32px; --h-topbar:72px;
}
@media (min-width:769px) {
  :root {
    --fs-body:16px; --fs-sm:14px; --fs-label:13px; --fs-btn:15px; --fs-nav:15px; --fs-input:15px; --fs-section:18px; --fs-topbar:24px;
    --h-btn:40px; --h-btn-sm:34px; --h-btn-ghost:36px; --h-topbar:88px;
  }
}
*{box-sizing:border-box}
body,#root{margin:0;padding:0}
.app{font-family:'Pretendard','Inter',-apple-system,system-ui,sans-serif;color:var(--ink);background:var(--surface);font-size:var(--fs-body);line-height:1.55;-webkit-font-smoothing:antialiased;height:100vh;height:100dvh;overflow:hidden}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:var(--h-btn);padding:0 14px;border-radius:var(--r-md);font-size:var(--fs-btn);font-weight:500;border:1px solid transparent;cursor:pointer;white-space:nowrap;font-family:inherit;transition:background 120ms}
.btn-primary{background:var(--primary);color:#fff}.btn-primary:hover{background:var(--primary-pressed)}
.btn-primary:disabled{background:var(--hairline-strong);color:var(--steel);cursor:not-allowed}
.btn-secondary{background:var(--canvas);color:var(--ink);border-color:var(--hairline-strong)}.btn-secondary:hover{background:var(--surface)}
.btn-secondary:disabled{color:var(--stone);cursor:not-allowed}
.btn-ghost{background:transparent;color:var(--ink);padding:0 10px;height:var(--h-btn-ghost);border:none}.btn-ghost:hover{background:var(--surface)}
.btn-danger{background:var(--canvas);color:var(--error);border-color:#EBC7C7}.btn-danger:hover{background:#FCEFEF}
.btn-sm{height:var(--h-btn-sm);padding:0 10px;font-size:var(--fs-btn)}
.btn-icon{width:var(--h-btn-ghost);height:var(--h-btn-ghost);padding:0}
.input,.select,.textarea{width:100%;height:40px;padding:0 12px;border-radius:var(--r-md);border:1px solid var(--hairline-strong);background:var(--canvas);color:var(--ink);font:inherit;font-size:var(--fs-input);outline:none;transition:border-color 120ms}
.textarea{height:auto;padding:10px 12px;resize:vertical;min-height:80px}
.input::placeholder{color:var(--stone)}
.input:focus,.select:focus,.textarea:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(100,87,231,.16)}
.is-editing{background:#FFFDF5!important;border-color:var(--brand-yellow)!important;box-shadow:0 0 0 3px rgba(229,183,45,.18)!important}
.search-pill{height:44px;padding:0 14px 0 40px;border-radius:var(--r-md);border:1px solid var(--hairline);background:var(--surface);font:inherit;font-size:var(--fs-input);outline:none;width:100%}
.search-pill:focus{background:var(--canvas);border-color:var(--primary)}
.field-label{display:block;font-size:var(--fs-label);font-weight:500;color:var(--charcoal);margin-bottom:6px;white-space:nowrap}
.card{background:var(--canvas);border:1px solid var(--hairline);border-radius:var(--r-lg)}
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:var(--r-full);font-size:var(--fs-label);font-weight:600;white-space:nowrap}
.chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:var(--r-full);background:var(--canvas);border:1px solid var(--hairline);font-size:var(--fs-label);font-weight:500;cursor:pointer;transition:background 120ms;white-space:nowrap;font-family:inherit}
.chip:hover{background:var(--surface)}
.chip.active{background:var(--ink-deep);color:#fff;border-color:var(--ink-deep)}
.table{width:100%;border-collapse:separate;border-spacing:0}
.table thead th{text-align:left;padding:12px 16px;font-size:var(--fs-label);font-weight:500;color:var(--slate);border-bottom:1px solid var(--hairline);background:var(--surface-soft);position:sticky;top:0;z-index:1}
.table tbody td{padding:12px 16px;border-bottom:1px solid var(--hairline-soft);vertical-align:middle}
.table tbody tr{cursor:pointer}
.table tbody tr:hover td{background:var(--surface-soft)}
.table tbody tr.sel td{background:var(--primary-soft)}
.swatch{display:inline-block;width:10px;height:10px;border-radius:3px;border:1px solid rgba(0,0,0,.05);flex-shrink:0}
.row{display:flex;align-items:center}
.col{display:flex;flex-direction:column}
.between{justify-content:space-between}
.wrap{flex-wrap:wrap}
.flex1{flex:1;min-width:0}
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-thumb{background:#D9D7D2;border-radius:4px}
`;

const USES = [
  {id:1,name:'평가/훈련-소모품',color:'var(--use-1)',short:'평가·소모품'},
  {id:2,name:'평가/훈련-일회용품',color:'var(--use-2)',short:'평가·일회용'},
  {id:3,name:'평가/훈련-교구',color:'var(--use-3)',short:'평가·교구'},
  {id:4,name:'실험/분석-소모품',color:'var(--use-4)',short:'실험·소모품'},
  {id:5,name:'실험/분석-기구',color:'var(--use-5)',short:'실험·기구'},
  {id:6,name:'실험/분석-장비',color:'var(--use-6)',short:'실험·장비'},
  {id:7,name:'청소/안전',color:'var(--use-7)',short:'청소·안전'},
  {id:8,name:'조리/그릇',color:'var(--use-8)',short:'조리·그릇'},
  {id:9,name:'사무/공구',color:'var(--use-9)',short:'사무·공구'},
  {id:10,name:'기타 장비',color:'var(--use-10)',short:'기타 장비'},
  {id:11,name:'기타 소모품',color:'var(--use-11)',short:'기타 소모품'},
];
const FALLBACK_USE = {id:0,name:'미분류',color:'var(--steel)',short:'미분류'};
const useById = id => USES.find(u=>u.id===id) || FALLBACK_USE;
const QTY_REQ = [1,2,4,7,11];
const SPACES = ['준비','서빙1','서빙2','토론1','토론2','창고'];
const ZONES = {
  '준비':[
    {group:'선반',cells:['1','2','3','4']},
    {group:'실험대 위',cells:['1','2','3','4','5']},
    {group:'실험대 아래',cells:['1','2','3','4','5','6']},
    {group:'실험대 서랍',cells:['서랍 1','서랍 2','서랍 3','서랍 4','서랍 5','서랍 6']},
    {group:'조리대 좌측',cells:['서랍 1','서랍 2','서랍 3','4','5']},
    {group:'조리대 우측',cells:['서랍 1','서랍 2','서랍 3','4','5']},
    {group:'싱크대 위',cells:['1','2','3','4','5','6']},
    {group:'싱크대 아래',cells:['1','2']},
    {group:'저울대 위',cells:['1','2','3']},
    {group:'저울대 아래',cells:['1','2','서랍 1','서랍 2','서랍 3','서랍 4']},
  ],
  '서빙1':[{group:'조리대',cells:['서랍 1','서랍 2','서랍 3','4']}],
  '서빙2':[{group:'조리대',cells:['서랍 1','서랍 2','서랍 3','4']}],
  '토론1':[{group:'서랍',cells:['서랍 1','서랍 2','서랍 3']}],
  '토론2':[{group:'서랍',cells:['서랍 1','서랍 2','서랍 3']}],
  '창고':[
    {group:'수납장',cells:['1','2','3','4','5','6','7','8']},
    {group:'박스',cells:['1','2','3']},
    {group:'선반',cells:['1','2','3','4','5','6','7','8']},
  ],
};

const mk=(id,name,useId,space,group,cell,qty,min,spec='',note='',received='2026-04')=>({
  id,name,useId,space,group,cell,qty,min,spec,note,received,
  createdAt:'2026-03-12',updatedAt:'2026-05-10',updatedBy:'김연구'
});

const SEED = [
  mk(1,'투명 시약병 500mL',5,'준비','선반','1',24,null,'PYREX 500mL','뚜껑 포함','2026-02'),
  mk(2,'피펫 팁 박스',4,'준비','선반','2',18,5,'1000μL, 96개입','','2026-04'),
  mk(3,'정성여과지',4,'준비','선반','3',32,10,'110mm','','2026-03'),
  mk(4,'실리콘 호스',11,'준비','선반','4',6,2,'내경 8mm','','2026-01'),
  mk(5,'전자저울 (정밀)',6,'준비','실험대 위','1',1,null,'AND HR-200','연간 교정 필요','2025-09'),
  mk(6,'교반기',6,'준비','실험대 위','2',2,null,'IKA RH basic','','2025-10'),
  mk(7,'pH 미터',6,'준비','실험대 위','3',1,null,'Orion Star A211','','2025-11'),
  mk(8,'회전증발기',6,'준비','실험대 위','4',1,null,'Buchi R-100','','2025-08'),
  mk(9,'초음파 세척기',6,'준비','실험대 위','5',1,null,'Branson 2800','','2025-12'),
  mk(10,'비커 세트',5,'준비','실험대 아래','1',28,null,'50~1000 mL','','2026-02'),
  mk(11,'삼각플라스크',5,'준비','실험대 아래','2',22,null,'125~500 mL','','2026-02'),
  mk(12,'메스실린더',5,'준비','실험대 아래','3',14,null,'10~100 mL','','2026-01'),
  mk(13,'마그네틱 바',5,'준비','실험대 아래','4',36,8,'20~50mm','','2026-03'),
  mk(14,'데시케이터',6,'준비','실험대 아래','5',2,null,'직경 300mm','실리카겔 포함','2025-07'),
  mk(15,'항온수조',6,'준비','실험대 아래','6',1,null,'WiseBath WB-22','','2025-09'),
  mk(16,'파라필름',4,'준비','실험대 서랍','서랍 1',4,2,'Bemis PM-996','','2026-04'),
  mk(17,'알루미늄 호일',4,'준비','실험대 서랍','서랍 2',6,2,'50m','','2026-04'),
  mk(18,'니트릴 장갑',7,'준비','실험대 서랍','서랍 3',2,4,'L사이즈 100매입','재주문 필요','2026-05'),
  mk(19,'실험 노트',9,'준비','실험대 서랍','서랍 4',8,3,'A4 200매','','2026-04'),
  mk(20,'네임펜',9,'준비','실험대 서랍','서랍 5',12,4,'검정','','2026-04'),
  mk(21,'마이크로피펫',5,'준비','실험대 서랍','서랍 6',6,null,'20~200μL','연 1회 교정','2025-12'),
  mk(22,'스테인리스 볼',8,'준비','조리대 좌측','서랍 1',12,null,'20/25/30 cm','','2026-01'),
  mk(23,'계량컵 세트',8,'준비','조리대 좌측','서랍 2',4,null,'4종 1세트','','2025-12'),
  mk(24,'실리콘 주걱',8,'준비','조리대 좌측','서랍 3',8,null,'내열 220℃','','2026-02'),
  mk(25,'칼·도마 세트',8,'준비','조리대 좌측','4',3,null,'시료 전용','교차오염 주의','2025-11'),
  mk(26,'전기포트',10,'준비','조리대 좌측','5',2,null,'1.7L','','2025-10'),
  mk(27,'관능평가용 컵 (100mL)',2,'준비','조리대 우측','서랍 1',240,60,'플라스틱 일회용','','2026-04'),
  mk(28,'관능평가용 트레이',3,'준비','조리대 우측','서랍 2',30,null,'3구','','2025-11'),
  mk(29,'티스푼 (시료용)',8,'준비','조리대 우측','서랍 3',80,null,'','','2025-10'),
  mk(30,'인덕션 (2구)',10,'준비','조리대 우측','4',1,null,'','','2025-08'),
  mk(31,'보온병',8,'준비','조리대 우측','5',4,null,'1L','','2026-03'),
  mk(32,'주방세제',7,'준비','싱크대 위','1',1,2,'5L','','2026-04'),
  mk(33,'세척솔 (대)',7,'준비','싱크대 위','2',6,2,'','','2026-03'),
  mk(34,'피펫 세척솔',7,'준비','싱크대 위','3',4,2,'','','2026-02'),
  mk(35,'건조대',8,'준비','싱크대 위','4',2,null,'','','2025-10'),
  mk(36,'마른행주',7,'준비','싱크대 위','5',18,6,'','','2026-04'),
  mk(37,'키친타올',7,'준비','싱크대 위','6',12,4,'6롤 묶음','','2026-05'),
  mk(38,'락스 (희석용)',7,'준비','싱크대 아래','1',3,1,'4L','','2026-03'),
  mk(39,'쓰레기 봉투',11,'준비','싱크대 아래','2',40,10,'20L 50매','','2026-04'),
  mk(40,'정밀저울 분동 세트',6,'준비','저울대 위','1',1,null,'E2급','연 1회 교정','2025-06'),
  mk(41,'정전기 제거기',6,'준비','저울대 위','2',1,null,'','','2025-10'),
  mk(42,'드라이박스 (소)',6,'준비','저울대 위','3',1,null,'','실리카겔 교체 필요','2025-11'),
  mk(43,'칭량지',4,'준비','저울대 아래','1',8,2,'100×100mm','','2026-03'),
  mk(44,'약수저 세트',5,'준비','저울대 아래','2',12,null,'스테인리스','','2026-01'),
  mk(45,'미량 약병',5,'준비','저울대 아래','서랍 1',30,null,'5mL','','2026-02'),
  mk(46,'표준시약 (NaCl)',4,'준비','저울대 아래','서랍 2',2,1,'500g','','2026-01'),
  mk(47,'표준시약 (Sucrose)',4,'준비','저울대 아래','서랍 3',2,1,'500g','','2026-01'),
  mk(48,'표준시약 (Caffeine)',4,'준비','저울대 아래','서랍 4',0,1,'100g','결품 — 발주 진행 중','2026-02'),
  mk(49,'관능 부스 가림판',3,'서빙1','조리대','서랍 1',8,null,'조립식','','2025-09'),
  mk(50,'관능평가 카드',1,'서빙1','조리대','서랍 2',70,100,'A5 200매입','','2026-04'),
  mk(51,'연필 (HB)',1,'서빙1','조리대','서랍 3',30,10,'','','2026-03'),
  mk(52,'급수기 (개인용)',10,'서빙1','조리대','4',6,null,'500mL','','2025-08'),
  mk(53,'일회용 시료컵 (50mL)',2,'서빙2','조리대','서랍 1',50,100,'뚜껑 포함','재고 부족','2026-04'),
  mk(54,'일회용 스푼',2,'서빙2','조리대','서랍 2',480,100,'플라스틱','','2026-03'),
  mk(55,'헹굼용 정수기 필터',7,'서빙2','조리대','서랍 3',2,1,'6개월 교체','','2026-02'),
  mk(56,'소형 냉장고',10,'서빙2','조리대','4',1,null,'시료 전용','','2024-11'),
  mk(57,'회의용 보드마카',9,'토론1','서랍','서랍 1',24,8,'4색 세트','','2026-04'),
  mk(58,'포스트잇',9,'토론1','서랍','서랍 2',30,10,'76×76','','2026-04'),
  mk(59,'관능 토론 가이드북',3,'토론1','서랍','서랍 3',12,null,'교육용','','2025-09'),
  mk(60,'패널 트레이닝 카드',3,'토론2','서랍','서랍 1',8,null,'향미 표준 40종','','2025-12'),
  mk(61,'필기구 (볼펜)',9,'토론2','서랍','서랍 2',40,12,'검정','','2026-04'),
  mk(62,'타이머',5,'토론2','서랍','서랍 3',4,null,'디지털','','2025-10'),
  mk(63,'관능평가용 컵 (재고)',2,'창고','수납장','1',1200,300,'100mL','','2026-04'),
  mk(64,'일회용 스푼 (재고)',2,'창고','수납장','2',2400,500,'','','2026-04'),
  mk(65,'A4 용지',9,'창고','수납장','3',3,6,'500매 1박스','','2026-05'),
  mk(66,'소독용 알코올 (70%)',7,'창고','수납장','4',12,4,'4L','','2026-03'),
  mk(67,'정수기용 생수',11,'창고','수납장','5',36,10,'2L','','2026-05'),
  mk(68,'비커 (예비)',5,'창고','수납장','6',20,null,'250/500 mL','','2026-01'),
  mk(69,'실험복 (예비)',7,'창고','수납장','7',8,2,'L/M','','2025-12'),
  mk(70,'보안경',7,'창고','수납장','8',10,3,'','','2026-01'),
  mk(71,'표준향 키트 (보관)',3,'창고','박스','1',2,null,'40종 세트','냉장 보관','2025-08'),
  mk(72,'교체용 필터',7,'창고','박스','2',6,2,'6개월 교체','','2026-02'),
  mk(73,'포장재 (예비)',11,'창고','박스','3',18,4,'PE 봉투 500매','','2026-04'),
  mk(74,'대형 비커',5,'창고','선반','1',8,null,'2000 mL','','2025-11'),
  mk(75,'대형 깔때기',5,'창고','선반','2',6,null,'직경 200mm','','2025-11'),
  mk(76,'스탠드 (실험용)',5,'창고','선반','3',4,null,'','','2025-09'),
  mk(77,'교반기 (예비)',6,'창고','선반','4',1,null,'IKA','','2025-08'),
  mk(78,'항온수조 (예비)',6,'창고','선반','5',1,null,'','미사용','2025-07'),
  mk(79,'대형 보관통',8,'창고','선반','6',4,null,'20L','','2025-10'),
  mk(80,'박스 보관함',11,'창고','선반','7',12,null,'','','2026-03'),
  mk(81,'계측기 (예비)',6,'창고','선반','8',2,null,'디지털 온도계','','2025-12'),
];

const SEED_ACT = [
  {id:1,action:'create',name:'키친타올',user:'김연구',time:'2시간 전'},
  {id:2,action:'update',name:'관능평가용 컵 (100mL)',user:'박분석',time:'5시간 전'},
  {id:3,action:'delete',name:'구형 pH 시약',user:'이센서',time:'어제'},
  {id:4,action:'create',name:'소독용 알코올 (70%)',user:'김연구',time:'어제'},
  {id:5,action:'update',name:'표준시약 (Caffeine)',user:'박분석',time:'2일 전'},
];

function Ico({path,circle,rect,poly,line,s=2,size=16}) {
  const paths=Array.isArray(path)?path:(path?[path]:[]);
  const circles=Array.isArray(circle)?circle:(circle?[circle]:[]);
  const rects=Array.isArray(rect)?rect:(rect?[rect]:[]);
  const polys=Array.isArray(poly)?poly:(poly?[poly]:[]);
  const lines=Array.isArray(line)?line:(line?[line]:[]);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d,i)=><path key={i} d={d}/>)}
      {circles.map((c,i)=><circle key={i} {...c}/>)}
      {rects.map((r,i)=><rect key={i} {...r}/>)}
      {polys.map((p,i)=><polyline key={i} points={p}/>)}
      {lines.map((l,i)=><line key={i} {...l}/>)}
    </svg>
  );
}

const IC = {
  search:()=><Ico circle={[{cx:11,cy:11,r:7}]} path="m20 20-3.5-3.5"/>,
  dash:()=><Ico s={1.8} rect={[{x:3,y:3,width:7,height:9,rx:1.5},{x:14,y:3,width:7,height:5,rx:1.5},{x:14,y:12,width:7,height:9,rx:1.5},{x:3,y:16,width:7,height:5,rx:1.5}]}/>,
  list:()=><Ico path={['M9 12h6','M9 8h6','M9 16h4']} rect={[{x:3,y:3,width:18,height:18,rx:2}]}/>,
  map:()=><Ico s={1.8} path={['M3 6.5 9 4l6 2.5 6-2.5v13L15 19.5 9 17l-6 2.5z','M9 4v13M15 6.5v13']}/>,
  plus:()=><Ico path="M12 5v14M5 12h14"/>,
  chev:()=><Ico path="m9 6 6 6-6 6"/>,
  back:()=><Ico path={['M19 12H5','M12 19l-7-7 7-7']}/>,
  trash:()=><Ico path="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>,
  edit:()=><Ico path={['M12 20h9','M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z']}/>,
  x:()=><Ico path={['M18 6 6 18','M6 6l12 12']}/>,
  check:()=><Ico s={2.4} poly="20 6 9 17 4 12"/>,
  alert:()=><Ico path={['M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z','M12 9v4M12 17h.01']}/>,
  logout:()=><Ico path={['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4','M16 17l5-5-5-5','M21 12H9']}/>,
  refresh:()=><Ico path={['M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5','M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5']}/>,
  user:()=><Ico circle={[{cx:12,cy:8,r:4}]} path="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>,
};

function SidebarToggleIcon({open}) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
      <polyline points="15 9 12 12 15 15"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
      <polyline points="12 9 15 12 12 15"/>
    </svg>
  );
}

function itemsByLoc(items) {
  const m={};
  items.forEach(it=>{const k=`${it.space}/${it.group}/${it.cell}`;(m[k]=m[k]||[]).push(it);});
  return m;
}
function dominant(its) {
  if(!its||!its.length) return null;
  const c={};
  its.forEach(it=>{c[it.useId]=(c[it.useId]||0)+1;});
  return useById(+Object.entries(c).sort((a,b)=>b[1]-a[1])[0][0]);
}
function hi(text,q) {
  if(!q) return text;
  const i=text.toLowerCase().indexOf(q.toLowerCase());
  if(i<0) return text;
  return <>{text.slice(0,i)}<mark style={{background:'var(--tint-yellow)',color:'var(--ink)',padding:'0 1px',borderRadius:2}}>{text.slice(i,i+q.length)}</mark>{text.slice(i+q.length)}</>;
}

function Modal({open,onClose,children,width=440}) {
  if(!open) return null;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(15,15,15,.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}}>
      <div onClick={e=>e.stopPropagation()} className="card" style={{width,maxWidth:'90vw',boxShadow:'var(--shadow-4)'}}>
        {children}
      </div>
    </div>
  );
}
function Topbar({title,sub,action}) {
  return (
    <div className="row between mobile-topbar" style={{height:'var(--h-topbar)',padding:'0 32px',background:'var(--canvas)',borderBottom:'1px solid var(--hairline)',gap:16,flexShrink:0}}>
      <div style={{minWidth:0,flex:1}}>
        <h1 style={{margin:0,fontSize:'var(--fs-topbar)',fontWeight:600,color:'var(--ink-deep)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{title}</h1>
        {sub&&<div className="topbar-sub" style={{fontSize:'var(--fs-sm)',color:'var(--slate)',marginTop:2}}>{sub}</div>}
      </div>
      {action&&<div className="topbar-actions row" style={{flexShrink:0,gap:12,flexWrap:'nowrap'}}>{action}</div>}
    </div>
  );
}
function Field({label,required,err,children}) {
  return (
    <div style={{minWidth:0}}>
      <label className="field-label">{label}{required&&<span style={{color:'var(--brand-pink-deep)'}}> *</span>}</label>
      {children}
      {err&&<div style={{fontSize:'var(--fs-label)',color:'var(--error)',marginTop:4}}>{err}</div>}
    </div>
  );
}

function LoginDecorations() {
  const dots=[
    {left:"5%",top:"10%",color:"var(--brand-pink)",size:10},
    {left:"15%",top:"80%",color:"var(--brand-yellow)",size:14},
    {left:"90%",top:"12%",color:"var(--brand-teal)",size:8},
    {left:"85%",top:"85%",color:"var(--brand-orange)",size:10},
    {left:"3%",top:"50%",color:"var(--brand-purple-300)",size:16},
    {left:"92%",top:"50%",color:"var(--brand-green)",size:6},
    {left:"78%",top:"30%",color:"var(--brand-pink-deep)",size:8},
    {left:"22%",top:"20%",color:"var(--brand-yellow)",size:8},
    {left:"70%",top:"75%",color:"var(--brand-orange)",size:10},
  ];
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:1}}>
      {dots.map((d,i)=>(
        <span key={i} style={{position:'absolute',left:d.left,top:d.top,width:d.size,height:d.size,borderRadius:'50%',background:d.color,boxShadow:'0 0 0 4px rgba(255,255,255,0.04)'}}/>
      ))}
    </div>
  );
}

function Login() {
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState('');
  const handleGoogleLogin=async()=>{
    setLoading(true); setErr('');
    const {error}=await supabase.auth.signInWithOAuth({
      provider:'google',
      options:{redirectTo:window.location.origin},
    });
    if(error){setErr('로그인 중 오류가 발생했습니다.');setLoading(false);}
  };
  return (
    <div style={{minHeight:'100vh',background:'var(--brand-navy)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#fff',position:'relative',overflow:'hidden',padding:'48px 24px'}}>
      <LoginDecorations/>
      <div style={{position:'relative',zIndex:2,textAlign:'center',marginBottom:40}}>
        <div style={{marginBottom:20}}>
          <span style={{fontSize:'clamp(36px,5vw,56px)',fontWeight:600,lineHeight:1.1,letterSpacing:'-1px',background:'linear-gradient(90deg,var(--brand-yellow),var(--brand-orange))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>SenseStock</span>
        </div>
        <p style={{color:'var(--on-dark-muted)',fontSize:'var(--fs-section)',lineHeight:1.6}}>
          누군가의 기억 대신, 팀이 함께 보는 위치·재고 정보.<br/>
          SenseStock은 관능평가실 비품을 모두가 독립적으로 찾을 수 있게 합니다.
        </p>
      </div>
      <div style={{position:'relative',zIndex:2,width:'100%',maxWidth:420}}>
        <div className="card" style={{padding:36,background:'var(--canvas)',color:'var(--ink)',boxShadow:'var(--shadow-3)'}}>
          <h2 style={{margin:'0 0 8px',fontSize:24,fontWeight:600,letterSpacing:'-0.3px'}}>로그인</h2>
          <p style={{margin:'0 0 28px',fontSize:'var(--fs-body)',color:'var(--slate)'}}>허가된 Google 계정으로만 접속할 수 있습니다.</p>
          {err&&<div style={{background:'#FCEFEF',color:'var(--error)',border:'1px solid #EBC7C7',padding:'8px 12px',borderRadius:'var(--r-md)',fontSize:'var(--fs-body)',marginBottom:16}}>{err}</div>}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{width:'100%',height:48,borderRadius:'var(--r-md)',border:'1px solid var(--hairline-strong)',background:'var(--canvas)',color:'var(--ink)',fontSize:'var(--fs-section)',fontWeight:500,cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:12,fontFamily:'inherit'}}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.8 13.3l7.8 6C12.4 13 17.8 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 6.9-10 6.9-17z"/>
              <path fill="#FBBC05" d="M10.6 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.7-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l8-6.1z"/>
              <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.9l-8 6.1C6.6 42.5 14.7 48 24 48z"/>
            </svg>
            {loading?'로그인 중...':'Google 계정으로 로그인'}
          </button>
          <div style={{marginTop:20,fontSize:'var(--fs-sm)',color:'var(--steel)',textAlign:'center'}}>
            외부 회원가입은 제공하지 않습니다.<br/>접속 권한은 관리자에게 요청하세요.
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({cur,onNav,user,onLogout}) {
  const [collapsed,setCollapsed]=useState(false);
  const [tooltip,setTooltip]=useState<{label:string,y:number}|null>(null);
  const navItems=[
    {id:'search',label:'품목 찾기',I:IC.list},
    {id:'space',label:'공간 조회',I:IC.map},
    {id:'register',label:'신규 등록',I:IC.plus},
    {id:'dashboard',label:'대시 보드',I:IC.dash},
  ];
  return (
    <>
      <aside className={`ss-aside${collapsed?' collapsed':''}`} style={{width:240,background:'var(--surface)',borderRight:'1px solid var(--hairline)',display:'flex',flexDirection:'column',flexShrink:0}}>
        <div className="row between" style={{height:'var(--h-topbar)',padding:'0 14px 0 16px',borderBottom:'1px solid var(--hairline-soft)',flexShrink:0}}>
          <div className="row" style={{gap:10,overflow:'hidden'}}>
            <span className="ss-logo-name" style={{fontSize:22,fontWeight:600,color:'var(--ink-deep)'}}>SenseStock</span>
          </div>
          <button className="ss-toggle-btn" onClick={()=>setCollapsed(c=>!c)}>
            <SidebarToggleIcon open={!collapsed}/>
          </button>
        </div>
        <nav style={{padding:'8px 6px',display:'flex',flexDirection:'column',gap:2,flex:1,overflow:'auto'}}>
          {navItems.map(({id,label,I})=>{
            const a=cur===id||(id==='search'&&cur==='detail');
            return (
              <button
                key={id}
                onClick={()=>onNav(id)}
                className="ss-nav-item row"
                onMouseEnter={e=>{if(collapsed){const r=e.currentTarget.getBoundingClientRect();setTooltip({label,y:r.top+r.height/2});}}}
                onMouseLeave={()=>setTooltip(null)}
                style={{gap:10,padding:'8px',borderRadius:'var(--r-md)',background:a?'var(--primary-soft)':'transparent',color:a?'var(--primary-deep)':'var(--charcoal)',fontWeight:a?600:500,fontSize:'var(--fs-nav)',border:'none',cursor:'pointer',textAlign:'left',fontFamily:'inherit',width:'100%'}}
              >
                <span style={{color:a?'var(--primary)':'var(--slate)',display:'flex',width:20,justifyContent:'center',flexShrink:0}}><I/></span>
                <span className="ss-nav-label">{label}</span>
              </button>
            );
          })}
        </nav>
        <div className="row" style={{borderTop:'1px solid var(--hairline-soft)',padding:'12px 6px',gap:10,flexShrink:0}}>
          <div className="ss-avatar" style={{width:32,height:32,borderRadius:'50%',background:'var(--tint-lavender)',color:'var(--brand-purple-800)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:'var(--fs-label)',flexShrink:0}}>
            {user?.name?.[0]||'U'}
          </div>
          <div className="ss-user-info col flex1">
            <span style={{fontSize:'var(--fs-nav)',fontWeight:600,color:'var(--charcoal)'}}>{user?.name}</span>
            <span style={{fontSize:'var(--fs-label)',color:'var(--steel)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</span>
          </div>
          <button className="ss-logout-btn btn btn-ghost btn-icon" onClick={onLogout} style={{color:'var(--slate)',flexShrink:0}}><IC.logout/></button>
        </div>
      </aside>
      {collapsed&&tooltip&&(
        <div style={{position:'fixed',left:60,top:tooltip.y,transform:'translateY(-50%)',background:'#2D2D2D',color:'#fff',fontSize:'var(--fs-sm)',fontWeight:500,lineHeight:1.4,padding:'4px 8px',borderRadius:6,whiteSpace:'nowrap',pointerEvents:'none',zIndex:200}}>
          {tooltip.label}
        </div>
      )}
    </>
  );
}

function Donut({data,total,size=160}) {
  const r=size/2-4,inner=r*0.62,circ=2*Math.PI*r,sum=data.reduce((a,b)=>a+b.v,0)||1;
  let off=0;
  return (
    <div style={{position:'relative',flexShrink:0}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--hairline)" strokeWidth={r-inner}/>
        {data.map((d,i)=>{
          if(!d.v) return null;
          const len=d.v/sum*circ;
          const el=<circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={d.c} strokeWidth={r-inner} strokeDasharray={`${len} ${circ-len}`} strokeDashoffset={-off}/>;
          off+=len; return el;
        })}
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <span style={{fontSize:24,fontWeight:600,color:'var(--ink-deep)'}}>{total}</span>
        <span style={{fontSize:'var(--fs-label)',color:'var(--steel)'}}>총 품목</span>
      </div>
    </div>
  );
}

function Dashboard({items,activity,onNav,onItemClick}) {
  const isMobile=useMediaQuery('(max-width:768px)');
  const total=items.length;
  const spaceC=['#6457E7','#E48F50','#3BA063','#2382E2','#E2557F','#9B6F47'];
  const useData=USES.map(u=>({c:u.color,v:items.filter(i=>i.useId===u.id).length,name:u.name})).sort((a,b)=>b.v-a.v);
  const spData=SPACES.map((s,i)=>({c:spaceC[i],v:items.filter(i=>i.space===s).length,name:s}));
  const aDot={create:{bg:'var(--tint-mint)',fg:'var(--brand-green)',l:'+'},update:{bg:'var(--tint-sky)',fg:'var(--link-blue)',l:'~'},delete:{bg:'var(--tint-rose)',fg:'var(--brand-pink-deep)',l:'–'}};
  return (
    <div className="col" style={{height:'100%'}}>
      <Topbar title="대시 보드" sub="관능평가실 비품 현황"/>
      <div className={`mobile-content mobile-pad`} style={{flex:1,overflow:'auto',padding:32,paddingBottom:100}}>
        <div className="mobile-grid-1" style={{display:'grid',gridTemplateColumns:'1fr 2.5fr',gap:16,marginBottom:16}}>
          <div className="card" style={{padding:24,display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <div style={{fontSize:'var(--fs-sm)',color:'var(--slate)'}}>총 등록 품목</div>
            <div style={{fontSize:45,fontWeight:600,color:'var(--ink-deep)',letterSpacing:'-1px',marginTop:8}}>{total}</div>
            <div className="row" style={{gap:6,marginTop:12}}>
              <span style={{padding:'2px 8px',borderRadius:'var(--r-full)',background:'var(--tint-lavender)',color:'var(--brand-purple-800)',fontSize:'var(--fs-label)',fontWeight:600}}>+12</span>
              <span style={{fontSize:'var(--fs-sm)',color:'var(--steel)'}}>이번 달</span>
            </div>
          </div>
          <div className="card" style={{padding:24}}>
            <div style={{fontWeight:600,fontSize:'var(--fs-section)',marginBottom:4}}>용도별 분포</div>
            <div style={{fontSize:'var(--fs-body)',color:'var(--slate)',marginBottom:20}}>{USES.length}개 분류 · 총 {total}품목</div>
            {isMobile?(
              <div className="col" style={{gap:16,alignItems:'center'}}>
                <Donut data={useData} total={total} size={140}/>
                <div style={{width:'100%',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 12px'}}>
                  {useData.map(u=>(
                    <div key={u.name} className="row" style={{gap:6,padding:'3px 0',minWidth:0}}>
                      <span className="swatch" style={{background:u.c,flexShrink:0}}/><span style={{flex:1,fontSize:'var(--fs-sm)',color:'var(--charcoal)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.name}</span><span style={{fontSize:'var(--fs-sm)',fontWeight:600,flexShrink:0}}>{u.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ):(
              <div className="row" style={{gap:32,alignItems:'center'}}>
                <Donut data={useData} total={total} size={180}/>
                <div style={{flex:1,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 24px'}}>
                  {useData.map(u=>(
                    <div key={u.name} className="row" style={{gap:8,padding:'4px 0'}}>
                      <span className="swatch" style={{background:u.c}}/><span style={{flex:1,fontSize:'var(--fs-body)',color:'var(--charcoal)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.name}</span><span style={{fontSize:'var(--fs-body)',fontWeight:600}}>{u.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mobile-grid-1" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div className="card" style={{padding:24}}>
            <div style={{fontWeight:600,fontSize:'var(--fs-section)',marginBottom:4}}>공간별 분포</div>
            <div style={{fontSize:'var(--fs-body)',color:'var(--slate)',marginBottom:20}}>{SPACES.length}개 공간</div>
            <div className="row" style={{gap:isMobile?12:24,alignItems:'center',flexWrap:isMobile?'wrap':'nowrap'}}>
              <Donut data={spData} total={total} size={isMobile?100:160}/>
              <div className="col" style={{flex:1,gap:6,minWidth:0}}>
                {spData.map(s=>(
                  <button key={s.name} onClick={()=>onNav('space',{space:s.name})} className="row" style={{gap:8,padding:'9px 12px',borderRadius:'var(--r-md)',border:'1px solid var(--hairline)',background:'var(--canvas)',cursor:'pointer',fontFamily:'inherit',minWidth:0}}>
                    <span className="swatch" style={{background:s.c}}/><span style={{flex:1,fontSize:'var(--fs-body)',fontWeight:500,color:'var(--charcoal)'}}>{s.name}</span><span style={{fontSize:'var(--fs-body)',fontWeight:600}}>{s.v}</span><IC.chev/>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="card" style={{padding:24}}>
            <div style={{fontWeight:600,fontSize:'var(--fs-section)',marginBottom:16}}>최근 활동</div>
            <div className="col">
              {activity.map((a,i)=>{
                const d=aDot[a.action]||aDot.create;
                return (
                  <div key={a.id} className="row" style={{gap:12,padding:'12px 0',borderBottom:i<activity.length-1?'1px solid var(--hairline-soft)':'none',alignItems:'flex-start'}}>
                    <div style={{width:24,height:24,borderRadius:'50%',background:d.bg,color:d.fg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'var(--fs-body)',fontWeight:700,flexShrink:0,marginTop:1}}>{d.l}</div>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:'var(--fs-body)',color:'var(--charcoal)',overflow:'hidden'}}><b>{a.user}</b>님이 <b>{a.name}</b>{a.action==='create'?'을 등록':a.action==='update'?'을 수정':'을 삭제'}했습니다.</div>
                      <div style={{fontSize:'var(--fs-sm)',color:'var(--steel)',marginTop:2}}>{a.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Search({items,onItemClick,onDelete}) {
  const [submitted,setSubmitted]=useState(false);
  const [q,setQ]=useState('');
  const [uf,setUf]=useState(new Set());
  const [sf,setSf]=useState(new Set());
  const [sel,setSel]=useState(new Set());
  const [delModal,setDelModal]=useState(false);
  const [suggOpen,setSuggOpen]=useState(false);
  const tog=(setter,v)=>setter(p=>{const s=new Set(p);s.has(v)?s.delete(v):s.add(v);return s;});
  const submit=()=>{setSubmitted(true);setSuggOpen(false);};
  const sugg=useMemo(()=>{
    if(!q.trim()) return [];
    const l=q.toLowerCase();
    const seen=new Set(),out=[];
    for(const it of items){
      if(!it.name.toLowerCase().includes(l)) continue;
      if(seen.has(it.name)) continue;
      seen.add(it.name); out.push(it);
      if(out.length>=6) break;
    }
    return out;
  },[q,items]);
  const filtered=useMemo(()=>{
    if(!submitted) return [];
    let r=items;
    if(q.trim()){const l=q.toLowerCase();r=r.filter(i=>i.name.toLowerCase().includes(l));}
    if(uf.size) r=r.filter(i=>uf.has(i.useId));
    if(sf.size) r=r.filter(i=>sf.has(i.space));
    return r;
  },[items,q,uf,sf,submitted]);
  const reset=()=>{setQ('');setUf(new Set());setSf(new Set());setSel(new Set());setSubmitted(false);};
  return (
    <div className="col" style={{height:'100%'}}>
      <Topbar title="품목 찾기" sub={`전체 ${items.length}개 품목`} action={sel.size>0?(
        <div className="row" style={{gap:12}}>
          <span style={{fontSize:'var(--fs-body)',color:'var(--slate)'}}>{sel.size}개 선택</span>
          <button className="btn btn-secondary btn-sm" onClick={()=>setSel(new Set())}>해제</button>
          <button className="btn btn-danger btn-sm" onClick={()=>setDelModal(true)}><IC.trash/> 삭제</button>
        </div>):null}/>
      <div className="mobile-pad-x" style={{padding:'16px 32px',borderBottom:'1px solid var(--hairline)',background:'var(--canvas)'}}>
        <div style={{position:'relative',maxWidth:640}}>
          <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--slate)',display:'flex'}}><IC.search/></span>
          <input className="search-pill" placeholder="품목명으로 검색…" value={q} onChange={e=>{setQ(e.target.value);setSubmitted(false);setSuggOpen(true);}} onFocus={()=>setSuggOpen(true)} onBlur={()=>setTimeout(()=>setSuggOpen(false),150)} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          <button className="btn btn-primary btn-sm" onClick={submit} style={{position:'absolute',right:6,top:'50%',transform:'translateY(-50%)',height:'var(--h-btn-sm)'}}>찾기</button>
          {suggOpen&&sugg.length>0&&(
            <div className="card" style={{position:'absolute',top:'calc(100% + 6px)',left:0,right:0,padding:6,zIndex:10,boxShadow:'var(--shadow-2)'}}>
              <div style={{fontSize:'var(--fs-sm)',fontWeight:600,color:'var(--steel)',padding:'4px 10px'}}>추천</div>
              {sugg.map(s=>{
                const u=useById(s.useId);
                return (
                  <button key={s.id} onMouseDown={()=>{setQ(s.name);submit();}} className="row" style={{gap:8,width:'100%',padding:'8px 10px',background:'transparent',border:'none',borderRadius:'var(--r-sm)',cursor:'pointer',fontFamily:'inherit',textAlign:'left'}} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <span className="swatch" style={{background:u.color,flexShrink:0}}/><span style={{fontSize:'var(--fs-body)',color:'var(--charcoal)',flex:1,textAlign:'left'}}>{hi(s.name,q)}</span><span style={{fontSize:'var(--fs-sm)',color:'var(--slate)',flexShrink:0}}>{s.space}·{s.group}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="row wrap" style={{gap:8,marginTop:12}}>
          <span style={{fontSize:'var(--fs-sm)',fontWeight:500,color:'var(--slate)'}}>용도</span>
          {USES.map(u=><button key={u.id} className={`chip ${uf.has(u.id)?'active':''}`} onClick={()=>tog(setUf,u.id)}><span className="swatch" style={{background:u.color}}/>{u.short}</button>)}
        </div>
        <div className="row wrap" style={{gap:8,marginTop:8}}>
          <span style={{fontSize:'var(--fs-sm)',fontWeight:500,color:'var(--slate)'}}>공간</span>
          {SPACES.map(s=><button key={s} className={`chip ${sf.has(s)?'active':''}`} onClick={()=>tog(setSf,s)}>{s}</button>)}
          {(uf.size+sf.size+(q?1:0))>0&&<button style={{fontSize:'var(--fs-sm)',color:'var(--link-blue)',background:'none',border:'none',cursor:'pointer'}} onClick={reset}>필터 초기화</button>}
        </div>
      </div>
      <div className="mobile-content mobile-scroll-x" style={{flex:1,overflow:'auto'}}>
        {/* 데스크탑 테이블 */}
        <table className="table mobile-hide" style={{minWidth:700}}>
          <thead><tr>
            <th style={{width:36}}>
              {filtered.length>0&&<input type="checkbox" checked={sel.size===filtered.length&&filtered.length>0} onChange={e=>setSel(e.target.checked?new Set(filtered.map(i=>i.id)):new Set())}/>}
            </th>
            <th style={{width:220}}>품목명</th><th style={{width:130}}>용도</th><th style={{width:180}}>위치</th><th style={{width:110}}>규격</th><th style={{width:110,textAlign:'right'}}>수량/최소</th><th style={{width:70}}>입고</th>
          </tr></thead>
          <tbody>
            {filtered.map(it=>{
              const u=useById(it.useId);
              const isLow=it.min!=null&&it.qty<it.min;
              const isSel=sel.has(it.id);
              return (
                <tr key={it.id} className={isSel?'sel':''} onClick={e=>{if(e.target.tagName==='INPUT') return; onItemClick(it);}}>
                  <td onClick={e=>{e.stopPropagation();tog(setSel,it.id);}}><input type="checkbox" checked={isSel} onChange={()=>{}}/></td>
                  <td style={{maxWidth:220}}><div style={{fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{q?hi(it.name,q):it.name}</div>{it.note&&<div style={{fontSize:'var(--fs-sm)',color:'var(--steel)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.note}</div>}</td>
                  <td><span className="row" style={{gap:6}}><span className="swatch" style={{background:u.color,flexShrink:0}}/><span style={{fontSize:'var(--fs-body)',color:'var(--charcoal)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.short}</span></span></td>
                  <td><span style={{fontSize:'var(--fs-body)'}}><b>{it.space}</b><span style={{color:'var(--slate)'}}> / {it.group} / {it.cell}</span></span></td>
                  <td><span style={{fontSize:'var(--fs-body)',color:'var(--slate)',whiteSpace:'nowrap'}}>{it.spec||'–'}</span></td>
                  <td style={{textAlign:'right'}}><span style={{fontWeight:600,color:isLow?'var(--error)':'var(--ink)'}}>{it.qty}</span>{it.min!=null&&<span style={{fontSize:'var(--fs-sm)',color:'var(--steel)'}}> / {it.min}</span>}{isLow&&<div style={{fontSize:'var(--fs-label)',color:'var(--error)',fontWeight:600}}>재고 부족</div>}</td>
                  <td><span style={{fontSize:'var(--fs-body)',color:'var(--slate)',whiteSpace:'nowrap'}}>{it.received}</span></td>
                </tr>
              );
            })}
            {filtered.length===0&&submitted&&<tr><td colSpan={7} style={{padding:'48px 0',textAlign:'center',color:'var(--slate)'}}>일치하는 품목이 없습니다.</td></tr>}
            {!submitted&&<tr><td colSpan={7} style={{padding:'48px 0',textAlign:'center',color:'var(--slate)'}}>검색어를 입력하고 검색 버튼을 눌러주세요.</td></tr>}
          </tbody>
        </table>
        {/* 모바일 카드 리스트 */}
        <div className="mobile-list desktop-hide">
          {!submitted&&<div style={{padding:'48px 24px',textAlign:'center',color:'var(--slate)',fontSize:'var(--fs-body)'}}>검색어를 입력하고 검색 버튼을 눌러주세요.</div>}
          {submitted&&filtered.length===0&&<div style={{padding:'48px 24px',textAlign:'center',color:'var(--slate)',fontSize:'var(--fs-body)'}}>일치하는 품목이 없습니다.</div>}
          {filtered.map(it=>{
            const u=useById(it.useId);
            const isLow=it.min!=null&&it.qty<it.min;
            const isSel=sel.has(it.id);
            return (
              <div key={it.id} onClick={()=>onItemClick(it)} style={{padding:'14px 16px',borderBottom:'1px solid var(--hairline)',background:isSel?'var(--primary-soft)':'var(--canvas)',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
                <div onClick={e=>{e.stopPropagation();tog(setSel,it.id);}} style={{flexShrink:0}}>
                  <input type="checkbox" checked={isSel} onChange={()=>{}} style={{width:16,height:16}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:500,fontSize:'var(--fs-body)',color:'var(--ink-deep)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{q?hi(it.name,q):it.name}</div>
                  <div className="row" style={{gap:6,marginTop:3,alignItems:'center'}}>
                    <span className="swatch" style={{background:u.color,flexShrink:0}}/><span style={{fontSize:'var(--fs-sm)',color:'var(--slate)'}}>{u.short}</span>
                    <span style={{fontSize:'var(--fs-sm)',color:'var(--steel)'}}>·</span>
                    <span style={{fontSize:'var(--fs-sm)',color:'var(--slate)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.space} / {it.group} / {it.cell}</span>
                  </div>
                  {it.note&&<div style={{fontSize:'var(--fs-label)',color:'var(--steel)',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.note}</div>}
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontWeight:600,fontSize:15,color:isLow?'var(--error)':'var(--ink-deep)'}}>{it.qty}{it.min!=null&&<span style={{fontSize:'var(--fs-sm)',color:'var(--slate)',fontWeight:400}}> / {it.min}</span>}</div>
                  {isLow&&<div style={{fontSize:'var(--fs-label)',color:'var(--error)',fontWeight:600}}>재고 부족</div>}
                  <div style={{fontSize:'var(--fs-sm)',color:'var(--steel)',marginTop:1}}>{it.received}</div>
                </div>
              </div>
            );
          })}
          <div style={{height:24}}/>
        </div>
      </div>
      <Modal open={delModal} onClose={()=>setDelModal(false)}>
        <div style={{padding:28}}>
          <div className="row" style={{gap:12,marginBottom:16}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:'var(--tint-rose)',color:'var(--brand-pink-deep)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><IC.alert/></div>
            <div><div style={{fontSize:'var(--fs-section)',fontWeight:600}}>{sel.size}개 품목을 삭제할까요?</div><div style={{fontSize:'var(--fs-body)',color:'var(--slate)',marginTop:2}}>이 작업은 되돌릴 수 없습니다.</div></div>
          </div>
          <div className="row between" style={{marginTop:20}}>
            <button className="btn btn-danger" onClick={()=>{onDelete([...sel]);setDelModal(false);setSel(new Set());}}><IC.trash/> 삭제</button>
            <button className="btn btn-secondary" onClick={()=>setDelModal(false)}>취소</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Cell({space,group,cell,label,x,y,w,h,vert,itemMap,selected,onToggle}) {
  const key=`${group}||${cell}`;
  const its=(itemMap[`${space}/${group}/${cell}`]||[]);
  const dom=dominant(its);
  const isSel=selected.has(key);
  const empty=its.length===0;
  const fill=empty?'#FAFAF8':(dom?.color||'#FAFAF8');
  const darkColors=['var(--use-2)','var(--use-3)','var(--use-9)','var(--use-10)','var(--use-11)','var(--use-8)','var(--use-1)','var(--use-6)'];
  const tc=darkColors.includes(fill)?'rgba(255,255,255,.9)':'var(--ink)';
  const displayLabel=label;
  return (
    <div onClick={()=>onToggle(key)} style={{position:'absolute',left:x,top:y,width:w,height:h,background:fill,opacity:empty?1:.85,border:isSel?'2.5px solid var(--ink-deep)':'1px solid var(--hairline-strong)',borderRadius:4,cursor:'pointer',display:'flex',alignItems:'flex-start',justifyContent:'flex-start',padding:4,boxSizing:'border-box',boxShadow:isSel?'0 4px 12px rgba(15,15,15,.16)':'none',transform:isSel?'scale(1.02)':'scale(1)',transition:'transform 80ms',zIndex:isSel?5:1}} title={its.length>0?`${its.length}개 품목`:'비어있음'}>
      <span style={{fontSize:'var(--fs-sm)',fontWeight:600,color:empty?'var(--steel)':tc,writingMode:'horizontal-tb',lineHeight:1.2}}>{displayLabel}</span>
    </div>
  );
}
function FBox({title,x,y,w,h,tp='top',children}) {
  const pos={
    top:{left:x+4,top:y-20},
    left:{left:x-4,top:y+h/2,transform:'translateX(-100%) translateY(-50%)'},
    right:{left:x+w+6,top:y+h/2,transform:'translateY(-50%)'},
    bottom:{left:x+4,top:y+h+4},
  }[tp]||{left:x+4,top:y-20};
  return (
    <>
      <div style={{position:'absolute',left:x,top:y,width:w,height:h,border:'1.5px solid var(--ink-deep)',borderRadius:4,pointerEvents:'none'}}/>
      {title&&<div style={{position:'absolute',...pos,fontSize:'var(--fs-sm)',fontWeight:700,color:'var(--ink-deep)',whiteSpace:'nowrap'}}>{title}</div>}
      {children}
    </>
  );
}
function PrepPlan(p) {
  const c=(g,ce,x,y,w,h,label,vert)=>({...p,group:g,cell:ce,label:label??ce,x,y,w,h,vert});
  return (
    <div style={{position:'relative',width:1280,height:760,background:'var(--canvas)',border:'1px solid var(--hairline)',borderRadius:'var(--r-lg)',margin:'0 auto'}}>
      <FBox title="선반" x={60} y={40} w={70} h={330} tp="left">
        {['1','2','3','4'].map((ce,i)=><Cell key={ce} {...c('선반',ce,60,40+i*82.5,70,82.5,ce,true)}/>)}
      </FBox>
      <FBox title="실험대 위" x={325} y={40} w={620} h={110} tp="right">
        {['1','2','3','4','5'].map((ce,i)=><Cell key={ce} {...c('실험대 위',ce,325+i*124,40,124,110,ce)}/>)}
      </FBox>
      <FBox title="실험대 아래/서랍" x={170} y={195} w={775} h={150} tp="right">
        <Cell {...c('실험대 아래','1',170,195,90,150,'1')}/>
        <Cell {...c('실험대 아래','2',260,195,90,150,'2')}/>
        {['서랍 1','서랍 2','서랍 3','서랍 4','서랍 5','서랍 6'].map((ce,i)=><Cell key={ce} {...c('실험대 서랍',ce,358+(i%2)*70,195+Math.floor(i/2)*50,70,50,ce)}/>)}
        {['3','4','5','6'].map((ce,i)=><Cell key={ce} {...c('실험대 아래',ce,506+i*110,195,110,150,ce)}/>)}
      </FBox>
      <FBox title="조리대 좌측" x={325} y={465} w={260} h={150}>
        {['서랍 1','서랍 2','서랍 3'].map((ce,i)=><Cell key={ce} {...c('조리대 좌측',ce,325+i*87,465,87,40,ce)}/>)}
        <Cell {...c('조리대 좌측','4',325,505,130,110,'4')}/>
        <Cell {...c('조리대 좌측','5',455,505,130,110,'5')}/>
      </FBox>
      <FBox title="조리대 우측" x={625} y={465} w={260} h={150}>
        {['서랍 1','서랍 2','서랍 3'].map((ce,i)=><Cell key={ce} {...c('조리대 우측',ce,625+i*87,465,87,40,ce)}/>)}
        <Cell {...c('조리대 우측','4',625,505,130,110,'4')}/>
        <Cell {...c('조리대 우측','5',755,505,130,110,'5')}/>
      </FBox>
      <FBox title="싱크대 아래" x={170} y={580} w={145} h={48} tp="left">
        <Cell {...c('싱크대 아래','2',170,580,72,48,'2')}/>
        <Cell {...c('싱크대 아래','1',242,580,73,48,'1')}/>
      </FBox>
      <FBox title="싱크대 위" x={170} y={650} w={715} h={70} tp="left">
        {['6','5','4','3','2','1'].map((ce,i)=><Cell key={ce} {...c('싱크대 위',ce,170+i*119,650,119,70,ce)}/>)}
      </FBox>
      <FBox title="저울대 아래" x={970} y={365} w={100} h={350} tp="bottom">
        <Cell {...c('저울대 아래','1',970,365,100,130,'1',true)}/>
        <Cell {...c('저울대 아래','2',970,495,100,130,'2',true)}/>
        {['서랍 4','서랍 3','서랍 2','서랍 1'].map((ce,i)=><Cell key={ce} {...c('저울대 아래',ce,970+i*25,625,25,90,ce,true)}/>)}
      </FBox>
      <FBox title="저울대 위" x={1100} y={365} w={75} h={350} tp="bottom">
        {['1','2','3'].map((ce,i)=><Cell key={ce} {...c('저울대 위',ce,1100,365+i*116.7,75,116.7,ce,true)}/>)}
      </FBox>
    </div>
  );
}
function SimplePlan({space,title,p}) {
  const g=ZONES[space]&&ZONES[space][0]?ZONES[space][0]:null;
  if(!g) return null;
  return (
    <div style={{position:'relative',width:760,height:320,background:'var(--canvas)',border:'1px solid var(--hairline)',borderRadius:'var(--r-lg)',margin:'0 auto'}}>
      <div style={{position:'absolute',left:32,top:20,fontSize:22,fontWeight:600,color:'var(--ink-deep)'}}>{title}</div>
      <FBox title={g.group} x={120} y={100} w={520} h={180}>
        {g.cells.slice(0,3).map((ce,i)=><Cell key={ce} {...p} group={g.group} cell={ce} label={ce} x={120+i*174} y={100} w={174} h={50}/>)}
        {g.cells[3]&&<Cell {...p} group={g.group} cell={g.cells[3]} label={g.cells[3]} x={120} y={150} w={520} h={130}/>}
      </FBox>
    </div>
  );
}
function DiscPlan({space,title,p}) {
  const g=ZONES[space]&&ZONES[space][0]?ZONES[space][0]:null;
  if(!g) return null;
  return (
    <div style={{position:'relative',width:600,height:320,background:'var(--canvas)',border:'1px solid var(--hairline)',borderRadius:'var(--r-lg)',margin:'0 auto'}}>
      <div style={{position:'absolute',left:32,top:20,fontSize:22,fontWeight:600,color:'var(--ink-deep)'}}>{title}</div>
      <FBox x={180} y={100} w={240} h={180}>
        {g.cells.map((ce,i)=><Cell key={ce} {...p} group={g.group} cell={ce} label={ce} x={180} y={100+i*60} w={240} h={60}/>)}
      </FBox>
    </div>
  );
}
function StorePlan(p) {
  const c=(g,ce,x,y,w,h)=>({...p,group:g,cell:ce,label:ce,x,y,w,h});
  return (
    <div style={{position:'relative',width:900,height:520,background:'var(--canvas)',border:'1px solid var(--hairline)',borderRadius:'var(--r-lg)',margin:'0 auto'}}>
      <div style={{position:'absolute',left:32,top:20,fontSize:22,fontWeight:600,color:'var(--ink-deep)'}}>창고</div>
      <FBox title="수납장" x={50} y={80} w={240} h={400}>
        {['1','2','3','4','5','6','7','8'].map((ce,i)=><Cell key={ce} {...c('수납장',ce,50+(i%2)*120,80+Math.floor(i/2)*100,120,100)}/>)}
      </FBox>
      <FBox title="박스" x={360} y={80} w={180} h={400}>
        {['1','2','3'].map((ce,i)=><Cell key={ce} {...c('박스',ce,360,80+i*133,180,133)}/>)}
      </FBox>
      <FBox title="선반" x={610} y={80} w={120} h={400}>
        {['1','2','3','4','5','6','7','8'].map((ce,i)=><Cell key={ce} {...c('선반',ce,610,80+i*50,120,50)}/>)}
      </FBox>
    </div>
  );
}
function SpaceView({items,onNav,onItemClick,initialSpace}) {
  const [space,setSpace]=useState(initialSpace||'준비');
  const [sel,setSel]=useState(new Set());
  const [showList,setShowList]=useState(false);
  const isMobile=useMediaQuery('(max-width:768px)');
  useEffect(()=>{setSel(new Set());setShowList(false);},[space]);
  const iMap=useMemo(()=>itemsByLoc(items.filter(i=>i.space===space)),[items,space]);
  const tog=key=>setSel(s=>{const n=new Set(s);n.has(key)?n.delete(key):n.add(key);return n;});
  const selItems=useMemo(()=>{const out=[];for(const k of sel){const[g,c]=k.split('||');out.push(...(iMap[`${space}/${g}/${c}`]||[]));}return out;},[sel,iMap,space]);
  const pp={space,itemMap:iMap,selected:sel,onToggle:tog};
  return (
    <div className="col" style={{height:'100%'}}>
      <Topbar title="공간 조회" sub="배치도 기반 비품 위치 확인" action={
        <div className="row" style={{gap:12}}>
          {!isMobile&&<span style={{fontSize:'var(--fs-body)',color:'var(--slate)'}}>{sel.size}개 셀 선택</span>}
          <button className="btn btn-secondary btn-sm" disabled={!sel.size} onClick={()=>setSel(new Set())} title="초기화" style={isMobile?{width:30,padding:0}:{}}><IC.refresh/>{!isMobile&&<span> 초기화</span>}</button>
          <button className="btn btn-primary btn-sm" disabled={sel.size!==1} onClick={()=>{
            const key=[...sel][0];
            if(!key) return;
            const idx=key.indexOf('||');
            if(idx<0) return;
            const group=key.slice(0,idx);
            const cell=key.slice(idx+2);
            onNav('register',{space,group,cell});
          }} title="등록"><IC.plus/> 등록</button>
          <button className="btn btn-primary btn-sm" disabled={!sel.size} onClick={()=>setShowList(true)}>조회 ({selItems.length})</button>
        </div>}/>
      <div style={{overflowX:'auto',overflowY:'hidden',WebkitOverflowScrolling:'touch',background:'var(--canvas)',borderBottom:'1px solid var(--hairline)',flexShrink:0}}>
        <div className="row" style={{padding:'0 16px',gap:0,minWidth:'max-content'}}>
        {SPACES.map(s=>{const a=space===s;const cnt=items.filter(i=>i.space===s).length;return(
          <button key={s} onClick={()=>setSpace(s)} style={{padding:'14px 14px 12px',border:'none',background:'transparent',color:a?'var(--ink)':'var(--slate)',fontWeight:a?600:500,fontSize:'var(--fs-body)',borderBottom:a?'2px solid var(--primary)':'2px solid transparent',cursor:'pointer',position:'relative',top:1,display:'flex',alignItems:'center',gap:8,fontFamily:'inherit',whiteSpace:'nowrap'}}>
            {s}<span style={{fontSize:'var(--fs-sm)',padding:'1px 6px',borderRadius:'var(--r-full)',background:a?'var(--primary-soft)':'var(--surface)',color:a?'var(--primary-deep)':'var(--slate)',fontWeight:600}}>{cnt}</span>
          </button>
        );})}
        </div>
      </div>
      <div className="mobile-pad-x" style={{padding:'12px 32px',background:'var(--surface)',borderBottom:'1px solid var(--hairline)',flexShrink:0}}>
        <div className="row wrap" style={{gap:8}}>
          <span style={{fontSize:'var(--fs-sm)',fontWeight:600,color:'var(--steel)'}}>용도</span>
          {USES.map(u=><div key={u.id} className="row" style={{gap:4}}><span className="swatch" style={{background:u.color}}/><span style={{fontSize:'var(--fs-sm)',color:'var(--charcoal)'}}>{u.short}</span></div>)}
          <span style={{marginLeft:'auto',fontSize:'var(--fs-label)',color:'var(--steel)',whiteSpace:'nowrap'}}>셀 색 = 최다 용도</span>
        </div>
      </div>
      <div className="mobile-content mobile-scroll-x" style={{flex:1,overflow:'auto',padding:'20px 32px',paddingBottom:100,background:'var(--surface)',position:'relative'}}>
        {space==='준비'&&<PrepPlan {...pp}/>}
        {(space==='서빙1'||space==='서빙2')&&<SimplePlan space={space} title={space==='서빙1'?'Serving Room 1':'Serving Room 2'} p={pp}/>}
        {(space==='토론1'||space==='토론2')&&<DiscPlan space={space} title={space==='토론1'?'Discussion Room 1':'Discussion Room 2'} p={pp}/>}
        {space==='창고'&&<StorePlan {...pp}/>}
        {showList&&(
          <div onClick={()=>setShowList(false)} style={{position:'fixed',inset:0,background:'rgba(15,15,15,.3)',zIndex:60,display:'flex',alignItems:'flex-end',justifyContent:'center',padding:isMobile?0:'0 0 24px 0'}}>
            <div onClick={e=>e.stopPropagation()} className="card" style={{width:'100%',maxWidth:isMobile?'100%':'calc(100% - 528px)',marginLeft:isMobile?0:'264px',maxHeight:isMobile?'65%':'calc(65% - 48px)',borderRadius:isMobile?'var(--r-lg) var(--r-lg) 0 0':'var(--r-lg)',background:'var(--canvas)',boxShadow:isMobile?'var(--shadow-4)':'0 -4px 24px rgba(15,15,15,.18)',border:isMobile?'none':'1px solid var(--hairline-strong)',display:'flex',flexDirection:'column'}}>
              <div className="row between" style={{padding:'16px 24px',borderBottom:'1px solid var(--hairline)',flexShrink:0}}>
                <div className="row" style={{gap:10}}>
                  <span style={{fontSize:20,fontWeight:600}}>{space} · {sel.size}개 셀</span>
                  <span className="badge" style={{background:'var(--primary-soft)',color:'var(--primary-deep)'}}>{selItems.length}개 품목</span>
                </div>
                <button className="btn btn-ghost btn-icon" onClick={()=>setShowList(false)}><IC.x/></button>
              </div>
              <div style={{flex:1,overflow:'auto',paddingBottom:8}}>
                <table className="table mobile-hide">
                  <thead><tr><th style={{width:200}}>품목명</th><th style={{width:120}}>용도</th><th style={{width:140}}>위치</th><th style={{width:160}}>규격</th><th style={{width:60}}>수량</th></tr></thead>
                  <tbody>
                    {selItems.map(it=>{
                      const u=useById(it.useId);
                      const isLow=it.min!=null&&it.qty<it.min;
                      return (
                        <tr key={it.id} onClick={()=>{setShowList(false);onItemClick(it);}}>
                          <td><div style={{fontWeight:500}}>{it.name}</div>{it.note&&<div style={{fontSize:'var(--fs-sm)',color:'var(--steel)'}}>{it.note}</div>}</td>
                          <td><span className="row" style={{gap:6}}><span className="swatch" style={{background:u.color}}/>{u.short}</span></td>
                          <td><b>{it.group}</b> / {it.cell}</td>
                          <td style={{fontSize:'var(--fs-body)',color:'var(--slate)'}}>{it.spec||'–'}</td>
                          <td><span style={{fontWeight:600,color:isLow?'var(--error)':'var(--ink)'}}>{it.qty}</span>{it.min!=null&&<span style={{fontSize:'var(--fs-sm)',color:'var(--slate)'}}> / {it.min}</span>}</td>
                        </tr>
                      );
                    })}
                    {selItems.length===0&&<tr><td colSpan={5} style={{padding:'40px 0',textAlign:'center',color:'var(--slate)'}}>선택한 셀에 품목이 없습니다.</td></tr>}
                  </tbody>
                </table>
                <div className="desktop-hide mobile-list" style={{flexDirection:'column'}}>
                  {selItems.map(it=>{
                    const u=useById(it.useId);
                    const isLow=it.min!=null&&it.qty<it.min;
                    return (
                      <div key={it.id} onClick={()=>{setShowList(false);onItemClick(it);}} style={{padding:'12px 20px',borderBottom:'1px solid var(--hairline)',cursor:'pointer'}}>
                        <div className="row between" style={{alignItems:'flex-start',gap:8}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:600,fontSize:'var(--fs-section)',color:'var(--ink-deep)',marginBottom:4}}>{it.name}</div>
                            <div className="row" style={{gap:6,flexWrap:'wrap'}}>
                              <span className="row" style={{gap:4}}><span className="swatch" style={{background:u.color}}/><span style={{fontSize:'var(--fs-sm)',color:'var(--slate)'}}>{u.short}</span></span>
                              <span style={{fontSize:'var(--fs-sm)',color:'var(--steel)'}}>·</span>
                              <span style={{fontSize:'var(--fs-sm)',color:'var(--slate)'}}><b style={{color:'var(--charcoal)'}}>{it.group}</b> / {it.cell}</span>
                            </div>
                          </div>
                          <div style={{textAlign:'right',flexShrink:0}}>
                            <span style={{fontWeight:700,fontSize:'var(--fs-section)',color:isLow?'var(--error)':'var(--ink)'}}>{it.qty}</span>
                            {it.min!=null&&<span style={{fontSize:'var(--fs-sm)',color:'var(--slate)'}}> / {it.min}</span>}
                            {isLow&&<div style={{fontSize:'var(--fs-label)',color:'var(--error)',fontWeight:500}}>재고 부족</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {selItems.length===0&&<div style={{padding:'40px 0',textAlign:'center',color:'var(--slate)',fontSize:'var(--fs-body)'}}>선택한 셀에 품목이 없습니다.</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UseSelect({value,onChange,editing}) {
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  const u=USES.find(o=>o.id===value)||null;
  useEffect(()=>{
    const fn=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener('mousedown',fn);
    return()=>document.removeEventListener('mousedown',fn);
  },[]);
  return (
    <div style={{position:'relative'}} ref={ref}>
      <button onClick={()=>setOpen(o=>!o)} className={`input ${editing?'is-editing':''}`} style={{textAlign:'left',display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontFamily:'inherit'}}>
        {u?<><span className="swatch" style={{background:u.color}}/><span style={{flex:1}}>{u.name}</span></>:<span style={{flex:1,color:'var(--stone)'}}>선택…</span>}
        <span style={{color:'var(--steel)'}}>▾</span>
      </button>
      {open&&(
        <div className="card" style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,padding:6,zIndex:30,boxShadow:'var(--shadow-2)',maxHeight:280,overflow:'auto'}}>
          {USES.map(o=>(
            <button key={o.id} onClick={()=>{onChange(o.id);setOpen(false);}} className="row" style={{gap:8,width:'100%',padding:'8px 10px',background:value===o.id?'var(--surface)':'transparent',border:'none',borderRadius:'var(--r-sm)',cursor:'pointer',fontFamily:'inherit'}} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>{if(value!==o.id)e.currentTarget.style.background='transparent';}}>
              <span className="swatch" style={{background:o.color}}/><span style={{fontSize:'var(--fs-body)'}}>{o.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
function formatReceived(raw:string):string {
  const digits=raw.replace(/\D/g,'').slice(0,6);
  if(digits.length<=4) return digits;
  return digits.slice(0,4)+'-'+digits.slice(4);
}
function MonthPicker({value,onChange,editing}:{value:string,onChange:(v:string)=>void,editing:boolean}) {
  const [open,setOpen]=useState(false);
  const [viewYear,setViewYear]=useState(()=>{const y=parseInt(value?.slice(0,4));return isNaN(y)?new Date().getFullYear():y;});
  const ref=useRef<HTMLDivElement>(null);
  const selectedYear=value?.slice(0,4);
  const selectedMonth=value?.slice(5,7);
  useEffect(()=>{
    const fn=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);};
    document.addEventListener('mousedown',fn);
    return()=>document.removeEventListener('mousedown',fn);
  },[]);
  const select=(m:number)=>{onChange(`${viewYear}-${String(m).padStart(2,'0')}`);setOpen(false);};
  const handleText=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const formatted=formatReceived(e.target.value);
    onChange(formatted);
    const y=parseInt(formatted.slice(0,4));
    if(!isNaN(y)&&y>1900&&y<2100) setViewYear(y);
  };
  const months=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  return (
    <div style={{position:'relative',minWidth:0}} ref={ref}>
      <div className={`input ${editing?'is-editing':''}`} style={{display:'flex',alignItems:'center',gap:4,padding:'0 8px',cursor:'text',minWidth:0,width:'100%',overflow:'hidden'}}>
        <input value={value} onChange={handleText} placeholder="YYYY-MM" maxLength={7} size={1} style={{flex:1,minWidth:0,border:'none',outline:'none',background:'transparent',font:'inherit',fontSize:'var(--fs-body)',color:'var(--ink)',padding:0}}/>
        <button onClick={()=>{setOpen(o=>!o);if(value){const y=parseInt(value.slice(0,4));if(!isNaN(y))setViewYear(y);}}} style={{background:'none',border:'none',cursor:'pointer',padding:'2px 2px',color:'var(--slate)',display:'flex',alignItems:'center',flexShrink:0,fontSize:'var(--fs-sm)'}}>📅</button>
      </div>
      {open&&(
        <div className="card" style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,zIndex:30,padding:14,boxShadow:'var(--shadow-2)'}}>
          <div className="row between" style={{marginBottom:12,alignItems:'center'}}>
            <button onClick={()=>setViewYear(y=>y-1)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'var(--fs-section)',color:'var(--charcoal)',padding:'2px 8px',borderRadius:'var(--r-sm)'}}>◀</button>
            <span style={{fontWeight:600,fontSize:'var(--fs-section)',color:'var(--ink-deep)'}}>{viewYear}년</span>
            <button onClick={()=>setViewYear(y=>y+1)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'var(--fs-section)',color:'var(--charcoal)',padding:'2px 8px',borderRadius:'var(--r-sm)'}}>▶</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
            {months.map((m,i)=>{
              const mon=String(i+1).padStart(2,'0');
              const isSel=selectedYear===String(viewYear)&&selectedMonth===mon;
              return (<button key={m} onClick={()=>select(i+1)} style={{padding:'8px 4px',borderRadius:'var(--r-md)',border:isSel?'2px solid var(--primary)':'1px solid var(--hairline)',background:isSel?'var(--primary-soft)':'var(--canvas)',color:isSel?'var(--primary-deep)':'var(--charcoal)',fontWeight:isSel?600:400,fontSize:'var(--fs-sm)',cursor:'pointer',fontFamily:'inherit'}}>{m}</button>);
            })}
          </div>
        </div>
      )}
    </div>
  );
}
function blank(pre={}) {return{name:'',useId:pre.useId||null,space:pre.space||'',group:pre.group||'',cell:pre.cell||'',spec:'',qty:'',min:'',received:'',note:''};}function RegisterEdit({mode,item,prefill,onCancel,onSave,onDelete}) {
  const isEdit=mode==='edit';
  const [form,setForm]=useState(()=>isEdit&&item?{...item}:blank(prefill||{}));
  const [ef,setEf]=useState(null);
  const [errs,setErrs]=useState({});
  const [delM,setDelM]=useState(false);
  const [saved,setSaved]=useState(false);
  const rq=form.useId&&QTY_REQ.includes(form.useId);
  const setF=(k,v)=>{setForm(f=>{const n={...f,[k]:v};if(k==='space'){n.group='';n.cell='';}if(k==='group')n.cell='';return n;});setEf(k);};
  const validate=()=>{
    const e={};
    if(!form.name.trim())e.name='품목명을 입력하세요.';
    if(!form.useId)e.useId='용도를 선택하세요.';
    if(!form.space)e.space='공간을 선택하세요.';
    if(!form.group)e.group='구역을 선택하세요.';
    if(!form.cell)e.cell='셀을 선택하세요.';
    if(rq){if(form.qty==='')e.qty='수량은 필수입니다.';if(form.min==='')e.min='최소 재고는 필수입니다.';}
    setErrs(e);return !Object.keys(e).length;
  };
  const submit=()=>{
    if(!validate())return;
    onSave({...form,qty:form.qty===''?0:+form.qty,min:form.min===''?null:+form.min});
    setSaved(true);setTimeout(()=>setSaved(false),1200);
  };
  const groups=form.space?[...new Set((ZONES[form.space]||[]).map(z=>z.group))]:[];
  const cells=form.space&&form.group?(ZONES[form.space]||[]).filter(z=>z.group===form.group).flatMap(z=>z.cells):[];
  return (
    <div className="col" style={{height:'100%'}}>
      <Topbar title={isEdit?'품목 수정':'신규 등록'} sub={isEdit&&item?`최종 수정: ${item.updatedAt} · ${item.updatedBy}`:'비품 정보를 입력하세요'} action={
        <div className="row" style={{gap:12}}>
          {isEdit&&<button className="btn btn-danger btn-sm" onClick={()=>setDelM(true)}><IC.trash/> 삭제</button>}
          <button className="btn btn-secondary btn-sm" onClick={onCancel} style={{minWidth:68}}>취소</button>
          <button className="btn btn-primary btn-sm" onClick={submit} style={{minWidth:68}}>{isEdit?'저장':'등록'}</button>
        </div>}/>
      <div className="mobile-content mobile-pad" style={{flex:1,overflow:'auto',padding:32,paddingBottom:100}}>
        <div style={{maxWidth:860,margin:'0 auto',display:'flex',flexDirection:'column',gap:16}}>
          {!isEdit&&prefill?.space&&(
            <div className="card" style={{padding:16,background:'var(--tint-lavender)',border:'1px solid var(--brand-purple-300)'}}>
              <div className="row" style={{gap:10}}><span style={{width:22,height:22,borderRadius:'50%',background:'var(--primary)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'var(--fs-sm)',fontWeight:700,flexShrink:0}}>!</span>
              <span style={{fontSize:'var(--fs-body)',color:'var(--brand-purple-800)'}}>공간 조회에서 <b>{prefill.space} / {prefill.group} / {prefill.cell}</b>의 신규 등록으로 이동했습니다. 위치 정보가 자동 입력되었습니다.</span></div>
            </div>
          )}
          <div className="card" style={{padding:24}}>
            <div style={{fontSize:'var(--fs-section)',fontWeight:600,marginBottom:16}}>기본 정보</div>
            <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:16}}>
              <Field label="품목명" required err={errs.name}><input className={`input ${ef==='name'?'is-editing':''}`} placeholder="예: 정량 피펫" value={form.name} onChange={e=>setF('name',e.target.value)}/></Field>
              <Field label="용도 분류" required err={errs.useId}><UseSelect value={form.useId} onChange={v=>setF('useId',v)} editing={ef==='useId'}/></Field>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:16,minWidth:0}}>
              <Field label="규격"><input className={`input ${ef==='spec'?'is-editing':''}`} placeholder="예: 250 mL" value={form.spec} onChange={e=>setF('spec',e.target.value)} style={{minWidth:0}}/></Field>
              <Field label="입고 시기" ><MonthPicker value={form.received} onChange={v=>setF('received',v)} editing={ef==='received'}/></Field>
            </div>
          </div>
          <div className="card" style={{padding:24}}>
            <div style={{fontSize:'var(--fs-section)',fontWeight:600,marginBottom:16}}>위치</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
              <Field label="공간" required err={errs.space}><select className={`select ${ef==='space'?'is-editing':''}`} value={form.space} onChange={e=>setF('space',e.target.value)}><option value="">선택…</option>{SPACES.map(s=><option key={s} value={s}>{s}</option>)}</select></Field>
              <Field label="구역" required err={errs.group}><select className={`select ${ef==='group'?'is-editing':''}`} value={form.group} onChange={e=>setF('group',e.target.value)} disabled={!form.space}><option value="">{form.space?'선택…':'공간을 먼저 선택'}</option>{groups.map(g=><option key={g} value={g}>{g}</option>)}</select></Field>
              <Field label="셀" required err={errs.cell}><select className={`select ${ef==='cell'?'is-editing':''}`} value={form.cell} onChange={e=>setF('cell',e.target.value)} disabled={!form.group}><option value="">{form.group?'선택…':'구역을 먼저 선택'}</option>{cells.map(c=><option key={c} value={c}>{c}</option>)}</select></Field>
            </div>
          </div>
          <div className="card" style={{padding:24}}>
            <div className="row between" style={{marginBottom:16}}>
              <div style={{fontSize:'var(--fs-section)',fontWeight:600}}>수량 정보</div>
              {rq&&<span className="badge" style={{background:'var(--tint-peach)',color:'var(--brand-orange-deep)'}}>수량 필수</span>}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <Field label={`수량${rq?' *':''}`} err={errs.qty}><input className={`input ${ef==='qty'?'is-editing':''}`} type="number" placeholder="0" value={form.qty??''} onChange={e=>setF('qty',e.target.value)}/></Field>
              <Field label={`최소 재고${rq?' *':''}`} err={errs.min}><input className={`input ${ef==='min'?'is-editing':''}`} type="number" placeholder={rq?'필수':'선택'} value={form.min??''} onChange={e=>setF('min',e.target.value)}/></Field>
            </div>
          </div>
          <div className="card" style={{padding:24}}>
            <div style={{fontSize:'var(--fs-section)',fontWeight:600,marginBottom:12}}>비고</div>
            <textarea className={`textarea ${ef==='note'?'is-editing':''}`} placeholder="추가 메모" value={form.note} onChange={e=>setF('note',e.target.value)} rows={3}/>
          </div>
          {isEdit&&item&&(
            <div className="card" style={{padding:16,background:'var(--surface)'}}>
              <div style={{fontSize:'var(--fs-sm)',fontWeight:600,color:'var(--steel)',marginBottom:8}}>시스템 정보</div>
              <div className="row wrap" style={{gap:32}}>
                {[['최초 등록일',item.createdAt],['최종 수정일',item.updatedAt],['최종 수정인',item.updatedBy],['품목 ID',`#${item.id}`]].map(([l,v])=>(
                  <div key={l} className="col"><span style={{fontSize:'var(--fs-sm)',color:'var(--steel)',textTransform:'uppercase',letterSpacing:.4}}>{l}</span><span style={{fontSize:'var(--fs-body)',fontWeight:500,marginTop:2}}>{v}</span></div>
                ))}
              </div>
            </div>
          )}
          <div style={{height:24}}/>
        </div>
      </div>
      <Modal open={delM} onClose={()=>setDelM(false)}>
        <div style={{padding:28}}>
          <div className="row" style={{gap:12,marginBottom:16}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:'var(--tint-rose)',color:'var(--brand-pink-deep)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><IC.alert/></div>
            <div><div style={{fontSize:'var(--fs-section)',fontWeight:600}}>이 품목을 삭제할까요?</div><div style={{fontSize:'var(--fs-body)',color:'var(--slate)',marginTop:2}}>{form.name}</div></div>
          </div>
          <div className="row between">
            <button className="btn btn-danger" onClick={()=>{if(onDelete&&item)onDelete(item.id);setDelM(false);}}><IC.trash/> 삭제</button>
            <button className="btn btn-secondary" onClick={()=>setDelM(false)}>취소</button>
          </div>
        </div>
      </Modal>
      {saved&&<div style={{position:'fixed',bottom:28,right:28,zIndex:200,background:'var(--ink-deep)',color:'#fff',padding:'10px 18px',borderRadius:'var(--r-md)',fontSize:'var(--fs-sm)',fontWeight:500,boxShadow:'var(--shadow-2)'}}>{isEdit?'저장되었습니다':'등록되었습니다'}</div>}
    </div>
  );
}

function Profile({user,onLogout}) {
  const initial=(user?.name||'?').charAt(0);
  return (
    <div className="col" style={{height:'100%'}}>
      <Topbar title="내 계정" sub="로그인 정보 및 설정"/>
      <div className="mobile-content mobile-pad" style={{flex:1,overflow:'auto',padding:32,paddingBottom:100}}>
        <div style={{maxWidth:480,margin:'0 auto',display:'flex',flexDirection:'column',gap:12}}>
          <div className="card" style={{padding:32,display:'flex',flexDirection:'column',alignItems:'center',gap:12,textAlign:'center'}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'var(--brand-navy)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:600,flexShrink:0}}>{initial}</div>
            <div>
              <div style={{fontSize:20,fontWeight:600,color:'var(--ink-deep)',marginBottom:4}}>{user?.name||'사용자'}</div>
              <div style={{fontSize:'var(--fs-body)',color:'var(--slate)'}}>{user?.email||''}</div>
            </div>
            <div style={{width:'100%',height:1,background:'var(--hairline)',margin:'4px 0'}}/>
            <button className="btn btn-secondary" style={{width:'100%',height:44,color:'var(--error)',borderColor:'var(--hairline-strong)'}} onClick={onLogout}>
              <IC.logout/> 로그아웃
            </button>
          </div>
          <div className="card" style={{padding:20}}>
            <div style={{fontSize:'var(--fs-sm)',color:'var(--slate)',marginBottom:8}}>접속 권한</div>
            <div className="row" style={{gap:8,alignItems:'center'}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:'var(--brand-green)',display:'inline-block',flexShrink:0}}/>
              <span style={{fontSize:'var(--fs-body)',fontWeight:500,color:'var(--ink)'}}>관능평가실 구성원</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCell({group,cell,label,x,y,w,h,vert,itemGroup,itemCell,itemColor}:{group:string,cell:string,label:string,x:number,y:number,w:number,h:number,vert?:boolean,itemGroup:string,itemCell:string,itemColor:string}) {
  const isTarget=group===itemGroup&&cell===itemCell;
  const bg=isTarget?itemColor:'#FFFFFF';
  const darkColors=['var(--use-2)','var(--use-3)','var(--use-9)','var(--use-10)','var(--use-11)','var(--use-8)','var(--use-1)','var(--use-6)'];
  const tc=isTarget?(darkColors.includes(itemColor)?'rgba(255,255,255,.9)':'var(--ink)'):'#9B9A97';
  return (
    <div style={{position:'absolute',left:x,top:y,width:w,height:h,background:bg,border:isTarget?'2.5px solid #1A1916':'1px solid #DEDCD7',borderRadius:4,display:'flex',alignItems:vert?'flex-end':'flex-start',justifyContent:vert?'center':'flex-start',padding:vert?5:5,boxSizing:'border-box',boxShadow:isTarget?'0 4px 12px rgba(15,15,15,.18)':'none'}}>
      <span style={{fontSize:18,fontWeight:isTarget?700:600,color:tc,writingMode:vert?'vertical-rl':'horizontal-tb',lineHeight:1.2}}>{isTarget ? label : null}</span>
    </div>
  );
}

function MiniMapPrep({itemGroup,itemCell,itemColor}:{itemGroup:string,itemCell:string,itemColor:string}) {
  const p={itemGroup,itemCell,itemColor};
  const c=(g:string,ce:string,x:number,y:number,w:number,h:number,label?:string,vert?:boolean)=>({...p,group:g,cell:ce,label:label??ce,x,y,w,h,vert});
  const ORIG_W=1200,ORIG_H=730;
  const wrapRef=useRef<HTMLDivElement>(null);
  const [scale,setScale]=useState(0.47);
  useEffect(()=>{
    const el=wrapRef.current;
    if(!el) return;
    const update=()=>setScale(Math.min(0.67,el.clientWidth/ORIG_W));
    update();
    const ro=new ResizeObserver(update);
    ro.observe(el);
    return()=>ro.disconnect();
  },[]);
  const rh=Math.round(ORIG_H*scale);
  return (
    <div ref={wrapRef} style={{borderRadius:8,border:'1px solid #ECEBE8',background:'#F7F6F3',overflow:'hidden',position:'relative',height:rh}}>
      <div style={{transform:`scale(${scale})`,transformOrigin:'top left',width:ORIG_W,height:ORIG_H,position:'absolute',top:0,left:0,pointerEvents:'none'}}>
        {/* 선반 */}
        <div style={{position:'absolute',left:60,top:40,width:70,height:330,border:'1.5px solid #1A1916',borderRadius:4}}/>
        <MiniCell {...c('선반','1',60,40,70,82,'1',true)}/>
        <MiniCell {...c('선반','2',60,122,70,82,'2',true)}/>
        <MiniCell {...c('선반','3',60,204,70,82,'3',true)}/>
        <MiniCell {...c('선반','4',60,286,70,84,'4',true)}/>
        {/* 실험대 위 */}
        <div style={{position:'absolute',left:325,top:40,width:620,height:110,border:'1.5px solid #1A1916',borderRadius:4}}/>
        <MiniCell {...c('실험대 위','1',325,40,124,110)}/>
        <MiniCell {...c('실험대 위','2',449,40,124,110)}/>
        <MiniCell {...c('실험대 위','3',573,40,124,110)}/>
        <MiniCell {...c('실험대 위','4',697,40,124,110)}/>
        <MiniCell {...c('실험대 위','5',821,40,124,110)}/>
        {/* 실험대 아래/서랍 */}
        <div style={{position:'absolute',left:170,top:195,width:775,height:150,border:'1.5px solid #1A1916',borderRadius:4}}/>
        <MiniCell {...c('실험대 아래','1',170,195,90,150)}/>
        <MiniCell {...c('실험대 아래','2',260,195,90,150)}/>
        <MiniCell {...c('실험대 서랍','서랍 1',358,195,70,50,'서1')}/>
        <MiniCell {...c('실험대 서랍','서랍 2',428,195,70,50,'서2')}/>
        <MiniCell {...c('실험대 서랍','서랍 3',358,245,70,50,'서3')}/>
        <MiniCell {...c('실험대 서랍','서랍 4',428,245,70,50,'서4')}/>
        <MiniCell {...c('실험대 서랍','서랍 5',358,295,70,50,'서5')}/>
        <MiniCell {...c('실험대 서랍','서랍 6',428,295,70,50,'서6')}/>
        <MiniCell {...c('실험대 아래','3',506,195,110,150)}/>
        <MiniCell {...c('실험대 아래','4',616,195,110,150)}/>
        <MiniCell {...c('실험대 아래','5',726,195,110,150)}/>
        <MiniCell {...c('실험대 아래','6',836,195,110,150)}/>
        {/* 조리대 좌측 */}
        <div style={{position:'absolute',left:325,top:465,width:260,height:150,border:'1.5px solid #1A1916',borderRadius:4}}/>
        <MiniCell {...c('조리대 좌측','서랍 1',325,465,87,40,'서1')}/>
        <MiniCell {...c('조리대 좌측','서랍 2',412,465,87,40,'서2')}/>
        <MiniCell {...c('조리대 좌측','서랍 3',499,465,87,40,'서3')}/>
        <MiniCell {...c('조리대 좌측','4',325,505,130,110)}/>
        <MiniCell {...c('조리대 좌측','5',455,505,130,110)}/>
        {/* 조리대 우측 */}
        <div style={{position:'absolute',left:625,top:465,width:260,height:150,border:'1.5px solid #1A1916',borderRadius:4}}/>
        <MiniCell {...c('조리대 우측','서랍 1',625,465,87,40,'서1')}/>
        <MiniCell {...c('조리대 우측','서랍 2',712,465,87,40,'서2')}/>
        <MiniCell {...c('조리대 우측','서랍 3',799,465,87,40,'서3')}/>
        <MiniCell {...c('조리대 우측','4',625,505,130,110)}/>
        <MiniCell {...c('조리대 우측','5',755,505,130,110)}/>
        {/* 싱크대 아래 */}
        <div style={{position:'absolute',left:170,top:580,width:145,height:48,border:'1.5px solid #1A1916',borderRadius:4}}/>
        <MiniCell {...c('싱크대 아래','2',170,580,72,48)}/>
        <MiniCell {...c('싱크대 아래','1',242,580,73,48)}/>
        {/* 싱크대 위 */}
        <div style={{position:'absolute',left:170,top:650,width:715,height:70,border:'1.5px solid #1A1916',borderRadius:4}}/>
        <MiniCell {...c('싱크대 위','6',170,650,119,70)}/>
        <MiniCell {...c('싱크대 위','5',289,650,119,70)}/>
        <MiniCell {...c('싱크대 위','4',408,650,119,70)}/>
        <MiniCell {...c('싱크대 위','3',527,650,119,70)}/>
        <MiniCell {...c('싱크대 위','2',646,650,119,70)}/>
        <MiniCell {...c('싱크대 위','1',765,650,120,70)}/>
        {/* 저울대 아래 */}
        <div style={{position:'absolute',left:970,top:365,width:100,height:350,border:'1.5px solid #1A1916',borderRadius:4}}/>
        <MiniCell {...c('저울대 아래','1',970,365,100,130,'1',true)}/>
        <MiniCell {...c('저울대 아래','2',970,495,100,130,'2',true)}/>
        <MiniCell {...c('저울대 아래','서랍 4',970,625,25,90,'서4',true)}/>
        <MiniCell {...c('저울대 아래','서랍 3',995,625,25,90,'서3',true)}/>
        <MiniCell {...c('저울대 아래','서랍 2',1020,625,25,90,'서2',true)}/>
        <MiniCell {...c('저울대 아래','서랍 1',1045,625,25,90,'서1',true)}/>
        {/* 저울대 위 */}
        <div style={{position:'absolute',left:1100,top:365,width:75,height:350,border:'1.5px solid #1A1916',borderRadius:4}}/>
        <MiniCell {...c('저울대 위','1',1100,365,75,117,'1',true)}/>
        <MiniCell {...c('저울대 위','2',1100,482,75,117,'2',true)}/>
        <MiniCell {...c('저울대 위','3',1100,599,75,116,'3',true)}/>
      </div>
    </div>
  );
}

function MiniMapSimple({space,itemGroup,itemCell,itemColor}:{space:string,itemGroup:string,itemCell:string,itemColor:string}) {
  const p={itemGroup,itemCell,itemColor};
  const g=ZONES[space]?.[0];
  if(!g) return null;
  // 서빙1/2: 조리대 — 서랍①②③(상단 가로) + ④(하단 전체)
  const ORIG_W=500,ORIG_H=280;
  const wrapRef=useRef<HTMLDivElement>(null);
  const [scale,setScale]=useState(0.47);
  useEffect(()=>{
    const el=wrapRef.current;
    if(!el) return;
    const update=()=>setScale(Math.min(0.9,el.clientWidth/ORIG_W));
    update();
    const ro=new ResizeObserver(update);
    ro.observe(el);
    return()=>ro.disconnect();
  },[]);
  const rh=Math.round(ORIG_H*scale);
  const drawerW=Math.floor(380/3); // 서랍 3개가 외곽(380px) 균등 분할
  const lastDrawerW=380-drawerW*2; // 나머지 오차 마지막 셀에 흡수
  return (
    <div ref={wrapRef} style={{borderRadius:8,border:'1px solid #ECEBE8',background:'#F7F6F3',overflow:'hidden',position:'relative',height:rh}}>
      <div style={{transform:`scale(${scale})`,transformOrigin:'top left',width:ORIG_W,height:ORIG_H,position:'absolute',top:0,left:0,pointerEvents:'none'}}>
        {/* 조리대 외곽 */}
        <div style={{position:'absolute',left:60,top:40,width:380,height:210,border:'1.5px solid #1A1916',borderRadius:4}}/>
        {/* 서랍 1/2/3 — 상단 가로 3분할 */}
        <MiniCell {...p} group={g.group} cell={g.cells[0]} label={g.cells[0]} x={60} y={40} w={drawerW} h={60}/>
        <MiniCell {...p} group={g.group} cell={g.cells[1]} label={g.cells[1]} x={60+drawerW} y={40} w={drawerW} h={60}/>
        <MiniCell {...p} group={g.group} cell={g.cells[2]} label={g.cells[2]} x={60+drawerW*2} y={40} w={lastDrawerW} h={60}/>
        {/* 4 — 하단 전체 너비 */}
        {g.cells[3]&&<MiniCell {...p} group={g.group} cell={g.cells[3]} label={g.cells[3]} x={60} y={100} w={380} h={150}/>}
      </div>
    </div>
  );
}

function MiniMapDisc({space,itemGroup,itemCell,itemColor}:{space:string,itemGroup:string,itemCell:string,itemColor:string}) {
  const p={itemGroup,itemCell,itemColor};
  const g=ZONES[space]?.[0];
  if(!g) return null;
  const ORIG_W=500,ORIG_H=280;
  const wrapRef=useRef<HTMLDivElement>(null);
  const [scale,setScale]=useState(0.47);
  useEffect(()=>{
    const el=wrapRef.current;
    if(!el) return;
    const update=()=>setScale(Math.min(0.9,el.clientWidth/ORIG_W));
    update();
    const ro=new ResizeObserver(update);
    ro.observe(el);
    return()=>ro.disconnect();
  },[]);
  const rh=Math.round(ORIG_H*scale);
  return (
    <div ref={wrapRef} style={{borderRadius:8,border:'1px solid #ECEBE8',background:'#F7F6F3',overflow:'hidden',position:'relative',height:rh}}>
      <div style={{transform:`scale(${scale})`,transformOrigin:'top left',width:ORIG_W,height:ORIG_H,position:'absolute',top:0,left:0,pointerEvents:'none'}}>
        <div style={{position:'absolute',left:100,top:40,width:300,height:g.cells.length*60,border:'1.5px solid #1A1916',borderRadius:4}}/>
        {g.cells.map((ce,i)=><MiniCell key={ce} {...p} group={g.group} cell={ce} label={ce} x={100} y={40+i*60} w={300} h={60}/>)}
      </div>
    </div>
  );
}

function MiniMapStore({itemGroup,itemCell,itemColor}:{itemGroup:string,itemCell:string,itemColor:string}) {
  const p={itemGroup,itemCell,itemColor};
  const ORIG_W=900,ORIG_H=520;
  const wrapRef=useRef<HTMLDivElement>(null);
  const [scale,setScale]=useState(0.47);
  useEffect(()=>{
    const el=wrapRef.current;
    if(!el) return;
    const update=()=>setScale(Math.min(0.67,el.clientWidth/ORIG_W));
    update();
    const ro=new ResizeObserver(update);
    ro.observe(el);
    return()=>ro.disconnect();
  },[]);
  const rh=Math.round(ORIG_H*scale);
  return (
    <div ref={wrapRef} style={{borderRadius:8,border:'1px solid #ECEBE8',background:'#F7F6F3',overflow:'hidden',position:'relative',height:rh}}>
      <div style={{transform:`scale(${scale})`,transformOrigin:'top left',width:ORIG_W,height:ORIG_H,position:'absolute',top:0,left:0,pointerEvents:'none'}}>
        {/* 수납장 */}
        <div style={{position:'absolute',left:50,top:80,width:240,height:400,border:'1.5px solid #1A1916',borderRadius:4}}/>
        {['1','2','3','4','5','6','7','8'].map((ce,i)=><MiniCell key={ce} {...p} group="수납장" cell={ce} label={ce} x={50+(i%2)*120} y={80+Math.floor(i/2)*100} w={120} h={100}/>)}
        {/* 박스 */}
        <div style={{position:'absolute',left:360,top:80,width:180,height:400,border:'1.5px solid #1A1916',borderRadius:4}}/>
        {['1','2','3'].map((ce,i)=><MiniCell key={ce} {...p} group="박스" cell={ce} label={ce} x={360} y={80+i*133} w={180} h={133}/>)}
        {/* 선반 */}
        <div style={{position:'absolute',left:610,top:80,width:120,height:400,border:'1.5px solid #1A1916',borderRadius:4}}/>
        {['1','2','3','4','5','6','7','8'].map((ce,i)=><MiniCell key={ce} {...p} group="선반" cell={ce} label={ce} x={610} y={80+i*50} w={120} h={50}/>)}
      </div>
    </div>
  );
}

function ItemMiniMap({item,u}:{item:any,u:any}) {
  const props={itemGroup:item.group,itemCell:item.cell,itemColor:u.color};
  if(item.space==='준비') return <MiniMapPrep {...props}/>;
  if(item.space==='서빙1'||item.space==='서빙2') return <MiniMapSimple space={item.space} {...props}/>;
  if(item.space==='토론1'||item.space==='토론2') return <MiniMapDisc space={item.space} {...props}/>;
  if(item.space==='창고') return <MiniMapStore {...props}/>;
  return null;
}

function ItemDetail({item,onBack,onEdit,onDelete}) {
  const u=useById(item.useId);
  const isLow=item.min!=null&&item.qty<item.min;
  const [delM,setDelM]=useState(false);
  const isMobile=useMediaQuery('(max-width:768px)');
  return (
    <div className="col" style={{height:'100%'}}>
      <Topbar title="품목 상세" sub={`${item.name} · #${item.id} · ${item.space} / ${item.group} / ${item.cell}`} action={
        <div className="row" style={{gap:isMobile?6:12}}>
          <button className="btn btn-danger btn-sm" onClick={()=>setDelM(true)} style={{gap:isMobile?0:6,paddingLeft:isMobile?8:12,paddingRight:isMobile?8:12}}>
            <IC.trash/>{!isMobile&&<span>삭제</span>}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onBack} style={{gap:isMobile?0:6,paddingLeft:isMobile?8:12,paddingRight:isMobile?8:12}}>
            <IC.back/>{!isMobile&&<span>이전</span>}
          </button>
          <button className="btn btn-primary btn-sm" onClick={onEdit} style={{gap:isMobile?0:6,paddingLeft:isMobile?8:12,paddingRight:isMobile?8:12}}>
            <IC.edit/>{!isMobile&&<span>수정</span>}
          </button>
        </div>}/>
      <div className="mobile-content mobile-pad" style={{flex:1,overflow:'auto',padding:32,paddingBottom:100}}>
        <div style={{maxWidth:860,margin:'0 auto',display:'flex',flexDirection:'column',gap:16}}>
          <div className="card mobile-grid-1" style={{padding:24,display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:24}}>
            <div>
              <span className="badge" style={{background:u.color,color:'#fff'}}>{u.name}</span>
              <h2 className="mobile-h2" style={{margin:'12px 0 6px',fontSize:28,fontWeight:600,color:'var(--ink-deep)'}}>{item.name}</h2>
              <div style={{fontSize:'var(--fs-body)',color:'var(--charcoal)'}}><span style={{color:'var(--slate)'}}>위치</span> <b>{item.space} / {item.group} / {item.cell}</b></div>
              {item.note&&<div style={{marginTop:12,padding:'10px 14px',background:'var(--tint-yellow)',borderRadius:'var(--r-md)',fontSize:'var(--fs-body)'}}>📌 {item.note}</div>}
            </div>
            <div style={{background:isLow?'var(--tint-rose)':'var(--tint-mint)',borderRadius:'var(--r-lg)',padding:'18px 20px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div style={{fontSize:'var(--fs-sm)',fontWeight:600,color:isLow?'var(--brand-pink-deep)':'var(--brand-green)'}}>{isLow?'재고 부족':'재고 양호'}</div>
              <div style={{fontSize:36,fontWeight:600,color:'var(--ink-deep)',marginTop:4,display:'flex',alignItems:'baseline',gap:4}}>{item.qty}{item.min!=null&&<span style={{fontSize:18,color:'var(--slate)',fontWeight:500}}> / {item.min}</span>}</div>
              <div style={{fontSize:'var(--fs-sm)',color:'var(--slate)',marginTop:4}}>{item.min!=null?'현재 / 최소':'현재 수량'}</div>
            </div>
          </div>
          <div className="card" style={{padding:24}}>
            <div style={{fontSize:'var(--fs-section)',fontWeight:600,marginBottom:16}}>상세 정보</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginBottom:20}}>
              <div>
                <div style={{fontSize:'var(--fs-label)',color:'var(--steel)',textTransform:'uppercase',letterSpacing:.4}}>용도</div>
                <div className="row" style={{gap:6,marginTop:4}}><span className="swatch" style={{background:u.color}}/><span style={{fontSize:'var(--fs-body)',fontWeight:500}}>{u.name}</span></div>
              </div>
              {[['규격',item.spec||'–'],['입고 시기',item.received||'–'],['공간',item.space],['구역',item.group],['셀',item.cell]].map(([l,v])=>(
                <div key={l}><div style={{fontSize:'var(--fs-label)',color:'var(--steel)',textTransform:'uppercase',letterSpacing:.4}}>{l}</div><div style={{fontSize:'var(--fs-body)',fontWeight:500,marginTop:4}}>{v}</div></div>
              ))}
            </div>
            <div style={{borderTop:'1px solid var(--hairline)',marginBottom:14}}/>
            <ItemMiniMap item={item} u={u}/>
          </div>
          <div className="card" style={{padding:16,background:'var(--surface)',marginBottom:0}}>
            <div className="row wrap" style={{gap:'12px 32px'}}>
              {[['최초 등록일',item.createdAt],['최종 수정일',item.updatedAt],['최종 수정인',item.updatedBy],['품목 ID',`#${item.id}`]].map(([l,v])=>(
                <div key={l} className="col"><span style={{fontSize:'var(--fs-label)',color:'var(--steel)',textTransform:'uppercase',letterSpacing:.4}}>{l}</span><span style={{fontSize:'var(--fs-body)',fontWeight:500,marginTop:2}}>{v}</span></div>
              ))}
            </div>
          </div>
          <div style={{height:24}}/>
        </div>
      </div>
      <Modal open={delM} onClose={()=>setDelM(false)}>
        <div style={{padding:28}}>
          <div className="row" style={{gap:12,marginBottom:16}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:'var(--tint-rose)',color:'var(--brand-pink-deep)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><IC.alert/></div>
            <div><div style={{fontSize:'var(--fs-section)',fontWeight:600}}>이 품목을 삭제할까요?</div><div style={{fontSize:'var(--fs-body)',color:'var(--slate)',marginTop:2}}>{item.name}</div></div>
          </div>
          <div className="row between">
            <button className="btn btn-danger" onClick={()=>{onDelete(item.id);setDelM(false);}}><IC.trash/> 삭제</button>
            <button className="btn btn-secondary" onClick={()=>setDelM(false)}>취소</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function App() {
  const [authed,setAuthed]=useState(false);
  const [user,setUser]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [accessDenied,setAccessDenied]=useState(false);
  const [route,setRoute]=useState({name:'search'});
  const [items,setItems]=useState(SEED);
  const [activity,setActivity]=useState(SEED_ACT);

  useEffect(()=>{
    // 세션 확인 및 화이트리스트 체크
    const checkSession = async (session) => {
      if (!session) { setAuthed(false); setUser(null); setAuthLoading(false); return; }
      const email = session.user.email;
      const { data } = await supabase.from('allowed_emails').select('email').eq('email', email).single();
      if (data) {
        const name = session.user.user_metadata?.full_name || email.split('@')[0];
        setUser({ name, email });
        setAuthed(true);
        setAccessDenied(false);
      } else {
        await supabase.auth.signOut();
        setAccessDenied(true);
        setAuthed(false);
        setUser(null);
      }
      setAuthLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => checkSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => checkSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const nav=(name,params={})=>setRoute({name,...params});
  const openItem=(it,fromSpace=null)=>{if(it&&it.id!=null)setRoute({name:'detail',itemId:it.id,fromSpace});};
  const logout=async()=>{ await supabase.auth.signOut(); setAuthed(false); setUser(null); };

  const upsert=data=>{
    setItems(prev=>{
      const idx=prev.findIndex(p=>p.id===data.id);
      if(idx>=0){const n=[...prev];n[idx]={...data,updatedAt:'오늘',updatedBy:user.name};return n;}
      const newId=Math.max(...prev.map(p=>p.id),0)+1;
      return [{...data,id:newId,createdAt:'오늘',updatedAt:'오늘',updatedBy:user.name},...prev];
    });
    setActivity(a=>[{id:Date.now(),action:data.id?'update':'create',name:data.name,user:user.name,time:'방금'},...a].slice(0,8));
    const savedId=data.id??Math.max(...items.map(p=>p.id),0)+1;
    setRoute({name:'detail',itemId:savedId,fromSpace:route.fromSpace});
  };

  const remove=id=>{
    const it=items.find(i=>i.id===id);
    setItems(p=>p.filter(i=>i.id!==id));
    if(it) setActivity(a=>[{id:Date.now(),action:'delete',name:it.name,user:user.name,time:'방금'},...a].slice(0,8));
    nav('search');
  };

  const removeMany=ids=>{setItems(p=>p.filter(i=>!ids.includes(i.id)));};

  if(authLoading) {
    return (
      <>
        <style>{SIDEBAR_CSS}{STYLE_SHEET}</style>
        <div className="app" style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',height:'100dvh',background:'var(--brand-navy)'}}>
          <div style={{color:'#fff',fontSize:'var(--fs-section)',opacity:0.7}}>로딩 중...</div>
        </div>
      </>
    );
  }

  if(accessDenied) {
    return (
      <>
        <style>{SIDEBAR_CSS}{STYLE_SHEET}</style>
        <div className="app" style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',height:'100dvh',background:'var(--brand-navy)'}}>
          <div className="card" style={{padding:36,maxWidth:400,textAlign:'center',color:'var(--ink)'}}>
            <div style={{fontSize:32,marginBottom:16}}>🚫</div>
            <div style={{fontSize:18,fontWeight:600,marginBottom:8}}>접근 권한 없음</div>
            <p style={{fontSize:'var(--fs-body)',color:'var(--slate)',marginBottom:24}}>이 이메일은 접근이 허용되지 않습니다.<br/>관리자에게 권한을 요청하세요.</p>
            <button className="btn btn-secondary" onClick={()=>setAccessDenied(false)}>다른 계정으로 로그인</button>
          </div>
        </div>
      </>
    );
  }

  if(!authed) {
    return (
      <>
        <style>{SIDEBAR_CSS}{STYLE_SHEET}</style>
        <div className="app"><Login/></div>
      </>
    );
  }

  const getItem=id=>items.find(i=>i.id===id)||null;

  let view=null;
  if(route.name==='dashboard') {
    view=<Dashboard items={items} activity={activity} onNav={nav} onItemClick={openItem}/>;
  } else if(route.name==='search') {
    view=<Search items={items} onItemClick={openItem} onDelete={removeMany}/>;
  } else if(route.name==='space') {
    view=<SpaceView items={items} initialSpace={route.space} onNav={nav} onItemClick={(it)=>openItem(it,route.space||'준비')}/>;
  } else if(route.name==='register') {
    view=<RegisterEdit mode="create" prefill={route.group?{space:route.space,group:route.group,cell:route.cell}:null} onCancel={()=>route.space?nav('space',{space:route.space}):nav('search')} onSave={upsert}/>;
  } else if(route.name==='edit') {
    const it=getItem(route.itemId);
    view=it
      ?<RegisterEdit mode="edit" item={it} onCancel={()=>setRoute({name:'detail',itemId:it.id})} onSave={upsert} onDelete={remove}/>
      :<Search items={items} onItemClick={openItem} onDelete={removeMany}/>;
  } else if(route.name==='detail') {
    const it=getItem(route.itemId);
    view=it
      ?<ItemDetail item={it} onBack={()=>route.fromSpace?nav('space',{space:route.fromSpace}):nav('search')} onEdit={()=>setRoute({name:'edit',itemId:it.id,fromSpace:route.fromSpace})} onDelete={remove}/>
      :<Search items={items} onItemClick={openItem} onDelete={removeMany}/>;
  } else if(route.name==='profile') {
    view=<Profile user={user} onLogout={logout}/>;
  }

  const navItems=[
    {id:'search',label:'품목 찾기',I:IC.list},
    {id:'space',label:'공간 조회',I:IC.map},
    {id:'register',label:'신규 등록',I:IC.plus},
    {id:'dashboard',label:'대시보드',I:IC.dash},
    {id:'profile',label:'내 계정',I:IC.user},
  ];
  const curTab=route.name==='detail'?'search':route.name==='edit'?'search':route.name;

  return (
    <>
      <style>{SIDEBAR_CSS}{STYLE_SHEET}</style>
      <div className="app" style={{display:'flex'}}>
        <Sidebar cur={route.name} onNav={nav} user={user} onLogout={logout}/>
        <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0,minHeight:0,overflow:'hidden'}}>
          {view}
        </div>
      </div>
      <nav className="bottom-nav">
        {navItems.map(({id,label,I})=>{
          const a=curTab===id;
          return (
            <button key={id} className={`bottom-nav-item${a?' active':''}`} onClick={()=>nav(id)}>
              <span className="bnav-icon"><I/></span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
