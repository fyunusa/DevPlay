document.addEventListener('DOMContentLoaded', function() {
    const datasetsContainer = document.getElementById('datasets-container');
    const modelsContainer = document.getElementById('models-container');

    async function loadDatasets() {
        const files = [
            { path: 'datasets/nlp.json', title: 'NLP Datasets' },
            { path: 'datasets/vision.json', title: 'Vision Datasets' },
            { path: 'datasets/tabular.json', title: 'Tabular Datasets' },
            { path: 'datasets/audio.json', title: 'Audio Datasets' }
        ];
        for (const file of files) {
            const response = await fetch(file.path);
            let data = await response.json();
            // If data is an object, try to extract the array
            if (!Array.isArray(data)) {
                data = data.datasets || data.data || [];
            }
            displayDatasets(data, file.title);
        }
    }

    async function loadModels() {
        const files = [
            { path: 'models/nlp-models.json', title: 'NLP Models' },
            { path: 'models/vision-models.json', title: 'Vision Models' },
            { path: 'models/tabular-models.json', title: 'Tabular Models' },
            { path: 'models/audio-models.json', title: 'Audio Models' }
        ];
        for (const file of files) {
            const response = await fetch(file.path);
            let data = await response.json();
            if (!Array.isArray(data)) {
                data = data.models || data.data || [];
            }
            displayModels(data, file.title);
        }
    }

    function displayDatasets(datasets, title) {
        if (!Array.isArray(datasets)) return;
        const section = document.createElement('section');
        section.className = 'dataset-section';
        section.innerHTML = `<h2>${title}</h2>
            <div class="datasets-grid"></div>`;
        const grid = section.querySelector('.datasets-grid');
        datasets.forEach(dataset => {
            const card = document.createElement('div');
            card.className = 'dataset-card';
            card.innerHTML = `
                <div class="card-title">${dataset.name}</div>
                <div class="card-description">${dataset.description}</div>
                <div class="card-source"><strong>Source:</strong> ${dataset.source}</div>
                ${dataset.url ? `<a href="${dataset.url}" class="card-button" target="_blank">View Dataset</a>` : ''}
            `;
            grid.appendChild(card);
        });
        datasetsContainer.appendChild(section);
    }

    function displayModels(models, title) {
        if (!Array.isArray(models)) return;
        const section = document.createElement('section');
        section.className = 'model-section';
        section.innerHTML = `<h2>${title}</h2>
            <div class="models-grid"></div>`;
        const grid = section.querySelector('.models-grid');
        models.forEach(model => {
            const card = document.createElement('div');
            card.className = 'model-card';
            card.innerHTML = `
                <div class="card-title">${model.name}</div>
                <div class="card-description">${model.description}</div>
                <div class="card-source"><strong>Performance:</strong> ${model.performance || 'N/A'}</div>
                ${model.url ? `<a href="${model.url}" class="card-button" target="_blank">View Model</a>` : ''}
            `;
            grid.appendChild(card);
        });
        modelsContainer.appendChild(section);
    }

    loadDatasets();
    loadModels();
});