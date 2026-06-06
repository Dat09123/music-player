"use client"

import { useState, useEffect, useMemo } from "react"
import { usePlayer } from "@/components/Player"
import TrackList from "@/components/TrackList"
import { LikedSkeleton } from "@/components/Skeleton"
import { getLikedIds, getLikedTracksData } from "@/lib/liked-tracks"
import type { PlayerTrack, SpotifyTrack, SpotifyImage } from "@/lib/types"

function toSpotifyTrack(t: PlayerTrack): SpotifyTrack {
  const artistNames = t.artists.split(", ")
  const mappedArtists = t.artistIds.map((id, i) => ({
    id,
    name: artistNames[i] || artistNames[0] || t.artists,
    type: "artist" as const,
    uri: `spotify:artist:${id}`,
    images: [] as SpotifyImage[],
    genres: [] as string[],
    followers: { href: null, total: 0 },
    popularity: 0,
    external_urls: { spotify: `https://open.spotify.com/artist/${id}` },
  }))
  return {
    id: t.id,
    name: t.name,
    artists: mappedArtists,
    album: {
      id: t.albumId,
      name: t.album,
      type: "album" as const,
      album_type: "album" as const,
      artists: mappedArtists,
      images: t.albumImage
        ? [
            { url: t.albumImage, height: 64, width: 64 },
            { url: t.albumImage.replace("64x64", "300x300"), height: 300, width: 300 },
            { url: t.albumImage.replace("64x64", "600x600"), height: 600, width: 600 },
          ]
        : [],
      release_date: "",
      total_tracks: 0,
      uri: `spotify:album:${t.albumId}`,
      external_urls: { spotify: `https://open.spotify.com/album/${t.albumId}` },
    },
    duration_ms: t.duration,
    preview_url: t.previewUrl,
    uri: t.uri,
    explicit: false,
    popularity: 0,
    track_number: 0,
    disc_number: 1,
    external_urls: { spotify: `https://open.spotify.com/track/${t.id}` },
  }
}

export default function LikedClient() {
  const { playAll, toggleLike, likedTracks } = usePlayer()
  const [tracks, setTracks] = useState<PlayerTrack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids = getLikedIds()
    const data = getLikedTracksData()
    setTracks(data.filter(t => ids.has(t.id)))
    setLoading(false)
  }, [likedTracks])

  const spotifyTracks = useMemo(() => tracks.map(toSpotifyTrack), [tracks])

  if (loading) return <LikedSkeleton />

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-b from-red-100 via-pink-50 to-[var(--bg-primary)] dark:from-red-950/30 dark:via-pink-950/20 dark:to-[var(--bg-primary)] px-6 pt-12 pb-8 md:pt-20 md:pb-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 bg-gradient-to-br from-red-400 via-pink-400 to-purple-400 flex items-center justify-center">
            <svg className="w-24 h-24 text-white/90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div className="text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Playlist</p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-3">Liked Songs</h1>
            <p className="text-sm text-[var(--text-secondary)]">{tracks.length} songs</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-4">
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)]">
            <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-lg font-medium text-[var(--text-primary)] mb-1">No liked songs yet</p>
            <p className="text-sm">Hit the ♥ button on the player to save songs here</p>
          </div>
        ) : (
          <>
            {/* Play button */}
            <div className="flex items-center gap-4 px-4 py-2 mb-4">
              <button
                onClick={() => { if (tracks.length > 0) playAll(tracks, 0) }}
                className="w-14 h-14 bg-[var(--accent)] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </button>
            </div>

            {/* Track list */}
            <TrackList
              tracks={spotifyTracks}
              playerTracks={tracks}
              showAlbum={false}
              showImage={true}
              onToggleLike={toggleLike}
            />
          </>
        )}
      </div>
    </div>
  )
}
