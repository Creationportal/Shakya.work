// Simple interactive elements for the starter website
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Shakya.work — site loaded successfully');
    
    // Add smooth hover effects to feature cards
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.borderColor = 'rgba(247, 147, 30, 0.3)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        });
    });
});