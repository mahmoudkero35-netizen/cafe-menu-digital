// ============================================
// ملف لوحة التحكم الرئيسي - الإصدار النهائي
// ============================================

// تعريف الكلاس الرئيسي
class AdminPanel {
    constructor() {
        console.log('🚀 إنشاء نسخة جديدة من لوحة التحكم');
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isSidebarCollapsed = false;
    }

    // دالة التهيئة الرئيسية
    async init() {
        try {
            console.log('🔧 بدء تهيئة لوحة التحكم...');
            
            // التحقق من توفر الخدمات
            if (!this.checkRequiredServices()) {
                return;
            }
            
            // التحقق من حالة تسجيل الدخول
            const isLoggedIn = await this.checkLoginStatus();
            
            if (isLoggedIn) {
                await this.loadAdminPanel();
            } else {
                this.showLoginPanel();
            }
            
            console.log('✅ تم تهيئة لوحة التحكم بنجاح');
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة لوحة التحكم:', error);
            this.showMessage('خطأ', `فشل تهيئة لوحة التحكم: ${error.message}`, 'error');
        }
    }
    
    // التحقق من توفر الخدمات المطلوبة
    checkRequiredServices() {
        const required = [
            { name: 'supabaseClient', obj: window.supabaseClient },
            { name: 'databaseService', obj: window.databaseService },
            { name: 'supabaseStorage', obj: window.supabaseStorage }
        ];
        
        const missing = required.filter(service => !service.obj);
        
        if (missing.length > 0) {
            const missingNames = missing.map(m => m.name).join(', ');
            console.error(`❌ خدمات مفقودة: ${missingNames}`);
            this.showMessage('خطأ', `الخدمات التالية غير متوفرة: ${missingNames}`, 'error');
            return false;
        }
        
        return true;
    }
    
    // التحقق من حالة تسجيل الدخول
    async checkLoginStatus() {
        try {
            // التحقق من localStorage
            const userData = localStorage.getItem('adminUser');
            const token = localStorage.getItem('adminToken');
            
            if (!userData || !token) {
                return false;
            }
            
            // محاولة تحليل البيانات
            try {
                this.currentUser = JSON.parse(userData);
                return true;
            } catch (e) {
                console.warn('❌ بيانات المستخدم غير صالحة:', e);
                localStorage.removeItem('adminUser');
                localStorage.removeItem('adminToken');
                return false;
            }
            
        } catch (error) {
            console.error('❌ خطأ في التحقق من تسجيل الدخول:', error);
            return false;
        }
    }
    
    // إظهار لوحة تسجيل الدخول
    showLoginPanel() {
        const loginContainer = document.getElementById('loginContainer');
        const adminContainer = document.getElementById('adminContainer');
        
        if (loginContainer) {
            loginContainer.style.display = 'flex';
            this.setupLoginEvents();
        }
        
        if (adminContainer) {
            adminContainer.style.display = 'none';
        }
    }
    
    // إعداد أحداث تسجيل الدخول
    setupLoginEvents() {
        const loginForm = document.getElementById('loginForm');
        const showPasswordBtn = document.getElementById('showPasswordBtn');
        
        if (!loginForm) return;
        
        // إعادة تعيين النموذج
        loginForm.reset();
        
        // إظهار/إخفاء كلمة المرور
        if (showPasswordBtn) {
            showPasswordBtn.addEventListener('click', () => {
                const passwordInput = document.getElementById('password');
                const icon = showPasswordBtn.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    passwordInput.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        }
        
        // معالجة تسجيل الدخول
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
        
        // ملء بيانات الاختبار
        document.getElementById('username').value = 'admin';
        document.getElementById('password').value = 'admin123';
    }
    
    // معالجة تسجيل الدخول
    async handleLogin() {
        try {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe')?.checked || false;
            
            if (!username || !password) {
                this.showMessage('تحذير', 'يرجى إدخال اسم المستخدم وكلمة المرور', 'warning');
                return;
            }
            
            // إظهار مؤشر التحميل
            this.showLoading('جاري تسجيل الدخول...');
            
            // محاكاة تسجيل الدخول (سيتم استبدالها بخدمة حقيقية)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // بيانات مستخدم افتراضية للتجربة
            this.currentUser = {
                id: 1,
                full_name_ar: 'مدير النظام',
                email: 'admin@cafe.com',
                role: 'admin',
                created_at: new Date().toISOString()
            };
            
            // حفظ في التخزين
            if (rememberMe) {
                localStorage.setItem('adminUser', JSON.stringify(this.currentUser));
                localStorage.setItem('adminToken', btoa(JSON.stringify({
                    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // أسبوع
                })));
            } else {
                sessionStorage.setItem('adminUser', JSON.stringify(this.currentUser));
                sessionStorage.setItem('adminToken', btoa(JSON.stringify({
                    exp: Date.now() + (24 * 60 * 60 * 1000) // يوم
                })));
            }
            
            // إخفاء مؤشر التحميل
            this.hideLoading();
            
            // إظهار رسالة النجاح
            this.showMessage('نجاح', 'تم تسجيل الدخول بنجاح!', 'success');
            
            // تحميل لوحة التحكم
            await this.loadAdminPanel();
            
        } catch (error) {
            console.error('❌ خطأ في تسجيل الدخول:', error);
            this.hideLoading();
            this.showMessage('خطأ', 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.', 'error');
        }
    }
    
    // تحميل لوحة التحكم
    async loadAdminPanel() {
        try {
            console.log('📊 تحميل لوحة التحكم...');
            
            // إخفاء تسجيل الدخول
            const loginContainer = document.getElementById('loginContainer');
            if (loginContainer) loginContainer.style.display = 'none';
            
            // إنشاء واجهة لوحة التحكم
            await this.createAdminInterface();
            
            // إظهار لوحة التحكم
            const adminContainer = document.getElementById('adminContainer');
            if (adminContainer) {
                adminContainer.style.display = 'block';
                adminContainer.innerHTML = this.getAdminHTML();
            }
            
            // إعداد الأحداث
            this.setupAdminEvents();
            
            // تحميل البيانات الأولية
            await this.loadInitialData();
            
            console.log('✅ تم تحميل لوحة التحكم بنجاح');
            
        } catch (error) {
            console.error('❌ خطأ في تحميل لوحة التحكم:', error);
            this.showMessage('خطأ', `فشل تحميل لوحة التحكم: ${error.message}`, 'error');
        }
    }
    
    // إنشاء HTML لوحة التحكم
    getAdminHTML() {
        return `
            <!-- الهيدر -->
            <header class="admin-header">
                <div class="header-top">
                    <div class="header-left">
                        <button class="menu-toggle" id="menuToggle">
                            <i class="fas fa-bars"></i>
                        </button>
                        <h1 class="header-title">
                            <i class="fas fa-coffee"></i>
                            لوحة تحكم مينو الكافيه
                        </h1>
                    </div>
                    
                    <div class="header-right">
                        <div class="user-info" id="userInfo">
                            <div class="user-avatar">
                                ${this.currentUser?.full_name_ar?.charAt(0) || 'م'}
                            </div>
                            <div class="user-details">
                                <span class="user-name">${this.currentUser?.full_name_ar || 'مدير النظام'}</span>
                                <span class="user-role">${this.getRoleName(this.currentUser?.role)}</span>
                            </div>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        
                        <div class="header-actions">
                            <button class="header-btn" id="refreshBtn" title="تحديث">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <button class="header-btn" id="fullscreenBtn" title="ملء الشاشة">
                                <i class="fas fa-expand"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- شريط الإحصائيات -->
                <div class="stats-bar" id="statsBar">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-utensils"></i>
                        </div>
                        <div class="stat-details">
                            <h3>إجمالي الأصناف</h3>
                            <div class="stat-number">0</div>
                            <div class="stat-change">
                                <i class="fas fa-sync"></i>
                                <span>جاري التحميل...</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-list"></i>
                        </div>
                        <div class="stat-details">
                            <h3>إجمالي الفئات</h3>
                            <div class="stat-number">0</div>
                            <div class="stat-change">
                                <i class="fas fa-sync"></i>
                                <span>جاري التحميل...</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="stat-details">
                            <h3>الأصناف المشهورة</h3>
                            <div class="stat-number">0</div>
                            <div class="stat-change">
                                <i class="fas fa-sync"></i>
                                <span>جاري التحميل...</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-details">
                            <h3>الطلبات اليوم</h3>
                            <div class="stat-number">0</div>
                            <div class="stat-change">
                                <i class="fas fa-sync"></i>
                                <span>جاري التحميل...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <!-- المحتوى الرئيسي -->
            <div class="admin-main">
                <!-- الشريط الجانبي -->
                <aside class="admin-sidebar" id="adminSidebar">
                    <div class="sidebar-header">
                        <i class="fas fa-bars"></i>
                        <h3>القائمة الرئيسية</h3>
                    </div>
                    
                    <nav class="sidebar-menu">
                        <a href="#" class="menu-item active" data-section="dashboard">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>لوحة التحكم</span>
                        </a>
                        
                        <a href="#" class="menu-item" data-section="items">
                            <i class="fas fa-utensils"></i>
                            <span>إدارة الأصناف</span>
                            <span class="menu-badge">0</span>
                        </a>
                        
                        <a href="#" class="menu-item" data-section="categories">
                            <i class="fas fa-list"></i>
                            <span>إدارة الفئات</span>
                            <span class="menu-badge">0</span>
                        </a>
                        
                        <div class="menu-divider"></div>
                        
                        <a href="#" class="menu-item" data-section="design">
                            <i class="fas fa-palette"></i>
                            <span>التصميم</span>
                        </a>
                        
                        <a href="#" class="menu-item" data-section="settings">
                            <i class="fas fa-cog"></i>
                            <span>الإعدادات</span>
                        </a>
                        
                        <div class="menu-divider"></div>
                        
                        <a href="#" class="menu-item logout" id="logoutBtn">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>تسجيل الخروج</span>
                        </a>
                    </nav>
                </aside>
                
                <!-- المحتوى -->
                <main class="admin-content" id="adminContent">
                    <div class="content-header">
                        <h1><i class="fas fa-tachometer-alt"></i> لوحة التحكم</h1>
                        <p>مرحباً بك في لوحة تحكم نظام مينو الكافيه</p>
                    </div>
                    
                    <div class="welcome-card">
                        <div class="welcome-icon">
                            <i class="fas fa-coffee"></i>
                        </div>
                        <div class="welcome-content">
                            <h2>مرحباً ${this.currentUser?.full_name_ar || 'مدير النظام'}!</h2>
                            <p>يمكنك من خلال هذه اللوحة إدارة جميع جوانب تطبيق مينو الكافيه</p>
                            <div class="welcome-actions">
                                <button class="btn btn-primary" id="quickAddBtn">
                                    <i class="fas fa-plus"></i> إضافة صنف جديد
                                </button>
                                <button class="btn btn-secondary" id="viewStatsBtn">
                                    <i class="fas fa-chart-bar"></i> عرض الإحصائيات
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quick-links">
                        <h3>روابط سريعة</h3>
                        <div class="links-grid">
                            <a href="#" class="link-card" data-section="items">
                                <i class="fas fa-utensils"></i>
                                <span>إدارة الأصناف</span>
                            </a>
                            <a href="#" class="link-card" data-section="categories">
                                <i class="fas fa-list"></i>
                                <span>إدارة الفئات</span>
                            </a>
                            <a href="#" class="link-card" data-section="design">
                                <i class="fas fa-palette"></i>
                                <span>تعديل التصميم</span>
                            </a>
                            <a href="#" class="link-card" data-section="settings">
                                <i class="fas fa-cog"></i>
                                <span>الإعدادات العامة</span>
                            </a>
                        </div>
                    </div>
                </main>
            </div>
            
            <!-- الفوتر -->
            <footer class="admin-footer">
                <p>نظام مينو الكافيه الرقمي &copy; ${new Date().getFullYear()}</p>
                <p>الإصدار 1.0.0 | ${new Date().toLocaleDateString('ar-SA')}</p>
            </footer>
            
            <!-- رسائل التحميل -->
            <div id="loadingOverlay" style="display: none;">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p id="loadingMessage">جاري التحميل...</p>
                </div>
            </div>
        `;
    }
    
    // إعداد أحداث لوحة التحكم
    setupAdminEvents() {
        // تبديل القائمة الجانبية
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        // تحديث البيانات
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
        
        // ملء الشاشة
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // التنقل بين الأقسام
        document.querySelectorAll('.menu-item[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });
        
        // الروابط السريعة
        document.querySelectorAll('.link-card').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });
        
        // تسجيل الخروج
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
        
        // معلومات المستخدم
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.addEventListener('click', () => this.showUserMenu());
        }
        
        // الأزرار السريعة
        const quickAddBtn = document.getElementById('quickAddBtn');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => this.showSection('items'));
        }
        
        const viewStatsBtn = document.getElementById('viewStatsBtn');
        if (viewStatsBtn) {
            viewStatsBtn.addEventListener('click', () => this.showSection('dashboard'));
        }
    }
    
    // تحميل البيانات الأولية
    async loadInitialData() {
        try {
            console.log('📥 جاري تحميل البيانات الأولية...');
            
            // تحديث الإحصائيات
            await this.updateStats();
            
            // تحديث العدادات
            await this.updateBadges();
            
            console.log('✅ تم تحميل البيانات الأولية');
            
        } catch (error) {
            console.error('❌ خطأ في تحميل البيانات الأولية:', error);
        }
    }
    
    // تحديث الإحصائيات
    async updateStats() {
        try {
            // محاكاة بيانات للإحصائيات
            const stats = {
                totalItems: 24,
                totalCategories: 6,
                popularItems: 8,
                todayOrders: 42
            };
            
            // تحديث واجهة المستخدم
            const statCards = document.querySelectorAll('.stat-card');
            statCards[0].querySelector('.stat-number').textContent = stats.totalItems;
            statCards[1].querySelector('.stat-number').textContent = stats.totalCategories;
            statCards[2].querySelector('.stat-number').textContent = stats.popularItems;
            statCards[3].querySelector('.stat-number').textContent = stats.todayOrders;
            
            // تحديث النصوص
            statCards.forEach(card => {
                const changeText = card.querySelector('.stat-change span');
                if (changeText) {
                    changeText.textContent = 'محدث الآن';
                }
            });
            
        } catch (error) {
            console.error('❌ خطأ في تحديث الإحصائيات:', error);
        }
    }
    
    // تحديث العدادات
    async updateBadges() {
        try {
            const badges = document.querySelectorAll('.menu-badge');
            badges[0].textContent = '24'; // الأصناف
            badges[1].textContent = '6';  // الفئات
        } catch (error) {
            console.error('❌ خطأ في تحديث العدادات:', error);
        }
    }
    
    // إظهار قسم معين
    async showSection(section) {
        try {
            console.log(`📂 جاري تحميل القسم: ${section}`);
            
            // تحديث القائمة النشطة
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.section === section) {
                    item.classList.add('active');
                }
            });
            
            // تحميل محتوى القسم
            const content = document.getElementById('adminContent');
            
            // إظهار مؤشر التحميل
            this.showLoading(`جاري تحميل ${this.getSectionName(section)}...`);
            
            // محاكاة تحميل البيانات
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // إخفاء مؤشر التحميل
            this.hideLoading();
            
            // تحديث المحتوى
            content.innerHTML = this.getSectionContent(section);
            
            // إعداد أحداث القسم الجديد
            this.setupSectionEvents(section);
            
            console.log(`✅ تم تحميل القسم: ${section}`);
            
        } catch (error) {
            console.error(`❌ خطأ في تحميل القسم ${section}:`, error);
            this.hideLoading();
            this.showMessage('خطأ', `فشل تحميل القسم: ${section}`, 'error');
        }
    }
    
    // الحصول على اسم القسم
    getSectionName(section) {
        const sections = {
            dashboard: 'لوحة التحكم',
            items: 'إدارة الأصناف',
            categories: 'إدارة الفئات',
            design: 'التصميم',
            settings: 'الإعدادات'
        };
        return sections[section] || section;
    }
    
    // الحصول على محتوى القسم
    getSectionContent(section) {
        switch (section) {
            case 'dashboard':
                return this.getDashboardContent();
            case 'items':
                return this.getItemsContent();
            case 'categories':
                return this.getCategoriesContent();
            case 'design':
                return this.getDesignContent();
            case 'settings':
                return this.getSettingsContent();
            default:
                return `<div class="alert alert-warning">القسم غير متوفر حالياً</div>`;
        }
    }
    
    // محتوى لوحة التحكم
    getDashboardContent() {
        return `
            <div class="content-header">
                <h1><i class="fas fa-tachometer-alt"></i> لوحة التحكم</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" id="refreshDashboardBtn">
                        <i class="fas fa-sync"></i> تحديث
                    </button>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3><i class="fas fa-chart-bar"></i> نظرة عامة</h3>
                    <p>مرحباً بك في لوحة تحكم نظام مينو الكافيه. استخدم القائمة الجانبية للتنقل بين الميزات.</p>
                </div>
                
                <div class="dashboard-card">
                    <h3><i class="fas fa-bell"></i> إشعارات مهمة</h3>
                    <ul class="notifications-list">
                        <li>✓ النظام يعمل بشكل طبيعي</li>
                        <li>✓ جميع الخدمات متاحة</li>
                        <li>✓ قاعدة البيانات متصلة</li>
                        <li>✓ التخزين السحابي نشط</li>
                    </ul>
                </div>
                
                <div class="dashboard-card">
                    <h3><i class="fas fa-lightbulb"></i> نصائح سريعة</h3>
                    <ul class="tips-list">
                        <li>• يمكنك إضافة أصناف جديدة من قسم "إدارة الأصناف"</li>
                        <li>• قم بتنظيم الأصناف في فئات من قسم "إدارة الفئات"</li>
                        <li>• يمكنك تخصيص التصميم من قسم "التصميم"</li>
                        <li>• راجع الإعدادات العامة من قسم "الإعدادات"</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    // محتوى إدارة الأصناف
    getItemsContent() {
        return `
            <div class="content-header">
                <h1><i class="fas fa-utensils"></i> إدارة الأصناف</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" id="addItemBtn">
                        <i class="fas fa-plus"></i> إضافة صنف جديد
                    </button>
                </div>
            </div>
            
            <div class="section-info">
                <p>هنا يمكنك إدارة جميع أصناف القائمة. يمكنك الإضافة، التعديل، الحذف، وتغيير حالة الأصناف.</p>
            </div>
            
            <div class="table-container">
                <div class="table-responsive">
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
                                <td colspan="6" class="text-center">
                                    <p>جاري تحميل البيانات...</p>
                                    <p><small>سيتم تحميل الأصناف قريباً</small></p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    // محتوى إدارة الفئات
    getCategoriesContent() {
        return `
            <div class="content-header">
                <h1><i class="fas fa-list"></i> إدارة الفئات</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" id="addCategoryBtn">
                        <i class="fas fa-plus"></i> إضافة فئة جديدة
                    </button>
                </div>
            </div>
            
            <div class="section-info">
                <p>هنا يمكنك إدارة فئات القائمة. الفئات تساعد في تنظيم الأصناف وتسهيل التصفح.</p>
            </div>
            
            <div class="categories-grid">
                <!-- سيتم ملؤه بالبيانات -->
                <div class="category-card">
                    <div class="category-placeholder">
                        <i class="fas fa-list"></i>
                        <p>جاري تحميل الفئات...</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // إعداد أحداث الأقسام
    setupSectionEvents(section) {
        switch (section) {
            case 'dashboard':
                this.setupDashboardEvents();
                break;
            case 'items':
                this.setupItemsEvents();
                break;
            case 'categories':
                this.setupCategoriesEvents();
                break;
            case 'design':
                this.setupDesignEvents();
                break;
            case 'settings':
                this.setupSettingsEvents();
                break;
        }
    }
    
    // إعداد أحداث لوحة التحكم
    setupDashboardEvents() {
        const refreshBtn = document.getElementById('refreshDashboardBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
    }
    
    // إعداد أحداث الأصناف
    setupItemsEvents() {
        const addItemBtn = document.getElementById('addItemBtn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.showAddItemForm());
        }
    }
    
    // إعداد أحداث الفئات
    setupCategoriesEvents() {
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.showAddCategoryForm());
        }
    }
    
    // ========== وظائف مساعدة ==========
    
    getRoleName(role) {
        const roles = {
            'admin': 'مدير النظام',
            'editor': 'محرر',
            'viewer': 'مشاهد',
            'user': 'مستخدم'
        };
        return roles[role] || 'مستخدم';
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('adminSidebar');
        const content = document.querySelector('.admin-content');
        
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            content.style.marginRight = '250px';
        } else {
            sidebar.classList.add('collapsed');
            content.style.marginRight = '80px';
        }
        
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
    
    refreshData() {
        this.showMessage('معلومات', 'جاري تحديث البيانات...', 'info');
        
        setTimeout(() => {
            this.updateStats();
            this.updateBadges();
            this.showMessage('نجاح', 'تم تحديث البيانات بنجاح', 'success');
        }, 1000);
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`❌ خطأ في ملء الشاشة: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
    
    showUserMenu() {
        // سيتم تنفيذها لاحقاً
        this.showMessage('معلومات', 'قائمة المستخدم - قيد التطوير', 'info');
    }
    
    handleLogout() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            // مسح بيانات الجلسة
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminToken');
            sessionStorage.removeItem('adminUser');
            sessionStorage.removeItem('adminToken');
            
            // إعادة تحميل الصفحة
            location.reload();
        }
    }
    
    showAddItemForm() {
        this.showMessage('معلومات', 'نموذج إضافة صنف جديد - قيد التطوير', 'info');
    }
    
    showAddCategoryForm() {
        this.showMessage('معلومات', 'نموذج إضافة فئة جديدة - قيد التطوير', 'info');
    }
    
    // ========== وظائف الرسائل ==========
    
    showLoading(message = 'جاري التحميل...') {
        const overlay = document.getElementById('loadingOverlay');
        const messageEl = document.getElementById('loadingMessage');
        
        if (overlay && messageEl) {
            messageEl.textContent = message;
            overlay.style.display = 'flex';
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    showMessage(title, text, type = 'info') {
        // استخدام SweetAlert2 إذا متوفر
        if (window.Swal) {
            const icons = {
                success: 'success',
                error: 'error',
                warning: 'warning',
                info: 'info'
            };
            
            Swal.fire({
                title: title,
                text: text,
                icon: icons[type] || 'info',
                timer: 3000,
                showConfirmButton: false
            });
        } else {
            // بديل إذا لم يكن SweetAlert2 متوفراً
            alert(`${title}: ${text}`);
        }
    }
    
    // واجهة وهمية (سيتم تطويرها)
    createAdminInterface() {
        return Promise.resolve();
    }
    
    // محتوى وهمي (سيتم تطويره)
    getDesignContent() {
        return `<div class="alert alert-info">قسم التصميم قيد التطوير</div>`;
    }
    
    getSettingsContent() {
        return `<div class="alert alert-info">قسم الإعدادات قيد التطوير</div>`;
    }
    
    setupDesignEvents() {}
    setupSettingsEvents() {}
}

// ============================================
// تهيئة التطبيق
// ============================================

// دالة تهيئة لوحة التحكم
function initializeAdminPanel() {
    try {
        console.log('🚀 تهيئة لوحة التحكم...');
        
        // التحقق من أننا في صفحة الإدارة
        if (!document.getElementById('adminContainer') && !document.getElementById('loginContainer')) {
            console.log('⚠️ هذه ليست صفحة الإدارة');
            return null;
        }
        
        // انتظار تحميل الخدمات
        if (!window.supabaseClient || !window.databaseService) {
            console.warn('⚠️ الخدمات غير جاهزة، جاري المحاولة مرة أخرى...');
            
            setTimeout(() => {
                if (!window.supabaseClient || !window.databaseService) {
                    console.error('❌ فشل تحميل الخدمات المطلوبة');
                    alert('❌ خطأ: الخدمات المطلوبة غير متوفرة. يرجى تحديث الصفحة.');
                    return;
                }
                startAdminPanel();
            }, 2000);
            
            return;
        }
        
        startAdminPanel();
        
    } catch (error) {
        console.error('❌ خطأ في تهيئة لوحة التحكم:', error);
        alert(`❌ خطأ في تهيئة لوحة التحكم: ${error.message}`);
    }
}

// بدء تشغيل لوحة التحكم
function startAdminPanel() {
    try {
        console.log('🚀 بدء تشغيل لوحة التحكم...');
        
        // إنشاء نسخة من لوحة التحكم
        window.adminPanel = new AdminPanel();
        
        // بدء التهيئة
        window.adminPanel.init();
        
        console.log('✅ تم بدء لوحة التحكم بنجاح');
        
    } catch (error) {
        console.error('❌ خطأ في بدء لوحة التحكم:', error);
        alert(`❌ خطأ في بدء لوحة التحكم: ${error.message}`);
    }
}

// تهيئة لوحة التحكم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 تم تحميل DOM، جاري تهيئة لوحة التحكم...');
    
    // تأخير بسيط لضمان تحميل جميع السكريبتات
    setTimeout(initializeAdminPanel, 500);
});

// تصدير للاستخدام العام
window.initializeAdminPanel = initializeAdminPanel;

// تصدير لتوافق الوحدات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AdminPanel,
        initializeAdminPanel
    };
}

console.log('✅ تم تحميل ملف لوحة التحكم');
