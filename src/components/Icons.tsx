"use client"

import { memo, type SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & { className?: string }

function createIcon(children: React.ReactNode, defaultViewBox = "0 0 24 24") {
  return memo(function Icon({ className, ...props }: IconProps) {
    return (
      <svg className={className} viewBox={defaultViewBox} fill="none" stroke="currentColor" strokeWidth={2} {...props}>
        {children}
      </svg>
    )
  })
}

// ── Navigation ──

export const HomeIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
)

export const SearchIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
)

export const ChartIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
)

export const ClockIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
)

export const PersonIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
)

// ── Music ──

export const MusicNoteIcon = createIcon(
  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="currentColor" />,
)

export const MusicNoteStrokeIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
)

// ── Player Controls ──

export const PlayIcon = createIcon(
  <path d="M8 5v14l11-7z" fill="currentColor" />,
)

export const PauseIcon = createIcon(
  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor" />,
)

export const SkipPrevIcon = createIcon(
  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" fill="currentColor" />,
)

export const SkipNextIcon = createIcon(
  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" fill="currentColor" />,
)

export const ShuffleIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M4 17h16l-4-4m0 8l4-4M4 7h16l-4 4m0-8l4 4" />
)

export const RepeatIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
)

export const VolumeIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072" />
  </>
)

export const HeartIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
)

export const HeartSolidIcon = createIcon(
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />,
)

export const QueueListIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
)

export const SettingsIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </>
)

// ── Theme ──

export const MoonIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
)

export const SunIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
)

// ── Actions ──

export const XIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
)

export const PlusIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
)

export const ChevronLeftIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
)

export const ChevronDownIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
)

export const LinkIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
)

export const ArrowRightIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
)

export const CheckIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
)

export const InfoIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
)

// ── Alerts & Status ──

export const WarningIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
)

export const SadFaceIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 005.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
)

export const EmptyMusicIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
)

// ── UI ──

export const GridIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
)

export const LyricsIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
)

export const CopyIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
)

export const TrashIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
)

export const PencilIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
)

export const MenuIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
)

// ── Miscellaneous ──

export const PlayCircleIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={1.5} />
    <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
  </svg>
)

export const ContinueListeningIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
)

export const DragHandleIcon = createIcon(
  <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" fill="currentColor" />,
)

export const CollapseIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
)
