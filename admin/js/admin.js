// ============ إعداد التبديل بين الأقسام ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 لوحة التحكم جاهزة للعمل');
    
    // التبديل بين أقسام التحكم
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.control-section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // إخفاء كل الأقسام
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            // إظهار القسم المختار
            const activeSection = document.getElementById(targetSection);
            if (activeSection) {
                activeSection.style.display = 'block';
            }
            
            // تحديث الأزرار النشطة
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // تهيئة الأحداث
    setupMenuEvents();
    setupDesignEvents();
    
    // تحميل البيانات الحالية
    loadCurrentSettings();
});

// ============ إدارة المنيو ============
function setupMenuEvents() {
    console.log('🍽️ تهيئة أحداث المنيو');
    
    // زر إضافة صنف
    document.getElementById('addItemBtn')?.addEventListener('click', addNewItem);
    
    // زر حفظ المنيو
    document.getElementById('saveMenuBtn')?.addEventListener('click', saveMenu);
    
    // زر حذف صنف
    document.getElementById('deleteItemBtn')?.addEventListener('click', deleteItem);
    
    // معاينة صورة الصنف
    document.getElementById('itemImage')?.addEventListener('change', previewItemImage);
}

// إضافة صنف جديد
function addNewItem() {
    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    const category = document.getElementById('itemCategory').value;
    
    if (!name || !price) {
        alert('⚠️ من فضلك أدخل اسم الصنف والسعر');
        return;
    }
    
    // إضافة للجدول المؤقت
    const table = document.getElementById('itemsTable');
    const row = table.insertRow();
    
    row.innerHTML = `
        <td><input type="text" value="${name}" class="form-control"></td>
        <td><input type="number" value="${price}" class="form-control"></td>
        <td>
            <select class="form-control">
                <option ${category === 'مشروبات' ? 'selected' : ''}>مشروبات</option>
                <option ${category === 'حلويات' ? 'selected' : ''}>حلويات</option>
                <option ${category === 'أكل' ? 'selected' : ''}>أكل</option>
            </select>
        </td>
        <td>
            <button class="btn btn-sm btn-danger" onclick="removeRow(this)">🗑️</button>
        </td>
    `;
    
    // تفريغ الحقول
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
    
    alert(`✅ تم إضافة "${name}" بنجاح`);
}

// حفظ المنيو
function saveMenu() {
    const items = [];
    const rows = document.querySelectorAll('#itemsTable tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
            items.push({
                name: cells[0].querySelector('input').value,
                price: cells[1].querySelector('input').value,
                category: cells[2].querySelector('select').value
            });
        }
    });
    
    // حفظ في localStorage (مؤقت)
    localStorage.setItem('cafeMenu', JSON.stringify(items));
    
    alert(`💾 تم حفظ ${items.length} صنف في المنيو`);
    
    // يمكنك هنا إرسال البيانات للسيرفر
    console.log('بيانات المنيو:', items);
}

// حذف صنف
function deleteItem() {
    if (confirm('هل تريد حذف هذا الصنف؟')) {
        // كود الحذف
        alert('تم حذف الصنف');
    }
}

// معاينة صورة الصنف
function previewItemImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('itemPreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// ============ إدارة التصميم ============
function setupDesignEvents() {
    console.log('🎨 تهيئة أحداث التصميم');
    
    // تغيير اللون
    document.getElementById('primaryColor')?.addEventListener('input', function(e) {
        document.documentElement.style.setProperty('--primary-color', e.target.value);
        updateColorPreview();
    });
    
    // تغيير الخط
    document.getElementById('fontFamily')?.addEventListener('change', function(e) {
        document.documentElement.style.setProperty('--font-family', e.target.value);
    });
    
    // معاينة الشعار
    document.getElementById('logoUpload')?.addEventListener('change', previewLogo);
    
    // حفظ التصميم
    document.getElementById('saveDesignBtn')?.addEventListener('click', saveDesign);
}

// معاينة الشعار
function previewLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('logoPreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
            document.getElementById('currentLogo').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// تحديث معاينة اللون
function updateColorPreview() {
    const color = document.getElementById('primaryColor').value;
    document.getElementById('colorPreview').style.backgroundColor = color;
}

// حفظ التصميم
function saveDesign() {
    const design = {
        primaryColor: document.getElementById('primaryColor').value,
        fontFamily: document.getElementById('fontFamily').value,
        logo: document.getElementById('logoPreview').src || '',
        savedAt: new Date().toLocaleString()
    };
    
    // حفظ في localStorage
    localStorage.setItem('cafeDesign', JSON.stringify(design));
    
    // تطبيق التغييرات على صفحة العرض
    applyDesignToMainPage(design);
    
    alert('✅ تم حفظ التصميم بنجاح!');
}

// تطبيق التصميم على الصفحة الرئيسية
function applyDesignToMainPage(design) {
    // هنا يمكنك إرسال التصميم للسيرفر
    // أو تحديث صفحة العرض إذا كانت مفتوحة
    console.log('التصميم المحفوظ:', design);
    
    // تخزين للإستخدام في صفحة العرض
    localStorage.setItem('cafeTheme', JSON.stringify(design));
}

// ============ تحميل الإعدادات الحالية ============
function loadCurrentSettings() {
    // تحميل المنيو المحفوظ
    const savedMenu = localStorage.getItem('cafeMenu');
    if (savedMenu) {
        const menu = JSON.parse(savedMenu);
        console.log('تم تحميل المنيو:', menu.length, 'صنف');
    }
    
    // تحميل التصميم المحفوظ
    const savedDesign = localStorage.getItem('cafeDesign');
    if (savedDesign) {
        const design = JSON.parse(savedDesign);
        
        // تطبيق التصميم
        document.getElementById('primaryColor').value = design.primaryColor || '#4CAF50';
        document.getElementById('fontFamily').value = design.fontFamily || 'Arial';
        
        if (design.logo) {
            document.getElementById('logoPreview').src = design.logo;
            document.getElementById('currentLogo').src = design.logo;
        }
        
        updateColorPreview();
    }
}

// ============ دوال مساعدة ============
function removeRow(button) {
    const row = button.closest('tr');
    row.remove();
}

// ============ جعل الدوال متاحة عالمياً ============
window.previewLogo = previewLogo;
window.saveDesign = saveDesign;
window.removeRow = removeRow;
