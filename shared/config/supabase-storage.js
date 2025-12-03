// ============================================
// إدارة تخزين Supabase
// ============================================

class SupabaseStorageManager {
    constructor() {
        console.log('🚀 إنشاء مدير تخزين Supabase...');
        this.supabase = window.supabaseClient;
        this.buckets = {
            images: 'images',
            documents: 'documents',
            backups: 'backups'
        };
        
        this.config = {
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            allowedDocumentTypes: ['application/pdf', 'application/msword', 'text/plain'],
            compressionQuality: 0.8,
            maxUploadRetries: 3
        };
        
        // تهيئة الدلاء
        this.initializeBuckets().catch(error => {
            console.error('❌ خطأ في تهيئة التخزين:', error);
        });
    }
    
    // تهيئة دلاء التخزين
    async initializeBuckets() {
        try {
            console.log('📦 بدء تهيئة دلاء التخزين...');
            
            const folders = ['menu-items', 'categories', 'avatars', 'logos', 'temp'];
            
            for (const folder of folders) {
                await this.ensureFolderExists('images', folder);
            }
            
            console.log('✅ Storage buckets initialized successfully');
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة دلاء التخزين:', error);
            throw error;
        }
    }
    
    // التحقق من وجود مجلد
    async ensureFolderExists(bucket, folder) {
        try {
            console.log(`📁 جاري التحقق من المجلد: ${bucket}/${folder}`);
            
            // محاولة سرد محتويات المجلد
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .list(folder, { limit: 1 });
            
            // إذا حدث خطأ أو لم يكن المجلد موجوداً
            if (error) {
                console.log(`📁 المجلد ${folder} غير موجود، سيتم إنشاؤه تلقائياً عند الحاجة`);
                return { success: false, error: error.message };
            }
            
            console.log(`✅ المجلد ${folder} موجود أو سيكون جاهزاً عند الحاجة`);
            return { success: true, exists: true };
            
        } catch (error) {
            console.warn(`⚠️ تحذير عند التحقق من المجلد ${folder}:`, error.message);
            return { success: false, error: error.message };
        }
    }
    
    // ========== رفع الصور ==========
    
    async uploadImage(file, options = {}) {
        const {
            folder = 'menu-items',
            fileName = null,
            resize = true,
            maxWidth = 1200,
            maxHeight = 800,
            quality = this.config.compressionQuality
        } = options;
        
        try {
            // التحقق من الملف
            const validation = this.validateImageFile(file);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            
            // إنشاء اسم فريد
            const uniqueFileName = fileName || this.generateUniqueFileName(file, folder);
            
            // رفع الملف
            const { data, error } = await this.supabase.storage
                .from(this.buckets.images)
                .upload(uniqueFileName, file, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: file.type
                });
            
            if (error) throw error;
            
            // الحصول على رابط عام
            const { data: { publicUrl } } = this.supabase.storage
                .from(this.buckets.images)
                .getPublicUrl(uniqueFileName);
            
            return {
                success: true,
                fileName: uniqueFileName,
                publicUrl: publicUrl,
                originalName: file.name,
                size: file.size,
                mimeType: file.type,
                uploadedAt: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Image upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // التحقق من صحة ملف الصورة
    validateImageFile(file) {
        if (!file) {
            return { valid: false, error: 'لم يتم اختيار ملف' };
        }
        
        if (!this.config.allowedImageTypes.includes(file.type)) {
            return { 
                valid: false, 
                error: 'نوع الملف غير مدعوم. الرجاء استخدام صورة من نوع JPEG, PNG, WebP, أو GIF' 
            };
        }
        
        if (file.size > this.config.maxFileSize) {
            const maxSizeMB = this.config.maxFileSize / (1024 * 1024);
            return { 
                valid: false, 
                error: `حجم الملف كبير جداً. الحد الأقصى هو ${maxSizeMB}MB` 
            };
        }
        
        return { valid: true };
    }
    
    // ========== إدارة الملفات ==========
    
    async deleteFile(bucket, fileName) {
        try {
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .remove([fileName]);
            
            if (error) throw error;
            
            return {
                success: true,
                fileName,
                deletedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('File deletion error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async listFiles(bucket, folder = '', options = {}) {
        const { limit = 100, offset = 0, search = '' } = options;
        
        try {
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .list(folder, { limit, offset });
            
            if (error) throw error;
            
            // تطبيق البحث
            let filteredData = data;
            if (search) {
                filteredData = data.filter(item => 
                    item.name.toLowerCase().includes(search.toLowerCase())
                );
            }
            
            // إضافة روابط
            const filesWithUrls = filteredData.map(item => ({
                ...item,
                publicUrl: this.getPublicUrl(bucket, `${folder}/${item.name}`.replace('//', '/'))
            }));
            
            return {
                success: true,
                files: filesWithUrls,
                total: data.length,
                folder
            };
            
        } catch (error) {
            console.error('File listing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // ========== مساعدات ==========
    
    generateUniqueFileName(file, folder) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
        const extension = originalName.split('.').pop();
        const nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf('.'));
        
        return `${folder}/${nameWithoutExtension}-${timestamp}-${randomString}.${extension}`;
    }
    
    getPublicUrl(bucket, fileName) {
        const { data: { publicUrl } } = this.supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);
        
        return publicUrl;
    }
    
    // ========== معاينة الصور ==========
    
    createImagePreview(file, options = {}) {
        return new Promise((resolve, reject) => {
            const { maxWidth = 300, maxHeight = 200 } = options;
            
            if (!file.type.startsWith('image/')) {
                reject(new Error('الملف ليس صورة'));
                return;
            }
            
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                try {
                    // حساب الأبعاد مع الحفاظ على النسبة
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }
                    
                    if (height > maxHeight) {
                        width = (maxHeight / height) * width;
                        height = maxHeight;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob(
                        (blob) => {
                            const previewUrl = URL.createObjectURL(blob);
                            resolve({
                                url: previewUrl,
                                width,
                                height,
                                blob
                            });
                        },
                        'image/jpeg',
                        0.7
                    );
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }
    
    // ========== تنظيف الذاكرة ==========
    
    revokeObjectURL(url) {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }
}

// ============================================
// التهيئة التلقائية
// ============================================

// إنشاء نسخة واحدة من المدير
let storageManager = null;

function initializeStorageManager() {
    if (!storageManager && window.supabaseClient) {
        console.log('🚀 تهيئة مدير التخزين...');
        storageManager = new SupabaseStorageManager();
        window.supabaseStorage = storageManager;
        console.log('✅ Supabase Storage Manager initialized');
    }
    return storageManager;
}

// تهيئة عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    // انتظار حتى يكون Supabase جاهزاً
    if (window.supabaseClient) {
        initializeStorageManager();
    } else {
        // محاولة مرة أخرى بعد تأخير
        setTimeout(() => {
            if (window.supabaseClient) {
                initializeStorageManager();
            }
        }, 1000);
    }
});

// تهيئة عندما يصبح Supabase جاهزاً
window.addEventListener('supabaseReady', () => {
    initializeStorageManager();
});

// تصدير للاستخدام العام
window.initializeStorageManager = initializeStorageManager;

// تصدير لتوافق الوحدات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SupabaseStorageManager,
        initializeStorageManager
    };
}
