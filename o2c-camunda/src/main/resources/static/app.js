'use strict';
/* =============================================================
   O2C Platform — Frontend SPA (Camunda 7 / Spring Boot edition)
   All data comes from the REST API at /api/*
   Camunda engine runs at /engine-rest/* and /camunda/*
   ============================================================= */

// ─── API helpers ────────────────────────────────────────────────
const api = {
  get:  (path) => fetch(path).then(r => r.ok ? r.json() : Promise.reject(r)),
  post: (path, body) => fetch(path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }).then(r => r.ok ? r.json() : Promise.reject(r)),
  put:  (path, body) => fetch(path, { method:'PUT',  headers:{'Content-Type':'application/json'}, body: JSON.stringify(body||{}) }).then(r => r.ok ? r.json() : Promise.reject(r)),
};

// ─── Toast notifications ────────────────────────────────────────
function toast(type, title, msg) {
  const host = document.getElementById('toastHost');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<strong>${title}</strong>${msg ? '<br><small>'+msg+'</small>' : ''}`;
  host.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

// ─── Modal ──────────────────────────────────────────────────────
const Modal = {
  open(title, body, footer, wide) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    document.getElementById('modalFooter').innerHTML = footer || '';
    const box = document.getElementById('modalBox');
    box.style.maxWidth = wide ? '780px' : '520px';
    document.getElementById('modalOverlay').style.display = 'flex';
  },
  close() { document.getElementById('modalOverlay').style.display = 'none'; }
};
document.getElementById('modalOverlay').addEventListener('click', e => { if (e.target.id === 'modalOverlay') Modal.close(); });

// ─── Router ─────────────────────────────────────────────────────
const Router = {
  _routes: {},
  reg(name, fn) { this._routes[name] = fn; },
  async go(name) {
    const fn = this._routes[name];
    if (!fn) return;
    document.querySelectorAll('.sb-item').forEach(el => el.classList.toggle('active', el.dataset.module === name));
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="loading-spinner">Loading…</div>';
    try { await fn(main); } catch(e) { main.innerHTML = `<div class="error-box">Error loading ${name}: ${e.message||e}</div>`; }
    refreshKpiPills();
  }
};
document.querySelectorAll('.sb-item').forEach(el => {
  el.addEventListener('click', () => { Router.go(el.dataset.module); updatePageTitle(el.dataset.module); });
});
function updatePageTitle(module) {
  const labels = { dashboard:'Dashboard', orders:'Order Capture', credit:'Credit & Risk',
    orchestration:'Orchestration', provisioning:'Provisioning', usage:'Usage & Rating',
    billing:'Billing', payments:'Payments', collections:'Collections', disputes:'Disputes',
    revenue:'Revenue (IFRS 15)', processes:'BPM Processes' };
  document.getElementById('pageTitle').textContent = labels[module] || module;
}

// ─── KPI pills ──────────────────────────────────────────────────
async function refreshKpiPills() {
  try {
    const kpis = await api.get('/api/dashboard/kpis');
    document.getElementById('pill-stp').textContent    = `STP ${kpis.stpRate}%`;
    document.getElementById('pill-dso').textContent    = `DSO ${kpis.dso}d`;
    document.getElementById('pill-orders').textContent = `Orders ${kpis.totalOrders}`;
  } catch(_) {}
}

// ─── Status badge helper ─────────────────────────────────────────
function badge(status) {
  const cls = {
    ACTIVE:'success', PAID:'success', APPROVED:'success', COLLECTED:'success', RESOLVED:'success',
    CREDIT_CHECK:'warning', OVERDUE:'danger', OPEN:'danger', FLAGGED:'danger', FAILED:'danger',
    UPHELD:'danger', DECLINED:'danger', SUSPENDED:'danger',
    PROVISIONING:'info', UNDER_REVIEW:'info', ISSUED:'info', PENDING:'info', NEW:'info',
    REFERRED:'warning', DISPUTED:'warning', REJECTED:'warning',
  }[status] || 'default';
  return `<span class="badge badge-${cls}">${status?.replace('_',' ')}</span>`;
}
function gbp(v) { return v != null ? `£${Number(v).toFixed(2)}` : '—'; }
function fmt(v) { return v ? new Date(v).toLocaleDateString('en-GB') : '—'; }

// ═══════════════════════════════════════════════════════════════
// MODULE 1 — Dashboard
// ═══════════════════════════════════════════════════════════════
Router.reg('dashboard', async (el) => {
  const kpis = await api.get('/api/dashboard/kpis');
  const orders = await api.get('/api/orders');

  // Status breakdown
  const statusCounts = {};
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status]||0)+1; });
  const maxCount = Math.max(1, ...Object.values(statusCounts));

  const barRows = Object.entries(statusCounts).map(([s, c]) => `
    <div class="bar-row">
      <span class="bar-label">${s.toLowerCase().replace('_','-')}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${c/maxCount*100}%"></div></div>
      <span class="bar-val">${c}</span>
    </div>`).join('');

  el.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">TOTAL ORDERS</div>
        <div class="kpi-value">${kpis.totalOrders}</div>
        <div class="kpi-sub">${kpis.activeOrders} active</div></div>
      <div class="kpi-card"><div class="kpi-label">STP RATE</div>
        <div class="kpi-value text-success">${kpis.stpRate}%</div>
        <div class="kpi-sub">Target &ge;80%</div></div>
      <div class="kpi-card"><div class="kpi-label">OVERDUE INVOICES</div>
        <div class="kpi-value text-danger">${kpis.overdueInvoices}</div>
        <div class="kpi-sub">In dunning</div></div>
      <div class="kpi-card"><div class="kpi-label">OPEN DISPUTES</div>
        <div class="kpi-value text-danger">${kpis.openDisputes}</div>
        <div class="kpi-sub">5-day SLA</div></div>
      <div class="kpi-card"><div class="kpi-label">DEFERRED REVENUE</div>
        <div class="kpi-value text-purple">${gbp(kpis.totalDeferred)}</div>
        <div class="kpi-sub">${gbp(kpis.totalRecognised)} recognised</div></div>
      <div class="kpi-card"><div class="kpi-label">DSO</div>
        <div class="kpi-value text-success">${kpis.dso}d</div>
        <div class="kpi-sub">Target &le;35d</div></div>
    </div>
    <div class="panel-row">
      <div class="panel" style="flex:1.2">
        <div class="panel-title">ORDER STATUS BREAKDOWN</div>
        <div class="bar-chart">${barRows}</div>
      </div>
      <div class="panel" style="flex:1">
        <div class="panel-title">RECENT ORDERS</div>
        <table class="data-table"><thead><tr>
          <th>Order ID</th><th>Customer</th><th>Product</th><th>Status</th>
        </tr></thead><tbody>
          ${orders.slice(0,5).map(o=>`<tr>
            <td>${o.orderId}</td>
            <td>${o.customer?.name||'—'}</td>
            <td>${o.productName}</td>
            <td>${badge(o.status)}</td>
          </tr>`).join('')}
        </tbody></table>
      </div>
    </div>`;
});

// ═══════════════════════════════════════════════════════════════
// MODULE 2 — Orders
// ═══════════════════════════════════════════════════════════════
Router.reg('orders', async (el) => {
  const orders = await api.get('/api/orders');
  const customers = await api.get('/api/credit/customers');

  el.innerHTML = `
    <div class="section-header">
      <h2>Order Capture &amp; Validation</h2>
      <button class="btn btn-primary" onclick="openNewOrderModal()">+ New Order</button>
    </div>
    <div class="filter-bar">
      <input type="text" id="orderSearch" placeholder="Search customer or order ID…" oninput="filterOrders()" class="search-input"/>
      <select id="orderStatus" onchange="filterOrders()" class="filter-select">
        <option value="">All Statuses</option>
        ${['NEW','CREDIT_CHECK','PROVISIONING','ACTIVE','SUSPENDED','CANCELLED'].map(s=>`<option value="${s}">${s.replace('_',' ')}</option>`).join('')}
      </select>
    </div>
    <div class="panel">
      <table class="data-table" id="ordersTable"><thead><tr>
        <th>Order ID</th><th>Customer</th><th>Product</th><th>Channel</th><th>Status</th><th>Gross</th><th>Created</th>
      </tr></thead><tbody>
        ${orders.map(o=>`<tr data-id="${o.orderId}" data-customer="${o.customer?.name||''}" data-status="${o.status}">
          <td>${o.orderId}</td>
          <td>${o.customer?.name||'—'}</td>
          <td>${o.productName}</td>
          <td>${o.channel}</td>
          <td>${badge(o.status)}</td>
          <td>${gbp(o.recurringGross)}</td>
          <td>${fmt(o.createdAt)}</td>
        </tr>`).join('')}
      </tbody></table>
    </div>`;

  window._customers = customers;
  window._orders = orders;
});

window.filterOrders = function() {
  const search = document.getElementById('orderSearch')?.value.toLowerCase() || '';
  const status = document.getElementById('orderStatus')?.value || '';
  document.querySelectorAll('#ordersTable tbody tr').forEach(row => {
    const match = (!search || row.dataset.customer.toLowerCase().includes(search) || row.dataset.id.toLowerCase().includes(search))
                && (!status || row.dataset.status === status);
    row.style.display = match ? '' : 'none';
  });
};

window.openNewOrderModal = function() {
  const customers = window._customers || [];
  Modal.open('New Order', `
    <div class="form-grid">
      <label>Customer
        <select id="f-cust" class="form-control">
          ${customers.map(c=>`<option value="${c.customerId}">${c.name}</option>`).join('')}
        </select>
      </label>
      <label>Product Name<input id="f-prod" class="form-control" value="SIM Only Plus (5G)"/></label>
      <label>Channel
        <select id="f-chan" class="form-control">
          <option>WEB</option><option>RETAIL</option><option>APP</option><option>CONTACT_CENTRE</option>
        </select>
      </label>
      <label>Monthly Net (£)<input id="f-net" type="number" class="form-control" value="25"/></label>
    </div>`,
    `<button class="btn btn-primary" onclick="submitOrder()">Create Order</button>
     <button class="btn" onclick="Modal.close()">Cancel</button>`);
};

window.submitOrder = async function() {
  const body = {
    customerId:   document.getElementById('f-cust').value,
    productId:    'PROD-' + Date.now(),
    productName:  document.getElementById('f-prod').value,
    channel:      document.getElementById('f-chan').value,
    recurringNet: document.getElementById('f-net').value,
  };
  try {
    await api.post('/api/orders', body);
    Modal.close();
    toast('success', 'Order created', 'Camunda proc_o2c process started');
    Router.go('orders');
  } catch(e) { toast('error', 'Failed to create order', e.statusText || ''); }
};

// ═══════════════════════════════════════════════════════════════
// MODULE 3 — Credit & Risk
// ═══════════════════════════════════════════════════════════════
Router.reg('credit', async (el) => {
  const [queue, customers] = await Promise.all([
    api.get('/api/credit/queue'),
    api.get('/api/credit/customers'),
  ]);

  el.innerHTML = `
    <div class="tab-bar">
      <button class="tab active" onclick="showTab('credit-queue',this)">Credit Queue (${queue.length})</button>
      <button class="tab" onclick="showTab('credit-customers',this)">Customer Profiles</button>
    </div>
    <div id="credit-queue">
      <div class="panel">
        <table class="data-table"><thead><tr>
          <th>Order ID</th><th>Customer</th><th>Credit Score</th><th>Risk Band</th><th>Fraud Score</th><th>Actions</th>
        </tr></thead><tbody>
          ${queue.length ? queue.map(o=>`<tr>
            <td>${o.orderId}</td>
            <td>${o.customer?.name||'—'}</td>
            <td>${o.customer?.creditScore||'—'}</td>
            <td>${badge(o.customer?.riskBand||'—')}</td>
            <td>${o.fraudScore != null ? o.fraudScore : '—'}</td>
            <td>
              <button class="btn btn-sm btn-success" onclick="creditDecide('${o.orderId}','APPROVED')">Approve</button>
              <button class="btn btn-sm btn-danger"  onclick="creditDecide('${o.orderId}','DECLINED')">Decline</button>
            </td>
          </tr>`).join('') : '<tr><td colspan="6" class="text-center">No orders in credit queue</td></tr>'}
        </tbody></table>
      </div>
    </div>
    <div id="credit-customers" style="display:none">
      <div class="panel">
        <table class="data-table"><thead><tr>
          <th>Customer ID</th><th>Name</th><th>Type</th><th>Credit Score</th><th>Limit</th><th>Risk Band</th><th>Vulnerable</th>
        </tr></thead><tbody>
          ${customers.map(c=>`<tr>
            <td>${c.customerId}</td><td>${c.name}</td><td>${c.type}</td>
            <td>${c.creditScore}</td><td>${gbp(c.creditLimit)}</td>
            <td>${badge(c.riskBand)}</td>
            <td>${c.vulnerableFlag ? '<span class="badge badge-warning">YES</span>' : 'No'}</td>
          </tr>`).join('')}
        </tbody></table>
      </div>
    </div>`;
});

window.creditDecide = async function(orderId, decision) {
  try {
    await api.post(`/api/credit/${orderId}/decide`, { decision });
    toast('success', `Credit ${decision}`, `Order ${orderId} — Camunda process advanced`);
    Router.go('credit');
  } catch(e) { toast('error', 'Decision failed', ''); }
};

// ═══════════════════════════════════════════════════════════════
// MODULE 4 — Orchestration (via Camunda Tasks API)
// ═══════════════════════════════════════════════════════════════
Router.reg('orchestration', async (el) => {
  const orders = await api.get('/api/orders');

  // Fetch open Camunda tasks
  let tasks = [];
  try { tasks = await api.get('/engine-rest/task?maxResults=50'); } catch(_) {}

  const byStatus = { PENDING:[], IN_PROGRESS:[], COMPLETED:[], FAILED:[] };
  orders.forEach(o => {
    const bucket = o.status === 'ACTIVE' ? 'COMPLETED' :
                   o.status === 'CANCELLED' ? 'FAILED' :
                   o.status === 'PROVISIONING' ? 'IN_PROGRESS' : 'PENDING';
    byStatus[bucket].push(o);
  });

  const col = (label, color, items) => `
    <div class="kanban-col">
      <div class="kanban-header" style="color:${color}">${label} <span class="badge">${items.length}</span></div>
      ${items.map(o=>`
        <div class="kanban-card">
          <div class="kanban-card-id">${o.orderId}</div>
          <div class="kanban-card-name">${o.customer?.name||'—'}</div>
          <div class="kanban-card-product">${o.productName}</div>
          ${badge(o.status)}
        </div>`).join('')}
    </div>`;

  el.innerHTML = `
    <div class="section-header"><h2>Order Orchestration</h2>
      <a href="/camunda/app/tasklist" target="_blank" class="btn btn-primary">Open Camunda Tasklist</a>
    </div>
    <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">
      <div class="kpi-card"><div class="kpi-label">PENDING</div><div class="kpi-value text-warning">${byStatus.PENDING.length}</div></div>
      <div class="kpi-card"><div class="kpi-label">IN PROGRESS</div><div class="kpi-value text-info">${byStatus.IN_PROGRESS.length}</div></div>
      <div class="kpi-card"><div class="kpi-label">COMPLETED</div><div class="kpi-value text-success">${byStatus.COMPLETED.length}</div></div>
      <div class="kpi-card"><div class="kpi-label">OPEN TASKS</div><div class="kpi-value">${tasks.length}</div></div>
    </div>
    <div class="kanban-board">
      ${col('PENDING','#f59e0b',byStatus.PENDING)}
      ${col('IN PROGRESS','#0066cc',byStatus.IN_PROGRESS)}
      ${col('COMPLETED','#22c55e',byStatus.COMPLETED)}
      ${col('FAILED','#ef4444',byStatus.FAILED)}
    </div>
    ${tasks.length ? `<div class="panel" style="margin-top:16px">
      <div class="panel-title">OPEN CAMUNDA TASKS</div>
      <table class="data-table"><thead><tr>
        <th>Task</th><th>Process Instance</th><th>Assignee</th><th>Created</th><th>Action</th>
      </tr></thead><tbody>
        ${tasks.map(t=>`<tr>
          <td>${t.name}</td>
          <td><code>${t.processInstanceId?.slice(0,8)}…</code></td>
          <td>${t.assignee||'—'}</td>
          <td>${fmt(t.created)}</td>
          <td><a href="/camunda/app/tasklist" target="_blank" class="btn btn-sm">Open in Tasklist</a></td>
        </tr>`).join('')}
      </tbody></table>
    </div>` : ''}`;
});

// ═══════════════════════════════════════════════════════════════
// MODULE 5 — Provisioning
// ═══════════════════════════════════════════════════════════════
Router.reg('provisioning', async (el) => {
  const orders = await api.get('/api/orders');
  const relevant = orders.filter(o => ['PROVISIONING','ACTIVE'].includes(o.status));

  el.innerHTML = `
    <h2>Service Provisioning</h2>
    <div class="panel">
      <table class="data-table"><thead><tr>
        <th>Order ID</th><th>Customer</th><th>Product</th><th>Channel</th><th>Status</th><th>Gross</th>
      </tr></thead><tbody>
        ${relevant.length ? relevant.map(o=>`<tr>
          <td>${o.orderId}</td><td>${o.customer?.name||'—'}</td>
          <td>${o.productName}</td><td>${o.channel}</td>
          <td>${badge(o.status)}</td><td>${gbp(o.recurringGross)}</td>
        </tr>`).join('') : '<tr><td colspan="6" class="text-center">No orders in provisioning</td></tr>'}
      </tbody></table>
    </div>
    <div class="panel" style="margin-top:16px">
      <div class="panel-title">CAMUNDA ENGINE LINK</div>
      <p style="padding:12px;color:var(--text-secondary)">
        Provisioning tasks are managed by Camunda process <code>proc_o2c</code>.
        View and complete tasks in the
        <a href="/camunda/app/tasklist" target="_blank">Camunda Tasklist</a> or
        monitor process instances in
        <a href="/camunda/app/cockpit" target="_blank">Camunda Cockpit</a>.
      </p>
    </div>`;
});

// ═══════════════════════════════════════════════════════════════
// MODULE 6 — Usage & Rating
// ═══════════════════════════════════════════════════════════════
Router.reg('usage', async (el) => {
  const cdrs = await api.get('/api/usage/cdrs');

  el.innerHTML = `
    <div class="section-header">
      <h2>Usage &amp; Rating (CDRs)</h2>
      <button class="btn btn-primary" onclick="simulateCdrs()">Generate 10 CDRs</button>
    </div>
    <div class="panel">
      <table class="data-table" id="cdrTable"><thead><tr>
        <th>CDR ID</th><th>Customer</th><th>Type</th><th>Duration/Data</th><th>Net</th><th>Anomaly</th><th>Period</th>
      </tr></thead><tbody>
        ${cdrs.slice(0,50).map(c=>`<tr>
          <td>${c.cdrId}</td>
          <td>${c.customer?.name||'—'}</td>
          <td><span class="badge badge-info">${c.serviceType}</span></td>
          <td>${c.serviceType==='DATA' ? Math.round((c.dataVolumeKb||0)/1024)+'MB' : Math.round((c.durationSeconds||0)/60)+'min'}</td>
          <td>${gbp(c.ratedNetGbp)}</td>
          <td>${c.anomalyFlag ? `<span class="badge badge-danger">${c.anomalyReason||'YES'}</span>` : '<span class="badge badge-default">OK</span>'}</td>
          <td>${c.billingPeriod||'—'}</td>
        </tr>`).join('')}
      </tbody></table>
    </div>`;
});

window.simulateCdrs = async function() {
  try {
    await api.post('/api/usage/simulate', { count: 10 });
    toast('success', 'CDRs generated', '10 new usage records added');
    Router.go('usage');
  } catch(e) { toast('error', 'Simulation failed', ''); }
};

// ═══════════════════════════════════════════════════════════════
// MODULE 7 — Billing
// ═══════════════════════════════════════════════════════════════
Router.reg('billing', async (el) => {
  const invoices = await api.get('/api/billing/invoices');

  el.innerHTML = `
    <div class="section-header">
      <h2>Billing &amp; Invoicing</h2>
      <button class="btn btn-primary" onclick="openGenerateInvoiceModal()">Generate Invoice</button>
    </div>
    <div class="panel">
      <table class="data-table"><thead><tr>
        <th>Invoice #</th><th>Customer</th><th>Type</th><th>Net</th><th>VAT</th><th>Gross</th><th>Balance</th><th>Status</th><th>Actions</th>
      </tr></thead><tbody>
        ${invoices.map(inv=>`<tr>
          <td>${inv.invoiceNumber}</td>
          <td>${inv.customer?.name||'—'}</td>
          <td>${inv.type}</td>
          <td>${gbp(inv.netGbp)}</td>
          <td>${gbp(inv.vatGbp)}</td>
          <td><strong>${gbp(inv.grossGbp)}</strong></td>
          <td>${gbp(inv.balanceGbp)}</td>
          <td>${badge(inv.status)}${inv.billShock ? ' <span class="badge badge-warning">BILL SHOCK</span>':''}</td>
          <td>
            ${inv.status!=='PAID'?`<button class="btn btn-sm" onclick="recordPaymentFor('${inv.invoiceId}','${inv.balanceGbp}')">Pay</button>`:''}
            ${inv.status!=='DISPUTED'&&inv.status!=='PAID'?`<button class="btn btn-sm btn-danger" onclick="openDisputeModal('${inv.invoiceId}','${inv.grossGbp}')">Dispute</button>`:''}
          </td>
        </tr>`).join('')}
      </tbody></table>
    </div>`;
});

window.openGenerateInvoiceModal = async function() {
  const orders = await api.get('/api/orders');
  const active = orders.filter(o => o.status === 'ACTIVE');
  Modal.open('Generate Invoice', `
    <label>Order<select id="f-inv-order" class="form-control">
      ${active.map(o=>`<option value="${o.orderId}">${o.orderId} — ${o.customer?.name} — ${o.productName}</option>`).join('')}
    </select></label>`,
    `<button class="btn btn-primary" onclick="generateInvoice()">Generate</button>
     <button class="btn" onclick="Modal.close()">Cancel</button>`);
};
window.generateInvoice = async function() {
  try {
    await api.post('/api/billing/invoices/generate', { orderId: document.getElementById('f-inv-order').value });
    Modal.close(); toast('success', 'Invoice generated', ''); Router.go('billing');
  } catch(e) { toast('error', 'Failed', ''); }
};
window.recordPaymentFor = function(invoiceId, balance) {
  Modal.open('Record Payment', `
    <label>Invoice<input class="form-control" value="${invoiceId}" readonly/></label>
    <label>Amount (£)<input id="f-pay-amt" type="number" class="form-control" value="${Number(balance).toFixed(2)}"/></label>
    <label>Method<select id="f-pay-meth" class="form-control">
      <option>DIRECT_DEBIT</option><option>CARD</option><option>BACS</option><option>FASTER_PAYMENTS</option>
    </select></label>`,
    `<button class="btn btn-primary" onclick="submitPayment('${invoiceId}')">Record</button>
     <button class="btn" onclick="Modal.close()">Cancel</button>`);
};
window.submitPayment = async function(invoiceId) {
  try {
    await api.post('/api/payments', { invoiceId, amount: document.getElementById('f-pay-amt').value, method: document.getElementById('f-pay-meth').value });
    Modal.close(); toast('success', 'Payment recorded', ''); Router.go('billing');
  } catch(e) { toast('error', 'Payment failed', ''); }
};
window.openDisputeModal = function(invoiceId, amount) {
  Modal.open('Raise Dispute', `
    <label>Category<select id="f-dis-cat" class="form-control">
      <option value="BILLING_ERROR">Billing Error</option>
      <option value="DUPLICATE_CHARGE">Duplicate Charge</option>
      <option value="SERVICE_ISSUE">Service Issue</option>
    </select></label>
    <label>Description<textarea id="f-dis-desc" class="form-control">Incorrect charge on invoice</textarea></label>
    <label>Amount Disputed (£)<input id="f-dis-amt" type="number" class="form-control" value="${Number(amount).toFixed(2)}"/></label>`,
    `<button class="btn btn-primary" onclick="submitDispute('${invoiceId}')">Raise</button>
     <button class="btn" onclick="Modal.close()">Cancel</button>`);
};
window.submitDispute = async function(invoiceId) {
  try {
    await api.post(`/api/billing/invoices/${invoiceId}/dispute`, {
      category: document.getElementById('f-dis-cat').value,
      description: document.getElementById('f-dis-desc').value,
      amount: document.getElementById('f-dis-amt').value,
    });
    Modal.close(); toast('success', 'Dispute raised', 'Camunda proc_dispute started'); Router.go('billing');
  } catch(e) { toast('error', 'Failed to raise dispute', ''); }
};

// ═══════════════════════════════════════════════════════════════
// MODULE 8 — Payments
// ═══════════════════════════════════════════════════════════════
Router.reg('payments', async (el) => {
  const [payments, breakdown] = await Promise.all([
    api.get('/api/payments'),
    api.get('/api/payments/breakdown'),
  ]);

  const maxBreak = Math.max(1, ...Object.values(breakdown));
  const breakdownBars = Object.entries(breakdown).map(([m, c]) => `
    <div class="bar-row">
      <span class="bar-label">${m.replace('_',' ')}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${c/maxBreak*100}%"></div></div>
      <span class="bar-val">${c}</span>
    </div>`).join('');

  el.innerHTML = `
    <h2>Payments &amp; Reconciliation</h2>
    <div class="panel-row">
      <div class="panel" style="flex:2">
        <table class="data-table"><thead><tr>
          <th>Payment ID</th><th>Customer</th><th>Invoice</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th>
        </tr></thead><tbody>
          ${payments.map(p=>`<tr>
            <td>${p.paymentId}</td>
            <td>${p.customer?.name||'—'}</td>
            <td>${p.invoice?.invoiceNumber||'—'}</td>
            <td>${gbp(p.amountGbp)}</td>
            <td>${p.method}</td>
            <td>${badge(p.status)}</td>
            <td>${fmt(p.paymentDate)}</td>
          </tr>`).join('')}
        </tbody></table>
      </div>
      <div class="panel" style="flex:1">
        <div class="panel-title">PAYMENT METHOD BREAKDOWN</div>
        <div class="bar-chart">${breakdownBars}</div>
      </div>
    </div>`;
});

// ═══════════════════════════════════════════════════════════════
// MODULE 9 — Collections & Dunning
// ═══════════════════════════════════════════════════════════════
Router.reg('collections', async (el) => {
  const collections = await api.get('/api/collections');

  const stages = [1,2,3,4].map(s => collections.filter(c => c.dunningStage === s));
  const vulnerable = collections.filter(c => c.vulnerableFlag);

  el.innerHTML = `
    <h2>Collections &amp; Dunning</h2>
    <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">
      ${[1,2,3,4].map((s,i)=>`<div class="kpi-card">
        <div class="kpi-label">STAGE ${s} — ${['REMINDER','WARNING','FINAL NOTICE','SUSPENSION'][i]}</div>
        <div class="kpi-value" style="color:${['#0066cc','#f59e0b','#ef4444','#7c3aed'][i]}">${stages[i].length}</div>
      </div>`).join('')}
    </div>
    ${vulnerable.length ? `<div class="alert-box" style="margin-bottom:12px">
      <strong>Vulnerable Customer Protection Active</strong> — ${vulnerable.length} customer(s) require manual review per FCA guidelines.
    </div>` : ''}
    <div class="panel">
      <div class="section-header" style="padding:0 0 12px 0">
        <div class="panel-title">ACTIVE COLLECTIONS &amp; DUNNING</div>
        <button class="btn btn-primary" onclick="runDunningCycle()">Run Dunning Cycle</button>
      </div>
      <table class="data-table"><thead><tr>
        <th>ID</th><th>Customer</th><th>Invoice</th><th>Amount</th><th>Overdue</th><th>Stage</th><th>Vulnerable</th><th>Actions</th>
      </tr></thead><tbody>
        ${collections.length ? collections.map(c=>`<tr>
          <td>${c.collectionId}</td>
          <td>${c.customer?.name||'—'}</td>
          <td>${c.invoice?.invoiceNumber||'—'}</td>
          <td>${gbp(c.amountGbp)}</td>
          <td>${c.daysOverdue}d overdue</td>
          <td>${badge(`Stage ${c.dunningStage}`)}</td>
          <td>${c.vulnerableFlag ? '<span class="badge badge-warning">YES</span>' : 'No'}</td>
          <td>
            ${!c.vulnerableFlag ? `<button class="btn btn-sm" onclick="escalateCollection('${c.collectionId}')">Escalate</button>` : ''}
            <button class="btn btn-sm btn-success" onclick="resolveCollection('${c.collectionId}')">Resolve</button>
          </td>
        </tr>`).join('') : '<tr><td colspan="8" class="text-center">No active collections</td></tr>'}
      </tbody></table>
    </div>`;
});

window.runDunningCycle  = async () => { try { await api.post('/api/collections/run-cycle',{}); toast('success','Dunning cycle run',''); Router.go('collections'); } catch(e) { toast('error','Failed',''); } };
window.escalateCollection = async (id) => { try { await api.post(`/api/collections/${id}/escalate`,{}); toast('success','Escalated',''); Router.go('collections'); } catch(e) { toast('error','Failed',''); } };
window.resolveCollection  = async (id) => { try { await api.post(`/api/collections/${id}/resolve`,{}); toast('success','Resolved',''); Router.go('collections'); } catch(e) { toast('error','Failed',''); } };

// ═══════════════════════════════════════════════════════════════
// MODULE 10 — Disputes & Adjustments
// ═══════════════════════════════════════════════════════════════
Router.reg('disputes', async (el) => {
  const disputes = await api.get('/api/disputes');
  const open = disputes.filter(d => ['OPEN','UNDER_REVIEW'].includes(d.status));

  el.innerHTML = `
    <h2>Disputes &amp; Adjustments</h2>
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
      <div class="kpi-card"><div class="kpi-label">OPEN</div><div class="kpi-value text-danger">${open.filter(d=>d.status==='OPEN').length}</div></div>
      <div class="kpi-card"><div class="kpi-label">UNDER REVIEW</div><div class="kpi-value text-warning">${open.filter(d=>d.status==='UNDER_REVIEW').length}</div></div>
      <div class="kpi-card"><div class="kpi-label">TOTAL DISPUTED</div><div class="kpi-value text-purple">${gbp(disputes.reduce((s,d)=>s+Number(d.amountDisputed||0),0))}</div></div>
    </div>
    <div class="panel">
      <table class="data-table"><thead><tr>
        <th>ID</th><th>Customer</th><th>Invoice</th><th>Amount</th><th>Category</th><th>Status</th><th>Priority</th><th>Actions</th>
      </tr></thead><tbody>
        ${disputes.map(d=>`<tr>
          <td>${d.disputeId}</td>
          <td>${d.customer?.name||'—'}</td>
          <td>${d.invoice?.invoiceNumber||'—'}</td>
          <td>${gbp(d.amountDisputed)}</td>
          <td><span class="badge badge-default">${(d.category||'').replace('_','-').toLowerCase()}</span></td>
          <td>${badge(d.status)}</td>
          <td>${badge(d.priority||'MEDIUM')}</td>
          <td>
            ${['OPEN','UNDER_REVIEW'].includes(d.status) ? `
              <button class="btn btn-sm btn-success" onclick="resolveDispute('${d.disputeId}','UPHELD')">Uphold</button>
              <button class="btn btn-sm btn-danger"  onclick="resolveDispute('${d.disputeId}','REJECTED')">Reject</button>` : ''}
          </td>
        </tr>`).join('')}
      </tbody></table>
    </div>`;
});

window.resolveDispute = async function(disputeId, decision) {
  try {
    await api.put(`/api/disputes/${disputeId}/resolve`, { decision });
    toast('success', `Dispute ${decision}`, `Camunda proc_dispute advanced`);
    Router.go('disputes');
  } catch(e) { toast('error', 'Failed', ''); }
};

// ═══════════════════════════════════════════════════════════════
// MODULE 11 — Revenue Recognition (IFRS 15)
// ═══════════════════════════════════════════════════════════════
Router.reg('revenue', async (el) => {
  const records = await api.get('/api/revenue');
  const summary = await api.get('/api/revenue/summary');

  el.innerHTML = `
    <h2>Revenue Recognition (IFRS 15)</h2>
    <div class="ifrs-banner">
      <strong>IFRS 15 — Revenue from Contracts with Customers</strong><br/>
      Revenue is recognised over the contract term as performance obligations are satisfied.
    </div>
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
      <div class="kpi-card"><div class="kpi-label">TOTAL RECOGNISED</div><div class="kpi-value text-success">${gbp(summary.totalRecognised)}</div></div>
      <div class="kpi-card"><div class="kpi-label">TOTAL DEFERRED</div><div class="kpi-value text-purple">${gbp(summary.totalDeferred)}</div></div>
      <div class="kpi-card"><div class="kpi-label">ACTIVE CONTRACTS</div><div class="kpi-value">${records.filter(r=>r.status==='ACTIVE').length}</div></div>
    </div>
    <div class="section-header" style="margin-bottom:12px">
      <div></div>
      <button class="btn btn-primary" onclick="runPeriodClose()">Run Period Close</button>
    </div>
    <div class="panel">
      <table class="data-table"><thead><tr>
        <th>RR ID</th><th>Customer</th><th>Product</th><th>Months</th><th>Contract Value</th><th>Recognised</th><th>Deferred</th><th>Period</th><th>Status</th>
      </tr></thead><tbody>
        ${records.map(r=>`<tr>
          <td>${r.rrId}</td>
          <td>${r.customer?.name||'—'}</td>
          <td>${r.productName||'—'}</td>
          <td>${r.contractMonths}</td>
          <td>${gbp(r.contractValueGbp)}</td>
          <td class="text-success">${gbp(r.recognisedGbp)}</td>
          <td class="text-purple">${gbp(r.deferredGbp)}</td>
          <td>${r.period||'—'}</td>
          <td>${badge(r.status)}</td>
        </tr>`).join('')}
      </tbody></table>
    </div>`;
});

window.runPeriodClose = async function() {
  try {
    const res = await api.post('/api/revenue/period-close', {});
    toast('success', 'Period close complete', `Deferred: ${gbp(res.totalDeferred)} | Recognised: ${gbp(res.totalRecognised)}`);
    Router.go('revenue');
  } catch(e) { toast('error', 'Period close failed', ''); }
};

// ═══════════════════════════════════════════════════════════════
// MODULE 12 — BPM Processes (bpmn-js viewer + Camunda API)
// ═══════════════════════════════════════════════════════════════
Router.reg('processes', async (el) => {
  let instances = [];
  try { instances = await api.get('/engine-rest/process-instance?maxResults=20'); } catch(_) {}
  let historic  = [];
  try { historic  = await api.get('/engine-rest/history/process-instance?maxResults=20&sortBy=startTime&sortOrder=desc'); } catch(_) {}

  el.innerHTML = `
    <h2>BPM Process Instances — Camunda 7</h2>
    <div class="tab-bar">
      <button class="tab active" onclick="showTab('proc-live',this)">Live Instances (${instances.length})</button>
      <button class="tab" onclick="showTab('proc-history',this)">History (${historic.length})</button>
      <button class="tab" onclick="showTab('proc-diagrams',this)">Process Diagrams</button>
    </div>

    <div id="proc-live">
      <div class="panel">
        <table class="data-table"><thead><tr>
          <th>Instance ID</th><th>Process</th><th>Business Key</th><th>Started</th><th>Actions</th>
        </tr></thead><tbody>
          ${instances.length ? instances.map(i=>`<tr>
            <td><code>${i.id?.slice(0,12)}…</code></td>
            <td>${i.processDefinitionId?.split(':')[0]||'—'}</td>
            <td>${i.businessKey||'—'}</td>
            <td>${fmt(i.started)}</td>
            <td><a href="/camunda/app/cockpit/default/#/process-instance/${i.id}" target="_blank" class="btn btn-sm">View in Cockpit</a></td>
          </tr>`).join('') : '<tr><td colspan="5" class="text-center">No live instances — create an order to start a process</td></tr>'}
        </tbody></table>
      </div>
    </div>

    <div id="proc-history" style="display:none">
      <div class="panel">
        <table class="data-table"><thead><tr>
          <th>Instance ID</th><th>Process</th><th>Business Key</th><th>State</th><th>Started</th><th>Ended</th>
        </tr></thead><tbody>
          ${historic.length ? historic.map(i=>`<tr>
            <td><code>${i.id?.slice(0,12)}…</code></td>
            <td>${i.processDefinitionKey||'—'}</td>
            <td>${i.businessKey||'—'}</td>
            <td>${badge(i.state)}</td>
            <td>${fmt(i.startTime)}</td>
            <td>${fmt(i.endTime)||'<em>Running</em>'}</td>
          </tr>`).join('') : '<tr><td colspan="6" class="text-center">No history yet</td></tr>'}
        </tbody></table>
      </div>
    </div>

    <div id="proc-diagrams" style="display:none">
      <div class="proc-diagram-selector">
        <button class="btn" onclick="loadDiagram('proc_o2c')">O2C Main Process</button>
        <button class="btn" onclick="loadDiagram('proc_dunning')">Collections &amp; Dunning</button>
        <button class="btn" onclick="loadDiagram('proc_dispute')">Dispute Resolution</button>
      </div>
      <div id="bpmn-container" class="bpmn-container">
        <p style="text-align:center;color:var(--text-secondary);padding-top:60px">Select a process diagram above</p>
      </div>
    </div>

    <div style="margin-top:16px;padding:12px;background:var(--bg-card);border-radius:8px;border:1px solid var(--border)">
      <strong>Camunda Web Apps:</strong>
      <a href="/camunda/app/cockpit" target="_blank" class="btn btn-sm" style="margin-left:8px">Cockpit</a>
      <a href="/camunda/app/tasklist" target="_blank" class="btn btn-sm">Tasklist</a>
      <a href="/camunda/app/admin" target="_blank" class="btn btn-sm">Admin</a>
      <span style="margin-left:12px;color:var(--text-secondary);font-size:12px">Login: admin / admin</span>
    </div>`;
});

window.loadDiagram = async function(processKey) {
  const container = document.getElementById('bpmn-container');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">Loading diagram…</div>';

  try {
    // Fetch BPMN XML from Camunda REST API
    const defs = await api.get(`/engine-rest/process-definition?key=${processKey}&latestVersion=true`);
    if (!defs || !defs.length) throw new Error('Process not deployed yet');
    const defId = defs[0].id;
    const xmlRes = await fetch(`/engine-rest/process-definition/${defId}/xml`);
    const xmlData = await xmlRes.json();

    container.innerHTML = '';
    const viewer = new BpmnJS({ container });
    await viewer.importXML(xmlData.bpmn20Xml);
    const canvas = viewer.get('canvas');
    canvas.zoom('fit-viewport');

    // Highlight active nodes
    try {
      const active = await api.get(`/engine-rest/activity-instance?processDefinitionKey=${processKey}`);
      const overlays = viewer.get('overlays');
      (active || []).forEach(a => {
        overlays.add(a.activityId, { position:{ top:0, left:0 },
          html:'<div style="background:#22c55e33;border:2px solid #22c55e;border-radius:4px;width:100%;height:100%"></div>'
        });
      });
    } catch(_) {}
  } catch(e) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-secondary)">
      ${e.message}<br/><small>Deploy the app and create an order to see live diagrams.</small>
    </div>`;
  }
};

// ─── Tab helper ──────────────────────────────────────────────────
window.showTab = function(id, btn) {
  const parent = btn.closest('.main-content') || document.getElementById('mainContent');
  parent.querySelectorAll('[id]').forEach(el => {
    if (el.classList.contains('tab-bar') || el.classList.contains('section-header')) return;
    // hide sibling tab panels (those that are direct div children with an id)
  });
  // Simple approach: hide all siblings of the same level that are tab panels
  const tabPanels = btn.closest('.tab-bar').parentElement.querySelectorAll(':scope > div[id]');
  tabPanels.forEach(p => p.style.display = 'none');
  const target = document.getElementById(id);
  if (target) target.style.display = '';
  btn.closest('.tab-bar').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
};

// ─── Boot ────────────────────────────────────────────────────────
Router.go('dashboard');
