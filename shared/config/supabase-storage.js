// ============================================
// إدارة تخزين Supabase
// ============================================

class SupabaseStorageManager {
    constructor() {
        this.supabase = window.supabaseClient;
        this.buckets = {
            images: 'cafe-images',
            documents: 'cafe-documents',
            backups: 'cafe-backups'
        };
        
        this.config = {
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            allowedDocumentTypes: ['application/pdf', 'application/msword', 'text/plain'],
            compressionQuality: 0.8,
            maxUploadRetries: 3
        };
        
        this.initializeBuckets();
    }
    
    async initializeBuckets() {
        try {
            // التحقق من وجود المجلدات الرئيسية
            const folders = ['menu-items', 'categories', 'avatars', 'logos', 'temp'];
            
            for (const folder of folders) {
                await this.ensureFolderExists('images', folder);
            }
            
            console.log('✅ Storage buckets initialized successfully');
        } catch (error) {
            console.error('❌ Storage initialization error:', error);
        }
    }
    
    async ensureFolderExists(bucket, folder) {
        try {
            // محاولة إنشاء المجلد إذا لم يكن موجوداً
            const { error } = await this.supabase.storage
                .from(bucket)
                .upload(`${folder}/.keep`, new Blob([]), {
                    upsert: false
                });
                
            // تجاهل الخطأ إذا كان الملف موجوداً بالفعل
            if (error && !error.message.includes('already exists')) {
                console.warn(`Warning creating folder ${folder}:`, error.message);
            }
            
            return { success: true, folder };
        } catch (error) {
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
            const validation = await this.validateImageFile(file);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            
            // تحسين الصورة إذا طُلب
            let processedFile = file;
            if (resize && this.isImage(file)) {
                processedFile = await this.processImage(file, { maxWidth, maxHeight, quality });
            }
            
            // إنشاء اسم فريد للملف
            const uniqueFileName = fileName || this.generateUniqueFileName(file, folder);
            
            // رفع الملف مع إعادة المحاولة
            const uploadResult = await this.uploadWithRetry(
                this.buckets.images,
                uniqueFileName,
                processedFile
            );
            
            if (!uploadResult.success) {
                throw new Error(uploadResult.error);
            }
            
            // الحصول على رابط عام
            const { data: { publicUrl } } = this.supabase.storage
                .from(this.buckets.images)
                .getPublicUrl(uniqueFileName);
            
            return {
                success: true,
                fileName: uniqueFileName,
                publicUrl: publicUrl,
                originalName: file.name,
                size: processedFile.size,
                mimeType: processedFile.type,
                uploadedAt: new Date().toISOString(),
                metadata: {
                    folder,
                    dimensions: options.dimensions,
                    optimized: resize
                }
            };
            
        } catch (error) {
            console.error('Image upload error:', error);
            return {
                success: false,
                error: error.message,
                fileName: file.name
            };
        }
    }
    
    async validateImageFile(file) {
        // التحقق من وجود الملف
        if (!file) {
            return { valid: false, error: 'لم يتم اختيار ملف' };
        }
        
        // التحقق من نوع الملف
        if (!this.config.allowedImageTypes.includes(file.type)) {
            return { 
                valid: false, 
                error: 'نوع الملف غير مدعوم. الرجاء استخدام صورة من نوع JPEG, PNG, WebP, أو GIF' 
            };
        }
        
        // التحقق من حجم الملف
        if (file.size > this.config.maxFileSize) {
            const maxSizeMB = this.config.maxFileSize / (1024 * 1024);
            return { 
                valid: false, 
                error: `حجم الملف كبير جداً. الحد الأقصى هو ${maxSizeMB}MB` 
            };
        }
        
        // التحقق من أبعاد الصورة
        const dimensions = await this.getImageDimensions(file);
        if (dimensions.width > 5000 || dimensions.height > 5000) {
            return { 
                valid: false, 
                error: 'أبعاد الصورة كبيرة جداً. الحد الأقصى هو 5000x5000 بكسل' 
            };
        }
        
        return { valid: true, dimensions };
    }
    
    async getImageDimensions(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.width,
                    height: img.height,
                    aspectRatio: img.width / img.height
                });
            };
            img.onerror = () => {
                resolve({ width: 0, height: 0, aspectRatio: 0 });
            };
            img.src = URL.createObjectURL(file);
        });
    }
    
    async processImage(file, options) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                try {
                    // حساب الأبعاد الجديدة مع الحفاظ على نسبة العرض إلى الارتفاع
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > options.maxWidth) {
                        height = (options.maxWidth / width) * height;
                        width = options.maxWidth;
                    }
                    
                    if (height > options.maxHeight) {
                        width = (options.maxHeight / height) * width;
                        height = options.maxHeight;
                    }
                    
                    // تعيين أبعاد الكانفاس
                    canvas.width = width;
                    canvas.height = height;
                    
                    // رسم الصورة معتدلة الجودة
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // تحويل إلى Blob
                    canvas.toBlob(
                        (blob) => {
                            resolve(new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now()
                            }));
                        },
                        file.type,
                        options.quality
                    );
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }
    
    // ========== إدارة الملفات ==========
    async uploadWithRetry(bucket, fileName, file, retries = this.config.maxUploadRetries) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const { data, error } = await this.supabase.storage
                    .from(bucket)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true,
                        contentType: file.type
                    });
                
                if (error) {
                    if (attempt === retries) {
                        return { success: false, error: error.message };
                    }
                    
                    // الانتظار قبل إعادة المحاولة
                    await this.delay(Math.pow(2, attempt) * 1000);
                    continue;
                }
                
                return { success: true, data };
            } catch (error) {
                if (attempt === retries) {
                    return { success: false, error: error.message };
                }
                await this.delay(Math.pow(2, attempt) * 1000);
            }
        }
        
        return { success: false, error: 'فشل رفع الملف بعد عدة محاولات' };
    }
    
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
                error: error.message,
                fileName
            };
        }
    }
    
    async listFiles(bucket, folder = '', options = {}) {
        const {
            limit = 100,
            offset = 0,
            sortBy = 'created_at',
            order = 'desc',
            search = ''
        } = options;
        
        try {
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .list(folder, {
                    limit,
                    offset,
                    sortBy: { column: sortBy, order }
                });
            
            if (error) throw error;
            
            // تطبيق البحث إذا وُجد
            let filteredData = data;
            if (search) {
                filteredData = data.filter(item => 
                    item.name.toLowerCase().includes(search.toLowerCase())
                );
            }
            
            // إضافة روابط عامة لكل ملف
            const filesWithUrls = filteredData.map(item => ({
                ...item,
                publicUrl: this.getPublicUrl(bucket, `${folder}/${item.name}`.replace('//', '/')),
                downloadUrl: this.getDownloadUrl(bucket, `${folder}/${item.name}`.replace('//', '/'))
            }));
            
            return {
                success: true,
                files: filesWithUrls,
                total: data.length,
                folder,
                bucket
            };
        } catch (error) {
            console.error('File listing error:', error);
            return {
                success: false,
                error: error.message,
                bucket,
                folder
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
    
    getDownloadUrl(bucket, fileName) {
        const { data: { signedUrl } } = this.supabase.storage
            .from(bucket)
            .createSignedUrl(fileName, 60); // رابط صالح لمدة 60 ثانية
        
        return signedUrl;
    }
    
    isImage(file) {
        return file && file.type.startsWith('image/');
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ========== معاينة الصور ==========
    createImagePreview(file, options = {}) {
        return new Promise((resolve, reject) => {
            const {
                maxWidth = 300,
                maxHeight = 200,
                quality = 0.7
            } = options;
            
            if (!this.isImage(file)) {
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
                                blob,
                                originalFile: file
                            });
                        },
                        'image/jpeg',
                        quality
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
    
    // ========== إحصائيات التخزين ==========
    async getStorageStats(bucket) {
        try {
            const { data: files } = await this.supabase.storage
                .from(bucket)
                .list();
            
            let totalSize = 0;
            let fileCount = 0;
            
            // حساب حجم الملفات (هذا تقدير)
            files.forEach(file => {
                if (file.metadata) {
                    totalSize += file.metadata.size || 0;
                }
                fileCount++;
            });
            
            return {
                success: true,
                bucket,
                totalFiles: fileCount,
                totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                bucket
            };
        }
    }
}

// إنشاء نسخة واحدة من المدير
const storageManager = new SupabaseStorageManager();

// تصدير الوظائف للاستخدام العام
window.supabaseStorage = storageManager;

// تصدير لتوافق CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = storageManager;
}

console.log('✅ Supabase Storage Manager initialized');
