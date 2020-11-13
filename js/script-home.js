// $(document).ready(function() {

   // $("nav").find("a").click(function(e) {
   //     e.preventDefault();
   //     var section = $(this).attr("href");
   //     $("html, body").animate({scrollTop: $(section).offset().top}, 5000, 'ease', function() {}});
   // });
    // variables

// });

$(document).ready(function(){

  var introGreeting = $(".intro-greeting");
  var introBio = $(".intro-bio");
  var header = $(".header");
  var introScroll = $(".intro-scroll");

  setTimeout(function(){
     introGreeting.addClass('intro-loaded');
  },500)

  setTimeout(function(){
     introBio.addClass('intro-loaded');
  },1700)

  setTimeout(function(){
     header.addClass('header-loaded');
     introScroll.addClass('intro-scroll-loaded');
  },2500)

 $(window).on('scroll', function() {
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
  $("nav > a").on('click', function(event) {

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
     }, 800, function(){

        // Add hash (#) to URL when done scrolling (default click behavior)
        // window.location.hash = hash;
      });
    } // End if
  });
});
