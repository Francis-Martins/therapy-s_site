var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


async function loadProfile() {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", 1)
    .single()
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

  function toThumbnailUrl(url, { width = 100, height = 100, resize = "cover", quality = 90 } = {}) {
  if (!url) return url;
  const transformed = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  // only add params if it's actually a Supabase storage URL
  if (transformed === url) return url;
  return `${transformed}?width=${width}&height=${height}&resize=${resize}&quality=${quality}`;
}

container.innerHTML = data
    .map(
      (link, i) => `

      <div style="height: 60px; background: grey; border-radius: 40px; margin-top: 0.5rem;">
            <a class="button-effect" style="height: 60px; border-radius: 40px; display:flex; gap: 0.5rem; align-items: center; padding: 10px 10px; font-family:urbanist; text-decoration: none;"
              href="${escapeAttr(link.url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div>
                <img 
  src="${link.icon}"
  alt=""
  class="link-icon" 
  style="height: 50px; width: 50px; background: black; border-radius: 50%; display: flex; align-items: center; justify-content: center; object-fit: cover;"
/>
              </div>
             
              <div style="height: 40px; width: 150px; border-radius: 10px; flex: 1; color:black; text-align: center; padding: 3px; font-size: 15px; font-weight: 800; display: flex; justify-content:center; align-items:center;
              ">
                ${escapeHtml(link.title)}
              </div>


              <div style="height: 40px; width:30px; align-items: center; font-weight:40px;">
                <i class="fa-solid fa-ellipsis-vertical" style="color: white; "></i>
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

document.getElementById("links").addEventListener("click", function (e) {
  const card = e.target.closest(".button-effect");
  if (card) {
    card.classList.add("pressed");
    setTimeout(() => card.classList.remove("pressed"), 200);
  }
});



loadProfile();
loadLinks();
