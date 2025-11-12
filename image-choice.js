(() => {
    const OPTION_EVENT = 'umfrage:optionEditorRendered';
    const stateRef = {
        state: null,
        elements: null,
        refreshPreview: () => {},
        refreshOptionEditor: () => {}
    };
    let handlersBound = false;

    const fileToDataUrl = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error('Datei konnte nicht gelesen werden.'));
        reader.readAsDataURL(file);
    });

    const getActiveImageQuestion = () => {
        const question = stateRef.state?.currentQuestion;
        return question?.type === 'images' ? question : null;
    };

    const ensureImageStore = (question) => {
        if (!question) return [];
        if (!question.settings) question.settings = {};
        if (!Array.isArray(question.settings.imageChoices)) {
            question.settings.imageChoices = [];
        }
        const targetLength = Array.isArray(question.options?.items) ? question.options.items.length : 0;
        while (question.settings.imageChoices.length < targetLength) {
            question.settings.imageChoices.push(null);
        }
        if (question.settings.imageChoices.length > targetLength) {
            question.settings.imageChoices.length = targetLength;
        }
        return question.settings.imageChoices;
    };

    const setPreviewContent = (node, imageEntry) => {
        if (!node) return;
        node.innerHTML = '';
        if (imageEntry?.data) {
            const img = document.createElement('img');
            img.src = imageEntry.data;
            img.alt = 'Ausgewähltes Bild';
            node.appendChild(img);
            return;
        }
        const placeholder = document.createElement('div');
        placeholder.className = 'image-upload-placeholder';
        placeholder.textContent = 'Noch kein Bild';
        node.appendChild(placeholder);
    };

    const buildControls = (index, imageEntry) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'image-upload-controls';
        wrapper.dataset.imageIndex = String(index);

        const preview = document.createElement('div');
        preview.className = 'image-upload-preview';
        preview.dataset.imageIndex = String(index);
        setPreviewContent(preview, imageEntry);

        const meta = document.createElement('div');
        meta.className = 'image-upload-meta';

        const name = document.createElement('div');
        name.className = 'image-upload-name';
        name.dataset.imageIndex = String(index);
        name.textContent = imageEntry?.name || 'Kein Bild ausgewählt';

        const buttonRow = document.createElement('div');
        buttonRow.className = 'image-upload-buttons';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.className = 'image-upload-input';
        fileInput.dataset.imageIndex = String(index);
        fileInput.hidden = true;

        const chooseBtn = document.createElement('button');
        chooseBtn.type = 'button';
        chooseBtn.className = 'ghost-btn image-upload-choose';
        chooseBtn.dataset.imageIndex = String(index);
        chooseBtn.textContent = 'Bild auswählen';

        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'ghost-btn image-upload-clear';
        clearBtn.dataset.imageIndex = String(index);
        clearBtn.textContent = 'Bild entfernen';
        clearBtn.disabled = !imageEntry?.data;

        buttonRow.append(fileInput, chooseBtn, clearBtn);
        meta.append(name, buttonRow);
        wrapper.append(preview, meta);

        return wrapper;
    };

    const updateControlState = (index) => {
        const question = getActiveImageQuestion();
        if (!question || !stateRef.elements?.optionEditor) return;
        const store = ensureImageStore(question);
        const data = store[index];
        const preview = stateRef.elements.optionEditor.querySelector(`.image-upload-preview[data-image-index="${index}"]`);
        const name = stateRef.elements.optionEditor.querySelector(`.image-upload-name[data-image-index="${index}"]`);
        const clearBtn = stateRef.elements.optionEditor.querySelector(`.image-upload-clear[data-image-index="${index}"]`);
        setPreviewContent(preview, data);
        if (name) {
            name.textContent = data?.name || 'Kein Bild ausgewählt';
        }
        if (clearBtn) {
            clearBtn.disabled = !data?.data;
        }
    };

    const renderEnhancements = () => {
        const question = getActiveImageQuestion();
        if (!question || !stateRef.elements?.optionEditor) return;
        const group = stateRef.elements.optionEditor.querySelector('.option-group[data-group="items"]');
        if (!group) return;
        const rows = Array.from(group.querySelectorAll('.option-list-item'));
        const store = ensureImageStore(question);
        rows.forEach((row, index) => {
            row.classList.add('option-list-item--with-image');
            const existingControls = row.querySelector('.image-upload-controls');
            if (existingControls) {
                existingControls.remove();
            }
            row.appendChild(buildControls(index, store[index]));
        });
    };

    const clearImageAt = (index) => {
        const question = getActiveImageQuestion();
        if (!question) return;
        const store = ensureImageStore(question);
        if (index < 0 || index >= store.length) return;
        store[index] = null;
        updateControlState(index);
        stateRef.refreshPreview();
    };

    const handleFileSelection = async (event) => {
        const input = event.target;
        if (!input.classList.contains('image-upload-input')) return;
        const question = getActiveImageQuestion();
        if (!question) return;
        const index = Number(input.dataset.imageIndex);
        if (Number.isNaN(index)) return;
        const file = input.files && input.files[0];
        if (!file) {
            clearImageAt(index);
            return;
        }
        try {
            const dataUrl = await fileToDataUrl(file);
            const store = ensureImageStore(question);
            store[index] = {
                data: dataUrl,
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified
            };
            updateControlState(index);
            stateRef.refreshPreview();
        } catch (error) {
            console.error('Bild konnte nicht gelesen werden.', error);
            clearImageAt(index);
        } finally {
            input.value = '';
        }
    };

    const handleOptionEditorClick = (event) => {
        const question = getActiveImageQuestion();
        if (!question) return;
        const actionBtn = event.target.closest('button[data-action]');
        if (actionBtn) {
            const { action, group } = actionBtn.dataset;
            if (group === 'items') {
                const store = ensureImageStore(question);
                if (action === 'add-option') {
                    store.push(null);
                }
                if (action === 'remove-option') {
                    const index = Number(actionBtn.dataset.index);
                    if (!Number.isNaN(index)) {
                        store.splice(index, 1);
                    }
                }
            }
        }

        const chooseBtn = event.target.closest('.image-upload-choose');
        if (chooseBtn) {
            event.preventDefault();
            const index = Number(chooseBtn.dataset.imageIndex);
            const input = stateRef.elements?.optionEditor?.querySelector(`.image-upload-input[data-image-index="${index}"]`);
            input?.click();
            return;
        }

        const clearBtn = event.target.closest('.image-upload-clear');
        if (clearBtn) {
            event.preventDefault();
            const index = Number(clearBtn.dataset.imageIndex);
            clearImageAt(index);
        }
    };

    const handleOptionEditorEvent = (detail) => {
        if (!detail?.state || !detail?.elements) return;
        stateRef.state = detail.state;
        stateRef.elements = detail.elements;
        stateRef.refreshPreview = detail.refreshPreview || (() => {});
        stateRef.refreshOptionEditor = detail.refreshOptionEditor || (() => {});
        if (!handlersBound && detail.elements.optionEditor) {
            detail.elements.optionEditor.addEventListener('click', handleOptionEditorClick);
            detail.elements.optionEditor.addEventListener('change', handleFileSelection);
            handlersBound = true;
        }
        renderEnhancements();
    };

    document.addEventListener(OPTION_EVENT, (event) => {
        handleOptionEditorEvent(event.detail);
    });

    if (typeof window !== 'undefined' && window.__umfrageLastOptionEditorDetail) {
        handleOptionEditorEvent(window.__umfrageLastOptionEditorDetail);
    }
})();
