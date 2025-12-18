export const HIGHLIGHT_SCRIPT = `
<script src="https://cdnjs.cloudflare.com/ajax/libs/mark.js/8.11.1/mark.min.js"></script>
<script>
  function initMarker() {
    if (typeof Mark === 'undefined') {
      setTimeout(initMarker, 100);
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
                    // Scroll to the first highlighted mark
                    const firstMark = document.querySelector("mark.highlight-mark");
                    if (firstMark) {
                      firstMark.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                      });
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
`;
