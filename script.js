// script.js

// Make addToCart global so it can be called from inline onclick attributes
window.addToCart = function (productId) {
    let inquiryList = JSON.parse(localStorage.getItem('labpure_inquiry')) || [];

    // Check if already in list (using ID)
    if (!inquiryList.includes(productId)) {
        inquiryList.push(productId);
        localStorage.setItem('labpure_inquiry', JSON.stringify(inquiryList));
        updateInquiryCount();

        // Visual Feedback
        alert('Item Added to Inquiry List');

        // Update button UI if it exists on page
        const btn = document.querySelector(`button[onclick="addToCart(${productId})"]`);
        if (btn) {
            btn.textContent = "In List";
            btn.classList.remove('bg-neutral-100', 'text-neutral-900', 'hover:bg-clinical-blue-600');
            btn.classList.add('bg-green-50', 'text-green-700', 'border-green-300');
        }
    } else {
        alert('Item is already in your list.');
    }
};

function updateInquiryCount() {
    const inquiryList = JSON.parse(localStorage.getItem('labpure_inquiry')) || [];
    const countDisplay = document.getElementById('inquiry-count');
    if (countDisplay) {
        countDisplay.textContent = inquiryList.length;
        countDisplay.classList.add('scale-125');
        setTimeout(() => countDisplay.classList.remove('scale-125'), 200);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS safely
    if (typeof emailjs !== 'undefined') {
        emailjs.init("O_V0ppcsls3itLO0X");
    } else {
        console.warn("EmailJS not loaded. Checkout will not work.");
    }

    // Elements
    const productGrid = document.getElementById('product-grid');
    const productDetailContainer = document.getElementById('product-detail-container');
    const cartTableBody = document.getElementById('cart-table-body');
    const emptyCartMsg = document.getElementById('empty-cart-msg');
    const btnSendInquiry = document.getElementById('btn-send-inquiry');

    // Telegram Button Fix
    const btnTelegram = document.getElementById('btn-telegram');
    if (btnTelegram) {
        // If it's a link (a tag), setting onclick might not be needed if href is set, 
        // but id suggests it might be a button. The user asked to set href.
        // If it is a button, we use window.open. If it's an anchor, we set href.
        // Based on previous code it was a button.
        btnTelegram.addEventListener('click', () => {
            window.open('https://t.me/YourUsername', '_blank');
        });
    }

    // Initial Count Update
    updateInquiryCount();

    // --- Render Product Grid (Index & Products Page) ---
    if (productGrid && typeof products !== 'undefined') {
        renderGrid(products);

        // Filter Logic
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Active State
                filterButtons.forEach(b => {
                    b.classList.remove('bg-clinical-blue-600', 'text-white');
                    b.classList.add('bg-white', 'text-neutral-600');
                });
                btn.classList.add('bg-clinical-blue-600', 'text-white');
                btn.classList.remove('bg-white', 'text-neutral-600');

                const cat = btn.getAttribute('data-category');
                const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
                renderGrid(filtered);
            });
        });
    }

    function renderGrid(dataset) {
        if (!productGrid) return;
        const inquiryList = JSON.parse(localStorage.getItem('labpure_inquiry')) || [];
        productGrid.innerHTML = '';

        dataset.forEach(product => {
            const isInList = inquiryList.includes(product.id);
            const btnText = isInList ? "In List" : "Add to Inquiry List";
            const btnClass = isInList
                ? "mt-4 w-full bg-green-50 text-green-700 border border-green-300 rounded-sm text-sm font-medium transition-all duration-200 z-10 relative"
                : "mt-4 w-full bg-neutral-100 text-neutral-900 border border-neutral-300 rounded-sm text-sm font-medium hover:bg-clinical-blue-600 hover:text-white hover:border-transparent transition-all duration-200 z-10 relative";

            const card = document.createElement('div');
            card.className = 'group relative bg-white border border-neutral-200 rounded-sm p-4 hover:shadow-md transition-shadow duration-200';
            card.innerHTML = `
                <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-sm bg-neutral-100 group-hover:opacity-75 h-48 flex items-center justify-center">
                    <img src="${product.image}" alt="${product.name}" class="h-full w-full object-cover object-center sm:h-full sm:w-full opacity-40 mix-blend-multiply filter grayscale">
                </div>
                <div class="mt-4 flex justify-between">
                    <div>
                        <h3 class="text-sm text-neutral-700">
                            <a href="product.html?id=${product.id}">
                                <span aria-hidden="true" class="absolute inset-0"></span>
                                ${product.name}
                            </a>
                        </h3>
                        <p class="mt-1 text-sm text-neutral-500">Purity: ${product.purity}</p>
                    </div>
                </div>
                <button class="${btnClass} py-2 px-4" onclick="addToCart(${product.id})">
                    ${btnText}
                </button>
            `;
            productGrid.appendChild(card);
        });
    }

    // --- Render Cart Page ---
    if (cartTableBody) {
        renderCart();
    }

    function renderCart() {
        if (!cartTableBody) return;
        const inquiryList = JSON.parse(localStorage.getItem('labpure_inquiry')) || [];
        cartTableBody.innerHTML = '';

        if (inquiryList.length === 0) {
            emptyCartMsg.classList.remove('hidden');
            if (cartTableBody.parentElement) cartTableBody.parentElement.classList.add('hidden'); // Table header
            return;
        }

        emptyCartMsg.classList.add('hidden');
        if (cartTableBody.parentElement) cartTableBody.parentElement.classList.remove('hidden');

        inquiryList.forEach((id, index) => {
            const product = products.find(p => p.id == id);
            if (!product) return;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="text-sm font-medium text-neutral-900">${product.name}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <input type="number" min="1" value="1" id="qty-${id}" class="w-16 rounded-md border-neutral-300 shadow-sm sm:text-sm border p-1">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-red-600 hover:text-red-900" onclick="removeFromCart(${index})">Remove</button>
                </td>
            `;
            cartTableBody.appendChild(row);
        });
    }

    // Global remove function for cart page
    window.removeFromCart = function (index) {
        let inquiryList = JSON.parse(localStorage.getItem('labpure_inquiry')) || [];
        inquiryList.splice(index, 1);
        localStorage.setItem('labpure_inquiry', JSON.stringify(inquiryList));
        updateInquiryCount();
        renderCart();
    };


    // --- Checkout / EmailJS Logic ---
    if (btnSendInquiry) {
        btnSendInquiry.addEventListener('click', (e) => {
            e.preventDefault();

            const inquiryList = JSON.parse(localStorage.getItem('labpure_inquiry')) || [];

            // Debug Logs
            console.log("Submitting Inquiry...");
            console.log("Cart Length:", inquiryList.length);

            // Validate Cart
            if (inquiryList.length === 0) {
                alert("Your cart is empty. Please add items before sending a request.");
                return;
            }

            const fromName = document.getElementById('from_name').value;
            const replyTo = document.getElementById('reply_to').value;
            const address = document.getElementById('address').value;
            const message = document.getElementById('message').value;
            const telegramHandle = document.getElementById('telegram_handle').value;

            console.log("Form Data:", { fromName, replyTo, address });

            if (!fromName || !replyTo || !address) {
                alert("Please fill in Name, Email, and Address.");
                return;
            }

            // Prepare Data
            const btnOriginalText = btnSendInquiry.textContent;
            btnSendInquiry.textContent = "Sending...";
            btnSendInquiry.disabled = true;

            const cartItems = inquiryList.map(id => {
                const p = products.find(prod => prod.id == id);
                const qtyInput = document.getElementById(`qty-${id}`);
                const qty = qtyInput ? parseInt(qtyInput.value) : 1;
                return {
                    name: p ? p.name : 'Unknown',
                    quantity: qty,
                    price: 0, // No price data
                    category: p ? p.category : 'N/A'
                };
            });

            const totalVal = 0; // Calculated if prices existed

            const templateParams = {
                order_id: 'ORD-' + Math.floor(Math.random() * 1000000),
                to_name: 'Owner',
                from_name: fromName,
                reply_to: replyTo,
                email: replyTo, // Added generic key for compatibility
                user_email: replyTo, // Added generic key for compatibility
                telegram_handle: telegramHandle,
                address: address,
                message: message,
                orders: cartItems,
                cost: { total: totalVal.toFixed(2) }
            };

            emailjs.send('service_g74m41e', 'template_ky82rrv', templateParams)
                .then(function () {
                    localStorage.removeItem('labpure_inquiry');
                    updateInquiryCount(); // Reset counter
                    alert('Order successfully sent! Check your inbox.');
                    window.location.href = 'index.html';
                }, function (error) {
                    console.error('FAILED...', error);
                    alert('Failed to send order. Please try again.');
                    btnSendInquiry.textContent = btnOriginalText;
                    btnSendInquiry.disabled = false;
                });
        });
    }

    // --- Mobile Menu ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});
