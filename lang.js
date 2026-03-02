/**
 * Language switching for Spot it! / Dobble Generator
 * Supports DE (German) and EN (English)
 */
(function () {
    'use strict';

    const translations = {
        de: {
            subtitle: 'Erstelle dein eigenes Kartenspiel',
            variantTitle: 'Variante wählen',
            variantMini: '3 Symbole · 7 Karten',
            variantSmall: 'Klein',
            variantSmallInfo: '4 Symbole · 13 Karten',
            variantMedium: 'Mittel',
            variantMediumInfo: '6 Symbole · 31 Karten',
            variantOriginalInfo: '8 Symbole · 57 Karten',
            imagesTitle: 'Bilder verwalten',
            imagesLoaded: 'Bilder geladen',
            loadDefaults: 'Standardbilder laden',
            uploadImages: 'Eigene Bilder hochladen',
            optionsTitle: 'Optionen',
            optSize: 'Zufällige Größenvariation',
            optPosition: 'Zufällige Positionsversetzung',
            optRound: 'Runde Bilder',
            generateTitle: 'Generieren',
            generateBtn: 'Karten generieren',
            generateHint: 'Gefällt dir nicht? Einfach erneut klicken!',
            exportBtn: 'Als PDF exportieren',
            welcomeTitle: 'Willkommen beim Spot it! Generator',
            step1: 'Wähle eine Variante',
            step2: 'Lade Bilder hoch',
            step3: 'Klicke auf "Karten generieren"',
            clearAllImages: 'Alle Bilder entfernen',
            // Toast messages (used via getLang())
            toastDefaultsLoaded: 'Standardbilder geladen!',
            toastUploaded: 'Bild(er) hochgeladen!',
            toastMissing: 'Es fehlen noch {n} Bilder!',
            toastGenerated: '{n} Karten generiert!',
            toastAlgoError: 'Algorithmus-Fehler! Siehe Konsole.',
            toastPdfDone: 'PDF erfolgreich erstellt!',
            toastPdfError: 'Fehler bei der PDF-Erstellung.',
            toastCleared: 'Alle Bilder entfernt.',
            toastPdfProgress: 'PDF wird erstellt…',
            loadingDefaults: 'Lade…',
        },
        en: {
            subtitle: 'Create your own card game',
            variantTitle: 'Choose variant',
            variantMini: '3 Symbols · 7 Cards',
            variantSmall: 'Small',
            variantSmallInfo: '4 Symbols · 13 Cards',
            variantMedium: 'Medium',
            variantMediumInfo: '6 Symbols · 31 Cards',
            variantOriginalInfo: '8 Symbols · 57 Cards',
            imagesTitle: 'Manage images',
            imagesLoaded: 'Images loaded',
            loadDefaults: 'Load default images',
            uploadImages: 'Upload custom images',
            optionsTitle: 'Options',
            optSize: 'Random size variation',
            optPosition: 'Random position offset',
            optRound: 'Round images',
            generateTitle: 'Generate',
            generateBtn: 'Generate cards',
            generateHint: 'Not your style? Shuffle again!',
            exportBtn: 'Export as PDF',
            welcomeTitle: 'Welcome to the Spot it! Generator',
            step1: 'Choose a variant',
            step2: 'Upload images',
            step3: 'Click "Generate cards"',
            clearAllImages: 'Remove all images',
            toastDefaultsLoaded: 'Default images loaded!',
            toastUploaded: 'Image(s) uploaded!',
            toastMissing: '{n} more images needed!',
            toastGenerated: '{n} cards generated!',
            toastAlgoError: 'Algorithm error! Check console.',
            toastPdfDone: 'PDF created successfully!',
            toastPdfError: 'Error creating PDF.',
            toastCleared: 'All images removed.',
            toastPdfProgress: 'Creating PDF…',
            loadingDefaults: 'Loading…',
        },
    };

    let currentLang = localStorage.getItem('spotit-lang') || 'de';

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('spotit-lang', lang);
        document.documentElement.lang = lang;

        const strings = translations[lang];
        if (!strings) return;

        // Update all data-i18n elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (strings[key] !== undefined) {
                el.textContent = strings[key];
            }
        });

        // Update title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (strings[key] !== undefined) {
                el.title = strings[key];
            }
        });

        // Update flag icon and tooltip
        const flagIcon = document.getElementById('flag-icon');
        const btnLang = document.getElementById('btn-lang');
        if (flagIcon && btnLang) {
            if (lang === 'de') {
                // Show GB flag to switch to English
                flagIcon.src = 'uk-icon.png';
                btnLang.title = 'Switch to English';
            } else {
                // Show DE flag to switch to German
                flagIcon.src = 'de-icon.png';
                btnLang.title = 'Auf Deutsch wechseln';
            }
        }
    }

    /**
     * Get a translated string by key, with optional placeholder replacement.
     * @param {string} key
     * @param {Object} [params] - e.g. { n: 5 }
     * @returns {string}
     */
    window.getLang = function (key, params) {
        const strings = translations[currentLang] || translations.de;
        let str = strings[key] || key;
        if (params) {
            Object.keys(params).forEach(k => {
                str = str.replace(`{${k}}`, params[k]);
            });
        }
        return str;
    };

    window.getCurrentLang = function () {
        return currentLang;
    };

    // Init
    document.addEventListener('DOMContentLoaded', () => {
        applyLanguage(currentLang);

        document.getElementById('btn-lang').addEventListener('click', () => {
            applyLanguage(currentLang === 'de' ? 'en' : 'de');
        });
    });
})();
