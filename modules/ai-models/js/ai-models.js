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

// Lazy Loading Configuration
const ITEMS_PER_BATCH = 100;
let currentBatch = {
    models: { start: 0, items: [], allLoaded: false },
    datasets: { start: 0, items: [], allLoaded: false },
    useCases: { start: 0, items: [], allLoaded: false }
};

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('global-search');
    const clearSearchBtn = document.getElementById('clear-search');
    const resultsInfo = document.getElementById('search-results-info');
    const resultsCount = document.getElementById('results-count');
    const container = document.querySelector('.container');

    // Clear search button handler
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        resultsInfo.style.display = 'none';
        container.classList.remove('search-mode');
        
        // Reset to default view
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById('models-section').classList.add('active');
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length === 0) {
            clearSearchBtn.style.display = 'none';
            resultsInfo.style.display = 'none';
            container.classList.remove('search-mode');
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
            renderModels(document.getElementById('models-section').querySelector('.content-grid, .use-cases-grid'), results.models);
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
            window.allDataCache.models[containerKey] = data;
        } else if (dataFile.includes('dataset') || dataFile.includes('kaggle')) {
            const containerKey = containerId.replace('-container', '');
            window.allDataCache.datasets[containerKey] = data;
        } else if (dataFile.includes('use-case')) {
            window.allDataCache.useCases[containerId] = data;
        }
        
        // Load first batch of 100 items
        const firstBatch = data.slice(0, ITEMS_PER_BATCH);
        renderFunction(container, firstBatch);
        
        // Setup lazy loading if there's more data
        if (data.length > ITEMS_PER_BATCH) {
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

    function renderModels(container, models, isLazyLoad = false) {
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

        const htmlContent = models.map((model, index) => `
            <div class="card model-card" style="animation-delay: ${index * 0.1}s">
                <h3>${model.model_name || model.name}</h3>
                <p>${model.description || ''}</p>
                <div class="model-meta">
                    ${model.task ? `<span class="model-meta-item">
                        <i class="fas fa-tasks"></i>
                        <span>${model.task}</span>
                    </span>` : ''}
                    ${model.language ? `<span class="model-meta-item">
                        <i class="fas fa-language"></i>
                        <span>${model.language}</span>
                    </span>` : ''}
                    ${model.license ? `<span class="model-meta-item">
                        <i class="fas fa-file-contract"></i>
                        <span>${model.license}</span>
                    </span>` : ''}
                </div>
                <div class="model-meta">
                    ${model.task ? `<span class="meta-badge task"><i class="fas fa-tag"></i> ${model.task.split(',')[0]}</span>` : ''}
                    ${model.license ? `<span class="meta-badge license"><i class="fas fa-file-contract"></i> ${model.license}</span>` : ''}
                    ${model.language ? `<span class="meta-badge language"><i class="fas fa-globe"></i> ${model.language}</span>` : ''}
                </div>
                ${model.url ? `
                    <a href="${model.url}" target="_blank" rel="noopener noreferrer" class="view-link">
                        <span>View Model</span>
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                ` : ''}
            </div>
        `).join('');
        
        if (isLazyLoad) {
            container.insertAdjacentHTML('beforeend', htmlContent);
            // Add loading trigger at the end
            const loadingTrigger = document.createElement('div');
            loadingTrigger.className = 'loading-trigger';
            loadingTrigger.id = 'models-loading-trigger';
            container.appendChild(loadingTrigger);
        } else {
            container.innerHTML = htmlContent;
            // Add loading trigger at the end
            const loadingTrigger = document.createElement('div');
            loadingTrigger.className = 'loading-trigger';
            loadingTrigger.id = 'models-loading-trigger';
            container.appendChild(loadingTrigger);
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