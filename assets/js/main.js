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

document.addEventListener("DOMContentLoaded", function () {
    const minYear = 2022;
    const maxYear = 2026;

    // Today's date for "current" jobs like AHHA
    const today = new Date();
    const todayYearFloat = today.getFullYear() + today.getMonth() / 12;

    const rows = document.querySelectorAll("#two .company-row");

    if (!rows.length) {
        return; // no timeline on this page
    }

    function positionBars() {
        rows.forEach(row => {
            const bar = row.querySelector(".timeline-bar");
            if (!bar) return;

            const rawStart = bar.dataset.start;
            const rawEnd   = bar.dataset.end;

            let startYear = parseFloat(rawStart);
            let endYear;

            // Allow the string "current" to mean "up to today"
            if (rawEnd === "current") {
                endYear = todayYearFloat;
            } else {
                endYear = parseFloat(rawEnd);
            }

            if (isNaN(startYear) || isNaN(endYear)) return;

            // Clamp within [minYear, maxYear] and ensure end >= start
            if (endYear < startYear) endYear = startYear;
            if (startYear < minYear) startYear = minYear;
            if (endYear > maxYear)   endYear   = maxYear;

            // How wide is this entire row?
            const rowRect = row.getBoundingClientRect();
            const rowWidth = rowRect.width;

            // This must match the name+icon column width in CSS
            const iconColumnWidth = 160;

            // The space available for the year timeline inside this row
            const timelineWidth = rowWidth - iconColumnWidth;
            if (timelineWidth <= 0) return;

            // Fractions across the range
            const fractionStart = (startYear - minYear) / (maxYear - minYear);
            const fractionEnd   = (endYear   - minYear) / (maxYear - minYear);

            const pxStart = fractionStart * timelineWidth;
            const pxEnd   = fractionEnd   * timelineWidth;

            const left  = iconColumnWidth + pxStart;
            const width = Math.max(pxEnd - pxStart, 0);

            bar.style.left  = left + "px";
            bar.style.width = width + "px";
        });
    }

    // Initial layout + on resize
    positionBars();
    window.addEventListener("resize", positionBars);

    // Optional scroll-in effect: just add .visible when in view
    if (window.IntersectionObserver) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll("#two .timeline-bar").forEach(bar => observer.observe(bar));
    }

    // Smooth scroll for the bar links
    document.documentElement.style.scrollBehavior = "smooth";
});
