const container = document.getElementById('fonts');
const search = document.getElementById('search');

let catalog = [];

fetch('./catalog.json')
    .then(res => res.json())
    .then(data => {

        catalog = data;

        loadFonts(data);
        render(groupByLicense(data));

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

function render(groupedFonts) {
    container.innerHTML = '';

    Object.entries(groupedFonts).forEach(([license, fonts]) => {

    container.insertAdjacentHTML('beforeend', `
        <h2 class="license-section">${license}</h2>
    `);

        fonts.forEach(font => {

            const tags = (font.tags || [])
                .map(t => `<span class="tag">${t}</span>`)
                .join('');
    
            const projects = (font.projects || [])
                .map(p => `<span class="project">${p}</span>`)
                .join(', ');
    
            const cssLinks = [...new Set(font.variants.map(v => v.css))].map(css => {
                const v = font.variants.find(x => x.css === css);
            
                return `
                    <div class="css-link">
                        <code>https://necodemancer.github.io/fonts/${v.folder}/${css}</code>
                    </div>
                `;
            }).join('');
    
            const defaultVariant = font.variants[0];
    
            const seen = new Set();
    
            const uniqueVariants = font.variants.filter(v => {
                const key = `${v.weight}-${v.style}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
    
            const variantButtons = uniqueVariants.map(v => {
                return `
                    <button class="variant-btn"
                        data-family="${font.family}"
                        data-weight="${v.weight}"
                        data-style="${v.style}">
                        ${v.weight}${v.style === 'italic' ? ' italic' : ''}
                    </button>
                `;
            }).join('');
    
            const licenseLabel = {
                commercial: "Free for commercial use",
                personal: "Free for personal use",
                unknown: "Unknown license"
            }[font.license] || "Unknown license";
    
            container.insertAdjacentHTML('beforeend', `
                <article class="font-card">
    
                    <div class="font-header">
                        <div class="font-name">${font.family}</div>
                        <div class="license license-${font.license}">
                            ${licenseLabel}
                        </div>
                    </div>
    
                    <div class="preview"
                         data-family="${font.family}"
                         style="font-family:'${font.family}';
                                font-weight:${defaultVariant.weight};
                                font-style:${defaultVariant.style};">
                        ${font.preview || 'The quick brown fox jumps over the lazy dog'}
                    </div>
    
                    ${cssLinks}
    
                    <div class="variant-controls">
                        ${variantButtons}
                    </div>
    
                    <div class="meta">
                        ${tags}
                    </div>
    
                    <div class="projects">
                        <b>Projects:</b> ${projects || 'No project uses this font'}.
                    </div>
    
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
