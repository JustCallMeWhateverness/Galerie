export async function createArtistProfile(userId: string, username: string) {
  const resp = await fetch("/api/ArtistInfo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: "—",
      workTitle: "—",
      description: "No description yet.",
      customer: [{ id: String(userId), username }],
    }),
  });

  //TODO: Add error handling for duplicate profiles (409) when backend check is enabled
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok)
    throw new Error((data as any)?.error || `Create failed (${resp.status})`);
  return data;
}
