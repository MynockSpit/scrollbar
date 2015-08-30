window.addEventListener("load", function load_javaScript_scrollbar(event) {
    window.removeEventListener("load", load_javaScript_scrollbar, false);
    javaScript_scrollbar.initialize();
}, false);

var javaScript_scrollbar = {

    // If you changed the names of the CSS classes, change them here too.

    classes: {
        container: "scroll_content",
        content: "scrollable",
        scrollbar: "scrollbar",
        scroller: "scroller",
        noscrollbar: "no_scrollbar",
        horizontal: "horizontal"
    },

    container: null,
    scrollable: null,
    scrollbar: null,
    scroller: null,

    scrollingDirection: null,

    contentSize: null,
    scrollbarSize: null,

    contentOffset: null,
    scrollbarOffset: null,
    touchOffset: null,

    touchTime: null,
    touchLength: null,
    touchLengthOffset: null,

    glideInterval: null,

    initialize: function () {
        var container, content,
            scrollbar, scroller;

        var classes = javaScript_scrollbar.classes;

        for (var i = 0, containers = document.getElementsByClassName(classes.container); container = containers[i]; i++) {

            // Set all variables for things, or build them if they don't exist
            content = containers[i].getElementsByClassName(classes.content)[0];

            if (!content) {
                content = document.createElement("div");
                content.className = classes.content;
                content.setAttribute("class", classes.content);
                content.innerHTML = container.innerHTML;

                container.innerHTML = "";
                container.appendChild(content);   
            }

            scrollbar = containers[i].getElementsByClassName(classes.scrollbar)[0];
            scroller = containers[i].getElementsByClassName(classes.scroller)[0];

            if (!container.className.match(new RegExp(classes.noscrollbar))) {
                // If no-scrollbar is NOT set...
                if (!scrollbar) {
                    // Build the scrollbar if it doesn't exist

                    scrollbar = document.createElement("div");
                    scrollbar.className = classes.scrollbar;
                    scrollbar.setAttribute("class", classes.scrollbar);

                    container.appendChild(scrollbar);                       
                }

                if (!scroller) {
                    // Build the scroller if it doesn't exist

                    scroller = document.createElement("div");
                    scroller.className = classes.scroller;
                    scroller.setAttribute("class", classes.scroller);

                    scrollbar.appendChild(scroller); 
                }


                if (javaScript_scrollbar.checkDirection(container, content) == "vertical") {
                    scroller.style.height = ((scrollbar.offsetHeight * scrollbar.offsetHeight) / content.scrollHeight);
                } else {
                    scroller.style.width = ((scrollbar.offsetWidth * scrollbar.offsetWidth) / content.scrollWidth);
                }
            }

            else {
                // If no-scrollbar IS set...

                if (scrollbar) scrollbar.parentElement.removeChild(scrollbar);
                if (scroller) scrollbar.parentElement.removeChild(scrollbar);
            }


            container.addEventListener("mousedown", javaScript_scrollbar.scroll_start, false);
            container.addEventListener("wheel", javaScript_scrollbar.scroll_start, false);
            container.addEventListener("mousewheel", javaScript_scrollbar.scroll_start, false);
            container.addEventListener("touchstart", javaScript_scrollbar.scroll_start, false);
        }
    },

    checkDirection: function (container) {

        var classes = javaScript_scrollbar.classes;

        if (container.className.match(new RegExp(classes.horizontal))) 
            return javaScript_scrollbar.scrollingDirection = "horizontal";

        else return javaScript_scrollbar.scrollingDirection = "vertical";
    },
    setAppVariables: function (event) {
        if (!event && window.event) event = window.event;

        if (event) {

            var container = event.target, content, 
                scrollbar, scroller,
                scrollingDirection,
                contentSize, scrollbarSize;

            // Part 1: Set container, scrollable, scrollingDirection, scrollbar and scroller
            // Get the content box

            var container_RegExp = new RegExp(javaScript_scrollbar.classes.container);

            while (!container.className.match(container_RegExp))
                container = container.parentElement;

            // Get the scrollable content

            content = container.getElementsByClassName(javaScript_scrollbar.classes.content)[0];

            // Find current direction

            scrollingDirection = javaScript_scrollbar.checkDirection(container, content);

            // Get the size of the content box

            if (scrollingDirection == "horizontal") {
                
                try { var style = window.getComputedStyle(container, null); } 
                catch (error) { var style = scrollbar.currentStyle; }

                var horizontal_padding = parseInt(style.paddingLeft) + parseInt(style.paddingRight);
            }
            
            contentSize = (scrollingDirection == "vertical") ?
                -((content.scrollHeight > container.scrollHeight) ? content.scrollHeight : container.scrollHeight) + container.offsetHeight :
                -((content.scrollWidth > container.scrollWidth) ? content.scrollWidth : container.scrollWidth) + container.offsetWidth - horizontal_padding;


            // Set up scrollbar

            scrollbar = container.getElementsByClassName(javaScript_scrollbar.classes.scrollbar)[0];
            scroller = container.getElementsByClassName(javaScript_scrollbar.classes.scroller)[0];

            if (scrollbar && scroller) {

                /* These complex do-dads give the height (or width) of the scrollbar without any borders or paddings or whatever. */

                try {
                    var style = window.getComputedStyle(scrollbar, null);
                } catch(error) {
                    var style = scrollbar.currentStyle;
                }

                scrollbarSize = (scrollingDirection == "vertical") ? 
                    parseInt(style.height,10) - scroller.offsetHeight : 
                    parseInt(style.width,10) - scroller.offsetWidth;

            } else {
                scrollbar = null;
                scroller = null;
            }

            // Store Acquired Variables

            javaScript_scrollbar.container = container;
            javaScript_scrollbar.scrollable = content;
            javaScript_scrollbar.scrollbar = scrollbar;
            javaScript_scrollbar.scroller = scroller;
            javaScript_scrollbar.contentSize = contentSize;
            javaScript_scrollbar.scrollbarSize = scrollbarSize;
        }
    },

    check_errant_content: function() {
        // This is an upcoming function that checks to see if content has been added to the scroll_content box, but wasn't placed inside the scrollable part. It will automatically move that content to the end of the scrollable box.
    },

    /*

    There are three distinct methods of scrolling here: using the mousewheel, clicking and dragging the scrollbar, or dragging a finger across the screen (e.g. iOS or Android) They all use the same basics, but with some differences. The biggest point here is that the touch events have a glide associated with them. If the user swipes quickly, the content will gradually glide to a halt. This is set up and run by scroll_start and scroll_stop.

    */

    scroll_start: function (event) {

        javaScript_scrollbar.setAppVariables(event);

        javaScript_scrollbar.check_errant_content(event);

        if (event.type == "mousedown") {
            var scroller = javaScript_scrollbar.scroller,
                scrollbar = javaScript_scrollbar.scrollbar,
                scrollingDirection = javaScript_scrollbar.scrollingDirection;

            if (event.target == scroller || event.target == scrollbar) {

                if (!event && window.event) event = window.event; event.preventDefault(); // Prevent selection while dragging scrollbar

                if (javaScript_scrollbar.glideInterval != null) {
                    clearInterval(javaScript_scrollbar.glideInterval);
                    javaScript_scrollbar.glideInterval == null;
                }

                if (scrollingDirection == "vertical") {

                    javaScript_scrollbar.scrollbarOffset = (event.target == scrollbar) ?
                        scrollbar.getBoundingClientRect().top + (scroller.offsetHeight / 2) :
                    scrollbar.getBoundingClientRect().top + event.clientY - scroller.getBoundingClientRect().top;

                } else if (scrollingDirection == "horizontal") {

                    javaScript_scrollbar.scrollbarOffset = (event.target == scrollbar) ?
                        scrollbar.getBoundingClientRect().left + (scroller.offsetWidth / 2) :
                    scrollbar.getBoundingClientRect().left + event.clientX - scroller.getBoundingClientRect().left;
                }

                document.addEventListener("mousemove", javaScript_scrollbar.scrollbar_drag, false);
                document.addEventListener("mouseup", javaScript_scrollbar.scrollbar_stop, false);
                document.addEventListener("mouseup", javaScript_scrollbar.scroll_stop, false);

                javaScript_scrollbar.scrollbar_drag(event);
            }
        } 
        else if (event.type == "wheel" || event.type == "mousewheel") {
            if (javaScript_scrollbar.glideInterval != null) {
                clearInterval(javaScript_scrollbar.glideInterval);
                javaScript_scrollbar.glideInterval == null;
            }

            var container = javaScript_scrollbar.container;

            document.addEventListener("wheel", javaScript_scrollbar.mousewheel_scroll, false);

            container.addEventListener("mouseleave", javaScript_scrollbar.scroll_stop, false);
            container.removeEventListener("wheel", javaScript_scrollbar.scroll_start, false);
        } 
        else if (event.type == "touchstart") {
            var content = javaScript_scrollbar.scrollable,
                scrollbar = javaScript_scrollbar.scrollbar,
                scroller = javaScript_scrollbar.scroller,
                scrollingDirection = javaScript_scrollbar.scrollingDirection,

                contentOffset,
                scrollbarOffset,
                touchOffset,
                touchLengthOffset;

            // Clear any active glides
            if (javaScript_scrollbar.glideInterval != null) {
                clearInterval(javaScript_scrollbar.glideInterval);
                javaScript_scrollbar.glideInterval == null;
            }

            // Set up iOS (and hopefully Android) touch events
            if (scrollingDirection == "vertical") {
                contentOffset = content.offsetTop;
                touchOffset = event.touches[0].clientY;
                touchLengthOffset = event.touches[0].clientY;
            } else if (scrollingDirection == "horizontal") {
                contentOffset = content.offsetLeft;
                touchOffset = event.touches[0].clientX;
                touchLengthOffset = event.touches[0].clientX;
            }

            if (event.target == scrollbar) {
                scrollbarOffset = (scrollingDirection == "vertical") ?
                    scrollbar.getBoundingClientRect().top + (scroller.offsetHeight / 2) :
                scrollbar.getBoundingClientRect().left + (scroller.offsetWidth / 2);
            } else if (event.target == scroller) {
                scrollbarOffset = (scrollingDirection == "vertical") ?
                    scrollbar.getBoundingClientRect().top + event.touches[0].clientY - scroller.getBoundingClientRect().top :
                scrollbar.getBoundingClientRect().left + event.touches[0].clientX - scroller.getBoundingClientRect().left;
            }

            document.addEventListener("touchmove", javaScript_scrollbar.touch_move, false);
            document.addEventListener("touchend", javaScript_scrollbar.scroll_stop, false);
            document.addEventListener("touchcancel", javaScript_scrollbar.scroll_stop, false);

            javaScript_scrollbar.contentOffset = contentOffset;
            javaScript_scrollbar.scrollbarOffset = scrollbarOffset;
            javaScript_scrollbar.touchOffset = touchOffset;
            javaScript_scrollbar.touchLengthOffset = touchLengthOffset;

            javaScript_scrollbar.touchTime = new Date();
            javaScript_scrollbar.touchLength = null;
        }
    },
    scroll_stop: function (event) {
        if (!event && window.event) event = window.event;

        if (event.type == "mouseup") {
            document.removeEventListener("mousemove", javaScript_scrollbar.scrollbar_drag, false);
            document.removeEventListener("mouseup", javaScript_scrollbar.scroll_stop, false);
        }
        if (event.type == "mouseleave") {
            var container = javaScript_scrollbar.container;

            document.removeEventListener("wheel", javaScript_scrollbar.mousewheel_scroll, false);

            container.removeEventListener("mouseleave", javaScript_scrollbar.scroll_stop, false);
            container.addEventListener("wheel", javaScript_scrollbar.scroll_start, false);
        }
        if (event.type == "touchend" || event.type == "touchcancel") {
            document.removeEventListener("touchmove", javaScript_scrollbar.touch_move, false);
            document.removeEventListener("touchend", javaScript_scrollbar.scroll_stop, false);
            document.removeEventListener("touchcancel", javaScript_scrollbar.scroll_stop, false);

            // If touchTime isn't null, set up a slow-down timer. (touchTime will be null if the touchEvent happened slowly)
            if (javaScript_scrollbar.touchTime != null) {

                var scroller = javaScript_scrollbar.scroller,
                    content = javaScript_scrollbar.scrollable,
                    contentSize = javaScript_scrollbar.contentSize,
                    scrollingDirection = javaScript_scrollbar.scrollingDirection,
                    scrollbarSize = javaScript_scrollbar.scrollbarSize;

                var rate = javaScript_scrollbar.touchLength / (javaScript_scrollbar.touchTime - (new Date())),
                    repeatTime = 30;

                var scrollbarPosition,
                    contentPosition;

                javaScript_scrollbar.glideInterval = setInterval(function () {
                    if ((Math.abs(rate) * repeatTime) < 0.5) {
                        clearInterval(javaScript_scrollbar.glideInterval);
                        javaScript_scrollbar.glideInterval == null;
                    } else {

                        var contentPosition = (scrollingDirection == "vertical") ? 
                            (content.style.top) ? parseInt(content.style.top,10) - (rate * repeatTime) : -(rate * repeatTime) :
                        (content.style.left) ? parseInt(content.style.left,10) - (rate * repeatTime) : -(rate * repeatTime);

                        scrollbarPosition = (contentPosition / contentSize) * scrollbarSize;

                        if (contentPosition > 0) scrollbarPosition = 0, contentPosition = 0;
                        else if (contentPosition <= contentSize) scrollbarPosition = scrollbarSize, contentPosition = contentSize;


                        if (scrollingDirection == "vertical") {
                            content.style.top = contentPosition + "px";
                            if (scroller) scroller.style.top = scrollbarPosition + "px";
                        } else if (scrollingDirection == "horizontal") {
                            content.style.left = contentPosition + "px";
                            if (scroller) scroller.style.left = scrollbarPosition + "px";
                        }

                        rate = rate / 1.1;

                    }
                }, repeatTime);

                javaScript_scrollbar.touchTime = null;
            }

        }
    },

    scrollbar_drag: function (event) {
        if (!event && window.event) event = window.event;

        /* Get object variables (None change) */
        var scroller = javaScript_scrollbar.scroller,
            content = javaScript_scrollbar.scrollable,
            scrollingDirection = javaScript_scrollbar.scrollingDirection,
            contentSize = javaScript_scrollbar.contentSize,
            scrollbarSize = javaScript_scrollbar.scrollbarSize,
            scrollbarOffset = javaScript_scrollbar.scrollbarOffset;

        var mousePosition = (scrollingDirection == "vertical") ?
            event.clientY : event.clientX;

        var scrollbarPosition = mousePosition - scrollbarOffset,
            contentPosition = (scrollbarPosition / scrollbarSize) * contentSize;

        if (scrollbarPosition < 0) scrollbarPosition = 0, contentPosition = 0;
        else if (scrollbarPosition >= scrollbarSize) scrollbarPosition = scrollbarSize, contentPosition = contentSize;

        if (scrollingDirection == "vertical") {
            content.style.top = contentPosition + "px";
            if (scroller) scroller.style.top = scrollbarPosition + "px";
        } else if (scrollingDirection == "horizontal") {
            content.style.left = contentPosition + "px";
            if (scroller) scroller.style.left = scrollbarPosition + "px";
        }

    },
    mousewheel_scroll: function (event) {
        if (!event && window.event) event = window.event; event.preventDefault();

        var scroller = javaScript_scrollbar.scroller,
            scrollbar = javaScript_scrollbar.scrollbar,
            content = javaScript_scrollbar.scrollable,

            scrollingDirection = javaScript_scrollbar.scrollingDirection,

            contentSize = javaScript_scrollbar.contentSize,
            scrollbarSize = javaScript_scrollbar.scrollbarSize;

        var delta = 0;

        if (event.wheelDelta) { // normalize the delta
            delta = event.wheelDelta / 60; // IE and Opera
        } else if (event.detail) {
            delta = -event.detail / 2; // W3C
        }

        var contentPosition = (scrollingDirection == "vertical") ? 
            (content.style.top) ? parseInt(content.style.top,10) + (delta * 10) : (delta * 10) :
        (content.style.left) ? parseInt(content.style.left,10) + (delta * 10) : (delta * 10);

        var scrollbarPosition = (contentPosition / contentSize) * scrollbarSize;

        if (contentPosition >= 0) 
            scrollbarPosition = 0, contentPosition = 0;
        else if (contentPosition <= contentSize) 
            scrollbarPosition = scrollbarSize, contentPosition = contentSize;

        if (scrollingDirection == "vertical") {
            content.style.top = contentPosition + "px";
            if (scroller) scroller.style.top = scrollbarPosition + "px";
        } else if (scrollingDirection == "horizontal") {
            content.style.left = contentPosition + "px";
            if (scroller) scroller.style.left = scrollbarPosition + "px";
        }
    },
    touch_move: function (event) {
        if (!event && window.event) event = window.event;
        event.preventDefault();

        var content = javaScript_scrollbar.scrollable,
            scrollbar = javaScript_scrollbar.scrollbar,
            scroller = javaScript_scrollbar.scroller,
            scrollingDirection = javaScript_scrollbar.scrollingDirection,

            contentSize = javaScript_scrollbar.contentSize,
            scrollbarSize = javaScript_scrollbar.scrollbarSize,

            scrollbarOffset = javaScript_scrollbar.scrollbarOffset,
            contentOffset = javaScript_scrollbar.contentOffset,
            touchOffset = javaScript_scrollbar.touchOffset;

        var mousePosition = (scrollingDirection == "vertical") ?
            event.touches[0].clientY : event.touches[0].clientX;

        if (event.target == scroller || event.target == scrollbar) {

            var scrollbarPosition = mousePosition - scrollbarOffset,
                contentPosition = (scrollbarPosition / scrollbarSize) * contentSize;

            if (scrollbarPosition < 0) scrollbarPosition = 0, contentPosition = 0;
            else if (scrollbarPosition >= scrollbarSize) scrollbarPosition = scrollbarSize, contentPosition = contentSize;

            if (scrollingDirection == "vertical") {
                content.style.top = contentPosition + "px";
                if (scroller) scroller.style.top = scrollbarPosition + "px";
            } else if (scrollingDirection == "horizontal") {
                content.style.left = contentPosition + "px";
                if (scroller) scroller.style.left = scrollbarPosition + "px";
            }
        } else {

            var contentPosition = mousePosition + contentOffset - touchOffset,
                scrollbarPosition = (contentPosition / contentSize) * scrollbarSize;

            var currentTime = new Date();

            if ((currentTime - javaScript_scrollbar.touchTime) > 250) {
                javaScript_scrollbar.touchTime = currentTime;
                javaScript_scrollbar.touchLengthOffset = mousePosition;
            }

            javaScript_scrollbar.touchLength = mousePosition - javaScript_scrollbar.touchLengthOffset;

            if (contentPosition > 0) scrollbarPosition = 0, contentPosition = 0;
            else if (contentPosition <= contentSize) scrollbarPosition = scrollbarSize, contentPosition = contentSize;

            if (scrollingDirection == "vertical") {
                content.style.top = contentPosition + "px";
                if (scroller) scroller.style.top = scrollbarPosition + "px";
            } else if (scrollingDirection == "horizontal") {
                content.style.left = contentPosition + "px";
                if (scroller) scroller.style.left = scrollbarPosition + "px";
            }
        }
    }
}