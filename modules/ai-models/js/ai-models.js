// Magic Cursor Effect
document.addEventListener('DOMContentLoaded', () => {
    const magicCursor = document.querySelector('.magic-cursor');
    
    if (magicCursor && window.innerWidth >= 992) {
        document.addEventListener('mousemove', (e) => {
            magicCursor.style.left = e.clientX + 'px';
            magicCursor.style.top = e.clientY + 'px';
        });
        
        document.querySelectorAll('a, button, .tab-btn, .card, .view-link, .category-btn').forEach(el => {
            el.addEventListener('mouseenter', () => {
                magicCursor.style.width = '50px';
                magicCursor.style.height = '50px';
            });
            el.addEventListener('mouseleave', () => {
                magicCursor.style.width = '30px';
                magicCursor.style.height = '30px';
            });
        });
    }
});

// Category Selection
document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const contentSections = document.querySelectorAll('.content-section');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetCategory = button.getAttribute('data-category');
            
            // Update buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update sections
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetCategory}-section`) {
                    section.classList.add('active');
                }
            });
        });
    });
});

// Tab Navigation
document.addEventListener('DOMContentLoaded', () => {
    const tabContainers = document.querySelectorAll('.tab-navigation');
    
    tabContainers.forEach(container => {
        const tabButtons = container.querySelectorAll('.tab-btn');
        const parentSection = container.closest('.content-section');
        const tabContents = parentSection.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Update buttons in this container
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update corresponding content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.getAttribute('data-content') === targetTab) {
                        content.classList.add('active');
                    }
                });
            });
        });
    });
});

// Global Search Functionality
let allData = {
    models: [],
    datasets: [],
    useCases: []
};

// New: Models filter/sort/favorites state
const MODELS_FAVORITES_KEY = 'dp_ai_models_favorites_v1';
let modelsUI = {
    sort: 'relevance',
    task: '',
    language: '',
    license: '',
    favoritesOnly: false,
    favoritesSet: new Set(JSON.parse(localStorage.getItem(MODELS_FAVORITES_KEY) || '[]')),
    highlightQuery: ''
};

function saveFavorites() {
    try {
        localStorage.setItem(MODELS_FAVORITES_KEY, JSON.stringify(Array.from(modelsUI.favoritesSet)));
    } catch (_) {}
}

function getModelId(model) {
    return (
        model.id ||
        model.model_id ||
        model.model_name ||
        model.name ||
        model.url ||
        JSON.stringify({ n: model.model_name || model.name, s: model.source || '' })
    );
}

// Global favorite handlers so both loaders can use it
function attachFavoriteHandlers(scope) {
    const buttons = scope.querySelectorAll('.favorite-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            if (modelsUI.favoritesSet.has(id)) {
                modelsUI.favoritesSet.delete(id);
                btn.classList.remove('active');
            } else {
                modelsUI.favoritesSet.add(id);
                btn.classList.add('active');
            }
            saveFavorites();
            const favOnlyEl = document.getElementById('models-favorites-only');
            if (favOnlyEl && favOnlyEl.checked && typeof window.renderModelsWithToolbar === 'function') {
                // Find the active models container id
                const activeContainer = document.querySelector('#models-section .tab-content.active .content-grid');
                const cid = activeContainer ? activeContainer.id : null;
                if (cid) window.renderModelsWithToolbar(cid);
            }
        }, { passive: true });
    });
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, query) {
    if (!query) return text;
    try {
        const rx = new RegExp(`(${escapeRegex(query)})`, 'ig');
        return text.replace(rx, '<span class="highlight">$1</span>');
    } catch (_) {
        return text;
    }
}

// Lazy Loading Configuration
const ITEMS_PER_BATCH = 40;
let currentBatch = {
    models: { start: 0, items: [], allLoaded: false },
    datasets: { start: 0, items: [], allLoaded: false },
    useCases: { start: 0, items: [], allLoaded: false }
};

// Hook up toolbar controls and filtering
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('global-search');
    const clearSearchBtn = document.getElementById('clear-search');
    const resultsInfo = document.getElementById('search-results-info');
    const resultsCount = document.getElementById('results-count');
    const container = document.querySelector('.container');

    const sortEl = document.getElementById('models-sort');
    const taskEl = document.getElementById('models-task');
    const languageEl = document.getElementById('models-language');
    const licenseEl = document.getElementById('models-license');
    const favOnlyEl = document.getElementById('models-favorites-only');
    const toolbarInfo = document.getElementById('models-toolbar-info');

    function activeModelsTabKey() {
        const modelsSection = document.getElementById('models-section');
        const activeBtn = modelsSection.querySelector('#models-tabs .tab-btn.active');
        const key = activeBtn ? activeBtn.getAttribute('data-tab') : 'huggingface';
        return key; // e.g., 'huggingface'
    }

    function containerIdForTabKey(key) {
        return `models-${key}-container`;
    }

    function collectUniqueOptions() {
        const tasks = new Set();
        const languages = new Set();
        const licenses = new Set();
        allData.models.forEach(m => {
            if (m.task) String(m.task).split(',').map(s => s.trim()).forEach(t => t && tasks.add(t));
            if (m.language) languages.add(String(m.language).trim());
            if (m.license) licenses.add(String(m.license).trim());
        });
        return {
            tasks: Array.from(tasks).sort((a,b)=>a.localeCompare(b)),
            languages: Array.from(languages).sort((a,b)=>a.localeCompare(b)),
            licenses: Array.from(licenses).sort((a,b)=>a.localeCompare(b))
        };
    }

    function populateToolbarOptions() {
        if (!taskEl || !languageEl || !licenseEl) return;
        const { tasks, languages, licenses } = collectUniqueOptions();
        const fill = (select, values, labelAll) => {
            const current = select.value;
            select.innerHTML = `<option value="">${labelAll}</option>` +
                values.map(v => `<option value="${v}">${v}</option>`).join('');
            if (Array.from(select.options).some(o => o.value === current)) {
                select.value = current;
            }
        };
        fill(taskEl, tasks, 'All Tasks');
        fill(languageEl, languages, 'All Languages');
        fill(licenseEl, licenses, 'All Licenses');
    }

    function applyFiltersToList(list) {
        let filtered = list.slice();
        if (modelsUI.task) {
            filtered = filtered.filter(m => (m.task || '').toLowerCase().split(',').map(s=>s.trim()).includes(modelsUI.task.toLowerCase()))
        }
        if (modelsUI.language) {
            filtered = filtered.filter(m => String(m.language || '').toLowerCase() === modelsUI.language.toLowerCase());
        }
        if (modelsUI.license) {
            filtered = filtered.filter(m => String(m.license || '').toLowerCase() === modelsUI.license.toLowerCase());
        }
        if (modelsUI.favoritesOnly) {
            filtered = filtered.filter(m => modelsUI.favoritesSet.has(getModelId(m)));
        }
        if (modelsUI.sort === 'name_asc') {
            filtered.sort((a,b)=> (a.model_name || a.name || '').localeCompare(b.model_name || b.name || ''));
        } else if (modelsUI.sort === 'name_desc') {
            filtered.sort((a,b)=> (b.model_name || b.name || '').localeCompare(a.model_name || a.name || ''));
        }
        return filtered;
    }

    function renderModelsWithToolbar(containerId) {
        const key = activeModelsTabKey();
        const container = document.getElementById(containerId);
        const sourceKey = containerId.replace('-container','');
        const fullList = window.allDataCache.models[sourceKey] || [];
        const filtered = applyFiltersToList(fullList);
        if (toolbarInfo) {
            toolbarInfo.textContent = `Showing ${filtered.length} of ${fullList.length}`;
        }
        // Render without lazy trigger when filtering/sorting or searching
        renderModels(container, filtered, false, { disableLazy: true, highlightQuery: modelsUI.highlightQuery });
        attachFavoriteHandlers(container);
    }

    // expose for other modules
    window.renderModelsWithToolbar = renderModelsWithToolbar;

    function onToolbarChange() {
        modelsUI.sort = sortEl ? sortEl.value : 'relevance';
        modelsUI.task = taskEl ? taskEl.value : '';
        modelsUI.language = languageEl ? languageEl.value : '';
        modelsUI.license = licenseEl ? licenseEl.value : '';
        modelsUI.favoritesOnly = favOnlyEl ? !!favOnlyEl.checked : false;
        modelsUI.highlightQuery = (searchInput && container.classList.contains('search-mode')) ? searchInput.value.trim() : '';
        const cid = containerIdForTabKey(activeModelsTabKey());
        renderModelsWithToolbar(cid);
    }

    if (sortEl) sortEl.addEventListener('change', onToolbarChange);
    if (taskEl) taskEl.addEventListener('change', onToolbarChange);
    if (languageEl) languageEl.addEventListener('change', onToolbarChange);
    if (licenseEl) licenseEl.addEventListener('change', onToolbarChange);
    if (favOnlyEl) favOnlyEl.addEventListener('change', onToolbarChange);

    // Tab change should re-apply filters
    const modelsTabs = document.getElementById('models-tabs');
    if (modelsTabs) {
        modelsTabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-btn');
            if (!btn) return;
            setTimeout(() => onToolbarChange(), 0);
        });
    }

    // Clear search button handler
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        resultsInfo.style.display = 'none';
        container.classList.remove('search-mode');
        modelsUI.highlightQuery = '';
        // Reset to default view
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById('models-section').classList.add('active');
        // Re-render current tab with filters only
        onToolbarChange();
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        modelsUI.highlightQuery = query;
        
        if (query.length === 0) {
            clearSearchBtn.style.display = 'none';
            resultsInfo.style.display = 'none';
            container.classList.remove('search-mode');
            // When exiting search, re-render filtered tab
            onToolbarChange();
            return;
        }

        clearSearchBtn.style.display = 'block';
        container.classList.add('search-mode');

        const results = performSearch(query);
        displaySearchResults(results, query);
        
        // Update results count
        const totalResults = results.models.length + results.datasets.length + results.useCases.length;
        resultsCount.textContent = totalResults;
        resultsInfo.style.display = 'block';
    });

    function performSearch(query) {
        const results = {
            models: [],
            datasets: [],
            useCases: []
        };

        // Search in models
        allData.models.forEach(model => {
            const searchableText = [
                model.model_name || model.name,
                model.description,
                model.task,
                model.language,
                model.features,
                model.license
            ].join(' ').toLowerCase();

            if (searchableText.includes(query)) {
                results.models.push(model);
            }
        });

        // Search in datasets
        allData.datasets.forEach(dataset => {
            const searchableText = [
                dataset.dataset_name || dataset.name,
                dataset.description,
                (dataset.tags || []).join(' '),
                dataset.source,
                dataset.size
            ].join(' ').toLowerCase();

            if (searchableText.includes(query)) {
                results.datasets.push(dataset);
            }
        });

        // Search in use cases
        allData.useCases.forEach(useCase => {
            const searchableText = [
                useCase.use_case || useCase.title,
                useCase.description,
                (useCase.models || []).map(m => m.name).join(' '),
                (useCase.datasets || []).map(d => d.name).join(' ')
            ].join(' ').toLowerCase();

            if (searchableText.includes(query)) {
                results.useCases.push(useCase);
            }
        });

        return results;
    }

    function displaySearchResults(results, query) {
        // Show all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('active');
        });

        // Reset lazy loading state for search
        currentBatch.models = { start: 0, items: [], allLoaded: false };
        currentBatch.datasets = { start: 0, items: [], allLoaded: false };
        currentBatch.useCases = { start: 0, items: [], allLoaded: false };

        // Render results (show all search results without pagination)
        if (results.models.length > 0) {
            const modelsSection = document.getElementById('models-section');
            modelsSection.querySelector('.section-title').innerHTML = 
                `<i class="fas fa-brain"></i> Models (${results.models.length} results)`;
            const modelsGrid = document.getElementById('models-section').querySelector('.content-grid, .use-cases-grid');
            renderModels(modelsGrid, results.models, false, { disableLazy: true, highlightQuery: query });
            attachFavoriteHandlers(modelsGrid);
        }

        if (results.datasets.length > 0) {
            const datasetsSection = document.getElementById('datasets-section');
            datasetsSection.querySelector('.section-title').innerHTML = 
                `<i class="fas fa-database"></i> Datasets (${results.datasets.length} results)`;
            renderDatasets(document.getElementById('datasets-section').querySelector('.content-grid, .use-cases-grid'), results.datasets);
        }

        if (results.useCases.length > 0) {
            const useCasesSection = document.getElementById('use-cases-section');
            useCasesSection.querySelector('.section-title').innerHTML = 
                `<i class="fas fa-lightbulb"></i> Use Cases (${results.useCases.length} results)`;
            renderUseCases(document.getElementById('use-cases-section').querySelector('.content-grid, .use-cases-grid'), results.useCases);
        }

        // Empty states if no results
        if (results.models.length === 0 && results.datasets.length === 0 && results.useCases.length === 0) {
            document.getElementById('models-section').querySelector('.content-grid, .use-cases-grid').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No Results Found</h3>
                    <p>Try searching for different keywords like "image generation", "NLP", "classification", etc.</p>
                </div>
            `;
        }
    }

    // Populate toolbar once data starts coming in
    let populateDebounce;
    const observer = new MutationObserver(() => {
        if (populateDebounce) clearTimeout(populateDebounce);
        populateDebounce = setTimeout(() => {
            populateToolbarOptions();
            // Disconnect once we have at least some options populated to avoid repeated work
            const hasOptions = (document.getElementById('models-task')?.options?.length || 0) > 1
                || (document.getElementById('models-language')?.options?.length || 0) > 1
                || (document.getElementById('models-license')?.options?.length || 0) > 1;
            if (hasOptions) observer.disconnect();
        }, 150);
    });
    const modelsSection = document.getElementById('models-section');
    if (modelsSection) observer.observe(modelsSection, { childList: true, subtree: true });
});

// Data Loading and Rendering
document.addEventListener('DOMContentLoaded', () => {
    async function fetchData(file) {
        try {
            const response = await fetch(file);
            if (!response.ok) {
                throw new Error(`Failed to load ${file}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    }

    async function loadData(containerId, dataFile, renderFunction, loadingText) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `<div class="loading"><div class="spinner"></div><p>${loadingText}...</p></div>`;
        const data = await fetchData(dataFile);
        
        // Store data for search
        if (dataFile.includes('model')) {
            allData.models = allData.models.concat(data);
        } else if (dataFile.includes('dataset') || dataFile.includes('kaggle')) {
            allData.datasets = allData.datasets.concat(data);
        } else if (dataFile.includes('use-case')) {
            allData.useCases = allData.useCases.concat(data);
        }
        
        // Cache data for lazy loading
        if (dataFile.includes('model')) {
            const containerKey = containerId.replace('-container', '');
            window.allDataCache.models[containerKey] = Array.isArray(data) ? data : [];
        } else if (dataFile.includes('dataset') || dataFile.includes('kaggle')) {
            const containerKey = containerId.replace('-container', '');
            window.allDataCache.datasets[containerKey] = Array.isArray(data) ? data : [];
        } else if (dataFile.includes('use-case')) {
            window.allDataCache.useCases[containerId] = Array.isArray(data) ? data : [];
        }
        
        // Load first batch
        const list = Array.isArray(data) ? data : [];
        const firstBatch = list.slice(0, ITEMS_PER_BATCH);
        try {
            renderFunction(container, firstBatch);
            if (renderFunction === renderModels) {
                attachFavoriteHandlers(container);
            }
        } catch (err) {
            console.error('Render error:', err);
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-robot"></i>
                    <h3>No Models Found</h3>
                    <p>Unable to load AI models at this time.</p>
                </div>
            `;
        }
        
        // Setup lazy loading if there's more data
        if (list.length > ITEMS_PER_BATCH) {
            setTimeout(() => {
                if (dataFile.includes('model')) {
                    setupLazyLoading(containerId, 'models');
                } else if (dataFile.includes('dataset') || dataFile.includes('kaggle')) {
                    setupLazyLoading(containerId, 'datasets');
                } else if (dataFile.includes('use-case')) {
                    setupLazyLoading(containerId, 'useCases');
                }
            }, 100);
        }
    }

    function renderModels(container, models, isLazyLoad = false, options = {}) {
        if (!models || models.length === 0) {
            if (!isLazyLoad) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-robot"></i>
                        <h3>No Models Found</h3>
                        <p>Unable to load AI models at this time.</p>
                    </div>
                `;
            }
            return;
        }

        const highlightQuery = options.highlightQuery || '';
        const htmlContent = models.map((model, index) => {
            const id = getModelId(model);
            const isFav = modelsUI.favoritesSet.has(id);
            const title = String(model.model_name || model.name || '');
            const description = String(model.description || '');
            const task = String(model.task || '');
            const language = String(model.language || '');
            const license = String(model.license || '');

            const titleHtml = highlightText(title, highlightQuery);
            const descHtml = highlightText(description, highlightQuery);
            const taskHtml = highlightText(task, highlightQuery);
            const langHtml = highlightText(language, highlightQuery);
            const licHtml = highlightText(license, highlightQuery);

            return `
            <div class="card model-card" style="animation-delay: ${index * 0.1}s">
                <button class="favorite-btn${isFav ? ' active' : ''}" data-id="${id}" aria-label="Toggle favorite">
                    <i class="fas fa-star"></i>
                </button>
                <h3>${titleHtml}</h3>
                <p>${descHtml}</p>
                <div class="model-meta">
                    ${task ? `<span class="model-meta-item">
                        <i class="fas fa-tasks"></i>
                        <span>${taskHtml}</span>
                    </span>` : ''}
                    ${language ? `<span class="model-meta-item">
                        <i class="fas fa-language"></i>
                        <span>${langHtml}</span>
                    </span>` : ''}
                    ${license ? `<span class="model-meta-item">
                        <i class="fas fa-file-contract"></i>
                        <span>${licHtml}</span>
                    </span>` : ''}
                </div>
                <div class="model-meta">
                    ${task ? `<span class="meta-badge task"><i class="fas fa-tag"></i> ${task.split(',')[0]}</span>` : ''}
                    ${license ? `<span class="meta-badge license"><i class="fas fa-file-contract"></i> ${license}</span>` : ''}
                    ${language ? `<span class="meta-badge language"><i class="fas fa-globe"></i> ${language}</span>` : ''}
                </div>
                ${model.url ? `
                    <a href="${model.url}" target="_blank" rel="noopener noreferrer" class="view-link">
                        <span>View Model</span>
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                ` : ''}
            </div>`;
        }).join('');
        
        if (isLazyLoad && !options.disableLazy) {
            container.insertAdjacentHTML('beforeend', htmlContent);
            const oldTrigger = container.querySelector('.loading-trigger#models-loading-trigger');
            if (oldTrigger) oldTrigger.remove();
            const loadingTrigger = document.createElement('div');
            loadingTrigger.className = 'loading-trigger';
            loadingTrigger.id = 'models-loading-trigger';
            container.appendChild(loadingTrigger);
        } else {
            container.innerHTML = htmlContent;
            if (!options.disableLazy) {
                const loadingTrigger = document.createElement('div');
                loadingTrigger.className = 'loading-trigger';
                loadingTrigger.id = 'models-loading-trigger';
                container.appendChild(loadingTrigger);
            }
        }
    }

    function renderDatasets(container, datasets, isLazyLoad = false) {
        if (!datasets || datasets.length === 0) {
            if (!isLazyLoad) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-database"></i>
                        <h3>No Datasets Found</h3>
                        <p>Unable to load datasets at this time.</p>
                    </div>
                `;
            }
            return;
        }

        const htmlContent = datasets.map((dataset, index) => `
            <div class="card" style="animation-delay: ${index * 0.1}s">
                <h3>${dataset.dataset_name || dataset.name}</h3>
                <p>${dataset.description || ''}</p>
                ${dataset.size ? `
                    <div class="model-meta">
                        <span class="model-meta-item">
                            <i class="fas fa-layer-group"></i>
                            <span>${dataset.size}</span>
                        </span>
                    </div>
                ` : ''}
                ${dataset.tags && dataset.tags.length > 0 ? `
                    <div class="dataset-tags">
                        ${dataset.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        ${dataset.tags.length > 3 ? `<span class="tag tag-more">+${dataset.tags.length - 3} more</span>` : ''}
                    </div>
                ` : ''}
                ${dataset.url ? `
                    <a href="${dataset.url}" target="_blank" rel="noopener noreferrer" class="view-link">
                        <span>View Dataset</span>
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                ` : ''}
            </div>
        `).join('');
        
        if (isLazyLoad) {
            container.insertAdjacentHTML('beforeend', htmlContent);
            // Remove old trigger and add new one
            const oldTrigger = container.querySelector('.loading-trigger#datasets-loading-trigger');
            if (oldTrigger) oldTrigger.remove();
            const loadingTrigger = document.createElement('div');
            loadingTrigger.className = 'loading-trigger';
            loadingTrigger.id = 'datasets-loading-trigger';
            container.appendChild(loadingTrigger);
        } else {
            container.innerHTML = htmlContent;
            const loadingTrigger = document.createElement('div');
            loadingTrigger.className = 'loading-trigger';
            loadingTrigger.id = 'datasets-loading-trigger';
            container.appendChild(loadingTrigger);
        }
    }

    function renderUseCases(container, useCases, isLazyLoad = false) {
        if (!useCases || useCases.length === 0) {
            if (!isLazyLoad) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-lightbulb"></i>
                        <h3>No Use Cases Found</h3>
                        <p>Unable to load use cases at this time.</p>
                    </div>
                `;
            }
            return;
        }
        
        const htmlContent = useCases.map((useCase, index) => `
            <div class="use-case-card" style="animation-delay: ${index * 0.1}s">
                <h3>${useCase.use_case || useCase.title}</h3>
                <p>${useCase.description || ''}</p>
                
                ${useCase.models && useCase.models.length > 0 ? `
                    <div class="models-list">
                        <h4><i class="fas fa-robot"></i> Recommended Models</h4>
                        ${useCase.models.map(model => `
                            <div class="model-item">
                                <a href="${model.link}" target="_blank" rel="noopener noreferrer">
                                    <i class="fas fa-brain"></i>
                                    ${model.name}
                                </a>
                                <div class="source">${model.source}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${useCase.datasets && useCase.datasets.length > 0 ? `
                    <div class="datasets-list">
                        <h4><i class="fas fa-database"></i> Recommended Datasets</h4>
                        ${useCase.datasets.map(dataset => `
                            <div class="dataset-item">
                                <a href="${dataset.link}" target="_blank" rel="noopener noreferrer">
                                    <i class="fas fa-database"></i>
                                    ${dataset.name}
                                </a>
                                <div class="source">${dataset.source}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
        
        if (isLazyLoad) {
            container.insertAdjacentHTML('beforeend', htmlContent);
            // Remove old trigger and add new one
            const oldTrigger = container.querySelector('.loading-trigger#use-cases-loading-trigger');
            if (oldTrigger) oldTrigger.remove();
            const loadingTrigger = document.createElement('div');
            loadingTrigger.className = 'loading-trigger';
            loadingTrigger.id = 'use-cases-loading-trigger';
            container.appendChild(loadingTrigger);
        } else {
            container.innerHTML = htmlContent;
            const loadingTrigger = document.createElement('div');
            loadingTrigger.className = 'loading-trigger';
            loadingTrigger.id = 'use-cases-loading-trigger';
            container.appendChild(loadingTrigger);
        }
    }

    // Setup Intersection Observer for lazy loading
    function setupLazyLoading(containerId, dataType) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !currentBatch[dataType].allLoaded) {
                    loadNextBatch(containerId, dataType);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '200px'
        });

        // Start observing after initial load
        setTimeout(() => {
            const trigger = container.querySelector('.loading-trigger');
            if (trigger) observer.observe(trigger);
        }, 500);
    }

    function loadNextBatch(containerId, dataType) {
        const batch = currentBatch[dataType];
        const containerKey = containerId.replace('-container', '');
        const allData = window.allDataCache[dataType][containerKey] || 
                       window.allDataCache[dataType][containerId];
        
        if (!allData || batch.allLoaded) return;

        const end = Math.min(batch.start + ITEMS_PER_BATCH, allData.length);
        const nextBatch = allData.slice(batch.start, end);
        
        if (nextBatch.length === 0) {
            batch.allLoaded = true;
            const trigger = document.getElementById(containerId)?.querySelector('.loading-trigger');
            if (trigger) trigger.style.display = 'none';
            return;
        }

        // Update batch state
        batch.start = end;
        batch.items = batch.items.concat(nextBatch);

        // Render the new batch
        if (dataType === 'models') {
            renderModels(document.getElementById(containerId), nextBatch, true);
            attachFavoriteHandlers(document.getElementById(containerId));
        } else if (dataType === 'datasets') {
            renderDatasets(document.getElementById(containerId), nextBatch, true);
        } else if (dataType === 'useCases') {
            renderUseCases(document.getElementById(containerId), nextBatch, true);
        }

        // Continue observing the new trigger
        setTimeout(() => {
            const newTrigger = document.getElementById(containerId)?.querySelector('.loading-trigger');
            if (newTrigger && !batch.allLoaded) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            loadNextBatch(containerId, dataType);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { rootMargin: '200px' });
                observer.observe(newTrigger);
            }
        }, 100);
    }

    // Cache for storing all loaded data
    window.allDataCache = {
        models: {},
        datasets: {},
        useCases: {}
    };

    // Load existing data files
    loadData('models-huggingface-container', 'data/huggingface-models.json', renderModels, 'Loading Hugging Face Models');
    loadData('models-pytorch-container', 'data/pytorch-models.json', renderModels, 'Loading PyTorch Models');
    loadData('models-tensorflow-container', 'data/tensorflow-models.json', renderModels, 'Loading TensorFlow Models');
    loadData('models-openai-container', 'data/openai-models.json', renderModels, 'Loading OpenAI Models');
    loadData('models-vertex-ai-container', 'data/vertex-ai-models.json', renderModels, 'Loading Google Model Garden Models');
    loadData('models-cohere-container', 'data/cohere-models.json', renderModels, 'Loading Cohere Models');
    loadData('models-anthropic-container', 'data/anthropic-models.json', renderModels, 'Loading Anthropic Models');
    loadData('models-ai21-container', 'data/ai21-models.json', renderModels, 'Loading AI21 Models');
    loadData('models-stability-container', 'data/stability-models.json', renderModels, 'Loading Stability AI Models');
    loadData('models-papers-code-container', 'data/papers-code-models.json', renderModels, 'Loading Papers w/ Code Models');
    loadData('models-meta-container', 'data/meta-models.json', renderModels, 'Loading Meta AI Models');
    loadData('models-azure-container', 'data/azure-models.json', renderModels, 'Loading Azure AI Models');
    loadData('datasets-kaggle-container', 'data/kaggle-datasets.json', renderDatasets, 'Loading Kaggle Datasets');
    loadData('datasets-huggingface-container', 'data/huggingface-datasets.json', renderDatasets, 'Loading HuggingFace Datasets');
    loadData('datasets-google-search-container', 'data/more-datasets.json', renderDatasets, 'Loading Google Dataset Search');
    loadData('datasets-uci-container', 'data/more-datasets.json', renderDatasets, 'Loading UCI Datasets');
    loadData('datasets-datagov-container', 'data/more-datasets.json', renderDatasets, 'Loading Data.gov');
    loadData('datasets-aws-open-container', 'data/more-datasets.json', renderDatasets, 'Loading AWS Open Data');
    loadData('datasets-commoncrawl-container', 'data/more-datasets.json', renderDatasets, 'Loading Common Crawl');
    loadData('datasets-torrents-container', 'data/more-datasets.json', renderDatasets, 'Loading Academic Torrents');
    loadData('datasets-openml-container', 'data/more-datasets.json', renderDatasets, 'Loading OpenML');
    loadData('datasets-zenodo-container', 'data/more-datasets.json', renderDatasets, 'Loading Zenodo');
    loadData('datasets-microsoft-container', 'data/more-datasets.json', renderDatasets, 'Loading MS Research');
    loadData('datasets-github-container', 'data/more-datasets.json', renderDatasets, 'Loading GitHub Datasets');
    loadData('use-cases-container', 'data/use-cases.json', renderUseCases, 'Loading Use Cases');
});