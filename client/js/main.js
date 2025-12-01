// ============================================
// الملف الرئيسي لواجهة العميل
// ============================================

class CafeMenuApp {
    constructor() {
        // تهيئة التطبيق
        this.initialize();
    }
    
    async initialize() {
        try {
            // تهيئة المتغيرات
            this.currentCategory = null;
            this.currentTheme = localStorage.getItem('theme') || 'light';
            this.currentLanguage = 'ar';
            this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            this.cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            // تهيئة الخدمات
            this.db = window.databaseService;
            this.storage = window.supabaseStorage;
            this.supabase = window.supabaseClient;
            
            // تهيئة الواجهة
            await this.initializeUI();
            
            // تحميل البيانات
            await this.loadData();
            
            // إعداد المستمعين للأحداث
            this.setupEventListeners();
            
            // بدء الرسوم المتحركة
            this.startAnimations();
            
            console.log('✅ Cafe Menu App initialized successfully');
            
        } catch (error) {
            console.error('❌ App initialization error:', error);
            this.showError('حدث خطأ في تهيئة التطبيق');
        }
    }
    
    async initializeUI() {
        // تعيين السنة الحالية في الفوتر
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
        // تعيين الثيم
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // إخفاء شاشة التحميل بعد تأخير
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    document.getElementById('mainContainer').style.opacity = '1';
                }, 500);
            }
        }, 1500);
    }
    
    async loadData() {
        try {
            // تحميل الفئات
            await this.loadCategories();
            
            // تحميل الأصناف
            await this.loadMenuItems();
            
            // تحميل الإعدادات
            await this.loadSettings();
            
            // تحديث العدادات
            await this.updateCounters();
            
        } catch (error) {
            console.error('Load data error:', error);
            this.showError('حدث خطأ في تحميل البيانات');
        }
    }
    
    async loadCategories() {
        try {
            const result = await this.db.getCategories();
            
            if (result.success) {
                this.categories = result.data;
                this.renderCategories();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Load categories error:', error);
            this.showCategoriesError();
        }
    }
    
    renderCategories() {
        const nav = document.getElementById('categoriesNav');
        if (!nav) return;
        
        nav.innerHTML = '';
        
        // زر عرض الكل
        const allBtn = this.createCategoryButton({
            id: null,
            name_ar: 'عرض الكل',
            name_en: 'All',
            icon: 'fas fa-th-large',
            color: '#8B4513'
        }, true);
        nav.appendChild(allBtn);
        
        // أزرار الفئات
        this.categories.forEach(category => {
            const btn = this.createCategoryButton(category, false);
            nav.appendChild(btn);
        });
        
        // إضافة تأثير الظهور
        setTimeout(() => {
            nav.classList.add('loaded');
        }, 100);
    }
    
    createCategoryButton(category, isActive = false) {
        const btn = document.createElement('button');
        btn.className = `category-btn ${isActive ? 'active' : ''}`;
        btn.dataset.categoryId = category.id || 'all';
        
        btn.innerHTML = `
            <i class="${category.icon}"></i>
            <span>${category.name_ar}</span>
            ${category.color ? `<span class="category-indicator" style="background: ${category.color}"></span>` : ''}
        `;
        
        btn.addEventListener('click', () => this.handleCategoryClick(category.id));
        
        return btn;
    }
    
    async handleCategoryClick(categoryId) {
        // تحديث الزر النشط
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
        
        // تحديث الصنف الحالي
        this.currentCategory = categoryId;
        
        // إعادة تحميل الأصناف
        await this.loadMenuItems(categoryId);
        
        // إضافة تأثير الاهتزاز
        event.currentTarget.classList.add('shake');
        setTimeout(() => {
            event.currentTarget.classList.remove('shake');
        }, 500);
    }
    
    async loadMenuItems(categoryId = null) {
        try {
            const filters = {
                categoryId: categoryId,
                isAvailable: true,
                limit: 50
            };
            
            const result = await this.db.getMenuItems(filters);
            
            if (result.success) {
                this.menuItems = result.data;
                this.renderMenuItems();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Load menu items error:', error);
            this.showMenuItemsError();
        }
    }
    
    renderMenuItems() {
        const grid = document.getElementById('menuGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        if (!this.menuItems || this.menuItems.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-coffee"></i>
                    <h3>لا توجد أصناف متاحة</h3>
                    <p>جاري تحضير القائمة، يرجى المحاولة لاحقاً</p>
                </div>
            `;
            return;
        }
        
        this.menuItems.forEach((item, index) => {
            const itemCard = this.createMenuItemCard(item, index);
            grid.appendChild(itemCard);
        });
        
        // إضافة تأثيرات الظهور
        setTimeout(() => {
            document.querySelectorAll('.menu-item').forEach((item, index) => {
                item.style.animationDelay = `${index * 0.1}s`;
                item.classList.add('animated');
            });
        }, 100);
    }
    
    createMenuItemCard(item, index) {
        const card = document.createElement('div');
        card.className = 'menu-item menu-item-stagger';
        card.dataset.itemId = item.id;
        
        // إنشاء شارة الصنف
        const badges = [];
        if (item.is_new) badges.push({ text: 'جديد', class: 'badge-new' });
        if (item.is_popular) badges.push({ text: 'الأكثر طلباً', class: 'badge-popular' });
        if (item.is_vegetarian) badges.push({ text: 'نباتي', class: 'badge-vegetarian' });
        if (item.is_spicy) badges.push({ text: 'حار', class: 'badge-spicy' });
        
        const badgesHtml = badges.map(badge => 
            `<span class="item-badge ${badge.class}">${badge.text}</span>`
        ).join('');
        
        // معالجة الصورة
        const imageUrl = item.image_url || 'https://images.unsplash.com/photo-1510707577719-ae7c9b788690';
        const altText = item.name_ar || 'صورة الصنف';
        
        // معالجة الخيارات
        const options = item.options || [];
        const optionsHtml = options.slice(0, 3).map(opt => 
            `<span class="option-tag">${opt}</span>`
        ).join('');
        
        // معالجة الوصف
        const description = item.description_ar || 'لا يوجد وصف';
        const shortDescription = description.length > 100 ? 
            description.substring(0, 100) + '...' : description;
        
        card.innerHTML = `
            <div class="item-badges">
                ${badgesHtml}
            </div>
            
            <div class="item-image-container">
                <img src="${imageUrl}" alt="${altText}" class="item-image" loading="lazy">
                <div class="image-overlay"></div>
            </div>
            
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${item.name_ar}</h3>
                    <div class="item-price-container">
                        ${item.discount_price ? `
                            <span class="original-price">${item.price} ريال</span>
                            <span class="item-price">${item.discount_price} ريال</span>
                        ` : `
                            <span class="item-price">${item.price} ريال</span>
                        `}
                    </div>
                </div>
                
                <div class="item-meta">
                    ${item.preparation_time ? `
                        <span class="meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${item.preparation_time} دقيقة</span>
                        </span>
                    ` : ''}
                    
                    ${item.calories ? `
                        <span class="meta-item">
                            <i class="fas fa-fire"></i>
                            <span>${item.calories} سعرة</span>
                        </span>
                    ` : ''}
                </div>
                
                <p class="item-description">${shortDescription}</p>
                
                ${optionsHtml ? `
                    <div class="item-options">
                        ${optionsHtml}
                        ${options.length > 3 ? '<span class="option-tag">+ المزيد</span>' : ''}
                    </div>
                ` : ''}
                
                <div class="item-footer">
                    <div class="item-category">
                        <i class="${item.categories?.icon || 'fas fa-utensils'}"></i>
                        <span>${item.categories?.name_ar || 'غير مصنف'}</span>
                    </div>
                    
                    <button class="view-details-btn" data-item-id="${item.id}">
                        <i class="fas fa-eye"></i>
                        <span>عرض التفاصيل</span>
                    </button>
                </div>
            </div>
        `;
        
        // إضافة مستمع الأحداث للبطاقة
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.view-details-btn')) {
                this.showItemDetails(item.id);
            }
        });
        
        // مستمع زر التفاصيل
        card.querySelector('.view-details-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showItemDetails(item.id);
        });
        
        return card;
    }
    
    async showItemDetails(itemId) {
        try {
            const result = await this.db.getMenuItem(itemId);
            
            if (result.success) {
                this.currentItem = result.data;
                this.renderItemModal();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Show item details error:', error);
            this.showError('حدث خطأ في عرض تفاصيل الصنف');
        }
    }
    
    renderItemModal() {
        const modal = document.getElementById('itemModal');
        const body = document.getElementById('modalBody');
        
        if (!modal || !body || !this.currentItem) return;
        
        const item = this.currentItem;
        
        // معالجة الصورة
        const imageUrl = item.image_url || 'https://images.unsplash.com/photo-1510707577719-ae7c9b788690';
        
        // معالجة الخيارات
        let optionsHtml = '';
        if (item.item_options && item.item_options.length > 0) {
            optionsHtml = `
                <div class="modal-options-container">
                    <h3 class="modal-options-title">
                        <i class="fas fa-cog"></i>
                        <span>خيارات إضافية</span>
                    </h3>
                    
                    ${item.item_options.map(option => `
                        <div class="option-group">
                            <div class="option-group-title">
                                <span>${option.option_name_ar}</span>
                                ${option.is_required ? 
                                    '<span class="option-group-required">(مطلوب)</span>' : ''}
                            </div>
                            
                            <div class="option-choices">
                                ${option.option_choices.map(choice => `
                                    <div class="option-choice" data-choice-id="${choice.id}">
                                        <span class="choice-name">${choice.choice_name_ar}</span>
                                        ${choice.additional_price > 0 ? 
                                            `<span class="choice-price">+ ${choice.additional_price} ريال</span>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        body.innerHTML = `
            <div class="modal-image-container">
                <img src="${imageUrl}" alt="${item.name_ar}" class="modal-image">
            </div>
            
            <div class="modal-header">
                <h2 class="modal-title">${item.name_ar}</h2>
                <div class="modal-price-container">
                    ${item.discount_price ? `
                        <span class="modal-original-price">${item.price} ريال</span>
                        <span class="modal-price">${item.discount_price} ريال</span>
                    ` : `
                        <span class="modal-price">${item.price} ريال</span>
                    `}
                </div>
            </div>
            
            <div class="modal-meta">
                ${item.preparation_time ? `
                    <div class="modal-meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${item.preparation_time} دقيقة للتحضير</span>
                    </div>
                ` : ''}
                
                ${item.calories ? `
                    <div class="modal-meta-item">
                        <i class="fas fa-fire"></i>
                        <span>${item.calories} سعرة حرارية</span>
                    </div>
                ` : ''}
                
                ${item.is_vegetarian ? `
                    <div class="modal-meta-item">
                        <i class="fas fa-leaf"></i>
                        <span>نباتي</span>
                    </div>
                ` : ''}
                
                ${item.is_spicy ? `
                    <div class="modal-meta-item">
                        <i class="fas fa-pepper-hot"></i>
                        <span>حار</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-description">
                ${item.description_ar || 'لا يوجد وصف تفصيلي لهذا الصنف.'}
            </div>
            
            ${optionsHtml}
            
            <div class="modal-footer">
                <button class="modal-action-btn btn-favorite" id="favoriteBtn">
                    <i class="fas fa-heart"></i>
                    <span>إضافة إلى المفضلة</span>
                </button>
                
                <button class="modal-action-btn btn-close" id="closeDetailsBtn">
                    <i class="fas fa-times"></i>
                    <span>إغلاق</span>
                </button>
            </div>
        `;
        
        // إظهار المودال
        modal.style.display = 'flex';
        
        // إضافة مستمعي الأحداث
        document.getElementById('closeDetailsBtn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('favoriteBtn').addEventListener('click', () => {
            this.toggleFavorite(item.id);
        });
        
        // إضافة مستمعي الأحداث لخيارات الاختيار
        body.querySelectorAll('.option-choice').forEach(choice => {
            choice.addEventListener('click', function() {
                this.classList.toggle('selected');
            });
        });
        
        // إغلاق المودال عند النقر خارج المحتوى
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    async loadSettings() {
        try {
            const result = await this.db.getSettings();
            
            if (result.success) {
                this.settings = result.data;
                this.applySettings();
            }
        } catch (error) {
            console.error('Load settings error:', error);
        }
    }
    
    applySettings() {
        if (!this.settings) return;
        
        // تطبيق إعدادات التصميم
        const design = this.settings.design || {};
        if (design.restaurantName) {
            document.getElementById('restaurantName').textContent = design.restaurantName;
            document.getElementById('restaurantNameFooter').textContent = design.restaurantName;
        }
        
        if (design.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', design.primaryColor);
        }
        
        // تطبيق إعدادات الاتصال
        const contact = this.settings.contact || {};
        if (contact.phone) {
            document.getElementById('phone').textContent = contact.phone;
            document.getElementById('contactPhone').textContent = contact.phone;
        }
        
        if (contact.address) {
            document.getElementById('address').textContent = contact.address;
            document.getElementById('contactAddress').textContent = contact.address;
        }
        
        if (contact.email) {
            document.getElementById('contactEmail').textContent = contact.email;
        }
        
        if (contact.workingHours) {
            document.getElementById('workingHours').textContent = contact.workingHours;
        }
        
        // تطبيق وسائل التواصل الاجتماعي
        const social = this.settings.social_media || {};
        const socialLinks = document.getElementById('socialLinks');
        if (socialLinks) {
            let socialHtml = '';
            
            if (social.facebook) {
                socialHtml += `<a href="${social.facebook}" class="social-link facebook" target="_blank">
                    <i class="fab fa-facebook-f"></i>
                </a>`;
            }
            
            if (social.twitter) {
                socialHtml += `<a href="${social.twitter}" class="social-link twitter" target="_blank">
                    <i class="fab fa-twitter"></i>
                </a>`;
            }
            
            if (social.instagram) {
                socialHtml += `<a href="${social.instagram}" class="social-link instagram" target="_blank">
                    <i class="fab fa-instagram"></i>
                </a>`;
            }
            
            if (social.snapchat) {
                socialHtml += `<a href="${social.snapchat}" class="social-link snapchat" target="_blank">
                    <i class="fab fa-snapchat-ghost"></i>
                </a>`;
            }
            
            socialLinks.innerHTML = socialHtml;
        }
    }
    
    async updateCounters() {
        try {
            const result = await this.db.getAnalytics();
            
            if (result.success) {
                // يمكن تحديث العدادات في الواجهة هنا
                console.log('Analytics:', result.data);
            }
        } catch (error) {
            console.error('Update counters error:', error);
        }
    }
    
    setupEventListeners() {
        // أزرار الثيم
        document.getElementById('darkThemeBtn').addEventListener('click', () => {
            this.setTheme('dark');
        });
        
        document.getElementById('lightThemeBtn').addEventListener('click', () => {
            this.setTheme('light');
        });
        
        // البحث
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.toggleSearch();
        });
        
        document.getElementById('closeSearchBtn').addEventListener('click', () => {
            this.toggleSearch();
        });
        
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        // الأزرار العائمة
        document.getElementById('mainFab').addEventListener('click', () => {
            this.toggleFabMenu();
        });
        
        document.getElementById('scrollTopBtn').addEventListener('click', () => {
            this.scrollToTop();
        });
        
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });
        
        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareMenu();
        });
        
        document.getElementById('contactBtn').addEventListener('click', () => {
            this.showContactModal();
        });
        
        // اللغة
        document.getElementById('languageBtn').addEventListener('click', () => {
            this.toggleLanguage();
        });
        
        // إغلاق مودال الاتصال
        document.querySelector('.close-contact')?.addEventListener('click', () => {
            document.getElementById('contactModal').style.display = 'none';
        });
        
        // إدارة المفاتيح
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            if (e.key === '/' && e.ctrlKey) {
                e.preventDefault();
                this.toggleSearch();
            }
        });
        
        // التمرير
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // تحديث أزرار الثيم
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (theme === 'dark') {
            document.getElementById('darkThemeBtn').classList.add('active');
        } else {
            document.getElementById('lightThemeBtn').classList.add('active');
        }
    }
    
    toggleSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        searchOverlay.style.display = searchOverlay.style.display === 'flex' ? 'none' : 'flex';
        
        if (searchOverlay.style.display === 'flex') {
            document.getElementById('searchInput').focus();
        }
    }
    
    async handleSearch(query) {
        if (query.length < 2) {
            document.getElementById('searchResults').innerHTML = '';
            return;
        }
        
        try {
            const result = await this.db.searchMenuItems(query);
            
            if (result.success) {
                this.renderSearchResults(result.data);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }
    
    renderSearchResults(results) {
        const container = document.getElementById('searchResults');
        
        if (!results || results.length === 0) {
            container.innerHTML = `
                <div class="search-empty">
                    <i class="fas fa-search"></i>
                    <p>لا توجد نتائج للبحث</p>
                </div>
            `;
            return;
        }
        
        const resultsHtml = results.map(item => `
            <div class="search-result-item" data-item-id="${item.id}">
                <h4>${item.name_ar}</h4>
                <p>${item.categories?.name_ar || 'غير مصنف'} - ${item.price} ريال</p>
            </div>
        `).join('');
        
        container.innerHTML = resultsHtml;
        
        // إضافة مستمعي الأحداث للنتائج
        container.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const itemId = item.dataset.itemId;
                this.showItemDetails(itemId);
                this.toggleSearch();
            });
        });
    }
    
    toggleFabMenu() {
        const fabMenu = document.querySelector('.fab-menu');
        fabMenu.classList.toggle('show');
        
        // تدوير أيقونة الزر الرئيسي
        const fabIcon = document.querySelector('.main-fab i');
        fabIcon.style.transform = fabMenu.classList.contains('show') ? 'rotate(45deg)' : 'rotate(0)';
    }
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        this.toggleFabMenu();
    }
    
    async refreshData() {
        try {
            // إظهار مؤشر التحميل
            this.showLoading();
            
            // مسح التخزين المؤقت
            if (this.db.clearCache) {
                this.db.clearCache();
            }
            
            // إعادة تحميل البيانات
            await this.loadData();
            
            // إظهار رسالة النجاح
            this.showSuccess('تم تحديث البيانات بنجاح');
            
            // إخفاء قائمة FAB
            this.toggleFabMenu();
            
        } catch (error) {
            console.error('Refresh data error:', error);
            this.showError('حدث خطأ أثناء تحديث البيانات');
        }
    }
    
    shareMenu() {
        if (navigator.share) {
            navigator.share({
                title: document.getElementById('restaurantName').textContent,
                text: 'اطلع على قائمة المأكولات والمشروبات',
                url: window.location.href
            })
            .then(() => console.log('تمت المشاركة بنجاح'))
            .catch(error => console.log('خطأ في المشاركة:', error));
        } else {
            // نسخ الرابط إذا لم تكن المشاركة مدعومة
            navigator.clipboard.writeText(window.location.href)
                .then(() => this.showSuccess('تم نسخ الرابط إلى الحافظة'))
                .catch(() => this.showError('فشل نسخ الرابط'));
        }
        
        this.toggleFabMenu();
    }
    
    showContactModal() {
        document.getElementById('contactModal').style.display = 'flex';
        this.toggleFabMenu();
    }
    
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'ar' ? 'en' : 'ar';
        document.getElementById('languageBtn').querySelector('.lang-text').textContent = 
            this.currentLanguage === 'ar' ? 'EN' : 'AR';
        
        // هنا يمكن إضافة منطق تغيير اللغة
        console.log('Language changed to:', this.currentLanguage);
    }
    
    toggleFavorite(itemId) {
        const index = this.favorites.indexOf(itemId);
        const btn = document.getElementById('favoriteBtn');
        
        if (index === -1) {
            // إضافة إلى المفضلة
            this.favorites.push(itemId);
            btn.innerHTML = '<i class="fas fa-heart"></i><span>إزالة من المفضلة</span>';
            btn.classList.add('active');
            this.showSuccess('تمت الإضافة إلى المفضلة');
        } else {
            // إزالة من المفضلة
            this.favorites.splice(index, 1);
            btn.innerHTML = '<i class="fas fa-heart"></i><span>إضافة إلى المفضلة</span>';
            btn.classList.remove('active');
            this.showSuccess('تمت الإزالة من المفضلة');
        }
        
        // حفظ في التخزين المحلي
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }
    
    handleScroll() {
        // إظهار/إخفاء زر الانتقال للأعلى
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        if (window.scrollY > 300) {
            scrollTopBtn.style.display = 'flex';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    }
    
    closeAllModals() {
        document.getElementById('itemModal').style.display = 'none';
        document.getElementById('searchOverlay').style.display = 'none';
        document.getElementById('contactModal').style.display = 'none';
        document.querySelector('.fab-menu').classList.remove('show');
    }
    
    startAnimations() {
        // بدء الرسوم المتحركة للخلفية
        this.startBackgroundAnimations();
        
        // إضافة مستمع لأخطاء الصور
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', function() {
                this.src = 'https://images.unsplash.com/photo-1510707577719-ae7c9b788690';
                this.alt = 'صورة افتراضية';
            });
        });
    }
    
    startBackgroundAnimations() {
        // يمكن إضافة رسوم متحركة إضافية هنا
        console.log('Background animations started');
    }
    
    showLoading() {
        // يمكن إضافة مؤشر تحميل هنا
        console.log('Loading...');
    }
    
    showSuccess(message) {
        // يمكن إضافة رسالة نجاح هنا
        console.log('Success:', message);
        
        // عرض تنبيه مؤقت
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        // يمكن إضافة رسالة خطأ هنا
        console.error('Error:', message);
        
        // عرض تنبيه مؤقت
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type = 'info') {
        // إنشاء عنصر التنبيه
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // إضافة إلى الجسم
        document.body.appendChild(notification);
        
        // إضافة تأثير الظهور
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // إضافة مستمع لإغلاق التنبيه
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // إزالة تلقائية بعد 5 ثوانٍ
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }
    
    showCategoriesError() {
        const nav = document.getElementById('categoriesNav');
        if (nav) {
            nav.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>حدث خطأ في تحميل الفئات</p>
                    <button class="retry-btn" id="retryCategoriesBtn">
                        <i class="fas fa-redo"></i>
                        <span>إعادة المحاولة</span>
                    </button>
                </div>
            `;
            
            document.getElementById('retryCategoriesBtn').addEventListener('click', () => {
                this.loadCategories();
            });
        }
    }
    
    showMenuItemsError() {
        const grid = document.getElementById('menuGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>حدث خطأ في تحميل الأصناف</h3>
                    <p>يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى</p>
                    <button class="retry-btn" id="retryItemsBtn">
                        <i class="fas fa-redo"></i>
                        <span>إعادة المحاولة</span>
                    </button>
                </div>
            `;
            
            document.getElementById('retryItemsBtn').addEventListener('click', () => {
                this.loadMenuItems(this.currentCategory);
            });
        }
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.cafeMenuApp = new CafeMenuApp();
});

// معالجة أخطاء الصور العامة
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'https://images.unsplash.com/photo-1510707577719-ae7c9b788690';
        e.target.alt = 'صورة افتراضية';
    }
}, true);

// إضافة أنماط الإشعارات الديناميكية
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        max-width: 400px;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 9999;
        transform: translateY(-100px);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .notification-success {
        background: #D5F4E6;
        color: #27AE60;
        border-right: 4px solid #27AE60;
    }
    
    .notification-error {
        background: #FDEDEC;
        color: #E74C3C;
        border-right: 4px solid #E74C3C;
    }
    
    .notification-info {
        background: #E8F4FC;
        color: #3498DB;
        border-right: 4px solid #3498DB;
    }
    
    .notification i {
        font-size: 20px;
    }
    
    .notification span {
        flex: 1;
        font-weight: 500;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s;
    }
    
    .notification-close:hover {
        background: rgba(0,0,0,0.1);
    }
    
    @media (max-width: 576px) {
        .notification {
            left: 10px;
            right: 10px;
            max-width: none;
        }
    }
`;

document.head.appendChild(notificationStyles);
