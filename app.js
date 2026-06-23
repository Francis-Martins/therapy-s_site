var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


async function loadProfile() {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", 1)
    // .single()
    ;

  if (error || !data) return; // keep placeholder content if not set up yet

  if (data.name) document.getElementById("name").textContent = data.name;
  // if (data.handle) document.getElementById("handle").textContent = data.handle;
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

      <div style="height: 60px; background: black; border-radius: 40px; margin-top: 0.5rem;">
            <a style="height: 60px; background: white; border-radius: 40px; display:flex; gap: 0.5rem; align-items: center; padding: 10px 10px; font-family:urbanist; text-decoration: none; transform: translate(0px, -10px)"
               href="${escapeAttr(link.url)}"
               target="_blank"
               rel="noopener noreferrer"
            >
              <div class="link-icon" style="height: 40px; width: 40px; background: black; border-radius: 50%; display: flex; align-items: center; justify-content: center; ">
                 ${link.icon || "↗"}
              </div>
             
              <div style="height: 40px; width: 150px; border-radius: 10px; flex: 1; color:black; text-align: center; padding: 3px; font-size: 15px; font-weight: 550;
              ">
                ${escapeHtml(link.title)}
              </div>


              <div style="height: 40px; width:30px; display: flex; justify-content: center; align-items: center; font-weight:40px;">
                <i class="fa-solid fa-ellipsis-vertical" style="color:rgb(76, 63, 63); "></i>
              </div>


              
            </a>
          </div>
            
            `
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
