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

        const tags = (font.tags || [])
            .map(t => `<span class="tag">${t}</span>`)
            .join('');

        const variantsHtml = font.variants.map(v => {

            const cssUrl = `./${v.folder}/${v.css}`;

            return `
                <div class="variant">
                    <div class="variant-meta">
                        <strong>${v.weight} / ${v.style}</strong>
                    </div>

                    <div class="preview"
                        style="font-family:'${font.family}'">
                        ${font.preview || 'The quick brown fox jumps over the lazy dog'}
                    </div>

                    <code>${cssUrl}</code>
                </div>
            `;
        }).join('');

        container.insertAdjacentHTML('beforeend', `
            <article class="font-card">

                <div class="font-header">
                    <div class="font-name">${font.family}</div>
                    <div class="license">${font.license || 'unknown'}</div>
                </div>

                ${variantsHtml}

                <div class="meta">
                    ${tags}
                </div>

            </article>
        `);
    });
}
