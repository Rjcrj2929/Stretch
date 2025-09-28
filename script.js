// ====================================
// DATA CONFIGURATION
// ====================================

const timelineData = {
    education: [
        {
            title: "Industrial Design",
            company: "Nanyang Polytechnic",
            startDate: "2020-04",
            endDate: "2023-02",
            gpa: "2.76",
            details: "Diploma in Industrial Design focusing on product development, user-centered design, and manufacturing processes."
        },
        {
            title: "Graphic Design",
            company: "Coursera - California Institute of the Arts",
            startDate: "2024-10",
            endDate: "2025-03",
            details: "Comprehensive course covering visual communication, typography, branding, and digital design principles."
        },
        {
            title: "Web Design",
            company: "Coursera - University of Michigan",
            startDate: "2025-04",
            endDate: "2025-07",
            details: "Web design fundamentals including HTML, CSS, responsive design, and user experience principles."
        },
        {
            title: "User Experience and Digital Product Design",
            company: "Singapore Polytechnic",
            startDate: "2024-10",
            endDate: "2025-09",
            gpa: "3.25",
            details: "Specialist Diploma focusing on UX research, prototyping, user interface design, and digital product strategy."
        }
    ],
    experience: [
        {
            title: "Industrial Designer (Internship)",
            company: "One Maker Group",
            startDate: "2022-08",
            endDate: "2022-12",
            details: "Industrial designer, Project lead, workshop coach/facilitator, Makerspace coach. Gained hands-on experience in product development and design thinking methodologies."
        },
        {
            title: "Industrial Designer (Part Time)",
            company: "One Maker Group",
            startDate: "2023-01",
            endDate: "2023-04",
            details: "Industrial designer, Project lead, workshop coach/facilitator, Makerspace coach. Continued role with increased responsibilities in project management."
        },
        {
            title: "Urban Farmer",
            company: "Open Farm Community",
            startDate: "2023-04",
            endDate: "2023-09",
            details: "Urban farming - Hydroponics, Microgreens / Traditional landscape farming. Learned sustainable agriculture practices and food production systems."
        },
        {
            title: "Barista",
            company: "Patisserie G Café",
            startDate: "2023-04",
            endDate: "2023-09",
            details: "Barista, Sales, Customer satisfaction. Developed customer service skills and beverage preparation expertise."
        },
        {
            title: "National Service Full-Time",
            company: "Singapore Armed Forces",
            startDate: "2023-09",
            endDate: "2025-07",
            details: "HR, Finance, Events planning, NSF council president. Leadership role managing personnel affairs and organizing community events."
        },
        {
            title: "Supply Chain Intern",
            company: "Elizabeth Arden, Luxasia",
            startDate: "2025-09",
            endDate: "2025-12",
            details: "Supply chain management internship focusing on logistics, inventory management, and operational efficiency in the beauty industry."
        }
    ]
};

// ====================================
// TIMELINE MODULE
// ====================================

class Timeline {
    constructor() {
        this.tabIndexCounter = 27;
        this.baseYear = 2020;
        this.pixelsPerYear = 400;
        this.pixelsPerMonth = this.pixelsPerYear / 12;
        this.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    }

    parseDate(dateString) {
        const [year, month] = dateString.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, 1);
    }

    calculatePosition(startDate, endDate) {
        const start = this.parseDate(startDate);
        const end = this.parseDate(endDate);

        const startYears = start.getFullYear() - this.baseYear;
        const startMonths = start.getMonth();
        const left = (startYears * this.pixelsPerYear) + (startMonths * this.pixelsPerMonth);

        const endYears = end.getFullYear() - this.baseYear;
        const endMonths = Math.max(0, end.getMonth() - 1);
        const endPosition = (endYears * this.pixelsPerYear) + (endMonths * this.pixelsPerMonth);

        const width = Math.max(60, endPosition - left);

        return { left, width, originalEndPosition: endPosition };
    }

    estimateTextWidth(text, fontSize = 11) {
        const avgCharWidth = fontSize * 0.6;
        return text.length * avgCharWidth;
    }

    canExtendEntry(item, allItemsSameType, maxExtensionMonths = 2) {
        const currentEndPosition = item.position.left + item.position.width;

        const nextItem = allItemsSameType
            .filter(other => other.position.left > currentEndPosition)
            .sort((a, b) => a.position.left - b.position.left)[0];

        let maxEndPosition;
        if (nextItem) {
            maxEndPosition = nextItem.position.left - this.pixelsPerMonth;
        } else {
            maxEndPosition = item.position.originalEndPosition + (maxExtensionMonths * this.pixelsPerMonth);
        }

        return Math.max(item.position.width, maxEndPosition - item.position.left);
    }

    adjustWidthForText(items) {
        const minComfortableWidth = 120;

        items.forEach(item => {
            const titleWidth = this.estimateTextWidth(item.title);
            const companyWidth = this.estimateTextWidth(item.company, 10);
            const requiredWidth = Math.max(titleWidth, companyWidth) + 24;

            if (requiredWidth > item.position.width) {
                const maxAllowedWidth = this.canExtendEntry(item, items);
                item.position.width = Math.min(maxAllowedWidth, Math.max(requiredWidth, minComfortableWidth));
            }
        });
    }

    formatDateRange(startDate, endDate) {
        const start = this.parseDate(startDate);
        const end = this.parseDate(endDate);

        const startStr = `${this.monthNames[start.getMonth()]} ${start.getFullYear()}`;
        const endStr = `${this.monthNames[end.getMonth()]} ${end.getFullYear()}`;

        return `${startStr} - ${endStr}`;
    }

    detectOverlaps(items, trackHeight = 120) {
        const subRows = [];
        const subRowHeight = 50;
        const subRowSpacing = 5;
        const fullRowHeight = trackHeight - 20;

        // Assign items to sub-rows
        items.forEach(item => {
            let placed = false;

            for (let i = 0; i < subRows.length; i++) {
                const subRow = subRows[i];
                let canPlace = true;

                for (let existingItem of subRow) {
                    if (this.itemsOverlap(item, existingItem)) {
                        canPlace = false;
                        break;
                    }
                }

                if (canPlace) {
                    subRow.push(item);
                    item.subRow = i;
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                subRows.push([item]);
                item.subRow = subRows.length - 1;
            }
        });

        // Set heights and positions
        items.forEach(item => {
            const hasOverlap = items.some(other => other !== item && this.itemsOverlap(item, other));

            if (hasOverlap) {
                item.height = subRowHeight;
                item.top = (item.subRow * (subRowHeight + subRowSpacing)) + 10;
            } else {
                item.height = fullRowHeight;
                item.top = 10;
            }
        });
    }

    itemsOverlap(item1, item2) {
        const item1Right = item1.position.left + item1.position.width;
        const item2Right = item2.position.left + item2.position.width;
        return !(item1Right <= item2.position.left || item1.position.left >= item2Right);
    }

    createTimelineItem(data, type) {
        const position = this.calculatePosition(data.startDate, data.endDate);
        const dateRange = this.formatDateRange(data.startDate, data.endDate);

        return { ...data, position, dateRange, type };
    }

    createItemElement(item, container) {
        const element = document.createElement('div');
        element.className = `timeline-item ${item.type}`;
        element.style.left = `${item.position.left}px`;
        element.style.width = `${item.position.width}px`;
        element.style.height = `${item.height}px`;
        element.style.top = `${item.top}px`;
        element.tabIndex = this.tabIndexCounter++;

        element.innerHTML = `
            <h4>${item.title}</h4>
            <p>${item.company}</p>
        `;

        // Event listeners
        element.addEventListener('click', () => Modal.show(item));
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                Modal.show(item);
            }
        });

        container.appendChild(element);
    }

    render() {
        const educationTrack = document.getElementById('education-track');
        const experienceTrack = document.getElementById('experience-track');

        if (!educationTrack || !experienceTrack) return;

        // Process education items
        const educationItems = timelineData.education.map(item => 
            this.createTimelineItem(item, 'education')
        );
        this.adjustWidthForText(educationItems);
        this.detectOverlaps(educationItems);

        // Process experience items  
        const experienceItems = timelineData.experience.map(item => 
            this.createTimelineItem(item, 'experience')
        );
        this.adjustWidthForText(experienceItems);
        this.detectOverlaps(experienceItems);

        // Render items
        educationItems.forEach(item => this.createItemElement(item, educationTrack));
        experienceItems.forEach(item => this.createItemElement(item, experienceTrack));
    }
}

// ====================================
// MODAL MODULE
// ====================================

class Modal {
    static show(item) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');

        if (!modal || !modalBody) return;

        let modalContent = `
            <h3>${item.title}</h3>
            <div class="modal-detail"><strong>Company:</strong> ${item.company}</div>
            <div class="modal-detail"><strong>Duration:</strong> ${item.dateRange}</div>
        `;

        if (item.gpa) {
            modalContent += `<div class="modal-detail"><strong>GPA:</strong> ${item.gpa}</div>`;
        }

        modalContent += `<div class="modal-detail"><strong>Details:</strong> ${item.details}</div>`;

        modalBody.innerHTML = modalContent;
        modal.style.display = 'block';

        setTimeout(() => {
            const closeBtn = document.querySelector('.close');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }

    static hide() {
        const modal = document.getElementById('modal');
        if (modal) modal.style.display = 'none';
    }

    static hideImage() {
        const imageModal = document.getElementById('image-modal');
        if (imageModal) imageModal.style.display = 'none';
    }

    static init() {
        // Modal close functionality
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', Modal.hide);
            closeBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    Modal.hide();
                }
            });
        }

        // Image modal close functionality
        const closeImageBtn = document.querySelector('.close-image');
        if (closeImageBtn) {
            closeImageBtn.addEventListener('click', Modal.hideImage);
            closeImageBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    Modal.hideImage();
                }
            });
        }

        // Click outside to close
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('modal');
            const imageModal = document.getElementById('image-modal');
            
            if (event.target === modal) Modal.hide();
            if (event.target === imageModal) Modal.hideImage();
        });

        // Escape key handler
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                Modal.hide();
                Modal.hideImage();
            }
        });
    }
}

// ====================================
// CAROUSEL MODULE
// ====================================

class Carousel {
    constructor() {
        this.currentCategory = 'industrial';
        this.currentIndex = 0;
        this.init();
    }

    init() {
        this.tabs = document.querySelectorAll('.tabs button');
        this.cards = document.querySelectorAll('.project-card');
        this.leftArrow = document.querySelector('.arrow.left');
        this.rightArrow = document.querySelector('.arrow.right');
        this.cardsContainer = document.querySelector('.project-cards-container');

        if (!this.tabs.length || !this.cards.length) return;

        this.setupEventListeners();
        this.showCategory(this.currentCategory);
    }

    setupEventListeners() {
        // Tab events
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.showCategory(tab.dataset.category));
        });

        // Arrow events
        if (this.leftArrow) {
            this.leftArrow.addEventListener('click', () => this.previousCard());
        }
        if (this.rightArrow) {
            this.rightArrow.addEventListener('click', () => this.nextCard());
        }

        // Resize handler
        window.addEventListener('resize', () => this.updateCarousel());
    }

    showCategory(category) {
        this.currentCategory = category;
        this.currentIndex = 0;

        // Update tab states
        this.tabs.forEach(tab => 
            tab.classList.toggle('active', tab.dataset.category === category)
        );

        // Show/hide cards
        this.cards.forEach(card => {
            card.style.display = card.dataset.category === category ? 'flex' : 'none';
        });

        this.updateCarousel();
        this.updateArrowStates();
    }

    getVisibleCards() {
        return Array.from(this.cards).filter(card =>
            card.dataset.category === this.currentCategory && card.style.display !== 'none'
        );
    }

    updateCarousel() {
        const visibleCards = this.getVisibleCards();

        if (visibleCards.length === 0) return;

        // Remove active class from all cards
        this.cards.forEach(card => card.classList.remove('active'));

        // Add active class to current card
        const currentCard = visibleCards[this.currentIndex];
        if (currentCard) {
            currentCard.classList.add('active');

            // Scroll to current card
            if (this.cardsContainer) {
                const cardWidth = currentCard.offsetWidth + 16; // include gap
                this.cardsContainer.scrollLeft = this.currentIndex * cardWidth;
            }
        }
    }

    updateArrowStates() {
        const visibleCards = this.getVisibleCards();

        if (this.leftArrow) {
            this.leftArrow.disabled = this.currentIndex === 0;
        }
        if (this.rightArrow) {
            this.rightArrow.disabled = this.currentIndex >= visibleCards.length - 1;
        }
    }

    previousCard() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCarousel();
            this.updateArrowStates();
        }
    }

    nextCard() {
        const visibleCards = this.getVisibleCards();
        if (this.currentIndex < visibleCards.length - 1) {
            this.currentIndex++;
            this.updateCarousel();
            this.updateArrowStates();
        }
    }
}

// ====================================
// THEME MODULE
// ====================================

class Theme {
    static init() {
        const toggleSwitch = document.getElementById('darkmode-toggle');
        if (toggleSwitch) {
            toggleSwitch.addEventListener('change', function() {
                document.body.classList.toggle('dark-mode', this.checked);
            });
        }
    }
}

// ====================================
// IMAGE VIEWER MODULE
// ====================================

class ImageViewer {
    static init() {
        const imageModal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-img');
        const closeImage = document.querySelector('.close-image');

        if (!imageModal || !modalImg) return;

        // Make all images clickable
        document.querySelectorAll('img').forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
                modalImg.src = img.src;
                imageModal.style.display = 'block';
                
                setTimeout(() => {
                    if (closeImage) closeImage.focus();
                }, 100);
            });
        });
    }
}

// ====================================
// UTILITY FUNCTIONS
// ====================================

function scrollTimelineToEnd() {
    const timelineContainer = document.querySelector(".timeline-container");
    if (timelineContainer) {
        timelineContainer.scrollLeft = timelineContainer.scrollWidth;
    }
}

// ====================================
// APPLICATION INITIALIZATION
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    const timeline = new Timeline();
    timeline.render();
    
    Modal.init();
    new Carousel();
    Theme.init();
    ImageViewer.init();
    
    // Scroll timeline to end
    scrollTimelineToEnd();
});

// Initialize timeline immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM still loading, event listener will handle it
} else {
    // DOM already loaded
    const timeline = new Timeline();
    timeline.render();
    scrollTimelineToEnd();
}