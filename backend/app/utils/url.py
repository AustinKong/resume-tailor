from urllib.parse import parse_qsl, quote, unquote, urlencode, urlsplit, urlunsplit

from pydantic import HttpUrl


def _normalize_scheme(scheme: str) -> str:
  """Normalize URL scheme to HTTPS.

  Rules:
  - MUST be `https://`.
  - MUST be lowercase.
  - `http://` is converted to `https://`.
  """
  return 'https'


def _normalize_netloc(hostname: str, original_scheme: str, port: int | None) -> str:
  """Normalize the network location (host and port).

  Rules:
  - MUST be lowercase.
  - MUST be IDNA-encoded (Punycode) for international domains
    (e.g., `bücher.com` -> `xn--bcher-kva.com`).
  - The `www.` prefix IS stripped (e.g., `www.example.com` -> `example.com`).
  - Default ports (`:80`, `:443`) ARE removed.
  - Non-default ports (e.g., `:8080`) ARE kept.
  """
  hostname = hostname.lower().encode('idna').decode('ascii')

  if hostname.startswith('www.'):
    hostname = hostname[4:]

  if original_scheme.lower() == 'http' and port == 80:
    port = None
  if original_scheme.lower() == 'https' and port == 443:
    port = None

  return f'{hostname}{f":{port}" if port else ""}'


def _normalize_path(path: str) -> str:
  """Normalize the URL path.

  Rules:
  - Path traversal segments ARE resolved (e.g., `/foo/./bar/../baz` -> `/foo/baz`).
  - Multiple slashes (`//`) ARE collapsed to a single (`/`).
  - Percent-encoding is normalized (un-encoded and re-encoded).
  - All trailing slashes ARE removed, even from the root
    (e.g., `/foo/` -> `/foo` and `https://example.com/` -> `https://example.com`).
  """
  path = quote(unquote(path), safe="/-._~:@!$&'()*+,;=")

  segments = []
  for segment in path.split('/'):
    if segment == '..':
      if segments:
        segments.pop()
    elif segment != '.' and segment != '':
      segments.append(segment)

  if not segments:
    return ''

  return '/' + '/'.join(segments)


def _normalize_query(query: str) -> str:
  """Normalize the URL query string.

  Rules:
  - All known tracking parameters (e.g., `utm_source`, `gclid`) ARE removed.
  - All parameter *keys* MUST be lowercase.
  - All remaining parameters MUST be sorted alphabetically by key.
  - An empty query (e.g., `?`) IS removed.
  """
  TRACKING_PARAMS = {
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'fbclid',
    'mc_cid',
    'mc_eid',
    'sessionid',
    'phpsessid',
    'ref',
    'tracking_id',
  }

  filtered_kvs = []
  for key, value in parse_qsl(query, keep_blank_values=False):
    key_lower = key.lower()
    if key_lower not in TRACKING_PARAMS:
      filtered_kvs.append((key_lower, value))

  filtered_kvs.sort(key=lambda kv: kv[0])

  return urlencode(filtered_kvs, doseq=True)


def _normalize_fragment(fragment: str) -> str:
  """Normalize the URL fragment.

  Rules:
  - The fragment (`#...`) IS completely removed.
  """
  return ''


def normalize_url(url: HttpUrl) -> HttpUrl:
  """Normalize a URL to its canonical form.

  This function applies a consistent set of normalization rules to URLs
  to ensure that equivalent URLs have the same canonical representation.

  Example:
    Input:
      'HTTP://www.Bücher.com/foo/./bar/../baz/?b=2&utm_source=test&a=1#section'
    Output:
      'https://xn--bcher-kva.com/foo/baz?a=1&b=2'

  Args:
    url: The URL to normalize.

  Returns:
    The normalized URL in canonical form.
  """
  parsed = urlsplit(str(url))
  scheme, _, path, query, fragment = parsed

  normalized = urlunsplit(
    (
      _normalize_scheme(scheme),
      _normalize_netloc(parsed.hostname or '', scheme, parsed.port),
      _normalize_path(path),
      _normalize_query(query),
      _normalize_fragment(fragment),
    )
  )

  return HttpUrl(normalized)
