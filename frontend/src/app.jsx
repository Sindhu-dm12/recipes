import { useState, useEffect } from "react";

const API = "http://localhost:5000";

function STAR({ rating }) {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span>
      <span style={{ color: "#f5a623" }}>{"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(empty)}</span>
      <span style={{ color: "#888", fontSize: 12, marginLeft: 4 }}>{rating ? rating.toFixed(1) : "N/A"}</span>
    </span>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
      <span style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13 }}>{value || "—"}</span>
    </div>
  );
}

function Fallback({ title}) {
  return (
    <div style={{ padding: "80px 20px", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0f0f0", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 20, height: 2, background: "#bbb", borderRadius: 2 }} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: "#aaa" }}>{subtitle}</div>}
    </div>
  );
}

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [status, setStatus] = useState("idle");

  const [title, setTitle] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [rating, setRating] = useState("");
  const [time, setTime] = useState("");
  const [calories, setCalories] = useState("");

  useEffect(() => { load(page); }, [page, limit]);

  async function load(pg) {
    setLoading(true);
    setIsSearch(false);
    try {
      const res = await fetch(`${API}/api/recipes?page=${pg}&limit=${limit}`);
      const data = await res.json();
      if (data.error) { setStatus("error"); setRecipes([]); }
      else {
        const items = data.data || [];
        setRecipes(items);
        setTotal(data.total || 0);
        setStatus(items.length === 0 ? "no-data" : "loaded");
      }
    } catch { setStatus("error"); setRecipes([]); }
    setLoading(false);
  }

  async function search() {
    const hasFilter = title || cuisine || rating || time || calories;
    if (!hasFilter) { load(1); return; }
    setLoading(true);
    setIsSearch(true);
    try {
      const p = new URLSearchParams();
      if (title) p.set("title", title);
      if (cuisine) p.set("cuisine", cuisine);
      if (rating) p.set("rating", rating);
      if (time) p.set("total_time", time);
      if (calories) p.set("calories", calories);
      const res = await fetch(`${API}/api/recipes/search?${p}`);
      const data = await res.json();
      if (data.error) { setStatus("error"); setRecipes([]); }
      else {
        const items = data.data || [];
        setRecipes(items);
        setTotal(items.length);
        setStatus(items.length === 0 ? "no-results" : "loaded");
      }
    } catch { setStatus("error"); setRecipes([]); }
    setLoading(false);
  }

  function clear() {
    setTitle(""); setCuisine(""); setRating(""); setTime(""); setCalories("");
    setSelected(null); setPage(1);
    load(1);
  }

  const totalPages = Math.ceil(total / limit);
  const inp = { padding: "7px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, outline: "none", width: "100%" };
  const btn = (bg, color = "#fff", extra = {}) => ({ padding: "8px 16px", background: bg, color, border: "1px solid transparent", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500, ...extra });

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f7f7f7" }}>

      <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "16px 28px" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Recipes</h2>
      </div>

      <div style={{ padding: 24 }}>

        <div style={{ background: "#fff", borderRadius: 10, padding: 16, marginBottom: 20, border: "1px solid #e8e8e8" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Title</div>
              <input style={inp} placeholder="Search title..." value={title}
                onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Cuisine</div>
              <input style={inp} placeholder="e.g. Italian" value={cuisine}
                onChange={e => setCuisine(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Rating</div>
              <input style={inp} placeholder="e.g. >=4" value={rating}
                onChange={e => setRating(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Total Time (min)</div>
              <input style={inp} placeholder="e.g. <=30" value={time}
                onChange={e => setTime(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Calories</div>
              <input style={inp} placeholder="e.g. <=500" value={calories}
                onChange={e => setCalories(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={search} style={btn("#222")}>Search</button>
            <button onClick={clear} style={btn("#fff", "#444", { border: "1px solid #ddd" })}>Clear</button>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#555" }}>
              Rows per page:
              <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13, outline: "none" }}>
                {[15, 20, 25, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>

          <div style={{ flex: 1, background: "#fff", borderRadius: 10, border: "1px solid #e8e8e8", overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: 80, textAlign: "center", color: "#aaa", fontSize: 14 }}>Loading...</div>
            ) : status === "no-results" ? (
              <Fallback title="Nice to have" subtitle="No recipes matched your search" />
            ) : status === "no-data" ? (
              <Fallback title="Nice to have" subtitle="The database appears to be empty" />
            ) : status === "error" ? (
              <Fallback title="Something went wrong" subtitle="Could not connect to the server. Make sure Flask is running." />
            ) : recipes.length > 0 ? (
              <>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafafa", borderBottom: "2px solid #e8e8e8" }}>
                      {["Title", "Cuisine", "Rating", "Total Time", "Serves"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map((r, i) => (
                      <tr key={r.id} onClick={() => { setSelected(r); setExpanded(false); }}
                        style={{ borderBottom: "1px solid #f0f0f0", background: selected?.id === r.id ? "#fff8f4" : i % 2 === 0 ? "#fff" : "#fafafa" }}
                        onMouseEnter={e => { if (selected?.id !== r.id) e.currentTarget.style.background = "#f5f5f5"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = selected?.id === r.id ? "#fff8f4" : i % 2 === 0 ? "#fff" : "#fafafa"; }}>
                        <td style={{ padding: "11px 16px", fontSize: 13, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{r.title}</td>
                        <td style={{ padding: "11px 16px", fontSize: 13, color: "#555" }}>{r.cuisine || "—"}</td>
                        <td style={{ padding: "11px 16px" }}><STAR rating={r.rating} /></td>
                        <td style={{ padding: "11px 16px", fontSize: 13, color: "#555" }}>{r.total_time ? `${r.total_time} min` : "—"}</td>
                        <td style={{ padding: "11px 16px", fontSize: 13, color: "#555" }}>{r.serves || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!isSearch && totalPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid #f0f0f0", fontSize: 13, color: "#666" }}>
                    <span>{total.toLocaleString()} total recipes</span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button disabled={page === 1} onClick={() => setPage(1)} style={btn("#eee", "#333")}>«</button>
                      <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={btn("#eee", "#333")}>‹</button>
                      <span style={{ padding: "0 8px" }}>Page {page} of {totalPages}</span>
                      <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={btn("#eee", "#333")}>›</button>
                      <button disabled={page === totalPages} onClick={() => setPage(totalPages)} style={btn("#eee", "#333")}>»</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: 80, textAlign: "center", color: "#aaa", fontSize: 14 }}>Loading...</div>
            )}
          </div>

          {selected && (
            <div style={{ width: 300, background: "#fff", borderRadius: 10, border: "1px solid #e8e8e8", padding: 24, alignSelf: "flex-start", position: "sticky", top: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ flex: 1, paddingRight: 8 }}>
                  <div style={{ fontSize: 11, color: "#e07b39", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{selected.cuisine || "Recipe"}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4 }}>{selected.title}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: "#f0f0f0", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>x</button>
              </div>

              {selected.description && (
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>{selected.description}</p>
              )}

              <Row label="Rating" value={<STAR rating={selected.rating} />} />
              <Row label="Serves" value={selected.serves} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>Total Time</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13 }}>{selected.total_time ? `${selected.total_time} min` : "—"}</span>
                  <button onClick={() => setExpanded(e => !e)}
                    style={{ background: "#f0f0f0", border: "none", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 11 }}>
                    {expanded ? "▲" : "▼"}
                  </button>
                </div>
              </div>
              {expanded && (
                <div style={{ marginTop: 8, paddingLeft: 12, borderLeft: "2px solid #f0f0f0" }}>
                  <Row label="Cook Time" value={selected.cook_time ? `${selected.cook_time} min` : "—"} />
                  <Row label="Prep Time" value={selected.prep_time ? `${selected.prep_time} min` : "—"} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}