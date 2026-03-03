tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#003366",
                "background-light": "#f5f7f8",
                "background-dark": "#0f1923",
                "metallic": "#94a3b8",
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
};

// --- Shopping Cart Logic ---

// Get cart from localStorage or initialize empty array
function getCart() {
    const cart = localStorage.getItem('premiunwashrd_cart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('premiunwashrd_cart', JSON.stringify(cart));
}

// Update the cart counter in the header
function updateCartCounter() {
    const cart = getCart();
    const counters = document.querySelectorAll('.cart-counter');
    counters.forEach(counter => {
        counter.textContent = cart.length;
        if (cart.length > 0) {
            counter.classList.remove('hidden');
        } else {
            counter.classList.add('hidden');
        }
    });

    // If we're on the booking page, also render the cart items
    if (document.getElementById('cart-items-container')) {
        renderBookingCart();
    }
}

// Add a service to the cart
function addToCart(name, price, duration) {
    const cart = getCart();
    cart.push({
        id: Date.now().toString(),
        name: name,
        price: parseFloat(price),
        duration: duration || 'Variable'
    });
    saveCart(cart);
    updateCartCounter();

    // Redirect to booking page immediately to complete checkout
    window.location.href = 'booking.html';
}

// Remove a service from the cart
function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    updateCartCounter();
}

function clearCart() {
    saveCart([]);
    updateCartCounter();
}

// Auto-run on page load to set the initial counter
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
});

// Render the cart items on the booking page
function renderBookingCart() {
    const container = document.getElementById('cart-items-container');
    const emptyState = document.getElementById('cart-empty-state');
    const summaryCard = document.getElementById('cart-summary-card');
    const totalElement = document.getElementById('cart-total-price');

    if (!container) return; // Not on the booking page

    const cart = getCart();
    container.innerHTML = '';

    if (cart.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        summaryCard.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    summaryCard.classList.remove('hidden');

    let total = 0;

    cart.forEach(item => {
        total += item.price;
        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800";
        div.innerHTML = `
            <div class="flex flex-col">
                <span class="font-bold text-slate-900 dark:text-white">${item.name}</span>
                <span class="text-sm text-slate-500 dark:text-slate-400"><span class="material-symbols-outlined text-[14px] align-middle mr-1">schedule</span>${item.duration}</span>
            </div>
            <div class="flex items-center gap-4">
                <span class="font-black text-slate-900 dark:text-white">$${item.price.toFixed(2)}</span>
                <button type="button" onclick="removeFromCart('${item.id}')" class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>
        `;
        container.appendChild(div);
    });

    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Handle the final checkout submission
function submitBooking(event) {
    event.preventDefault(); // Prevent standard form submission

    const cart = getCart();
    if (cart.length === 0) {
        alert("Tu carrito de reservas está vacío. Por favor selecciona al menos un servicio.");
        return;
    }

    try {
        const textInputs = event.target.querySelectorAll('input:not([type="radio"]), select');
        const locationInput = event.target.querySelector('input[name="location"]:checked');

        const formData = {
            date: textInputs[0].value,
            time: textInputs[1].value,
            vehicle: textInputs[2].value,
            name: textInputs[3].value,
            phone: textInputs[4].value,
            location: locationInput ? locationInput.value : 'shop'
        };

        // Print Receipt in a new window
        generateReceipt(cart, formData);

        alert("¡Reserva confirmada exitosamente! Se ha generado tu recibo en una pestaña nueva.");
    } catch (e) {
        console.error("Error reading form data: ", e);
        alert("¡Reserva confirmada! Hemos recibido tu solicitud.");
    }

    // Clear the cart
    clearCart();

    // Go home
    window.location.href = 'index.html';
}

// Generate an HTML print-ready receipt
function generateReceipt(cart, formData) {
    let total = 0;

    let itemsHtml = '';
    cart.forEach(item => {
        total += item.price;
        itemsHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding: 12px 0;">
                <div>
                    <strong style="display: block; font-size: 15px; color: #1e293b;">${item.name}</strong>
                    <span style="font-size: 12px; color: #64748b;">⏳ ${item.duration}</span>
                </div>
                <strong style="font-size: 15px; color: #0f172a;">$${item.price.toFixed(2)}</strong>
            </div>
        `;
    });

    const receiptHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Recibo de Reserva - Premiun Wash RD</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9; display: flex; justify-content: center; padding: 40px 20px; margin: 0; }
            .receipt-card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 450px; border: 1px solid #e2e8f0; }
            .header { text-align: center; border-bottom: 2px solid #003366; padding-bottom: 20px; margin-bottom: 25px; }
            .header h1 { margin: 0 0 5px 0; color: #003366; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
            .header p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
            .details { margin-bottom: 25px; font-size: 14px; color: #475569; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px dashed #cbd5e1; }
            .details p { margin: 6px 0; }
            .details strong { color: #1e293b; display: inline-block; width: 90px; }
            .total { display: flex; justify-content: space-between; margin-top: 25px; font-size: 20px; font-weight: 900; color: #003366; padding-top: 15px; border-top: 2px solid #e2e8f0; }
            .footer { text-align: center; margin-top: 35px; font-size: 12px; color: #94a3b8; line-height: 1.5; }
            
            @media print {
                body { background-color: white; padding: 0; justify-content: flex-start; }
                .receipt-card { box-shadow: none; max-width: 100%; border: none; padding: 0; }
            }
        </style>
    </head>
    <body onload="setTimeout(() => { window.print(); }, 500);">
        <div class="receipt-card">
            <div class="header">
                <h1>Premiun Wash RD</h1>
                <p>Calle Principal #123, La Romana, Rep. Dom.</p>
                <p>Tel: +1 (809) 555-1234 | hello@premiunwashrd.com</p>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px; font-size: 13px; color: #64748b;">
                <strong>Recibo de Estimación</strong><br>
                ${new Date().toLocaleString('es-DO')}
            </div>

            <div class="details">
                <p><strong>Cliente:</strong> ${formData.name}</p>
                <p><strong>Vehículo:</strong> ${formData.vehicle}</p>
                <p><strong>Cita:</strong> ${formData.date} - ${formData.time}</p>
                <p><strong>Lugar:</strong> ${formData.location === 'shop' ? 'En Taller (La Romana)' : 'Servicio Móvil'}</p>
            </div>
            
            <div class="items">
                <div style="font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px;">Servicios Seleccionados</div>
                ${itemsHtml}
            </div>
            
            <div class="total">
                <span>Total Estimado</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            
            <div class="footer">
                <p><strong>¡Gracias por tu preferencia!</strong><br>
                Este es un estimado de tus servicios. No se requiere tarjeta de crédito para reservar. El pago final se procesará una vez el servicio sea completado en sucursal.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (printWindow) {
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
    } else {
        console.warn("Popup blocked. Cannot display receipt.");
    }
}

// Accessibility Features
function toggleA11yMenu() {
    document.getElementById('a11y-menu').classList.toggle('hidden');
}

function applyA11ySettings() {
    const settings = JSON.parse(localStorage.getItem('premiunwashrd_a11y')) || {
        highContrast: false,
        largeText: false,
        dyslexicFont: false
    };

    if (settings.highContrast) document.body.classList.add('a11y-high-contrast');
    else document.body.classList.remove('a11y-high-contrast');

    if (settings.largeText) document.body.classList.add('a11y-large-text');
    else document.body.classList.remove('a11y-large-text');

    if (settings.dyslexicFont) document.body.classList.add('a11y-dyslexic-font');
    else document.body.classList.remove('a11y-dyslexic-font');

    // Update toggles in the menu if it exists on the page
    const toggleHighContrast = document.getElementById('toggle-high-contrast');
    const toggleLargeText = document.getElementById('toggle-large-text');
    const toggleDyslexicFont = document.getElementById('toggle-dyslexic-font');

    if (toggleHighContrast) toggleHighContrast.checked = settings.highContrast;
    if (toggleLargeText) toggleLargeText.checked = settings.largeText;
    if (toggleDyslexicFont) toggleDyslexicFont.checked = settings.dyslexicFont;
}

function toggleA11ySetting(settingKey) {
    const settings = JSON.parse(localStorage.getItem('premiunwashrd_a11y')) || {
        highContrast: false,
        largeText: false,
        dyslexicFont: false
    };
    settings[settingKey] = !settings[settingKey];
    localStorage.setItem('premiunwashrd_a11y', JSON.stringify(settings));
    applyA11ySettings();
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
    applyA11ySettings();
});
