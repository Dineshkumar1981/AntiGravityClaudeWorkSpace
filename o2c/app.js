/* ============================================================
   O2C Platform — UK Telecom
   Single-file SPA: 10 modules, localStorage persistence
   ============================================================ */

'use strict';

// ── Utilities ────────────────────────────────────────────────
const U = {
  id:  () => Math.random().toString(36).slice(2,9).toUpperCase(),
  ts:  () => new Date().toISOString(),
  now: () => new Date(),
  fmt: {
    gbp:  v => '£' + Number(v||0).toFixed(2),
    date: v => v ? new Date(v).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—',
    dt:   v => v ? new Date(v).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—',
    pct:  v => Number(v||0).toFixed(1) + '%',
  },
  esc: s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),
  daysAgo: n => { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); },
  daysFromNow: n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); },
  rand: (a,b) => Math.floor(Math.random()*(b-a+1))+a,
  slug: s => String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''),
};

// ── Store ─────────────────────────────────────────────────────
const Store = {
  _k: e => 'o2c.'+e,
  getAll:   e => JSON.parse(localStorage.getItem(Store._k(e))||'[]'),
  saveAll:  (e,arr) => localStorage.setItem(Store._k(e), JSON.stringify(arr)),
  getById:  (e,id,key) => Store.getAll(e).find(r=>(r[key||e.slice(0,-1)+'Id']||r.id)===id)||null,
  save: (e,obj,idField) => {
    const arr=Store.getAll(e);
    const f=idField||(e.replace(/s$/,'')+'Id');
    const idx=arr.findIndex(r=>r[f]===obj[f]);
    idx>=0?arr.splice(idx,1,obj):arr.push(obj);
    Store.saveAll(e,arr);
    return obj;
  },
  del: (e,id,idField) => {
    const f=idField||(e.replace(/s$/,'')+'Id');
    Store.saveAll(e, Store.getAll(e).filter(r=>r[f]!==id));
  },
  query: (e,fn) => Store.getAll(e).filter(fn),
  count: (e,fn) => fn?Store.getAll(e).filter(fn).length:Store.getAll(e).length,
  nextSeq: e => { const k='o2c.seq.'+e; const n=parseInt(localStorage.getItem(k)||'0')+1; localStorage.setItem(k,n); return String(n).padStart(4,'0'); },
  flag: k => localStorage.getItem('o2c.flag.'+k)==='1',
  setFlag: (k,v) => localStorage.setItem('o2c.flag.'+k,v?'1':'0'),
};

// ── Toast ─────────────────────────────────────────────────────
function toast(type,title,msg,ms=4000){
  const icons={success:'✅',warning:'⚠️',error:'❌',info:'ℹ️'};
  const el=document.createElement('div');
  el.className='toast '+type;
  el.innerHTML=`<span class="toast-icon">${icons[type]||'ℹ️'}</span><div class="toast-body"><div class="toast-title">${U.esc(title)}</div><div>${U.esc(msg||'')}</div></div>`;
  document.getElementById('toast-host').prepend(el);
  setTimeout(()=>el.remove(),ms);
}

// ── Modal ─────────────────────────────────────────────────────
const Modal = {
  open(title,bodyHtml,footerHtml,wide){
    document.getElementById('modal-title').textContent=title;
    document.getElementById('modal-body').innerHTML=bodyHtml;
    document.getElementById('modal-ftr').innerHTML=footerHtml||'';
    const m=document.getElementById('modal');
    wide?m.classList.add('wide'):m.classList.remove('wide');
    document.getElementById('modal-overlay').classList.add('open');
  },
  close(){document.getElementById('modal-overlay').classList.remove('open')},
};
document.getElementById('modal-close').addEventListener('click',()=>Modal.close());
document.getElementById('modal-overlay').addEventListener('click',e=>{if(e.target===e.currentTarget)Modal.close();});

// ── Router ────────────────────────────────────────────────────
const Router = {
  _current: null,
  routes: {},
  reg(name,fn){this.routes[name]=fn},
  go(name){
    this._current=name;
    document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.module===name));
    const title=document.querySelector(`.nav-item[data-module="${name}"] .nav-label`)?.textContent||name;
    document.getElementById('page-title').textContent=title;
    const fn=this.routes[name];
    if(fn) fn();
    else document.getElementById('main-content').innerHTML=`<div class="empty-state"><div class="empty-state-icon">🚧</div><div class="empty-state-text">Module not found: ${name}</div></div>`;
    updateBadges();
  }
};
document.querySelectorAll('.nav-item').forEach(el=>{
  el.addEventListener('click',()=>Router.go(el.dataset.module));
});
document.getElementById('sidebar-toggle').addEventListener('click',()=>{
  document.getElementById('sidebar').classList.toggle('collapsed');
});

// ── Seed Data ─────────────────────────────────────────────────
function seedData(){
  if(Store.flag('seeded'))return;

  // Customers
  const custs=[
    {customerId:'CUST-0001',name:'James Thornton',email:'j.thornton@email.co.uk',phone:'+447700900001',address:'42 Oak Street, Manchester, M1 1AB',type:'consumer',creditScore:780,creditLimit:2000,riskBand:'LOW',gdprConsent:true,vulnerableFlag:false},
    {customerId:'CUST-0002',name:'Sarah Patel',email:'s.patel@email.co.uk',phone:'+447700900002',address:'17 Elm Ave, London, EC1A 1BB',type:'consumer',creditScore:620,creditLimit:800,riskBand:'MEDIUM',gdprConsent:true,vulnerableFlag:false},
    {customerId:'CUST-0003',name:'David Williams',email:'d.williams@email.co.uk',phone:'+447700900003',address:'89 Pine Rd, Birmingham, B1 1CC',type:'sme',creditScore:710,creditLimit:5000,riskBand:'LOW',gdprConsent:true,vulnerableFlag:false},
    {customerId:'CUST-0004',name:'Emma Johnson',email:'e.johnson@email.co.uk',phone:'+447700900004',address:'23 Maple Lane, Leeds, LS1 1DD',type:'consumer',creditScore:420,creditLimit:300,riskBand:'HIGH',gdprConsent:true,vulnerableFlag:true},
    {customerId:'CUST-0005',name:'Michael Brown',email:'m.brown@email.co.uk',phone:'+447700900005',address:'55 Cedar Close, Bristol, BS1 1EE',type:'enterprise',creditScore:850,creditLimit:20000,riskBand:'LOW',gdprConsent:true,vulnerableFlag:false},
  ];
  Store.saveAll('customers',custs);

  // Products
  const prods=[
    {productId:'PROD-M01',name:'SIM Only Essential',category:'mobile',recurringNet:10.00,recurringVAT:2.00,recurringGross:12.00,contract:12,description:'Unlimited calls + texts, 5GB data'},
    {productId:'PROD-M02',name:'SIM Only Plus (5G)',category:'mobile',recurringNet:25.00,recurringVAT:5.00,recurringGross:30.00,contract:24,description:'Unlimited everything, 5G ready'},
    {productId:'PROD-M03',name:'Handset Bundle – iPhone 15',category:'mobile',recurringNet:45.00,recurringVAT:9.00,recurringGross:54.00,contract:24,description:'Unlimited plan + iPhone 15 128GB'},
    {productId:'PROD-B01',name:'Broadband 150Mb',category:'broadband',recurringNet:28.00,recurringVAT:5.60,recurringGross:33.60,contract:18,description:'Fibre broadband, avg 150Mbps'},
    {productId:'PROD-B02',name:'Broadband 500Mb',category:'broadband',recurringNet:38.00,recurringVAT:7.60,recurringGross:45.60,contract:24,description:'Full-fibre, avg 500Mbps'},
    {productId:'PROD-B03',name:'Superfast 1Gb',category:'broadband',recurringNet:55.00,recurringVAT:11.00,recurringGross:66.00,contract:24,description:'1Gbps symmetric, static IP'},
    {productId:'PROD-T01',name:'TV Basic',category:'tv',recurringNet:12.50,recurringVAT:2.50,recurringGross:15.00,contract:12,description:'50+ channels, catch-up TV'},
    {productId:'PROD-C01',name:'Converged Bundle',category:'bundle',recurringNet:65.00,recurringVAT:13.00,recurringGross:78.00,contract:24,description:'Mobile + 500Mb Broadband + TV Basic'},
  ];
  Store.saveAll('products',prods);

  // Orders
  const now=new Date();
  const orders=[
    {orderId:'ORD-0001',customerId:'CUST-0001',customerName:'James Thornton',channel:'web',type:'new',status:'active',productId:'PROD-M02',productName:'SIM Only Plus (5G)',recurringGross:30.00,fraudScore:8,creditDecision:'APPROVED',createdAt:U.daysAgo(30),activatedAt:U.daysAgo(28)},
    {orderId:'ORD-0002',customerId:'CUST-0002',customerName:'Sarah Patel',channel:'retail',type:'new',status:'active',productId:'PROD-B02',productName:'Broadband 500Mb',recurringGross:45.60,fraudScore:15,creditDecision:'APPROVED',createdAt:U.daysAgo(25),activatedAt:U.daysAgo(23)},
    {orderId:'ORD-0003',customerId:'CUST-0003',customerName:'David Williams',channel:'contact-centre',type:'new',status:'provisioning',productId:'PROD-C01',productName:'Converged Bundle',recurringGross:78.00,fraudScore:5,creditDecision:'APPROVED',createdAt:U.daysAgo(3),activatedAt:null},
    {orderId:'ORD-0004',customerId:'CUST-0004',customerName:'Emma Johnson',channel:'web',type:'new',status:'credit-check',productId:'PROD-M01',productName:'SIM Only Essential',recurringGross:12.00,fraudScore:62,creditDecision:'REFERRED',createdAt:U.daysAgo(1),activatedAt:null},
    {orderId:'ORD-0005',customerId:'CUST-0005',customerName:'Michael Brown',channel:'app',type:'new',status:'active',productId:'PROD-B03',productName:'Superfast 1Gb',recurringGross:66.00,fraudScore:3,creditDecision:'APPROVED',createdAt:U.daysAgo(45),activatedAt:U.daysAgo(43)},
    {orderId:'ORD-0006',customerId:'CUST-0001',customerName:'James Thornton',channel:'web',type:'addon',status:'validated',productId:'PROD-T01',productName:'TV Basic',recurringGross:15.00,fraudScore:5,creditDecision:'APPROVED',createdAt:U.daysAgo(0),activatedAt:null},
    {orderId:'ORD-0007',customerId:'CUST-0002',customerName:'Sarah Patel',channel:'app',type:'upgrade',status:'active',productId:'PROD-M03',productName:'Handset Bundle – iPhone 15',recurringGross:54.00,fraudScore:18,creditDecision:'APPROVED',createdAt:U.daysAgo(60),activatedAt:U.daysAgo(58)},
  ];
  Store.saveAll('orders',orders);

  // Tasks (orchestration)
  const tasks=[
    {taskId:'TASK-0001',orderId:'ORD-0003',type:'sim-allocation',status:'completed',label:'SIM Allocation',assignedTo:'rpa-bot-01',completedAt:U.daysAgo(2),failureReason:null},
    {taskId:'TASK-0002',orderId:'ORD-0003',type:'broadband-provision',status:'in-progress',label:'Broadband Provision',assignedTo:'rpa-bot-02',completedAt:null,failureReason:null},
    {taskId:'TASK-0003',orderId:'ORD-0003',type:'router-dispatch',status:'pending',label:'Router Dispatch',assignedTo:null,completedAt:null,failureReason:null,dependsOn:'TASK-0002'},
    {taskId:'TASK-0004',orderId:'ORD-0003',type:'activation',status:'pending',label:'Service Activation',assignedTo:null,completedAt:null,failureReason:null,dependsOn:'TASK-0003'},
    {taskId:'TASK-0005',orderId:'ORD-0006',type:'sim-allocation',status:'pending',label:'SIM Allocation',assignedTo:'rpa-bot-01',completedAt:null,failureReason:null},
    {taskId:'TASK-0006',orderId:'ORD-0006',type:'activation',status:'pending',label:'Service Activation',assignedTo:null,completedAt:null,failureReason:null,dependsOn:'TASK-0005'},
  ];
  Store.saveAll('tasks',tasks);

  // Invoices
  const invoices=[
    {invoiceId:'INV-0001',invoiceNumber:'UK-2026-0001',customerId:'CUST-0001',customerName:'James Thornton',periodStart:U.daysAgo(60),periodEnd:U.daysAgo(31),dueDate:U.daysAgo(25),status:'paid',netGBP:25.00,vatGBP:5.00,grossGBP:30.00,paidGBP:30.00,balanceGBP:0,type:'recurring',billShock:false,issuedAt:U.daysAgo(35)},
    {invoiceId:'INV-0002',invoiceNumber:'UK-2026-0002',customerId:'CUST-0001',customerName:'James Thornton',periodStart:U.daysAgo(30),periodEnd:U.daysAgo(1),dueDate:U.daysFromNow(5),status:'issued',netGBP:25.00,vatGBP:5.00,grossGBP:30.00,paidGBP:0,balanceGBP:30.00,type:'recurring',billShock:false,issuedAt:U.daysAgo(5)},
    {invoiceId:'INV-0003',invoiceNumber:'UK-2026-0003',customerId:'CUST-0002',customerName:'Sarah Patel',periodStart:U.daysAgo(60),periodEnd:U.daysAgo(31),dueDate:U.daysAgo(20),status:'overdue',netGBP:38.00,vatGBP:7.60,grossGBP:45.60,paidGBP:0,balanceGBP:45.60,type:'recurring',billShock:false,issuedAt:U.daysAgo(35)},
    {invoiceId:'INV-0004',invoiceNumber:'UK-2026-0004',customerId:'CUST-0004',customerName:'Emma Johnson',periodStart:U.daysAgo(90),periodEnd:U.daysAgo(61),dueDate:U.daysAgo(50),status:'overdue',netGBP:10.00,vatGBP:2.00,grossGBP:12.00,paidGBP:0,balanceGBP:12.00,type:'recurring',billShock:false,issuedAt:U.daysAgo(65)},
    {invoiceId:'INV-0005',invoiceNumber:'UK-2026-0005',customerId:'CUST-0005',customerName:'Michael Brown',periodStart:U.daysAgo(30),periodEnd:U.daysAgo(1),dueDate:U.daysFromNow(10),status:'paid',netGBP:55.00,vatGBP:11.00,grossGBP:66.00,paidGBP:66.00,balanceGBP:0,type:'recurring',billShock:false,issuedAt:U.daysAgo(5)},
    {invoiceId:'INV-0006',invoiceNumber:'UK-2026-0006',customerId:'CUST-0002',customerName:'Sarah Patel',periodStart:U.daysAgo(30),periodEnd:U.daysAgo(1),dueDate:U.daysFromNow(5),status:'disputed',netGBP:90.00,vatGBP:18.00,grossGBP:108.00,paidGBP:0,balanceGBP:108.00,type:'usage',billShock:true,issuedAt:U.daysAgo(5)},
  ];
  Store.saveAll('invoices',invoices);

  // Payments
  const payments=[
    {paymentId:'PAY-0001',invoiceId:'INV-0001',customerId:'CUST-0001',customerName:'James Thornton',amountGBP:30.00,method:'direct-debit',status:'collected',bankRef:'DD-2026-001',date:U.daysAgo(24),reconciledAt:U.daysAgo(24)},
    {paymentId:'PAY-0002',invoiceId:'INV-0005',customerId:'CUST-0005',customerName:'Michael Brown',amountGBP:66.00,method:'bacs',status:'collected',bankRef:'BACS-2026-002',date:U.daysAgo(2),reconciledAt:U.daysAgo(2)},
    {paymentId:'PAY-0003',invoiceId:'INV-0003',customerId:'CUST-0002',customerName:'Sarah Patel',amountGBP:45.60,method:'direct-debit',status:'failed',bankRef:'DD-2026-003',date:U.daysAgo(19),reconciledAt:null,failureReason:'Insufficient funds'},
  ];
  Store.saveAll('payments',payments);

  // Disputes
  const disputes=[
    {disputeId:'DIS-0001',invoiceId:'INV-0006',customerId:'CUST-0002',customerName:'Sarah Patel',category:'billing-error',description:'Charged for roaming data in UK. Never travelled abroad this month.',amountDisputed:108.00,status:'open',priority:'high',raisedAt:U.daysAgo(3),slaBreachAt:U.daysFromNow(2),resolution:{decision:null,creditAmountGBP:null,notes:null},rootCause:null},
    {disputeId:'DIS-0002',invoiceId:'INV-0004',customerId:'CUST-0004',customerName:'Emma Johnson',category:'duplicate-charge',description:'Billed twice for same billing period.',amountDisputed:12.00,status:'under-review',priority:'medium',raisedAt:U.daysAgo(7),slaBreachAt:U.daysAgo(2),resolution:{decision:null,creditAmountGBP:null,notes:null},rootCause:'System error — duplicate billing run detected'},
  ];
  Store.saveAll('disputes',disputes);

  // Collections (dunning)
  const collections=[
    {collectionId:'COL-0001',invoiceId:'INV-0003',customerId:'CUST-0002',customerName:'Sarah Patel',amountGBP:45.60,daysOverdue:20,dunningStage:2,channel:'email',aiSegment:'payment-plan',promiseToPay:null,vulnerableFlag:false,nextAction:U.daysFromNow(3),status:'active'},
    {collectionId:'COL-0002',invoiceId:'INV-0004',customerId:'CUST-0004',customerName:'Emma Johnson',amountGBP:12.00,daysOverdue:50,dunningStage:3,channel:'letter',aiSegment:'vulnerable',promiseToPay:{amount:12.00,date:U.daysFromNow(7),kept:null},vulnerableFlag:true,nextAction:U.daysFromNow(7),status:'active'},
  ];
  Store.saveAll('collections',collections);

  // Revenue recognition
  const revenue=[
    {rrId:'RR-0001',orderId:'ORD-0001',customerId:'CUST-0001',customerName:'James Thornton',product:'SIM Only Plus (5G)',contractMonths:24,contractValue:720.00,recognizedGBP:60.00,deferredGBP:660.00,period:'2026-03',status:'in-progress'},
    {rrId:'RR-0002',orderId:'ORD-0002',customerId:'CUST-0002',customerName:'Sarah Patel',product:'Broadband 500Mb',contractMonths:24,contractValue:1094.40,recognizedGBP:91.20,deferredGBP:1003.20,period:'2026-03',status:'in-progress'},
    {rrId:'RR-0003',orderId:'ORD-0005',customerId:'CUST-0005',customerName:'Michael Brown',product:'Superfast 1Gb',contractMonths:24,contractValue:1584.00,recognizedGBP:264.00,deferredGBP:1320.00,period:'2026-03',status:'in-progress'},
    {rrId:'RR-0004',orderId:'ORD-0007',customerId:'CUST-0002',customerName:'Sarah Patel',product:'Handset Bundle – iPhone 15',contractMonths:24,contractValue:1296.00,recognizedGBP:378.00,deferredGBP:918.00,period:'2026-03',status:'in-progress'},
  ];
  Store.saveAll('revenue',revenue);

  // CDRs (usage)
  const cdrs=[];
  const types=['voice','sms','data','data','data'];
  const dests=['national','national','national','national','international'];
  for(let i=0;i<40;i++){
    const t=types[i%types.length];
    const dur=t==='voice'?U.rand(30,600):0;
    const kb=t==='data'?U.rand(500,50000):0;
    const net=t==='voice'?+(dur/60*0.02).toFixed(4):t==='data'?+(kb/1024*0.01).toFixed(4):0;
    cdrs.push({
      cdrId:'CDR-'+String(i+1).padStart(4,'0'),
      customerId:'CUST-0001',msisdn:'+447700900001',
      serviceType:t,duration:dur,dataVolumeKB:kb,
      destination:dests[i%dests.length],
      ratedNetGBP:net,ratedVATGBP:+(net*0.2).toFixed(4),
      anomalyFlag:i===12||i===28,anomalyReason:i===12?'Unusual international volume':i===28?'Peak hour spike':null,
      billingPeriod:'2026-03',
      recordedAt:U.daysAgo(U.rand(0,28)),
    });
  }
  Store.saveAll('cdrs',cdrs);

  Store.setFlag('seeded',true);
}

// ── Badge Updates ─────────────────────────────────────────────
function updateBadges(){
  const setB=(id,n)=>{const el=document.getElementById(id);if(el){el.textContent=n>0?String(n):'';el.style.display=n>0?'':'none';}};
  setB('nb-orders', Store.count('orders',o=>['draft','validated','submitted'].includes(o.status)));
  setB('nb-credit',  Store.count('orders',o=>o.status==='credit-check'));
  setB('nb-orch',    Store.count('tasks', t=>t.status==='in-progress'));
  setB('nb-prov',    Store.count('tasks', t=>t.status==='failed'));
  setB('nb-billing', Store.count('invoices',i=>i.status==='overdue'));
  setB('nb-coll',    Store.count('collections',c=>c.status==='active'));
  setB('nb-disp',    Store.count('disputes',d=>['open','under-review'].includes(d.status)));
  // BPM badge — count live process instances (loaded from workflows.js)
  try {
    const wfCount = JSON.parse(localStorage.getItem('o2c.wf.instances')||'[]').length;
    setB('nb-wf', wfCount);
  } catch(e) {}
  // Topbar
  const active=Store.count('orders',o=>o.status==='active');
  const total=Store.count('orders');
  const stp=total?((active/total)*100).toFixed(0)+'%':'—';
  document.getElementById('tp-stp').textContent=stp;
  document.getElementById('tp-dso').textContent='28d';
  document.getElementById('tp-orders').textContent=total;
}

// ── Status Badge HTML ─────────────────────────────────────────
function statusBadge(status){
  const map={
    active:    ['badge-success','Active'],
    paid:      ['badge-success','Paid'],
    completed: ['badge-success','Completed'],
    approved:  ['badge-success','Approved'],
    collected: ['badge-success','Collected'],
    provisioning:['badge-info','Provisioning'],
    'in-progress':['badge-info','In Progress'],
    validated: ['badge-info','Validated'],
    issued:    ['badge-primary','Issued'],
    'credit-check':['badge-warning','Credit Check'],
    referred:  ['badge-warning','Referred'],
    pending:   ['badge-warning','Pending'],
    overdue:   ['badge-danger','Overdue'],
    failed:    ['badge-danger','Failed'],
    disputed:  ['badge-purple','Disputed'],
    'under-review':['badge-warning','Under Review'],
    open:      ['badge-danger','Open'],
    draft:     ['badge-muted','Draft'],
    cancelled: ['badge-muted','Cancelled'],
    rejected:  ['badge-danger','Rejected'],
    upheld:    ['badge-success','Upheld'],
    rejected:  ['badge-danger','Rejected'],
    'partially-upheld':['badge-warning','Part Upheld'],
  };
  const [cls,label]=map[status]||['badge-muted',status||'—'];
  return `<span class="badge ${cls}">${label}</span>`;
}

function channelBadge(ch){
  const m={web:'🌐 Web',app:'📱 App',retail:'🏪 Retail','contact-centre':'📞 Contact Centre'};
  return m[ch]||ch;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 1 — DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.reg('dashboard',()=>{
  const orders=Store.getAll('orders');
  const invoices=Store.getAll('invoices');
  const disputes=Store.getAll('disputes');
  const collections=Store.getAll('collections');
  const revenue=Store.getAll('revenue');
  const tasks=Store.getAll('tasks');

  const totalOrders=orders.length;
  const activeOrders=orders.filter(o=>o.status==='active').length;
  const stpRate=totalOrders?((activeOrders/totalOrders)*100).toFixed(1):0;
  const pendingCredit=orders.filter(o=>o.status==='credit-check').length;
  const openDisputes=disputes.filter(d=>['open','under-review'].includes(d.status)).length;
  const overdueInv=invoices.filter(i=>i.status==='overdue').length;
  const totalDeferred=revenue.reduce((s,r)=>s+r.deferredGBP,0);
  const totalRecognized=revenue.reduce((s,r)=>s+r.recognizedGBP,0);
  const collActive=collections.filter(c=>c.status==='active').length;
  const failedTasks=tasks.filter(t=>t.status==='failed').length;
  const inProgTasks=tasks.filter(t=>t.status==='in-progress').length;

  // Bar chart data: orders by status
  const statusCounts={active:0,provisioning:0,'credit-check':0,validated:0,cancelled:0};
  orders.forEach(o=>{const k=o.status in statusCounts?o.status:'other';if(statusCounts[k]!==undefined)statusCounts[k]++;});
  const maxSC=Math.max(...Object.values(statusCounts),1);

  const orderRows=orders.slice(0,7).map(o=>`
    <tr>
      <td class="td-mono">${U.esc(o.orderId)}</td>
      <td>${U.esc(o.customerName)}</td>
      <td>${U.esc(o.productName)}</td>
      <td><span class="badge badge-muted">${channelBadge(o.channel)}</span></td>
      <td>${statusBadge(o.status)}</td>
      <td>${U.fmt.gbp(o.recurringGross)}/mo</td>
      <td class="td-muted">${U.fmt.date(o.createdAt)}</td>
    </tr>`).join('');

  document.getElementById('main-content').innerHTML=`
  <div class="kpi-grid">
    <div class="kpi-card primary"><div class="kpi-label">Total Orders</div><div class="kpi-value">${totalOrders}</div><div class="kpi-sub">${activeOrders} active</div></div>
    <div class="kpi-card success"><div class="kpi-label">STP Rate</div><div class="kpi-value">${stpRate}%</div><div class="kpi-sub">Target ≥80%</div></div>
    <div class="kpi-card info"><div class="kpi-label">Provisioning</div><div class="kpi-value">${inProgTasks}</div><div class="kpi-sub">${failedTasks} failed</div></div>
    <div class="kpi-card warning"><div class="kpi-label">Credit Queue</div><div class="kpi-value">${pendingCredit}</div><div class="kpi-sub">Awaiting decision</div></div>
    <div class="kpi-card danger"><div class="kpi-label">Overdue Invoices</div><div class="kpi-value">${overdueInv}</div><div class="kpi-sub">${collActive} in dunning</div></div>
    <div class="kpi-card danger"><div class="kpi-label">Open Disputes</div><div class="kpi-value">${openDisputes}</div><div class="kpi-sub">5-day SLA</div></div>
    <div class="kpi-card purple"><div class="kpi-label">Deferred Revenue</div><div class="kpi-value">${U.fmt.gbp(totalDeferred)}</div><div class="kpi-sub">${U.fmt.gbp(totalRecognized)} recognised</div></div>
    <div class="kpi-card success"><div class="kpi-label">DSO</div><div class="kpi-value">28d</div><div class="kpi-sub">Target ≤35d</div></div>
  </div>

  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:20px">
    <div class="card">
      <div class="card-title">Order Status Breakdown</div>
      <div class="bar-chart">
        ${Object.entries(statusCounts).map(([k,v])=>`
          <div class="bar-row">
            <span class="bar-row-label">${k}</span>
            <div class="bar-track"><div class="bar-fill ${k==='active'?'success':k==='cancelled'?'danger':''}" style="width:${(v/maxSC*100).toFixed(0)}%"></div></div>
            <span class="bar-value">${v}</span>
          </div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-title">KPI Targets</div>
      ${[
        {label:'Order Accuracy',val:99.2,target:99.5,unit:'%'},
        {label:'Billing Accuracy',val:98.8,target:99.5,unit:'%'},
        {label:'STP Rate',val:stpRate,target:80,unit:'%'},
        {label:'Collection Rate',val:94.5,target:95,unit:'%'},
      ].map(k=>`
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
            <span>${k.label}</span><span style="font-weight:600">${k.val}${k.unit}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${k.val>=k.target?'success':'warning'}" style="width:${Math.min(k.val,100)}%"></div>
          </div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px">Target: ${k.target}${k.unit}</div>
        </div>`).join('')}
    </div>
  </div>

  <div class="card">
    <div class="section-hdr"><h2>Recent Orders</h2><button class="btn btn-primary btn-sm" onclick="Router.go('orders')">View All</button></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Channel</th><th>Status</th><th>Value</th><th>Created</th></tr></thead>
        <tbody>${orderRows||'<tr><td colspan="7" class="empty-state">No orders yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 2 — ORDERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.reg('orders',()=>{
  function render(filter='',statusF='all'){
    const orders=Store.getAll('orders').filter(o=>{
      const m=filter?o.customerName.toLowerCase().includes(filter.toLowerCase())||o.orderId.toLowerCase().includes(filter.toLowerCase()):true;
      const s=statusF==='all'||o.status===statusF;
      return m&&s;
    });
    const rows=orders.map(o=>`
      <tr>
        <td class="td-mono">${U.esc(o.orderId)}</td>
        <td>${U.esc(o.customerName)}</td>
        <td>${U.esc(o.productName)}</td>
        <td class="td-muted">${channelBadge(o.channel)}</td>
        <td>${statusBadge(o.status)}</td>
        <td>${U.esc(o.type)}</td>
        <td>${U.fmt.gbp(o.recurringGross)}/mo</td>
        <td class="td-muted">${U.fmt.date(o.createdAt)}</td>
        <td>
          <button class="btn btn-ghost btn-xs" onclick="viewOrder('${o.orderId}')">View</button>
          ${o.status==='validated'?`<button class="btn btn-warning btn-xs" onclick="runCreditCheck('${o.orderId}')">Credit Check</button>`:''}
        </td>
      </tr>`).join('');
    document.getElementById('order-table-body').innerHTML=rows||`<tr><td colspan="9"><div class="empty-state"><div class="empty-state-icon">🛒</div><div class="empty-state-text">No orders found</div></div></td></tr>`;
  }

  document.getElementById('main-content').innerHTML=`
  <div class="section-hdr">
    <h2>Order Capture &amp; Validation</h2>
    <button class="btn btn-primary" onclick="openNewOrderModal()">＋ New Order</button>
  </div>
  <div class="toolbar">
    <input class="search-box" id="order-search" placeholder="Search customer or order ID…">
    <select class="filter-select" id="order-status-filter">
      <option value="all">All Statuses</option>
      <option value="draft">Draft</option>
      <option value="validated">Validated</option>
      <option value="credit-check">Credit Check</option>
      <option value="provisioning">Provisioning</option>
      <option value="active">Active</option>
      <option value="cancelled">Cancelled</option>
    </select>
  </div>
  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Channel</th><th>Status</th><th>Type</th><th>Value</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody id="order-table-body"></tbody>
      </table>
    </div>
  </div>`;

  render();
  document.getElementById('order-search').addEventListener('input',e=>render(e.target.value,document.getElementById('order-status-filter').value));
  document.getElementById('order-status-filter').addEventListener('change',e=>render(document.getElementById('order-search').value,e.target.value));
});

window.viewOrder=function(id){
  const o=Store.getById('orders',id,'orderId');
  if(!o)return;
  Modal.open('Order Details — '+o.orderId,`
    <div class="form-grid cols-1">
      ${[
        ['Order ID',o.orderId],['Customer',o.customerName],['Channel',channelBadge(o.channel)],
        ['Product',o.productName],['Type',o.type],['Status',statusBadge(o.status)],
        ['Monthly Value',U.fmt.gbp(o.recurringGross)],
        ['Fraud Score',o.fraudScore!=null?`<span class="badge ${o.fraudScore>70?'badge-danger':o.fraudScore>40?'badge-warning':'badge-success'}">${o.fraudScore}/100</span>`:'—'],
        ['Credit Decision',statusBadge((o.creditDecision||'').toLowerCase())],
        ['Created',U.fmt.dt(o.createdAt)],['Activated',U.fmt.dt(o.activatedAt)],
      ].map(([l,v])=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px"><span style="color:var(--text-muted)">${l}</span><span>${v}</span></div>`).join('')}
    </div>`,
    `<button class="btn btn-ghost" onclick="Modal.close()">Close</button>`);
};

window.runCreditCheck=function(id){
  const o=Store.getById('orders',id,'orderId');
  if(!o)return;
  const cust=Store.query('customers',c=>c.customerId===o.customerId)[0];
  const score=cust?.creditScore||U.rand(400,850);
  const fraud=o.fraudScore||U.rand(5,30);
  const decision=score>650&&fraud<70?'APPROVED':score>400&&fraud<70?'REFERRED':'DECLINED';
  o.creditDecision=decision;
  o.status=decision==='APPROVED'?'provisioning':decision==='REFERRED'?'credit-check':'cancelled';
  Store.save('orders',o,'orderId');
  toast(decision==='APPROVED'?'success':'warning','Credit Decision',`${o.customerName}: ${decision} (Score: ${score})`);
  updateBadges();
  Router.go('orders');
};

window.openNewOrderModal=function(){
  const custs=Store.getAll('customers');
  const prods=Store.getAll('products');
  Modal.open('New Order',`
    <div class="form-grid">
      <div class="field">
        <label>Customer <span class="req">*</span></label>
        <select id="no-cust">
          <option value="">— Select customer —</option>
          ${custs.map(c=>`<option value="${c.customerId}">${U.esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Channel <span class="req">*</span></label>
        <select id="no-ch">
          <option value="web">🌐 Web</option><option value="app">📱 App</option>
          <option value="retail">🏪 Retail</option><option value="contact-centre">📞 Contact Centre</option>
        </select>
      </div>
      <div class="field span-2">
        <label>Product <span class="req">*</span></label>
        <select id="no-prod" onchange="noUpdatePrice()">
          <option value="">— Select product —</option>
          ${prods.map(p=>`<option value="${p.productId}" data-net="${p.recurringNet}" data-vat="${p.recurringVAT}" data-gross="${p.recurringGross}">${U.esc(p.name)} — ${U.fmt.gbp(p.recurringGross)}/mo</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Order Type</label>
        <select id="no-type"><option value="new">New</option><option value="upgrade">Upgrade</option><option value="addon">Add-on</option><option value="migration">Migration</option></select>
      </div>
      <div class="field">
        <label>Monthly (incl. VAT)</label>
        <input type="text" id="no-price" readonly value="—" style="background:#f7f9fc">
      </div>
    </div>
    <div class="gdpr-panel" style="margin-top:12px">
      <div class="gdpr-title">🔒 GDPR &amp; Ofcom Compliance</div>
      <div class="field"><label class="checkbox-row"><input type="checkbox" id="gdpr-data" required><span>I confirm data processing consent has been obtained (mandatory)</span></label></div>
      <div class="field"><label class="checkbox-row"><input type="checkbox" id="gdpr-mkt"><span>Marketing communications consent (optional)</span></label></div>
      <div class="field"><label class="checkbox-row"><input type="checkbox" id="gdpr-ofcom"><span>Ofcom contract summary provided and accepted</span></label></div>
    </div>`,
    `<button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
     <button class="btn btn-primary" onclick="submitNewOrder()">Submit Order</button>`);
};

window.noUpdatePrice=function(){
  const sel=document.getElementById('no-prod');
  const opt=sel.options[sel.selectedIndex];
  const gross=opt.dataset.gross;
  document.getElementById('no-price').value=gross?`£${parseFloat(gross).toFixed(2)}/mo`:'—';
};

window.submitNewOrder=function(){
  const custId=document.getElementById('no-cust').value;
  const prodId=document.getElementById('no-prod').value;
  const ch=document.getElementById('no-ch').value;
  const type=document.getElementById('no-type').value;
  const gdpr=document.getElementById('gdpr-data').checked;
  if(!custId||!prodId){toast('error','Validation','Please select customer and product.');return;}
  if(!gdpr){toast('error','GDPR Required','Data processing consent is mandatory.');return;}
  const cust=Store.query('customers',c=>c.customerId===custId)[0];
  const prod=Store.query('products',p=>p.productId===prodId)[0];
  const orderId='ORD-'+Store.nextSeq('orders');
  const fraudScore=U.rand(3,25);
  const order={
    orderId,customerId:custId,customerName:cust.name,channel:ch,type,
    status:'validated',productId:prodId,productName:prod.name,
    recurringNet:prod.recurringNet,recurringVAT:prod.recurringVAT,recurringGross:prod.recurringGross,
    fraudScore,creditDecision:null,gdprConsent:true,createdAt:U.ts(),activatedAt:null,
  };
  Store.save('orders',order,'orderId');
  Modal.close();
  toast('success','Order Created',`${orderId} — ${prod.name} for ${cust.name}`);
  updateBadges();
  Router.go('orders');
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 3 — CREDIT & RISK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.reg('credit',()=>{
  const pending=Store.query('orders',o=>['credit-check','validated'].includes(o.status));
  const custs=Store.getAll('customers');

  const rows=pending.map(o=>{
    const c=custs.find(cu=>cu.customerId===o.customerId);
    const score=c?.creditScore||0;
    const band=score>=750?'excellent':score>=650?'good':score>=500?'fair':'poor';
    const bandCol={'excellent':'badge-success','good':'badge-info','fair':'badge-warning','poor':'badge-danger'}[band];
    return `<tr>
      <td class="td-mono">${U.esc(o.orderId)}</td>
      <td>${U.esc(o.customerName)}</td>
      <td>${U.esc(o.productName)}</td>
      <td>${U.fmt.gbp(o.recurringGross)}/mo</td>
      <td><span class="badge ${bandCol}">${score} (${band})</span></td>
      <td><span class="badge ${o.fraudScore>70?'badge-danger':o.fraudScore>40?'badge-warning':'badge-success'}">${o.fraudScore}/100</span></td>
      <td>${statusBadge(o.status)}</td>
      <td>
        <button class="btn btn-success btn-xs" onclick="creditDecision('${o.orderId}','APPROVED')">Approve</button>
        <button class="btn btn-warning btn-xs" onclick="creditDecision('${o.orderId}','REFERRED')">Refer</button>
        <button class="btn btn-danger btn-xs" onclick="creditDecision('${o.orderId}','DECLINED')">Decline</button>
      </td>
    </tr>`;
  }).join('');

  const customerCreditRows=custs.map(c=>{
    const band=c.creditScore>=750?'excellent':c.creditScore>=650?'good':c.creditScore>=500?'fair':'poor';
    const bandCol={'excellent':'badge-success','good':'badge-info','fair':'badge-warning','poor':'badge-danger'}[band];
    return `<tr>
      <td>${U.esc(c.name)}</td>
      <td><span class="badge ${bandCol}">${c.creditScore} (${band})</span></td>
      <td>${U.fmt.gbp(c.creditLimit)}</td>
      <td><span class="badge ${c.riskBand==='LOW'?'badge-success':c.riskBand==='MEDIUM'?'badge-warning':'badge-danger'}">${c.riskBand}</span></td>
      <td>${c.vulnerableFlag?'<span class="badge badge-warning">⚠️ Vulnerable</span>':'—'}</td>
    </tr>`;
  }).join('');

  document.getElementById('main-content').innerHTML=`
  <div class="tab-bar">
    <div class="tab active" onclick="switchTab(this,'cr-tab-queue')">Pending Queue (${pending.length})</div>
    <div class="tab" onclick="switchTab(this,'cr-tab-profiles')">Customer Profiles</div>
    <div class="tab" onclick="switchTab(this,'cr-tab-fraud')">Fraud Detection</div>
  </div>

  <div id="cr-tab-queue">
    <div class="card">
      <div class="card-title">Orders Awaiting Credit Decision</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Value</th><th>Credit Score</th><th>Fraud Score</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${rows||`<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-text">No pending credit checks</div></div></td></tr>`}</tbody>
        </table>
      </div>
    </div>
  </div>

  <div id="cr-tab-profiles" style="display:none">
    <div class="card">
      <div class="card-title">Customer Credit Profiles</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Customer</th><th>Credit Score</th><th>Credit Limit</th><th>Risk Band</th><th>Flags</th></tr></thead>
          <tbody>${customerCreditRows}</tbody>
        </table>
      </div>
    </div>
  </div>

  <div id="cr-tab-fraud" style="display:none">
    <div class="alert warning"><span class="alert-icon">⚠️</span><div><div class="alert-title">ML Fraud Detection Active</div>Fraud scores are computed using order velocity, channel risk, amount, and customer history. Scores >70 require manual review.</div></div>
    <div class="kpi-grid">
      <div class="kpi-card success"><div class="kpi-label">Orders Cleared</div><div class="kpi-value">${Store.count('orders',o=>(o.fraudScore||0)<40)}</div><div class="kpi-sub">Score &lt;40</div></div>
      <div class="kpi-card warning"><div class="kpi-label">Elevated Risk</div><div class="kpi-value">${Store.count('orders',o=>(o.fraudScore||0)>=40&&(o.fraudScore||0)<70)}</div><div class="kpi-sub">Score 40–70</div></div>
      <div class="kpi-card danger"><div class="kpi-label">High Risk</div><div class="kpi-value">${Store.count('orders',o=>(o.fraudScore||0)>=70)}</div><div class="kpi-sub">Score ≥70 — Review</div></div>
    </div>
    <div class="card">
      <div class="card-title">Fraud Risk Distribution</div>
      <div class="bar-chart">
        ${Store.getAll('orders').map(o=>`
          <div class="bar-row">
            <span class="bar-row-label">${U.esc(o.orderId)}</span>
            <div class="bar-track"><div class="bar-fill ${(o.fraudScore||0)>=70?'danger':(o.fraudScore||0)>=40?'warning':'success'}" style="width:${o.fraudScore||0}%"></div></div>
            <span class="bar-value">${o.fraudScore||0}/100</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
});

window.creditDecision=function(id,decision){
  const o=Store.getById('orders',id,'orderId');
  if(!o)return;
  o.creditDecision=decision;
  o.status=decision==='APPROVED'?'provisioning':decision==='REFERRED'?'credit-check':'cancelled';
  Store.save('orders',o,'orderId');
  if(decision==='APPROVED'){
    const tasks=[];
    const t1Id='TASK-'+Store.nextSeq('tasks');
    tasks.push({taskId:t1Id,orderId:id,type:'sim-allocation',label:'SIM Allocation',status:'pending',assignedTo:'rpa-bot-01',completedAt:null,failureReason:null,dependsOn:null});
    const t2Id='TASK-'+Store.nextSeq('tasks');
    tasks.push({taskId:t2Id,orderId:id,type:'activation',label:'Service Activation',status:'pending',assignedTo:null,completedAt:null,failureReason:null,dependsOn:t1Id});
    tasks.forEach(t=>Store.save('tasks',t,'taskId'));
  }
  toast(decision==='APPROVED'?'success':'warning','Credit Decision',`${o.customerName}: ${decision}`);
  updateBadges();
  Router.go('credit');
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 4 — ORCHESTRATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.reg('orchestration',()=>{
  const tasks=Store.getAll('tasks');
  const orders=Store.getAll('orders');

  const cols=['pending','in-progress','completed','failed'];
  const colLabels={'pending':'⏳ Pending','in-progress':'🔄 In Progress','completed':'✅ Completed','failed':'❌ Failed'};

  const kanbanCols=cols.map(col=>{
    const items=tasks.filter(t=>t.status===col);
    const cards=items.map(t=>{
      const o=orders.find(od=>od.orderId===t.orderId);
      return `<div class="kanban-card">
        <div class="kanban-card-id">${U.esc(t.taskId)} · ${U.esc(t.orderId)}</div>
        <div class="kanban-card-title">${U.esc(t.label||t.type)}</div>
        <div class="kanban-card-meta">${o?U.esc(o.customerName):'—'}</div>
        ${t.failureReason?`<div style="color:var(--danger);font-size:11px;margin-top:4px">⚠ ${U.esc(t.failureReason)}</div>`:''}
        ${t.dependsOn?`<div style="font-size:10px;color:var(--text-muted);margin-top:4px">Depends: ${U.esc(t.dependsOn)}</div>`:''}
        <div style="margin-top:8px;display:flex;gap:4px">
          ${col==='pending'?`<button class="btn btn-primary btn-xs" onclick="advanceTask('${t.taskId}')">Start</button>`:''}
          ${col==='in-progress'?`<button class="btn btn-success btn-xs" onclick="completeTask('${t.taskId}')">Complete</button><button class="btn btn-danger btn-xs" onclick="failTask('${t.taskId}')">Fail</button>`:''}
          ${col==='failed'?`<button class="btn btn-warning btn-xs" onclick="retryTask('${t.taskId}')">Retry</button>`:''}
        </div>
      </div>`;
    }).join('');
    return `<div class="kanban-col">
      <div class="kanban-col-title">${colLabels[col]}<span>${items.length}</span></div>
      ${cards||'<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:12px">Empty</div>'}
    </div>`;
  }).join('');

  document.getElementById('main-content').innerHTML=`
  <div class="section-hdr"><h2>Order Orchestration &amp; Decomposition</h2>
    <button class="btn btn-primary btn-sm" onclick="Router.go('orchestration')">↻ Refresh</button>
  </div>
  <div class="kpi-grid">
    <div class="kpi-card warning"><div class="kpi-label">Pending</div><div class="kpi-value">${tasks.filter(t=>t.status==='pending').length}</div></div>
    <div class="kpi-card info"><div class="kpi-label">In Progress</div><div class="kpi-value">${tasks.filter(t=>t.status==='in-progress').length}</div></div>
    <div class="kpi-card success"><div class="kpi-label">Completed</div><div class="kpi-value">${tasks.filter(t=>t.status==='completed').length}</div></div>
    <div class="kpi-card danger"><div class="kpi-label">Failed</div><div class="kpi-value">${tasks.filter(t=>t.status==='failed').length}</div></div>
  </div>
  <div class="kanban">${kanbanCols}</div>`;
});

window.advanceTask=function(id){
  const t=Store.getById('tasks',id,'taskId');if(!t)return;
  if(t.dependsOn){const dep=Store.getById('tasks',t.dependsOn,'taskId');if(dep&&dep.status!=='completed'){toast('warning','Blocked',`Depends on ${t.dependsOn} — not yet complete`);return;}}
  t.status='in-progress';Store.save('tasks',t,'taskId');updateBadges();Router.go('orchestration');
};
window.completeTask=function(id){
  const t=Store.getById('tasks',id,'taskId');if(!t)return;
  t.status='completed';t.completedAt=U.ts();Store.save('tasks',t,'taskId');
  const remaining=Store.query('tasks',tk=>tk.orderId===t.orderId&&tk.status!=='completed');
  if(!remaining.length){const o=Store.getById('orders',t.orderId,'orderId');if(o&&o.status==='provisioning'){o.status='active';o.activatedAt=U.ts();Store.save('orders',o,'orderId');toast('success','Service Activated',`Order ${t.orderId} is now active!`);}}
  updateBadges();Router.go('orchestration');
};
window.failTask=function(id){
  const t=Store.getById('tasks',id,'taskId');if(!t)return;
  t.status='failed';t.failureReason='Manual failure — investigation required';Store.save('tasks',t,'taskId');updateBadges();Router.go('orchestration');
};
window.retryTask=function(id){
  const t=Store.getById('tasks',id,'taskId');if(!t)return;
  t.status='pending';t.failureReason=null;t.retryCount=(t.retryCount||0)+1;Store.save('tasks',t,'taskId');updateBadges();Router.go('orchestration');
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 5 — PROVISIONING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.reg('provisioning',()=>{
  const tasks=Store.getAll('tasks');
  const orders=Store.getAll('orders').filter(o=>['provisioning','active'].includes(o.status));

  const steps=['sim-allocation','broadband-provision','router-dispatch','activation'];
  const stepLabels={'sim-allocation':'SIM','broadband-provision':'Broadband','router-dispatch':'Router','activation':'Activation'};

  const orderCards=orders.map(o=>{
    const orderTasks=tasks.filter(t=>t.orderId===o.orderId);
    const pipeline=steps.map(s=>{
      const t=orderTasks.find(tk=>tk.type===s);
      const cls=!t?'':t.status==='completed'?'done':t.status==='in-progress'?'active':t.status==='failed'?'failed':'';
      const icon=!t?'—':t.status==='completed'?'✅':t.status==='in-progress'?'🔄':t.status==='failed'?'❌':'⏳';
      return `<div class="pipeline-step ${cls}"><div class="pipeline-dot">${icon}</div><div class="pipeline-label">${stepLabels[s]}</div></div>`;
    }).join('');
    return `<div class="card card-sm" style="margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div><span class="td-mono" style="font-size:12px">${U.esc(o.orderId)}</span> — <strong>${U.esc(o.customerName)}</strong></div>
        ${statusBadge(o.status)}
      </div>
      <div class="pipeline">${pipeline}</div>
    </div>`;
  }).join('');

  document.getElementById('main-content').innerHTML=`
  <div class="kpi-grid">
    <div class="kpi-card warning"><div class="kpi-label">In Provisioning</div><div class="kpi-value">${Store.count('orders',o=>o.status==='provisioning')}</div></div>
    <div class="kpi-card success"><div class="kpi-label">Activated Today</div><div class="kpi-value">${Store.count('orders',o=>o.activatedAt&&o.activatedAt.slice(0,10)===new Date().toISOString().slice(0,10))}</div></div>
    <div class="kpi-card danger"><div class="kpi-label">Failed Tasks</div><div class="kpi-value">${tasks.filter(t=>t.status==='failed').length}</div></div>
    <div class="kpi-card info"><div class="kpi-label">RPA Bots Active</div><div class="kpi-value">2</div></div>
  </div>
  <div class="section-hdr"><h2>Service Activation Tracker</h2></div>
  ${orderCards||'<div class="empty-state"><div class="empty-state-icon">📡</div><div class="empty-state-text">No provisioning in progress</div></div>'}
  <div class="card" style="margin-top:16px">
    <div class="card-title">RPA Bot Activity Log</div>
    <div class="timeline">
      ${tasks.filter(t=>t.status!=='pending').map(t=>`
        <div class="tl-item">
          <div class="tl-icon ${t.status==='completed'?'success':t.status==='failed'?'danger':''}">
            ${t.status==='completed'?'✅':t.status==='failed'?'❌':'🤖'}
          </div>
          <div class="tl-body">
            <div class="tl-title">${U.esc(t.label||t.type)} — ${U.esc(t.orderId)}</div>
            <div class="tl-meta">
              ${t.assignedTo?`Bot: ${U.esc(t.assignedTo)} · `:''}
              Status: ${t.status}
              ${t.completedAt?' · Completed: '+U.fmt.dt(t.completedAt):''}
              ${t.failureReason?' · ⚠ '+U.esc(t.failureReason):''}
            </div>
          </div>
        </div>`).join('')||'<div class="tl-item"><div class="tl-body" style="color:var(--text-muted)">No activity yet</div></div>'}
    </div>
  </div>`;
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 6 — USAGE & RATING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.reg('usage',()=>{
  const cdrs=Store.getAll('cdrs');
  const anomalies=cdrs.filter(c=>c.anomalyFlag);
  const totalData=cdrs.filter(c=>c.serviceType==='data').reduce((s,c)=>s+c.dataVolumeKB,0);
  const totalVoice=cdrs.filter(c=>c.serviceType==='voice').reduce((s,c)=>s+c.duration,0);
  const totalRated=cdrs.reduce((s,c)=>s+c.ratedNetGBP,0);

  const rows=cdrs.slice(0,20).map(c=>`
    <tr ${c.anomalyFlag?'style="background:#fffbeb"':''}>
      <td class="td-mono">${U.esc(c.cdrId)}</td>
      <td>${U.esc(c.serviceType)}</td>
      <td>${c.serviceType==='voice'?c.duration+'s':c.serviceType==='data'?(c.dataVolumeKB/1024).toFixed(2)+' MB':'1 msg'}</td>
      <td class="td-muted">${U.esc(c.destination)}</td>
      <td>${U.fmt.gbp(c.ratedNetGBP)}</td>
      <td>${U.fmt.date(c.recordedAt)}</td>
      <td>${c.anomalyFlag?`<span class="badge badge-danger">⚠ ${U.esc(c.anomalyReason)}</span>`:'<span class="badge badge-success">OK</span>'}</td>
    </tr>`).join('');

  document.getElementById('main-content').innerHTML=`
  <div class="kpi-grid">
    <div class="kpi-card primary"><div class="kpi-label">Total CDRs</div><div class="kpi-value">${cdrs.length}</div><div class="kpi-sub">This period</div></div>
    <div class="kpi-card info"><div class="kpi-label">Data Usage</div><div class="kpi-value">${(totalData/1024).toFixed(0)} MB</div></div>
    <div class="kpi-card success"><div class="kpi-label">Voice Duration</div><div class="kpi-value">${Math.floor(totalVoice/60)} min</div></div>
    <div class="kpi-card warning"><div class="kpi-label">Anomalies</div><div class="kpi-value">${anomalies.length}</div><div class="kpi-sub">Flagged for review</div></div>
    <div class="kpi-card success"><div class="kpi-label">Rated Revenue</div><div class="kpi-value">${U.fmt.gbp(totalRated)}</div><div class="kpi-sub">Net, ex-VAT</div></div>
  </div>
  ${anomalies.length?`<div class="alert warning"><span class="alert-icon">⚠️</span><div><div class="alert-title">${anomalies.length} Anomalous Usage Record${anomalies.length>1?'s':''} Detected</div>${anomalies.map(a=>`${a.cdrId}: ${a.anomalyReason}`).join(' | ')}</div></div>`:''}
  <div class="card">
    <div class="section-hdr"><h2>Usage Records (CDRs)</h2>
      <button class="btn btn-primary btn-sm" onclick="generateCDRs()">＋ Simulate Usage Batch</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>CDR ID</th><th>Type</th><th>Volume</th><th>Destination</th><th>Rated (Net)</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
});

window.generateCDRs=function(){
  const cdrs=Store.getAll('cdrs');
  const types=['voice','sms','data','data'];
  for(let i=0;i<10;i++){
    const t=types[i%4];
    const dur=t==='voice'?U.rand(30,300):0;
    const kb=t==='data'?U.rand(1000,30000):0;
    const net=t==='voice'?+(dur/60*0.02).toFixed(4):t==='data'?+(kb/1024*0.01).toFixed(4):0;
    const anom=Math.random()<0.08;
    cdrs.push({cdrId:'CDR-'+String(cdrs.length+1).padStart(4,'0'),customerId:'CUST-0001',msisdn:'+447700900001',serviceType:t,duration:dur,dataVolumeKB:kb,destination:'national',ratedNetGBP:net,ratedVATGBP:+(net*0.2).toFixed(4),anomalyFlag:anom,anomalyReason:anom?'Unusual pattern detected':null,billingPeriod:'2026-03',recordedAt:U.ts()});
  }
  Store.saveAll('cdrs',cdrs);
  toast('success','CDRs Generated','10 new usage records rated and processed');
  Router.go('usage');
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 7 — BILLING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.reg('billing',()=>{
  function render(filter='',statusF='all'){
    const invs=Store.getAll('invoices').filter(i=>{
      const m=filter?i.customerName.toLowerCase().includes(filter.toLowerCase())||i.invoiceNumber.toLowerCase().includes(filter.toLowerCase()):true;
      const s=statusF==='all'||i.status===statusF;
      return m&&s;
    });
    const rows=invs.map(i=>`
      <tr>
        <td class="td-mono">${U.esc(i.invoiceNumber)}</td>
        <td>${U.esc(i.customerName)}</td>
        <td>${U.esc(i.type)}</td>
        <td>${U.fmt.gbp(i.netGBP)}</td>
        <td>${U.fmt.gbp(i.vatGBP)}</td>
        <td><strong>${U.fmt.gbp(i.grossGBP)}</strong></td>
        <td>${statusBadge(i.status)}</td>
        <td class="td-muted">${U.fmt.date(i.dueDate)}</td>
        <td>${i.billShock?'<span class="badge badge-danger">⚡ Bill Shock</span>':'—'}</td>
        <td><button class="btn btn-ghost btn-xs" onclick="viewInvoice('${i.invoiceId}')">View</button></td>
      </tr>`).join('');
    document.getElementById('billing-rows').innerHTML=rows||`<tr><td colspan="10"><div class="empty-state"><div class="empty-state-icon">📄</div><div class="empty-state-text">No invoices found</div></div></td></tr>`;
  }

  const invs=Store.getAll('invoices');
  const totalGross=invs.reduce((s,i)=>s+i.grossGBP,0);
  const totalPaid=invs.filter(i=>i.status==='paid').reduce((s,i)=>s+i.grossGBP,0);
  const totalOverdue=invs.filter(i=>i.status==='overdue').reduce((s,i)=>s+i.balanceGBP,0);

  document.getElementById('main-content').innerHTML=`
  <div class="kpi-grid">
    <div class="kpi-card primary"><div class="kpi-label">Total Invoiced</div><div class="kpi-value">${U.fmt.gbp(totalGross)}</div></div>
    <div class="kpi-card success"><div class="kpi-label">Collected</div><div class="kpi-value">${U.fmt.gbp(totalPaid)}</div></div>
    <div class="kpi-card danger"><div class="kpi-label">Overdue Balance</div><div class="kpi-value">${U.fmt.gbp(totalOverdue)}</div></div>
    <div class="kpi-card warning"><div class="kpi-label">Bill Shock Alerts</div><div class="kpi-value">${Store.count('invoices',i=>i.billShock)}</div></div>
  </div>
  <div class="section-hdr"><h2>Invoices</h2>
    <button class="btn btn-primary btn-sm" onclick="generateInvoice()">＋ Generate Invoice</button>
  </div>
  <div class="toolbar">
    <input class="search-box" id="billing-search" placeholder="Search customer or invoice number…">
    <select class="filter-select" id="billing-status">
      <option value="all">All</option><option value="draft">Draft</option><option value="issued">Issued</option>
      <option value="paid">Paid</option><option value="overdue">Overdue</option><option value="disputed">Disputed</option>
    </select>
  </div>
  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>Invoice #</th><th>Customer</th><th>Type</th><th>Net</th><th>VAT</th><th>Gross</th><th>Status</th><th>Due Date</th><th>Alerts</th><th>Actions</th></tr></thead>
        <tbody id="billing-rows"></tbody>
      </table>
    </div>
  </div>`;

  render();
  document.getElementById('billing-search').addEventListener('input',e=>render(e.target.value,document.getElementById('billing-status').value));
  document.getElementById('billing-status').addEventListener('change',e=>render(document.getElementById('billing-search').value,e.target.value));
});

window.viewInvoice=function(id){
  const inv=Store.getById('invoices',id,'invoiceId');
  if(!inv)return;
  Modal.open('Invoice — '+inv.invoiceNumber,`
  <div class="invoice-box">
    <div class="invoice-header">
      <div><div class="invoice-company">UK Telecom Ltd</div><div class="invoice-sub">VAT Reg: GB 123 456 789 · Ofcom Licensed</div></div>
      <div><div class="invoice-num">${U.esc(inv.invoiceNumber)}</div><div style="font-size:12px;opacity:0.7;text-align:right">Due: ${U.fmt.date(inv.dueDate)}</div></div>
    </div>
    <div class="invoice-body">
      <div class="invoice-section" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">
        <div><strong>Bill To:</strong><br>${U.esc(inv.customerName)}</div>
        <div style="text-align:right"><strong>Period:</strong> ${U.fmt.date(inv.periodStart)} – ${U.fmt.date(inv.periodEnd)}<br><strong>Issued:</strong> ${U.fmt.date(inv.issuedAt)}</div>
      </div>
      <div class="table-wrap invoice-table" style="margin:12px 0">
        <table>
          <thead><tr><th>Description</th><th>Type</th><th>Net</th><th>VAT (20%)</th><th>Gross</th></tr></thead>
          <tbody>
            <tr><td>${U.esc(inv.customerName)} — Monthly Service</td><td>${U.esc(inv.type)}</td><td>${U.fmt.gbp(inv.netGBP)}</td><td>${U.fmt.gbp(inv.vatGBP)}</td><td>${U.fmt.gbp(inv.grossGBP)}</td></tr>
            <tr class="invoice-total-row"><td colspan="2">TOTAL</td><td>${U.fmt.gbp(inv.netGBP)}</td><td>${U.fmt.gbp(inv.vatGBP)}</td><td>${U.fmt.gbp(inv.grossGBP)}</td></tr>
          </tbody>
        </table>
      </div>
      <div class="invoice-vat-note">VAT at 20% standard rate · HMRC compliant VAT invoice · Subject to UK Telecom Terms &amp; Conditions</div>
      ${inv.billShock?'<div class="alert warning" style="margin-top:10px"><span class="alert-icon">⚡</span><div><div class="alert-title">Bill Shock Detected</div>This invoice is significantly higher than average. Customer notification sent.</div></div>':''}
    </div>
  </div>`,
  `<button class="btn btn-ghost" onclick="Modal.close()">Close</button>
   ${inv.status==='issued'||inv.status==='overdue'?`<button class="btn btn-success" onclick="markPaid('${id}')">Mark as Paid</button>`:''}
   ${!['disputed'].includes(inv.status)?`<button class="btn btn-warning" onclick="raiseDisputeFromInvoice('${id}')">Raise Dispute</button>`:''}`,true);
};

window.markPaid=function(id){
  const inv=Store.getById('invoices',id,'invoiceId');if(!inv)return;
  inv.status='paid';inv.paidGBP=inv.grossGBP;inv.balanceGBP=0;
  Store.save('invoices',inv,'invoiceId');
  const payId='PAY-'+Store.nextSeq('payments');
  Store.save('payments',{paymentId:payId,invoiceId:id,customerId:inv.customerId,customerName:inv.customerName,amountGBP:inv.grossGBP,method:'direct-debit',status:'collected',bankRef:'AUTO-'+payId,date:U.ts().slice(0,10),reconciledAt:U.ts()},'paymentId');
  Modal.close();toast('success','Payment Recorded',`Invoice ${inv.invoiceNumber} marked as paid`);updateBadges();Router.go('billing');
};

window.generateInvoice=function(){
  const orders=Store.query('orders',o=>o.status==='active');
  if(!orders.length){toast('warning','No Active Orders','No active orders to generate invoices for.');return;}
  const o=orders[0];
  const seq=Store.nextSeq('invoices');
  const inv={
    invoiceId:'INV-'+seq,invoiceNumber:'UK-2026-'+seq.padStart(4,'0'),
    customerId:o.customerId,customerName:o.customerName,
    periodStart:U.daysAgo(30),periodEnd:U.daysAgo(1),
    dueDate:U.daysFromNow(14),status:'issued',
    netGBP:o.recurringNet||+(o.recurringGross/1.2).toFixed(2),
    vatGBP:o.recurringVAT||+(o.recurringGross*0.2/1.2).toFixed(2),
    grossGBP:o.recurringGross,paidGBP:0,balanceGBP:o.recurringGross,
    type:'recurring',billShock:false,issuedAt:U.ts(),
  };
  Store.save('invoices',inv,'invoiceId');
  toast('success','Invoice Generated',`${inv.invoiceNumber} for ${o.customerName}`);
  updateBadges();Router.go('billing');
};

window.raiseDisputeFromInvoice=function(invoiceId){
  Modal.close();
  setTimeout(()=>openDisputeModal(invoiceId),100);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 8 — PAYMENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.reg('payments',()=>{
  const payments=Store.getAll('payments');
  const totalCollected=payments.filter(p=>p.status==='collected').reduce((s,p)=>s+p.amountGBP,0);
  const totalFailed=payments.filter(p=>p.status==='failed').reduce((s,p)=>s+p.amountGBP,0);
  const pending=payments.filter(p=>p.status==='pending').length;

  const rows=payments.map(p=>`
    <tr>
      <td class="td-mono">${U.esc(p.paymentId)}</td>
      <td>${U.esc(p.customerName)}</td>
      <td class="td-mono">${U.esc(p.invoiceId)}</td>
      <td>${U.fmt.gbp(p.amountGBP)}</td>
      <td><span class="badge badge-muted">${U.esc(p.method)}</span></td>
      <td>${statusBadge(p.status)}</td>
      <td class="td-muted">${U.esc(p.bankRef||'—')}</td>
      <td class="td-muted">${U.fmt.date(p.date)}</td>
      <td>${p.reconciledAt?`<span class="badge badge-success">✓ Reconciled</span>`:`<button class="btn btn-primary btn-xs" onclick="reconcilePayment('${p.paymentId}')">Reconcile</button>`}</td>
    </tr>`).join('');

  const methodBreakdown={};
  payments.forEach(p=>{const m=p.method;if(!methodBreakdown[m])methodBreakdown[m]=0;methodBreakdown[m]+=p.amountGBP;});
  const maxM=Math.max(...Object.values(methodBreakdown),1);

  document.getElementById('main-content').innerHTML=`
  <div class="kpi-grid">
    <div class="kpi-card success"><div class="kpi-label">Collected</div><div class="kpi-value">${U.fmt.gbp(totalCollected)}</div></div>
    <div class="kpi-card danger"><div class="kpi-label">Failed</div><div class="kpi-value">${U.fmt.gbp(totalFailed)}</div></div>
    <div class="kpi-card warning"><div class="kpi-label">Pending</div><div class="kpi-value">${pending}</div></div>
    <div class="kpi-card info"><div class="kpi-label">Total Transactions</div><div class="kpi-value">${payments.length}</div></div>
  </div>
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px">
    <div class="card">
      <div class="section-hdr"><h2>Payments &amp; Cash Application</h2>
        <button class="btn btn-primary btn-sm" onclick="openPaymentModal()">＋ Record Payment</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Pay ID</th><th>Customer</th><th>Invoice</th><th>Amount</th><th>Method</th><th>Status</th><th>Reference</th><th>Date</th><th>Reconciled</th></tr></thead>
          <tbody>${rows||`<tr><td colspan="9" class="empty-state">No payments yet</td></tr>`}</tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Payment Method Breakdown</div>
      <div class="bar-chart">
        ${Object.entries(methodBreakdown).map(([m,v])=>`
          <div class="bar-row">
            <span class="bar-row-label">${m}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${(v/maxM*100).toFixed(0)}%"></div></div>
            <span class="bar-value">${U.fmt.gbp(v)}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
});

window.reconcilePayment=function(id){
  const p=Store.getById('payments',id,'paymentId');if(!p)return;
  p.reconciledAt=U.ts();Store.save('payments',p,'paymentId');
  toast('success','Reconciled',`Payment ${id} matched to ${p.invoiceId}`);Router.go('payments');
};

window.openPaymentModal=function(){
  const invs=Store.query('invoices',i=>['issued','overdue'].includes(i.status));
  Modal.open('Record Payment',`
    <div class="form-grid">
      <div class="field span-2">
        <label>Invoice <span class="req">*</span></label>
        <select id="pm-inv">
          <option value="">— Select invoice —</option>
          ${invs.map(i=>`<option value="${i.invoiceId}">${i.invoiceNumber} — ${i.customerName} — ${U.fmt.gbp(i.balanceGBP)}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>Amount (£) <span class="req">*</span></label><input type="number" id="pm-amt" step="0.01" min="0.01" placeholder="0.00"></div>
      <div class="field"><label>Method <span class="req">*</span></label>
        <select id="pm-method">
          <option value="direct-debit">Direct Debit</option><option value="card">Card</option>
          <option value="bacs">BACS</option><option value="faster-payments">Faster Payments</option>
        </select>
      </div>
      <div class="field span-2"><label>Bank Reference</label><input type="text" id="pm-ref" placeholder="Optional reference"></div>
    </div>`,
    `<button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
     <button class="btn btn-primary" onclick="submitPayment()">Record Payment</button>`);
};

window.submitPayment=function(){
  const invId=document.getElementById('pm-inv').value;
  const amt=parseFloat(document.getElementById('pm-amt').value);
  const method=document.getElementById('pm-method').value;
  const ref=document.getElementById('pm-ref').value;
  if(!invId||!amt||amt<=0){toast('error','Validation','Please fill all required fields.');return;}
  const inv=Store.getById('invoices',invId,'invoiceId');
  const payId='PAY-'+Store.nextSeq('payments');
  Store.save('payments',{paymentId:payId,invoiceId:invId,customerId:inv.customerId,customerName:inv.customerName,amountGBP:amt,method,status:'collected',bankRef:ref||'MANUAL-'+payId,date:U.ts().slice(0,10),reconciledAt:null},'paymentId');
  if(amt>=inv.balanceGBP){inv.status='paid';inv.paidGBP=inv.grossGBP;inv.balanceGBP=0;}
  else{inv.paidGBP=(inv.paidGBP||0)+amt;inv.balanceGBP=inv.grossGBP-inv.paidGBP;}
  Store.save('invoices',inv,'invoiceId');
  Modal.close();toast('success','Payment Recorded',`${U.fmt.gbp(amt)} via ${method} for ${inv.invoiceNumber}`);updateBadges();Router.go('payments');
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 9 — COLLECTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.reg('collections',()=>{
  const cols=Store.getAll('collections');
  const stageNames={1:'Stage 1 – Reminder',2:'Stage 2 – Warning',3:'Stage 3 – Final Notice',4:'Stage 4 – Suspension'};
  const stageCols={1:'badge-info',2:'badge-warning',3:'badge-danger',4:'badge-purple'};
  const aiColours={'low-risk-reminder':'badge-success','payment-plan':'badge-info','vulnerable':'badge-warning','legal':'badge-danger'};

  const rows=cols.filter(c=>c.status==='active').map(c=>`
    <tr ${c.vulnerableFlag?'style="background:#fffbeb"':''}>
      <td class="td-mono">${U.esc(c.collectionId)}</td>
      <td>${U.esc(c.customerName)}${c.vulnerableFlag?' <span class="badge badge-warning" title="Vulnerable Customer">⚠</span>':''}</td>
      <td class="td-mono">${U.esc(c.invoiceId)}</td>
      <td><strong>${U.fmt.gbp(c.amountGBP)}</strong></td>
      <td><span class="badge badge-danger">${c.daysOverdue}d overdue</span></td>
      <td><span class="badge ${stageCols[c.dunningStage]||'badge-muted'}">${stageNames[c.dunningStage]||'—'}</span></td>
      <td><span class="badge ${aiColours[c.aiSegment]||'badge-muted'}">${c.aiSegment||'—'}</span></td>
      <td>${c.promiseToPay?`<span class="badge badge-info">PTP: ${U.fmt.date(c.promiseToPay.date)}</span>`:'—'}</td>
      <td class="td-muted">${U.fmt.date(c.nextAction)}</td>
      <td>
        ${!c.vulnerableFlag&&c.dunningStage<4?`<button class="btn btn-warning btn-xs" onclick="escalateDunning('${c.collectionId}')">Escalate</button>`:''}
        ${c.promiseToPay?'':`<button class="btn btn-info btn-xs" style="background:var(--info);color:#fff" onclick="openPTPModal('${c.collectionId}')">PTP</button>`}
        <button class="btn btn-success btn-xs" onclick="resolveCollection('${c.collectionId}')">Resolved</button>
      </td>
    </tr>`).join('');

  document.getElementById('main-content').innerHTML=`
  <div class="kpi-grid">
    ${[1,2,3,4].map(s=>
      `<div class="kpi-card ${s===4?'danger':s===3?'warning':'info'}"><div class="kpi-label">${stageNames[s]}</div><div class="kpi-value">${cols.filter(c=>c.dunningStage===s&&c.status==='active').length}</div></div>`
    ).join('')}
    <div class="kpi-card warning"><div class="kpi-label">Vulnerable Customers</div><div class="kpi-value">${cols.filter(c=>c.vulnerableFlag&&c.status==='active').length}</div><div class="kpi-sub">Extra protection applied</div></div>
    <div class="kpi-card primary"><div class="kpi-label">Promises to Pay</div><div class="kpi-value">${cols.filter(c=>c.promiseToPay).length}</div></div>
  </div>
  <div class="alert info"><span class="alert-icon">🛡️</span><div><div class="alert-title">Vulnerable Customer Protection Active</div>Vulnerable customers are excluded from automated escalation. All actions require agent review per FCA guidelines.</div></div>
  <div class="card">
    <div class="section-hdr"><h2>Active Collections &amp; Dunning</h2>
      <button class="btn btn-primary btn-sm" onclick="runDunningCycle()">▶ Run Dunning Cycle</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Customer</th><th>Invoice</th><th>Amount</th><th>Overdue</th><th>Stage</th><th>AI Segment</th><th>Promise</th><th>Next Action</th><th>Actions</th></tr></thead>
        <tbody>${rows||`<tr><td colspan="10"><div class="empty-state"><div class="empty-state-icon">📬</div><div class="empty-state-text">No active collections</div></div></td></tr>`}</tbody>
      </table>
    </div>
  </div>`;
});

window.escalateDunning=function(id){
  const c=Store.getById('collections',id,'collectionId');if(!c)return;
  if(c.vulnerableFlag){toast('warning','Protected','Vulnerable customer — manual review required');return;}
  c.dunningStage=Math.min(c.dunningStage+1,4);
  c.nextAction=U.daysFromNow(7);Store.save('collections',c,'collectionId');
  toast('warning','Dunning Escalated',`${c.customerName} moved to Stage ${c.dunningStage}`);updateBadges();Router.go('collections');
};
window.resolveCollection=function(id){
  const c=Store.getById('collections',id,'collectionId');if(!c)return;
  c.status='resolved';Store.save('collections',c,'collectionId');
  toast('success','Collection Resolved',`${c.customerName} — case closed`);updateBadges();Router.go('collections');
};
window.openPTPModal=function(id){
  const c=Store.getById('collections',id,'collectionId');if(!c)return;
  Modal.open('Record Promise to Pay',`
    <div class="form-grid cols-1">
      <p style="font-size:13px;margin-bottom:8px">Customer: <strong>${U.esc(c.customerName)}</strong> — Amount: <strong>${U.fmt.gbp(c.amountGBP)}</strong></p>
      <div class="field"><label>Promise Amount (£) <span class="req">*</span></label><input type="number" id="ptp-amt" value="${c.amountGBP}" step="0.01"></div>
      <div class="field"><label>Promised Payment Date <span class="req">*</span></label><input type="date" id="ptp-date" value="${U.daysFromNow(7)}"></div>
    </div>`,
    `<button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
     <button class="btn btn-primary" onclick="savePTP('${id}')">Record Promise</button>`);
};
window.savePTP=function(id){
  const amt=parseFloat(document.getElementById('ptp-amt').value);
  const date=document.getElementById('ptp-date').value;
  if(!amt||!date){toast('error','Validation','Please fill all fields.');return;}
  const c=Store.getById('collections',id,'collectionId');
  c.promiseToPay={amount:amt,date,kept:null};c.nextAction=date;
  Store.save('collections',c,'collectionId');Modal.close();
  toast('success','Promise Recorded',`${c.customerName} promises ${U.fmt.gbp(amt)} by ${date}`);Router.go('collections');
};
window.runDunningCycle=function(){
  const cols=Store.query('collections',c=>c.status==='active'&&!c.vulnerableFlag);
  let count=0;
  cols.forEach(c=>{
    if(!c.promiseToPay&&c.dunningStage<4){c.dunningStage++;c.nextAction=U.daysFromNow(7);Store.save('collections',c,'collectionId');count++;}
  });
  toast('info','Dunning Cycle Complete',`${count} account${count!==1?'s':''} advanced`);updateBadges();Router.go('collections');
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 10 — DISPUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.reg('disputes',()=>{
  const disputes=Store.getAll('disputes');
  const open=disputes.filter(d=>['open','under-review'].includes(d.status));

  const rows=disputes.map(d=>{
    const slaDays=Math.ceil((new Date(d.slaBreachAt)-new Date())/(1000*3600*24));
    return `<tr>
      <td class="td-mono">${U.esc(d.disputeId)}</td>
      <td>${U.esc(d.customerName)}</td>
      <td class="td-mono">${U.esc(d.invoiceId)}</td>
      <td>${U.fmt.gbp(d.amountDisputed)}</td>
      <td><span class="badge badge-muted">${U.esc(d.category)}</span></td>
      <td>${statusBadge(d.status)}</td>
      <td><span class="badge badge-${d.priority==='high'?'danger':d.priority==='medium'?'warning':'success'}">${d.priority}</span></td>
      <td><span class="badge ${slaDays<0?'badge-danger':slaDays<=1?'badge-warning':'badge-info'}">${slaDays<0?'BREACHED':slaDays+'d left'}</span></td>
      <td><button class="btn btn-ghost btn-xs" onclick="viewDispute('${d.disputeId}')">Review</button></td>
    </tr>`;
  }).join('');

  // Root cause chart
  const reasons={};
  disputes.forEach(d=>{const k=d.category||'other';reasons[k]=(reasons[k]||0)+1;});
  const maxR=Math.max(...Object.values(reasons),1);

  document.getElementById('main-content').innerHTML=`
  <div class="kpi-grid">
    <div class="kpi-card danger"><div class="kpi-label">Open</div><div class="kpi-value">${open.length}</div></div>
    <div class="kpi-card warning"><div class="kpi-label">Under Review</div><div class="kpi-value">${disputes.filter(d=>d.status==='under-review').length}</div></div>
    <div class="kpi-card success"><div class="kpi-label">Upheld</div><div class="kpi-value">${disputes.filter(d=>d.status==='upheld').length}</div></div>
    <div class="kpi-card info"><div class="kpi-label">Total Disputed</div><div class="kpi-value">${U.fmt.gbp(disputes.reduce((s,d)=>s+d.amountDisputed,0))}</div></div>
  </div>
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px">
    <div class="card">
      <div class="section-hdr"><h2>Disputes</h2>
        <button class="btn btn-primary btn-sm" onclick="openDisputeModal()">＋ Raise Dispute</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Customer</th><th>Invoice</th><th>Amount</th><th>Category</th><th>Status</th><th>Priority</th><th>SLA</th><th>Action</th></tr></thead>
          <tbody>${rows||`<tr><td colspan="9"><div class="empty-state"><div class="empty-state-icon">⚖️</div><div class="empty-state-text">No disputes</div></div></td></tr>`}</tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Root Cause Analysis</div>
      <div class="bar-chart">
        ${Object.entries(reasons).map(([k,v])=>`
          <div class="bar-row">
            <span class="bar-row-label">${k}</span>
            <div class="bar-track"><div class="bar-fill warning" style="width:${(v/maxR*100).toFixed(0)}%"></div></div>
            <span class="bar-value">${v}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
});

window.openDisputeModal=function(invoiceId){
  const invs=Store.getAll('invoices');
  Modal.open('Raise Dispute',`
    <div class="form-grid">
      <div class="field span-2"><label>Invoice <span class="req">*</span></label>
        <select id="d-inv">
          <option value="">— Select invoice —</option>
          ${invs.map(i=>`<option value="${i.invoiceId}" ${i.invoiceId===invoiceId?'selected':''}>${i.invoiceNumber} — ${i.customerName}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>Category <span class="req">*</span></label>
        <select id="d-cat">
          <option value="billing-error">Billing Error</option>
          <option value="service-not-received">Service Not Received</option>
          <option value="duplicate-charge">Duplicate Charge</option>
          <option value="usage-dispute">Usage Dispute</option>
          <option value="contract-dispute">Contract Dispute</option>
        </select>
      </div>
      <div class="field"><label>Priority</label>
        <select id="d-pri"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select>
      </div>
      <div class="field"><label>Disputed Amount (£) <span class="req">*</span></label><input type="number" id="d-amt" step="0.01" min="0.01"></div>
      <div class="field span-2"><label>Description <span class="req">*</span></label><textarea id="d-desc" rows="3" placeholder="Describe the dispute…"></textarea></div>
    </div>`,
    `<button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
     <button class="btn btn-primary" onclick="submitDispute()">Raise Dispute</button>`);
};

window.submitDispute=function(){
  const invId=document.getElementById('d-inv').value;
  const cat=document.getElementById('d-cat').value;
  const pri=document.getElementById('d-pri').value;
  const amt=parseFloat(document.getElementById('d-amt').value);
  const desc=document.getElementById('d-desc').value.trim();
  if(!invId||!amt||!desc){toast('error','Validation','Please fill all required fields.');return;}
  const inv=Store.getById('invoices',invId,'invoiceId');
  const dId='DIS-'+Store.nextSeq('disputes');
  Store.save('disputes',{disputeId:dId,invoiceId:invId,customerId:inv.customerId,customerName:inv.customerName,category:cat,description:desc,amountDisputed:amt,status:'open',priority:pri,raisedAt:U.ts(),slaBreachAt:U.daysFromNow(5),resolution:{decision:null,creditAmountGBP:null,notes:null},rootCause:null},'disputeId');
  inv.status='disputed';Store.save('invoices',inv,'invoiceId');
  Modal.close();toast('warning','Dispute Raised',`${dId} — SLA: 5 business days`);updateBadges();Router.go('disputes');
};

window.viewDispute=function(id){
  const d=Store.getById('disputes',id,'disputeId');if(!d)return;
  Modal.open('Dispute — '+d.disputeId,`
    <div style="font-size:13px">
      ${[
        ['Customer',U.esc(d.customerName)],['Invoice',U.esc(d.invoiceId)],
        ['Category',U.esc(d.category)],['Amount Disputed',U.fmt.gbp(d.amountDisputed)],
        ['Status',statusBadge(d.status)],['Priority',d.priority],
        ['Raised',U.fmt.dt(d.raisedAt)],['SLA Deadline',U.fmt.date(d.slaBreachAt)],
      ].map(([l,v])=>`<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text-muted)">${l}</span><span>${v}</span></div>`).join('')}
      <div style="margin-top:12px"><strong>Description:</strong><p style="margin-top:4px;color:var(--text-2)">${U.esc(d.description)}</p></div>
      ${d.rootCause?`<div style="margin-top:8px"><strong>Root Cause:</strong> ${U.esc(d.rootCause)}</div>`:''}
    </div>
    <div style="margin-top:14px">
      <label style="font-size:12px;font-weight:600">Root Cause / Investigation Notes</label>
      <textarea id="d-notes" style="width:100%;margin-top:4px;padding:8px;border:1px solid var(--border);border-radius:6px" rows="3" placeholder="Enter findings…">${d.rootCause||''}</textarea>
      <label style="font-size:12px;font-weight:600;display:block;margin-top:8px">Credit Amount (if upholding) £</label>
      <input type="number" id="d-credit" style="width:100%;margin-top:4px;padding:8px;border:1px solid var(--border);border-radius:6px" step="0.01" value="${d.amountDisputed}">
    </div>`,
    `<button class="btn btn-ghost" onclick="Modal.close()">Close</button>
     <button class="btn btn-danger btn-sm" onclick="resolveDispute('${id}','rejected')">Reject</button>
     <button class="btn btn-success btn-sm" onclick="resolveDispute('${id}','upheld')">Uphold &amp; Issue Credit</button>`,true);
};

window.resolveDispute=function(id,decision){
  const d=Store.getById('disputes',id,'disputeId');if(!d)return;
  const notes=document.getElementById('d-notes')?.value||'';
  const credit=parseFloat(document.getElementById('d-credit')?.value||0);
  d.status=decision;d.rootCause=notes;
  d.resolution={decision,creditAmountGBP:decision==='upheld'?credit:0,notes,resolvedAt:U.ts()};
  Store.save('disputes',d,'disputeId');
  if(decision==='upheld'&&credit>0){
    const inv=Store.getById('invoices',d.invoiceId,'invoiceId');
    if(inv){inv.status='issued';inv.balanceGBP=Math.max(0,inv.balanceGBP-credit);Store.save('invoices',inv,'invoiceId');}
    toast('success','Dispute Upheld',`Credit note issued: ${U.fmt.gbp(credit)}`);
  } else {
    toast('info','Dispute Rejected','Customer notified of decision');
  }
  Modal.close();updateBadges();Router.go('disputes');
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 11 — REVENUE RECOGNITION (IFRS 15)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.reg('revenue',()=>{
  const rrecs=Store.getAll('revenue');
  const totalContract=rrecs.reduce((s,r)=>s+r.contractValue,0);
  const totalRecognized=rrecs.reduce((s,r)=>s+r.recognizedGBP,0);
  const totalDeferred=rrecs.reduce((s,r)=>s+r.deferredGBP,0);

  const rows=rrecs.map(r=>{
    const pct=((r.recognizedGBP/r.contractValue)*100).toFixed(1);
    return `<tr>
      <td class="td-mono">${U.esc(r.rrId)}</td>
      <td>${U.esc(r.customerName)}</td>
      <td>${U.esc(r.product)}</td>
      <td>${r.contractMonths}mo</td>
      <td>${U.fmt.gbp(r.contractValue)}</td>
      <td class="td-muted">${U.fmt.gbp(r.recognizedGBP)}</td>
      <td style="color:var(--purple)">${U.fmt.gbp(r.deferredGBP)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="progress-bar" style="flex:1"><div class="progress-fill success" style="width:${pct}%"></div></div>
          <span style="font-size:11px;color:var(--text-muted)">${pct}%</span>
        </div>
      </td>
      <td><button class="btn btn-primary btn-xs" onclick="runRecognition('${r.rrId}')">Recognise</button></td>
    </tr>`;
  }).join('');

  const maxD=Math.max(...rrecs.map(r=>r.deferredGBP),1);

  document.getElementById('main-content').innerHTML=`
  <div class="alert info"><span class="alert-icon">📋</span><div><div class="alert-title">IFRS 15 — Revenue from Contracts with Customers</div>Revenue is recognised over the contract term as performance obligations are satisfied. Deferred revenue represents future obligations.</div></div>
  <div class="kpi-grid">
    <div class="kpi-card primary"><div class="kpi-label">Total Contract Value</div><div class="kpi-value">${U.fmt.gbp(totalContract)}</div></div>
    <div class="kpi-card success"><div class="kpi-label">Recognised to Date</div><div class="kpi-value">${U.fmt.gbp(totalRecognized)}</div></div>
    <div class="kpi-card purple"><div class="kpi-label">Deferred Revenue</div><div class="kpi-value">${U.fmt.gbp(totalDeferred)}</div></div>
    <div class="kpi-card info"><div class="kpi-label">Recognition Rate</div><div class="kpi-value">${totalContract?((totalRecognized/totalContract)*100).toFixed(1)+'%':'—'}</div></div>
  </div>
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px">
    <div class="card">
      <div class="section-hdr"><h2>Performance Obligations (IFRS 15)</h2>
        <button class="btn btn-primary btn-sm" onclick="runPeriodClose()">▶ Period Close</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>RR ID</th><th>Customer</th><th>Product</th><th>Term</th><th>Contract Value</th><th>Recognised</th><th>Deferred</th><th>Progress</th><th>Action</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Deferred Revenue by Contract</div>
      <div class="bar-chart">
        ${rrecs.map(r=>`
          <div class="bar-row">
            <span class="bar-row-label">${U.esc(r.customerName)}</span>
            <div class="bar-track"><div class="bar-fill" style="background:var(--purple);width:${(r.deferredGBP/maxD*100).toFixed(0)}%"></div></div>
            <span class="bar-value">${U.fmt.gbp(r.deferredGBP)}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
});

window.runRecognition=function(id){
  const r=Store.getById('revenue',id,'rrId');if(!r)return;
  const monthly=r.contractValue/r.contractMonths;
  r.recognizedGBP=Math.min(r.recognizedGBP+monthly,r.contractValue);
  r.deferredGBP=Math.max(r.contractValue-r.recognizedGBP,0);
  Store.save('revenue',r,'rrId');
  toast('success','Revenue Recognised',`${U.fmt.gbp(monthly)} recognised for ${r.customerName}`);Router.go('revenue');
};
window.runPeriodClose=function(){
  const rrecs=Store.getAll('revenue').filter(r=>r.deferredGBP>0);
  rrecs.forEach(r=>{const m=r.contractValue/r.contractMonths;r.recognizedGBP=Math.min(r.recognizedGBP+m,r.contractValue);r.deferredGBP=Math.max(r.contractValue-r.recognizedGBP,0);Store.save('revenue',r,'rrId');});
  toast('success','Period Close Complete',`${rrecs.length} contracts updated — IFRS 15 journals posted`);Router.go('revenue');
};

// ── Tab Switcher ──────────────────────────────────────────────
window.switchTab=function(tabEl,showId){
  const parent=tabEl.closest('.main-content, [id^="main"]')||document.getElementById('main-content');
  parent.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  tabEl.classList.add('active');
  const allPanels=parent.querySelectorAll('[id]');
  const prefix=showId.split('-tab-')[0]+'-tab-';
  parent.querySelectorAll('[id^="'+prefix+'"]').forEach(p=>p.style.display='none');
  const target=document.getElementById(showId);
  if(target)target.style.display='block';
};

// ── Init ──────────────────────────────────────────────────────
seedData();
updateBadges();
Router.go('dashboard');
