// ============================================
// ملف لوحة التحكم الرئيسي - الإصدار المصحح
// ============================================

// ============================================
// إدارة حالة الخدمات
// ============================================

// كائن لتتبع حالة الخدمات
const ServiceManager = {
    services: {
        supabaseClient: false,
        databaseService: false,
        supabaseStorage: false
    },
    
    // تسجيل خدمة كجاهزة
    markServiceReady(serviceName) {
        console.log(`✅ ${serviceName} جاهز`);
        this.services[serviceName] = true;
        
        // التحقق مما إذا كانت جميع الخدمات جاهزة
        if (this.allServicesReady()) {
            console.log('🎉 جميع الخدمات جاهزة!');
            window.dispatchEvent(new CustomEvent('allServicesReady'));
        }
    },
    
    // التحقق مما إذا كانت جميع الخدمات جاهزة
    allServicesReady() {
        return Object.values(this.services).every(status => status === true);
    },
    
    // الانتظار حتى تكون جميع الخدمات جاهزة
    async waitForAllServices(timeout = 10000) {
        return new Promise((resolve, reject) => {
            if (this.allServicesReady()) {
                resolve();
                return;
            }
            
            const timer = setTimeout(() => {
                reject(new Error(`انتهت المهلة في انتظار الخدمات (${timeout}ms)`));
            }, timeout);
            
            window.addEventListener('allServicesReady', () => {
                clearTimeout(timer);
                resolve();
            }, { once: true });
        });
    }
};

// ============================================
// مراقبة الخدمات
// ============================================

// مراقبة supabaseClient
const supabaseCheck = setInterval(() => {
    if (window.supabaseClient && !ServiceManager.services.supabaseClient) {
        ServiceManager.markServiceReady('supabaseClient');
        clearInterval(supabaseCheck);
    }
}, 500);

// مراقبة databaseService
const databaseCheck = setInterval(() => {
    if (window.databaseService && window.databaseService.isInitialized && !ServiceManager.services.databaseService) {
        ServiceManager.markServiceReady('databaseService');
        clearInterval(databaseCheck);
    }
}, 500);

// مراقبة supabaseStorage
const storageCheck = setInterval(() => {
    if (window.supabaseStorage && !ServiceManager.services.supabaseStorage) {
        ServiceManager.markServiceReady('supabaseStorage');
        clearInterval(storageCheck);
    }
}, 500);

// ============================================
// تعريف الكلاس الرئيسي
// ============================================

class AdminPanel {
    constructor() {
        console.log('🚀 إنشاء نسخة جديدة من لوحة التحكم');
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isSidebarCollapsed = false;
        this.isInitialized = false;
    }
    
    // دالة التهيئة الرئيسية
    async init() {
        try {
            if (this.isInitialized) {
                console.log('⚠️ لوحة التحكم مهيئة بالفعل');
                return;
            }
            
            console.log('🔧 بدء تهيئة لوحة التحكم...');
            
            // التحقق من حالة تسجيل الدخول
            const isLoggedIn = await this.checkLoginStatus();
            
            if (isLoggedIn) {
                await this.loadAdminPanel();
            } else {
                this.showLoginPanel();
            }
            
            this.isInitialized = true;
            console.log('✅ تم تهيئة لوحة التحكم بنجاح');
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة لوحة التحكم:', error);
            this.showError(`فشل تهيئة لوحة التحكم: ${error.message}`);
        }
    }
    
    // التحقق من حالة تسجيل الدخول
    async checkLoginStatus() {
        try {
            // التحقق من localStorage
            const userData = localStorage.getItem('adminUser');
            const token = localStorage.getItem('adminToken');
            
            if (!userData || !token) {
                console.log('👤 لا يوجد مستخدم مسجل');
                return false;
            }
            
            // محاولة تحليل البيانات
            try {
                this.currentUser = JSON.parse(userData);
                console.log('👤 تم العثور على مستخدم مسجل:', this.currentUser.full_name_ar);
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
        
        console.log('👤 إظهار لوحة تسجيل الدخول');
    }
    
    // إعداد أحداث تسجيل الدخول
    setupLoginEvents() {
        const loginForm = document.getElementById('loginForm');
        const showPasswordBtn = document.getElementById('showPasswordBtn');
        
        if (!loginForm) {
            console.error('❌ لم يتم العثور على نموذج تسجيل الدخول');
            return;
        }
        
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
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput) usernameInput.value = 'admin';
        if (passwordInput) passwordInput.value = 'admin123';
        
        console.log('✅ تم إعداد أحداث تسجيل الدخول');
    }
    
    // معالجة تسجيل الدخول
    async handleLogin() {
        try {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe')?.checked || false;
            
            if (!username || !password) {
                this.showError('يرجى إدخال اسم المستخدم وكلمة المرور');
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
            this.showSuccess('تم تسجيل الدخول بنجاح!');
            
            // تحميل لوحة التحكم
            await this.loadAdminPanel();
            
        } catch (error) {
            console.error('❌ خطأ في تسجيل الدخول:', error);
            this.hideLoading();
            this.showError('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        }
    }
    
    // تحميل لوحة التحكم
    async loadAdminPanel() {
        try {
            console.log('📊 تحميل لوحة التحكم...');
            
            // إخفاء تسجيل الدخول
            const loginContainer = document.getElementById('loginContainer');
            if (loginContainer) loginContainer.style.display = 'none';
            
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
            this.showError(`فشل تحميل لوحة التحكم: ${error.message}`);
        }
    }
    
    // إنشاء HTML لوحة التحكم
    getAdminHTML() {
        const userInitial = this.currentUser?.full_name_ar?.charAt(0) || 'م';
        const userName = this.currentUser?.full_name_ar || 'مدير النظام';
        const userRole = this.getRoleName(this.currentUser?.role);
        
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
                                ${userInitial}
                            </div>
                            <div class="user-details">
                                <span class="user-name">${userName}</span>
                                <span class="user-role">${userRole}</span>
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
                            <h2>مرحباً ${userName}!</h2>
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
        console.log('🔧 إعداد أحداث لوحة التحكم...');
        
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
        
        console.log('✅ تم إعداد أحداث لوحة التحكم');
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
            if (statCards.length >= 4) {
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
            }
            
        } catch (error) {
            console.error('❌ خطأ في تحديث الإحصائيات:', error);
        }
    }
    
    // تحديث العدادات
    async updateBadges() {
        try {
            const badges = document.querySelectorAll('.menu-badge');
            if (badges.length >= 2) {
                badges[0].textContent = '24'; // الأصناف
                badges[1].textContent = '6';  // الفئات
            }
        } catch (error) {
            console.error('❌ خطأ في تحديث العدادات:', error);
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
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        }
    }
    
    refreshData() {
        this.showInfo('جاري تحديث البيانات...');
        
        setTimeout(() => {
            this.updateStats();
            this.updateBadges();
            this.showSuccess('تم تحديث البيانات بنجاح');
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
        this.showInfo('قائمة المستخدم - قيد التطوير');
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
    
    showSection(section) {
        this.showInfo(`تحميل القسم: ${section} - قيد التطوير`);
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
    
    showSuccess(message) {
        this.showMessage('نجاح', message, 'success');
    }
    
    showError(message) {
        this.showMessage('خطأ', message, 'error');
    }
    
    showInfo(message) {
        this.showMessage('معلومات', message, 'info');
    }
    
    showMessage(title, text, type = 'info') {
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
            alert(`${title}: ${text}`);
        }
    }
    
    // إنشاء واجهة (للمستقبل)
    createAdminInterface() {
        return Promise.resolve();
    }
}

// ============================================
// تهيئة لوحة التحكم
// ============================================

// دالة تهيئة لوحة التحكم
async function initializeAdminPanel() {
    try {
        console.log('🚀 بدء تهيئة لوحة التحكم...');
        
        // التحقق من أننا في صفحة الإدارة
        const loginContainer = document.getElementById('loginContainer');
        const adminContainer = document.getElementById('adminContainer');
        
        if (!loginContainer && !adminContainer) {
            console.log('⚠️ هذه ليست صفحة الإدارة');
            return null;
        }
        
        // انتظار الخدمات إذا لزم
        try {
            await ServiceManager.waitForAllServices(5000);
        } catch (timeoutError) {
            console.warn('⚠️ انتهت مهلة بعض الخدمات، المتابعة...');
        }
        
        console.log('✅ الخدمات جاهزة، إنشاء لوحة التحكم...');
        
        // إنشاء لوحة التحكم
        window.adminPanel = new AdminPanel();
        
        // بدء التهيئة
        await window.adminPanel.init();
        
        console.log('✅ تم تحميل لوحة التحكم بنجاح');
        
        return window.adminPanel;
        
    } catch (error) {
        console.error('❌ خطأ في تهيئة لوحة التحكم:', error);
        
        // عرض رسالة خطأ
        const errorMessage = `فشل تحميل لوحة التحكم: ${error.message}`;
        alert(errorMessage);
        
        return null;
    }
}

// ============================================
// التهيئة التلقائية
// ============================================

// تهيئة لوحة التحكم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 تم تحميل DOM، جاري تهيئة لوحة التحكم...');
    
    // تأخير بسيط لضمان تحميل جميع السكريبتات
    setTimeout(async () => {
        try {
            await initializeAdminPanel();
        } catch (error) {
            console.error('❌ فشل غير متوقع:', error);
        }
    }, 1000);
});

// ============================================
// التصدير
// ============================================

// تصدير للاستخدام العام
window.initializeAdminPanel = initializeAdminPanel;
window.AdminPanel = AdminPanel;
window.ServiceManager = ServiceManager;

// تصدير لتوافق الوحدات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AdminPanel,
        initializeAdminPanel,
        ServiceManager
    };
}

console.log('✅ تم تحميل نظام لوحة التحكم');
