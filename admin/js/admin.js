async ensureFolderExists(bucket, folder) {
    try {
        console.log(`📁 التحقق من وجود المجلد: ${bucket}/${folder}`);
        
        // 1. محاولة سرد محتويات المجلد
        const { data: existingFiles, error: listError } = await this.supabase.storage
            .from(bucket)
            .list(folder);
        
        // 2. إذا كان المجلد غير موجود أو فارغ، أنشئ ملف بديل
        if (listError || !existingFiles || existingFiles.length === 0) {
            // استخدام محتوى غير فارغ
            const content = new Blob(['# Folder placeholder for ' + folder], { 
                type: 'text/plain' 
            });
            
            const file = new File([content], '_placeholder.txt', {
                type: 'text/plain',
                lastModified: Date.now()
            });
            
            // رفع الملف
            const { error: uploadError } = await this.supabase.storage
                .from(bucket)
                .upload(`${folder}/_placeholder.txt`, file, {
                    upsert: true,
                    contentType: 'text/plain'
                });
            
            if (uploadError) {
                // إذا فشل الرفع، قد تكون المشكلة في سياسات RLS
                console.warn(`⚠️ تحذير عند إنشاء المجلد ${folder}:`, uploadError.message);
                
                // محاولة بديلة: التحقق فقط من وجود المجلد دون إنشاء ملفات
                console.log(`⚠️ سيتم تخطي إنشاء المجلد ${folder} بسبب سياسات الأمان`);
                return { 
                    success: false, 
                    warning: 'يجب تعديل سياسات تخزين Supabase للسماح بإنشاء المجلدات',
                    folder 
                };
            }
            
            console.log(`✅ تم إنشاء المجلد: ${folder}`);
            return { success: true, folder, created: true };
        }
        
        console.log(`✅ المجلد موجود بالفعل: ${folder}`);
        return { success: true, folder, exists: true };
        
    } catch (error) {
        console.warn(`❌ خطأ عند التحقق من المجلد ${folder}:`, error.message);
        return { 
            success: false, 
            error: error.message,
            folder 
        };
    }
}
