document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('loginContainer');
    const adminContainer = document.getElementById('adminContainer');

    const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

    if(localStorage.getItem('adminLoggedIn') === 'true') showAdminPanel();

    loginForm.addEventListener('submit', function(e){
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if(username===ADMIN_CREDENTIALS.username && password===ADMIN_CREDENTIALS.password){
            localStorage.setItem('adminLoggedIn','true');
            showAdminPanel();
        } else alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    });

    function showAdminPanel(){
        loginContainer.style.display='none';
        adminContainer.style.display='block';
        loadAdminPanel();
    }

    function loadAdminPanel(){
        adminContainer.innerHTML=`<h1>مرحبًا بك في لوحة التحكم</h1>
        <button class="btn" id="logoutBtn">تسجيل الخروج</button>`;
        initializeAdminPanel();
    }

    function initializeAdminPanel(){
        console.log("✔ Admin panel initialized");
        setupLogout();
    }

    function setupLogout(){
        document.getElementById('logoutBtn').addEventListener('click',()=>{
            localStorage.removeItem('adminLoggedIn');
            location.reload();
        });
    }
});
