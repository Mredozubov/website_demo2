/*
	Strata by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var $window = $(window),
		$body = $('body'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main = $('#main'),
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
			xsmall:  [ null,      '480px'  ],
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
				if (browser.name == 'ie'
				||	browser.mobile)
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

// RANDOM STUFF - TIMELINE


// RANDOM STUFF - TIMELINE

document.addEventListener("DOMContentLoaded", function () {
    const minYear = 2022;
    const maxYear = 2026;

    const header = document.querySelector("#two .timeline-header");
    const bars   = document.querySelectorAll("#two .timeline-bar");

    if (!header || bars.length === 0) {
        // Timeline not on this page, bail out quietly
        return;
    }

    function positionBars() {
        const headerRect  = header.getBoundingClientRect();
        const headerWidth = headerRect.width;

        // This must match the padding-left in CSS AND the icon column width
        const iconColumnWidth = 120;

        // Actual width used for the years (2022–2026) — exclude the icon space
        const timelineWidth = headerWidth - iconColumnWidth;

        bars.forEach(bar => {
            const start = parseFloat(bar.dataset.start);
            const end   = parseFloat(bar.dataset.end);

            if (isNaN(start) || isNaN(end)) return;

            // 0–1 fractions across the range
            const fractionStart = (start - minYear) / (maxYear - minYear);
            const fractionEnd   = (end   - minYear) / (maxYear - minYear);

            const pxStart = fractionStart * timelineWidth;
            const pxEnd   = fractionEnd   * timelineWidth;

            // Left edge: icon column + where this bar starts in the year grid
            bar.style.left  = (iconColumnWidth + pxStart) + "px";
            bar.style.width = (pxEnd - pxStart) + "px";
        });
    }

    // Run on load and resize
    positionBars();
    window.addEventListener("resize", positionBars);

    // Scroll-in animation
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.2 });

    bars.forEach(bar => observer.observe(bar));

    // Smooth scroll for anchor links
    document.documentElement.style.scrollBehavior = "smooth";
});
