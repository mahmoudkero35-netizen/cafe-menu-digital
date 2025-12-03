// admin.js - ملف التحكم الأساسي

// ========== دالة تبديل الأقسام ==========
function switchSection(sectionId) {
    // إخفاء كل الأقسام
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // تحديث الأزرار النشطة
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// ========== تهيئة الأحداث الأساسية ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 لوحة التحكم جاهزة');
    
    // أحداث الأزرار الجانبية
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            switchSection(section + 'Section');
        });
    });
    
    // إظهار القسم الرئيسي أولاً
    switchSection('dashboardSection');
});

// ========== دالات إدارة الأصناف ==========
function setupItemsEvents() {
    console.log('🍽️ أحداث الأصناف جاهزة');
    
    // زر إضافة صنف
    const addBtn = document.getElementById('addItemBtn');
    if (addBtn) {
        addBtn.onclick = function() {
            alert('إضافة صنف جديد - قريباً!');
        };
    }
    
    // زر حفظ
    const saveBtn = document.getElementById('saveItemBtn');
    if (saveBtn) {
        saveBtn.onclick = function() {
            alert('تم الحفظ!');
        };
    }
}

// ========== دالات إدارة الطلبات ==========
function setupOrdersEvents() {
    console.log('📋 أحداث الطلبات جاهزة');
    
    // زر طباعة
    const printBtn = document.getElementById('printOrderBtn');
    if (printBtn) {
        printBtn.onclick = printOrder;
    }
}

function printOrder() {
    alert('🖨️ جاري الطباعة...');
    window.print();
}

// ========== دالات التصميم ==========
function setupDesignEvents() {
    console.log('🎨 أحداث التصميم جاهزة');
    
    // معاينة الصورة
    const logoInput = document.getElementById('logoInput');
    if (logoInput) {
        logoInput.onchange = previewLogo;
    }
    
    // زر حفظ التصميم
    const saveDesignBtn = document.getElementById('saveDesignBtn');
    if (saveDesignBtn) {
        saveDesignBtn.onclick = saveDesign;
    }
}

function previewLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('logoPreview');
            if (preview) {
                preview.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
}

function saveDesign() {
    alert('✅ تم حفظ التصميم!');
}

// ========== جعل الدوال متاحة عالمياً ==========
window.setupItemsEvents = setupItemsEvents;
window.setupOrdersEvents = setupOrdersEvents;
window.setupDesignEvents = setupDesignEvents;
window.printOrder = printOrder;
window.previewLogo = previewLogo;
window.saveDesign = saveDesign;
