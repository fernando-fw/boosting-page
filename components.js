// CONFIGURACIÓN DE CONTACTO DIRECTO (Cambia por tu número de teléfono real)
const TECH_SUPPORT_CONFIG = {
  WHATSAPP_NUMBER: "525500000000", // Código de país + número completo (sin espacios ni signos +)
  EMAILJS_TEMPLATE_CONTACT_ID: "YOUR_TEMPLATE_CONTACT_ID"
};

// BANCO DE DATOS DE RESEÑAS INICIALES (Social Proof Adaptativo)
let communityReviews = [
  { name: "XaviR6_", stars: 5, text: "Súper rápido el servicio, entregaron la cuenta en Platino 3 en menos de dos días y con excelentes stats. Recomendadísimo.", verified: true },
  { name: "GamerMX99", stars: 5, text: "Excelente atención por WhatsApp, resolvieron todas mi dudas de seguridad y jugaron en modo dúo conmigo.", verified: true }
];

let selectedStarsValue = 5;

// ================= MÓDULO DE PAGOS Y CHECKOUT =================
function executeOrderSubmit(event) {
  event.preventDefault();
  const btn = document.getElementById('btn-submit-order');
  
  if (!activeServiceId) {
    showFeedbackMessage('⚠️ Por favor, selecciona un rango del catálogo antes de proceder.', 'error', 'status-message-box');
    return;
  }

  const matchedProduct = SERVICES_DATA.find(s => s.id === activeServiceId);
  const name = document.getElementById('f-name').value.trim();
  const contact = document.getElementById('f-contact').value.trim();
  const email = document.getElementById('f-email').value.trim();
  const finalPriceText = document.getElementById('summary-total').innerText;

  btn.disabled = true;
  btn.textContent = "PROCESANDO PEDIDO...";

  const templateParams = {
    client_name: name,
    client_contact: contact,
    client_email: email,
    service_name: matchedProduct.name,
    calculated_total: finalPriceText
  };

  // Verificación de API o Desvío Automático a WhatsApp para asegurar la venta
  if (typeof emailjs !== 'undefined' && EMAILJS_SERVICES.PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
    emailjs.send(EMAILJS_SERVICES.SERVICE_ID, EMAILJS_SERVICES.TEMPLATE_ORDER_ID, templateParams)
      .then(() => handleOrderProcessSuccess())
      .catch(() => triggerOrderFallbackWhatsApp(templateParams));
  } else {
    // Si estás ejecutándolo localmente, te enviará directo a WhatsApp con los datos del pedido formateados
    setTimeout(() => { triggerOrderFallbackWhatsApp(templateParams); }, 1000);
  }
}

function handleOrderProcessSuccess() {
  const btn = document.getElementById('btn-submit-order');
  showFeedbackMessage('💳 ¡Pedido Recibido! Te contactaremos vía WhatsApp en minutos.', 'success', 'status-message-box');
  document.getElementById('order-form').reset();
  activeServiceId = null;
  currentDiscountPercentage = 0.0;
  renderCatalogAndOptions();
  calculateFinalCheckoutPrice();
  btn.disabled = false;
  btn.textContent = "Confirmar Orden de Servicio";
}

function triggerOrderFallbackWhatsApp(params) {
  const btn = document.getElementById('btn-submit-order');
  showFeedbackMessage('✓ Redirigiendo de forma segura a soporte...', 'success', 'status-message-box');
  
  const text = `🎯 *NUEVO PEDIDO DE BOOST R6*\n\n` +
               `• *Servicio:* ${params.service_name}\n` +
               `• *Cliente:* ${params.client_name}\n` +
               `• *Contacto:* ${params.client_contact}\n` +
               `• *Pago Total Estimado:* ${params.calculated_total}\n\n` +
               `Me gustaría iniciar el proceso del servicio lo antes posible.`;
               
  window.open(`https://wa.me/${TECH_SUPPORT_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  
  btn.disabled = false;
  btn.textContent = "Confirmar Orden de Servicio";
}

// ================= MÓDULO DE CONTACTO DIRECTO =================
function handleContactSubmit(event) {
  event.preventDefault();
  const btn = document.getElementById('btn-submit-contact');
  const name = document.getElementById('c-name').value.trim();
  const msg = document.getElementById('c-msg').value.trim();

  btn.disabled = true;
  
  const text = `👋 *Consulta desde la Web (R6 Boost)*\n\n` +
               `• *Nombre:* ${name}\n` +
               `• *Mensaje:* ${msg}`;
               
  window.open(`https://wa.me/${TECH_SUPPORT_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  
  showFeedbackMessage('✓ Redirigiendo a tu WhatsApp...', 'success', 'contact-status-box');
  document.getElementById('contact-form').reset();
  btn.disabled = false;
}

// ================= MÓDULO DE REVIEWS (PRUEBA SOCIAL) =================
window.initializeReviewsModule = function() {
  renderReviewsEngine();
};

function renderReviewsEngine() {
  const container = document.getElementById('review-container');
  if(!container) return;
  container.innerHTML = "";
  
  communityReviews.forEach(rev => {
    const item = document.createElement('div');
    item.className = 'review-item';
    item.innerHTML = `
      <div class="review-meta">
        <strong>${rev.name}</strong>
        <div>
          <span style="color:var(--star); margin-right:6px;">${'★'.repeat(rev.stars)}</span>
          ${rev.verified ? `<span class="verified-tag">✓ Verificado</span>` : ''}
        </div>
      </div>
      <p class="review-text">"${rev.text}"</p>
    `;
    container.insertBefore(item, container.firstChild);
  });
}

function setStarRating(num) {
  selectedStarsValue = num;
  const labels = document.querySelectorAll('#star-selector label');
  labels.forEach((label, idx) => {
    label.classList.toggle('selected', idx < num);
  });
}

function addNewUserReview() {
  const name = document.getElementById('r-name').value.trim();
  const text = document.getElementById('r-text').value.trim();

  if(!name || !text) {
    alert("Por favor rellena todos los campos para enviar tu valoración.");
    return;
  }

  communityReviews.push({
    name: name,
    stars: selectedStarsValue,
    text: text,
    verified: false
  });

  renderReviewsEngine();
  document.getElementById('r-name').value = "";
  document.getElementById('r-text').value = "";
  setStarRating(5);
}
