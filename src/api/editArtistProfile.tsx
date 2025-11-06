export type UpdateArtistProps = {
  title?: string;
  workTitle?: string;
  description?: string;
};

export async function updateArtistProfile(
  id: string,
  payload: UpdateArtistProps
) {
  const resp = await fetch(`/api/ArtistInfo/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error((data as any)?.error || `Update failed (${resp.status})`);
  }
  return data;
}
