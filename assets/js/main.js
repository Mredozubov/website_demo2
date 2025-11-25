/*
    Strata by HTML5 UP
    html5up.net | @ajlkn
    Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

    var $window = $(window),
        $body   = $('body'),
        $header = $('#header'),
        $footer = $('#footer'),
        $main   = $('#main'),
        settings = {

            // Parallax background effect?
            parallax: true,

            // Parallax factor (lower = more intense, higher = less intense).
            parallaxFactor: 20

        };

    // Breakpoints.
    breakpoints({
        xlarge:  [ '1281px',  '1800px' ],
        large:   [ '981px',   '1280px' ],
        medium:  [ '737px',   '980px'  ],
        small:   [ '481px',   '736px'  ],
        xsmall:  [ null,      '480px'  ]
    });

    // Play initial animations on page load.
    $window.on('load', function() {
        window.setTimeout(function() {
            $body.removeClass('is-preload');
        }, 100);
    });

    // Touch?
    if (browser.mobile) {

        // Turn on touch mode.
        $body.addClass('is-touch');

        // Height fix (mostly for iOS).
        window.setTimeout(function() {
            $window.scrollTop($window.scrollTop() + 1);
        }, 0);

    }

    // Footer.
    breakpoints.on('<=medium', function() {
        $footer.insertAfter($main);
    });

    breakpoints.on('>medium', function() {
        $footer.appendTo($header);
    });

    // Header.

        // Parallax background.

        // Disable parallax on IE (smooth scrolling is jerky), and on mobile platforms (= better performance).
        if (browser.name == 'ie' || browser.mobile)
            settings.parallax = false;

        if (settings.parallax) {

            breakpoints.on('<=medium', function() {

                $window.off('scroll.strata_parallax');
                $header.css('background-position', '');

            });

            breakpoints.on('>medium', function() {

                $header.css('background-position', 'left 0px');

                $window.on('scroll.strata_parallax', function() {
                    $header.css('background-position', 'left ' + (-1 * (parseInt($window.scrollTop()) / settings.parallaxFactor)) + 'px');
                });

            });

            $window.on('load', function() {
                $window.triggerHandler('scroll');
            });

        }

    // Main Sections: Two.

    // Lightbox gallery.
    $window.on('load', function() {

        $('#two').poptrox({
            caption: function($a) { return $a.next('h3').text(); },
            overlayColor: '#2c2c2c',
            overlayOpacity: 0.85,
            popupCloserText: '',
            popupLoaderText: '',
            selector: '.work-item a.image',
            usePopupCaption: true,
            usePopupDefaultStyling: false,
            usePopupEasyClose: false,
            usePopupNav: true,
            windowMargin: (breakpoints.active('<=small') ? 0 : 50)
        });

    });

})(jQuery);

/* ------------------------------------------------------ */
/* CUSTOM TIMELINE LOGIC (SECTION TWO – #two)             */
/* ------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", function () {
    const timelineWrapper = document.querySelector("#two .timeline-wrapper");
    if (!timelineWrapper) return;

    const header = timelineWrapper.querySelector(".timeline-header");
    const rows   = timelineWrapper.querySelectorAll(".company-row");
    const bars   = timelineWrapper.querySelectorAll(".timeline-bar");

    if (!header || bars.length === 0) return;

    // Approximate "today" as year + month fraction
    const today = new Date();
    const todayYearFraction = today.getFullYear() + (today.getMonth() + 1) / 12;

    // Helpers
    function getYearFractionFromAttrs(bar, prefix) {
        const yearAttr  = bar.dataset[prefix + "Year"];
        if (!yearAttr) return null;
        let year = parseInt(yearAttr, 10);
        if (isNaN(year)) return null;

        let monthAttr = bar.dataset[prefix + "Month"];
        let month = monthAttr ? parseInt(monthAttr, 10) : 1;
        if (isNaN(month) || month < 1 || month > 12) month = 1;

        return year + (month - 1) / 12;
    }

    function parseDecimalYear(raw) {
        if (!raw) return null;
        const v = String(raw).trim().toLowerCase();
        if (v === "present" || v === "now" || v === "current") return "present";
        const num = parseFloat(v);
        return isNaN(num) ? null : num;
    }

    // First pass: collect ranges & min/max
    let foundMin = Infinity;
    let foundMax = -Infinity;
    const barInfo = [];

    bars.forEach(bar => {
        // START
        let startVal = getYearFractionFromAttrs(bar, "start");
        if (startVal === null) {
            const decStart = parseDecimalYear(bar.dataset.start);
            if (decStart === null || decStart === "present") return;
            startVal = decStart;
        }

        // END
        let isLiveEnd = false;
        let endVal;

        const endAttr = bar.dataset.end;
        if (endAttr && /present|now|current/i.test(endAttr)) {
            isLiveEnd = true;
            endVal = todayYearFraction;
        } else {
            let endValFromAttrs = getYearFractionFromAttrs(bar, "end");
            if (endValFromAttrs !== null) {
                endVal = endValFromAttrs;
            } else {
                const decEnd = parseDecimalYear(bar.dataset.end);
                if (decEnd === "present") {
                    isLiveEnd = true;
                    endVal = todayYearFraction;
                } else if (decEnd === null) {
                    endVal = startVal; // zero-length if no end given
                } else {
                    endVal = decEnd;
                }
            }
        }

        // Clamp raw end to "today" so no bar can go past current date
        endVal = Math.min(endVal, todayYearFraction);

        barInfo.push({
            bar,
            startVal,
            endValForRange: endVal,
            isLiveEnd
        });

        if (startVal < foundMin) foundMin = startVal;
        if (endVal > foundMax)   foundMax = endVal;
    });

    if (!isFinite(foundMin) || !isFinite(foundMax)) return;

    // Determine min/max years (rounded) with optional wrapper overrides
    let minYear = Math.floor(foundMin);
    let maxYear = Math.ceil(foundMax);

    const overrideMin = parseFloat(timelineWrapper.dataset.minYear);
    const overrideMax = parseFloat(timelineWrapper.dataset.maxYear);

    if (!isNaN(overrideMin)) minYear = overrideMin;
    if (!isNaN(overrideMax)) maxYear = overrideMax;

    // Second pass: assign bar internal values, clamped to [minYear, maxYear]
    barInfo.forEach(info => {
        const bar = info.bar;

        let start = info.startVal;
        let end   = info.endValForRange;

        start = Math.max(minYear, Math.min(start, maxYear));
        end   = Math.max(minYear, Math.min(end,   maxYear));

        bar._startVal      = start;
        bar._baseEndVal    = end;
        bar._currentEndVal = end;
    });

    // Build the year header dynamically
    header.innerHTML = "";
    for (let year = minYear; year <= maxYear; year++) {
        const div = document.createElement("div");
        div.className = "year";
        div.textContent = year;
        header.appendChild(div);
    }

    // Helper to read CSS custom properties as numbers
    function getNumberFromCSS(el, varName, fallback) {
        const styles = window.getComputedStyle(el);
        const value = styles.getPropertyValue(varName);
        const num = parseFloat(value);
        return isNaN(num) ? fallback : num;
    }

    // Position bars based on year range
    function positionBars() {
        const headerRect  = header.getBoundingClientRect();
        const headerWidth = headerRect.width;

        const iconColWidth = getNumberFromCSS(timelineWrapper, "--timeline-icon-col", 120);
        const timelineWidth = Math.max(0, headerWidth - iconColWidth);

        const span = maxYear - minYear || 1; // avoid divide-by-zero

        bars.forEach(bar => {
            const start = bar._startVal;
            const end   = bar._currentEndVal;
            if (typeof start !== "number" || typeof end !== "number") return;

            const fractionStart = (start - minYear) / span;
            const fractionEnd   = (end   - minYear) / span;

            const pxStart = fractionStart * timelineWidth;
            const pxEnd   = fractionEnd   * timelineWidth;

            const row = bar.closest(".company-row");
            if (!row) return;

            const rowRect = row.getBoundingClientRect();
            const offset  = headerRect.left - rowRect.left;

            bar.style.left  = (offset + iconColWidth + pxStart) + "px";
            bar.style.width = Math.max(0, pxEnd - pxStart) + "px";
        });
    }

    // Let each row know what its bar color is so CSS can use it
    rows.forEach(row => {
        const bar  = row.querySelector(".timeline-bar");
        const icon = row.querySelector(".company-icon");
        if (!bar || !icon) return;

        const barStyle = window.getComputedStyle(bar);
        const bgColor  = barStyle.backgroundColor;
        if (bgColor) {
            row.style.setProperty("--bar-color", bgColor);
        }
    });

    // Initial layout + on resize
    positionBars();
    window.addEventListener("resize", positionBars);

    // Scroll-in animation
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    bars.forEach(bar => observer.observe(bar));

    // Smooth scrolling for anchor links (e.g., clicking bars)
    document.documentElement.style.scrollBehavior = "smooth";
});
