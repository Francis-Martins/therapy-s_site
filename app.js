const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadProfile() {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) return; // keep placeholder content if not set up yet

  if (data.name) document.getElementById("name").textContent = data.name;
  if (data.handle) document.getElementById("handle").textContent = data.handle;
  if (data.bio) document.getElementById("bio").textContent = data.bio;
  if (data.avatar_url) document.getElementById("avatar").src = data.avatar_url;
}

async function loadLinks() {
  const container = document.getElementById("links");

  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    container.innerHTML = `<div class="empty-state">No links yet.</div>`;
    return;
  }

  container.innerHTML = data
    .map(
      (link, i) => `
      <a class="link-btn" style="--i:${i}" href="${escapeAttr(link.url)}" target="_blank" rel="noopener noreferrer">
        <span class="link-icon">${link.icon || "↗"}</span>
        <span>${escapeHtml(link.title)}</span>
      </a>`
    )
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function escapeAttr(str) {
  return (str ?? "").replace(/"/g, "&quot;");
}

loadProfile();
loadLinks();
