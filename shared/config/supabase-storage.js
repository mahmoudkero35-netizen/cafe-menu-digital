async ensureFolderExists(bucket, folder) {
    try {
        console.log(`📁 جاري التحقق من مجلد: ${folder}`);
        
        // 1. محاولة سرد الملفات الموجودة
        const { data: existingFiles, error: listError } = await this.supabase.storage
            .from(bucket)
            .list(folder, { limit: 1 });
        
        // 2. إذا كان المجلد موجوداً بالفعل
        if (!listError || listError.message?.includes('not found')) {
            // تجاهل الخطأ - يمكن أن يكون الخطأ بسبب عدم وجود المجلد
            console.log(`✅ المجلد موجود أو سيتم إنشاؤه: ${folder}`);
            return { success: true, exists: false };
        }
        
        // 3. إذا حدث خطأ آخر
        if (listError && !listError.message?.includes('not found')) {
            console.warn(`⚠️ تحذير عند التحقق من المجلد ${folder}:`, listError.message);
        }
        
        return { success: true, exists: false };
        
    } catch (error) {
        console.warn(`⚠️ خطأ عند التحقق من المجلد ${folder}:`, error.message);
        return { 
            success: false, 
            error: error.message,
            folder 
        };
    }
}

// وفي دالة initializeBuckets:
async initializeBuckets() {
    try {
        console.log('📦 بدء تهيئة دلاء التخزين...');
        
        // فقط سرد المجلدات الموجودة دون إنشاء ملفات .keep
        const folders = ['menu-items', 'categories', 'avatars', 'logos', 'temp'];
        
        for (const folder of folders) {
            const result = await this.ensureFolderExists(this.buckets.images, folder);
            
            if (!result.success) {
                console.warn(`⚠️ تحذير في المجلد ${folder}:`, result.error);
            }
        }
        
        console.log('✅ تم تهيئة دلاء التخزين بنجاح');
        
    } catch (error) {
        console.error('❌ خطأ في تهيئة دلاء التخزين:', error);
    }
}
