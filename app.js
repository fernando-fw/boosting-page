// CONFIGURACIÓN DE APIS (Introduce tus credenciales de EmailJS de producción cuando las tengas)
const EMAILJS_SERVICES = {
  SERVICE_ID: "YOUR_SERVICE_ID",
  TEMPLATE_ORDER_ID: "YOUR_TEMPLATE_ORDER_ID",
  PUBLIC_KEY: "YOUR_PUBLIC_KEY"
};

// TABLA DE PRECIOS COMPETITIVOS (Estrategia de conversión rápida)
const SERVICES_DATA = [
  { id: "cobre-bronce", name: "Cobre ➔ Bronce", prices: { MXN: 130, USD: 8 }, time: "1-2 Días", color: "#cd7f32", tag: "Económico" },
  { id: "bronce-plata", name: "Bronce ➔ Plata", prices: { MXN: 180, USD: 11 }, time: "1-2 Días", color: "#a8b2c0", tag: "Rápido" },
  { id: "plata-oro", name: "Plata ➔ Oro", prices: { MXN: 250, USD: 15 }, time: "2 Días", color: "#ffd700", tag: "Más Vendido" },
  { id: "oro-platino", name: "Oro ➔ Platino", prices: { MXN: 380, USD: 22 }, time: "2-3 Días", color: "#6ec6e8", tag: "Alta Demanda" },
  { id: "platino-esmeralda", name: "Platino ➔ Esmeralda", prices: { MXN: 550, USD: 32 }, time: "3-4 Días", color: "#00d68f", tag: "Elite Tier" }
];

// CIBERSEGURIDAD: Tus cupones registrados mediante hashes (Firmas ilegibles para protección en el frontend)
const SECURE_COUPONS = {
  "9222c349": 0.20, // fsharkf (20%)
  "063b4823": 0.20, // Oscar (20%)
  "93ec4610": 0.20, // puubaa (20%)
  "17ee55db": 0.15  // Dominican (15%)
};

let selectedCurrency = 'MXN';
let activeServiceId = null;
let currentDiscountPercentage = 0.0;

function init() {
  if(typeof emailjs !== 'undefined' && EMAILJS_SERVICES.PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
    emailjs.init(EMAILJS_SERVICES.PUBLIC_KEY);
  }
  renderCatalogAndOptions();
  if (window.initializeReviewsModule) window.initializeReviewsModule();
}

// Renderizador dinámico del catálogo táctico
function renderCatalogAndOptions() {
  const container = document.getElementById('catalog-container');
  const selectDropdown = document.getElementById('f-service');
  if(!container || !selectDropdown) return;
  
  container.innerHTML = "";
  selectDropdown.innerHTML = '<option value="" disabled selected>-- Elige un rango en el catálogo --</option>';

  SERVICES_DATA.forEach(svc => {
    const price = svc.prices[selectedCurrency];
    const sym = selectedCurrency === 'MXN' ? 'MXN $' : 'USD $';
    
    // Generar tarjeta visual
    const card = document.createElement('div');
    card.className = `service-card ${activeServiceId === svc.id ? 'active' : ''}`;
    card.style.setProperty('--rank-color', svc.color);
    card.setAttribute('onclick', `selectServiceItem('${svc.id}')`);
    card.innerHTML = `
      <div class="service-info">
        <div class="service-route">${svc.name.split('➔')[0]} <span>➔</span> <div style="display:inline; color:${svc.color}">${svc.name.split('➔')[1]}</div></div>
        <div class="service-meta">
          <span class="time-tag">⏱ ${svc.time}</span>
          ${svc.tag ? `<span class="popular-badge">${svc.tag}</span>` : ''}
        </div>
      </div>
      <div class="card-price">${sym}${price.toFixed(2)}</div>
    `;
    container.appendChild(card);

    // Sincronizar el select invisible
    const option = document.createElement('option');
    option.value = svc.id;
    option.textContent = `${svc.name} (${sym}${price.toFixed(2)})`;
    if(activeServiceId === svc.id) option.selected = true;
    selectDropdown.appendChild(option);
  });
}

function setCurrency(curr) {
  selectedCurrency = curr;
  document.getElementById('btn-mxn').classList.toggle('active', curr === 'MXN');
  document.getElementById('btn-usd').classList.toggle('active', curr === 'USD');
  renderCatalogAndOptions();
  calculateFinalCheckoutPrice();
}

function selectServiceItem(id) {
  activeServiceId = id;
  renderCatalogAndOptions();
  calculateFinalCheckoutPrice();
}

function syncSelectionFromDropdown(val) {
  activeServiceId = val;
  renderCatalogAndOptions();
  calculateFinalCheckoutPrice();
}

// Algoritmo de hash ligero para verificar cupones sin exponerlos en código plano
function calculateLightHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

function validateCouponCode() {
  const rawInput = document.getElementById('f-coupon').value.trim(); // Respeta mayúsculas/minúsculas según el cupón
  const inputHash = calculateLightHash(rawInput);
  
  if (SECURE_COUPONS[inputHash] !== undefined) {
    currentDiscountPercentage = SECURE_COUPONS[inputHash];
    showFeedbackMessage(`✅ ¡Cupón válido! Se aplicó un ${currentDiscountPercentage * 100}% de descuento.`, 'success', 'status-message-box');
  } else {
    currentDiscountPercentage = 0.0;
    showFeedbackMessage('❌ Cupón inválido o expirado.', 'error', 'status-message-box');
  }
  calculateFinalCheckoutPrice();
}

function calculateFinalCheckoutPrice() {
  const baseEl = document.getElementById('summary-base');
  const discEl = document.getElementById('summary-discount');
  const totalEl = document.getElementById('summary-total');
  const label = selectedCurrency;

  if (!activeServiceId) {
    baseEl.textContent = `$0.00 ${label}`;
    discEl.textContent = `0%`;
    totalEl.textContent = `$0.00 ${label}`;
    return;
  }

  const product = SERVICES_DATA.find(s => s.id === activeServiceId);
  const basePrice = product.prices[selectedCurrency];
  const finalPrice = basePrice * (1 - currentDiscountPercentage);

  baseEl.textContent = `$${basePrice.toFixed(2)} ${label}`;
  discEl.textContent = `${currentDiscountPercentage * 100}%`;
  
  if (currentDiscountPercentage > 0) {
    totalEl.innerHTML = `<span class="old-price">$${basePrice.toFixed(2)}</span> <span class="final-price">$${finalPrice.toFixed(2)} ${label}</span>`;
  } else {
    totalEl.innerHTML = `<span class="final-price">$${finalPrice.toFixed(2)} ${label}</span>`;
  }
}

function showFeedbackMessage(msg, type, elementId) {
  const box = document.getElementById(elementId);
  if(!box) return;
  box.textContent = msg;
  box.className = `status-msg ${type}`;
  box.style.display = 'block';
  setTimeout(() => { box.style.display = 'none'; }, 6000);
}

document.addEventListener('DOMContentLoaded', init);
