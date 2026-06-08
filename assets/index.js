const container = document.getElementById('fonts');
const search = document.getElementById('search');

let catalog = [];

fetch('./catalog.json')
    .then(res => res.json())
    .then(data => {

        catalog = data;

        loadFonts(data);
        render(data);

        search.addEventListener('input', () => {

            const value = search.value.toLowerCase();

            render(
                catalog.filter(font => {

                    return (
                        font.name.toLowerCase().includes(value) ||
                        (font.tags || []).join(' ').toLowerCase().includes(value)
                    );

                })
            );

        });

    });

function loadFonts(fonts) {

    fonts.forEach(font => {

        const link = document.createElement('link');

        link.rel = 'stylesheet';
        link.href = `./${font.folder}/${font.css}`;

        document.head.appendChild(link);

    });

}

function render(fonts) {

    container.innerHTML = '';

    fonts.forEach(font => {

        const projects = (font.projects || []).length
            ? font.projects.join(', ')
            : 'None';

        const tags = (font.tags || [])
            .map(tag => `<span class="tag">${tag}</span>`)
            .join('');

        container.insertAdjacentHTML('beforeend', `
            <article class="font-card">

                <div class="font-header">

                    <div>
                        <div class="font-name">${font.name}</div>
                        <div class="license">${font.license || ''}</div>
                    </div>

                </div>

                <div
                    class="preview"
                    style="font-family:'${font.name}'"
                >
                    ${font.preview || 'The quick brown fox jumps over the lazy dog'}
                </div>

                ${font.notes ? `
                    <p>${font.notes}</p>
                ` : ''}

                <div class="meta">
                    ${tags}
                </div>

                <div class="projects">
                    <strong>Projects:</strong> ${projects}
                </div>

                <div class="css-link">
                    <code>https://necodemancer.github.io/fonts/${font.folder}/${font.css}</code>
                </div>

            </article>
        `);

    });

}