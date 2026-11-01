import { toggleTheme } from '@/lib/theme'

function LocaleLink({ href, code, current }) {
  return (
    <a
      href={href}
      hrefLang={code}
      lang={code}
      aria-current={current ? 'page' : undefined}
      className={current ? 'py-2 text-text' : 'ledger-link py-2'}
    >
      {code.toUpperCase()}
    </a>
  )
}

export default function Toolbar({ locale, ui }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm print:hidden">
      <div className="flex items-center gap-2">
        <LocaleLink href="/" code="es" current={locale === 'es'} />
        <span aria-hidden="true" className="text-muted">
          |
        </span>
        <LocaleLink href="/en" code="en" current={locale === 'en'} />
      </div>
      <button type="button" onClick={toggleTheme} className="ledger-control py-2">
        {/* INTENTIONAL: both labels render and CSS picks one. The server cannot know the theme, so a label kept in
            state would mismatch on hydration; the handler reads the theme from the DOM when clicked. */}
        <span className="dark:hidden">{ui.themeDark}</span>
        <span className="hidden dark:inline">{ui.themeLight}</span>
      </button>
    </div>
  )
}
