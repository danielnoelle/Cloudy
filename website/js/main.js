/**
 * Portfolio - Main JavaScript
 * Handles theme toggling, custom cursor, smooth scrolling, and animations
 */

(function() {
    'use strict';

    // ============================================
    // DOM Elements
    // ============================================
    const themeToggle = document.getElementById('themeToggle');
    const scrollTopBtn = document.getElementById('scrollTop');
    const currentYearSpan = document.getElementById('currentYear');
    const customCursor = document.getElementById('customCursor');
    
    // ============================================
    // Theme Management
    // ============================================
    const THEME_KEY = 'portfolio-theme';
    
    function getStoredTheme() {
        return localStorage.getItem(THEME_KEY);
    }
    
    function setStoredTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }
    
    function getPreferredTheme() {
        const storedTheme = getStoredTheme();
        if (storedTheme) {
            return storedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    function setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        setStoredTheme(theme);
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }
    
    // Initialize theme
    setTheme(getPreferredTheme());
    
    // Theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!getStoredTheme()) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

    // ============================================
    // Current Year
    // ============================================
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // ============================================
    // Scroll to Top
    // ============================================
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================
    // Custom Cursor (Desktop Only)
    // ============================================
    const isMobile = () => window.innerWidth <= 768;
    
    if (customCursor && !isMobile()) {
        // Add cursor-active class to hide default cursor
        document.body.classList.add('cursor-active');
        
        // Cursor position state
        let cursorX = window.innerWidth / 2;
        let cursorY = window.innerHeight / 2;
        let currentX = cursorX;
        let currentY = cursorY;
        let rotation = 0;
        let isSpinning = true;
        let animationFrame;
        
        // Cursor corner elements
        const cursorCorners = customCursor.querySelectorAll('.cursor-corner');
        const [cornerTL, cornerTR, cornerBR, cornerBL] = cursorCorners;
        
        // Constants
        const CORNER_SIZE = 10;
        const BORDER_WIDTH = 3;
        const SPIN_SPEED = 2; // degrees per frame at 60fps
        
        // Default corner positions
        const defaultPositions = {
            tl: { x: -CORNER_SIZE * 1.5, y: -CORNER_SIZE * 1.5 },
            tr: { x: CORNER_SIZE * 0.5, y: -CORNER_SIZE * 1.5 },
            br: { x: CORNER_SIZE * 0.5, y: CORNER_SIZE * 0.5 },
            bl: { x: -CORNER_SIZE * 1.5, y: CORNER_SIZE * 0.5 }
        };
        
        // Current target element
        let activeTarget = null;
        
        // Move cursor on mouse move
        function onMouseMove(e) {
            cursorX = e.clientX;
            cursorY = e.clientY;
        }
        
        // Animation loop
        function animate() {
            // Smooth cursor following
            const dx = cursorX - currentX;
            const dy = cursorY - currentY;
            currentX += dx * 0.15;
            currentY += dy * 0.15;
            
            // Apply transform
            if (isSpinning) {
                rotation += SPIN_SPEED;
                if (rotation >= 360) rotation = 0;
            }
            
            customCursor.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
            
            animationFrame = requestAnimationFrame(animate);
        }
        
        // Handle hovering over cursor targets
        function onMouseOver(e) {
            const target = e.target.closest('.cursor-target');
            
            if (target && target !== activeTarget) {
                activeTarget = target;
                isSpinning = false;
                rotation = 0;
                
                // Calculate target bounds relative to cursor position
                updateCornersForTarget(target);
            }
        }
        
        function onMouseOut(e) {
            const target = e.target.closest('.cursor-target');
            const relatedTarget = e.relatedTarget?.closest('.cursor-target');
            
            if (target === activeTarget && relatedTarget !== activeTarget) {
                activeTarget = null;
                isSpinning = true;
                
                // Reset corners to default positions
                resetCorners();
            }
        }
        
        function updateCornersForTarget(target) {
            const rect = target.getBoundingClientRect();
            
            // Calculate offsets from cursor center to target corners
            const offsetTL = {
                x: rect.left - cursorX - BORDER_WIDTH,
                y: rect.top - cursorY - BORDER_WIDTH
            };
            const offsetTR = {
                x: rect.right - cursorX + BORDER_WIDTH - CORNER_SIZE,
                y: rect.top - cursorY - BORDER_WIDTH
            };
            const offsetBR = {
                x: rect.right - cursorX + BORDER_WIDTH - CORNER_SIZE,
                y: rect.bottom - cursorY + BORDER_WIDTH - CORNER_SIZE
            };
            const offsetBL = {
                x: rect.left - cursorX - BORDER_WIDTH,
                y: rect.bottom - cursorY + BORDER_WIDTH - CORNER_SIZE
            };
            
            // Apply transforms
            cornerTL.style.transform = `translate(${offsetTL.x}px, ${offsetTL.y}px)`;
            cornerTR.style.transform = `translate(${offsetTR.x}px, ${offsetTR.y}px)`;
            cornerBR.style.transform = `translate(${offsetBR.x}px, ${offsetBR.y}px)`;
            cornerBL.style.transform = `translate(${offsetBL.x}px, ${offsetBL.y}px)`;
        }
        
        function resetCorners() {
            cornerTL.style.transform = `translate(${defaultPositions.tl.x}px, ${defaultPositions.tl.y}px)`;
            cornerTR.style.transform = `translate(${defaultPositions.tr.x}px, ${defaultPositions.tr.y}px)`;
            cornerBR.style.transform = `translate(${defaultPositions.br.x}px, ${defaultPositions.br.y}px)`;
            cornerBL.style.transform = `translate(${defaultPositions.bl.x}px, ${defaultPositions.bl.y}px)`;
        }
        
        // Initialize cursor
        customCursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
        resetCorners();
        
        // Event listeners
        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseover', onMouseOver);
        document.addEventListener('mouseout', onMouseOut);
        
        // Start animation
        animate();
        
        // Update on scroll (for target tracking)
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (activeTarget) {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    if (activeTarget) {
                        updateCornersForTarget(activeTarget);
                    }
                }, 10);
            }
        });
        
        // Handle resize
        window.addEventListener('resize', () => {
            if (isMobile()) {
                document.body.classList.remove('cursor-active');
                customCursor.style.display = 'none';
                cancelAnimationFrame(animationFrame);
            } else {
                document.body.classList.add('cursor-active');
                customCursor.style.display = 'block';
                if (!animationFrame) animate();
            }
        });
    }

    // ============================================
    // Animated Text Effect (Navigation)
    // ============================================
    const animatedTexts = document.querySelectorAll('.animated-text');
    
    animatedTexts.forEach(element => {
        const text = element.textContent;
        element.innerHTML = '';
        
        // Create container for the animated letters
        const container = document.createElement('span');
        container.className = 'animated-text-container';
        container.style.cssText = 'position: relative; display: inline-block; cursor: pointer;';
        
        text.split('').forEach((letter, index) => {
            const span = document.createElement('span');
            span.className = 'animated-letter';
            span.style.cssText = `
                position: relative;
                display: inline-block;
                overflow: hidden;
            `;
            
            const topLetter = document.createElement('span');
            topLetter.className = 'letter-top';
            topLetter.textContent = letter === ' ' ? '\u00A0' : letter;
            topLetter.style.cssText = `
                display: block;
                transition: transform 0.25s ease-in-out;
                transition-delay: ${index * 0.025}s;
            `;
            
            const bottomLetter = document.createElement('span');
            bottomLetter.className = 'letter-bottom';
            bottomLetter.textContent = letter === ' ' ? '\u00A0' : letter;
            bottomLetter.style.cssText = `
                display: block;
                position: absolute;
                left: 0;
                top: 0;
                transform: translateY(100%);
                transition: transform 0.25s ease-in-out;
                transition-delay: ${index * 0.025}s;
            `;
            
            span.appendChild(topLetter);
            span.appendChild(bottomLetter);
            container.appendChild(span);
        });
        
        element.appendChild(container);
        
        // Hover effects
        element.addEventListener('mouseenter', () => {
            const letters = element.querySelectorAll('.animated-letter');
            letters.forEach(letter => {
                letter.querySelector('.letter-top').style.transform = 'translateY(-100%)';
                letter.querySelector('.letter-bottom').style.transform = 'translateY(0)';
            });
        });
        
        element.addEventListener('mouseleave', () => {
            const letters = element.querySelectorAll('.animated-letter');
            letters.forEach(letter => {
                letter.querySelector('.letter-top').style.transform = 'translateY(0)';
                letter.querySelector('.letter-bottom').style.transform = 'translateY(100%)';
            });
        });
    });

    // ============================================
    // Moving Element Effect (Buttons/Icons)
    // ============================================
    const movingElements = document.querySelectorAll('.cursor-target');
    
    movingElements.forEach(element => {
        let bounds;
        
        element.addEventListener('mouseenter', () => {
            bounds = element.getBoundingClientRect();
        });
        
        element.addEventListener('mousemove', (e) => {
            if (!bounds) bounds = element.getBoundingClientRect();
            
            const relativeX = e.clientX - bounds.left;
            const relativeY = e.clientY - bounds.top;
            
            const xPercent = (relativeX / bounds.width - 0.5) * 2;
            const yPercent = (relativeY / bounds.height - 0.5) * 2;
            
            const moveX = xPercent * 5;
            const moveY = yPercent * 5;
            
            element.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translate(0, 0)';
            bounds = null;
        });
    });

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ============================================
    // Visitor Counter
    // ============================================
    const API_URL = 'https://apwqr9cqti.execute-api.ap-southeast-1.amazonaws.com/prod/visitor';

    async function updateVisitorCount() {
        try {
            const counterElement = document.getElementById('visitor-count');
            
            // 1. Show loading state
            if (counterElement) {
                counterElement.innerText = '...'; 
            }

            // 2. Fetch from API
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // 3. Update HTML
            if (counterElement) {
                counterElement.innerText = data.views;
            }

        } catch (error) {
            console.error('Error fetching visitor count:', error);
            const counterElement = document.getElementById('visitor-count');
            if (counterElement) {
                counterElement.innerText = 'Error';
            }
        }
    }

    // Initialize visitor counter on page load
    updateVisitorCount();

})();
