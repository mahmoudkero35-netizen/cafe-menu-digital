// دالة لعرض تحذير الاتصال في واجهة المستخدم
window.showConnectionWarning = function(message) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'connection-warning';
    warningDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #f8d7da;
        color: #721c24;
        padding: 12px 24px;
        border-radius: 8px;
        border: 1px solid #f5c6cb;
        z-index: 9999;
        font-family: 'Tajawal', sans-serif;
        text-align: center;
        max-width: 500px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    `;
    
    warningDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>تحذير اتصال: ${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: #721c24;
            margin-right: 10px;
            cursor: pointer;
        ">×</button>
    `;
    
    document.body.appendChild(warningDiv);
    
    // إزالة التحذير بعد 10 ثواني
    setTimeout(() => {
        if (warningDiv.parentElement) {
            warningDiv.remove();
        }
    }, 10000);
};
