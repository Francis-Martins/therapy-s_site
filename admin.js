var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginView = document.getElementById("login-view");
const adminView = document.getElementById("admin-view");


// -------------upload logic function-----------
async function uploadImage(file, folder) {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("public-assets")
    .upload(path, file, { upsert: true });

  if (error) {
    console.error(error);
    return null;
  }

  const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
  return data.publicUrl;
}




document.getElementById("p-avatar-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = await uploadImage(file, "avatars");
  if (url) {
    document.getElementById("p-avatar").value = url;
    const preview = document.getElementById("p-avatar-preview");
    preview.src = url;
    preview.style.display = "block";
  }
});

document.getElementById("l-icon-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = await uploadImage(file, "icons");
  if (url) {
    document.getElementById("l-icon").value = url;
    const preview = document.getElementById("l-icon-preview");
    preview.src = url;
    preview.style.display = "block";
  }
});





// ---------- Auth ----------

async function checkSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    showAdmin();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginView.style.display = "block";
  adminView.style.display = "none";
}

function showAdmin() {
  loginView.style.display = "none";
  adminView.style.display = "block";
  loadProfileIntoForm();
  loadLinkList();
}

document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errorEl = document.getElementById("login-error");
  errorEl.textContent = "";

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    errorEl.textContent = "Couldn't log in. Check your email and password.";
    return;
  }
  showAdmin();
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  showLogin();
});

// ---------- Profile ----------

async function loadProfileIntoForm() {
  const { data } = await supabase.from("profile").select("*").eq("id", 1).single();
  if (!data) return;
  document.getElementById("p-name").value = data.name || "";
  document.getElementById("p-handle").value = data.handle || "";
  document.getElementById("p-bio").value = data.bio || "";
  document.getElementById("p-avatar").value = data.avatar_url || "";
}

document.getElementById("save-profile-btn").addEventListener("click", async () => {
  const statusEl = document.getElementById("profile-status");
  const payload = {
    id: 1,
    name: document.getElementById("p-name").value.trim(),
    handle: document.getElementById("p-handle").value.trim(),
    bio: document.getElementById("p-bio").value.trim(),
    avatar_url: document.getElementById("p-avatar").value.trim(),
  };
  const { error } = await supabase.from("profile").upsert(payload);
  statusEl.textContent = error ? "Couldn't save. Try again." : "Saved.";
  setTimeout(() => (statusEl.textContent = ""), 2000);
});

// ---------- Links ----------

async function loadLinkList() {
  const listEl = document.getElementById("link-list");
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    listEl.innerHTML = `<div class="empty-state">No links yet. Add your first one above.</div>`;
    return;
  }

  listEl.innerHTML = data
    .map(
      (link, i) => `

    <div class="link-row" data-id="${link.id}">
        <div class="row-actions">
          <button class="icon-btn move-up" title="Move up" ${i === 0 ? "disabled" : ""}>↑</button>
          <button class="icon-btn move-down" title="Move down" ${i === data.length - 1 ? "disabled" : ""}>↓</button>
        </div>
        <div class="meta">
          <div class="t" style=" overflow-y: auto; padding:10px; color:grey;">${link.icon ? link.icon + " " : ""}${escapeHtml(link.title)}</div>
          <div class="u">${escapeHtml(link.url)}</div>
        </div>
        <div class="row-actions">
          <button class="icon-btn toggle-active" title="${link.is_active ? "Hide" : "Show"}">${link.is_active ? "👁" : "🚫"}</button>
          <button class="icon-btn delete-link" title="Delete">🗑</button>
        </div>
      </div>
      
      `
    )
    .join("");

  listEl.querySelectorAll(".delete-link").forEach((btn, idx) =>
    btn.addEventListener("click", () => deleteLink(data[idx].id))
  );
  listEl.querySelectorAll(".toggle-active").forEach((btn, idx) =>
    btn.addEventListener("click", () => toggleActive(data[idx]))
  );
  listEl.querySelectorAll(".move-up").forEach((btn, idx) =>
    btn.addEventListener("click", () => swapOrder(data, idx, idx - 1))
  );
  listEl.querySelectorAll(".move-down").forEach((btn, idx) =>
    btn.addEventListener("click", () => swapOrder(data, idx, idx + 1))
  );
}

document.getElementById("add-link-btn").addEventListener("click", async () => {
  const errorEl = document.getElementById("link-error");
  const title = document.getElementById("l-title").value.trim();
  const url = document.getElementById("l-url").value.trim();
  const icon = document.getElementById("l-icon").value.trim();

  if (!title || !url) {
    errorEl.textContent = "Title and URL are both required.";
    return;
  }

  const { data: existing } = await supabase.from("links").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const nextOrder = existing && existing.length ? existing[0].sort_order + 1 : 0;

  const { error } = await supabase.from("links").insert({
    title,
    url,
    icon,
    sort_order: nextOrder,
    is_active: true,
  });

  if (error) {
    errorEl.textContent = "Couldn't add link. Try again.";
    return;
  }

  errorEl.textContent = "";
  document.getElementById("l-title").value = "";
  document.getElementById("l-url").value = "";
  document.getElementById("l-icon").value = "";
  document.getElementById("l-icon-preview").style.display = "none";
  document.getElementById("l-icon-file").value = "";


  loadLinkList();
});

async function deleteLink(id) {
  await supabase.from("links").delete().eq("id", id);
  loadLinkList();
}

async function toggleActive(link) {
  await supabase.from("links").update({ is_active: !link.is_active }).eq("id", link.id);
  loadLinkList();
}

async function swapOrder(data, i, j) {
  if (j < 0 || j >= data.length) return;
  const a = data[i];
  const b = data[j];
  await supabase.from("links").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from("links").update({ sort_order: a.sort_order }).eq("id", b.id);
  loadLinkList();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

checkSession();
