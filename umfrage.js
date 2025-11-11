(() => {
    const typeConfigs = {
        'multiple-single': {
            label: 'Multiple Choice (Einfachauswahl)',
            optionGroups: [
                { key: 'options', label: 'Antwortoptionen', min: 2, addLabel: 'Option hinzufügen', placeholder: 'Option' }
            ],
            defaults: () => ({
                title: 'Multiple Choice (Einfachauswahl)',
                description: 'Wie sind Sie auf unser Produkt aufmerksam geworden?',
                info: 'Eindeutige Kategorisierung und klare Präferenzen. Der Nutzer kann nur eine Option wählen.',
                options: {
                    options: ['Google-Suche', 'Social Media', 'Empfehlung', 'Online-Werbung', 'Zeitschrift/Zeitung']
                },
                settings: {}
            }),
            render: (question) => {
                const options = getOptionList(question, 'options', ['Option 1', 'Option 2']);
                const name = `${question.id}-single`;
                const content = options.map((option, index) => `
                    <div class="option">
                        <input type="radio" name="${name}" id="${name}-${index}">
                        <label for="${name}-${index}">${escapeHtml(option)}</label>
                    </div>
                `).join('');
                return wrapContent(content);
            }
        },
        'multiple-multi': {
            label: 'Multiple Choice (Mehrfachauswahl)',
            optionGroups: [
                { key: 'options', label: 'Antwortoptionen', min: 2, addLabel: 'Option hinzufügen', placeholder: 'Option' }
            ],
            defaults: () => ({
                title: 'Multiple Choice (Mehrfachauswahl)',
                description: 'Welche Features nutzen Sie regelmäßig? (Mehrfachauswahl möglich)',
                info: 'Ideal für Prioritätenlisten, Funktionsumfang oder Nutzungsverhalten.',
                options: {
                    options: ['Dashboard', 'Reporting-Funktion', 'Automatisierte Alerts', 'Mobile App', 'Integrationen']
                },
                settings: {}
            }),
            render: (question) => {
                const options = getOptionList(question, 'options', ['Option 1', 'Option 2']);
                const name = `${question.id}-multi`;
                const content = options.map((option, index) => `
                    <div class="option">
                        <input type="checkbox" id="${name}-${index}">
                        <label for="${name}-${index}">${escapeHtml(option)}</label>
                    </div>
                `).join('');
                return wrapContent(content);
            }
        },
        likert: {
            label: 'Likert-Skala',
            optionGroups: [
                { key: 'statements', label: 'Aussagen', min: 1, addLabel: 'Aussage hinzufügen', placeholder: 'Aussage' },
                { key: 'scale', label: 'Antwortskala', min: 2, addLabel: 'Skalapunkt hinzufügen', placeholder: 'Skalapunkt' }
            ],
            defaults: () => ({
                title: 'Likert-Skala',
                description: 'Wie zufrieden sind Sie mit den folgenden Bereichen?',
                info: 'Perfekt für Zufriedenheit und Zustimmung.',
                options: {
                    statements: ['Produktqualität', 'Lieferzeit', 'Support', 'Preis-Leistungs-Verhältnis'],
                    scale: ['Sehr zufrieden', 'Zufrieden', 'Neutral', 'Unzufrieden', 'Sehr unzufrieden']
                },
                settings: {}
            }),
            render: (question) => {
                const statements = getOptionList(question, 'statements', ['Option A']);
                const scale = getOptionList(question, 'scale', ['Positiv', 'Neutral', 'Negativ']);
                const head = scale.map((label) => `<th>${escapeHtml(label)}</th>`).join('');
                const rows = statements.map((statement, rowIndex) => {
                    const inputs = scale.map((_, colIndex) => `
                        <td><input type="radio" name="${question.id}-likert-${rowIndex}" value="${colIndex}"></td>
                    `).join('');
                    return `<tr><td>${escapeHtml(statement)}</td>${inputs}</tr>`;
                }).join('');
                return `
                    <div class="question-content">
                        <table class="matrix-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    ${head}
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                `;
            }
        },
        matrix: {
            label: 'Matrix',
            optionGroups: [
                { key: 'rows', label: 'Zeilen (Themen)', min: 2, addLabel: 'Zeile hinzufügen', placeholder: 'Thema' },
                { key: 'columns', label: 'Spalten (Antworten)', min: 2, addLabel: 'Spalte hinzufügen', placeholder: 'Antwort' }
            ],
            defaults: () => ({
                title: 'Matrix-Frage (Grid)',
                description: 'Bitte bewerten Sie folgende Aspekte unseres Hotels:',
                info: 'Effiziente Bewertung mehrerer Items mit gleicher Skala.',
                options: {
                    rows: ['Zimmerqualität', 'Sauberkeit', 'Personal', 'Frühstück'],
                    columns: ['Sehr gut', 'Gut', 'Befriedigend', 'Ausreichend']
                },
                settings: {}
            }),
            render: (question) => {
                const rows = getOptionList(question, 'rows', ['Zeile 1']);
                const columns = getOptionList(question, 'columns', ['Spalte 1', 'Spalte 2']);
                const head = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('');
                const body = rows.map((row, rowIndex) => {
                    const inputs = columns.map((_, colIndex) => `
                        <td><input type="radio" name="${question.id}-matrix-${rowIndex}" value="${colIndex}"></td>
                    `).join('');
                    return `<tr><td>${escapeHtml(row)}</td>${inputs}</tr>`;
                }).join('');
                return `
                    <div class="question-content">
                        <table class="matrix-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    ${head}
                                </tr>
                            </thead>
                            <tbody>${body}</tbody>
                        </table>
                    </div>
                `;
            }
        },
        nps: {
            label: 'Net Promoter Score',
            settingsFields: [
                { key: 'minScore', label: 'Startwert', type: 'number', min: 0 },
                { key: 'maxScore', label: 'Endwert', type: 'number', min: 1 },
                { key: 'minLabel', label: 'Linker Hinweis', type: 'text' },
                { key: 'maxLabel', label: 'Rechter Hinweis', type: 'text' }
            ],
            defaults: () => ({
                title: 'Net Promoter Score (NPS)',
                description: 'Wie wahrscheinlich würden Sie unser Unternehmen weiterempfehlen?',
                info: 'Liefert klaren Indikator für Loyalität und Weiterempfehlung.',
                options: {},
                settings: {
                    minScore: 0,
                    maxScore: 10,
                    minLabel: 'Überhaupt nicht wahrscheinlich',
                    maxLabel: 'Äußerst wahrscheinlich'
                }
            }),
            render: (question) => {
                const settings = question.settings || {};
                const rawMin = Number.isFinite(settings.minScore) ? settings.minScore : 0;
                const rawMax = Number.isFinite(settings.maxScore) ? settings.maxScore : rawMin + 10;
                const minScore = Math.min(rawMin, rawMax);
                const maxScore = Math.max(rawMin, rawMax);
                const minLabel = settings.minLabel || '';
                const maxLabel = settings.maxLabel || '';
                const numbers = [];
                for (let i = minScore; i <= maxScore; i += 1) {
                    numbers.push(`<div class="nps-number">${i}</div>`);
                }
                return `
                    <div class="question-content">
                        <div class="nps-scale">${numbers.join('')}</div>
                        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.75rem; color: var(--color-text-secondary);">
                            <span>${escapeHtml(minLabel)}</span>
                            <span>${escapeHtml(maxLabel)}</span>
                        </div>
                    </div>
                `;
            }
        },
        stars: {
            label: 'Sterne-Bewertung',
            settingsFields: [
                { key: 'starCount', label: 'Anzahl Sterne', type: 'number', min: 1, max: 10 },
                { key: 'leftLabel', label: 'Linker Hinweis', type: 'text' },
                { key: 'rightLabel', label: 'Rechter Hinweis', type: 'text' }
            ],
            defaults: () => ({
                title: 'Sterne-Bewertung',
                description: 'Wie bewerten Sie unseren Support?',
                info: 'Intuitiv und schnell – ideal für Bewertungen in Sekunden.',
                options: {},
                settings: {
                    starCount: 5,
                    leftLabel: 'Schlecht',
                    rightLabel: 'Hervorragend'
                }
            }),
            render: (question) => {
                const { starCount = 5, leftLabel = '', rightLabel = '' } = question.settings || {};
                const stars = Array.from({ length: Math.max(1, starCount) }, () => '<span class="star">★</span>').join('');
                return `
                    <div class="question-content">
                        <div class="star-rating" id="${question.id}-stars">${stars}</div>
                        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.8rem; color: var(--color-text-secondary);">
                            <span>${escapeHtml(leftLabel)}</span>
                            <span>${escapeHtml(rightLabel)}</span>
                        </div>
                    </div>
                `;
            }
        },
        emoji: {
            label: 'Emoji-Bewertung',
            optionGroups: [
                { key: 'emojis', label: 'Emojis', min: 2, addLabel: 'Emoji hinzufügen', placeholder: '🙂' }
            ],
            defaults: () => ({
                title: 'Emoji-Bewertung',
                description: 'Wie fühlen Sie sich nach der Nutzung unserer App?',
                info: 'Emotionales Stimmungsbild in Sekunden.',
                options: {
                    emojis: ['😡', '😕', '😐', '🙂', '😍']
                },
                settings: {}
            }),
            render: (question) => {
                const emojis = getOptionList(question, 'emojis', ['🙂', '🙃']);
                const content = emojis.map((emoji) => `<div class="emoji">${escapeHtml(emoji)}</div>`).join('');
                return `<div class="question-content"><div class="emoji-rating">${content}</div></div>`;
            }
        },
        slider: {
            label: 'Slider',
            settingsFields: [
                { key: 'min', label: 'Minimum', type: 'number' },
                { key: 'max', label: 'Maximum', type: 'number' },
                { key: 'step', label: 'Schrittweite', type: 'number', min: 1 },
                { key: 'value', label: 'Startwert', type: 'number' },
                { key: 'prefix', label: 'Prefix', type: 'text' },
                { key: 'suffix', label: 'Suffix', type: 'text' }
            ],
            defaults: () => ({
                title: 'Budget-Slider',
                description: 'Welches monatliche Marketingbudget planen Sie ein?',
                info: 'Ideal für Spannweiten und numerische Eingaben.',
                options: {},
                settings: {
                    min: 500,
                    max: 5000,
                    step: 250,
                    value: 2000,
                    prefix: '€',
                    suffix: ''
                }
            }),
            render: (question) => {
                const settings = question.settings || {};
                const minValue = Number.isFinite(settings.min) ? settings.min : 0;
                const maxValue = Number.isFinite(settings.max) ? settings.max : Math.max(minValue + 1, 100);
                const stepValue = Number.isFinite(settings.step) && settings.step > 0 ? settings.step : 1;
                const rawValue = typeof settings.value === 'number' ? settings.value : minValue;
                const safeValue = Math.min(Math.max(rawValue, minValue), maxValue);
                const prefix = settings.prefix || '';
                const suffix = settings.suffix || '';
                return `
                    <div class="question-content">
                        <div class="slider-container">
                            <input type="range" class="slider" min="${minValue}" max="${maxValue}" step="${stepValue}" value="${safeValue}">
                            <div class="slider-value">${escapeHtml(prefix)}${safeValue.toLocaleString()}${escapeHtml(suffix)}</div>
                        </div>
                    </div>
                `;
            }
        },
        'text-short': {
            label: 'Kurztext',
            settingsFields: [
                { key: 'placeholder', label: 'Platzhalter', type: 'text' }
            ],
            defaults: () => ({
                title: 'Kurztext-Frage',
                description: 'Antworten Sie in einem Satz.',
                info: 'Für Namen, kurze Feedbacks oder Stichworte.',
                options: {},
                settings: {
                    placeholder: 'Ihre Antwort'
                }
            }),
            render: (question) => {
                const placeholder = question.settings?.placeholder || 'Antwort eingeben';
                return `
                    <div class="question-content">
                        <input type="text" placeholder="${escapeAttr(placeholder)}" style="width:100%;padding:12px;border-radius:8px;border:1px solid var(--color-border);">
                    </div>
                `;
            }
        },
        'text-long': {
            label: 'Langtext',
            settingsFields: [
                { key: 'placeholder', label: 'Platzhalter', type: 'text' },
                { key: 'rows', label: 'Zeilen', type: 'number', min: 3 }
            ],
            defaults: () => ({
                title: 'Langtext-Frage',
                description: 'Beschreiben Sie Ihre Erfahrung ausführlicher.',
                info: 'Ideal für Testimonials oder ausführliches Feedback.',
                options: {},
                settings: {
                    placeholder: 'Ihre Nachricht',
                    rows: 4
                }
            }),
            render: (question) => {
                const placeholder = question.settings?.placeholder || 'Antwort eingeben';
                const rows = Math.max(Number(question.settings?.rows) || 4, 3);
                return `
                    <div class="question-content">
                        <textarea rows="${rows}" placeholder="${escapeAttr(placeholder)}" style="width:100%;padding:12px;border-radius:8px;border:1px solid var(--color-border);"></textarea>
                    </div>
                `;
            }
        },
        ranking: {
            label: 'Ranking',
            optionGroups: [
                { key: 'items', label: 'Elemente', min: 2, addLabel: 'Element hinzufügen', placeholder: 'Element' }
            ],
            defaults: () => ({
                title: 'Ranking-Frage',
                description: 'Ordnen Sie die folgenden Aspekte nach Wichtigkeit.',
                info: 'Hilft Prioritäten sichtbar zu machen.',
                options: {
                    items: ['Design', 'Preis', 'Qualität', 'Lieferzeit']
                },
                settings: {}
            }),
            render: (question) => {
                const items = getOptionList(question, 'items', ['Eintrag 1', 'Eintrag 2']);
                const content = items.map((item, index) => `
                    <div class="ranking-item">
                        <div class="ranking-number">${index + 1}</div>
                        <div>${escapeHtml(item)}</div>
                    </div>
                `).join('');
                return `<div class="question-content ranking-list">${content}</div>`;
            }
        },
        images: {
            label: 'Bildauswahl',
            optionGroups: [
                { key: 'items', label: 'Optionen', min: 2, addLabel: 'Option hinzufügen', placeholder: 'Beschreibung' }
            ],
            defaults: () => ({
                title: 'Bildauswahl (Image Choice)',
                description: 'Welches Design gefällt Ihnen am besten?',
                info: 'Perfekt für visuelles Feedback oder Prototyping.',
                options: {
                    items: ['Design A', 'Design B', 'Design C', 'Design D']
                },
                settings: {}
            }),
            render: (question) => {
                const items = getOptionList(question, 'items', ['Design A']);
                const content = items.map((item) => `
                    <div class="image-option">
                        <div class="image-placeholder">🖼️</div>
                        <div>${escapeHtml(item)}</div>
                    </div>
                `).join('');
                return `<div class="question-content"><div class="image-options">${content}</div></div>`;
            }
        },
        yesno: {
            label: 'Ja/Nein',
            optionGroups: [
                { key: 'options', label: 'Antworten', min: 2, max: 2, placeholder: 'Antwort' }
            ],
            defaults: () => ({
                title: 'Ja/Nein-Frage',
                description: 'Haben Sie bereits Erfahrung mit diesem Produkt?',
                info: 'Binäre Entscheidungen, Filter-Fragen oder Screening.',
                options: {
                    options: ['Ja', 'Nein']
                },
                settings: {}
            }),
            render: (question) => {
                const options = getOptionList(question, 'options', ['Ja', 'Nein']);
                const name = `${question.id}-yesno`;
                const content = options.map((option, index) => `
                    <div class="option">
                        <input type="radio" name="${name}" id="${name}-${index}">
                        <label for="${name}-${index}">${escapeHtml(option)}</label>
                    </div>
                `).join('');
                return wrapContent(content);
            }
        }
    };

    const state = {
        selectedType: 'multiple-single',
        currentQuestion: null,
        currentIndex: null,
        sections: []
    };

    const elements = {
        typeButtons: document.querySelectorAll('.type-btn'),
        titleInput: document.getElementById('questionTitle'),
        descriptionInput: document.getElementById('questionDescription'),
        infoInput: document.getElementById('questionInfo'),
        optionEditor: document.getElementById('optionEditor'),
        settingsEditor: document.getElementById('settingsEditor'),
        preview: document.getElementById('questionPreview'),
        addSectionBtn: document.getElementById('addSectionBtn'),
        finishBtn: document.getElementById('finishBtn'),
        sectionsContainer: document.getElementById('sectionsContainer'),
        sectionCount: document.getElementById('sectionCount')
    };

    const deepClone = (value) => JSON.parse(JSON.stringify(value ?? {}));

    const createQuestion = (type) => {
        const config = typeConfigs[type];
        const defaults = config?.defaults ? config.defaults() : {};
        return {
            id: generateId(),
            type,
            title: defaults.title || config?.label || 'Frage',
            description: defaults.description || '',
            info: defaults.info || '',
            options: defaults.options ? deepClone(defaults.options) : {},
            settings: defaults.settings ? deepClone(defaults.settings) : {}
        };
    };

    const cloneQuestion = (question) => deepClone(question);

    const generateId = () => `q-${Math.random().toString(36).slice(2, 9)}`;

    const getCurrentConfig = () => typeConfigs[state.currentQuestion?.type || state.selectedType];

    const getOptionList = (question, key, fallback = []) => {
        const list = question?.options?.[key];
        return Array.isArray(list) && list.length ? list : fallback;
    };

    function wrapContent(contentHtml) {
        return `<div class="question-content">${contentHtml}</div>`;
    }

    const escapeHtml = (value) => {
        const str = value == null ? '' : String(value);
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    const escapeAttr = escapeHtml;

    const renderQuestion = (question) => {
        if (!question) return '';
        const config = typeConfigs[question.type];
        if (!config) return '';
        const content = config.render(question);
        const info = question.info ? `<div class="info-box"><strong>Hinweis:</strong> ${escapeHtml(question.info)}</div>` : '';
        return `
            <div class="question-card" data-type="${question.type}">
                <div class="question-header">
                    <h2 class="question-title">${escapeHtml(question.title)}</h2>
                    <p class="question-description">${escapeHtml(question.description)}</p>
                </div>
                ${content}
                ${info}
            </div>
        `;
    };

    const renderPreview = () => {
        if (!state.currentQuestion) {
            elements.preview.innerHTML = '<div class="preview-placeholder">Wählen Sie einen Fragetyp und passen Sie Inhalte an.</div>';
            return;
        }
        elements.preview.innerHTML = renderQuestion(state.currentQuestion);
    };

    const updateTypeButtons = () => {
        elements.typeButtons.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.type === state.selectedType);
        });
    };

    const populateForm = () => {
        if (!state.currentQuestion) return;
        elements.titleInput.value = state.currentQuestion.title || '';
        elements.descriptionInput.value = state.currentQuestion.description || '';
        elements.infoInput.value = state.currentQuestion.info || '';
        renderOptionEditor();
        renderSettingsEditor();
        elements.addSectionBtn.textContent = state.currentIndex === null ? 'Weitere Sektion hinzufügen' : 'Sektion aktualisieren';
    };

    const renderOptionEditor = () => {
        const config = getCurrentConfig();
        elements.optionEditor.innerHTML = '';
        if (!config?.optionGroups?.length) {
            elements.optionEditor.innerHTML = '<p class="muted">Keine editierbaren Optionen für diesen Fragetyp.</p>';
            return;
        }

        const groupsHtml = config.optionGroups.map((group) => {
            let items = state.currentQuestion.options[group.key];
            if (!Array.isArray(items) || !items.length) {
                items = state.currentQuestion.options[group.key] = getOptionList(state.currentQuestion, group.key, [group.placeholder || 'Option']);
            }
            const canAdd = !group.max || items.length < group.max;
            const addBtn = canAdd ? `<button type="button" class="ghost-btn" data-action="add-option" data-group="${group.key}">${group.addLabel || 'Option hinzufügen'}</button>` : '';
            const rows = items.map((value, index) => {
                const canRemove = (items.length > (group.min || 0));
                const removeBtn = canRemove ? `<button type="button" class="icon-btn" data-action="remove-option" data-group="${group.key}" data-index="${index}" aria-label="Option entfernen">&times;</button>` : '';
                return `
                    <div class="option-list-item">
                        <input type="text" value="${escapeAttr(value)}" data-group="${group.key}" data-index="${index}" placeholder="${group.placeholder || 'Option'}">
                        ${removeBtn}
                    </div>
                `;
            }).join('');
            return `
                <div class="option-group" data-group="${group.key}">
                    <div class="option-group-header">
                        <span>${group.label}</span>
                        ${addBtn}
                    </div>
                    <div class="option-list">
                        ${rows}
                    </div>
                </div>
            `;
        }).join('');

        elements.optionEditor.innerHTML = groupsHtml;
    };

    const renderSettingsEditor = () => {
        const config = getCurrentConfig();
        elements.settingsEditor.innerHTML = '';
        if (!config?.settingsFields?.length) {
            elements.settingsEditor.innerHTML = '<p class="muted">Keine zusätzlichen Einstellungen für diesen Typ erforderlich.</p>';
            return;
        }

        const fields = config.settingsFields.map((field) => {
            const value = state.currentQuestion.settings?.[field.key];
            const attrs = [
                field.type ? `type="${field.type}"` : 'type="text"',
                `data-setting="${field.key}"`,
                field.min !== undefined ? `min="${field.min}"` : '',
                field.max !== undefined ? `max="${field.max}"` : ''
            ].filter(Boolean).join(' ');
            return `
                <div class="setting-field">
                    <label>${field.label}</label>
                    <input ${attrs} value="${escapeAttr(value ?? '')}" placeholder="${field.placeholder || ''}">
                </div>
            `;
        }).join('');

        elements.settingsEditor.innerHTML = fields;
    };

    const handleOptionEditorClick = (event) => {
        const action = event.target.dataset.action;
        if (!action) return;
        const groupKey = event.target.dataset.group;
        const group = getCurrentConfig()?.optionGroups?.find((g) => g.key === groupKey);
        if (!group) return;
        const items = state.currentQuestion.options[groupKey] || [];

        if (action === 'add-option') {
            const base = group.placeholder || 'Option';
            items.push(`${base} ${items.length + 1}`);
            state.currentQuestion.options[groupKey] = items;
            renderOptionEditor();
            renderPreview();
            return;
        }

        if (action === 'remove-option') {
            const index = Number(event.target.dataset.index);
            if (items.length <= (group.min || 0)) return;
            items.splice(index, 1);
            state.currentQuestion.options[groupKey] = items;
            renderOptionEditor();
            renderPreview();
        }
    };

    const handleOptionEditorInput = (event) => {
        const { group, index } = event.target.dataset;
        if (group == null || index == null) return;
        const items = state.currentQuestion.options[group] || [];
        items[Number(index)] = event.target.value;
        state.currentQuestion.options[group] = items;
        renderPreview();
    };

    const handleSettingsInput = (event) => {
        const key = event.target.dataset.setting;
        if (!key) return;
        const field = getCurrentConfig()?.settingsFields?.find((item) => item.key === key);
        if (!state.currentQuestion.settings) state.currentQuestion.settings = {};
        let value = event.target.value;
        if (field?.type === 'number') {
            value = value === '' ? undefined : Number(value);
        }
        state.currentQuestion.settings[key] = value;
        renderPreview();
    };

    const addOrUpdateSection = () => {
        if (!state.currentQuestion) return;
        const validation = validateQuestion(state.currentQuestion);
        if (!validation.valid) {
            alert(validation.message);
            return;
        }
        const payload = cloneQuestion(state.currentQuestion);
        if (state.currentIndex === null) {
            state.sections.push(payload);
        } else {
            state.sections[state.currentIndex] = payload;
        }
        state.currentIndex = null;
        state.currentQuestion = createQuestion(state.selectedType);
        populateForm();
        renderPreview();
        renderSectionsList();
    };

    const validateQuestion = (question) => {
        if (!question.title || !question.title.trim()) {
            return { valid: false, message: 'Bitte geben Sie einen Fragetitel ein.' };
        }
        const config = typeConfigs[question.type];
        if (config?.optionGroups) {
            for (const group of config.optionGroups) {
                const values = (question.options?.[group.key] || []).filter((value) => value && value.trim());
                if ((group.min || 0) && values.length < group.min) {
                    return { valid: false, message: `Bitte geben Sie mindestens ${group.min} Einträge für "${group.label}" an.` };
                }
            }
        }
        return { valid: true };
    };

    const renderSectionsList = () => {
        const { sections } = state;
        elements.sectionCount.textContent = sections.length;
        if (!sections.length) {
            elements.sectionsContainer.innerHTML = `
                <div class="empty-state">
                    Noch keine Sektionen hinzugefügt. Erstellen Sie Ihre erste Sektion über den Editor.
                </div>
            `;
            return;
        }

        const cards = sections.map((question, index) => `
            <div class="section-card" data-index="${index}">
                ${renderQuestion(question)}
                <div class="section-card-actions">
                    <button class="ghost-btn" data-action="edit-section" data-index="${index}">Bearbeiten</button>
                    <button class="ghost-btn danger" data-action="delete-section" data-index="${index}">Entfernen</button>
                </div>
            </div>
        `).join('');
        elements.sectionsContainer.innerHTML = cards;
    };

    const handleSectionAction = (event) => {
        const action = event.target.dataset.action;
        if (!action) return;
        const index = Number(event.target.dataset.index);
        if (Number.isNaN(index)) return;

        if (action === 'edit-section') {
            loadSectionForEditing(index);
        }

        if (action === 'delete-section') {
            deleteSection(index);
        }
    };

    const loadSectionForEditing = (index) => {
        const question = state.sections[index];
        if (!question) return;
        state.currentIndex = index;
        state.selectedType = question.type;
        state.currentQuestion = cloneQuestion(question);
        updateTypeButtons();
        populateForm();
        renderPreview();
    };

    const deleteSection = (index) => {
        state.sections.splice(index, 1);
        renderSectionsList();
    };

    const finishEditing = () => {
        if (!state.sections.length) {
            alert('Sie haben noch keine Sektionen erstellt. Fügen Sie mindestens eine Sektion hinzu.');
            return;
        }
        const summary = state.sections
            .map((section, index) => `${index + 1}. ${section.title} (${typeConfigs[section.type].label})`)
            .join('\n');
        alert(`Sie haben ${state.sections.length} Sektionen erstellt:\n\n${summary}`);
    };

    const handleTypeSelection = (type) => {
        state.selectedType = type;
        if (state.currentIndex !== null) {
            state.currentIndex = null;
        }
        state.currentQuestion = createQuestion(type);
        updateTypeButtons();
        populateForm();
        renderPreview();
    };

    const init = () => {
        state.currentQuestion = createQuestion(state.selectedType);
        updateTypeButtons();
        populateForm();
        renderPreview();
        renderSectionsList();

        elements.typeButtons.forEach((btn) => {
            btn.addEventListener('click', () => handleTypeSelection(btn.dataset.type));
        });

        elements.titleInput.addEventListener('input', (event) => {
            state.currentQuestion.title = event.target.value;
            renderPreview();
        });

        elements.descriptionInput.addEventListener('input', (event) => {
            state.currentQuestion.description = event.target.value;
            renderPreview();
        });

        elements.infoInput.addEventListener('input', (event) => {
            state.currentQuestion.info = event.target.value;
            renderPreview();
        });

        elements.optionEditor.addEventListener('click', handleOptionEditorClick);
        elements.optionEditor.addEventListener('input', handleOptionEditorInput);
        elements.settingsEditor.addEventListener('input', handleSettingsInput);
        elements.addSectionBtn.addEventListener('click', addOrUpdateSection);
        elements.finishBtn.addEventListener('click', finishEditing);
        elements.sectionsContainer.addEventListener('click', handleSectionAction);
    };

    init();
})();
