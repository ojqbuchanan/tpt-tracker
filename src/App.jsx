import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const PLATFORMS = ["instagram", "tiktok", "pinterest"];
const PLATFORM_LABELS = { instagram: "Instagram", tiktok: "TikTok", pinterest: "Pinterest" };
const PLATFORM_ICONS = { instagram: "📸", tiktok: "🎵", pinterest: "📌" };
const CATEGORIES = ["STEM/Makerspace", "Book List", "Worksheet/Handout", "Lesson Plan", "Other"];

export default function App() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Load all resources on first render
  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) console.error(error);
    else setRows(data || []);
    setLoading(false);
  }

  async function addRow() {
    const { data, error } = await supabase
      .from("resources")
      .insert({})
      .select()
      .single();
    if (error) return console.error(error);
    setRows([...rows, data]);
  }

  // Update a field locally, then save to the database
  async function update(id, field, val) {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: val } : r));
    const { error } = await supabase
      .from("resources")
      .update({ [field]: val })
      .eq("id", id);
    if (error) console.error(error);
  }

  async function deleteRow(id) {
    setRows(rows.filter(r => r.id !== id));
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) console.error(error);
  }

  const filtered = filter === "All" ? rows
    : filter === "Unposted" ? rows.filter(r => !PLATFORMS.some(p => r[p]))
    : rows.filter(r => r[filter]);

  const progress = (row) => PLATFORMS.filter(p => row[p]).length;

  if (loading) {
    return <div style={{ fontFamily: "sans-serif", padding: 40, color: "#6b7280" }}>Loading your resources…</div>;
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", maxWidth: "100%", overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: "#4f46e5" }}>📦 TPT Resource Tracker</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{rows.length} resource{rows.length !== 1 ? "s" : ""} tracked · synced across devices</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["All", "Unposted", ...PLATFORMS].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13,
                background: filter === f ? "#4f46e5" : "#e5e7eb",
                color: filter === f ? "white" : "#374151",
                fontWeight: filter === f ? 600 : 400,
              }}
            >{PLATFORM_LABELS[f] || f}</button>
          ))}
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={th}>Resource Title</th>
            <th style={th}>Category</th>
            <th style={th}>TPT Link</th>
            {PLATFORMS.map(p => (
              <th key={p} style={{ ...th, textAlign: "center", minWidth: 72 }}>
                {PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}
              </th>
            ))}
            <th style={th}>Progress</th>
            <th style={th}>Notes</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, i) => (
            <tr key={row.id} style={{ background: i % 2 === 0 ? "white" : "#f9fafb", verticalAlign: "middle" }}>
              <td style={td}>
                <input value={row.title || ""} onChange={e => update(row.id, "title", e.target.value)} placeholder="e.g. Summer STEM Challenge Pack" style={input} />
              </td>
              <td style={td}>
                <select value={row.category || ""} onChange={e => update(row.id, "category", e.target.value)} style={{ ...input, color: row.category ? "#111" : "#9ca3af" }}>
                  <option value="">Select...</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </td>
              <td style={td}>
                <input value={row.tpt_link || ""} onChange={e => update(row.id, "tpt_link", e.target.value)} placeholder="Paste TPT URL" style={input} />
              </td>
              {PLATFORMS.map(p => (
                <td key={p} style={{ ...td, textAlign: "center" }}>
                  <input type="checkbox" checked={!!row[p]} onChange={e => update(row.id, p, e.target.checked)} style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#4f46e5" }} />
                </td>
              ))}
              <td style={{ ...td, textAlign: "center" }}>
                <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
                  {PLATFORMS.map(p => (
                    <div key={p} style={{ width: 10, height: 10, borderRadius: "50%", background: row[p] ? "#4f46e5" : "#d1d5db" }} title={PLATFORM_LABELS[p]} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{progress(row)}/3</div>
              </td>
              <td style={td}>
                <input value={row.notes || ""} onChange={e => update(row.id, "notes", e.target.value)} placeholder="Notes..." style={input} />
              </td>
              <td style={{ ...td, textAlign: "center" }}>
                <button onClick={() => deleteRow(row.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16 }} title="Delete row">✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", color: "#9ca3af", padding: "24px 0", fontSize: 14 }}>
          No resources match this filter.
        </div>
      )}

      <button onClick={addRow} style={{ marginTop: 14, padding: "8px 18px", background: "#4f46e5", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
        + Add Resource
      </button>

      <div style={{ marginTop: 20, display: "flex", gap: 16, flexWrap: "wrap" }}>
        {PLATFORMS.map(p => {
          const count = rows.filter(r => r[p]).length;
          return (
            <div key={p} style={{ background: "#f3f4f6", borderRadius: 10, padding: "10px 16px", minWidth: 100 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{PLATFORM_LABELS[p]}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#4f46e5" }}>{count}</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>of {rows.length} posted</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const th = { padding: "10px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" };
const td = { padding: "8px 8px", borderBottom: "1px solid #f0f0f0" };
const input = { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", fontSize: 13, outline: "none", boxSizing: "border-box", background: "white" };
