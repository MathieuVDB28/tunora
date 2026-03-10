export function NavIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case "dashboard":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="9" rx="1.5" strokeLinecap="round"/>
          <rect x="14" y="3" width="7" height="5" rx="1.5" strokeLinecap="round"/>
          <rect x="3" y="16" width="7" height="5" rx="1.5" strokeLinecap="round"/>
          <rect x="14" y="12" width="7" height="9" rx="1.5" strokeLinecap="round"/>
        </svg>
      );
    case "library":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H18.5C19.33 3 20 3.67 20 4.5V19.5C20 20.33 19.33 21 18.5 21H5.5C4.67 21 4 20.33 4 19.5Z" strokeLinecap="round"/>
          <path d="M8 7H16M8 11H16M8 15H12" strokeLinecap="round"/>
        </svg>
      );
    case "chart":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3V21H21" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 16L11 11L15 14L21 7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "video":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="M10 9L15 12L10 15V9Z" fill="currentColor" stroke="none"/>
        </svg>
      );
    case "users":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="9" cy="7" r="3"/>
          <path d="M3 21V18C3 16.34 4.34 15 6 15H12C13.66 15 15 16.34 15 18V21"/>
          <circle cx="17" cy="8" r="2.5"/>
          <path d="M21 21V18.5C21 17.12 20.12 16 18.75 15.75"/>
        </svg>
      );
    case "feed":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9H21M9 21V9" strokeLinecap="round"/>
        </svg>
      );
    case "setlist":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path strokeLinecap="round" d="M9 12h6M9 16h4"/>
        </svg>
      );
    case "trophy":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v2a6 6 0 01-12 0V4z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6H4a1 1 0 00-1 1v1a3 3 0 003 3h.5"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 6h2a1 1 0 011 1v1a3 3 0 01-3 3h-.5"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 16h6v4H9z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v4"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 20h10"/>
        </svg>
      );
    case "metronome":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 21l2-14h4l2 14H8z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18l-4-10" strokeWidth="2"/>
          <circle cx="12" cy="7" r="1" fill="currentColor"/>
          <path strokeLinecap="round" d="M6 21h12"/>
        </svg>
      );
    case "audio":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round"/>
          <line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round"/>
        </svg>
      );
    case "more":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
      );
    default:
      return null;
  }
}
