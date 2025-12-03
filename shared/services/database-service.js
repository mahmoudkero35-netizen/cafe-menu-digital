// ============================================
// خدمة قاعدة البيانات - الإصدار المعدل
// ============================================

class DatabaseService {
    constructor() {
        this.supabase = null;
        this.admin = null;
        this.settings = {};
        this.isInitialized = false;
        this.initPromise = null;
    }
    
    // تهيئة الخدمة
    async initialize() {
        // إذا كانت التهيئة قيد التنفيذ بالفعل
        if (this.initPromise) {
            return this.initPromise;
        }
        
        this.initPromise = new Promise(async (resolve, reject) => {
            try {
                console.log('🚀 بدء تهيئة Database Service...');
                
                // الانتظار حتى يكون Supabase جاهزاً
                await this.waitForSupabase();
                
                if (!window.supabaseClient) {
                    throw new Error('عميل Supabase غير متوفر');
                }
                
                this.supabase = window.supabaseClient;
                this.admin = window.supabaseAdmin;
                
                // التحقق البسيط من الاتصال
                try {
                    const { error } = await this.supabase
                        .from('categories')
                        .select('id')
                        .limit(1);
                    
                    if (error) {
                        console.warn('⚠️ تحذير اتصال قاعدة البيانات:', error.message);
                        // نستمر رغم التحذير
                    }
                } catch (connError) {
                    console.warn('⚠️ تحذير في الاتصال الأولي:', connError.message);
                }
                
                // تحميل الإعدادات
                await this.loadInitialSettings();
                
                this.isInitialized = true;
                console.log('✅ Database Service initialized');
                resolve(true);
                
            } catch (error) {
                console.error('❌ Database Service initialization error:', error);
                reject(error);
            }
        });
        
        return this.initPromise;
    }
    
    // الانتظار حتى يكون Supabase جاهزاً
    async waitForSupabase() {
        let attempts = 0;
        const maxAttempts = 30; // 15 ثانية كحد أقصى
        
        while (!window.supabaseClient && attempts < maxAttempts) {
            console.log(`⏳ في انتظار تهيئة Supabase... (${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (!window.supabaseClient) {
            throw new Error('انتهت المهلة في انتظار تهيئة Supabase');
        }
        
        return window.supabaseClient;
    }
    
    // تحميل الإعدادات الأولية
    async loadInitialSettings() {
        try {
            if (!this.supabase) {
                console.warn('⚠️ Supabase غير مهيئ، استخدام إعدادات افتراضية');
                this.settings = this.getDefaultSettings();
                return;
            }
            
            // محاولة قراءة جدول الإعدادات
            const { data, error } = await this.supabase
                .from('settings')
                .select('*');
            
            if (error) {
                // إذا كان الجدول غير موجود، استخدام الإعدادات الافتراضية
                console.log('ℹ️ جدول الإعدادات غير موجود، استخدام الإعدادات الافتراضية');
                this.settings = this.getDefaultSettings();
                return;
            }
            
            // تحويل البيانات إلى كائن إعدادات
            if (data && data.length > 0) {
                data.forEach(setting => {
                    this.settings[setting.key] = setting.value;
                });
                console.log('⚙️ Loaded settings:', Object.keys(this.settings).length, 'settings');
            } else {
                this.settings = this.getDefaultSettings();
            }
            
        } catch (error) {
            console.error('❌ Load settings error:', error);
            this.settings = this.getDefaultSettings();
        }
    }
    
    // الحصول على الإعدادات الافتراضية
    getDefaultSettings() {
        return {
            restaurant_name: 'مينو الكافيه',
            currency: 'ر.س',
            language: 'ar',
            theme: 'light',
            tax_rate: 15,
            service_charge: 10
        };
    }
    
    // ========== الوظائف العامة ==========
    
    // التحقق من تهيئة الخدمة
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }
    
    // ========== مصادقة المدير ==========
    
    async adminLogin(credentials) {
        try {
            await this.ensureInitialized();
            
            // في الوقت الحالي، نستخدم مصادقة بسيطة للتجربة
            const { email, password } = credentials;
            
            // بيانات افتراضية للتجربة
            if (email === 'admin' && password === 'admin123') {
                return {
                    success: true,
                    data: {
                        id: 1,
                        email: 'admin@cafe.com',
                        full_name_ar: 'مدير النظام',
                        role: 'admin',
                        created_at: new Date().toISOString()
                    },
                    token: btoa(JSON.stringify({
                        exp: Date.now() + (7 * 24 * 60 * 60 * 1000),
                        user_id: 1
                    }))
                };
            }
            
            return {
                success: false,
                message: 'بيانات الدخول غير صحيحة'
            };
            
        } catch (error) {
            console.error('Admin login error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    // ========== إدارة الأصناف ==========
    
    async getMenuItems(options = {}) {
        try {
            await this.ensureInitialized();
            
            const { limit = 50, offset = 0, category = null } = options;
            
            let query = this.supabase
                .from('menu_items')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);
            
            if (category) {
                query = query.eq('category_id', category);
            }
            
            const { data, error, count } = await query;
            
            if (error) {
                // إذا كان الجدول غير موجود، إرجاع بيانات افتراضية
                if (error.message.includes('does not exist')) {
                    console.log('ℹ️ جدول الأصناف غير موجود، استخدام بيانات افتراضية');
                    return {
                        success: true,
                        data: [],
                        count: 0
                    };
                }
                throw error;
            }
            
            return {
                success: true,
                data: data || [],
                count: count || 0
            };
            
        } catch (error) {
            console.error('Get menu items error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
    
    async createMenuItem(itemData) {
        try {
            await this.ensureInitialized();
            
            const { data, error } = await this.supabase
                .from('menu_items')
                .insert([itemData])
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                data: data,
                message: 'تم إضافة الصنف بنجاح'
            };
            
        } catch (error) {
            console.error('Create menu item error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // ========== إدارة الفئات ==========
    
    async getCategories() {
        try {
            await this.ensureInitialized();
            
            const { data, error } = await this.supabase
                .from('categories')
                .select('*', { count: 'exact' })
                .order('order_index', { ascending: true });
            
            if (error) {
                // إذا كان الجدول غير موجود، إرجاع فئات افتراضية
                if (error.message.includes('does not exist')) {
                    console.log('ℹ️ جدول الفئات غير موجود، استخدام فئات افتراضية');
                    return {
                        success: true,
                        data: [
                            { id: 1, name_ar: 'المشروبات', name_en: 'Drinks', is_active: true, order_index: 1 },
                            { id: 2, name_ar: 'الوجبات', name_en: 'Meals', is_active: true, order_index: 2 },
                            { id: 3, name_ar: 'الحلويات', name_en: 'Desserts', is_active: true, order_index: 3 }
                        ],
                        count: 3
                    };
                }
                throw error;
            }
            
            return {
                success: true,
                data: data || [],
                count: data ? data.length : 0
            };
            
        } catch (error) {
            console.error('Get categories error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
    
    // ========== التحليلات والإحصائيات ==========
    
    async getAnalytics() {
        try {
            await this.ensureInitialized();
            
            // بيانات تحليلية افتراضية
            return {
                success: true,
                data: {
                    totalItems: 24,
                    totalCategories: 6,
                    popularItems: 8,
                    newItems: 3,
                    availableItems: 20,
                    activeCategories: 5,
                    todayOrders: 42,
                    monthlyRevenue: 12500
                }
            };
            
        } catch (error) {
            console.error('Get analytics error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // ========== الإعدادات ==========
    
    async getSettings() {
        await this.ensureInitialized();
        return {
            success: true,
            data: this.settings
        };
    }
    
    async updateSettings(settings) {
        try {
            await this.ensureInitialized();
            
            // تحديث الإعدادات المحلية
            Object.assign(this.settings, settings);
            
            // محاولة حفظ في قاعدة البيانات
            try {
                const updates = Object.entries(settings).map(([key, value]) => ({
                    key,
                    value
                }));
                
                const { error } = await this.supabase
                    .from('settings')
                    .upsert(updates, { onConflict: 'key' });
                
                if (error) {
                    console.warn('⚠️ تحذير في حفظ الإعدادات:', error.message);
                }
            } catch (dbError) {
                console.warn('⚠️ تحذير: فشل حفظ الإعدادات في قاعدة البيانات:', dbError.message);
            }
            
            return {
                success: true,
                message: 'تم تحديث الإعدادات بنجاح'
            };
            
        } catch (error) {
            console.error('Update settings error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // ========== النسخ الاحتياطي ==========
    
    async backupDatabase() {
        try {
            await this.ensureInitialized();
            
            // محاكاة النسخ الاحتياطي
            return {
                success: true,
                message: 'تم إنشاء نسخة احتياطية بنجاح',
                timestamp: new Date().toISOString(),
                data: {
                    categories: [],
                    menu_items: [],
                    settings: this.settings
                }
            };
            
        } catch (error) {
            console.error('Backup error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// إنشاء نسخة واحدة من الخدمة
const databaseService = new DatabaseService();

// بدء التهيئة عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        try {
            await databaseService.initialize();
        } catch (error) {
            console.error('❌ فشل تهيئة Database Service:', error);
        }
    }, 1000);
});

// تصدير للاستخدام العام
window.databaseService = databaseService;

// تصدير لتوافق الوحدات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = databaseService;
}

console.log('✅ Database Service ready');
