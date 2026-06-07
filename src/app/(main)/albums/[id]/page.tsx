import { notFound } from "next/navigation";
import { getAlbumDetails } from "@/lib/services/spotify";
import { getAlbumCommunityStats, getUserAlbumReviewBySpotifyId } from "@/lib/actions/albums";
import { AlbumDetailView } from "@/components/albums/album-detail-view";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AlbumDetailPage({ params }: Props) {
  const { id } = await params;

  const [album, stats, userReview] = await Promise.all([
    getAlbumDetails(id),
    getAlbumCommunityStats(id),
    getUserAlbumReviewBySpotifyId(id),
  ]);

  if (!album) notFound();

  return <AlbumDetailView album={album} stats={stats} userReview={userReview} />;
}
