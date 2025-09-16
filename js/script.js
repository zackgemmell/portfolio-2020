
$(document).ready(function () {
   mediumZoom('.zoom-image', { margin: 50 })

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
});
