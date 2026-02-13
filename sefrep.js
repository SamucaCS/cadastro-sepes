const SUPABASE_URL = "https://ffprsdeicjjttfedzbif.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmcHJzZGVpY2pqdHRmZWR6YmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTg4NTksImV4cCI6MjA4MTEzNDg1OX0.U5J1L6vv7RZztxUjJ4UKcNhtHzwOlaU0NTeXoyAa0GU";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

const TEMAS = {
  VTC: "VTC",
  CTC: "CTC",
  LICENCA_PREMIUM: "LICENÇA PREMIO",
  CONTAGEM_TEMPO: "CONTAGEM DE TEMPO (QUIN/QUÊNIO)",
};

const ESCOLAS_SEOM = [
  "Unidade Regional De Ensino - Suzano",
  "ALFREDO ROBERTO",
  "ALICE ROMANOS PROFª",
  "ANDERSON DA SILVA SOARES",
  "ANGELA SUELI P DIAS",
  "ANIS FADUL DOUTOR",
  "ANTONIO BRASILIO MENEZES DA FONSECA PROF",
  "ANTONIO GARCIA VEREADOR",
  "ANTONIO JOSE CAMPOS DE MENEZES PROF",
  "ANTONIO RODRIGUES DE ALMEIDA",
  "ANTONIO VALDEMAR GALO VEREADOR",
  "BATISTA RENZI",
  "BENEDITA DE CAMPOS MARCOLONGO PROFª",
  "BRASILIO MACHADO NETO COMENDADOR",
  "CARLINDO REIS",
  "CARLOS MOLTENI PROF",
  "CHOJIRO SEGAWA",
  "DAVID JORGE CURI PROF",
  "EDIR DO COUTO ROSA",
  "ELIANE APARECIDA D DA SILVA",
  "EUCLIDES IGESCA",
  "GERALDO JUSTINIANO DE REZENDE SILVA PROF",
  "GILBERTO DE CARVALHO PROF",
  "GIOVANNI BATTISTA RAFFO PROF DOUTOR",
  "HELENA ZERRENNER",
  "IIJIMA",
  "IGNES CORREA ALLEN",
  "JACQUES YVES COUSTEAU COMANDANTE",
  "JANDYRA COUTINHO PROFª",
  "JARDIM SAO PAULO II",
  "Jose Eduardo Viera Raduan",
  "JOSE BENEDITO LEITE BARTHOLOMEI PROF",
  "JOSE CAMILO DE ANDRADE",
  "JOSE PAPAIZ PROF",
  "JOVIANO SATLER DE LIMA PROF",
  "JUSSARA FEITOSA DOMSCHKE PROFª",
  "Justino Marcondes Rangel",
  "Landia dos Santos Batista",
  "LEDA FERNANDES LOPES PROFª",
  "LUCY FRANCO KOWALSKI PROFª",
  "LUIZ BIANCONI",
  "LUIZA HIDAKA PROFª",
  "MANUEL DOS SANTOS PAIVA",
  "MARIA ELISA DE AZEVEDO CINTRA PROFª",
  "Mario Manoel Dantas de Aquino",
  "MARTHA CALIXTO CAZAGRANDE",
  "MASAITI SEKINE PROF",
  "MORATO DE OLIVEIRA DOUTOR",
  "OLAVO LEONEL FERREIRA PROF",
  "OLZANETTI GOMES PROFESSOR",
  "OSWALDO DE OLIVEIRA LIMA",
  "PARQUE DOURADO II",
  "PAULO AMERICO PAGANUCCI",
  "PAULO KOBAYASHI PROF",
  "RAUL BRASIL PROF EE",
  "RAUL BRASIL PROF",
  "ROBERTO BIANCHI",
  "SEBASTIAO PEREIRA VIDAL",
  "Tacito Zancheta",
  "TOCHICHICO YOCHICAVA PROF",
  "TOKUZO TERAZAKI",
  "YOLANDA BASSI PROFª",
  "ZELIA GATTAI AMADO",
  "ZEIKICHI FUKUOKA",
];

const $ = (sel) => document.querySelector(sel);

let temaAtual = null;
let editingId = null;
let registros = [];

document.addEventListener("DOMContentLoaded", () => {
  const btnIrIndex = document.getElementById("btnIrIndex");
  const btnIrSeape = document.getElementById("btnIrSeape");
  if (btnIrIndex)
    btnIrIndex.addEventListener(
      "click",
      () => (window.location.href = "index.html"),
    );
  if (btnIrSeape)
    btnIrSeape.addEventListener(
      "click",
      () => (window.location.href = "seape.html"),
    );

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".nav-item")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      temaAtual = btn.dataset.tema;
      cancelEdit(true);
      renderForm();
    });
  });

  $("#formSefrep")?.addEventListener("submit", onSubmit);
  $("#btnCancelar")?.addEventListener("click", () => cancelEdit());
  $("#btnLimpar")?.addEventListener("click", () => {
    $("#formSefrep").reset();
    showMsg("Campos limpos.", "ok");
  });

  $("#btnApagarTudo")?.addEventListener("click", apagarTudoSupabase);
  $("#btnExportar")?.addEventListener("click", exportarJSON);

  initTemaAtivo();
  loadAndRender();
});

function initTemaAtivo() {
  const active =
    document.querySelector(".nav-item.active") ||
    document.querySelector(".nav-item");
  temaAtual = active?.dataset?.tema || "VTC";
  document.querySelectorAll(".nav-item").forEach((b) => {
    b.classList.toggle("active", b.dataset.tema === temaAtual);
  });
  renderForm();
}

async function loadAndRender() {
  const ok = await loadRecords();
  if (ok) renderTable();
}

async function loadRecords() {
  try {
    const { data, error } = await supabaseClient
      .from("sefrep_registros")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    registros = data || [];
    return true;
  } catch (err) {
    showMsg(`Erro ao carregar registros: ${err.message || err}`, "err");
    return false;
  }
}

function renderForm() {
  const titulo = TEMAS[temaAtual] || temaAtual;
  $("#tituloForm").textContent = titulo;
  $("#pillTema").innerHTML = `Tema: <strong>${escapeHtml(titulo)}</strong>`;
  showMsg("");

  const area = $("#formArea");
  if (!area) return;
  area.innerHTML = "";

  const campos = [];

  if (temaAtual === "VTC") {
    campos.push(
      fieldText("nome", "Nome *", true),
      fieldText("protocolo", "Número de processo/protocolo *", true),
      fieldSelect(
        "status",
        "Situação *",
        ["em andamento", "não concluido", "concluido"],
        true,
      ),
      fieldSelect("escola", "Escola *", ESCOLAS_SEOM, true),
      fieldTextarea("observacoes", "Observações", false),
      fieldDate("data_entrada", "Data de entrada *", true),
      fieldDate("data_saida", "Data de saída", false),
    );
  } else if (temaAtual === "CTC") {
    campos.push(
      fieldText("nome", "Nome *", true),
      fieldText("protocolo", "Número de processo/protocolo *", true),
      fieldSelect(
        "status",
        "Situação *",
        ["em andamento", "não concluido", "concluido"],
        true,
      ),
      fieldTextarea("observacoes", "Observações", false),
      fieldDate("data_entrada", "Data de entrada *", true),
      fieldDate("data_saida", "Data de saída", false),
    );
  } else if (temaAtual === "LICENCA_PREMIUM") {
    campos.push(
      fieldText("nome", "Nome *", true),
      fieldText("protocolo", "Número de processo/protocolo *", true),
      fieldSelect("escola", "Escola *", ESCOLAS_SEOM, true),
      fieldSelect(
        "topico",
        "Tópicos *",
        ["Finalizado", "em analise", "Devolvido para Correção"],
        true,
      ),
      fieldTextarea("observacoes", "Observação", false),
      fieldDate("data_entrada", "Data de entrada *", true),
      fieldDate("data_saida", "Data de saída", false),
    );
  } else if (temaAtual === "CONTAGEM_TEMPO") {
    campos.push(
      fieldText("nome", "Nome *", true),
      fieldSelect("escola", "Escola *", ESCOLAS_SEOM, true),
      fieldSelect("topico", "Tópicos *", ["manual", "automatico"], true),
      fieldText("protocolo", "Número de processo/protocolo *", true),
      fieldSelect(
        "status",
        "Situação *",
        ["finalizado", "em analise", "devolvido para correção", "publicado"],
        true,
      ),
      fieldDate("data_entrada", "Data de entrada *", true),
    );
  }

  const grid = document.createElement("div");
  grid.className = "grid";
  grid.innerHTML = campos.join("");
  area.appendChild(grid);

  area.querySelectorAll("textarea").forEach((t) => {
    const wrap = t.closest(".field");
    if (wrap) wrap.style.gridColumn = "1 / -1";
  });

  updateSubmitText();
}

async function onSubmit(ev) {
  ev.preventDefault();
  const data = formToObj(ev.target);
  data.tema_key = temaAtual;
  data.tema = TEMAS[temaAtual] || temaAtual;

  const valid = validate(data);
  if (!valid.ok) {
    showMsg(valid.msg, "err");
    return;
  }

  const payload = {
    tema_key: data.tema_key,
    tema: data.tema,
    nome: data.nome || null,
    escola: data.escola || null,
    protocolo: data.protocolo || null,
    status: data.status || null,
    topico: data.topico || null,
    observacoes: data.observacoes || null,
    data_entrada: data.data_entrada || null,
    data_saida: data.data_saida || null,
  };

  if (temaAtual === "LICENCA_PREMIUM") {
    payload.status = null;
  }

  try {
    if (editingId) {
      const { error } = await supabaseClient
        .from("sefrep_registros")
        .update(payload)
        .eq("id", editingId);
      if (error) throw error;
      showMsg("Registro atualizado.", "ok");
    } else {
      const { error } = await supabaseClient
        .from("sefrep_registros")
        .insert([payload]);
      if (error) throw error;
      showMsg("Registro salvo.", "ok");
    }
    cancelEdit(true);
    await loadAndRender();
  } catch (err) {
    showMsg(`Erro ao salvar: ${err.message || err}`, "err");
  }
}

function startEditById(id) {
  const r = registros.find((x) => x.id === id);
  if (!r) return;
  temaAtual = r.tema_key || "VTC";
  document.querySelectorAll(".nav-item").forEach((b) => {
    b.classList.toggle("active", b.dataset.tema === temaAtual);
  });
  renderForm();
  setVal("nome", r.nome);
  setVal("protocolo", r.protocolo);
  setVal("status", r.status);
  setVal("escola", r.escola);
  setVal("topico", r.topico);
  setVal("observacoes", r.observacoes);
  setVal("data_entrada", r.data_entrada);
  setVal("data_saida", r.data_saida);
  editingId = r.id;
  updateSubmitText();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit(keepMessage = false) {
  editingId = null;
  $("#formSefrep")?.reset();
  updateSubmitText();
  if (!keepMessage) showMsg("");
}

function updateSubmitText() {
  const btn = document.querySelector('#formSefrep button[type="submit"]');
  if (btn)
    btn.textContent = editingId ? "Atualizar registro" : "Salvar registro";
}

function renderTable() {
  const tbody = ensureTbody();
  if (!tbody) return;
  tbody.innerHTML = registros.length
    ? ""
    : '<tr><td colspan="9" class="muted">Nenhum registro salvo ainda.</td></tr>';

  registros.forEach((r) => {
    const temaKey = (r.tema_key || "").toUpperCase();
    let statusCell = `<span class="muted">—</span>`;
    if (temaKey === "LICENCA_PREMIUM") {
      const topicoFormatado = r.topico ? prettyTopico(r.topico) : "";
      statusCell = topicoFormatado
        ? `<span class="badge-status ${statusClass(topicoFormatado)}">${escapeHtml(topicoFormatado)}</span>`
        : `<span class="muted">—</span>`;
    } else {
      const st = (r.status || "").toLowerCase();
      statusCell = r.status
        ? `<span class="badge-status ${statusClass(st)}">${escapeHtml(r.status)}</span>`
        : `<span class="muted">—</span>`;
    }

    const proc = r.protocolo ? escapeHtml(r.protocolo) : "—";

    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${fmtDateTime(r.created_at || r.updated_at)}</td>
            <td>${escapeHtml(r.tema || r.tema_key || "—")}</td>
            <td>${escapeHtml(r.nome || "—")}</td>
            <td>${r.escola ? escapeHtml(r.escola) : "—"}</td>
            <td>${statusCell}</td>
            <td>${proc}</td>
            <td>${r.data_entrada ? fmtDate(r.data_entrada) : "—"}</td>
            <td>${r.data_saida ? fmtDate(r.data_saida) : "—"}</td>
            <td>
                <button class="btn ghost" data-edit="${r.id}" type="button">Editar</button>
                <button class="btn danger" data-del="${r.id}" type="button">Excluir</button>
            </td>
        `;
    tr.querySelector("[data-edit]").onclick = () => startEditById(r.id);
    tr.querySelector("[data-del]").onclick = () => deleteById(r.id);
    tbody.appendChild(tr);
  });
}

async function deleteById(id) {
  if (!confirm("Excluir este registro?")) return;
  try {
    const { error } = await supabaseClient
      .from("sefrep_registros")
      .delete()
      .eq("id", id);
    if (error) throw error;
    showMsg("Registro excluído.", "ok");
    await loadAndRender();
  } catch (err) {
    showMsg("Erro ao excluir.", "err");
  }
}

async function apagarTudoSupabase() {
  if (!confirm("APAGAR TUDO?")) return;
  try {
    const { error } = await supabaseClient
      .from("sefrep_registros")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw error;
    await loadAndRender();
  } catch (err) {
    showMsg("Erro ao apagar.", "err");
  }
}

async function exportarJSON() {
  try {
    const { data, error } = await supabaseClient
      .from("sefrep_registros")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sefrep_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  } catch (err) {
    showMsg("Erro ao exportar.", "err");
  }
}

function validate(data) {
  if (!data.nome?.trim()) return { ok: false, msg: "Informe o nome." };
  if (!data.protocolo?.trim())
    return { ok: false, msg: "Informe o protocolo." };
  if (!data.data_entrada)
    return { ok: false, msg: "Informe a data de entrada." };
  if (data.tema_key !== "LICENCA_PREMIUM") {
    if (!data.status) return { ok: false, msg: "Selecione a situação." };
  }

  return { ok: true, msg: "" };
}

function statusClass(status) {
  const s = (status || "").toLowerCase().trim();
  if (s.includes("não") || s.includes("nao")) return "naoconcluido";
  if (s.includes("andamento")) return "andamento";
  if (s.includes("concluido") || s.includes("finalizado")) return "concluido";
  if (s.includes("analise")) return "analise";
  if (s.includes("devolvido")) return "devolvido";
  if (s.includes("publicado")) return "publicado";
  return "";
}

function prettyTopico(t) {
  const s = (t || "").toLowerCase().trim();
  if (s === "manual") return "Manual";
  if (s === "automatico") return "Automático";
  if (s === "finalizado") return "Finalizado";
  if (s.includes("analise")) return "Em Análise";
  return t;
}

function ensureTbody() {
  let tbody = document.getElementById("tbodyRegistros");
  if (tbody) return tbody;
  const table =
    document.getElementById("tblRegistros") || document.querySelector("table");
  if (!table) return null;
  tbody = document.createElement("tbody");
  tbody.id = "tbodyRegistros";
  table.appendChild(tbody);
  return tbody;
}

function formToObj(form) {
  const fd = new FormData(form);
  const obj = {};
  for (const [k, v] of fd.entries()) obj[k] = (v ?? "").toString().trim();
  return obj;
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val ?? "";
}

function showMsg(text, type = "") {
  const el = $("#msg");
  if (!el) return;
  el.className = "msg " + type;
  el.textContent = text || "";
}

function fieldText(name, label, required) {
  return `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="text" ${required ? "required" : ""} /></div>`;
}
function fieldDate(name, label, required) {
  return `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="date" ${required ? "required" : ""} /></div>`;
}
function fieldTextarea(name, label, required) {
  return `<div class="field"><label for="${name}">${label}</label><textarea id="${name}" name="${name}" ${required ? "required" : ""}></textarea></div>`;
}
function fieldSelect(name, label, options, required) {
  const opts = (options || [])
    .map((o) => `<option value="${escapeAttr(o)}">${escapeHtml(o)}</option>`)
    .join("");
  return `<div class="field"><label for="${name}">${label}</label><select id="${name}" name="${name}" ${required ? "required" : ""}><option value="">Selecione...</option>${opts}</select></div>`;
}

function fmtDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}
function fmtDateTime(iso) {
  if (!iso) return "—";
  const dt = new Date(iso);
  return dt.toLocaleString("pt-BR");
}
function escapeHtml(str) {
  return (str || "").toString().replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[m],
  );
}
function escapeAttr(str) {
  return escapeHtml(str);
}
