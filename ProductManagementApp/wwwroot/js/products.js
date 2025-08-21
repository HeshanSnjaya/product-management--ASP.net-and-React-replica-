class ProductsPage {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.currentCategory = 'all';
        this.currentSearch = '';
        this.totalPages = 1;
        this.allProducts = [];
        
        this.init();
    }
    
    init() {
        this.loadCategories();
        this.loadProducts();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.currentPage = 1;
                this.filterAndDisplayProducts();
            });
        }
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = this.debounce(() => {
                this.currentSearch = searchInput.value;
                this.currentPage = 1;
                this.filterAndDisplayProducts();
            }, 500);
            
            searchInput.addEventListener('input', debouncedSearch);
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.currentSearch = searchInput.value;
                    this.currentPage = 1;
                    this.filterAndDisplayProducts();
                }
            });
        }
        
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.currentSearch = searchInput.value;
                this.currentPage = 1;
                this.filterAndDisplayProducts();
            });
        }
        
        document.addEventListener('click', (e) => {
            console.log('Click detected on:', e.target.className, e.target.tagName);
            
            if (e.target.classList.contains('add-to-cart') || 
                e.target.closest('.add-to-cart') ||
                (e.target.classList.contains('fas') && e.target.classList.contains('fa-cart-plus'))) {
                
                e.preventDefault();
                e.stopPropagation();
                
                let button = e.target;
                if (e.target.closest('.add-to-cart')) {
                    button = e.target.closest('.add-to-cart');
                } else if (e.target.classList.contains('fas')) {
                    button = e.target.parentElement;
                }
                
                const productId = parseInt(button.getAttribute('data-product-id'));
                console.log('Add to cart clicked for product ID:', productId);
                
                const product = this.allProducts.find(p => p.id === productId);
                
                if (product && window.cartManager) {
                    window.cartManager.addItem(product);
                    console.log('Added to cart:', product.title);
                    
                    button.innerHTML = '<i class="fas fa-check"></i>';
                    button.classList.add('btn-success');
                    button.classList.remove('btn-primary');
                    
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-cart-plus"></i>';
                        button.classList.remove('btn-success');
                        button.classList.add('btn-primary');
                    }, 1000);
                }
            }
            
            if (e.target.classList.contains('view-product') || e.target.closest('.view-product')) {
                e.preventDefault();
                e.stopPropagation();
                
                let button = e.target;
                if (e.target.closest('.view-product')) {
                    button = e.target.closest('.view-product');
                }
                
                const productId = parseInt(button.getAttribute('data-product-id'));
                console.log('View product clicked for ID:', productId);
                
                if (window.ProductModal) {
                    window.ProductModal.show(productId);
                } else {
                    console.error('ProductModal not available');
                }
            }
            
            if (e.target.classList.contains('page-link') && e.target.hasAttribute('data-page')) {
                e.preventDefault();
                const page = parseInt(e.target.getAttribute('data-page'));
                if (page && page !== this.currentPage && page >= 1 && page <= this.totalPages) {
                    this.currentPage = page;
                    this.filterAndDisplayProducts();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });
    }
    
    async loadCategories() {
        try {
            const response = await fetch('/Products/GetCategories');
            const categories = await response.json();
            
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.innerHTML = categories.map(category => 
                    `<option value="${category}">${this.capitalizeFirst(category)}</option>`
                ).join('');
            }
            
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    async loadProducts() {
        try {
            this.showLoading();
            
            const response = await fetch('/Products/GetProducts?page=1&pageSize=100');
            const data = await response.json();
            
            console.log('Raw API response:', data);
            this.allProducts = data.products || [];
            console.log('Loaded products:', this.allProducts.length);
            
            this.filterAndDisplayProducts();
            
            window.debugProducts = this.allProducts;
            
        } catch (error) {
            console.error('Error loading products:', error);
            const grid = document.getElementById('productsGrid');
            if (grid) {
                grid.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error loading products. Please try again.</div></div>';
            }
        } finally {
            this.hideLoading();
        }
    }
    
    filterAndDisplayProducts() {
        let filteredProducts = [...this.allProducts];
        
        if (this.currentCategory && this.currentCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
                product.category === this.currentCategory
            );
        }
        
        if (this.currentSearch) {
            filteredProducts = filteredProducts.filter(product =>
                product.title.toLowerCase().includes(this.currentSearch.toLowerCase())
            );
        }
        
        this.totalPages = Math.ceil(filteredProducts.length / this.pageSize);
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const paginatedProducts = filteredProducts.slice(startIndex, startIndex + this.pageSize);
        
        this.renderProducts(paginatedProducts);
        this.renderPagination(filteredProducts.length);
    }
    
    renderProducts(products) {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        
        if (products.length === 0) {
            grid.innerHTML = '<div class="col-12"><div class="alert alert-info text-center">No products found.</div></div>';
            return;
        }
        
        console.log('Rendering products:', products.length);
        
        grid.innerHTML = products.map(product => `
            <div class="col-lg-4 col-md-6 col-sm-6 mb-4">
                <div class="card product-card h-100 shadow-sm">
                    <img src="${product.image}" class="card-img-top product-image" alt="${product.title}" 
                         style="height: 250px; object-fit: contain; padding: 1rem; background: #f8f9fa;">
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-secondary mb-2">${this.capitalizeFirst(product.category)}</span>
                        <h5 class="card-title" style="height: 3rem; overflow: hidden;">
                            ${this.highlightSearchTerm(product.title, this.currentSearch)}
                        </h5>
                        <p class="text-primary fs-5 fw-bold">$${product.price}</p>
                        <div class="rating mb-2">
                            ${this.generateStars(product.rating.rate)}
                            <span class="text-muted ms-2">(${product.rating.count})</span>
                        </div>
                        <div class="mt-auto d-flex gap-2">
                            <button class="btn btn-outline-primary view-product flex-fill" data-product-id="${product.id}">
                                View Details
                            </button>
                            <button class="btn btn-primary add-to-cart" data-product-id="${product.id}" title="Add to Cart">
                                <i class="fas fa-cart-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        console.log('Products rendered, all buttons should be clickable now');
        
        grid.querySelectorAll('.product-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    renderPagination(totalCount) {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        this.totalPages = Math.ceil(totalCount / this.pageSize);
        
        if (this.totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHtml = '';
        
        paginationHtml += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage - 1}">Previous</a>
            </li>
        `;
        
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
            if (startPage > 2) {
                paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${this.totalPages}">${this.totalPages}</a></li>`;
        }
        
        paginationHtml += `
            <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage + 1}">Next</a>
            </li>
        `;
        
        pagination.innerHTML = paginationHtml;
    }
    
    generateStars(rating) {
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
    
    highlightSearchTerm(text, searchTerm) {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
    
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.classList.remove('d-none');
    }
    
    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.classList.add('d-none');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing ProductsPage');
    window.productsPage = new ProductsPage();
});
