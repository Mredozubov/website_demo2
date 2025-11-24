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

    // Parse data-start / data-end values
    function parseYearValue(raw) {
        if (!raw) return null;
        const v = String(raw).trim().toLowerCase();
        if (v === "present" || v === "now" || v === "current") return "present";
        const num = parseFloat(v);
        return isNaN(num) ? null : num;
    }

    // Approximate "today" as year + month fraction (you can refine later if you like)
    const today = new Date();
    const todayYearFraction = today.getFullYear() + (today.getMonth() + 1) / 12;

    // First pass: collect ranges & min/max
    let foundMin = Infinity;
    let foundMax = -Infinity;
    const barInfo = [];

    bars.forEach(bar => {
        const rawStart = parseYearValue(bar.dataset.start);
        const rawEnd   = parseYearValue(bar.dataset.end);

        if (rawStart === null) return;

        const isLiveEnd = (rawEnd === "present");
        const startVal  = (rawStart === "present") ? todayYearFraction : rawStart;

        let endValForRange;
        if (isLiveEnd) {
            // For range detection, live end is "today"
            endValForRange = todayYearFraction;
        } else if (rawEnd === null) {
            endValForRange = startVal;
        } else {
            endValForRange = rawEnd;
        }

        barInfo.push({
            bar,
            startVal,
            endValForRange,
            isLiveEnd
        });

        if (startVal < foundMin) foundMin = startVal;
        if (endValForRange > foundMax) foundMax = endValForRange;
    });

    if (!isFinite(foundMin) || !isFinite(foundMax)) return;

    // Determine min/max years (rounded) with optional wrapper overrides
    let minYear = Math.floor(foundMin);
    let maxYear = Math.ceil(foundMax);

    const overrideMin = parseFloat(timelineWrapper.dataset.minYear);
    const overrideMax = parseFloat(timelineWrapper.dataset.maxYear);

    if (!isNaN(overrideMin)) minYear = overrideMin;
    if (!isNaN(overrideMax)) maxYear = overrideMax;

    // Second pass: assign bar internal values
    barInfo.forEach(info => {
        const bar = info.bar;

        bar._startVal = info.startVal;

        // Base layout end:
        //  - For live "present" bars: extend to the full maxYear by default
        //  - On hover we'll pull it back to today's date
        if (info.isLiveEnd) {
            bar._baseEndVal = maxYear;
            bar.dataset.liveEnd = "true";
        } else {
            bar._baseEndVal = info.endValForRange;
        }

        // Current end value used for actual positioning (changes on hover for live bars)
        bar._currentEndVal = bar._baseEndVal;
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

        bars.forEach(bar => {
            const start = bar._startVal;
            const end   = bar._currentEndVal;
            if (typeof start !== "number" || typeof end !== "number") return;

            const fractionStart = (start - minYear) / (maxYear - minYear);
            const fractionEnd   = (end   - minYear) / (maxYear - minYear);

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

    // Live-end bars (e.g., AHHA with data-end="present"):
    // On row hover, snap bar to "today"; on mouse out, restore base (maxYear).
    rows.forEach(row => {
        const bar = row.querySelector(".timeline-bar");
        if (!bar) return;

        const endAttr = bar.dataset.end ? bar.dataset.end.toLowerCase() : "";
        const isLive  = (endAttr === "present" || endAttr === "now" || endAttr === "current");

        if (!isLive) return;

        row.addEventListener("mouseenter", function () {
            bar._currentEndVal = todayYearFraction;
            positionBars();
        });

        row.addEventListener("mouseleave", function () {
            bar._currentEndVal = bar._baseEndVal;
            positionBars();
        });
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




