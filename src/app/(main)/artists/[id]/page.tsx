import { notFound } from "next/navigation";
import { getArtistDetails, getArtistAlbums } from "@/lib/services/spotify";
import { getAlbumsCommunityStats } from "@/lib/actions/albums";
import { ArtistDetailView } from "@/components/albums/artist-detail-view";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ArtistDetailPage({ params }: Props) {
  const { id } = await params;

  const artist = await getArtistDetails(id);
  if (!artist) notFound();

  const albums = await getArtistAlbums(id, artist.name);

  const spotifyIds = albums.map((a) => a.id).filter(Boolean);
  const communityStats = await getAlbumsCommunityStats(spotifyIds);

  return <ArtistDetailView artist={artist} albums={albums} communityStats={communityStats} />;
}
