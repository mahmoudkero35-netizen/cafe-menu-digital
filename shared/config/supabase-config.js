// ============================================
// إعدادات اتصال Supabase - الإصدار المعدل
// ============================================

// بيانات اتصال Supabase
const SUPABASE_CONFIG = {
    url: 'https://gpmxmpdqfphluliwgxuo.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbXhtcGRxZnBobHVsaXdneHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzYzMjcsImV4cCI6MjA4MDE1MjMyN30.4kcFpICfs4hIflS2ZspEWyznJS7W_STIqOfOf61nVhE',
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbXhtcGRxZnBobHVsaXdneHVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU3NjMyNywiZXhwIjoyMDgwMTUyMzI3fQ.Ytsb9XeW7DSuzlHa4nx8AZTw8E3Td_Yj9T0E8gFXok4',
    secretKey: 'sb_secret_H-hZxW8tigXjlfcq8Q5K5g_pbQ7BLjn'
};

// تأكد من تحميل Supabase
async function waitForSupabase() {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!window.supabase && attempts < maxAttempts) {
        console.log(`⏳ في انتظار تحميل Supabase... (${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
    }
    
    if (!window.supabase) {
        throw new Error('❌ فشل تحميل Supabase JS');
    }
    
    return window.supabase;
}

// تهيئة العميل الرئيسي
async function initializeSupabase() {
    try {
        console.log('🚀 بدء تهيئة Supabase...');
        
        const supabaseLib = await waitForSupabase();
        
        // عميل للقراءة فقط (للعميل)
        const supabaseClient = supabaseLib.createClient(
            SUPABASE_CONFIG.url, 
            SUPABASE_CONFIG.anonKey, 
            {
                auth: { persistSession: false },
                global: { headers: { 'X-Client-Info': 'cafe-menu-app/client' } }
            }
        );
        
        // عميل للإدارة (للأدمن)
        const supabaseAdmin = supabaseLib.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.serviceKey,
            {
                auth: { persistSession: false },
                global: { headers: { 'X-Client-Info': 'cafe-menu-app/admin' } }
            }
        );
        
        // حفظ للاستخدام العام
        window.supabaseClient = supabaseClient;
        window.supabaseAdmin = supabaseAdmin;
        window.SUPABASE_CONFIG = SUPABASE_CONFIG;
        
        console.log('✅ Supabase initialized successfully');
        
        // إرسال إشارة أن Supabase جاهز
        window.dispatchEvent(new CustomEvent('supabaseReady'));
        
        return { client: supabaseClient, admin: supabaseAdmin };
        
    } catch (error) {
        console.error('❌ خطأ في تهيئة Supabase:', error);
        throw error;
    }
}

// تصدير للاستخدام
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.initializeSupabase = initializeSupabase;

// التهيئة التلقائية
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM loaded, initializing Supabase...');
        initializeSupabase().catch(console.error);
    });
}
