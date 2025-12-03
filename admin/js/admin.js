// ============================================
// الملف الرئيسي لوحة التحكم
// ============================================

class AdminPanel {
    constructor() {
        // تهيئة اللوحة
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isSidebarCollapsed = false;
        this.initialize();
    }
    
    async initialize() {
        try {
            // التحقق من تسجيل الدخول
            await this.checkLoginStatus();
            
            // إذا كان المستخدم مسجلاً، تهيئة اللوحة
            if (this.currentUser) {
                await this.initializePanel();
            } else {
                // إظهار نموذج تسجيل الدخول
                this.showLoginForm();
            }
            
            console.log('✅ Admin Panel initialized');
            
        } catch (error) {
            console.error('❌ Admin Panel initialization error:', error);
            this.showError('حدث خطأ في تهيئة لوحة التحكم');
        }
    }
    
    async checkLoginStatus() {
        try {
            // التحقق من وجود بيانات تسجيل الدخول في localStorage
            const userData = localStorage.getItem('adminUser');
            const token = localStorage.getItem('adminToken');
            
            if (userData && token) {
                // التحقق من صلاحية الرمز
                const parsedToken = JSON.parse(atob(token));
                const expiryTime = parsedToken.exp * 1000; // تحويل إلى مللي ثانية
                
                if (Date.now() < expiryTime) {
                    this.currentUser = JSON.parse(userData);
                    return true;
                } else {
                    // انتهت صلاحية الرمز
                    localStorage.removeItem('adminUser');
                    localStorage.removeItem('adminToken');
                    return false;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Check login status error:', error);
            return false;
        }
    }
    
    showLoginForm() {
        // إظهار نموذج تسجيل الدخول
        const loginContainer = document.getElementById('loginContainer');
        const adminContainer = document.getElementById('adminContainer');
        
        if (loginContainer && adminContainer) {
            loginContainer.style.display = 'flex';
            adminContainer.style.display = 'none';
            
            // إعداد مستمعي الأحداث لنموذج تسجيل الدخول
            this.setupLoginForm();
        }
    }
    
    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const showPasswordBtn = document.getElementById('showPasswordBtn');
        const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
        
        if (!loginForm) return;
        
        // إعادة تعيين النموذج
        loginForm.reset();
        
        // إظهار/إخفاء كلمة المرور
        if (showPasswordBtn) {
            showPasswordBtn.addEventListener('click', () => {
                const passwordInput = document.getElementById('password');
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                
                showPasswordBtn.innerHTML = type === 'password' ? 
                    '<i class="fas fa-eye"></i>' : 
                    '<i class="fas fa-eye-slash"></i>';
            });
        }
        
        // نسيت كلمة المرور
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForgotPasswordModal();
            });
        }
        
        // تسجيل الدخول
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            await this.handleLogin(username, password, rememberMe);
        });
        
        // إدخال البيانات الافتراضية للاختبار
        document.getElementById('username').value = 'admin';
        document.getElementById('password').value = 'admin123';
    }
    
    async handleLogin(username, password, rememberMe = false) {
        try {
            // إظهار مؤشر التحميل
            this.showLoading('جاري تسجيل الدخول...');
            
            // استخدام خدمة قاعدة البيانات للمصادقة
            const db = window.databaseService;
            const result = await db.adminLogin({
                email: username,
                password: password
            });
            
            if (result.success) {
                // حفظ بيانات المستخدم
                this.currentUser = result.data;
                
                // حفظ في localStorage إذا طلب "تذكرني"
                if (rememberMe) {
                    localStorage.setItem('adminUser', JSON.stringify(result.data));
                    localStorage.setItem('adminToken', result.token);
                } else {
                    sessionStorage.setItem('adminUser', JSON.stringify(result.data));
                    sessionStorage.setItem('adminToken', result.token);
                }
                
                // إخفاء مؤشر التحميل
                this.hideLoading();
                
                // إظهار رسالة النجاح
                this.showSuccess('تم تسجيل الدخول بنجاح');
                
                // تهيئة اللوحة
                await this.initializePanel();
                
            } else {
                throw new Error(result.message || 'بيانات الدخول غير صحيحة');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.hideLoading();
            this.showError(error.message || 'فشل تسجيل الدخول');
        }
    }
    
    async initializePanel() {
        try {
            // إخفاء نموذج تسجيل الدخول
            document.getElementById('loginContainer').style.display = 'none';
            
            // إنشاء واجهة لوحة التحكم
            await this.createAdminInterface();
            
            // تحميل البيانات الأولية
            await this.loadInitialData();
            
            // إعداد المستمعين للأحداث
            this.setupPanelEventListeners();
            
            // إظهار لوحة التحكم
            document.getElementById('adminContainer').style.display = 'block';
            
            // إظهار قسم الإحصائيات افتراضياً
            await this.showSection('dashboard');
            
        } catch (error) {
            console.error('Initialize panel error:', error);
            this.showError('حدث خطأ في تهيئة لوحة التحكم');
        }
    }
    
    async createAdminInterface() {
        const container = document.getElementById('adminContainer');
        
        container.innerHTML = `
            <!-- الهيدر -->
            <header class="admin-header">
                <div class="header-top">
                    <div class="header-left">
                        <button class="menu-toggle" id="menuToggle">
                            <i class="fas fa-bars"></i>
                        </button>
                        <h1 class="header-title">
                            <i class="fas fa-cogs"></i>
                            لوحة تحكم مينو الكافيه
                        </h1>
                    </div>
                    
                    <div class="header-right">
                        <div class="user-info" id="userInfo">
                            <div class="user-avatar">
                                ${this.currentUser?.full_name_ar?.charAt(0) || 'A'}
                            </div>
                            <div class="user-details">
                                <span class="user-name">${this.currentUser?.full_name_ar || 'المدير'}</span>
                                <span class="user-role">${this.getRoleName(this.currentUser?.role)}</span>
                            </div>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        
                        <div class="header-actions">
                            <button class="header-btn" id="notificationsBtn" title="الإشعارات">
                                <i class="fas fa-bell"></i>
                                <span class="notification-count">0</span>
                            </button>
                            <button class="header-btn" id="fullscreenBtn" title="ملء الشاشة">
                                <i class="fas fa-expand"></i>
                            </button>
                            <button class="header-btn" id="refreshBtn" title="تحديث">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- شريط الإحصائيات -->
                <div class="stats-bar" id="statsBar">
                    <!-- سيتم ملؤه عبر JavaScript -->
                </div>
            </header>
            
            <!-- المحتوى الرئيسي -->
            <div class="admin-main">
                <!-- الشريط الجانبي -->
                <aside class="admin-sidebar" id="adminSidebar">
                    <div class="sidebar-header">
                        <i class="fas fa-coffee"></i>
                        <h3>القائمة الرئيسية</h3>
                    </div>
                    
                    <nav class="sidebar-menu">
                        <a href="#" class="menu-item active" data-section="dashboard">
                            <i class="fas fa-tachometer-alt"></i>
                            <span class="menu-text">لوحة التحكم</span>
                        </a>
                        
                        <a href="#" class="menu-item" data-section="items">
                            <i class="fas fa-utensils"></i>
                            <span class="menu-text">إدارة الأصناف</span>
                            <span class="menu-badge" id="itemsBadge">0</span>
                        </a>
                        
                        <a href="#" class="menu-item" data-section="categories">
                            <i class="fas fa-list"></i>
                            <span class="menu-text">إدارة الفئات</span>
                            <span class="menu-badge" id="categoriesBadge">0</span>
                        </a>
                        
                        <a href="#" class="menu-item" data-section="options">
                            <i class="fas fa-cog"></i>
                            <span class="menu-text">الخيارات الإضافية</span>
                        </a>
                        
                        <div class="menu-divider"></div>
                        
                        <a href="#" class="menu-item" data-section="design">
                            <i class="fas fa-palette"></i>
                            <span class="menu-text">التصميم والألوان</span>
                        </a>
                        
                        <a href="#" class="menu-item" data-section="settings">
                            <i class="fas fa-sliders-h"></i>
                            <span class="menu-text">الإعدادات العامة</span>
                        </a>
                        
                        <a href="#" class="menu-item" data-section="users">
                            <i class="fas fa-users"></i>
                            <span class="menu-text">المستخدمين</span>
                        </a>
                        
                        <div class="menu-divider"></div>
                        
                        <a href="#" class="menu-item" data-section="analytics">
                            <i class="fas fa-chart-bar"></i>
                            <span class="menu-text">التقارير والإحصائيات</span>
                        </a>
                        
                        <a href="#" class="menu-item" data-section="backup">
                            <i class="fas fa-database"></i>
                            <span class="menu-text">النسخ الاحتياطي</span>
                        </a>
                    </nav>
                </aside>
                
                <!-- المحتوى -->
                <main class="admin-content" id="adminContent">
                    <!-- سيتم ملؤه ديناميكياً -->
                    <div class="content-loader">
                        <div class="loading-spinner"></div>
                        <p>جاري تحميل لوحة التحكم...</p>
                    </div>
                </main>
            </div>
            
            <!-- الفوتر -->
            <footer class="admin-footer">
                <p>جميع الحقوق محفوظة &copy; ${new Date().getFullYear()} - نظام مينو الكافيه الرقمي</p>
                <p>الإصدار 1.0.0 | آخر تحديث: ${new Date().toLocaleDateString('ar-SA')}</p>
            </footer>
            
            <!-- القائمة المنسدلة للمستخدم -->
            <div class="user-dropdown" id="userDropdown">
                <div class="dropdown-header">
                    <div class="user-avatar-large">
                        ${this.currentUser?.full_name_ar?.charAt(0) || 'A'}
                    </div>
                    <div class="user-info-large">
                        <h4>${this.currentUser?.full_name_ar || 'المدير'}</h4>
                        <p>${this.currentUser?.email || 'admin@cafe.com'}</p>
                        <p class="user-role">${this.getRoleName(this.currentUser?.role)}</p>
                    </div>
                </div>
                
                <div class="dropdown-menu">
                    <a href="#" class="dropdown-item" id="profileBtn">
                        <i class="fas fa-user"></i>
                        <span>الملف الشخصي</span>
                    </a>
                    
                    <a href="#" class="dropdown-item" id="settingsBtn">
                        <i class="fas fa-cog"></i>
                        <span>الإعدادات</span>
                    </a>
                    
                    <a href="#" class="dropdown-item" id="helpBtn">
                        <i class="fas fa-question-circle"></i>
                        <span>المساعدة</span>
                    </a>
                    
                    <div class="dropdown-divider"></div>
                    
                    <a href="#" class="dropdown-item logout" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>تسجيل الخروج</span>
                    </a>
                </div>
            </div>
        `;
    }
    
    getRoleName(role) {
        const roles = {
            'admin': 'مدير النظام',
            'editor': 'محرر',
            'viewer': 'مشاهد'
        };
        
        return roles[role] || 'مستخدم';
    }
    
    async loadInitialData() {
        try {
            // تحميل الإحصائيات
            await this.loadStats();
            
            // تحديث العدادات
            await this.updateBadges();
            
        } catch (error) {
            console.error('Load initial data error:', error);
        }
    }
    
    async loadStats() {
        try {
            const db = window.databaseService;
            const result = await db.getAnalytics();
            
            if (result.success) {
                this.renderStats(result.data);
            }
        } catch (error) {
            console.error('Load stats error:', error);
        }
    }
    
    renderStats(data) {
        const statsBar = document.getElementById('statsBar');
        if (!statsBar) return;
        
        statsBar.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(52, 152, 219, 0.2); color: #3498DB;">
                    <i class="fas fa-utensils"></i>
                </div>
                <div class="stat-details">
                    <h3>إجمالي الأصناف</h3>
                    <div class="stat-number">${data.totalItems || 0}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i>
                        <span>${data.availableItems || 0} متاحة</span>
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(46, 204, 113, 0.2); color: #2ECC71;">
                    <i class="fas fa-list"></i>
                </div>
                <div class="stat-details">
                    <h3>إجمالي الفئات</h3>
                    <div class="stat-number">${data.totalCategories || 0}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-check"></i>
                        <span>${data.activeCategories || 0} نشطة</span>
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(155, 89, 182, 0.2); color: #9B59B6;">
                    <i class="fas fa-fire"></i>
                </div>
                <div class="stat-details">
                    <h3>الأصناف المشهورة</h3>
                    <div class="stat-number">${data.popularItems || 0}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-star"></i>
                        <span>الأكثر طلباً</span>
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(241, 196, 15, 0.2); color: #F1C40F;">
                    <i class="fas fa-bolt"></i>
                </div>
                <div class="stat-details">
                    <h3>الأصناف الجديدة</h3>
                    <div class="stat-number">${data.newItems || 0}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-plus"></i>
                        <span>مضاف حديثاً</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    async updateBadges() {
        try {
            const db = window.databaseService;
            
            // تحديث عداد الأصناف
            const itemsResult = await db.getMenuItems({ limit: 1 });
            if (itemsResult.success) {
                document.getElementById('itemsBadge').textContent = itemsResult.count || 0;
            }
            
            // تحديث عداد الفئات
            const categoriesResult = await db.getCategories();
            if (categoriesResult.success) {
                document.getElementById('categoriesBadge').textContent = categoriesResult.count || 0;
            }
            
        } catch (error) {
            console.error('Update badges error:', error);
        }
    }
    
    setupPanelEventListeners() {
        // تبديل القائمة الجانبية
        document.getElementById('menuToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // التنقل بين الأقسام
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });
        
        // معلومات المستخدم
        document.getElementById('userInfo').addEventListener('click', () => {
            this.toggleUserDropdown();
        });
        
        // إغلاق القائمة المنسدلة عند النقر خارجها
        document.addEventListener('click', (e) => {
            const userDropdown = document.getElementById('userDropdown');
            const userInfo = document.getElementById('userInfo');
            
            if (userDropdown && userDropdown.style.display === 'block') {
                if (!userDropdown.contains(e.target) && !userInfo.contains(e.target)) {
                    userDropdown.style.display = 'none';
                }
            }
        });
        
        // الإشعارات
        document.getElementById('notificationsBtn').addEventListener('click', () => {
            this.showNotifications();
        });
        
        // ملء الشاشة
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // تحديث الصفحة
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshPanel();
        });
        
        // تسجيل الخروج
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });
        
        // الملف الشخصي
        document.getElementById('profileBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showProfile();
        });
        
        // الإعدادات
        document.getElementById('settingsBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('settings');
            this.hideUserDropdown();
        });
        
        // المساعدة
        document.getElementById('helpBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showHelp();
        });
        
        // إدارة المفاتيح
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideUserDropdown();
                this.closeAllModals();
            }
            
            if (e.key === '/' && e.ctrlKey) {
                e.preventDefault();
                this.focusSearch();
            }
        });
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('adminSidebar');
        const content = document.getElementById('adminContent');
        
        if (sidebar.classList.contains('sidebar-collapsed')) {
            sidebar.classList.remove('sidebar-collapsed');
            content.style.marginRight = '250px';
        } else {
            sidebar.classList.add('sidebar-collapsed');
            content.style.marginRight = '70px';
        }
        
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        localStorage.setItem('sidebarCollapsed', this.isSidebarCollapsed);
    }
    
    async showSection(section) {
        // تحديث القائمة النشطة
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });
        
        // تحديث القسم الحالي
        this.currentSection = section;
        
        // تحميل محتوى القسم
        await this.loadSectionContent(section);
    }
    
    async loadSectionContent(section) {
        const content = document.getElementById('adminContent');
        
        // إظهار مؤشر التحميل
        content.innerHTML = `
            <div class="content-loader">
                <div class="loading-spinner"></div>
                <p>جاري تحميل المحتوى...</p>
            </div>
        `;
        
        try {
            let html = '';
            
            switch (section) {
                case 'dashboard':
                    html = await this.getDashboardContent();
                    break;
                    
                case 'items':
                    html = await this.getItemsContent();
                    break;
                    
                case 'categories':
                    html = await this.getCategoriesContent();
                    break;
                    
                case 'design':
                    html = await this.getDesignContent();
                    break;
                    
                case 'settings':
                    html = await this.getSettingsContent();
                    break;
                    
                case 'analytics':
                    html = await this.getAnalyticsContent();
                    break;
                    
                case 'backup':
                    html = await this.getBackupContent();
                    break;
                    
                case 'users':
                    html = await this.getUsersContent();
                    break;
                    
                case 'options':
                    html = await this.getOptionsContent();
                    break;
                    
                default:
                    html = `<div class="alert alert-warning">القسم غير معروف</div>`;
            }
            
            // إضافة التأخير للرسوم المتحركة
            setTimeout(() => {
                content.innerHTML = html;
                this.setupSectionEventListeners(section);
            }, 300);
            
        } catch (error) {
            console.error(`Load section ${section} error:`, error);
            content.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>حدث خطأ في تحميل المحتوى: ${error.message}</span>
                    <button class="alert-close">&times;</button>
                </div>
                <button class="action-btn btn-primary" onclick="adminPanel.showSection('${section}')">
                    <i class="fas fa-redo"></i>
                    إعادة المحاولة
                </button>
            `;
        }
    }
    
    async getDashboardContent() {
        const db = window.databaseService;
        const analytics = await db.getAnalytics();
        
        return `
            <div class="content-header">
                <h1><i class="fas fa-tachometer-alt"></i> لوحة التحكم</h1>
                <div class="header-actions">
                    <button class="action-btn btn-primary" id="refreshDashboardBtn">
                        <i class="fas fa-sync-alt"></i>
                        تحديث
                    </button>
                    <button class="action-btn btn-secondary" id="exportDashboardBtn">
                        <i class="fas fa-download"></i>
                        تصدير تقرير
                    </button>
                </div>
            </div>
            
            <div class="content-cards">
                <!-- بطاقة النشاط الأخير -->
                <div class="content-card">
                    <div class="card-header">
                        <h3><i class="fas fa-history"></i> النشاط الأخير</h3>
                        <div class="card-actions">
                            <button class="action-icon view-btn" title="عرض الكل">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="activity-list">
                            <div class="activity-item">
                                <div class="activity-icon success">
                                    <i class="fas fa-plus"></i>
                                </div>
                                <div class="activity-details">
                                    <p>تم إضافة صنف جديد</p>
                                    <span class="activity-time">قبل 5 دقائق</span>
                                </div>
                            </div>
                            
                            <div class="activity-item">
                                <div class="activity-icon warning">
                                    <i class="fas fa-edit"></i>
                                </div>
                                <div class="activity-details">
                                    <p>تم تعديل فئة المشروبات</p>
                                    <span class="activity-time">قبل ساعتين</span>
                                </div>
                            </div>
                            
                            <div class="activity-item">
                                <div class="activity-icon info">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="activity-details">
                                    <p>تم تسجيل دخول جديد</p>
                                    <span class="activity-time">قبل 3 ساعات</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- بطاقة الإحصائيات السريعة -->
                <div class="content-card">
                    <div class="card-header">
                        <h3><i class="fas fa-chart-pie"></i> إحصائيات سريعة</h3>
                    </div>
                    <div class="card-body">
                        <div class="quick-stats">
                            <div class="quick-stat">
                                <div class="stat-value">${analytics.data?.totalItems || 0}</div>
                                <div class="stat-label">إجمالي الأصناف</div>
                            </div>
                            
                            <div class="quick-stat">
                                <div class="stat-value">${analytics.data?.popularItems || 0}</div>
                                <div class="stat-label">أصناف مشهورة</div>
                            </div>
                            
                            <div class="quick-stat">
                                <div class="stat-value">${analytics.data?.totalCategories || 0}</div>
                                <div class="stat-label">فئات نشطة</div>
                            </div>
                            
                            <div class="quick-stat">
                                <div class="stat-value">${analytics.data?.newItems || 0}</div>
                                <div class="stat-label">أصناف جديدة</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- الرسوم البيانية -->
            <div class="content-card">
                <div class="card-header">
                    <h3><i class="fas fa-chart-bar"></i> توزيع الأصناف</h3>
                </div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="itemsChart" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;
    }
    
    async getItemsContent() {
        return `
            <div class="content-header">
                <h1><i class="fas fa-utensils"></i> إدارة الأصناف</h1>
                <div class="header-actions">
                    <button class="action-btn btn-primary" id="addItemBtn">
                        <i class="fas fa-plus"></i>
                        إضافة صنف جديد
                    </button>
                    <button class="action-btn btn-secondary" id="importItemsBtn">
                        <i class="fas fa-upload"></i>
                        استيراد
                    </button>
                    <button class="action-btn btn-secondary" id="exportItemsBtn">
                        <i class="fas fa-download"></i>
                        تصدير
                    </button>
                </div>
            </div>
            
            <!-- البحث والتصفية -->
            <div class="search-filter">
                <div class="filter-row">
                    <div class="filter-group">
                        <label for="searchItems">بحث:</label>
                        <input type="text" id="searchItems" class="form-control" placeholder="ابحث عن صنف...">
                    </div>
                    
                    <div class="filter-group">
                        <label for="filterCategory">الفئة:</label>
                        <select id="filterCategory" class="form-control">
                            <option value="">جميع الفئات</option>
                            <!-- سيتم ملؤه عبر JavaScript -->
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="filterStatus">الحالة:</label>
                        <select id="filterStatus" class="form-control">
                            <option value="">جميع الحالات</option>
                            <option value="available">متاح</option>
                            <option value="unavailable">غير متاح</option>
                            <option value="popular">مشهور</option>
                            <option value="new">جديد</option>
                        </select>
                    </div>
                    
                    <div class="filter-actions">
                        <button class="action-btn btn-primary" id="applyFiltersBtn">
                            <i class="fas fa-filter"></i>
                            تطبيق
                        </button>
                        <button class="action-btn btn-secondary" id="resetFiltersBtn">
                            <i class="fas fa-redo"></i>
                            إعادة تعيين
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- جدول الأصناف -->
            <div class="table-container">
                <div class="table-responsive">
                    <table class="data-table" id="itemsTable">
                        <thead>
                            <tr>
                                <th>الصورة</th>
                                <th>الاسم</th>
                                <th>الفئة</th>
                                <th>السعر</th>
                                <th>الحالة</th>
                                <th>التاريخ</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- سيتم ملؤه عبر JavaScript -->
                            <tr>
                                <td colspan="7" class="text-center">
                                    <div class="table-loader">
                                        <div class="loading-spinner"></div>
                                        <p>جاري تحميل الأصناف...</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- التصفح -->
            <div class="pagination">
                <button class="page-btn" id="prevPageBtn" disabled>
                    <i class="fas fa-chevron-right"></i>
                </button>
                <span class="page-info">الصفحة 1 من 1</span>
                <button class="page-btn" id="nextPageBtn" disabled>
                    <i class="fas fa-chevron-left"></i>
                </button>
            </div>
        `;
    }
    
    async getCategoriesContent() {
        return `
            <div class="content-header">
                <h1><i class="fas fa-list"></i> إدارة الفئات</h1>
                <div class="header-actions">
                    <button class="action-btn btn-primary" id="addCategoryBtn">
                        <i class="fas fa-plus"></i>
                        إضافة فئة جديدة
                    </button>
                    <button class="action-btn btn-secondary" id="sortCategoriesBtn">
                        <i class="fas fa-sort"></i>
                        ترتيب الفئات
                    </button>
                </div>
            </div>
            
            <!-- شبكة الفئات -->
            <div class="content-cards" id="categoriesGrid">
                <!-- سيتم ملؤه عبر JavaScript -->
                <div class="content-card">
                    <div class="card-body">
                        <div class="table-loader">
                            <div class="loading-spinner"></div>
                            <p>جاري تحميل الفئات...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async getDesignContent() {
        return `
            <div class="content-header">
                <h1><i class="fas fa-palette"></i> التصميم والألوان</h1>
                <div class="header-actions">
                    <button class="action-btn btn-success" id="saveDesignBtn">
                        <i class="fas fa-save"></i>
                        حفظ التصميم
                    </button>
                    <button class="action-btn btn-secondary" id="resetDesignBtn">
                        <i class="fas fa-redo"></i>
                        إعادة تعيين
                    </button>
                </div>
            </div>
            
            <div class="form-container">
                <div class="form-row">
                    <div class="form-group">
                        <label for="restaurantName" class="required">اسم المطعم:</label>
                        <input type="text" id="restaurantName" class="form-control" placeholder="أدخل اسم المطعم">
                    </div>
                    
                    <div class="form-group">
                        <label for="restaurantTagline">شعار المطعم:</label>
                        <input type="text" id="restaurantTagline" class="form-control" placeholder="أدخل الشعار">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>شعار المطعم:</label>
                    <div class="file-upload">
                        <input type="file" id="logoUpload" class="file-input" accept="image/*">
