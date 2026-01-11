// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add active state to navigation links on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// Syntax highlighting for code blocks (simple version)
function highlightCode() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        let code = block.textContent;
        
        // Simple keyword highlighting
        code = code.replace(/\b(const|let|var|function|return|if|else|import|export|from|default|interface|type|extends|implements)\b/g, 
            '<span class="keyword">$1</span>');
        
        // String highlighting
        code = code.replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, 
            '<span class="string">$&</span>');
        
        // Number highlighting
        code = code.replace(/\b\d+\b/g, 
            '<span class="number">$&</span>');
        
        block.innerHTML = code;
    });
}

// Run highlighting after page load
document.addEventListener('DOMContentLoaded', highlightCode);

// Add fade-in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .example-card, .doc-card, .step');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Copy code button functionality (optional enhancement)
function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('.code-block, .example-card pre, .step-content pre');
    
    codeBlocks.forEach(block => {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'Copy';
        button.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            padding: 4px 8px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: white;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        `;
        
        const container = block.closest('pre') || block;
        if (container.style.position !== 'relative') {
            container.style.position = 'relative';
        }
        
        button.addEventListener('click', () => {
            const code = block.textContent || block.innerText;
            navigator.clipboard.writeText(code).then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            });
        });
        
        // Only add to code blocks with dark background
        if (block.closest('.code-block') || block.style.background.includes('1e293b')) {
            container.appendChild(button);
        }
    });
}

document.addEventListener('DOMContentLoaded', addCopyButtons);
