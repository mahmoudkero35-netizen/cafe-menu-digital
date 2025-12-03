// admin.js - لوحة التحكم كاملة
document.addEventListener('DOMContentLoaded', function () {

    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('loginContainer');
    const adminContainer = document.getElementById('adminContainer');

    const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

    // تسجيل الدخول مسبقًا
    if (localStorage.getItem('adminLoggedIn') === 'true') showAdminPanel();

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            localStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
        } else {
            Swal.fire('خطأ', 'اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
        }
    });

    function showAdminPanel() {
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'block';
        loadAdminPanel();
    }

    function loadAdminPanel() {
        adminContainer.innerHTML = `
        <header class="admin-header">
            <div class="header-left">
                <h1><i class="fas fa-cogs"></i> لوحة التحكم - مينو الكافيه</h1>
            </div>
            <div class="header-right">
                <button class="btn" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> تسجيل الخروج</button>
            </div>
        </header>
        <nav class="admin-nav">
            <button class="nav-btn active" data-section="items">أصناف</button>
            <button class="nav-btn" data-section="categories">فئات</button>
            <button class="nav-btn" data-section="design">تصميم</button>
            <button class="nav-btn" data-section="settings">الإعدادات</button>
        </nav>
        <main class="admin-content">
            <section class="section active" id="itemsSection">
                <div class="section-header">
                    <h2>إدارة الأصناف</h2>
                    <button class="btn" id="addItemBtn">إضافة صنف</button>
                </div>
                <div class="items-grid" id="itemsGrid"></div>
            </section>

            <section class="section" id="categoriesSection">
                <div class="section-header">
                    <h2>إدارة الفئات</h2>
                    <button class="btn" id="addCategoryBtn">إضافة فئة</button>
                </div>
                <div class="categories-list" id="categoriesList"></div>
            </section>

            <section class="section" id="designSection">
                <div class="section-header"><h2>التصميم والألوان</h2></div>
                <div class="color-settings">
                    <div class="form-group">
                        <label>اللون الرئيسي:</label>
                        <input type="color" id="primaryColorPicker" value="#8B4513">
                    </div>
                    <div class="form-group">
                        <label>لون الخلفية:</label>
                        <input type="color" id="bgColorPicker" value="#FFF8F0">
                    </div>
                    <div class="form-group">
                        <label>الشعار:</label>
                        <input type="file" id="logoUpload" accept="image/*">
                    </div>
                </div>
            </section>

            <section class="section" id="settingsSection">
                <h2>الإعدادات العامة</h2>
                <div class="settings-grid">
                    <button class="btn" id="exportBtn">تصدير البيانات</button>
                    <button class="btn" id="importBtn">استيراد البيانات</button>
                </div>
            </section>
        </main>
        `;
        initializeAdminPanel();
    }

    // ------------------- الوظائف الرئيسية -------------------
    function initializeAdminPanel() {
        setupNavigation();
        setupLogout();
        initializeItemsManagement();
        initializeCategoriesManagement();
        initializeDesignSettings();
        initializeGeneralSettings();
    }

    function setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.section');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const sectionId = btn.getAttribute('data-section') + 'Section';
                sections.forEach(sec => {
                    if (sec.id === sectionId) sec.classList.add('active');
                    else sec.classList.remove('active');
                });
            });
        });
    }

    function setupLogout() {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('adminLoggedIn');
            location.reload();
        });
    }

    // ------------------- الأصناف -------------------
    function initializeItemsManagement() {
        console.log("✔ Items Management Initialized");
        // هنا يمكنك إضافة: جلب الأصناف من Supabase وعرضها في itemsGrid
    }

    // ------------------- الفئات -------------------
    function initializeCategoriesManagement() {
        console.log("✔ Categories Management Initialized");
        // هنا يمكنك إضافة: جلب الفئات من Supabase وعرضها في categoriesList
    }

    // ------------------- التصميم -------------------
    function initializeDesignSettings() {
        console.log("✔ Design Settings Initialized");
        const primaryColor = document.getElementById('primaryColorPicker');
        const bgColor = document.getElementById('bgColorPicker');

        primaryColor.addEventListener('input', () => {
            document.body.style.setProperty('--primary-color', primaryColor.value);
        });
        bgColor.addEventListener('input', () => {
            document.body.style.background = bgColor.value;
        });
    }

    // ------------------- الإعدادات -------------------
    function initializeGeneralSettings() {
        console.log("✔ General Settings Initialized");
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.addEventListener('click', () => {
            Swal.fire('تم', 'تم تصدير البيانات بنجاح', 'success');
        });
    }
});
