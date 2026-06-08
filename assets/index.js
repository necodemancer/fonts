const container = document.getElementById('fonts');
const search = document.getElementById('search');

let activeTag = null;
let activeProject = null;
let searchValue = '';

let catalog = [];

fetch('./catalog.json')
    .then(res => res.json())
    .then(data => {

        catalog = data;
        loadFonts(data);
        buildFilters(data);
        applyFilters();

        search.addEventListener('input', () => {
            searchValue = search.value.toLowerCase();
            applyFilters();
        });

    });

function applyFilters() {

    const filtered = catalog.filter(font => {

        const matchesSearch =
            font.family.toLowerCase().includes(searchValue);

        const matchesTag =
            !activeTag || (font.tags || []).includes(activeTag);

        const matchesProject =
            !activeProject || (font.projects || []).includes(activeProject);

        return matchesSearch && matchesTag && matchesProject;
    });

    render(groupByLicense(filtered));
}

function buildFilters(fonts) {

    const tagSet = new Set();
    const projectSet = new Set();

    fonts.forEach(f => {
        (f.tags || []).forEach(t => tagSet.add(t));
        (f.projects || []).forEach(p => projectSet.add(p));
    });

    const container = document.getElementById('filters');

    container.innerHTML = `
        <div class="filter-block">
            <h3>Tags</h3>
            ${[...tagSet].map(tag => `
                <button class="tag-filter" data-tag="${tag}">
                    ${tag}
                </button>
            `).join('')}
        </div>

        <div class="filter-block">
            <h3>Projects</h3>
            ${[...projectSet].map(p => `
                <button class="project-filter" data-project="${p}">
                    ${p}
                </button>
            `).join('')}
        </div>
    `;
}

function loadFonts(fonts) {

    const added = new Set();

    fonts.forEach(font => {

        font.variants.forEach(v => {

            const key = `${v.folder}/${v.css}`;

            if (added.has(key)) return;
            added.add(key);

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `./${key}`;

            document.head.appendChild(link);
        });

    });
}

function groupByLicense(fonts) {
    return fonts.reduce((acc, font) => {

        const key = font.license || 'unknown';

        if (!acc[key]) acc[key] = [];
        acc[key].push(font);

        return acc;

    }, {});
}

const licenseLabelMap = {
    commercial: "Free for commercial use",
    personal: "Free for personal use",
    unknown: "Unknown license"
};

function render(groupedFonts) {

    container.innerHTML = '';

    const licenseOrder = Object.keys(licenseLabelMap);

    licenseOrder.forEach(license => {

        const fonts = groupedFonts[license];
        if (!fonts || fonts.length === 0) return;

        container.insertAdjacentHTML('beforeend', `
            <h2 class="license-section">
                ${licenseLabelMap[license]}
            </h2>
        `);

        fonts.forEach(font => {

            const tags = (font.tags || [])
                .map(t => `<span class="tag">${t}</span>`)
                .join('');

            const projects = (font.projects || [])
                .map(p => `<span class="project">${p}</span>`)
                .join(', ');

            const cssLinks = [...new Set(font.variants.map(v => v.css))]
            .map(css => {
        
                const v = font.variants.find(x => x.css === css);
        
                return `
                    <div class="css-link">
                        <code>&#60;link rel="stylesheet" type="text/css" href="https://necodemancer.github.io/fonts/${v.folder}/${css}"/&#62;</code>
                    </div>
                `;
            })
            .join('');

            const defaultVariant = font.variants[0];

            const seen = new Set();

            const uniqueVariants = font.variants.filter(v => {
                const key = `${v.weight}-${v.style}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            const variantButtons = uniqueVariants.map(v => `
                <button class="variant-btn"
                    data-family="${font.family}"
                    data-weight="${v.weight}"
                    data-style="${v.style}">
                    ${v.weight}${v.style === 'italic' ? ' italic' : ''}
                </button>
            `).join('');

            container.insertAdjacentHTML('beforeend', `
                <article class="font-card">

                    <div class="font-header">
                        <div class="font-name">${font.family}</div>
                        <div class="license license-${font.license}">
                            ${licenseLabelMap[font.license] || licenseLabelMap.unknown}
                        </div>
                    </div>

                    <div class="preview"
                        data-family="${font.family}"
                        style="font-family:'${font.family}';
                               font-weight:${defaultVariant.weight};
                               font-style:${defaultVariant.style};">
                        ${font.preview || 'The quick brown fox jumps over the lazy dog'}
                    </div>

                    <div class="variant-controls">
                        ${variantButtons}
                    </div>

                    <div class="footer">
                        <div class="projects">
                            <b>Projects:</b> ${projects || 'No project uses this font'}.
                        </div>
                        <div class="meta">
                            ${tags}
                        </div>
                    </div>

                    ${cssLinks}

                </article>
            `);

        });

    });

    attachVariantEvents();
}

function attachVariantEvents() {

    document.querySelectorAll('.variant-btn').forEach(btn => {

        btn.addEventListener('click', () => {

            const family = btn.dataset.family;
            const weight = btn.dataset.weight;
            const style = btn.dataset.style;

            const preview = document.querySelector(
                `.preview[data-family="${family}"]`
            );

            if (!preview) return;

            preview.style.fontWeight = weight;
            preview.style.fontStyle = style;

        });

    });
}

document.addEventListener('click', e => {

    if (e.target.classList.contains('tag-filter')) {
        const tag = e.target.dataset.tag;
        activeTag = (activeTag === tag) ? null : tag;
    
        applyFilters();
    }

    if (e.target.classList.contains('project-filter')) {
        const p = e.target.dataset.project;
        activeProject = (activeProject === p) ? null : p;
    
        applyFilters();
    }

});
