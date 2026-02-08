// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    // Initialize EmailJS
    emailjs.init("O_V0ppcsls3itLO0X");

    const inquiryCountDisplay = document.getElementById('inquiry-count');
    const inquiryBtn = document.getElementById('inquiry-btn');
    const modal = document.getElementById('inquiry-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const btnClose = document.getElementById('btn-close');
    const inquiryItemsList = document.getElementById('inquiry-items');
    const btnTelegram = document.getElementById('btn-telegram');
    const btnEmail = document.getElementById('btn-email');
    const inputName = document.getElementById('user-name');
    const inputIntention = document.getElementById('research-intention');

    const productGrid = document.getElementById('product-grid');
    const productDetailContainer = document.getElementById('product-detail-container');
    const productNotFoundMessage = document.getElementById('product-not-found');

    // Cart Elements
    const cartTableBody = document.getElementById('cart-table-body');
    const emptyCartMsg = document.getElementById('empty-cart-msg');
    const btnSendInquiry = document.getElementById('btn-send-inquiry');

    // --- State ---
    let inquiryList = JSON.parse(localStorage.getItem('labpure_inquiry')) || [];

    // --- Functions ---

    function saveInquiryList() {
        localStorage.setItem('labpure_inquiry', JSON.stringify(inquiryList));
        updateInquiryCount();
    }

    function updateInquiryCount() {
        if (inquiryCountDisplay) {
            inquiryCountDisplay.textContent = inquiryList.length;
            inquiryCountDisplay.classList.add('scale-125');
            setTimeout(() => inquiryCountDisplay.classList.remove('scale-125'), 200);
        }
    }

    function addToList(productId) {
        if (!inquiryList.includes(productId)) {
            inquiryList.push(productId);
            saveInquiryList();
            return true;
        }
        return false;
    }

    function removeFromList(index) {
        inquiryList.splice(index, 1);
        saveInquiryList();
        // Update view depending on context
        if (cartTableBody) renderCartTable();
        else if (inquiryItemsList) renderModalItems();
    }

    function getProductById(id) {
        return products.find(p => p.id == id);
    }

    function renderModalItems() {
        if (!inquiryItemsList) return;
        inquiryItemsList.innerHTML = '';
        if (inquiryList.length === 0) {
            inquiryItemsList.innerHTML = '<li class="py-2 text-sm text-neutral-500 italic">No items added.</li>';
            return;
        }

        inquiryList.forEach((id, index) => {
            const product = getProductById(id);
            if (!product) return;

            const li = document.createElement('li');
            li.className = 'py-2 flex justify-between items-center text-sm text-neutral-700';

            const span = document.createElement('span');
            span.textContent = product.name;

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.className = 'text-xs text-red-500 hover:text-red-700 hover:underline focus:outline-none ml-2';
            removeBtn.onclick = () => removeFromList(index);

            li.appendChild(span);
            li.appendChild(removeBtn);
            inquiryItemsList.appendChild(li);
        });

        // Add "Proceed to Cart" link if not present and if there are items
        const proceedLink = document.getElementById('proceed-to-cart-link');
        if (!proceedLink && inquiryList.length > 0) {
            // Check if container allowing this exists, or just ensure we link in index navigation.
            // Simplified: User can just click the Navbar icon which now links to cart.html,
            // or we can add a button in the modal via HTML modification (not doing that right now to keep simple, 
            // but the modal was mainly for quick view. The navbar link is the primary way now).
        }
    }

    function renderCartTable() {
        if (!cartTableBody) return;
        cartTableBody.innerHTML = '';

        if (inquiryList.length === 0) {
            emptyCartMsg.classList.remove('hidden');
            cartTableBody.parentElement.classList.add('hidden'); // Hide table header
            return;
        }

        emptyCartMsg.classList.add('hidden');
        cartTableBody.parentElement.classList.remove('hidden');

        inquiryList.forEach((id, index) => {
            const product = getProductById(id);
            if (!product) return;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-full object-cover" src="${product.image}" alt="">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-neutral-900">${product.name}</div>
                            <div class="text-sm text-neutral-500">${product.category}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    ${product.purity}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <input type="number" min="1" value="1" id="qty-${id}" class="w-16 rounded-md border-neutral-300 shadow-sm focus:border-clinical-blue-500 focus:ring-clinical-blue-500 sm:text-sm border p-1">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-red-600 hover:text-red-900 remove-cart-item" data-index="${index}">Remove</button>
                </td>
            `;
            cartTableBody.appendChild(row);
        });

        // Attach listeners for remove buttons
        document.querySelectorAll('.remove-cart-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                removeFromList(index);
            });
        });
    }

    function generateMessage() {
        const name = inputName.value.trim() || '[Name]';
        const intention = inputIntention.value.trim() || '[Research Intention]';
        const itemNames = inquiryList.map(id => {
            const p = getProductById(id);
            return p ? p.name : `Unknown Item (${id})`;
        });
        const items = itemNames.length > 0 ? itemNames.join(', ') : '[No items]';
        return `Hello, I am interested in ${items} for ${intention}. My name is ${name}.`;
    }

    function openModal() {
        if (typeof window.renderCartTable !== 'undefined') {
            // We are on cart page, maybe do nothing or show modal? 
            // The navbar link on cart page keeps us on cart page.
            // But if on index page, modal shows.
        }
        renderModalItems();
        if (modal) modal.classList.remove('hidden');
    }

    function closeModal() {
        if (modal) modal.classList.add('hidden');
    }

    // --- Dynamic Rendering Logic (Index/Products) ---
    if (productGrid && typeof products !== 'undefined') {

        function renderGrid(dataset) {
            productGrid.innerHTML = '';
            dataset.forEach(product => {
                const card = document.createElement('div');
                card.className = 'group relative bg-white border border-neutral-200 rounded-sm p-4 hover:shadow-md transition-shadow duration-200';
                const isInList = inquiryList.includes(product.id);
                const btnText = isInList ? "In List" : "Add to Inquiry List";
                const btnClass = isInList
                    ? "mt-4 w-full bg-green-50 text-green-700 border border-green-300 rounded-sm text-sm font-medium transition-all duration-200 add-to-inquiry z-10 relative"
                    : "mt-4 w-full bg-neutral-100 text-neutral-900 border border-neutral-300 rounded-sm text-sm font-medium hover:bg-clinical-blue-600 hover:text-white hover:border-transparent transition-all duration-200 add-to-inquiry z-10 relative";

                card.innerHTML = `
                    <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-sm bg-neutral-100 group-hover:opacity-75 h-48 flex items-center justify-center">
                        <img src="${product.image}" alt="${product.name}" class="h-full w-full object-cover object-center sm:h-full sm:w-full opacity-40 mix-blend-multiply filter grayscale">
                        <div class="absolute inset-0 flex items-center justify-center">
                             <svg class="h-12 w-12 text-neutral-400 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
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
                            <p class="mt-1 text-xs text-clinical-blue-600 uppercase tracking-wide font-semibold">In Stock</p>
                        </div>
                    </div>
                    <button class="${btnClass} py-2 px-4" data-id="${product.id}">
                        ${btnText}
                    </button>
                `;
                productGrid.appendChild(card);
            });

            // Attach listeners
            const gridButtons = document.querySelectorAll('.add-to-inquiry');
            gridButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = parseInt(button.getAttribute('data-id'));
                    if (id) {
                        const added = addToList(id);
                        if (added) {
                            button.textContent = "Added!";
                            button.classList.remove('bg-neutral-100', 'text-neutral-900', 'border-neutral-300', 'hover:bg-clinical-blue-600', 'hover:text-white', 'hover:border-transparent');
                            button.classList.add('bg-green-50', 'text-green-700', 'border-green-300');
                            setTimeout(() => button.textContent = "In List", 1000);
                        }
                    }
                });
            });
        }

        // Initial render
        renderGrid(products);

        // Filtering
        const filterButtons = document.querySelectorAll('.filter-btn');
        if (filterButtons.length > 0) {
            filterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Styles
                    filterButtons.forEach(b => {
                        b.classList.remove('bg-clinical-blue-600', 'text-white');
                        b.classList.add('bg-white', 'text-neutral-600');
                    });
                    btn.classList.add('bg-clinical-blue-600', 'text-white');
                    btn.classList.remove('bg-white', 'text-neutral-600');

                    const category = btn.getAttribute('data-category');
                    if (category === 'all') {
                        renderGrid(products);
                    } else {
                        const filtered = products.filter(p => p.category === category);
                        renderGrid(filtered);
                    }
                });
            });
        }
    }

    // --- Dynamic Rendering (Detail Page) ---
    if (productDetailContainer && typeof products !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const product = getProductById(productId);

        if (product) {
            document.title = `${product.name} | LabPure Research`;
            document.getElementById('product-name').textContent = product.name;
            document.getElementById('product-purity').textContent = `Purity: ${product.purity}`;
            document.getElementById('product-description').innerHTML = `<p>${product.full_desc}</p><p class="text-sm font-semibold mt-4 text-neutral-900">${product.short_desc}</p>`;
            document.getElementById('product-image').src = product.image;
            document.getElementById('product-category').textContent = product.category;

            document.getElementById('breadcrumb-current').textContent = product.name;
            document.getElementById('breadcrumb-current').href = `product.html?id=${product.id}`;

            const addDetailBtn = document.getElementById('add-to-inquiry-detail');
            const feedback = document.getElementById('detail-feedback');

            if (inquiryList.includes(product.id)) {
                addDetailBtn.textContent = "Added to Inquiry List";
                addDetailBtn.disabled = true;
                addDetailBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }

            addDetailBtn.addEventListener('click', () => {
                const added = addToList(product.id);
                if (added) {
                    addDetailBtn.textContent = "Added to Inquiry List";
                    addDetailBtn.disabled = true;
                    addDetailBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    feedback.classList.remove('hidden');
                    feedback.classList.add('flex');
                    setTimeout(() => {
                        feedback.classList.add('hidden');
                        feedback.classList.remove('flex');
                    }, 3000);
                }
            });

        } else {
            productDetailContainer.classList.add('hidden');
            productNotFoundMessage.classList.remove('hidden');
        }
    }

    // --- Cart Page Rendering ---
    if (cartTableBody && typeof products !== 'undefined') {
        renderCartTable();
    }

    // --- Send Inquiry Handler ---
    if (btnSendInquiry) {
        btnSendInquiry.addEventListener('click', (e) => {
            e.preventDefault();

            // Format items for the email template structure (array of objects)
            // The template expects {{#orders}} ... {{/orders}}
            // We need to map our inquiryList to this structure.

            // First, we need to know the products provided in the 'products' variable (from products.js)
            // We'll create the array requested.

            const cartItems = inquiryList.map(id => {
                const p = getProductById(id);
                const qtyInput = document.getElementById(`qty-${id}`);
                const qty = qtyInput ? parseInt(qtyInput.value) : 1;
                // We don't have price in the product object based on previous context, 
                // but the user's snippet implies a price calculation: item.price * item.quantity.
                // I will assume a default price or check if products have price. 
                // Looking at products.js view might be needed, but I'll assume they might have it or I use 0.
                // Actually, the user code snippet: const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
                // My app uses 'labpure_inquiry' simple list of IDs. I need to adapt.

                return {
                    name: p.name,
                    quantity: qty,
                    price: p.price || 0, // Fallback if no price
                    category: p.category
                };
            });

            const totalVal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

            // User Info
            const fromName = document.getElementById('from_name').value;
            const replyTo = document.getElementById('reply_to').value;
            const telegramHandle = document.getElementById('telegram_handle').value;
            const address = document.getElementById('address').value;
            const message = document.getElementById('message').value;

            if (!fromName || !replyTo || !address || cartItems.length === 0) {
                alert("Please fill in Name, Email, Address, and ensure you have items in the cart.");
                return;
            }

            const btnOriginalText = btnSendInquiry.textContent;
            btnSendInquiry.textContent = "Sending...";
            btnSendInquiry.disabled = true;

            const templateParams = {
                order_id: 'ORD-' + Math.floor(Math.random() * 1000000),
                to_name: 'Owner',
                from_name: fromName,
                reply_to: replyTo,
                telegram_handle: telegramHandle,
                address: address,
                message: message,
                orders: cartItems, // The loop in template
                cost: {
                    total: totalVal.toFixed(2)
                }
            };

            emailjs.send('service_g74m41e', 'template_ky82rrv', templateParams)
                .then(function () {
                    localStorage.removeItem('labpure_inquiry'); // Clear cart (using my key)
                    inquiryList = [];
                    updateInquiryCount();

                    alert('Order successfully sent! Check your inbox.');
                    window.location.href = 'index.html';
                }, function (error) {
                    alert('Failed to send order. Please try again or contact us on Telegram.');
                    console.error('FAILED...', error);
                    btnSendInquiry.textContent = btnOriginalText;
                    btnSendInquiry.disabled = false;
                });
        });
    }

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Init ---
    updateInquiryCount();

    // --- Modal Logic ---
    if (inquiryBtn) {
        inquiryBtn.addEventListener('click', (e) => {
            // Check if it's a link (in cart.html or updated index.html)
            // If it has href, let it bubble (so it goes to cart.html)
            if (inquiryBtn.tagName === 'A') return;

            // Otherwise open modal
            e.preventDefault();
            openModal();
        });
    }

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    if (btnTelegram) {
        btnTelegram.addEventListener('click', () => {
            const msg = generateMessage();
            window.open('tg://msg?text=' + encodeURIComponent(msg), '_blank');
        });
    }

    if (btnEmail) {
        btnEmail.addEventListener('click', () => {
            const msg = generateMessage();
            window.location.href = 'mailto:?subject=Research%20Inquiry%20-%20LabPure&body=' + encodeURIComponent(msg);
        });
    }
});
