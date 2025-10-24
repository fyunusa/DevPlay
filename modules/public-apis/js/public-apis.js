document.addEventListener('DOMContentLoaded', () => {
    const apiContainer = document.getElementById('apis-container');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');
    const totalApisEl = document.getElementById('total-apis');
    const totalCategoriesEl = document.getElementById('total-categories');
    const freeApisEl = document.getElementById('free-apis');

    let allApis = [];
    let filteredApis = [];
    let sectionsData = {};
    let allCategories = new Set();
    let loadedSections = new Set();
    let currentSection = 'all';

    // Magic cursor effect
    document.addEventListener('mousemove', (e) => {
        const magicCursor = document.querySelector('.magic-cursor');
        if (magicCursor) {
            magicCursor.style.left = e.clientX + 'px';
            magicCursor.style.top = e.clientY + 'px';
        }
    });

    // Add hover effects to interactive elements
    document.addEventListener('mouseover', (e) => {
        const magicCursor = document.querySelector('.magic-cursor');
        if (magicCursor && (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.classList.contains('api-card'))) {
            magicCursor.style.width = '40px';
            magicCursor.style.height = '40px';
        }
    });

    document.addEventListener('mouseout', (e) => {
        const magicCursor = document.querySelector('.magic-cursor');
        if (magicCursor && (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.classList.contains('api-card'))) {
            magicCursor.style.width = '30px';
            magicCursor.style.height = '30px';
        }
    });

    // Section mapping
    const sectionFiles = {
        'A': 'data/A.json',
        'B-C': 'data/B-C.json',
        'D-F': 'data/D-F.json',
        'G-H': 'data/G-H.json',
        'J-M': 'data/J-M.json',
        'O-P': 'data/O-P.json',
        'S-T': 'data/S-T.json',
        'U-W': 'data/U-W.json'
    };

    // Create section navigation
    function createSectionNavigation() {
        const sectionNav = document.createElement('div');
        sectionNav.className = 'section-navigation';
        sectionNav.innerHTML = `
            <h3><i class="fas fa-th-large"></i> Browse by Section</h3>
            <div class="section-buttons">
                <button class="section-btn active" data-section="all">
                    <i class="fas fa-globe"></i>
                    All APIs
                    <span class="btn-count">0</span>
                </button>
                ${Object.keys(sectionFiles).map(section => `
                    <button class="section-btn" data-section="${section}">
                        <i class="fas fa-folder"></i>
                        ${section}
                        <span class="btn-count">0</span>
                    </button>
                `).join('')}
            </div>
        `;
        
        // Insert after search-filter-section
        const searchSection = document.querySelector('.search-filter-section');
        searchSection.insertAdjacentElement('afterend', sectionNav);
        
        // Add click listeners to section buttons
        sectionNav.addEventListener('click', (e) => {
            if (e.target.classList.contains('section-btn')) {
                const section = e.target.dataset.section;
                loadSection(section);
            }
        });
    }

    async function loadSection(sectionName) {
        try {
            // Update active button
            document.querySelectorAll('.section-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
            
            currentSection = sectionName;
            
            if (sectionName === 'all') {
                // Load all sections
                await loadAllSections();
            } else {
                // Load specific section
                await loadSpecificSection(sectionName);
            }
            
            // Update UI
            renderAPIs(filteredApis);
            updateStats();
            
        } catch (error) {
            console.error('Error loading section:', error);
            apiContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Oops! Something went wrong</h3>
                    <p>Unable to load ${sectionName} section. Please try again later.</p>
                </div>
            `;
        }
    }

    async function loadAllSections() {
        if (loadedSections.size === Object.keys(sectionFiles).length) {
            // All sections already loaded
            return;
        }

        // Show loading state
        apiContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p style="margin-top: 1rem; color: var(--text-secondary);">Loading all APIs...</p>
            </div>
        `;

        const loadPromises = Object.entries(sectionFiles).map(async ([sectionName, filePath]) => {
            if (loadedSections.has(sectionName)) {
                return { sectionName, data: sectionsData[sectionName] };
            }
            
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    console.warn(`Failed to load ${filePath}: ${response.status}`);
                    return null;
                }
                const data = await response.json();
                return { sectionName, data };
            } catch (error) {
                console.warn(`Error loading ${filePath}:`, error);
                return null;
            }
        });

        const results = await Promise.all(loadPromises);
        
        // Process each file's data
        results.forEach(({ sectionName, data }) => {
            if (!data) return;
            processSectionData(data, sectionName);
            loadedSections.add(sectionName);
        });

        // Update all APIs array
        allApis = Object.values(sectionsData).flat();
        filteredApis = [...allApis];
        
        // Update section button counts
        updateSectionButtonCounts();
    }

    async function loadSpecificSection(sectionName) {
        if (loadedSections.has(sectionName)) {
            // Section already loaded, just filter
            filterAPIsBySection(sectionName);
            return;
        }

        // Show loading state
        apiContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p style="margin-top: 1rem; color: var(--text-secondary);">Loading ${sectionName} section...</p>
            </div>
        `;

        const filePath = sectionFiles[sectionName];
        
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.status}`);
            }
            
            const data = await response.json();
            processSectionData(data, sectionName);
            loadedSections.add(sectionName);
            
            // Update all APIs array
            allApis = Object.values(sectionsData).flat();
            filterAPIsBySection(sectionName);
            
            // Update section button counts
            updateSectionButtonCounts();
            
        } catch (error) {
            throw error;
        }
    }

    function processSectionData(data, sectionName) {
        if (!sectionsData[sectionName]) {
            sectionsData[sectionName] = [];
        }

        // Handle different JSON structures
        if (data.apis) {
            // Structure: { "apis": [...] }
            processAPIs(data.apis, 'General', sectionName);
        } else {
            // Structure: { "Section Name": [...] }
            Object.keys(data).forEach(subSectionName => {
                if (Array.isArray(data[subSectionName])) {
                    processAPIs(data[subSectionName], subSectionName, sectionName);
                }
            });
        }
    }

    function processAPIs(apis, subSectionName, mainSectionName) {
        apis.forEach(api => {
            // Normalize API data structure
            const normalizedAPI = {
                API: api.API || api.name || 'Unknown API',
                Description: api.Description || api.description || 'No description available',
                Auth: api.Auth || api.auth || 'No',
                Category: api.Category || subSectionName,
                Link: api.Link || api.URL || api.url || null,
                HTTPS: api.HTTPS,
                CORS: api.CORS,
                Section: mainSectionName,
                SubSection: subSectionName
            };

            sectionsData[mainSectionName].push(normalizedAPI);
            allCategories.add(subSectionName);
        });
    }

    function filterAPIsBySection(sectionName) {
        if (sectionName === 'all') {
            filteredApis = [...allApis];
        } else {
            filteredApis = allApis.filter(api => api.Section === sectionName);
        }
    }

    function updateSectionButtonCounts() {
        // Update "All APIs" count
        const allBtn = document.querySelector('[data-section="all"] .btn-count');
        if (allBtn) {
            allBtn.textContent = allApis.length;
        }

        // Update individual section counts
        Object.keys(sectionFiles).forEach(sectionName => {
            const btn = document.querySelector(`[data-section="${sectionName}"] .btn-count`);
            if (btn) {
                const count = sectionsData[sectionName] ? sectionsData[sectionName].length : 0;
                btn.textContent = count;
            }
        });
    }

    function renderAPIs(apis) {
        if (apis.length === 0) {
            apiContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No APIs found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            `;
            return;
        }

        apiContainer.innerHTML = '';
        
        // Group APIs by subsection for better organization
        const groupedAPIs = groupAPIsBySubSection(apis);
        
        Object.keys(groupedAPIs).forEach(subSectionName => {
            const sectionAPIs = groupedAPIs[subSectionName];
            
            // Create section header
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'section-header';
            sectionHeader.innerHTML = `
                <h3 class="section-title">
                    <i class="fas fa-folder-open"></i>
                    ${subSectionName}
                    <span class="section-count">${sectionAPIs.length} APIs</span>
                </h3>
            `;
            apiContainer.appendChild(sectionHeader);
            
            // Create section container
            const sectionContainer = document.createElement('div');
            sectionContainer.className = 'section-container';
            sectionContainer.style.display = 'grid';
            sectionContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(380px, 1fr))';
            sectionContainer.style.gap = '2rem';
            sectionContainer.style.marginBottom = '3rem';
            
            sectionAPIs.forEach((api, index) => {
                const apiCard = document.createElement('div');
                apiCard.className = 'api-card';
                apiCard.style.animationDelay = `${index * 0.1}s`;
                
                const authBadgeClass = getAuthBadgeClass(api.Auth);
                const authText = api.Auth || 'No authentication';
                
                apiCard.innerHTML = `
                    <h3>${api.API}</h3>
                    <p>${api.Description}</p>
                    <div class="api-meta">
                        <div class="api-meta-item">
                            <i class="fas fa-shield-alt"></i>
                            <span class="auth-badge ${authBadgeClass}">${authText}</span>
                        </div>
                        <div class="api-meta-item">
                            <i class="fas fa-tag"></i>
                            <span class="category-badge">${api.Category}</span>
                        </div>
                        ${api.HTTPS !== undefined ? `
                            <div class="api-meta-item">
                                <i class="fas fa-lock"></i>
                                <span class="https-badge ${api.HTTPS ? 'secure' : 'insecure'}">
                                    ${api.HTTPS ? 'HTTPS' : 'HTTP'}
                                </span>
                            </div>
                        ` : ''}
                        ${api.CORS !== undefined ? `
                            <div class="api-meta-item">
                                <i class="fas fa-globe"></i>
                                <span class="cors-badge ${api.CORS === 'Yes' ? 'enabled' : 'disabled'}">
                                    CORS ${api.CORS}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    ${api.Link ? `
                        <a 
                            href="${api.Link}" 
                            class="api-link" 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            <i class="fas fa-external-link-alt"></i>
                            Visit API
                        </a>
                    ` : ''}
                `;
                
                sectionContainer.appendChild(apiCard);
            });
            
            apiContainer.appendChild(sectionContainer);
        });
    }

    // Add this to your existing JavaScript file, after the renderAPIs function

function addScrollNavigation() {
    // Add scroll arrows to each section container
    document.querySelectorAll('.section-container').forEach(container => {
        // Create left arrow
        const leftArrow = document.createElement('button');
        leftArrow.className = 'scroll-arrow left';
        leftArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
        leftArrow.addEventListener('click', () => {
            container.scrollBy({ left: -320, behavior: 'smooth' });
        });
        
        // Create right arrow
        const rightArrow = document.createElement('button');
        rightArrow.className = 'scroll-arrow right';
        rightArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
        rightArrow.addEventListener('click', () => {
            container.scrollBy({ left: 320, behavior: 'smooth' });
        });
        
        // Add arrows to container
        container.style.position = 'relative';
        container.appendChild(leftArrow);
        container.appendChild(rightArrow);
        
        // Update arrow visibility based on scroll position
        const updateArrows = () => {
            const isAtStart = container.scrollLeft <= 0;
            const isAtEnd = container.scrollLeft >= (container.scrollWidth - container.clientWidth);
            
            leftArrow.disabled = isAtStart;
            rightArrow.disabled = isAtEnd;
        };
        
        container.addEventListener('scroll', updateArrows);
        updateArrows();
    });
}

// Update the renderAPIs function to call addScrollNavigation
function renderAPIs(apis) {
    if (apis.length === 0) {
        apiContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No APIs found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }

    apiContainer.innerHTML = '';
    
    // Group APIs by subsection for better organization
    const groupedAPIs = groupAPIsBySubSection(apis);
    
    Object.keys(groupedAPIs).forEach(subSectionName => {
        const sectionAPIs = groupedAPIs[subSectionName];
        
        // Create section header
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'section-header';
        sectionHeader.innerHTML = `
            <h3 class="section-title">
                <i class="fas fa-folder-open"></i>
                ${subSectionName}
                <span class="section-count">${sectionAPIs.length} APIs</span>
            </h3>
        `;
        apiContainer.appendChild(sectionHeader);
        
        // Create section container
        const sectionContainer = document.createElement('div');
        sectionContainer.className = 'section-container';
        
        sectionAPIs.forEach((api, index) => {
            const apiCard = document.createElement('div');
            apiCard.className = 'api-card';
            apiCard.style.animationDelay = `${index * 0.1}s`;
            
            const authBadgeClass = getAuthBadgeClass(api.Auth);
            const authText = api.Auth || 'No authentication';
            
            apiCard.innerHTML = `
                <h3>${api.API}</h3>
                <p>${api.Description}</p>
                <div class="api-meta">
                    <div class="api-meta-item">
                        <i class="fas fa-shield-alt"></i>
                        <span class="auth-badge ${authBadgeClass}">${authText}</span>
                    </div>
                    <div class="api-meta-item">
                        <i class="fas fa-tag"></i>
                        <span class="category-badge">${api.Category}</span>
                    </div>
                    ${api.HTTPS !== undefined ? `
                        <div class="api-meta-item">
                            <i class="fas fa-lock"></i>
                            <span class="https-badge ${api.HTTPS ? 'secure' : 'insecure'}">
                                ${api.HTTPS ? 'HTTPS' : 'HTTP'}
                            </span>
                        </div>
                    ` : ''}
                    ${api.CORS !== undefined ? `
                        <div class="api-meta-item">
                            <i class="fas fa-globe"></i>
                            <span class="cors-badge ${api.CORS === 'Yes' ? 'enabled' : 'disabled'}">
                                CORS ${api.CORS}
                            </span>
                        </div>
                    ` : ''}
                </div>
                ${api.Link ? `
                    <a 
                        href="${api.Link}" 
                        class="api-link" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        <i class="fas fa-external-link-alt"></i>
                        Visit API
                    </a>
                ` : ''}
            `;
            
            sectionContainer.appendChild(apiCard);
        });
        
        apiContainer.appendChild(sectionContainer);
    });
    
    // Add scroll navigation after rendering
    setTimeout(() => {
        addScrollNavigation();
    }, 100);
}

    function groupAPIsBySubSection(apis) {
        const grouped = {};
        apis.forEach(api => {
            const subSection = api.SubSection || api.Category || 'General';
            if (!grouped[subSection]) {
                grouped[subSection] = [];
            }
            grouped[subSection].push(api);
        });
        return grouped;
    }

    function getAuthBadgeClass(auth) {
        if (!auth || auth.toLowerCase() === 'no') return 'no-auth';
        if (auth.toLowerCase().includes('key')) return 'api-key';
        if (auth.toLowerCase().includes('oauth')) return 'oauth';
        return 'api-key';
    }

    function populateCategoryFilter() {
        const categories = Array.from(allCategories).sort();
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    function updateStats() {
        const categories = Array.from(allCategories);
        const freeApis = allApis.filter(api => !api.Auth || api.Auth.toLowerCase() === 'no');
        
        totalApisEl.textContent = allApis.length;
        totalCategoriesEl.textContent = categories.length;
        freeApisEl.textContent = freeApis.length;
    }

    function filterAPIs() {
        const selectedCategory = categoryFilter.value;
        const searchTerm = searchInput.value.toLowerCase();
        
        let baseAPIs = currentSection === 'all' ? allApis : allApis.filter(api => api.Section === currentSection);
        
        filteredApis = baseAPIs.filter(api => {
            const matchesCategory = selectedCategory === 'all' || api.Category === selectedCategory;
            const matchesSearch = api.API.toLowerCase().includes(searchTerm) || 
                                api.Description.toLowerCase().includes(searchTerm) ||
                                api.Category.toLowerCase().includes(searchTerm) ||
                                (api.Section && api.Section.toLowerCase().includes(searchTerm));
            return matchesCategory && matchesSearch;
        });
        
        renderAPIs(filteredApis);
    }

    // Add some fun interactions
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('api-link')) {
            // Add a small animation when clicking API links
            e.target.style.transform = 'scale(0.95)';
            setTimeout(() => {
                e.target.style.transform = '';
            }, 150);
        }
    });

    // Event listeners
    categoryFilter.addEventListener('change', filterAPIs);
    searchInput.addEventListener('input', filterAPIs);

    // Initialize
    createSectionNavigation();
    loadSection('all'); // Load all sections initially
});