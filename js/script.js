
$(document).ready(function () {
   mediumZoom('.zoom-image', { margin: 50 })

   var introGreeting = $(".intro-greeting");
   var introBio = $(".intro-bio");
   var header = $(".header");
   var introScroll = $(".intro-scroll");

   // Dark mode functionality
   function initializeDarkMode() {
      const storedTheme = localStorage.getItem('theme');

      // Only set data-theme if user has explicitly stored a preference
      // This allows CSS media queries to work when no manual preference is set
      if (storedTheme) {
         document.documentElement.setAttribute('data-theme', storedTheme);
      }
      // If no stored theme, don't set data-theme - let CSS handle via prefers-color-scheme
   }

   function toggleDarkMode() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      let newTheme;
      if (currentTheme === 'dark') {
         newTheme = 'light';
      } else if (currentTheme === 'light') {
         newTheme = 'dark';
      } else {
         // No manual theme set, so toggle opposite of system preference
         newTheme = systemPrefersDark ? 'light' : 'dark';
      }

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
   }

   // Initialize dark mode on page load
   initializeDarkMode();

   // Listen for system theme changes
   window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      // Only respond to system changes if user hasn't set a manual preference
      if (!localStorage.getItem('theme')) {
         // Remove data-theme to let CSS media queries take effect
         document.documentElement.removeAttribute('data-theme');
      }
   });

   // Add click handler for dark mode toggle button (if it exists)
   $(document).on('click', '.dark-mode-toggle', function () {
      toggleDarkMode();
   });

   setTimeout(function () {
      introGreeting.addClass('intro-loaded');
   }, 500)

   setTimeout(function () {
      introBio.addClass('intro-loaded');
   }, 1700)

   setTimeout(function () {
      header.addClass('header-loaded');
      introScroll.addClass('intro-scroll-loaded');
   }, 2500)

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
   });


   // Add smooth scrolling to all links
   $("#header-home > a").on('click', function (event) {

      // Make sure this.hash has a value before overriding default behavior
      if (this.hash !== "") {
         // Prevent default anchor click behavior
         event.preventDefault();

         // Store hash
         var hash = this.hash;
         console.log($(hash).offset().top);

         // Using jQuery's animate() method to add smooth page scroll
         // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
         $('html, body').animate({
            scrollTop: $(hash).offset().top
         }, 800, function () {

            // Add hash (#) to URL when done scrolling (default click behavior)
            // window.location.hash = hash;
         });
      } // End if
   });
});
