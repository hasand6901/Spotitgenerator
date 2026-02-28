/**
 * Spot it! / Dobble Generator — Main Application
 */
(function () {
    'use strict';

    // ==================== STATE ====================
    const state = {
        n: 7,                    // current prime order
        symbolsPerCard: 8,
        totalCards: 57,
        totalSymbols: 57,
        images: [],              // array of { src: string (dataURL or path), name: string }
        deck: null,              // generated deck (array of arrays)
        generated: false,
    };

    // ==================== DOM REFS ====================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const els = {
        variantBtns:   $$('.variant-btn'),
        imageCount:    $('#image-count'),
        imageNeeded:   $('#image-needed'),
        progressFill:  $('#progress-fill'),
        btnLoadDef:    $('#btn-load-defaults'),
        fileUpload:    $('#file-upload'),
        gallery:       $('#image-gallery'),
        btnGenerate:   $('#btn-generate'),
        btnExport:     $('#btn-export-pdf'),
        placeholder:   $('#placeholder'),
        cardsContainer:$('#cards-container'),
        printArea:     $('#print-area'),
    };

    // ==================== VARIANT SELECTION ====================
    function selectVariant(n) {
        const info = getVariantInfo(n);
        state.n = n;
        state.symbolsPerCard = info.symbolsPerCard;
        state.totalCards = info.totalCards;
        state.totalSymbols = info.totalSymbols;
        state.deck = null;
        state.generated = false;

        els.variantBtns.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.n) === n);
        });

        updateImageStatus();
        clearCards();
    }

    els.variantBtns.forEach(btn => {
        btn.addEventListener('click', () => selectVariant(parseInt(btn.dataset.n)));
    });

    // ==================== IMAGE MANAGEMENT ====================
    function updateImageStatus() {
        const count = state.images.length;
        const needed = state.totalSymbols;
        els.imageCount.textContent = count;
        els.imageNeeded.textContent = needed;

        const pct = Math.min(100, (count / needed) * 100);
        els.progressFill.style.width = pct + '%';
        els.progressFill.classList.toggle('complete', count >= needed);

        els.btnGenerate.disabled = count < needed;
        renderGallery();
    }

    function renderGallery() {
        els.gallery.innerHTML = '';
        state.images.forEach((img, idx) => {
            const thumb = document.createElement('div');
            thumb.className = 'gallery-thumb';
            thumb.innerHTML = `
                <img src="${img.src}" alt="Symbol ${idx + 1}">
                <span class="thumb-index">${idx + 1}</span>
                <button class="thumb-remove" data-idx="${idx}" title="Entfernen">×</button>
            `;
            els.gallery.appendChild(thumb);
        });

        // Remove buttons
        els.gallery.querySelectorAll('.thumb-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx);
                state.images.splice(idx, 1);
                updateImageStatus();
                clearCards();
            });
        });
    }

    // Clear all images
    $('#btn-clear-images').addEventListener('click', () => {
        if (state.images.length === 0) return;
        state.images = [];
        updateImageStatus();
        clearCards();
        showToast(getLang('toastCleared'), 'info');
    });

    // Load default images from /images/ folder
    els.btnLoadDef.addEventListener('click', async () => {
        els.btnLoadDef.disabled = true;
        els.btnLoadDef.innerHTML = '<span class="material-icons-outlined btn-icon">inventory_2</span> ' + getLang('loadingDefaults');

        const needed = state.totalSymbols;
        const newImages = [];

        for (let i = 1; i <= Math.min(needed, 57); i++) {
            const num = String(i).padStart(2, '0');
            const path = `images/Number=${num}.png`;
            newImages.push({ src: path, name: `Symbol ${i}` });
        }

        state.images = newImages;
        updateImageStatus();
        clearCards();

        els.btnLoadDef.disabled = false;
        els.btnLoadDef.innerHTML = '<span class="material-icons-outlined btn-icon">inventory_2</span> <span data-i18n="loadDefaults">' + getLang('loadDefaults') + '</span>';
        showToast(newImages.length + ' ' + getLang('toastDefaultsLoaded'), 'success');
    });

    // User file upload
    els.fileUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        // Auto-resize large images
        const MAX_SIZE = 512;

        let loaded = 0;
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    let w = img.width, h = img.height;
                    if (w > MAX_SIZE || h > MAX_SIZE) {
                        const scale = MAX_SIZE / Math.max(w, h);
                        w = Math.round(w * scale);
                        h = Math.round(h * scale);
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    const dataURL = canvas.toDataURL('image/png');

                    state.images.push({ src: dataURL, name: file.name });
                    loaded++;
                    if (loaded === files.length) {
                        updateImageStatus();
                        clearCards();
                        showToast(files.length + ' ' + getLang('toastUploaded'), 'success');
                    }
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        e.target.value = '';
    });

    // ==================== CARD GENERATION ====================
    function clearCards() {
        els.cardsContainer.innerHTML = '';
        els.placeholder.style.display = 'flex';
        els.btnExport.style.display = 'none';
        state.generated = false;
    }

    els.btnGenerate.addEventListener('click', () => {
        if (state.images.length < state.totalSymbols) {
            showToast(getLang('toastMissing', { n: state.totalSymbols - state.images.length }), 'error');
            return;
        }

        // Generate deck
        state.deck = generateDobbleDeck(state.n);

        // Validate
        const result = validateDeck(state.deck);
        if (!result.valid) {
            console.warn('Deck validation failed:', result.errors);
            showToast(getLang('toastAlgoError'), 'error');
            return;
        }

        els.placeholder.style.display = 'none';
        renderCards();
        state.generated = true;
        els.btnExport.style.display = 'block';
        showToast(getLang('toastGenerated', { n: state.deck.length }), 'success');
    });

    // ==================== CARD RENDERING ====================

    /**
     * Pre-defined layout positions for symbols on a circular card.
     * Positions are in percentage of card diameter, centered at (50, 50).
     * Each position: { x, y, size } where size is % of card diameter.
     */
    function getLayoutPositions(count) {
        // Layout templates for different symbol counts
        const layouts = {
            3: [
                { x: 50, y: 28, size: 30 },
                { x: 28, y: 68, size: 30 },
                { x: 72, y: 68, size: 30 },
            ],
            4: [
                { x: 50, y: 24, size: 26 },
                { x: 24, y: 54, size: 26 },
                { x: 76, y: 54, size: 26 },
                { x: 50, y: 76, size: 22 },
            ],
            6: [
                { x: 50, y: 22, size: 22 },
                { x: 25, y: 40, size: 20 },
                { x: 75, y: 40, size: 20 },
                { x: 30, y: 70, size: 20 },
                { x: 70, y: 70, size: 20 },
                { x: 50, y: 52, size: 18 },
            ],
            8: [
                { x: 50, y: 20, size: 18 },
                { x: 26, y: 32, size: 17 },
                { x: 74, y: 32, size: 17 },
                { x: 20, y: 56, size: 16 },
                { x: 80, y: 56, size: 16 },
                { x: 35, y: 74, size: 16 },
                { x: 65, y: 74, size: 16 },
                { x: 50, y: 50, size: 16 },
            ],
        };
        return layouts[count] || layouts[8];
    }

    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /**
     * Generate size multipliers for symbols on a card.
     * When variation is enabled, creates a mix of large, medium, and small symbols
     * (like the original Dobble game) instead of near-uniform sizes.
     * @param {number} count - number of symbols on the card
     * @param {boolean} variation - whether to apply dramatic variation
     * @returns {number[]} array of scale multipliers
     */
    function generateSizeMultipliers(count, variation) {
        if (!variation) {
            // Uniform: all roughly the same size
            return Array.from({ length: count }, () => 0.95 + Math.random() * 0.1);
        }

        // Dramatic variation: assign each symbol a size class
        // 1-2 large (1.25–1.5), 2-3 medium (0.9–1.1), rest small (0.55–0.75)
        const multipliers = [];
        const largeCount = Math.max(1, Math.floor(count * 0.2));   // ~20% large
        const smallCount = Math.max(1, Math.floor(count * 0.35));  // ~35% small
        const medCount = count - largeCount - smallCount;          // rest medium

        for (let i = 0; i < largeCount; i++) {
            multipliers.push(1.25 + Math.random() * 0.25); // 1.25–1.50
        }
        for (let i = 0; i < medCount; i++) {
            multipliers.push(0.9 + Math.random() * 0.2);   // 0.90–1.10
        }
        for (let i = 0; i < smallCount; i++) {
            multipliers.push(0.55 + Math.random() * 0.2);  // 0.55–0.75
        }

        // Shuffle so that large/small aren't always in the same position
        return shuffleArray(multipliers);
    }

    /**
     * Apply random position jitter to layout positions.
     * Offsets each symbol slightly so cards look more organic.
     * Keeps symbols within the circular card boundary.
     * @param {Array} positions - array of { x, y, size }
     * @param {boolean} jitter - whether to apply offset
     * @returns {Array} new positions with jitter applied
     */
    function applyPositionJitter(positions, jitter) {
        if (!jitter) return positions;

        const JITTER_AMOUNT = 6; // max offset in % of card diameter
        const CARD_RADIUS = 46; // usable radius in %, slightly less than 50 to keep inside

        return positions.map(pos => {
            const dx = (Math.random() - 0.5) * 2 * JITTER_AMOUNT;
            const dy = (Math.random() - 0.5) * 2 * JITTER_AMOUNT;
            let nx = pos.x + dx;
            let ny = pos.y + dy;

            // Clamp to stay within the circular card
            const distFromCenter = Math.sqrt((nx - 50) ** 2 + (ny - 50) ** 2);
            const maxDist = CARD_RADIUS - pos.size / 2;
            if (distFromCenter > maxDist && maxDist > 0) {
                const scale = maxDist / distFromCenter;
                nx = 50 + (nx - 50) * scale;
                ny = 50 + (ny - 50) * scale;
            }

            return { x: nx, y: ny, size: pos.size };
        });
    }

    function renderCards() {
        els.cardsContainer.innerHTML = '';

        state.deck.forEach((card, cardIdx) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'dobble-card';

            const inner = document.createElement('div');
            inner.className = 'dobble-card-inner';

            // Card number badge
            const badge = document.createElement('span');
            badge.className = 'card-number';
            badge.textContent = `#${cardIdx + 1}`;
            inner.appendChild(badge);

            // Get layout positions and shuffle symbol order on card
            const positions = getLayoutPositions(card.length);
            const shuffledPositions = shuffleArray(positions);
            const posJitter = $('#chk-pos-jitter').checked;
            const jitteredPositions = applyPositionJitter(shuffledPositions, posJitter);

            // Pre-assign dramatic size multipliers so some symbols are big, some small
            const sizeVariation = $('#chk-size-variation').checked;
            const sizeMultipliers = generateSizeMultipliers(card.length, sizeVariation);

            card.forEach((symbolId, i) => {
                const pos = jitteredPositions[i];
                const img = state.images[symbolId];
                if (!img) return;

                const symbol = document.createElement('div');
                symbol.className = 'card-symbol' + ($('#chk-round-images').checked ? ' round' : '');

                // Random rotation (-180° to 180°)
                const rotation = Math.floor(Math.random() * 360) - 180;
                const scaleVar = sizeMultipliers[i];
                const size = pos.size * scaleVar;

                symbol.style.width = size + '%';
                symbol.style.height = size + '%';
                symbol.style.left = (pos.x - size / 2) + '%';
                symbol.style.top = (pos.y - size / 2) + '%';
                symbol.style.transform = `rotate(${rotation}deg)`;

                const imgEl = document.createElement('img');
                imgEl.src = img.src;
                imgEl.alt = img.name;
                imgEl.draggable = false;
                symbol.appendChild(imgEl);

                inner.appendChild(symbol);
            });

            cardEl.appendChild(inner);
            els.cardsContainer.appendChild(cardEl);
        });
    }

    // ==================== PDF EXPORT ====================
    els.btnExport.addEventListener('click', async () => {
        if (!state.deck || !state.generated) return;

        els.btnExport.disabled = true;
        els.btnExport.innerHTML = '<span class="spinner"></span> ' + getLang('toastPdfProgress');

        try {
            await generatePDF();
            showToast(getLang('toastPdfDone'), 'success');
        } catch (err) {
            console.error('PDF Error:', err);
            showToast(getLang('toastPdfError'), 'error');
        } finally {
            els.btnExport.disabled = false;
            els.btnExport.innerHTML = '<span class="material-icons-outlined btn-icon">picture_as_pdf</span> <span data-i18n="exportBtn">' + getLang('exportBtn') + '</span>';
        }
    });

    async function generatePDF() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 15;
        const cardDiameter = 80; // mm
        const cols = 2;
        const rows = 3;
        const cardsPerPage = cols * rows;

        const colSpacing = (pageWidth - 2 * margin) / cols;
        const rowSpacing = (pageHeight - 2 * margin) / rows;

        // We render each card onto a temporary canvas and then add to PDF
        for (let i = 0; i < state.deck.length; i++) {
            if (i > 0 && i % cardsPerPage === 0) {
                pdf.addPage();
            }

            const pageIdx = i % cardsPerPage;
            const col = pageIdx % cols;
            const row = Math.floor(pageIdx / cols);

            const cx = margin + col * colSpacing + colSpacing / 2;
            const cy = margin + row * rowSpacing + rowSpacing / 2;

            // Draw cutting circle
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.3);
            pdf.circle(cx, cy, cardDiameter / 2);

            // Draw white fill for card
            pdf.setFillColor(255, 255, 255);
            pdf.circle(cx, cy, cardDiameter / 2 - 0.5, 'F');

            // Draw symbols
            const card = state.deck[i];
            const positions = getLayoutPositions(card.length);
            const shuffledPositions = shuffleArray(positions);
            const posJitter = $('#chk-pos-jitter').checked;
            const jitteredPositions = applyPositionJitter(shuffledPositions, posJitter);
            const sizeVariation = $('#chk-size-variation').checked;
            const sizeMultipliers = generateSizeMultipliers(card.length, sizeVariation);

            for (let s = 0; s < card.length; s++) {
                const symbolId = card[s];
                const img = state.images[symbolId];
                if (!img) continue;

                const pos = jitteredPositions[s];
                const scaleVar = sizeMultipliers[s];
                // Match the preview: use the same relative size without extra shrink
                const symbolSize = (pos.size / 100) * cardDiameter * scaleVar;

                // Random rotation matching preview behavior
                const rotation = Math.floor(Math.random() * 360) - 180;

                // Spread positions outward slightly
                const offsetX = (pos.x - 50) / 100 * cardDiameter * 1.05;
                const offsetY = (pos.y - 50) / 100 * cardDiameter * 1.05;
                const sx = cx + offsetX - symbolSize / 2;
                const sy = cy + offsetY - symbolSize / 2;

                try {
                    // Load image, rotate on a canvas, then add to PDF
                    const imgData = await loadImageAsDataURL(img.src);
                    const isRound = $('#chk-round-images').checked;
                    const clippedData = isRound ? await clipImageToCircle(imgData) : imgData;
                    const rotatedData = await rotateImageDataURL(clippedData, rotation);
                    // The rotated canvas is sqrt(2) larger; compensate by drawing bigger
                    const drawSize = symbolSize * 1.35;
                    const drawOffset = (drawSize - symbolSize) / 2;
                    pdf.addImage(rotatedData, 'PNG', sx - drawOffset, sy - drawOffset, drawSize, drawSize);
                } catch (e) {
                    // Skip images that can't be loaded
                    console.warn('Could not load image for PDF:', e);
                }
            }

            // Card number - skip in PDF
            pdf.setFontSize(7);
            pdf.setTextColor(150, 150, 150);
            // pdf.text(`#${i + 1}`, cx, cy - cardDiameter / 2 + 5, { align: 'center' });
        }

        pdf.save(`Dobble_${state.symbolsPerCard}symbols_${state.totalCards}cards.pdf`);
    }

    function loadImageAsDataURL(src) {
        return new Promise((resolve, reject) => {
            // If already a data URL, return as-is
            if (src.startsWith('data:')) {
                resolve(src);
                return;
            }
            // Load from path
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * Clips an image to a circle (transparent corners).
     * Used for PDF export when round images option is enabled.
     */
    function clipImageToCircle(dataURL) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const size = Math.min(img.width, img.height);
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');

                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                // Center-crop the image into the circle
                const sx = (img.width - size) / 2;
                const sy = (img.height - size) / 2;
                ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = dataURL;
        });
    }

    /**
     * Rotates an image (data URL) by the given angle in degrees.
     * Returns a new data URL with the rotated image on a transparent background.
     */
    function rotateImageDataURL(dataURL, angleDeg) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const rad = (angleDeg * Math.PI) / 180;
                // Use a square canvas large enough to fit the rotated image
                const size = Math.ceil(Math.sqrt(img.width ** 2 + img.height ** 2));
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');

                ctx.translate(size / 2, size / 2);
                ctx.rotate(rad);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);

                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = dataURL;
        });
    }

    // ==================== TOAST NOTIFICATIONS ====================
    function showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==================== INIT ====================
    function init() {
        updateImageStatus();
    }

    init();
})();
