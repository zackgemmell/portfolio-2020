
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

// Renders a GitHub-style contribution heatmap that bleeds off both edges of the
// screen. The real year (from a public contributions proxy) stays centred and
// green; simulated grayscale "past" cells fill the space to its left and empty
// gray "future" cells fill the space to its right, so the grid appears to
// continue beyond the viewport in both directions.
function renderContributions(username) {
   var graph = document.getElementById('contrib-graph');
   var monthsEl = document.getElementById('contrib-months');
   var wrap = document.getElementById('contrib');
   var countEl = document.getElementById('contrib-count');
   if (!graph || !wrap) return;

   var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
   var REAL_COLS = 53;              // a GitHub year is always 53 week columns
   var REAL_CELLS = REAL_COLS * 7;

   var reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

   // Generative model for the simulated "past". Rather than i.i.d. noise (which
   // reads as flat salt-and-pepper), it mimics how real contribution history
   // looks: each week has a drifting "intensity" so activity comes in busy and
   // quiet streaks (with occasional near-empty weeks for gaps/vacations and the
   // odd burst), and weekdays are busier than weekends. simCache holds the level
   // per past cell in column-major order from the left (oldest -> newest), so the
   // walk stays coherent as it's extended and the pattern is stable across rebuilds.
   var DOW = [0.3, 1.0, 1.05, 1.05, 1.0, 0.85, 0.28]; // Sun..Sat weekday bias
   var simCache = [];
   var simIntensity = 0.5; // current week's activity level (random walk)
   function simExtendTo(n) {
      while (simCache.length < n) {
         var row = simCache.length % 7; // 0 = Sunday (top row)
         if (row === 0) {
            // New week: drift the intensity, but mean-revert toward a healthy
            // baseline so it oscillates (busy/quiet streaks) instead of wandering
            // into long dead zones — the visible window is only ~40 weeks, so it
            // needs to stay lively. Rare resets give the odd empty week (a gap) or
            // busy burst for variety.
            simIntensity += (0.52 - simIntensity) * 0.2 + (Math.random() - 0.5) * 0.42;
            if (simIntensity < 0.05) simIntensity = 0.05;
            else if (simIntensity > 0.95) simIntensity = 0.95;
            var r = Math.random();
            if (r < 0.06) simIntensity = Math.random() * 0.1;
            else if (r < 0.11) simIntensity = 0.7 + Math.random() * 0.25;
         }
         var a = simIntensity * DOW[row]; // this day's likelihood of activity
         var lvl = 0;
         // A day off even in a busy week (the * 0.9) keeps busy stretches from
         // filling in solid; the noisy magnitude keeps them mostly mid-level with
         // only the occasional darkest cell, the way real activity reads.
         if (Math.random() < a * 0.9) {
            var m = a * (0.4 + Math.random() * 0.9);
            lvl = m < 0.4 ? 1 : m < 0.72 ? 2 : m < 1.02 ? 3 : 4;
         }
         simCache.push(lvl);
      }
   }

   // Cell size and how many columns to add on each side to overflow the screen.
   // The cell size is derived from the hero column so the real block keeps the
   // same footprint it had before; the same pitch then tiles out to the edges.
   function geometry() {
      var gap = window.innerWidth <= 696 ? 2 : 3;
      var colW = Math.min(wrap.clientWidth || 600, 600);
      var cell = (colW - gap * (REAL_COLS - 1)) / REAL_COLS;
      if (cell < 4) cell = 4;
      var pitch = cell + gap;
      // Enough columns to reach each screen edge from the centred real block,
      // plus a little slack so the edge fade never exposes bare background.
      var side = Math.ceil((window.innerWidth / 2 + 80) / pitch);
      return { gap: gap, cell: cell, pitch: pitch, side: side };
   }

   var days = null;          // real contribution data once fetched
   var revealDone = false;
   var pendingPaint = null;  // field colouring deferred until the reveal finishes

   // Builds (or rebuilds) the whole full-bleed field from the current `days`.
   // animate=true runs the green cascade; animate=false paints instantly (resize).
   function build(animate) {
      var g = geometry();

      graph.style.gridTemplateRows = 'repeat(7, ' + g.cell + 'px)';
      graph.style.gridAutoColumns = g.cell + 'px';
      graph.style.gap = g.gap + 'px';
      graph.style.justifyContent = 'center';
      graph.style.width = '100%';
      // Publish the cell geometry on the .contrib wrap (an ancestor of both the
      // graph and the footer legend) so the legend swatches always match the
      // graph squares. The radius scales with the cell size so the small cells on
      // narrow screens stay squares — a fixed radius turns a ~4px cell into a circle.
      wrap.style.setProperty('--cell-size', g.cell + 'px');
      wrap.style.setProperty('--cell-radius', Math.max(1, Math.round(g.cell * 0.2)) + 'px');
      if (monthsEl) {
         monthsEl.style.gridAutoColumns = g.cell + 'px';
         monthsEl.style.gap = g.gap + 'px';
         monthsEl.style.justifyContent = 'center';
         monthsEl.style.width = '100%';
      }

      var frag = document.createDocumentFragment();
      function newCell() {
         var c = document.createElement('span');
         c.className = 'contrib-cell';
         frag.appendChild(c);
         return c;
      }

      // One continuous left-to-right diagonal wave sweeps the whole grid — the
      // grayscale past first, then the green year — so it reads as a single
      // cascade. Each cell's delay comes from its GLOBAL column (past columns
      // come before the year's) plus a per-row offset for the diagonal. It's
      // normalised by startCol so the wave enters at the left screen edge instead
      // of after the off-screen columns silently play out.
      var doCascade = animate && !reduceMotion;
      var COL_STEP = 0.016, ROW_STEP = 0.03;
      var totalWidth = (2 * g.side + REAL_COLS) * g.pitch - g.gap;
      var startCol = Math.max(0, Math.floor((totalWidth - window.innerWidth) / 2 / g.pitch));
      var maxDelay = 0; // longest per-cell cascade delay, in seconds
      function cascadeDelay(globalCol, row) {
         var d = Math.max(0, globalCol - startCol) * COL_STEP + row * ROW_STEP;
         if (d > maxDelay) maxDelay = d;
         return d;
      }

      // LEFT: past — simulated grayscale data, held stable via simCache. The
      // shade is applied later in paint(), together with (and the same way as)
      // the green cascade: both wait until the hero reveal animation on .contrib
      // has finished. Colouring cells while that ancestor opacity/blur animation
      // is running gets dropped by the compositor, leaving them stuck on l0.
      var grayFills = [];
      simExtendTo(g.side * 7);
      for (var p = 0; p < g.side * 7; p++) {
         var pc = newCell();
         if (simCache[p] > 0) {
            if (doCascade) pc.style.transitionDelay = cascadeDelay(Math.floor(p / 7), p % 7) + 's';
            grayFills.push([pc, simCache[p]]);
         }
      }

      // CENTRE: the real year (gray placeholders; coloured green below).
      var realCells = [];
      for (var r = 0; r < REAL_CELLS; r++) realCells.push(newCell());

      // RIGHT: future — empty gray cells.
      for (var f = 0; f < g.side * 7; f++) newCell();

      graph.innerHTML = '';
      graph.appendChild(frag);

      // Months: an empty label per side column, real labels over the centre, so
      // the row shares the graph's column geometry and stays perfectly aligned.
      if (monthsEl) {
         var mFrag = document.createDocumentFragment();
         function addMonth(text) {
            var m = document.createElement('span');
            m.className = 'contrib-month';
            if (text) m.textContent = text;
            mFrag.appendChild(m);
         }
         for (var ls = 0; ls < g.side; ls++) addMonth('');
         var firstDay = days ? new Date(days[0].date + 'T00:00:00').getDay() : 0;
         var lastLabelCol = -99;
         for (var c = 0; c < REAL_COLS; c++) {
            var text = '';
            if (days) {
               // Label a column with a month when that week contains the 1st of
               // the month — the column where the month truly begins. Keying off
               // the 1st (rather than the first column to merely enter a new
               // month) skips the leading/trailing partial months that don't
               // contain a 1st, so a Jul->Jul year reads Aug ... Jul cleanly
               // instead of dropping August against the leading partial July.
               var top = c * 7 - firstDay; // day index at the top of this column
               for (var k = 0; k < 7; k++) {
                  var di = top + k;
                  if (di < 0 || di >= days.length) continue;
                  var dt = new Date(days[di].date + 'T00:00:00');
                  if (dt.getDate() === 1) {
                     if (c - lastLabelCol >= 3 && c < REAL_COLS - 1) {
                        text = MONTHS[dt.getMonth()];
                        lastLabelCol = c;
                     }
                     break;
                  }
               }
            }
            addMonth(text);
         }
         for (var rs = 0; rs < g.side; rs++) addMonth('');
         monthsEl.innerHTML = '';
         monthsEl.appendChild(mFrag);
      }

      // Map the real year onto the centre cells (weekday rows, Sunday = 0). Its
      // columns sit after the past's, so the wave flows straight on from the
      // grayscale into the green (global column = side + column within the year).
      var greenFills = [];
      if (days) {
         var fd = new Date(days[0].date + 'T00:00:00').getDay();

         // The real year usually opens with an empty stretch before the first day
         // of activity. Continue the grayscale "past" through it (up to that first
         // active day) so the simulated history flows seamlessly into the real
         // data instead of leaving a gap. These leading cells keep the same
         // column-major walk as the past (global index = side*7 + slot).
         var firstActive = -1;
         for (var fi = 0; fi < days.length; fi++) {
            if (days[fi].level > 0) { firstActive = fi; break; }
         }
         var firstActiveSlot = firstActive < 0 ? REAL_CELLS : fd + firstActive;
         simExtendTo(g.side * 7 + firstActiveSlot);
         for (var s0 = 0; s0 < firstActiveSlot; s0++) {
            var glvl = simCache[g.side * 7 + s0];
            if (glvl > 0) {
               var lc = realCells[s0];
               if (doCascade) {
                  lc.style.transitionDelay =
                     cascadeDelay(g.side + Math.floor(s0 / 7), s0 % 7) + 's';
               }
               grayFills.push([lc, glvl]);
            }
         }

         days.forEach(function (d, i) {
            var slot = fd + i;
            if (slot >= REAL_CELLS) return;
            var cell = realCells[slot];
            cell.title = d.count + ' contributions on ' + d.date;
            if (d.level > 0) {
               if (doCascade) {
                  cell.style.transitionDelay =
                     cascadeDelay(g.side + Math.floor(slot / 7), slot % 7) + 's';
               }
               greenFills.push([cell, d.level]);
            }
         });
      }

      // Colour the whole field in one pass: the grayscale past and the green
      // year both transition from the l0 base. A single style flush first commits
      // that base so the background-color transitions resolve; without it (or if
      // this runs mid-reveal) the cells stay stuck on l0.
      function paint() {
         void graph.offsetWidth;
         for (var i = 0; i < grayFills.length; i++) {
            grayFills[i][0].setAttribute('data-gray', grayFills[i][1]);
         }
         for (var j = 0; j < greenFills.length; j++) {
            greenFills[j][0].setAttribute('data-level', greenFills[j][1]);
         }
         // Release the legend swatches as the tail of the cascade fades in.
         if (days) {
            setTimeout(function () {
               wrap.classList.add('contrib-legend-visible');
            }, maxDelay * 1000);
         }
      }

      // Run once the reveal has finished; if it's already done (data arrived
      // late, or a resize rebuild), paint straight away.
      if (revealDone) paint();
      else pendingPaint = paint;
   }

   // Show the gray/grayscale field immediately so the hero has shape while the
   // real data loads; match it with a skeleton bar in place of the count.
   build(true);
   if (countEl) countEl.classList.add('contrib-count-loading');

   // The hero text animates in first (see .intro-loaded); reveal the grid in
   // sequence so the two land together, then let the green cascade run once the
   // reveal has finished (or immediately, if the data is already in by then).
   var REVEAL_DELAY = 650;
   var REVEAL_DURATION = 900; // keep in sync with .contrib transition in _home.scss
   setTimeout(function () {
      wrap.classList.add('contrib-visible');
   }, REVEAL_DELAY);
   setTimeout(function () {
      revealDone = true;
      if (pendingPaint) { pendingPaint(); pendingPaint = null; }
   }, REVEAL_DELAY + REVEAL_DURATION);

   // Rebuild the field on resize so it keeps reaching the screen edges; the
   // simulated pattern and the real year stay put (simCache + cached `days`).
   var resizeTimer = null;
   window.addEventListener('resize', function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { build(false); }, 200);
   });

   var url = 'https://github-contributions-api.jogruber.de/v4/' + username + '?y=last';

   fetch(url)
      .then(function (res) {
         if (!res.ok) throw new Error('bad status');
         return res.json();
      })
      .then(function (data) {
         var fetched = (data && data.contributions) || [];
         if (!fetched.length) throw new Error('no data');
         days = fetched;

         // Rebuild with the real year in place. Geometry and the simulated past
         // are unchanged (deterministic + cached), so only the centre gains its
         // green cascade — the surrounding field doesn't shift or reshuffle.
         build(true);

         var total = (data.total && data.total.lastYear) ||
            days.reduce(function (sum, d) { return sum + d.count; }, 0);
         if (countEl) {
            countEl.classList.remove('contrib-count-loading');
            countEl.textContent = total.toLocaleString() + ' contributions in the last year';
         }
      })
      .catch(function () {
         // Keep the grayscale field on screen (it still reads as intentional
         // texture); just drop the loading bar rather than leaving it pulsing.
         if (countEl) countEl.classList.remove('contrib-count-loading');
      });
}
