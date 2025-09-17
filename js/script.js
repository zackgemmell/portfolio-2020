
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

   var introGreeting = $(".intro-greeting");
   var introBio = $(".intro-bio");
   var header = $(".header");
   var introScroll = $(".intro-scroll");

   setTimeout(function () {
      introGreeting.addClass('intro-loaded');
   }, 300)

   setTimeout(function () {
      introBio.addClass('intro-loaded');
   }, 900)

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
            navbarTitle.removeClass('visible');

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
