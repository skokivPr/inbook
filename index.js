document.addEventListener('DOMContentLoaded', () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let interval = null;

    const headerTitleElement = document.getElementById("header-title");

    function triggerGlitchAnimation(targetElement) {
        // Nie uruchamiaj animacji jeśli są wyłączone
        if (!appSettings.animations) return;

        let iteration = 0;
        const originalHTML = targetElement.innerHTML;
        const categoryNameSpan = targetElement.querySelector('.category-name');
        if (!categoryNameSpan) return;

        const categoryText = categoryNameSpan.textContent;
        const prefix = `Znaleziono: <span class="category-name">${categoryText}</span> zakładek`;

        clearInterval(interval);

        interval = setInterval(() => {
            let animatedText = categoryText
                .split("")
                .map((letter, index) => {
                    if (index < iteration) {
                        return categoryText[index];
                    }
                    if (letter === " ") return " ";
                    return letters[Math.floor(Math.random() * 26)];
                })
                .join("");

            targetElement.innerHTML = `Znaleziono: <span class="category-name">${animatedText}</span> zakładek`;

            if (iteration >= categoryText.length) {
                clearInterval(interval);
                targetElement.innerHTML = originalHTML;
            }
            iteration += 1 / 3;
        }, 30);
    }

    headerTitleElement.onmouseover = event => triggerGlitchAnimation(event.target);

    // Elementy DOM
    const themeToggle = document.getElementById('theme-toggle');
    const root = document.documentElement;
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const gridContainer = document.getElementById('grid-container');
    const headerTitle = document.getElementById('header-title');
    const fileInput = document.getElementById('bookmarks-file');
    const importBtn = document.getElementById('import-btn');
    const clearBtn = document.getElementById('clear-btn');
    const fileNameDisplay = document.getElementById('file-name');
    const placeholder = document.getElementById('placeholder');
    const categorySelect = document.getElementById('category-select');
    const manageCategoriesBtn = document.getElementById('manage-categories-btn');
    const dragHint = document.getElementById('drag-hint');
    const settingsBtn = document.getElementById('settings-btn');
    const importToggleBtn = document.getElementById('import-toggle-btn');
    const categoriesBtn = document.getElementById('categories-btn');
    const searchBtn = document.getElementById('search-btn');
    const statsBtn = document.getElementById('stats-btn');
    const toolsBtn = document.getElementById('tools-btn');
    const importPanel = document.getElementById('import-panel');

    // Funkcje do zarządzania motywem
    function setTheme(theme) {
        if (theme === 'dark') {
            root.setAttribute('theme', 'dark');
            sunIcon.classList.add('icon-hidden');
            moonIcon.classList.remove('icon-hidden');
            localStorage.setItem('app_theme', 'dark');
        } else {
            root.removeAttribute('theme');
            sunIcon.classList.remove('icon-hidden');
            moonIcon.classList.add('icon-hidden');
            localStorage.setItem('app_theme', 'light');
        }
    }

    function loadSavedTheme() {
        const savedTheme = localStorage.getItem('app_theme');
        setTheme(savedTheme || 'light');
    }

    loadSavedTheme();

    themeToggle.addEventListener('click', () => {
        const currentTheme = root.getAttribute('theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // Funkcje do zarządzania lokalnym zapisem zakładek
    function saveBookmarksToLocal(bookmarks) {
        try {
            const bookmarksData = {
                bookmarks: bookmarks,
                timestamp: new Date().toISOString(),
                count: bookmarks.length
            };
            localStorage.setItem('saved_bookmarks', JSON.stringify(bookmarksData));
            console.log(`Zapisano ${bookmarks.length} zakładek do localStorage`);
        } catch (error) {
            console.error('Błąd podczas zapisywania zakładek:', error);
        }
    }

    function loadBookmarksFromLocal() {
        try {
            const savedData = localStorage.getItem('saved_bookmarks');
            if (savedData) {
                const bookmarksData = JSON.parse(savedData);
                return bookmarksData.bookmarks || [];
            }
        } catch (error) {
            console.error('Błąd podczas ładowania zakładek:', error);
        }
        return [];
    }

    function clearLocalBookmarks() {
        try {
            localStorage.removeItem('saved_bookmarks');
            console.log('Wyczyszczono lokalne zakładki');
        } catch (error) {
            console.error('Błąd podczas czyszczenia zakładek:', error);
        }
    }

    // Ładowanie zapisanych zakładek przy starcie
    function loadSavedBookmarks() {
        const savedBookmarks = loadBookmarksFromLocal();
        if (savedBookmarks.length > 0) {
            // Dodaj ID do starych zakładek jeśli nie mają
            savedBookmarks.forEach(bookmark => {
                if (!bookmark.id) {
                    bookmark.id = Date.now() + Math.random().toString(36).substr(2, 9);
                }
                if (!bookmark.category) {
                    bookmark.category = 'Bez kategorii';
                }
            });
            displayLinks(savedBookmarks);
            const newText = `Znaleziono: <span class="category-name">${savedBookmarks.length}</span> zakładek`;
            headerTitle.innerHTML = newText;
            setTimeout(() => triggerGlitchAnimation(headerTitle), 100);
        }
    }

    // Zmienne globalne dla kategorii
    let currentBookmarks = [];
    let categories = ['Wszystkie', 'Bez kategorii', 'Praca', 'Rozrywka', 'Edukacja', 'Narzędzia'];
    let selectedCategory = 'Wszystkie';

    // Zmienne globalne dla drag and drop
    let draggedElement = null;
    let draggedIndex = -1;

    // Ustawienia aplikacji
    let appSettings = {
        dragAndDrop: true,
        animations: true,
        compactView: false,
        autoRefresh: true,
        showDescriptions: true,
        autoSave: true,
        advancedFavicons: true
    };

    // Ładuj kategorie przy starcie
    categories = getCategories();

    // Funkcje zarządzania ustawieniami
    function loadSettings() {
        try {
            const saved = localStorage.getItem('app_settings');
            if (saved) {
                appSettings = { ...appSettings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Błąd podczas ładowania ustawień:', error);
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem('app_settings', JSON.stringify(appSettings));
            console.log('Ustawienia zapisane');
        } catch (error) {
            console.error('Błąd podczas zapisywania ustawień:', error);
        }
    }

    function applySetting(settingName, value) {
        appSettings[settingName] = value;
        saveSettings();

        // Zastosuj ustawienie
        switch (settingName) {
            case 'compactView':
                document.body.classList.toggle('compact-view', value);
                break;
            case 'animations':
                document.body.classList.toggle('no-animations', !value);
                break;
            case 'showDescriptions':
                document.body.classList.toggle('hide-descriptions', !value);
                break;
            case 'dragAndDrop':
                // Aktualizuj widoczność hintu drag and drop
                if (selectedCategory === 'Wszystkie' && value) {
                    dragHint.classList.remove('hidden');
                } else {
                    dragHint.classList.add('hidden');
                }
                break;
        }

        // Odśwież widok jeśli potrzeba
        if (['compactView', 'showDescriptions', 'dragAndDrop', 'advancedFavicons'].includes(settingName) && currentBookmarks.length > 0) {
            displayLinks(currentBookmarks);
        }
    }

    function openSettingsPanel() {
        const modal = document.createElement('div');
        modal.className = 'category-modal settings-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-sliders-h"></i> Ustawienia</h3>
                    <button class="close-btn" onclick="this.closest('.category-modal').remove()">×</button>
                </div>
                <div class="modal-body settings-body">
                    <div class="setting-group">
                        <h4>Interfejs</h4>
                        <div class="setting-item">
                            <div class="setting-info">
                                <label>Kompaktowy widok</label>
                                <span>Mniejsze karty zakładek</span>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${appSettings.compactView ? 'checked' : ''} data-setting="compactView">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <label>Animacje</label>
                                <span>Efekty przejść i glitch</span>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${appSettings.animations ? 'checked' : ''} data-setting="animations">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <label>Opisy zakładek</label>
                                <span>Pokazuj opisy pod tytułami</span>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${appSettings.showDescriptions ? 'checked' : ''} data-setting="showDescriptions">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="setting-group">
                        <h4>Funkcjonalność</h4>
                        <div class="setting-item">
                            <div class="setting-info">
                                <label>Przeciąganie</label>
                                <span>Zmiana kolejności przez drag & drop</span>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${appSettings.dragAndDrop ? 'checked' : ''} data-setting="dragAndDrop">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <label>Auto-odświeżanie</label>
                                <span>Automatyczne ładowanie favicons</span>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${appSettings.autoRefresh ? 'checked' : ''} data-setting="autoRefresh">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <label>Auto-zapis</label>
                                <span>Automatyczny zapis do localStorage</span>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${appSettings.autoSave ? 'checked' : ''} data-setting="autoSave">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <label>Zaawansowane Favicon</label>
                                <span>Wielokrotne próby ładowania ikon z różnych źródeł</span>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${appSettings.advancedFavicons ? 'checked' : ''} data-setting="advancedFavicons">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-btn" onclick="this.closest('.category-modal').remove()">Zamknij</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Dodaj możliwość zamykania przez kliknięcie w tło
        addModalBackdropClose(modal);

        // Dodaj efekty narożników do przycisków modal
        modal.querySelectorAll('.save-btn, .cancel-btn').forEach(btn => {
            addCornerEffects(btn);
        });

        // Event listeners dla przełączników
        const toggles = modal.querySelectorAll('.toggle-switch input');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const settingName = e.target.dataset.setting;
                const value = e.target.checked;
                applySetting(settingName, value);
            });
        });
    }

    // Załaduj ustawienia przy starcie
    loadSettings();

    // Zastosuj ustawienia do interfejsu
    document.body.classList.toggle('compact-view', appSettings.compactView);
    document.body.classList.toggle('no-animations', !appSettings.animations);
    document.body.classList.toggle('hide-descriptions', !appSettings.showDescriptions);

    // Funkcje drag and drop
    function handleDragStart(e, linkId) {
        draggedElement = e.currentTarget;
        draggedIndex = currentBookmarks.findIndex(bookmark => bookmark.id === linkId);
        e.currentTarget.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
        e.dataTransfer.setData('text/plain', linkId);
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (e.currentTarget !== draggedElement) {
            e.currentTarget.classList.add('drag-over');
        }
    }

    function handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (e.preventDefault) {
            e.preventDefault();
        }

        if (draggedElement !== e.currentTarget) {
            const dropLinkId = e.currentTarget.dataset.linkId;
            const dropIndex = currentBookmarks.findIndex(bookmark => bookmark.id === dropLinkId);

            if (draggedIndex !== -1 && dropIndex !== -1) {
                // Zmiana kolejności w tablicy
                const draggedBookmark = currentBookmarks[draggedIndex];
                currentBookmarks.splice(draggedIndex, 1);
                currentBookmarks.splice(dropIndex, 0, draggedBookmark);

                // Zapisz nową kolejność
                saveBookmarksToLocal(currentBookmarks);

                // Odśwież widok
                displayLinks(currentBookmarks);
            }
        }

        e.currentTarget.classList.remove('drag-over');
        return false;
    }

    function handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');

        // Wyczyść wszystkie drag-over classes
        const allCells = document.querySelectorAll('.grid-cell');
        allCells.forEach(cell => cell.classList.remove('drag-over'));

        draggedElement = null;
        draggedIndex = -1;
    }

    // Funkcja pomocnicza do dodawania efektów narożników
    function addCornerEffects(element) {
        const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        corners.forEach(cornerClass => {
            const corner = document.createElement('div');
            corner.className = `corner ${cornerClass}`;
            element.appendChild(corner);
        });
    }

    // Funkcja pomocnicza do zamykania modali przez kliknięcie w tło
    function addModalBackdropClose(modal) {
        modal.addEventListener('click', (e) => {
            // Sprawdź czy kliknięcie było na overlay (nie na modal-content)
            if (e.target === modal || !e.target.closest('.modal-content')) {
                modal.remove();
            }
        });
    }

    // Załaduj zapisane zakładki przy starcie
    loadSavedBookmarks();

    // Funkcje do zarządzania kategoriami
    function getCategories() {
        const saved = localStorage.getItem('bookmark_categories');
        if (saved) {
            return JSON.parse(saved);
        }
        return categories;
    }

    function saveCategories() {
        localStorage.setItem('bookmark_categories', JSON.stringify(categories));
    }

    function addCategory(categoryName) {
        if (!categories.includes(categoryName) && categoryName.trim() !== '') {
            categories.push(categoryName.trim());
            saveCategories();
            return true;
        }
        return false;
    }

    function removeCategory(categoryName) {
        if (!['Wszystkie', 'Bez kategorii'].includes(categoryName)) {
            categories = categories.filter(cat => cat !== categoryName);
            // Przenieś zakładki z usuniętej kategorii do "Bez kategorii"
            currentBookmarks.forEach(bookmark => {
                if (bookmark.category === categoryName) {
                    bookmark.category = 'Bez kategorii';
                }
            });
            saveCategories();
            saveBookmarksToLocal(currentBookmarks);
            return true;
        }
        return false;
    }

    // Funkcja do otwierania edytora kategorii
    function openCategoryEditor(bookmark) {
        const modal = document.createElement('div');
        modal.className = 'category-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Zmień kategorię</h3>
                    <button class="close-btn" onclick="this.closest('.category-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p><strong>${bookmark.text}</strong></p>
                    <p>Obecna kategoria: <span class="current-category">${bookmark.category || 'Bez kategorii'}</span></p>
                    <select class="category-select">
                        ${categories.filter(cat => cat !== 'Wszystkie').map(cat =>
            `<option value="${cat}" ${(bookmark.category || 'Bez kategorii') === cat ? 'selected' : ''}>${cat}</option>`
        ).join('')}
                    </select>
                    <div class="new-category-section">
                        <input type="text" class="new-category-input" placeholder="Nowa kategoria...">
                        <button class="add-category-btn">Dodaj</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="save-btn">Zapisz</button>
                    <button class="cancel-btn" onclick="this.closest('.category-modal').remove()">Anuluj</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Dodaj możliwość zamykania przez kliknięcie w tło
        addModalBackdropClose(modal);

        // Dodaj efekty narożników do przycisków modal
        modal.querySelectorAll('.add-category-btn, .save-btn, .cancel-btn').forEach(btn => {
            addCornerEffects(btn);
        });

        // Event listeners dla modalu
        const select = modal.querySelector('.category-select');
        const newCategoryInput = modal.querySelector('.new-category-input');
        const addCategoryBtn = modal.querySelector('.add-category-btn');
        const saveBtn = modal.querySelector('.save-btn');

        addCategoryBtn.onclick = () => {
            const newCat = newCategoryInput.value.trim();
            if (newCat && addCategory(newCat)) {
                const option = document.createElement('option');
                option.value = newCat;
                option.textContent = newCat;
                option.selected = true;
                select.appendChild(option);
                newCategoryInput.value = '';
            }
        };

        saveBtn.onclick = () => {
            const selectedCategory = select.value;
            bookmark.category = selectedCategory;
            saveBookmarksToLocal(currentBookmarks);
            displayLinks(currentBookmarks);
            updateCategoryDropdown();
            modal.remove();
        };
    }

    // Funkcje UI dla kategorii
    function updateCategoryDropdown() {
        categorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            if (category === selectedCategory) {
                option.selected = true;
            }
            categorySelect.appendChild(option);
        });
    }

    function filterByCategory() {
        selectedCategory = categorySelect.value;
        displayLinks(currentBookmarks);

        // Pokaż/ukryj hint dla drag and drop
        if (selectedCategory === 'Wszystkie' && appSettings.dragAndDrop) {
            dragHint.classList.remove('hidden');
        } else {
            dragHint.classList.add('hidden');
        }

        // Aktualizuj nagłówek
        const filteredLinks = filterLinksByCategory(currentBookmarks, selectedCategory);
        const newText = selectedCategory === 'Wszystkie' ?
            `Znaleziono: <span class="category-name">${currentBookmarks.length}</span> zakładek` :
            `Kategoria: <span class="category-name">${selectedCategory}</span> (${filteredLinks.length} zakładek)`;
        headerTitle.innerHTML = newText;
    }

    // Event listenery dla kategorii
    categorySelect.addEventListener('change', filterByCategory);

    // Funkcje zarządzania sidebar
    let activePanel = null;

    function togglePanel(panel, btn) {
        if (activePanel === panel) {
            // Zamknij panel
            panel.classList.add('hidden');
            btn.classList.remove('active');
            activePanel = null;
        } else {
            // Zamknij poprzedni panel
            if (activePanel) {
                activePanel.classList.add('hidden');
                document.querySelector('.icon-btn.active')?.classList.remove('active');
            }
            // Otwórz nowy panel
            panel.classList.remove('hidden');
            btn.classList.add('active');
            activePanel = panel;
        }
    }

    function closeAllPanels() {
        if (activePanel) {
            activePanel.classList.add('hidden');
            document.querySelector('.icon-btn.active')?.classList.remove('active');
            activePanel = null;
        }
    }

    // Event listenery dla przycisków sidebar
    importToggleBtn.addEventListener('click', () => togglePanel(importPanel, importToggleBtn));
    categoriesBtn.addEventListener('click', () => { closeAllPanels(); openCategoriesManager(); });
    searchBtn.addEventListener('click', () => { closeAllPanels(); openSearchPanel(); });
    statsBtn.addEventListener('click', () => { closeAllPanels(); openStatsPanel(); });
    toolsBtn.addEventListener('click', () => { closeAllPanels(); openToolsPanel(); });
    settingsBtn.addEventListener('click', () => { closeAllPanels(); openSettingsPanel(); });

    // Nowe funkcje modalnych paneli
    function openCategoriesManager() {
        // Używamy istniejącej funkcji zarządzania kategoriami
        manageCategoriesBtn.click();
    }

    function openSearchPanel() {
        const modal = document.createElement('div');
        modal.className = 'category-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-search"></i> Szukaj w zakładkach</h3>
                    <button class="close-btn" onclick="this.closest('.category-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="search-section">
                        <input type="text" id="search-input" placeholder="Wpisz frazę do wyszukania..." class="search-input">
                        <div class="search-options">
                            <label><input type="checkbox" id="search-titles" checked> Szukaj w tytułach</label>
                            <label><input type="checkbox" id="search-urls"> Szukaj w URL-ach</label>
                            <label><input type="checkbox" id="search-categories"> Szukaj w kategoriach</label>
                        </div>
                        <div id="search-results" class="search-results"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-btn" onclick="this.closest('.category-modal').remove()">Zamknij</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Dodaj możliwość zamykania przez kliknięcie w tło
        addModalBackdropClose(modal);

        // Dodaj efekty narożników do przycisków modal
        modal.querySelectorAll('.cancel-btn').forEach(btn => {
            addCornerEffects(btn);
        });

        // Funkcja wyszukiwania
        const searchInput = modal.querySelector('#search-input');
        const searchResults = modal.querySelector('#search-results');
        const searchTitles = modal.querySelector('#search-titles');
        const searchUrls = modal.querySelector('#search-urls');
        const searchCategories = modal.querySelector('#search-categories');

        function performSearch() {
            const query = searchInput.value.toLowerCase().trim();
            if (!query) {
                searchResults.innerHTML = '<p>Wpisz frazę do wyszukania</p>';
                return;
            }

            const results = currentBookmarks.filter(bookmark => {
                let matches = false;
                if (searchTitles.checked && bookmark.text.toLowerCase().includes(query)) matches = true;
                if (searchUrls.checked && bookmark.href.toLowerCase().includes(query)) matches = true;
                if (searchCategories.checked && (bookmark.category || 'Bez kategorii').toLowerCase().includes(query)) matches = true;
                return matches;
            });

            if (results.length === 0) {
                searchResults.innerHTML = '<p>Nie znaleziono wyników</p>';
                return;
            }

            searchResults.innerHTML = results.map(bookmark => `
                <div class="search-result-item">
                    <div class="result-title">${bookmark.text}</div>
                    <div class="result-url">${getShortUrl(bookmark.href)}</div>
                    <div class="result-category">${bookmark.category || 'Bez kategorii'}</div>
                </div>
            `).join('');
        }

        searchInput.addEventListener('input', performSearch);
        [searchTitles, searchUrls, searchCategories].forEach(cb => cb.addEventListener('change', performSearch));
    }

    function openStatsPanel() {
        const stats = {
            total: currentBookmarks.length,
            categories: categories.filter(cat => !['Wszystkie', 'Bez kategorii'].includes(cat)).length + 1,
            byCategory: {}
        };

        categories.forEach(cat => {
            if (cat !== 'Wszystkie') {
                const count = currentBookmarks.filter(bookmark => (bookmark.category || 'Bez kategorii') === cat).length;
                stats.byCategory[cat] = count;
            }
        });

        const modal = document.createElement('div');
        modal.className = 'category-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-chart-bar"></i> Statystyki</h3>
                    <button class="close-btn" onclick="this.closest('.category-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="stats-section">
                        <div class="stat-item">
                            <div class="stat-value">${stats.total}</div>
                            <div class="stat-label">Łączna liczba zakładek</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${stats.categories}</div>
                            <div class="stat-label">Liczba kategorii</div>
                        </div>
                        <div class="category-stats">
                            <h4>Zakładki w kategoriach:</h4>
                            ${Object.entries(stats.byCategory).map(([cat, count]) => `
                                <div class="category-stat">
                                    <span class="cat-name">${cat}</span>
                                    <span class="cat-count">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-btn" onclick="this.closest('.category-modal').remove()">Zamknij</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Dodaj możliwość zamykania przez kliknięcie w tło
        addModalBackdropClose(modal);

        // Dodaj efekty narożników do przycisków modal
        modal.querySelectorAll('.cancel-btn').forEach(btn => {
            addCornerEffects(btn);
        });
    }

    function openToolsPanel() {
        const modal = document.createElement('div');
        modal.className = 'category-modal tools-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-toolbox"></i> Narzędzia</h3>
                    <button class="close-btn" onclick="this.closest('.category-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="tools-section">
                        <div class="tool-group">
                            <h4><i class="fas fa-download"></i> Export/Import</h4>
                            <button class="tool-btn" id="export-json-btn">
                                <i class="fas fa-file-code"></i> Eksportuj jako JSON
                            </button>
                            <button class="tool-btn" id="export-html-btn">
                                <i class="fas fa-file-export"></i> Eksportuj jako HTML
                            </button>
                            <button class="tool-btn" id="import-json-btn">
                                <i class="fas fa-file-import"></i> Importuj z JSON
                            </button>
                        </div>
                        <div class="tool-group">
                            <h4><i class="fas fa-tools"></i> Narzędzia zarządzania</h4>
                            <button class="tool-btn" id="duplicate-finder-btn">
                                <i class="fas fa-copy"></i> Znajdź duplikaty
                            </button>
                            <button class="tool-btn" id="broken-links-btn">
                                <i class="fas fa-unlink"></i> Sprawdź zepsute linki
                            </button>
                            <button class="tool-btn" id="sort-bookmarks-btn">
                                <i class="fas fa-sort-alpha-down"></i> Sortuj alfabetycznie
                            </button>
                        </div>
                        <div class="tool-group">
                            <h4><i class="fas fa-database"></i> Zarządzanie danymi</h4>
                            <button class="tool-btn" id="backup-btn">
                                <i class="fas fa-save"></i> Utwórz kopię zapasową
                            </button>
                            <button class="tool-btn" id="restore-btn">
                                <i class="fas fa-undo"></i> Przywróć kopię
                            </button>
                            <button class="tool-btn danger" id="reset-all-btn">
                                <i class="fas fa-exclamation-triangle"></i> Resetuj wszystko
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-btn" onclick="this.closest('.category-modal').remove()">Zamknij</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Dodaj możliwość zamykania przez kliknięcie w tło
        addModalBackdropClose(modal);

        // Dodaj efekty narożników do przycisków narzędzi
        modal.querySelectorAll('.tool-btn, .cancel-btn').forEach(btn => {
            addCornerEffects(btn);
        });

        // Event listenery dla narzędzi
        modal.querySelector('#export-json-btn').onclick = exportAsJSON;
        modal.querySelector('#export-html-btn').onclick = exportAsHTML;
        modal.querySelector('#duplicate-finder-btn').onclick = findDuplicates;
        modal.querySelector('#sort-bookmarks-btn').onclick = sortBookmarks;
        modal.querySelector('#backup-btn').onclick = createBackup;
        modal.querySelector('#reset-all-btn').onclick = resetAll;
    }

    // Funkcje narzędzi
    function exportAsJSON() {
        const data = {
            bookmarks: currentBookmarks,
            categories: categories,
            settings: appSettings,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookmarks_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function exportAsHTML() {
        let html = `<!DOCTYPE html>
<html>
<head>
    <title>Eksportowane Zakładki</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>Moje Zakładki</h1>
`;

        categories.forEach(category => {
            if (category === 'Wszystkie') return;
            const bookmarksInCategory = currentBookmarks.filter(b => (b.category || 'Bez kategorii') === category);
            if (bookmarksInCategory.length > 0) {
                html += `    <h2>${category}</h2>\n    <ul>\n`;
                bookmarksInCategory.forEach(bookmark => {
                    html += `        <li><a href="${bookmark.href}">${bookmark.text}</a></li>\n`;
                });
                html += `    </ul>\n`;
            }
        });

        html += `</body>\n</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookmarks_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function findDuplicates() {
        const duplicates = [];
        const seen = new Map();

        currentBookmarks.forEach((bookmark, index) => {
            const key = bookmark.href.toLowerCase();
            if (seen.has(key)) {
                duplicates.push({ original: seen.get(key), duplicate: { ...bookmark, index } });
            } else {
                seen.set(key, { ...bookmark, index });
            }
        });

        if (duplicates.length === 0) {
            alert('Nie znaleziono duplikatów!');
            return;
        }

        alert(`Znaleziono ${duplicates.length} duplikatów. Sprawdź konsolę dla szczegółów.`);
        console.log('Duplikaty:', duplicates);
    }

    function sortBookmarks() {
        if (confirm('Czy na pewno chcesz posortować zakładki alfabetycznie według tytułu?')) {
            currentBookmarks.sort((a, b) => a.text.localeCompare(b.text, 'pl'));
            saveBookmarksToLocal(currentBookmarks);
            displayLinks(currentBookmarks);
            alert('Zakładki zostały posortowane alfabetycznie!');
        }
    }

    function createBackup() {
        const backup = {
            bookmarks: currentBookmarks,
            categories: categories,
            settings: appSettings,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('bookmarks_backup', JSON.stringify(backup));
        alert('Kopia zapasowa została utworzona!');
    }

    function resetAll() {
        if (confirm('UWAGA: Ta operacja usunie wszystkie zakładki, kategorie i ustawienia. Czy na pewno chcesz kontynuować?')) {
            if (confirm('To jest ostatnie ostrzeżenie. Wszystkie dane zostaną nieodwracalnie utracone!')) {
                localStorage.removeItem('saved_bookmarks');
                localStorage.removeItem('bookmark_categories');
                localStorage.removeItem('app_settings');
                location.reload();
            }
        }
    }

    // Zaawansowane funkcje obsługi favicon
    function getFaviconUrl(url) {
        const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

        // Dla carrd.co użyj prawdziwą strukturę favicon
        if (cleanUrl.includes('carrd.co')) {
            return `https://${cleanUrl}/assets/images/favicon.png`;
        }

        return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${cleanUrl}&size=32`;
    }

    // Obsługa błędów favicon - próbuj różne źródła
    function handleFaviconError(imgElement, bookmark) {
        const attempt = parseInt(imgElement.dataset.attempt) || 1;
        const cleanUrl = bookmark.href.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        const isCarrd = cleanUrl.includes('carrd.co');

        if (isCarrd) {
            // Specjalna logika dla carrd.co
            if (attempt === 1) {
                // Druga próba - apple-touch-icon jako fallback
                imgElement.src = `https://${cleanUrl}/assets/images/apple-touch-icon.png`;
                imgElement.dataset.attempt = "2";
            } else if (attempt === 2) {
                // Trzecia próba - nowe Google Favicons API
                imgElement.src = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${cleanUrl}&size=32`;
                imgElement.dataset.attempt = "3";
            } else if (attempt === 3) {
                // Czwarta próba - Yandex API
                imgElement.src = `https://favicon.yandex.net/favicon/${cleanUrl}`;
                imgElement.dataset.attempt = "4";
            } else {
                // Pokaż fallback
                showFaviconFallback(imgElement, bookmark);
            }
        } else {
            // Standardowa logika dla innych stron
            if (attempt === 1) {
                // Druga próba - stare Google Favicons API jako fallback
                imgElement.src = `https://www.google.com/s2/favicons?domain=${cleanUrl}&sz=32`;
                imgElement.dataset.attempt = "2";
            } else if (attempt === 2) {
                // Trzecia próba - DuckDuckGo
                imgElement.src = `https://icons.duckduckgo.com/ip3/${cleanUrl}.ico`;
                imgElement.dataset.attempt = "3";
            } else if (attempt === 3) {
                // Czwarta próba - bezpośredni favicon
                imgElement.src = `https://${cleanUrl}/favicon.ico`;
                imgElement.dataset.attempt = "4";
            } else {
                // Pokaż fallback
                showFaviconFallback(imgElement, bookmark);
            }
        }
    }

    function showFaviconFallback(imgElement, bookmark) {
        imgElement.style.display = 'none';
        const fallbackDiv = imgElement.nextElementSibling;
        if (fallbackDiv && fallbackDiv.classList.contains('bookmark-favicon-fallback')) {
            fallbackDiv.style.display = 'flex';
        }
    }

    function getFirstLetter(url) {
        try {
            const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
            return domain.charAt(0).toUpperCase();
        } catch (e) {
            return 'W';
        }
    }

    // Funkcja do skracania URL-ów dla wyświetlenia
    function getShortUrl(url) {
        try {
            // Usuń protokół (http:// lub https://)
            let cleanUrl = url.replace(/^https?:\/\//, '');
            // Usuń www. jeśli jest na początku
            cleanUrl = cleanUrl.replace(/^www\./, '');
            // Usuń końcowy slash jeśli jest
            cleanUrl = cleanUrl.replace(/\/$/, '');
            // Jeśli zostały tylko parametry ścieżki, pokaż tylko domenę
            const domain = cleanUrl.split('/')[0];
            return domain || cleanUrl;
        } catch (e) {
            return url;
        }
    }

    // Funkcja do dodawania meta tagów Open Graph dla carrd.co
    function addCarrdMetaTags(carrdUrl) {
        // Usuń istniejące meta tagi carrd.co jeśli istnieją
        const existingMeta = document.querySelector('meta[property="og:image"][content*="carrd.co"]');
        if (existingMeta) {
            existingMeta.remove();
        }

        // Wyciągnij subdomenę z URL carrd.co (np. "linkosi" z "linkosi.carrd.co")
        let subdomain = '';
        try {
            const cleanUrl = carrdUrl.replace(/^https?:\/\//, '').replace(/^www\./, '');
            if (cleanUrl.includes('carrd.co')) {
                subdomain = cleanUrl.split('.carrd.co')[0];
            }
        } catch (e) {
            console.warn('Could not parse carrd.co URL:', carrdUrl);
            return;
        }

        if (subdomain) {
            // Dodaj meta tag Open Graph z unikalną ikoną dla tej strony carrd.co
            const metaTag = document.createElement('meta');
            metaTag.setAttribute('property', 'og:image');
            metaTag.setAttribute('content', `https://${subdomain}.carrd.co/assets/images/card.jpg?v=01aaf00f`);
            document.head.appendChild(metaTag);
        }
    }

    // Zamknij panele przy kliknięciu poza nimi
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sidebar') && !e.target.closest('.category-modal')) {
            closeAllPanels();
        }
    });

    // Inicjalizacja dropdown kategorii
    updateCategoryDropdown();

    // Inicjalizacja widoczności drag hint
    if (selectedCategory === 'Wszystkie' && appSettings.dragAndDrop) {
        dragHint.classList.remove('hidden');
    } else {
        dragHint.classList.add('hidden');
    }

    // Dodaj efekty narożników do przycisków interfejsu
    document.querySelectorAll('.icon-btn, .manage-btn').forEach(btn => {
        addCornerEffects(btn);
    });

    // Modal zarządzania kategoriami
    manageCategoriesBtn.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.className = 'category-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Zarządzaj kategoriami</h3>
                    <button class="close-btn" onclick="this.closest('.category-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="categories-list">
                        <h4>Istniejące kategorie:</h4>
                        <div class="category-items">
                            ${categories.filter(cat => !['Wszystkie', 'Bez kategorii'].includes(cat)).map(cat => `
                                <div class="category-item">
                                    <span>${cat}</span>
                                    <button class="remove-cat-btn" data-category="${cat}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="add-category-section">
                        <h4>Dodaj nową kategorię:</h4>
                        <div class="new-category-section">
                            <input type="text" class="new-category-input" placeholder="Nazwa kategorii...">
                            <button class="add-category-btn">Dodaj</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-btn" onclick="this.closest('.category-modal').remove()">Zamknij</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Dodaj możliwość zamykania przez kliknięcie w tło
        addModalBackdropClose(modal);

        // Event listeners
        const addBtn = modal.querySelector('.add-category-btn');
        const newCatInput = modal.querySelector('.new-category-input');
        const removeButtons = modal.querySelectorAll('.remove-cat-btn');

        // Dodaj efekty narożników do przycisków modal
        modal.querySelectorAll('.add-category-btn, .remove-cat-btn').forEach(btn => {
            addCornerEffects(btn);
        });

        addBtn.onclick = () => {
            const newCat = newCatInput.value.trim();
            if (newCat && addCategory(newCat)) {
                modal.remove();
                updateCategoryDropdown();
            } else {
                alert('Kategoria już istnieje lub nazwa jest pusta!');
            }
        };

        removeButtons.forEach(btn => {
            btn.onclick = () => {
                const catName = btn.dataset.category;
                if (confirm(`Usunąć kategorię "${catName}"? Zakładki z tej kategorii zostaną przeniesione do "Bez kategorii".`)) {
                    removeCategory(catName);
                    modal.remove();
                    updateCategoryDropdown();
                    if (selectedCategory === catName) {
                        selectedCategory = 'Wszystkie';
                        categorySelect.value = 'Wszystkie';
                        filterByCategory();
                    }
                }
            };
        });
    });

    // Aktualizacja nazwy pliku w UI
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
        } else {
            fileNameDisplay.textContent = '';
        }
    });

    // Funkcja do filtrowania linków według kategorii
    function filterLinksByCategory(links, category) {
        if (category === 'Wszystkie') {
            return links;
        }
        return links.filter(link => {
            const linkCategory = link.category || 'Bez kategorii';
            return linkCategory === category;
        });
    }

    // Funkcja do wyświetlania linków w siatce
    function displayLinks(links, categoryFilter = null) {
        currentBookmarks = links;
        const filteredLinks = categoryFilter ? filterLinksByCategory(links, categoryFilter) : filterLinksByCategory(links, selectedCategory);

        gridContainer.innerHTML = '';
        if (filteredLinks.length > 0) {
            placeholder.style.display = 'none';
        } else {
            placeholder.style.display = 'flex';
            const message = selectedCategory === 'Wszystkie' ?
                'Nie znaleziono prawidłowych linków w pliku.' :
                `Brak zakładek w kategorii "${selectedCategory}".`;
            placeholder.querySelector('span').textContent = message;
            return;
        }

        filteredLinks.forEach((link, index) => {
            const linkElement = document.createElement('a');
            linkElement.href = link.href;
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            linkElement.className = 'grid-cell';
            linkElement.dataset.linkId = link.id || Math.random().toString(36).substr(2, 9);
            linkElement.dataset.index = index;

            // Drag and drop tylko dla kategorii "Wszystkie" i gdy jest włączone w ustawieniach
            if (selectedCategory === 'Wszystkie' && appSettings.dragAndDrop) {
                linkElement.draggable = true;

                // Event listeners dla drag and drop
                linkElement.addEventListener('dragstart', (e) => handleDragStart(e, link.id));
                linkElement.addEventListener('dragover', handleDragOver);
                linkElement.addEventListener('dragenter', handleDragEnter);
                linkElement.addEventListener('dragleave', handleDragLeave);
                linkElement.addEventListener('drop', handleDrop);
                linkElement.addEventListener('dragend', handleDragEnd);

                linkElement.classList.add('draggable');
            } else {
                linkElement.draggable = false;
                linkElement.classList.add('not-draggable');
            }

            const linkHeader = document.createElement('div');
            linkHeader.className = 'link-header';

            const faviconContainer = document.createElement('div');
            faviconContainer.className = 'favicon-container';
            const faviconImg = document.createElement('img');
            faviconImg.className = 'link-favicon';
            faviconImg.alt = `Favicon`;
            faviconImg.loading = 'lazy';

            // Utwórz fallback element z wyprzedzeniem
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = 'favicon-fallback bookmark-favicon-fallback';
            fallbackDiv.textContent = getFirstLetter(link.href);
            fallbackDiv.style.display = 'none';

            faviconImg.src = getFaviconUrl(link.href);
            faviconImg.dataset.attempt = "1";
            faviconImg.onerror = () => {
                if (appSettings.advancedFavicons) {
                    handleFaviconError(faviconImg, link);
                } else {
                    // Prostszy fallback bez zaawansowanej obsługi błędów
                    showFaviconFallback(faviconImg, link);
                }
            };

            faviconContainer.appendChild(fallbackDiv);

            faviconContainer.appendChild(faviconImg);

            const textElement = document.createElement('span');
            textElement.className = 'link-text';
            textElement.textContent = link.text;

            linkHeader.appendChild(faviconContainer);
            linkHeader.appendChild(textElement);

            // Dodaj kategorię
            const categoryElement = document.createElement('div');
            categoryElement.className = 'link-category';
            categoryElement.textContent = link.category || 'Bez kategorii';

            const descElement = document.createElement('p');
            descElement.className = 'link-description';
            descElement.textContent = getShortUrl(link.href);

            // Dodaj przycisk edycji kategorii
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-category-btn';
            editBtn.innerHTML = '<i class="fas fa-tags"></i>';
            editBtn.title = 'Zmień kategorię';
            editBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                openCategoryEditor(link);
            };

            linkElement.appendChild(linkHeader);
            linkElement.appendChild(categoryElement);
            linkElement.appendChild(descElement);
            linkElement.appendChild(editBtn);

            // Dodaj efekty narożników
            addCornerEffects(linkElement);

            gridContainer.appendChild(linkElement);
        });
    }

    // Logika importu
    importBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) {
            alert('Proszę najpierw wybrać plik.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const fileContent = event.target.result;
            const parser = new DOMParser();
            const doc = parser.parseFromString(fileContent, 'text/html');
            const linkNodes = doc.querySelectorAll('a');

            const bookmarks = [];
            linkNodes.forEach(node => {
                const href = node.getAttribute('href');
                const text = node.textContent.trim();
                // Prosta walidacja linków
                if (href && text && (href.startsWith('http://') || href.startsWith('https://'))) {
                    bookmarks.push({
                        id: Date.now() + Math.random().toString(36).substr(2, 9),
                        href: href,
                        text: text,
                        description: 'Zaimportowany link',
                        category: 'Bez kategorii'
                    });

                    // Dodaj meta tagi dla carrd.co
                    if (href.includes('carrd.co')) {
                        addCarrdMetaTags(href);
                    }
                }
            });

            displayLinks(bookmarks);

            // Zapisz zakładki do localStorage
            saveBookmarksToLocal(bookmarks);

            // Aktualizuj dropdown kategorii
            updateCategoryDropdown();

            // Aktualizacja nagłówka
            const newText = `Znaleziono: <span class="category-name">${bookmarks.length}</span> zakładek`;
            headerTitle.innerHTML = newText;
            setTimeout(() => triggerGlitchAnimation(headerTitle), 50);
        };

        reader.onerror = () => {
            alert('Wystąpił błąd podczas odczytu pliku.');
            placeholder.querySelector('span').textContent = 'Błąd odczytu pliku.';
            placeholder.style.display = 'flex';
        };

        reader.readAsText(file);
    });

    // Logika czyszczenia lokalnych zakładek
    clearBtn.addEventListener('click', () => {
        const savedBookmarks = loadBookmarksFromLocal();
        if (savedBookmarks.length === 0) {
            alert('Brak zapisanych zakładek do usunięcia.');
            return;
        }

        if (confirm(`Czy na pewno chcesz usunąć ${savedBookmarks.length} zapisanych zakładek? Ta operacja jest nieodwracalna.`)) {
            clearLocalBookmarks();
            gridContainer.innerHTML = '';
            placeholder.style.display = 'flex';
            placeholder.querySelector('span').textContent = 'Twoje zaimportowane zakładki pojawią się tutaj.';
            headerTitle.innerHTML = 'Importer Zakładek';
            alert('Zapisane zakładki zostały usunięte.');
        }
    });
});