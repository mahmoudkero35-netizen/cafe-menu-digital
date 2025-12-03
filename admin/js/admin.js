// admin.js - منطق لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('loginContainer');
    const adminContainer = document.getElementById('adminContainer');
    
    // بيانات الدخول الافتراضية
    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: '1234'
    };
    
    // التحقق من حالة تسجيل الدخول
    if(localStorage.getItem('adminLoggedIn') === 'true') {
        showAdminPanel();
    }
    
    // معالجة تسجيل الدخول
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if(username === ADMIN_CREDENTIALS.username && 
           password === ADMIN_CREDENTIALS.password) {
            localStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
        } else {
            alert('اسم المستخدم أو كلمة المرور غير صحيحة');
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
                    <button class="btn" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
                    </button>
                </div>
            </header>
            
            <nav class="admin-nav">
                <button class="nav-btn active" data-section="items">
                    <i class="fas fa-utensils"></i> إدارة الأصناف
                </button>
                <button class="nav-btn" data-section="categories">
                    <i class="fas fa-list"></i> إدارة الفئات
                </button>
                <button class="nav-btn" data-section="design">
                    <i class="fas fa-palette"></i> التصميم والألوان
                </button>
                <button class="nav-btn" data-section="settings">
                    <i class="fas fa-cog"></i> الإعدادات العامة
                </button>
            </nav>
            
            <main class="admin-content">
                <!-- قسم إدارة الأصناف -->
                <section class="section active" id="itemsSection">
                    <div class="section-header">
                        <h2><i class="fas fa-utensils"></i> إدارة الأصناف</h2>
                        <button class="btn" id="addItemBtn">
                            <i class="fas fa-plus"></i> إضافة صنف جديد
                        </button>
                    </div>
                    <div class="items-grid" id="itemsGrid"></div>
                    
                    <div class="form-modal" id="itemFormModal" style="display: none;">
                        <form id="itemForm">
                            <h3>إضافة/تعديل صنف</h3>
                            <div class="form-group">
                                <label for="itemName">اسم الصنف:</label>
                                <input type="text" id="itemName" required>
                            </div>
                            <div class="form-group">
                                <label for="itemCategory">الفئة:</label>
                                <select id="itemCategory" required></select>
                            </div>
                            <div class="form-group">
                                <label for="itemPrice">السعر:</label>
                                <input type="number" id="itemPrice" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label for="itemDescription">الوصف:</label>
                                <textarea id="itemDescription" rows="4"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="itemImage">صورة الصنف:</label>
                                <input type="file" id="itemImage" accept="image/*">
                                <div class="image-preview" id="imagePreview"></div>
                            </div>
                            <div class="form-group">
                                <label>الخيارات الإضافية:</label>
                                <div id="optionsContainer"></div>
                                <button type="button" class="btn btn-secondary" id="addOptionBtn">
                                    <i class="fas fa-plus"></i> إضافة خيار
                                </button>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn">حفظ</button>
                                <button type="button" class="btn btn-cancel" id="cancelFormBtn">إلغاء</button>
                            </div>
                        </form>
                    </div>
                </section>
                
                <!-- قسم إدارة الفئات -->
                <section class="section" id="categoriesSection">
                    <div class="section-header">
                        <h2><i class="fas fa-list"></i> إدارة الفئات</h2>
                        <button class="btn" id="addCategoryBtn">
                            <i class="fas fa-plus"></i> إضافة فئة جديدة
                        </button>
                    </div>
                    <div class="categories-list" id="categoriesList"></div>
                </section>
                
                <!-- قسم التصميم والألوان -->
                <section class="section" id="designSection">
                    <div class="section-header">
                        <h2><i class="fas fa-palette"></i> التصميم والألوان</h2>
                    </div>
                    <div class="color-settings">
                        <div class="form-group">
                            <label>اللون الرئيسي:</label>
                            <div class="color-picker">
                                <div class="color-option" style="background: #8B4513;" data-color="#8B4513"></div>
                                <div class="color-option" style="background: #D2691E;" data-color="#D2691E"></div>
                                <div class="color-option" style="background: #A0522D;" data-color="#A0522D"></div>
                                <div class="color-option" style="background: #CD853F;" data-color="#CD853F"></div>
                                <input type="color" id="primaryColorPicker" value="#8B4513">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>لون الخلفية:</label>
                            <div class="color-picker">
                                <div class="color-option" style="background: #FFF8F0;" data-color="#FFF8F0"></div>
                                <div class="color-option" style="background: #F5F5F5;" data-color="#F5F5F5"></div>
                                <div class="color-option" style="background: #FFFFFF;" data-color="#FFFFFF"></div>
                                <div class="color-option" style="background: #2C2C2C;" data-color="#2C2C2C"></div>
                                <input type="color" id="bgColorPicker" value="#FFF8F0">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>الشعار:</label>
                            <input type="file" id="logoUpload" accept="image/*">
                            <div class="logo-preview" id="logoPreview"></div>
                        </div>
                        <div class="form-group">
                            <label>اسم المطعم:</label>
                            <input type="text" id="restaurantName" value="كافيه النخبة">
                        </div>
                    </div>
                    <button class="btn" id="saveDesignBtn">
                        <i class="fas fa-save"></i> حفظ التصميم
                    </button>
                </section>
                
                <!-- قسم الإعدادات العامة -->
                <section class="section" id="settingsSection">
                    <div class="section-header">
                        <h2><i class="fas fa-cog"></i> الإعدادات العامة</h2>
                    </div>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <h3><i class="fas fa-user-cog"></i> بيانات الدخول</h3>
                            <form id="credentialsForm">
                                <div class="form-group">
                                    <label>اسم المستخدم:</label>
                                    <input type="text" id="adminUsername" value="admin">
                                </div>
                                <div class="form-group">
                                    <label>كلمة المرور الجديدة:</label>
                                    <input type="password" id="adminPassword">
                                </div>
                                <div class="form-group">
                                    <label>تأكيد كلمة المرور:</label>
                                    <input type="password" id="adminPasswordConfirm">
                                </div>
                                <button type="submit" class="btn">تحديث بيانات الدخول</button>
                            </form>
                        </div>
                        <div class="setting-item">
                            <h3><i class="fas fa-database"></i> قاعدة البيانات</h3>
                            <button class="btn" id="exportBtn"><i class="fas fa-download"></i> تصدير البيانات</button>
                            <button class="btn" id="importBtn"><i class="fas fa-upload"></i> استيراد البيانات</button>
                            <input type="file" id="importFile" accept=".json" style="display: none;">
                        </div>
                        <div class="setting-item">
                            <h3><i class="fas fa-info-circle"></i> معلومات النظام</h3>
                            <div class="system-info">
                                <p><strong>إصدار النظام:</strong> 1.0.0</p>
                                <p><strong>عدد الأصناف:</strong> <span id="itemsCount">0</span></p>
                                <p><strong>عدد الفئات:</strong> <span id="categoriesCount">0</span></p>
                                <p><strong>آخر تحديث:</strong> <span id="lastUpdate">-</span></p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        `;
        
        initializeAdminPanel();
    }

    // باقي الوظائف تبقى كما هي (initializeAdminPanel, initializeItemsManagement, ...)
});
