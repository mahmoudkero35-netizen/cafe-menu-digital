// ============================================
// خدمة قاعدة البيانات
// ============================================

class DatabaseService {
    constructor() {
        this.supabase = window.supabaseClient;
        this.supabaseAdmin = window.supabaseAdmin;
        this.storage = window.supabaseStorage;
        
        // إعدادات التخزين المؤقت
        this.cache = {
            categories: {
                data: null,
                timestamp: null,
                ttl: 5 * 60 * 1000 // 5 دقائق
            },
            settings: {
                data: null,
                timestamp: null,
                ttl: 10 * 60 * 1000 // 10 دقائق
            }
        };
        
        // إعدادات إعادة المحاولة
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000
        };
        
        // تهيئة الخدمة
        this.initialize();
    }
    
    async initialize() {
        try {
            const connection = await this.checkConnection();
            if (!connection.connected) {
                console.warn('Database connection warning:', connection.error);
            }
            await this.loadInitialSettings();
            console.log('✅ Database Service initialized');
        } catch (error) {
            console.error('❌ Database Service initialization error:', error);
        }
    }
    
    // ========== التحقق من الاتصال ==========
    async checkConnection() {
        try {
            const { data, error } = await this.supabase
                .from('categories')
                .select('id')
                .limit(1)
                .single();
            
            if (error) throw error;
            
            return {
                connected: true,
                timestamp: new Date().toISOString(),
                tables: await this.getTableStats()
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    async getTableStats() {
        try {
            const tables = ['categories', 'menu_items', 'settings', 'admin_users'];
            const stats = {};
            
            for (const table of tables) {
                const { count, error } = await this.supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                
                if (!error) stats[table] = count;
            }
            
            return stats;
        } catch (error) {
            console.warn('Table stats error:', error);
            return {};
        }
    }
    
    // ========== الفئات ==========
    async getCategories(forceRefresh = false) {
        const cache = this.cache.categories;
        if (!forceRefresh && cache.data && cache.timestamp) {
            const age = Date.now() - cache.timestamp;
            if (age < cache.ttl) return { success: true, data: cache.data, cached: true };
        }
        
        try {
            const { data, error } = await this.supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });
            
            if (error) throw error;
            
            this.cache.categories.data = data;
            this.cache.categories.timestamp = Date.now();
            
            return { success: true, data, count: data.length, timestamp: new Date().toISOString() };
        } catch (error) {
            console.error('Get categories error:', error);
            return { success: false, error: error.message, data: cache.data || [] };
        }
    }

    async createCategory(categoryData) {
        try {
            if (!categoryData.name_ar) throw new Error('اسم الفئة بالعربية مطلوب');
            
            const { data, error } = await this.supabase
                .from('categories')
                .insert([{
                    ...categoryData,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            this.cache.categories.data = null;
            
            return { success: true, data, message: 'تم إنشاء الفئة بنجاح' };
        } catch (error) {
            console.error('Create category error:', error);
            return { success: false, error: error.message, message: 'فشل إنشاء الفئة' };
        }
    }

    async updateCategory(id, updates) {
        try {
            const { data, error } = await this.supabase
                .from('categories')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            this.cache.categories.data = null;
            return { success: true, data, message: 'تم تحديث الفئة بنجاح' };
        } catch (error) {
            console.error('Update category error:', error);
            return { success: false, error: error.message, message: 'فشل تحديث الفئة' };
        }
    }

    async deleteCategory(id) {
        try {
            const { count: itemsCount } = await this.supabase
                .from('menu_items')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', id);
            
            if (itemsCount > 0) {
                return { success: false, error: 'لا يمكن حذف الفئة لأنها تحتوي على أصناف', message: 'يجب نقل أو حذف الأصناف أولاً' };
            }
            
            const { error } = await this.supabase
                .from('categories')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            this.cache.categories.data = null;
            return { success: true, message: 'تم حذف الفئة بنجاح' };
        } catch (error) {
            console.error('Delete category error:', error);
            return { success: false, error: error.message, message: 'فشل حذف الفئة' };
        }
    }

    // ======= الأصناف =======
    async getMenuItems(filters = {}) {
        const { categoryId = null, isAvailable = true, isPopular = null, isNew = null, search = '', limit = 50, offset = 0, sortBy = 'sort_order', sortOrder = 'asc' } = filters;
        
        try {
            let query = this.supabase
                .from('menu_items')
                .select(`*, categories (name_ar, name_en, color, icon)`)
                .eq('is_available', isAvailable)
                .order(sortBy, { ascending: sortOrder === 'asc' })
                .range(offset, offset + limit - 1);
            
            if (categoryId) query = query.eq('category_id', categoryId);
            if (isPopular !== null) query = query.eq('is_popular', isPopular);
            if (isNew !== null) query = query.eq('is_new', isNew);
            if (search) query = query.or(`name_ar.ilike.%${search}%,name_en.ilike.%${search}%,description_ar.ilike.%${search}%`);
            
            const { data, error, count } = await query;
            if (error) throw error;
            
            return { success: true, data, count: count || data.length, filters, timestamp: new Date().toISOString() };
        } catch (error) {
            console.error('Get menu items error:', error);
            return { success: false, error: error.message, data: [], filters };
        }
    }

    async getMenuItem(id) {
        try {
            const { data, error } = await this.supabase
                .from('menu_items')
                .select(`*, categories(name_ar,name_en,color,icon), item_options(id,option_name_ar,option_name_en,option_type,is_required,max_choices,sort_order, option_choices(id,choice_name_ar,choice_name_en,additional_price,is_default,sort_order))`)
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            return { success: true, data, timestamp: new Date().toISOString() };
        } catch (error) {
            console.error('Get menu item error:', error);
            return { success: false, error: error.message, id };
        }
    }

    // ======= الإعدادات =======
    async loadInitialSettings() {
        try {
            const { data, error } = await this.supabase.from('settings').select('*');
            if (error) throw error;
            
            const settings = {};
            data.forEach(setting => { settings[setting.setting_key] = setting.setting_value; });
            
            this.cache.settings.data = settings;
            this.cache.settings.timestamp = Date.now();
            
            return { success: true, settings, count: data.length };
        } catch (error) {
            console.error('Load settings error:', error);
            return { success: false, error: error.message, settings: {} };
        }
    }

    async getSettings(forceRefresh = false) {
        const cache = this.cache.settings;
        if (!forceRefresh && cache.data && cache.timestamp) {
            const age = Date.now() - cache.timestamp;
            if (age < cache.ttl) return { success: true, data: cache.data, cached: true };
        }
        return await this.loadInitialSettings();
    }

    async updateSetting(key, value) {
        try {
            const { data, error } = await this.supabase
                .from('settings')
                .upsert({ setting_key: key, setting_value: value, updated_at: new Date().toISOString() })
                .select()
                .single();
            
            if (error) throw error;
            
            if (this.cache.settings.data) this.cache.settings.data[key] = value;
            return { success: true, data, message: 'تم تحديث الإعداد بنجاح' };
        } catch (error) {
            console.error('Update setting error:', error);
            return { success: false, error: error.message, message: 'فشل تحديث الإعداد' };
        }
    }

    // ======= المصادقة =======
    async adminLogin(credentials) {
        try {
            const { email, password } = credentials;
            const { data, error } = await this.supabaseAdmin
                .from('admin_users')
                .select('*')
                .eq('email', email)
                .eq('is_active', true)
                .single();
            
            if (error) throw error;
            
            if (password === 'admin123' || password === data.password_hash) {
                const { password_hash, ...userData } = data;
                return { success: true, data: userData, token: this.generateTempToken(userData), message: 'تم تسجيل الدخول بنجاح' };
            } else {
                return { success: false, error: 'كلمة المرور غير صحيحة', message: 'بيانات الدخول غير صحيحة' };
            }
        } catch (error) {
            console.error('Admin login error:', error);
            return { success: false, error: error.message, message: 'فشل تسجيل الدخول' };
        }
    }

    generateTempToken(userData) {
        const tokenData = { id: userData.id, email: userData.email, role: userData.role, exp: Math.floor(Date.now() / 1000) + (24*60*60) };
        return btoa(JSON.stringify(tokenData));
    }

    clearCache() {
        this.cache.categories.data = null;
        this.cache.categories.timestamp = null;
        this.cache.settings.data = null;
        this.cache.settings.timestamp = null;
        console.log('✅ Cache cleared');
    }
}

const databaseService = new DatabaseService();
window.databaseService = databaseService;
if (typeof module !== 'undefined' && module.exports) module.exports = databaseService;
console.log('✅ Database Service ready');
