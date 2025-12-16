"""
JavaScript script to materialize CSS-in-JS styles into the DOM.
"""

JS_MATERIALIZE_STYLES = """() => {
  const sheets = Array.from(document.styleSheets);

  for (const sheet of sheets) {
    try {
      // Skip external files (handled by asset inliner)
      if (sheet.href) continue;

      if (sheet.ownerNode && sheet.ownerNode.textContent.trim().length > 0) continue;

      const rules = sheet.cssRules;
      if (!rules || rules.length === 0) continue;

      const cssText = Array.from(rules).map(r => r.cssText).join('\\n');

      const style = document.createElement('style');
      style.textContent = cssText;
      document.head.appendChild(style);
    } catch (e) {
      // Ignore CORS errors
    }
  }
}"""
