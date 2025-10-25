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
        renderFunction(container, data);
    }

    function renderModels(container, models) {
        if (!models || models.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-robot"></i>
                    <h3>No Models Found</h3>
                    <p>Unable to load AI models at this time.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = models.map((model, index) => `
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
    }

    function renderDatasets(container, datasets) {
        if (!datasets || datasets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-database"></i>
                    <h3>No Datasets Found</h3>
                    <p>Unable to load datasets at this time.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = datasets.map((dataset, index) => `
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
                        ${dataset.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
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
    }

    function renderUseCases(container, useCases) {
        if (!useCases || useCases.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-lightbulb"></i>
                    <h3>No Use Cases Found</h3>
                    <p>Unable to load use cases at this time.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = useCases.map((useCase, index) => `
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
    }

    // Load existing data files
    loadData('models-huggingface-container', 'data/huggingface-models.json', renderModels, 'Loading Hugging Face Models');
    loadData('models-pytorch-container', 'data/pytorch-models.json', renderModels, 'Loading PyTorch Models');
    loadData('models-tensorflow-container', 'data/tensorflow-models.json', renderModels, 'Loading TensorFlow Models');
    loadData('datasets-kaggle-container', 'data/kaggle-datasets.json', renderDatasets, 'Loading Kaggle Datasets');
    loadData('datasets-hf-datasets-container', 'data/more-datasets.json', renderDatasets, 'Loading Datasets');
    loadData('use-cases-container', 'data/use-cases.json', renderUseCases, 'Loading Use Cases');
});