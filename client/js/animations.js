// ============================================
// ملف الرسوم المتحركة لواجهة العميل
// ============================================

class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.intersectionObserver = null;
        this.scrollAnimations = [];
        this.initialize();
    }
    
    initialize() {
        // إعداد Intersection Observer للرسوم المتحركة عند التمرير
        this.setupIntersectionObserver();
        
        // بدء الرسوم المتحركة للخلفية
        this.startBackgroundAnimations();
        
        // إعداد مستمعي الأحداث
        this.setupEventListeners();
        
        console.log('✅ Animation Manager initialized');
    }
    
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateOnScroll(entry.target);
                }
            });
        }, options);
        
        // مراقبة جميع العناصر التي تحتاج إلى رسوم متحركة عند التمرير
        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            this.intersectionObserver.observe(element);
        });
    }
    
    animateOnScroll(element) {
        // إضافة فئة الرسوم المتحركة
        element.classList.add('animated');
        
        // إيقاف المراقبة بعد التنشيط
        this.intersectionObserver.unobserve(element);
    }
    
    startBackgroundAnimations() {
        // إنشاء عناصر عائمة في الخلفية
        this.createFloatingElements();
        
        // بدء حركة الفناجين
        this.animateCoffeeCups();
        
        // بدء حركة حبوب القهوة
        this.animateCoffeeBeans();
    }
    
    createFloatingElements() {
        const bgAnimation = document.querySelector('.bg-animation');
        if (!bgAnimation) return;
        
        // إزالة العناصر القديمة إذا وجدت
        bgAnimation.querySelectorAll('.floating-element').forEach(el => el.remove());
        
        // إنشاء عناصر عائمة جديدة
        const elementCount = 15;
        
        for (let i = 0; i < elementCount; i++) {
            const element = document.createElement('div');
            element.className = 'floating-element';
            
            // إعداد خصائص عشوائية
            const size = Math.random() * 40 + 10;
            const colorType = Math.floor(Math.random() * 4);
            const colors = [
                'rgba(139, 69, 19, 0.1)',
                'rgba(210, 105, 30, 0.1)',
                'rgba(255, 215, 0, 0.1)',
                'rgba(160, 82, 45, 0.1)'
            ];
            
            const shape = Math.random() > 0.5 ? 'circle' : 'rectangle';
            
            element.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${shape === 'circle' ? size : size * 0.5}px;
                background: ${colors[colorType]};
                border-radius: ${shape === 'circle' ? '50%' : '5px'};
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.3 + 0.1};
                animation: floatElement ${Math.random() * 30 + 15}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
                z-index: 0;
            `;
            
            bgAnimation.appendChild(element);
        }
    }
    
    animateCoffeeCups() {
        const coffeeCup = document.querySelector('.coffee-cup');
        if (!coffeeCup) return;
        
        // إضافة تأثير الاهتزاز الخفيف
        setInterval(() => {
            coffeeCup.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
        }, 3000);
    }
    
    animateCoffeeBeans() {
        const coffeeBeans = document.querySelectorAll('.coffee-bean');
        
        coffeeBeans.forEach((bean, index) => {
            // تأخيرات مختلفة لكل حبة
            bean.style.animationDelay = `${index * 2}s`;
            
            // تغيير اللون بشكل دوري
            setInterval(() => {
                const colors = [
                    'linear-gradient(45deg, #5D4037, #8B4513)',
                    'linear-gradient(45deg, #6D4C41, #A0522D)',
                    'linear-gradient(45deg, #8D6E63, #D2691E)'
                ];
                
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                bean.style.background = randomColor;
            }, Math.random() * 5000 + 5000);
        });
    }
    
    setupEventListeners() {
        // تأثيرات hover للعناصر
        this.setupHoverEffects();
        
        // تأثيرات النقر
        this.setupClickEffects();
        
        // تأثيرات تحميل الصور
        this.setupImageEffects();
    }
    
    setupHoverEffects() {
        // تأثير hover للبطاقات
        document.addEventListener('mouseover', (e) => {
            const card = e.target.closest('.menu-item');
            if (card && !card.classList.contains('hovering')) {
                card.classList.add('hovering');
                
                // تأثير الاهتزاز الخفيف
                card.style.transform = 'translateY(-5px)';
                
                // تأثير الظل
                card.style.boxShadow = '0 20px 40px rgba(139, 69, 19, 0.2)';
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const card = e.target.closest('.menu-item');
            if (card && card.classList.contains('hovering')) {
                card.classList.remove('hovering');
                
                // إعادة العنصر لوضعه الطبيعي
                card.style.transform = '';
                card.style.boxShadow = '';
            }
        });
        
        // تأثير hover للأزرار
        const buttons = document.querySelectorAll('button:not(.menu-item *)');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.classList.add('hover-effect');
            });
            
            button.addEventListener('mouseleave', () => {
                button.classList.remove('hover-effect');
            });
        });
    }
    
    setupClickEffects() {
        // تأثير النقر على الأزرار
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                this.createRippleEffect(e, button);
            }
        });
        
        // تأثير النقر على البطاقات
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.menu-item');
            if (card) {
                this.createPulseEffect(card);
            }
        });
    }
    
    createRippleEffect(event, element) {
        // إنصراف إذا كان الزر يحتوي بالفعل على تأثير ريبل
        if (element.querySelector('.ripple-effect')) return;
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.7);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            top: ${y}px;
            left: ${x}px;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        // إزالة العنصر بعد انتهاء الرسم المتحرك
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    createPulseEffect(element) {
        element.classList.add('pulse-effect');
        
        setTimeout(() => {
            element.classList.remove('pulse-effect');
        }, 600);
    }
    
    setupImageEffects() {
        // تأثير تحميل الصور
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
            
            // تحميل تقدمي للصور
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        observer.unobserve(img);
                    }
                });
            });
            
            observer.observe(img);
        });
    }
    
    // ========== وظائف الرسوم المتحركة العامة ==========
    
    fadeIn(element, duration = 600) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let opacity = 0;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            opacity = Math.min(elapsed / duration, 1);
            
            element.style.opacity = opacity;
            
            if (opacity < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    fadeOut(element, duration = 600) {
        let opacity = 1;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            opacity = Math.max(1 - elapsed / duration, 0);
            
            element.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    slideDown(element, duration = 600) {
        element.style.maxHeight = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const height = element.scrollHeight;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.maxHeight = `${progress * height}px`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    slideUp(element, duration = 600) {
        const height = element.scrollHeight;
        const startTime = performance.now();
        
        element.style.maxHeight = `${height}px`;
        element.style.overflow = 'hidden';
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.maxHeight = `${(1 - progress) * height}px`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.maxHeight = '';
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    shake(element, intensity = 5) {
        const originalTransform = element.style.transform;
        const shakes = [
            `translateX(${intensity}px)`,
            `translateX(${-intensity}px)`,
            `translateX(${intensity / 2}px)`,
            `translateX(${-intensity / 2}px)`,
            `translateX(0)`
        ];
        
        let index = 0;
        const interval = 50;
        
        const animate = () => {
            if (index < shakes.length) {
                element.style.transform = shakes[index];
                index++;
                setTimeout(animate, interval);
            } else {
                element.style.transform = originalTransform;
            }
        };
        
        animate();
    }
    
    bounce(element, height = 20) {
        const originalTransform = element.style.transform;
        const bounces = [
            `translateY(0)`,
            `translateY(${-height}px)`,
            `translateY(0)`,
            `translateY(${-height / 2}px)`,
            `translateY(0)`
        ];
        
        let index = 0;
        const interval = 100;
        
        const animate = () => {
            if (index < bounces.length) {
                element.style.transform = bounces[index];
                index++;
                setTimeout(animate, interval);
            } else {
                element.style.transform = originalTransform;
            }
        };
        
        animate();
    }
    
    rotate(element, degrees = 360, duration = 1000) {
        const originalTransform = element.style.transform;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const rotation = progress * degrees;
            
            element.style.transform = `${originalTransform} rotate(${rotation}deg)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.transform = originalTransform;
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // ========== تأثيرات خاصة ==========
    
    celebrate() {
        // تأثير الاحتفال (تستخدم للأحداث المهمة)
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#FF8E53'];
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createConfetti(colors);
            }, i * 100);
        }
    }
    
    createConfetti(colors) {
        const confetti = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 5;
        
        confetti.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            top: -20px;
            left: ${Math.random() * 100}vw;
            opacity: 0.9;
            z-index: 9999;
            pointer-events: none;
            animation: confetti-fall ${Math.random() * 3 + 2}s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        // إزالة الكونفيتي بعد الرسم المتحرك
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
    
    highlight(element, color = '#FFD700', duration = 2000) {
        const originalBoxShadow = element.style.boxShadow;
        const originalTransition = element.style.transition;
        
        element.style.transition = `box-shadow ${duration}ms ease`;
        element.style.boxShadow = `0 0 20px 10px ${color}`;
        
        setTimeout(() => {
            element.style.boxShadow = originalBoxShadow;
            element.style.transition = originalTransition;
        }, duration);
    }
    
    typewriter(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };
        
        type();
    }
    
    // ========== إدارة الرسوم المتحركة ==========
    
    registerAnimation(name, callback) {
        this.animations.set(name, callback);
    }
    
    playAnimation(name, ...args) {
        const animation = this.animations.get(name);
        if (animation) {
            animation(...args);
        }
    }
    
    stopAllAnimations() {
        // إيقاف جميع الرسوم المتحركة النشطة
        this.animations.forEach((animation, name) => {
            console.log(`Stopping animation: ${name}`);
        });
        
        this.animations.clear();
    }
}

// تهيئة مدير الرسوم المتحركة
let animationManager;

document.addEventListener('DOMContentLoaded', () => {
    animationManager = new AnimationManager();
    window.animationManager = animationManager;
});

// تصدير الوظائف للاستخدام العام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}

// إضافة أنماط CSS الديناميكية للرسوم المتحركة
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes confetti-fall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes floatElement {
        0%, 100% {
            transform: translate(0, 0) rotate(0deg);
        }
        25% {
            transform: translate(20px, -30px) rotate(90deg);
        }
        50% {
            transform: translate(-15px, 20px) rotate(180deg);
        }
        75% {
            transform: translate(25px, -10px) rotate(270deg);
        }
    }
    
    .pulse-effect {
        animation: pulse 0.6s ease;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }
    
    .hover-effect {
        transform: translateY(-2px);
        transition: transform 0.3s ease;
    }
    
    .menu-item.hovering {
        transition: all 0.3s ease;
    }
    
    img.loaded {
        animation: fadeIn 0.5s ease;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .animate-on-scroll.animated {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* دعم الحركة المخفضة */
    @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
`;

document.head.appendChild(animationStyles);

console.log('✅ Animation system ready');
