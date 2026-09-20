const loginPanel = document.getElementById('admin-login');
const dashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('admin-login-form');
const loginMessage = document.getElementById('admin-login-message');
const addPlanForm = document.getElementById('admin-add-plan-form');
const addPlanMessage = document.getElementById('admin-add-message');

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[character]));
}

function showDashboard(summary) {
    loginPanel.hidden = true;
    dashboard.hidden = false;
    const paidOrders = summary.orders.filter(order => order.status === 'paid').length;
    document.getElementById('admin-stats').innerHTML = `
        <div><strong>${summary.plans.length}</strong><span>Plans</span></div>
        <div><strong>${summary.orders.length}</strong><span>Orders</span></div>
        <div><strong>${paidOrders}</strong><span>Paid orders</span></div>
        <div><strong>${summary.contacts}</strong><span>Enquiries</span></div>
    `;
    document.getElementById('admin-plans').innerHTML = `
        <thead><tr><th>Plan</th><th>Category</th><th>Price</th><th>Action</th><th>PDF</th></tr></thead>
        <tbody>${summary.plans.map(plan => `<tr><td>${escapeHtml(plan.name)}</td><td>${escapeHtml(plan.category)}</td><td><input class="admin-price-input" data-plan-id="${escapeHtml(plan.id)}" type="number" min="0" step="1" value="${escapeHtml(plan.price)}"></td><td><button class="admin-save-price" data-plan-id="${escapeHtml(plan.id)}" type="button">Save</button></td><td>${escapeHtml(plan.pdf)}</td></tr>`).join('')}</tbody>
    `;
    document.querySelectorAll('.admin-save-price').forEach(button => {
        button.addEventListener('click', async () => {
            const planId = button.dataset.planId;
            const input = document.querySelector(`.admin-price-input[data-plan-id="${planId}"]`);
            const response = await fetch(`/api/admin/plans/${planId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: input.value })
            });
            button.textContent = response.ok ? 'Saved' : 'Retry';
            if (response.ok) setTimeout(() => { button.textContent = 'Save'; }, 1200);
        });
    });
    document.getElementById('admin-orders').innerHTML = summary.orders.length ? `
        <thead><tr><th>Order</th><th>Plan</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${summary.orders.map(order => `<tr><td>${escapeHtml(order.orderId)}</td><td>${escapeHtml(order.planName)}</td><td>KSh ${Number(order.amount).toLocaleString()}</td><td>${escapeHtml(order.status)}</td><td>${escapeHtml(new Date(order.createdAt).toLocaleString())}</td></tr>`).join('')}</tbody>
    ` : '<tbody><tr><td>No orders yet.</td></tr></tbody>';
}

async function loadSummary() {
    const response = await fetch('/api/admin/summary');
    if (!response.ok) throw new Error('Admin login required');
    showDashboard(await response.json());
}

loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    loginMessage.textContent = '';
    const data = Object.fromEntries(new FormData(loginForm));
    const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) {
        loginMessage.textContent = result.error || 'Login failed.';
        return;
    }
    await loadSummary();
});

document.getElementById('admin-logout').addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    dashboard.hidden = true;
    loginPanel.hidden = false;
    loginForm.reset();
});

addPlanForm.addEventListener('submit', async event => {
    event.preventDefault();
    addPlanMessage.textContent = 'Uploading plan...';
    const response = await fetch('/api/admin/plans', { method: 'POST', body: new FormData(addPlanForm) });
    const result = await response.json();
    if (!response.ok) {
        addPlanMessage.textContent = result.error || 'Could not add plan.';
        return;
    }
    addPlanForm.reset();
    addPlanMessage.textContent = `${result.name} added successfully.`;
    await loadSummary();
});

loadSummary().catch(() => {});
