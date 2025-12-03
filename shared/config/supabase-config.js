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

// التأكد من أن supabase-js محمل
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

// تهيئة عميل Supabase للعميل (public)
async function initializeSupabase() {
    try {
        console.log('🚀 بدء تهيئة Supabase...');
        
        // الانتظار حتى يتم تحميل مكتبة supabase-js
        const supabaseLib = await waitForSupabase();
        
        // إنشاء العميل
        const supabaseClient = supabaseLib.createClient(
            SUPABASE_CONFIG.url, 
            SUPABASE_CONFIG.anonKey, 
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: false,
                    storage: localStorage,
                    storageKey: 'supabase.auth.token'
                },
                global: {
                    headers: {
                        'X-Client-Info': 'cafe-menu-app/1.0.0'
                    }
                },
                db: {
                    schema: 'public'
                }
            }
        );
        
        // تهيئة عميل الإدارة (للبيئة الآمنة فقط)
        const supabaseAdmin = supabaseLib.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.serviceKey,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: false
                }
            }
        );
        
        // تصدير المتغيرات للاستخدام العام
        window.supabaseClient = supabaseClient;
        window.supabaseAdmin = supabaseAdmin;
        window.SUPABASE_CONFIG = SUPABASE_CONFIG;
        
        console.log('✅ Supabase configured successfully');
        console.log('📊 Project URL:', SUPABASE_CONFIG.url);
        console.log('🔐 Anon Key:', SUPABASE_CONFIG.anonKey.substring(0, 20) + '...');
        console.log('🕐 Configuration time:', new Date().toISOString());
        
        // إعلام التطبيق بأن Supabase جاهز
        window.dispatchEvent(new CustomEvent('supabaseReady'));
        
        return {
            client: supabaseClient,
            admin: supabaseAdmin,
            config: SUPABASE_CONFIG
        };
        
    } catch (error) {
        console.error('❌ خطأ في تهيئة Supabase:', error);
        throw error;
    }
}

// دالة للتحقق من اتصال Supabase
async function checkSupabaseConnection() {
    try {
        if (!window.supabaseClient) {
            throw new Error('عميل Supabase غير مهيئ');
        }
        
        const { data, error } = await window.supabaseClient
            .from('categories')
            .select('id')
            .limit(1);
        
        if (error) {
            console.warn('Supabase connection warning:', error.message);
            return {
                connected: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
        
        return {
            connected: true,
            timestamp: new Date().toISOString(),
            url: SUPABASE_CONFIG.url
        };
    } catch (error) {
        console.error('Supabase connection error:', error);
        return {
            connected: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

// دالة للحصول على حالة التخزين
function getStorageStatus() {
    try {
        const hasLocalStorage = typeof localStorage !== 'undefined';
        const hasSessionStorage = typeof sessionStorage !== 'undefined';
        
        return {
            localStorage: hasLocalStorage,
            sessionStorage: hasSessionStorage,
            quota: hasLocalStorage ? navigator.storage?.estimate?.() : null
        };
    } catch (error) {
        return {
            localStorage: false,
            sessionStorage: false,
            error: error.message
        };
    }
}

// دالة لعرض تحذير الاتصال
window.showConnectionWarning = function(message) {
    console.warn('⚠️ تحذير اتصال:', message);
    
    // يمكن إضافة عرض رسالة في واجهة المستخدم هنا
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'warning',
            title: 'تحذير اتصال',
            text: message,
            timer: 5000,
            showConfirmButton: false
        });
    }
};

// بدء التهيئة تلقائياً
window.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('📄 DOM جاهز، جاري تهيئة Supabase...');
        await initializeSupabase();
        
        // التحقق من الاتصال
        const connection = await checkSupabaseConnection();
        if (connection.connected) {
            console.log('✅ Supabase connection established');
        } else {
            console.warn('⚠️ Supabase connection issue:', connection.error);
            window.showConnectionWarning(connection.error);
        }
    } catch (error) {
        console.error('❌ فشل تهيئة Supabase:', error);
        window.showConnectionWarning('فشل الاتصال بقاعدة البيانات');
    }
});

// تصدير للاستخدام في الوحدات النمطية
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_CONFIG,
        initializeSupabase,
        checkSupabaseConnection,
        getStorageStatus
    };
}
