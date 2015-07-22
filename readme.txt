This is a touch-compatible JavaScript Scrollbar that you can customize the look of -- and now it's (nearly) plug and play. Simply adding the class "scroll_content" to any element on your page will give it a scrollbar and move it's content inside (works best with elements that have fixed widths and heights.) 

Further, you can add the class "horizontal" to the element to make it a horizontal scrolling box and the "no_scrollbar" class to remove the scrollbar entirely.

** Installing **

Add scrollbar.css and scrollbar.js to your website, and then link them to the page you want with a scrollbar.

    <link rel="stylesheet" type="text/css" href="scrollbar.css">
    <script type="text/javascript" src="scrollbar.js"></script>

Once done, you can add the classes you wish to customize it.
    
    vertical - Forces the content to scroll vertically
    horizontal - Forces the content to scroll horizontally
    no_scrollbar - Prevents a scrollbar from appearing in the content box

** Customizing **

If for some reason any of the classes used interfere with a class you're using, it is possible to change them. The object "classes" in the javaScript_scrollbar object contains strings that match any class used. Changing it there will allow the script to search for the correct classes. Don't forget to change them in any CSS file you're using!

CSS classes used:
    scroll_content
    scrollable
    scrollbar
    scroller
    no_scrollbar
    vertical
    horizontal