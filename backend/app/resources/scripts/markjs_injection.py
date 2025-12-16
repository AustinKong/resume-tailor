"""
Code injection to include MarkJS library into scraped HTML content.
"""

MARKJS_INJECTION_CODE = """
<script>
  window.addEventListener("message", (event) => {
    // Basic message handling
  });
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mark.js/8.11.1/mark.min.js"></script>
<script>
  function initMarker() {
    if (typeof Mark === 'undefined') {
      console.error('MarkJS: Mark.js library not loaded');
      return;
    }

    try {
      var marker = new Mark(document.body);

      window.addEventListener("message", (event) => {
        try {
          const data = event.data;
          if (data.type === 'HIGHLIGHT') {
            marker.unmark({
              done: function() {
                marker.mark(data.text, {
                  "element": "mark",
                  "className": "highlight-mark",
                  "acrossElements": true,
                  "separateWordSearch": false,
                  "accuracy": "partially",
                  "scroll": true,
                  "done": function(totalMarks) {
                    // Find all mark elements and apply inline styles
                    const marks = document.querySelectorAll('mark.highlight-mark');
                    marks.forEach(function(mark) {
                      mark.style.backgroundColor = '#ffff00';
                      mark.style.color = '#000000';
                      mark.style.padding = '2px 4px';
                      mark.style.borderRadius = '3px';
                      mark.style.fontWeight = 'bold';
                    });
                    
                    // Scroll to the first highlighted element
                    if (marks.length > 0) {
                      marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }
                });
              }
            });
          }
          if (data.type === 'CLEAR') {
            marker.unmark();
          }
        } catch (error) {
          console.error('MarkJS: Error processing message:', error);
        }
      });
    } catch (error) {
      console.error('MarkJS: Error initializing marker:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarker);
  } else {
    initMarker();
  }
</script>
<style>
.highlight-mark {
  background-color: #ffff00 !important;
  color: #000000 !important;
  padding: 2px 4px !important;
  border-radius: 3px !important;
  font-weight: bold !important;
}
</style>
"""
