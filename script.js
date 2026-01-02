document.addEventListener("DOMContentLoaded", () => {

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  let posts = JSON.parse(localStorage.getItem("posts") || "[]");
  let editId = null;

  /* ========== NAV MENU ========== */
  const menuBtn = document.getElementById("menuBtn");
  const navMenu = document.getElementById("navMenu");
  if (menuBtn && navMenu) {
    menuBtn.onclick = () => navMenu.classList.toggle("show");
  }

  /* ========== LOGIN PAGE ========== */
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const msg = document.getElementById("msg");
    const registerBtn = document.getElementById("registerBtn");

    registerBtn.onclick = () => {
      if (!username.value || !password.value) {
        msg.innerText = "⚠ Fill all fields";
        return;
      }
      if (users.find(u => u.u === username.value)) {
        msg.innerText = "❌ User already exists";
        return;
      }
      users.push({ u: username.value, p: password.value });
      localStorage.setItem("users", JSON.stringify(users));
      msg.innerText = "✨ Account Created! Now Login.";
    };

    loginBtn.onclick = () => {
      const u = users.find(x => x.u === username.value && x.p === password.value);
      if (!u) {
        msg.innerText = "❌ Invalid login";
        return;
      }
      localStorage.setItem("loggedUser", username.value);
      location.href = "dashboard.html";
    };
  }

  /* ========== DASHBOARD PAGE ========== */
  const publishBtn = document.getElementById("publishBtn");
  if (publishBtn) {

    if (!localStorage.getItem("loggedUser")) {
      location.href = "index.html";
      return;
    }

    const title = document.getElementById("title");
    const slug = document.getElementById("slug");
    const category = document.getElementById("category");
    const tags = document.getElementById("tags");
    const content = document.getElementById("content");
    const media = document.getElementById("media");
    const postsDiv = document.getElementById("postsDiv");
    const logoutBtn = document.getElementById("logoutBtn");

    logoutBtn.onclick = () => {
      localStorage.removeItem("loggedUser");
      location.href = "index.html";
    };

    publishBtn.onclick = () => {

      if (!title.value || !slug.value || !content.innerText.trim()) {
        alert("Please fill Title, Slug and Content");
        return;
      }

      const publicLink = "view.html?post=" + slug.value;

      const savePost = (mediaData = "") => {

        if (editId) {
          let p = posts.find(x => x.id === editId);
          Object.assign(p, {
            title: title.value,
            slug: slug.value,
            publicLink,
            cat: category.value,
            tags: tags.value.split(","),
            content: content.innerHTML,
            media: mediaData || p.media
          });
          editId = null;
        } else {
          posts.unshift({
            id: Date.now(),
            title: title.value,
            slug: slug.value,
            publicLink,
            cat: category.value,
            tags: tags.value.split(","),
            content: content.innerHTML,
            media: mediaData,
            author: localStorage.getItem("loggedUser"),
            likes: 0,
            comments: []
          });
        }

        localStorage.setItem("posts", JSON.stringify(posts));
        window.location.href = publicLink;
      };

      if (media.files.length) {
        const r = new FileReader();
        r.onload = () => savePost(r.result);
        r.readAsDataURL(media.files[0]);
      } else savePost();
    };

    function loadPosts() {
      postsDiv.innerHTML = "";
      posts.forEach(p => {
        postsDiv.innerHTML += `
          <div class="post">
            <h3>${p.title}</h3>
            <a href="${p.publicLink}" target="_blank">${p.publicLink}</a><br>
            <button onclick="editPost(${p.id})">Edit</button>
            <button onclick="deletePost(${p.id})">Delete</button>
          </div>`;
      });
    }

    window.editPost = id => {
      let p = posts.find(x => x.id === id);
      title.value = p.title;
      slug.value = p.slug;
      category.value = p.cat;
      tags.value = p.tags.join(",");
      content.innerHTML = p.content;
      editId = id;
    };

    window.deletePost = id => {
      posts = posts.filter(x => x.id !== id);
      localStorage.setItem("posts", JSON.stringify(posts));
      loadPosts();
    };

    loadPosts();
  }

  /* ========== PUBLIC VIEW PAGE ========== */
  if (location.pathname.includes("view.html")) {
    const q = new URLSearchParams(location.search);
    const slugParam = q.get("post");

    const allPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    const post = allPosts.find(p => p.slug === slugParam);
    const blogView = document.getElementById("blogView");

    if (!post) {
      blogView.innerHTML = "<h2>❌ Blog not found</h2>";
    } else {
      blogView.innerHTML = `
        <h1>${post.title}</h1>
        <small>By ${post.author} • ${post.cat}</small><br><br>
        ${post.media ? `<img src="${post.media}" style="width:100%;border-radius:10px;">` : ""}
        <div>${post.content}</div>
        <div style="margin-top:15px">
          ❤️ <span id="likeCount">${post.likes}</span>
          <button id="likeBtn">Like</button>
        </div>
        <input id="cmt" placeholder="Write a comment">
        <button id="cmtBtn">Comment</button>
        <div id="cmts">${post.comments.join("<br>")}</div>
      `;

      document.getElementById("likeBtn").onclick = () => {
        post.likes++;
        localStorage.setItem("posts", JSON.stringify(allPosts));
        document.getElementById("likeCount").innerText = post.likes;
      };

      document.getElementById("cmtBtn").onclick = () => {
        const text = document.getElementById("cmt").value;
        if (!text) return;
        post.comments.push(text);
        localStorage.setItem("posts", JSON.stringify(allPosts));
        document.getElementById("cmts").innerHTML = post.comments.join("<br>");
        document.getElementById("cmt").value = "";
      };
    }
  }

});
