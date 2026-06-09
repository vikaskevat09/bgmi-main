/* Checkout page: customer details + manual UPI payment.
 *
 * Flow:
 *   1. Browser POSTs the cart + customer info to  /api/create-order
 *   2. Backend recomputes the amount from the catalog (never trusts the client)
 *      and returns the order id + UPI details (UPI ID + upi:// deep link).
 *   3. A payment modal shows a UPI QR (+ download), a copyable UPI ID and a timer.
 *   4. After paying, the customer uploads a payment screenshot → /api/submit-payment
 *   5. Admin reviews the proof and approves with a delivery code, which is shown
 *      on the customer's order page and sent to their email/phone.
 */
(function () {
  const C = window.CATALOG;
  const root = document.getElementById('checkoutContent');

  // Point this at your backend. Defaults to same origin.
  const API_BASE = window.TUZ_API_BASE || '';

  const items = window.Cart.items();
  if (!items.length) {
    root.innerHTML = `<div class="empty-state"><div class="es-emoji">🛒</div>
      <h2>Nothing to check out</h2><p>Your cart is empty.</p>
      <a class="btn btn-primary btn-lg" href="/#games">Browse games</a></div>`;
    return;
  }

  const t = window.Cart.totals();

  root.innerHTML = `
    <div class="checkout-grid">
      <div>
        <div class="panel co-section">
          <div class="panel-title"><span class="step-badge">1</span> Contact details</div>
          <div class="co-fields">
            <div class="field"><label for="cName">Full name</label><input id="cName" type="text" placeholder="Your name" /></div>
            <div class="field"><label for="cPhone">Phone</label><input id="cPhone" type="tel" placeholder="10-digit mobile" inputmode="numeric" /></div>
            <div class="field full"><label for="cEmail">Email</label><input id="cEmail" type="email" placeholder="you@example.com" /></div>
          </div>
          <p class="field-hint">We'll send your order confirmation here.</p>
        </div>

        <div class="panel co-section">
          <div class="panel-title"><span class="step-badge">2</span> Delivery</div>
          <div class="deliver-rows">
            ${items.map(it => `
              <div class="deliver-row">
                ${window.coverHTML(it.game.id, '')}
                <div>
                  <div class="mi-name">${it.game.name}</div>
                  <div class="mi-sub">${window.currencyIconHTML(it.game.id)}${it.denom.label} × ${it.qty}</div>
                </div>
                <div class="deliver-id">
                  <span>${it.game.idLabel || 'ID'}</span>
                  <strong>${it.playerId || '—'}${it.serverId ? ' (' + it.serverId + ')' : ''}</strong>
                  ${it.username ? `<em>${it.username}</em>` : ''}
                </div>
              </div>`).join('')}
          </div>
          <p class="field-hint">⚡ Currency is delivered to these IDs instantly after payment.</p>
        </div>
      </div>

      <aside class="summary-card">
        <h3>Order summary</h3>
        <div class="mini-items">
          ${items.map(it => `
            <div class="mini-item">
              ${window.coverHTML(it.game.id, '')}
              <div>
                <div class="mi-name">${it.game.name}</div>
                <div class="mi-sub">${window.currencyIconHTML(it.game.id)}${it.denom.label} × ${it.qty} • ID ${it.playerId || '—'}${it.username ? ' (' + it.username + ')' : ''}</div>
              </div>
              <div class="mi-price">${window.inr(it.lineTotal)}</div>
            </div>`).join('')}
        </div>
        <div class="coupon-box">
          <div class="coupon-row">
            <input id="couponInput" type="text" placeholder="Coupon code (e.g. NEWUSER)" autocomplete="off" />
            <button class="btn btn-dark btn-sm" id="couponBtn" type="button">Apply</button>
          </div>
          <p class="coupon-msg" id="couponMsg">Have a coupon code? Enter it above to get your discount.</p>
        </div>
        <div class="summary-line"><span>Subtotal</span><strong id="sumSubtotal">${window.inr(t.subtotal)}</strong></div>
        <div class="summary-line" id="sumDiscountRow" style="display:none"><span>Discount</span><strong id="sumDiscount" style="color:#34c759">-₹0</strong></div>
        <div class="summary-line"><span>Processing fee (2%)</span><strong id="sumFee">${window.inr(t.fee)}</strong></div>
        <div class="summary-line total"><span>Total payable</span><strong id="sumTotal">${window.inr(t.total)}</strong></div>
        <button class="btn btn-primary btn-block btn-lg" id="payBtn" style="margin-top:1rem">Pay ${window.inr(t.total)} with UPI</button>
        <a class="btn btn-ghost btn-block" href="/cart" style="margin-top:.6rem">Back to cart</a>
        <div class="pay-badges">
          <span>UPI</span><span>Google Pay</span><span>PhonePe</span><span>Paytm</span><span>BHIM</span>
        </div>
        <div class="secure-note">🔒 Pay securely via UPI — scan the QR or use your UPI app</div>
      </aside>
    </div>`;

  // ----- Coupon handling -----
  // The preview discount is computed in the browser so it works instantly (and
  // even without the backend running locally). At payment time the server
  // recomputes the price from the same SKUs + coupon, so it stays authoritative.
  let appliedCoupon = null;
  let totals = { subtotal: t.subtotal, fee: t.fee, total: t.total, discount: 0 };

  const FEE_RATE = 0.02; // 2% processing — mirrors cart.js / server

  // Admin-created coupons come from /api/config (window.SiteConfig.coupons) and
  // apply to the WHOLE cart — every pack and voucher.
  function findCoupon(code) {
    const c = String(code || '').trim().toUpperCase();
    const list = (window.SiteConfig && window.SiteConfig.coupons) || [];
    return list.find(x => x && x.active !== false && String(x.code).toUpperCase() === c) || null;
  }

  function computeCoupon(code) {
    const list = window.Cart.items();
    const subtotal = list.reduce((s, it) => s + it.lineTotal, 0);
    const c = findCoupon(code);
    if (!c) return { ok: false, subtotal, discount: 0, message: 'Invalid coupon code.' };
    const discount = c.type === 'flat'
      ? Math.min(Math.round(c.value), subtotal)
      : Math.round(subtotal * c.value / 100);
    if (discount <= 0) return { ok: false, subtotal, discount: 0, message: 'Coupon not applicable.' };
    const discounted = Math.max(0, subtotal - discount);
    const fee = discounted > 0 ? Math.round(discounted * FEE_RATE) : 0;
    const label = c.type === 'flat' ? `₹${c.value} off` : `${c.value}% off`;
    return { ok: true, code: String(c.code).toUpperCase(), subtotal, discount, fee,
      total: discounted + fee, message: label };
  }

  function paymentItems() {
    return window.Cart.items().map(it => ({
      sku: it.sku, qty: it.qty, playerId: it.playerId, serverId: it.serverId, username: it.username,
    }));
  }

  function renderTotals() {
    document.getElementById('sumSubtotal').textContent = window.inr(totals.subtotal);
    document.getElementById('sumFee').textContent = window.inr(totals.fee);
    document.getElementById('sumTotal').textContent = window.inr(totals.total);
    const dRow = document.getElementById('sumDiscountRow');
    if (totals.discount > 0) {
      dRow.style.display = '';
      document.getElementById('sumDiscount').textContent = '-' + window.inr(totals.discount);
    } else {
      dRow.style.display = 'none';
    }
    const btn = document.getElementById('payBtn');
    if (!btn.disabled) btn.textContent = 'Pay ' + window.inr(totals.total) + ' with UPI';
  }

  const couponBox = () => document.querySelector('.coupon-box');

  function applyCoupon() {
    const input = document.getElementById('couponInput');
    const msg = document.getElementById('couponMsg');
    const code = input.value.trim();
    if (!code) { window.toast('⚠️ Enter a coupon code.', 'err'); input.focus(); return; }

    const r = computeCoupon(code);
    if (r.ok) {
      appliedCoupon = r.code;
      totals = { subtotal: r.subtotal, fee: r.fee, total: r.total, discount: r.discount };
      msg.innerHTML = `<strong>${r.code}</strong> applied — you saved ${window.inr(r.discount)} 🎉`;
      msg.className = 'coupon-msg ok';
      couponBox().classList.add('applied');
      document.getElementById('couponBtn').textContent = 'Remove';
      renderTotals();
      window.toast('✅ Coupon applied — saved ' + window.inr(r.discount), 'ok');
    } else {
      appliedCoupon = null;
      totals = { subtotal: t.subtotal, fee: t.fee, total: t.total, discount: 0 };
      msg.textContent = r.message;
      msg.className = 'coupon-msg err';
      couponBox().classList.remove('applied');
      document.getElementById('couponBtn').textContent = 'Apply';
      renderTotals();
      window.toast('⚠️ ' + r.message, 'err');
    }
  }

  function clearCoupon() {
    appliedCoupon = null;
    totals = { subtotal: t.subtotal, fee: t.fee, total: t.total, discount: 0 };
    const input = document.getElementById('couponInput');
    const msg = document.getElementById('couponMsg');
    input.value = '';
    msg.innerHTML = 'Have a coupon code? Enter it above to get your discount.';
    msg.className = 'coupon-msg';
    couponBox().classList.remove('applied');
    document.getElementById('couponBtn').textContent = 'Apply';
    renderTotals();
    input.focus();
  }

  document.getElementById('couponBtn').addEventListener('click', () => {
    if (couponBox().classList.contains('applied')) clearCoupon();
    else applyCoupon();
  });
  document.getElementById('couponInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } });

  function validate() {
    const name = document.getElementById('cName').value.trim();
    const phone = document.getElementById('cPhone').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    if (!name) return err('Please enter your name.');
    if (!/^\d{10}$/.test(phone)) return err('Enter a valid 10-digit phone number.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err('Enter a valid email address.');
    return { name, phone, email };
  }
  function err(m) { window.toast('⚠️ ' + m, 'err'); return null; }

  // Prefill contact details for logged-in users.
  (async function prefill() {
    const user = window.Auth ? await window.Auth.me() : null;
    if (user) {
      const n = document.getElementById('cName'); if (n && !n.value) n.value = user.name || '';
      const e = document.getElementById('cEmail'); if (e && !e.value) e.value = user.email || '';
    }
  })();

  document.getElementById('payBtn').addEventListener('click', startPayment);

  // UPI fallback if the backend isn't reachable (e.g. local static preview).
  const UPI_FALLBACK = { upiId: 'topupworld@airtel', upiName: 'TopUpWorld' };

  function buildUpiUri(pa, pn, amount, tn) {
    const p = new URLSearchParams({ pa, pn, am: Number(amount).toFixed(2), cu: 'INR', tn: 'Order ' + tn });
    return 'upi://pay?' + p.toString();
  }

  async function startPayment() {
    const customer = validate();
    if (!customer) return;

    const btn = document.getElementById('payBtn');
    btn.disabled = true;
    btn.textContent = 'Preparing your UPI payment…';

    const payload = {
      customer,
      coupon: appliedCoupon || undefined,
      items: window.Cart.items().map(it => ({
        sku: it.sku, qty: it.qty, playerId: it.playerId, serverId: it.serverId, username: it.username,
      })),
    };

    let order;
    try {
      const res = await fetch(API_BASE + '/api/create-order', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order creation failed (' + res.status + ')');
      order = data;
    } catch (e) {
      // Backend unreachable → still let the customer pay via UPI (proof upload needs the server).
      console.warn('create-order failed, using local UPI fallback:', e.message);
      const localId = 'TUW' + Date.now().toString(36).toUpperCase();
      order = {
        orderId: localId, amount: totals.total, offline: true,
        upiId: UPI_FALLBACK.upiId, upiName: UPI_FALLBACK.upiName,
        upiUri: buildUpiUri(UPI_FALLBACK.upiId, UPI_FALLBACK.upiName, totals.total, localId),
      };
    }

    btn.disabled = false;
    btn.textContent = 'Pay ' + window.inr(totals.total) + ' with UPI';

    // Save the player IDs for signed-in users so they're remembered next time.
    if (window.Auth && window.Auth.user) {
      window.Cart.items().forEach(it => {
        window.Auth.saveId({ game: it.game.id, playerId: it.playerId, serverId: it.serverId, username: it.username });
      });
    }

    openPaymentModal(order, customer);
  }

  /* ============================================================
     UPI payment modal — QR, copy, timer, then screenshot upload
     ============================================================ */
  let payTimer = null;

  function openPaymentModal(order, customer) {
    closePaymentModal();
    const amt = window.inr(order.amount);
    const qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data='
      + encodeURIComponent(order.upiUri);

    const wrap = document.createElement('div');
    wrap.className = 'pay-modal';
    wrap.id = 'payModal';
    wrap.innerHTML = `
      <div class="pay-card" role="dialog" aria-modal="true" aria-label="UPI payment">
        <button class="pay-close" id="payClose" aria-label="Close">✕</button>

        <div class="pay-step" id="payStepPay">
          <div class="pay-head">
            <span class="pay-badge-upi">⚡ UPI Payment</span>
            <h2>Pay ${amt}</h2>
            <p>Scan the QR with any UPI app, or pay to our UPI ID below.</p>
          </div>

          <div class="pay-timer" id="payTimer">⏱️ Complete within <strong>10:00</strong></div>

          <div class="qr-card">
            <div class="qr-card-top">Scan &amp; Pay</div>
            <div class="qr-box">
              <div id="qrBox" class="qr-canvas"></div>
              <div class="qr-fallback" id="qrFallback" style="display:none">QR couldn't load — use the UPI ID below 👇</div>
            </div>
            <div class="qr-apps" aria-hidden="true"><span>GPay</span><span>PhonePe</span><span>Paytm</span><span>BHIM</span></div>
            <div class="qr-actions">
              <button class="btn btn-ghost btn-sm" id="qrDownload">⬇ Save QR</button>
              <a class="btn btn-ghost btn-sm pay-open-app" href="${order.upiUri}">Open UPI app</a>
            </div>
          </div>

          <div class="pay-or"><span>or pay to UPI ID</span></div>

          <div class="upi-id-row">
            <div class="upi-id-meta">
              <span class="upi-id-label">UPI ID</span>
              <strong id="upiIdText">${order.upiId}</strong>
            </div>
            <button class="btn btn-dark btn-sm" id="copyUpi" type="button">Copy</button>
          </div>

          <div class="pay-summary">
            <div class="pay-amt-row"><span>Amount to pay</span><strong>${amt}</strong></div>
            <div class="pay-order-row"><span>Order ID</span><code>${order.orderId}</code></div>
          </div>

          <p class="pay-note">⚠️ Pay the <strong>exact amount</strong>. After paying, take a screenshot of the success page — you'll upload it on the next step.</p>

          <button class="btn btn-primary btn-block btn-lg" id="paidBtn">I've paid — upload screenshot</button>
        </div>

        <div class="pay-step" id="payStepProof" style="display:none">
          <div class="pay-head">
            <h2>Upload payment screenshot</h2>
            <p>We'll verify it and send your code to <strong>${customer.email}</strong> / <strong>${customer.phone}</strong>.</p>
          </div>

          <label class="proof-drop" id="proofDrop">
            <input type="file" id="proofFile" accept="image/png,image/jpeg,image/webp" hidden />
            <div class="proof-empty" id="proofEmpty">
              <div class="proof-ic">📷</div>
              <strong>Tap to choose your payment screenshot</strong>
              <span>PNG / JPG / WEBP · max 6MB</span>
            </div>
            <img id="proofPreview" class="proof-preview" alt="Payment screenshot preview" style="display:none" />
          </label>

          <div class="field" style="margin-top:.9rem">
            <label for="utrInput">UPI reference / UTR <span class="opt">(optional)</span></label>
            <input id="utrInput" type="text" placeholder="12-digit reference from your UPI app" inputmode="numeric" />
          </div>

          <button class="btn btn-primary btn-block btn-lg" id="submitProof" style="margin-top:.4rem">Submit for verification</button>
          <button class="btn btn-ghost btn-block" id="backToQr" style="margin-top:.5rem">← Back to QR</button>
        </div>

        <div class="pay-step" id="payStepDone" style="display:none">
          <div class="pay-done">
            <div class="pay-done-ic">🎉</div>
            <h2>Payment submitted!</h2>
            <p>Order <strong>${order.orderId}</strong> is now being verified. Once approved, your
              code/top-up will be sent to <strong>${customer.email}</strong> and <strong>${customer.phone}</strong>.</p>
            <p class="pay-note">This usually takes a few minutes. You can track it on your order page.</p>
            <a class="btn btn-primary btn-block btn-lg" id="trackOrder" href="/return?order_id=${encodeURIComponent(order.orderId)}">Track my order</a>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    document.body.style.overflow = 'hidden';

    const $$ = id => wrap.querySelector('#' + id);

    // Render the QR instantly client-side; fall back to an image API only if the lib is missing.
    (function renderQR() {
      const box = $$('qrBox');
      if (window.QRCode) {
        try {
          new QRCode(box, {
            text: order.upiUri, width: 240, height: 240,
            colorDark: '#000000', colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M,
          });
          return;
        } catch (e) { /* fall through to image */ }
      }
      const img = document.createElement('img');
      img.className = 'qr-img'; img.width = 240; img.height = 240; img.alt = 'UPI QR code';
      img.src = qrSrc;
      img.addEventListener('error', () => { box.style.display = 'none'; $$('qrFallback').style.display = 'block'; });
      box.appendChild(img);
    })();

    // Countdown timer (10 min)
    let left = 10 * 60;
    const timerEl = $$('payTimer');
    clearInterval(payTimer);
    payTimer = setInterval(() => {
      left--;
      const m = Math.floor(left / 60), s = left % 60;
      timerEl.innerHTML = '⏱️ Complete payment within <strong>' + m + ':' + String(s).padStart(2, '0') + '</strong>';
      if (left <= 0) {
        clearInterval(payTimer);
        timerEl.innerHTML = '⌛ Session expired — you can still upload your screenshot if you paid.';
        timerEl.classList.add('expired');
      }
    }, 1000);

    // Copy UPI id
    $$('copyUpi').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(order.upiId); window.toast('✅ UPI ID copied', 'ok'); }
      catch { window.toast('Copy failed — long-press to copy.', 'err'); }
    });

    // Download QR as PNG (from the rendered canvas; falls back to the image API)
    $$('qrDownload').addEventListener('click', async () => {
      const box = $$('qrBox');
      const canvas = box.querySelector('canvas');
      const imgEl = box.querySelector('img');
      let dataUrl = null;
      if (canvas) { try { dataUrl = canvas.toDataURL('image/png'); } catch {} }
      if (!dataUrl && imgEl && /^data:/.test(imgEl.src)) dataUrl = imgEl.src;
      try {
        const a = document.createElement('a');
        if (dataUrl) {
          a.href = dataUrl;
        } else {
          const r = await fetch(qrSrc);
          a.href = URL.createObjectURL(await r.blob());
        }
        a.download = 'TopUpWorld-UPI-' + order.orderId + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        if (a.href.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      } catch { window.toast('⚠️ Could not download QR.', 'err'); }
    });

    // Step navigation
    $$('paidBtn').addEventListener('click', () => {
      $$('payStepPay').style.display = 'none';
      $$('payStepProof').style.display = '';
    });
    $$('backToQr').addEventListener('click', () => {
      $$('payStepProof').style.display = 'none';
      $$('payStepPay').style.display = '';
    });

    // Screenshot picker + preview
    let proofDataUrl = null;
    $$('proofFile').addEventListener('change', () => {
      const file = $$('proofFile').files[0];
      if (!file) return;
      if (file.size > 6 * 1024 * 1024) { window.toast('⚠️ Image too large (max 6MB).', 'err'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        proofDataUrl = reader.result;
        $$('proofPreview').src = proofDataUrl;
        $$('proofPreview').style.display = 'block';
        $$('proofEmpty').style.display = 'none';
      };
      reader.readAsDataURL(file);
    });

    // Submit proof
    $$('submitProof').addEventListener('click', async () => {
      if (!proofDataUrl) { window.toast('⚠️ Please attach your payment screenshot.', 'err'); return; }
      const sBtn = $$('submitProof');
      sBtn.disabled = true; sBtn.textContent = 'Submitting…';
      try {
        const res = await fetch(API_BASE + '/api/submit-payment', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.orderId, screenshot: proofDataUrl, utr: $$('utrInput').value.trim() }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not submit payment.');
        finishSubmit();
      } catch (e) {
        if (order.offline || /Failed to fetch|NetworkError/i.test(e.message)) {
          // No backend (local preview): acknowledge so the flow is testable.
          window.toast('Saved locally — start the server to enable admin approval.', 'err');
          finishSubmit();
        } else {
          sBtn.disabled = false; sBtn.textContent = 'Submit for verification';
          window.toast('⚠️ ' + e.message, 'err');
        }
      }
    });

    function finishSubmit() {
      clearInterval(payTimer);
      window.Cart.clear();
      $$('payStepProof').style.display = 'none';
      $$('payStepDone').style.display = '';
      window.toast('✅ Payment submitted for verification', 'ok');
    }

    $$('payClose').addEventListener('click', closePaymentModal);
    wrap.addEventListener('click', e => { if (e.target === wrap) closePaymentModal(); });
  }

  function closePaymentModal() {
    clearInterval(payTimer);
    const m = document.getElementById('payModal');
    if (m) m.remove();
    document.body.style.overflow = '';
  }
})();
