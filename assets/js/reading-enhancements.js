
document.addEventListener('DOMContentLoaded', function() {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var runningAnimations = new WeakMap();
    var copyTimers = new WeakMap();

    function updateDisclosureState(container, expanded) {
        var content = container.querySelector('.code-content');
        var toggle = container.querySelector('.toggle-btn');
        if (!content || !toggle) return;

        container.setAttribute('data-expanded', String(expanded));
        container.setAttribute('aria-expanded', String(expanded));
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.setAttribute('aria-label', expanded ? '收起代码块' : '展开代码块');
        toggle.setAttribute('title', expanded ? '收起代码块' : '展开代码块');
        content.setAttribute('aria-hidden', String(!expanded));

        if (expanded) {
            content.removeAttribute('inert');
        } else {
            content.setAttribute('inert', '');
        }
    }

    function setExpanded(container, expanded) {
        var content = container.querySelector('.code-content');
        if (!content) return;

        // Capture the rendered state first so a quick second click reverses smoothly.
        var startHeight = content.hidden ? 0 : content.getBoundingClientRect().height;
        var startOpacity = content.hidden ? 0 : parseFloat(window.getComputedStyle(content).opacity);
        var previousAnimation = runningAnimations.get(content);
        if (previousAnimation) previousAnimation.cancel();

        content.hidden = false;
        updateDisclosureState(container, expanded);

        if (reduceMotion.matches || typeof content.animate !== 'function') {
            content.classList.remove('is-disclosure-animating');
            if (!expanded) content.hidden = true;
            return;
        }

        content.classList.add('is-disclosure-animating');
        var endHeight = expanded ? content.scrollHeight : 0;
        var endOpacity = expanded ? 1 : 0;
        var animation = content.animate([
            { maxHeight: startHeight + 'px', opacity: Number.isFinite(startOpacity) ? startOpacity : (expanded ? 0 : 1) },
            { maxHeight: endHeight + 'px', opacity: endOpacity }
        ], {
            duration: 300,
            easing: 'ease-out'
        });
        runningAnimations.set(content, animation);

        animation.addEventListener('finish', function() {
            if (runningAnimations.get(content) !== animation) return;
            runningAnimations.delete(content);
            content.classList.remove('is-disclosure-animating');
            if (!expanded && container.getAttribute('data-expanded') === 'false') {
                content.hidden = true;
            }
        }, { once: true });
        animation.addEventListener('cancel', function() {
            if (runningAnimations.get(content) !== animation) return;
            runningAnimations.delete(content);
            content.classList.remove('is-disclosure-animating');
        }, { once: true });
    }

    function legacyCopy(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        var copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) throw new Error('Copy command was rejected');
    }

    async function copyCode(button) {
        var container = button.closest('.code-block-container');
        var codeElement = container && (container.querySelector('.lntd:last-child code') || container.querySelector('code'));
        if (!codeElement) return;
        // textContent remains available while the default-collapsed block is hidden.
        var code = codeElement.textContent || '';

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(code);
                } catch (clipboardError) {
                    legacyCopy(code);
                }
            } else {
                legacyCopy(code);
            }

            var originalLabel = button.dataset.copyLabel || button.getAttribute('aria-label') || '复制代码';
            var originalTitle = button.dataset.copyTitle || button.getAttribute('title') || originalLabel;
            button.dataset.copyLabel = originalLabel;
            button.dataset.copyTitle = originalTitle;
            var previousTimer = copyTimers.get(button);
            if (previousTimer) window.clearTimeout(previousTimer);
            button.setAttribute('aria-label', '已复制');
            button.setAttribute('title', '已复制');
            button.style.color = 'var(--link-color)';
            copyTimers.set(button, window.setTimeout(function() {
                button.setAttribute('aria-label', originalLabel);
                button.setAttribute('title', originalTitle);
                button.style.color = '';
                copyTimers.delete(button);
            }, 1400));
        } catch (error) {
            console.error('Failed to copy!', error);
        }
    }

    // One delegated listener replaces three listeners on every code block.
    document.addEventListener('click', function(event) {
        var target = event.target instanceof Element ? event.target : event.target.parentElement;
        if (!target) return;
        var header = target.closest('.code-header');
        if (!header) return;
        var container = header.closest('.code-block-container');
        if (!container) return;

        var copyButton = target.closest('.copy-btn');
        if (copyButton) {
            copyCode(copyButton);
            return;
        }

        var expanded = container.getAttribute('data-expanded') === 'true';
        setExpanded(container, !expanded);
    });
});


(function() {
    var overlay = document.getElementById('lightbox-overlay');
    if (!overlay) return;
    var lbImg = overlay.querySelector('.lightbox-img');
    var viewport = overlay.querySelector('.lightbox-viewport');
    var canvas = overlay.querySelector('.lightbox-canvas');
    var prevBtn = overlay.querySelector('.lightbox-prev');
    var nextBtn = overlay.querySelector('.lightbox-next');
    var zoomStatus = overlay.querySelector('.lightbox-status');
    var postContent = document.querySelector('.post-content');
    if (!postContent) return;
    var images = Array.from(postContent.querySelectorAll('img'));
    var currentIndex = 0;
    var previouslyFocused = null;
    var zoom = 1;
    var fitWidth = 1;
    var fitHeight = 1;
    var originalZoom = 1;
    var imageLoadToken = 0;
    var activePointers = new Map();
    var dragState = null;
    var pinchState = null;
    var pointerMoved = false;
    var minZoom = 0.25;
    var maxZoom = 5;
    var zoomStep = 0.25;

    function getImageControl(img) {
        return img.closest('a, button') || img;
    }

    function prepareImages() {
        images = Array.from(postContent.querySelectorAll('img'));
        images.forEach(function(img) {
            var parentControl = img.closest('a, button');
            var control = parentControl || img;
            control.setAttribute('aria-haspopup', 'dialog');
            control.setAttribute('aria-controls', 'lightbox-overlay');

            if (!parentControl) {
                img.tabIndex = 0;
                img.setAttribute('role', 'button');
                img.setAttribute('aria-label', img.alt ? '查看大图：' + img.alt : '查看大图');
            }
        });
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function getMaxZoom() {
        return Math.max(maxZoom, originalZoom);
    }

    function updateZoomState() {
        var percentage = Math.round(zoom * 100);
        var isFit = Math.abs(zoom - 1) <= 0.001;
        var isZoomed = zoom > 1.001;
        var canZoomOriginal = originalZoom > 1.001;
        var stateText = isFit ? '适应窗口' : '缩放 ' + percentage + '%';
        var actionText = isFit && canZoomOriginal
            ? '单击图片查看原始尺寸'
            : (isFit ? '当前已是原始尺寸' : '单击图片恢复适应窗口');

        overlay.classList.toggle('is-zoomed', isZoomed);
        overlay.classList.toggle('can-zoom-original', canZoomOriginal);
        viewport.setAttribute('aria-label', '可缩放图片区域，当前' + stateText + '；' + actionText);
        zoomStatus.textContent = '图片当前' + stateText + '；' + actionText;
    }

    function applyZoom(nextZoom, anchor) {
        var viewportRect = viewport.getBoundingClientRect();
        var anchorX = anchor ? anchor.clientX : viewportRect.left + viewport.clientWidth / 2;
        var anchorY = anchor ? anchor.clientY : viewportRect.top + viewport.clientHeight / 2;
        var imageRect = lbImg.getBoundingClientRect();
        var imageAnchorX = imageRect.width
            ? clamp((anchorX - imageRect.left) / imageRect.width, 0, 1)
            : 0.5;
        var imageAnchorY = imageRect.height
            ? clamp((anchorY - imageRect.top) / imageRect.height, 0, 1)
            : 0.5;

        zoom = clamp(nextZoom, minZoom, getMaxZoom());
        lbImg.style.width = Math.max(1, fitWidth * zoom) + 'px';
        lbImg.style.height = Math.max(1, fitHeight * zoom) + 'px';
        updateZoomState();

        var nextImageRect = lbImg.getBoundingClientRect();
        viewport.scrollLeft += nextImageRect.left + nextImageRect.width * imageAnchorX - anchorX;
        viewport.scrollTop += nextImageRect.top + nextImageRect.height * imageAnchorY - anchorY;
    }

    function fitImage(reset) {
        if (!lbImg.naturalWidth || !lbImg.naturalHeight) return;
        var canvasStyle = window.getComputedStyle(canvas);
        var horizontalPadding = parseFloat(canvasStyle.paddingLeft) + parseFloat(canvasStyle.paddingRight);
        var verticalPadding = parseFloat(canvasStyle.paddingTop) + parseFloat(canvasStyle.paddingBottom);
        var availableWidth = Math.max(1, viewport.clientWidth - horizontalPadding);
        var availableHeight = Math.max(1, viewport.clientHeight - verticalPadding);
        var fitScale = Math.min(
            availableWidth / lbImg.naturalWidth,
            availableHeight / lbImg.naturalHeight,
            1
        );

        fitWidth = lbImg.naturalWidth * fitScale;
        fitHeight = lbImg.naturalHeight * fitScale;
        originalZoom = 1 / fitScale;
        if (reset) zoom = 1;
        lbImg.style.width = Math.max(1, fitWidth * zoom) + 'px';
        lbImg.style.height = Math.max(1, fitHeight * zoom) + 'px';
        viewport.scrollLeft = 0;
        viewport.scrollTop = 0;
        updateZoomState();
    }

    function resetInteraction() {
        activePointers.clear();
        dragState = null;
        pinchState = null;
        pointerMoved = false;
        overlay.classList.remove('is-panning');
    }

    function showImage(index) {
        if (!images.length) return;
        currentIndex = (index + images.length) % images.length;
        var img = images[currentIndex];
        var loadToken = ++imageLoadToken;
        resetInteraction();
        zoom = 1;
        originalZoom = 1;
        updateZoomState();
        lbImg.classList.add('is-loading');
        lbImg.onload = function() {
            if (loadToken !== imageLoadToken) return;
            requestAnimationFrame(function() {
                fitImage(true);
                lbImg.classList.remove('is-loading');
            });
        };
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt || '';
        overlay.setAttribute('aria-label', img.alt ? '图片预览：' + img.alt : '图片预览');
        if (lbImg.complete && lbImg.naturalWidth) lbImg.onload();
    }

    function openImage(img, event) {
        prepareImages();
        var index = images.indexOf(img);
        if (index < 0) return;

        if (event) event.preventDefault();
        previouslyFocused = getImageControl(img);
        showImage(index);
        overlay.hidden = false;
        overlay.inert = false;
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        viewport.focus();
    }

    function findImage(target) {
        if (!(target instanceof Element)) return null;
        if (target.matches('img')) return target;
        if (target.matches('a, button')) return target.querySelector('img');
        return null;
    }

    // Delegate image opening so long articles keep one listener instead of one per image.
    postContent.addEventListener('click', function(event) {
        var img = findImage(event.target);
        if (!img || !postContent.contains(img)) return;
        openImage(img, event);
    });

    postContent.addEventListener('keydown', function(event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        var img = event.target instanceof Element && event.target.matches('img[role="button"]')
            ? event.target
            : null;
        if (!img) return;
        openImage(img, event);
    });

    function closeLightbox() {
        imageLoadToken += 1;
        resetInteraction();
        overlay.classList.remove('active');
        overlay.classList.remove('is-zoomed');
        overlay.classList.remove('can-zoom-original');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.inert = true;
        overlay.hidden = true;
        document.body.style.overflow = '';
        if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
            previouslyFocused.focus();
        }
    }

    function isOpen() {
        return overlay.classList.contains('active');
    }

    function trapFocus(event) {
        var focusable = Array.from(overlay.querySelectorAll(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        ));
        if (!focusable.length) return;

        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || !overlay.contains(document.activeElement))) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !overlay.contains(document.activeElement))) {
            event.preventDefault();
            first.focus();
        }
    }

    viewport.addEventListener('click', function(e) {
        if (!pointerMoved && (e.target === viewport || e.target === canvas)) closeLightbox();
        pointerMoved = false;
    });
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeLightbox();
    });
    viewport.addEventListener('wheel', function(e) {
        e.preventDefault();
        applyZoom(zoom + (e.deltaY < 0 ? zoomStep : -zoomStep), {
            clientX: e.clientX,
            clientY: e.clientY
        });
    }, { passive: false });
    lbImg.addEventListener('click', function(e) {
        if (pointerMoved) {
            pointerMoved = false;
            return;
        }
        if (e.detail > 1) return;
        e.preventDefault();
        var targetZoom = Math.abs(zoom - 1) > 0.001 ? 1 : originalZoom;
        if (Math.abs(targetZoom - zoom) <= 0.001) return;
        applyZoom(targetZoom, { clientX: e.clientX, clientY: e.clientY });
    });
    lbImg.addEventListener('dblclick', function(e) {
        e.preventDefault();
    });
    prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showImage(currentIndex - 1);
    });
    nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showImage(currentIndex + 1);
    });
    viewport.addEventListener('pointerdown', function(e) {
        if (e.pointerType === 'mouse' && zoom <= 1) return;
        var pointerTarget = e.target instanceof Element ? e.target : viewport;
        pointerTarget.setPointerCapture(e.pointerId);
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        pointerMoved = false;

        if (activePointers.size === 1) {
            dragState = {
                x: e.clientX,
                y: e.clientY,
                scrollLeft: viewport.scrollLeft,
                scrollTop: viewport.scrollTop
            };
        } else if (activePointers.size === 2) {
            var points = Array.from(activePointers.values());
            pinchState = {
                distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y),
                zoom: zoom
            };
            dragState = null;
        }
        overlay.classList.add('is-panning');
    });
    viewport.addEventListener('pointermove', function(e) {
        if (!activePointers.has(e.pointerId)) return;
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (activePointers.size === 2 && pinchState) {
            var points = Array.from(activePointers.values());
            var distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
            var midpoint = {
                clientX: (points[0].x + points[1].x) / 2,
                clientY: (points[0].y + points[1].y) / 2
            };
            if (Math.abs(distance - pinchState.distance) > 2) pointerMoved = true;
            applyZoom(pinchState.zoom * distance / Math.max(pinchState.distance, 1), midpoint);
        } else if (dragState && zoom > 1) {
            var deltaX = e.clientX - dragState.x;
            var deltaY = e.clientY - dragState.y;
            if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) pointerMoved = true;
            viewport.scrollLeft = dragState.scrollLeft - deltaX;
            viewport.scrollTop = dragState.scrollTop - deltaY;
        }
    });

    function finishPointer(e) {
        activePointers.delete(e.pointerId);
        if (activePointers.size === 1) {
            var point = Array.from(activePointers.values())[0];
            dragState = {
                x: point.x,
                y: point.y,
                scrollLeft: viewport.scrollLeft,
                scrollTop: viewport.scrollTop
            };
        } else {
            dragState = null;
        }
        pinchState = null;
        if (!activePointers.size) overlay.classList.remove('is-panning');
    }

    viewport.addEventListener('pointerup', finishPointer);
    viewport.addEventListener('pointercancel', finishPointer);
    window.addEventListener('resize', function() {
        if (isOpen()) fitImage(false);
    });
    document.addEventListener('keydown', function(e) {
        if (!isOpen()) return;
        if (e.key === 'Tab') trapFocus(e);
        if (e.key === 'Escape') {
            e.preventDefault();
            closeLightbox();
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            showImage(currentIndex - 1);
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            showImage(currentIndex + 1);
        }
        if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            applyZoom(zoom + zoomStep);
        }
        if (e.key === '-' || e.key === '_') {
            e.preventDefault();
            applyZoom(zoom - zoomStep);
        }
        if (e.key === '0') {
            e.preventDefault();
            applyZoom(1);
        }
    });

    prepareImages();
})();


(function() {
    document.addEventListener('click', function(e) {
        var ln = e.target.closest('.lnt, .ln');
        if (!ln) return;
        var lnt = ln.closest('.lnt') || ln;
        var num = (lnt.textContent || '').trim();
        if (!num) return;
        var url = location.origin + location.pathname + '#L' + num;
        navigator.clipboard.writeText(url).catch(function() {});
        history.replaceState(null, '', '#L' + num);
        var table = lnt.closest('.lntable');
        if (table) {
            table.querySelectorAll('.highlight-line').forEach(function(el) {
                el.classList.remove('highlight-line');
            });
            lnt.classList.add('highlight-line');
            var row = lnt.closest('tr');
            if (row) {
                var codeLines = row.querySelectorAll('.lntd:last-child .line');
                codeLines.forEach(function(el) { el.classList.add('highlight-line'); });
            }
        }
    });
    window.addEventListener('hashchange', highlightFromHash);
    highlightFromHash();
    function highlightFromHash() {
        var m = location.hash.match(/^#L(\d+)$/);
        if (!m) return;
        var target = document.getElementById(m[1]);
        if (!target) return;
        setTimeout(function() {
            target.classList.add('highlight-line');
            var row = target.closest('tr');
            if (row) {
                row.querySelectorAll('.lntd:last-child .line').forEach(function(el) {
                    el.classList.add('highlight-line');
                });
            }
            target.scrollIntoView({ block: 'center' });
        }, 100);
    }
})();
