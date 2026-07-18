
$(document).ready(function () {
   // Function to get the appropriate background color based on color scheme
   function getZoomBackground() {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.95)';
   }

   // Initialize medium-zoom with appropriate background
   let zoomInstance = mediumZoom('.zoom-image', {
      margin: 50,
      background: getZoomBackground()
   });

   // Listen for color scheme changes and update zoom background
   window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      zoomInstance.update({ background: getZoomBackground() });
   });

   var introLede = $(".intro-lede");
   var header = $(".header");
   var introScroll = $(".intro-scroll");

   setTimeout(function () {
      introLede.addClass('intro-loaded');
   }, 300)

   // GitHub-style contribution graph beneath the hero.
   renderContributions('zackgemmell');

   // Header animation only on home page
   if ($('body').attr('id') === 'home') {
      // Header appears immediately with slide-in animation on home page
      header.addClass('header-loaded');
   } else {
      // Header appears instantly without animation on other pages
      header.addClass('header-loaded-instant');
   }

   setTimeout(function () {
      introScroll.addClass('intro-scroll-loaded');
   }, 1500)

   $(window).on('scroll', function () {
      var scrollPosition = $(this).scrollTop();
      // console.log(scrollPosition);

      if (scrollPosition > 0) {
         introScroll.removeClass('intro-scroll-loaded');

         header.addClass('header-scrolled');
      } else {
         introScroll.addClass('intro-scroll-loaded');
         header.removeClass('header-scrolled');
      }

      // Show/hide navbar title on post pages
      var storyTitle = $('.story-title');
      var navbarTitle = $('#navbar-title');
      var logoText = $('.logo-text');

      if (storyTitle.length && navbarTitle.length) {
         var titleBottom = storyTitle.offset().top + storyTitle.outerHeight();
         var isMobile = window.innerWidth <= 696;

         if (scrollPosition > titleBottom) {
            navbarTitle.show().addClass('visible');

            // Add mobile-specific vertical animation
            if (isMobile) {
               setTimeout(function () {
                  logoText.addClass('slide-up');
                  navbarTitle.addClass('slide-up');
               }, 50); // Small delay to ensure smooth animation
            }
         } else {
            navbarTitle.removeClass('visible').hide();

            // Remove mobile-specific animation classes
            if (isMobile) {
               logoText.removeClass('slide-up');
               navbarTitle.removeClass('slide-up');
            }
         }
      }
   });


   // Add smooth scrolling to all links
   $("#header-home > a").on('click', function (event) {

      // Make sure this.hash has a value before overriding default behavior
      if (this.hash !== "") {
         // Prevent default anchor click behavior
         event.preventDefault();

         // Store hash
         var hash = this.hash;

         // Calculate offset for fixed header
         var headerOffset = 100; // Offset to account for fixed header height + spacing
         var targetPosition = $(hash).offset().top - headerOffset;

         console.log('Target element position:', $(hash).offset().top);
         console.log('Scroll position with offset:', targetPosition);

         // Using jQuery's animate() method to add smooth page scroll
         // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
         $('html, body').animate({
            scrollTop: targetPosition
         }, 800, function () {

            // Add hash (#) to URL when done scrolling (default click behavior)
            // window.location.hash = hash;
         });
      } // End if
   });

   // Handle window resize to adjust mobile animations
   $(window).on('resize', function () {
      var navbarTitle = $('#navbar-title');
      var logoText = $('.logo-text');
      var isMobile = window.innerWidth <= 696;

      // Reset animation classes when switching between mobile and desktop
      if (!isMobile) {
         navbarTitle.removeClass('slide-up');
         logoText.removeClass('slide-up');
      } else if (navbarTitle.hasClass('visible')) {
         // If we're switching to mobile and navbar is visible, apply mobile animations
         navbarTitle.addClass('slide-up');
         logoText.addClass('slide-up');
      }
   });
});

// Renders a GitHub-style contribution heatmap into #contrib-graph.
// Pulls real data from a public contributions proxy; on any failure it hides
// the module rather than showing fabricated activity.
function renderContributions(username) {
   var graph = document.getElementById('contrib-graph');
   var wrap = document.getElementById('contrib');
   var countEl = document.getElementById('contrib-count');
   if (!graph || !wrap) return;

   // The hero text animates in first (see .intro-loaded); hold the graph back
   // until that has landed so the two reveal in sequence on page load.
   var startTime = Date.now();
   var revealDelay = 650;

   var url = 'https://github-contributions-api.jogruber.de/v4/' + username + '?y=last';

   fetch(url)
      .then(function (res) {
         if (!res.ok) throw new Error('bad status');
         return res.json();
      })
      .then(function (data) {
         var days = (data && data.contributions) || [];
         if (!days.length) throw new Error('no data');

         var frag = document.createDocumentFragment();

         // Pad the leading week so columns align to weekdays (Sunday = 0).
         var firstDay = new Date(days[0].date + 'T00:00:00').getDay();
         for (var p = 0; p < firstDay; p++) {
            frag.appendChild(document.createElement('span')).className = 'contrib-cell';
         }

         days.forEach(function (d) {
            var cell = document.createElement('span');
            cell.className = 'contrib-cell';
            if (d.level > 0) cell.setAttribute('data-level', d.level);
            cell.title = d.count + ' contributions on ' + d.date;
            frag.appendChild(cell);
         });

         graph.appendChild(frag);

         // Month labels across the top, one grid cell per week column.
         var monthsEl = document.getElementById('contrib-months');
         if (monthsEl) {
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var columns = Math.ceil((firstDay + days.length) / 7);
            var mFrag = document.createDocumentFragment();
            var lastMonth = -1;
            var lastLabelCol = -99;
            for (var c = 0; c < columns; c++) {
               var label = document.createElement('span');
               label.className = 'contrib-month';
               var idx = c * 7 - firstDay; // date at the top of this column
               if (idx >= 0 && idx < days.length) {
                  var m = new Date(days[idx].date + 'T00:00:00').getMonth();
                  // Label the first column of a new month, but keep labels spaced out.
                  if (m !== lastMonth && c - lastLabelCol >= 3 && c < columns - 1) {
                     label.textContent = months[m];
                     lastLabelCol = c;
                  }
                  lastMonth = m;
               }
               mFrag.appendChild(label);
            }
            monthsEl.appendChild(mFrag);
         }

         var total = (data.total && data.total.lastYear) ||
            days.reduce(function (sum, d) { return sum + d.count; }, 0);
         if (countEl) {
            countEl.textContent = total.toLocaleString() + ' contributions in the last year';
         }

         // Reveal only after the hero text has animated in. If the fetch took
         // longer than the delay, show as soon as the data is ready.
         var wait = Math.max(0, revealDelay - (Date.now() - startTime));
         setTimeout(function () {
            wrap.classList.add('contrib-visible');
         }, wait);
      })
      .catch(function () {
         wrap.style.display = 'none';
      });
}
