// ============================================
// إعدادات اتصال Supabase
// ============================================

// بيانات اتصال Supabase
const SUPABASE_CONFIG = {
    url: 'https://gpmxmpdqfphluliwgxuo.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbXhtcGRxZnBobHVsaXdneHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzYzMjcsImV4cCI6MjA4MDE1MjMyN30.4kcFpICfs4hIflS2ZspEWyznJS7W_STIqOfOf61nVhE',
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbXhtcGRxZnBobHVsaXdneHVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU3NjMyNywiZXhwIjoyMDgwMTUyMzI3fQ.Ytsb9XeW7DSuzlHa4nx8AZTw8E3Td_Yj9T0E8gFXok4',
    secretKey: 'sb_secret_H-hZxW8tigXjlfcq8Q5K5g_pbQ7BLjn'
};

// تهيئة عميل Supabase للعميل (public)
const supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
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
});

// تهيئة عميل Supabase للإدارة (يستخدم فقط في بيئة آمنة)
const supabaseAdmin = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        storage: localStorage,
        storageKey: 'supabase.admin.token'
    }
});

// دالة للتحقق من اتصال Supabase
async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabaseClient
            .from('categories')
            .select('count')
            .limit(1)
            .single();

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

// تصدير الوظائف والمتغيرات
window.supabaseConfig = SUPABASE_CONFIG;
window.supabaseClient = supabaseClient;
window.supabaseAdmin = supabaseAdmin;
window.checkSupabaseConnection = checkSupabaseConnection;
window.getStorageStatus = getStorageStatus;

// تسجيل رسالة النجاح
console.log('✅ Supabase configured successfully');
console.log('📊 Project URL:', SUPABASE_CONFIG.url);
console.log('🔐 Anon Key:', SUPABASE_CONFIG.anonKey.substring(0, 20) + '...');
console.log('🕐 Configuration time:', new Date().toISOString());

// التحقق التلقائي من الاتصال عند التحميل
window.addEventListener('DOMContentLoaded', async () => {
    const connection = await checkSupabaseConnection();
    if (!connection.connected) {
        console.warn('⚠️ Supabase connection issue:', connection.error);
        
        // عرض تحذير في واجهة المستخدم إذا لزم الأمر
        if (window.showConnectionWarning) {
            window.showConnectionWarning(connection.error);
        }
    } else {
        console.log('✅ Supabase connection established');
    }
});

// معالجة أخطاء الشبكة
window.addEventListener('online', () => {
    console.log('🌐 Network connection restored');
});

window.addEventListener('offline', () => {
    console.warn('🌐 Network connection lost');
});

// تصدير لتوافق CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        supabaseClient,
        supabaseAdmin,
        SUPABASE_CONFIG,
        checkSupabaseConnection,
        getStorageStatus
    };
}
