"""Scraping helpers for LinkedIn pages.

Centraliza TODAS las funciones que interactúan con Playwright para mantener
`linkedin_scraper.py` como un orquestador puro.
"""

from pathlib import Path

NOISE_LINES = {
    'Estado: con conexión',
    'Otros perfiles vistos por tus visitantes',
    'Solo para ti',
    'Ver',
    'Mostrar credencial',
}


def li_url(base_url: str, path: str) -> str:
    if not path.startswith('/'):
        path = '/' + path
    return f"{base_url}{path}"


def safe_goto(page, url, wait_selector: str | None = None, timeout: int = 30000):
    strategies = [
        dict(wait_until='domcontentloaded'),
        dict(wait_until='load'),
        dict(),
    ]
    for strat in strategies:
        try:
            page.goto(url, timeout=timeout, **strat)
            break
        except Exception:
            page.wait_for_timeout(300)
    if wait_selector:
        try:
            page.wait_for_selector(wait_selector, timeout=10000)
        except Exception:
            page.wait_for_timeout(300)


def scroll_to_bottom(page, max_steps: int = 10, step_px: int = 1200, delay_ms: int = 300):
    last_height = 0
    for _ in range(max_steps):
        page.mouse.wheel(0, step_px)
        page.wait_for_timeout(delay_ms)
        try:
            height = page.evaluate('() => document.body.scrollHeight')
            if height == last_height:
                break
            last_height = height
        except Exception:
            break


def try_click(locator_node, page=None):
    try:
        locator_node.scroll_into_view_if_needed()
    except Exception:
        pass
    try:
        locator_node.click(force=True)
        return True
    except Exception:
        try:
            (page or locator_node).evaluate('(el) => el.click()', locator_node)
            return True
        except Exception:
            return False


def expand_section_if_needed(section):
    btn = section.query_selector('button.inline-show-more-text__button')
    if not btn:
        btn = section.query_selector("button:has-text('ver más')") or section.query_selector("button:has-text('Ver más')")
    if btn:
        if try_click(btn):
            section.wait_for_timeout(800)


def _normalize_line(text: str) -> str:
    return ' '.join(text.split())


def cleanup_lines(lines: list[str]) -> list[str]:
    cleaned: list[str] = []
    seen: set[str] = set()
    for raw in lines:
        t = _normalize_line(raw)
        if not t:
            continue
        tl = t.lower()
        if t in NOISE_LINES:
            continue
        if tl in {'ver', 'ver más', '… ver más', '... ver más', 'ver mas', '… ver mas'}:
            continue
        if tl.startswith('estado:'):
            continue
        if tl.startswith('otros perfiles vistos por tus visitantes'):
            continue
        if tl.endswith('.jpg') or tl.endswith('.png'):
            continue
        if t not in seen:
            cleaned.append(t)
            seen.add(t)
    return cleaned


def collect_clean_section_texts(section) -> list[str]:
    try:
        texts = section.locator('span:visible:not(.visually-hidden)').all_inner_texts()
    except Exception:
        spans = section.query_selector_all('span')
        texts = [s.inner_text() for s in spans if s and (s.inner_text() or '').strip()]
    base_texts = [t.replace('\xa0', ' ').strip() for t in texts if t and t.strip()]
    split_texts: list[str] = []
    for t in base_texts:
        for part in t.splitlines():
            part = part.strip()
            if part:
                split_texts.append(part)
    joined_lower = ' '.join(split_texts).lower()
    if 'otros perfiles vistos por tus visitantes' in joined_lower or 'estado: con conexión' in joined_lower:
        return []
    return cleanup_lines(split_texts)


def dedupe_blocks(blocks: list[list[str]]) -> list[list[str]]:
    seen = set()
    result: list[list[str]] = []
    for blk in blocks:
        key = tuple(blk)
        if key and key not in seen:
            result.append(blk)
            seen.add(key)
    return result


def clean_experience_raw_blocks(blocks: list[list[str]]) -> list[list[str]]:
    cleaned_blocks: list[list[str]] = []
    for blk in blocks:
        if not blk:
            cleaned_blocks.append(blk)
            continue
        new_blk: list[str] = []
        for i, raw in enumerate(blk):
            line = (raw or '').strip()
            if not line:
                continue
            next_line = (blk[i+1].strip() if i + 1 < len(blk) and blk[i+1] else '')
            if next_line and next_line.lower().startswith('aptitudes:'):
                continue
            new_blk.append(line)
        cleaned_blocks.append(new_blk)
    return cleaned_blocks


def get_section_text(section) -> str:
    texts = collect_clean_section_texts(section)
    return '\n'.join(texts)


def get_all_sections(page):
    return page.query_selector_all('section')


def get_section_by_div_id(sections, div_id):
    for section in sections:
        if section.query_selector(f'div#{div_id}'):
            return section
    return None


def scrape_personal_info(page, base_url: str, profile_slug: str) -> dict:
    def _first_text_from(page, selectors: list[str]) -> str:
        for sel in selectors:
            try:
                loc = page.locator(sel)
                if loc and loc.count() > 0:
                    txt = loc.first.inner_text().strip()
                    if txt:
                        return ' '.join(txt.split())
            except Exception:
                continue
        return ''

    def _image_src_from(page, selectors: list[str]) -> str:
        for sel in selectors:
            try:
                el = page.query_selector(sel)
                if not el:
                    continue
                for attr in ('src', 'data-delayed-url', 'data-test-image-url'):
                    val = el.get_attribute(attr)
                    if val:
                        return val
                srcset = el.get_attribute('srcset')
                if srcset:
                    first = srcset.split(',')[0].strip().split(' ')[0]
                    if first:
                        return first
            except Exception:
                continue
        return ''

    name_txt = _first_text_from(page, [
        'h1.text-heading-xlarge',
        'main h1',
        'div.pv-text-details__left-panel h1',
        'h1',
    ])
    
    if name_txt:
        import re
        name_txt = re.sub(r'\s*\([^)]*\)\s*', ' ', name_txt).strip()
    
    title_txt = _first_text_from(page, [
        'div.text-body-medium.break-words',
        'div.pv-text-details__left-panel div.text-body-medium',
        'div.text-body-medium',
    ])
    photo_url = _image_src_from(page, [
        'img.pv-top-card-profile-picture__image',
        'img.profile-photo-edit__preview',
        'img.presence-entity__image',
        "img[alt*='Foto de perfil']",
        "img[alt*='Profile photo']",
    ])
    return {'name': name_txt, 'title': title_txt, 'photo': photo_url}


def convert_bold_unicode_to_html(text: str) -> str:
    import unicodedata
    import re
    
    def is_bold_char(char: str) -> bool:
        code = ord(char)
        return 0x1D400 <= code <= 0x1D7FF
    
    def normalize_bold_char(char: str) -> str:
        if is_bold_char(char):
            return unicodedata.normalize('NFKC', char)
        return char
    
    words = re.split(r'(\s+|[.,;:!?¿¡\n])', text)
    result = []
    
    for word in words:
        if not word or word.isspace() or not word.strip():
            result.append(word)
            continue
        has_bold = any(is_bold_char(ch) for ch in word)
        if has_bold:
            normalized = ''.join(normalize_bold_char(ch) for ch in word)
            result.append(f'<b>{normalized}</b>')
        else:
            result.append(word)
    
    return ''.join(result)


def clean_about_text(raw_text: str) -> str:
    lines = raw_text.split('\n')
    cleaned = []
    for line in lines:
        line_clean = line.strip()
        if line_clean and line_clean.lower() not in ['acerca de', 'about'] and line_clean not in cleaned:
            cleaned.append(line_clean)
    return '\n'.join(cleaned)


def split_about_sections(raw_text: str) -> tuple[str, list[str]]:
    cleaned_text = clean_about_text(raw_text)
    lines = [ln.strip() for ln in cleaned_text.split('\n') if ln.strip()]

    emoji_tokens = ['⚡', '💪', '🔄', '🎯', '✦', '▪️', '▪', '•', '📍', '💻', '📧']
    def has_emoji_token(ln: str) -> bool:
        return any(tok in ln for tok in emoji_tokens)
    for i, ln in enumerate(lines):
        if has_emoji_token(ln):
            description = '\n'.join(lines[:i]).strip()
            extras = lines[i:]
            return (description, extras)

    def is_heading_with_colon(ln: str) -> bool:
        if ':' not in ln:
            return False
        idx = ln.find(':')
        head = ln[:idx].strip()
        letters = [c for c in head if c.isalpha()]
        if not letters:
            return False
        upper = sum(1 for c in letters if c.isupper())
        uppercase_ratio = upper / len(letters)
        return uppercase_ratio >= 0.6 or head.istitle()
    keywords = ('tecnolog', 'fortaleza', 'disponibil', 'hobbies', 'aptitudes', 'skills')
    def is_section_start(ln: str) -> bool:
        if is_heading_with_colon(ln):
            return True
        low = ln.lower()
        return any(k in low for k in keywords)
    cut_idx = None
    for i, ln in enumerate(lines):
        if is_section_start(ln):
            cut_idx = i
            break
    if cut_idx is None:
        return ('\n'.join(lines), [])
    description = '\n'.join(lines[:cut_idx]).strip()
    extras = lines[cut_idx:]
    return (description, extras)


def split_about_sections_raw(full_raw_text: str) -> tuple[str, list[str]]:
    if not full_raw_text:
        return ('', [])
    text = full_raw_text.replace('Acerca de', '').replace('About', '').strip()
    tokens = ['⚡', '💪', '🔄', '🎯', '✦', '▪️', '▪', '•', '📍', '💻', '📧']
    idxs = [text.find(tok) for tok in tokens if text.find(tok) != -1]
    if not idxs:
        cleaned_desc = clean_about_text(text)
        cleaned_desc = convert_bold_unicode_to_html(cleaned_desc)
        return (cleaned_desc, [])
    cut = min(idxs)
    desc_raw = text[:cut].strip()
    extras_blob = text[cut:].strip()
    description = clean_about_text(desc_raw)
    description = convert_bold_unicode_to_html(description)
    extras_lines = [ln.strip() for ln in extras_blob.split('\n') if ln.strip()]
    return (description, extras_lines)


def scrape_details_blocks(page, base_url: str, profile_slug: str, section_slug: str) -> list[list[str]]:
    safe_goto(page, li_url(base_url, f"/in/{profile_slug}/details/{section_slug}/"), wait_selector='section')
    scroll_to_bottom(page)
    blocks: list[list[str]] = []
    for section in page.query_selector_all('section'):
        texts = collect_clean_section_texts(section)
        if texts:
            blocks.append(texts)
    return dedupe_blocks(blocks)


def scrape_certifications_blocks(page, base_url: str, profile_slug: str) -> list[list[str]]:
    safe_goto(page, li_url(base_url, f"/in/{profile_slug}/details/certifications/"), wait_selector='section')
    scroll_to_bottom(page)
    out_blocks: list[list[str]] = []
    sections = page.query_selector_all('section')
    for section in sections:
        items = section.query_selector_all('li, article, div.pvs-list__item') or [section]
        for item in items:
            texts = collect_clean_section_texts(item)
            a = item.query_selector("a:has-text('Mostrar credencial')") or item.query_selector("a:has-text('Mostrar Credencial')")
            href = ''
            if a:
                try:
                    href = a.get_attribute('href') or ''
                except Exception:
                    href = ''
            if href:
                if href.startswith('/'):
                    href = f"{base_url}{href}"
                texts.append(f"URL: {href}")
            if texts:
                out_blocks.append(texts)
    return dedupe_blocks(out_blocks)


def orchestrate_scrape(playwright, config: dict) -> dict:
    """Orquesta el login (si es necesario) y la recolección de secciones del perfil.

    Devuelve un dict con claves esperadas por `linkedin_scraper.py` y los parsers.
    """
    browser = playwright.chromium.launch(headless=config.get('HEADLESS', True))
    context_args = {}
    storage = config.get('STORAGE_STATE')
    if storage and Path(storage).exists():
        context_args['storage_state'] = str(storage)

    ctx = browser.new_context(**context_args)
    page = ctx.new_page()
    base = config.get('BASE_URL', 'https://www.linkedin.com')
    slug = config.get('PROFILE_SLUG', 'me')
    profile_url = f"{base}/in/{slug}/"

    # Attempt login if no storage state provided
    if not context_args.get('storage_state'):
        email = config.get('EMAIL')
        password = config.get('PASSWORD')
        if email and password:
            try:
                page.goto(f"{base}/login", wait_until='load')
                page.fill('input[name=username], input#username', email)
                page.fill('input[name=password], input#password', password)
                page.click('button[type=submit]')
                page.wait_for_load_state('networkidle', timeout=15000)
                # Save storage state if requested
                if storage:
                    ctx.storage_state(path=storage)
            except Exception:
                pass

    # Navigate to profile
    try:
        safe_goto(page, profile_url, wait_selector='main')
    except Exception:
        pass

    result: dict = {}
    try:
        result['personal'] = scrape_personal_info(page, base, slug)
    except Exception:
        result['personal'] = {}

    result['profile_url'] = profile_url

    # Collect detail sections
    details_sections = config.get('DETAILS_SECTIONS', ['experience', 'education', 'certifications', 'courses'])
    for sec in details_sections:
        try:
            if sec == 'certifications':
                blocks = scrape_certifications_blocks(page, base, slug)
            else:
                blocks = scrape_details_blocks(page, base, slug, sec)
        except Exception:
            blocks = []
        result[sec] = blocks

    # About / extras
    about_lines: list[str] = []
    try:
        about_section = page.query_selector("section:has-text('Acerca de')") or page.query_selector("section:has-text('About')")
        if about_section:
            about_text = get_section_text(about_section)
            about_lines = [ln for ln in about_text.split('\n') if ln.strip()]
    except Exception:
        about_lines = []
    result['about_raw'] = about_lines

    # Languages and contact attempt
    try:
        result['languages'] = scrape_details_blocks(page, base, slug, 'languages')
    except Exception:
        result['languages'] = []

    try:
        # contact info often in About extras; leave for parsing
        result['contact_raw'] = about_lines
    except Exception:
        result['contact_raw'] = []

    try:
        ctx.close()
        browser.close()
    except Exception:
        pass

    return result
