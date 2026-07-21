
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
   // Seeded PRNG (mulberry32) so the simulated past is identical on every load
   // instead of reshuffling. The fixed seed makes simCache[i] deterministic, so
   // the same viewport always renders the same pattern. Change the seed to pick a
   // different (but still stable) history.
   var simSeed = 0x5eed1234 | 0;
   function simRand() {
      simSeed = (simSeed + 0x6D2B79F5) | 0;
      var t = Math.imul(simSeed ^ (simSeed >>> 15), 1 | simSeed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
   }
   function simExtendTo(n) {
      while (simCache.length < n) {
         var row = simCache.length % 7; // 0 = Sunday (top row)
         if (row === 0) {
            // New week: drift the intensity, but mean-revert toward a healthy
            // baseline so it oscillates (busy/quiet streaks) instead of wandering
            // into long dead zones — the visible window is only ~40 weeks, so it
            // needs to stay lively. Rare resets give the odd empty week (a gap) or
            // busy burst for variety.
            simIntensity += (0.52 - simIntensity) * 0.2 + (simRand() - 0.5) * 0.42;
            if (simIntensity < 0.05) simIntensity = 0.05;
            else if (simIntensity > 0.95) simIntensity = 0.95;
            var r = simRand();
            if (r < 0.06) simIntensity = simRand() * 0.1;
            else if (r < 0.11) simIntensity = 0.7 + simRand() * 0.25;
         }
         var a = simIntensity * DOW[row]; // this day's likelihood of activity
         var lvl = 0;
         // A day off even in a busy week (the * 0.9) keeps busy stretches from
         // filling in solid; the noisy magnitude keeps them mostly mid-level with
         // only the occasional darkest cell, the way real activity reads.
         if (simRand() < a * 0.9) {
            var m = a * (0.4 + simRand() * 0.9);
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
   var curGeo = null;        // geometry from the most recent layout (for the wave)
   var pastCells = [];       // left "past" cells, column-major from the left edge
   var realCells = [];       // centre real-year cells, column-major
   var resolved = false;     // true once the fetch has settled (data or failure)
   var hasColored = false;   // true once the field's colours have been applied

   // Grid-reveal state. The empty gray grid animates in first (row by row,
   // cascading upwards); only once it's settled AND the data has loaded do the
   // colours wash in as a second, diagonal wave.
   var gridRevealed = false;

   // Two independent, staggered entrances — each with its own delay custom
   // property so they never clobber each other:
   //   Phase 1 (--row-delay):  opacity, a row of cells at a time, bottom-up.
   //   Phase 2 (--wave-delay): background-color, a left-to-right diagonal wave.
   var ROW_REVEAL_STEP = 0.08;            // s between each row of the grid reveal
   var GRID_FADE = 420;                   // ms each row takes to fade in
   var COL_STEP = 0.016, ROW_STEP = 0.03; // colour-wave per-column / per-row stagger

   // Builds (or rebuilds) the empty full-bleed grid for the current geometry.
   // Cells start hidden (CSS opacity 0) so Phase 1 can cascade them in; once the
   // reveal has finished, later rebuilds (resize) create them settled/visible.
   function layout() {
      var g = geometry();
      curGeo = g;

      graph.style.gridTemplateRows = 'repeat(7, ' + g.cell + 'px)';
      graph.style.gridAutoColumns = g.cell + 'px';
      graph.style.gap = g.gap + 'px';
      graph.style.justifyContent = 'center';
      graph.style.width = '100%';
      // Publish the cell geometry on the .contrib wrap (an ancestor of the graph)
      // so the CSS can size and round the cells to match. The radius scales with
      // the cell size so the small cells on narrow screens stay squares — a fixed
      // radius turns a ~4px cell into a circle.
      wrap.style.setProperty('--cell-size', g.cell + 'px');
      wrap.style.setProperty('--cell-radius', Math.max(1, Math.round(g.cell * 0.2)) + 'px');
      if (monthsEl) {
         monthsEl.style.gridAutoColumns = g.cell + 'px';
         monthsEl.style.gap = g.gap + 'px';
         monthsEl.style.justifyContent = 'center';
         monthsEl.style.width = '100%';
      }

      // Cells fade in a row at a time, cascading UPWARDS: the bottom row (row 6,
      // Saturday) leads and the top row (row 0, Sunday) lands last. The grid is
      // laid out column-major, so the per-row delay has to be set per cell here
      // (CSS can't target a "row" across the column flow). After the reveal has
      // finished, cells are built already-visible so a resize doesn't replay it.
      var frag = document.createDocumentFragment();
      pastCells = [];
      realCells = [];
      function newCell(row) {
         var c = document.createElement('span');
         c.className = 'contrib-cell';
         c.style.setProperty('--row-delay',
            (gridRevealed ? 0 : (6 - row) * ROW_REVEAL_STEP) + 's');
         frag.appendChild(c);
         return c;
      }

      // LEFT: past — simulated grayscale (coloured later, in the data wave).
      simExtendTo(g.side * 7);
      for (var p = 0; p < g.side * 7; p++) pastCells.push(newCell(p % 7));

      // CENTRE: the real year (coloured later).
      for (var r = 0; r < REAL_CELLS; r++) realCells.push(newCell(r % 7));

      // RIGHT: future — empty gray cells.
      for (var f = 0; f < g.side * 7; f++) newCell(f % 7);

      graph.innerHTML = '';
      graph.appendChild(frag);

      // If the row cascade is already done, these fresh cells must appear settled
      // (visible, no opacity transition) rather than cascading a second time.
      if (gridRevealed) {
         graph.classList.remove('contrib-grid-in');
         graph.classList.add('contrib-grid-static');
      }

      // Colour straight away if the fetch has settled and the grid's in place;
      // otherwise finishGridReveal()/the fetch will call paint() when ready.
      if (resolved && gridRevealed) paint(false);
   }

   // Colours the field from `days`: the grayscale past always, then (if a year
   // loaded) the green real year and the month labels. animate=true runs the
   // diagonal wave (first reveal); animate=false paints settled (resize). Cells
   // were built by layout() and persist, so data arriving never disturbs the
   // grid reveal already in flight.
   function paint(animate) {
      var g = curGeo || geometry();
      var doCascade = animate && !reduceMotion;
      // The past only cascades on the very first colouring. Later paints (resize)
      // render it settled, otherwise the grayscale fades in a second time.
      var animatePast = doCascade && !hasColored;

      // One continuous left-to-right diagonal wave sweeps the whole grid — the
      // grayscale past first, then the green year — so it reads as a single
      // cascade. Each cell's delay comes from its GLOBAL column plus a per-row
      // offset, normalised by startCol so the wave enters at the left screen edge.
      var totalWidth = (2 * g.side + REAL_COLS) * g.pitch - g.gap;
      var startCol = Math.max(0, Math.floor((totalWidth - window.innerWidth) / 2 / g.pitch));
      var maxDelay = 0; // longest per-cell wave delay, in seconds
      function waveDelay(globalCol, row) {
         var d = Math.max(0, globalCol - startCol) * COL_STEP + row * ROW_STEP;
         if (d > maxDelay) maxDelay = d;
         return d;
      }

      // A cell either cascades in — its shade applied after a style flush so the
      // background-color transition runs as a wave — or is painted settled with
      // no delay. Cascading shades wait for the flush below because colouring a
      // cell while an ancestor animation is still running can drop the transition.
      var deferredFills = [];
      function fill(cell, attr, level, animated, globalCol, row) {
         if (level <= 0) return;
         if (animated) {
            cell.style.setProperty('--wave-delay', waveDelay(globalCol, row) + 's');
            deferredFills.push([cell, attr, level]);
         } else {
            cell.style.setProperty('--wave-delay', '0s');
            cell.setAttribute(attr, level);
         }
      }

      // LEFT: past grayscale — always coloured (independent of the fetch), so a
      // failed year still leaves the field its intended texture.
      for (var pi = 0; pi < pastCells.length; pi++) {
         fill(pastCells[pi], 'data-gray', simCache[pi], animatePast, Math.floor(pi / 7), pi % 7);
      }

      // CENTRE: the real year (weekday rows, Sunday = 0). Its columns sit after
      // the past's, so the wave flows straight on from grayscale into green.
      if (days) {
         var fd = new Date(days[0].date + 'T00:00:00').getDay();

         // The real year usually opens with an empty stretch before the first day
         // of activity. Fill it with simulated activity (coloured green so it
         // blends with the real data) so the year reads as full from the start.
         var firstActive = -1;
         for (var fi = 0; fi < days.length; fi++) {
            if (days[fi].level > 0) { firstActive = fi; break; }
         }
         var firstActiveSlot = firstActive < 0 ? REAL_CELLS : fd + firstActive;
         simExtendTo(g.side * 7 + firstActiveSlot);
         for (var s0 = 0; s0 < firstActiveSlot; s0++) {
            fill(realCells[s0], 'data-level', simCache[g.side * 7 + s0], doCascade,
               g.side + Math.floor(s0 / 7), s0 % 7);
         }

         days.forEach(function (d, i) {
            var slot = fd + i;
            if (slot >= REAL_CELLS) return;
            var cell = realCells[slot];
            cell.title = d.count + ' contributions on ' + d.date;
            fill(cell, 'data-level', d.level, doCascade,
               g.side + Math.floor(slot / 7), slot % 7);
         });

         paintMonths(g);
      }

      // Commit the l0 base with one style flush, then apply the deferred shades so
      // their background-color transitions all resolve as a wave from l0.
      void graph.offsetWidth;
      for (var di = 0; di < deferredFills.length; di++) {
         deferredFills[di][0].setAttribute(deferredFills[di][1], deferredFills[di][2]);
      }

      // Once the wave has finished, fade in the supporting detail (month labels,
      // summary count) together — but only when a year actually loaded.
      if (days) {
         setTimeout(function () {
            wrap.classList.add('contrib-details-visible');
         }, maxDelay * 1000);
      }

      hasColored = true;
   }

   // Month labels: an empty slot per side column, real labels over the centre, so
   // the row shares the graph's column geometry and stays perfectly aligned.
   function paintMonths(g) {
      if (!monthsEl || !days) return;
      var mFrag = document.createDocumentFragment();
      function addMonth(text) {
         var m = document.createElement('span');
         m.className = 'contrib-month';
         if (text) m.textContent = text;
         mFrag.appendChild(m);
      }
      for (var ls = 0; ls < g.side; ls++) addMonth('');
      var firstDay = new Date(days[0].date + 'T00:00:00').getDay();
      var lastLabelCol = -99;
      for (var c = 0; c < REAL_COLS; c++) {
         var text = '';
         // Label a column with a month when that week contains the 1st of the
         // month — the column where the month truly begins. Keying off the 1st
         // (rather than the first column to merely enter a new month) skips the
         // leading/trailing partial months that don't contain a 1st, so a
         // Jul->Jul year reads Aug ... Jul cleanly.
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
         addMonth(text);
      }
      for (var rs = 0; rs < g.side; rs++) addMonth('');
      monthsEl.innerHTML = '';
      monthsEl.appendChild(mFrag);
   }

   // Lay out the empty l0 skeleton so the hero reserves its shape while the data
   // loads and the grid reveal runs. Nothing is coloured until the data lands;
   // the month labels and summary count stay hidden until the wave runs.
   layout();

   // The hero text animates in first (see .intro-loaded). After a matching beat,
   // reveal the .contrib block and cascade the empty gray grid in row by row
   // (bottom-up). Only once THAT has settled — and the data has loaded — do the
   // colours wash in (paint), so the grid is always fully in place first.
   var REVEAL_DELAY = 650;
   var REVEAL_DURATION = 550; // keep in sync with .contrib transition in _home.scss
   var GRID_REVEAL_TIME = 6 * ROW_REVEAL_STEP * 1000 + GRID_FADE; // last row lands

   function finishGridReveal() {
      if (gridRevealed) return;
      gridRevealed = true;
      // Grid's in place; if the fetch has settled, wash the colours in now.
      if (resolved) paint(true);
   }

   setTimeout(function () {
      wrap.classList.add('contrib-visible');
      if (reduceMotion) {
         // No cascade: show the grid at once, then let the colours follow.
         graph.classList.add('contrib-grid-static');
         finishGridReveal();
      } else {
         // Commit the opacity:0 base before the class flips it to 1 so every
         // row's fade actually runs from its --row-delay.
         void graph.offsetWidth;
         graph.classList.add('contrib-grid-in');
      }
   }, REVEAL_DELAY);

   // The grid reveal and the container's blur/fade both start at REVEAL_DELAY;
   // wait for the longer of the two to settle before colouring — colouring while
   // the .contrib ancestor is still animating opacity/blur gets dropped by the
   // compositor, leaving cells stuck on l0.
   setTimeout(finishGridReveal,
      REVEAL_DELAY + Math.max(REVEAL_DURATION, GRID_REVEAL_TIME));

   // Rebuild the field on resize so it keeps reaching the screen edges; the
   // simulated pattern and the real year stay put (simCache + cached `days`).
   // Only width affects the geometry, so ignore height-only changes: on mobile,
   // scrolling shows/hides the URL bar, which fires `resize` with a new
   // innerHeight, and a rebuild there would replay the colour transition.
   var resizeTimer = null;
   var lastWidth = window.innerWidth;
   window.addEventListener('resize', function () {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { layout(); }, 200);
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
         resolved = true;

         var total = (data.total && data.total.lastYear) ||
            days.reduce(function (sum, d) { return sum + d.count; }, 0);
         if (countEl) {
            countEl.textContent = total.toLocaleString() + ' contributions in the last year';
         }

         // Colour now only if the grid reveal has already settled; otherwise
         // finishGridReveal() paints once the grid is in place.
         if (gridRevealed) paint(true);
      })
      .catch(function () {
         // No real data: leave the grid its empty gray texture, then still run the
         // grayscale-past wave so the field reads as intentional. With no year
         // loaded there's no count or month labels to reveal.
         resolved = true;
         if (gridRevealed) paint(true);
      });
}
