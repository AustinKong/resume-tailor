"""
JavaScript script to inject a base tag into the document head.
"""

JS_INJECT_BASE = """(url) => {
  if (!document.querySelector('base')) {
    const base = document.createElement('base');
    base.href = url;
    (document.head || document.body).prepend(base);
  }
}"""
