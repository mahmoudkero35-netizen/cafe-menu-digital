-- ============================================
-- بيانات اختبار مشروع مينو الكافيه
-- ============================================

-- بيانات الفئات الإضافية
INSERT INTO categories (name_ar, name_en, icon, color, sort_order) VALUES
    ('عصائر طازجة', 'Fresh Juices', 'fas fa-glass-martini-alt', '#00FF7F', 6),
    ('القهوة المختصة', 'Specialty Coffee', 'fas fa-mug-hot', '#8B4513', 7),
    ('الشاي والأعشاب', 'Tea & Herbs', 'fas fa-leaf', '#228B22', 8);

-- بيانات الأصناف الإضافية
INSERT INTO menu_items (category_id, name_ar, name_en, description_ar, price, is_popular, is_new, preparation_time, options) VALUES
    (6, 'عصير برتقال طازج', 'Fresh Orange Juice', 'عصير برتقال طازج معلب أمامك، مليء بالفيتامينات والطاقة', 18.00, TRUE, TRUE, 5, 
     '[{"name": "الحجم", "type": "radio", "required": true, "choices": [{"name": "صغير (250 مل)", "price": 0}, {"name": "متوسط (500 مل)", "price": 5}, {"name": "كبير (750 مل)", "price": 8}]}]'),
    
    (6, 'عصير فراولة وموز', 'Strawberry Banana Smoothie', 'مزيج لذيذ من الفراولة والموز الطازج مع الحليب', 22.00, FALSE, TRUE, 7,
     '[{"name": "الحليب", "type": "radio", "required": true, "choices": [{"name": "حليب بقر", "price": 0}, {"name": "حليب لوز", "price": 3}, {"name": "حليب صويا", "price": 3}]}]'),
    
    (7, 'قهوة تركية', 'Turkish Coffee', 'قهوة تركية أصيلة بدرجة تحميص متوسطة، تقدم في الفنجان التركي', 12.00, TRUE, FALSE, 8,
     '[{"name": "درجة الحلاوة", "type": "radio", "required": true, "choices": [{"name": "مرة", "price": 0}, {"name": "متوسطة", "price": 0}, {"name": "حلوة", "price": 0}]}]'),
    
    (7, 'لاتيه فني', 'Artistic Latte', 'قهوة لاتيه مع رسم فني على الوجه بإتقان بارع', 25.00, FALSE, TRUE, 10,
     '[{"name": "الرسم", "type": "select", "required": false, "choices": [{"name": "وردة", "price": 0}, {"name": "قلب", "price": 0}, {"name": "وجه", "price": 2}, {"name": "مخصص", "price": 5}]}]'),
    
    (8, 'شاي أخضر', 'Green Tea', 'شاي أخضر صيني عالي الجودة مع فوائد صحية عديدة', 10.00, TRUE, FALSE, 4,
     '[{"name": "نوع التحلية", "type": "radio", "required": false, "choices": [{"name": "بدون سكر", "price": 0}, {"name": "سكر أبيض", "price": 0}, {"name": "عسل طبيعي", "price": 3}, {"name": "ستيفيا", "price": 2}]}]'),
    
    (8, 'شاي أعشاب', 'Herbal Tea', 'خليط من الأعشاب الطبيعية المهدئة والمفيدة للصحة', 12.00, FALSE, TRUE, 5,
     '[{"name": "النوع", "type": "select", "required": true, "choices": [{"name": "نعناع", "price": 0}, {"name": "بابونج", "price": 0}, {"name": "زنجبيل", "price": 2}, {"name": "قرفة", "price": 2}]}]');

-- تحديث بعض الأصناف لتكون غير متوفرة
UPDATE menu_items SET is_available = FALSE WHERE name_ar IN ('قهوة تركية', 'شاي أعشاب');

-- تحديث أصناف لتكون نباتية
UPDATE menu_items SET is_vegetarian = TRUE WHERE name_ar IN ('تشيز كيك', 'عصير فراولة وموز');

-- تحديث أصناف لتكون حارة
UPDATE menu_items SET is_spicy = TRUE WHERE name_ar = 'قهوة تركية';

-- إضافة سعر خصم لبعض الأصناف
UPDATE menu_items SET discount_price = 22.00 WHERE name_ar = 'كابتشينو';
UPDATE menu_items SET discount_price = 20.00 WHERE name_ar = 'عصير برتقال طازج';

-- إضافة سعرات حرارية
UPDATE menu_items SET calories = 5 WHERE name_ar = 'إسبريسو';
UPDATE menu_items SET calories = 120 WHERE name_ar = 'كابتشينو';
UPDATE menu_items SET calories = 280 WHERE name_ar = 'ميلك شيك';
UPDATE menu_items SET calories = 350 WHERE name_ar = 'تشيز كيك';
UPDATE menu_items SET calories = 320 WHERE name_ar = 'ساندويتش جبنة مشوية';
UPDATE menu_items SET calories = 110 WHERE name_ar = 'عصير برتقال طازج';
UPDATE menu_items SET calories = 180 WHERE name_ar = 'عصير فراولة وموز';
UPDATE menu_items SET calories = 2 WHERE name_ar = 'قهوة تركية';
UPDATE menu_items SET calories = 150 WHERE name_ar = 'لاتيه فني';
UPDATE menu_items SET calories = 0 WHERE name_ar = 'شاي أخضر';
UPDATE menu_items SET calories = 5 WHERE name_ar = 'شاي أعشاب';

-- إضافة وسوم للأصناف
UPDATE menu_items SET tags = ARRAY['مشروب', 'قهوة'] WHERE name_ar = 'إسبريسو';
UPDATE menu_items SET tags = ARRAY['مشروب', 'قهوة', 'حليب'] WHERE name_ar = 'كابتشينو';
UPDATE menu_items SET tags = ARRAY['مشروب', 'بارد', 'حلو'] WHERE name_ar = 'ميلك شيك';
UPDATE menu_items SET tags = ARRAY['حلويات', 'مخبوزات'] WHERE name_ar = 'تشيز كيك';
UPDATE menu_items SET tags = ARRAY['وجبات', 'ساندويتش'] WHERE name_ar = 'ساندويتش جبنة مشوية';
UPDATE menu_items SET tags = ARRAY['مشروب', 'عصير', 'صحي'] WHERE name_ar = 'عصير برتقال طازج';
UPDATE menu_items SET tags = ARRAY['مشروب', 'عصير', 'سموذي'] WHERE name_ar = 'عصير فراولة وموز';
UPDATE menu_items SET tags = ARRAY['مشروب', 'قهوة', 'تقليدي'] WHERE name_ar = 'قهوة تركية';
UPDATE menu_items SET tags = ARRAY['مشروب', 'قهوة', 'فني'] WHERE name_ar = 'لاتيه فني';
UPDATE menu_items SET tags = ARRAY['مشروب', 'شاي', 'صحي'] WHERE name_ar = 'شاي أخضر';
UPDATE menu_items SET tags = ARRAY['مشروب', 'شاي', 'أعشاب'] WHERE name_ar = 'شاي أعشاب';

-- إضافة روابط صور للأصناف (صور من Unsplash)
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1510707577719-ae7c9b788690' WHERE name_ar = 'إسبريسو';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1570197788417-0e82375c9371' WHERE name_ar = 'كابتشينو';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699' WHERE name_ar = 'ميلك شيك';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e' WHERE name_ar = 'تشيز كيك';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af' WHERE name_ar = 'ساندويتش جبنة مشوية';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b' WHERE name_ar = 'عصير برتقال طازج';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1505252585461-04db1eb84625' WHERE name_ar = 'عصير فراولة وموز';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb' WHERE name_ar = 'قهوة تركية';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1572442388796-11668a67e53d' WHERE name_ar = 'لاتيه فني';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1561047029-3000c68339ca' WHERE name_ar = 'شاي أخضر';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2' WHERE name_ar = 'شاي أعشاب';

-- إضافة سجلات نشاط للمستخدمين
INSERT INTO activity_logs (user_id, action_type, table_name, record_id, ip_address, user_agent) VALUES
    ((SELECT id FROM admin_users WHERE username = 'admin'), 'login', 'admin_users', (SELECT id FROM admin_users WHERE username = 'admin'), '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
    ((SELECT id FROM admin_users WHERE username = 'admin'), 'create', 'menu_items', (SELECT id FROM menu_items WHERE name_ar = 'إسبريسو'), '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
    ((SELECT id FROM admin_users WHERE username = 'editor'), 'update', 'categories', (SELECT id FROM categories WHERE name_ar = 'المشروبات الساخنة'), '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
    ((SELECT id FROM admin_users WHERE username = 'admin'), 'create', 'menu_items', (SELECT id FROM menu_items WHERE name_ar = 'كابتشينو'), '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
    ((SELECT id FROM admin_users WHERE username = 'editor'), 'update', 'settings', (SELECT id FROM settings WHERE setting_key = 'design'), '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

-- إضافة خيارات إضافية مفصلة
INSERT INTO item_options (item_id, option_name_ar, option_name_en, option_type, is_required, max_choices, sort_order) VALUES
    ((SELECT id FROM menu_items WHERE name_ar = 'إسبريسو'), 'درجة التحميص', 'Roast Level', 'radio', FALSE, 1, 1),
    ((SELECT id FROM menu_items WHERE name_ar = 'إسبريسو'), 'الإضافات', 'Add-ons', 'checkbox', FALSE, 3, 2),
    ((SELECT id FROM menu_items WHERE name_ar = 'كابتشينو'), 'حجم الكوب', 'Cup Size', 'radio', TRUE, 1, 1),
    ((SELECT id FROM menu_items WHERE name_ar = 'كابتشينو'), 'نوع الحليب', 'Milk Type', 'radio', FALSE, 1, 2);

INSERT INTO option_choices (option_id, choice_name_ar, choice_name_en, additional_price, is_default, sort_order) VALUES
    -- درجة التحميص للإسبريسو
    (1, 'فاتح', 'Light', 0.00, FALSE, 1),
    (1, 'متوسط', 'Medium', 0.00, TRUE, 2),
    (1, 'داكن', 'Dark', 0.00, FALSE, 3),
    
    -- إضافات للإسبريسو
    (2, 'سكر', 'Sugar', 0.00, FALSE, 1),
    (2, 'قرفة', 'Cinnamon', 1.00, FALSE, 2),
    (2, 'كاكاو', 'Cocoa', 1.00, FALSE, 3),
    (2, 'كريمة', 'Cream', 2.00, FALSE, 4),
    
    -- حجم الكوب للكابتشينو
    (3, 'صغير', 'Small', 0.00, TRUE, 1),
    (3, 'متوسط', 'Medium', 3.00, FALSE, 2),
    (3, 'كبير', 'Large', 5.00, FALSE, 3),
    
    -- نوع الحليب للكابتشينو
    (4, 'كامل الدسم', 'Whole Milk', 0.00, TRUE, 1),
    (4, 'قليل الدسم', 'Low-fat Milk', 0.00, FALSE, 2),
    (4, 'خالي الدسم', 'Skim Milk', 0.00, FALSE, 3),
    (4, 'حليب لوز', 'Almond Milk', 3.00, FALSE, 4),
    (4, 'حليب صويا', 'Soy Milk', 3.00, FALSE, 5);

-- ============================================
-- إحصائيات العدد الإجمالي
-- ============================================

SELECT 
    'الفئات' as جدول,
    COUNT(*) as العدد
FROM categories
UNION ALL
SELECT 
    'الأصناف' as جدول,
    COUNT(*) as العدد
FROM menu_items
UNION ALL
SELECT 
    'الإعدادات' as جدول,
    COUNT(*) as العدد
FROM settings
UNION ALL
SELECT 
    'المستخدمين' as جدول,
    COUNT(*) as العدد
FROM admin_users
UNION ALL
SELECT 
    'سجلات النشاط' as جدول,
    COUNT(*) as العدد
FROM activity_logs;

-- ============================================
-- نهاية ملف بيانات الاختبار
-- ============================================
