$(function() {

    // Manages changes in responsive layout
    var layout = (function() {
        var callbacks = [];

        // Container for checking changes in layout width
        var $container = $('#header .container');
        
        // Container width: screen width
        var steps = {
            960: 960,
            714: 768,
            451: 480,
            294: 320
        };
        var width = $container.width();
        
        // On each step call all callbacks
        $(window)
            .on('resize', function() {
                var current = $container.width();
                if (current != width) {
                    width = current;
                    $.each(callbacks, function(id, callback) {
                        callback(steps[width]);
                    });
                }
            })
            .trigger('resize');
        
        // Interface
        return {

            // Returns currents step
            width: function() {
                return steps[width];
            },
            
            // Register callback
            change: function(callback) {
                callback(steps[width]);
                callbacks.push(callback);
            }
        };
    })();

    // Header slider
    var header = (function() {
        var $slider = $('#header');
        var $slides = $('li', $slider);
        var $arrows = $('.arrow', $slider);
        var $left = $arrows.filter('.left');
        var $right = $arrows.filter('.right');
        var last = $slides.length - 1;
        var current = 0;
        var interval = null;
        var enabled = false;

        // Setup
        var setup = {
            interval: 3000,
            speed: 500
        };
            
        // Go to current slide with crossfade effect
        function refresh() {
            $slides
                .stop()
                .filter(':visible')
                .fadeOut(setup.speed)
                .end()
                .eq(current)
                .fadeIn(setup.speed);
        };

        // Interface
        var slider = {
            
            // Go to slide
            set: function(slide) {
                slide = Math.max(0, Math.min(last, slide));
                if (slide != current) {
                    current = slide;
                    refresh();
                }
            },
            
            // Get current slide
            get: function() {
                return current;
            },

            // Previous slide
            left: function() {
                this.set(current ? current - 1 : last);
            },
            
            // Next slide
            right: function() {
                this.set(current < last ? current + 1 : 0);
            },
            
            // Start autoslide
            start: function() {
                this.stop();
                interval = setInterval(function() {
                    slider.right();
                }, setup.interval);
            },
        
            // Stop autoslide
            stop: function() {
                clearInterval(interval);
                interval = null;
            },

            // Disable slider
            disable: function() {
                $arrows.hide();
                enabled = false;
                this.stop();
                this.set(0);
            },
            
            // Enable slider
            enable: function() {
                this.start();
                enabled = true;
                $arrows.show();
            },
            
            // Enable/disable slider or return current state
            enabled: function(value) {
                if (typeof value == 'undefined')
                    return enabled;
                if (!!value)
                    this.enable();
                else
                    this.disable();
            },
            
            // Initialisation
            init: function(settings) {
                setup = $.extend(setup, settings);
                $('.arrow.left', $slider).on('click', function() {
                    slider.left();
                });
                $('.arrow.right', $slider).on('click', function() {
                    slider.right();
                });
                $slider.on({
                    mouseenter: function() {
                        if (enabled)
                            slider.stop();
                    },
                    mouseleave: function() {
                        if (enabled)
                            slider.start();
                    }
                });
                this.enable();
            }
        };
        return slider;
    })();
   
    // Initialisation
    var init = {
        
        // Menu
        menu: function() {
            layout.change(function(width) {
    
                // Switch menu appearance between list and combo
                $('#menu').toggleClass('small', width <= 480);
                $('#menu .right').toggleClass('combo', width <= 480);

                // Set page margin
                var margin = $('#menu').height();
                $('#header').css('margin-top', width >= 768 ? margin + 1 : 0);

                // Select current section during scrolling
                $('#header, #works, #services, #about, #contact').waypoint({
                    handler: function(event, direction) {
                        var $item = $('#menu ul li')
                            .removeClass('active')
                            .find('[href="#' + $(this).attr('id') + '"]')
                            .parent()
                            .addClass('active');
                    },
                    offset: width >= 768 ? margin : 0
                });
                
                // Combo
                layout.change(function(width) {
                    var $list = $('#menu ul');
                    if (width <= 480)
                        $list.hide();
                    else
                        $list.removeAttr('style');
                });
            });
            
            // Scroll to section
            $("#menu ul a").on('click', function() {
                var $link = $(this);
                var top = $(this.hash).offset().top - $('#menu').height();
                $('html, body').animate({scrollTop: top}, 500, function() {
                    $('#menu ul li').removeClass('active');
                    $link.parent().addClass('active');
                });
                $('#menu .combo').trigger('click');
                return false;
            });
        },
        
        // Header
        header: function() {
            
            // Random background
            var url = 'url(images/capa.jpg)';
            $('#header').css('background-image', url);
            
            // Slider
            header.init();
            layout.change(function(width) {
                header.enabled(width == 960);
            });
        },
        
        // Buttons
        buttons: function() {
            
            // Required elements
            $('a.button').each(function() {
                $(this)
                    .wrapInner('<span class="text" />')
                    .prepend([
                        '<span class="normal"></span>',
                        '<span class="hover"></span>'
                    ].join(''));
            });        
            
            // Hover effect
            $('body').on({
                mouseenter: function() {
                    $('.hover', this).stop().fadeIn(250);
                },
                mouseleave: function() {
                    $('.hover', this).stop().fadeOut(250);
                }
            }, 'a.button');
        },
    
        // Works list
        works: function() {
            var $list = $('#works .list');
            var $cache = $list.clone();
            var steps = {
                960: 12,
                768: 12, //9,
                480: 6,
                320: 3
            };
            var count = steps[layout.width()];
            var $all = $('#works .all');

            $('#works .menu').on('click', 'li a', function() {

                // Filter list by selected category
                var $link = $(this);
                var category = $link.data('category');
                var $filter = $cache.find(category == 'all' ? 'li' : 'li[data-category="' + category + '"]');
                $all.toggle($filter.length > count);
                $filter = $filter.filter('li:lt(' + count + ')');
                $list.quicksand($filter);

                // Highlight current category in menu
                $link
                    .closest('li')
                    .addClass('active')
                    .siblings()
                    .removeClass('active');
                
                // Close combo
                $('#works .combo.open').trigger('click');
                return false;
            });
            layout.change(function(width) {

                // Switch menu appearance between list and combo
                $('#works .menu').toggleClass('combo', width <= 480);
                
                // Change count of visible works 
                count = steps[width];
                $('li:gt(' + (count - 1) + ')', $list).hide();
                $('#works .menu .active a').trigger('click');
                $all.toggle(count < 12);
            });

            // Show all works
            $('a', $all).on('click', function() {
                count = 12;
                $('#works .menu .active a').trigger('click');
                $all.hide();
                return false;
            });
            
            // Hover
            $('#works .list').on({
                mouseenter: function() {
                    var $hover = $('.hover', this);
                    if (!$hover.length)
                        $hover = $('<div class="hover" />').appendTo(this);
                    $hover
                        .stop()
                        .hide()
                        .fadeIn();
                },
                mouseleave: function() {
                    var $hover = $('.hover', this);
                    $hover
                        .stop()
                        .fadeOut(250, function() {
                            $hover.remove();
                        });
                }
            }, 'a');
            
            // Combo
            $('<p />')
                .text($('#works .menu li:eq(0)').text())
                .prependTo('#works .menu');
            $('#works .menu a').on('click', function() {
                $(this)
                    .closest('.combo')
                    .find('p')
                    .text($(this).text());
            });
            layout.change(function(width) {
                var $list = $('#works .menu ul');
                if (width <= 480)
                    $list.hide();
                else
                    $list.removeAttr('style');
            });
        },

        // Combobox
        combo: function() {
            $(document).on('click', '.combo', function() {
                $('.combo.open')
                    .not(this)
                    .trigger('click');
                var $combo = $(this);
                var $list = $('ul', this);
                var open = $list.is(':visible');
                $list
                    .stop(true, true)
                    .fadeToggle(250);
                $combo.toggleClass('open', !open);
                return false;
            });
            $(document).on('click', function() {
                $('.combo.open').trigger('click');
            });
        },
        
        // Services
        services: function() {

            // Carousel
            layout.change(function(width) {
                $('#services .items').carouFredSel(
                    {
                        width: '100%',
                        height: 'auto',
                        align: 'left',
                        prev: '#services .left',
                        next: '#services .right',
                        scroll: {
                            items: 1,
                            pauseOnHover: true
                        },
                        auto: {
                            play: width <= 480
                        }
                    },
                    {
                        wrapper: {
                            classname: 'wrapper'
                        }
                    }
                );
                $('#services .list li').css('opacity', 1);
            });
            
            // Slider
            $('#services .menu img').on('mouseenter', function() {
                var $item = $(this).closest('li');
                $item
                    .siblings()
                    .find('.spike:visible')
                    .stop()
                    .fadeOut(500);
                $item
                    .find('.spike')
                    .stop()
                    .fadeIn(500);
                $('#services .list li')
                    .filter(':visible')
                    .stop()
                    .animate({opacity: 0}, 500)
                    .end()
                    .eq($item.index())
                    .stop()
                    .animate({opacity: 1}, 500);
            });
            layout.change(function(width) {
                if (width == 768)
                    $('#services .list li').removeAttr('style');
            });
        },
        
        // Team members slider
        members: function() {
            layout.change(function(width) {
                $('#members .items').carouFredSel(
                    {
                        width: '100%',
                        height: 'auto',
                        align: 'left',
                        prev: '#members .left',
                        next: '#members .right',
                        items: {
                            visible: width == 320 ? 1 : 4
                        },
                        scroll: {
                            items: 1,
                            pauseOnHover: true
                        },
                        auto: {
                            play: width == 320
                        }
                    },
                    {
                        wrapper: {
                            classname: 'wrapper'
                        }
                    }
                );
            });
        },
        
        // Clients slider
        clients: function() {
            layout.change(function(width) {
                $('#clients .items').carouFredSel({
                    width: '100%',
                    align: 'left',
                    prev: '#clients .left',
                    next: '#clients .right',
                    items: {
                        visible: width <= 480 ? 1 : '+1'
                    },
                    scroll: {
                        items: 1,
                        pauseOnHover: true
                    }
                },
                {
                    wrapper: {
                        classname: 'carousel'
                    }
                });
            });
        },
    
        // Contact form
        contact: function() {
            // Scroll to contact
            $("#contact_us .button").on('click', function() {
                $('#menu a[href="#contact"]').trigger('click');
                return false;
            });
            // Render map
            var map = new google.maps.Map($('#contact .map')[0], {
                zoom: 16,
                scrollWheel: true,
                center: new google.maps.LatLng(-26.980196943739745, -48.65356160884423),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: true,
                panControlOptions: {
                    position: google.maps.ControlPosition.LEFT_CENTER
                },
                zoomControlOptions: {
                    position: google.maps.ControlPosition.LEFT_CENTER
                },
                scaleControlOptions: {
                    position: google.maps.ControlPosition.LEFT_CENTER
                }
            });
            
            // Custom marker
            new google.maps.Marker({
                draggable: false,
                map: map,
                shape: {
                    coord: [63, 0, 68, 1, 72, 2, 75, 3, 77, 4, 80, 5, 81, 6, 83, 7, 85, 8, 86, 9, 88, 10, 89, 11, 90, 12, 91, 13, 93, 14, 94, 15, 95, 16, 95, 17, 96, 18, 97, 19, 98, 20, 99, 21, 99, 22, 100, 23, 101, 24, 101, 25, 102, 26, 103, 27, 103, 28, 104, 29, 104, 30, 104, 31, 105, 32, 105, 33, 106, 34, 106, 35, 106, 36, 107, 37, 107, 38, 107, 39, 107, 40, 108, 41, 108, 42, 108, 43, 108, 44, 108, 45, 109, 46, 109, 47, 109, 48, 109, 49, 109, 50, 109, 51, 109, 52, 109, 53, 109, 54, 109, 55, 109, 56, 109, 57, 109, 58, 109, 59, 109, 60, 109, 61, 109, 62, 109, 63, 108, 64, 108, 65, 108, 66, 108, 67, 108, 68, 107, 69, 107, 70, 107, 71, 107, 72, 106, 73, 106, 74, 106, 75, 105, 76, 105, 77, 104, 78, 104, 79, 104, 80, 103, 81, 103, 82, 102, 83, 101, 84, 101, 85, 100, 86, 99, 87, 99, 88, 98, 89, 97, 90, 96, 91, 95, 92, 95, 93, 94, 94, 93, 95, 91, 96, 90, 97, 89, 98, 88, 99, 86, 100, 85, 101, 83, 102, 82, 103, 80, 104, 77, 105, 75, 106, 72, 107, 68, 108, 63, 109, 46, 109, 41, 108, 37, 107, 34, 106, 32, 105, 29, 104, 27, 103, 26, 102, 24, 101, 23, 100, 21, 99, 20, 98, 19, 97, 18, 96, 16, 95, 15, 94, 14, 93, 14, 92, 13, 91, 12, 90, 11, 89, 10, 88, 10, 87, 9, 86, 8, 85, 8, 84, 7, 83, 6, 82, 6, 81, 5, 80, 5, 79, 5, 78, 4, 77, 4, 76, 3, 75, 3, 74, 3, 73, 2, 72, 2, 71, 2, 70, 2, 69, 1, 68, 1, 67, 1, 66, 1, 65, 1, 64, 0, 63, 0, 62, 0, 61, 0, 60, 0, 59, 0, 58, 0, 57, 0, 56, 0, 55, 0, 54, 0, 53, 0, 52, 0, 51, 0, 50, 0, 49, 0, 48, 0, 47, 0, 46, 1, 45, 1, 44, 1, 43, 1, 42, 1, 41, 2, 40, 2, 39, 2, 38, 2, 37, 3, 36, 3, 35, 3, 34, 4, 33, 4, 32, 5, 31, 5, 30, 5, 29, 6, 28, 6, 27, 7, 26, 8, 25, 8, 24, 9, 23, 10, 22, 10, 21, 11, 20, 12, 19, 13, 18, 14, 17, 14, 16, 15, 15, 16, 14, 18, 13, 19, 12, 20, 11, 21, 10, 23, 9, 24, 8, 26, 7, 28, 6, 29, 5, 32, 4, 34, 3, 37, 2, 41, 1, 46, 0, 63, 0],
                    type: 'poly'
                },
                icon: new google.maps.MarkerImage(
                    'img/marker.png',
                    new google.maps.Size(110, 110),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(55, 110)
                ),
                position: new google.maps.LatLng(-26.980196943739745, -48.65356160884423)
            });
        },
        
        // Input placeholders
        placeholders: function() {
            $(document).on({
                focus: function() {
                    var $input = $(this);
                    if ($.trim($input.val()) == $input.data('placeholder'))
                        $input
                            .val('')
                            .removeClass('placeholder');
                },
                blur: function() {
                    var $input = $(this);
                    if (!$.trim($input.val()))
                        $input
                            .val($input.data('placeholder'))
                            .addClass('placeholder');
                },
                change: function() {
                    var $input = $(this);
                    return $input.val() != $input.data('placeholder');
                },
                keydown: function(event) {
                    if (event.which == 27)
                        $(this)
                            .val('')
                            .trigger('keyup')
                            .trigger('blur');
                }
            }, '[data-placeholder]');
            $('[data-placeholder]').each(function() {
                var $input = $(this);
                var value = $.trim($input.val());
                if (!value || value == $input.data('placeholder'))
                    $input
                        .val('')
                        .trigger('blur');
            });
        },

        // Social ico hover
        social: function() {
            $('a.social').each(function() {
                $(this).append('<span class="hover" />');
            });
            $(document).on({
                mouseenter: function() {
                    $('.hover', this).stop().fadeIn(250);
                },
                mouseleave: function() {
                    $('.hover', this).stop().fadeOut(250);
                }
            }, 'a.social');
        },
        
        // Work details page
        detail: function() {
            function refresh() {
                $('#slider ul').carouFredSel(
                    {
                        prev: '#slider .left',
                        next: '#slider .right',
                        responsive: true,
                        align: 'center',
                        items: {
                            visible: 1,
                        },
                        scroll: {
                            fx: 'crossfade',
                            items: 1,
                            pauseOnHover: true
                        },
                        
                        // Workaround due to issues with height after window resize
                        height: $('#slider img:visible').height()
                    },
                    {
                        wrapper: {
                            classname: 'slider'
                        }
                    }
                );
            }
            
            onload = function() {
                refresh();
                $(window).on('resize', refresh);
            };
            
        }
    };

    // Initialisation
    switch ($('body').attr('id')) {
        
        // Main page
        case 'main':
            init.menu();
            init.header();
            init.buttons();
            init.works();
            init.combo();
            init.services();
            init.members();
            init.clients();
            init.contact();
            init.placeholders();
            init.social();
            break;
        
        // Works detail page
        case 'detail':
            init.buttons();
            init.social();
            init.detail();
    }
});