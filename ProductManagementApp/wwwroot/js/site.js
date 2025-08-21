class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartUI();
        console.log('CartManager initialized');
    }

    addItem(product) {
        console.log('CartManager.addItem called with:', product);
        const existingItem = this.cart.find(item => item.product.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                product: product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.showAddToCartAnimation();
        this.showMinimizedNotification('Added to cart!');
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.product.id !== productId);
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.product.id === productId);
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (cartCount) {
            const totalItems = this.getTotalItems();
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
        }

        if (cartItems) {
            if (this.cart.length === 0) {
                cartItems.innerHTML = '<p class="text-muted text-center">Your cart is empty</p>';
            } else {
                cartItems.innerHTML = this.cart.map(item => `
                    <div class="cart-item border-bottom pb-3 mb-3">
                        <div class="row align-items-center">
                            <div class="col-3">
                                <img src="${item.product.image}" class="img-fluid rounded" alt="${item.product.title}">
                            </div>
                            <div class="col-6">
                                <h6 class="mb-1">${this.truncateText(item.product.title, 30)}</h6>
                                <p class="text-muted mb-1">$${item.product.price}</p>
                                <div class="d-flex align-items-center">
                                    <button class="btn btn-sm btn-outline-secondary" onclick="cartManager.updateQuantity(${item.product.id}, ${item.quantity - 1})">-</button>
                                    <span class="mx-2">${item.quantity}</span>
                                    <button class="btn btn-sm btn-outline-secondary" onclick="cartManager.updateQuantity(${item.product.id}, ${item.quantity + 1})">+</button>
                                </div>
                            </div>
                            <div class="col-3 text-end">
                                <p class="fw-bold mb-1">$${(item.product.price * item.quantity).toFixed(2)}</p>
                                <button class="btn btn-sm btn-outline-danger" onclick="cartManager.removeItem(${item.product.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

        if (cartTotal) {
            cartTotal.textContent = `$${this.getTotal().toFixed(2)}`;
        }
    }

    showAddToCartAnimation() {
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.classList.add('cart-bounce');
            setTimeout(() => {
                cartBtn.classList.remove('cart-bounce');
            }, 600);
        }
    }

    showMinimizedNotification(message) {
        const existing = document.querySelector('.minimized-notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'minimized-notification';
        notification.innerHTML = `<i class="fas fa-check-circle me-1"></i>${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
        }, 2000);
        
        setTimeout(() => {
            notification.remove();
        }, 2500);
    }

    truncateText(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }
}

class ProductModal {
    static async show(productId) {
        try {
            console.log('Opening modal for product ID:', productId);
            
            const response = await fetch(`/Products/GetProduct?id=${productId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch product details');
            }
            
            const product = await response.json();
            console.log('Product details loaded:', product);
            
            document.getElementById('productModalTitle').textContent = product.title;
            document.getElementById('productModalImage').src = product.image;
            document.getElementById('productModalImage').alt = product.title;
            document.getElementById('productModalCategory').textContent = product.category.toUpperCase();
            document.getElementById('productModalPrice').textContent = `$${product.price}`;
            document.getElementById('productModalDescription').textContent = product.description;
            
            const rating = product.rating?.rate || 0;
            const ratingHtml = this.generateStars(rating) + ` <span class="text-muted">(${product.rating?.count || 0} reviews)</span>`;
            document.getElementById('productModalRating').innerHTML = ratingHtml;
            
            const addToCartBtn = document.getElementById('addToCartBtn');
            if (addToCartBtn) {
                addToCartBtn.replaceWith(addToCartBtn.cloneNode(true));
                const newAddToCartBtn = document.getElementById('addToCartBtn');
                
                newAddToCartBtn.onclick = () => {
                    if (window.cartManager) {
                        window.cartManager.addItem(product);
                        
                        newAddToCartBtn.innerHTML = '<i class="fas fa-check me-2"></i>Added!';
                        newAddToCartBtn.classList.add('btn-success');
                        newAddToCartBtn.classList.remove('btn-primary');
                        
                        setTimeout(() => {
                            newAddToCartBtn.innerHTML = '<i class="fas fa-cart-plus me-2"></i>Add to Cart';
                            newAddToCartBtn.classList.remove('btn-success');
                            newAddToCartBtn.classList.add('btn-primary');
                        }, 1500);
                        
                        setTimeout(() => {
                            bootstrap.Modal.getInstance(document.getElementById('productModal'))?.hide();
                        }, 2000);
                    }
                };
            }
            
            const modalElement = document.getElementById('productModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
                console.log('Modal displayed');
            } else {
                console.error('Modal element not found');
            }
            
        } catch (error) {
            console.error('Error loading product details:', error);
            alert('Error loading product details. Please try again.');
        }
    }
    
    static generateStars(rating) {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push('<i class="fas fa-star text-warning"></i>');
        }
        
        if (hasHalfStar) {
            stars.push('<i class="fas fa-star-half-alt text-warning"></i>');
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push('<i class="far fa-star text-warning"></i>');
        }
        
        return stars.join(' ');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing cart manager');
    window.cartManager = new CartManager();
    window.ProductModal = ProductModal;
    console.log('Cart manager available:', !!window.cartManager);
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (window.cartManager.cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            alert(`Checkout functionality would be implemented here. Total: $${window.cartManager.getTotal().toFixed(2)}`);
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
