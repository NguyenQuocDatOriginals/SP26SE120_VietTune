import { ChevronDown, Search, X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';

import type { InstrumentItem } from '@/services/referenceDataService';
import { normalizeSearchText, scoreSearchOption } from '@/utils/searchText';

const MENU_MAX_HEIGHT_PX = 280;
const MENU_Z_INDEX = 110;

function isClickOnScrollbar(event: MouseEvent): boolean {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0 && event.clientX >= document.documentElement.clientWidth) {
    return true;
  }
  return false;
}

function instrumentSubtitle(inst: InstrumentItem): string | null {
  const category = inst.category?.trim();
  if (category) return category;
  const desc = inst.description?.trim();
  if (!desc) return null;
  return desc.length > 80 ? `${desc.slice(0, 80)}…` : desc;
}

export function ModerationInstrumentCatalogSelect({
  instruments,
  disabled = false,
  value,
  onChange,
  excludeNames = [],
  hasError = false,
  errorMessage,
  ariaLabel = 'Tìm hoặc chọn nhạc cụ',
}: {
  instruments: InstrumentItem[];
  disabled?: boolean;
  value: string;
  onChange: (name: string) => void;
  /** Tên đã khai báo hoặc đã thêm — không hiện lại trong danh sách chọn. */
  excludeNames?: string[];
  hasError?: boolean;
  errorMessage?: string;
  ariaLabel?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

  const excludedNorm = useMemo(
    () => new Set(excludeNames.map((n) => n.trim().toLowerCase()).filter(Boolean)),
    [excludeNames],
  );

  const availableInstruments = useMemo(
    () =>
      instruments.filter((inst) => {
        const name = inst.name?.trim();
        if (!name) return false;
        return !excludedNorm.has(name.toLowerCase());
      }),
    [instruments, excludedNorm],
  );

  const normalizedQuery = normalizeSearchText(debouncedSearch);

  const filteredInstruments = useMemo(() => {
    if (!normalizedQuery) return availableInstruments;
    return availableInstruments
      .map((inst) => ({
        inst,
        score: scoreSearchOption(inst.name, normalizedQuery),
      }))
      .filter((x) => x.score >= 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.inst.name.localeCompare(b.inst.name, 'vi');
      })
      .map((x) => x.inst);
  }, [availableInstruments, normalizedQuery]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setSearch('');
    setDebouncedSearch('');
  }, []);

  const pickInstrument = useCallback(
    (name: string) => {
      onChange(name);
      closeMenu();
    },
    [onChange, closeMenu],
  );

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), 150);
    return () => window.clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (!menuOpen) {
      setSearch('');
      setDebouncedSearch('');
      setActiveOptionIndex(0);
    }
  }, [menuOpen]);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    inputRef.current?.focus();
  }, [menuOpen]);

  useEffect(() => {
    setActiveOptionIndex(0);
  }, [debouncedSearch, menuOpen, filteredInstruments.length]);

  useEffect(() => {
    if (!menuOpen) return;
    optionRefs.current[activeOptionIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeOptionIndex, menuOpen, filteredInstruments.length]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (isClickOnScrollbar(event)) return;
      const target = event.target as Node;
      const outsideRoot = rootRef.current && !rootRef.current.contains(target);
      const outsideMenu = menuRef.current && !menuRef.current.contains(target);
      if (outsideRoot && (menuRef.current ? outsideMenu : true)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    const updateRect = () => {
      if (buttonRef.current) setMenuRect(buttonRef.current.getBoundingClientRect());
    };
    if (menuOpen) updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [menuOpen]);

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!filteredInstruments.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveOptionIndex((prev) => Math.min(prev + 1, filteredInstruments.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveOptionIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const picked = filteredInstruments[activeOptionIndex];
      if (picked?.name) pickInstrument(picked.name);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      buttonRef.current?.focus();
    }
  };

  const displayLabel = value.trim() || 'Tìm hoặc chọn nhạc cụ...';

  const borderClass = hasError
    ? 'border-red-400 focus:border-red-500 focus-visible:ring-red-500/30'
    : 'border-neutral-300 focus:border-primary-400/70 focus-visible:ring-primary-500';

  return (
    <div ref={rootRef} className="relative w-full min-w-0 min-h-[44px]">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setMenuOpen((o) => !o)}
        className={`w-full min-h-[44px] rounded-lg border bg-white px-3 py-2.5 pr-10 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${borderClass}`}
        aria-expanded={menuOpen}
        aria-haspopup="listbox"
        aria-invalid={hasError || undefined}
        aria-label={ariaLabel}
      >
        <span className={value.trim() ? 'text-neutral-900' : 'text-neutral-400'}>
          {displayLabel}
        </span>
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {hasError && errorMessage ? (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {menuOpen &&
        menuRect &&
        createPortal(
          <div
            ref={(el) => {
              menuRef.current = el;
            }}
            className="overflow-hidden rounded-xl border border-neutral-300/80 bg-surface-panel shadow-xl"
            style={{
              position: 'fixed',
              left: Math.max(8, menuRect.left),
              top: Math.min(menuRect.bottom + 6, window.innerHeight - MENU_MAX_HEIGHT_PX - 16),
              width: menuRect.width,
              maxHeight: MENU_MAX_HEIGHT_PX,
              zIndex: MENU_Z_INDEX,
              display: 'flex',
              flexDirection: 'column',
            }}
            role="listbox"
            aria-label={ariaLabel}
          >
            <div className="shrink-0 border-b border-neutral-200/90 p-2.5">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  aria-hidden
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Tìm kiếm..."
                  className="w-full rounded-lg border border-neutral-300/80 bg-white py-2 pl-9 pr-9 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20"
                />
                {search.trim() ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setDebouncedSearch('');
                      inputRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                    aria-label="Xóa từ khóa tìm kiếm"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-brand"
              style={{ maxHeight: MENU_MAX_HEIGHT_PX - 56 }}
            >
              {filteredInstruments.length === 0 ? (
                <p className="px-4 py-3 text-center text-sm text-neutral-500">
                  Không tìm thấy nhạc cụ phù hợp
                </p>
              ) : (
                filteredInstruments.map((inst, idx) => {
                  const subtitle = instrumentSubtitle(inst);
                  return (
                    <button
                      key={inst.id}
                      ref={(el) => {
                        optionRefs.current[idx] = el;
                      }}
                      type="button"
                      onClick={() => pickInstrument(inst.name)}
                      className={`w-full px-3 py-2.5 text-left transition-colors hover:bg-primary-50 ${
                        idx === activeOptionIndex ? 'bg-primary-50/90 ring-1 ring-inset ring-primary-300/60' : ''
                      } ${value === inst.name ? 'bg-primary-600 text-white hover:bg-primary-600' : ''}`}
                      onMouseEnter={() => setActiveOptionIndex(idx)}
                    >
                      <span
                        className={`block text-sm font-medium ${value === inst.name ? 'text-white' : 'text-neutral-900'}`}
                      >
                        {inst.name}
                      </span>
                      {subtitle ? (
                        <span
                          className={`mt-0.5 block text-xs ${value === inst.name ? 'text-primary-100' : 'text-neutral-500'}`}
                        >
                          {subtitle}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
