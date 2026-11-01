import re
from dataclasses import asdict
from models import ExperienceEntry, ExperienceSection, EducationEntry, CertificationEntry, CoursesEntry, LanguageEntry

def segment_by_aptitudes(blocks: list[list[str]]) -> list[list[str]]:
    """Segmenta entradas usando la línea 'Aptitudes:' como delimitador (exclusivo).
    Devuelve segmentos con las líneas previas a cada marcador de 'Aptitudes:'.
    """
    segments: list[list[str]] = []
    for blk in blocks:
        if not blk:
            continue
        current: list[str] = []
        for raw in blk:
            line = (raw or '').strip()
            if not line:
                continue
            if line.lower().startswith('aptitudes:'):
                if current:
                    segments.append(current)
                    current = []
                continue
            current.append(line)
        if current:
            segments.append(current)
    return segments


def extract_email_and_github(text: str) -> tuple[str | None, str | None]:
    email = None
    github = None
    if text:
        m = re.search(r"[\w\.-]+@[\w\.-]+", text)
        if m:
            email = m.group(0)
        g = re.search(r"(?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9_-]+", text)
        if g:
            gh = g.group(0)
            if not gh.startswith('http'):
                gh = 'https://' + gh
            github = gh
    return email, github


def parse_experience_blocks(segment_by_aptitudes, blocks: list[list[str]]) -> list[ExperienceEntry]:
    import unicodedata
    
    def normalize_styled_chars(s: str) -> str:
        """Normaliza solo los caracteres Unicode estilizados (bold, italic, etc.) 
        dejando intactos los caracteres normales con tildes."""
        if not s:
            return ''
        result = []
        for char in s:
            code = ord(char)
            if 0x1D400 <= code <= 0x1D7FF:
                normalized = unicodedata.normalize('NFKC', char)
                result.append(normalized)
            else:
                result.append(char)
        return ''.join(result)
    
    segments: list[list[str]] = segment_by_aptitudes(blocks)
    mapped: list[ExperienceEntry] = []
    for seg in segments:
        title = seg[0] if len(seg) > 0 else ''
        company = seg[1] if len(seg) > 1 else ''
        period = seg[2] if len(seg) > 2 else ''
        location = seg[3] if len(seg) > 3 else ''
        description = seg[4] if len(seg) > 4 else ''
        sections: list[dict] = []
        current_section: dict | None = None
        i = 5
        while i < len(seg):
            ln = seg[i]
            if ln.endswith(':'):
                if current_section and current_section.get('items'):
                    sections.append(current_section)
                section_title = normalize_styled_chars(ln[:-1].strip())
                current_section = {'title': section_title, 'items': []}
            elif ln.startswith('- '):
                if not current_section:
                    current_section = {'title': 'Detalles', 'items': []}
                current_section['items'].append(ln[2:].strip())
            else:
                if not sections and not current_section:
                    description = (description + ' ' + ln).strip() if description else ln
                else:
                    if not current_section:
                        current_section = {'title': 'Detalles', 'items': []}
                    current_section['items'].append(ln)
            i += 1
        if current_section and current_section.get('items'):
            sections.append(current_section)

        sections_dc = [ExperienceSection(title=s.get('title', ''), items=s.get('items', []) or []) for s in sections]
        mapped.append(ExperienceEntry(
            title=title,
            company=company,
            period=period,
            location=location,
            description=description,
            sections=sections_dc,
        ))
    return mapped


def parse_education_blocks(blocks: list[list[str]]) -> list[EducationEntry]:
    lines: list[str] = []
    for b in blocks:
        for ln in b:
            t = (ln or '').strip()
            if t:
                lines.append(t)
    if not lines:
        return []
    year_re = re.compile(r"\b(19|20)\d{2}\b")
    def has_year(s: str) -> bool:
        return bool(year_re.search(s))
    year_indices: list[int] = [i for i, s in enumerate(lines) if has_year(s)]
    if not year_indices:
        return []
    starts: list[int] = []
    for idx in year_indices:
        start = max(0, idx - 2)
        if not starts or start > starts[-1]:
            starts.append(start)
        else:
            starts.append(starts[-1] + 1)
    segments: list[list[str]] = []
    for j, start in enumerate(starts):
        next_start = starts[j + 1] if j + 1 < len(starts) else len(lines)
        next_start = max(start + 1, min(next_start, len(lines)))
        seg = lines[start:next_start]
        if seg:
            segments.append(seg)
    results: list[EducationEntry] = []
    for seg in segments:
        institution = seg[0] if len(seg) > 0 else ''
        title = ''
        if len(seg) > 1 and not seg[1].lower().startswith('nota:'):
            title = seg[1]
        else:
            for s in seg[1:]:
                if s.lower().startswith('nota:'):
                    continue
                if has_year(s):
                    continue
                title = s
                break
        period = ''
        for s in seg:
            if has_year(s):
                period = s
                break
        results.append(EducationEntry(title=title or '', institution=institution or '', period=period or ''))
    return results


def parse_certifications_blocks(segment_by_aptitudes, blocks: list[list[str]]) -> list[CertificationEntry]:
    segments = segment_by_aptitudes(blocks)
    merged_segments: list[list[str]] = []
    for seg in segments:
        if not seg:
            continue
        only_urls = all(s.strip().lower().startswith('url:') for s in seg)
        if only_urls and merged_segments:
            for u in seg:
                if u not in merged_segments[-1]:
                    merged_segments[-1].append(u)
            continue
        merged_segments.append(seg)
    year_re = re.compile(r"\b(19|20)\d{2}\b")
    def has_year(s: str) -> bool:
        return bool(year_re.search(s))
    results: list[CertificationEntry] = []
    seen_keys: set[tuple[str, str, str, str, str]] = set()
    for seg in merged_segments:
        if not seg:
            continue
        title = seg[0]
        if title.strip().lower().startswith('url:'):
            continue
        if title.strip().lower().startswith('alguien en'):
            continue
        institution = seg[1] if len(seg) > 1 else ''
        date = ''
        credential_id = ''
        credential_url = ''
        for s in seg[2:]:
            sl = s.lower()
            if not date and sl.startswith('expedición:'):
                date = s.split(':', 1)[1].strip() if ':' in s else s
                continue
            if not credential_id and sl.startswith('id de la credencial'):
                if ':' in s:
                    credential_id = s.split(':', 1)[1].strip()
                else:
                    parts = s.split()
                    credential_id = parts[-1].strip() if parts else ''
                continue
            if not date and has_year(s):
                date = s
                continue
            if not credential_url and sl.startswith('url:'):
                credential_url = s.split(':', 1)[1].strip()
        verified = bool(credential_id)
        key = (title or '', institution or '', date or '', credential_id or '', credential_url or '')
        if key in seen_keys:
            continue
        seen_keys.add(key)
        results.append(CertificationEntry(
            title=title or '',
            institution=institution or '',
            date=date or '',
            credentialUrl=credential_url or '',
            credentialId=credential_id or '',
            verified=verified,
        ))
    return results


def parse_courses_blocks(blocks: list[list[str]]) -> list[CoursesEntry]:
    lines: list[str] = []
    for b in blocks:
        for ln in b:
            t = (ln or '').strip()
            if t:
                lines.append(t)
    entries: list[CoursesEntry] = []
    seen: set[tuple[str, str]] = set()
    def strip_parens(s: str) -> str:
        return re.sub(r"\s*\([^)]*\)\s*", " ", s).strip()
    for raw in lines:
        low = raw.lower()
        if low.startswith('asociada con'):
            continue
        parts = [p.strip() for p in raw.split('|', 1)]
        if len(parts) == 2:
            title_raw, platform_raw = parts
            title = strip_parens(title_raw)
            platform = strip_parens(platform_raw)
        else:
            title = strip_parens(raw)
            platform = ''
        key = (title, platform)
        if key in seen:
            continue
        seen.add(key)
        entries.append(CoursesEntry(title=title, platform=platform))
    return entries


def to_dict_list(dc_list):
    return [asdict(x) for x in dc_list]


def parse_about_extras(extras_lines: list[str]):
    import unicodedata

    def is_header(line: str) -> bool:
        line = (line or '').strip()
        return line.startswith(('⚡', '💪', '🔄', '🎯'))

    def clean_item(s: str) -> str:
        return ' '.join((s or '').strip().split())

    def normalize_ascii(s: str) -> str:
        if not s:
            return ''
        n = unicodedata.normalize('NFKD', s)
        n = ''.join(ch for ch in n if not unicodedata.combining(ch))
        try:
            n = n.encode('ascii', 'ignore').decode('ascii')
        except Exception:
            n = n.replace('▪️', '').replace('✦', '').strip()
        return n

    sections: dict[str, list[str]] = {}
    current: str | None = None
    for raw in extras_lines or []:
        line = clean_item(raw)
        if not line:
            continue
        if is_header(line):
            current = line
            sections[current] = []
            continue
        if current:
            sections[current].append(line)

    technologies: dict = {
        'Lenguajes': [],
        'Bases de Datos': [],
        'DevTools': [],
    }

    availability: list[str] = []
    hobbies: list[str] = []
    contact: list[str] = []

    tech_key = next((k for k in sections.keys() if k.startswith('⚡')), None)
    if tech_key:
        langs: list[str] = []
        fw_groups: list[list[str]] = []
        bases: list[str] = []
        devtools: list[str] = []

        for item in sections[tech_key]:
            txt = item.lstrip('▪️').strip()
            if ':' in txt:
                head, content = txt.split(':', 1)
                head_norm = normalize_ascii(head).lower()
                content_norm = normalize_ascii(content).strip()
                if 'lenguaje' in head_norm:
                    parts = [p.strip() for p in content_norm.split('|')]
                    for p in parts:
                        for name in [x.strip() for x in p.split(',') if x.strip()]:
                            langs.append(name)
                elif 'framework' in head_norm or 'librer' in head_norm:
                    parts = [p.strip() for p in content_norm.split('|')]
                    for p in parts:
                        fw = [x.strip() for x in p.split(',') if x.strip()]
                        fw_groups.append(fw)
                elif 'base' in head_norm and 'dato' in head_norm:
                    bases.append(clean_item(content_norm))
                elif 'devtools' in head_norm:
                    mapping = {
                        'herramientas de gestion de proyectos': 'Jira',
                        'documentacion tecnica': 'Docusaurus',
                    }
                    for x in [y.strip() for y in content_norm.split(',') if y.strip()]:
                        key = x.lower()
                        devtools.append(mapping.get(key, x))

        for idx, lang in enumerate(langs):
            entry = {'name': lang}
            if lang.lower() == 'python':
                entry['isMain'] = True
            if idx < len(fw_groups):
                fw = fw_groups[idx]
                if fw:
                    entry['frameworks'] = fw
            technologies['Lenguajes'].append(entry)

        if bases:
            technologies['Bases de Datos'] = bases
        if devtools:
            technologies['DevTools'] = devtools

    strengths: list[str] = []
    strong_key = next((k for k in sections.keys() if k.startswith('💪')), None)
    if strong_key:
        for item in sections[strong_key]:
            txt = item.lstrip('✦').strip()
            if txt.endswith('*'):
                txt = txt[:-1].strip()
            strengths.append(txt)

    avail_key = next((k for k in sections.keys() if k.startswith('🔄')), None)
    if avail_key:
        for item in sections[avail_key]:
            txt = item.lstrip('✦').strip()
            if txt:
                availability.append(txt)

    hobbies_key = next((k for k in sections.keys() if k.startswith('🎯')), None)
    if hobbies_key:
        block = [item.lstrip('✦').strip() for item in sections[hobbies_key] if item.strip()]
        if block:
            if '---------------------------------------------' in block:
                sep_idx = block.index('---------------------------------------------')
                hobbies = block[:sep_idx]
                contact = block[sep_idx+1:sep_idx+4]
            else:
                hobbies = block
    
    return technologies, strengths, availability, hobbies, contact


def parse_contact_info(contact_lines: list[str], profile_url: str | None = None) -> dict:
    result: dict[str, str] = {}
    
    for line in contact_lines:
        clean_line = line
        for emoji in ['📍', '💻', '📧', '🔗', '🌐']:
            clean_line = clean_line.replace(emoji, '')
        clean_line = clean_line.strip()
        
        if not clean_line:
            continue
            
        line_lower = clean_line.lower()
        
        if '@' in clean_line and ('hotmail' in line_lower or 'gmail' in line_lower or 'outlook' in line_lower or '.com' in line_lower):
            result['email'] = clean_line
        elif 'github.com' in line_lower:
            if not clean_line.startswith('http'):
                clean_line = f'https://{clean_line}'
            result['github'] = clean_line
        elif any(keyword in line_lower for keyword in ['caba', 'bs as', 'arg', 'argentina', 'buenos aires']):
            result['location'] = clean_line
    
    if profile_url:
        result['linkedin'] = profile_url
    
    return result


def parse_languages_blocks(blocks: list[list[str]]) -> list[LanguageEntry]:
    PROFICIENCY_MAP = {
        'competencia básica': 'Básico',
        'competencia básica limitada': 'Básico',
        'competencia básica profesional': 'Intermedio',
        'competencia profesional completa': 'Nativo',
        'competencia bilingüe o nativa': 'Nativo',
    }
    
    lines: list[str] = []
    for block in blocks:
        for line in block:
            t = (line or '').strip()
            if t:
                lines.append(t)
    
    if not lines:
        return []
    
    entries: list[LanguageEntry] = []
    i = 0
    while i < len(lines):
        if i + 1 < len(lines):
            language = lines[i]
            proficiency_raw = lines[i + 1]
            level = PROFICIENCY_MAP.get(proficiency_raw.lower(), proficiency_raw)
            entries.append(LanguageEntry(
                language=language,
                level=level,
                certifications=''
            ))
            i += 2
        else:
            i += 1
    
    return entries
