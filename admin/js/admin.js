// ============================================
// لوحة تحكم مينو الكافيه - النسخة البسيطة
// ============================================

console.log('🚀 تحميل لوحة التحكم المبسطة...');

// ============================================
// نظام إدارة الحالة
// ============================================

const AppState = {
    currentUser: null,
    currentSection: 'dashboard',
    isLoading: false,
    
    // تحديث الحالة
    setState(updates) {
        Object.assign(this, updates);
        this.render();
    },
    
    // التهيئة
    async init() {
        console.log('🔧 بدء تهيئة التطبيق...');
        
        // التحقق من تسجيل الدخول
        await this.checkAuth();
        
        // عرض الواجهة المناسبة
        if (this.currentUser) {
            this.showAdminPanel();
        } else {
            this.showLogin();
        }
    },
    
    // التحقق من المصادقة
    async checkAuth() {
        try {
            const userData = localStorage.getItem('adminUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                return true;
            }
            return false;
        } catch (e) {
            console.warn('❌ خطأ في بيانات المستخدم:', e);
            return false;
        }
    },
    
    // تسجيل الدخول
    async login(username, password, rememberMe = true) {
        this.setState({ isLoading: true });
        
        // محاكاة التأخير
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // بيانات المستخدم الافتراضية
        this.currentUser = {
            id: 1,
            name: 'مدير النظام',
            email: 'admin@cafe.com',
            role: 'admin',
            avatar: 'م'
        };
        
        // حفظ الجلسة
        if (rememberMe) {
            localStorage.setItem('adminUser', JSON.stringify(this.currentUser));
        } else {
            sessionStorage.setItem('adminUser', JSON.stringify(this.currentUser));
        }
        
        this.setState({ isLoading: false });
        this.showAdminPanel();
    },
    
    // تسجيل الخروج
    logout() {
        localStorage.removeItem('adminUser');
        sessionStorage.removeItem('adminUser');
        this.currentUser = null;
        this.showLogin();
    },
    
    // تغيير القسم
    navigateTo(section) {
        this.setState({ currentSection: section });
    },
    
    // ========== عرض الواجهات ==========
    
    // عرض تسجيل الدخول
    showLogin() {
        const app = document.getElementById('app');
        if (!app) return;
        
        app.innerHTML = `
            <div class="login-page">
                <div class="login-container">
                    <div class="login-box">
                        <div class="logo">
                            <i class="fas fa-coffee"></i>
                            <h2>تسجيل الدخول</h2>
                            <p>لوحة تحكم مينو الكافيه</p>
                        </div>
                        
                        <form id="loginForm" class="login-form">
                            <div class="input-group">
                                <i class="fas fa-user"></i>
                                <input type="text" id="username" placeholder="اسم المستخدم" value="admin" required>
                            </div>
                            
                            <div class="input-group">
                                <i class="fas fa-lock"></i>
                                <input type="password" id="password" placeholder="كلمة المرور" value="admin123" required>
                                <button type="button" class="show-password" id="showPassword">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            
                            <div class="form-options">
                                <label class="checkbox">
                                    <input type="checkbox" id="remember" checked>
                                    <span>تذكرني</span>
                                </label>
                            </div>
                            
                            <button type="submit" class="login-button" ${this.isLoading ? 'disabled' : ''}>
                                ${this.isLoading ? '<i class="fas fa-spinner fa-spin"></i> جاري الدخول...' : '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول'}
                            </button>
                            
                            <div class="login-footer">
                                <p>بيانات الدخول الافتراضية: <strong>admin</strong> / <strong>admin123</strong></p>
                            </div>
                        </form>
                        
                        <div class="demo-notice">
                            <i class="fas fa-info-circle"></i>
                            <p>نسخة تجريبية - للاستخدام الداخلي فقط</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إعداد الأحداث
        this.setupLoginEvents();
    },
    
    // عرض لوحة التحكم
    showAdminPanel() {
        const app = document.getElementById('app');
        if (!app) return;
        
        app.innerHTML = `
            <div class="admin-layout">
                <!-- الهيدر -->
                <header class="admin-header">
                    <div class="header-left">
                        <button class="menu-toggle" id="menuToggle">
                            <i class="fas fa-bars"></i>
                        </button>
                        <h1 class="logo-text">
                            <i class="fas fa-coffee"></i>
                            مينو الكافيه
                        </h1>
                    </div>
                    
                    <div class="header-right">
                        <div class="user-menu" id="userMenu">
                            <div class="user-avatar">
                                ${this.currentUser?.avatar || 'م'}
                            </div>
                            <div class="user-info">
                                <span class="user-name">${this.currentUser?.name || 'مدير'}</span>
                                <span class="user-role">${this.currentUser?.role === 'admin' ? 'مدير النظام' : 'مستخدم'}</span>
                            </div>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        
                        <div class="header-actions">
                            <button class="action-btn" title="تحديث" onclick="AppState.refresh()">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <button class="action-btn" title="ملء الشاشة" onclick="AppState.toggleFullscreen()">
                                <i class="fas fa-expand"></i>
                            </button>
                        </div>
                    </div>
                </header>
                
                <!-- المحتوى الرئيسي -->
                <div class="admin-main">
                    <!-- الشريط الجانبي -->
                    <aside class="sidebar" id="sidebar">
                        <nav class="sidebar-nav">
                            <a href="#dashboard" class="nav-item ${this.currentSection === 'dashboard' ? 'active' : ''}" 
                               onclick="AppState.navigateTo('dashboard')">
                                <i class="fas fa-tachometer-alt"></i>
                                <span>لوحة التحكم</span>
                            </a>
                            
                            <a href="#items" class="nav-item ${this.currentSection === 'items' ? 'active' : ''}" 
                               onclick="AppState.navigateTo('items')">
                                <i class="fas fa-utensils"></i>
                                <span>إدارة الأصناف</span>
                                <span class="badge">24</span>
                            </a>
                            
                            <a href="#categories" class="nav-item ${this.currentSection === 'categories' ? 'active' : ''}" 
                               onclick="AppState.navigateTo('categories')">
                                <i class="fas fa-list"></i>
                                <span>إدارة الفئات</span>
                                <span class="badge">6</span>
                            </a>
                            
                            <div class="nav-divider"></div>
                            
                            <a href="#design" class="nav-item ${this.currentSection === 'design' ? 'active' : ''}" 
                               onclick="AppState.navigateTo('design')">
                                <i class="fas fa-palette"></i>
                                <span>التصميم</span>
                            </a>
                            
                            <a href="#settings" class="nav-item ${this.currentSection === 'settings' ? 'active' : ''}" 
                               onclick="AppState.navigateTo('settings')">
                                <i class="fas fa-cog"></i>
                                <span>الإعدادات</span>
                            </a>
                            
                            <div class="nav-divider"></div>
                            
                            <a href="#logout" class="nav-item logout" onclick="AppState.logout()">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>تسجيل الخروج</span>
                            </a>
                        </nav>
                    </aside>
                    
                    <!-- المحتوى -->
                    <main class="content" id="content">
                        ${this.renderContent()}
                    </main>
                </div>
                
                <!-- الفوتر -->
                <footer class="admin-footer">
                    <p>© ${new Date().getFullYear()} نظام مينو الكافيه - الإصدار 1.0.0</p>
                    <p>${new Date().toLocaleDateString('ar-SA')}</p>
                </footer>
                
                <!-- رسالة التحميل -->
                ${this.isLoading ? `
                    <div class="loading-overlay">
                        <div class="loading-spinner"></div>
                        <p>جاري التحميل...</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        // إعداد أحداث لوحة التحكم
        this.setupAdminEvents();
    },
    
    // عرض محتوى القسم
    renderContent() {
        switch (this.currentSection) {
            case 'dashboard':
                return this.renderDashboard();
            case 'items':
                return this.renderItems();
            case 'categories':
                return this.renderCategories();
            case 'design':
                return this.renderDesign();
            case 'settings':
                return this.renderSettings();
            default:
                return this.renderDashboard();
        }
    },
    
    // عرض لوحة التحكم
    renderDashboard() {
        return `
            <div class="content-header">
                <h1><i class="fas fa-tachometer-alt"></i> لوحة التحكم</h1>
                <p>مرحباً بك في لوحة تحكم نظام مينو الكافيه</p>
            </div>
            
            <div class="welcome-card">
                <div class="welcome-icon">
                    <i class="fas fa-coffee"></i>
                </div>
                <div class="welcome-content">
                    <h2>مرحباً ${this.currentUser?.name || 'مدير النظام'}!</h2>
                    <p>يمكنك من خلال هذه اللوحة إدارة جميع جوانب تطبيق مينو الكافيه</p>
                </div>
            </div>
            
            <!-- بطاقات الإحصائيات -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon bg-blue">
                        <i class="fas fa-utensils"></i>
                    </div>
                    <div class="stat-info">
                        <h3>إجمالي الأصناف</h3>
                        <p class="stat-number">24</p>
                        <p class="stat-change">+3 هذا الأسبوع</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon bg-green">
                        <i class="fas fa-list"></i>
                    </div>
                    <div class="stat-info">
                        <h3>إجمالي الفئات</h3>
                        <p class="stat-number">6</p>
                        <p class="stat-change">جميعها نشطة</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon bg-purple">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="stat-info">
                        <h3>الأصناف المشهورة</h3>
                        <p class="stat-number">8</p>
                        <p class="stat-change">الأكثر طلباً</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon bg-orange">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-info">
                        <h3>الطلبات اليوم</h3>
                        <p class="stat-number">42</p>
                        <p class="stat-change">+12 عن الأمس</p>
                    </div>
                </div>
            </div>
            
            <!-- المحتوى السريع -->
            <div class="quick-actions">
                <h3>إجراءات سريعة</h3>
                <div class="actions-grid">
                    <button class="action-card" onclick="AppState.navigateTo('items')">
                        <i class="fas fa-plus"></i>
                        <span>إضافة صنف جديد</span>
                    </button>
                    
                    <button class="action-card" onclick="AppState.navigateTo('categories')">
                        <i class="fas fa-folder-plus"></i>
                        <span>إضافة فئة جديدة</span>
                    </button>
                    
                    <button class="action-card" onclick="AppState.navigateTo('design')">
                        <i class="fas fa-palette"></i>
                        <span>تعديل التصميم</span>
                    </button>
                    
                    <button class="action-card" onclick="AppState.navigateTo('settings')">
                        <i class="fas fa-sliders-h"></i>
                        <span>الإعدادات العامة</span>
                    </button>
                </div>
            </div>
        `;
    },
    
    // عرض إدارة الأصناف
    renderItems() {
        return `
            <div class="content-header">
                <h1><i class="fas fa-utensils"></i> إدارة الأصناف</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="AppState.showModal('add-item')">
                        <i class="fas fa-plus"></i> إضافة صنف جديد
                    </button>
                </div>
            </div>
            
            <!-- البحث والتصفية -->
            <div class="search-bar">
                <div class="search-input">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="ابحث عن صنف...">
                </div>
                
                <div class="filter-group">
                    <select class="filter-select">
                        <option value="">جميع الفئات</option>
                        <option value="1">المشروبات الساخنة</option>
                        <option value="2">المشروبات الباردة</option>
                        <option value="3">الحلويات</option>
                        <option value="4">الوجبات الخفيفة</option>
                    </select>
                    
                    <select class="filter-select">
                        <option value="">جميع الحالات</option>
                        <option value="available">متاح</option>
                        <option value="unavailable">غير متاح</option>
                        <option value="popular">مشهور</option>
                    </select>
                </div>
            </div>
            
            <!-- جدول الأصناف -->
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>الصورة</th>
                            <th>الاسم</th>
                            <th>الفئة</th>
                            <th>السعر</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><div class="image-placeholder"><i class="fas fa-image"></i></div></td>
                            <td>قهوة إسبريسو</td>
                            <td>المشروبات الساخنة</td>
                            <td><span class="price">15 ر.س</span></td>
                            <td><span class="status available">متاح</span></td>
                            <td>
                                <button class="action-icon" title="تعديل"><i class="fas fa-edit"></i></button>
                                <button class="action-icon" title="حذف"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                        <tr>
                            <td><div class="image-placeholder"><i class="fas fa-image"></i></div></td>
                            <td>كابتشينو</td>
                            <td>المشروبات الساخنة</td>
                            <td><span class="price">18 ر.س</span></td>
                            <td><span class="status popular">مشهور</span></td>
                            <td>
                                <button class="action-icon" title="تعديل"><i class="fas fa-edit"></i></button>
                                <button class="action-icon" title="حذف"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                        <tr>
                            <td><div class="image-placeholder"><i class="fas fa-image"></i></div></td>
                            <td>كيك الشوكولاتة</td>
                            <td>الحلويات</td>
                            <td><span class="price">25 ر.س</span></td>
                            <td><span class="status available">متاح</span></td>
                            <td>
                                <button class="action-icon" title="تعديل"><i class="fas fa-edit"></i></button>
                                <button class="action-icon" title="حذف"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- التصفح -->
            <div class="pagination">
                <button class="page-btn" disabled>السابق</button>
                <span class="page-info">الصفحة 1 من 5</span>
                <button class="page-btn">التالي</button>
            </div>
        `;
    },
    
    // عرض إدارة الفئات
    renderCategories() {
        return `
            <div class="content-header">
                <h1><i class="fas fa-list"></i> إدارة الفئات</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="AppState.showModal('add-category')">
                        <i class="fas fa-plus"></i> إضافة فئة جديدة
                    </button>
                </div>
            </div>
            
            <!-- شبكة الفئات -->
            <div class="categories-grid">
                <div class="category-card">
                    <div class="category-icon">
                        <i class="fas fa-coffee"></i>
                    </div>
                    <div class="category-info">
                        <h3>المشروبات الساخنة</h3>
                        <p>12 صنف</p>
                        <div class="category-actions">
                            <button class="btn-sm"><i class="fas fa-edit"></i> تعديل</button>
                            <button class="btn-sm danger"><i class="fas fa-trash"></i> حذف</button>
                        </div>
                    </div>
                </div>
                
                <div class="category-card">
                    <div class="category-icon">
                        <i class="fas fa-glass-whiskey"></i>
                    </div>
                    <div class="category-info">
                        <h3>المشروبات الباردة</h3>
                        <p>8 أصناف</p>
                        <div class="category-actions">
                            <button class="btn-sm"><i class="fas fa-edit"></i> تعديل</button>
                            <button class="btn-sm danger"><i class="fas fa-trash"></i> حذف</button>
                        </div>
                    </div>
                </div>
                
                <div class="category-card">
                    <div class="category-icon">
                        <i class="fas fa-cookie-bite"></i>
                    </div>
                    <div class="category-info">
                        <h3>الحلويات</h3>
                        <p>15 صنف</p>
                        <div class="category-actions">
                            <button class="btn-sm"><i class="fas fa-edit"></i> تعديل</button>
                            <button class="btn-sm danger"><i class="fas fa-trash"></i> حذف</button>
                        </div>
                    </div>
                </div>
                
                <div class="category-card">
                    <div class="category-icon">
                        <i class="fas fa-hamburger"></i>
                    </div>
                    <div class="category-info">
                        <h3>الوجبات الخفيفة</h3>
                        <p>10 أصناف</p>
                        <div class="category-actions">
                            <button class="btn-sm"><i class="fas fa-edit"></i> تعديل</button>
                            <button class="btn-sm danger"><i class="fas fa-trash"></i> حذف</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // عرض التصميم
    renderDesign() {
        return `
            <div class="content-header">
                <h1><i class="fas fa-palette"></i> التصميم والألوان</h1>
                <div class="header-actions">
                    <button class="btn btn-success" onclick="AppState.showNotification('تم حفظ التصميم بنجاح', 'success')">
                        <i class="fas fa-save"></i> حفظ التغييرات
                    </button>
                </div>
            </div>
            
            <div class="design-container">
                <div class="design-section">
                    <h3>ألوان التطبيق</h3>
                    
                    <div class="color-picker-group">
                        <div class="color-picker">
                            <label>اللون الأساسي</label>
                            <div class="color-input">
                                <input type="color" value="#3498db">
                                <span>#3498db</span>
                            </div>
                        </div>
                        
                        <div class="color-picker">
                            <label>اللون الثانوي</label>
                            <div class="color-input">
                                <input type="color" value="#2ecc71">
                                <span>#2ecc71</span>
                            </div>
                        </div>
                        
                        <div class="color-picker">
                            <label>لون الخلفية</label>
                            <div class="color-input">
                                <input type="color" value="#f8f9fa">
                                <span>#f8f9fa</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="design-section">
                    <h3>إعدادات التصميم</h3>
                    
                    <div class="design-options">
                        <div class="option-group">
                            <label>
                                <input type="checkbox" checked>
                                <span>الوضع الفاتح</span>
                            </label>
                            
                            <label>
                                <input type="checkbox">
                                <span>الوضع الداكن</span>
                            </label>
                        </div>
                        
                        <div class="option-group">
                            <label>
                                <input type="checkbox" checked>
                                <span>ظلال العناصر</span>
                            </label>
                            
                            <label>
                                <input type="checkbox">
                                <span>الرسوم المتحركة</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // عرض الإعدادات
    renderSettings() {
        return `
            <div class="content-header">
                <h1><i class="fas fa-cog"></i> الإعدادات العامة</h1>
                <div class="header-actions">
                    <button class="btn btn-success" onclick="AppState.showNotification('تم حفظ الإعدادات بنجاح', 'success')">
                        <i class="fas fa-save"></i> حفظ الإعدادات
                    </button>
                </div>
            </div>
            
            <div class="settings-container">
                <div class="settings-section">
                    <h3>إعدادات المطعم</h3>
                    
                    <div class="form-group">
                        <label>اسم المطعم</label>
                        <input type="text" value="مينو الكافيه" placeholder="أدخل اسم المطعم">
                    </div>
                    
                    <div class="form-group">
                        <label>شعار المطعم</label>
                        <input type="text" value="أجود أنواع القهوة والحلويات" placeholder="أدخل شعار المطعم">
                    </div>
                    
                    <div class="form-group">
                        <label>العملة</label>
                        <select>
                            <option value="SAR" selected>ريال سعودي (ر.س)</option>
                            <option value="USD">دولار ($)</option>
                            <option value="EUR">يورو (€)</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>إعدادات النظام</h3>
                    
                    <div class="form-group">
                        <label>اللغة</label>
                        <select>
                            <option value="ar" selected>العربية</option>
                            <option value="en">الإنجليزية</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>نسبة الضريبة (%)</label>
                        <input type="number" value="15" min="0" max="100">
                    </div>
                    
                    <div class="form-group">
                        <label>رسوم الخدمة (%)</label>
                        <input type="number" value="10" min="0" max="100">
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>إدارة النظام</h3>
                    
                    <div class="system-actions">
                        <button class="btn btn-primary">
                            <i class="fas fa-database"></i> نسخ احتياطي
                        </button>
                        
                        <button class="btn btn-warning">
                            <i class="fas fa-redo"></i> إعادة تعيين
                        </button>
                        
                        <button class="btn btn-danger">
                            <i class="fas fa-trash"></i> مسح البيانات
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ========== الدوال المساعدة ==========
    
    setupLoginEvents() {
        const loginForm = document.getElementById('loginForm');
        const showPasswordBtn = document.getElementById('showPassword');
        
        if (showPasswordBtn) {
            showPasswordBtn.addEventListener('click', function() {
                const passwordInput = document.getElementById('password');
                const icon = this.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    passwordInput.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        }
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const rememberMe = document.getElementById('remember').checked;
                
                if (!username || !password) {
                    this.showNotification('يرجى إدخال اسم المستخدم وكلمة المرور', 'error');
                    return;
                }
                
                if (username === 'admin' && password === 'admin123') {
                    await this.login(username, password, rememberMe);
                    this.showNotification('تم تسجيل الدخول بنجاح', 'success');
                } else {
                    this.showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
                }
            });
        }
    },
    
    setupAdminEvents() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('collapsed');
            });
        }
        
        // قائمة المستخدم
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.addEventListener('click', function() {
                alert('قائمة المستخدم - قيد التطوير');
            });
        }
    },
    
    // عرض الإشعارات
    showNotification(message, type = 'info') {
        if (window.Swal) {
            Swal.fire({
                title: type === 'success' ? 'نجاح' : type === 'error' ? 'خطأ' : 'معلومات',
                text: message,
                icon: type,
                timer: 3000,
                showConfirmButton: false
            });
        } else {
            alert(message);
        }
    },
    
    // عرض نافذة منبثقة
    showModal(type) {
        let title = '';
        let content = '';
        
        switch (type) {
            case 'add-item':
                title = 'إضافة صنف جديد';
                content = `
                    <div class="modal-content">
                        <p>نموذج إضافة صنف جديد - قيد التطوير</p>
                        <p>سيتم إضافة هذه الميزة قريباً</p>
                    </div>
                `;
                break;
            case 'add-category':
                title = 'إضافة فئة جديدة';
                content = `
                    <div class="modal-content">
                        <p>نموذج إضافة فئة جديدة - قيد التطوير</p>
                        <p>سيتم إضافة هذه الميزة قريباً</p>
                    </div>
                `;
                break;
        }
        
        if (window.Swal) {
            Swal.fire({
                title: title,
                html: content,
                showCancelButton: true,
                confirmButtonText: 'حفظ',
                cancelButtonText: 'إلغاء'
            });
        } else {
            alert(title + ': ' + 'قيد التطوير');
        }
    },
    
    // تحديث البيانات
    refresh() {
        this.setState({ isLoading: true });
        
        setTimeout(() => {
            this.setState({ isLoading: false });
            this.showNotification('تم تحديث البيانات بنجاح', 'success');
        }, 1000);
    },
    
    // ملء الشاشة
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    },
    
    // عرض واجهة المستخدم
    render() {
        if (this.currentUser) {
            this.showAdminPanel();
        }
    }
};

// ============================================
// التهيئة التلقائية
// ============================================

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 تم تحميل الصفحة، جاري تهيئة التطبيق...');
    
    // تأخير بسيط لضمان تحميل جميع السكريبتات
    setTimeout(() => {
        AppState.init();
    }, 500);
});

// جعل AppState متاحة عالمياً
window.AppState = AppState;

console.log('✅ تم تحميل لوحة التحكم المبسطة بنجاح');
