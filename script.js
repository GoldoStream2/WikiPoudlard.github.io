document.addEventListener('DOMContentLoaded', function() {
    // Updated course data structure with correct subcategories
    const coursesData = {
        all: {
            "Tous les Cours": []
        },
        alchemie: {
            "Alchimie": [],
            "Alchimie [Passif]": []
        },
        astronomie: {
            "Astronomie": [],
            "Astronomie [Passif]": []
        },
        dcfm: {
            "Défense Contre Les Forces du Mal [Passif]": [],
            "Défense Contre Les Forces du Mal [Actif]": []
        },
        metamorphose: {
            "Métamorphose [Passif]": [],
            "Métamorphose [Actif]": []
        },
        sortileges: {
            "Sortilèges [Passif]": [],
            "Sortilèges [Actif]": []
        },
        passif: {
            "Capacités Innées [Passif]": [],
            "Talents Naturels [Passif]": []
        }
    };

    // Function to load and process files from the Poudlard folder
    async function loadCoursesFromFolder() {
        try {
            const response = await fetch('/Poudlard'); // This will need server-side support
            const files = await response.json();
            
            files.forEach(async fileName => {
                try {
                    const response = await fetch(`/Poudlard/${fileName}`);
                    const content = await response.text();
                    addSpellToCategory(fileName, content);
                } catch (error) {
                    console.error(`Error loading file ${fileName}:`, error);
                }
            });
        } catch (error) {
            console.error('Error loading files from Poudlard folder:', error);
        }
    }

    loadCoursesFromFolder();

    // Function to parse filename and extract information
    function parseFileName(fileName) {
       !function parseFileName(fileName) {
            // Example filename: "Poudlard RP _ Connaissances - 🔥 DCFM [Passif] - 6a-oppugno"
            const parts = fileName.split(' - ');
            const categoryInfo = parts[1]; // "🔥 DCFM [Passif]"
            const spellInfo = parts[2]; // "6a-oppugno"

            const category = categoryInfo.match(/🔥\s*([^\[]+)/)[1].trim(); // DCFM
            const type = categoryInfo.includes('[Passif]') ? 'Passif' : 'Actif';
            const spellName = spellInfo.split('-')[1].trim();

            return {
                category,
                type,
                spellName,
                // You can add more parsing logic here to extract other information
                // from the filename or file content
            };
        }(fileName);
    }

    // Update the category mapping in the addSpellToCategory function
    function addSpellToCategory(fileName, content) {
        const {category, type, spellName} = parseFileName(fileName);
        
        const spell = {
            name: spellName,
            description: content,
            level: "À déterminer"
        };

        // Updated category mapping
        const categoryMap = {
            'DCFM': 'dcfm',
            'Alchemie': 'alchemie',
            'Potions': 'alchemie',
            'Transmutation': 'alchemie',
            'Astronomie': 'astronomie',
            'Divination': 'astronomie',
            'Métamorphose': 'metamorphose',
            'Sortilèges': 'sortileges'
        };

        const categoryKey = categoryMap[category];
        if (categoryKey && coursesData[categoryKey]) {
            // Determine the correct subcategory name based on the category and type
            let subcategoryKey = `${category} [${type}]`;
            
            // Find the appropriate subcategory and add the spell
            if (coursesData[categoryKey][subcategoryKey]) {
                coursesData[categoryKey][subcategoryKey].push(spell);
                // Also add to "Tous les Cours"
                coursesData.all["Tous les Cours"].push(spell);
            }
        }
    }

    // Function to create collapsible groups
    function createSpellGroup(title, spells) {
        const group = document.createElement('div');
        group.className = 'spell-group';
        group.innerHTML = `
            <div class="spell-group-header">
                <h3>${title}</h3>
                <div class="spell-group-toggle"></div>
            </div>
            <div class="spell-group-content">
                ${spells.map(spell => createSpellCard(spell).outerHTML).join('')}
            </div>
        `;

        group.querySelector('.spell-group-header').addEventListener('click', () => {
            group.classList.toggle('expanded');
        });

        return group;
    }

    // Keyboard navigation
    let currentFocus = -1;
    const sections = document.querySelectorAll('.course-section');

    // Command palette / search
    let searchActive = false;
    const searchContainer = document.createElement('div');
    searchContainer.className = 'spell-search';
    searchContainer.innerHTML = `
        <div class="spell-search-header">
            <input type="text" placeholder="Rechercher un sort... (Press '/' to search)" />
            <button class="close-search">
                Fermer <span class="keyboard-badge">Esc</span>
            </button>
        </div>
        <div class="search-results"></div>
    `;
    document.body.appendChild(searchContainer);

    // Add click handler for close button
    const closeButton = searchContainer.querySelector('.close-search');
    closeButton.addEventListener('click', closeSearch);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && !searchActive) {
            e.preventDefault();
            openSearch();
        } else if (e.key === 'Escape') {
            closeSearch();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            navigateSections(e.shiftKey ? -1 : 1);
        }
    });

    function openSearch() {
        searchActive = true;
        searchContainer.classList.add('active');
        searchContainer.querySelector('input').focus();
    }

    function closeSearch() {
        searchActive = false;
        searchContainer.classList.remove('active');
    }

    function navigateSections(direction) {
        sections.forEach(section => section.classList.remove('focused'));
        currentFocus += direction;
        if (currentFocus >= sections.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = sections.length - 1;
        
        const focusedSection = sections[currentFocus];
        focusedSection.classList.add('focused');
        focusedSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Smooth scroll for navigation
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Remove active class from all links and add to clicked link
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');

            // Get all sections
            const coursesContainer = document.querySelector('.courses-container');
            const sections = Array.from(coursesContainer.children);
            
            // Don't reorder if clicking "all" category
            if (targetId !== 'all') {
                const targetSection = document.getElementById(targetId);
                
                // Animate out
                targetSection.style.opacity = '0';
                targetSection.style.transform = 'scale(0.98)';
                
                setTimeout(() => {
                    // Remove and reinsert at top
                    coursesContainer.removeChild(targetSection);
                    coursesContainer.insertBefore(targetSection, coursesContainer.firstChild);
                    
                    // Animate in
                    setTimeout(() => {
                        targetSection.style.opacity = '1';
                        targetSection.style.transform = 'scale(1)';
                    }, 50);
                    
                    // Scroll into view
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            } else {
                // If "all" is clicked, scroll to top
                coursesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Intersection Observer for section animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(section);
    });

    // Enhanced spell card creation
    function createSpellCard(spell) {
        const card = document.createElement('div');
        card.className = 'spell-card';
        card.innerHTML = `
            <div class="spell-header">
                <h3>${spell.name}</h3>
                <span class="level-badge">${spell.level}</span>
            </div>
            <p>${spell.description}</p>
            ${spell.category ? `<span class="category">${spell.category}</span>` : ''}
        `;

        // Add hover effect
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });

        return card;
    }

    // Modified loadContent function
    function loadContent() {
        for (let category in coursesData) {
            const section = document.querySelector(`#${category} .scroll-content`);
            if (section) {
                section.innerHTML = ''; // Clear existing content
                for (let groupTitle in coursesData[category]) {
                    const spellGroup = createSpellGroup(
                        groupTitle,
                        coursesData[category][groupTitle]
                    );
                    section.appendChild(spellGroup);
                }
            }
        }
    }

    // Enhanced search functionality
    const searchInput = searchContainer.querySelector('input');
    const searchResults = searchContainer.querySelector('.search-results');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        searchResults.innerHTML = '';

        if (query.length < 2) return;

        Object.values(coursesData).flatMap(category => Object.values(category)).flat().forEach(spell => {
            if (spell.name.toLowerCase().includes(query) || 
                spell.description.toLowerCase().includes(query)) {
                const result = createSpellCard(spell);
                searchResults.appendChild(result);
            }
        });
    });

    // Animation pour les cartes de sort
    function animateSpellCards() {
        const cards = document.querySelectorAll('.spell-card');
        cards.forEach((card, index) => {
            card.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;
        });
    }

    // Add event listener to load file content and add to coursesData
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('file-input')) {
            const files = e.target.files;
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                const fileName = files[0].name;
                addSpellToCategory(fileName, content);
            };
            reader.readAsText(files[0]);
        }
    });

    loadContent();
    animateSpellCards();

    // Ajoutez des styles dynamiques
    const style = document.createElement('style');
    style.textContent = `
        .spell-card {
            background: rgba(57, 33, 24, 0.95);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            opacity: 0;
            border: 1px solid rgba(184, 134, 11, 0.2);
            color: var(--text-color);
        }

        .spell-card h3 {
            color: var(--gold);
            margin-bottom: 0.5rem;
        }

        .spell-card .category {
            display: inline-block;
            background: var(--accent-color);
            color: var(--text-color);
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            margin-top: 0.5rem;
            border: 1px solid var(--gold);
        }

        .spell-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .level-badge {
            background: var(--accent-color);
            color: var(--text-color);
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
        }

        .spell-group {
            margin-bottom: 1rem;
        }

        .spell-group-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            padding: 0.5rem;
            border-bottom: 1px solid var(--gold);
        }

        .spell-group-header h3 {
            margin: 0;
        }

        .spell-group-content {
            display: none;
            padding: 0.5rem;
        }

        .spell-group.expanded .spell-group-content {
            display: block;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});